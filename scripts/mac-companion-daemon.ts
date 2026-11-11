/**
 * STUDYAI — Mac Companion Daemon
 * 
 * Runs on the user's Mac to securely bridge local Ollama (qwen2.5:7b)
 * to the remote STUDYAI server without opening any incoming public ports!
 * 
 * Usage:
 *   STUDYAI_SERVER_URL=https://theft-hip-just-francisco.trycloudflare.com \
 *   STUDYAI_BRIDGE_SECRET=studyai_bridge_secure_key_mac_ollama_2026 \
 *   node --experimental-strip-types scripts/mac-companion-daemon.ts
 */

import os from 'node:os';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const SERVER_URL = (process.env.STUDYAI_SERVER_URL || 'http://127.0.0.1:3001').replace(/\/+$/, '');
const BRIDGE_SECRET = process.env.STUDYAI_BRIDGE_SECRET || 'studyai_bridge_secure_key_mac_ollama_2026';
const PREFERRED_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';

let registeredClientId = '';
let isRunning = true;

async function checkLocalOllama(): Promise<{ ok: boolean; models: string[] }> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!res.ok) return { ok: false, models: [] };
    const data = (await res.json()) as any;
    const models = (data.models || []).map((m: any) => m.name);
    return { ok: true, models };
  } catch {
    return { ok: false, models: [] };
  }
}

async function registerWithServer(models: string[]): Promise<boolean> {
  try {
    const res = await fetch(`${SERVER_URL}/api/bridge/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BRIDGE_SECRET}`
      },
      body: JSON.stringify({
        macHostname: os.hostname(),
        osVersion: `${os.type()} ${os.release()}`,
        ollamaBaseUrl: OLLAMA_URL,
        installedModels: models,
        activeModel: models.includes(PREFERRED_MODEL) ? PREFERRED_MODEL : models[0] || PREFERRED_MODEL
      })
    });

    if (!res.ok) {
      console.error(`[BRIDGE_DAEMON] Registration failed with status ${res.status}`);
      return false;
    }

    const data = (await res.json()) as any;
    registeredClientId = data.clientId;
    console.log(`[BRIDGE_DAEMON] Successfully registered with STUDYAI server. Client ID: ${registeredClientId}`);
    return true;
  } catch (err: any) {
    console.error(`[BRIDGE_DAEMON] Connection error during registration: ${err.message}`);
    return false;
  }
}

async function executeOllamaJob(job: any): Promise<{ content: string; tokensUsed?: any; error?: string }> {
  const model = job.model || PREFERRED_MODEL;
  try {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: job.messages,
        format: job.format,
        stream: false,
        options: {
          temperature: job.temperature ?? 0.35
        }
      })
    });

    if (!res.ok) {
      return { content: '', error: `Ollama HTTP ${res.status}` };
    }

    const data = (await res.json()) as any;
    const content = data?.message?.content || '';
    return {
      content,
      tokensUsed: {
        prompt: data.prompt_eval_count,
        completion: data.eval_count,
        total: (data.prompt_eval_count || 0) + (data.eval_count || 0)
      }
    };
  } catch (err: any) {
    return { content: '', error: err.message };
  }
}

async function pollAndProcessLoop() {
  while (isRunning) {
    if (!registeredClientId) {
      const ollama = await checkLocalOllama();
      if (!ollama.ok) {
        console.warn(`[BRIDGE_DAEMON] Local Ollama not reachable at ${OLLAMA_URL}. Retrying in 5s...`);
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      const registered = await registerWithServer(ollama.models);
      if (!registered) {
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
    }

    try {
      const pollRes = await fetch(`${SERVER_URL}/api/bridge/poll?clientId=${encodeURIComponent(registeredClientId)}`, {
        headers: { Authorization: `Bearer ${BRIDGE_SECRET}` }
      });

      if (pollRes.status === 401 || pollRes.status === 404) {
        // Registration expired or server restarted
        registeredClientId = '';
        continue;
      }

      if (pollRes.ok) {
        const jobData = (await pollRes.json()) as any;
        if (jobData && jobData.jobId) {
          console.log(`[BRIDGE_DAEMON] Processing job ${jobData.jobId} on local model ${jobData.model}...`);
          const result = await executeOllamaJob(jobData);

          await fetch(`${SERVER_URL}/api/bridge/result`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${BRIDGE_SECRET}`
            },
            body: JSON.stringify({
              clientId: registeredClientId,
              jobId: jobData.jobId,
              content: result.content,
              tokensUsed: result.tokensUsed,
              error: result.error
            })
          });
          console.log(`[BRIDGE_DAEMON] Job ${jobData.jobId} completed and returned to server.`);
        }
      }
    } catch (err: any) {
      console.warn(`[BRIDGE_DAEMON] Polling loop error: ${err.message}. Retrying...`);
    }

    await new Promise((r) => setTimeout(r, 1200));
  }
}

// Graceful termination
process.on('SIGINT', () => {
  console.log('\n[BRIDGE_DAEMON] Shutting down Mac Companion Bridge...');
  isRunning = false;
  process.exit(0);
});

console.log('=====================================================');
console.log('       STUDYAI MAC COMPANION BRIDGE DAEMON           ');
console.log('=====================================================');
console.log(`Ollama Endpoint: ${OLLAMA_URL}`);
console.log(`Remote Server:   ${SERVER_URL}`);
console.log(`Target Model:    ${PREFERRED_MODEL}`);
console.log('Starting polling daemon...\n');

pollAndProcessLoop().catch((err) => {
  console.error('[BRIDGE_DAEMON] Fatal error:', err);
});

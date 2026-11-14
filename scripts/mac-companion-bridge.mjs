#!/usr/bin/env node
/**
 * STUDYAI Mac Companion Bridge (Mode B)
 *
 * Connects outward over HTTPS from the user's Mac to the hosted STUDYAI backend,
 * polls for pending Qwen 2.5 7B inference jobs, executes them against local Ollama
 * (http://127.0.0.1:11434/api/chat), and returns results without exposing port 11434.
 *
 * Usage:
 *   STUDYAI_BRIDGE_URL=https://your-studyai-host.example.com \
 *   STUDYAI_BRIDGE_SECRET=your_secret \
 *   node scripts/mac-companion-bridge.mjs
 */

const BASE_URL = (process.env.STUDYAI_BRIDGE_URL || 'http://127.0.0.1:3001').replace(/\/$/, '');
const BRIDGE_SECRET = process.env.STUDYAI_BRIDGE_SECRET || 'studyai_bridge_secure_key_mac_ollama_2026';
const OLLAMA_URL = (process.env.OLLAMA_BASE_URL || process.env.OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
const ACTIVE_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';
const CLIENT_ID = process.env.STUDYAI_BRIDGE_CLIENT_ID || `mac-bridge-${process.pid}`;

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${BRIDGE_SECRET}`
};

async function register() {
  const res = await fetch(`${BASE_URL}/api/bridge/register`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      clientId: CLIENT_ID,
      macHostname: process.env.HOSTNAME || 'MacBook-Ollama-Host',
      activeModel: ACTIVE_MODEL
    })
  });
  if (!res.ok) {
    throw new Error(`Bridge registration failed: HTTP ${res.status}`);
  }
  return res.json();
}

async function heartbeat() {
  await fetch(`${BASE_URL}/api/bridge/heartbeat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ clientId: CLIENT_ID })
  });
}

async function pollAndExecute() {
  const res = await fetch(`${BASE_URL}/api/bridge/poll?clientId=${encodeURIComponent(CLIENT_ID)}`, {
    headers
  });
  if (!res.ok) return false;
  const job = await res.json();
  if (!job || job.idle || !job.jobId) return false;

  try {
    const payload = {
      model: job.model || ACTIVE_MODEL,
      messages: job.messages || [],
      stream: false,
      options: {
        temperature: job.temperature ?? 0.35,
        top_p: 0.9
      }
    };
    if (job.format) payload.format = job.format;

    const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!ollamaRes.ok) {
      throw new Error(`Local Ollama HTTP ${ollamaRes.status}`);
    }

    const data = await ollamaRes.json();
    await fetch(`${BASE_URL}/api/bridge/result`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        clientId: CLIENT_ID,
        jobId: job.jobId,
        content: data?.message?.content || '',
        tokensUsed: {
          prompt: data.prompt_eval_count,
          completion: data.eval_count,
          total: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        }
      })
    });
  } catch (err) {
    await fetch(`${BASE_URL}/api/bridge/result`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        clientId: CLIENT_ID,
        jobId: job.jobId,
        error: err?.message || String(err)
      })
    });
  }

  return true;
}

async function main() {
  const reg = await register();
  console.log(`[MacBridge] Registered with ${BASE_URL} as ${reg.clientId} (model: ${ACTIVE_MODEL})`);

  const hbTimer = setInterval(() => {
    heartbeat().catch((err) => console.warn('[MacBridge] Heartbeat failed:', err.message));
  }, 10000);

  let running = true;
  process.on('SIGINT', () => {
    running = false;
    clearInterval(hbTimer);
    process.exit(0);
  });

  while (running) {
    try {
      const processed = await pollAndExecute();
      await new Promise((r) => setTimeout(r, processed ? 50 : 600));
    } catch (err) {
      console.warn('[MacBridge] Poll error:', err.message);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

main().catch((err) => {
  console.error('[MacBridge] Fatal error:', err);
  process.exit(1);
});

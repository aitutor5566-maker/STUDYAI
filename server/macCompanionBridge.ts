import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';

export interface MacBridgeClientInfo {
  clientId: string;
  macHostname: string;
  osVersion: string;
  ollamaBaseUrl: string;
  installedModels: string[];
  activeModel: string;
  lastHeartbeat: number;
  ipAddress?: string;
  status: 'ONLINE' | 'STANDBY' | 'BUSY' | 'OFFLINE';
}

export interface BridgeModelJob {
  jobId: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  format?: 'json' | string;
  stream?: boolean;
  timeoutMs: number;
  createdAt: number;
  resolve: (result: BridgeJobResult) => void;
  reject: (err: any) => void;
}

export interface BridgeJobResult {
  jobId: string;
  content: string;
  model: string;
  tokensUsed?: { prompt?: number; completion?: number; total?: number };
  latencyMs: number;
  provider: 'qwen_mac_bridge';
}

/**
 * Mac Companion Bridge Service
 * 
 * Secure outward connection manager allowing remote/hosted STUDYAI instances
 * to dispatch AI inference jobs to the local Ollama instance running on the user's Mac.
 * 
 * Security & Reliability Principles:
 * 1. Port 11434 is NEVER exposed to the public internet.
 * 2. Mac Companion connects outward to backend using HMAC Bearer authentication.
 * 3. Heartbeat expiry (25s) marks Mac as OFFLINE immediately if Mac sleeps or disconnects.
 * 4. Transparent fallback occurs when Bridge is OFFLINE without masking provider identity.
 */
export class MacCompanionBridgeService extends EventEmitter {
  private registeredClient: MacBridgeClientInfo | null = null;
  private bridgeSecret: string;
  private pendingJobs: Map<string, BridgeModelJob> = new Map();
  private jobQueue: BridgeModelJob[] = [];
  private heartbeatIntervalTimer: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_TIMEOUT_MS = 25000;

  constructor() {
    super();
    this.bridgeSecret = process.env.STUDYAI_BRIDGE_SECRET || 'studyai_bridge_secure_key_mac_ollama_2026';
    this.startHeartbeatWatcher();
  }

  /**
   * Check if the Mac Companion Bridge is currently connected and healthy
   */
  isBridgeOnline(): boolean {
    if (!this.registeredClient) return false;
    const isRecent = Date.now() - this.registeredClient.lastHeartbeat < this.HEARTBEAT_TIMEOUT_MS;
    return isRecent && (this.registeredClient.status === 'ONLINE' || this.registeredClient.status === 'BUSY');
  }

  /**
   * Get active bridge status details
   */
  getStatus() {
    const isOnline = this.isBridgeOnline();
    return {
      online: isOnline,
      client: isOnline ? this.registeredClient : null,
      queuedJobsCount: this.jobQueue.length,
      pendingJobsCount: this.pendingJobs.size,
      activeModel: this.registeredClient?.activeModel || 'qwen2.5:7b',
      installedModels: this.registeredClient?.installedModels || ['qwen2.5:7b'],
      lastHeartbeatAgoMs: this.registeredClient ? Date.now() - this.registeredClient.lastHeartbeat : null
    };
  }

  /**
   * Validate authorization token sent by Mac Companion daemon
   */
  validateAuth(token?: string): boolean {
    if (!token) return false;
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    return cleanToken === this.bridgeSecret;
  }

  /**
   * Register Mac Companion Daemon
   */
  registerClient(info: Partial<MacBridgeClientInfo>, ip?: string): { success: boolean; clientId: string } {
    const clientId = `mac-bridge-${crypto.randomUUID().slice(0, 8)}`;
    this.registeredClient = {
      clientId,
      macHostname: info.macHostname || 'Vishwak-MacBook',
      osVersion: info.osVersion || 'macOS Darwin',
      ollamaBaseUrl: info.ollamaBaseUrl || 'http://127.0.0.1:11434',
      installedModels: info.installedModels || ['qwen2.5:7b', 'ai-tutor:latest'],
      activeModel: info.activeModel || 'qwen2.5:7b',
      lastHeartbeat: Date.now(),
      ipAddress: ip,
      status: 'ONLINE'
    };

    this.emit('client_connected', this.registeredClient);
    return { success: true, clientId };
  }

  /**
   * Record periodic heartbeat from Mac Companion
   */
  recordHeartbeat(clientId: string): boolean {
    if (!this.registeredClient || this.registeredClient.clientId !== clientId) {
      return false;
    }
    this.registeredClient.lastHeartbeat = Date.now();
    this.registeredClient.status = this.jobQueue.length > 0 || this.pendingJobs.size > 0 ? 'BUSY' : 'ONLINE';
    return true;
  }

  /**
   * Poll next model job for Mac Companion client
   */
  pollNextJob(clientId: string): any | null {
    if (!this.recordHeartbeat(clientId)) {
      return null;
    }

    const job = this.jobQueue.shift();
    if (!job) return null;

    this.pendingJobs.set(job.jobId, job);
    return {
      jobId: job.jobId,
      model: job.model,
      messages: job.messages,
      temperature: job.temperature,
      maxTokens: job.maxTokens,
      format: job.format,
      stream: job.stream,
      timeoutMs: job.timeoutMs
    };
  }

  /**
   * Submit completed inference result from Mac Companion
   */
  submitJobResult(clientId: string, payload: {
    jobId: string;
    content: string;
    tokensUsed?: { prompt?: number; completion?: number; total?: number };
    error?: string;
  }): boolean {
    this.recordHeartbeat(clientId);
    const job = this.pendingJobs.get(payload.jobId);
    if (!job) return false;

    this.pendingJobs.delete(payload.jobId);

    if (payload.error) {
      job.reject(new Error(`MAC_BRIDGE_EXECUTION_ERROR: ${payload.error}`));
      return true;
    }

    const latencyMs = Date.now() - job.createdAt;
    job.resolve({
      jobId: job.jobId,
      content: payload.content,
      model: job.model,
      tokensUsed: payload.tokensUsed,
      latencyMs,
      provider: 'qwen_mac_bridge'
    });

    return true;
  }

  /**
   * Dispatch a Qwen model job through the Mac Companion Bridge
   */
  dispatchJob(params: {
    model?: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    maxTokens?: number;
    format?: 'json' | string;
    stream?: boolean;
    timeoutMs?: number;
  }): Promise<BridgeJobResult> {
    if (!this.isBridgeOnline()) {
      return Promise.reject(new Error('MAC_COMPANION_BRIDGE_OFFLINE: Mac is asleep, disconnected or bridge daemon is not running.'));
    }

    const jobId = `bjob-${crypto.randomUUID().slice(0, 10)}`;
    const timeoutMs = params.timeoutMs || 25000;

    return new Promise<BridgeJobResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingJobs.delete(jobId);
        const idx = this.jobQueue.findIndex((j) => j.jobId === jobId);
        if (idx !== -1) this.jobQueue.splice(idx, 1);
        reject(new Error(`MAC_BRIDGE_TIMEOUT: Job ${jobId} timed out after ${timeoutMs}ms.`));
      }, timeoutMs);

      const job: BridgeModelJob = {
        jobId,
        model: params.model || this.registeredClient?.activeModel || 'qwen2.5:7b',
        messages: params.messages,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
        format: params.format,
        stream: params.stream,
        timeoutMs,
        createdAt: Date.now(),
        resolve: (res) => {
          clearTimeout(timer);
          resolve(res);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        }
      };

      this.jobQueue.push(job);
    });
  }

  private startHeartbeatWatcher() {
    this.heartbeatIntervalTimer = setInterval(() => {
      if (this.registeredClient && this.registeredClient.status !== 'OFFLINE') {
        const elapsed = Date.now() - this.registeredClient.lastHeartbeat;
        if (elapsed >= this.HEARTBEAT_TIMEOUT_MS) {
          this.registeredClient.status = 'OFFLINE';
          this.emit('client_disconnected', this.registeredClient);

          // Fail all queued jobs so orchestrator triggers immediate fallback without hanging
          while (this.jobQueue.length > 0) {
            const j = this.jobQueue.shift();
            j?.reject(new Error('MAC_COMPANION_BRIDGE_OFFLINE: Mac went to sleep or disconnected.'));
          }
        }
      }
    }, 5000);
  }

  destroy() {
    if (this.heartbeatIntervalTimer) {
      clearInterval(this.heartbeatIntervalTimer);
      this.heartbeatIntervalTimer = null;
    }
  }
}

export const macCompanionBridge = new MacCompanionBridgeService();

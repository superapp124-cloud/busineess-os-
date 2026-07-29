'use strict';

/**
 * CHATR AI Runtime — OllamaEngineProvider
 * 
 * Concrete implementation of ILocalAiEngineProvider for Ollama inference engine.
 * Handles daemon lifecycle, binary isolation, model pulls, and inference requests.
 */

const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, execFile } = require('child_process');
const https = require('https');
const os = require('os');
const { ILocalAiEngineProvider } = require('./ILocalAiEngineProvider.cjs');

const log = (() => {
  try { return require('electron-log'); } catch { return console; }
})();

const OLLAMA_PREFERRED_PORT = 3717;
const OLLAMA_FALLBACK_PORT = 11434;

const DEFAULT_MODELS = [
  { name: 'llama3.2:3b', sizeGB: 2.0, description: 'Fast local AI reasoning' },
  { name: 'phi3:mini', sizeGB: 2.3, description: 'Lightweight intent model' }
];

const OLLAMA_RELEASES = {
  win32: {
    url: 'https://github.com/ollama/ollama/releases/download/v0.3.14/ollama-windows-amd64.zip',
    extractedExe: 'ollama.exe'
  },
  darwin: {
    url: 'https://github.com/ollama/ollama/releases/download/v0.3.14/ollama-darwin',
    extractedExe: 'ollama'
  },
  linux: {
    url: 'https://github.com/ollama/ollama/releases/download/v0.3.14/ollama-linux-amd64',
    extractedExe: 'ollama'
  }
};

class OllamaEngineProvider extends ILocalAiEngineProvider {
  constructor() {
    super();
    this.port = OLLAMA_PREFERRED_PORT;
    this.process = null;
    this.activeBase = `http://127.0.0.1:${this.port}`;
  }

  get id() { return 'ollama'; }
  get name() { return 'Ollama AI Engine Provider'; }
  get version() { return '0.3.14'; }

  aiDir() {
    return path.join(app.getPath('userData'), 'ai-core');
  }

  ollamaExePath() {
    const platform = process.platform;
    const exe = OLLAMA_RELEASES[platform]?.extractedExe || 'ollama';
    return path.join(this.aiDir(), exe);
  }

  async isInstalled() {
    // 1. Check isolated user data dir
    if (fs.existsSync(this.ollamaExePath())) return true;
    
    // 2. Check system PATH
    return new Promise((resolve) => {
      execFile('ollama', ['--version'], (err) => {
        resolve(!err);
      });
    });
  }

  async initialize() {
    const installed = await this.isInstalled();
    if (!installed) {
      log.info('[OllamaEngineProvider] Not installed yet.');
      return false;
    }
    return true;
  }

  async install(onProgress = () => {}) {
    const dir = this.aiDir();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const platform = process.platform;
    const relInfo = OLLAMA_RELEASES[platform];
    if (!relInfo) throw new Error(`Unsupported platform: ${platform}`);

    const targetPath = path.join(dir, relInfo.extractedExe);
    log.info(`[OllamaEngineProvider] Installing binary to ${targetPath}`);

    // Progress updates
    onProgress(10);
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(targetPath);
      https.get(relInfo.url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          https.get(res.headers.location, (redirectRes) => {
            const total = parseInt(redirectRes.headers['content-length'] || '0', 10);
            let downloaded = 0;

            redirectRes.on('data', (chunk) => {
              downloaded += chunk.length;
              if (total > 0) {
                const pct = Math.floor(10 + (downloaded / total) * 80);
                onProgress(pct);
              }
            });

            redirectRes.pipe(file);
            file.on('finish', () => {
              file.close(() => {
                if (platform !== 'win32') fs.chmodSync(targetPath, 0o755);
                onProgress(100);
                resolve();
              });
            });
          }).on('error', reject);
        } else {
          res.pipe(file);
          file.on('finish', () => {
            file.close(() => {
              if (platform !== 'win32') fs.chmodSync(targetPath, 0o755);
              onProgress(100);
              resolve();
            });
          });
        }
      }).on('error', reject);
    });
  }

  async startService(port = OLLAMA_PREFERRED_PORT) {
    this.port = port;
    this.activeBase = `http://127.0.0.1:${this.port}`;

    // Check if already running on target port
    try {
      const ping = await fetch(`${this.activeBase}/api/tags`);
      if (ping.ok) {
        log.info(`[OllamaEngineProvider] Daemon already active on port ${this.port}`);
        return { port: this.port, pid: 0 };
      }
    } catch {}

    const exe = fs.existsSync(this.ollamaExePath()) ? this.ollamaExePath() : 'ollama';
    const env = {
      ...process.env,
      OLLAMA_HOST: `127.0.0.1:${this.port}`,
      OLLAMA_MODELS: path.join(this.aiDir(), 'models'),
      OLLAMA_KEEP_ALIVE: '24h'
    };

    log.info(`[OllamaEngineProvider] Spawning daemon on port ${this.port}...`);
    this.process = spawn(exe, ['serve'], { env, detached: false, stdio: 'ignore' });

    // Wait for health endpoint
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 500));
      try {
        const ping = await fetch(`${this.activeBase}/api/tags`);
        if (ping.ok) {
          log.info(`[OllamaEngineProvider] Daemon ready on port ${this.port}`);
          return { port: this.port, pid: this.process?.pid || 0 };
        }
      } catch {}
    }

    throw new Error(`Failed to bind Ollama service on port ${this.port}`);
  }

  async stopService() {
    if (this.process && this.process.pid) {
      try {
        process.kill(this.process.pid, 'SIGTERM');
        this.process = null;
        log.info('[OllamaEngineProvider] Daemon stopped.');
      } catch (err) {
        log.error('[OllamaEngineProvider] Error stopping daemon:', err.message);
      }
    }
  }

  async listReadyModels() {
    try {
      const res = await fetch(`${this.activeBase}/api/tags`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.models || []).map(m => m.name);
    } catch {
      return [];
    }
  }

  async pullModel(modelName, onProgress = () => {}) {
    log.info(`[OllamaEngineProvider] Pulling model: ${modelName}...`);
    const res = await fetch(`${this.activeBase}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: true })
    });

    if (!res.ok) throw new Error(`Model pull failed: ${res.statusText}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let completed = false;

    while (!completed) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const payload = JSON.parse(line);
          if (payload.total && payload.completed) {
            const pct = Math.floor((payload.completed / payload.total) * 100);
            onProgress(pct);
          }
          if (payload.status === 'success') {
            completed = true;
            onProgress(100);
          }
        } catch {}
      }
    }
  }

  async generateCompletion(request) {
    const readyModels = await this.listReadyModels();
    const targetModel = request.model || readyModels[0] || DEFAULT_MODELS[0].name;

    const res = await fetch(`${this.activeBase}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: targetModel,
        system: request.system,
        prompt: request.prompt,
        stream: false,
        options: { temperature: request.temperature || 0.7 }
      })
    });

    if (!res.ok) throw new Error(`Generation failed: ${res.statusText}`);
    const data = await res.json();
    return { text: data.response || '' };
  }
}

module.exports = { OllamaEngineProvider };

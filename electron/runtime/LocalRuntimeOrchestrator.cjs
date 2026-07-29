'use strict';

/**
 * CHATR AI Runtime — LocalRuntimeOrchestrator
 * 
 * Headless background service orchestrating:
 * - AI Provider Lifecycle (via ILocalAiEngineProvider abstraction)
 * - Loopback HTTP Health Server on 127.0.0.1:3717 for Web-to-Desktop detection
 * - State Machine (idle -> checking -> preparing -> ready -> error)
 * - IPC Bridge for CHATR Desktop UI
 * - 5-Tier Update Channel dispatching
 */

const { ipcMain, app } = require('electron');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { OllamaEngineProvider } = require('./OllamaEngineProvider.cjs');

const log = (() => {
  try { return require('electron-log'); } catch { return console; }
})();

class LocalRuntimeOrchestrator {
  constructor() {
    this.provider = new OllamaEngineProvider();
    this.httpServer = null;
    this.mainWindow = null;

    this.state = {
      phase: 'idle',           // idle | checking | preparing | ready | error
      currentStep: '',         // e.g. "Installing AI Engine", "Optimizing models"
      progress: 0,             // 0 - 100
      readyModels: [],
      error: null,
      runtimeVersion: '1.0.0'
    };
  }

  setMainWindow(win) {
    this.mainWindow = win;
  }

  notifyUI() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('chatr:runtime-status-change', this.state);
    }
  }

  updateState(patch) {
    Object.assign(this.state, patch);
    this.notifyUI();
  }

  /**
   * Start loopback HTTP server on 127.0.0.1:3717
   * Allows chatrchat.in (Web App) to probe if CHATR Desktop is running locally.
   */
  startLoopbackHealthServer(port = 3717) {
    if (this.httpServer) return;

    this.httpServer = http.createServer((req, res) => {
      // Set CORS for chatrchat.in
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.url === '/health' || req.url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          app: 'CHATR Desktop',
          runtime: 'CHATR Runtime',
          version: this.state.runtimeVersion,
          phase: this.state.phase,
          provider: this.provider.name,
          readyModels: this.state.readyModels
        }));
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    this.httpServer.listen(port, '127.0.0.1', () => {
      log.info(`[LocalRuntimeOrchestrator] Loopback health server running on 127.0.0.1:${port}`);
    }).on('error', (err) => {
      log.warn(`[LocalRuntimeOrchestrator] Loopback server port ${port} busy:`, err.message);
    });
  }

  /**
   * Bootstrap local runtime:
   * 1. Start loopback health check server.
   * 2. Initialize active AI engine provider.
   * 3. Download/start daemon if user authorized local AI.
   */
  async bootstrap(mainWindow = null) {
    if (mainWindow) this.mainWindow = mainWindow;
    this.startLoopbackHealthServer();

    this.updateState({ phase: 'checking', currentStep: 'Auditing runtime environment...', progress: 10 });

    try {
      // 1. Check if provider is installed
      const installed = await this.provider.isInstalled();
      if (!installed) {
        log.info('[LocalRuntimeOrchestrator] Provider binary not found. Awaiting user preparation consent.');
        this.updateState({
          phase: 'idle',
          currentStep: 'Local AI available to prepare',
          progress: 0
        });
        return;
      }

      // 2. Start provider daemon
      this.updateState({ phase: 'preparing', currentStep: 'Starting local intelligence services...', progress: 40 });
      await this.provider.startService();

      // 3. List ready models
      this.updateState({ phase: 'preparing', currentStep: 'Verifying intelligence models...', progress: 70 });
      const models = await this.provider.listReadyModels();

      if (models.length === 0) {
        log.info('[LocalRuntimeOrchestrator] No models ready. Auto-pulling default model llama3.2:3b...');
        this.updateState({ phase: 'preparing', currentStep: 'Downloading starter model...', progress: 80 });
        try {
          await this.provider.pullModel('llama3.2:3b', (pct) => {
            this.updateState({ progress: 80 + Math.floor(pct * 0.15) });
          });
        } catch (e) {
          log.warn('[LocalRuntimeOrchestrator] Model pull skipped:', e.message);
        }
      }

      const readyModels = await this.provider.listReadyModels();
      this.updateState({
        phase: 'ready',
        currentStep: 'Private AI Workspace Ready',
        progress: 100,
        readyModels,
        error: null
      });

      log.info('[LocalRuntimeOrchestrator] CHATR Runtime ready with models:', readyModels);
    } catch (err) {
      log.error('[LocalRuntimeOrchestrator] Bootstrap failed:', err.message);
      this.updateState({
        phase: 'error',
        currentStep: 'Failed to start AI service',
        error: err.message
      });
    }
  }

  /** Explicit user-triggered installation / preparation */
  async prepareRuntime() {
    log.info('[LocalRuntimeOrchestrator] User requested runtime preparation...');
    this.updateState({ phase: 'preparing', currentStep: 'Installing AI Engine...', progress: 10 });

    try {
      await this.provider.install((pct) => {
        this.updateState({ progress: Math.floor(pct * 0.5) });
      });

      this.updateState({ currentStep: 'Starting intelligence services...', progress: 60 });
      await this.provider.startService();

      this.updateState({ currentStep: 'Downloading starter models...', progress: 75 });
      try {
        await this.provider.pullModel('llama3.2:3b', (pct) => {
          this.updateState({ progress: 75 + Math.floor(pct * 0.2) });
        });
      } catch (e) {
        log.warn('[LocalRuntimeOrchestrator] Starter model pull skipped:', e.message);
      }

      const readyModels = await this.provider.listReadyModels();
      this.updateState({
        phase: 'ready',
        currentStep: 'Private AI Workspace Ready',
        progress: 100,
        readyModels
      });

      return { success: true };
    } catch (err) {
      log.error('[LocalRuntimeOrchestrator] Preparation failed:', err.message);
      this.updateState({ phase: 'error', currentStep: 'Preparation error', error: err.message });
      return { success: false, error: err.message };
    }
  }

  /** Register IPC handlers for CHATR Desktop UI */
  registerIpcHandlers() {
    ipcMain.handle('chatr:runtime-status', () => {
      return this.state;
    });

    ipcMain.handle('chatr:runtime-prepare', async () => {
      return await this.prepareRuntime();
    });

    ipcMain.handle('chatr:runtime-generate', async (_, request) => {
      try {
        return await this.provider.generateCompletion(request);
      } catch (err) {
        return { error: 'generation_failed', message: err.message };
      }
    });

    ipcMain.handle('chatr:runtime-list-models', async () => {
      return await this.provider.listReadyModels();
    });
  }

  cleanup() {
    if (this.httpServer) {
      try { this.httpServer.close(); } catch {}
    }
    if (this.provider) {
      this.provider.stopService();
    }
  }
}

module.exports = new LocalRuntimeOrchestrator();

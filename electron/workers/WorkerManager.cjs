const { utilityProcess, app } = require('electron');
const path = require('path');
const log = require('electron-log');

class WorkerManager {
  constructor(mainWindow, setServiceStatus) {
    this.mainWindow = mainWindow;
    this.setServiceStatus = setServiceStatus; // callback from main.cjs to update UI status
    this.workers = new Map();
    
    // Configuration for all registered workers
    this.workerConfigs = {
      ai: { script: 'ai-worker.cjs', restartDelay: 2000, maxRetries: 3 },
      search: { script: 'search-worker.cjs', restartDelay: 1000, maxRetries: 3 },
      sync: { script: 'sync-worker.cjs', restartDelay: 5000, maxRetries: -1 }, // always try to reconnect sync
      automation: { script: 'automation-worker.cjs', restartDelay: 1000, maxRetries: 3 }
    };
    
    this.metrics = {};
  }

  setMainWindow(win) {
    this.mainWindow = win;
  }

  startAll() {
    Object.keys(this.workerConfigs).forEach(workerName => {
      this.start(workerName);
    });
  }

  start(workerName, retryCount = 0) {
    const config = this.workerConfigs[workerName];
    if (!config) {
      log.error(`[WorkerManager] Unknown worker: ${workerName}`);
      return;
    }

    if (this.workers.has(workerName)) {
      log.warn(`[WorkerManager] ${workerName} is already running.`);
      return;
    }

    const scriptPath = path.join(__dirname, config.script);
    this.setServiceStatus(`worker-${workerName}`, 'initializing');
    
    try {
      const child = utilityProcess.fork(scriptPath);
      this.workers.set(workerName, child);

      this.metrics[workerName] = {
        restarts: retryCount,
        startTime: Date.now(),
        lastPing: Date.now()
      };

      child.on('spawn', () => {
        log.info(`[WorkerManager] ${workerName} spawned (PID: ${child.pid})`);
        this.setServiceStatus(`worker-${workerName}`, 'ready');
      });

      child.on('message', (msg) => {
        this.handleMessageFromWorker(workerName, msg);
      });

      child.on('exit', (code) => {
        log.warn(`[WorkerManager] ${workerName} exited with code ${code}`);
        this.workers.delete(workerName);
        
        if (code !== 0) {
          this.setServiceStatus(`worker-${workerName}`, 'failed', `exit code ${code}`);
          this.handleCrash(workerName, retryCount);
        } else {
          this.setServiceStatus(`worker-${workerName}`, 'idle', 'stopped normally');
        }
      });

    } catch (e) {
      log.error(`[WorkerManager] Failed to spawn ${workerName}:`, e);
      this.setServiceStatus(`worker-${workerName}`, 'failed', e.message);
      this.handleCrash(workerName, retryCount);
    }
  }

  handleCrash(workerName, currentRetry) {
    const config = this.workerConfigs[workerName];
    if (config.maxRetries === -1 || currentRetry < config.maxRetries) {
      log.info(`[WorkerManager] Restarting ${workerName} in ${config.restartDelay}ms (Attempt ${currentRetry + 1})...`);
      setTimeout(() => {
        this.start(workerName, currentRetry + 1);
      }, config.restartDelay);
    } else {
      log.error(`[WorkerManager] ${workerName} exceeded max retries. Won't restart.`);
    }
  }

  stop(workerName) {
    const child = this.workers.get(workerName);
    if (child) {
      log.info(`[WorkerManager] Stopping ${workerName}...`);
      child.kill();
      this.workers.delete(workerName);
    }
  }

  stopAll() {
    for (const workerName of this.workers.keys()) {
      this.stop(workerName);
    }
  }

  /**
   * Route standardized IPC requests from the Renderer to the specific Worker
   */
  routeRequest(request) {
    const { id, worker, capability, action, payload, priority, timeout } = request;
    
    if (!worker || !id || !action) {
      log.error(`[WorkerManager] Invalid request format:`, request);
      return;
    }

    const child = this.workers.get(worker);
    if (!child) {
      log.error(`[WorkerManager] Cannot route request to ${worker}, worker not running`);
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('worker:response', {
          id,
          success: false,
          error: `Worker ${worker} is not running`,
          metrics: { durationMs: 0 }
        });
      }
      return;
    }

    child.postMessage(request);
  }

  /**
   * Route standardized responses/events from the Worker back to the Renderer
   */
  handleMessageFromWorker(workerName, msg) {
    // If it's a standard response object { id, success, ... }
    if (msg.id && this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('worker:response', msg);
    } else {
      // Unstructured/legacy message bridging
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send(`worker:${workerName}:msg`, msg);
      }
    }
  }
}

module.exports = { WorkerManager };

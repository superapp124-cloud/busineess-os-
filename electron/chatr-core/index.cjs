'use strict';

/**
 * CHATR Kernel — Boot Sequencer
 *
 * The single entry point that boots the entire CHATR Core.
 * Called from electron/main.cjs with one line.
 *
 * Boot Sequence:
 *   1. Register providers
 *   2. Register modules
 *   3. Start HTTP server
 *   4. Publish KERNEL_READY event
 *
 * Genesis v1.0
 */

const { bus }              = require('./events/bus.cjs');
const { CORE }             = require('./events/events.cjs');
const { featureRegistry }  = require('./registry/feature-registry.cjs');
const { providerRegistry } = require('./registry/provider-registry.cjs');
const { validateProvider } = require('./providers/interface.cjs');
const { OllamaProvider }   = require('./providers/ollama.cjs');
const { moduleLoader }     = require('./kernel/module-loader.cjs');
const recommendationEngine = require('./kernel/recommendation-engine.cjs');
const { recoveryManager }  = require('./kernel/recovery.cjs');
const { createServer }     = require('./server/server.cjs');
const runtimeConfig        = require('./config/runtime.config.cjs');
const featureConfig        = require('./config/feature.config.cjs');

const log = (() => {
  try { return require('electron-log'); } catch { return console; }
})();

let _httpServer = null;
let _isRunning  = false;

async function boot() {
  if (_isRunning) {
    log.warn('[CHATR Kernel] Already running. Skipping boot.');
    return;
  }

  log.info(`[CHATR Kernel] Booting — ${runtimeConfig.codename} v${runtimeConfig.version}`);

  // ── Step 1: Register Providers ─────────────────────────────────────────────
  const ollamaProvider = new OllamaProvider();
  validateProvider('ollama', ollamaProvider);
  providerRegistry.register('ollama', ollamaProvider);
  providerRegistry.setActive('ollama');
  log.info('[CHATR Kernel] OllamaProvider registered and set as active.');

  // ── Step 2: Register Modules ───────────────────────────────────────────────
  await moduleLoader.loadAll();
  
  // Reserve future module slots from config if they don't have folders yet
  for (const [name, cfg] of Object.entries(featureConfig.modules)) {
    if (!featureRegistry.get(name)) {
      featureRegistry.register({
        name,
        version: cfg.version,
        status: 'reserved',
        description: `${name} module — reserved for future activation`,
        dependencies: [],
      });
    }
  }

  // ── Step 3: Start HTTP Server ──────────────────────────────────────────────
  const app = createServer();

  await new Promise((resolve, reject) => {
    _httpServer = app.listen(runtimeConfig.port, runtimeConfig.host, () => {
      log.info(`[CHATR Kernel] HTTP server listening on ${runtimeConfig.host}:${runtimeConfig.port}`);
      resolve();
    });
    _httpServer.on('error', (err) => {
      log.error('[CHATR Kernel] Server failed to start:', err.message);
      reject(err);
    });
  });

  // ── Step 4: Recover Interrupted Requests ─────────────────────────────────
  await recoveryManager.recover();

  // ── Step 4.5: Initialize Recommendation Engine ───────────────────────────
  recommendationEngine.initialize();

  // ── Step 5: Publish KERNEL_READY ──────────────────────────────────────────
  _isRunning = true;
  bus.publish(CORE.KERNEL_READY, {
    version:  runtimeConfig.version,
    codename: runtimeConfig.codename,
    port:     runtimeConfig.port,
    modules:  featureRegistry.list().map(m => m.name),
  });

  log.info('[CHATR Kernel] ✓ Ready.');
}

async function shutdown() {
  if (!_isRunning || !_httpServer) return;
  return new Promise((resolve) => {
    _httpServer.close(() => {
      _isRunning = false;
      log.info('[CHATR Kernel] Shutdown complete.');
      resolve();
    });
  });
}

function isRunning() { return _isRunning; }

module.exports = { boot, shutdown, isRunning };

'use strict';

/**
 * CHATR Kernel — Recovery Manager
 *
 * Reserved in Milestone 1. Activated in Milestone 2.
 *
 * Responsibility:
 *   On kernel restart, detect interrupted requests and either
 *   resume them or mark them as FAILED in Supabase.
 *
 * Genesis v1.0 — Milestone 2
 */

const { bus }  = require('../events/bus.cjs');
const { CORE } = require('../events/events.cjs');
const { SqliteIntentProvider } = require('../providers/sqlite-intent.cjs');

const log = (() => {
  try { return require('electron-log'); } catch { return console; }
})();

const RECOVERY_STORE_KEY = 'chatr_kernel_recovery_v1';

class RecoveryManager {
  constructor() {
    this._store    = new Map(); // requestId → { conversationId, userId, startedAt, stage }
    this._isReady  = false;
  }

  /**
   * Register a request as in-progress.
   * Called by Orchestrator at EXECUTE stage.
   */
  track(requestId, { conversationId, userId, stage }) {
    this._store.set(requestId, { conversationId, userId, stage, startedAt: Date.now() });
  }

  /**
   * Unregister a completed or failed request.
   */
  untrack(requestId) {
    this._store.delete(requestId);
  }

  /**
   * On kernel boot, scan for interrupted requests from last session.
   * In Milestone 2: reads from a durable file store.
   * Currently: clears stale in-memory state and publishes RECOVERY_COMPLETED.
   */
  async recover() {
    log.info('[RecoveryManager] Scanning for interrupted requests...');

    try {
      const intentProvider = new SqliteIntentProvider();
      const interrupted = await intentProvider.getIncompleteJobs();

      if (interrupted.length === 0) {
        log.info('[RecoveryManager] No interrupted requests found.');
      } else {
        log.warn(`[RecoveryManager] Found ${interrupted.length} interrupted job(s) from previous session.`);
        for (const job of interrupted) {
          // Mark as failed in DB
          job.state = 'Failed';
          job.metrics = job.metrics || {};
          job.metrics.error = 'Interrupted by kernel crash / restart.';
          await intentProvider.recordActivity(job.id, { job });
          
          bus.publish(CORE.REQUEST_FAILED, {
            requestId: job.id,
            error: 'Interrupted by kernel restart.',
          });
          log.info(`[RecoveryManager] Job ${job.id} marked as Failed.`);
        }
      }
    } catch (err) {
      log.error(`[RecoveryManager] Failed to run crash recovery:`, err.message);
    }

    this._isReady = true;
    bus.publish(CORE.RECOVERY_COMPLETED, { recoveredCount: 0 });
    log.info('[RecoveryManager] Recovery complete. Kernel accepting requests.');
  }

  /**
   * Get current recovery status (for /health endpoint).
   */
  status() {
    return {
      ready:   this._isReady,
      tracked: this._store.size,
    };
  }
}

const recoveryManager = new RecoveryManager();

module.exports = { recoveryManager };

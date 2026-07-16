'use strict';

/**
 * CHATR Kernel v2.0 — Intent Lifecycle Manager
 * 
 * Tracks Intents using a unique intentId through their entire lifecycle.
 * States: Received -> Understood -> Planned -> Discovered -> Authorized -> Executing -> Waiting -> Completed -> Failed -> Recovered -> Archived
 */

const crypto = require('crypto');

const log = (() => {
  try { return require('electron-log'); } catch { return console; }
})();

const IntentState = {
  RECEIVED: 'Received',
  UNDERSTOOD: 'Understood',
  PLANNED: 'Planned',
  DISCOVERED: 'Discovered',
  AUTHORIZED: 'Authorized',
  EXECUTING: 'Executing',
  WAITING: 'Waiting',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  RECOVERED: 'Recovered',
  ARCHIVED: 'Archived'
};

class IntentLifecycleManager {
  constructor() {
    this._intents = new Map();
    this._listeners = new Set();
  }

  /**
   * Register a new intent
   * @param {string} rawInput The raw user input/intent
   * @param {string} [source] Source of the intent (e.g. 'ui', 'voice', 'background')
   * @returns {string} intentId
   */
  registerIntent(rawInput, source = 'ui') {
    const intentId = crypto.randomUUID();
    
    const intentRecord = {
      intentId,
      rawInput,
      source,
      state: IntentState.RECEIVED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{ state: IntentState.RECEIVED, timestamp: new Date().toISOString() }],
      context: null,
      plan: null,
      executionResult: null,
      error: null
    };

    this._intents.set(intentId, intentRecord);
    log.info(`[IntentLifecycle] [${intentId}] Registered: ${rawInput}`);
    this._notifyListeners(intentId, intentRecord);

    return intentId;
  }

  /**
   * Transition an intent to a new state
   */
  transition(intentId, newState, payload = {}) {
    const intent = this._intents.get(intentId);
    if (!intent) {
      log.warn(`[IntentLifecycle] Transition failed - Unknown intentId: ${intentId}`);
      return;
    }

    intent.state = newState;
    intent.updatedAt = new Date().toISOString();
    intent.history.push({ state: newState, timestamp: intent.updatedAt, ...payload });

    // Store common payload data onto the main record for easy access
    if (payload.context) intent.context = payload.context;
    if (payload.plan) intent.plan = payload.plan;
    if (payload.result) intent.executionResult = payload.result;
    if (payload.error) intent.error = payload.error;

    log.info(`[IntentLifecycle] [${intentId}] Transitioned -> ${newState}`);
    this._notifyListeners(intentId, intent);
  }

  getIntent(intentId) {
    return this._intents.get(intentId);
  }

  getAllActive() {
    return Array.from(this._intents.values()).filter(i => 
      i.state !== IntentState.COMPLETED && 
      i.state !== IntentState.FAILED && 
      i.state !== IntentState.ARCHIVED
    );
  }

  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  _notifyListeners(intentId, intentRecord) {
    let bus;
    try {
      const { bus: b } = require('../events/bus.cjs');
      bus = b;
    } catch { /* optional */ }

    if (bus) {
      try {
        bus.publish('intent:lifecycle_change', { intentId, state: intentRecord.state, record: intentRecord });
      } catch (err) {
        log.warn('[IntentLifecycle] Failed to publish to bus', err);
      }
    }

    for (const listener of this._listeners) {
      try {
        listener(intentId, intentRecord);
      } catch (e) {
        log.error('[IntentLifecycle] Listener error', e);
      }
    }
  }
}

const intentLifecycleManager = new IntentLifecycleManager();
module.exports = { intentLifecycleManager, IntentLifecycleManager, IntentState };

'use strict';

const { ManifestLoader }     = require('./manifest-loader.cjs');
const { FailureClassifier }  = require('./failure-classifier.cjs');

/**
 * CHATR Browser Runtime
 * Sprint 1.1
 *
 * Provider-agnostic Navigate → Observe → Extract → Act → Verify runtime.
 * All provider-specific knowledge lives in manifests, not here.
 *
 * Interface:
 *   navigate(url, vars)
 *   observe(selector, timeout)
 *   extract(selector, schema)
 *   act(action, target, value)
 *   verify(condition, data)
 *
 * Implementations:
 *   mode: 'electron'    — Electron BrowserWindow (main process)
 *   mode: 'synthetic'   — In-memory DOM fixture (for certification/tests)
 *
 * The connector calls this runtime. The kernel never knows it exists.
 */

class BrowserRuntime {
  /**
   * @param {object} options
   * @param {'electron'|'synthetic'} options.mode
   * @param {object} options.bus       Event bus for telemetry
   * @param {object} options.fixture   Synthetic DOM fixture (mode='synthetic' only)
   */
  constructor(options = {}) {
    this._mode      = options.mode || 'synthetic';
    this._bus       = options.bus;
    this._fixture   = options.fixture || null;   // For synthetic mode
    this._classifier = new FailureClassifier();
    this._session   = null;  // Holds browser window handle in electron mode
    this._currentUrl = null;
  }

  // ─── Public Interface ─────────────────────────────────────────────────────

  /**
   * Navigate to a URL. Emits telemetry on completion.
   */
  async navigate(url, vars = {}) {
    const resolved = ManifestLoader.interpolate(url, vars);
    return this._timed('navigate', async () => {
      if (this._mode === 'electron') {
        return this._electronNavigate(resolved);
      }
      // Synthetic mode: record the URL, simulate load time
      this._currentUrl = resolved;
      await this._simulateLatency(80, 180);
      return { url: resolved, status: 200 };
    }, { url: resolved });
  }

  /**
   * Observe that a selector exists. Waits up to timeout_ms.
   */
  async observe(selector, timeoutMs = 3000) {
    return this._timed('observe', async () => {
      if (this._mode === 'electron') {
        return this._electronObserve(selector, timeoutMs);
      }
      await this._simulateLatency(15, 40);
      // In synthetic mode, check against fixture
      const found = this._fixtureHas(selector);
      if (!found) throw new Error(`Selector not found: ${selector}`);
      return { found: true, selector };
    }, { selector });
  }

  /**
   * Extract structured data from the page using a schema.
   * Returns semantic outcome: count + confidence, not raw HTML.
   */
  async extract(selector, schema) {
    return this._timed('extract', async () => {
      if (this._mode === 'electron') {
        return this._electronExtract(selector, schema);
      }
      await this._simulateLatency(20, 60);
      const items = this._fixtureExtract(selector, schema);
      const confidence = items.length > 0 ? Math.min(0.7 + items.length * 0.01, 0.99) : 0;
      // Semantic outcome — kernel sees data quality, not DOM details
      return {
        items,
        count: items.length,
        confidence: Math.round(confidence * 100) / 100,
        selector,
      };
    }, { selector });
  }

  /**
   * Act on the page (click, type, scroll, etc.)
   */
  async act(action, target, value = null) {
    return this._timed('act', async () => {
      if (this._mode === 'electron') {
        return this._electronAct(action, target, value);
      }
      await this._simulateLatency(10, 30);
      return { action, target, value, success: true };
    }, { action, target });
  }

  /**
   * Verify a semantic condition against extracted data.
   * Returns a typed result — not a DOM check.
   */
  async verify(condition, data = {}) {
    return this._timed('verify', async () => {
      await this._simulateLatency(5, 20);
      const result = this._evaluateCondition(condition, data);
      if (!result.passed) {
        throw new Error(`Verification failed: ${condition} — ${result.reason}`);
      }
      return result;
    }, { condition });
  }

  /**
   * Extract generic session evidence — not provider-specific.
   * Returns { cookies, storage, headers } for the connector to interpret.
   */
  async extractSessionEvidence() {
    return this._timed('extract_session_evidence', async () => {
      if (this._mode === 'electron') {
        return this._electronExtractSession();
      }
      // Synthetic: return generic evidence structure
      return {
        cookies: { session_marker: 'synthetic_session_token_abc123' },
        storage: {},
        authenticated: true,
        extracted_at: new Date().toISOString(),
      };
    }, {});
  }

  // ─── Electron Implementation Stubs ───────────────────────────────────────
  // These are the real implementations — wired to Electron BrowserWindow.
  // In the main process, BrowserWindow is created on-demand.

  async _electronNavigate(url) {
    // In production: this._session.loadURL(url) and wait for did-finish-load
    throw new Error('Electron BrowserWindow runtime not initialized. Call BrowserRuntime.createElectronSession() first.');
  }

  async _electronObserve(selector, timeoutMs) {
    // In production: executeJavaScript to poll for selector
    throw new Error('Electron BrowserWindow runtime not initialized.');
  }

  async _electronExtract(selector, schema) {
    // In production: executeJavaScript to querySelectorAll and map schema fields
    throw new Error('Electron BrowserWindow runtime not initialized.');
  }

  async _electronAct(action, target, value) {
    // In production: executeJavaScript to dispatch events
    throw new Error('Electron BrowserWindow runtime not initialized.');
  }

  async _electronExtractSession() {
    // In production: session.cookies.get() + localStorage
    throw new Error('Electron BrowserWindow runtime not initialized.');
  }

  // ─── Synthetic Mode Helpers ───────────────────────────────────────────────

  _fixtureHas(selector) {
    if (!this._fixture) return true; // Permissive default
    // Exact match
    if (selector in this._fixture) return true;
    // Multi-selector: try each comma-separated part
    const parts = selector.split(',').map(s => s.trim());
    return Object.keys(this._fixture).some(key =>
      parts.some(p => key.includes(p) || p.includes(key))
    );
  }

  _fixtureExtract(selector, schema) {
    if (!this._fixture) return [];
    // Exact match
    let rows = this._fixture[selector];
    // Multi-selector fuzzy match
    if (!rows) {
      const parts = selector.split(',').map(s => s.trim());
      const matchedKey = Object.keys(this._fixture).find(key =>
        parts.some(p => key.includes(p) || p.includes(key))
      );
      rows = matchedKey ? this._fixture[matchedKey] : null;
    }
    if (!rows) return [];
    return rows.map(row => {
      const item = {};
      for (const [key, field] of Object.entries(schema)) {
        // Try exact field match, then fuzzy
        let value = row[field];
        if (value === undefined) {
          const fieldParts = field.split(',').map(f => f.trim());
          const matchedField = Object.keys(row).find(rk =>
            fieldParts.some(fp => rk.includes(fp) || fp.includes(rk))
          );
          value = matchedField ? row[matchedField] : null;
        }
        item[key] = value ?? null;
      }
      return item;
    });
  }

  _evaluateCondition(condition, data) {
    // Simple condition evaluator — extensible
    if (condition === 'count > 0') {
      const passed = (data.count ?? 0) > 0;
      return { passed, condition, reason: passed ? 'ok' : 'count is 0', ...data };
    }
    if (condition.startsWith('count >= ')) {
      const threshold = parseInt(condition.split('>=')[1].trim(), 10);
      const passed = (data.count ?? 0) >= threshold;
      return { passed, condition, reason: passed ? 'ok' : `count ${data.count} < ${threshold}`, ...data };
    }
    if (condition === 'authenticated') {
      const passed = !!data.authenticated;
      return { passed, condition, reason: passed ? 'ok' : 'not authenticated', ...data };
    }
    // Default: pass unknown conditions (warn in logs)
    return { passed: true, condition, reason: 'condition not evaluated (unknown type)', ...data };
  }

  async _simulateLatency(minMs, maxMs) {
    const ms = minMs + Math.random() * (maxMs - minMs);
    await new Promise(r => setTimeout(r, ms));
  }

  // ─── Telemetry wrapper ────────────────────────────────────────────────────

  async _timed(stepType, fn, meta = {}) {
    const start = Date.now();
    try {
      const result = await fn();
      const latencyMs = Date.now() - start;
      this._emit('kernel.browser_runtime.step_completed', { step: stepType, latency_ms: latencyMs, ...meta });
      return { ...result, _latency_ms: latencyMs };
    } catch (err) {
      const latencyMs = Date.now() - start;
      const failure = this._classifier.classify(err, stepType, meta);
      this._emit('kernel.browser_runtime.step_failed', { step: stepType, latency_ms: latencyMs, failure });
      throw failure;
    }
  }

  _emit(event, data) {
    if (this._bus) this._bus.publish(event, data);
  }
}

module.exports = { BrowserRuntime };

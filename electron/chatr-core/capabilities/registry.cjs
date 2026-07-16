'use strict';

/**
 * CHATR Kernel v2.0 — Capability Registry
 *
 * Loads capability-catalog.json at startup and provides lookup methods
 * for the rest of the kernel to resolve capabilities by ID, domain, or policy group.
 */

const path = require('path');
const fs   = require('fs');

const log = (() => {
  try { return require('electron-log'); } catch { return console; }
})();

const CATALOG_PATH = path.join(__dirname, 'capability-catalog.json');

class CapabilityRegistry {
  constructor() {
    this._capabilities = new Map();
    this._loaded = false;
    this._load();
  }

  // ── Private ──────────────────────────────────────────────────────────────

  _load() {
    try {
      const raw  = fs.readFileSync(CATALOG_PATH, 'utf8');
      const data = JSON.parse(raw);

      for (const cap of (data.capabilities || [])) {
        this._capabilities.set(cap.id, cap);
      }

      this._loaded = true;
      log.info(`[CapabilityRegistry] Loaded ${this._capabilities.size} capabilities from catalog v${data.schemaVersion}`);
    } catch (err) {
      log.error('[CapabilityRegistry] Failed to load capability catalog:', err.message);
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Returns a single capability definition by ID.
   * @param {string} id
   * @returns {object|null}
   */
  getCapability(id) {
    return this._capabilities.get(id) || null;
  }

  /**
   * Returns all capability definitions.
   * @returns {object[]}
   */
  getAllCapabilities() {
    return Array.from(this._capabilities.values());
  }

  /**
   * Returns capabilities belonging to a specific domain.
   * @param {string} domain
   * @returns {object[]}
   */
  getByDomain(domain) {
    return this.getAllCapabilities().filter(c => c.domain === domain);
  }

  /**
   * Returns all unique domain strings.
   * @returns {string[]}
   */
  getDomains() {
    const domains = new Set();
    for (const cap of this._capabilities.values()) {
      domains.add(cap.domain);
    }
    return Array.from(domains);
  }

  /**
   * Returns true if the capability requires user approval before execution.
   * @param {string} id
   * @returns {boolean}
   */
  requiresApproval(id) {
    const cap = this.getCapability(id);
    return cap ? cap.approval === 'always' : false;
  }

  /**
   * Returns the policy group string for a capability.
   * @param {string} id
   * @returns {string}
   */
  getPolicyGroup(id) {
    const cap = this.getCapability(id);
    return cap ? cap.policyGroup : 'safe';
  }

  /**
   * Returns true if the registry loaded successfully.
   * @returns {boolean}
   */
  isLoaded() {
    return this._loaded;
  }
}

const capabilityRegistry = new CapabilityRegistry();
module.exports = { capabilityRegistry, CapabilityRegistry };

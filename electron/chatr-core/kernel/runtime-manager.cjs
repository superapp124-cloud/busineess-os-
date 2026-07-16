'use strict';

/**
 * CHATR Kernel — Runtime Manager
 *
 * Central registry mapping Capabilities -> Runtimes -> Providers.
 * The Kernel requests a Capability, and the Runtime Manager resolves
 * it to the appropriate Provider through the assigned Runtime.
 *
 * ABI v1.0
 */

const { ManifestValidator } = require('./manifests.cjs');

const log = (() => {
  try { return require('electron-log'); } catch { return console; }
})();

class RuntimeManager {
  constructor() {
    this.runtimes = new Map();     // name -> Runtime instance
    this.capabilities = new Map(); // capabilityId -> manifest
    this.providers = new Map();    // capabilityId -> Provider instance
  }

  /**
   * Registers a Runtime domain (e.g., BrowserRuntime).
   */
  registerRuntime(name, runtimeInstance) {
    if (this.runtimes.has(name)) {
      log.warn(`[RuntimeManager] Runtime ${name} is already registered. Overwriting.`);
    }
    this.runtimes.set(name, runtimeInstance);
    log.info(`[RuntimeManager] Registered Runtime: ${name}`);
  }

  /**
   * Dynamically registers a capability using a Manifest.
   */
  registerCapability(manifestPayload, providerInstance) {
    try {
      const manifest = ManifestValidator.validateCapability(manifestPayload);
      
      if (!this.runtimes.has(manifest.runtime)) {
        throw new Error(`Target runtime '${manifest.runtime}' is not registered.`);
      }

      this.capabilities.set(manifest.id, manifest);
      this.providers.set(manifest.id, providerInstance);

      // Register the provider with its respective runtime
      const runtime = this.runtimes.get(manifest.runtime);
      runtime.registerProvider(manifest.id, providerInstance, true);

      log.info(`[RuntimeManager] Registered Capability: ${manifest.id} (${manifest.version}) -> ${manifest.runtime}`);
      return manifest;
    } catch (err) {
      log.error(`[RuntimeManager] Capability Registration Failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Resolves a capability to its provider.
   */
  getProviderForCapability(capabilityId) {
    const provider = this.providers.get(capabilityId);
    if (!provider) {
      throw new Error(`[RuntimeManager] No provider registered for capability: ${capabilityId}`);
    }
    return provider;
  }
  
  /**
   * Retrieves a specific runtime by name.
   */
  getRuntime(name) {
    return this.runtimes.get(name);
  }

  // --- Discovery & Introspection API ---

  discover() {
    return Array.from(this.capabilities.values());
  }

  searchCapabilities(query) {
    const q = query.toLowerCase();
    return this.discover().filter(c => 
      c.id.toLowerCase().includes(q) || 
      c.name.toLowerCase().includes(q) || 
      c.category.toLowerCase().includes(q)
    );
  }

  inspectCapability(capabilityId) {
    return this.capabilities.get(capabilityId);
  }

  hasCapability(capabilityId) {
    return this.capabilities.has(capabilityId);
  }

  getCapability(capabilityId) {
    return this.capabilities.get(capabilityId) || null;
  }

  getDependencies(capabilityId) {
    const cap = this.capabilities.get(capabilityId);
    return cap ? cap.dependencies : [];
  }

  /**
   * Polls all registered runtimes for their current health state.
   */
  getSystemHealth() {
    const health = {};
    for (const [name, runtime] of this.runtimes.entries()) {
      health[name] = typeof runtime.getHealth === 'function' ? runtime.getHealth() : 'Unknown';
    }
    return health;
  }
}

const runtimeManager = new RuntimeManager();
module.exports = { runtimeManager, RuntimeManager };

const { EventEmitter } = require('events');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * CapabilityManager — The core of the Thin Kernel architecture.
 * 
 * Instead of bundling heavy AI models or domain-specific OS plugins into the
 * initial installer, the CapabilityManager downloads them on-demand.
 * 
 * Responsibilities:
 * - Discover capabilities
 * - Download capabilities
 * - Verify integrity (SHA256)
 * - Install & Update
 * - Rollback on failure
 */
class CapabilityManager extends EventEmitter {
  constructor(capabilitiesDir) {
    super();
    this.capabilitiesDir = capabilitiesDir;
    if (!fs.existsSync(this.capabilitiesDir)) {
      fs.mkdirSync(this.capabilitiesDir, { recursive: true });
    }
    
    // In a real implementation, this registry would be fetched from a remote CDN/API.
    // For now, we mock the manifest.
    this.registry = {
      'ai-llama3': { version: '1.0.0', sha256: 'mockhash', size: 4500000000, type: 'model' },
      'os-legal': { version: '2.1.0', sha256: 'mockhash', size: 15000000, type: 'plugin' },
      'os-healthcare': { version: '1.4.2', sha256: 'mockhash', size: 22000000, type: 'plugin' }
    };
    
    this.installed = this._loadInstalledManifest();
  }

  _loadInstalledManifest() {
    const manifestPath = path.join(this.capabilitiesDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  _saveManifest() {
    fs.writeFileSync(
      path.join(this.capabilitiesDir, 'manifest.json'),
      JSON.stringify(this.installed, null, 2)
    );
  }

  isInstalled(capabilityId) {
    return !!this.installed[capabilityId];
  }

  getInstallation(capabilityId) {
    return this.installed[capabilityId];
  }

  async installCapability(capabilityId) {
    const manifest = this.registry[capabilityId];
    if (!manifest) throw new Error(`Capability ${capabilityId} not found in registry`);

    this.emit('progress', { capability: capabilityId, state: 'downloading', progress: 0 });

    // Mock download and verification delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.emit('progress', { capability: capabilityId, state: 'downloading', progress: 50 });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.emit('progress', { capability: capabilityId, state: 'verifying', progress: 100 });

    // In a real flow:
    // 1. Download file to temp
    // 2. Hash file and compare against manifest.sha256
    // 3. Move to this.capabilitiesDir / capabilityId
    
    this.installed[capabilityId] = {
      version: manifest.version,
      installedAt: Date.now(),
      path: path.join(this.capabilitiesDir, capabilityId)
    };
    
    this._saveManifest();
    this.emit('progress', { capability: capabilityId, state: 'ready', progress: 100 });
    
    return this.installed[capabilityId];
  }

  async checkUpdates() {
    const updates = [];
    for (const [id, installed] of Object.entries(this.installed)) {
      const remote = this.registry[id];
      if (remote && remote.version !== installed.version) {
        updates.push({ id, current: installed.version, latest: remote.version });
      }
    }
    return updates;
  }
}

module.exports = CapabilityManager;

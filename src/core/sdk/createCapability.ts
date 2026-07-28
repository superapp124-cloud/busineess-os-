import { CapabilityManifest } from './CapabilityManifest';
import React from 'react';

export interface CapabilityOptions {
  workspace: React.ComponentType<any>;
}

export interface CapabilityInstance {
  manifest: CapabilityManifest;
  Workspace: React.ComponentType<any>;
  install: () => Promise<void>;
  uninstall: () => Promise<void>;
}

/**
 * Capability SDK Factory
 * Takes a manifest and options, returning a standard CapabilityInstance
 * that the Intent OS kernel can manage.
 */
export function createCapability(manifest: CapabilityManifest, options: CapabilityOptions): CapabilityInstance {
  // Here the kernel will auto-register routes, search indexing, event listeners, etc.
  // We'll expand this as we build out those kernel services.

  return {
    manifest,
    Workspace: options.workspace,
    install: async () => {
      console.log(`[Kernel] Installing capability: ${manifest.id}`);
      // Integrate with deployCapability logic eventually
    },
    uninstall: async () => {
      console.log(`[Kernel] Uninstalling capability: ${manifest.id}`);
      // Integrate with uninstallCapability logic eventually
    }
  };
}

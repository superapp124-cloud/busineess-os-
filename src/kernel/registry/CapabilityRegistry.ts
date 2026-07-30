/**
 * CHATR Capability Registry
 * Matches incoming intents and tasks to optimal registered model providers based on capabilities, privacy, and hardware constraints.
 */

import { CapabilityManifest, CapabilityCategory } from '../../models/capability/CapabilityManifest';

export interface CapabilityQuery {
  category: CapabilityCategory;
  requiredCapabilities?: string[];
  requiresOffline?: boolean;
  maxLatencyMs?: number;
  preferGpu?: boolean;
}

class CapabilityRegistryService {
  private manifests: Map<string, CapabilityManifest> = new Map();

  /**
   * Register a new model capability manifest
   */
  public registerManifest(manifest: CapabilityManifest): void {
    this.manifests.set(manifest.id, manifest);
    console.log(`[CapabilityRegistry] Registered capability provider: ${manifest.name} (${manifest.id})`);
  }

  /**
   * Find the best provider matching query criteria
   */
  public selectBestProvider(query: CapabilityQuery): CapabilityManifest | null {
    const matches: CapabilityManifest[] = [];

    for (const manifest of this.manifests.values()) {
      if (manifest.category !== query.category) continue;

      if (query.requiresOffline && !manifest.requirements.supportsOffline) continue;

      if (query.maxLatencyMs && manifest.avgLatencyMs > query.maxLatencyMs) continue;

      if (query.requiredCapabilities && query.requiredCapabilities.length > 0) {
        const hasAllCaps = query.requiredCapabilities.every(cap => manifest.capabilities.includes(cap));
        if (!hasAllCaps) continue;
      }

      matches.push(manifest);
    }

    if (matches.length === 0) {
      return null;
    }

    // Sort by priority (descending), latency (ascending), and cost (ascending)
    matches.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (a.avgLatencyMs !== b.avgLatencyMs) return a.avgLatencyMs - b.avgLatencyMs;
      return a.costPerOp - b.costPerOp;
    });

    return matches[0];
  }

  /**
   * Get all registered capability manifests
   */
  public getAllManifests(): CapabilityManifest[] {
    return Array.from(this.manifests.values());
  }

  /**
   * Clear all registered manifests
   */
  public clear(): void {
    this.manifests.clear();
  }
}

export const CapabilityRegistry = new CapabilityRegistryService();

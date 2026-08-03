/**
 * CHATR Capability Registry
 * Matches incoming intents and tasks to optimal registered model providers based on capabilities, privacy, and hardware constraints.
 */

import { CapabilityManifest, CapabilityCategory } from '../../models/capability/CapabilityManifest';
import { EDLLivingObject } from '../contracts/edl/types';

export interface CapabilityQuery {
  category: CapabilityCategory;
  requiredCapabilities?: string[];
  requiresOffline?: boolean;
  maxLatencyMs?: number;
  preferGpu?: boolean;
}

export class CapabilityRegistry {
  // --- AI Model Provider Registry (Static singleton used by ExecutionEngine) ---
  private static manifests: Map<string, CapabilityManifest> = new Map();

  public static registerManifest(manifest: CapabilityManifest): void {
    this.manifests.set(manifest.id, manifest);
    console.log(`[CapabilityRegistry] Registered capability provider: ${manifest.name} (${manifest.id})`);
  }

  public static selectBestProvider(query: CapabilityQuery): CapabilityManifest | null {
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

    if (matches.length === 0) return null;

    matches.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (a.avgLatencyMs !== b.avgLatencyMs) return a.avgLatencyMs - b.avgLatencyMs;
      return a.costPerOp - b.costPerOp;
    });

    return matches[0];
  }

  public static getAllManifests(): CapabilityManifest[] {
    return Array.from(this.manifests.values());
  }

  public static clear(): void {
    this.manifests.clear();
  }

  // --- EDL Object Registry (Instance methods used by KernelProvider, PackLoader, ObjectRuntime) ---
  private installedPacks: Map<string, any> = new Map();
  private aggregates: Map<string, EDLLivingObject> = new Map();

  public install(manifest: any, objects: EDLLivingObject[]): void {
    this.installedPacks.set(manifest.id || manifest.name, manifest);
    for (const obj of objects) {
      this.aggregates.set(obj.type, obj);
      this.aggregates.set(obj.type.toLowerCase(), obj);
    }
  }

  public getAggregate(type: string): EDLLivingObject {
    const agg = this.aggregates.get(type) || this.aggregates.get(type.toLowerCase());
    if (!agg) {
      throw new Error(`Aggregate type ${type} not found in registry`);
    }
    return agg;
  }
}

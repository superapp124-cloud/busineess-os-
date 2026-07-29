import { PlatformRegistry } from './PlatformRegistry';
import { ICapabilityManifest } from '../../types';

export class CapabilityDependencyManager {
  
  /**
   * Calculates the correct installation or startup order using topological sorting.
   * Ensures that dependencies are started/installed before the capabilities that depend on them.
   */
  static resolveInstallOrder(capabilityIds: string[]): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const tempMark = new Set<string>();

    const visit = (id: string) => {
      if (tempMark.has(id)) {
        throw new Error(`[DependencyManager] Circular dependency detected involving Capability: ${id}`);
      }
      if (!visited.has(id)) {
        tempMark.add(id);

        const manifest = PlatformRegistry.get<ICapabilityManifest>('Capability', id);
        
        // If manifest is missing locally, we assume it might be in the marketplace or missing entirely.
        if (manifest && manifest.dependencies?.kernelServices) {
          // In a real environment, capabilities depend on other capabilities (not just kernel services).
          // For now, we simulate traversing 'dependsOn' if it exists.
          const dependsOn: string[] = (manifest as any).dependencies?.capabilities || [];
          for (const dep of dependsOn) {
            visit(dep);
          }
        }

        tempMark.delete(id);
        visited.add(id);
        sorted.push(id);
      }
    };

    for (const id of capabilityIds) {
      if (!visited.has(id)) {
        visit(id);
      }
    }

    return sorted;
  }

  /**
   * Validates if a capability's dependencies are currently healthy and running.
   */
  static checkHealth(capabilityId: string): { healthy: boolean; missing: string[] } {
    const manifest = PlatformRegistry.get<ICapabilityManifest>('Capability', capabilityId);
    if (!manifest) return { healthy: false, missing: [capabilityId] };

    const missing: string[] = [];
    const dependsOn: string[] = (manifest as any).dependencies?.capabilities || [];

    for (const dep of dependsOn) {
      // Check if dependency is registered
      const depManifest = PlatformRegistry.get<ICapabilityManifest>('Capability', dep);
      if (!depManifest) {
        missing.push(dep);
      }
      // Future: Check CapabilityRuntime for 'Running' state of the dependency
    }

    return { healthy: missing.length === 0, missing };
  }
}

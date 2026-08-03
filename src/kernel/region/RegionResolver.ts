import { ExecutionRegion, RegionCode } from './ExecutionRegion';
import { RegionEndpointRegistry } from './RegionEndpointRegistry';

export class RegionResolver {
  private registry = RegionEndpointRegistry.getInstance();

  public resolveBestRegion(preferredCode?: RegionCode): ExecutionRegion {
    if (preferredCode) {
      const target = this.registry.getRegion(preferredCode);
      if (target && target.status === 'HEALTHY') return target;
    }

    // Default to primary healthy region or local-edge fallback
    const regions = this.registry.getAllRegions();
    const primary = regions.find(r => r.isPrimary && r.status === 'HEALTHY');
    if (primary) return primary;

    const edge = this.registry.getRegion('local-edge');
    return edge || regions[0];
  }
}

import { RegionEndpointRegistry } from './RegionEndpointRegistry';
import { ExecutionRegion } from './ExecutionRegion';

export class RegionHealthMonitor {
  private registry = RegionEndpointRegistry.getInstance();

  public async checkHealth(regionCode: string): Promise<{ status: string; latencyMs: number }> {
    const region = this.registry.getRegion(regionCode as any);
    if (!region) return { status: 'UNAVAILABLE', latencyMs: -1 };

    // Simulated health ping
    return {
      status: region.status,
      latencyMs: region.latencyMs
    };
  }

  public async checkAllRegions(): Promise<Record<string, ExecutionRegion>> {
    const all = this.registry.getAllRegions();
    const result: Record<string, ExecutionRegion> = {};
    for (const r of all) {
      result[r.code] = r;
    }
    return result;
  }
}

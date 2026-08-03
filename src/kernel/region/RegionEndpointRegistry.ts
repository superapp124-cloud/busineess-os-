import { ExecutionRegion, RegionCode } from './ExecutionRegion';

export class RegionEndpointRegistry {
  private static instance: RegionEndpointRegistry;
  private registry: Map<RegionCode, ExecutionRegion> = new Map();

  constructor() {
    // Seed default region topology
    this.registerRegion({
      code: 'ap-south-1',
      name: 'Asia Pacific (Mumbai)',
      endpointUrl: 'https://ap-south-1.api.chatr.chat',
      isPrimary: true,
      supportsEdgeExecution: true,
      latencyMs: 18,
      status: 'HEALTHY'
    });
    this.registerRegion({
      code: 'us-east-1',
      name: 'US East (N. Virginia)',
      endpointUrl: 'https://us-east-1.api.chatr.chat',
      isPrimary: false,
      supportsEdgeExecution: true,
      latencyMs: 140,
      status: 'HEALTHY'
    });
    this.registerRegion({
      code: 'local-edge',
      name: 'Local Electron Desktop Edge Engine',
      endpointUrl: 'http://127.0.0.1:8086',
      isPrimary: false,
      supportsEdgeExecution: true,
      latencyMs: 1,
      status: 'HEALTHY'
    });
  }

  public static getInstance(): RegionEndpointRegistry {
    if (!RegionEndpointRegistry.instance) {
      RegionEndpointRegistry.instance = new RegionEndpointRegistry();
    }
    return RegionEndpointRegistry.instance;
  }

  public registerRegion(region: ExecutionRegion): void {
    this.registry.set(region.code, region);
  }

  public getRegion(code: RegionCode): ExecutionRegion | undefined {
    return this.registry.get(code);
  }

  public getAllRegions(): ExecutionRegion[] {
    return Array.from(this.registry.values());
  }
}

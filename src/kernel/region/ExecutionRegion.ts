export type RegionCode = 'us-east-1' | 'eu-west-1' | 'ap-south-1' | 'local-edge';

export interface ExecutionRegion {
  code: RegionCode;
  name: string;
  endpointUrl: string;
  isPrimary: boolean;
  supportsEdgeExecution: boolean;
  latencyMs: number;
  status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
}

export interface RegionProvider {
  getRegion(code: RegionCode): Promise<ExecutionRegion | null>;
  listRegions(): Promise<ExecutionRegion[]>;
}

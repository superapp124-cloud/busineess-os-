import { ExecutionResult } from './ExecutionResult';

export interface CapabilityManifest {
  id: string;
  version: string;
  name: string;
  description: string;
  inputSchema: unknown;  // JSONSchema
  outputSchema: unknown; // JSONSchema
  permissions: string[];
  dependencies: string[];
  runtimeRequirements: {
    supportsStreaming: boolean;
    supportsOffline: boolean;
    requiresGpu?: boolean;
    estimatedCost: number;
    estimatedLatencyMs: number;
  };
}

export interface CapabilityGraphEdge {
  from: string;
  to: string;
  condition?: string;
}

export interface CapabilityGraph {
  nodes: CapabilityManifest[];
  edges: CapabilityGraphEdge[];
}

export interface Capability<TInput = unknown, TOutput = unknown> {
  manifest: CapabilityManifest;
  execute(ctx: any, input: TInput): Promise<ExecutionResult<TOutput>>;
}

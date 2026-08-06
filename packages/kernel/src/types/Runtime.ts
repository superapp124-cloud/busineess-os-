import { ExecutionContext } from './ExecutionContext';
import { ExecutionResult } from './ExecutionResult';

export type RuntimeCategory = 'LOCAL' | 'NETWORK' | 'EMBEDDED' | 'REMOTE';

export interface RuntimeFeatureSet {
  supportsLLM: boolean;
  supportsVision: boolean;
  supportsEmbedding: boolean;
  supportsSpeech: boolean;
  supportsToolCalling: boolean;
  supportsStreaming: boolean;
  supportsGPU: boolean;
  supportsOffline: boolean;
}

export interface Runtime {
  id: string;
  name: string;
  category: RuntimeCategory;
  features: RuntimeFeatureSet;
  health(): Promise<{ healthy: boolean; details?: string }>;
  execute<TInput = unknown, TOutput = unknown>(capabilityId: string, ctx: ExecutionContext, input: TInput): Promise<ExecutionResult<TOutput>>;
}

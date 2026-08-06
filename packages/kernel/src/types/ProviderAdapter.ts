import { ExecutionContext } from './ExecutionContext';
import { ExecutionResult } from './ExecutionResult';

export interface ProviderAdapter<TInput = unknown, TOutput = unknown> {
  id: string;
  name: string;
  type: 'LOCAL' | 'ENTERPRISE_LAN' | 'CLOUD';
  execute(ctx: ExecutionContext, input: TInput): Promise<ExecutionResult<TOutput>>;
  stream?(ctx: ExecutionContext, input: TInput): AsyncIterable<unknown>;
  embed?(ctx: ExecutionContext, text: string): Promise<number[]>;
  vision?(ctx: ExecutionContext, image: Blob): Promise<string>;
  speech?(ctx: ExecutionContext, audio: Blob): Promise<string>;
  image?(ctx: ExecutionContext, prompt: string): Promise<string>;
  health(): Promise<{ status: 'healthy' | 'degraded' | 'offline'; latencyMs: number }>;
  cost(input: TInput): number;
}

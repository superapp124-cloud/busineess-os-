/**
 * CHATR Intent OS Execution Engine
 * Orchestrates task execution and enforces reversed provider resolution flow:
 * Runtime -> ExecutionEngine -> CapabilityRegistry -> ProviderRegistry -> Provider
 */

import { CapabilityRegistry, CapabilityQuery } from '../registry/CapabilityRegistry';
import { ProviderRegistry } from '../registry/ProviderRegistry';
import { IDocumentProviderPlugin } from '../../providers/documents/DocumentProviderPlugin';

export interface ExecutionTask<TInput = unknown> {
  taskId: string;
  query: CapabilityQuery;
  input: TInput;
  priority?: number;
}

export interface ExecutionResult<TOutput = unknown> {
  taskId: string;
  providerId: string;
  status: 'success' | 'failed';
  output?: TOutput;
  error?: string;
  durationMs: number;
}

class ExecutionEngineService {
  /**
   * Dispatch a task payload to the optimal provider matching query capabilities
   */
  public async executeTask<TInput = unknown, TOutput = unknown>(
    task: ExecutionTask<TInput>
  ): Promise<ExecutionResult<TOutput>> {
    const startTime = performance.now();
    console.log(`[ExecutionEngine] Resolving provider for task: ${task.taskId}`);

    // 1. Select optimal provider manifest via CapabilityRegistry
    const manifest = CapabilityRegistry.selectBestProvider(task.query);
    if (!manifest) {
      return {
        taskId: task.taskId,
        providerId: 'none',
        status: 'failed',
        error: `No capability manifest matching query: ${JSON.stringify(task.query)}`,
        durationMs: Math.round(performance.now() - startTime),
      };
    }

    // 2. Retrieve provider instance via ProviderRegistry
    const provider = ProviderRegistry.getProvider<TInput, TOutput>(manifest.id);
    if (!provider) {
      return {
        taskId: task.taskId,
        providerId: manifest.id,
        status: 'failed',
        error: `Provider plugin [${manifest.id}] registered in manifest but not found in ProviderRegistry`,
        durationMs: Math.round(performance.now() - startTime),
      };
    }

    // 3. Execute provider workload
    try {
      const output = await provider.execute(task.input);
      const durationMs = Math.round(performance.now() - startTime);

      return {
        taskId: task.taskId,
        providerId: manifest.id,
        status: 'success',
        output,
        durationMs,
      };
    } catch (err: any) {
      return {
        taskId: task.taskId,
        providerId: manifest.id,
        status: 'failed',
        error: err.message,
        durationMs: Math.round(performance.now() - startTime),
      };
    }
  }
}

export const ExecutionEngine = new ExecutionEngineService();

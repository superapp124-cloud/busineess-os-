/**
 * CHATR Intent OS Execution Engine (ADR-004 & ADR-009 Compliant)
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

export interface DiagnosticMessage {
  severity: 'info' | 'warning' | 'error';
  message: string;
  code?: string;
}

export interface StandardExecutionResult<TOutput = unknown> {
  success: boolean;
  output?: TOutput;
  diagnostics: DiagnosticMessage[];
  metrics: {
    durationMs: number;
    providerId: string;
    modelName?: string;
    vramUsedMb?: number;
  };
  eventsEmitted: string[];
  artifactsCreated: string[];
}

class ExecutionEngineService {
  /**
   * Dispatch a task payload to the optimal provider matching query capabilities
   */
  public async executeTask<TInput = unknown, TOutput = unknown>(
    task: ExecutionTask<TInput>
  ): Promise<StandardExecutionResult<TOutput>> {
    const startTime = performance.now();
    console.log(`[ExecutionEngine] Resolving provider for task: ${task.taskId}`);

    // 1. Select optimal provider manifest via CapabilityRegistry
    const manifest = CapabilityRegistry.selectBestProvider(task.query);
    if (!manifest) {
      return {
        success: false,
        diagnostics: [{ severity: 'error', message: `No capability manifest matching query: ${JSON.stringify(task.query)}` }],
        metrics: {
          durationMs: Math.round(performance.now() - startTime),
          providerId: 'none',
        },
        eventsEmitted: [],
        artifactsCreated: [],
      };
    }

    // 2. Retrieve provider instance via ProviderRegistry
    const provider = ProviderRegistry.getProvider<TInput, TOutput>(manifest.id);
    if (!provider) {
      return {
        success: false,
        diagnostics: [{ severity: 'error', message: `Provider plugin [${manifest.id}] not found in ProviderRegistry` }],
        metrics: {
          durationMs: Math.round(performance.now() - startTime),
          providerId: manifest.id,
        },
        eventsEmitted: [],
        artifactsCreated: [],
      };
    }

    // 3. Execute provider workload
    try {
      const providerResult = await provider.execute(task.input);
      const durationMs = Math.round(performance.now() - startTime);

      return {
        success: true,
        output: providerResult as unknown as TOutput,
        diagnostics: [{ severity: 'info', message: `Task ${task.taskId} executed successfully by ${manifest.name}` }],
        metrics: {
          durationMs,
          providerId: manifest.id,
          modelName: manifest.name,
        },
        eventsEmitted: ['task:executed'],
        artifactsCreated: [],
      };
    } catch (err: any) {
      return {
        success: false,
        diagnostics: [{ severity: 'error', message: err.message }],
        metrics: {
          durationMs: Math.round(performance.now() - startTime),
          providerId: manifest.id,
        },
        eventsEmitted: [],
        artifactsCreated: [],
      };
    }
  }
}

export const ExecutionEngine = new ExecutionEngineService();

/**
 * CHATR Intent OS Execution Engine (ADR-004 & ADR-009 Compliant)
 * Orchestrates task execution and enforces reversed provider resolution flow:
 * Runtime -> ExecutionEngine -> CapabilityRegistry -> ProviderRegistry -> Provider
 */

import { CapabilityRegistry, CapabilityQuery } from '../registry/CapabilityRegistry';
import { ProviderRegistry } from '../registry/ProviderRegistry';
import { PersistentIdempotencyStore } from './PersistentIdempotencyStore';

export interface ExecutionTask<TInput = unknown> {
  taskId: string;
  query: CapabilityQuery;
  input: TInput;
  tenantId?: string;
  entityId?: string;
  operationId?: string;
  priority?: number;
  idempotencyKey?: string;
  attempt?: number;
  externalReference?: string;
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
  idempotencyKey?: string;
  externalReference?: string;
}

class ExecutionEngineService {
  /**
   * Dispatch a task payload to the optimal provider matching query capabilities with persistent idempotency protection.
   */
  public async executeTask<TInput = unknown, TOutput = unknown>(
    task: ExecutionTask<TInput>
  ): Promise<StandardExecutionResult<TOutput>> {
    const startTime = performance.now();
    const tenantId = task.tenantId || 'default_tenant';
    const capability = task.query.capabilityType;
    const entityId = task.entityId || 'generic_entity';
    const operationId = task.operationId || task.taskId;

    // Phase 3: Persistent Atomic Idempotency Key Registration
    const registration = await PersistentIdempotencyStore.registerOrGet(
      tenantId,
      capability,
      entityId,
      operationId,
      task.taskId
    );

    const idempotencyKey = registration.record.idempotencyKey;

    // Duplicate Execution Check: If this execution is NOT the owner and already executed/confirmed, return existing record
    if (!registration.isOwner && ['EXECUTED', 'CONFIRMED'].includes(registration.record.status)) {
      console.log(`[ExecutionEngine] Persistent Idempotency Conflict. Reusing execution record: ${idempotencyKey}`);
      return {
        success: true,
        output: { reusedRecord: registration.record } as unknown as TOutput,
        diagnostics: [{
          severity: 'info',
          message: `Execution skipped: Logical operation ${operationId} already executed (attempt ${registration.record.attempt})`
        }],
        metrics: {
          durationMs: Math.round(performance.now() - startTime),
          providerId: 'idempotency_guard',
        },
        eventsEmitted: ['task:idempotent_reused'],
        artifactsCreated: [],
        idempotencyKey,
        externalReference: registration.record.externalReference
      };
    }

    console.log(`[ExecutionEngine] Resolving provider for task: ${task.taskId} (idempotency: ${idempotencyKey})`);

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
        idempotencyKey,
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

      const result: StandardExecutionResult<TOutput> = {
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
        idempotencyKey,
        externalReference: task.externalReference,
      };

      await PersistentIdempotencyStore.markCompleted(
        tenantId,
        idempotencyKey,
        task.externalReference || `ref_${task.taskId}`,
        'CONFIRMED'
      );

      return result;
    } catch (err: any) {
      await PersistentIdempotencyStore.markCompleted(
        tenantId,
        idempotencyKey,
        undefined,
        'FAILED',
        err.message
      );

      return {
        success: false,
        diagnostics: [{ severity: 'error', message: err.message }],
        metrics: {
          durationMs: Math.round(performance.now() - startTime),
          providerId: manifest.id,
        },
        eventsEmitted: [],
        artifactsCreated: [],
        idempotencyKey,
      };
    }
  }
}

export const ExecutionEngine = new ExecutionEngineService();

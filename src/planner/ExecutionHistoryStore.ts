/**
 * CHATR Execution History Store
 * Persists executed plans, telemetry metadata, node outputs, and memory writes for replay & debugging.
 */

import { ExecutionPlan } from './ExecutionGraph';
import { PlanExecutionSummary } from './IntentPlanner';

export interface ExecutionRecord {
  recordId: string;
  plan: ExecutionPlan;
  summary: PlanExecutionSummary;
  executedAt: string;
  telemetryTraceId: string;
}

class ExecutionHistoryStoreService {
  private records: Map<string, ExecutionRecord> = new Map();

  /**
   * Persist a completed or failed execution record
   */
  public saveRecord(plan: ExecutionPlan, summary: PlanExecutionSummary, telemetryTraceId: string): ExecutionRecord {
    const recordId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const record: ExecutionRecord = {
      recordId,
      plan: JSON.parse(JSON.stringify(plan)), // Snapshot
      summary,
      executedAt: new Date().toISOString(),
      telemetryTraceId,
    };

    this.records.set(recordId, record);
    console.log(`[ExecutionHistoryStore] Persisted record ${recordId} for plan ${plan.id}`);
    return record;
  }

  /**
   * Retrieve all execution records
   */
  public getRecords(): ExecutionRecord[] {
    return Array.from(this.records.values());
  }

  /**
   * Get a specific record by ID
   */
  public getRecord(recordId: string): ExecutionRecord | undefined {
    return this.records.get(recordId);
  }
}

export const ExecutionHistoryStore = new ExecutionHistoryStoreService();

/**
 * Resume Intelligence OS v3.0 — State Snapshot Store
 *
 * Captures immutable snapshots at each major pipeline stage.
 * If parsing fails, you can inspect exactly where it broke and why.
 * FailureSnapshot preserved on crash — never lost.
 */

export type PipelineStage =
  | 'ocr'
  | 'layout'
  | 'entity-extraction'
  | 'entity-resolution'
  | 'graph-builder'
  | 'validation'
  | 'output';

// ─── Snapshots ────────────────────────────────────────────────────────────────

export interface StateSnapshot<T = unknown> {
  snapshotId: string;
  candidateId: string;
  stage: PipelineStage;
  data: T;
  timestamp: string;
  /** Time spent in this specific stage (milliseconds) */
  stageMs: number;
  /** Cumulative pipeline time so far */
  totalMs: number;
  qualityScore?: number;
  entityCount?: number;
}

export interface FailureSnapshot {
  snapshotId: string;
  candidateId: string;
  failedAtStage: PipelineStage;
  /** Snapshots successfully completed before failure */
  completedStages: StateSnapshot[];
  error: string;
  errorStack?: string;
  /** Partial data at point of failure — invaluable for debugging */
  partialData: unknown;
  timestamp: string;
  totalMsBeforeFailure: number;
}

// ─── Snapshot Store ───────────────────────────────────────────────────────────

class SnapshotStoreImpl {
  /** Circular buffer keyed by candidateId → stage → snapshot */
  private readonly snapshots = new Map<string, Map<PipelineStage, StateSnapshot>>();
  private readonly failures = new Map<string, FailureSnapshot>();
  private readonly MAX_CANDIDATES = 100;
  private idCounter = 0;

  private makeId(): string {
    return `snap-${++this.idCounter}-${Date.now().toString(36)}`;
  }

  /**
   * Capture a snapshot for a specific pipeline stage.
   * Overwrites any existing snapshot for the same candidateId + stage.
   */
  capture<T>(
    candidateId: string,
    stage: PipelineStage,
    data: T,
    opts: { stageMs: number; totalMs: number; qualityScore?: number; entityCount?: number } = { stageMs: 0, totalMs: 0 }
  ): StateSnapshot<T> {
    const snapshot: StateSnapshot<T> = {
      snapshotId: this.makeId(),
      candidateId,
      stage,
      data,
      timestamp: new Date().toISOString(),
      stageMs: opts.stageMs,
      totalMs: opts.totalMs,
      qualityScore: opts.qualityScore,
      entityCount: opts.entityCount,
    };

    if (!this.snapshots.has(candidateId)) {
      // Evict oldest candidate if at capacity
      if (this.snapshots.size >= this.MAX_CANDIDATES) {
        const oldestKey = this.snapshots.keys().next().value;
        if (oldestKey) this.snapshots.delete(oldestKey);
      }
      this.snapshots.set(candidateId, new Map());
    }
    this.snapshots.get(candidateId)!.set(stage, snapshot as StateSnapshot);
    return snapshot;
  }

  /**
   * Capture a failure snapshot — always preserved regardless of capacity.
   * Call this in catch blocks throughout the pipeline.
   */
  captureFailure(
    candidateId: string,
    failedAtStage: PipelineStage,
    error: Error | string,
    partialData: unknown,
    totalMsBeforeFailure: number
  ): FailureSnapshot {
    const completedStages = [...(this.snapshots.get(candidateId)?.values() ?? [])];
    const failure: FailureSnapshot = {
      snapshotId: this.makeId(),
      candidateId,
      failedAtStage,
      completedStages,
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      partialData,
      timestamp: new Date().toISOString(),
      totalMsBeforeFailure,
    };
    this.failures.set(candidateId, failure);
    return failure;
  }

  /** Get a specific stage snapshot for a candidate. */
  get<T = unknown>(candidateId: string, stage: PipelineStage): StateSnapshot<T> | null {
    return (this.snapshots.get(candidateId)?.get(stage) as StateSnapshot<T>) ?? null;
  }

  /** Get all completed stages for a candidate. */
  getAll(candidateId: string): StateSnapshot[] {
    return [...(this.snapshots.get(candidateId)?.values() ?? [])];
  }

  /** Get the most recently failed parse. */
  getFailure(candidateId: string): FailureSnapshot | null {
    return this.failures.get(candidateId) ?? null;
  }

  /** Get all recorded failures. */
  getAllFailures(): FailureSnapshot[] {
    return [...this.failures.values()];
  }

  /** Compare two snapshots of the same type at the same stage. */
  diff<T extends object>(
    snapshotA: StateSnapshot<T>,
    snapshotB: StateSnapshot<T>
  ): Partial<T> {
    const diff: Partial<T> = {};
    const keys = new Set([
      ...Object.keys(snapshotA.data as object),
      ...Object.keys(snapshotB.data as object),
    ]) as Set<keyof T>;

    for (const key of keys) {
      const a = (snapshotA.data as T)[key];
      const b = (snapshotB.data as T)[key];
      if (JSON.stringify(a) !== JSON.stringify(b)) {
        diff[key] = b;
      }
    }
    return diff;
  }

  /** Clear all snapshots for a candidate (e.g. after successful export). */
  clear(candidateId: string): void {
    this.snapshots.delete(candidateId);
    this.failures.delete(candidateId);
  }

  stats(): { trackedCandidates: number; totalFailures: number } {
    return {
      trackedCandidates: this.snapshots.size,
      totalFailures: this.failures.size,
    };
  }
}

/** Singleton snapshot store — shared across the entire pipeline. */
export const snapshotStore = new SnapshotStoreImpl();

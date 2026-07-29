import { ExecutionStep, ExecutionPlan, ConfidenceScore } from './contracts/index';

export interface OptimisedResult {
  steps: ExecutionStep[];
  estimatedCostMs: number;
  estimatedDurationMs: number;
}

export interface PlanOptimiser {
  /**
   * Deterministic, policy-aware optimisation.
   * May reorder steps for parallelism, lower cost, or higher trust.
   * Never introduces non-determinism — identical inputs produce identical outputs.
   */
  optimise(steps: ExecutionStep[], confidence: ConfidenceScore): Promise<OptimisedResult>;
}

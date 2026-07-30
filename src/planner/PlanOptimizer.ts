/**
 * CHATR Plan Optimizer
 * Analyzes DAG step dependencies to identify parallel execution branches and optimize duration.
 */

import { ExecutionPlan, PlanStep } from './ExecutionGraph';

export interface OptimizationReport {
  originalDurationMs: number;
  optimizedDurationMs: number;
  timeSavedMs: number;
  parallelBatchesCount: number;
  parallelBatches: PlanStep[][];
}

export class PlanOptimizer {
  /**
   * Analyze an ExecutionPlan and construct parallel execution batches
   */
  public static optimize(plan: ExecutionPlan): OptimizationReport {
    const originalDurationMs = plan.estimatedDurationMs;
    const completedStepIds = new Set<string>();
    const remainingSteps = [...plan.steps];
    const parallelBatches: PlanStep[][] = [];

    while (remainingSteps.length > 0) {
      // Find steps whose dependencies are all completed
      const executableBatch = remainingSteps.filter(step =>
        step.dependencies.every(depId => completedStepIds.has(depId))
      );

      if (executableBatch.length === 0) {
        // Cyclic or unresolvable dependency
        break;
      }

      parallelBatches.push(executableBatch);

      // Mark batch steps as completed and remove from remaining
      for (const step of executableBatch) {
        completedStepIds.add(step.id);
        const idx = remainingSteps.indexOf(step);
        if (idx !== -1) remainingSteps.splice(idx, 1);
      }
    }

    // Estimated duration with parallel execution batching
    const optimizedDurationMs = parallelBatches.length * 120;
    const timeSavedMs = Math.max(0, originalDurationMs - optimizedDurationMs);

    return {
      originalDurationMs,
      optimizedDurationMs,
      timeSavedMs,
      parallelBatchesCount: parallelBatches.length,
      parallelBatches,
    };
  }
}

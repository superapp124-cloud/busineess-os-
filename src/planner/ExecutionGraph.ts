/**
 * CHATR Execution Graph & Plan Definitions
 * Represents execution plans as Directed Acyclic Graphs (DAG) of executable steps with step dependencies.
 */

export interface PlanStep {
  id: string;
  name: string;
  capability: string; // e.g. 'document-search', 'ocr-parse', 'summarize', 'email-draft', 'task-create'
  inputs: Record<string, unknown>;
  dependencies: string[]; // IDs of preceding steps that must complete before this step runs
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: unknown;
}

export interface ExecutionPlan {
  id: string;
  goal: string;
  steps: PlanStep[];
  estimatedCost: number;
  estimatedDurationMs: number;
  confidence: number; // 0.0 to 1.0
  createdAt: string;
  status: 'draft' | 'executing' | 'completed' | 'failed';
}

export class ExecutionGraphCompiler {
  /**
   * Sort steps in topological order ensuring step dependencies run in sequence
   */
  public static compileDAG(steps: PlanStep[]): PlanStep[] {
    const sorted: PlanStep[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    const stepMap = new Map<string, PlanStep>(steps.map(s => [s.id, s]));

    function visit(stepId: string) {
      if (temp.has(stepId)) {
        throw new Error(`[ExecutionGraph] Cyclic dependency detected involving step: ${stepId}`);
      }
      if (!visited.has(stepId)) {
        temp.add(stepId);
        const step = stepMap.get(stepId);
        if (step) {
          for (const depId of step.dependencies) {
            visit(depId);
          }
        }
        temp.delete(stepId);
        visited.add(stepId);
        if (step) sorted.push(step);
      }
    }

    for (const step of steps) {
      if (!visited.has(step.id)) {
        visit(step.id);
      }
    }

    return sorted;
  }
}

import { ExecutionPlan, PlanEstimate, PlanExplanation, Intent, PlanningContext } from './contracts/index';

// ============================================================
// FROZEN PLANNER INTERFACE — v1.0
// Changes require a Major RFC.
// ============================================================
export interface Planner {
  /** Generates a fully validated ExecutionPlan. Never executes anything. */
  plan(context: PlanningContext): Promise<ExecutionPlan>;

  /** Validates an existing plan against current policy and RBAC. */
  validate(plan: ExecutionPlan): Promise<{ valid: boolean; errors: string[] }>;

  /** Returns a structured explanation of how a plan was formed. */
  explain(plan: ExecutionPlan): Promise<PlanExplanation>;

  /** Dry-run: estimates cost, duration, and feasibility without full planning. */
  estimate(intent: Intent): Promise<PlanEstimate>;
}

export * from './contracts/index';

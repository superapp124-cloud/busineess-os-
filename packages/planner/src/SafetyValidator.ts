import { ExecutionPlan, ConfidenceScore } from './contracts/index';

export interface SafetyValidationResult {
  safe: boolean;
  errors: string[];
  warnings: string[];
}

export interface SafetyValidator {
  /**
   * Gates the ExecutionPlan before it reaches the Kernel.
   * Checks:
   * ✓ All capabilities exist in the registry
   * ✓ Permissions valid (RBAC)
   * ✓ Policy engine satisfied
   * ✓ No circular loops in the execution graph
   * ✓ Resource limits respected
   * ✓ Confidence threshold met (else flags requiresHumanReview)
   * ✓ Plan is deterministic (same input → same output)
   * ✓ Steps are idempotent (safe to retry)
   */
  validate(plan: ExecutionPlan, confidenceThreshold: number): Promise<SafetyValidationResult>;
}

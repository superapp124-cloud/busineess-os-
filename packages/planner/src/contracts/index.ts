// ============================================================
// FROZEN AI CONTRACTS — v1.0
// These interfaces are stable. Internal implementations evolve.
// Changes require a Major RFC.
// ============================================================

export interface Intent {
  id: string;
  raw: string;
  structuredGoals?: string[];
  tenantId: string;
  userId: string;
  timestamp: string;
}

export interface ConfidenceScore {
  intent: number;     // How well was the intent understood?
  matching: number;   // How well do selected capabilities match?
  planning: number;   // How reliable is the execution order?
  overall: number;    // Aggregate. Used for policy thresholds.
}

export interface PlanExplanation {
  summary: string;
  selectedCapabilities: string[];
  rejectedCapabilities: string[];
  assumptions: string[];
  confidenceFactors: string[];
}

export interface ExecutionStep {
  capabilityId: string;
  actionId: string;
  dependsOn: string[];
  canRunInParallel: boolean;
  isIdempotent: boolean;
  isDeterministic: boolean;
}

export interface ExecutionPlan {
  intentId: string;
  steps: ExecutionStep[];
  confidence: ConfidenceScore;
  explanation: PlanExplanation;
  requiredApprovals: string[];
  estimatedCostMs: number;
  estimatedDurationMs: number;
  requiresHumanReview: boolean;
}

export interface PlanEstimate {
  estimatedCostMs: number;
  estimatedDurationMs: number;
  requiredCapabilities: string[];
  requiredPermissions: string[];
  feasible: boolean;
  reason?: string;
}

export interface PlanningContext {
  intent: Intent;
  memoryEntries: unknown[];
  semanticMatches: unknown[];
  capabilityMetadata: unknown[];
  organisationPolicy: unknown;
  userContext: unknown;
}

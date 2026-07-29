export type PolicyDecisionType = 'ALLOW' | 'DENY' | 'REQUIRES_APPROVAL';

export interface PolicyDecision {
  decision: PolicyDecisionType;
  reason?: string;
  ruleId?: string;
}

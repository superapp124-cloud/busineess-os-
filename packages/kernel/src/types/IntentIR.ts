export interface IntentConstraint {
  maxLatencyMs?: number;
  maxBudgetCost?: number;
  privacyLevel: 'STRICT_LOCAL' | 'ENTERPRISE_LAN' | 'PUBLIC_CLOUD';
  offlineRequired?: boolean;
}

export interface IntentIR<TPayload = unknown> {
  id: string;
  version: '1.0';
  type: string;
  goal: string;
  constraints: IntentConstraint;
  expectedOutcome: string;
  priority: number;
  confidence: number;
  payload: TPayload;
  metadata: {
    source: string;
    userId: string;
    tenantId: string;
    timestamp: string;
    traceId: string;
  };
}

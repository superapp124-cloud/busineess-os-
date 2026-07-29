export type PolicyCategory = 
  | 'Authorization'
  | 'Execution'
  | 'AIGovernance'
  | 'Compliance';

export type PolicyOutcomeDecision = 
  | 'Allow'
  | 'Deny'
  | 'RequireApproval'
  | 'RequireEscalation'
  | 'RequireAudit'
  | 'RequireHumanReview';

export interface IPolicyOutcome {
  decision: PolicyOutcomeDecision;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface IPolicyContext {
  userId: string;
  orgId: string;
  resourceId?: string;
  action: string;
  payload?: any;
}

export interface IPolicy {
  id: string;
  category: PolicyCategory;
  name: string;
  description: string;
  evaluate(context: IPolicyContext): Promise<IPolicyOutcome>;
}

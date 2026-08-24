/**
 * CHATR Financial Human-in-the-Loop Audit Trail (Phase 7)
 * Preserves immutable audit records for every high-risk financial approval and execution.
 */

export interface ImmutableAuditRecord {
  id: string;
  who: string;
  what: string;
  when: string;
  why: string;
  source_object_type: string;
  source_object_id: string;
  ai_recommendation: string;
  ai_confidence: number;
  policy_version: number;
  approver_id: string;
  approval_timestamp: string;
  final_action: string;
}

export class FinancialAuditTrail {
  /**
   * Constructs an immutable audit trail entry for a high-risk decision
   */
  public static createAuditRecord(params: {
    actorId: string;
    actionName: string;
    reason: string;
    objectType: string;
    objectId: string;
    aiRecommendation: string;
    aiConfidence: number;
    policyVersion: number;
    approverId: string;
    finalAction: string;
  }): ImmutableAuditRecord {
    return {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      who: params.actorId,
      what: params.actionName,
      when: new Date().toISOString(),
      why: params.reason,
      source_object_type: params.objectType,
      source_object_id: params.objectId,
      ai_recommendation: params.aiRecommendation,
      ai_confidence: params.aiConfidence,
      policy_version: params.policyVersion,
      approver_id: params.approverId,
      approval_timestamp: new Date().toISOString(),
      final_action: params.finalAction,
    };
  }
}

import { PolicyClass, TenantId, Provenance } from './types';

const AUTO_ACTIONS = ['analytics_clustering', 'opportunity_scoring', 'internal_link_recommendation', 'anomaly_detection', 'content_drafting', 'gsc_sync', 'demand_classification'];
const REVIEW_ACTIONS = ['page_publishing', 'page_deletion', 'social_posting', 'seo_config_change', 'experiment_deployment', 'email_campaign', 'redirect_creation', 'schema_change', 'sitemap_update'];
const FORBIDDEN_ACTIONS = ['fake_engagement', 'fake_account_creation', 'unauthorized_scraping', 'ranking_manipulation', 'fake_review_generation', 'fabricated_data_publishing', 'deceptive_redirect', 'spam_link_building', 'platform_circumvention'];

export interface PolicyDecision {
  policyClass: PolicyClass;
  reason: string;
  requiresApproval: boolean;
  approvalId?: string;
}

export class PolicyViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PolicyViolationError';
  }
}

/**
 * Policy Engine
 * Enforces action policies and guarantees "AI recommends, humans approve" for risky tasks
 */
export class PolicyEngine {
  
  private supabase: any; // Injected or initialized client
  
  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  /**
   * Evaluates if an action is allowed
   */
  async evaluate(action: string, context: any): Promise<PolicyDecision> {
    if (FORBIDDEN_ACTIONS.includes(action)) {
      const decision: PolicyDecision = {
        policyClass: 'FORBIDDEN',
        reason: `Action '${action}' is strictly forbidden by policy.`,
        requiresApproval: false
      };
      await this.logToAuditLog(decision, action, context.tenantId);
      throw new PolicyViolationError(decision.reason);
    }
    
    if (REVIEW_ACTIONS.includes(action)) {
      const decision: PolicyDecision = {
        policyClass: 'REVIEW',
        reason: `Action '${action}' requires human review.`,
        requiresApproval: true
      };
      return decision;
    }
    
    if (AUTO_ACTIONS.includes(action)) {
      return {
        policyClass: 'AUTO',
        reason: `Action '${action}' is safe for auto execution.`,
        requiresApproval: false
      };
    }
    
    // Default to REVIEW for unknown actions to be safe
    return {
      policyClass: 'REVIEW',
      reason: `Action '${action}' is unknown, defaulting to manual review.`,
      requiresApproval: true
    };
  }

  /**
   * Creates an approval request for a human
   */
  async createApprovalRequest(action: string, agentRecommendation: string, evidence: any, tenantId: TenantId): Promise<string> {
    const approvalId = `req_${Date.now()}`;
    
    // Write to Supabase table `udx_approval_requests`
    if (this.supabase) {
      await this.supabase.from('udx_approval_requests').insert({
        id: approvalId,
        tenant_id: tenantId,
        action,
        recommendation: agentRecommendation,
        evidence: JSON.stringify(evidence),
        status: 'PENDING',
        created_at: new Date().toISOString()
      });
    }
    
    return approvalId;
  }

  /**
   * Logs a decision to the immutable audit log
   */
  private async logToAuditLog(decision: PolicyDecision, action: string, tenantId: TenantId): Promise<void> {
    if (this.supabase) {
      await this.supabase.from('udx_audit_log').insert({
        tenant_id: tenantId,
        action: action,
        status: decision.policyClass === 'FORBIDDEN' ? 'VIOLATION' : 'SUCCESS',
        details: decision.reason,
        timestamp: new Date().toISOString()
      });
    }
  }
}

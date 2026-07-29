import { IPolicy, IPolicyContext, IPolicyOutcome, PolicyCategory } from './PolicyTypes';
import { PlatformRegistry } from '../registry/PlatformRegistry';

export class PolicyEngine {
  /**
   * Registers a policy into the unified PlatformRegistry.
   */
  static registerPolicy(policy: IPolicy): void {
    PlatformRegistry.register('Policy', policy.id, policy);
  }

  /**
   * Evaluates all policies for a given category.
   * If multiple policies run, the most restrictive outcome wins.
   * Hierarchy of restrictiveness: 
   * Deny > RequireEscalation > RequireHumanReview > RequireApproval > RequireAudit > Allow
   */
  static async evaluateCategory(category: PolicyCategory, context: IPolicyContext): Promise<IPolicyOutcome> {
    const policies = PlatformRegistry.getAll<IPolicy>('Policy').filter(p => p.category === category);
    
    if (policies.length === 0) {
      // Default allow if no policies registered for category
      return { decision: 'Allow', reason: 'No policies configured.' };
    }

    const outcomes = await Promise.all(policies.map(p => p.evaluate(context)));

    return this.resolveRestrictiveOutcome(outcomes);
  }

  /**
   * Evaluates a specific policy by ID.
   */
  static async evaluatePolicy(policyId: string, context: IPolicyContext): Promise<IPolicyOutcome> {
    const policy = PlatformRegistry.get<IPolicy>('Policy', policyId);
    if (!policy) {
      throw new Error(`[PolicyEngine] Policy ${policyId} not found.`);
    }
    return await policy.evaluate(context);
  }

  private static resolveRestrictiveOutcome(outcomes: IPolicyOutcome[]): IPolicyOutcome {
    // Restrictiveness mapping. Higher number = more restrictive
    const severity: Record<string, number> = {
      'Deny': 6,
      'RequireEscalation': 5,
      'RequireHumanReview': 4,
      'RequireApproval': 3,
      'RequireAudit': 2,
      'Allow': 1
    };

    let mostRestrictive = outcomes[0];

    for (const outcome of outcomes) {
      if (severity[outcome.decision] > severity[mostRestrictive.decision]) {
        mostRestrictive = outcome;
      }
    }

    return mostRestrictive;
  }
}

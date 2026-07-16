'use strict';

/**
 * CHATR Kernel - Policy Engine
 * Computes the effective policy stack.
 * System -> Enterprise -> Workspace -> User -> Request
 */

const { policyRegistry } = require('../registry/policy-registry.cjs');

class PolicyEngine {
  constructor() {
    this.name = 'PolicyEngine';
  }

  computeEffectivePolicy(requestPolicy = {}) {
    // We stack policies from lowest to highest priority
    const systemPolicy = policyRegistry.getPolicy('system');
    const enterprisePolicy = policyRegistry.getPolicy('enterprise') || {};
    const workspacePolicy = policyRegistry.getPolicy('workspace') || {};
    const userPolicy = policyRegistry.getPolicy('user') || {};

    const effective = {
      ...systemPolicy,
      ...enterprisePolicy,
      ...workspacePolicy,
      ...userPolicy,
      ...requestPolicy
    };

    return effective;
  }

  evaluateModel(modelProfile, effectivePolicy) {
    // Returns { allowed: boolean, reason: string }
    if (effectivePolicy.offlineOnly && !modelProfile.offline) {
      return { allowed: false, reason: 'Model requires network but effective policy is offlineOnly' };
    }
    
    if (!effectivePolicy.allowCloud && modelProfile.cloud) {
      return { allowed: false, reason: 'Cloud models are disabled by policy' };
    }
    
    // Budget checks
    if (effectivePolicy.budget === 'FREE_ONLY' && (modelProfile.costPer1MInput > 0 || modelProfile.costPer1MOutput > 0)) {
       return { allowed: false, reason: 'Budget is FREE_ONLY but model incurs cost' };
    }

    return { allowed: true, reason: 'Passed policy checks' };
  }

  evaluateAction(capabilityId, context = {}) {
    const { capabilityRegistry } = require('../capabilities/registry.cjs');
    try {
      const cap = capabilityRegistry.getCapability(capabilityId);
      const policyGroup      = cap ? cap.policyGroup : 'safe';
      const requiresApproval = cap ? cap.approval === 'always' : false;
      return {
        allowed: true,
        requiresApproval,
        policyGroup,
        reason: requiresApproval
          ? `Capability '${capabilityId}' is in policy group '${policyGroup}' and requires user approval`
          : 'Action permitted'
      };
    } catch {
      return { allowed: true, requiresApproval: false, policyGroup: 'safe', reason: 'Capability not in registry, defaulting to safe' };
    }
  }
}

const policyEngine = new PolicyEngine();
module.exports = { policyEngine, PolicyEngine };

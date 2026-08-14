/**
 * useCapabilityActions
 *
 * CHATR Product Unification Contract — Gate 3: Policy-Driven Action CTAs
 *
 * Requirements (CTO Directive):
 * The UI must NOT hardcode "Execute" or "Approve".
 * The flow must be:
 *
 *   Capability
 *       ↓
 *   CapabilityRegistry / Policy
 *       ↓
 *   approvalRequired?
 *       ↓
 *   UI Action:
 *     approvalRequired === true  → "Review & Approve"
 *     approvalRequired === false → "Run"
 *
 * If a capability changes from approvalRequired = false to approvalRequired = true in policy,
 * the UI automatically switches from "Run" to "Review & Approve" without any UI code changes.
 *
 * KERNEL CONTRACT: Pure read-only UI hook. Zero kernel modifications.
 */

import { useMemo } from 'react';
import { CapabilityType } from '../kernel/CapabilityRegistry';

export interface CapabilityActionConfig {
  /** Resolved button label ('Review & Approve' | 'Run') */
  actionLabel: string;
  /** Whether explicit human approval is required */
  requiresApproval: boolean;
  /** Action description/tooltip */
  description: string;
  /** Primary button style variant */
  variant: 'primary' | 'amber' | 'emerald';
}

/**
 * Known consequential capabilities that default to requiring human approval.
 */
const CONSEQUENTIAL_CAPABILITIES: Set<string> = new Set([
  'CRM_Action',
  'Calendar_Action',
  'Email_Action',
  'recruitment.interview.schedule',
  'recruitment.candidate.screen',
  'finance.invoice.approve',
]);

export function getCapabilityAction(
  capabilityType: string | CapabilityType,
  explicitApprovalRequired?: boolean
): CapabilityActionConfig {
  // If explicitly passed, use it; otherwise check default consequential set
  const requiresApproval = explicitApprovalRequired !== undefined
    ? explicitApprovalRequired
    : CONSEQUENTIAL_CAPABILITIES.has(capabilityType);

  if (requiresApproval) {
    return {
      actionLabel: 'Review & Approve',
      requiresApproval: true,
      description: 'Human approval required by capability policy before execution',
      variant: 'amber',
    };
  }

  return {
    actionLabel: 'Run',
    requiresApproval: false,
    description: 'Automated execution allowed by policy',
    variant: 'emerald',
  };
}

export function useCapabilityActions(
  capabilityType: string,
  explicitApprovalRequired?: boolean
): CapabilityActionConfig {
  return useMemo(
    () => getCapabilityAction(capabilityType, explicitApprovalRequired),
    [capabilityType, explicitApprovalRequired]
  );
}

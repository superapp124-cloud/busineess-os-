/**
 * CHATR SI OS — Permission Manager
 * src/ai/security/PermissionManager.ts
 *
 * Enforces the Action Security Barrier.
 * The model NEVER approves its own actions; PermissionManager enforces deterministic policy.
 */

import { ActionSecurityLevel, ActionProposal, PermissionCheckResult } from './types';

export class PermissionManager {
  private static instance: PermissionManager;
  private pendingConfirmations: Map<string, ActionProposal> = new Map();

  private constructor() {}

  public static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  /**
   * Determine security level for a given tool action
   */
  public evaluateToolRisk(toolName: string, _parameters: Record<string, unknown> = {}): ActionSecurityLevel {
    // LEVEL 3: Sensitive / Irreversible
    if (
      /sendmessage|sendsms|makecall|transfer|payment|upi|delete|bookappointment|sharehealth/i.test(toolName)
    ) {
      return 'LEVEL_3_SENSITIVE';
    }

    // LEVEL 2: Reversible mutations / Soft state changes
    if (
      /setreminder|setalarm|createdraft|toggle|savedraft|logvital|updatenote/i.test(toolName)
    ) {
      return 'LEVEL_2_REVERSIBLE';
    }

    // LEVEL 1: Safe read-only actions
    return 'LEVEL_1_SAFE_READ';
  }

  /**
   * Check permission before tool execution
   */
  public checkPermission(proposal: ActionProposal): PermissionCheckResult {
    const level = this.evaluateToolRisk(proposal.toolName, proposal.parameters);

    if (level === 'LEVEL_3_SENSITIVE') {
      this.pendingConfirmations.set(proposal.actionId, proposal);
      return {
        allowed: false,
        requiresUserConfirmation: true,
        securityLevel: level,
        reason: `Action '${proposal.toolName}' is sensitive/irreversible and requires explicit human confirmation.`,
      };
    }

    if (level === 'LEVEL_2_REVERSIBLE') {
      return {
        allowed: true,
        requiresUserConfirmation: false,
        securityLevel: level,
        reason: `Action '${proposal.toolName}' is reversible and will execute with an undo banner.`,
      };
    }

    return {
      allowed: true,
      requiresUserConfirmation: false,
      securityLevel: level,
      reason: `Action '${proposal.toolName}' is read-only and safe to execute automatically.`,
    };
  }

  /**
   * Called when user taps 'Confirm' in the native confirmation dialog
   */
  public confirmAction(actionId: string): ActionProposal | null {
    const proposal = this.pendingConfirmations.get(actionId);
    if (proposal) {
      this.pendingConfirmations.delete(actionId);
      return proposal;
    }
    return null;
  }

  /**
   * Called when user rejects or cancels the action
   */
  public rejectAction(actionId: string): void {
    this.pendingConfirmations.delete(actionId);
  }
}

export const permissionManager = PermissionManager.getInstance();

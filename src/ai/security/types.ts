/**
 * CHATR SI OS — Action Security Levels & Types
 * src/ai/security/types.ts
 */

export type ActionSecurityLevel = 
  | 'LEVEL_1_SAFE_READ'     // Query vitals, read calendar, view contacts (auto-execute)
  | 'LEVEL_2_REVERSIBLE'    // Set alarm, draft message, toggle settings (toast undo)
  | 'LEVEL_3_SENSITIVE';    // Send SMS, UPI transfer, delete data, book doctor (human confirm required)

export interface ActionProposal {
  actionId: string;
  toolName: string;
  securityLevel: ActionSecurityLevel;
  humanSummary: string;
  parameters: Record<string, unknown>;
  requiresBiometric: boolean;
  timestamp: number;
}

export interface PermissionCheckResult {
  allowed: boolean;
  requiresUserConfirmation: boolean;
  securityLevel: ActionSecurityLevel;
  reason: string;
}

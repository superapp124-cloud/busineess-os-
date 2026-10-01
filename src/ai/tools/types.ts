/**
 * CHATR SI OS — Tool System Types
 * src/ai/tools/types.ts
 */

import { ActionSecurityLevel } from '../security/types';

export type ToolExecutionPolicy = 'AUTO_EXECUTE' | 'CONFIRMATION_REQUIRED' | 'HEALTH_OS_GATEWAY';

export interface ToolDefinition {
  toolId: string;
  name: string;
  description: string;
  category: 
    | 'reminders'
    | 'calendar'
    | 'contacts'
    | 'calls'
    | 'messages'
    | 'navigation'
    | 'search'
    | 'documents'
    | 'health'
    | 'medications'
    | 'devices'
    | 'notifications'
    | 'wallet'
    | 'jobs'
    | 'career'
    | 'work'
    | 'travel';
  parametersSchema: Record<string, unknown>;
  requiredPermissions: string[];
  riskLevel: ActionSecurityLevel;
  executionPolicy: ToolExecutionPolicy;
  execute: (parameters: Record<string, unknown>, context?: Record<string, unknown>) => Promise<{
    success: boolean;
    data?: unknown;
    message?: string;
  }>;
}

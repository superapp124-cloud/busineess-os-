/**
 * CHATR SI OS — Smart Local Memory Types
 * src/ai/memory/types.ts
 */

import { PrivacyClassification } from '../privacy/types';

export type MemoryCategory = 
  | 'PROFILE'
  | 'PREFERENCES'
  | 'WORK'
  | 'FAMILY'
  | 'HEALTH'
  | 'TASKS'
  | 'ROUTINES'
  | 'DEVICES'
  | 'TRAVEL'
  | 'DOCUMENTS'
  | 'CONVERSATIONS';

export type MemoryConfidenceLevel = 
  | 'EXPLICIT'             // 100% confidence (User explicitly asked to remember)
  | 'REPEATED_PATTERN'     // 85% confidence (Observed across multiple sessions)
  | 'INFERRED_PREFERENCE'  // 60% confidence (Candidate pattern, requires confirmation)
  | 'TEMPORARY_CONTEXT';   // 20% confidence (Short-lived session scratchpad)

export interface MemoryRecord {
  id: string;
  category: MemoryCategory;
  content: string;
  source: 'USER_EXPLICIT' | 'AGENT_INFERENCE' | 'HEALTH_OS' | 'CALENDAR' | 'DEVICE';
  confidenceLevel: MemoryConfidenceLevel;
  confidence: number;      // 0.20 to 1.00
  evidenceCount: number;   // Number of observations supporting this memory
  explicit: boolean;       // True if user directly commanded
  inferred: boolean;       // True if deduced by agent
  explanation: string;     // Transparent reason: "You explicitly asked me to remember this."
  importance: number;      // 1 - 5 (5 highest)
  createdAt: number;
  updatedAt: number;
  lastConfirmed?: number;  // Timestamp of user confirmation
  expiresAt?: number;
  privacyClass: PrivacyClassification;
  isDeviceOnly: boolean;   // Never syncs to cloud backup
  tags?: string[];
}

export interface MemoryQueryOptions {
  category?: MemoryCategory;
  categories?: MemoryCategory[];
  minImportance?: number;
  minConfidence?: number;
  limit?: number;
  includeExpired?: boolean;
}

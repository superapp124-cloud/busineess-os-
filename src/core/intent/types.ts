/**
 * CHATR Intent Observer — Types
 * Genesis v0.2 — Codename: Observer
 */

export type IntentType = 'MEETING' | 'REMINDER' | 'CONTACT' | 'TASK';

export interface UnderstandingProvenance {
  source: 'regex' | 'knowledge' | 'time' | 'llm' | 'user';
  verified: boolean;
  resolver: string;
  timestamp: string;
}

export interface UnderstandingEntity {
  value: string;
  provenance: UnderstandingProvenance;
}

export interface Understanding {
  id: string;
  type: IntentType;
  confidence: {
    observation: number;
    meaning: number;
    execution: number;
  };
  entities: {
    people: UnderstandingEntity[];
    dates: UnderstandingEntity[];
    locations: UnderstandingEntity[];
    organizations: UnderstandingEntity[];
  };
  temporalState: 'now' | 'today' | 'tomorrow' | 'next_week' | 'unknown';
  source: 'regex' | 'knowledge' | 'semantic' | 'llm';
  enrichments: any[];
  readyForSuggestion: boolean;
}

export interface IntentChip {
  type: IntentType;
  label: string; // The base label (e.g. Create Meeting)
  emoji: string;
  confidence: number;
  enrichedText?: string; // e.g. "Tomorrow • John"
  isEnriching?: boolean; // Show loading dots if waiting for semantic engine
}

export const INTENT_CHIP_CONFIG: Record<IntentType, { label: string; emoji: string; color: string; bg: string }> = {
  MEETING:  { label: 'Create Meeting',  emoji: '📅', color: '#3B82F6', bg: '#EFF6FF' },
  REMINDER: { label: 'Set Reminder',    emoji: '🔔', color: '#8B5CF6', bg: '#F5F3FF' },
  CONTACT:  { label: 'Save Contact',    emoji: '👤', color: '#10B981', bg: '#ECFDF5' },
  TASK:     { label: 'Create Task',     emoji: '✅', color: '#F59E0B', bg: '#FFFBEB' },
};

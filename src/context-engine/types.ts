// ─────────────────────────────────────────────────────────────────────────────
// CHATR Intelligence Platform v1.0
// Core Types — The permanent contract for the entire platform.
// ─────────────────────────────────────────────────────────────────────────────

// ---------------------------------------------------------------------------
// Signals — emitted by every UI module; never contain business logic
// ---------------------------------------------------------------------------
export type SignalType =
  // Workspace
  | 'document.opened'
  | 'document.compared'
  // Messaging
  | 'chat.message.received'
  | 'chat.context.updated'
  // Calendar
  | 'calendar.meeting.upcoming'
  | 'calendar.meeting.ended'
  // CRM
  | 'crm.opportunity.created'
  | 'crm.deal.stalled'
  // Finance
  | 'finance.invoice.uploaded'
  | 'finance.payment.overdue'
  // Healthcare
  | 'health.record.opened'
  | 'health.critical.detected';

export interface Signal {
  type: SignalType;
  sourceModule: string;       // e.g. 'workspace', 'chat', 'calendar'
  payload: Record<string, unknown>;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Context Sources — what each module tells the engine about itself
// ---------------------------------------------------------------------------
export interface ContextSource {
  module: string;
  signals: Signal[];
  /** Raw text snippets the source wants the engine to reason over */
  textChunks?: string[];
}

// ---------------------------------------------------------------------------
// Shared output types
// ---------------------------------------------------------------------------
export type DomainId =
  | 'legal'
  | 'talent'
  | 'sales'
  | 'finance'
  | 'communication'
  | 'clinical'
  | 'procurement'
  | 'general';

export interface Entity {
  label: string;
  value: string;
  type: 'person' | 'organization' | 'date' | 'monetary' | 'keyword' | 'location';
  confidence: number;
}

export interface ContextAction {
  id: string;
  label: string;
  description?: string;
  domain: DomainId;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
}

export interface ContextInsight {
  id: string;
  text: string;
  domain: DomainId;
  severity?: 'info' | 'warning' | 'critical';
}

export interface ContextRecommendation {
  id: string;
  title: string;
  detail: string;
  domain: DomainId;
}

// ---------------------------------------------------------------------------
// Context State — the single source of truth published by the engine
// ---------------------------------------------------------------------------
export interface ContextState {
  /** Short human-readable summary of what the user is doing */
  summary: string;
  /** Active domain intelligences, ordered by confidence */
  domains: DomainId[];
  /** All extracted entities from all sources */
  entities: Entity[];
  /** Key insights surfaced by domain plugins */
  insights: ContextInsight[];
  /** Recommended next-best actions */
  actions: ContextAction[];
  /** Longer-form recommendations */
  recommendations: ContextRecommendation[];
  /** Is the engine still processing? */
  isProcessing: boolean;
  /** When was this state last updated */
  updatedAt: number;
}

export const EMPTY_CONTEXT: ContextState = {
  summary: '',
  domains: [],
  entities: [],
  insights: [],
  actions: [],
  recommendations: [],
  isProcessing: false,
  updatedAt: 0,
};

// ---------------------------------------------------------------------------
// Intelligence Plugin interface — every Domain Intelligence implements this
// ---------------------------------------------------------------------------
export interface IntelligencePlugin {
  /** Unique domain identifier */
  id: DomainId;
  /** Return 0–1 confidence that this domain is relevant to the given sources */
  canHandle(sources: ContextSource[]): number;
  /** Produce domain-specific contributions to the global ContextState */
  analyze(sources: ContextSource[]): Partial<Omit<ContextState, 'isProcessing' | 'updatedAt'>>;
}

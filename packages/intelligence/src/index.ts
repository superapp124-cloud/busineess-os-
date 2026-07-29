// ============================================================
// @chatr/intelligence — AI Services
// 
// EXPLICIT PROHIBITIONS:
// This package must NEVER import from or know about:
//   @chatr/planner, @chatr/intent-store, @chatr/deployment,
//   @chatr/control-plane, ExecutionPlan
//
// It provides intelligence services consumed via injected interfaces.
// ============================================================

export interface MemoryEntry {
  id: string;
  content: string;
  embedding?: number[];
  scope: string;
  timestamp: string;
}

export type MemoryScope = 'session' | 'user' | 'tenant' | 'global';

export interface MemoryService {
  store(entry: Omit<MemoryEntry, 'id'>): Promise<MemoryEntry>;
  recall(query: string, scope: MemoryScope, limit?: number): Promise<MemoryEntry[]>;
  forget(id: string): Promise<void>;
}

// --- Reasoning Provider ---

export interface Goal { id: string; description: string; priority: number; }

export interface ReasoningProvider {
  /** Analyse intent — may return ambiguous=true if clarification is needed */
  analyse(input: string, context: unknown): Promise<{ interpretation: string; ambiguous: boolean; alternatives?: string[] }>;
  decompose(intent: string, context: unknown): Promise<Goal[]>;
  summarise(data: unknown): Promise<string>;
}

export interface ReasoningRouter {
  /**
   * Policy decides which provider handles a request.
   * The Planner never selects a provider directly.
   */
  route(tenantId: string, intentType?: string): Promise<ReasoningProvider>;
}

// --- Semantic Search ---

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  namespace: string;
}

export interface SemanticSearchService {
  findSimilar(query: string, namespace: string, limit?: number): Promise<SearchResult[]>;
  index(id: string, content: string, namespace: string): Promise<void>;
}

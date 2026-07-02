export type QueryIntent =
  | "shopping"
  | "comparison"
  | "research"
  | "news"
  | "coding"
  | "bharat"
  | "general";

export interface IntentResult {
  intent: QueryIntent;
  expandedQueries: string[];
  commerceIntentScore: number;
}

export interface RawSource {
  title: string;
  url: string;
  snippet: string;
}

export interface RankedSource extends RawSource {
  trustScore: number;
  relevanceScore: number;
  freshnessScore: number;
  contentDepthScore: number;
  compositeScore: number;
  isTrusted: boolean;
}

export interface RetrievalLog {
  query: string;
  expandedQueries: string[];
  selectedSources: string[];
  rejectedSources: string[];
  scores: Record<string, number>;
  providerUsed: string;
  latencyMs: number;
  synthesisLatencyMs?: number;
}

// Injected — keeps the provider behind an interface, not embedded in the planner
export interface Goal { id: string; description: string; priority: number; }

export interface ReasoningProvider {
  analyse(input: string, context: unknown): Promise<{ interpretation: string; ambiguous: boolean; alternatives?: string[] }>;
  decompose(intent: string, context: unknown): Promise<Goal[]>;
  summarise(data: unknown): Promise<string>;
}

export interface GoalDecomposer {
  decompose(raw: string, context: unknown, provider: ReasoningProvider): Promise<Goal[]>;
}

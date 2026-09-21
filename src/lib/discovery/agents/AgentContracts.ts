export interface UDXOpportunity {
  id: string;
  type: string;
  priority: number;
  data: any;
}

export interface DemandEntity {
  id: string;
  name: string;
  type: string;
  data: any;
}

export interface SearchMemoryEntry {
  id: string;
  pattern: string;
  insight: string;
  confidence: number;
  timestamp: string;
}

export interface AgentInput {
  tenantId: string;
  loopRunId: string;
  opportunities: UDXOpportunity[];
  demandEntities: DemandEntity[];
  searchMemory: SearchMemoryEntry[];
  timestamp: string;
}

export interface AgentOutput {
  agentId: string;
  agentName: string;
  decisionId: string; // stable UUID
  loopRunId: string;
  recommendations: AgentRecommendation[];
  processingTimeMs: number;
  modelUsed: string; // 'ollama:llama3:8b' or 'google:gemini-2.5-flash'
  confidenceOverall: number;
  reasoning: string; // brief chain of reasoning
  timestamp: string;
}

export interface AgentRecommendation {
  recommendationId: string;
  opportunityId: string;
  action: string;
  actionType: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  expectedOutcome: string;
  evidenceSummary: string;
  confidence: number;
  estimatedImpact: {
    trafficLift?: number; // percentage
    conversionLift?: number;
    revenueImpactINR?: number;
  };
  requiresExperiment: boolean;
  experimentHypothesis?: string;
}

export interface UDXAgent {
  agentId: string;
  agentName: string;
  specialization: string;
  analyze(input: AgentInput): Promise<AgentOutput>;
  healthCheck(): Promise<{ healthy: boolean; reason?: string }>;
}

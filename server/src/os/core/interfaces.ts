export interface MissionGoal {
  domain: string; // e.g. "Shopping"
  constraints: Record<string, any>; // e.g. { budget: 8000, deadline: "today" }
  items: any[]; 
  optimizationStrategy: string; // e.g. "Lowest total cost"
}

export interface IntentCompiler {
  compile(naturalLanguage: string): Promise<MissionGoal>;
}

export interface CapabilityProvider {
  id: string;
  name: string;
  capabilities: string[];
  transport: 'API' | 'MCP' | 'Browser' | 'Enterprise';
  
  // Return cost or estimate based on Goal
  estimate(goal: MissionGoal): Promise<ProviderEvidence>;
  
  // Perform the action, pausing before final commit if requiresApproval is true
  execute(plan: ExecutionPlan, requiresApproval: boolean): Promise<ExecutionOutcome>;
}

export interface ProviderEvidence {
  providerId: string;
  itemsAvailable: any[];
  totalCost: number;
  deliveryTimeMs: number;
  confidenceScore: number;
  rawData: any;
}

export interface OptimizationEngine {
  optimize(evidenceList: ProviderEvidence[], strategy: string): Promise<ExecutionPlan>;
}

export interface ExecutionPlan {
  strategyUsed: string;
  allocations: {
    providerId: string;
    items: any[];
    allocatedCost: number;
  }[];
  totalEstimatedCost: number;
  rationale: string;
}

export interface ExecutionOutcome {
  success: boolean;
  state: 'WAITING_APPROVAL' | 'COMPLETED' | 'FAILED';
  receiptUrl?: string;
  message?: string;
}

export interface MissionOrchestrator {
  startMission(query: string): Promise<void>;
}

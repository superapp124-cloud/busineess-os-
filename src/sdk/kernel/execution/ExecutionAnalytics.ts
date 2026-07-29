/**
 * ExecutionAnalytics types
 * 
 * Divides platform telemetry into three distinct audiences:
 * 1. Runtime Metrics (Infrastructure / Engine Health)
 * 2. AI Metrics (Planner Costs / Accuracy)
 * 3. Business Metrics (Workflow Outcomes / Approval Delays)
 */

export interface IRuntimeMetrics {
  queueDepth: number;
  retryCount: number;
  averageLatencyMs: number;
  throughputPerMinute: number;
  failureRate: number;
  compensationCount: number;
}

export interface IAIMetrics {
  totalTokensConsumed: number;
  totalCostUSD: number;
  reasoningLatencyMs: number;
  plannerAccuracyRate: number; // % of generated IEMs that execute without schema errors
  invalidIEMGenerated: number;
}

export interface IBusinessMetrics {
  workflowsCompleted: number;
  workflowsAbandoned: number;
  averageApprovalDelayMs: number;
  automationRate: number; // % of nodes completing without human intervention
}

export class ExecutionAnalytics {
  // In-memory mock storage for analytics
  private static runtime: IRuntimeMetrics = {
    queueDepth: 0,
    retryCount: 0,
    averageLatencyMs: 0,
    throughputPerMinute: 0,
    failureRate: 0,
    compensationCount: 0,
  };

  private static ai: IAIMetrics = {
    totalTokensConsumed: 0,
    totalCostUSD: 0,
    reasoningLatencyMs: 0,
    plannerAccuracyRate: 100,
    invalidIEMGenerated: 0,
  };

  private static business: IBusinessMetrics = {
    workflowsCompleted: 0,
    workflowsAbandoned: 0,
    averageApprovalDelayMs: 0,
    automationRate: 100,
  };

  /**
   * Track a runtime event (e.g., node completed, node failed, retry triggered)
   */
  static recordRuntimeEvent(type: 'success' | 'failure' | 'retry' | 'compensation', latencyMs: number) {
    if (type === 'failure') this.runtime.failureRate += 1;
    if (type === 'retry') this.runtime.retryCount += 1;
    if (type === 'compensation') this.runtime.compensationCount += 1;
    
    // Simple rolling average
    this.runtime.averageLatencyMs = (this.runtime.averageLatencyMs + latencyMs) / 2;
  }

  /**
   * Track AI consumption (e.g., planner generated a graph)
   */
  static recordAIUsage(tokens: number, cost: number, latencyMs: number, validIEM: boolean) {
    this.ai.totalTokensConsumed += tokens;
    this.ai.totalCostUSD += cost;
    this.ai.reasoningLatencyMs = (this.ai.reasoningLatencyMs + latencyMs) / 2;
    
    if (!validIEM) {
      this.ai.invalidIEMGenerated += 1;
      // Rough accuracy recalculation
      const totalRequests = this.ai.totalTokensConsumed / 1000; // heuristic
      this.ai.plannerAccuracyRate = ((totalRequests - this.ai.invalidIEMGenerated) / totalRequests) * 100;
    }
  }

  /**
   * Track business outcomes (e.g., workflow completed, human approved)
   */
  static recordBusinessOutcome(type: 'completed' | 'abandoned', approvalDelayMs: number = 0) {
    if (type === 'completed') this.business.workflowsCompleted += 1;
    if (type === 'abandoned') this.business.workflowsAbandoned += 1;
    
    if (approvalDelayMs > 0) {
      this.business.averageApprovalDelayMs = (this.business.averageApprovalDelayMs + approvalDelayMs) / 2;
      // Decrement automation rate slightly if human approval was required
      this.business.automationRate = Math.max(0, this.business.automationRate - 1);
    }
  }

  static getMetrics() {
    return {
      runtime: { ...this.runtime },
      ai: { ...this.ai },
      business: { ...this.business },
    };
  }
}

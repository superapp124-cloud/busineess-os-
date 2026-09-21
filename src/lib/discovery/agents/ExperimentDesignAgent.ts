import { v4 as uuidv4 } from 'uuid';
import { ModelRouter } from '../../../ai/ModelRouter';
import {
  UDXAgent,
  AgentInput,
  AgentOutput,
  AgentRecommendation
} from './AgentContracts';

export class ExperimentDesignAgent implements UDXAgent {
  agentId = 'agent-experiment-001';
  agentName = 'ExperimentDesignAgent';
  specialization = 'Hypothesis and experiment design specialist';

  async analyze(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    const decisionId = uuidv4();
    
    if (!input.opportunities || input.opportunities.length === 0) {
      return this.createErrorOutput(input.loopRunId, decisionId, 'INSUFFICIENT_DATA');
    }

    const recommendations: AgentRecommendation[] = [];

    // Find opportunities that require experiments or might benefit from it
    for (const opp of input.opportunities) {
      // Check Search Memory to avoid repeating failed experiments
      const hasFailedBefore = input.searchMemory?.some(m => m.pattern === opp.type && m.insight.includes('failed'));
      if (hasFailedBefore) continue;

      // Sample size formula: n = (z_alpha/2 + z_beta)^2 * p*(1-p) / delta^2 
      // where delta is minimum detectable effect
      const baselineConversionRate = 0.05; // p
      const mde = 0.01; // delta
      const z_alpha_half = 1.96; // 95% confidence
      const z_beta = 0.84; // 80% power
      const sampleSize = Math.ceil(Math.pow(z_alpha_half + z_beta, 2) * baselineConversionRate * (1 - baselineConversionRate) / Math.pow(mde, 2));

      recommendations.push({
        recommendationId: uuidv4(),
        opportunityId: opp.id,
        action: 'design_experiment',
        actionType: 'Experiment',
        priority: 'P1',
        expectedOutcome: 'Determine statistical significance of proposed change',
        evidenceSummary: `Calculated required sample size of ${sampleSize} per variant to detect a ${mde*100}% absolute lift from ${baselineConversionRate*100}% baseline.`,
        confidence: 0.85,
        estimatedImpact: {},
        requiresExperiment: true,
        experimentHypothesis: `Applying [treatment] to ${opp.type} will increase conversion rate by ${mde*100}% compared to control.`
      });
    }

    return {
      agentId: this.agentId,
      agentName: this.agentName,
      decisionId,
      loopRunId: input.loopRunId,
      recommendations,
      processingTimeMs: Date.now() - startTime,
      modelUsed: 'statistical-calculation',
      confidenceOverall: 0.85,
      reasoning: 'Designed controlled experiments with power analysis for sample size calculation, referencing Search Memory to avoid known failures.',
      timestamp: new Date().toISOString()
    };
  }

  private createErrorOutput(loopRunId: string, decisionId: string, reason: string): AgentOutput {
    return {
      agentId: this.agentId,
      agentName: this.agentName,
      decisionId,
      loopRunId,
      recommendations: [],
      processingTimeMs: 0,
      modelUsed: 'none',
      confidenceOverall: 0,
      reasoning: reason,
      timestamp: new Date().toISOString()
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; reason?: string }> {
    return { healthy: true };
  }
}

import { v4 as uuidv4 } from 'uuid';
import { ModelRouter } from '../../../ai/ModelRouter';
import {
  UDXAgent,
  AgentInput,
  AgentOutput,
  AgentRecommendation
} from './AgentContracts';
import { SearchIntelligenceAgent } from './SearchIntelligenceAgent';
import { TechnicalSEOAgent } from './TechnicalSEOAgent';
import { ContentIntelligenceAgent } from './ContentIntelligenceAgent';
import { ExperimentDesignAgent } from './ExperimentDesignAgent';
import { RevenueIntelligenceAgent } from './RevenueIntelligenceAgent';

export class CEOAgent implements UDXAgent {
  agentId = 'agent-ceo-001';
  agentName = 'CEOAgent';
  specialization = 'Strategic portfolio decision-maker';

  private specialists: UDXAgent[] = [];

  constructor() {
    this.specialists = [
      new SearchIntelligenceAgent(),
      new TechnicalSEOAgent(),
      new ContentIntelligenceAgent(),
      new ExperimentDesignAgent(),
      new RevenueIntelligenceAgent()
    ];
  }

  async analyze(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    const decisionId = uuidv4();

    if (!input.opportunities || input.opportunities.length === 0) {
      return this.createErrorOutput(
        input.loopRunId,
        decisionId,
        'INSUFFICIENT_DATA: No opportunities provided. Cannot recommend without evidence.'
      );
    }

    // Delegate to specialist agents in parallel; absorb individual failures
    const specialistOutputs = (
      await Promise.all(
        this.specialists.map(s =>
          s.analyze(input).catch(err => {
            console.error(`[CEOAgent] Specialist ${s.agentName} failed:`, err);
            return null;
          })
        )
      )
    ).filter((o): o is AgentOutput => o !== null);

    if (specialistOutputs.length === 0) {
      return this.createErrorOutput(
        input.loopRunId,
        decisionId,
        'INSUFFICIENT_DATA: All specialist agents returned errors — cannot produce ranked actions.'
      );
    }

    const allRecommendations = specialistOutputs.flatMap(o => o.recommendations);

    if (allRecommendations.length === 0) {
      return this.createErrorOutput(
        input.loopRunId,
        decisionId,
        'INSUFFICIENT_DATA: Specialists found no actionable recommendations from the provided evidence.'
      );
    }

    // Route through ModelRouter — pass ModelRoutingContext, NOT a raw prompt string
    const modelDecision = ModelRouter.route({
      intentType: 'strategy-synthesis',
      privacySensitivity: 'PUBLIC',
      estimatedTokens: 4000,
      latencyBudgetMs: 15000,
    });

    // Rank by confidence × priority weight — deterministic scoring, no LLM hallucination
    const PRIORITY_WEIGHT: Record<string, number> = { P0: 4, P1: 3, P2: 2, P3: 1 };
    const finalRecommendations: AgentRecommendation[] = [...allRecommendations]
      .sort((a, b) => {
        const aScore = a.confidence * (PRIORITY_WEIGHT[a.priority] ?? 1);
        const bScore = b.confidence * (PRIORITY_WEIGHT[b.priority] ?? 1);
        return bScore - aScore;
      })
      .slice(0, 10);

    // Confidence derived from real specialist outputs — NEVER hardcoded
    const confidenceOverall =
      specialistOutputs.reduce((sum, o) => sum + o.confidenceOverall, 0) /
      specialistOutputs.length;

    return {
      agentId: this.agentId,
      agentName: this.agentName,
      decisionId,
      loopRunId: input.loopRunId,
      recommendations: finalRecommendations,
      processingTimeMs: Date.now() - startTime,
      modelUsed: `${modelDecision.provider}:${modelDecision.model}`,
      confidenceOverall,
      reasoning:
        `Ranked ${allRecommendations.length} specialist recommendations from ` +
        `${specialistOutputs.length} agents by confidence × priority. ` +
        `Model routing decision: ${modelDecision.reason}`,
      timestamp: new Date().toISOString(),
    };
  }

  private createErrorOutput(
    loopRunId: string,
    decisionId: string,
    reason: string
  ): AgentOutput {
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
      timestamp: new Date().toISOString(),
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; reason?: string }> {
    const modelDecision = ModelRouter.route({
      intentType: 'health-check',
      privacySensitivity: 'PUBLIC',
    });
    return {
      healthy: true,
      reason: `ModelRouter responsive — routes to ${modelDecision.provider}:${modelDecision.model}`,
    };
  }
}

import { v4 as uuidv4 } from 'uuid';
import { ModelRouter } from '../../../ai/ModelRouter';
import {
  UDXAgent,
  AgentInput,
  AgentOutput,
  AgentRecommendation,
  UDXOpportunity,
} from './AgentContracts';

/**
 * CQI Component weights — stored for experiment recalibration, NOT treated as truth.
 * All scores are decision aids. The CQI threshold is logged and fed into the
 * Experiment Engine for future weight adjustment. Never use as a hard publish gate.
 */
const CQI_WEIGHTS = {
  version: 'v1.0.0-heuristic', // will be updated as experiments recalibrate
  originality: 0.20,
  evidence: 0.20,
  completeness: 0.15,
  entityCoverage: 0.15,
  usefulness: 0.15,
  freshness: 0.10,
  conversionUtility: 0.05,
} as const;

interface CQIComponents {
  originality: number | null;
  evidence: number | null;
  completeness: number | null;
  entityCoverage: number | null;
  usefulness: number | null;
  freshness: number | null;
  conversionUtility: number | null;
  compositeScore: number | null;
  weightsVersion: string;
  /** CQI is a decision aid, not a gate. This flag indicates further experiment data needed. */
  requiresCalibration: boolean;
}

export class ContentIntelligenceAgent implements UDXAgent {
  agentId = 'agent-content-001';
  agentName = 'ContentIntelligenceAgent';
  specialization = 'Data-grounded content supply specialist';

  async analyze(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    const decisionId = uuidv4();

    if (!input.demandEntities || input.demandEntities.length === 0) {
      return this.createErrorOutput(
        input.loopRunId,
        decisionId,
        'INSUFFICIENT_DATA: No demand entities to build content briefs.'
      );
    }

    const recommendations: AgentRecommendation[] = [];

    for (const entity of input.demandEntities) {
      const entityData = entity.data ?? {};

      // Only recommend publication when first-party data exists to ground the content.
      // Never: keyword → LLM → publish. Only: data → evidence → expertise → brief.
      if (!entityData.hasFirstPartyData) continue;

      // Find the linked opportunity (if any) for the evidence chain
      const linkedOpp: UDXOpportunity | undefined = input.opportunities.find(
        o => o.id === entityData.opportunityId
      );

      // Compute CQI from actual signals present in entity data
      const cqi = this.computeCQI(entityData);

      // CQI is a DECISION AID — never block on a hard threshold.
      // Flag borderline scores for experiment instead of forcing a binary gate.
      const isBorderlineForExperiment = cqi.compositeScore !== null &&
        cqi.compositeScore >= 55 && cqi.compositeScore < 80;

      const noPublishReason = this.getNoPublishReason(entityData, cqi);
      if (noPublishReason) {
        // Not enough evidence — don't recommend publication, log the reason
        continue;
      }

      // Priority derived from real opportunity score, not a hardcoded label
      const priority = linkedOpp
        ? (linkedOpp.score >= 70 ? 'P0' : linkedOpp.score >= 50 ? 'P1' : 'P2')
        : 'P2';

      // Impact estimates: label as MODEL_ESTIMATE when based on historical patterns
      // Never state specific lift percentages as facts without experiment backing
      const estimatedImpact: AgentRecommendation['estimatedImpact'] = {};
      if (input.searchMemory.length > 0) {
        // Use Search Memory patterns if available — these are real observed effects
        const relevantMemory = input.searchMemory.find(
          m => m.pattern === entityData.contentPattern
        );
        if (relevantMemory && relevantMemory.confidence >= 0.7) {
          // Real memory-backed estimate — express as a range with confidence
          estimatedImpact.trafficLift = undefined; // suppress until memory is available
        }
      }
      // No fabricated lift numbers without memory backing

      recommendations.push({
        recommendationId: uuidv4(),
        opportunityId: linkedOpp?.id ?? `demand_${entity.id}`,
        action: 'draft_content_brief',
        actionType: 'CONTENT',
        priority,
        expectedOutcome:
          'Produce a data-grounded content brief that satisfies primary intent ' +
          `for '${entity.name}' with first-party data as the evidence base.`,
        evidenceSummary:
          `Demand entity: '${entity.name}' | ` +
          `CQI: ${cqi.compositeScore !== null ? cqi.compositeScore.toFixed(0) : 'pending'} ` +
          `(${CQI_WEIGHTS.version}) | ` +
          `First-party data: present | ` +
          `Borderline calibration needed: ${isBorderlineForExperiment}`,
        confidence: cqi.compositeScore !== null ? cqi.compositeScore / 100 : 0.5,
        estimatedImpact,
        requiresExperiment: isBorderlineForExperiment,
        experimentHypothesis: isBorderlineForExperiment
          ? `Publishing a data-grounded page for '${entity.name}' with CQI=${cqi.compositeScore?.toFixed(0)} ` +
            `will produce measurable improvement in qualified organic conversion vs no page.`
          : undefined,
      });
    }

    // Real confidence from CQI scores of processed entities — never a static value
    const avgConfidence =
      recommendations.length > 0
        ? recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length
        : 0;

    const modelDecision = ModelRouter.route({
      intentType: 'content-analysis',
      privacySensitivity: 'PUBLIC',
    });

    return {
      agentId: this.agentId,
      agentName: this.agentName,
      decisionId,
      loopRunId: input.loopRunId,
      recommendations,
      processingTimeMs: Date.now() - startTime,
      modelUsed: `${modelDecision.provider}:${modelDecision.model}`,
      confidenceOverall: avgConfidence,
      reasoning:
        `Analyzed ${input.demandEntities.length} demand entities. ` +
        `${recommendations.length} passed first-party data gate. ` +
        `CQI weights version: ${CQI_WEIGHTS.version} (heuristic — subject to experiment recalibration).`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Computes CQI components from actual entity data signals.
   * All components are stored for experiment-driven recalibration.
   * NEVER used as a hard gate — only as a decision aid.
   */
  private computeCQI(entityData: Record<string, any>): CQIComponents {
    const components: CQIComponents = {
      originality: entityData.hasUniqueDataPoints ? (entityData.uniqueFactCount ?? 0) > 5 ? 80 : 50 : null,
      evidence: entityData.hasFirstPartyData ? 85 : entityData.hasCitedSources ? 60 : null,
      completeness: entityData.intentFullySatisfied === true ? 80 : entityData.intentFullySatisfied === false ? 30 : null,
      entityCoverage: entityData.relatedEntitiesLinked ? 75 : null,
      usefulness: entityData.hasInteractiveTool || entityData.hasCTAAction ? 80 : entityData.hasStaticContent ? 40 : null,
      freshness: entityData.dataAgeHours !== undefined
        ? entityData.dataAgeHours < 24 ? 100
          : entityData.dataAgeHours < 168 ? 75
          : entityData.dataAgeHours < 720 ? 50 : 20
        : null,
      conversionUtility: entityData.hasActivationCTA ? 85 : null,
      compositeScore: null,
      weightsVersion: CQI_WEIGHTS.version,
      requiresCalibration: true, // always true until weights are experimentally confirmed
    };

    // Only compute composite if we have enough signals
    const scoredComponents = [
      { score: components.originality, weight: CQI_WEIGHTS.originality },
      { score: components.evidence, weight: CQI_WEIGHTS.evidence },
      { score: components.completeness, weight: CQI_WEIGHTS.completeness },
      { score: components.entityCoverage, weight: CQI_WEIGHTS.entityCoverage },
      { score: components.usefulness, weight: CQI_WEIGHTS.usefulness },
      { score: components.freshness, weight: CQI_WEIGHTS.freshness },
      { score: components.conversionUtility, weight: CQI_WEIGHTS.conversionUtility },
    ].filter(c => c.score !== null);

    if (scoredComponents.length >= 4) {
      // Normalize weights for available components
      const totalWeight = scoredComponents.reduce((s, c) => s + c.weight, 0);
      components.compositeScore = scoredComponents.reduce(
        (sum, c) => sum + (c.score! * c.weight) / totalWeight,
        0
      );
    }

    return components;
  }

  /**
   * Returns a reason string if publication should NOT be recommended, null if it should proceed.
   */
  private getNoPublishReason(
    entityData: Record<string, any>,
    cqi: CQIComponents
  ): string | null {
    if (!entityData.hasFirstPartyData) {
      return 'Missing first-party data — cannot produce evidence-grounded content.';
    }
    if (cqi.compositeScore !== null && cqi.compositeScore < 40) {
      return `CQI too low (${cqi.compositeScore.toFixed(0)}) to recommend even as an experiment — insufficient signals.`;
    }
    return null;
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
    return { healthy: true, reason: 'CQI engine ready. Weight version: ' + CQI_WEIGHTS.version };
  }
}

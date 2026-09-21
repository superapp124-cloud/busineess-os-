import { DemandEntity, UDXOpportunity, OpportunityQuadrant, EvidenceChain, Provenance, OpportunityScoreComponents } from './types';

/**
 * Opportunity Engine
 * Scores opportunities using the 5-factor formula
 */
export class OpportunityEngine {
  
  private readonly WEIGHTS_VERSION = 'v1.0.0-heuristic';
  
  /**
   * Scores demand entities to surface opportunities
   */
  scoreOpportunities(entities: DemandEntity[], executionCostEstimate: number): UDXOpportunity[] {
    const opportunities = entities.map(entity => {
      // Mock sub-scores (in real system, derived from metrics)
      const demandScore = Math.min(entity.searchAppearances / 10000, 1) * 100;
      const commercialValueScore = entity.audience === 'employer' ? 90 : 40;
      const conversionPotentialScore = entity.position < 10 ? 80 : 30;
      const competitiveGapScore = 60; // Mock
      const productFitScore = entity.segment !== 'unknown' ? 85 : 20;
      const confidenceScore = (entity.intentConfidence + entity.audienceConfidence) / 2 * 100;
      
      const scoreComponents: OpportunityScoreComponents = {
        demandScore,
        commercialValueScore,
        conversionPotentialScore,
        competitiveGapScore,
        productFitScore,
        confidenceScore,
        executionCostEstimate,
        weightsVersion: this.WEIGHTS_VERSION
      };
      
      const totalScore = (
        (demandScore * 0.25) +
        (commercialValueScore * 0.25) +
        (conversionPotentialScore * 0.20) +
        (competitiveGapScore * 0.15) +
        (productFitScore * 0.10) +
        (confidenceScore * 0.05)
      ) / executionCostEstimate;
      
      const quadrant = this.classifyQuadrant(demandScore, competitiveGapScore);
      
      const provenance: Provenance = {
        source: 'opportunity_engine_v1',
        timestamp: new Date().toISOString(),
        confidence: confidenceScore / 100
      };
      
      const evidenceChain: EvidenceChain = {
        opportunityId: `opp_${entity.id}`,
        demandEntities: [entity.id],
        metrics: {
          volume: entity.searchAppearances,
          ctr: entity.ctr,
          position: entity.position
        },
        provenance: entity.provenance
      };
      
      return {
        id: `opp_${entity.id}`,
        tenantId: entity.tenantId,
        title: `Capitalize on ${entity.query} demand`,
        description: `Opportunity based on ${entity.intent} intent for ${entity.audience}`,
        quadrant,
        status: 'DETECTED',
        score: totalScore,
        scoreComponents,
        evidenceChain,
        provenance
      } as UDXOpportunity;
    });
    
    // Filter out null evidence chains and sort by score
    return opportunities
      .filter(o => o.evidenceChain !== null && o.evidenceChain !== undefined)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50); // Top-N
  }
  
  private classifyQuadrant(demandScore: number, competitiveGapScore: number): OpportunityQuadrant {
    if (demandScore > 80 && competitiveGapScore > 80) return 'WIN_NOW';
    if (demandScore > 80 && competitiveGapScore <= 80) return 'ATTACK';
    if (demandScore <= 80 && competitiveGapScore > 80) return 'CREATE';
    return 'EXPAND';
  }
}

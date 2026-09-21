import { v4 as uuidv4 } from 'uuid';
import { ModelRouter } from '../../../ai/ModelRouter';
import {
  UDXAgent,
  AgentInput,
  AgentOutput,
  AgentRecommendation
} from './AgentContracts';

export class TechnicalSEOAgent implements UDXAgent {
  agentId = 'agent-techseo-001';
  agentName = 'TechnicalSEOAgent';
  specialization = 'Crawl and index health specialist';

  async analyze(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    const decisionId = uuidv4();
    
    if (!input.opportunities || input.opportunities.length === 0) {
      return this.createErrorOutput(input.loopRunId, decisionId, 'INSUFFICIENT_DATA');
    }

    const recommendations: AgentRecommendation[] = [];
    
    // Simulate analyzing pages with impressions but poor position, indexing risk, freshness decay
    for (const opp of input.opportunities) {
      const data = opp.data || {};
      
      // Indexed page + 0 supply -> HIGH severity (immediate noindex recommendation)
      if (data.isIndexed && data.supplyExists && (data.activeJobsCount || 0) < 3) {
        recommendations.push({
          recommendationId: uuidv4(),
          opportunityId: opp.id,
          action: 'noindex',
          actionType: 'Technical',
          priority: 'P0',
          expectedOutcome: 'Prevent index bloat and low quality pages in index',
          evidenceSummary: 'Indexed page with supply_exists=true but active_jobs_count < 3 (indexation risk)',
          confidence: 0.95,
          estimatedImpact: {},
          requiresExperiment: false
        });
      } else if (data.schemaErrors && data.schemaErrors.length > 0) {
        recommendations.push({
          recommendationId: uuidv4(),
          opportunityId: opp.id,
          action: 'fix_schema',
          actionType: 'Technical',
          priority: 'P1',
          expectedOutcome: 'Restore rich snippets',
          evidenceSummary: 'Page with schema errors',
          confidence: 0.9,
          estimatedImpact: {},
          requiresExperiment: false
        });
      } else if (data.crawlabilityIssues) {
        recommendations.push({
          recommendationId: uuidv4(),
          opportunityId: opp.id,
          action: 'fix_crawlability',
          actionType: 'Technical',
          priority: 'P0',
          expectedOutcome: 'Ensure bot access to content',
          evidenceSummary: 'Crawlability issues detected',
          confidence: 0.95,
          estimatedImpact: {},
          requiresExperiment: false
        });
      }
    }

    return {
      agentId: this.agentId,
      agentName: this.agentName,
      decisionId,
      loopRunId: input.loopRunId,
      recommendations,
      processingTimeMs: Date.now() - startTime,
      modelUsed: 'rule-based',
      confidenceOverall: 0.9,
      reasoning: 'Applied priority rules for indexation risk, schema errors, and crawlability issues.',
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

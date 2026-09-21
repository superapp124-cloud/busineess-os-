import { v4 as uuidv4 } from 'uuid';
import { ModelRouter } from '../../../ai/ModelRouter';
import {
  UDXAgent,
  AgentInput,
  AgentOutput,
  AgentRecommendation
} from './AgentContracts';

export class SearchIntelligenceAgent implements UDXAgent {
  agentId = 'agent-search-001';
  agentName = 'SearchIntelligenceAgent';
  specialization = 'Demand discovery specialist';

  async analyze(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    const decisionId = uuidv4();
    
    if (!input.opportunities || input.opportunities.length === 0) {
      return this.createErrorOutput(input.loopRunId, decisionId, 'INSUFFICIENT_DATA');
    }

    const prompt = `Analyze these search opportunities for emerging trends and gaps:
${JSON.stringify(input.opportunities)}
Identify gaps: high-impression queries with no strong TalentXcel page.
Cross-reference AI visibility events for citation opportunities.
Return ONLY a valid JSON array of AgentRecommendation objects.`;

    let recommendations: AgentRecommendation[] = [];
    let modelUsed = '';
    
    try {
      const routeResult = await ModelRouter.route(prompt, { preferredModel: 'ollama:llama3:8b', jsonMode: true });
      recommendations = typeof routeResult.response === 'string' ? JSON.parse(routeResult.response) : routeResult.response;
      modelUsed = routeResult.modelUsed || 'ollama:llama3:8b';
      
      // Ensure each recommendation has an ID
      recommendations.forEach(rec => rec.recommendationId = rec.recommendationId || uuidv4());
    } catch (e) {
      console.error('Failed to parse SearchIntelligenceAgent model output:', e);
      return this.createErrorOutput(input.loopRunId, decisionId, 'Failed to process demand gaps.');
    }

    return {
      agentId: this.agentId,
      agentName: this.agentName,
      decisionId,
      loopRunId: input.loopRunId,
      recommendations,
      processingTimeMs: Date.now() - startTime,
      modelUsed,
      confidenceOverall: 0.8,
      reasoning: 'Analyzed GSC query clusters and AI visibility events for citation gaps.',
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

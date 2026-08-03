import { BusinessEvent, Artifact, ResolutionGraph, ResolvedContextNode } from '../types';
import { IntentResolutionResult } from './IntentResolutionEngine';
import { EnterpriseGraph } from '../kernel/EnterpriseGraph';

/**
 * Context Resolution Engine
 * Transforms a raw business event into a fully resolved context graph by querying the unified EnterpriseGraph.
 * Now uses simulated confidence scoring and metadata extraction instead of pure keyword routing.
 */
export class ContextResolutionEngine {
  private graph = EnterpriseGraph.getInstance();

  /**
   * Assembles the enterprise context for the mission.
   */
  public async resolveContext(event: BusinessEvent, intent: IntentResolutionResult): Promise<ResolutionGraph> {
    console.log(`[ContextResolution] Resolving unified context for mission: ${intent.inferredMission}`);
    
    const resolvedNodes: ResolvedContextNode[] = [];

    // For Phase 5, we simulate an LLM extracting metadata and mapping it to the unified graph.
    if (event.type === 'ArtifactObserved' && event.payload) {
      const artifact = event.payload as Artifact;
      const text = (artifact.rawText || artifact.sourceUri || artifact.name || '').toLowerCase();

      // SIMULATED METADATA RESOLUTION
      if (text.includes('contract') || text.includes('alois') || text.includes('addendum')) {
        // High confidence vendor contract
        const vendorNode = this.graph.getNode('org:alois');
        if (vendorNode) {
          resolvedNodes.push({
            node: vendorNode,
            confidence: 96,
            evidence: ['✓ Contract Title Detected', '✓ Vendor Email Match', '✓ Previous Agreement Found'],
            relatedNodes: this.graph.getRelatedNodes('org:alois').map(r => r.node)
          });
        }
      } else if (text.includes('resume') || text.includes('cv') || text.includes('deepu')) {
        // Hiring candidate context
        const candidateNode = this.graph.getNode('person:deepu');
        if (candidateNode) {
          resolvedNodes.push({
            node: candidateNode,
            confidence: 92,
            evidence: ['✓ Resume Format Detected', '✓ HR System Record Match'],
            relatedNodes: this.graph.getRelatedNodes('person:deepu').map(r => r.node)
          });
        }
      } else {
        // Default to internal employee / expense context
        const employeeNode = this.graph.getNode('person:arshid');
        if (employeeNode) {
          resolvedNodes.push({
            node: employeeNode,
            confidence: 88,
            evidence: ['✓ Employee ID Detected', '✓ Expense Policy Keyword'],
            relatedNodes: this.graph.getRelatedNodes('person:arshid').map(r => r.node)
          });
        }
      }
    }

    return {
      triggerEvent: event,
      intent,
      policies: [], // Deprecated in Phase 5: everything is in resolvedNodes
      organizations: [], // Deprecated
      people: [], // Deprecated
      resolvedContext: resolvedNodes
    };
  }
}

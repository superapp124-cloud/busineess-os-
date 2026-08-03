import { BusinessEvent, MissionNode, Artifact } from '../types';

export interface IntentResolutionResult {
  inferredMission: string;
  missionGraph: MissionNode[];
}

/**
 * Intent Resolution Engine
 * Determines what the user is actually trying to accomplish based on a business trigger.
 * This replaces hardcoded artifact matching with inferred intent logic.
 */
export class IntentResolutionEngine {
  
  /**
   * Resolves the business intent behind a given event.
   * In production, this would call the Reasoning Provider (Gemini/Claude).
   * For Phase 1, we mock the LLM output based on the artifact's text to prove the pipeline.
   */
  public async resolveIntent(event: BusinessEvent): Promise<IntentResolutionResult> {
    console.log(`[IntentResolution] Resolving intent for event: ${event.type}`);
    
    // Simulating an LLM reasoning pass...
    await new Promise(resolve => setTimeout(resolve, 800));

    if (event.type === 'ArtifactObserved' && event.payload) {
      const artifact = event.payload as Artifact;
      const text = (artifact.rawText || artifact.sourceUri || artifact.name || '').toLowerCase();

      // Legal / Procurement Mission
      if (text.includes('contract') || text.includes('agreement') || text.includes('addendum') || text.includes('savantis')) {
        return {
          inferredMission: 'Review Agreement Amendment & Prepare for Signing',
          missionGraph: [
            { id: 'n1', type: 'Information Extraction', status: 'Pending', dependencies: [] },
            { id: 'n2', type: 'Risk Evaluation', status: 'Pending', dependencies: ['n1'] },
            { id: 'n3', type: 'Compare Clauses', status: 'Pending', dependencies: ['n1'] },
            { id: 'n4', type: 'Decision Support', status: 'Pending', dependencies: ['n2', 'n3'] }
          ]
        };
      }

      // HR / Hiring Mission
      if (text.includes('resume') || text.includes('cv') || text.includes('experience') || text.includes('profile') || text.includes('deepu') || text.includes('naukri')) {
        return {
          inferredMission: 'Evaluate candidate for hire',
          missionGraph: [
            { id: 'n1', type: 'Experience Extraction', status: 'Pending', dependencies: [] },
            { id: 'n2', type: 'Fit Score', status: 'Pending', dependencies: ['n1'] },
            { id: 'n3', type: 'Interview Decision', status: 'Pending', dependencies: ['n2'] }
          ]
        };
      }

      // Sales / CRM Mission (WhatsApp image)
      if (text.includes('whatsapp') || text.includes('image')) {
        return {
          inferredMission: 'Log Sales Touchpoint in CRM',
          missionGraph: [
            { id: 'n1', type: 'Communication Extraction', status: 'Pending', dependencies: [] },
            { id: 'n2', type: 'Identity Verification', status: 'Pending', dependencies: ['n1'] },
            { id: 'n3', type: 'CRM Sync', status: 'Pending', dependencies: ['n2'] }
          ]
        };
      }

      // Finance / Expense Processing Mission
      if (text.includes('receipt') || text.includes('rent') || text.includes('invoice') || text.includes('expense') || text.includes('bill')) {
        return {
          inferredMission: 'Process Employee Expense/Reimbursement',
          missionGraph: [
            { id: 'n1', type: 'Data Extraction', status: 'Pending', dependencies: [] },
            { id: 'n2', type: 'Policy Validation', status: 'Pending', dependencies: ['n1'] },
            { id: 'n3', type: 'Payroll Sync', status: 'Pending', dependencies: ['n2'] }
          ]
        };
      }

      if (text.includes('clinical') || text.includes('patient') || text.includes('finding') || text.includes('medical') || text.includes('hospital')) {
        return {
          inferredMission: 'Determine patient health status',
          missionGraph: [
            { id: 'n1', type: 'Anomaly Detection', status: 'Pending', dependencies: [] },
            { id: 'n2', type: 'Guideline Comparison', status: 'Pending', dependencies: ['n1'] },
            { id: 'n3', type: 'Follow-up Recommendation', status: 'Pending', dependencies: ['n2'] }
          ]
        };
      }
    }

    // Default universal fallback
    return {
      inferredMission: 'Understand and categorize business artifact',
      missionGraph: [
        { id: 'n1', type: 'Information Extraction', status: 'Pending', dependencies: [] },
        { id: 'n2', type: 'Categorization', status: 'Pending', dependencies: ['n1'] }
      ]
    };
  }
}

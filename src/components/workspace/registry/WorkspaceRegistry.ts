// ─────────────────────────────────────────────────────────────────────────────
// WorkspaceRegistry — CHATR Intelligence Platform v1.1
//
// The registry no longer uses static extension/keyword matching.
// It reads the AI ClassificationResult stamped onto each WorkspaceItem
// (__classification__) and routes to the correct Domain Intelligence plugin
// based on domainIntelligence + confidence score.
// ─────────────────────────────────────────────────────────────────────────────
import { WorkspaceItem } from '../adapters/types';
import { BusinessWorkspace } from './types';
import { createCandidateReviewWorkspace } from './workspaces/CandidateReview';
import { createLegalReviewWorkspace } from './workspaces/LegalReview';
import { createCommunicationReviewWorkspace } from './workspaces/CommunicationReview';
import { createInsuranceWorkspace } from './workspaces/InsuranceWorkspace';
import { createClinicalWorkspace } from './workspaces/ClinicalWorkspace';
import { createGenericWorkspace } from './workspaces/GenericWorkspace';

export class WorkspaceRegistry {
  private static workspaceFactories = [
    createClinicalWorkspace,
    createInsuranceWorkspace,
    createCandidateReviewWorkspace,
    createLegalReviewWorkspace,
    createCommunicationReviewWorkspace,
    createGenericWorkspace,
  ];

  static matchWorkspace(item: WorkspaceItem): BusinessWorkspace {
    // Create candidate workspaces and ask each to self-score
    const candidates = this.workspaceFactories.map(factory => {
      const workspace = factory(item);
      const match = workspace.matcher(item);
      return { workspace, confidence: match.confidence };
    });

    // Sort by highest confidence — AI-classified domains float to top
    candidates.sort((a, b) => b.confidence - a.confidence);

    // The winner is whichever Domain Intelligence the AI says is most relevant
    const winner = candidates[0];

    // Minimum confidence bar: if nothing scored above 0.1, fall back to generic
    if (winner.confidence < 0.1) {
      return createGenericWorkspace(item);
    }

    return winner.workspace;
  }
}

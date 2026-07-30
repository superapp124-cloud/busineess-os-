import { WorkspaceItem } from '../adapters/types';
import { BusinessWorkspace } from './types';
import { createCandidateReviewWorkspace } from './workspaces/CandidateReview';
import { createLegalReviewWorkspace } from './workspaces/LegalReview';
import { createCommunicationReviewWorkspace } from './workspaces/CommunicationReview';
import { createGenericWorkspace } from './workspaces/GenericWorkspace';

export class WorkspaceRegistry {
  private static workspaceFactories = [
    createCandidateReviewWorkspace,
    createLegalReviewWorkspace,
    createCommunicationReviewWorkspace,
    createGenericWorkspace
  ];

  static matchWorkspace(item: WorkspaceItem): BusinessWorkspace {
    // Generate workspaces for this item to test confidence
    const candidates = this.workspaceFactories.map(factory => {
      const workspace = factory(item);
      const match = workspace.matcher(item);
      return { workspace, confidence: match.confidence };
    });

    // Sort by highest confidence
    candidates.sort((a, b) => b.confidence - a.confidence);

    // Return the winning workspace
    return candidates[0].workspace;
  }
}

import { InferencePlugin } from '../InferencePlugin';
import { InferenceContext, InferenceHypothesis, RelationshipHypothesis } from '../../../types';

export class RelationshipPlugin implements InferencePlugin {
  public id = 'plugin_relationship_discovery';
  public name = 'Relationship Discovery Plugin';
  public description = 'Discovers semantic edges between the triggering event and the Enterprise Graph.';

  public async execute(context: InferenceContext): Promise<InferenceHypothesis[]> {
    const hypotheses: InferenceHypothesis[] = [];
    const eventPayload = context.triggeringEvent.payload as any;

    // Invoice -> Vendor Link
    if (eventPayload.type === 'Invoice' && eventPayload.vendorName) {
      const vendorNode = context.retrievalResults.find(k => k.type === 'Organization' && k.name === eventPayload.vendorName);
      if (vendorNode) {
        hypotheses.push({
          id: `rel_hyp_${Date.now()}_inv`,
          type: 'RelationshipHypothesis',
          pluginId: this.id,
          rawConfidence: 96,
          confidence: 0,
          evidence: [`Vendor Name Match: ${eventPayload.vendorName}`],
          reasoningPath: 'Lexical match on Organization name.',
          alternativeMatches: [],
          policiesApplied: [],
          graphTraversal: [],
          sourceId: eventPayload.id,
          targetId: vendorNode.id,
          relationshipType: 'ISSUED_BY'
        });
      }
    }

    // Contract -> Party Link
    if (eventPayload.type === 'Contract' && eventPayload.party) {
      const partyNode = context.retrievalResults.find(k => k.type === 'Organization' && k.name === eventPayload.party);
      if (partyNode) {
        hypotheses.push({
          id: `rel_hyp_${Date.now()}_con`,
          type: 'RelationshipHypothesis',
          pluginId: this.id,
          rawConfidence: 98,
          confidence: 0,
          evidence: [`Party Name Match: ${eventPayload.party}`],
          reasoningPath: 'Lexical match on Organization name in contract context.',
          alternativeMatches: [],
          policiesApplied: [],
          graphTraversal: [],
          sourceId: eventPayload.id,
          targetId: partyNode.id,
          relationshipType: 'COUNTERSIGNED_BY'
        });
      }
    }

    // Resume -> Candidate Link
    if (eventPayload.type === 'Resume' && eventPayload.candidateName) {
      const personNode = context.retrievalResults.find(k => k.type === 'Person' && k.name === eventPayload.candidateName);
      if (personNode) {
        hypotheses.push({
          id: `rel_hyp_${Date.now()}_hr`,
          type: 'RelationshipHypothesis',
          pluginId: this.id,
          rawConfidence: 99,
          confidence: 0,
          evidence: [`Candidate Name Match: ${eventPayload.candidateName}`],
          reasoningPath: 'Lexical match on Person name in ATS.',
          alternativeMatches: [],
          policiesApplied: [],
          graphTraversal: [],
          sourceId: eventPayload.id,
          targetId: personNode.id,
          relationshipType: 'BELONGS_TO'
        });
      }
    }

    // PurchaseOrder -> Vendor Link
    if (eventPayload.type === 'PurchaseOrder' && eventPayload.vendor) {
      const vendorNode = context.retrievalResults.find(k => k.type === 'Organization' && k.name === eventPayload.vendor);
      if (vendorNode) {
        hypotheses.push({
          id: `rel_hyp_${Date.now()}_pro`,
          type: 'RelationshipHypothesis',
          pluginId: this.id,
          rawConfidence: 95,
          confidence: 0,
          evidence: [`Vendor Name Match: ${eventPayload.vendor}`],
          reasoningPath: 'Lexical match on Vendor name for PO.',
          alternativeMatches: [],
          policiesApplied: [],
          graphTraversal: [],
          sourceId: eventPayload.id,
          targetId: vendorNode.id,
          relationshipType: 'FULFILLED_BY'
        });
      }
    }

    // Generic Matcher for the 8 new massive domains
    if (eventPayload.entityName) {
      const node = context.retrievalResults.find(k => k.name === eventPayload.entityName);
      if (node) {
        hypotheses.push({
          id: `rel_hyp_${Date.now()}_mass_${eventPayload.type}`,
          type: 'RelationshipHypothesis',
          pluginId: this.id,
          rawConfidence: 90,
          confidence: 0,
          evidence: [`Generic Entity Name Match: ${eventPayload.entityName}`],
          reasoningPath: 'Lexical match on Entity name for generic domain.',
          alternativeMatches: [],
          policiesApplied: [],
          graphTraversal: [],
          sourceId: eventPayload.id,
          targetId: node.id,
          relationshipType: 'INVOLVES'
        });
      }
    }

    return hypotheses;
  }
}

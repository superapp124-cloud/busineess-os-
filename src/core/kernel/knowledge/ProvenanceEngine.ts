import { Provenance, KnowledgeObject } from '../../types';

export class ProvenanceEngine {
  
  /**
   * Explains how a specific piece of knowledge was derived.
   */
  public getProvenance(knowledge: KnowledgeObject): Provenance {
    return knowledge.provenance;
  }

  /**
   * Find all knowledge derived from a specific source artifact.
   */
  public findDerivedKnowledge(knowledgeBase: KnowledgeObject[], sourceArtifactId: string): KnowledgeObject[] {
    return knowledgeBase.filter(k => k.provenance.sourceArtifact === sourceArtifactId);
  }
}

import { QueryEngine } from '../query/QueryEngine';

export type EvidenceStage = 
  | 'SOURCE' 
  | 'VERIFIED' 
  | 'INFERRED' 
  | 'RECOMMENDED' 
  | 'APPROVED' 
  | 'EXECUTED' 
  | 'CONFIRMED';

export interface EvidenceItem {
  id: string;
  stage: EvidenceStage;
  description: string;
  sourceRef?: string;
  confidence?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface EvidencePackage {
  question: string;
  facts: string[];
  lineage: EvidenceItem[];
  timeline: any[];
  relationships: any[];
  supportingDocuments: any[];
  confidence: number;
}

/**
 * The Evidence Builder
 * 
 * This is where CHATR OS becomes genuinely AI-native.
 * Instead of an LLM deciding what context to retrieve, it consumes a curated
 * Evidence Package built deterministically from the Kernel with 7-Stage Evidence Lifecycle:
 * SOURCE -> VERIFIED -> INFERRED -> RECOMMENDED -> APPROVED -> EXECUTED -> CONFIRMED
 */
export class EvidenceBuilder {
  constructor(private queryEngine: QueryEngine) {}

  public createLineageItem(
    stage: EvidenceStage,
    description: string,
    sourceRef?: string,
    confidence: number = 1.0,
    metadata?: Record<string, any>
  ): EvidenceItem {
    return {
      id: `ev_lineage_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      stage,
      description,
      sourceRef,
      confidence,
      timestamp: new Date().toISOString(),
      metadata
    };
  }

  /**
   * Assembles an Evidence Package based on a target aggregate and a specific question.
   */
  async buildPackage(
    question: string,
    targetType: string, 
    targetId: string, 
    actorId: string
  ): Promise<EvidencePackage> {
    
    // 1. Fetch deterministic current state via Query Engine (Enforces Permissions)
    const currentState = await this.queryEngine.get({
      actorId,
      aggregateType: targetType,
      aggregateId: targetId
    });

    if (!currentState) {
      throw new Error(`Evidence cannot be built. Target ${targetType} ${targetId} not found or access denied.`);
    }

    // 2. Fetch Relationships
    const relationships = await this.queryEngine.getRelated({
      actorId,
      aggregateType: targetType,
      aggregateId: targetId
    });

    // 3. Assemble Lineage Chain
    const lineage: EvidenceItem[] = [];
    
    lineage.push(this.createLineageItem(
      'SOURCE',
      `Target record ${targetType}:${targetId} retrieved from data store`,
      `${targetType}_${targetId}`
    ));

    lineage.push(this.createLineageItem(
      'VERIFIED',
      `Verified status = ${currentState._lifecycleState || 'Active'}`,
      `${targetType}_${targetId}_state`
    ));

    // 4. Assemble Facts
    const facts: string[] = [];
    facts.push(`${targetType} status = ${currentState._lifecycleState || 'Active'}`);
    
    for (const [key, value] of Object.entries(currentState)) {
      if (!key.startsWith('_') && typeof value !== 'object') {
        facts.push(`${key} = ${value}`);
      }
    }

    lineage.push(this.createLineageItem(
      'INFERRED',
      `Extracted ${facts.length} empirical facts from aggregate state`,
      undefined,
      0.95
    ));

    // 5. Build Evidence Package
    return {
      question,
      facts,
      lineage,
      timeline: [],
      relationships: relationships.map(r => `${r.edge.predicate} -> ${r.targetState.__type}`),
      supportingDocuments: [],
      confidence: 1.0
    };
  }
}

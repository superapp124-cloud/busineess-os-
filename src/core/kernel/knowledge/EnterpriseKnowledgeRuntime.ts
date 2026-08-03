import { EnterpriseEvent, KnowledgeObject, MemoryScope, Provenance } from '../../types';
import { KnowledgeStore } from './KnowledgeStore';
import { MemoryManager } from './MemoryManager';
import { ProvenanceEngine } from './ProvenanceEngine';
import { RetrievalEngine, RetrievalOptions } from './RetrievalEngine';

/**
 * Enterprise Knowledge Runtime
 * The overarching subsystem for Knowledge Fabric.
 * Composes Storage, Memory, Retrieval, and Provenance into a unified API.
 */
export class EnterpriseKnowledgeRuntime {
  private static instance: EnterpriseKnowledgeRuntime;

  private store: KnowledgeStore;
  private memory: MemoryManager;
  private provenanceEngine: ProvenanceEngine;
  private retrievalEngine: RetrievalEngine;

  private constructor() {
    this.store = new KnowledgeStore();
    this.memory = new MemoryManager();
    this.provenanceEngine = new ProvenanceEngine();
    this.retrievalEngine = new RetrievalEngine(this.store, this.memory);
  }

  public static getInstance(): EnterpriseKnowledgeRuntime {
    if (!EnterpriseKnowledgeRuntime.instance) {
      EnterpriseKnowledgeRuntime.instance = new EnterpriseKnowledgeRuntime();
    }
    return EnterpriseKnowledgeRuntime.instance;
  }

  // ------------------------------------------------------------------
  // MUTATION API (Restricted to Projection Engine)
  // ------------------------------------------------------------------
  public applyMutation(event: EnterpriseEvent): void {
    const payload = event.payload as any;
    if (!payload) return;

    switch (event.type) {
      case 'KnowledgeCreated':
      case 'KnowledgeUpdated':
        if (payload.id && payload.type) {
          this.store.upsert(payload as KnowledgeObject);
        }
        break;
      case 'KnowledgeDeleted':
        if (payload.id) {
          this.store.delete(payload.id);
        }
        break;
    }
  }

  // ------------------------------------------------------------------
  // RETRIEVAL API (Hybrid)
  // ------------------------------------------------------------------
  public async retrieve(query: string, options?: RetrievalOptions): Promise<KnowledgeObject[]> {
    return this.retrievalEngine.retrieve(query, options);
  }

  public getKnowledge(id: string): Readonly<KnowledgeObject> | undefined {
    return this.store.get(id);
  }

  public getProvenance(knowledgeId: string): Provenance | undefined {
    const k = this.store.get(knowledgeId);
    return k ? this.provenanceEngine.getProvenance(k) : undefined;
  }

  public getMemory(scope: MemoryScope, identifier: string): KnowledgeObject[] {
    return this.memory.getMemory(scope, identifier);
  }

  public appendMemory(scope: MemoryScope, identifier: string, knowledge: KnowledgeObject): void {
    this.memory.appendMemory(scope, identifier, knowledge);
  }

  public findEvidence(knowledgeId: string): string[] {
    const p = this.getProvenance(knowledgeId);
    return p ? p.evidence : [];
  }

  public async findPolicies(domain: string): Promise<KnowledgeObject[]> {
    const results = await this.retrieve(domain);
    return results.filter(k => k.type === 'Policy');
  }

  public findRelatedKnowledge(knowledgeId: string): KnowledgeObject[] {
    const k = this.store.get(knowledgeId);
    if (!k || !k.relationships) return [];
    
    return k.relationships
      .map(id => this.store.get(id))
      .filter((v): v is KnowledgeObject => v !== undefined);
  }
}

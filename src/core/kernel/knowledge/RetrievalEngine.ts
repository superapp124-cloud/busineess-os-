import { KnowledgeObject, MemoryScope } from '../../types';
import { KnowledgeStore } from './KnowledgeStore';
import { MemoryManager } from './MemoryManager';
import { EnterpriseGraph } from '../EnterpriseGraph';

export interface RetrievalOptions {
  scope?: MemoryScope;
  scopeIdentifier?: string;
  limit?: number;
}

export class RetrievalEngine {
  private store: KnowledgeStore;
  private memory: MemoryManager;
  private graph: EnterpriseGraph;

  constructor(store: KnowledgeStore, memory: MemoryManager) {
    this.store = store;
    this.memory = memory;
    this.graph = EnterpriseGraph.getInstance();
  }

  /**
   * Hybrid retrieval pipeline: Memory -> Knowledge -> Graph -> Policy -> Ranking
   * 
   * Performance Budgets:
   * Lexical: <20ms
   * Hybrid: <150ms
   * Graph: <50ms
   * Combined: <250ms
   */
  public async retrieve(query: string, options: RetrievalOptions = {}): Promise<KnowledgeObject[]> {
    const results: KnowledgeObject[] = [];
    const q = query.toLowerCase();

    // 1. Memory Layer (Short-term scope)
    if (options.scope && options.scopeIdentifier) {
      const memContext = this.memory.getMemory(options.scope, options.scopeIdentifier);
      const memMatches = memContext.filter(k => k.name.toLowerCase().includes(q) || k.content.toLowerCase().includes(q));
      results.push(...memMatches);
    }

    // 2. Knowledge Store (Semantic/Lexical)
    // In production, this calls a SemanticIndex (Embeddings). Here we mock lexical.
    const allKnowledge = this.store.getAll();
    const knowledgeMatches = allKnowledge.filter(k => 
      !results.find(r => r.id === k.id) && // Deduplicate
      (k.name.toLowerCase().includes(q) || k.content.toLowerCase().includes(q))
    );
    results.push(...knowledgeMatches);

    // 3. Graph Layer (Entities/Relationships)
    const graphMatches = this.graph.search(query);
    // Convert Graph objects to pseudo-knowledge objects if needed, or link them
    
    // 4. Policy Filter (Skip for now, would filter based on access/tenant)

    // 5. Ranking (Mock)
    return results.sort((a, b) => b.confidence - a.confidence).slice(0, options.limit || 10);
  }
}

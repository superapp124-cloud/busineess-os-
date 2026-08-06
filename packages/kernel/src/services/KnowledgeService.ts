import { SystemService } from './ServiceFabric';

export interface KnowledgeService extends SystemService {
  querySimilarity(vector: number[], topK?: number): Promise<any[]>;
  indexDocument(docId: string, content: string, metadata?: Record<string, unknown>): Promise<void>;
}

export class DefaultKnowledgeServiceAdapter implements KnowledgeService {
  public readonly id = 'knowledge';
  public readonly version = '1.0.0';

  public async querySimilarity(vector: number[], topK = 5): Promise<any[]> {
    console.log(`[DefaultKnowledgeServiceAdapter] Vector search similarity lookup (topK=${topK})`);
    return [];
  }

  public async indexDocument(docId: string, content: string, metadata?: Record<string, unknown>): Promise<void> {
    console.log(`[DefaultKnowledgeServiceAdapter] Indexed document: ${docId}`);
  }

  public async health(): Promise<{ healthy: boolean }> {
    return { healthy: true };
  }
}

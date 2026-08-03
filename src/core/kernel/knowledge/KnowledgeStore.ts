import { KnowledgeObject } from '../../types';

export class KnowledgeStore {
  // In-memory store for prototype
  private knowledgeMap: Map<string, KnowledgeObject> = new Map();

  public upsert(knowledge: KnowledgeObject): void {
    this.knowledgeMap.set(knowledge.id, knowledge);
  }

  public delete(id: string): void {
    const k = this.knowledgeMap.get(id);
    if (k) {
      k.lifecycleState = 'Deleted';
    }
  }

  public get(id: string): Readonly<KnowledgeObject> | undefined {
    return this.knowledgeMap.get(id);
  }

  public getAll(): Readonly<KnowledgeObject>[] {
    return Array.from(this.knowledgeMap.values()).filter(k => k.lifecycleState !== 'Deleted');
  }
}

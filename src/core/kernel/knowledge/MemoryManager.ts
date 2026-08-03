import { MemoryScope, KnowledgeObject } from '../../types';

export class MemoryManager {
  private activeContexts: Map<string, KnowledgeObject[]> = new Map();

  /**
   * Retrieves context limited to a specific boundary.
   * A 'Mission' scope expires when the mission ends.
   */
  public getMemory(scope: MemoryScope, identifier: string): KnowledgeObject[] {
    const key = `${scope}:${identifier}`;
    return this.activeContexts.get(key) || [];
  }

  public appendMemory(scope: MemoryScope, identifier: string, knowledge: KnowledgeObject) {
    const key = `${scope}:${identifier}`;
    const mem = this.activeContexts.get(key) || [];
    mem.push(knowledge);
    this.activeContexts.set(key, mem);
  }

  public expireMemory(scope: MemoryScope, identifier: string) {
    const key = `${scope}:${identifier}`;
    this.activeContexts.delete(key);
  }
}

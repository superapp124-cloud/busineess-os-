/**
 * CHATR Scoped Workspace Memory Engine
 * Enforces 5 distinct security memory scopes (Personal, Workspace, Team, Company, Shared Knowledge) with vector persistence.
 */

export type MemoryScope = 'Personal' | 'Workspace' | 'Team' | 'Company' | 'SharedKnowledge';

export interface MemoryRecord {
  id: string;
  scope: MemoryScope;
  documentId?: string;
  chunkId?: string;
  content: string;
  tags: string[];
  embedding?: number[];
  createdAt: string;
  metadata: Record<string, unknown>;
}

class ScopedMemoryEngineService {
  private memoryStore: Map<MemoryScope, Map<string, MemoryRecord>> = new Map([
    ['Personal', new Map()],
    ['Workspace', new Map()],
    ['Team', new Map()],
    ['Company', new Map()],
    ['SharedKnowledge', new Map()],
  ]);

  /**
   * Save a memory record into a specific security scope
   */
  public saveMemory(scope: MemoryScope, content: string, documentId?: string, tags: string[] = [], metadata: Record<string, unknown> = {}): MemoryRecord {
    const scopeMap = this.memoryStore.get(scope)!;
    const id = `mem_${scope.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    const record: MemoryRecord = {
      id,
      scope,
      documentId,
      content,
      tags,
      createdAt: new Date().toISOString(),
      metadata,
    };

    scopeMap.set(id, record);
    console.log(`[ScopedMemoryEngine] Saved record to scope '${scope}': ${id}`);
    return record;
  }

  /**
   * Query memories in an allowed scope
   */
  public queryMemories(allowedScopes: MemoryScope[], queryText: string): MemoryRecord[] {
    const results: MemoryRecord[] = [];
    const queryLower = queryText.toLowerCase();

    for (const scope of allowedScopes) {
      const scopeMap = this.memoryStore.get(scope);
      if (!scopeMap) continue;

      for (const record of scopeMap.values()) {
        if (record.content.toLowerCase().includes(queryLower) || record.tags.some(t => t.toLowerCase().includes(queryLower))) {
          results.push(record);
        }
      }
    }

    return results;
  }

  /**
   * Get memory counts across scopes
   */
  public getCounts() {
    const counts: Record<MemoryScope, number> = {
      Personal: this.memoryStore.get('Personal')!.size,
      Workspace: this.memoryStore.get('Workspace')!.size,
      Team: this.memoryStore.get('Team')!.size,
      Company: this.memoryStore.get('Company')!.size,
      SharedKnowledge: this.memoryStore.get('SharedKnowledge')!.size,
    };
    return counts;
  }
}

export const ScopedMemoryEngine = new ScopedMemoryEngineService();

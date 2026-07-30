/**
 * CHATR Universal Search Service
 * Independent platform search service indexing Documents, Email, Calendar, Contacts, Tasks, Messages, and Web Clips.
 */

export type SearchDomain = 'Document' | 'Email' | 'Calendar' | 'Contact' | 'Task' | 'Message' | 'WebClip';

export interface UniversalSearchResult {
  id: string;
  domain: SearchDomain;
  title: string;
  snippet: string;
  score: number;
  urlOrPath: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface UniversalSearchQuery {
  text: string;
  domains?: SearchDomain[];
  limit?: number;
}

class UniversalSearchServiceClass {
  private searchIndex: Map<string, UniversalSearchResult> = new Map();

  /**
   * Contribute a search index entry from any runtime or provider
   */
  public indexItem(item: Omit<UniversalSearchResult, 'id'>): UniversalSearchResult {
    const id = `idx_${item.domain.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const entry: UniversalSearchResult = {
      ...item,
      id,
    };
    this.searchIndex.set(id, entry);
    return entry;
  }

  /**
   * Perform unified search across all domains
   */
  public search(query: UniversalSearchQuery): UniversalSearchResult[] {
    const results: UniversalSearchResult[] = [];
    const textLower = query.text.toLowerCase();
    const limit = query.limit || 20;

    for (const item of this.searchIndex.values()) {
      if (query.domains && query.domains.length > 0 && !query.domains.includes(item.domain)) {
        continue;
      }

      if (
        item.title.toLowerCase().includes(textLower) ||
        item.snippet.toLowerCase().includes(textLower)
      ) {
        results.push(item);
      }

      if (results.length >= limit) break;
    }

    return results;
  }

  public getStats() {
    return {
      totalIndexedItems: this.searchIndex.size,
    };
  }
}

export const UniversalSearchService = new UniversalSearchServiceClass();

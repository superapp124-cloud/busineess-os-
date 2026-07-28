export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  module: string;
  route: string;
  icon?: string;
}

export interface SearchProvider {
  moduleId: string;
  query: (q: string) => Promise<SearchResult[]>;
}

class IntentUniversalSearch {
  private providers: Map<string, SearchProvider> = new Map();

  /**
   * Modules register their search provider logic here.
   */
  register(moduleId: string, provider: Omit<SearchProvider, 'moduleId'>) {
    this.providers.set(moduleId, { moduleId, ...provider });
    console.log(`[UniversalSearch] Registered search provider for '${moduleId}'`);
  }

  /**
   * Execute a global search across all registered modules.
   */
  async search(query: string): Promise<SearchResult[]> {
    if (!query || query.trim() === '') return [];

    const promises = Array.from(this.providers.values()).map(async provider => {
      try {
        return await provider.query(query);
      } catch (err) {
        console.error(`[UniversalSearch] Error querying provider '${provider.moduleId}':`, err);
        return [];
      }
    });

    const results = await Promise.all(promises);
    return results.flat();
  }
}

export const searchRegistry = new IntentUniversalSearch();

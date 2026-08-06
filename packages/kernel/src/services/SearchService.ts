import { SystemService } from './ServiceFabric';

export interface SearchQueryInput {
  index: string;
  query: string;
  limit?: number;
}

export interface SearchService extends SystemService {
  search<T = unknown>(input: SearchQueryInput): Promise<{ items: T[]; total: number }>;
}

export class DefaultSearchServiceAdapter implements SearchService {
  public readonly id = 'search';
  public readonly version = '1.0.0';

  public async search<T = unknown>(input: SearchQueryInput): Promise<{ items: T[]; total: number }> {
    console.log(`[DefaultSearchServiceAdapter] Querying index '${input.index}' with query: '${input.query}'`);
    return {
      items: [] as T[],
      total: 0,
    };
  }

  public async health(): Promise<{ healthy: boolean }> {
    return { healthy: true };
  }
}

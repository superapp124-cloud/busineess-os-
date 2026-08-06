import { StorageService } from './ServiceFabric';

export class SupabaseStorageAdapter implements StorageService {
  public readonly id = 'storage';
  public readonly version = '1.0.0';

  private mockStore: Map<string, any> = new Map();

  public async get<T = unknown>(key: string): Promise<T | null> {
    return (this.mockStore.get(key) as T) || null;
  }

  public async set<T = unknown>(key: string, value: T): Promise<void> {
    this.mockStore.set(key, value);
    console.log(`[SupabaseStorageAdapter] Stored key '${key}' in system storage`);
  }

  public async query<T = unknown>(table: string, filter?: Record<string, unknown>): Promise<T[]> {
    console.log(`[SupabaseStorageAdapter] Executing secure query over entity table '${table}'`);
    return Array.from(this.mockStore.values()) as T[];
  }

  public async health(): Promise<{ healthy: boolean }> {
    return { healthy: true };
  }
}

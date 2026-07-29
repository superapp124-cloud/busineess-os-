import { JsonValue } from '@chatr/kernel';

export interface CacheProvider {
  get(key: string): Promise<JsonValue | null>;
  set(key: string, value: JsonValue, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

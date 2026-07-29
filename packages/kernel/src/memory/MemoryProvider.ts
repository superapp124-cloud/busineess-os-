import { MemoryEntry } from './MemoryEntry';
import { MemoryQuery } from './MemoryQuery';
import { JsonValue } from '../types';
import { MemoryScope } from './MemoryScope';

export interface MemoryProvider {
  get(scope: MemoryScope, key: string): Promise<MemoryEntry | null>;
  set(scope: MemoryScope, key: string, value: JsonValue, ttlMs?: number): Promise<MemoryEntry>;
  delete(scope: MemoryScope, key: string): Promise<boolean>;
  query(query: MemoryQuery): Promise<MemoryEntry[]>;
}

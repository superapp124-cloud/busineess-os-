import { MemoryScope } from './MemoryScope';

export interface MemoryQuery {
  scope?: MemoryScope;
  key?: string;
  keyPrefix?: string;
  limit?: number;
  offset?: number;
}

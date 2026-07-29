import { Identifier, Timestamp, Metadata } from '../common';
import { JsonValue } from '../types';
import { MemoryScope } from './MemoryScope';

export interface MemoryEntry extends Identifier {
  scope: MemoryScope;
  key: string;
  value: JsonValue;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: Metadata;
  expiresAt?: Timestamp;
}

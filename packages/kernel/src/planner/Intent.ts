import { Identifier, Metadata, Timestamp } from '../common';
import { IntentId, JsonValue } from '../types';

export interface Intent extends Identifier {
  id: IntentId;
  rawInput: string;
  semanticAction?: string;
  parameters: Record<string, JsonValue>;
  metadata?: Metadata;
  createdAt: Timestamp;
}

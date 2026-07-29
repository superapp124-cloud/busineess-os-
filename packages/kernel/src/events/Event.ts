import { Identifier, Timestamp, Metadata } from '../common';

export interface Event extends Identifier {
  type: string;
  timestamp: Timestamp;
  source: string;
  metadata?: Metadata;
}

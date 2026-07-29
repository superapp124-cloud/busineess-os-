import { Identifier, Timestamp } from '../common';
import { JsonValue } from '../types';

export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface ExecutionResult extends Identifier {
  planId: string;
  status: ExecutionStatus;
  output?: JsonValue;
  error?: string;
  startedAt: Timestamp;
  completedAt?: Timestamp;
}

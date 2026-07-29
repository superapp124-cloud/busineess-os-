import { Identifier } from '../common';
import { IntentId } from '../types';

export interface ExecutionContext extends Identifier {
  userId: string;
  intentId: IntentId;
  environment: string;
  metadata: Record<string, unknown>;
  getVariable(key: string): unknown;
  setVariable(key: string, value: unknown): void;
}

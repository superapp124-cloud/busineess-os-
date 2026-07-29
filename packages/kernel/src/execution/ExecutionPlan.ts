import { Identifier, Timestamp, Metadata, Version } from '../common';
import { IntentId } from '../types';
import { ExecutionStep } from './ExecutionStep';
import { PolicyDecision } from '../policy/PolicyDecision';

export interface ExecutionPlan extends Identifier {
  intentId: IntentId;
  steps: ExecutionStep[];
  policy: PolicyDecision;
  metadata?: Metadata;
  createdAt: Timestamp;
  version: Version;
  immutable: true;
}

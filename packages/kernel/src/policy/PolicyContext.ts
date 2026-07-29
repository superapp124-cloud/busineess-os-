import { IntentId, CapabilityId, ActionId } from '../types';

export interface PolicyContext {
  userId: string;
  intentId?: IntentId;
  capabilityId?: CapabilityId;
  actionId?: ActionId;
  environment: string;
  metadata?: Record<string, unknown>;
}

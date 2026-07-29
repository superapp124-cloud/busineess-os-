import { Identifier } from '../common';
import { ActionId, CapabilityId, JsonValue } from '../types';

export interface ExecutionStep extends Identifier {
  actionId: ActionId;
  capabilityId?: CapabilityId; // Resolved during planning or execution
  inputs: Record<string, JsonValue>;
  dependsOn: string[]; // Step IDs
}

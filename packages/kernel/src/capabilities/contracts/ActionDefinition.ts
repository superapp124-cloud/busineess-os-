import { ActionId, CapabilityId, JsonValue } from '../../types';
import { Version } from '../../common';
import { Permission } from '../../identity';

export interface ActionDefinition {
  id: ActionId;
  name: string;
  description: string;
  inputSchema: JsonValue; // e.g., JSON schema for validation
  outputSchema: JsonValue;
}

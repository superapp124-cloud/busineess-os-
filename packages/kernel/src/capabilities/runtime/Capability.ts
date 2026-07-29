import { CapabilityManifest } from '../manifests/CapabilityManifest';
import { ActionId, JsonValue } from '../../types';
import { ExecutionContext } from '../../execution/ExecutionContext';

export interface Capability {
  manifest: CapabilityManifest;
  
  initialize(context: ExecutionContext): Promise<void>;
  executeAction(actionId: ActionId, input: JsonValue, context: ExecutionContext): Promise<JsonValue>;
  teardown(context: ExecutionContext): Promise<void>;
}

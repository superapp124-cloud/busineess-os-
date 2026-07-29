import { ConnectorManifest } from '../manifests/ConnectorManifest';
import { ActionId, JsonValue } from '../../types';
import { ExecutionContext } from '../../execution/ExecutionContext';

export interface Connector {
  manifest: ConnectorManifest;
  
  connect(context: ExecutionContext): Promise<void>;
  dispatch(actionId: ActionId, payload: JsonValue, context: ExecutionContext): Promise<JsonValue>;
  disconnect(context: ExecutionContext): Promise<void>;
}

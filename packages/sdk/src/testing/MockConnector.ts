import { Connector, ConnectorManifest, ActionId, JsonValue, ExecutionContext } from '@chatr/kernel';

export class MockConnector implements Connector {
  public manifest: ConnectorManifest;
  
  constructor(manifest: ConnectorManifest) {
    this.manifest = manifest;
  }

  public async connect(context: ExecutionContext): Promise<void> {}
  
  public async dispatch(actionId: ActionId, payload: JsonValue, context: ExecutionContext): Promise<JsonValue> {
    return { success: true, mocked: true, actionId, payload };
  }
  
  public async disconnect(context: ExecutionContext): Promise<void> {}
}

import { Capability, CapabilityManifest, ActionId, JsonValue, ExecutionContext } from '@chatr/kernel';

export class MockCapability implements Capability {
  public manifest: CapabilityManifest;
  public state: Record<string, JsonValue> = {};
  
  constructor(manifest: CapabilityManifest) {
    this.manifest = manifest;
  }

  public async initialize(context: ExecutionContext): Promise<void> {}
  
  public async executeAction(actionId: ActionId, input: JsonValue, context: ExecutionContext): Promise<JsonValue> {
    return { success: true, mocked: true, actionId, input };
  }
  
  public async teardown(context: ExecutionContext): Promise<void> {}
}

export interface Capability {
  id: string;
  domain: string;
  description: string;
}

export class CapabilityRegistry {
  private capabilities = new Map<string, Capability>();

  public register(capability: Capability) {
    this.capabilities.set(capability.id, capability);
    console.log(`[CapabilityRegistry] Registered capability: ${capability.id}`);
  }

  public getCapability(id: string): Capability | undefined {
    return this.capabilities.get(id);
  }
}

export const globalCapabilityRegistry = new CapabilityRegistry();

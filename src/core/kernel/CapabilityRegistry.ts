/**
 * Capability Registry
 * The Kernel-native registry that strictly enforces the Capability ontology.
 * Completely domain-agnostic evaluators and tools.
 */
export class CapabilityRegistry {
  private static instance: CapabilityRegistry;
  private capabilities: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): CapabilityRegistry {
    if (!CapabilityRegistry.instance) {
      CapabilityRegistry.instance = new CapabilityRegistry();
    }
    return CapabilityRegistry.instance;
  }

  public register(capability: any) {
    console.log(`[CapabilityRegistry] Registered capability: ${capability.id}`);
    this.capabilities.set(capability.id, capability);
  }

  public get(id: string) {
    return this.capabilities.get(id);
  }
}

export interface Provider {
  id: string;
  name: string;
  capabilities: string[];
  transport: string;
  estimate(payload?: any): Promise<any>;
  search(query: string): Promise<any>;
  execute(params: any): Promise<any>;
  cancel(): Promise<boolean>;
  status(): Promise<string>;
}

export class ProviderRegistry {
  private providers = new Map<string, Provider>();

  public register(provider: Provider) {
    this.providers.set(provider.id, provider);
    console.log(`[ProviderRegistry] Registered provider: ${provider.name} (${provider.id})`);
  }

  public getProvidersForCapability(capabilityId: string): Provider[] {
    const matched: Provider[] = [];
    for (const provider of this.providers.values()) {
      if (provider.capabilities.includes(capabilityId)) {
        matched.push(provider);
      }
    }
    return matched;
  }
}

export const globalProviderRegistry = new ProviderRegistry();

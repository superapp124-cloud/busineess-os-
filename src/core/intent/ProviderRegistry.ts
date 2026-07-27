// ProviderRegistry.ts

export type TrustLevel = 'Official' | 'High' | 'Medium' | 'Low';

export interface ProviderMetadata {
  id: string;
  name: string;
  domain: string;
  type: string; // e.g. "MarketPlace", "Official Store", "Retailer"
  trustLevel: TrustLevel;
  supportedCapabilities: string[]; // references capability IDs
}

export class ProviderRegistry {
  private providers: Map<string, ProviderMetadata> = new Map();

  register(provider: ProviderMetadata) {
    this.providers.set(provider.id, provider);
  }

  getProvidersForCapability(capabilityId: string): ProviderMetadata[] {
    return Array.from(this.providers.values()).filter(p => 
      p.supportedCapabilities.includes(capabilityId)
    );
  }

  getAll(): ProviderMetadata[] {
    return Array.from(this.providers.values());
  }
}

export const globalProviderRegistry = new ProviderRegistry();

// Initialize real-world structure (with static configuration for now until backend is built)
const defaultProviders: ProviderMetadata[] = [
  { id: 'prov_apple', name: 'Apple India', domain: 'apple.com/in', type: 'Official Store', trustLevel: 'Official', supportedCapabilities: [] },
  { id: 'prov_amazon', name: 'Amazon India', domain: 'amazon.in', type: 'MarketPlace', trustLevel: 'Official', supportedCapabilities: [] },
  { id: 'prov_flipkart', name: 'Flipkart', domain: 'flipkart.com', type: 'MarketPlace', trustLevel: 'Official', supportedCapabilities: [] },
  { id: 'prov_croma', name: 'Croma', domain: 'croma.com', type: 'Retailer', trustLevel: 'High', supportedCapabilities: [] },
];

defaultProviders.forEach(p => globalProviderRegistry.register(p));

/**
 * CHATR Provider Registry
 * Plugin API allowing third-party and domain-specific providers to register dynamically with CHATR.
 */

import { CapabilityManifest } from '../../models/capability/CapabilityManifest';

export interface IProviderPlugin<TInput = unknown, TOutput = unknown> {
  id: string;
  name: string;
  manifest: CapabilityManifest;
  initialize(): Promise<void>;
  execute(input: TInput): Promise<TOutput>;
  shutdown?(): Promise<void>;
}

class ProviderRegistryService {
  private providers: Map<string, IProviderPlugin<any, any>> = new Map();

  /**
   * Register a provider plugin dynamically
   */
  public async registerProvider<TInput, TOutput>(plugin: IProviderPlugin<TInput, TOutput>): Promise<void> {
    if (this.providers.has(plugin.id)) {
      console.warn(`[ProviderRegistry] Overwriting existing provider plugin: ${plugin.id}`);
    }

    try {
      await plugin.initialize();
      this.providers.set(plugin.id, plugin);
      console.log(`[ProviderRegistry] Successfully registered provider plugin: ${plugin.name} [${plugin.id}]`);
    } catch (err: any) {
      console.error(`[ProviderRegistry] Failed to initialize provider plugin ${plugin.id}:`, err.message);
      throw err;
    }
  }

  /**
   * Retrieve a registered provider plugin by ID
   */
  public getProvider<TInput = unknown, TOutput = unknown>(providerId: string): IProviderPlugin<TInput, TOutput> | undefined {
    return this.providers.get(providerId);
  }

  /**
   * List all registered provider IDs
   */
  public listProviderIds(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Unregister and shutdown a provider plugin
   */
  public async unregisterProvider(providerId: string): Promise<boolean> {
    const provider = this.providers.get(providerId);
    if (!provider) return false;

    if (provider.shutdown) {
      try {
        await provider.shutdown();
      } catch (err: any) {
        console.error(`[ProviderRegistry] Error shutting down provider ${providerId}:`, err.message);
      }
    }

    this.providers.delete(providerId);
    console.log(`[ProviderRegistry] Unregistered provider plugin: ${providerId}`);
    return true;
  }
}

export const ProviderRegistry = new ProviderRegistryService();

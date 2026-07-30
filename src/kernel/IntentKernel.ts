/**
 * CHATR Intent Kernel
 * Top-Level System Orchestrator linking CapabilityRegistry, ProviderRegistry, RuntimeManager, and EventBus.
 */

import { EventBus } from './eventbus/EventBus';
import { CapabilityRegistry } from './registry/CapabilityRegistry';
import { ProviderRegistry } from './registry/ProviderRegistry';
import { RuntimeManager } from './RuntimeManager';

class IntentKernelService {
  private isBooted: boolean = false;
  private bootTimestamp: string | null = null;

  public readonly eventBus = EventBus;
  public readonly capabilityRegistry = CapabilityRegistry;
  public readonly providerRegistry = ProviderRegistry;
  public readonly runtimeManager = RuntimeManager;

  /**
   * Boot up the CHATR Intent Operating System Kernel
   */
  public async boot(): Promise<void> {
    if (this.isBooted) {
      console.log('[IntentKernel] System kernel is already booted.');
      return;
    }

    console.log('========================================================');
    console.log('         CHATR INTENT OPERATING SYSTEM KERNEL          ');
    console.log('========================================================');

    this.bootTimestamp = new Date().toISOString();
    
    // Initialize OS Runtimes via RuntimeManager
    await this.runtimeManager.initializeAll();

    this.isBooted = true;
    console.log(`[IntentKernel] Kernel boot complete. Status: OK (${this.bootTimestamp})`);

    await this.eventBus.publish(
      'model:status:changed',
      'IntentKernel',
      { status: 'booted', timestamp: this.bootTimestamp }
    );
  }

  /**
   * Get current kernel health status
   */
  public getStatus() {
    return {
      isBooted: this.isBooted,
      bootTimestamp: this.bootTimestamp,
      registeredProviders: this.providerRegistry.listProviderIds(),
      registeredCapabilities: this.capabilityRegistry.getAllManifests().length,
    };
  }

  /**
   * Graceful shutdown of kernel
   */
  public async shutdown(): Promise<void> {
    console.log('[IntentKernel] Initiating system kernel shutdown...');
    await this.runtimeManager.shutdownAll();
    this.capabilityRegistry.clear();
    this.eventBus.clear();
    this.isBooted = false;
    console.log('[IntentKernel] Kernel shutdown complete.');
  }
}

export const IntentKernel = new IntentKernelService();

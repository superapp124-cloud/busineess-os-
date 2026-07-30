/**
 * CHATR Intent Kernel (v3.0 Architecture)
 * Master OS Kernel connecting 6 core subsystems:
 * ExecutionEngine, TaskScheduler, StateStore, PermissionEngine, EventBus, and TelemetryService.
 */

import { EventBus } from './eventbus/EventBus';
import { CapabilityRegistry } from './registry/CapabilityRegistry';
import { ProviderRegistry } from './registry/ProviderRegistry';
import { RuntimeManager } from './RuntimeManager';
import { ExecutionEngine } from './execution/ExecutionEngine';
import { TaskScheduler } from './scheduler/TaskScheduler';
import { StateStore } from './state/StateStore';
import { PermissionEngine } from './permissions/PermissionEngine';
import { Telemetry } from '../telemetry/TelemetryService';

class IntentKernelService {
  private isBooted: boolean = false;
  private bootTimestamp: string | null = null;

  public readonly executionEngine = ExecutionEngine;
  public readonly scheduler = TaskScheduler;
  public readonly stateStore = StateStore;
  public readonly permissionEngine = PermissionEngine;
  public readonly eventBus = EventBus;
  public readonly telemetry = Telemetry;
  public readonly capabilityRegistry = CapabilityRegistry;
  public readonly providerRegistry = ProviderRegistry;
  public readonly runtimeManager = RuntimeManager;

  /**
   * Boot up the CHATR Intent Operating System Kernel v3.0
   */
  public async boot(): Promise<void> {
    if (this.isBooted) {
      console.log('[IntentKernel] System kernel is already booted.');
      return;
    }

    console.log('========================================================');
    console.log('         CHATR INTENT OPERATING SYSTEM KERNEL v3.0      ');
    console.log('========================================================');

    this.bootTimestamp = new Date().toISOString();
    
    // Initialize OS Runtimes via RuntimeManager
    await this.runtimeManager.initializeAll();

    // Sync State Store
    this.stateStore.updateState({
      runtimeHealth: 'healthy',
      connectedProviders: this.providerRegistry.listProviderIds(),
    });

    this.isBooted = true;
    console.log(`[IntentKernel] Kernel v3.0 boot complete. Status: HEALTHY (${this.bootTimestamp})`);

    await this.eventBus.publish(
      'model:status:changed',
      'IntentKernel',
      { status: 'booted', version: '3.0.0', timestamp: this.bootTimestamp }
    );
  }

  /**
   * Get current kernel health status
   */
  public getStatus() {
    return {
      isBooted: this.isBooted,
      bootTimestamp: this.bootTimestamp,
      subsystems: {
        executionEngine: 'ready',
        scheduler: this.scheduler.getQueueStats(),
        stateStore: this.stateStore.getState(),
        permissionEngine: 'active',
        eventBus: 'active',
        telemetry: this.telemetry.getSummary(),
      },
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

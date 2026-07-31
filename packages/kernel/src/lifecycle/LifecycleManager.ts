import { DependencyInjector } from '../di/DependencyInjector';
import { IUniversalEventBus } from '../events/UniversalEventBus';
import { IEventStore } from '../events/EventStore';

export interface BootOptions {
  plugins?: string[];
  configPath?: string;
}

/**
 * Orchestrates the deterministic boot sequence and shutdown of the runtime.
 */
export class LifecycleManager {
  private isBooted = false;

  constructor(
    private di: DependencyInjector,
    private eventBus: IUniversalEventBus,
    private eventStore: IEventStore
  ) {
    // During lifecycle operations, the event store needs to record state changes
    // So we subscribe the event store to the event bus for all sourced events.
    this.wireEventSourcing();
  }

  private wireEventSourcing() {
    // Sourced events subset
    const SOURCED_EVENTS = [
      'identity.created', 'connector.connected', 'permission.granted',
      'permission.revoked', 'workflow.started', 'workflow.finished',
      'graph.updated', 'memory.stored', 'intent.resolved',
      'agent.task_completed', 'policy.violation', 'trust.score_changed',
      'kernel.boot_complete'
    ] as any; // any to bypass strict type checking for the array

    this.eventBus.subscribeMany(SOURCED_EVENTS, async (payload, meta) => {
      await this.eventStore.append(meta.eventId as any, payload, meta);
    });
  }

  public async boot(options: BootOptions = {}): Promise<void> {
    if (this.isBooted) {
      throw new Error('Kernel is already booted.');
    }

    this.eventBus.publish('kernel.boot_started', { options });

    try {
      // 1. Core Services (already injected, but this is where we'd initialize them)
      
      // 2. Configuration (stubbed for Slice 1)
      
      // 3. Plugin Loader (stubbed for Slice 1)

      this.isBooted = true;
      this.eventBus.publish('kernel.boot_complete', { 
        status: 'ready',
        timestamp: Date.now() 
      });

    } catch (error) {
      this.eventBus.publish('kernel.crash_detected', { error });
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    if (!this.isBooted) {
      return;
    }

    this.eventBus.publish('kernel.shutdown_initiated', {});
    this.isBooted = false;
  }

  public getState(): 'booted' | 'shutdown' {
    return this.isBooted ? 'booted' : 'shutdown';
  }
}

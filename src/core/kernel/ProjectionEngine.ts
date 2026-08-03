import { EnterpriseEventBus } from './EnterpriseEventBus';
import { EnterpriseEvent, ProjectionHandler } from '../types';

/**
 * ProjectionEngine
 * Listens to the Event Bus Dispatcher and routes events to an independent registry of handlers.
 * It is completely decoupled from knowing *which* projections exist.
 */
export class ProjectionEngine {
  private static instance: ProjectionEngine;
  private bus: EnterpriseEventBus;
  private handlers: ProjectionHandler[] = [];

  private constructor() {
    this.bus = EnterpriseEventBus.getInstance();
  }

  public static getInstance(): ProjectionEngine {
    if (!ProjectionEngine.instance) {
      ProjectionEngine.instance = new ProjectionEngine();
    }
    return ProjectionEngine.instance;
  }

  public registerHandler(handler: ProjectionHandler) {
    this.handlers.push(handler);
    console.log(`[ProjectionEngine] Registered Projection Handler: ${handler.name} (v${handler.version})`);
  }

  public start() {
    console.log('[ProjectionEngine] Starting projections engine...');
    
    // We subscribe blindly to a wildcard or high-level event channel
    // For this prototype, we simulate catching all events by subscribing to 'EnterpriseEvent'
    // The Event Bus must be updated or assume this wildcard routes everything here.
    this.bus.subscribe('*', async (event: EnterpriseEvent) => {
      this.dispatchToHandlers(event);
    });
    
    console.log('[ProjectionEngine] Engine running. Active handlers:', this.handlers.length);
  }

  private async dispatchToHandlers(event: EnterpriseEvent) {
    for (const handler of this.handlers) {
      try {
        await handler.applyEvent(event);
      } catch (err) {
        console.error(`[ProjectionEngine] Handler ${handler.name} failed to process event ${event.id}:`, err);
        // Depending on strictness, we might pause the projection or drop the event
      }
    }
  }

  // Debugging & Recovery
  public getRegistryStatus() {
    return this.handlers.map(h => ({
      name: h.name,
      version: h.version,
      checkpoint: h.getCheckpoint(),
      lastEventId: h.getLastEventId(),
      lastTimestamp: h.getLastTimestamp()
    }));
  }
}

import { RuntimeEvent, EventMetadata } from '@chatr/events';

export interface StoredEvent {
  event: RuntimeEvent;
  payload: unknown;
  metadata: EventMetadata;
  sequence: number;
}

export interface IEventStore {
  append(event: RuntimeEvent, payload: unknown, metadata: EventMetadata): Promise<void>;
  replayAll(fromTimestamp?: number): AsyncGenerator<StoredEvent>;
  getSequenceCount(): number;
}

/**
 * Append-only store for persisting state-changing events.
 * Note: Slice 1 uses a simple in-memory array that could be flushed to disk later.
 */
export class EventStore implements IEventStore {
  private events: StoredEvent[] = [];
  
  // Only persist these state-changing events as per ADR-0003
  private readonly SOURCED_EVENTS: Set<RuntimeEvent> = new Set([
    'identity.created',
    'connector.connected',
    'permission.granted',
    'permission.revoked',
    'workflow.started',
    'workflow.finished',
    'graph.updated',
    'memory.stored',
    'intent.resolved',
    'agent.task_completed',
    'policy.violation',
    'trust.score_changed',
    'kernel.boot_complete' // Included for testing Slice 1
  ]);

  public async append(event: RuntimeEvent, payload: unknown, metadata: EventMetadata): Promise<void> {
    if (!this.SOURCED_EVENTS.has(event)) {
      return;
    }

    this.events.push({
      event,
      payload,
      metadata,
      sequence: this.events.length,
    });
  }

  public async *replayAll(fromTimestamp = 0): AsyncGenerator<StoredEvent> {
    for (const stored of this.events) {
      if (stored.metadata.timestamp >= fromTimestamp) {
        yield stored;
      }
    }
  }

  public getSequenceCount(): number {
    return this.events.length;
  }
}

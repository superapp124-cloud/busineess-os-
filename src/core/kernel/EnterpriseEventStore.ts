import { EnterpriseEvent } from '../types';
import { ContractValidator } from '../tools/ContractValidator';

export interface EnterpriseEventStore {
  append(event: EnterpriseEvent): void;
  read(aggregateId: string): EnterpriseEvent[];
  replay(fromTimestamp?: string): EnterpriseEvent[];
  subscribe(callback: (event: EnterpriseEvent) => void): void;
  checkpoint(): string;
  snapshot(aggregateId: string): void;
}

export class InMemoryEventStore implements EnterpriseEventStore {
  private events: EnterpriseEvent[] = [];
  private subscribers: ((event: EnterpriseEvent) => void)[] = [];

  append(event: EnterpriseEvent): void {
    // 1. Enforce Canonical Contract
    ContractValidator.validateEvent(event);

    // 2. Basic idempotency check
    if (this.events.some(e => e.idempotencyKey === event.idempotencyKey)) {
      console.warn(`[EventStore] Duplicate event detected and ignored: ${event.idempotencyKey}`);
      return;
    }

    this.events.push(event);
    console.log(`[EventStore] Appended event: ${event.type} (${event.id})`);
    
    // Notify subscribers
    this.subscribers.forEach(cb => {
      try {
        cb(event);
      } catch (err) {
        console.error(`[EventStore] Subscriber failed to process event: ${event.id}`, err);
        // Event Bus will handle DLQ, EventStore just persists and notifies.
        throw err;
      }
    });
  }

  read(aggregateId: string): EnterpriseEvent[] {
    return this.events.filter(e => e.aggregateId === aggregateId);
  }

  replay(fromTimestamp?: string): EnterpriseEvent[] {
    if (!fromTimestamp) return [...this.events];
    const fromTime = new Date(fromTimestamp).getTime();
    return this.events.filter(e => new Date(e.occurredAt).getTime() >= fromTime);
  }

  subscribe(callback: (event: EnterpriseEvent) => void): void {
    this.subscribers.push(callback);
  }

  checkpoint(): string {
    return this.events.length > 0 ? this.events[this.events.length - 1].id : '';
  }

  snapshot(aggregateId: string): void {
    // Stub: Compress all events for this aggregate into a baseline snapshot.
    console.log(`[EventStore] Snapshot created for aggregate: ${aggregateId}`);
  }
}

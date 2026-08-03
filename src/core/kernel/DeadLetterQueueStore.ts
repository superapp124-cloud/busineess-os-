import { EnterpriseEvent } from '../types';

export interface DLQEntry {
  event: EnterpriseEvent;
  failedAt: string;
  errorReason: string;
  retryCount: number;
  subscriberId: string;
}

export interface DeadLetterQueueStore {
  append(entry: DLQEntry): void;
  list(): DLQEntry[];
  retry(eventId: string): void;
  purge(eventId?: string): void;
}

export class InMemoryDLQStore implements DeadLetterQueueStore {
  private queue: DLQEntry[] = [];

  append(entry: DLQEntry): void {
    this.queue.push(entry);
    console.warn(`[DLQ] Event added to Dead Letter Queue: ${entry.event.id} for subscriber ${entry.subscriberId}`);
  }

  list(): DLQEntry[] {
    return [...this.queue];
  }

  retry(eventId: string): void {
    const entries = this.queue.filter(e => e.event.id === eventId);
    entries.forEach(entry => {
      console.log(`[DLQ] Retrying event: ${eventId} for subscriber ${entry.subscriberId}`);
      // In a real implementation, we would requeue to the Dispatcher for that specific subscriber.
    });
  }

  purge(eventId?: string): void {
    if (eventId) {
      this.queue = this.queue.filter(e => e.event.id !== eventId);
    } else {
      this.queue = [];
    }
  }
}

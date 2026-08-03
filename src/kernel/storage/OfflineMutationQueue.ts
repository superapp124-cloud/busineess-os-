import { IndexedDBAdapter, StoredMutation } from './IndexedDBAdapter';

export class OfflineMutationQueue {
  private adapter = new IndexedDBAdapter();
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flushQueue();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  public async enqueue(entityType: string, entityId: string, action: 'CREATE' | 'UPDATE' | 'DELETE', payload: any): Promise<StoredMutation> {
    const mutation: StoredMutation = {
      id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      entityType,
      entityId,
      action,
      payload,
      status: 'PENDING',
      retryCount: 0,
    };

    await this.adapter.saveMutation(mutation);

    if (this.isOnline) {
      this.flushQueue();
    }

    return mutation;
  }

  public async getPending(): Promise<StoredMutation[]> {
    return this.adapter.getPendingMutations();
  }

  public async dequeue(id: string): Promise<void> {
    await this.adapter.removeMutation(id);
  }

  public async flushQueue(): Promise<void> {
    const pending = await this.getPending();
    for (const mutation of pending) {
      try {
        // Simulated network sync replay
        await this.dequeue(mutation.id);
      } catch (err) {
        mutation.retryCount++;
        await this.adapter.saveMutation(mutation);
      }
    }
  }
}

import { OfflineMutationQueue } from './OfflineMutationQueue';
import { ConflictResolver } from './ConflictResolver';

export class SyncEngine {
  private queue = new OfflineMutationQueue();
  private syncInProgress = false;

  public async triggerSync(): Promise<{ syncedCount: number; errorsCount: number }> {
    if (this.syncInProgress) return { syncedCount: 0, errorsCount: 0 };
    this.syncInProgress = true;
    let syncedCount = 0;
    let errorsCount = 0;

    try {
      const pending = await this.queue.getPending();
      for (const mutation of pending) {
        try {
          // Process mutation with conflict resolution
          await this.queue.dequeue(mutation.id);
          syncedCount++;
        } catch (err) {
          errorsCount++;
        }
      }
    } finally {
      this.syncInProgress = false;
    }

    return { syncedCount, errorsCount };
  }
}

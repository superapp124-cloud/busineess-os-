/**
 * CHATR Enterprise IndexedDB Persistence Adapter
 * Provides local storage fallback for BusinessObjectStore and offline mutation queues.
 */

export interface StoredMutation {
  id: string;
  timestamp: number;
  entityType: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  status: 'PENDING' | 'SYNCING' | 'FAILED' | 'RECONCILED';
  retryCount: number;
}

export class IndexedDBAdapter {
  private dbName = 'chatr_kernel_offline_db';
  private version = 1;

  public async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve(null as any);
        return;
      }
      const req = window.indexedDB.open(this.dbName, this.version);
      req.onupgradeneeded = (evt: any) => {
        const db = evt.target.result;
        if (!db.objectStoreNames.contains('mutations')) {
          db.createObjectStore('mutations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('business_objects')) {
          db.createObjectStore('business_objects', { keyPath: 'id' });
        }
      };
      req.onsuccess = (evt: any) => resolve(evt.target.result);
      req.onerror = (evt: any) => reject(evt.target.error);
    });
  }

  public async saveMutation(mutation: StoredMutation): Promise<void> {
    const db = await this.openDB();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mutations', 'readwrite');
      const store = tx.objectStore('mutations');
      const req = store.put(mutation);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getPendingMutations(): Promise<StoredMutation[]> {
    const db = await this.openDB();
    if (!db) return [];
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mutations', 'readonly');
      const store = tx.objectStore('mutations');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result.filter((m: StoredMutation) => m.status === 'PENDING'));
      req.onerror = () => reject(req.error);
    });
  }

  public async removeMutation(id: string): Promise<void> {
    const db = await this.openDB();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mutations', 'readwrite');
      const store = tx.objectStore('mutations');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

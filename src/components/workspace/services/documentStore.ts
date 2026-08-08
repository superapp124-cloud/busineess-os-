import { WorkspaceItem } from '../adapters/types';
import { MissionExecutionContext } from '../../../core/types';

const DB_NAME = 'CHATR_Workspace_DB';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

export interface StoredDocument {
  id: string;
  sourceUri: string;
  typeHint?: string;
  addedAt: string;
  rawFileData?: ArrayBuffer;
  fileName?: string;
  fileType?: string;
  workSession?: MissionExecutionContext | null;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const DocumentStore = {
  async saveDocument(item: WorkspaceItem): Promise<void> {
    try {
      const db = await openDB();
      let rawFileData: ArrayBuffer | undefined = undefined;

      if (item.rawFile && item.rawFile.size > 0) {
        rawFileData = await item.rawFile.arrayBuffer();
      }

      const record: StoredDocument = {
        id: item.id,
        sourceUri: item.sourceUri,
        typeHint: item.typeHint,
        addedAt: new Date().toISOString(),
        rawFileData,
        fileName: item.rawFile?.name,
        fileType: item.rawFile?.type,
        workSession: (item as any).__workSession__ || null,
      };

      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[DocumentStore] Failed to save document to IndexedDB:', err);
    }
  },

  async getAllDocuments(): Promise<WorkspaceItem[]> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const records: StoredDocument[] = req.result || [];
          const items: WorkspaceItem[] = records.map(rec => {
            let rawFile: File | undefined = undefined;
            if (rec.rawFileData && rec.fileName) {
              rawFile = new File([rec.rawFileData], rec.fileName, { type: rec.fileType || 'application/pdf' });
            } else {
              rawFile = new File([], rec.fileName || rec.sourceUri);
            }

            const item: WorkspaceItem = {
              id: rec.id,
              sourceUri: rec.sourceUri,
              typeHint: rec.typeHint,
              rawFile,
            };

            if (rec.workSession) {
              (item as any).__workSession__ = rec.workSession;
            }

            return item;
          });
          resolve(items);
        };

        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[DocumentStore] Failed to load documents from IndexedDB:', err);
      return [];
    }
  },

  async deleteDocument(id: string): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[DocumentStore] Failed to delete document from IndexedDB:', err);
    }
  },

  async clearAll(): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[DocumentStore] Failed to clear documents:', err);
    }
  }
};

/**
 * CHATR Kernel Runtime v2.0 — MemoryEngine
 *
 * Layer 3 — Core Engines
 *
 * Five-tier memory architecture:
 * 1. Working Memory      — current session entities (in-memory)
 * 2. Conversation Memory — N recent exchanges (IndexedDB)
 * 3. Relationship Memory — per-contact history (IndexedDB)
 * 4. Long-term Memory    — structured facts/prefs (IndexedDB)
 * 5. Semantic Memory     — entity relationships graph (IndexedDB)
 */

import { IEngine, EngineHealth, EngineStatus } from '../runtime/types';
import { KernelAPI } from '../runtime/KernelAPI';

interface MemoryItem {
  id: string;
  type: string;
  content: unknown;
  timestamp: number;
  source: string;
}

export class MemoryEngineImpl implements IEngine {
  readonly id = 'MemoryEngine';
  readonly version = '2.0.0';
  readonly kernelCompatibility = '>=2.0.0';
  readonly dependsOn = []; // base engine

  private _status: EngineStatus = 'stopped';
  private kernel!: KernelAPI;
  private db!: IDBDatabase;

  // Tier 1: Working Memory (in-memory only)
  private workingMemory = new Map<string, unknown>();

  status(): EngineStatus { return this._status; }
  ready(): boolean { return this._status === 'ready'; }
  metrics(): Record<string, number> { return {}; }

  async health(): Promise<EngineHealth> {
    return { status: this._status, lastChecked: Date.now() };
  }

  async init(api: KernelAPI): Promise<void> {
    this._status = 'booting';
    this.kernel = api;

    try {
      await this.initIndexedDB();
      
      this.kernel.events.on('TRANSCRIPT_CHUNK_RECEIVED', (e) => {
        // Cache in working memory during the live call
        const payload = e.payload as { sessionId: string; text: string };
        const history = this.workingMemory.get(`call_${payload.sessionId}`) as string[] || [];
        history.push(payload.text);
        this.setWorking(`call_${payload.sessionId}`, history);
      });

      this._status = 'ready';
      this.kernel.events.publish('KERNEL_READY', { engine: this.id }, { priority: 'background' });
    } catch (err) {
      this._status = 'crashed';
      throw err;
    }
  }

  private initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CHATR_MemoryEngine', 1);

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        // Tier 2: Conversation
        if (!db.objectStoreNames.contains('conversation')) {
          db.createObjectStore('conversation', { keyPath: 'id' });
        }
        // Tier 3: Relationship
        if (!db.objectStoreNames.contains('relationship')) {
          db.createObjectStore('relationship', { keyPath: 'contactId' });
        }
        // Tier 4: Long-term
        if (!db.objectStoreNames.contains('longterm')) {
          db.createObjectStore('longterm', { keyPath: 'key' });
        }
        // Tier 5: Semantic
        if (!db.objectStoreNames.contains('semantic')) {
          const store = db.createObjectStore('semantic', { keyPath: 'id' });
          store.createIndex('by_entity', 'entityId', { unique: false });
        }
      };

      request.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
    });
  }

  // ── Tier 1: Working Memory ────────────────────────────────────────────────

  setWorking(key: string, value: unknown): void {
    this.workingMemory.set(key, value);
    this.kernel.state.update('memory', s => ({
      workingEntities: { ...s.workingEntities, [key]: [value] }
    }));
  }

  getWorking<T>(key: string): T | null {
    return (this.workingMemory.get(key) as T) ?? null;
  }

  clearWorking(): void {
    this.workingMemory.clear();
    this.kernel.state.update('memory', () => ({ workingEntities: {} }));
  }

  // ── Tier 2-5: IndexedDB access (Generic wrapper for simplicity) ──────────

  private async dbPut(storeName: string, item: unknown): Promise<void> {
    if (!this.db) throw new Error('DB not initialized');
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private async dbGet<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) return null;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result as T | null);
      req.onerror = () => reject(req.error);
    });
  }

  // ── High-level Memory API ─────────────────────────────────────────────────

  async store(key: string, value: unknown): Promise<void> {
    // Store in long-term memory
    await this.dbPut('longterm', { key, value, timestamp: Date.now() });
    this.kernel.cache.delete(`memory:longterm:${key}`);
  }

  async recall(query: string): Promise<unknown | null> {
    // Check cache first
    const cached = this.kernel.cache.get(`memory:longterm:${query}`);
    if (cached) return cached;

    // Check Working Memory (fastest)
    const working = this.workingMemory.get(query);
    if (working) return working;

    // Check Long-term Memory
    const ltm = await this.dbGet<{ value: unknown }>('longterm', query);
    if (ltm) {
      this.kernel.cache.set(`memory:longterm:${query}`, ltm.value, { ttl: 60000 });
      return ltm.value;
    }

    return null;
  }

  getWorkingEntities(): Record<string, unknown[]> {
    return this.kernel.state.get('memory').workingEntities;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  async restart(): Promise<void> {
    await this.dispose();
    await this.init(this.kernel);
  }

  async dispose(): Promise<void> {
    this.workingMemory.clear();
    if (this.db) this.db.close();
    this._status = 'stopped';
  }
}

export const memoryEngine = new MemoryEngineImpl();

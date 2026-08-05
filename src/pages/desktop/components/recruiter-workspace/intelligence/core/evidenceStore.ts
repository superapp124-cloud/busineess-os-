/**
 * Resume Intelligence OS v3.0 — Evidence Store
 *
 * Centralised in-memory store for all evidence records.
 * Entities reference evidence by ID — no duplication of metadata.
 * Upgrades to IndexedDB for cross-session persistence when needed.
 */

import type { LayoutRegion } from './types';

// ─── Evidence Record ──────────────────────────────────────────────────────────

export interface EvidenceRecord {
  evidenceId: string;
  value: string;
  normalizedValue: string;
  page: number;
  section: string;
  layoutRegion: LayoutRegion;
  readingOrder: number;
  extractor: string;
  ocrConfidence: number;
  extractedAt: string;
  /** Source snippet — surrounding context in the document */
  contextSnippet: string;
}

// ─── Evidence Store ───────────────────────────────────────────────────────────

class EvidenceStoreImpl {
  private readonly records = new Map<string, EvidenceRecord>();
  private counter = 0;

  /** Store a new evidence record. Returns the assigned evidenceId. */
  put(record: Omit<EvidenceRecord, 'evidenceId'>): string {
    // Dedup: if identical value+section+page already stored, return existing ID
    for (const [id, existing] of this.records) {
      if (
        existing.value === record.value &&
        existing.section === record.section &&
        existing.page === record.page &&
        existing.extractor === record.extractor
      ) {
        return id;
      }
    }
    const evidenceId = `ev-${++this.counter}-${Date.now().toString(36)}`;
    this.records.set(evidenceId, { evidenceId, ...record });
    return evidenceId;
  }

  /** Retrieve evidence by ID. Returns null if not found. */
  get(evidenceId: string): EvidenceRecord | null {
    return this.records.get(evidenceId) ?? null;
  }

  /** All stored evidence records. */
  getAll(): EvidenceRecord[] {
    return Array.from(this.records.values());
  }

  /** Total number of stored evidence records. */
  size(): number {
    return this.records.size;
  }

  /** Clear all evidence (e.g. between test runs). */
  clear(): void {
    this.records.clear();
    this.counter = 0;
  }

  /**
   * Bulk retrieve multiple evidence records.
   * Returns a map of evidenceId → EvidenceRecord (missing IDs omitted).
   */
  getBulk(ids: string[]): Map<string, EvidenceRecord> {
    const result = new Map<string, EvidenceRecord>();
    for (const id of ids) {
      const rec = this.records.get(id);
      if (rec) result.set(id, rec);
    }
    return result;
  }

  /**
   * Export a snapshot of all records — useful for persistence/serialisation.
   */
  snapshot(): EvidenceRecord[] {
    return this.getAll();
  }

  /**
   * Restore from a snapshot (e.g. from IndexedDB on page load).
   */
  restore(records: EvidenceRecord[]): void {
    this.records.clear();
    for (const rec of records) {
      this.records.set(rec.evidenceId, rec);
    }
    this.counter = records.length;
  }
}

/** Singleton evidence store — shared across the entire intelligence pipeline. */
export const evidenceStore = new EvidenceStoreImpl();

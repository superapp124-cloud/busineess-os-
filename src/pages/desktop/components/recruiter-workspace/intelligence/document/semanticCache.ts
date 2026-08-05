/**
 * Resume Intelligence OS v3.0 — Semantic Cache
 *
 * Fingerprint → CandidateKnowledgeGraph cache.
 * Prevents re-parsing identical documents when a candidate uploads the same resume.
 */

import type { DocumentFingerprint } from '../core/types';
import { fingerprintMatches } from './fingerprint';

// ─── Cache Entry ──────────────────────────────────────────────────────────────

export interface SemanticCacheEntry<T = unknown> {
  fingerprint: DocumentFingerprint;
  graph: T;
  cachedAt: string;
  hitCount: number;
}

// ─── Semantic Cache ───────────────────────────────────────────────────────────

class SemanticCacheImpl<T = unknown> {
  private readonly store = new Map<string, SemanticCacheEntry<T>>();
  private readonly maxEntries: number;

  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
  }

  /**
   * Store a graph in the cache keyed by its document fingerprint.
   * Evicts the oldest entry when capacity is reached.
   */
  set(fingerprint: DocumentFingerprint, graph: T): void {
    if (this.store.size >= this.maxEntries) {
      // Evict the oldest entry
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }
    this.store.set(fingerprint.sha256, {
      fingerprint,
      graph,
      cachedAt: new Date().toISOString(),
      hitCount: 0,
    });
  }

  /**
   * Look up a cached graph by fingerprint.
   * Returns null if not found or fingerprint doesn't match.
   */
  get(fingerprint: DocumentFingerprint): T | null {
    const entry = this.store.get(fingerprint.sha256);
    if (!entry) return null;
    if (!fingerprintMatches(entry.fingerprint, fingerprint)) {
      this.store.delete(fingerprint.sha256);
      return null;
    }
    entry.hitCount++;
    return entry.graph;
  }

  /** Check if a fingerprint is cached without incrementing hit count. */
  has(fingerprint: DocumentFingerprint): boolean {
    const entry = this.store.get(fingerprint.sha256);
    if (!entry) return false;
    return fingerprintMatches(entry.fingerprint, fingerprint);
  }

  /** Remove a specific entry from the cache. */
  invalidate(fingerprint: DocumentFingerprint): void {
    this.store.delete(fingerprint.sha256);
  }

  /** Clear all cached entries. */
  clear(): void {
    this.store.clear();
  }

  /** Cache statistics. */
  stats(): { size: number; totalHits: number; maxEntries: number } {
    let totalHits = 0;
    for (const entry of this.store.values()) {
      totalHits += entry.hitCount;
    }
    return { size: this.store.size, totalHits, maxEntries: this.maxEntries };
  }
}

/** Singleton semantic cache — shared across the pipeline session. */
export const semanticCache = new SemanticCacheImpl();

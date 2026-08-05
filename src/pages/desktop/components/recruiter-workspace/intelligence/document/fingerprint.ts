/**
 * Resume Intelligence OS v3.0 — Document Fingerprint
 *
 * Computes deterministic fingerprints for parsed documents.
 * Enables semantic caching and duplicate detection without re-parsing.
 */

import type { LayoutNode, DocumentFingerprint } from '../core/types';

// ─── Simple deterministic hash (djb2-style, no crypto dependency) ─────────────

function hashString(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h >>> 0; // convert to unsigned 32-bit
  }
  return h.toString(16).padStart(8, '0');
}

/** Compute a hex hash of the raw text content. */
export function computeTextHash(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim().toLowerCase();
  return `th-${hashString(normalized)}`;
}

/** Compute a hash of the document layout structure (section labels + order). */
export function computeLayoutHash(nodes: LayoutNode[]): string {
  const structure = nodes
    .map(n => `${n.label}:${n.layoutRegion}:${n.readingOrder}`)
    .join('|');
  return `lh-${hashString(structure)}`;
}

/**
 * Compute a SHA-256-equivalent fingerprint of the raw document text.
 * Uses a multi-round djb2 hash to approximate collision resistance in-browser
 * without requiring the SubtleCrypto API (sync, works in all contexts).
 */
export function computeSha256Equivalent(text: string): string {
  const passes = [text, text.split('').reverse().join(''), text.slice(0, text.length / 2)];
  return 'sha-' + passes.map(hashString).join('');
}

/**
 * Compute the full fingerprint for a document.
 * Call this before any entity extraction begins.
 */
export function computeFingerprint(
  nativeText: string,
  layoutNodes: LayoutNode[]
): DocumentFingerprint {
  return {
    sha256: computeSha256Equivalent(nativeText),
    layoutHash: computeLayoutHash(layoutNodes),
    textHash: computeTextHash(nativeText),
    computedAt: new Date().toISOString(),
  };
}

/** Determine if two fingerprints represent the same document. */
export function fingerprintMatches(a: DocumentFingerprint, b: DocumentFingerprint): boolean {
  return a.sha256 === b.sha256 && a.textHash === b.textHash;
}

/** Determine if only the layout changed (text is identical). */
export function layoutChanged(a: DocumentFingerprint, b: DocumentFingerprint): boolean {
  return a.textHash === b.textHash && a.layoutHash !== b.layoutHash;
}

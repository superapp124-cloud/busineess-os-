/**
 * Resume Intelligence OS v3.0 — Ontology Registry
 *
 * Lazy-loads domain ontologies on demand.
 * Each ontology module is self-contained — adding a new one requires no pipeline changes.
 */

import type { SemanticEntityType } from '../core/types';

// ─── Ontology Entry ───────────────────────────────────────────────────────────

export interface OntologyEntry {
  /** The canonical / preferred form e.g. "SAP FICO" */
  canonical: string;
  /** Known aliases, abbreviations, and synonyms */
  aliases: string[];
  /**
   * Deprecated aliases that should redirect to canonical.
   * Example: "Windows Azure" → deprecated → "Microsoft Azure"
   */
  deprecated?: string[];
  /** Parent category in the skill taxonomy e.g. "ERP" */
  parentCategory: string;
  /** Grandparent category, for deep taxonomy paths e.g. "Enterprise Software" */
  grandparentCategory?: string;
  /** Semantic entity type this entry maps to */
  skillType: SemanticEntityType;
  /** Full taxonomy path from broadest to most specific */
  taxonomy: string[];
}

/** Version changelog entry for an ontology module. */
export interface OntologyVersion {
  moduleId: string;
  version: string;
  previousVersion?: string;
  changedAt: string;
  addedEntries: string[];      // canonical names of new entries
  removedEntries: string[];    // canonical names removed
  modifiedEntries: string[];   // canonical names changed
  deprecatedEntries: string[]; // canonical names deprecated in this version
  notes?: string;
}

export interface OntologyModule {
  id: string;
  displayName: string;
  version: string;
  entries: OntologyEntry[];
  /** Optional changelog for this version */
  changelog?: string;
}

// ─── Ontology Registry ────────────────────────────────────────────────────────

class OntologyRegistryImpl {
  private readonly modules = new Map<string, OntologyModule>();
  /** Lower-cased alias → OntologyEntry (for O(1) lookup) */
  private readonly aliasIndex = new Map<string, OntologyEntry>();
  /** Deprecated alias → canonical form */
  private readonly deprecatedIndex = new Map<string, string>();
  /** Version history per module */
  private readonly versionHistory = new Map<string, OntologyVersion[]>();

  /** Register (or replace) an ontology module. */
  load(module: OntologyModule, versionMeta?: Omit<OntologyVersion, 'moduleId' | 'changedAt'>): void {
    const previous = this.modules.get(module.id);
    this.modules.set(module.id, module);

    // Track version history
    if (versionMeta || previous) {
      const history = this.versionHistory.get(module.id) ?? [];
      history.push({
        moduleId: module.id,
        version: module.version,
        previousVersion: previous?.version,
        changedAt: new Date().toISOString(),
        addedEntries: versionMeta?.addedEntries ?? [],
        removedEntries: versionMeta?.removedEntries ?? [],
        modifiedEntries: versionMeta?.modifiedEntries ?? [],
        deprecatedEntries: versionMeta?.deprecatedEntries ?? [],
        notes: versionMeta?.notes ?? module.changelog,
      });
      this.versionHistory.set(module.id, history);
    }

    // Index all aliases and canonical form
    for (const entry of module.entries) {
      const keys = [entry.canonical, ...entry.aliases];
      for (const key of keys) {
        this.aliasIndex.set(key.toLowerCase().trim(), entry);
      }
      // Index deprecated aliases → redirect to canonical
      if (entry.deprecated) {
        for (const dep of entry.deprecated) {
          this.deprecatedIndex.set(dep.toLowerCase().trim(), entry.canonical);
          // Also add to alias index so lookup still works (but marks as deprecated)
          this.aliasIndex.set(dep.toLowerCase().trim(), entry);
        }
      }
    }
  }

  /**
   * Look up a span in all loaded ontologies.
   * Returns the best-matching OntologyEntry or null.
   * Deprecated aliases are transparently redirected to canonical.
   */
  lookup(span: string): OntologyEntry | null {
    const key = span.toLowerCase().trim();
    if (this.aliasIndex.has(key)) return this.aliasIndex.get(key)!;

    // Partial match — check if any key is a substring of the span or vice versa
    for (const [alias, entry] of this.aliasIndex) {
      if (key.includes(alias) || alias.includes(key)) {
        if (alias.length >= 3) return entry;
      }
    }
    return null;
  }

  /** Returns true if this span is a deprecated alias. */
  isDeprecated(span: string): boolean {
    return this.deprecatedIndex.has(span.toLowerCase().trim());
  }

  /** Returns the canonical form if the span is deprecated, else null. */
  getDeprecatedRedirect(span: string): string | null {
    return this.deprecatedIndex.get(span.toLowerCase().trim()) ?? null;
  }

  /** Get all deprecated aliases across all modules. */
  listDeprecated(): Array<{ deprecated: string; canonical: string }> {
    return [...this.deprecatedIndex.entries()].map(([dep, can]) => ({ deprecated: dep, canonical: can }));
  }

  /** Get the current version of a module. */
  getVersion(moduleId: string): string | null {
    return this.modules.get(moduleId)?.version ?? null;
  }

  /** Get the full version history for a module. */
  getChangelog(moduleId: string): OntologyVersion[] {
    return this.versionHistory.get(moduleId) ?? [];
  }

  /** Get the full taxonomy path for a canonical skill name. */
  getTaxonomy(canonical: string): string[] {
    const entry = this.lookup(canonical);
    return entry?.taxonomy ?? [];
  }

  /** Get all loaded module IDs. */
  getLoadedModules(): string[] {
    return Array.from(this.modules.keys());
  }

  /** Total number of indexed entries across all ontologies. */
  totalEntries(): number {
    return this.aliasIndex.size;
  }

  /** Check if an ontology module is loaded. */
  isLoaded(moduleId: string): boolean {
    return this.modules.has(moduleId);
  }
}

/** Singleton ontology registry — shared across the pipeline. */
export const ontologyRegistry = new OntologyRegistryImpl();

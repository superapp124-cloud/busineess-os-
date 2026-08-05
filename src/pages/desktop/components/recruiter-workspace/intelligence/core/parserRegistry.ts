/**
 * Resume Intelligence OS v3.0 — Parser Registry
 *
 * Plugin system for extraction providers + version tracking.
 * New extractors register themselves — the pipeline auto-discovers them.
 * Version tracking on all stages enables background re-processing when parsers update.
 */

import type { ResumeFamilyId, IngestionDocument, ExtractionArtifact, ParserVersions } from './types';

// ─── Extractor Plugin Interface ───────────────────────────────────────────────

export interface ExtractorPlugin {
  /** Unique plugin identifier e.g. 'native-text', 'tesseract-ocr', 'azure-read' */
  readonly id: string;
  /** Resume families this plugin handles. Empty array = handles all families. */
  readonly supportedFamilies: ResumeFamilyId[];
  /** Priority — higher priority plugins are tried first (default: 0) */
  readonly priority: number;
  /** Attempt extraction. Returns null if this plugin cannot handle the document. */
  extract(doc: IngestionDocument): Promise<ExtractionArtifact | null>;
}

// ─── Current Parser Versions ──────────────────────────────────────────────────

export const CURRENT_PARSER_VERSIONS: Omit<ParserVersions, 'processedAt'> = {
  ocr:            '1.0.0',
  layout:         '2.0.0',
  section:        '2.0.0',
  ner:            '3.0.0',
  resolver:       '1.0.0',
  ontology:       '1.0.0',
  graph:          '3.0.0',
  validation:     '3.0.0',
  explainability: '1.0.0',
};

export function getCurrentParserVersions(): ParserVersions {
  return { ...CURRENT_PARSER_VERSIONS, processedAt: new Date().toISOString() };
}

// ─── Parser Registry ──────────────────────────────────────────────────────────

class ParserRegistryImpl {
  private readonly plugins: ExtractorPlugin[] = [];

  /** Register a new extraction plugin. */
  register(plugin: ExtractorPlugin): void {
    if (this.plugins.some(p => p.id === plugin.id)) {
      console.warn(`[ParserRegistry] Plugin "${plugin.id}" already registered — skipping duplicate.`);
      return;
    }
    this.plugins.push(plugin);
    // Keep sorted by priority (descending)
    this.plugins.sort((a, b) => b.priority - a.priority);
  }

  /** Get all plugins that support a given resume family, sorted by priority. */
  getForFamily(family: ResumeFamilyId): ExtractorPlugin[] {
    return this.plugins.filter(
      p => p.supportedFamilies.length === 0 || p.supportedFamilies.includes(family)
    );
  }

  /** Get all registered plugins. */
  getAll(): ExtractorPlugin[] {
    return [...this.plugins];
  }

  /** Check if any plugin is registered for a family. */
  hasPluginFor(family: ResumeFamilyId): boolean {
    return this.getForFamily(family).length > 0;
  }
}

export const parserRegistry = new ParserRegistryImpl();

// ─── Built-in: Native Text Provider ──────────────────────────────────────────

class NativeTextPlugin implements ExtractorPlugin {
  readonly id = 'native-text';
  readonly supportedFamilies: ResumeFamilyId[] = []; // supports all families
  readonly priority = 100;

  async extract(doc: IngestionDocument): Promise<ExtractionArtifact | null> {
    const text = doc.nativeText?.trim();
    if (!text || text.length < 10) return null;
    return {
      source: 'native-text',
      provider: this.id,
      version: CURRENT_PARSER_VERSIONS.ocr,
      pages: [{ page: 1, text, confidence: 1.0 }],
    };
  }
}

// Auto-register the built-in native text provider
parserRegistry.register(new NativeTextPlugin());

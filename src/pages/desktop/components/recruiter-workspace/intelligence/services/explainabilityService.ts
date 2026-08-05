/**
 * Resume Intelligence OS v3.0 — Explainability Service
 *
 * Standalone service. UI calls explainField() and receives a full audit record.
 * No explainability logic is embedded in UI components.
 */

import type { SemanticEntity, ParserVersions, EntityLineage, StageConfidence } from '../core/types';
import type { CandidateKnowledgeGraph } from '../graphs/knowledgeGraph';
import { evidenceStore } from '../core/evidenceStore';
import { FIELD_CONTRACTS } from '../validation/fieldContracts';

// ─── Explainability Result ────────────────────────────────────────────────────

export interface ExplainabilityResult {
  fieldKey: string;
  displayName: string;
  displayValue: string;
  isVerified: boolean;
  confidence: StageConfidence;
  confidencePct: number;
  section: string;
  page: number;
  evidenceSnippet: string;
  parserVersions: ParserVersions;
  ontologySource?: string;
  lineage: EntityLineage;
  rejectedCandidates: Array<{ value: string; type: string; reason: string }>;
  staleness: 'fresh' | 'aging' | 'stale' | 'unknown';
}

// ─── Field-to-entity mapping ──────────────────────────────────────────────────

function findEntityForField(
  graph: CandidateKnowledgeGraph,
  fieldKey: string
): SemanticEntity | null {
  const contract = FIELD_CONTRACTS[fieldKey];
  if (!contract) return null;

  const qualifying = graph.allEntities.filter(e =>
    contract.allowedTypes.includes(e.canonicalType) &&
    e.confidence.overall >= contract.minConfidence
  );

  if (qualifying.length === 0) return null;
  return qualifying.reduce((best, e) =>
    e.confidence.overall > best.confidence.overall ? e : best
  );
}

// ─── Main Explainability Function ─────────────────────────────────────────────

export function explainField(
  graph: CandidateKnowledgeGraph,
  fieldKey: string
): ExplainabilityResult {
  const contract = FIELD_CONTRACTS[fieldKey];
  const displayName = contract?.displayName ?? fieldKey;
  const sentinel = contract?.unverifiedSentinel ?? '';

  const entity = findEntityForField(graph, fieldKey);
  const evidence = entity ? evidenceStore.get(entity.evidenceId) : null;

  // Find all rejected candidates for this field
  const rejectedCandidates = graph.allEntities
    .filter(e => !contract?.allowedTypes.includes(e.canonicalType) || e.confidence.overall < (contract?.minConfidence ?? 0))
    .filter(e => {
      // Only show entities that were "close" — i.e. same region or section
      if (!entity) return false;
      return e.layoutRegion === entity.layoutRegion || e.sourceSection === entity.sourceSection;
    })
    .slice(0, 5)
    .map(e => ({
      value: e.value,
      type: e.canonicalType,
      reason: !contract?.allowedTypes.includes(e.canonicalType)
        ? `Type '${e.canonicalType}' not allowed for ${displayName}`
        : `Confidence ${(e.confidence.overall * 100).toFixed(0)}% below threshold ${((contract?.minConfidence ?? 0) * 100).toFixed(0)}%`,
    }));

  const staleness: ExplainabilityResult['staleness'] = !entity ? 'unknown'
    : entity.decayedAt ? (entity.decayedConfidence && (entity.confidence.overall - entity.decayedConfidence) > 0.15 ? 'stale' : 'aging')
    : 'fresh';

  return {
    fieldKey,
    displayName,
    displayValue: entity?.value ?? sentinel,
    isVerified: Boolean(entity),
    confidence: entity?.confidence ?? {
      lexical: 0, layout: 0, section: 0, ontology: 0, relationship: 0, overall: 0,
    },
    confidencePct: Math.round((entity?.confidence.overall ?? 0) * 100),
    section: entity?.sourceSection ?? 'Not Found',
    page: entity?.sourcePage ?? 0,
    evidenceSnippet: evidence?.contextSnippet ?? entity?.sourceSpan ?? 'No evidence',
    parserVersions: entity?.parserVersions ?? graph.parserVersions,
    ontologyVersion: entity?.ontologyVersion !== 'none' ? entity?.ontologyVersion : undefined,
    lineage: entity?.lineage ?? {
      rawOcr: '',
      normalizedText: '',
      semanticEntityId: '',
      graphNodeId: '',
      validatedFieldKey: fieldKey,
    },
    rejectedCandidates,
    staleness,
  } as ExplainabilityResult;
}

/**
 * Explain all fields for a candidate graph.
 * Returns a complete audit record for every recruiter-visible field.
 */
export function explainAllFields(
  graph: CandidateKnowledgeGraph
): Record<string, ExplainabilityResult> {
  const results: Record<string, ExplainabilityResult> = {};
  for (const fieldKey of Object.keys(FIELD_CONTRACTS)) {
    results[fieldKey] = explainField(graph, fieldKey);
  }
  return results;
}

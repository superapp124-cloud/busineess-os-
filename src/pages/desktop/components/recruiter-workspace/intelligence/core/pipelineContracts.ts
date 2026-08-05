/**
 * Resume Intelligence OS v3.0 — Pipeline Contracts
 *
 * Every pipeline stage publishes typed Input/Output contracts.
 * Enables:
 *   - Independent stage testing
 *   - Breaking change detection on parser upgrades
 *   - Self-describing pipeline for debugging and observability
 */

import type { SemanticEntity, DocumentLayoutGraph, ExtractedPage, ParserVersions } from './types';
import type { ResolvedEntity } from '../extraction/entityResolver';
import type { CandidateKnowledgeGraph } from '../graphs/knowledgeGraph';

// ─── Contract Validation Result ───────────────────────────────────────────────

export interface ContractValidationResult {
  valid: boolean;
  violations: ContractViolation[];
}

export interface ContractViolation {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

// ─── Pipeline Stage Contract ───────────────────────────────────────────────────

export interface PipelineContract<TInput, TOutput> {
  stageName: string;
  version: string;
  /**
   * Whether this contract is backward-compatible with the previous version.
   * false = breaking change. Parser upgrade detector will flag this.
   */
  backwardCompatible: boolean;
  /** Input validation — runs before the stage executes */
  validateInput(input: TInput): ContractValidationResult;
  /** Output validation — runs after the stage produces output */
  validateOutput(output: TOutput): ContractValidationResult;
}

// ─── Contract Helpers ─────────────────────────────────────────────────────────

function pass(): ContractValidationResult {
  return { valid: true, violations: [] };
}

function fail(violations: ContractViolation[]): ContractValidationResult {
  return { valid: false, violations };
}

function check(
  condition: boolean,
  field: string,
  message: string,
  severity: 'error' | 'warning' = 'error'
): ContractViolation | null {
  return condition ? null : { field, message, severity };
}

function collect(...vs: (ContractViolation | null)[]): ContractValidationResult {
  const violations = vs.filter((v): v is ContractViolation => v !== null);
  return { valid: !violations.some(v => v.severity === 'error'), violations };
}

// ─── Stage Contracts ──────────────────────────────────────────────────────────

/** OCR / Native Text Extraction */
export const OcrContract: PipelineContract<ExtractedPage[], ExtractedPage[]> = {
  stageName: 'ocr',
  version: '1.0.0',
  backwardCompatible: true,
  validateInput: (pages) => collect(
    check(Array.isArray(pages), 'pages', 'Pages must be an array'),
    check(pages.length > 0, 'pages', 'At least one page is required')
  ),
  validateOutput: (pages) => collect(
    check(pages.every(p => typeof p.text === 'string'), 'pages[].text', 'Every page must have a text field'),
    check(pages.every(p => p.confidence >= 0 && p.confidence <= 1), 'pages[].confidence', 'Confidence must be 0–1', 'warning')
  ),
};

/** Layout Graph Building */
export const LayoutContract: PipelineContract<ExtractedPage[], DocumentLayoutGraph> = {
  stageName: 'layout',
  version: '2.0.0',
  backwardCompatible: true,
  validateInput: OcrContract.validateOutput,
  validateOutput: (graph) => collect(
    check(Array.isArray(graph.nodes), 'nodes', 'Layout graph must have nodes array'),
    check(graph.nodes.length > 0, 'nodes', 'At least one layout node is required', 'warning'),
    check(graph.qualityScore >= 0 && graph.qualityScore <= 100, 'qualityScore', 'qualityScore must be 0–100')
  ),
};

/** Entity Extraction */
export const EntityExtractionContract: PipelineContract<DocumentLayoutGraph, SemanticEntity[]> = {
  stageName: 'entity-extraction',
  version: '3.0.0',
  backwardCompatible: true,
  validateInput: LayoutContract.validateOutput,
  validateOutput: (entities) => {
    const violations: (ContractViolation | null)[] = [
      check(Array.isArray(entities), 'entities', 'Entities must be an array'),
    ];
    for (const e of entities) {
      violations.push(
        check(!!e.id, 'entity.id', `Entity missing ID: ${e.value}`),
        check(!!e.canonicalType, 'entity.canonicalType', `Entity "${e.value}" missing canonicalType`),
        check(!!e.evidenceId, 'entity.evidenceId', `Entity "${e.value}" missing evidenceId`, 'warning'),
        check(e.confidence.overall >= 0 && e.confidence.overall <= 1, 'entity.confidence.overall', `Entity "${e.value}" confidence out of range`)
      );
    }
    return collect(...violations);
  },
};

/** Entity Resolution (alias → canonical) */
export const EntityResolutionContract: PipelineContract<SemanticEntity[], ResolvedEntity[]> = {
  stageName: 'entity-resolution',
  version: '1.0.0',
  backwardCompatible: true,
  validateInput: (entities) => collect(
    check(Array.isArray(entities), 'entities', 'Input must be a SemanticEntity array')
  ),
  validateOutput: (resolved) => {
    const violations: (ContractViolation | null)[] = [
      check(Array.isArray(resolved), 'resolved', 'Output must be a ResolvedEntity array'),
    ];
    for (const r of resolved) {
      violations.push(
        check(!!r.canonicalForm, 'resolved.canonicalForm', `Resolved entity missing canonicalForm for: ${r.rawSpan}`),
        check(r.resolverConfidence >= 0, 'resolved.resolverConfidence', `ResolverConfidence must be >= 0`)
      );
    }
    return collect(...violations);
  },
};

/** Knowledge Graph Building */
export const GraphBuilderContract: PipelineContract<SemanticEntity[], CandidateKnowledgeGraph> = {
  stageName: 'graph-builder',
  version: '3.0.0',
  backwardCompatible: true,
  validateInput: EntityExtractionContract.validateOutput,
  validateOutput: (graph) => collect(
    check(!!graph.candidateId, 'candidateId', 'Knowledge graph must have a candidateId'),
    check(!!graph.identity, 'identity', 'Knowledge graph must have an identity graph'),
    check(!!graph.career, 'career', 'Knowledge graph must have a career graph'),
    check(!!graph.competency, 'competency', 'Knowledge graph must have a competency graph'),
    check(Array.isArray(graph.allEntities), 'allEntities', 'allEntities must be an array')
  ),
};

/** Validation Layer */
export const ValidationContract: PipelineContract<CandidateKnowledgeGraph, CandidateKnowledgeGraph> = {
  stageName: 'validation',
  version: '3.0.0',
  backwardCompatible: true,
  validateInput: GraphBuilderContract.validateOutput,
  validateOutput: (graph) => collect(
    check(!!graph.qualityGate, 'qualityGate', 'Validated graph must have qualityGate result', 'warning')
  ),
};

// ─── Breaking Change Detector ─────────────────────────────────────────────────

export interface BreakingChangeReport {
  stage: string;
  previousVersion: string;
  currentVersion: string;
  isBreakingChange: boolean;
  message: string;
}

export function detectBreakingChanges(
  previous: Record<string, { version: string }>,
  current: PipelineContract<unknown, unknown>[]
): BreakingChangeReport[] {
  return current.map(contract => {
    const prev = previous[contract.stageName];
    return {
      stage: contract.stageName,
      previousVersion: prev?.version ?? 'none',
      currentVersion: contract.version,
      isBreakingChange: !contract.backwardCompatible,
      message: !contract.backwardCompatible
        ? `⚠️ BREAKING: ${contract.stageName} v${contract.version} is not backward-compatible with v${prev?.version}`
        : `✅ ${contract.stageName} v${contract.version} is backward-compatible`,
    };
  });
}

/** All pipeline contracts in execution order */
export const ALL_CONTRACTS: PipelineContract<unknown, unknown>[] = [
  OcrContract,
  LayoutContract,
  EntityExtractionContract,
  EntityResolutionContract,
  GraphBuilderContract,
  ValidationContract,
];

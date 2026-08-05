/**
 * Resume Intelligence OS v3.0 — Quality Gate Engine
 *
 * Produces per-stage quality scores and a weighted overall quality grade.
 * A parse is considered passing if overall quality >= 70.
 */

import type { QualityGateResult, QualityStageScores, DocumentLayoutGraph, SemanticEntity } from '../core/types';

// ─── Quality Gate Weights ─────────────────────────────────────────────────────

const WEIGHTS: Record<keyof QualityStageScores, number> = {
  ocr:          0.10,
  layout:       0.15,
  section:      0.20,
  entity:       0.25,
  relationship: 0.00, // computed separately below
  validation:   0.30,
};

const PASS_THRESHOLD = 70;

// ─── Stage Scorers ────────────────────────────────────────────────────────────

/** Score the OCR extraction stage. */
export function scoreOcr(avgPageConfidence: number, textLength: number): number {
  if (textLength < 100) return 20;
  const baseScore = Math.round(avgPageConfidence * 80);
  const lengthBonus = Math.min(20, Math.round(textLength / 500));
  return Math.min(100, baseScore + lengthBonus);
}

/** Score the layout detection stage. */
export function scoreLayout(graph: DocumentLayoutGraph): number {
  if (graph.nodes.length === 0) return 10;
  const namedSections = graph.nodes.filter(n => n.layoutRegion !== 'unknown').length;
  const ratio = namedSections / Math.max(graph.nodes.length, 1);
  return Math.min(100, Math.round(ratio * 100 * 0.7 + graph.qualityScore * 0.3));
}

/** Score the section detection stage. */
export function scoreSections(graph: DocumentLayoutGraph): number {
  const requiredSections = ['employment', 'skills', 'education', 'contact'];
  const found = requiredSections.filter(r =>
    graph.nodes.some(n => n.layoutRegion === r)
  ).length;
  return Math.round((found / requiredSections.length) * 100);
}

/** Score the entity extraction stage. */
export function scoreEntities(entities: SemanticEntity[], totalLines: number): number {
  if (entities.length === 0) return 5;
  const unknownCount = entities.filter(e => e.canonicalType === 'Unknown').length;
  const unknownRate = unknownCount / Math.max(entities.length, 1);
  const avgConfidence = entities.reduce((s, e) => s + e.confidence.overall, 0) / entities.length;
  const entityDensity = Math.min(1, entities.length / Math.max(totalLines * 0.3, 1));
  return Math.round(
    (1 - unknownRate) * 40 +
    avgConfidence * 40 +
    entityDensity * 20
  );
}

/** Score the validation stage based on how many fields passed their contracts. */
export function scoreValidation(verifiedFields: number, totalFields: number): number {
  if (totalFields === 0) return 0;
  return Math.round((verifiedFields / totalFields) * 100);
}

// ─── Main Quality Gate ────────────────────────────────────────────────────────

export interface QualityGateInput {
  avgOcrConfidence: number;
  textLength: number;
  layoutGraph: DocumentLayoutGraph;
  entities: SemanticEntity[];
  totalTextLines: number;
  verifiedFieldCount: number;
  totalFieldCount: number;
  relationshipViolations: number;
}

export function computeQualityGate(input: QualityGateInput): QualityGateResult {
  const stages: QualityStageScores = {
    ocr:          scoreOcr(input.avgOcrConfidence, input.textLength),
    layout:       scoreLayout(input.layoutGraph),
    section:      scoreSections(input.layoutGraph),
    entity:       scoreEntities(input.entities, input.totalTextLines),
    relationship: Math.max(0, 100 - input.relationshipViolations * 20),
    validation:   scoreValidation(input.verifiedFieldCount, input.totalFieldCount),
  };

  const overallQuality = Math.round(
    stages.ocr          * WEIGHTS.ocr          +
    stages.layout       * WEIGHTS.layout        +
    stages.section      * WEIGHTS.section       +
    stages.entity       * WEIGHTS.entity        +
    stages.validation   * WEIGHTS.validation
  );

  const failedStages = (Object.keys(stages) as Array<keyof QualityStageScores>)
    .filter(k => stages[k] < 50)
    .map(k => `${k} (${stages[k]})`);

  const warnings: string[] = [];
  if (stages.ocr < 60)       warnings.push('Low OCR confidence — consider higher quality document');
  if (stages.entity < 50)    warnings.push('Low entity extraction rate — many spans unclassified');
  if (stages.validation < 60) warnings.push('Many fields failed validation — review document completeness');
  if (stages.layout < 40)    warnings.push('Layout detection struggled — possibly multi-column or image PDF');

  return {
    stages,
    overallQuality,
    passed: overallQuality >= PASS_THRESHOLD,
    failedStages,
    warnings,
  };
}

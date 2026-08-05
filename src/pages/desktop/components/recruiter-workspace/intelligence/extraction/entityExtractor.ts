/**
 * Resume Intelligence OS v3.0 — Entity Extractor (5-Stage Classifier)
 *
 * Classifies raw text spans into SemanticEntityType through 5 weighted stages:
 *   Stage 1 (5%):  Lexical  — regex + length heuristics
 *   Stage 2 (30%): Layout   — which document region contains this span
 *   Stage 3 (30%): Section  — which section header precedes this span
 *   Stage 4 (20%): Ontology — does this span exist in a known ontology
 *   Stage 5 (15%): Relationship — is this connected to a validated graph node
 *
 * Context (layout + section) outweighs lexical patterns — by design.
 */

import type {
  SemanticEntityType, SemanticEntity, StageConfidence,
  ClassificationContext, LayoutRegion, ParserVersions, EntityLineage,
} from '../core/types';
import { computeOverallConfidence } from '../core/types';
import { resolveEntity } from './entityResolver';
import { evidenceStore } from '../core/evidenceStore';
import { getCurrentParserVersions } from '../core/parserRegistry';

// ─── Stage 1: Lexical Classifier ──────────────────────────────────────────────

const RESPONSIBILITY_RE = /^(responsible\s+for|handling|managed|developed|configured|implemented|strive|working\s+on|providing|assisting|monitoring|troubleshooting|participating|ensuring|creating|leading|building|architecting|reviewing)\b/i;
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_RE = /^[\+\d][\d\s\-().]{6,18}$/;
const LINKEDIN_RE = /linkedin\.com\/in\//i;
const GITHUB_RE = /github\.com\//i;
const URL_RE = /^https?:\/\//i;
const YEAR_RANGE_RE = /\b(?:19|20)\d{2}\s*[-–—to]\s*(?:(?:19|20)\d{2}|present|current|ongoing)\b/i;
const DEGREE_RE = /\b(b\.?e\.?|b\.?tech\.?|m\.?tech\.?|m\.?sc\.?|b\.?sc\.?|ph\.?d\.?|m\.?b\.?a\.?|b\.?com\.?|m\.?com\.?|b\.?a\.?|m\.?a\.?|diploma|llb|llm|b\.?d\.?s\.?|m\.?b\.?b\.?s\.?)\b/i;
const CITY_RE = /\b(bangalore|bengaluru|mumbai|delhi|noida|gurgaon|gurugram|hyderabad|pune|chennai|kolkata|ahmedabad|jaipur|lucknow|kochi|coimbatore|nagpur|bhopal|indore|new\s+york|london|singapore|dubai)\b/i;
const COMPANY_SUFFIX_RE = /\b(pvt\.?\s*ltd\.?|ltd\.?|inc\.?|corp\.?|corporation|technologies|solutions|infotech|software|systems|services|consulting|labs|group|holdings|bank|hospital|institute|university|llp|llc|gmbh|plc)\b/i;
const DESIGNATION_RE = /\b(engineer|developer|consultant|analyst|lead|manager|executive|architect|administrator|specialist|officer|director|principal|president|vp|ceo|cto|cfo|coo|head|dean|professor|researcher|scientist|physician|doctor|pilot|captain)\b/i;
const SKILL_LENGTH_MAX = 40;
const NOISE_RE = /in\s+an\s+organization|strive\s+for\s+excellence|career\s+objective|documentation|effectiveness|including\s+service|regulations|improvements/i;

function lexicalClassify(span: string): { type: SemanticEntityType; confidence: number } {
  if (!span || span.length < 2) return { type: 'Unknown', confidence: 0 };
  if (NOISE_RE.test(span) || span.split(' ').length > 10) return { type: 'Responsibility', confidence: 0.8 };
  if (RESPONSIBILITY_RE.test(span)) return { type: 'Responsibility', confidence: 0.85 };
  if (EMAIL_RE.test(span)) return { type: 'Email', confidence: 0.99 };
  if (PHONE_RE.test(span)) return { type: 'MobileNumber', confidence: 0.85 };
  if (LINKEDIN_RE.test(span)) return { type: 'LinkedIn', confidence: 0.99 };
  if (GITHUB_RE.test(span)) return { type: 'GitHub', confidence: 0.99 };
  if (URL_RE.test(span)) return { type: 'Website', confidence: 0.9 };
  if (YEAR_RANGE_RE.test(span)) return { type: 'EmploymentPeriod', confidence: 0.9 };
  if (DEGREE_RE.test(span)) return { type: 'Degree', confidence: 0.85 };
  if (CITY_RE.test(span) && !COMPANY_SUFFIX_RE.test(span)) return { type: 'City', confidence: 0.8 };
  if (COMPANY_SUFFIX_RE.test(span)) return { type: 'Employer', confidence: 0.75 };
  if (DESIGNATION_RE.test(span) && span.split(' ').length <= 7) return { type: 'JobTitle', confidence: 0.75 };
  if (span.length <= SKILL_LENGTH_MAX && /^[A-Z]/.test(span)) return { type: 'Unknown', confidence: 0.3 };
  return { type: 'Unknown', confidence: 0.1 };
}

// ─── Stage 2: Layout Classifier ───────────────────────────────────────────────

const LAYOUT_TYPE_MAP: Record<LayoutRegion, SemanticEntityType> = {
  header:         'PersonName',
  contact:        'Email',
  summary:        'ExecutiveSummary',
  objective:      'CareerObjective',
  employment:     'Employer',
  skills:         'TechnicalSkill',
  education:      'Degree',
  certifications: 'CertificationName',
  projects:       'ProjectTitle',
  achievements:   'Achievement',
  awards:         'Award',
  footer:         'Unknown',
  unknown:        'Unknown',
};

function layoutClassify(span: string, region: LayoutRegion): { type: SemanticEntityType; confidence: number } {
  const suggestedType = LAYOUT_TYPE_MAP[region];
  const confidence = region === 'unknown' ? 0.1 : 0.7;
  return { type: suggestedType, confidence };
}

// ─── Stage 3: Section Classifier ──────────────────────────────────────────────

const SECTION_LABEL_MAP: Record<string, SemanticEntityType> = {
  'Employment':     'Employer',
  'Skills':         'TechnicalSkill',
  'Education':      'Degree',
  'Certifications': 'CertificationName',
  'Projects':       'ProjectTitle',
  'Summary':        'ExecutiveSummary',
  'Objective':      'CareerObjective',
  'Contact':        'Email',
  'Awards':         'Award',
  'Header':         'PersonName',
};

function sectionClassify(span: string, sectionLabel: string): { type: SemanticEntityType; confidence: number } {
  const type = SECTION_LABEL_MAP[sectionLabel] ?? 'Unknown';
  const confidence = type === 'Unknown' ? 0.1 : 0.72;
  return { type, confidence };
}

// ─── Stage 4: Ontology Classifier ─────────────────────────────────────────────

function ontologyClassify(resolved: ReturnType<typeof resolveEntity>): { type: SemanticEntityType; confidence: number } {
  if (!resolved.ontologyEntry) return { type: 'Unknown', confidence: 0 };
  return {
    type: resolved.ontologyEntry.skillType,
    confidence: resolved.resolverConfidence,
  };
}

// ─── Stage 5: Relationship Validator ──────────────────────────────────────────

interface MinimalGraph {
  hasEmploymentNode: boolean;
  hasIdentityNode: boolean;
}

function relationshipClassify(
  proposedType: SemanticEntityType,
  context: ClassificationContext,
  graph: MinimalGraph
): { valid: boolean; confidence: number } {
  // Employer must live in employment region
  if (proposedType === 'Employer' && context.layoutRegion !== 'employment') {
    return { valid: false, confidence: 0 };
  }
  // PersonName only valid in header region
  if (proposedType === 'PersonName' && context.layoutRegion !== 'header' && context.layoutRegion !== 'contact') {
    return { valid: false, confidence: 0.3 };
  }
  // Responsibility should never be an Employer
  if (proposedType === 'Employer' && RESPONSIBILITY_RE.test(context.layoutNode.label)) {
    return { valid: false, confidence: 0 };
  }
  // Skills region → skill types only
  if (context.layoutRegion === 'skills' && !['TechnicalSkill','DomainSkill','SoftSkill','PlatformSkill','ToolSkill','LanguageSkill'].includes(proposedType)) {
    return { valid: false, confidence: 0.2 };
  }
  return { valid: true, confidence: graph.hasEmploymentNode ? 0.85 : 0.6 };
}

// ─── Weighted Vote ────────────────────────────────────────────────────────────

function weightedVote(
  lexical: { type: SemanticEntityType; confidence: number },
  layout:  { type: SemanticEntityType; confidence: number },
  section: { type: SemanticEntityType; confidence: number },
  ontology:{ type: SemanticEntityType; confidence: number },
): SemanticEntityType {
  // Build weighted score per type
  const scores = new Map<SemanticEntityType, number>();
  const add = (t: SemanticEntityType, w: number, c: number) =>
    scores.set(t, (scores.get(t) ?? 0) + w * c);

  add(lexical.type,  0.05, lexical.confidence);
  add(layout.type,   0.30, layout.confidence);
  add(section.type,  0.30, section.confidence);
  add(ontology.type, 0.35, ontology.confidence); // extra weight if ontology matched

  let best: SemanticEntityType = 'Unknown';
  let bestScore = 0;
  for (const [type, score] of scores) {
    if (score > bestScore) { best = type; bestScore = score; }
  }
  return best;
}

// ─── Main Classification Entry Point ──────────────────────────────────────────

let _entityCounter = 0;

export function classifySpan(
  rawSpan: string,
  context: ClassificationContext,
  graphHints: MinimalGraph = { hasEmploymentNode: false, hasIdentityNode: false }
): SemanticEntity {
  const resolved = resolveEntity(rawSpan);
  const span = resolved.canonicalForm;

  // Run all 5 stages
  const lex  = lexicalClassify(span);
  const lay  = layoutClassify(span, context.layoutRegion);
  const sec  = sectionClassify(span, context.layoutNode.label);
  const ont  = ontologyClassify(resolved);
  const rel  = relationshipClassify(
    weightedVote(lex, lay, sec, ont), context, graphHints
  );

  const finalType = rel.valid
    ? weightedVote(lex, lay, sec, ont)
    : (rel.confidence < 0.2 ? 'Unknown' : weightedVote(lex, lay, sec, ont));

  const stageConfidence: StageConfidence = {
    lexical:      lex.confidence,
    layout:       lay.confidence,
    section:      sec.confidence,
    ontology:     ont.confidence,
    relationship: rel.confidence,
    overall:      computeOverallConfidence({
      lexical: lex.confidence,
      layout:  lay.confidence,
      section: sec.confidence,
      ontology:ont.confidence,
      relationship: rel.confidence,
    }),
  };

  const parserVersions: ParserVersions = getCurrentParserVersions();
  const entityId = `ent-${++_entityCounter}-${Date.now().toString(36)}`;

  // Store evidence once
  const evidenceId = evidenceStore.put({
    value: rawSpan,
    normalizedValue: span,
    page: context.layoutNode.page,
    section: context.layoutNode.label,
    layoutRegion: context.layoutRegion,
    readingOrder: context.readingOrder,
    extractor: 'entity-extractor-v3',
    ocrConfidence: 1.0,
    extractedAt: parserVersions.processedAt,
    contextSnippet: `${context.precedingLine} | ${rawSpan} | ${context.followingLine}`,
  });

  const lineage: EntityLineage = {
    rawOcr: rawSpan,
    normalizedText: span,
    resolvedAlias: resolved.resolvedAlias ?? undefined,
    ontologyCanonical: resolved.ontologyEntry?.canonical,
    semanticEntityId: entityId,
    graphNodeId: '',        // filled in by graph builder
    validatedFieldKey: '',  // filled in by field contracts layer
  };

  return {
    id: entityId,
    value: span,
    canonicalType: finalType,
    confidence: stageConfidence,
    sourcePage: context.layoutNode.page,
    sourceSection: context.layoutNode.label,
    sectionId: context.layoutNode.nodeId,
    layoutRegion: context.layoutRegion,
    readingOrder: context.readingOrder,
    sourceSpan: rawSpan,
    extractorId: 'entity-extractor-v3',
    parserVersions,
    ontologyVersion: resolved.ontologyEntry ? '1.0.0' : 'none',
    graphVersion: '3.0.0',
    timestamp: parserVersions.processedAt,
    lineage,
    evidenceId,
  };
}

/**
 * Extract and classify all meaningful spans from a set of text lines.
 * Returns a classified SemanticEntity for each span that passes minimum confidence.
 */
export function extractEntitiesFromLines(
  lines: string[],
  getContext: (line: string, index: number) => ClassificationContext,
  graphHints?: MinimalGraph,
  minConfidence = 0.3
): SemanticEntity[] {
  const entities: SemanticEntity[] = [];
  const seen = new Set<string>();

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 2) return;

    const key = `${trimmed.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);

    const context = getContext(trimmed, idx);
    const entity = classifySpan(trimmed, context, graphHints);

    if (entity.confidence.overall >= minConfidence && entity.canonicalType !== 'Responsibility') {
      entities.push(entity);
    }
  });

  return entities;
}

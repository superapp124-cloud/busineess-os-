/**
 * Resume Intelligence OS v3.0 — Core Types
 *
 * Single source of truth for every type used across the intelligence pipeline.
 * Contains zero business logic. All other modules import from here.
 */

// ─── Semantic Entity Type ─────────────────────────────────────────────────────

export type SemanticEntityType =
  // Identity
  | 'PersonName' | 'PreferredName' | 'Initials' | 'CandidateId' | 'EmployeeId'
  // Contact
  | 'Email' | 'MobileNumber' | 'AlternatePhone' | 'LinkedIn' | 'GitHub'
  | 'Portfolio' | 'Website' | 'StackOverflow'
  // Address
  | 'City' | 'State' | 'Country' | 'ZipCode' | 'Nationality'
  // Employment
  | 'Employer' | 'Client' | 'Vendor' | 'StaffingAgency' | 'PayrollCompany'
  | 'Subsidiary' | 'ImplementationPartner' | 'ConsultingPartner'
  // Designation
  | 'JobTitle' | 'Role' | 'Grade' | 'Band' | 'Level' | 'Prefix'
  // Education
  | 'Degree' | 'University' | 'Institute' | 'Board' | 'PassingYear' | 'Specialization'
  // Certification
  | 'CertificationName' | 'CertificationIssuer' | 'CertificationYear' | 'CertificationId'
  // Skills
  | 'TechnicalSkill' | 'DomainSkill' | 'SoftSkill' | 'PlatformSkill' | 'ToolSkill' | 'LanguageSkill'
  // Projects
  | 'ProjectTitle' | 'ProjectClient' | 'ProjectRole' | 'ProjectTechStack' | 'ProjectDuration'
  // Responsibilities
  | 'Responsibility' | 'Achievement' | 'ActionVerb'
  // Timeline
  | 'StartDate' | 'EndDate' | 'Duration' | 'EmploymentPeriod' | 'Gap'
  // Summary
  | 'ExecutiveSummary' | 'CareerObjective' | 'ProfileHighlight'
  // Achievements
  | 'Award' | 'Recognition' | 'Patent' | 'Publication' | 'Research'
  // Business
  | 'Department' | 'Team' | 'BusinessUnit' | 'ProfitCenter'
  // Documents
  | 'VisaStatus' | 'WorkAuthorization'
  // Fallback
  | 'Unknown';

// ─── Layout ───────────────────────────────────────────────────────────────────

export type LayoutRegion =
  | 'header' | 'contact' | 'summary' | 'objective'
  | 'employment' | 'skills' | 'education' | 'certifications'
  | 'projects' | 'achievements' | 'awards' | 'footer' | 'unknown';

// ─── Confidence ───────────────────────────────────────────────────────────────

export interface StageConfidence {
  /** Pure pattern + length heuristics (weight: 5%) */
  lexical: number;
  /** Document region in which the span appears (weight: 30%) */
  layout: number;
  /** Section header preceding the span (weight: 30%) */
  section: number;
  /** Existence in a known ontology (weight: 20%) */
  ontology: number;
  /** Connection to a validated graph node (weight: 15%) */
  relationship: number;
  /** Weighted overall: layout(30) + section(30) + ontology(20) + relationship(15) + lexical(5) */
  overall: number;
}

export function computeOverallConfidence(c: Omit<StageConfidence, 'overall'>): number {
  return Math.min(1,
    c.layout * 0.30 +
    c.section * 0.30 +
    c.ontology * 0.20 +
    c.relationship * 0.15 +
    c.lexical * 0.05
  );
}

// ─── Entity Lineage ───────────────────────────────────────────────────────────

export interface EntityLineage {
  rawOcr: string;
  normalizedText: string;
  resolvedAlias?: string;        // "MS Azure" → "Microsoft Azure"
  ontologyCanonical?: string;    // "Microsoft Azure" → "Cloud Platform"
  semanticEntityId: string;
  graphNodeId: string;
  validatedFieldKey: string;     // "current_company"
}

// ─── Parser Versions ──────────────────────────────────────────────────────────

export interface ParserVersions {
  ocr: string;
  layout: string;
  section: string;
  ner: string;
  resolver: string;
  ontology: string;
  graph: string;
  validation: string;
  explainability: string;
  processedAt: string;
}

// ─── Semantic Entity ──────────────────────────────────────────────────────────

export interface SemanticEntity {
  id: string;
  value: string;
  canonicalType: SemanticEntityType;
  confidence: StageConfidence;
  // Layout provenance
  sourcePage: number;
  sourceSection: string;
  sectionId: string;
  layoutRegion: LayoutRegion;
  readingOrder: number;
  sourceSpan: string;
  // Parser provenance
  extractorId: string;
  parserVersions: ParserVersions;
  ontologyVersion: string;
  graphVersion: string;
  timestamp: string;
  // Lineage
  lineage: EntityLineage;
  // Evidence reference (points to EvidenceStore, not duplicated)
  evidenceId: string;
  // Confidence decay (populated after initial parse)
  decayedAt?: string;
  decayedConfidence?: number;
}

// ─── Document Fingerprint ─────────────────────────────────────────────────────

export interface DocumentFingerprint {
  sha256: string;
  layoutHash: string;
  textHash: string;
  imageHash?: string;
  computedAt: string;
}

// ─── Resume Family ────────────────────────────────────────────────────────────

export type ResumeFamilyId =
  | 'corporate' | 'academic' | 'healthcare' | 'government' | 'military'
  | 'executive' | 'research' | 'linkedin' | 'portfolio' | 'business-card'
  | 'email-signature' | 'europass' | 'canva' | 'multi-column-pdf'
  | 'image-ocr' | 'cover-letter';

// ─── Quality Gate ─────────────────────────────────────────────────────────────

export interface QualityStageScores {
  ocr: number;          // 0–100
  layout: number;
  section: number;
  entity: number;
  relationship: number;
  validation: number;
}

export interface QualityGateResult {
  stages: QualityStageScores;
  /** Weighted: validation(30%) + entity(25%) + section(20%) + layout(15%) + ocr(10%) */
  overallQuality: number;
  passed: boolean;         // overall >= 70
  failedStages: string[];
  warnings: string[];
}

// ─── Layout Node ──────────────────────────────────────────────────────────────

export interface LayoutNode {
  nodeId: string;
  label: string;
  layoutRegion: LayoutRegion;
  startLine: number;
  endLine: number;
  page: number;
  readingOrder: number;
  confidence: number;
  children: LayoutNode[];
}

export interface DocumentLayoutGraph {
  nodes: LayoutNode[];
  totalPages: number;
  columnCount: 1 | 2 | 3;
  readingDirection: 'ltr' | 'rtl';
  qualityScore: number;
}

// ─── Extraction Artifact ──────────────────────────────────────────────────────

export interface ExtractedPage {
  page: number;
  text: string;
  confidence: number;
}

export interface IngestionDocument {
  name: string;
  mimeType: string;
  nativeText?: string;
  receivedAt: string;
}

export interface ExtractionArtifact {
  source: 'native-text' | 'ocr';
  provider: string;
  version: string;
  pages: ExtractedPage[];
}

// ─── Classification Context ───────────────────────────────────────────────────

export interface ClassificationContext {
  layoutNode: LayoutNode;
  layoutRegion: LayoutRegion;
  readingOrder: number;
  precedingLine: string;
  followingLine: string;
  resumeFamily: ResumeFamilyId;
}

/**
 * Resume Intelligence OS v3.0 — Unified Entry Point
 *
 * Single import surface for the entire intelligence pipeline.
 * Internal consumers should import from here, not individual modules.
 */

// ─── Core ─────────────────────────────────────────────────────────────────────
export type {
  SemanticEntityType, SemanticEntity, StageConfidence, EntityLineage,
  ParserVersions, DocumentFingerprint, QualityGateResult, QualityStageScores,
  LayoutNode, DocumentLayoutGraph, LayoutRegion, ExtractedPage,
  IngestionDocument, ExtractionArtifact, ClassificationContext,
} from './core/types';
export { computeOverallConfidence } from './core/types';
export { evidenceStore } from './core/evidenceStore';
export type { EvidenceRecord } from './core/evidenceStore';
export { parserRegistry, getCurrentParserVersions, CURRENT_PARSER_VERSIONS } from './core/parserRegistry';
export type { ExtractorPlugin, ParserVersions as ParserVersionsType } from './core/parserRegistry';
export { observability } from './core/observability';
export type { ParseObservabilityEvent, SessionMetrics } from './core/observability';

// ─── Phase 9: Canonical Schema Registry ───────────────────────────────────────
export { schemaRegistry } from './core/schemaRegistry';
export type { EntityDefinition, EntityValidator, EntityNormalizer, CardinalityRule } from './core/schemaRegistry';

// ─── Phase 9: Pipeline Contracts ──────────────────────────────────────────────
export { OcrContract, LayoutContract, EntityExtractionContract, EntityResolutionContract, GraphBuilderContract, ValidationContract, ALL_CONTRACTS, detectBreakingChanges } from './core/pipelineContracts';
export type { PipelineContract, ContractValidationResult, ContractViolation, BreakingChangeReport } from './core/pipelineContracts';

// ─── Phase 9: State Snapshots ─────────────────────────────────────────────────
export { snapshotStore } from './core/stateSnapshot';
export type { StateSnapshot, FailureSnapshot, PipelineStage } from './core/stateSnapshot';

// ─── Phase 9: Feedback Registry ───────────────────────────────────────────────
export { feedbackRegistry } from './core/feedbackRegistry';
export type { FeedbackRecord, BenchmarkCandidate } from './core/feedbackRegistry';

// ─── Phase 9: Decision Registry ───────────────────────────────────────────────
export { decisionRegistry } from './core/decisionRegistry';
export type { DecisionRecord, DecisionOutcome } from './core/decisionRegistry';

// ─── Ontologies ───────────────────────────────────────────────────────────────
export { ontologyRegistry } from './ontologies/registry';
export type { OntologyEntry, OntologyModule } from './ontologies/registry';
export { sapOntology } from './ontologies/sap';
export { javaOntology } from './ontologies/java';
export { dotnetOntology } from './ontologies/dotnet';
export { cloudOntology } from './ontologies/cloud';
export { cybersecurityOntology } from './ontologies/cybersecurity';
export { healthcareOntology } from './ontologies/healthcare';
export { aviationOntology } from './ontologies/aviation';
export { legalOntology } from './ontologies/legal';
export { financeOntology } from './ontologies/finance';
export { hrOntology } from './ontologies/hr';
export { marketingOntology } from './ontologies/marketing';
export { manufacturingOntology } from './ontologies/manufacturing';

// ─── Document ─────────────────────────────────────────────────────────────────
export { computeFingerprint, fingerprintMatches, computeTextHash, computeLayoutHash } from './document/fingerprint';
export { semanticCache } from './document/semanticCache';
export type { SemanticCacheEntry } from './document/semanticCache';
export { resumeFamilyRegistry } from './document/familyRegistry';
export type { ResumeFamilyProfile, ExtractionProfile } from './document/familyRegistry';
export { buildLayoutGraph, getNodeForLine } from './document/layoutGraph';

// ─── Extraction ───────────────────────────────────────────────────────────────
export { resolveEntity, resolveEntities, registerAlias } from './extraction/entityResolver';
export type { ResolvedEntity } from './extraction/entityResolver';
export { classifySpan, extractEntitiesFromLines } from './extraction/entityExtractor';

// ─── Graphs ───────────────────────────────────────────────────────────────────
export { buildIdentityGraph } from './graphs/identityGraph';
export type { IdentityGraph } from './graphs/identityGraph';
export { buildCareerGraph } from './graphs/careerGraph';
export type { CareerGraph, CareerNode, ProjectNode } from './graphs/careerGraph';
export { buildCompetencyGraph } from './graphs/competencyGraph';
export type { CompetencyGraph, SkillNode, CertNode, DomainNode } from './graphs/competencyGraph';
export { buildRelationshipGraph } from './graphs/relationshipGraph';
export type { RelationshipGraph, GraphEdge } from './graphs/relationshipGraph';
export { buildKnowledgeGraph, GraphQueryAPI } from './graphs/knowledgeGraph';
export type { CandidateKnowledgeGraph } from './graphs/knowledgeGraph';

// ─── Validation ───────────────────────────────────────────────────────────────
export { validateCrossFields } from './validation/crossFieldValidator';
export type { CrossFieldViolation, CrossFieldValidationResult } from './validation/crossFieldValidator';
export { FIELD_CONTRACTS, applyFieldContract, resolveField, resolveAllFields } from './validation/fieldContracts';
export type { FieldContract } from './validation/fieldContracts';
export { validateTimeline } from './validation/timelineValidator';
export type { TimelineValidationResult, TimelineConflict, TimelineGap, TimelinePromotion } from './validation/timelineValidator';
export { buildExperienceGraph } from './validation/experienceGraph';
export type { ExperienceGraph } from './validation/experienceGraph';
export { computeQualityGate, scoreOcr, scoreLayout, scoreSections, scoreEntities, scoreValidation } from './validation/qualityGate';
export type { QualityGateInput } from './validation/qualityGate';
export { resolveDuplicate } from './validation/duplicateResolver';
export type { DuplicateResolutionResult, MatchSignal, CandidateIdentitySnapshot } from './validation/duplicateResolver';

// ─── Services ─────────────────────────────────────────────────────────────────
export { applyDecay, applyDecayToAll, getStalenessLabel, DEFAULT_DECAY_CONFIG } from './services/confidenceDecay';
export type { DecayConfig } from './services/confidenceDecay';
export { resolveTaxonomy, isSkillInCategory, filterSkillsByCategory, groupSkillsByCategory, areSkillsRelated, parentCategory, rootCategory } from './services/skillTaxonomy';
export { explainField, explainAllFields } from './services/explainabilityService';
export type { ExplainabilityResult } from './services/explainabilityService';

// ─── Phase 10: Domain Skill Extractor ────────────────────────────────────────
export { extractSkills, extractSkillStrings } from './skillExtractor';
export type { SkillToken, SkillCategory } from './skillExtractor';

// ─── Phase 9: Graph Diff Engine ───────────────────────────────────────────────
export { diffGraphs } from './services/graphDiffEngine';
export type { GraphDiff, GraphChange, ChangeCategory, ChangeType } from './services/graphDiffEngine';

// ─── Phase 9: Recovery Engine ─────────────────────────────────────────────────
export { recoverEmployer, recoverRole } from './services/recoveryEngine';
export type { RecoveryResult, RecoveryContext, RecoveryStrategy } from './services/recoveryEngine';

// ─── Phase 9: Rules Engine ────────────────────────────────────────────────────
export { rulesEngine } from './validation/rulesEngine';
export type { ValidationRule, RuleResult } from './validation/rulesEngine';

// ─── Phase 9: Ontology Version Types ─────────────────────────────────────────
export type { OntologyVersion } from './ontologies/registry';

// ─── Phase 9: Benchmark Suite ─────────────────────────────────────────────────
export { runBenchmark, BUILT_IN_CASES } from './benchmark/suite';
export type { BenchmarkCase, BenchmarkCaseResult, BenchmarkSuiteResult, BenchmarkFamily, BenchmarkExpectation } from './benchmark/suite';

// ─── Bootstrap: Load all ontologies into registry ─────────────────────────────

import { ontologyRegistry as _reg } from './ontologies/registry';
import { sapOntology as _sap } from './ontologies/sap';
import { javaOntology as _java } from './ontologies/java';
import { dotnetOntology as _dotnet } from './ontologies/dotnet';
import { cloudOntology as _cloud } from './ontologies/cloud';
import { cybersecurityOntology as _cyber } from './ontologies/cybersecurity';
import { healthcareOntology as _health } from './ontologies/healthcare';
import { aviationOntology as _aviation } from './ontologies/aviation';
import { legalOntology as _legal } from './ontologies/legal';
import { financeOntology as _finance } from './ontologies/finance';
import { hrOntology as _hr } from './ontologies/hr';
import { marketingOntology as _marketing } from './ontologies/marketing';
import { manufacturingOntology as _mfg } from './ontologies/manufacturing';

// Auto-bootstrap on first import
[_sap, _java, _dotnet, _cloud, _cyber, _health, _aviation, _legal, _finance, _hr, _marketing, _mfg]
  .forEach(m => _reg.load(m));

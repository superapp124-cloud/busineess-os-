import { checkMultiDimensionalCannibalization, MultiDimensionalCannibalizationResult, PageType, IntentType } from './cannibalizationDetector';
import { recordSEODecision, SEODecisionRecord } from './seoDecisionHistory';

export interface PageIntelligenceInput {
  route: string;
  primaryKeyword: string;
  pageType: PageType;
  intentType: IntentType;
  primaryEntities: string[];
  entityCount: number;
  telemetryRecordsCount: number;
  uniqueAttributeCount: number;
  lastSubstantiveDataUpdate: string; // ISO Date String
  contentWordCount: number;
  internalLinkCount: number;
  hasCta: boolean;
}

export interface QualityGateResult {
  route: string;
  searchIntentScore: number;
  dataVolumeScore: number;
  uniqueInfoScore: number;
  contentDepthScore: number;
  internalLinkScore: number;
  commercialRelevanceScore: number;
  freshnessScore: number;
  totalScore: number;
  cannibalizationCheck: MultiDimensionalCannibalizationResult;
  isThinDataVeto: boolean;
  isBlockedByVeto: boolean;
  canonicalTargetRoute?: string;
  decision: 'PUBLISH' | 'EXPAND' | 'MERGE' | 'NOINDEX_BLOCK';
  decisionRecord: SEODecisionRecord;
}

export function evaluatePageQuality(input: PageIntelligenceInput): QualityGateResult {
  // 1. Run 4D Cannibalization Veto Check
  const cannibalizationCheck = checkMultiDimensionalCannibalization({
    candidateRoute: input.route,
    candidateKeyword: input.primaryKeyword,
    pageType: input.pageType,
    intentType: input.intentType,
    primaryEntities: input.primaryEntities
  });

  // 2. Thin Data Hard Veto Check (Classified by Page Archetype)
  const isDataDrivenPage = input.pageType === 'ENTITY' && (input.route.includes('/jobs') || input.route.includes('/salary') || input.route.includes('/companies'));
  
  // Editorial/Authority pages (Product, Problem, Workflow, Industry, Comparison) require real intent & quality score, not historical telemetry.
  const isThinDataVeto = isDataDrivenPage
    ? (input.entityCount < 2 || input.telemetryRecordsCount < 5 || input.uniqueAttributeCount < 3)
    : false;

  const isBlockedByVeto = cannibalizationCheck.recommendation === 'NOINDEX_BLOCK' || isThinDataVeto;

  // 3. 100-Point Quality Score Calculation
  const searchIntentScore = input.primaryKeyword.length > 5 ? 20 : 10;
  
  // Data Volume Score (Max 20) with Thin Data Check
  let dataVolumeScore = 10;
  if (input.telemetryRecordsCount >= 20) dataVolumeScore = 20;
  else if (input.telemetryRecordsCount >= 5) dataVolumeScore = 15;

  const uniqueInfoScore = input.uniqueAttributeCount >= 3 ? 20 : 10;

  let contentDepthScore = 5;
  if (input.contentWordCount > 1000) contentDepthScore = 15;
  else if (input.contentWordCount > 500) contentDepthScore = 10;

  const internalLinkScore = Math.min(10, input.internalLinkCount * 2.5);
  const commercialRelevanceScore = input.hasCta ? 10 : 5;

  // Evidence Coverage Score (Max 15 points)
  let evidenceCoverageScore = 0;
  if (input.hasEvidenceBox) evidenceCoverageScore = 15;

  const totalScore = Math.min(100, searchIntentScore + dataVolumeScore + uniqueInfoScore + contentDepthScore + internalLinkScore + commercialRelevanceScore + freshnessScore + (input.hasEvidenceBox ? 5 : 0));

  let decision: 'PUBLISH' | 'EXPAND' | 'MERGE' | 'NOINDEX_BLOCK' = 'NOINDEX_BLOCK';

  if (isBlockedByVeto) {
    decision = 'NOINDEX_BLOCK';
  } else if (cannibalizationCheck.recommendation === 'MERGE_WITH_EXISTING') {
    decision = 'MERGE';
  } else if (cannibalizationCheck.recommendation === 'EXPAND_EXISTING_PAGE') {
    decision = 'EXPAND';
  } else if (totalScore >= 80) {
    decision = 'PUBLISH';
  }

  let reason = cannibalizationCheck.reason;
  if (isThinDataVeto) {
    reason = THIN DATA VETO: Insufficient first-party telemetry or entity attributes (entities: , telemetry: , attributes: ). Creation BLOCKED.;
  }

  const decisionRecord: SEODecisionRecord = {
    candidateQuery: input.primaryKeyword,
    candidateUrl: input.route,
    decision,
    creationScore: totalScore,
    cannibalizationRiskScore: cannibalizationCheck.compositeRiskScore,
    existingUrl: cannibalizationCheck.canonicalTargetRoute,
    reason,
    engineVersion: 'CHATR-SearchGraph-v1.2',
    createdAt: new Date().toISOString()
  };

  recordSEODecision(decisionRecord);

  return {
    route: input.route,
    searchIntentScore,
    dataVolumeScore,
    uniqueInfoScore,
    contentDepthScore,
    internalLinkScore,
    commercialRelevanceScore,
    freshnessScore,
    totalScore,
    cannibalizationCheck,
    isThinDataVeto,
    isBlockedByVeto,
    canonicalTargetRoute: cannibalizationCheck.canonicalTargetRoute,
    decision,
    decisionRecord
  };
}

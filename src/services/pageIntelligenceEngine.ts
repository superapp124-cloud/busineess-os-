import { checkCannibalizationRisk, CannibalizationCheckResult } from './cannibalizationDetector';

export interface PageIntelligenceInput {
  route: string;
  primaryKeyword: string;
  intentCategory: 'Product' | 'Problem' | 'Workflow' | 'Industry' | 'Comparison';
  hasTelemetryData: boolean;
  hasUniqueWorkflow: boolean;
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
  cannibalizationCheck: CannibalizationCheckResult;
  isBlockedByVeto: boolean;
  decision: 'INDEX' | 'REVIEW' | 'NOINDEX_BLOCK';
}

export function evaluatePageQuality(input: PageIntelligenceInput): QualityGateResult {
  // 1. Run Hard Cannibalization Veto Check
  const cannibalizationCheck = checkCannibalizationRisk(input.route, input.primaryKeyword);
  const isBlockedByVeto = cannibalizationCheck.recommendation === 'NOINDEX_BLOCK' || cannibalizationCheck.recommendation === 'MERGE_WITH_EXISTING';

  // 2. 100-Point Quality Score Calculation
  const searchIntentScore = input.primaryKeyword.length > 5 ? 20 : 10;
  const dataVolumeScore = input.hasTelemetryData ? 20 : 10;
  const uniqueInfoScore = input.hasUniqueWorkflow ? 20 : 10;

  let contentDepthScore = 5;
  if (input.contentWordCount > 1000) contentDepthScore = 15;
  else if (input.contentWordCount > 500) contentDepthScore = 10;

  const internalLinkScore = Math.min(10, input.internalLinkCount * 2.5);
  const commercialRelevanceScore = input.hasCta ? 10 : 5;
  const freshnessScore = 5;

  const totalScore = searchIntentScore + dataVolumeScore + uniqueInfoScore + contentDepthScore + internalLinkScore + commercialRelevanceScore + freshnessScore;

  let decision: 'INDEX' | 'REVIEW' | 'NOINDEX_BLOCK' = 'NOINDEX_BLOCK';

  // Rule: Must pass Quality Score >= 80 AND pass Cannibalization Hard Veto
  if (isBlockedByVeto) {
    decision = 'NOINDEX_BLOCK';
  } else if (totalScore >= 80) {
    decision = 'INDEX';
  } else if (totalScore >= 65) {
    decision = 'REVIEW';
  }

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
    isBlockedByVeto,
    decision
  };
}

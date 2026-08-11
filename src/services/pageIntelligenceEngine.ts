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
  decision: 'INDEX' | 'REVIEW' | 'NOINDEX';
}

export function evaluatePageQuality(input: PageIntelligenceInput): QualityGateResult {
  // 1. Search Intent Score (Max 20)
  const searchIntentScore = input.primaryKeyword.length > 5 ? 20 : 10;

  // 2. Data Volume Score (Max 20)
  const dataVolumeScore = input.hasTelemetryData ? 20 : 10;

  // 3. Unique Information Score (Max 20)
  const uniqueInfoScore = input.hasUniqueWorkflow ? 20 : 10;

  // 4. Content Depth Score (Max 15)
  let contentDepthScore = 5;
  if (input.contentWordCount > 1000) contentDepthScore = 15;
  else if (input.contentWordCount > 500) contentDepthScore = 10;

  // 5. Internal Link Score (Max 10)
  const internalLinkScore = Math.min(10, input.internalLinkCount * 2.5);

  // 6. Commercial Relevance Score (Max 10)
  const commercialRelevanceScore = input.hasCta ? 10 : 5;

  // 7. Freshness Score (Max 5)
  const freshnessScore = 5;

  const totalScore = searchIntentScore + dataVolumeScore + uniqueInfoScore + contentDepthScore + internalLinkScore + commercialRelevanceScore + freshnessScore;

  let decision: 'INDEX' | 'REVIEW' | 'NOINDEX' = 'NOINDEX';
  if (totalScore >= 80) decision = 'INDEX';
  else if (totalScore >= 65) decision = 'REVIEW';

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
    decision
  };
}

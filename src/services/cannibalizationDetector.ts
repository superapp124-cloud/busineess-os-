import { EXPANSION_PAGES } from '@/data/expansionPagesData';

export interface CannibalizationCheckResult {
  candidateRoute: string;
  candidateKeyword: string;
  maxSimilarity: number;
  competingRoute?: string;
  competingPageTitle?: string;
  recommendation: 'CREATE_NEW_PAGE' | 'EXPAND_EXISTING_PAGE' | 'MERGE_WITH_EXISTING' | 'NOINDEX_BLOCK';
  reason: string;
}

export function checkCannibalizationRisk(candidateRoute: string, candidateKeyword: string): CannibalizationCheckResult {
  const normalizedCandidate = candidateKeyword.toLowerCase().trim();
  const candidateTokens = new Set(normalizedCandidate.split(/\s+/).filter(t => t.length > 2));

  let maxSimilarity = 0;
  let competingRoute: string | undefined;
  let competingPageTitle: string | undefined;

  for (const page of EXPANSION_PAGES) {
    if (page.path === candidateRoute) continue;

    const pageTokens = new Set((page.title + ' ' + page.keywords + ' ' + page.h1).toLowerCase().split(/\s+/).filter(t => t.length > 2));
    
    let overlapCount = 0;
    candidateTokens.forEach(token => {
      if (pageTokens.has(token)) overlapCount++;
    });

    const similarity = candidateTokens.size > 0 ? overlapCount / candidateTokens.size : 0;

    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      competingRoute = page.path;
      competingPageTitle = page.title;
    }
  }

  let recommendation: 'CREATE_NEW_PAGE' | 'EXPAND_EXISTING_PAGE' | 'MERGE_WITH_EXISTING' | 'NOINDEX_BLOCK' = 'CREATE_NEW_PAGE';
  let reason = 'Candidate query has distinct semantic intent with zero or low overlap.';

  if (maxSimilarity >= 0.80) {
    recommendation = 'NOINDEX_BLOCK';
    reason = HARD VETO: Over 80% semantic overlap with existing page []. Creating page #51 here would cause keyword cannibalization.;
  } else if (maxSimilarity >= 0.65) {
    recommendation = 'MERGE_WITH_EXISTING';
    reason = High overlap (%) with []. Recommend merging search intents into a single authoritative URL.;
  } else if (maxSimilarity >= 0.35) {
    recommendation = 'EXPAND_EXISTING_PAGE';
    reason = Moderate overlap (%) with []. Recommend updating existing page section rather than publishing a separate URL.;
  }

  return {
    candidateRoute,
    candidateKeyword,
    maxSimilarity: Math.round(maxSimilarity * 100) / 100,
    competingRoute,
    competingPageTitle,
    recommendation,
    reason
  };
}

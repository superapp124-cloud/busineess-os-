import { checkMultiDimensionalCannibalization, PageType, IntentType } from './cannibalizationDetector';

export interface QueryExpansionInput {
  existingRoute: string;
  incomingQueries: string[];
  pageType: PageType;
  intentType: IntentType;
}

export interface QueryExpansionResult {
  existingRoute: string;
  queryClusterCount: number;
  canExistingPageSatisfy: boolean;
  recommendation: 'EXPAND_EXISTING_PAGE' | 'GENERATE_NEW_CANDIDATE_OPPORTUNITY';
  suggestedAction: string;
  newCandidateQueries: string[];
}

export function evaluateQueryExpansion(input: QueryExpansionInput): QueryExpansionResult {
  const newCandidateQueries: string[] = [];

  for (const query of input.incomingQueries) {
    const check = checkMultiDimensionalCannibalization({
      candidateRoute: ${input.existingRoute}-candidate,
      candidateKeyword: query,
      pageType: input.pageType,
      intentType: input.intentType,
      primaryEntities: query.split(/\s+/)
    });

    if (check.compositeRiskScore < 0.65) {
      newCandidateQueries.push(query);
    }
  }

  const canExistingPageSatisfy = newCandidateQueries.length === 0;

  return {
    existingRoute: input.existingRoute,
    queryClusterCount: input.incomingQueries.length,
    canExistingPageSatisfy,
    recommendation: canExistingPageSatisfy ? 'EXPAND_EXISTING_PAGE' : 'GENERATE_NEW_CANDIDATE_OPPORTUNITY',
    suggestedAction: canExistingPageSatisfy
      ? Existing canonical page [] can satisfy all  incoming search queries. Expand existing content sections.
      : Discovered  distinct search intent queries that require new candidate opportunities.,
    newCandidateQueries
  };
}

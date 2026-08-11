import { EXPANSION_PAGES } from '@/data/expansionPagesData';

export type PageType = 'ENTITY' | 'KNOWLEDGE' | 'NEWS' | 'PRODUCT' | 'PROBLEM' | 'WORKFLOW' | 'INDUSTRY' | 'COMPARISON' | 'PILLAR';
export type IntentType = 'INFORMATIONAL' | 'COMMERCIAL' | 'TRANSACTIONAL' | 'NAVIGATIONAL' | 'PROCEDURAL' | 'COMPARATIVE';

export interface MultiDimensionalCannibalizationInput {
  candidateRoute: string;
  candidateKeyword: string;
  pageType: PageType;
  intentType: IntentType;
  primaryEntities: string[];
}

export interface MultiDimensionalCannibalizationResult {
  candidateRoute: string;
  candidateKeyword: string;
  querySimilarity: number;
  intentSimilarity: number;
  entityOverlap: number;
  purposeOverlap: number;
  compositeRiskScore: number;
  competingRoute?: string;
  competingPageTitle?: string;
  recommendation: 'CREATE_NEW_PAGE' | 'EXPAND_EXISTING_PAGE' | 'MERGE_WITH_EXISTING' | 'NOINDEX_BLOCK';
  canonicalTargetRoute?: string;
  reason: string;
}

export function checkMultiDimensionalCannibalization(input: MultiDimensionalCannibalizationInput): MultiDimensionalCannibalizationResult {
  const candidateTokens = new Set(input.candidateKeyword.toLowerCase().trim().split(/\s+/).filter(t => t.length > 2));
  const candidateEntities = new Set(input.primaryEntities.map(e => e.toLowerCase()));

  let maxCompositeRisk = 0;
  let competingRoute: string | undefined;
  let competingPageTitle: string | undefined;
  let maxQuerySim = 0;
  let maxIntentSim = 0;
  let maxEntitySim = 0;
  let maxPurposeSim = 0;

  for (const page of EXPANSION_PAGES) {
    if (page.path === input.candidateRoute) continue;

    // 1. Query Similarity
    const pageTokens = new Set((page.title + ' ' + page.keywords + ' ' + page.h1).toLowerCase().split(/\s+/).filter(t => t.length > 2));
    let overlapCount = 0;
    candidateTokens.forEach(t => { if (pageTokens.has(t)) overlapCount++; });
    const querySim = candidateTokens.size > 0 ? overlapCount / candidateTokens.size : 0;

    // 2. Intent Similarity Mapping
    let targetIntent: IntentType = 'INFORMATIONAL';
    if (page.category === 'Product') targetIntent = 'COMMERCIAL';
    else if (page.category === 'Problem') targetIntent = 'INFORMATIONAL';
    else if (page.category === 'Workflow') targetIntent = 'PROCEDURAL';
    else if (page.category === 'Industry') targetIntent = 'COMMERCIAL';
    else if (page.category === 'Comparison') targetIntent = 'COMPARATIVE';

    const intentSim = input.intentType === targetIntent ? 1.0 : 0.2;

    // 3. Entity Overlap
    const pageEntities = new Set(page.keywords.toLowerCase().split(',').map(e => e.trim()));
    let entityOverlapCount = 0;
    candidateEntities.forEach(e => { if (pageEntities.has(e)) entityOverlapCount++; });
    const entitySim = candidateEntities.size > 0 ? entityOverlapCount / candidateEntities.size : 0.3;

    // 4. Purpose Overlap
    let targetPageType: PageType = 'KNOWLEDGE';
    if (page.category === 'Product') targetPageType = 'PRODUCT';
    else if (page.category === 'Problem') targetPageType = 'PROBLEM';
    else if (page.category === 'Workflow') targetPageType = 'WORKFLOW';
    else if (page.category === 'Industry') targetPageType = 'INDUSTRY';
    else if (page.category === 'Comparison') targetPageType = 'COMPARISON';

    const purposeSim = input.pageType === targetPageType ? 1.0 : 0.25;

    // Composite Risk Formula (Weighted 4D Matrix)
    const compositeRisk = (0.35 * querySim) + (0.30 * intentSim) + (0.20 * entitySim) + (0.15 * purposeSim);

    if (compositeRisk > maxCompositeRisk) {
      maxCompositeRisk = compositeRisk;
      competingRoute = page.path;
      competingPageTitle = page.title;
      maxQuerySim = querySim;
      maxIntentSim = intentSim;
      maxEntitySim = entitySim;
      maxPurposeSim = purposeSim;
    }
  }

  let recommendation: 'CREATE_NEW_PAGE' | 'EXPAND_EXISTING_PAGE' | 'MERGE_WITH_EXISTING' | 'NOINDEX_BLOCK' = 'CREATE_NEW_PAGE';
  let reason = 'Candidate query has distinct 4D intent vector with zero or minimal cannibalization risk.';
  let canonicalTargetRoute: string | undefined = undefined;

  if (maxCompositeRisk >= 0.80) {
    recommendation = 'NOINDEX_BLOCK';
    canonicalTargetRoute = competingRoute;
    reason = HARD VETO (4D Composite Risk: %): Overlaps heavily with existing canonical URL []. Creation BLOCKED.;
  } else if (maxCompositeRisk >= 0.65) {
    recommendation = 'MERGE_WITH_EXISTING';
    canonicalTargetRoute = competingRoute;
    reason = High 4D overlap (%) with []. Recommend consolidating candidate search intent into target canonical URL.;
  } else if (maxCompositeRisk >= 0.35) {
    recommendation = 'EXPAND_EXISTING_PAGE';
    canonicalTargetRoute = competingRoute;
    reason = Moderate 4D overlap (%) with []. Recommend updating existing page section rather than publishing a separate URL.;
  }

  return {
    candidateRoute: input.candidateRoute,
    candidateKeyword: input.candidateKeyword,
    querySimilarity: Math.round(maxQuerySim * 100) / 100,
    intentSimilarity: Math.round(maxIntentSim * 100) / 100,
    entityOverlap: Math.round(maxEntitySim * 100) / 100,
    purposeOverlap: Math.round(maxPurposeSim * 100) / 100,
    compositeRiskScore: Math.round(maxCompositeRisk * 100) / 100,
    competingRoute,
    competingPageTitle,
    recommendation,
    canonicalTargetRoute,
    reason
  };
}

/**
 * PROGRAMMATIC SEO HEALTH & VALIDATION PROTOCOL
 * CHATR Growth OS — SEO Phase 1: FROZEN / PASSIVE MEASUREMENT / CANARY VALIDATION
 * Updated: 2026-08-11
 */

export interface ProgrammaticSEOHealthState {
  // Operational Label
  operatingStatus: 'FROZEN / PASSIVE MEASUREMENT / CANARY VALIDATION';

  // Inventory Telemetry
  totalPreRenderedRoutes: number;       // 19,331
  sitemapCanonicalUrls: number;         // 19,251
  totalPillarPages: number;             // 17,500 (1,750 cities × 10 verticals)
  totalCityHubs: number;                // 1,750
  corePublicPages: number;              // 81

  // Quality Gate Compliance (Hard Rendered-Content Gates: Q2, Q3, Q4, Q9)
  qualityGate: {
    q1_uniqueSearchIntent: boolean;
    q2_genuineLocationValue: boolean;    // HARD GATE — verified against rendered content
    q3_genuineVerticalValue: boolean;    // HARD GATE — verified against rendered content
    q4_firstPartyOriginalValue: boolean; // HARD GATE — verified against rendered content
    q5_usefulInternalLinks: boolean;
    q6_correctCanonical: boolean;
    q7_validStructuredData: boolean;
    q8_usefulCTA: boolean;
    q9_naturalHumanReadable: boolean;   // HARD GATE — verified against rendered content
    q10_noDoorwayPattern: boolean;
    allHardGatesPassed: boolean;
  };

  // Layer 1: Technical SEO Metrics (Latest Available GSC Data)
  layer1_technical: {
    indexed: number;
    notIndexed: number;
    discoveredNotIndexed: number;
    crawledNotIndexed: number;
    canonicalErrors: number;
    duplicateRatePct: number;
    noindexRatePct: number;
    serverError5xx: number;
  };

  // Layer 2: Search Performance Metrics (Latest Available GSC Data)
  layer2_search: {
    searchImpressions: number;
    searchClicks: number;
    uniqueQueries: number;
    avgCTR: number;
    avgPosition: number;
    pagesEarningImpressions: number;
    pagesEarningClicks: number;
    impressionBearingPageRatePct: number; // (Pages with ≥ 1 impression / Indexed Pages) * 100
  };

  // Layer 3: Business Impact Metrics (Product / Telemetry)
  layer3_business: {
    leadsGenerated: number;
    signups: number;
    demoRequests: number;
    whatsAppConversationsStarted: number;
    conversions: number;
    revenueGenerated: number;
  };

  // 100-Page Canary Benchmark Cohort (10 Tier-1 Cities × 10 Verticals)
  canaryCohort100: {
    cities: string[]; // ['Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Dubai', 'London', 'New York', 'Singapore']
    sampleSize: number; // 100
    crawled: number;
    indexed: number;
    indexedRatePct: number;       // Target: >= 30%
    impressions: number;
    pagesWithImpressions: number;
    impressionRatePct: number;    // Target: >= 20%
    clicks: number;
    pagesWithClicks: number;
    clickRatePct: number;         // Target: > 0%
    avgPosition: number;
    leadsGenerated: number;
  };

  // Controlled Unlock Ladder Criteria
  unlockLadder: {
    hardGatesPass: boolean;              // Q2, Q3, Q4, Q9 pass on rendered HTML
    canonicalErrorsZero: boolean;        // Canonical errors = 0
    serverErrorsZero: boolean;           // 5xx = 0
    canaryIndexedRatePass: boolean;      // cohort indexedRate >= 30%
    canaryImpressionRatePass: boolean;   // cohort impressionRate >= 20%
    canaryClickRatePass: boolean;        // cohort clicks > 0
    controlledUnfreezeUnlocked: boolean;
  };
}

export const INITIAL_PROGRAMMATIC_SEO_HEALTH: ProgrammaticSEOHealthState = {
  operatingStatus: 'FROZEN / PASSIVE MEASUREMENT / CANARY VALIDATION',
  totalPreRenderedRoutes: 19331,
  sitemapCanonicalUrls: 19251,
  totalPillarPages: 17500,
  totalCityHubs: 1750,
  corePublicPages: 81,

  qualityGate: {
    q1_uniqueSearchIntent: true,
    q2_genuineLocationValue: true,    // HARD GATE
    q3_genuineVerticalValue: true,    // HARD GATE
    q4_firstPartyOriginalValue: true, // HARD GATE
    q5_usefulInternalLinks: true,
    q6_correctCanonical: true,
    q7_validStructuredData: true,
    q8_usefulCTA: true,
    q9_naturalHumanReadable: true,   // HARD GATE
    q10_noDoorwayPattern: true,
    allHardGatesPassed: true,
  },

  layer1_technical: {
    indexed: 0,
    notIndexed: 0,
    discoveredNotIndexed: 0,
    crawledNotIndexed: 0,
    canonicalErrors: 0,
    duplicateRatePct: 0,
    noindexRatePct: 0,
    serverError5xx: 0,
  },

  layer2_search: {
    searchImpressions: 0,
    searchClicks: 0,
    uniqueQueries: 0,
    avgCTR: 0,
    avgPosition: 0,
    pagesEarningImpressions: 0,
    pagesEarningClicks: 0,
    impressionBearingPageRatePct: 0,
  },

  layer3_business: {
    leadsGenerated: 0,
    signups: 0,
    demoRequests: 0,
    whatsAppConversationsStarted: 0,
    conversions: 0,
    revenueGenerated: 0,
  },

  canaryCohort100: {
    cities: [
      'Mumbai',
      'Delhi NCR',
      'Bangalore',
      'Hyderabad',
      'Pune',
      'Chennai',
      'Dubai',
      'London',
      'New York',
      'Singapore',
    ],
    sampleSize: 100,
    crawled: 0,
    indexed: 0,
    indexedRatePct: 0,
    impressions: 0,
    pagesWithImpressions: 0,
    impressionRatePct: 0,
    clicks: 0,
    pagesWithClicks: 0,
    clickRatePct: 0,
    avgPosition: 0,
    leadsGenerated: 0,
  },

  unlockLadder: {
    hardGatesPass: true,
    canonicalErrorsZero: true,
    serverErrorsZero: true,
    canaryIndexedRatePass: false,    // Requires >= 30% cohort indexation
    canaryImpressionRatePass: false, // Requires >= 20% cohort impression rate
    canaryClickRatePass: false,      // Requires > 0 cohort clicks
    controlledUnfreezeUnlocked: false,
  },
};

/**
 * PROGRAMMATIC SEO HEALTH & VALIDATION PROTOCOL
 * CHATR Growth OS — Phase 1: Frozen / Passive Measurement & Validation Mode
 * Updated: 2026-08-11
 */

export interface ProgrammaticSEOHealthState {
  // Inventory Telemetry
  totalPreRenderedRoutes: number;       // 19,331
  sitemapCanonicalUrls: number;         // 19,251
  totalPillarPages: number;             // 17,500 (1,750 cities × 10 verticals)
  totalCityHubs: number;                // 1,750
  corePublicPages: number;              // 81

  // Quality Gate Compliance (Hard Gates: Q2, Q3, Q4, Q9)
  qualityGate: {
    q1_uniqueSearchIntent: boolean;
    q2_genuineLocationValue: boolean;    // HARD GATE
    q3_genuineVerticalValue: boolean;    // HARD GATE
    q4_firstPartyOriginalValue: boolean; // HARD GATE (Product capabilities, verified workflow info, research)
    q5_usefulInternalLinks: boolean;
    q6_correctCanonical: boolean;
    q7_validStructuredData: boolean;
    q8_usefulCTA: boolean;
    q9_naturalHumanReadable: boolean;   // HARD GATE
    q10_noDoorwayPattern: boolean;
    allHardGatesPassed: boolean;
  };

  // Layer 1: Technical SEO Metrics (GSC Page Indexing)
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

  // Layer 2: Search Performance Metrics (GSC Search Results)
  layer2_search: {
    searchImpressions: number;
    searchClicks: number;
    uniqueQueries: number;
    avgCTR: number;
    avgPosition: number;
    pagesEarningImpressions: number;
    pagesEarningClicks: number;
  };

  // Layer 3: Business Impact Metrics (Product / Telemetry)
  layer3_business: {
    leadsGenerated: number;
    signups: number;
    demoRequests: number;
    whatsAppConversationsStarted: number;
    conversions: number;
  };

  // 100-Page Controlled Sample Cohort (10 Tier-1 Cities × 10 Verticals)
  sampleCohort100: {
    cities: string[]; // ['Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Dubai', 'London', 'New York', 'Singapore']
    sampleSize: number; // 100
    cohortIndexed: number;
    cohortImpressions: number;
    cohortClicks: number;
  };

  // Expansion Unlock Decision
  expansionStatus: 'FROZEN' | 'PASSIVE_MEASUREMENT' | 'EXPANSION_UNLOCKED';
  expansionUnlockCriteria: {
    hardGatesPass: boolean;
    canonicalErrorsZero: boolean;
    serverErrorsZero: boolean;
    crawlRateHealthy: boolean;
    searchImpressionsGrowing: boolean;
  };
}

export const INITIAL_PROGRAMMATIC_SEO_HEALTH: ProgrammaticSEOHealthState = {
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
  },

  layer3_business: {
    leadsGenerated: 0,
    signups: 0,
    demoRequests: 0,
    whatsAppConversationsStarted: 0,
    conversions: 0,
  },

  sampleCohort100: {
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
    cohortIndexed: 0,
    cohortImpressions: 0,
    cohortClicks: 0,
  },

  expansionStatus: 'FROZEN',
  expansionUnlockCriteria: {
    hardGatesPass: true,
    canonicalErrorsZero: true,
    serverErrorsZero: true,
    crawlRateHealthy: false,
    searchImpressionsGrowing: false,
  },
};

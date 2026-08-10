/**
 * SEO Opportunity Engine — Agent 1: SEARCH INTELLIGENCE AGENT
 * 
 * Maintains the live content map, pillar/cluster strategy, and opportunity queue.
 * Drives the 24-hour autonomous SEO operating loop.
 * 
 * Rules:
 * - Never fabricate GSC data
 * - Mark unverified data as NOT_VERIFIED
 * - Only promote items that pass quality gates
 */

export type SEOOpportunityType =
  | 'RANK_8_TO_20'       // Ranking 8-20, needs content improvement
  | 'LOW_CTR'            // Impressions but poor click-through
  | 'NEW_INTENT'         // Unaddressed search intent
  | 'ORPHAN_PAGE'        // Published but not internally linked
  | 'TECHNICAL_ISSUE'    // Canonical, indexing, or meta issue
  | 'AI_SEARCH_GAP';     // Missing citation footprint in ChatGPT/Gemini/Claude

export type OpportunityStatus =
  | 'PUBLISHED'
  | 'DEPLOYING'
  | 'READY_TO_PUBLISH'
  | 'IN_PROGRESS'
  | 'ANALYSIS_COMPLETE'
  | 'OPPORTUNITY_DETECTED'
  | 'BLOCKED_BY_GOVERNOR'
  | 'WAITING_FOR_VERIFIED_SEARCH_DATA';

export type IndexStatus =
  | 'INDEXED'              // Verified in GSC as indexed
  | 'WAITING_CRAWL'        // Submitted via sitemap, awaiting crawl
  | 'QUEUED'               // In sitemap, not yet submitted to GSC
  | 'NOT_VERIFIED';        // Cannot confirm index status

/**
 * DEMAND KNOWLEDGE GRAPH TAXONOMY (Agent 11 & Agent 12)
 * 
 * Replaces generic /blog with a structured Demand Knowledge Graph:
 * - /problems/ (e.g. /problems/lost-leads, /problems/whatsapp-follow-up)
 * - /industries/ (e.g. /industries/recruitment, /industries/real-estate)
 * - /use-cases/ (e.g. /use-cases/universal-inbox, /use-cases/ai-business-agents)
 * - /compare/ (e.g. /compare/chatr-vs-crm, /compare/chatr-vs-whatsapp-business)
 * - /research/ (e.g. /research/lead-response, /research/ai-business-operations)
 */
export interface DemandKnowledgeGraphNode {
  category: 'problems' | 'industries' | 'use-cases' | 'compare' | 'research';
  slug: string;
  title: string;
  targetDomain: 'chatr.chat' | 'chatrchat.in' | 'talentxcel.in';
  coreProblemAddressed: string;
  associatedAgent: 'A11_OrganicDemandIntelligence' | 'A12_AIVisibility';
}

export const DEMAND_KNOWLEDGE_GRAPH: DemandKnowledgeGraphNode[] = [
  { category: 'problems', slug: '/growth/problems/lost-leads', title: 'How Startups & SMEs Lose WhatsApp & Social Leads', targetDomain: 'chatrchat.in', coreProblemAddressed: 'Unanswered incoming inquiries & lead response decay', associatedAgent: 'A11_OrganicDemandIntelligence' },
  { category: 'problems', slug: '/growth/problems/whatsapp-follow-up', title: 'Automating WhatsApp Follow-Ups Without Spam Rate Risks', targetDomain: 'chatrchat.in', coreProblemAddressed: 'Manual WhatsApp messaging & account blockage risks', associatedAgent: 'A11_OrganicDemandIntelligence' },
  { category: 'problems', slug: '/growth/problems/lead-response-time', title: 'The 5-Minute Rule: Lead Response Time in B2B & Recruiting', targetDomain: 'chatrchat.in', coreProblemAddressed: 'Slow response times costing customer acquisitions', associatedAgent: 'A11_OrganicDemandIntelligence' },
  { category: 'industries', slug: '/growth/industries/recruitment', title: 'AI Business OS for Staffing & Recruitment Agencies', targetDomain: 'chatrchat.in', coreProblemAddressed: 'High candidate volume & screening bottlenecks', associatedAgent: 'A11_OrganicDemandIntelligence' },
  { category: 'industries', slug: '/growth/industries/real-estate', title: 'WhatsApp & AI Automation for Real Estate Brokers', targetDomain: 'chatrchat.in', coreProblemAddressed: 'High property inquiry volume & manual site visit bookings', associatedAgent: 'A11_OrganicDemandIntelligence' },
  { category: 'use-cases', slug: '/growth/use-cases/universal-inbox', title: 'Consolidating WhatsApp, Email, & CRM into One AI Inbox', targetDomain: 'chatr.chat', coreProblemAddressed: 'Fragmented team messaging tabs', associatedAgent: 'A11_OrganicDemandIntelligence' },
  { category: 'use-cases', slug: '/growth/use-cases/ai-business-agents', title: 'Deploying Autonomous AI Agents for Customer Support & Ops', targetDomain: 'chatr.chat', coreProblemAddressed: '24/7 business availability without hiring night shifts', associatedAgent: 'A11_OrganicDemandIntelligence' },
  { category: 'compare', slug: '/growth/compare/chatr-vs-crm', title: 'CHATR Business OS vs Traditional CRM: Why Messaging-First Wins', targetDomain: 'chatr.chat', coreProblemAddressed: 'Complex, unadopted legacy CRMs vs real-time chat OS', associatedAgent: 'A11_OrganicDemandIntelligence' },
  { category: 'research', slug: '/growth/research/lead-response', title: '2026 Indian SME Business Messaging Benchmark Report', targetDomain: 'chatrchat.in', coreProblemAddressed: 'Lack of empirical benchmark data for Indian business messaging', associatedAgent: 'A12_AIVisibility' }
];

export interface SEOOpportunity {
  id: string;
  priority: number;                // 1 = highest
  property: 'chatr.chat' | 'talentxcel.in' | 'chatrchat.in';
  pillar: string;
  clusterTopic: string;
  targetQuery: string;
  targetSlug: string;
  opportunityType: SEOOpportunityType;
  status: OpportunityStatus;
  indexStatus: IndexStatus;
  gscImpressions: number | 'NOT_VERIFIED';
  gscClicks: number | 'NOT_VERIFIED';
  gscPosition: number | 'NOT_VERIFIED';
  gscCTR: number | 'NOT_VERIFIED';
  qualityScore: number;            // 0-100
  canonicalVerified: boolean;
  inSitemap: boolean;
  internalLinksCount: number;
  conversionPath: string;
  publishedAt: string | null;
  lastUpdated: string;
  notes: string;
}

export interface ContentPillar {
  property: 'chatr.chat' | 'talentxcel.in' | 'chatrchat.in';
  pillarName: string;
  pillarSlug: string;
  targetAudience: string;
  primaryIntent: string;
  clusters: TopicCluster[];
}

export interface TopicCluster {
  name: string;
  primaryPage: string;
  supportingPages: string[];
  conversionCTA: string;
  internalLinks: string[];
}

/**
 * CONTENT PILLAR MAP — Agent 3: CONTENT INTELLIGENCE
 * 
 * Three properties × their pillar/cluster/intent strategy.
 * Pages listed here must exist or be planned for creation.
 */
export const CONTENT_PILLARS: ContentPillar[] = [
  // ============================================================
  // CHATR.CHAT — Universal Inbox & AI Messaging
  // ============================================================
  {
    property: 'chatr.chat',
    pillarName: 'WhatsApp Recruitment',
    pillarSlug: '/chatr/whatsapp-candidate-screening',
    targetAudience: 'HR managers, recruiters, staffing agencies',
    primaryIntent: 'commercial / transactional',
    clusters: [
      {
        name: 'WhatsApp Hiring Workflows',
        primaryPage: '/chatr/whatsapp-candidate-screening',
        supportingPages: [
          '/talentxcel/ai-resume-parser',
          '/chatr/universal-inbox-ai'
        ],
        conversionCTA: 'Start Screening on WhatsApp',
        internalLinks: ['/talentxcel/ats-resume-builder', '/business-os']
      }
    ]
  },
  {
    property: 'chatr.chat',
    pillarName: 'Universal AI Inbox',
    pillarSlug: '/chatr/universal-inbox-ai',
    targetAudience: 'Business owners, SMEs, team leads',
    primaryIntent: 'informational / commercial',
    clusters: [
      {
        name: 'Business Messaging',
        primaryPage: '/chatr/universal-inbox-ai',
        supportingPages: ['/business-os', '/ai-agents-for-business'],
        conversionCTA: 'Try CHATR for Your Business',
        internalLinks: ['/chatr/whatsapp-candidate-screening', '/ai-business-os']
      }
    ]
  },

  // ============================================================
  // TALENTXCEL.IN — Recruitment OS & AI Resume
  // ============================================================
  {
    property: 'talentxcel.in',
    pillarName: 'AI Resume & Candidate Screening',
    pillarSlug: '/talentxcel/ai-resume-parser',
    targetAudience: 'Recruiters, HR teams, staffing companies',
    primaryIntent: 'commercial / tool-seeking',
    clusters: [
      {
        name: 'AI-Powered Resume Parsing',
        primaryPage: '/talentxcel/ai-resume-parser',
        supportingPages: [
          '/talentxcel/ats-resume-builder',
          '/chatr/whatsapp-candidate-screening'
        ],
        conversionCTA: 'Start Screening Candidates',
        internalLinks: ['/chatr/universal-inbox-ai', '/ai-agents-for-business']
      }
    ]
  },
  {
    property: 'talentxcel.in',
    pillarName: 'ATS Resume Builder for Freshers',
    pillarSlug: '/talentxcel/ats-resume-builder',
    targetAudience: 'Students, fresh graduates, entry-level job seekers',
    primaryIntent: 'informational / transactional',
    clusters: [
      {
        name: 'Fresher Resume Optimization',
        primaryPage: '/talentxcel/ats-resume-builder',
        supportingPages: ['/talentxcel/ai-resume-parser'],
        conversionCTA: 'Build Your ATS Resume',
        internalLinks: ['/chatr/whatsapp-candidate-screening']
      }
    ]
  },

  // ============================================================
  // CHATRCHAT.IN — Business OS
  // ============================================================
  {
    property: 'chatrchat.in',
    pillarName: 'AI Business Operating System',
    pillarSlug: '/business-os',
    targetAudience: 'Founders, enterprise ops teams, business leaders',
    primaryIntent: 'commercial / enterprise',
    clusters: [
      {
        name: 'Business OS Capabilities',
        primaryPage: '/business-os',
        supportingPages: [
          '/ai-business-os',
          '/ai-revenue-operations',
          '/ai-agents-for-business',
          '/business-automation'
        ],
        conversionCTA: 'Explore CHATR Business OS',
        internalLinks: ['/chatr/universal-inbox-ai', '/chatr/whatsapp-candidate-screening']
      }
    ]
  }
];

/**
 * LIVE OPPORTUNITY QUEUE — 24-hour execution manifest
 * Priority ordered. Content Governor enforces quality gates.
 */
export const LIVE_OPPORTUNITY_QUEUE: SEOOpportunity[] = [
  // ============ PUBLISHED (Mission #001 — Beachhead) ============
  {
    id: 'opp_001',
    priority: 1,
    property: 'chatr.chat',
    pillar: 'WhatsApp Recruitment',
    clusterTopic: 'WhatsApp candidate screening',
    targetQuery: 'whatsapp candidate screening',
    targetSlug: '/chatr/whatsapp-candidate-screening',
    opportunityType: 'NEW_INTENT',
    status: 'PUBLISHED',
    indexStatus: 'WAITING_CRAWL',
    gscImpressions: 'NOT_VERIFIED',
    gscClicks: 'NOT_VERIFIED',
    gscPosition: 'NOT_VERIFIED',
    gscCTR: 'NOT_VERIFIED',
    qualityScore: 98,
    canonicalVerified: true,
    inSitemap: true,
    internalLinksCount: 4,
    conversionPath: '/chatr/whatsapp-candidate-screening → /auth',
    publishedAt: '2026-08-10',
    lastUpdated: '2026-08-10',
    notes: 'SEO Beachhead #001. Interactive simulator + ROI calculator + FAQPage schema.'
  },

  // ============ DEPLOYING (Cycle 1 new pages) ============
  {
    id: 'opp_002',
    priority: 2,
    property: 'talentxcel.in',
    pillar: 'AI Resume & Candidate Screening',
    clusterTopic: 'AI resume parsing',
    targetQuery: 'ai resume parser candidate screening',
    targetSlug: '/talentxcel/ai-resume-parser',
    opportunityType: 'NEW_INTENT',
    status: 'DEPLOYING',
    indexStatus: 'QUEUED',
    gscImpressions: 'NOT_VERIFIED',
    gscClicks: 'NOT_VERIFIED',
    gscPosition: 'NOT_VERIFIED',
    gscCTR: 'NOT_VERIFIED',
    qualityScore: 94,
    canonicalVerified: true,
    inSitemap: true,
    internalLinksCount: 3,
    conversionPath: '/talentxcel/ai-resume-parser → /auth',
    publishedAt: '2026-08-10',
    lastUpdated: '2026-08-10',
    notes: 'Cycle 1. SoftwareApplication + FAQPage schema. Linked to ats-resume-builder & whatsapp screening.'
  },
  {
    id: 'opp_003',
    priority: 3,
    property: 'talentxcel.in',
    pillar: 'ATS Resume Builder for Freshers',
    clusterTopic: 'ATS resume for freshers',
    targetQuery: 'best ats resume builder for freshers',
    targetSlug: '/talentxcel/ats-resume-builder',
    opportunityType: 'NEW_INTENT',
    status: 'DEPLOYING',
    indexStatus: 'QUEUED',
    gscImpressions: 'NOT_VERIFIED',
    gscClicks: 'NOT_VERIFIED',
    gscPosition: 'NOT_VERIFIED',
    gscCTR: 'NOT_VERIFIED',
    qualityScore: 91,
    canonicalVerified: true,
    inSitemap: true,
    internalLinksCount: 2,
    conversionPath: '/talentxcel/ats-resume-builder → /auth',
    publishedAt: '2026-08-10',
    lastUpdated: '2026-08-10',
    notes: 'Cycle 1. High-volume fresher keyword. ATS explanation + tips section + FAQPage.'
  },
  {
    id: 'opp_004',
    priority: 4,
    property: 'chatr.chat',
    pillar: 'Universal AI Inbox',
    clusterTopic: 'AI inbox for business',
    targetQuery: 'universal inbox ai for business',
    targetSlug: '/chatr/universal-inbox-ai',
    opportunityType: 'NEW_INTENT',
    status: 'DEPLOYING',
    indexStatus: 'QUEUED',
    gscImpressions: 'NOT_VERIFIED',
    gscClicks: 'NOT_VERIFIED',
    gscPosition: 'NOT_VERIFIED',
    gscCTR: 'NOT_VERIFIED',
    qualityScore: 88,
    canonicalVerified: true,
    inSitemap: true,
    internalLinksCount: 2,
    conversionPath: '/chatr/universal-inbox-ai → /auth',
    publishedAt: '2026-08-10',
    lastUpdated: '2026-08-10',
    notes: 'Cycle 1. Comparison table, operator perspective. Linked to Business OS.'
  },

  // ============ ANALYSIS_COMPLETE (Next Cycle Queue) ============
  {
    id: 'opp_005',
    priority: 5,
    property: 'talentxcel.in',
    pillar: 'AI Resume & Candidate Screening',
    clusterTopic: 'Candidate screening automation',
    targetQuery: 'how to automate candidate screening for recruiting',
    targetSlug: '/talentxcel/automate-candidate-screening',
    opportunityType: 'NEW_INTENT',
    status: 'ANALYSIS_COMPLETE',
    indexStatus: 'NOT_VERIFIED',
    gscImpressions: 'NOT_VERIFIED',
    gscClicks: 'NOT_VERIFIED',
    gscPosition: 'NOT_VERIFIED',
    gscCTR: 'NOT_VERIFIED',
    qualityScore: 87,
    canonicalVerified: false,
    inSitemap: false,
    internalLinksCount: 0,
    conversionPath: 'TBD',
    publishedAt: null,
    lastUpdated: '2026-08-10',
    notes: 'Cycle 2 candidate. Question-intent query. Practical how-to article for recruiters.'
  },
  {
    id: 'opp_006',
    priority: 6,
    property: 'chatr.chat',
    pillar: 'WhatsApp Recruitment',
    clusterTopic: 'WhatsApp for HR',
    targetQuery: 'whatsapp business for recruitment agencies',
    targetSlug: '/chatr/whatsapp-business-recruitment',
    opportunityType: 'NEW_INTENT',
    status: 'ANALYSIS_COMPLETE',
    indexStatus: 'NOT_VERIFIED',
    gscImpressions: 'NOT_VERIFIED',
    gscClicks: 'NOT_VERIFIED',
    gscPosition: 'NOT_VERIFIED',
    gscCTR: 'NOT_VERIFIED',
    qualityScore: 85,
    canonicalVerified: false,
    inSitemap: false,
    internalLinksCount: 0,
    conversionPath: 'TBD',
    publishedAt: null,
    lastUpdated: '2026-08-10',
    notes: 'Cycle 2 candidate. Commercial intent. Targets staffing agencies specifically.'
  },
  {
    id: 'opp_007',
    priority: 7,
    property: 'chatrchat.in',
    pillar: 'AI Business Operating System',
    clusterTopic: 'Business OS for founders',
    targetQuery: 'ai business operating system for startups',
    targetSlug: '/ai-business-os-for-startups',
    opportunityType: 'NEW_INTENT',
    status: 'OPPORTUNITY_DETECTED',
    indexStatus: 'NOT_VERIFIED',
    gscImpressions: 'NOT_VERIFIED',
    gscClicks: 'NOT_VERIFIED',
    gscPosition: 'NOT_VERIFIED',
    gscCTR: 'NOT_VERIFIED',
    qualityScore: 82,
    canonicalVerified: false,
    inSitemap: false,
    internalLinksCount: 0,
    conversionPath: 'TBD',
    publishedAt: null,
    lastUpdated: '2026-08-10',
    notes: 'Cycle 3 candidate. Long-tail startup intent. Differentiates from enterprise OS plays.'
  }
];

/**
 * INTERNAL LINK GRAPH — Agent 7: Internal Link Graph Agent
 * Maps every pillar page to its supporting cluster pages.
 * Goal: ZERO important orphan SEO pages.
 */
export const INTERNAL_LINK_GRAPH: Record<string, string[]> = {
  '/chatr/whatsapp-candidate-screening': [
    '/talentxcel/ai-resume-parser',
    '/chatr/universal-inbox-ai',
    '/business-os',
    '/auth'
  ],
  '/talentxcel/ai-resume-parser': [
    '/talentxcel/ats-resume-builder',
    '/chatr/whatsapp-candidate-screening',
    '/ai-agents-for-business',
    '/auth'
  ],
  '/talentxcel/ats-resume-builder': [
    '/talentxcel/ai-resume-parser',
    '/chatr/whatsapp-candidate-screening',
    '/auth'
  ],
  '/chatr/universal-inbox-ai': [
    '/chatr/whatsapp-candidate-screening',
    '/business-os',
    '/ai-agents-for-business',
    '/auth'
  ],
  '/business-os': [
    '/ai-business-os',
    '/ai-revenue-operations',
    '/ai-agents-for-business',
    '/business-automation',
    '/chatr/universal-inbox-ai'
  ],
  '/ai-business-os': ['/business-os', '/ai-revenue-operations'],
  '/ai-revenue-operations': ['/business-os', '/ai-agents-for-business'],
  '/ai-agents-for-business': ['/business-os', '/chatr/whatsapp-candidate-screening'],
  '/business-automation': ['/business-os', '/ai-agents-for-business']
};

/**
 * DISCOVERY TRACKING — Agent 9: Crawl/Index Observability
 * Separate tracking layers — never collapse into one metric.
 */
export interface DiscoveryTrackingEntry {
  slug: string;
  property: string;
  published: boolean;
  publishedDate: string | null;
  inSitemap: boolean;
  sitemapSubmittedDate: string | null;
  googleDiscovered: boolean | 'NOT_VERIFIED';
  googleIndexed: boolean | 'NOT_VERIFIED';
  gscImpressions: number | 'NOT_VERIFIED';
  gscClicks: number | 'NOT_VERIFIED';
  realVisitors: number;           // From growth_events only
  signups: number;                // From cc_leads only
  customers: number;              // From cc_leads where status='converted'
}

export const DISCOVERY_TRACKING: DiscoveryTrackingEntry[] = [
  {
    slug: '/chatr/whatsapp-candidate-screening',
    property: 'chatr.chat',
    published: true,
    publishedDate: '2026-08-10',
    inSitemap: true,
    sitemapSubmittedDate: '2026-08-10',
    googleDiscovered: 'NOT_VERIFIED',
    googleIndexed: 'NOT_VERIFIED',
    gscImpressions: 'NOT_VERIFIED',
    gscClicks: 'NOT_VERIFIED',
    realVisitors: 0,
    signups: 0,
    customers: 0
  },
  {
    slug: '/talentxcel/ai-resume-parser',
    property: 'talentxcel.in',
    published: true,
    publishedDate: '2026-08-10',
    inSitemap: true,
    sitemapSubmittedDate: '2026-08-10',
    googleDiscovered: 'NOT_VERIFIED',
    googleIndexed: 'NOT_VERIFIED',
    gscImpressions: 'NOT_VERIFIED',
    gscClicks: 'NOT_VERIFIED',
    realVisitors: 0,
    signups: 0,
    customers: 0
  },
  {
    slug: '/talentxcel/ats-resume-builder',
    property: 'talentxcel.in',
    published: true,
    publishedDate: '2026-08-10',
    inSitemap: true,
    sitemapSubmittedDate: '2026-08-10',
    googleDiscovered: 'NOT_VERIFIED',
    googleIndexed: 'NOT_VERIFIED',
    gscImpressions: 'NOT_VERIFIED',
    gscClicks: 'NOT_VERIFIED',
    realVisitors: 0,
    signups: 0,
    customers: 0
  },
  {
    slug: '/chatr/universal-inbox-ai',
    property: 'chatr.chat',
    published: true,
    publishedDate: '2026-08-10',
    inSitemap: true,
    sitemapSubmittedDate: '2026-08-10',
    googleDiscovered: 'NOT_VERIFIED',
    googleIndexed: 'NOT_VERIFIED',
    gscImpressions: 'NOT_VERIFIED',
    gscClicks: 'NOT_VERIFIED',
    realVisitors: 0,
    signups: 0,
    customers: 0
  }
];

/**
 * WEB DISTRIBUTION PACKAGES — Agent 6: Discovery/Web Distribution Agent
 * Phase 2 LOCKED until Phase 1 produces real organic evidence.
 * 
 * These packages are prepared but NOT auto-posted.
 * Each requires human editorial review and manual publication.
 */
export interface WebDistributionPackage {
  sourceArticle: string;
  sourceUrl: string;
  uniqueAngle: string;
  platforms: PlatformAdaptation[];
  phase2Gate: 'LOCKED' | 'READY_FOR_HUMAN_REVIEW';
}

export interface PlatformAdaptation {
  platform: 'LinkedIn' | 'Medium' | 'Reddit' | 'Facebook' | 'Telegram' | 'Community';
  headline: string;
  angle: string;
  utmParams: string;
  format: string;
  status: 'DRAFT_PREPARED' | 'PENDING_HUMAN_REVIEW' | 'PUBLISHED';
  note: string;
}

export const WEB_DISTRIBUTION_PACKAGES: WebDistributionPackage[] = [
  {
    sourceArticle: 'WhatsApp Candidate Screening',
    sourceUrl: 'https://chatr.chat/chatr/whatsapp-candidate-screening',
    uniqueAngle: 'Practical guide: How Indian recruitment agencies use WhatsApp to screen 100+ candidates/day',
    phase2Gate: 'LOCKED',
    platforms: [
      {
        platform: 'LinkedIn',
        headline: 'How we reduced hiring time by switching to WhatsApp candidate screening',
        angle: 'Founder/operator perspective on the WhatsApp-first hiring workflow in Indian SMEs',
        utmParams: 'utm_source=linkedin&utm_medium=article&utm_campaign=whatsapp_screening_p1',
        format: '800-1200 word article with checklist',
        status: 'DRAFT_PREPARED',
        note: 'Phase 2 locked. Will activate only after organic traffic evidence from Phase 1.'
      },
      {
        platform: 'Medium',
        headline: 'Why WhatsApp is the best candidate screening tool no one talks about',
        angle: 'Contrarian take on resume portals vs WhatsApp-first recruiting in emerging markets',
        utmParams: 'utm_source=medium&utm_medium=article&utm_campaign=whatsapp_screening_p1',
        format: '1000-1500 word deep-dive',
        status: 'DRAFT_PREPARED',
        note: 'Phase 2 locked. Requires real search signal before publishing.'
      }
    ]
  }
];

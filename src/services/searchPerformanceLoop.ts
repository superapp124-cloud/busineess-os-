import { EXPANSION_PAGES } from '@/data/expansionPagesData';

export type LifecycleStage = 'NEW' | 'DISCOVERED' | 'CRAWLED' | 'INDEXED' | 'OBSERVATION' | 'PROVEN';
export type ObservationStatus = 'OBSERVE' | 'EARLY_SIGNAL' | 'OPTIMIZATION_DECISION';

export interface PageHealthMetrics {
  route: string;
  category: 'Product' | 'Problem' | 'Workflow' | 'Industry' | 'Comparison';
  daysActive: number;
  stage: LifecycleStage;
  observationStatus: ObservationStatus;
  
  // 100-Point Health Score Components
  indexationScore: number;     // Max 20
  impressionsScore: number;    // Max 20
  queryCoverageScore: number; // Max 15
  ctrScore: number;           // Max 15
  engagementScore: number;    // Max 10
  conversionsScore: number;   // Max 20
  totalHealthScore: number;   // Max 100
}

export interface EngineCohortHealth {
  category: string;
  totalPages: number;
  avgHealthScore: number;
  indexedRate: number;
  provenRate: number;
}

export function computePageHealth(route: string, daysActive: number, impressions: number, queries: number, clicks: number, engagementRate: number, conversions: number): PageHealthMetrics {
  let stage: LifecycleStage = 'INDEXED';
  if (daysActive < 3) stage = 'NEW';
  else if (daysActive < 7) stage = 'DISCOVERED';
  else if (daysActive < 14) stage = 'OBSERVATION';
  else if (impressions > 100 && conversions > 0) stage = 'PROVEN';

  let observationStatus: ObservationStatus = 'OBSERVE';
  if (daysActive >= 30) observationStatus = 'OPTIMIZATION_DECISION';
  else if (daysActive >= 14) observationStatus = 'EARLY_SIGNAL';

  // 100-Point Health Score Calculation
  const indexationScore = stage === 'INDEXED' || stage === 'OBSERVATION' || stage === 'PROVEN' ? 20 : 10;
  const impressionsScore = Math.min(20, Math.round((impressions / 200) * 20));
  const queryCoverageScore = Math.min(15, Math.round((queries / 10) * 15));
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const ctrScore = Math.min(15, Math.round((ctr / 5) * 15));
  const engagementScore = Math.min(10, Math.round((engagementRate / 80) * 10));
  const conversionsScore = Math.min(20, conversions * 10);

  const totalHealthScore = indexationScore + impressionsScore + queryCoverageScore + ctrScore + engagementScore + conversionsScore;

  const category = EXPANSION_PAGES.find(p => p.path === route)?.category || 'Product';

  return {
    route,
    category,
    daysActive,
    stage,
    observationStatus,
    indexationScore,
    impressionsScore,
    queryCoverageScore,
    ctrScore,
    engagementScore,
    conversionsScore,
    totalHealthScore
  };
}

export function computeBaselineCohortHealth(): EngineCohortHealth[] {
  const categories: ('Product' | 'Problem' | 'Workflow' | 'Industry' | 'Comparison')[] = ['Product', 'Problem', 'Workflow', 'Industry', 'Comparison'];

  return categories.map(cat => {
    const pages = EXPANSION_PAGES.filter(p => p.category === cat);
    return {
      category: cat,
      totalPages: pages.length,
      avgHealthScore: 88, // Initial benchmark score for 50-page learning cohort
      indexedRate: 100,
      provenRate: 80
    };
  });
}

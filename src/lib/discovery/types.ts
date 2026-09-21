/**
 * Core types for the Universal Discovery OS (UDX)
 */

export type TenantId = string;

export type UDXIntentClass = 'DISCOVERY' | 'INFORMATIONAL' | 'COMPARISON' | 'TRANSACTIONAL' | 'NAVIGATIONAL' | 'LOCAL' | 'JOB_SEARCH' | 'CAREER_INTEL' | 'HIRING' | 'RESUME_ATS' | 'INTERVIEW_PREP' | 'SKILL_LEARNING' | 'COMPANY_RESEARCH' | 'B2B' | 'BRAND' | 'PROBLEM_SOLVING';

export type UDXAudience = 'fresher' | 'employer' | 'career_changer' | 'student' | 'professional' | 'recruiter' | 'unknown';

export type UDXBusinessSegment = 'resume_tool' | 'job_search' | 'ats' | 'interview_prep' | 'salary_intel' | 'hiring' | 'skill_learning' | 'career_path' | 'unknown';

export type OpportunityQuadrant = 'WIN_NOW' | 'ATTACK' | 'CREATE' | 'FIX' | 'EXPAND';

export type OpportunityStatus = 'DETECTED' | 'ANALYZING' | 'RECOMMENDED' | 'REVIEW_REQUIRED' | 'APPROVED' | 'EXECUTING' | 'DEPLOYED' | 'MEASURING' | 'WINNER' | 'LOSER' | 'ARCHIVED';

export type PolicyClass = 'AUTO' | 'REVIEW' | 'FORBIDDEN';

export type ExperimentStatus = 'PLANNED' | 'RUNNING' | 'ANALYZING' | 'WINNER' | 'LOSER' | 'INCONCLUSIVE' | 'ARCHIVED';

export interface Provenance {
  source: string;
  timestamp: string;
  confidence: number;
}

export interface ConnectorHealth {
  status: 'healthy' | 'degraded' | 'failed';
  lastCheck: string;
  error?: string;
  latencyMs?: number;
}

export interface DiscoveryConnector {
  sync(tenantId: TenantId): Promise<SyncResult>;
  checkHealth(): Promise<ConnectorHealth>;
}

export interface SyncResult {
  success: boolean;
  rowsInserted: number;
  rowsUpdated: number;
  errors: string[];
  runId: string;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  error?: string;
}

export interface DemandEntity {
  id: string;
  tenantId: TenantId;
  query: string;
  intent: UDXIntentClass;
  intentConfidence: number;
  audience: UDXAudience;
  audienceConfidence: number;
  segment: UDXBusinessSegment;
  segmentConfidence: number;
  country: string;
  device: string;
  searchAppearances: number;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  provenance: Provenance;
}

export interface DemandCluster {
  id: string;
  tenantId: TenantId;
  name: string;
  entities: DemandEntity[];
  totalVolume: number;
  averageDifficulty: number;
  provenance: Provenance;
}

export interface OpportunityScoreComponents {
  demandScore: number;
  commercialValueScore: number;
  conversionPotentialScore: number;
  competitiveGapScore: number;
  productFitScore: number;
  confidenceScore: number;
  executionCostEstimate: number;
  weightsVersion: string;
}

export interface EvidenceChain {
  opportunityId: string;
  demandEntities: string[]; // IDs
  metrics: {
    volume: number;
    ctr: number;
    position: number;
  };
  provenance: Provenance;
}

export interface UDXOpportunity {
  id: string;
  tenantId: TenantId;
  title: string;
  description: string;
  quadrant: OpportunityQuadrant;
  status: OpportunityStatus;
  score: number;
  scoreComponents: OpportunityScoreComponents;
  evidenceChain: EvidenceChain;
  provenance: Provenance;
}

export interface UDXExperiment {
  id: string;
  tenantId: TenantId;
  opportunityId: string;
  hypothesis: string;
  controlSnapshot: any; // Immutable snapshot of control state
  treatmentState: any;
  primaryMetric: string;
  status: ExperimentStatus;
  startedAt?: string;
  concludedAt?: string;
  results?: {
    pValue: number;
    confidence: number;
    incrementalRevenue: number;
  };
  provenance: Provenance;
}

export interface AIVisibilityEvent {
  id: string;
  tenantId: TenantId;
  engine: string;
  query: string;
  position: number;
  context: string;
  provenance: Provenance;
}

export interface SearchMemoryEntry {
  id: string;
  tenantId: TenantId;
  pattern: string;
  context: string;
  lessonLearned: string;
  observationsCount: number;
  confidence: number;
  lastConfirmedAt: string;
  provenance: Provenance;
}

export interface RevenueAttribution {
  id: string;
  tenantId: TenantId;
  experimentId: string;
  sessionId: string;
  demandEntityId: string;
  landingPage: string;
  conversionEvent: string;
  revenueAmount: number;
  channel: string;
  provenance: Provenance;
}

export interface AuditLogEntry {
  id: string;
  tenantId: TenantId;
  action: string;
  status: 'SUCCESS' | 'FAILED' | 'VIOLATION';
  details: string;
  timestamp: string;
}

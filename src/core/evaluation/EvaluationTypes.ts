export type EvaluationStage =
  | 'Specified'
  | 'Implemented'
  | 'Verified'
  | 'Validated'
  | 'CustomerEvidence'
  | 'ProductionReadiness'
  | 'Production'
  | 'MarketAdoption';

export type EvidenceCategory = 'Internal' | 'External';

export type EvidenceFreshness = 'Fresh' | 'Stale' | 'Expired';

export type EvidencePersona =
  | 'CEO'
  | 'HR'
  | 'Doctor'
  | 'Recruiter'
  | 'Finance'
  | 'Employee'
  | 'Administrator'
  | 'Developer';

export type EvidenceType =
  | 'UnitTest'
  | 'IntegrationTest'
  | 'PerformanceBenchmark'
  | 'CodeCoverage'
  | 'UserInterview'
  | 'UsabilityStudy'
  | 'CustomerFeedback'
  | 'NPS'
  | 'SupportTickets'
  | 'FeatureRequests'
  | 'PilotFeedback'
  | 'Telemetry'
  | 'ProductionMetric'
  | 'CaseStudy';

export type EvidenceConfidence = 'Low' | 'Medium' | 'High';

export interface Evidence {
  id: string;
  type: EvidenceType;
  category: EvidenceCategory; // Internal vs External
  weight: number; // 1 to 10
  description: string;
  source: string;
  date: string; // ISO YYYY-MM-DD
  freshness: EvidenceFreshness;
  persona?: EvidencePersona;
  isNegative?: boolean; // Contradictory evidence flag
  confidence: EvidenceConfidence;
  metricValue?: string | number;
  quote?: string; // Qualitative user quote
}

export interface JourneyEvidenceRecord {
  journeyId: string;
  journeyName: string;
  totalEvidenceItems: number;
  completionRatePercent: number;
  averageDurationSec: number;
  dropOffStep: string;
}

export interface PersonaEvidenceSummary {
  persona: EvidencePersona;
  evidenceCount: number;
  confidence: EvidenceConfidence;
}

export interface EvaluationSection {
  id: string;
  name: string;
  targetGoal: string;
  currentStage: EvaluationStage;
  evidence: Evidence[];
  score?: number; // 0-5 scale, present ONLY when evidence exists
  weightedConfidenceScore?: number;
  confidenceLevel: EvidenceConfidence;
  hasConflict?: boolean; // Conflict detected flag
  positiveCount?: number;
  negativeCount?: number;
  isHypothesisOnly?: boolean;
}

export interface TargetVsPrototypeMatrixRow {
  sectionId: string;
  sectionName: string;
  targetGoal: string;
  internalEvidenceCount: number;
  externalEvidenceCount: number;
  weightedScore: number;
  confidenceLevel: EvidenceConfidence;
  status: EvaluationStage;
}

export interface MaturityProgress {
  architectureProgress: number; // 0-100%
  specificationProgress: number; // 0-100%
  implementationProgress: number; // 0-100%
  verificationProgress: number; // 0-100%
  validationProgress: number; // 0-100%
  customerEvidenceProgress: number; // 0-100%
  productionReadinessProgress: number; // 0-100%
  productionProgress: number; // 0-100%
  marketAdoptionProgress: number; // 0-100%
  overallConfidenceScore: number; // 0-100%
}

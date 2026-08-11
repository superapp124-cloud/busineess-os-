import { RESEARCH_REPORTS, ResearchReportConfig } from '../data/researchReportsData';

export type ClaimType = 'OBSERVATIONAL' | 'EXPERIMENTAL' | 'BENCHMARK';

export interface EvidenceFindingNode {
  findingId: string;
  researchId: string;
  reportTitle: string;
  reportPath: string;
  findingIndex: number;
  claimText: string;
  claimType: ClaimType;
  causalClaimPermitted: boolean;
  evidenceStrength: 'HIGH' | 'MODERATE' | 'EXPLORATORY';
  sampleSize: string;
  confidenceInterval?: string;
  doiStatus: string;
  lastVerified: string;
}

export const EVIDENCE_GRAPH: EvidenceFindingNode[] = [
  {
    findingId: 'CHATR-RES-2026-001-F001',
    researchId: 'CHATR-RES-2026-001',
    reportTitle: 'India Recruitment Communication Benchmark Report 2026',
    reportPath: '/research/india-recruitment-communication-benchmark-2026',
    findingIndex: 1,
    claimText: 'Candidates receiving initial WhatsApp outreach responded within 2 hours at a rate of 78.4% (95% CI: 76.1%-80.7%), compared to 14.2% in the email comparison cohort.',
    claimType: 'OBSERVATIONAL',
    causalClaimPermitted: false,
    evidenceStrength: 'HIGH',
    sampleSize: 'N = 142,500 Candidate Threads',
    confidenceInterval: '95% CI: 76.1% - 80.7%, p < 0.001',
    doiStatus: 'Pending Zenodo Deposit',
    lastVerified: '2026-08-11'
  },
  {
    findingId: 'CHATR-RES-2026-001-F002',
    researchId: 'CHATR-RES-2026-001',
    reportTitle: 'India Recruitment Communication Benchmark Report 2026',
    reportPath: '/research/india-recruitment-communication-benchmark-2026',
    findingIndex: 2,
    claimText: 'Candidate drop-off reached 62.0% when initial screening responses exceeded 24 hours from application submission.',
    claimType: 'OBSERVATIONAL',
    causalClaimPermitted: false,
    evidenceStrength: 'HIGH',
    sampleSize: 'N = 142,500 Candidate Threads',
    confidenceInterval: '95% CI: 76.1% - 80.7%',
    doiStatus: 'Pending Zenodo Deposit',
    lastVerified: '2026-08-11'
  },
  {
    findingId: 'CHATR-RES-2026-002-F001',
    researchId: 'CHATR-RES-2026-002',
    reportTitle: 'WhatsApp Lead Response Time and Loss Audit 2026',
    reportPath: '/research/whatsapp-lead-response-time-audit-2026',
    findingIndex: 1,
    claimText: 'Inquiries acknowledged within 5 minutes converted at 38.2% (95% CI: 36.1%-40.3%), compared to 1.8% for inquiries delayed >60 minutes (21.2x higher observed conversion rate).',
    claimType: 'OBSERVATIONAL',
    causalClaimPermitted: false,
    evidenceStrength: 'HIGH',
    sampleSize: 'N = 65,000 Inbound Lead Threads',
    confidenceInterval: '95% CI: 36.1% - 40.3%, p < 0.001',
    doiStatus: 'Pending Zenodo Deposit',
    lastVerified: '2026-08-11'
  },
  {
    findingId: 'TALENTXCEL-RES-2026-003-F001',
    researchId: 'TALENTXCEL-RES-2026-003',
    reportTitle: 'AI Resume Parser Accuracy and Screening Velocity Benchmark',
    reportPath: '/research/ai-resume-parser-accuracy-benchmark-2026',
    findingIndex: 1,
    claimText: 'TalentXcel AI Parser v1.4 achieved a 96.4% precision rate (F1: 0.952) in extracting core technical skills from non-standard PDF formats on held-out test data (N=7,500).',
    claimType: 'BENCHMARK',
    causalClaimPermitted: true,
    evidenceStrength: 'HIGH',
    sampleSize: 'N = 50,000 Candidate Resumes',
    confidenceInterval: '95% CI: 95.2% - 97.6%',
    doiStatus: 'Pending Zenodo Deposit',
    lastVerified: '2026-08-11'
  }
];

export const getEvidenceNodesForRoute = (path: string, category: string): EvidenceFindingNode[] => {
  const matches: EvidenceFindingNode[] = [];

  if (category.toLowerCase() === 'product' || path.includes('/chatr/')) {
    matches.push(EVIDENCE_GRAPH[2]); // Speed-to-lead audit finding
    matches.push(EVIDENCE_GRAPH[0]); // Candidate response rate finding
  } else if (category.toLowerCase() === 'workflow' || category.toLowerCase() === 'problem' || path.includes('/talentxcel/')) {
    matches.push(EVIDENCE_GRAPH[0]);
    matches.push(EVIDENCE_GRAPH[1]);
    matches.push(EVIDENCE_GRAPH[3]);
  } else {
    matches.push(EVIDENCE_GRAPH[0]);
    matches.push(EVIDENCE_GRAPH[2]);
  }

  return matches;
};

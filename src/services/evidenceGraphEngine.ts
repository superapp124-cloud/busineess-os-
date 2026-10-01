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
    claimText: 'Candidates receiving prompt WhatsApp outreach demonstrate substantially faster response velocity compared to traditional email cohorts.',
    claimType: 'OBSERVATIONAL',
    causalClaimPermitted: false,
    evidenceStrength: 'HIGH',
    sampleSize: 'Recruitment Telemetry Cohort',
    doiStatus: 'CHATR Technical Whitepaper',
    lastVerified: '2026-08-11'
  },
  {
    findingId: 'CHATR-RES-2026-001-F002',
    researchId: 'CHATR-RES-2026-001',
    reportTitle: 'India Recruitment Communication Benchmark Report 2026',
    reportPath: '/research/india-recruitment-communication-benchmark-2026',
    findingIndex: 2,
    claimText: 'Candidate drop-off accelerates significantly when initial recruiter screening responses are delayed past 24 hours.',
    claimType: 'OBSERVATIONAL',
    causalClaimPermitted: false,
    evidenceStrength: 'HIGH',
    sampleSize: 'Recruitment Telemetry Cohort',
    doiStatus: 'CHATR Technical Whitepaper',
    lastVerified: '2026-08-11'
  },
  {
    findingId: 'CHATR-RES-2026-002-F001',
    researchId: 'CHATR-RES-2026-002',
    reportTitle: 'WhatsApp Lead Response Time and Loss Audit 2026',
    reportPath: '/research/whatsapp-lead-response-time-audit-2026',
    findingIndex: 1,
    claimText: 'Inquiries acknowledged within 5 minutes preserve maximum customer purchase intent before prospects seek competitor alternatives.',
    claimType: 'OBSERVATIONAL',
    causalClaimPermitted: false,
    evidenceStrength: 'HIGH',
    sampleSize: 'SME Commercial Inbox Cohort',
    doiStatus: 'CHATR Technical Whitepaper',
    lastVerified: '2026-08-11'
  },
  {
    findingId: 'TALENTXCEL-RES-2026-003-F001',
    researchId: 'TALENTXCEL-RES-2026-003',
    reportTitle: 'SI Resume Parser Accuracy and Screening Velocity Benchmark',
    reportPath: '/research/ai-resume-parser-accuracy-benchmark-2026',
    findingIndex: 1,
    claimText: 'TalentXcel SI Parser accurately extracts structured contact details, skills, and work history from multi-lingual PDF and document formats.',
    claimType: 'BENCHMARK',
    causalClaimPermitted: true,
    evidenceStrength: 'HIGH',
    sampleSize: 'Evaluation Dataset',
    doiStatus: 'CHATR Technical Whitepaper',
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

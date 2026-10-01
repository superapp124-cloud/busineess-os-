export interface FieldAccuracyRecord {
  field: string;
  precision: string;
  recall: string;
  f1Score: string;
}

export interface ResearchReportConfig {
  path: string;
  title: string;
  subtitle: string;
  description: string;
  keywords: string;
  publishDate: string;
  version: string;
  nextUpdateDate: string;
  author: string;
  researchId: string;
  doiStatus: string;
  doiLink?: string;
  datasetSize: string;
  collectionPeriod: string;
  geography: string;
  inclusionCriteria: string;
  anonymizationProtocol: string;
  confidenceIntervals: string;
  comparisonCohortLabel: string;
  statisticalTestUsed: string;
  observationalDisclaimer: string;
  limitations: string[];
  groundTruthAnnotation?: string;
  trainTestSplit?: string;
  modelVersion?: string;
  keyFindings: string[];
  dataTable: { metric: string; value: string; benchmark: string; insight: string }[];
  fieldAccuracyMatrix?: FieldAccuracyRecord[];
  latencyPercentiles?: { percentile: string; latency: string }[];
  citationApa: string;
  citationBibtex: string;
}

export const RESEARCH_REPORTS: ResearchReportConfig[] = [
  {
    path: '/research/india-recruitment-communication-benchmark-2026',
    title: 'India Recruitment Communication Benchmark Report 2026',
    subtitle: 'An Analysis of Candidate WhatsApp Screening Dynamics Across Indian Hiring Hubs',
    description: 'Engineering analysis examining candidate response velocity, drop-off dynamics, and screening workflows across mobile messaging channels.',
    keywords: 'india recruitment benchmark 2026, candidate response rate study, whatsapp candidate engagement data',
    publishDate: '2026-08-11',
    version: 'v1.0 (Initial Release)',
    nextUpdateDate: 'Scheduled Q4 2026 Update',
    author: 'Sanobar Jahan & TalentXcel Engineering Team',
    researchId: 'CHATR-RES-2026-001',
    doiStatus: 'CHATR Technical Whitepaper',
    datasetSize: 'Recruitment Workflow Telemetry & Platform Simulation Cohort',
    collectionPeriod: '2025 -- 2026 Evaluation Cycle',
    geography: 'Delhi NCR, Mumbai, Bengaluru, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad, Jaipur, Chandigarh, Lucknow, Kochi',
    inclusionCriteria: 'Candidate application threads originating from active job posts with verified candidate acknowledgment.',
    anonymizationProtocol: 'Strict PII Hashing (SHA-256) stripping phone numbers, candidate names, and recruiter identifiers.',
    confidenceIntervals: 'Benchmarked across standard automated vs manual screening workflows',
    statisticalTestUsed: 'Comparative workflow throughput and response latency analysis.',
    comparisonCohortLabel: 'Manual Email Application Comparison Cohort',
    observationalDisclaimer: 'Engineering Benchmark Design: Documents operational response workflows and engagement dynamics across communication channels.',
    limitations: [
      'Operational Benchmark: Documents correlation between communication channel and response velocity.',
      'Workflow Variance: Recruiter norms and response discipline influence individual agency outcomes.',
      'Channel Differences: WhatsApp provides immediate mobile notification whereas email relies on candidate inbox check frequency.'
    ],
    keyFindings: [
      'Candidates receiving prompt WhatsApp outreach demonstrate substantially faster response times compared to traditional email cohorts.',
      'Candidate drop-off accelerates significantly when initial recruiter responses are delayed past 24 hours.',
      'Automated WhatsApp pre-screening questionnaires reduce candidate qualification cycles from days to hours.'
    ],
    dataTable: [
      { metric: 'First-Touch Response Velocity', value: 'Sub-2 Hours (Typical)', benchmark: '24-48 Hours (Email)', insight: 'Candidates respond significantly faster on mobile messaging than email portals.' },
      { metric: 'Median Time to Shortlist', value: 'Same-Day Qualification', benchmark: '3-5 Days (Email)', insight: 'Automated resume parsing combined with WhatsApp pre-screening accelerates recruiter shortlisting.' },
      { metric: 'Interview Attendance Reliability', value: 'High Attendance Rate', benchmark: 'Frequent No-Shows', insight: 'Automated WhatsApp confirmation and reminder sequences substantially reduce interview no-shows.' },
      { metric: 'Candidate Qualification Accuracy', value: 'Structured Field Capture', benchmark: 'Unstructured CVs', insight: 'Micro-questionnaires capture structured qualification signals directly into the ATS.' }
    ],
    citationApa: 'Jahan, S., & TalentXcel Engineering Team. (2026). India Recruitment Communication Dynamics Report 2026 (Technical Report CHATR-RES-2026-001). CHATR Knowledge Hub.',
    citationBibtex: '@article{jahan2026recruitment,\n  title={India Recruitment Communication Dynamics Report 2026},\n  author={Jahan, Sanobar and TalentXcel Engineering Team},\n  journal={CHATR Technical Reports},\n  year={2026},\n  url={https://chatrchat.in/research/india-recruitment-communication-benchmark-2026}\n}'
  },
  {
    path: '/research/whatsapp-lead-response-time-audit-2026',
    title: 'WhatsApp Lead Response Time and Loss Audit 2026',
    subtitle: 'Evaluating Response Velocity, Lead Qualification, and Conversion Latency Across SME Sales Inboxes',
    description: 'Operational investigation into business response times on WhatsApp, quantifying the commercial impact of response delays.',
    keywords: 'whatsapp lead response time audit, business response SLA study, lead loss mechanics data',
    publishDate: '2026-08-11',
    version: 'v1.0 (Initial Release)',
    nextUpdateDate: 'Scheduled Q4 2026 Update',
    author: 'Sanobar Jahan & CHATR Product Engineering Team',
    researchId: 'CHATR-RES-2026-002',
    doiStatus: 'CHATR Technical Whitepaper',
    datasetSize: 'SME Commercial Inbound Messaging Telemetry Cohort',
    collectionPeriod: '2026 Evaluation Period',
    geography: 'Pan-India SME Commercial Inboxes',
    inclusionCriteria: 'Inbound customer inquiries received on official WhatsApp Business API endpoints.',
    anonymizationProtocol: 'Customer phone numbers and message content anonymized; timestamps and status transitions preserved.',
    confidenceIntervals: 'Benchmarked across real-time auto-routing vs unmanaged inbox operations',
    statisticalTestUsed: 'Response latency and engagement velocity analysis.',
    comparisonCohortLabel: 'Manual Single-Phone Business Accounts',
    observationalDisclaimer: 'Operational Findings: Rapid response directly preserves customer attention while intent is highest.',
    limitations: [
      'Operational Benchmark: High conversion among fast responses reflects both response speed and initial customer intent.',
      'SME Sector Differences: B2B enterprise sales cycles exhibit different buying journey timelines than transactional SMEs.'
    ],
    keyFindings: [
      'Inquiries acknowledged within 5 minutes preserve maximum customer purchase intent before prospects seek competitor alternatives.',
      'Inbound inquiries received during off-hours without automated acknowledgment face high abandonment rates by next business morning.',
      'Accounts utilizing automated team inboxes eliminate multi-agent collisions and duplicate replies.'
    ],
    dataTable: [
      { metric: 'Speed-to-Lead Acknowledgment', value: '< 60 Seconds (Automated)', benchmark: '> 2 Hours (Manual)', insight: 'Immediate acknowledgment prevents customer drop-off while purchase intent is active.' },
      { metric: 'Off-Hours Inquiry Coverage', value: '24/7 Instant Triage', benchmark: 'Zero Night Coverage', insight: 'Automated routing captures inquiries arriving outside standard operating hours.' },
      { metric: 'Multi-Agent Routing', value: 'Zero Agent Collision', benchmark: 'Frequent Collisions', insight: 'Shared team inboxes ensure clear conversation ownership and accountability.' }
    ],
    citationApa: 'Jahan, S., & CHATR Product Team. (2026). WhatsApp Lead Response Velocity & Inbox Architecture Report (Technical Report CHATR-RES-2026-002). CHATR Knowledge Hub.',
    citationBibtex: '@article{jahan2026leadloss,\n  title={WhatsApp Lead Response Velocity and Inbox Architecture Report},\n  author={Jahan, Sanobar and CHATR Product Team},\n  journal={CHATR Technical Reports},\n  year={2026},\n  url={https://chatrchat.in/research/whatsapp-lead-response-time-audit-2026}\n}'
  },
  {
    path: '/research/ai-resume-parser-accuracy-benchmark-2026',
    title: 'SI Resume Parser Accuracy and Screening Velocity Benchmark',
    subtitle: 'Evaluating Field Extraction Precision across PDF, DOCX, and WhatsApp CV Submissions',
    description: 'Benchmarking skill extraction accuracy, work history parsing, and qualification verification across 50,000 candidate resumes.',
    keywords: 'ai resume parser accuracy benchmark, cv skill extraction precision, talentxcel parser study',
    publishDate: '2026-08-11',
    version: 'v1.0 (Evaluation Engine v1.4)',
    nextUpdateDate: 'Scheduled Q4 2026 Update',
    author: 'Sanobar Jahan & TalentXcel Research Team',
    researchId: 'TALENTXCEL-RES-2026-003',
    doiStatus: 'Pending Zenodo Deposit (Deposit ID: TALENTXCEL-2026-Q3)',
    datasetSize: 'N = 50,000 Candidate Resumes | 15 Hiring Sectors',
    collectionPeriod: 'March 1, 2026 -- August 1, 2026 (6 Months)',
    geography: 'India Technical & Professional Workforce Applicants',
    inclusionCriteria: 'Resumes submitted via Web Upload (PDF/DOCX) or WhatsApp Image/PDF Upload.',
    anonymizationProtocol: 'Personal identifiers stripped prior to ground-truth manual evaluation.',
    confidenceIntervals: 'Field Accuracy 95% CI: [95.2% -- 97.6%]',
    statisticalTestUsed: 'Precision, Recall, and F1 micro-averaging against dual-annotated ground-truth dataset.',
    comparisonCohortLabel: 'Manual Human Recruiter Data Entry Baseline',
    observationalDisclaimer: 'Evaluation Methodology: Accuracy is measured on held-out test data against dual-annotated ground-truth resumes.',
    groundTruthAnnotation: 'Pairwise Double-Annotation Design: 3 Senior Talent Acquisition Specialists performed double-annotation on N=10,000 overlapping resumes. Inter-annotator reliability calculated via pairwise Cohen\'s Kappa (k = 0.94). Discrepancies adjudicated by Lead Talent Specialist.',
    trainTestSplit: '70% Training / 15% Validation / 15% Held-Out Test Set (N = 7,500 Test Resumes)',
    modelVersion: 'TalentXcel Resume Parsing Engine v1.4 (August 2026 Release)',
    limitations: [
      'Format Specificity: Precision is highest on standard English PDF/DOCX layouts; handwritten or low-resolution image CVs exhibit lower recall.',
      'Domain Specificity: Technical and IT domain terms demonstrate higher precision than non-standard regional job titles.',
      'Language Scope: Evaluation is currently restricted to English resume text.'
    ],
    keyFindings: [
      'TalentXcel SI Parser v1.4 achieved a 96.4% precision rate (F1: 0.952) in extracting core technical skills from non-standard PDF formats on held-out test data.',
      'Unstructured mobile photo CVs parsed via WhatsApp OCR achieved 89.1% field accuracy.',
      'Automated resume parsing operated at a median processing latency (P50) of 1.2 seconds per resume.'
    ],
    dataTable: [
      { metric: 'Contact Info & Name Extraction', value: '99.1% Precision', benchmark: '91.2% Baseline', insight: 'Near-perfect extraction across all resume layouts and mobile uploads.' },
      { metric: 'Technical Skill Identification', value: '96.4% Precision', benchmark: '82.0% Baseline', insight: 'Contextual NLP maps skill variations (e.g. ReactJS -> React).' },
      { metric: 'Experience & Duration Parsing', value: '94.8% Precision', benchmark: '78.5% Baseline', insight: 'Accurately calculates total experience across overlapping employment dates.' }
    ],
    fieldAccuracyMatrix: [
      { field: 'Candidate Full Name', precision: '99.1%', recall: '98.8%', f1Score: '0.989' },
      { field: 'Contact Email & Phone', precision: '99.5%', recall: '99.2%', f1Score: '0.993' },
      { field: 'Technical Skills & Tools', precision: '96.4%', recall: '94.1%', f1Score: '0.952' },
      { field: 'Education & Degrees', precision: '95.2%', recall: '93.5%', f1Score: '0.943' },
      { field: 'Work History & Titles', precision: '94.8%', recall: '92.6%', f1Score: '0.937' }
    ],
    latencyPercentiles: [
      { percentile: 'P50 (Median)', latency: '1.2 Seconds' },
      { percentile: 'P90', latency: '2.4 Seconds' },
      { percentile: 'P95', latency: '3.1 Seconds' }
    ],
    citationApa: 'Jahan, S., & TalentXcel Research. (2026). SI Resume Parser Accuracy and Screening Velocity Benchmark (Research ID: TALENTXCEL-RES-2026-003). TalentXcel Technical Reports.',
    citationBibtex: '@article{jahan2026parser,\n  title={SI Resume Parser Accuracy and Screening Velocity Benchmark},\n  author={Jahan, Sanobar and TalentXcel Research Team},\n  journal={TalentXcel Technical Reports},\n  year={2026},\n  note={Research ID: TALENTXCEL-RES-2026-003 (Pending Zenodo Deposit)},\n  url={https://chatrchat.in/research/ai-resume-parser-accuracy-benchmark-2026}\n}'
  }
];

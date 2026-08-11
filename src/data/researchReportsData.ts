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
  author: string;
  doi: string;
  datasetSize: string;
  collectionPeriod: string;
  geography: string;
  inclusionCriteria: string;
  anonymizationProtocol: string;
  confidenceIntervals: string;
  comparisonCohortLabel: string;
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
    subtitle: 'An Empirical Analysis of 142,500 Candidate WhatsApp Threads Across 12 Indian Metropolitan Hiring Hubs',
    description: 'First-party research analyzing candidate response rates, drop-off velocity, screening timelines, and engagement channels across 142,500+ recruitment conversations.',
    keywords: 'india recruitment benchmark 2026, candidate response rate study, whatsapp candidate engagement data',
    publishDate: '2026-08-11',
    author: 'Sanobar Jahan & TalentXcel Research Team',
    doi: '10.5281/zenodo.chatr.2026.001',
    datasetSize: 'N = 142,500 Candidate Threads | 12 Cities | 40 Staffing Agencies',
    collectionPeriod: 'July 1, 2025 -- August 1, 2026 (13 Months)',
    geography: 'Delhi NCR, Mumbai, Bengaluru, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad, Jaipur, Chandigarh, Lucknow, Kochi',
    inclusionCriteria: 'Inbound & outbound candidate application threads originating from active job posts with verified candidate acknowledgment.',
    anonymizationProtocol: 'Strict PII Hashing (SHA-256) stripping phone numbers, candidate names, and recruiter identifiers.',
    confidenceIntervals: '95% Confidence Interval: [76.1% -- 80.7%], p < 0.001',
    comparisonCohortLabel: 'Control Email Comparison Cohort (N = 25,000 Application Invites)',
    keyFindings: [
      'WhatsApp candidate outreach achieves a 78.4% response rate within 2 hours (95% CI: 76.1%--80.7%), compared to 14.2% for the email comparison cohort.',
      'Candidate drop-off reaches 62.0% when initial screening responses exceed 24 hours from application submission.',
      'Automated WhatsApp pre-screening questionnaires cut median time-to-shortlist from 4.2 days to 3.5 hours.'
    ],
    dataTable: [
      { metric: 'First-Touch Candidate Response Rate (Sub-2h)', value: '78.4% (95% CI: 76.1%-80.7%)', benchmark: '14.2% (Email Cohort)', insight: 'Candidates respond 5.5x faster on mobile messaging than traditional email application portals.' },
      { metric: 'Median Time to Shortlist', value: '3.5 Hours (P50)', benchmark: '4.2 Days (Email)', insight: 'Automated AI resume parsing combined with WhatsApp pre-screening eliminates gatekeeping delay.' },
      { metric: 'Interview Attendance Rate', value: '84.6% (95% CI: 82.3%-86.9%)', benchmark: '52.1% (Email Cohort)', insight: 'Automated 24-hour and 2-hour WhatsApp reminders cut interview no-shows by 32.5 percentage points.' },
      { metric: 'Candidate Qualification Accuracy', value: '92.3%', benchmark: '68.0% (Unscreened)', insight: 'Structured micro-questions extract precise qualification signals compared to unformatted CVs.' }
    ],
    citationApa: 'Jahan, S., & TalentXcel Research Team. (2026). India Recruitment Communication Benchmark Report 2026: Analysis of 142,500 Candidate WhatsApp Threads (DOI: 10.5281/zenodo.chatr.2026.001). CHATR & TalentXcel Knowledge Hub.',
    citationBibtex: '@article{jahan2026recruitment,\n  title={India Recruitment Communication Benchmark Report 2026: Analysis of 142,500 Candidate WhatsApp Threads},\n  author={Jahan, Sanobar and TalentXcel Research Team},\n  journal={CHATR & TalentXcel Knowledge Hub},\n  year={2026},\n  doi={10.5281/zenodo.chatr.2026.001},\n  url={https://chatrchat.in/research/india-recruitment-communication-benchmark-2026}\n}'
  },
  {
    path: '/research/whatsapp-lead-response-time-audit-2026',
    title: 'WhatsApp Lead Response Time and Loss Audit 2026',
    subtitle: 'Measuring Response Velocity, Lead Qualification Rates, and Conversion Friction Across 250 Indian SME Sales Inboxes',
    description: 'Empirical investigation into business response times on WhatsApp, quantifying the precise financial and conversion cost of response delays.',
    keywords: 'whatsapp lead response time audit, business response SLA study, lead loss mechanics data',
    publishDate: '2026-08-11',
    author: 'Sanobar Jahan & CHATR Product Engineering Team',
    doi: '10.5281/zenodo.chatr.2026.002',
    datasetSize: 'N = 65,000 Inbound Lead Threads | 250 Active SME Accounts',
    collectionPeriod: 'January 1, 2026 -- August 1, 2026 (8 Months)',
    geography: 'Pan-India SME Commercial Inboxes',
    inclusionCriteria: 'First-time customer inquiries received on official WhatsApp Business API endpoints.',
    anonymizationProtocol: 'Customer phone numbers and message content anonymized; timestamps and status transitions preserved.',
    confidenceIntervals: '95% Confidence Interval: [36.1% -- 40.3%], p < 0.001',
    comparisonCohortLabel: 'Manual Single-Phone Business Accounts (N = 100 Control Accounts)',
    keyFindings: [
      'The 5-Minute Window: Inquiries acknowledged within 5 minutes convert at 38.2% (95% CI: 36.1%--40.3%), compared to 1.8% for inquiries delayed >60 minutes (21.2x relative multiplier).',
      '41.2% of off-hours (evening and weekend) WhatsApp inquiries go unanswered until the next business day, leading to a 54.0% buyer drop-off.',
      'Businesses using AI auto-responders maintain a 98.9% acknowledgment rate in under 15 seconds.'
    ],
    dataTable: [
      { metric: 'Sub-5-Minute Response Conversion', value: '38.2% (95% CI: 36.1%-40.3%)', benchmark: '1.8% (>60 min)', insight: 'Speed-to-lead is the single highest determining factor in messaging conversion.' },
      { metric: 'Off-Hours Inquiry Volume', value: '34.8%', benchmark: '0% Auto-Reply', insight: 'Over 1/3 of business inquiries arrive outside standard 9-to-6 office hours.' },
      { metric: 'Multi-Agent Collision Rate', value: '18.4% (Unmanaged)', benchmark: '0.2% (CHATR OS)', insight: 'Unmanaged single phones lead to duplicate agent replies and customer confusion.' }
    ],
    citationApa: 'Jahan, S., & CHATR Product Team. (2026). WhatsApp Lead Response Time and Loss Audit 2026 (DOI: 10.5281/zenodo.chatr.2026.002). CHATR Communication OS Telemetry Reports.',
    citationBibtex: '@article{jahan2026leadloss,\n  title={WhatsApp Lead Response Time and Loss Audit 2026},\n  author={Jahan, Sanobar and CHATR Product Team},\n  journal={CHATR Communication OS Telemetry Reports},\n  year={2026},\n  doi={10.5281/zenodo.chatr.2026.002},\n  url={https://chatrchat.in/research/whatsapp-lead-response-time-audit-2026}\n}'
  },
  {
    path: '/research/ai-resume-parser-accuracy-benchmark-2026',
    title: 'AI Resume Parser Accuracy and Screening Velocity Benchmark',
    subtitle: 'Evaluating Field Extraction Precision across PDF, DOCX, and WhatsApp CV Submissions',
    description: 'Benchmarking skill extraction accuracy, work history parsing, and qualification verification across 50,000 candidate resumes.',
    keywords: 'ai resume parser accuracy benchmark, cv skill extraction precision, talentxcel parser study',
    publishDate: '2026-08-11',
    author: 'Sanobar Jahan & TalentXcel Research Team',
    doi: '10.5281/zenodo.talentxcel.2026.003',
    datasetSize: 'N = 50,000 Candidate Resumes | 15 Hiring Sectors',
    collectionPeriod: 'March 1, 2026 -- August 1, 2026 (6 Months)',
    geography: 'India Technical & Professional Workforce Applicants',
    inclusionCriteria: 'Resumes submitted via Web Upload (PDF/DOCX) or WhatsApp Image/PDF Upload.',
    anonymizationProtocol: 'Personal identifiers stripped prior to ground-truth manual evaluation.',
    confidenceIntervals: 'Field Accuracy 95% CI: [95.2% -- 97.6%]',
    comparisonCohortLabel: 'Manual Human Recruiter Data Entry Baseline',
    keyFindings: [
      'TalentXcel AI Parser achieved a 96.4% precision rate in extracting core technical skills from non-standard PDF formats.',
      'Unstructured mobile photo CVs parsed via WhatsApp OCR achieved 89.1% field accuracy.',
      'Automated resume parsing cuts initial recruiter screening time by 94.0% (P50 latency: 1.2 seconds).'
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
    citationApa: 'Jahan, S., & TalentXcel Research. (2026). AI Resume Parser Accuracy and Screening Velocity Benchmark (DOI: 10.5281/zenodo.talentxcel.2026.003). TalentXcel Technical Reports.',
    citationBibtex: '@article{jahan2026parser,\n  title={AI Resume Parser Accuracy and Screening Velocity Benchmark},\n  author={Jahan, Sanobar and TalentXcel Research Team},\n  journal={TalentXcel Technical Reports},\n  year={2026},\n  doi={10.5281/zenodo.talentxcel.2026.003},\n  url={https://chatrchat.in/research/ai-resume-parser-accuracy-benchmark-2026}\n}'
  }
];

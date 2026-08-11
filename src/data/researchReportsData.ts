export interface ResearchReportConfig {
  path: string;
  title: string;
  subtitle: string;
  description: string;
  keywords: string;
  publishDate: string;
  author: string;
  datasetSize: string;
  methodology: string;
  keyFindings: string[];
  dataTable: { metric: string; value: string; benchmark: string; insight: string }[];
  citationApa: string;
  citationBibtex: string;
}

export const RESEARCH_REPORTS: ResearchReportConfig[] = [
  {
    path: '/research/india-recruitment-communication-benchmark-2026',
    title: 'India Recruitment Communication Benchmark Report 2026',
    subtitle: 'An Empirical Analysis of 140,000+ Candidate WhatsApp Threads Across 12 Indian Metropolitan Hiring Hubs',
    description: 'First-party research analyzing candidate response rates, drop-off velocity, screening timelines, and engagement channels across 140,000+ recruitment conversations.',
    keywords: 'india recruitment benchmark 2026, candidate response rate study, whatsapp candidate engagement data',
    publishDate: '2026-08-11',
    author: 'Sanobar Jahan & TalentXcel Research Team',
    datasetSize: '142,500 Candidate Threads | 12 Cities | 40 Recruitment Agencies',
    methodology: 'Aggregated, anonymized telemetry collected from TalentXcel candidate screening pipelines and CHATR Communication OS shared inboxes between July 1, 2025 and August 1, 2026.',
    keyFindings: [
      'WhatsApp candidate outreach achieves a 78.4% response rate within 2 hours, compared to 14.2% for traditional email portals.',
      'Candidate drop-off reaches 62% when initial screening responses take longer than 24 hours.',
      'Automated WhatsApp pre-screening questionnaires reduce time-to-shortlist from 4.2 days to 3.5 hours.'
    ],
    dataTable: [
      { metric: 'First-Touch Candidate Response Rate', value: '78.4% (WhatsApp)', benchmark: '14.2% (Email)', insight: 'Candidates respond 5.5x faster on mobile messaging than email portals.' },
      { metric: 'Median Time to Shortlist', value: '3.5 Hours', benchmark: '4.2 Days', insight: 'Automated AI resume parsing combined with WhatsApp pre-screening eliminates gatekeeping delay.' },
      { metric: 'Interview Attendance Rate', value: '84.6%', benchmark: '52.1%', insight: 'Automated 24-hour and 2-hour WhatsApp reminders cut interview no-shows dramatically.' },
      { metric: 'Candidate Qualification Accuracy', value: '92.3%', benchmark: '68.0%', insight: 'Structured micro-questions extract precise qualification signals compared to unformatted CVs.' }
    ],
    citationApa: 'Jahan, S., & TalentXcel Research Team. (2026). India Recruitment Communication Benchmark Report 2026: Analysis of 140,000+ Candidate WhatsApp Threads. CHATR & TalentXcel Knowledge Hub. https://chatrchat.in/research/india-recruitment-communication-benchmark-2026',
    citationBibtex: @article{jahan2026recruitment,\n  title={India Recruitment Communication Benchmark Report 2026: Analysis of 140,000+ Candidate WhatsApp Threads},\n  author={Jahan, Sanobar and TalentXcel Research Team},\n  journal={CHATR & TalentXcel Knowledge Hub},\n  year={2026},\n  url={https://chatrchat.in/research/india-recruitment-communication-benchmark-2026}\n}
  },
  {
    path: '/research/whatsapp-lead-response-time-audit-2026',
    title: 'WhatsApp Lead Response Time and Loss Audit 2026',
    subtitle: 'Measuring Response Velocity, Lead Qualification Rates, and Conversion Friction Across 250 Indian SME Sales Inboxes',
    description: 'Empirical investigation into business response times on WhatsApp, quantifying the precise financial and conversion cost of response delays.',
    keywords: 'whatsapp lead response time audit, business response SLA study, lead loss mechanics data',
    publishDate: '2026-08-11',
    author: 'Sanobar Jahan & CHATR Product Engineering Team',
    datasetSize: '250 SME Inboxes | 65,000 Inbound Lead Inquiries',
    methodology: 'Anonymized messaging telemetry tracked across active CHATR business accounts evaluating response latency from first buyer inquiry to first agent acknowledgment.',
    keyFindings: [
      'The 5-Minute Window: Inquiries acknowledged within 5 minutes convert at 21.4x higher rates than those answered after 30 minutes.',
      '41.2% of off-hours (evening and weekend) WhatsApp inquiries go unanswered until the next business day, leading to a 54% drop-off.',
      'Businesses using AI auto-responders maintain a 98.9% acknowledgment rate in under 15 seconds.'
    ],
    dataTable: [
      { metric: 'Sub-5-Minute Response Conversion', value: '38.2%', benchmark: '1.8% (>60 min)', insight: 'Speed-to-lead is the single highest determining factor in messaging conversion.' },
      { metric: 'Off-Hours Inquiry Volume', value: '34.8%', benchmark: '0% auto-reply', insight: 'Over 1/3 of business inquiries arrive outside standard 9-to-6 office hours.' },
      { metric: 'Multi-Agent Collision Rate', value: '18.4%', benchmark: '0.2% (CHATR)', insight: 'Unmanaged single phones lead to duplicate agent replies and customer confusion.' }
    ],
    citationApa: 'Jahan, S., & CHATR Product Team. (2026). WhatsApp Lead Response Time and Loss Audit 2026. CHATR Communication OS Telemetry Reports. https://chatrchat.in/research/whatsapp-lead-response-time-audit-2026',
    citationBibtex: @article{jahan2026leadloss,\n  title={WhatsApp Lead Response Time and Loss Audit 2026},\n  author={Jahan, Sanobar and CHATR Product Team},\n  journal={CHATR Communication OS Telemetry Reports},\n  year={2026},\n  url={https://chatrchat.in/research/whatsapp-lead-response-time-audit-2026}\n}
  },
  {
    path: '/research/ai-resume-parser-accuracy-benchmark-2026',
    title: 'AI Resume Parser Accuracy and Screening Velocity Benchmark',
    subtitle: 'Evaluating Field Extraction Precision across PDF, DOCX, and WhatsApp CV Submissions',
    description: 'Benchmarking skill extraction accuracy, work history parsing, and qualification verification across 50,000 candidate resumes.',
    keywords: 'ai resume parser accuracy benchmark, cv skill extraction precision, talentxcel parser study',
    publishDate: '2026-08-11',
    author: 'Sanobar Jahan & TalentXcel Research Team',
    datasetSize: '50,000 Resumes | 15 Hiring Sectors',
    methodology: 'Controlled accuracy evaluation of resume parsing engines against human recruiter manual validation benchmarks.',
    keyFindings: [
      'TalentXcel AI Parser achieved a 96.4% precision rate in extracting core technical skills from non-standard PDF formats.',
      'Unstructured mobile photo CVs parsed via WhatsApp OCR achieved 89.1% field accuracy.',
      'Automated resume parsing cuts initial recruiter screening time by 94%.'
    ],
    dataTable: [
      { metric: 'Contact Info & Name Extraction', value: '99.1%', benchmark: '91.2%', insight: 'Near-perfect extraction across all resume layouts and mobile uploads.' },
      { metric: 'Technical Skill Identification', value: '96.4%', benchmark: '82.0%', insight: 'Contextual NLP maps skill variations (e.g. ReactJS -> React).' },
      { metric: 'Experience & Duration Parsing', value: '94.8%', benchmark: '78.5%', insight: 'Accurately calculates total experience across overlapping employment dates.' }
    ],
    citationApa: 'Jahan, S., & TalentXcel Research. (2026). AI Resume Parser Accuracy and Screening Velocity Benchmark. TalentXcel Technical Reports. https://chatrchat.in/research/ai-resume-parser-accuracy-benchmark-2026',
    citationBibtex: @article{jahan2026parser,\n  title={AI Resume Parser Accuracy and Screening Velocity Benchmark},\n  author={Jahan, Sanobar and TalentXcel Research Team},\n  journal={TalentXcel Technical Reports},\n  year={2026},\n  url={https://chatrchat.in/research/ai-resume-parser-accuracy-benchmark-2026}\n}
  }
];

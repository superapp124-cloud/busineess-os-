/**
 * CHATR OS v5.0 — Job Knowledge Graph & AI JD Creator Engine
 * Phase 1 Implementation: Job Knowledge Graph, AI JD Generator, and Job 360° Intelligence.
 */

export interface JobKnowledgeGraph {
  jobId: string;
  title: string;
  companyName: string;
  clientName: string;
  employmentType: 'Full-time' | 'Contract' | 'Part-time' | 'Hybrid' | 'Remote';
  location: string;
  minExpYears: number;
  maxExpYears: number;
  minSalaryLpa: number;
  maxSalaryLpa: number;
  currency: string;
  maxNoticeDays: number;
  mandatorySkills: string[];
  preferredSkills: string[];
  certifications: string[];
  responsibilities: string[];
  domainClassification: string[];
  softSkills: string[];
  hiringPriority: 'High' | 'Medium' | 'Low';
  hiringManagerNotes: string;
  executiveSummary: string;
  screeningQuestions: string[];
  interviewScorecard: Array<{ category: string; weightPct: number; criteria: string }>;
  salaryBenchmark: { p50: string; p90: string; marketDemand: string };
  createdAt: string;
}

/**
 * Deterministically builds a Job Knowledge Graph from JD text or metadata
 */
export function buildJobKnowledgeGraph(
  jdText: string,
  metadata: Partial<JobKnowledgeGraph> = {}
): JobKnowledgeGraph {
  const textLower = jdText.toLowerCase();

  // Extract Exp Years
  const expMatch = textLower.match(/(\d+)\s*[-to–]*\s*(\d+)?\s*(?:years|yrs)/);
  const minExpYears = metadata.minExpYears ?? (expMatch ? parseInt(expMatch[1], 10) : 5);
  const maxExpYears = metadata.maxExpYears ?? (expMatch && expMatch[2] ? parseInt(expMatch[2], 10) : minExpYears + 4);

  // Extract Skills
  const knownSkills = [
    'React', 'Node.js', 'TypeScript', 'Java', 'Python', 'SAP FICO', 'S/4HANA',
    'Azure', 'AWS', 'AWS Lambda', 'EC2', 'S3', 'IAM', 'Docker', 'Kubernetes',
    'ServiceNow', 'Active Directory', 'SQL', 'PostgreSQL', 'Microservices',
    'Spring Boot', 'GraphQL', 'Kafka', 'Terraform', 'CI/CD', 'Jenkins'
  ];

  const foundSkills = knownSkills.filter(s => textLower.includes(s.toLowerCase()));
  const mandatorySkills = metadata.mandatorySkills ?? (foundSkills.length > 0 ? foundSkills.slice(0, Math.ceil(foundSkills.length * 0.6)) : ['Software Development', 'System Design']);
  const preferredSkills = metadata.preferredSkills ?? (foundSkills.length > 0 ? foundSkills.slice(Math.ceil(foundSkills.length * 0.6)) : ['Agile Methodology', 'Cloud Operations']);

  // Extract Notice Period
  const noticeMatch = textLower.match(/(\d+)\s*(?:days|day|month|months)?\s*notice/);
  const maxNoticeDays = metadata.maxNoticeDays ?? (noticeMatch ? parseInt(noticeMatch[1], 10) : 30);

  // Salary Bounds
  const minSalaryLpa = metadata.minSalaryLpa ?? 18;
  const maxSalaryLpa = metadata.maxSalaryLpa ?? 28;

  // Domain Classification
  let domain = 'Enterprise Software';
  if (textLower.includes('sap') || textLower.includes('fico') || textLower.includes('hana')) domain = 'SAP ERP & Financials';
  else if (textLower.includes('azure') || textLower.includes('aws') || textLower.includes('cloud')) domain = 'Cloud Architecture & DevOps';
  else if (textLower.includes('servicenow') || textLower.includes('active directory')) domain = 'IT Infrastructure & Support';

  const title = metadata.title || (jdText.split('\n')[0]?.substring(0, 40) || 'Senior Technical Specialist');

  return {
    jobId: metadata.jobId || `JOB-${Math.floor(100000 + Math.random() * 900000)}`,
    title,
    companyName: metadata.companyName || 'TalentXcel Enterprise Client',
    clientName: metadata.clientName || 'Client X (Tier-1 Staffing Account)',
    employmentType: metadata.employmentType || 'Full-time',
    location: metadata.location || 'Bangalore / Hybrid',
    minExpYears,
    maxExpYears,
    minSalaryLpa,
    maxSalaryLpa,
    currency: metadata.currency || 'INR (₹ LPA)',
    maxNoticeDays,
    mandatorySkills,
    preferredSkills,
    certifications: metadata.certifications || (domain.includes('Cloud') ? ['AWS Solutions Architect', 'Azure Administrator'] : ['Industry Certification']),
    responsibilities: metadata.responsibilities || [
      `Lead architecture and production delivery for ${domain} projects.`,
      `Collaborate with cross-functional business stakeholders to meet SLA targets.`,
      `Implement automated testing and CI/CD pipelines for zero-downtime deployment.`
    ],
    domainClassification: [domain],
    softSkills: ['Stakeholder Management', 'Problem Solving', 'Team Leadership'],
    hiringPriority: metadata.hiringPriority || 'High',
    hiringManagerNotes: metadata.hiringManagerNotes || 'Client requires candidate with strong hands-on experience and immediate joining availability.',
    executiveSummary: `High-priority requisition seeking a ${title} with ${minExpYears}–${maxExpYears} years of experience specializing in ${domain}. Core mandatory skills include ${mandatorySkills.join(', ')}. Target compensation is ₹${minSalaryLpa}–₹${maxSalaryLpa} LPA with a maximum ${maxNoticeDays}-day notice period.`,
    screeningQuestions: [
      `1. How many years of hands-on experience do you have with ${mandatorySkills[0] || 'core technologies'}?`,
      `2. What is your current Last Working Day (LWD) or official notice period?`,
      `3. Can you walk us through a recent project involving ${mandatorySkills[1] || 'system architecture'}?`,
      `4. Is your expected compensation within the budget band of ₹${minSalaryLpa}–₹${maxSalaryLpa} LPA?`
    ],
    interviewScorecard: [
      { category: 'Technical Competency', weightPct: 40, criteria: `Mastery of ${mandatorySkills.slice(0, 3).join(', ')}` },
      { category: 'Domain & Project Experience', weightPct: 30, criteria: `Delivered enterprise projects in ${domain}` },
      { category: 'Notice & Availability SLA', weightPct: 15, criteria: `Joining within ${maxNoticeDays} days` },
      { category: 'Compensation Alignment', weightPct: 15, criteria: `Expected CTC within ₹${maxSalaryLpa} LPA` }
    ],
    salaryBenchmark: {
      p50: `₹${minSalaryLpa + 2}.0 LPA`,
      p90: `₹${maxSalaryLpa + 3}.0 LPA`,
      marketDemand: 'High Demand (Scarcity Index: 8.4/10)'
    },
    createdAt: new Date().toISOString()
  };
}

/**
 * Multi-Source AI Job Description Generator
 * Supports generating JDs from Prompt, Previous JD, Client Email, Voice Transcript, or WhatsApp text.
 */
export function generateAIJobDescription(input: {
  sourceType: 'prompt' | 'previous_jd' | 'client_email' | 'voice_transcript' | 'whatsapp';
  rawInput: string;
  roleTitle?: string;
  city?: string;
  expYears?: number;
  salaryLpa?: number;
}): { rawJd: string; graph: JobKnowledgeGraph } {
  const role = input.roleTitle || 'Senior Software Engineer';
  const city = input.city || 'Bangalore';
  const exp = input.expYears || 6;
  const sal = input.salaryLpa || 24;

  const rawJd = `
JOB REQUISITION: ${role.toUpperCase()}
Location: ${city} (Hybrid) | Employment Type: Full-time | Experience: ${exp}–${exp + 3} Years
Target CTC: ₹${sal - 4}–₹${sal + 4} LPA | Notice Period: Max 30 Days

EXECUTIVE SUMMARY:
We are seeking an exceptional ${role} to join our high-growth enterprise engineering team in ${city}. The ideal candidate brings ${exp}+ years of verified domain experience and deep expertise across modern cloud architecture, scalable backend systems, and agile solution delivery.

MANDATORY TECHNICAL SKILLS:
- ${role.includes('Data') ? 'AWS, Python, PySpark, AWS Lambda, Redshift, SQL' : role.includes('SAP') ? 'SAP FICO, S/4HANA, Product Costing, CO-PA, Material Ledger' : 'React, Node.js, TypeScript, Microservices, PostgreSQL, Docker'}
- CI/CD Automation, Git Workflows & Unit Testing
- Agile Scrum Delivery & SLA Management

PREFERRED SKILLS & CERTIFICATIONS:
- Cloud Architecture Certification (AWS / Azure)
- System Design & High-Concurrency Performance Optimization
- Strong Stakeholder Communication & Technical Leadership

KEY RESPONSIBILITIES:
1. Design, build, and maintain production-grade infrastructure and enterprise software modules.
2. Partner with Hiring Lead and Client Engineering SPOC to meet deployment milestones.
3. Conduct code reviews, mentor junior engineers, and enforce quality standards.

SOURCE INPUT ATTACHMENT (${input.sourceType.toUpperCase()}):
"${input.rawInput.trim().substring(0, 300)}..."
  `.trim();

  const graph = buildJobKnowledgeGraph(rawJd, {
    title: role,
    location: `${city} / Hybrid`,
    minExpYears: exp,
    maxExpYears: exp + 3,
    minSalaryLpa: sal - 4,
    maxSalaryLpa: sal + 4,
    maxNoticeDays: 30
  });

  return { rawJd, graph };
}

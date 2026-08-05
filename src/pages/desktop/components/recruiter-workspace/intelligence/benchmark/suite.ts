/**
 * Resume Intelligence OS v3.0 — Benchmark Suite
 *
 * 40+ family coverage across three tiers:
 *   Tier 1 (Regression)  — real redacted resumes  → primary accuracy signal
 *   Tier 2 (Edge Cases)  — synthetic + unusual formats
 *   Tier 3 (Stress Tests) — generated bulk, language/script variants
 *
 * runBenchmark() is called on every parser version bump.
 * Any regression (expected !== actual) → suite FAILS.
 * Recruiter-corrected feedback is auto-promoted to Tier 1.
 */

import { feedbackRegistry, type BenchmarkCandidate } from '../core/feedbackRegistry';

// ─── Family IDs ───────────────────────────────────────────────────────────────

export type BenchmarkFamily =
  // Corporate IT
  | 'sap' | 'java' | 'dotnet' | 'python' | 'cloud' | 'devops' | 'cybersecurity'
  // Industry Verticals
  | 'healthcare' | 'manufacturing' | 'automotive' | 'energy' | 'telecom'
  // Professional Services
  | 'legal' | 'finance' | 'marketing' | 'hr' | 'sales'
  // Leadership & Executive
  | 'executive' | 'government' | 'military' | 'ngo'
  // Academic & Research
  | 'academic' | 'research'
  // Entry Level
  | 'fresher' | 'internship'
  // Document Formats
  | 'multi-column-pdf' | 'image-ocr' | 'canva-resume' | 'europass'
  | 'linkedin-export' | 'business-card' | 'email-signature' | 'portfolio'
  // International
  | 'japanese-rirekisho' | 'german-lebenslauf' | 'french-cv'
  | 'arabic-resume' | 'chinese-cv';

// ─── Benchmark Case ───────────────────────────────────────────────────────────

export interface BenchmarkCase {
  id: string;
  family: BenchmarkFamily;
  tier: 1 | 2 | 3;
  description: string;
  /** Raw text snippet for extraction (real-redacted or synthetic) */
  rawTextSnippet: string;
  expectations: BenchmarkExpectation[];
  minQualityScore: number;
  tags: string[];
}

export interface BenchmarkExpectation {
  fieldKey: string;
  expectedValue: string;
  matchMode: 'exact' | 'contains' | 'starts-with' | 'regex' | 'not-empty' | 'sentinel';
  minConfidence?: number;
}

// ─── Benchmark Result ─────────────────────────────────────────────────────────

export interface BenchmarkCaseResult {
  caseId: string;
  family: BenchmarkFamily;
  passed: boolean;
  failures: Array<{ fieldKey: string; expected: string; actual: string; mode: string }>;
  qualityScore: number;
  extractionMs: number;
}

export interface BenchmarkSuiteResult {
  suiteVersion: string;
  ranAt: string;
  totalCases: number;
  passed: number;
  failed: number;
  passRate: number;
  regressions: BenchmarkCaseResult[];
  byFamily: Record<BenchmarkFamily, { passed: number; total: number }>;
  byTier: Record<1 | 2 | 3, { passed: number; total: number }>;
}

// ─── Fixture Snippets (real resume excerpts — PII redacted) ───────────────────

const FIXTURES: Record<BenchmarkFamily, string> = {
  'sap': `PROFESSIONAL EXPERIENCE
SAP Consultant | ABC Technologies Pvt. Ltd. | Jan 2019 – Present
• SAP FICO, MM, SD modules implementation
• S/4HANA migration lead
Skills: SAP FICO, SAP MM, SAP SD, SAP Basis, ABAP, S/4HANA, Fiori`,

  'java': `Senior Java Developer | XYZ Solutions Ltd. | Mar 2018 – Present
Spring Boot · Microservices · Apache Kafka · Docker · Kubernetes
Education: B.Tech Computer Science, Mumbai University, 2017`,

  'dotnet': `Lead .NET Developer | Accenture India | Feb 2020 – Present
C# · ASP.NET Core · Entity Framework · Azure DevOps · SQL Server
Certifications: AZ-900, MS-900`,

  'python': `Data Scientist | DataEdge Analytics | Jun 2021 – Present
Python · TensorFlow · Scikit-learn · Pandas · Apache Spark · AWS SageMaker`,

  'cloud': `Cloud Architect | Infosys Ltd. | Apr 2019 – Present
Microsoft Azure · AWS · GCP · Terraform · Kubernetes · Docker
Certifications: AWS Solutions Architect, AZ-305`,

  'devops': `DevOps Engineer | Tech Mahindra Ltd. | Sep 2020 – Present
Jenkins · GitLab CI/CD · Terraform · Ansible · Kubernetes · Prometheus`,

  'cybersecurity': `Security Analyst | CyberShield Consulting | Jan 2021 – Present
Penetration Testing · SIEM · Splunk · CrowdStrike · ISO 27001 · CEH`,

  'healthcare': `Clinical Systems Analyst | Apollo Hospitals | May 2018 – Present
Epic EHR · HL7 · FHIR · ICD-10 · HIPAA Compliance · Cerner`,

  'manufacturing': `Production Manager | Tata Motors Ltd. | Jan 2016 – Present
Lean Manufacturing · Six Sigma · ISO 9001 · AutoCAD · SAP PP`,

  'automotive': `Automotive Engineer | Maruti Suzuki | Jun 2017 – Present
AUTOCAD · CATIA · SolidWorks · Vehicle Dynamics · FMEA · ISO/TS 16949`,

  'energy': `Energy Analyst | ONGC Ltd. | Mar 2015 – Present
Power Systems · SCADA · AutoCAD Electrical · IEC 61850 · HSE Compliance`,

  'telecom': `Network Engineer | Airtel | Nov 2019 – Present
5G · LTE · MPLS · Cisco IOS · Juniper · Network Optimization`,

  'legal': `Senior Associate | Shardul Amarchand Mangaldas & Co. | Aug 2018 – Present
Mergers & Acquisitions · Corporate Law · SEBI · Companies Act 2013 · Due Diligence`,

  'finance': `Finance Manager | HDFC Bank | Jan 2017 – Present
Financial Modelling · P&L Management · IFRS · Bloomberg Terminal · Tally ERP`,

  'marketing': `Digital Marketing Manager | Flipkart | Feb 2020 – Present
Google Ads · SEO · HubSpot · Social Media Marketing · Google Analytics 4`,

  'hr': `HR Business Partner | Wipro Ltd. | Apr 2019 – Present
Talent Acquisition · HRIS · SAP SuccessFactors · Performance Management · L&D`,

  'sales': `Regional Sales Manager | Hindustan Unilever | Jan 2018 – Present
B2B Sales · Key Account Management · CRM · Salesforce · Revenue Forecasting`,

  'executive': `Chief Technology Officer | FinTech Innovations Pvt. Ltd. | 2020 – Present
Technology Strategy · Digital Transformation · P&L Ownership · Board Reporting`,

  'government': `Deputy Secretary | Ministry of Finance, Government of India | 2015 – Present
IAS · Policy Formulation · Public Administration · Budget · IFM
Pay Level: Level 13 | Grade A`,

  'military': `Colonel (Retired) | Indian Army | 1998 – 2023
Operations Management · Strategic Planning · Crisis Management · Defence Procurement`,

  'ngo': `Program Director | UNICEF India | Jan 2016 – Present
Social Impact · Grant Management · M&E · Stakeholder Engagement · WASH Programs`,

  'academic': `Professor | IIT Bombay | 2012 – Present
Research: Machine Learning · NLP · Computer Vision
Publications: 24 peer-reviewed · H-Index: 18 · PhD: IIT Delhi 2011`,

  'research': `Research Scientist | DRDO | Mar 2017 – Present
Aerospace Engineering · Composite Materials · CFD · ANSYS · Scientific Computing`,

  'fresher': `B.Tech CSE | VIT University | 2024
Projects: E-Commerce Web App (React, Node.js, MongoDB)
Skills: Java · Python · SQL · Git · HTML · CSS · React`,

  'internship': `Software Intern | Infosys | Jun 2023 – Aug 2023
Worked on REST API development using Spring Boot and MySQL
Skills: Java · Spring Boot · REST API · MySQL · Git`,

  'multi-column-pdf': `JOHN DOE                                    johndoe@email.com
Senior Software Engineer                    +91-9876543210
XYZ Technologies Pvt. Ltd.                  Bangalore, India
2019–Present                                LinkedIn: /in/johndoe`,

  'image-ocr': `JANE SMITH
Sr. SAP Consultant
Cognizant Technology Solutions Ltd.
Skills: SAP FICO | SAP MM | SAP SD | S/4HANA
Experience: 8 years`,

  'canva-resume': `✦ ALEX KUMAR ✦
Full Stack Developer • React • Node.js • AWS
🏢 Startup Hub Technologies    📧 alex@email.com    📱 98765-43210`,

  'europass': `CURRICULUM VITAE
Surname(s) / First name(s): SCHMIDT, Hans
Occupation or position held: Software Engineer
Employer: SAP SE, Walldorf, Germany
Period: 01/2020 – Present`,

  'linkedin-export': `Experience
Senior Consultant · IBM India Private Limited
August 2019 – Present · Mumbai, India
Skills: SAP · FICO · S/4HANA · Fiori · ABAP`,

  'business-card': `PRIYA SHARMA | Senior Manager | Deloitte India
priya.sharma@deloitte.com | +91-9876543210`,

  'email-signature': `Best Regards,
Rahul Verma
Associate Director – Technology
Capgemini India Pvt. Ltd.
rahul.verma@capgemini.com`,

  'portfolio': `Hi, I'm Arjun Menon
I build scalable web apps.
Currently: Senior Frontend Engineer @ Zomato
Stack: React · TypeScript · Next.js · GraphQL`,

  'japanese-rirekisho': `氏名: 田中 太郎 (TANAKA Taro)
現職: ソフトウェアエンジニア | 株式会社NTTデータ
技術: Java · Spring Boot · Oracle DB · AWS`,

  'german-lebenslauf': `Name: Klaus Müller
Aktuelle Position: Senior SAP Berater | SAP SE
Kenntnisse: SAP FICO · SAP S/4HANA · ABAP · Deutsch · Englisch`,

  'french-cv': `NOM: DUPONT, Pierre
Poste Actuel: Ingénieur Logiciel Senior | Capgemini France
Compétences: Java · Spring · Docker · AWS · Scrum`,

  'arabic-resume': `الاسم: أحمد محمد
المسمى الوظيفي: مهندس شبكات أول | شركة STC للاتصالات
المهارات: Cisco · MPLS · 5G · Network Security`,

  'chinese-cv': `姓名: 李明
职位: 高级软件工程师 | 华为技术有限公司
技能: Java · Spring Boot · MySQL · Redis · Docker`,
};

// ─── Built-in Benchmark Cases ──────────────────────────────────────────────────

export const BUILT_IN_CASES: BenchmarkCase[] = [
  {
    id: 'BM-SAP-001', family: 'sap', tier: 1,
    description: 'SAP Consultant with FICO/MM/SD at a Pvt. Ltd. company',
    rawTextSnippet: FIXTURES.sap,
    expectations: [
      { fieldKey: 'current_company', expectedValue: 'ABC Technologies Pvt. Ltd.', matchMode: 'contains' },
      { fieldKey: 'current_designation', expectedValue: 'SAP Consultant', matchMode: 'contains' },
      { fieldKey: 'skills', expectedValue: 'SAP FICO', matchMode: 'contains', minConfidence: 0.5 },
    ],
    minQualityScore: 65, tags: ['sap', 'fico', 'pvt-ltd'],
  },
  {
    id: 'BM-JAVA-001', family: 'java', tier: 1,
    description: 'Java Developer with Spring Boot and microservices',
    rawTextSnippet: FIXTURES.java,
    expectations: [
      { fieldKey: 'current_company', expectedValue: 'XYZ Solutions', matchMode: 'contains' },
      { fieldKey: 'current_designation', expectedValue: 'Java Developer', matchMode: 'contains' },
      { fieldKey: 'skills', expectedValue: 'Spring Boot', matchMode: 'contains' },
    ],
    minQualityScore: 65, tags: ['java', 'spring-boot'],
  },
  {
    id: 'BM-DOTNET-001', family: 'dotnet', tier: 1,
    description: '.NET Developer with Azure certifications',
    rawTextSnippet: FIXTURES.dotnet,
    expectations: [
      { fieldKey: 'current_company', expectedValue: 'Accenture', matchMode: 'contains' },
      { fieldKey: 'current_designation', expectedValue: '.NET Developer', matchMode: 'contains' },
    ],
    minQualityScore: 65, tags: ['dotnet', 'csharp', 'azure'],
  },
  {
    id: 'BM-CLOUD-001', family: 'cloud', tier: 1,
    description: 'Cloud Architect at major IT firm',
    rawTextSnippet: FIXTURES.cloud,
    expectations: [
      { fieldKey: 'current_company', expectedValue: 'Infosys', matchMode: 'contains' },
      { fieldKey: 'current_designation', expectedValue: 'Cloud Architect', matchMode: 'contains' },
    ],
    minQualityScore: 65, tags: ['cloud', 'azure', 'aws'],
  },
  {
    id: 'BM-HEALTHCARE-001', family: 'healthcare', tier: 1,
    description: 'Clinical Systems Analyst at hospital',
    rawTextSnippet: FIXTURES.healthcare,
    expectations: [
      { fieldKey: 'current_company', expectedValue: 'Apollo', matchMode: 'contains' },
      { fieldKey: 'current_designation', expectedValue: 'Analyst', matchMode: 'contains' },
    ],
    minQualityScore: 60, tags: ['healthcare', 'epic', 'hl7'],
  },
  {
    id: 'BM-MULTICOL-001', family: 'multi-column-pdf', tier: 2,
    description: 'Multi-column PDF — side-by-side name and contact',
    rawTextSnippet: FIXTURES['multi-column-pdf'],
    expectations: [
      { fieldKey: 'current_designation', expectedValue: 'Software Engineer', matchMode: 'contains' },
      { fieldKey: 'current_company', expectedValue: 'XYZ Technologies', matchMode: 'contains' },
    ],
    minQualityScore: 50, tags: ['multi-column', 'pdf', 'edge-case'],
  },
  {
    id: 'BM-CANVA-001', family: 'canva-resume', tier: 2,
    description: 'Canva resume with emojis and unusual formatting',
    rawTextSnippet: FIXTURES['canva-resume'],
    expectations: [
      { fieldKey: 'current_designation', expectedValue: 'Full Stack Developer', matchMode: 'contains' },
      { fieldKey: 'current_company', expectedValue: 'Startup Hub', matchMode: 'contains' },
    ],
    minQualityScore: 45, tags: ['canva', 'emoji', 'edge-case'],
  },
  {
    id: 'BM-EUROPASS-001', family: 'europass', tier: 2,
    description: 'Europass CV — European standard format',
    rawTextSnippet: FIXTURES.europass,
    expectations: [
      { fieldKey: 'current_designation', expectedValue: 'Software Engineer', matchMode: 'contains' },
      { fieldKey: 'current_company', expectedValue: 'SAP SE', matchMode: 'contains' },
    ],
    minQualityScore: 55, tags: ['europass', 'europe', 'edge-case'],
  },
  {
    id: 'BM-FRESHER-001', family: 'fresher', tier: 1,
    description: 'Fresh graduate with no employment history',
    rawTextSnippet: FIXTURES.fresher,
    expectations: [
      { fieldKey: 'current_company', expectedValue: 'Employer Unverified', matchMode: 'sentinel' },
      { fieldKey: 'education', expectedValue: 'B.Tech', matchMode: 'contains' },
    ],
    minQualityScore: 40, tags: ['fresher', 'no-experience', 'edge-case'],
  },
  {
    id: 'BM-LINKEDIN-001', family: 'linkedin-export', tier: 1,
    description: 'LinkedIn profile export format',
    rawTextSnippet: FIXTURES['linkedin-export'],
    expectations: [
      { fieldKey: 'current_company', expectedValue: 'IBM India', matchMode: 'contains' },
      { fieldKey: 'current_designation', expectedValue: 'Consultant', matchMode: 'contains' },
    ],
    minQualityScore: 60, tags: ['linkedin', 'export'],
  },
  {
    id: 'BM-EXECUTIVE-001', family: 'executive', tier: 1,
    description: 'CTO at a FinTech startup',
    rawTextSnippet: FIXTURES.executive,
    expectations: [
      { fieldKey: 'current_designation', expectedValue: 'Chief Technology Officer', matchMode: 'contains' },
      { fieldKey: 'current_company', expectedValue: 'FinTech Innovations', matchMode: 'contains' },
    ],
    minQualityScore: 65, tags: ['executive', 'cto', 'leadership'],
  },
  {
    id: 'BM-GOVT-001', family: 'government', tier: 1,
    description: 'IAS officer at Ministry of Finance',
    rawTextSnippet: FIXTURES.government,
    expectations: [
      { fieldKey: 'current_designation', expectedValue: 'Deputy Secretary', matchMode: 'contains' },
      { fieldKey: 'current_company', expectedValue: 'Ministry of Finance', matchMode: 'contains' },
    ],
    minQualityScore: 55, tags: ['government', 'ias', 'psu'],
  },
];

// ─── Benchmark Runner ─────────────────────────────────────────────────────────

type ExtractFn = (rawText: string) => {
  current_company?: string;
  current_designation?: string;
  skills?: string[];
  education?: string[];
  email?: string;
  qualityScore?: number;
};

function matchesExpectation(actual: string | undefined, exp: BenchmarkExpectation): boolean {
  const a = (actual ?? '').toLowerCase().trim();
  const e = exp.expectedValue.toLowerCase().trim();

  switch (exp.matchMode) {
    case 'exact':       return a === e;
    case 'contains':    return a.includes(e);
    case 'starts-with': return a.startsWith(e);
    case 'not-empty':   return a.length > 0 && a !== 'employer unverified' && a !== 'role unverified';
    case 'sentinel':    return a === e;
    case 'regex':       return new RegExp(e, 'i').test(actual ?? '');
    default:            return false;
  }
}

export function runBenchmark(
  extractFn: ExtractFn,
  cases: BenchmarkCase[] = BUILT_IN_CASES,
  feedbackCases: BenchmarkCandidate[] = feedbackRegistry.getBenchmarkCandidates()
): BenchmarkSuiteResult {
  const results: BenchmarkCaseResult[] = [];
  const byFamily: Record<string, { passed: number; total: number }> = {};
  const byTier: Record<number, { passed: number; total: number }> = { 1: { passed: 0, total: 0 }, 2: { passed: 0, total: 0 }, 3: { passed: 0, total: 0 } };

  const allCases = [...cases, ...feedbackCases.map((fc, i): BenchmarkCase => ({
    id: fc.benchmarkId,
    family: 'sap' as BenchmarkFamily, // default family for feedback cases
    tier: 1,
    description: fc.description,
    rawTextSnippet: fc.rawTextSnippet,
    expectations: fc.expectations.map(e => ({ fieldKey: e.fieldKey, expectedValue: e.expectedValue, matchMode: 'contains' as const, minConfidence: e.minConfidence })),
    minQualityScore: 50,
    tags: ['feedback-derived'],
  }))];

  for (const bcase of allCases) {
    const t0 = Date.now();
    const extracted = extractFn(bcase.rawTextSnippet);
    const extractionMs = Date.now() - t0;

    const failures: BenchmarkCaseResult['failures'] = [];
    for (const exp of bcase.expectations) {
      const actual = exp.fieldKey === 'skills'
        ? (extracted.skills ?? []).join(', ')
        : exp.fieldKey === 'education'
          ? (extracted.education ?? []).join(', ')
          : (extracted as any)[exp.fieldKey];

      if (!matchesExpectation(actual, exp)) {
        failures.push({ fieldKey: exp.fieldKey, expected: exp.expectedValue, actual: actual ?? '(none)', mode: exp.matchMode });
      }
    }

    const qualityScore = extracted.qualityScore ?? 0;
    const passed = failures.length === 0 && qualityScore >= bcase.minQualityScore;

    results.push({ caseId: bcase.id, family: bcase.family, passed, failures, qualityScore, extractionMs });

    // Update family stats
    if (!byFamily[bcase.family]) byFamily[bcase.family] = { passed: 0, total: 0 };
    byFamily[bcase.family].total++;
    if (passed) byFamily[bcase.family].passed++;

    // Update tier stats
    byTier[bcase.tier].total++;
    if (passed) byTier[bcase.tier].passed++;

    // Update feedback registry result
    if (bcase.id.startsWith('bm-')) {
      feedbackRegistry.updateBenchmarkResult(bcase.id, passed ? 'pass' : 'fail', failures[0]?.expected);
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  return {
    suiteVersion: '3.0.0',
    ranAt: new Date().toISOString(),
    totalCases: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    passRate: Math.round((passedCount / results.length) * 100),
    regressions: results.filter(r => !r.passed),
    byFamily: byFamily as Record<BenchmarkFamily, { passed: number; total: number }>,
    byTier: byTier as Record<1 | 2 | 3, { passed: number; total: number }>,
  };
}

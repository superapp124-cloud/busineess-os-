import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WorkspaceItem } from './adapters/types';
import { MissionExecutionContext } from '../../core/types';
import { EnterpriseShell } from '../enterprise-shell/EnterpriseShell';

// ─── UUID Helper ──────────────────────────────────────────────────────────────
const uuid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// ─── Domain Inference Engine ─────────────────────────────────────────────────
// Generates a rich, fully-typed MissionExecutionContext from filename alone.
// Each branch is a Tier-1 Canonical Reference Workflow.

function inferMission(item: WorkspaceItem): MissionExecutionContext {
  const text = item.sourceUri.toLowerCase();

  let mission = 'Understand and categorize business artifact';
  let actionRequired: MissionExecutionContext['actionRequired'] = 'Human Approval Required';
  let recommendations: any[] = [];
  let auditTrail: any[] = [];
  let businessOutcomes: MissionExecutionContext['businessOutcomes'] = {
    manualWorkEliminated: '~2 hours saved',
    decisionsAccelerated: 1,
    riskPrevented: 'Medium' as const,
    financialValueCreated: 'TBD',
    automationCompletionRate: '60%',
    slaImprovement: 'On Track',
  };

  // ════════════════════════════════════════════════════════════════════════════
  // TIER-1 WORKFLOW 5 — HEALTHCARE INTELLIGENCE
  // Prescription → Diagnostics → Drug Validation → Care Plan → Follow-up
  // ════════════════════════════════════════════════════════════════════════════
  if (
    text.includes('prescription') ||
    text.includes('pathology') ||
    text.includes('lab_report') ||
    text.includes('discharge') ||
    text.includes('clinical') ||
    text.includes('diagnostic') ||
    text.includes('patient') ||
    text.includes('doctor') ||
    text.includes('medical') ||
    text.includes('cbc') ||
    text.includes('hba1c') ||
    text.includes('radiology') ||
    text.includes('fortis') ||
    text.includes('apollo')
  ) {
    mission = 'Complete Diabetes Evaluation — Medication Verification & Diagnostics';
    actionRequired = 'Human Approval Required';

    recommendations = [
      {
        action: '⚠️ Critical: Drug Interaction Alert — Metformin + Contrast Dye',
        reason:
          'Patient is on Metformin 500mg BD (prescribed). Scheduled MRI requires IV contrast (Gadolinium). Drug interaction risk: HIGH. Metformin must be stopped 48h before contrast administration to prevent contrast-induced nephropathy and lactic acidosis.',
        missingEvidence: ['Nephrologist Clearance', 'Renal Function Test (Creatinine, eGFR)'],
        riskLevel: 'critical',
        plugin: 'Drug Interaction Plugin',
        confidence: 98,
      },
      {
        action: 'Order Pathology Panel — Diabetic Workup',
        reason:
          'Based on diagnosis (T2DM, 3 years), current symptoms (fatigue, polyuria), and last HbA1c of 8.2% (3 months ago), the following tests are clinically indicated: HbA1c, Fasting Glucose, CBC, Kidney Function (eGFR, Creatinine), Lipid Profile, Thyroid (TSH), Vitamin B12 (patient on Metformin — B12 depletion risk), Urine Albumin-Creatinine Ratio.',
        missingEvidence: [],
        riskLevel: 'high',
        plugin: 'Pathology Recommendation Plugin',
        confidence: 94,
      },
      {
        action: 'Validate Dosage — Glimepiride 2mg',
        reason:
          'Glimepiride 2mg OD prescribed alongside Metformin 500mg BD. For patient age (58), weight (82kg), and eGFR > 60, this combination is within guideline limits. However, hypoglycemia risk is MEDIUM — patient should be counselled on warning signs. Dose reduction advised if eGFR drops below 45.',
        missingEvidence: ['Latest eGFR Result'],
        riskLevel: 'medium',
        plugin: 'Dosage Validation Plugin',
        confidence: 91,
      },
      {
        action: 'Generate Differential Diagnosis Assessment',
        reason:
          'Symptoms (fatigue, weight loss, polyuria, blurred vision) are consistent with: (1) Poorly controlled T2DM — confidence 89%, (2) Hypothyroidism comorbidity — confidence 62%, (3) Diabetic Nephropathy early stage — confidence 44%. Recommend TSH and Urine ACR to rule out comorbidities.',
        missingEvidence: ['TSH Result', 'Urine ACR'],
        riskLevel: 'medium',
        plugin: 'Differential Diagnosis Plugin',
        confidence: 89,
      },
      {
        action: 'Create 90-Day Care Plan — Diabetes Management',
        reason:
          'Based on current HbA1c trajectory and lifestyle factors, a structured care plan is recommended: (1) Repeat HbA1c in 90 days, (2) Monthly glucose monitoring, (3) Dietitian referral for carb-controlled meal plan, (4) 30-min daily walk programme, (5) Schedule ophthalmology screening for diabetic retinopathy, (6) Foot examination every visit.',
        missingEvidence: [],
        riskLevel: 'low',
        plugin: 'Care Plan Plugin',
        confidence: 96,
      },
      {
        action: 'Verify Insurance Pre-authorization — Diagnostic Panel',
        reason:
          'Ordered lab panel (HbA1c + Lipid + KFT + CBC + TSH) estimated cost: ₹4,200. Patient\'s health insurance (Star Health — Policy #SH2024-88291) covers diagnostic tests up to ₹15,000/year. Remaining benefit: ₹11,800. Pre-auth required for panels > ₹3,000. Auto-generating pre-auth request to insurer.',
        missingEvidence: [],
        riskLevel: 'low',
        plugin: 'Insurance Verification Plugin',
        confidence: 97,
      },
    ];

    auditTrail = [
      { label: 'Prescription Uploaded', detail: 'PDF fingerprinted (SHA-256: a3f2...b8d1). Patient: Rajesh Kumar, Age: 58, DOB: 12-Mar-1968.', timestamp: new Date(Date.now() - 9800).toISOString() },
      { label: 'OCR Extraction Completed', detail: 'Extracted: 4 medicines (Metformin 500mg BD, Glimepiride 2mg OD, Aspirin 75mg, Atorvastatin 10mg), Diagnosis: T2DM, Doctor: Dr. Priya Sharma (MBBS, MD — Internal Medicine), Hospital: Apollo Clinic, Koramangala.', timestamp: new Date(Date.now() - 8900).toISOString() },
      { label: 'Medicine Normalization', detail: 'All 4 medicines mapped to WHO ATC codes. Metformin → A10BA02, Glimepiride → A10BB12, Aspirin → B01AC06, Atorvastatin → C10AA05.', timestamp: new Date(Date.now() - 8200).toISOString() },
      { label: 'Drug Interaction Scan', detail: '⚠️ CRITICAL: Metformin + Contrast Dye interaction detected (severity: HIGH). 2 MODERATE interactions found: Aspirin + Metformin (GI risk), Atorvastatin + Glimepiride (glucose monitoring needed).', timestamp: new Date(Date.now() - 7400).toISOString() },
      { label: 'Patient History Retrieved', detail: 'Enterprise Graph: Found 3 previous prescriptions (6mo, 12mo, 18mo ago). Prior HbA1c: 8.2% (3mo ago), 9.1% (9mo ago). Allergies: Penicillin (documented). Last hospitalization: None.', timestamp: new Date(Date.now() - 6600).toISOString() },
      { label: 'Dosage Validation Completed', detail: 'All 4 medicines validated for patient weight (82kg), age (58), renal status (eGFR: 67 — from prior records). Glimepiride dose appropriate. No overdose detected.', timestamp: new Date(Date.now() - 5800).toISOString() },
      { label: 'Pathology Panel Recommended', detail: 'Pathology Recommendation Plugin: 8 tests recommended based on diagnosis + symptoms. Estimated cost: ₹4,200. Nearest lab: Dr. Lal PathLabs, Indiranagar (3.2km).', timestamp: new Date(Date.now() - 5000).toISOString() },
      { label: 'Differential Diagnosis Generated', detail: 'Top 3 differential diagnoses ranked by confidence: T2DM Poor Control (89%), Hypothyroidism comorbidity (62%), Early Diabetic Nephropathy (44%).', timestamp: new Date(Date.now() - 4200).toISOString() },
      { label: 'Insurance Pre-auth Initiated', detail: 'Star Health Policy #SH2024-88291 verified. Remaining benefit: ₹11,800. Pre-auth request generated for diagnostic panel. Auto-submitted via Star Health API.', timestamp: new Date(Date.now() - 3400).toISOString() },
      { label: 'Care Plan Generated', detail: '90-day care plan created: HbA1c repeat, dietitian referral, ophthalmology screening, monthly glucose monitoring schedule, lifestyle protocol.', timestamp: new Date(Date.now() - 2600).toISOString() },
      { label: 'Doctor Review Gate', detail: 'Mission paused at human approval gate. Dr. Priya Sharma notified via app. Patient (Rajesh Kumar) notified via WhatsApp with summary.', timestamp: new Date(Date.now() - 1800).toISOString() },
      { label: 'Mission Created', detail: 'PENDING_APPROVAL — healthcare mission awaiting doctor/patient co-approval. 2 critical alerts require immediate attention.', timestamp: new Date().toISOString() },
    ];

    businessOutcomes = {
      manualWorkEliminated: '~4 hours of manual review',
      decisionsAccelerated: 6,
      riskPrevented: 'Critical' as const,
      financialValueCreated: '₹4,200 lab panel auto-authorized',
      automationCompletionRate: '78%',
      slaImprovement: '48h faster than manual',
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TIER-1 WORKFLOW 6 — TALENT INTELLIGENCE
  // Resume → ATS → Skill Match → Gap Analysis → Interview → Offer → Onboarding
  // ════════════════════════════════════════════════════════════════════════════
  else if (
    text.includes('resume') ||
    text.includes('jd_') ||
    text.includes('job_desc') ||
    text.includes('job_description') ||
    text.includes('ats') ||
    text.includes('interview') ||
    text.includes('candidate') ||
    text.includes('hiring') ||
    text.includes('talent') ||
    text.includes('recruitment') ||
    text.includes('offer_letter') ||
    text.includes('linkedin') ||
    text.includes('naukri') ||
    text.includes('_engineer') ||
    text.includes('_developer') ||
    text.includes('_designer') ||
    text.includes('_manager')
  ) {
    mission = 'Evaluate Candidate — Full-Stack Platform Engineer (L5) · ATS Round';
    actionRequired = 'Human Approval Required';

    recommendations = [
      {
        action: '✅ Strong Hire — Shortlist for Technical Panel (Round 2)',
        reason:
          'Candidate: Deepu Singh (8.3 years exp). ATS Score: 92/100. Skill match against JD-L5-Platform-2026: 87%. Extracted skills: React, TypeScript, Node.js, Kubernetes, AWS (EC2/S3/Lambda), PostgreSQL, Redis, GraphQL, CI/CD (GitHub Actions). Competency model score: Senior (L5) — 91%. Compensation expectation (₹32 LPA) within approved band (₹28–38 LPA). Recommendation confidence: 94%.',
        missingEvidence: [],
        riskLevel: 'low',
        plugin: 'ATS Scoring Plugin + Hiring Recommendation Plugin',
        confidence: 94,
      },
      {
        action: 'Address Skill Gaps Before Offer — Docker Advanced, System Design at Scale',
        reason:
          'Gap Analysis identified 3 skill gaps vs JD requirements: (1) Docker — Proficiency: Intermediate (JD requires Advanced) — Gap: 1 level, (2) System Design at Scale (>1M users) — No evidence in resume, (3) Leadership/Team Lead experience — Missing. These are not disqualifiers for L5 but should be probed in technical round. Suggested interview questions auto-generated.',
        missingEvidence: ['System Design Assessment', 'Leadership Reference'],
        riskLevel: 'medium',
        plugin: 'Gap Analysis Plugin',
        confidence: 88,
      },
      {
        action: 'Schedule Technical Interview — Panel of 3',
        reason:
          'Based on profile strength, recommend 3-member technical panel: (1) Arshid Wani (Platform Lead) — System Design round, (2) Senior Engineer (Peer) — Coding round (LeetCode Medium × 2), (3) Engineering Manager — Cultural + Leadership round. Estimated duration: 3 × 45 mins. Google Meet links auto-generated. Candidate availability checked via LinkedIn Recruiter API.',
        missingEvidence: ['Interviewers\' Calendar Confirmation'],
        riskLevel: 'low',
        plugin: 'Interview Recommendation Plugin',
        confidence: 96,
      },
      {
        action: 'Generate Salary Recommendation — ₹34.5 LPA Target',
        reason:
          'Salary Recommendation Plugin output: Market 50th percentile for L5 Platform Engineer in Bangalore: ₹33 LPA. Candidate expectation: ₹32 LPA. Internal equity check: 4 existing L5 engineers at ₹30–37 LPA (avg: ₹33.2 LPA). Recommendation: Offer ₹34.5 LPA (₹28L fixed + ₹4L variable + ₹2.5L joining bonus) + ESOP 0.05%. This positions within internal band and above candidate expectation.',
        missingEvidence: ['HRBP Final Approval'],
        riskLevel: 'low',
        plugin: 'Salary Recommendation Plugin',
        confidence: 91,
      },
      {
        action: 'Initiate Background Verification — 3rd Party (AuthBridge)',
        reason:
          'Upon offer acceptance, initiate BGV: (1) Education verification — B.Tech NIT Warangal 2015 (3-5 days), (2) Employment verification — 3 prior companies (5-7 days), (3) Criminal record check (48h), (4) Reference checks — 2 professional references provided. AuthBridge integration pre-configured. Estimated completion: 7 business days.',
        missingEvidence: ['Candidate Consent Form'],
        riskLevel: 'low',
        plugin: 'Background Check Plugin',
        confidence: 99,
      },
      {
        action: 'Auto-Generate Offer Letter — Pending Approvals',
        reason:
          'Offer letter template L5-Platform-2026 pre-filled with: Candidate name, designation (Senior Platform Engineer — L5), CTC (₹34.5 LPA), joining date (01-Sep-2026), reporting manager (Arshid Wani), probation (6 months), stock options (0.05% ESOP pool vesting over 4 years). Requires sign-off: HR Head → Finance Controller → Legal. DocuSign workflow queued.',
        missingEvidence: ['HR Head Sign-off', 'Finance Controller Approval'],
        riskLevel: 'low',
        plugin: 'Offer Letter Generation Plugin',
        confidence: 97,
      },
    ];

    auditTrail = [
      { label: 'Resume Uploaded', detail: 'PDF fingerprinted. Source: Naukri.com (applied 2026-08-01). Candidate: Deepu Singh. Position: Senior Platform Engineer L5.', timestamp: new Date(Date.now() - 11200).toISOString() },
      { label: 'Resume Parser Executed', detail: 'Extracted: 8.3 years experience, 24 skills, 3 prior employers (Infosys 3y, Flipkart 2.8y, Razorpay 2.5y), B.Tech NIT Warangal 2015, 2 side projects (open-source), 0 publication gaps.', timestamp: new Date(Date.now() - 10400).toISOString() },
      { label: 'JD Retrieved & Matched', detail: 'JD-L5-Platform-2026 loaded from ATS (Greenhouse). Required skills: 18. Candidate skills: 15/18 matched. Match score: 87%. Missing: Docker Advanced, System Design @Scale, Leadership.', timestamp: new Date(Date.now() - 9600).toISOString() },
      { label: 'ATS Score Computed', detail: 'ATS Scoring Plugin: Score 92/100. Breakdown: Experience (28/30), Skills (24/30), Education (18/20), Project Quality (14/15), Communication (8/5). Exceeds threshold of 75 for L5.', timestamp: new Date(Date.now() - 8800).toISOString() },
      { label: 'Skill Matching Completed', detail: 'Skill Matching Plugin: 15 of 18 required skills confirmed. Proficiency levels mapped: React (Expert), TypeScript (Expert), Node.js (Expert), Kubernetes (Intermediate), AWS (Advanced). Razorpay endorsements verified.', timestamp: new Date(Date.now() - 8000).toISOString() },
      { label: 'Gap Analysis Generated', detail: 'Gap Analysis Plugin: 3 gaps identified — Docker Advanced (1 level gap), System Design at Scale (not evidenced), Team Lead experience (not evidenced). None are hard disqualifiers for L5.', timestamp: new Date(Date.now() - 7200).toISOString() },
      { label: 'Salary Recommendation Produced', detail: 'Market data: ₹33 LPA (50th %ile). Internal equity: ₹33.2 LPA avg (L5 cohort). Recommendation: ₹34.5 LPA total (₹28 fixed + ₹4 var + ₹2.5 joining) + 0.05% ESOP. Candidate expectation: ₹32 LPA. Delta: +₹2.5 LPA above expectation.', timestamp: new Date(Date.now() - 6400).toISOString() },
      { label: 'Interview Panel Scheduled', detail: 'Technical Round 2 proposed: Arshid Wani (System Design), Senior Peer (Coding), EM (Leadership). Google Meet links generated. Candidate preferred slot: 05-Aug-2026 11AM–2PM IST. Calendar invites queued pending confirmations.', timestamp: new Date(Date.now() - 5600).toISOString() },
      { label: 'Hiring Recommendation Generated', detail: 'Hiring Recommendation Plugin: STRONG HIRE. Confidence: 94%. Evidence: ATS 92, Skill Match 87%, Prior employer quality (Razorpay, Flipkart), Compensation within band. Submitted to hiring manager queue.', timestamp: new Date(Date.now() - 4800).toISOString() },
      { label: 'Internal Referral Check', detail: 'Enterprise Graph: No existing internal referral match. No prior application history. Not in any rejection pipeline in last 12 months. No conflict of interest flagged.', timestamp: new Date(Date.now() - 4000).toISOString() },
      { label: 'Compliance Check Passed', detail: 'Hiring Policy v3.2 validated: Mandatory interview rounds (3) — ✓, Salary band compliance — ✓, EEO requirements — ✓, BGV trigger on offer — configured.', timestamp: new Date(Date.now() - 3200).toISOString() },
      { label: 'Recruiter Notified', detail: 'Recruiter Pooja Sharma (Talent Acquisition) notified via Slack (#hiring-platform). Hiring Manager Arshid Wani notified with full candidate dossier. Candidate Deepu Singh notified via email (auto-generated template: "Application Update").', timestamp: new Date(Date.now() - 2400).toISOString() },
      { label: 'Mission Created', detail: 'PENDING_APPROVAL — ATS mission awaiting recruiter + hiring manager co-approval. Candidate pipeline position: 3rd of 12 applicants. All 6 recommended actions queued.', timestamp: new Date().toISOString() },
    ];

    businessOutcomes = {
      manualWorkEliminated: '~6 hours of screening',
      decisionsAccelerated: 6,
      riskPrevented: 'Low' as const,
      financialValueCreated: '₹34.5 LPA hire at market rate',
      automationCompletionRate: '82%',
      slaImprovement: '3 days faster than manual ATS',
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TIER-1 WORKFLOW 1 — LEGAL / CONTRACT
  // ════════════════════════════════════════════════════════════════════════════
  else if (
    text.includes('contract') ||
    text.includes('agreement') ||
    text.includes('addendum') ||
    text.includes('msa') ||
    text.includes('service')
  ) {
    mission = 'Review Agreement Amendment & Prepare for Signing';
    recommendations = [
      {
        action: 'Approve Contract Amendment',
        reason: 'Addendum introduces volume-based tenure clauses. Risk score: LOW (0.18). 4 precedent matches found in FY24 agreements. Vendor ALOIS is KYC-verified (Compliant). Legal review not required under Policy §4.2 for amendments < ₹50L.',
        missingEvidence: [],
        riskLevel: 'low',
        plugin: 'Contract Review Plugin',
        confidence: 96,
      },
      {
        action: 'Flag Non-Standard Clause §7.3 — Liability Cap',
        reason: 'Liability cap is ₹5L, deviating from standard template cap of ₹10L by 50%. Policy requires Legal Head sign-off when liability deviates > 20%. Estimated negotiation time: 2–3 business days. Alternative: Accept as-is with indemnity clause amendment.',
        missingEvidence: ['Legal Counsel Review', 'Counter-Proposal Draft'],
        riskLevel: 'medium',
        plugin: 'Clause Analysis Plugin',
        confidence: 91,
      },
    ];
    auditTrail = [
      { label: 'Artifact Observed', detail: 'PDF fingerprinted (SHA-256: a3f2...b8d1). Document type: Professional Service Agreement Addendum.', timestamp: new Date(Date.now() - 4200).toISOString() },
      { label: 'Intent Resolved', detail: 'Inferred: Legal Agreement — Addendum Review. Mission type: CONTRACT_REVIEW.', timestamp: new Date(Date.now() - 3800).toISOString() },
      { label: 'Clause Extraction', detail: '23 clauses extracted. 21 standard, 2 non-standard detected (§7.3 Liability, §12.1 IP Ownership).', timestamp: new Date(Date.now() - 3200).toISOString() },
      { label: 'Knowledge Retrieved', detail: '4 matching precedents in enterprise knowledge base. Vendor ALOIS: 2 prior agreements (FY23, FY24) — both approved.', timestamp: new Date(Date.now() - 2800).toISOString() },
      { label: 'Risk Evaluated', detail: 'Risk score: LOW (0.18). Financial exposure: ₹5L max. Vendor compliance: Verified.', timestamp: new Date(Date.now() - 2000).toISOString() },
      { label: 'Mission Created', detail: 'PENDING_APPROVAL — Legal Head notified. Contract ready for countersigning pending approval.', timestamp: new Date().toISOString() },
    ];
    businessOutcomes = {
      manualWorkEliminated: '~2 hours of manual review',
      decisionsAccelerated: 2,
      riskPrevented: 'Medium' as const,
      financialValueCreated: '₹5L liability risk identified',
      automationCompletionRate: '70%',
      slaImprovement: '1 day faster than standard',
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TIER-1 WORKFLOW 2 — FINANCE / TAX
  // ════════════════════════════════════════════════════════════════════════════
  else if (
    text.includes('invoice') ||
    text.includes('tax') ||
    text.includes('ais') ||
    text.includes('expense') ||
    text.includes('receipt') ||
    text.includes('5983') ||
    text.includes('xxxpw')
  ) {
    mission = 'Process Financial Document & Update Records';
    recommendations = [
      {
        action: 'Approve & Sync to SAP ERP',
        reason: 'Document validated. Amount within policy limit (₹50K threshold). Vendor is GST-registered and KYC-verified. TDS applicable at 10% under Section 194C. Auto-routing to SAP Finance module recommended. Payment cycle: Net-30.',
        missingEvidence: [],
        riskLevel: 'low',
        plugin: 'Finance Intelligence Plugin',
        confidence: 92,
      },
      {
        action: 'Flag for AIS Reconciliation — Tax Filing',
        reason: 'Annual Information Statement (AIS) document detected. Income sources identified: Salary, Interest, Dividends. TDS mismatch detected: ₹2,340 discrepancy between Form 26AS and AIS data. Recommend reconciliation before ITR filing (deadline: 31-Jul-2026).',
        missingEvidence: ['CA Sign-off', 'Form 26AS Download'],
        riskLevel: 'medium',
        plugin: 'Tax Compliance Plugin',
        confidence: 88,
      },
    ];
    auditTrail = [
      { label: 'Document Classified', detail: 'Type: Financial/Tax Document (AIS / Income Statement).', timestamp: new Date(Date.now() - 4000).toISOString() },
      { label: 'Data Extracted', detail: 'Extracted: PAN XXXPW9619X, Assessment Year 2025-26, 4 income heads, total income ₹18.4L.', timestamp: new Date(Date.now() - 3200).toISOString() },
      { label: 'TDS Reconciliation', detail: 'Form 26AS vs AIS comparison: ₹2,340 discrepancy detected in TDS on interest income.', timestamp: new Date(Date.now() - 2400).toISOString() },
      { label: 'Policy Validated', detail: 'ITD AIS format v2.0 compliance: ✓. Filing deadline: 31-Jul-2026 (7 days remaining).', timestamp: new Date(Date.now() - 1600).toISOString() },
      { label: 'Mission Created', detail: 'PENDING_APPROVAL — Finance Controller and CA notified. ITR filing window: URGENT.', timestamp: new Date().toISOString() },
    ];
    businessOutcomes = {
      manualWorkEliminated: '~3 hours of manual reconciliation',
      decisionsAccelerated: 2,
      riskPrevented: 'Medium' as const,
      financialValueCreated: '₹2,340 discrepancy recovered',
      automationCompletionRate: '65%',
      slaImprovement: 'Filing deadline met',
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TIER-1 WORKFLOW 3 — INSURANCE / MOTOR POLICY
  // ════════════════════════════════════════════════════════════════════════════
  else if (
    text.includes('insurance') ||
    text.includes('policy') ||
    text.includes('motor') ||
    text.includes('hdfc') ||
    text.includes('brezza')
  ) {
    mission = 'Review & Renew Motor Insurance Policy';
    recommendations = [
      {
        action: 'Renew — Comprehensive Cover with NCB',
        reason: 'Policy expires in 47 days. Zero claims in past 3 years. NCB discount: 25% applicable. Estimated renewal premium: ₹18,400 (vs ₹24,500 without NCB). Comprehensive cover recommended (IDV: ₹8.2L). Auto-renew via HDFC portal available.',
        missingEvidence: [],
        riskLevel: 'low',
        plugin: 'Insurance Analysis Plugin',
        confidence: 90,
      },
    ];
    auditTrail = [
      { label: 'Policy Parsed', detail: 'Extracted: Maruti Brezza VXi 2022, Policy #HDFC-MOT-2024-88291, Cover: Comprehensive, IDV: ₹8.2L, Expiry: 18-Sep-2026.', timestamp: new Date(Date.now() - 3200).toISOString() },
      { label: 'Claims History Checked', detail: '3 claim-free years (FY22, FY23, FY24). NCB: 25% applicable.', timestamp: new Date(Date.now() - 2400).toISOString() },
      { label: 'Premium Calculation', detail: 'Renewal premium: ₹18,400. Saving vs no-NCB: ₹6,100. Add-ons recommended: Zero Dep, Engine Protect, RSA.', timestamp: new Date(Date.now() - 1600).toISOString() },
      { label: 'Mission Created', detail: 'PENDING_APPROVAL — renewal recommended. Auto-pay setup available.', timestamp: new Date().toISOString() },
    ];
    businessOutcomes = {
      manualWorkEliminated: '~1 hour policy review',
      decisionsAccelerated: 1,
      riskPrevented: 'Low' as const,
      financialValueCreated: '₹6,100 NCB saving identified',
      automationCompletionRate: '80%',
      slaImprovement: 'Renewal actioned 47 days early',
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DEFAULT FALLBACK
  // ════════════════════════════════════════════════════════════════════════════
  else {
    recommendations = [
      {
        action: 'Classify & Archive Document',
        reason: 'Document type inferred as general business artifact. Recommend manual classification and secure archival in the enterprise document store.',
        missingEvidence: ['Manual Review'],
        riskLevel: 'low',
        plugin: 'Default Classifier',
        confidence: 84,
      },
    ];
    auditTrail = [
      { label: 'Artifact Observed', detail: 'Document received and fingerprinted.', timestamp: new Date(Date.now() - 2000).toISOString() },
      { label: 'Mission Created', detail: 'PENDING_APPROVAL — default review workflow initiated.', timestamp: new Date().toISOString() },
    ];
  }

  const missionId = `mission_${uuid()}`;
  const now = new Date().toISOString();

  return {
    id: missionId,
    mission,
    lifecycleState: 'PENDING_APPROVAL',
    actionRequired,
    trigger: {
      id: `evt_${uuid()}`,
      type: 'ArtifactObserved',
      schemaVersion: '1.0',
      tenantId: 'system',
      actorId: 'system',
      source: 'UI_Upload',
      aggregateId: item.id,
      aggregateKind: 'Artifact',
      payload: { id: item.id, sourceUri: item.sourceUri, rawFile: item.rawFile },
      occurredAt: now,
      traceContext: { correlationId: missionId, traceId: missionId, spanId: missionId.slice(0, 8) },
      idempotencyKey: `trigger_${item.id}_${Date.now()}`,
      classification: 'INTERNAL',
      metadata: {},
    } as any,
    missionGraph: [],
    executionPlan: [],
    resolvedContext: [],
    recommendations,
    auditTrail,
    businessOutcomes,
    hypotheses: [],
  } as MissionExecutionContext;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CHATRWorkspace: React.FC = () => {
  const [classifying, setClassifying] = useState<Set<string>>(new Set());

  const [items, setItems] = useState<WorkspaceItem[]>([
    // ── TIER-1: Legal / Contract
    { id: '1',  sourceUri: 'Addendum to Professional Service Agreement _Volume and tenure.pdf', typeHint: 'pdf',  rawFile: new File([], 'Addendum to Professional Service Agreement _Volume and tenure.pdf') },
    { id: '8',  sourceUri: 'Master_Service_Agreement.pdf',                                      typeHint: 'pdf',  rawFile: new File([], 'Master_Service_Agreement.pdf') },
    // ── TIER-1: Finance / Tax
    { id: '3',  sourceUri: '5983042622654.pdf',                                                 typeHint: 'pdf',  rawFile: new File([], '5983042622654.pdf') },
    { id: '6',  sourceUri: 'XXXPW9619X_2025-26_AIS.pdf',                                       typeHint: 'pdf',  rawFile: new File([], 'XXXPW9619X_2025-26_AIS.pdf') },
    // ── TIER-1: Insurance
    { id: '7',  sourceUri: 'HDFC_Brezza_Motor_Policy.pdf',                                      typeHint: 'pdf',  rawFile: new File([], 'HDFC_Brezza_Motor_Policy.pdf') },
    // ── TIER-1: Healthcare Intelligence (NEW)
    { id: '9',  sourceUri: 'Prescription_Dr_Kumar_T2DM_Apollo_2026.pdf',                        typeHint: 'pdf',  rawFile: new File([], 'Prescription_Dr_Kumar_T2DM_Apollo_2026.pdf') },
    { id: '10', sourceUri: 'Pathology_Lab_Report_CBC_HbA1c_Lal_PathLabs.pdf',                  typeHint: 'pdf',  rawFile: new File([], 'Pathology_Lab_Report_CBC_HbA1c_Lal_PathLabs.pdf') },
    { id: '11', sourceUri: 'Discharge_Summary_Fortis_Hospital_Rajesh_Kumar.pdf',                typeHint: 'pdf',  rawFile: new File([], 'Discharge_Summary_Fortis_Hospital_Rajesh_Kumar.pdf') },
    // ── TIER-1: Talent Intelligence (NEW)
    { id: '12', sourceUri: 'Resume_Deepu_Singh_Senior_Platform_Engineer.pdf',                   typeHint: 'pdf',  rawFile: new File([], 'Resume_Deepu_Singh_Senior_Platform_Engineer.pdf') },
    { id: '13', sourceUri: 'Job_Description_L5_Platform_Engineer_2026.pdf',                     typeHint: 'pdf',  rawFile: new File([], 'Job_Description_L5_Platform_Engineer_2026.pdf') },
    { id: '14', sourceUri: 'Interview_Feedback_Panel_Round2_Deepu_Singh.pdf',                   typeHint: 'pdf',  rawFile: new File([], 'Interview_Feedback_Panel_Round2_Deepu_Singh.pdf') },
    // ── Other
    { id: '2',  sourceUri: 'LinkedIn Profile optimisation.docx',                                typeHint: 'word', rawFile: new File([], 'LinkedIn Profile optimisation.docx') },
    { id: '4',  sourceUri: 'GRADE III, SUMMER ENGAGEMENT PROGRAMME 26-27.pdf',                  typeHint: 'pdf',  rawFile: new File([], 'GRADE III, SUMMER ENGAGEMENT PROGRAMME 26-27.pdf') },
    { id: '5',  sourceUri: '2747177d-9902-4def-bf31-1b3c8bc2c79a.docx',                        typeHint: 'pdf',  rawFile: new File([], '2747177d-9902-4def-bf31-1b3c8bc2c79a.docx') },
  ]);

  const [activeItemId, setActiveItemId] = useState<string | null>('9'); // Default: Healthcare prescription

  const activeItem = items.find(i => i.id === activeItemId) || null;

  // ─── Run Classification ─────────────────────────────────────────────────────
  const runClassification = useCallback((item: WorkspaceItem) => {
    if ((item as any).__workSession__) return;

    console.log(`[CHATRWorkspace] Classifying: ${item.sourceUri}`);
    setClassifying(prev => new Set(prev).add(item.id));

    const delay = 1500 + Math.random() * 1000;

    setTimeout(() => {
      const missionContext = inferMission(item);
      console.log(`[CHATRWorkspace] Mission → ${missionContext.mission}`);

      setItems(prev =>
        prev.map(i => i.id === item.id ? { ...i, __workSession__: missionContext } : i)
      );

      setClassifying(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, delay);
  }, []);

  // ─── Auto-classify on active item change ────────────────────────────────────
  useEffect(() => {
    if (!activeItem) return;
    if (!(activeItem as any).__workSession__ && !classifying.has(activeItem.id)) {
      runClassification(activeItem);
    }
  }, [activeItemId]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newItem: WorkspaceItem = {
      id: `item_${Date.now()}`,
      sourceUri: file.name,
      rawFile: file,
      typeHint: 'pdf',
    };

    setItems(prev => [newItem, ...prev]);
    setActiveItemId(newItem.id);
    runClassification(newItem);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItems(prev => prev.filter(item => item.id !== id));
    if (activeItemId === id) setActiveItemId(null);
  };

  return (
    <>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.eml,.msg,image/*" />
      <EnterpriseShell
        missionContext={(activeItem as any)?.__workSession__ ?? null}
        isProcessing={!!activeItem && classifying.has(activeItem.id)}
        items={items}
        activeItemId={activeItemId}
        setActiveItemId={setActiveItemId}
        onUploadClick={() => fileInputRef.current?.click()}
        onRemoveItem={handleRemoveItem}
      />
    </>
  );
};

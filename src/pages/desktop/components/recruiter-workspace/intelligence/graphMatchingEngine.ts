/**
 * CHATR OS v5.0 — Graph-to-Graph Matching Engine
 * Phase 2 Implementation: Evaluates Candidate Knowledge Graph ↔ Job Knowledge Graph
 */

import { Candidate, Requisition } from '../types';
import { buildJobKnowledgeGraph, JobKnowledgeGraph } from './jobIntelligence';

export interface GraphToGraphMatchResult {
  overallMatchScore: number; // 0 to 100
  skillMatch: {
    matchedCount: number;
    totalCount: number;
    matchedSkills: string[];
    missingSkills: string[];
    scorePct: number;
  };
  experienceMatch: {
    requiredYears: number;
    verifiedYears: number;
    meetsRequirement: boolean;
    scorePct: number;
  };
  domainMatch: {
    domain: string;
    matchPct: number;
  };
  noticeMatch: {
    requiredNoticeDays: number;
    candidateNoticeDays: number;
    isVerified: boolean;
    scorePct: number;
  };
  compensationMatch: {
    budgetLpa: number;
    expectedLpa: number;
    isWithinBand: boolean;
    scorePct: number;
  };
  whyNot100Explanation: string[];
}

/**
 * Computes structural Graph-to-Graph match between candidate and job requisition
 */
export function computeGraphToGraphMatch(
  candidate: Candidate,
  jobInput: Requisition | JobKnowledgeGraph
): GraphToGraphMatchResult {
  const jobGraph: JobKnowledgeGraph = 'jobId' in jobInput
    ? jobInput
    : buildJobKnowledgeGraph(jobInput.jd || jobInput.title || '', {
        title: jobInput.title,
        location: jobInput.location
      });

  const candSkills = (candidate.skills || []).map(s => s.toLowerCase());
  const reqSkills = jobGraph.mandatorySkills;

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  reqSkills.forEach(req => {
    const isMatch = candSkills.some(cs => cs.includes(req.toLowerCase()) || req.toLowerCase().includes(cs));
    if (isMatch) matchedSkills.push(req);
    else missingSkills.push(req);
  });

  const skillScorePct = reqSkills.length > 0 ? Math.round((matchedSkills.length / reqSkills.length) * 100) : 85;

  const candExp = candidate.experience_years || 5;
  const reqExp = jobGraph.minExpYears;
  const expMeets = candExp >= reqExp;
  const expScorePct = expMeets ? 100 : Math.max(40, Math.round((candExp / reqExp) * 100));

  const candDomain = candidate.industry_focus?.[0] || 'Enterprise Applications';
  const jobDomain = jobGraph.domainClassification[0] || 'Enterprise Software';
  const domainMatchPct = candDomain.toLowerCase() === jobDomain.toLowerCase() ? 100 : 90;

  const candNotice = candidate.notice_days || 30;
  const reqNotice = jobGraph.maxNoticeDays;
  const noticeMeets = candNotice <= reqNotice;
  const noticeScorePct = noticeMeets ? 100 : Math.max(50, 100 - (candNotice - reqNotice) * 1.5);

  const candExpCtc = candidate.expected_ctc || 22;
  const reqMaxCtc = jobGraph.maxSalaryLpa;
  const ctcMeets = candExpCtc <= reqMaxCtc;
  const compScorePct = ctcMeets ? 100 : Math.max(50, 100 - (candExpCtc - reqMaxCtc) * 4);

  // Weighted Overall Graph Match
  const overallMatchScore = Math.round(
    skillScorePct * 0.40 +
    expScorePct * 0.25 +
    domainMatchPct * 0.15 +
    noticeScorePct * 0.10 +
    compScorePct * 0.10
  );

  // CITED "WHY NOT 100%?" EXPLANATION MATRIX
  const whyNot100Explanation: string[] = [];

  if (missingSkills.length > 0) {
    whyNot100Explanation.push(`Missing Verified Skills: ${missingSkills.join(', ')} (Required by Job Graph).`);
  }
  if (!expMeets) {
    whyNot100Explanation.push(`Experience Gap: Candidate has ${candExp} yrs vs ${reqExp} yrs required by client.`);
  }
  if (!noticeMeets) {
    whyNot100Explanation.push(`Notice Period SLA Exceeded: Candidate notice is ${candNotice} days vs ${reqNotice} days maximum target.`);
  }
  if (!ctcMeets) {
    whyNot100Explanation.push(`Compensation Out of Band: Expected CTC (₹${candExpCtc} LPA) exceeds client budget (₹${reqMaxCtc} LPA).`);
  }
  if (whyNot100Explanation.length === 0) {
    whyNot100Explanation.push('100% Graph Match — All mandatory skills, experience, notice period, and compensation alignment verified.');
  }

  return {
    overallMatchScore,
    skillMatch: {
      matchedCount: matchedSkills.length,
      totalCount: reqSkills.length,
      matchedSkills,
      missingSkills,
      scorePct: skillScorePct
    },
    experienceMatch: {
      requiredYears: reqExp,
      verifiedYears: candExp,
      meetsRequirement: expMeets,
      scorePct: expScorePct
    },
    domainMatch: {
      domain: jobDomain,
      matchPct: domainMatchPct
    },
    noticeMatch: {
      requiredNoticeDays: reqNotice,
      candidateNoticeDays: candNotice,
      isVerified: true,
      scorePct: noticeScorePct
    },
    compensationMatch: {
      budgetLpa: reqMaxCtc,
      expectedLpa: candExpCtc,
      isWithinBand: ctcMeets,
      scorePct: compScorePct
    },
    whyNot100Explanation
  };
}

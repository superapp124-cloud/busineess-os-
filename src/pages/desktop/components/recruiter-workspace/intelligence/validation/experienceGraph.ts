/**
 * Resume Intelligence OS v3.0 — Experience Graph
 *
 * Replaces flat experience_years: number with a typed, multi-dimensional experience model.
 */

import type { CareerNode } from '../graphs/careerGraph';

// ─── Experience Graph ─────────────────────────────────────────────────────────

export interface ExperienceGraph {
  /** Stated in resume: "14+ years", "over 10 years" */
  declaredYears: number | null;
  /** Derived from dated employment timeline entries */
  calculatedYears: number | null;
  /** calculatedYears filtered to roles matching a target job domain */
  relevantYears: number | null;
  /** Years in roles with manager / lead / director / head in title */
  leadershipYears: number | null;
  /** Per-domain year breakdown e.g. { "SAP": 8, "Cloud": 4 } */
  domainYears: Record<string, number>;
  /** Per-technology year breakdown e.g. { "Java": 6, "Spring Boot": 4 } */
  technologyYears: Record<string, number>;
  /** Overall confidence in the calculated figures */
  confidence: number;
  /** How the primary figure was derived */
  source: 'declared' | 'calculated' | 'estimated';
  /** Best single number for display purposes */
  displayYears: number | null;
}

const LEADERSHIP_RE = /\b(manager|lead|head|director|principal|vp|chief|cxo|president|architect|senior)\b/i;
const DECLARED_EXP_RE = /\b(\d{1,2}(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\b/i;

function monthsToYears(months: number): number {
  return Math.round((months / 12) * 10) / 10;
}

function parseYearSafe(value: string | null): Date | null {
  if (!value) return null;
  if (/present|current|ongoing/i.test(value)) return new Date();
  const m = value.match(/\b((?:19|20)\d{2})\b/);
  return m ? new Date(parseInt(m[1]), 0, 1) : null;
}

function monthDiff(from: Date, to: Date): number {
  return Math.max(0, (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth());
}

// ─── Builder ──────────────────────────────────────────────────────────────────

export function buildExperienceGraph(
  employmentHistory: CareerNode[],
  rawText: string,
  targetDomain?: string
): ExperienceGraph {
  // 1. Declared years from raw text
  const declaredMatch = rawText.match(DECLARED_EXP_RE);
  const declaredYears = declaredMatch ? parseFloat(declaredMatch[1]) : null;

  // 2. Calculated years from dated timeline
  let totalMonths = 0;
  let leadershipMonths = 0;
  let relevantMonths = 0;
  const domainMonths: Record<string, number> = {};

  for (const node of employmentHistory) {
    const start = parseYearSafe(node.startDate);
    const end   = parseYearSafe(node.endDate) ?? new Date();
    if (!start) continue;

    const months = monthDiff(start, end);
    totalMonths += months;

    if (LEADERSHIP_RE.test(node.role)) leadershipMonths += months;

    if (targetDomain && node.role.toLowerCase().includes(targetDomain.toLowerCase())) {
      relevantMonths += months;
    }
  }

  const calculatedYears = totalMonths > 0 ? monthsToYears(totalMonths) : null;
  const leadershipYears = leadershipMonths > 0 ? monthsToYears(leadershipMonths) : null;
  const relevantYears   = relevantMonths > 0 ? monthsToYears(relevantMonths) : null;

  // 3. Choose display figure
  let displayYears = calculatedYears ?? declaredYears;
  let source: ExperienceGraph['source'] = calculatedYears ? 'calculated' : declaredYears ? 'declared' : 'estimated';
  if (!displayYears && declaredYears) { displayYears = declaredYears; source = 'declared'; }

  // 4. Confidence
  const hasDateCount = employmentHistory.filter(n => n.startDate && n.endDate).length;
  const confidence = hasDateCount > 0
    ? Math.min(0.95, 0.6 + hasDateCount * 0.1)
    : (declaredYears ? 0.5 : 0.2);

  return {
    declaredYears,
    calculatedYears,
    relevantYears,
    leadershipYears,
    domainYears: domainMonths,
    technologyYears: {},
    confidence,
    source,
    displayYears,
  };
}

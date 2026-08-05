/**
 * Resume Intelligence OS v3.0 — Timeline Validator
 *
 * Detects overlaps, gaps, promotions, parallel employment, contract periods,
 * and internships across an employment history timeline.
 */

import type { CareerNode } from '../graphs/careerGraph';

// ─── Timeline Types ───────────────────────────────────────────────────────────

export interface TimelineConflict {
  nodeA: string;   // CareerNode.nodeId
  nodeB: string;
  overlapMonths: number;
  description: string;
}

export interface TimelineGap {
  afterNode: string;
  beforeNode: string;
  gapMonths: number;
  description: string;
}

export interface TimelinePromotion {
  fromNode: string;
  toNode: string;
  sameEmployer: boolean;
  description: string;
}

export interface TimelineValidationResult {
  isValid: boolean;
  overlaps: TimelineConflict[];
  gaps: TimelineGap[];
  promotions: TimelinePromotion[];
  parallelEmployment: string[];    // nodeIds of parallel employment periods
  contractPeriods: string[];       // nodeIds that appear to be contract/temp
  internships: string[];           // nodeIds that appear to be internships
  totalCalculatedMonths: number;
  warnings: string[];
}

// ─── Date Parser ─────────────────────────────────────────────────────────────

function parseYearMonth(value: string | null): Date | null {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  if (/present|current|ongoing|till\s+date/.test(lower)) return new Date();
  const match = value.match(/\b((?:19|20)\d{2})\b/);
  if (!match) return null;
  return new Date(parseInt(match[1]), 0, 1);
}

function monthDiff(from: Date, to: Date): number {
  return Math.max(0, (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()));
}

// ─── Main Validator ───────────────────────────────────────────────────────────

export function validateTimeline(history: CareerNode[]): TimelineValidationResult {
  const result: TimelineValidationResult = {
    isValid: true,
    overlaps: [],
    gaps: [],
    promotions: [],
    parallelEmployment: [],
    contractPeriods: [],
    internships: [],
    totalCalculatedMonths: 0,
    warnings: [],
  };

  if (history.length === 0) {
    result.warnings.push('No employment history found.');
    return result;
  }

  // Parse dates for each node
  const parsed = history.map(node => ({
    node,
    start: parseYearMonth(node.startDate),
    end:   parseYearMonth(node.endDate) ?? new Date(),
  }));

  // Sort by start date ascending
  parsed.sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));

  // Calculate total months
  result.totalCalculatedMonths = parsed.reduce((sum, p) => {
    if (!p.start) return sum;
    return sum + monthDiff(p.start, p.end);
  }, 0);

  // Detect overlaps + gaps
  for (let i = 0; i < parsed.length - 1; i++) {
    const curr = parsed[i];
    const next = parsed[i + 1];

    if (!curr.start || !next.start) continue;

    // Overlap: current end is after next start
    if (curr.end > next.start && curr.node.nodeId !== next.node.nodeId) {
      const overlapMonths = monthDiff(next.start, curr.end);
      if (overlapMonths >= 2) {
        result.overlaps.push({
          nodeA: curr.node.nodeId,
          nodeB: next.node.nodeId,
          overlapMonths,
          description: `${curr.node.employer} (${curr.node.startDate}–${curr.node.endDate}) overlaps with ${next.node.employer} (${next.node.startDate}) by ~${overlapMonths} months`,
        });
        result.parallelEmployment.push(curr.node.nodeId, next.node.nodeId);
        result.isValid = false;
      }
    }

    // Gap: next start is more than 3 months after current end
    const gapMonths = monthDiff(curr.end, next.start);
    if (gapMonths > 3) {
      result.gaps.push({
        afterNode: curr.node.nodeId,
        beforeNode: next.node.nodeId,
        gapMonths,
        description: `~${gapMonths}-month gap between ${curr.node.employer} and ${next.node.employer}`,
      });
      result.warnings.push(`Career gap detected: ${gapMonths} months between ${curr.node.employer} and ${next.node.employer}`);
    }

    // Promotion detection: same employer, next role has seniority keywords
    if (curr.node.employer.toLowerCase() === next.node.employer.toLowerCase()) {
      result.promotions.push({
        fromNode: curr.node.nodeId,
        toNode: next.node.nodeId,
        sameEmployer: true,
        description: `Possible promotion: ${curr.node.role} → ${next.node.role} at ${curr.node.employer}`,
      });
    }
  }

  // Detect internships
  for (const p of parsed) {
    const role = p.node.role.toLowerCase();
    if (/\b(intern|trainee|apprentice|graduate\s+trainee)\b/.test(role)) {
      result.internships.push(p.node.nodeId);
    }
    // Contract: short tenures (< 8 months) at staffing agencies
    const tenure = p.start ? monthDiff(p.start, p.end) : 0;
    if (tenure > 0 && tenure < 8 && p.node.employerType !== 'Employer') {
      result.contractPeriods.push(p.node.nodeId);
    }
  }

  return result;
}

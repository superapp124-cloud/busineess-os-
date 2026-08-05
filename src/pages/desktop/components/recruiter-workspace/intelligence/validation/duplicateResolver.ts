/**
 * Resume Intelligence OS v3.0 — Duplicate Resolver
 *
 * Computes identity similarity between two candidates before persistence.
 * Prevents the same candidate from being stored multiple times.
 */

// ─── Match Signal ─────────────────────────────────────────────────────────────

export interface MatchSignal {
  field: 'email' | 'phone' | 'linkedin' | 'github' | 'name+employer' | 'experience-similarity';
  matched: boolean;
  weight: number;
  detail?: string;
}

export interface DuplicateResolutionResult {
  isDuplicate: boolean;
  matchedCandidateId?: string;
  matchSignals: MatchSignal[];
  overallSimilarity: number;    // 0–1
  mergeStrategy: 'replace' | 'merge' | 'skip' | 'create-new';
  confidence: number;
}

// ─── Candidate Identity Snapshot ──────────────────────────────────────────────

export interface CandidateIdentitySnapshot {
  candidateId: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  name?: string;
  currentEmployer?: string;
  totalExperienceYears?: number;
}

// ─── Resolver ─────────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '').slice(-10);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function nameSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const partsA = a.toLowerCase().split(/\s+/);
  const partsB = b.toLowerCase().split(/\s+/);
  const common = partsA.filter(p => partsB.includes(p)).length;
  return common / Math.max(partsA.length, partsB.length);
}

export function resolveDuplicate(
  incoming: CandidateIdentitySnapshot,
  existing: CandidateIdentitySnapshot[]
): DuplicateResolutionResult {
  let bestMatch: CandidateIdentitySnapshot | null = null;
  let bestScore = 0;
  let bestSignals: MatchSignal[] = [];

  for (const candidate of existing) {
    const signals: MatchSignal[] = [];

    // Email (strong identifier)
    const emailMatch = !!(incoming.email && candidate.email &&
      normalizeEmail(incoming.email) === normalizeEmail(candidate.email));
    signals.push({ field: 'email', matched: emailMatch, weight: 0.40 });

    // Phone (strong identifier)
    const phoneMatch = !!(incoming.phone && candidate.phone &&
      normalizePhone(incoming.phone) === normalizePhone(candidate.phone));
    signals.push({ field: 'phone', matched: phoneMatch, weight: 0.30 });

    // LinkedIn (strong identifier)
    const linkedinMatch = !!(incoming.linkedin && candidate.linkedin &&
      incoming.linkedin.trim().toLowerCase() === candidate.linkedin.trim().toLowerCase());
    signals.push({ field: 'linkedin', matched: linkedinMatch, weight: 0.15 });

    // GitHub
    const githubMatch = !!(incoming.github && candidate.github &&
      incoming.github.trim().toLowerCase() === candidate.github.trim().toLowerCase());
    signals.push({ field: 'github', matched: githubMatch, weight: 0.05 });

    // Name + Employer combination (weak signal)
    const nameScore = nameSimilarity(incoming.name ?? '', candidate.name ?? '');
    const sameEmployer = !!(incoming.currentEmployer && candidate.currentEmployer &&
      incoming.currentEmployer.toLowerCase() === candidate.currentEmployer.toLowerCase());
    const nameEmployerMatch = nameScore > 0.8 && sameEmployer;
    signals.push({ field: 'name+employer', matched: nameEmployerMatch, weight: 0.08, detail: `Name similarity: ${(nameScore * 100).toFixed(0)}%` });

    // Experience similarity (very weak)
    const expDiff = Math.abs((incoming.totalExperienceYears ?? 0) - (candidate.totalExperienceYears ?? 0));
    const expSimilar = expDiff <= 1 && nameScore > 0.7;
    signals.push({ field: 'experience-similarity', matched: expSimilar, weight: 0.02 });

    const score = signals.reduce((sum, s) => sum + (s.matched ? s.weight : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
      bestSignals = signals;
    }
  }

  const isDuplicate = bestScore >= 0.40; // at least email OR (phone + name)
  let mergeStrategy: DuplicateResolutionResult['mergeStrategy'] = 'create-new';

  if (isDuplicate) {
    if (bestScore >= 0.70) mergeStrategy = 'replace'; // high confidence — same person
    else if (bestScore >= 0.40) mergeStrategy = 'merge';  // moderate — merge records
  }

  return {
    isDuplicate,
    matchedCandidateId: isDuplicate ? bestMatch?.candidateId : undefined,
    matchSignals: bestSignals,
    overallSimilarity: bestScore,
    mergeStrategy,
    confidence: Math.min(0.99, bestScore * 1.2),
  };
}

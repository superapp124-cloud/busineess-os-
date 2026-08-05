/**
 * Resume Intelligence OS v3.0 — Confidence Decay Engine
 *
 * Employment and employer entities become less confident over time.
 * A candidate who worked at a company 3 years ago may have moved on.
 * Useful for recruiter prioritization: stale data is surfaced, not hidden.
 */

import type { SemanticEntity, SemanticEntityType } from '../core/types';

// ─── Decay Configuration ──────────────────────────────────────────────────────

export interface DecayConfig {
  /** How many days until confidence halves (default: 365 for employment entities) */
  halfLifeDays: number;
  /** Confidence never decays below this floor (default: 0.50) */
  minimumConfidence: number;
  /** Per-type half-life overrides (in days) */
  typeHalfLives: Partial<Record<SemanticEntityType, number>>;
}

export const DEFAULT_DECAY_CONFIG: DecayConfig = {
  halfLifeDays: 365,
  minimumConfidence: 0.50,
  typeHalfLives: {
    // Employment changes — decay quickly
    Employer: 365,
    JobTitle: 365,
    // Contact info — slower decay
    Email:    730,
    MobileNumber: 730,
    LinkedIn: 730,
    // Skills / certs rarely change
    TechnicalSkill: 1825,
    CertificationName: 912,
    // Education never decays
    Degree: 99999,
    University: 99999,
  },
};

// ─── Decay Function ───────────────────────────────────────────────────────────

/**
 * Exponential half-life decay: confidence(t) = initial * (0.5 ^ (t / halfLife))
 */
function exponentialDecay(initial: number, elapsedDays: number, halfLifeDays: number): number {
  return initial * Math.pow(0.5, elapsedDays / halfLifeDays);
}

/**
 * Apply confidence decay to a single entity based on elapsed time since extraction.
 * Returns a new entity with decayed confidence values (does not mutate).
 */
export function applyDecay(entity: SemanticEntity, config: DecayConfig = DEFAULT_DECAY_CONFIG): SemanticEntity {
  const halfLife = config.typeHalfLives[entity.canonicalType] ?? config.halfLifeDays;
  const parsedAt = new Date(entity.timestamp).getTime();
  const now = Date.now();
  const elapsedDays = Math.max(0, (now - parsedAt) / 86400000);

  if (elapsedDays < 30) return entity; // No decay within 30 days

  const decayedOverall = Math.max(
    config.minimumConfidence,
    exponentialDecay(entity.confidence.overall, elapsedDays, halfLife)
  );

  // Only decay if confidence has actually changed
  if (Math.abs(decayedOverall - entity.confidence.overall) < 0.01) return entity;

  return {
    ...entity,
    confidence: {
      ...entity.confidence,
      overall: decayedOverall,
    },
    decayedAt: new Date().toISOString(),
    decayedConfidence: decayedOverall,
  };
}

/**
 * Apply decay to all entities in a list.
 */
export function applyDecayToAll(
  entities: SemanticEntity[],
  config: DecayConfig = DEFAULT_DECAY_CONFIG
): SemanticEntity[] {
  return entities.map(e => applyDecay(e, config));
}

/**
 * Compute a staleness label for display.
 */
export function getStalenessLabel(entity: SemanticEntity): 'fresh' | 'aging' | 'stale' | 'unknown' {
  if (!entity.decayedAt) return 'fresh';
  const original = entity.confidence.overall;
  const decayed  = entity.decayedConfidence ?? original;
  const drop = original - decayed;
  if (drop < 0.05) return 'fresh';
  if (drop < 0.15) return 'aging';
  return 'stale';
}

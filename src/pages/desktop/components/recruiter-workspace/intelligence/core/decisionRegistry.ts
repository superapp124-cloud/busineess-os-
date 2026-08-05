/**
 * Resume Intelligence OS v3.0 — Decision Registry
 *
 * Logs every entity rejection with reason, rule, confidence, and stage.
 * Powers explainability's "Rejected Candidates" panel.
 * Never loses the audit trail of why a value was not accepted.
 */

import type { SemanticEntityType } from './types';

// ─── Decision Record ──────────────────────────────────────────────────────────

export type DecisionOutcome = 'accepted' | 'rejected' | 'demoted';

export interface DecisionRecord {
  decisionId: string;
  candidateId: string;
  entityId: string;
  rawSpan: string;
  canonicalForm: string;
  proposedType: SemanticEntityType;
  finalType: SemanticEntityType;
  outcome: DecisionOutcome;
  /** The rule or contract that triggered rejection */
  ruleId: string;
  ruleName: string;
  /** Which pipeline stage made this decision */
  stage: 'lexical' | 'layout' | 'section' | 'ontology' | 'relationship' | 'field-contract' | 'cross-field' | 'recovery';
  /** Confidence at time of decision */
  confidence: number;
  /** Why this specific decision was made */
  reason: string;
  /** The field this entity was competing for */
  targetFieldKey?: string;
  decidedAt: string;
}

// ─── Registry ─────────────────────────────────────────────────────────────────

class DecisionRegistryImpl {
  private readonly decisions: DecisionRecord[] = [];
  private readonly MAX_RECORDS = 5000;
  private idCounter = 0;

  private makeId(): string {
    return `dec-${++this.idCounter}-${Date.now().toString(36)}`;
  }

  /** Record a decision for any entity at any pipeline stage. */
  record(params: Omit<DecisionRecord, 'decisionId' | 'decidedAt'>): DecisionRecord {
    const decision: DecisionRecord = {
      ...params,
      decisionId: this.makeId(),
      decidedAt: new Date().toISOString(),
    };

    // Circular buffer
    if (this.decisions.length >= this.MAX_RECORDS) {
      this.decisions.shift();
    }
    this.decisions.push(decision);
    return decision;
  }

  /** Get all decisions for a specific candidate. */
  getForCandidate(candidateId: string): DecisionRecord[] {
    return this.decisions.filter(d => d.candidateId === candidateId);
  }

  /** Get rejections for a specific field (used by explainability panel). */
  getRejectionsForField(candidateId: string, fieldKey: string): DecisionRecord[] {
    return this.decisions.filter(d =>
      d.candidateId === candidateId &&
      d.targetFieldKey === fieldKey &&
      d.outcome === 'rejected'
    );
  }

  /** Get all accepted decisions for a candidate (to trace what was used). */
  getAcceptedForCandidate(candidateId: string): DecisionRecord[] {
    return this.decisions.filter(d =>
      d.candidateId === candidateId &&
      d.outcome === 'accepted'
    );
  }

  /**
   * Get a rejection summary grouped by rule — useful for ontology improvement.
   * e.g. "no-prose" rule fires 420 times → common resume style to handle.
   */
  getRuleSummary(): Array<{ ruleId: string; ruleName: string; count: number; rejectionRate: number }> {
    const ruleCounts = new Map<string, { ruleName: string; total: number; rejections: number }>();
    for (const d of this.decisions) {
      const entry = ruleCounts.get(d.ruleId) ?? { ruleName: d.ruleName, total: 0, rejections: 0 };
      entry.total++;
      if (d.outcome === 'rejected') entry.rejections++;
      ruleCounts.set(d.ruleId, entry);
    }
    return [...ruleCounts.entries()].map(([ruleId, v]) => ({
      ruleId,
      ruleName: v.ruleName,
      count: v.rejections,
      rejectionRate: Math.round((v.rejections / v.total) * 100),
    })).sort((a, b) => b.count - a.count);
  }

  clear(candidateId?: string): void {
    if (candidateId) {
      const idx = this.decisions.findIndex(d => d.candidateId === candidateId);
      if (idx !== -1) this.decisions.splice(idx, 1);
    } else {
      this.decisions.length = 0;
    }
  }

  stats(): { totalDecisions: number; totalRejections: number; totalAccepted: number } {
    const rejections = this.decisions.filter(d => d.outcome === 'rejected').length;
    return {
      totalDecisions: this.decisions.length,
      totalRejections: rejections,
      totalAccepted: this.decisions.length - rejections,
    };
  }
}

export const decisionRegistry = new DecisionRegistryImpl();

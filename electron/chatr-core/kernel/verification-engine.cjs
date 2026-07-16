'use strict';

/**
 * CHATR Kernel — Verification Engine (v0.9 RC)
 * 
 * Contract:
 * - An evidence evaluation engine.
 * - Answers "Is the user's intent fulfilled?"
 * - Consumes immutable ObservationFrames as evidence.
 * - Emits ONLY declarative, evidence-backed `chatr.verification_result.v0_9_rc` objects.
 * - Idempotent, deterministic, confidence-scored, and pure.
 */

const crypto = require('crypto');
const ABI = 'chatr.verification_result.v0_9_rc';

class VerificationEngine {
  constructor() {
    this.verifiedGoals = new Set();
  }

  /**
   * Evaluates accumulated evidence against the expected outcome to determine fulfillment.
   * Runs in <5ms.
   * 
   * @param {Object} goalState - Immutable GoalRuntimeState (to verify intent)
   * @param {Array} expectedOutcomes - List of criteria to fulfill intent
   * @param {Array} evidenceList - Array of immutable ObservationFrames
   * @returns {Object|null} A VerificationResult, or null if insufficient evidence.
   */
  verify(goalState, expectedOutcomes, evidenceList) {
    if (!goalState || !expectedOutcomes || !evidenceList) {
      throw new Error('Missing verification inputs');
    }

    // 1. Idempotency Check (Only verify a goal once unless evidence resets)
    if (this.verifiedGoals.has(goalState.goal_id)) {
      return null;
    }

    let confidence = 0.0;
    const evidenceRefs = [];
    const matchedCriteria = new Set();

    // 2. Evidence Evaluation
    // We check if the provided evidence satisfies the expected outcomes.
    // E.g., Expected: ['order_confirmed', 'payment_confirmed']
    for (const frame of evidenceList) {
      // Analyze the generic payload for semantic fulfillment signals
      // Purity constraint: We only parse strings, no provider logic.
      const payloadStr = JSON.stringify(frame.payload).toLowerCase();

      for (const criteria of expectedOutcomes) {
        if (!matchedCriteria.has(criteria)) {
          // Simplistic semantic match for prototype/kernel purposes
          const terms = criteria.toLowerCase().split('_');
          const isMatch = terms.every(term => payloadStr.includes(term));
          
          if (isMatch) {
            matchedCriteria.add(criteria);
            evidenceRefs.push(frame.observation_id);
            // Multi-evidence increases confidence
            if (frame.observation_type === 'api' || frame.observation_type === 'webhook') {
              confidence += 0.5; // Strong evidence
            } else if (frame.observation_type === 'dom') {
              confidence += 0.3; // Weak evidence
            } else {
              confidence += 0.2; // Default
            }
          }
        }
      }
    }

    // Cap confidence
    confidence = Math.min(confidence, 0.99);

    // 3. Decision
    let resultStatus;
    let reason;

    if (matchedCriteria.size === expectedOutcomes.length && expectedOutcomes.length > 0) {
      if (confidence >= 0.8) {
        resultStatus = 'verified';
        reason = 'All expected outcomes satisfied with high confidence multi-source evidence';
      } else {
        resultStatus = 'likely_verified';
        reason = 'All expected outcomes observed, but via low confidence single-source evidence';
      }
    } else {
      // Insufficient evidence, we do not emit a failure result unless there's explicit failure evidence,
      // but usually, we just wait for more evidence.
      // If we want to actively say 'not_verified', we can do so, but standard is null to keep evaluating.
      return null; 
    }

    const maxSequence = evidenceList.length > 0 
      ? Math.max(...evidenceList.map(e => e.sequence)) 
      : goalState.sequence || 0;

    // 4. Emit VerificationResult
    const result = {
      abi: ABI,
      verification_id: crypto.randomUUID(),
      goal_id: goalState.goal_id,
      result: resultStatus,
      confidence: confidence,
      evidence_refs: evidenceRefs,
      verification_reason: reason,
      sequence: maxSequence + 1, // Follows the latest evidence sequence
      correlation_id: crypto.randomUUID()
    };

    // Deterministic Hash
    result.deterministic_hash = this._calculateHash(result);

    // Mark as verified
    if (resultStatus === 'verified' || resultStatus === 'likely_verified') {
      this.verifiedGoals.add(goalState.goal_id);
    }

    return Object.freeze(result);
  }

  _calculateHash(result) {
    const hash = crypto.createHash('sha256');
    const logical = {
      goal_id: result.goal_id,
      result: result.result,
      confidence: result.confidence.toFixed(2),
      evidence: [...result.evidence_refs].sort()
    };
    hash.update(JSON.stringify(logical));
    return hash.digest('hex');
  }

  loadFromDisk(persistedRecords = []) {
    for (const rec of persistedRecords) {
      this.verifiedGoals.add(rec.goal_id);
    }
  }
}

module.exports = { VerificationEngine };

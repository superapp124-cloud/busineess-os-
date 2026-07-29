export interface TrustEvidence {
  identityVerified: boolean;
  conformancePassed: boolean;
  securityScanPassed: boolean;
  maintainerVerified: boolean;
}

export interface TrustPolicy {
  name: string;
  evaluate(evidence: TrustEvidence): number;
}

export interface TrustEngine {
  /**
   * Calculates a trust score by mapping immutable facts (Evidence) against a configurable Policy.
   */
  calculateScore(evidence: TrustEvidence, policy: TrustPolicy): number;
}

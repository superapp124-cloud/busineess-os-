import { PackageIdentity } from '@chatr/intent-store';

export interface RankedCapability {
  identity: PackageIdentity;
  trustScore: number;
  compatibilityScore: number;
  rank: number;
}

export interface CapabilityMatcher {
  /**
   * Returns an ordered shortlist after pipeline:
   * Registry → Compatibility → Trust → Licensing → RBAC → Ranking.
   * The Planner receives a ranked shortlist — never raw candidates.
   */
  findAndRank(goals: string[], tenantId: string, userId: string, kernelVersion: string): Promise<RankedCapability[]>;
}

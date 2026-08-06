/**
 * CHATR Evidence Level Framework (E0 - E4) & CTO Readiness Scorecard
 * 
 * Level E0 — Concept (Architecture exists)
 * Level E1 — Specification (Interfaces frozen)
 * Level E2 — Prototype (Working single machine / simulated data)
 * Level E3 — Production (Real customers & live telemetry)
 * Level E4 — Proven (Independent 3rd party deployment)
 */

export type EvidenceLevel = 'E0' | 'E1' | 'E2' | 'E3' | 'E4';

export interface ProofEvidenceItem {
  id: string;
  industryTitle: string;
  badge: string;
  evidenceLevel: EvidenceLevel;
  levelLabel: string;
  measuredTelemetry: string;
}

export interface CTOReadinessScore {
  area: string;
  score: string;
  status: string;
}

export class EvidenceLevelService {
  private static instance: EvidenceLevelService;

  private proofs: ProofEvidenceItem[] = [
    {
      id: 'proof-staffing',
      industryTitle: 'Talent Services OS',
      badge: '🎯 Professional Services',
      evidenceLevel: 'E2',
      levelLabel: 'Level E2 — Working Prototype',
      measuredTelemetry: 'Live reactive state machine running on localhost:8086 with full persistence.'
    },
    {
      id: 'proof-hospital',
      industryTitle: 'Clinical Hospital OS',
      badge: '🏥 Healthcare OS',
      evidenceLevel: 'E1',
      levelLabel: 'Level E1 — Specification',
      measuredTelemetry: 'Universal domain mapping & schemas frozen in EXPERIENCE_GENERATOR_SPEC.md.'
    },
    {
      id: 'proof-factory',
      industryTitle: 'Automated Plant OS',
      badge: '🏭 Manufacturing OS',
      evidenceLevel: 'E1',
      levelLabel: 'Level E1 — Specification',
      measuredTelemetry: 'Production order state machines frozen in MISSION_PLANNER_SPEC.md.'
    },
    {
      id: 'proof-airport',
      industryTitle: 'Airport Operations OS',
      badge: '✈️ Aviation & Logistics',
      evidenceLevel: 'E0',
      levelLabel: 'Level E0 — Target Concept',
      measuredTelemetry: 'Architectural target for Benchmark 6 certification test.'
    }
  ];

  private ctoScores: CTOReadinessScore[] = [
    { area: 'Architectural Coherence', score: '10 / 10', status: 'Optimal' },
    { area: 'Kernel Governance', score: '10 / 10', status: 'Optimal' },
    { area: 'Extensibility', score: '10 / 10', status: 'Optimal' },
    { area: 'Long-term Vision', score: '10 / 10', status: 'Optimal' },
    { area: 'Engineering Readiness', score: '7 / 10', status: 'In Progress' },
    { area: 'Production Evidence', score: '3 / 10', status: 'Focus Track (Sprint Target)' },
    { area: 'Marketplace Readiness', score: '2 / 10', status: 'Future Horizon' },
    { area: 'SDK Maturity', score: '4 / 10', status: 'v1.0 Active' },
    { area: 'Experience Generation', score: '3 / 10', status: 'Spec Active' }
  ];

  private constructor() {}

  public static getInstance(): EvidenceLevelService {
    if (!EvidenceLevelService.instance) {
      EvidenceLevelService.instance = new EvidenceLevelService();
    }
    return EvidenceLevelService.instance;
  }

  public getEvidenceProofs(): ProofEvidenceItem[] {
    return this.proofs;
  }

  public getCTOScores(): CTOReadinessScore[] {
    return this.ctoScores;
  }
}

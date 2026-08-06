/**
 * CHATR Platform Maturity Matrix Service
 * 
 * Formal Maturity Model replacing binary claims with empirical engineering status:
 * Architecture • Prototype • Production • Proven
 */

export interface BenchmarkMaturityItem {
  id: string;
  name: string;
  architecture: boolean;
  prototype: boolean;
  production: boolean;
  proven: boolean;
  verificationCriteria: string;
}

export class MaturityMatrixService {
  private static instance: MaturityMatrixService;

  private benchmarks: BenchmarkMaturityItem[] = [
    {
      id: 'bm-kernel',
      name: 'Universal Substrate Kernel (Level 0)',
      architecture: true,
      prototype: true,
      production: true,
      proven: true,
      verificationCriteria: 'Frozen 11 Level 0 primitives & immutable evidence log running in live app.'
    },
    {
      id: 'bm-experience',
      name: 'Experience Generator (Auto-UI)',
      architecture: true,
      prototype: true,
      production: false,
      proven: false,
      verificationCriteria: 'Auto-generate Forms, Kanban, Timelines, & APIs directly from schema & policies.'
    },
    {
      id: 'bm-planner',
      name: 'Mission Planner Engine (DAG)',
      architecture: true,
      prototype: true,
      production: false,
      proven: false,
      verificationCriteria: 'Goal ➔ Mission DAG ➔ Capability Graph ➔ Receipts ➔ Learning end-to-end execution.'
    },
    {
      id: 'bm-sdk',
      name: 'Developer SDK v1.0',
      architecture: true,
      prototype: true,
      production: false,
      proven: false,
      verificationCriteria: 'External developer deploys Airport OS without modifying kernel files.'
    },
    {
      id: 'bm-packages',
      name: 'Composition Packages Engine',
      architecture: true,
      prototype: true,
      production: false,
      proven: false,
      verificationCriteria: 'Dynamic loading of Healthcare, Manufacturing, Government, & Staffing packs.'
    },
    {
      id: 'bm-backward-compat',
      name: 'Backward Compatibility Guarantee',
      architecture: true,
      prototype: true,
      production: false,
      proven: false,
      verificationCriteria: 'Kernel v1.2 upgrade leaves Healthcare Pack v1.0 100% operational.'
    },
    {
      id: 'bm-cold-start',
      name: 'Cold-Start Deployment (<5 Mins)',
      architecture: true,
      prototype: true,
      production: false,
      proven: false,
      verificationCriteria: 'Empty repository to deployed industry solution in under 5 minutes.'
    },
    {
      id: 'bm-marketplace',
      name: 'Package & Agent Marketplace',
      architecture: false,
      prototype: false,
      production: false,
      proven: false,
      verificationCriteria: 'Third-party monetization & distribution ecosystem.'
    }
  ];

  private constructor() {}

  public static getInstance(): MaturityMatrixService {
    if (!MaturityMatrixService.instance) {
      MaturityMatrixService.instance = new MaturityMatrixService();
    }
    return MaturityMatrixService.instance;
  }

  public getMaturityMatrix(): BenchmarkMaturityItem[] {
    return this.benchmarks;
  }
}

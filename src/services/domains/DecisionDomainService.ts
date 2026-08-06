/**
 * Decision Domain Service — Decisions as First-Class Objects
 * 
 * Every executive decision is stored with full history:
 * Owner ➔ Reason ➔ Evidence ➔ 3 Simulation Scenarios ➔ ROI ➔ Approved ➔ Outcome.
 * Enables questions like: "Why did we increase salaries in 2028?"
 */

export interface DecisionObject {
  decisionId: string;
  title: string;
  ownerName: string;
  ownerRole: string;
  reasoningContext: string;
  evidenceNodeIds: string[];
  simulationScenarios: {
    name: string;
    expectedROI: number;
    riskScore: number;
    trustScore: number;
  }[];
  policyCheck: {
    policyId: string;
    passed: boolean;
  };
  decisionStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  approvedTimestamp?: string;
  forceDeltaOutcome: {
    cashDelta: number;
    capacityDelta: number;
    riskDelta: number;
    trustDelta: number;
  };
  retrospectiveAuditNotes?: string;
}

export class DecisionDomainService {
  private static instance: DecisionDomainService;
  private decisions: Map<string, DecisionObject> = new Map();

  private constructor() {
    this.seedCanonicalDecisions();
  }

  public static getInstance(): DecisionDomainService {
    if (!DecisionDomainService.instance) {
      DecisionDomainService.instance = new DecisionDomainService();
    }
    return DecisionDomainService.instance;
  }

  private seedCanonicalDecisions(): void {
    this.decisions.set('dec-salary-2025', {
      decisionId: 'dec-salary-2025',
      title: 'Market Salary Adjustment for Senior Tech Staff (+12%)',
      ownerName: 'Arshid Wani',
      ownerRole: 'CEO / CTO',
      reasoningContext: 'Market compensation benchmark correction to reduce attrition risk on key client contracts.',
      evidenceNodeIds: ['attrition-report-q4', 'tcs-contract-8891', 'salary-benchmark-2025'],
      simulationScenarios: [
        { name: '12% Increase (Selected)', expectedROI: 2.40, riskScore: 0.08, trustScore: 0.95 },
        { name: '5% Increase (Low)', expectedROI: 1.10, riskScore: 0.28, trustScore: 0.82 },
        { name: 'No Change (Status Quo)', expectedROI: -0.80, riskScore: 0.45, trustScore: 0.70 }
      ],
      policyCheck: { policyId: 'POL-12 (Compensation Cap Guardrail)', passed: true },
      decisionStatus: 'APPROVED',
      approvedTimestamp: '2025-12-15T14:30:00Z',
      forceDeltaOutcome: {
        cashDelta: -120000,
        capacityDelta: 0.45,
        riskDelta: -0.25,
        trustDelta: 0.20
      },
      retrospectiveAuditNotes: 'Reduced developer turnover to zero in Q1; successfully renewed TCS contract for $480k.'
    });

    this.decisions.set('dec-overdue-collection', {
      decisionId: 'dec-overdue-collection',
      title: 'Execute Overdue Invoice Collection & Payment Plan (#INV-910)',
      ownerName: 'Arshid Wani',
      ownerRole: 'CEO / CTO',
      reasoningContext: 'Invoice #INV-910 ($120k) crossed 35-day payment grace period; automated collection escalation approved.',
      evidenceNodeIds: ['invoice-inv-910', 'tcs-org-001', 'timeline-evt-005'],
      simulationScenarios: [
        { name: 'Immediate Collection Notice', expectedROI: 2.85, riskScore: 0.12, trustScore: 0.92 },
        { name: '14-Day Deferral', expectedROI: 1.20, riskScore: 0.38, trustScore: 0.85 }
      ],
      policyCheck: { policyId: 'POL-104 (Credit Collection Policy)', passed: true },
      decisionStatus: 'APPROVED',
      approvedTimestamp: '2026-04-06T09:15:00Z',
      forceDeltaOutcome: {
        cashDelta: 120000,
        capacityDelta: 0.0,
        riskDelta: -0.08,
        trustDelta: 0.03
      }
    });
  }

  public getDecision(decisionId: string): DecisionObject | undefined {
    return this.decisions.get(decisionId);
  }

  public getAllDecisions(): DecisionObject[] {
    return Array.from(this.decisions.values());
  }
}

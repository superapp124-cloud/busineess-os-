/**
 * Universal Coordination Substrate (Level 0 - Level 5 Canonical Architecture)
 * 
 * LEVEL 0: Substrate Primitives (Node, Edge, Event, State, Capability, Policy, Memory, Agent)
 * LEVEL 1: Runtime Verbs (Observe, Predict, Decide, Execute, Learn)
 * LEVEL 2: Adaptive Intelligence (Simulation, Optimization, Explainability, Homeostasis)
 * LEVEL 3: Experience Generator (Question-Driven Surface)
 * LEVEL 4: Composition Packages (Healthcare, Manufacturing, Government, Aerospace, Staffing)
 * LEVEL 5: Generated Applications (EHR, ERP, CRM, ATS, MES, Fleet Management)
 */

export type SubstratePrimitiveType = 
  | 'Node' 
  | 'Edge' 
  | 'Event' 
  | 'State' 
  | 'Capability' 
  | 'Policy' 
  | 'Memory' 
  | 'Agent';

export interface SubstrateNode {
  id: string;
  kind: string; // 'Person' | 'Machine' | 'Invoice' | 'Satellite' | 'Patient'
  traits: Record<string, any>;
  state: {
    healthScore: number;
    statusLabel: string;
    forceVector: {
      cash: number;
      capacity: number;
      risk: number;
      trust: number;
    };
  };
  capabilities: string[];
  policies: string[];
  memory: string[];
}

export interface SubstrateEvent {
  eventId: string;
  timestamp: string;
  sourceNodeId: string;
  actionVerb: string;
  deltaVector: Record<string, number>;
}

export class UniversalCoordinationSubstrate {
  private static instance: UniversalCoordinationSubstrate;
  private nodes: Map<string, SubstrateNode> = new Map();
  private events: SubstrateEvent[] = [];

  private constructor() {
    this.seedCanonicalPrimitives();
  }

  public static getInstance(): UniversalCoordinationSubstrate {
    if (!UniversalCoordinationSubstrate.instance) {
      UniversalCoordinationSubstrate.instance = new UniversalCoordinationSubstrate();
    }
    return UniversalCoordinationSubstrate.instance;
  }

  private seedCanonicalPrimitives(): void {
    // Structural identity for Doctor, Invoice, Machine, Satellite
    this.nodes.set('node-001', {
      id: 'node-001',
      kind: 'Organization',
      traits: { name: 'TCS Operations', segment: 'Enterprise' },
      state: {
        healthScore: 94.8,
        statusLabel: 'Optimal',
        forceVector: { cash: 248000, capacity: 0.35, risk: -0.14, trust: 0.98 }
      },
      capabilities: ['ExecuteSettlement', 'DeployResource'],
      policies: ['POL-12 (Conservation)'],
      memory: ['evt-001', 'evt-004']
    });

    this.nodes.set('node-002', {
      id: 'node-002',
      kind: 'Specialist',
      traits: { name: 'Arjun Sharma', expertise: 'Senior Systems' },
      state: {
        healthScore: 96.0,
        statusLabel: 'Deployed',
        forceVector: { cash: -45000, capacity: 0.40, risk: -0.05, trust: 0.96 }
      },
      capabilities: ['ExecuteSprint', 'ReviewQuality'],
      policies: ['POL-104 (Capacity Guardrail)'],
      memory: ['evt-002']
    });

    this.events = [
      { eventId: 'evt-101', timestamp: new Date(Date.now() - 3600000).toISOString(), sourceNodeId: 'node-001', actionVerb: 'OBSERVED_STATE_CHANGE', deltaVector: { cash: 120000 } },
      { eventId: 'evt-102', timestamp: new Date().toISOString(), sourceNodeId: 'node-002', actionVerb: 'EXECUTION_MUTATED', deltaVector: { capacity: 0.35 } }
    ];
  }

  // Level 1 Runtime Verbs
  public observe(): SubstrateEvent[] {
    return this.events;
  }

  public predict(): { horizon: string; expectedImpact: string; confidence: number }[] {
    return [
      { horizon: '30 Days', expectedImpact: '+$45,000 Cash Flow • -0.05 Risk', confidence: 0.94 },
      { horizon: '60 Days', expectedImpact: '+$95,000 Cash Flow • +0.12 Trust', confidence: 0.91 }
    ];
  }

  public decide(): { decisionId: string; verb: string; impact: string }[] {
    return [
      { decisionId: 'dec-101', verb: 'Approve Commercial Settlement', impact: '+$120,000 Cash Buffer' },
      { decisionId: 'dec-102', verb: 'Approve Specialist Onboarding', impact: '+0.35 Capacity Index' }
    ];
  }

  public execute(decisionId: string): void {
    const newEvt: SubstrateEvent = {
      eventId: `evt_${Date.now()}`,
      timestamp: new Date().toISOString(),
      sourceNodeId: 'node-001',
      actionVerb: 'EXECUTE_VERB_MUTATION',
      deltaVector: { cash: 45000 }
    };
    this.events.push(newEvt);
  }

  public learn(): { policyUpdate: string; confidenceGain: number } {
    return {
      policyUpdate: 'Updated POL-12 Homeostasis Guardrail',
      confidenceGain: 0.03
    };
  }

  public getAllNodes(): SubstrateNode[] {
    return Array.from(this.nodes.values());
  }
}

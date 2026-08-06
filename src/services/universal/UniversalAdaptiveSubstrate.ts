/**
 * Universal Adaptive Substrate (3-Layer Architecture)
 * 
 * LAYER 1: Universal Adaptive Graph (19 Universal Nodes)
 * LAYER 2: Universal Engines (8 Core Engines)
 * LAYER 3: Adaptive Enterprise Lenses & Configuration Packs
 */

export type UniversalNodeType = 
  | 'People' 
  | 'Organizations' 
  | 'Assets' 
  | 'Locations' 
  | 'Resources' 
  | 'Work' 
  | 'Processes' 
  | 'Products' 
  | 'Services' 
  | 'Knowledge' 
  | 'Communications' 
  | 'Decisions' 
  | 'Goals' 
  | 'Events' 
  | 'Policies' 
  | 'Capabilities' 
  | 'Automations' 
  | 'AIAgents' 
  | 'ExternalSystems';

export type EnterpriseLensType = 
  | 'Mission' 
  | 'Execution' 
  | 'Resource' 
  | 'Financial' 
  | 'Risk' 
  | 'Knowledge' 
  | 'Automation' 
  | 'Timeline';

export interface UniversalNodeEntity {
  id: string;
  type: UniversalNodeType;
  title: string;
  domainContext: string;
  state: string;
  forceVector: {
    cash: number;
    capacity: number;
    risk: number;
    trust: number;
  };
}

export class UniversalAdaptiveSubstrate {
  private static instance: UniversalAdaptiveSubstrate;
  private nodes: Map<string, UniversalNodeEntity> = new Map();
  private activeLens: EnterpriseLensType = 'Mission';

  private constructor() {
    this.seedUniversalNodes();
  }

  public static getInstance(): UniversalAdaptiveSubstrate {
    if (!UniversalAdaptiveSubstrate.instance) {
      UniversalAdaptiveSubstrate.instance = new UniversalAdaptiveSubstrate();
    }
    return UniversalAdaptiveSubstrate.instance;
  }

  private seedUniversalNodes(): void {
    const defaultNodes: UniversalNodeEntity[] = [
      { id: 'node-goal-01', type: 'Goals', title: 'Optimize Operational Velocity & Risk Margin', domainContext: 'Enterprise Strategy', state: 'ON_TRACK', forceVector: { cash: 248000, capacity: 0.09, risk: -0.14, trust: 0.96 } },
      { id: 'node-dec-01', type: 'Decisions', title: 'Priority Commercial Settlement (#SETTLE-910)', domainContext: 'Decision Engine', state: 'PENDING_APPROVAL', forceVector: { cash: 120000, capacity: 0.0, risk: -0.08, trust: 0.98 } },
      { id: 'node-work-01', type: 'Work', title: 'Operational Milestone Unit #402', domainContext: 'Execution Engine', state: 'IN_PROGRESS', forceVector: { cash: -45000, capacity: 0.35, risk: -0.05, trust: 0.94 } },
      { id: 'node-res-01', type: 'Resources', title: 'Specialist Deployment Pool Alpha', domainContext: 'Resource Substrate', state: 'ALLOCATED', forceVector: { cash: 0, capacity: 0.40, risk: 0.0, trust: 0.95 } },
      { id: 'node-know-01', type: 'Knowledge', title: 'Universal Operations Specification v1.0', domainContext: 'Memory Engine', state: 'VERIFIED', forceVector: { cash: 0, capacity: 0.0, risk: 0.0, trust: 0.99 } }
    ];

    defaultNodes.forEach(n => this.nodes.set(n.id, n));
  }

  public setLens(lens: EnterpriseLensType): void {
    this.activeLens = lens;
  }

  public getActiveLens(): EnterpriseLensType {
    return this.activeLens;
  }

  public getNodesByType(type: UniversalNodeType): UniversalNodeEntity[] {
    return Array.from(this.nodes.values()).filter(n => n.type === type);
  }

  public getAllNodes(): UniversalNodeEntity[] {
    return Array.from(this.nodes.values());
  }
}

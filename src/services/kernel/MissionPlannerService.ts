/**
 * Mission Planner & Level 2 Coordination Service
 * 
 * Capability = Atomic Action
 * Workflow = Ordered Capabilities
 * Mission = Goal-Oriented Execution Plan
 */

export interface CapabilityItem {
  id: string;
  name: string;
  domain: string;
}

export interface WorkflowItem {
  id: string;
  name: string;
  capabilities: CapabilityItem[];
}

export interface MissionPlan {
  missionId: string;
  title: string;
  goal: string;
  workflows: WorkflowItem[];
  status: 'PLANNED' | 'EXECUTING' | 'COMPLETED';
}

export class MissionPlannerService {
  private static instance: MissionPlannerService;
  private missions: Map<string, MissionPlan> = new Map();

  private constructor() {
    this.seedCanonicalMissions();
  }

  public static getInstance(): MissionPlannerService {
    if (!MissionPlannerService.instance) {
      MissionPlannerService.instance = new MissionPlannerService();
    }
    return MissionPlannerService.instance;
  }

  private seedCanonicalMissions(): void {
    this.missions.set('mission-factory-01', {
      missionId: 'mission-factory-01',
      title: 'Deploy New Automated Production Unit',
      goal: 'Expand manufacturing throughput by +24% with zero policy breaches',
      workflows: [
        {
          id: 'wf-procure',
          name: 'Procure High-Precision Machinery',
          capabilities: [
            { id: 'cap-buy', name: 'Approve Equipment Purchase', domain: 'Procurement' },
            { id: 'cap-inspect', name: 'Schedule Quality Inspection', domain: 'Quality' }
          ]
        },
        {
          id: 'wf-staff',
          name: 'Onboard Technical Specialists',
          capabilities: [
            { id: 'cap-contract', name: 'Issue Specialist Contract', domain: 'People' },
            { id: 'cap-budget', name: 'Allocate Operational Budget', domain: 'Finance' }
          ]
        }
      ],
      status: 'EXECUTING'
    });
  }

  public getMission(missionId: string): MissionPlan | undefined {
    return this.missions.get(missionId);
  }

  public getAllMissions(): MissionPlan[] {
    return Array.from(this.missions.values());
  }
}

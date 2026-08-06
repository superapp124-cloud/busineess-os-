/**
 * People Domain Service — Single Entity Life Story
 * 
 * Manages the canonical single identity lifecycle for every person:
 * Candidate ➔ Employee ➔ Consultant Deployment ➔ Bench ➔ Alumni ➔ Rehire.
 * Zero fragment duplication across ATS, HRMS, and CRM.
 */

export interface PersonLifeStory {
  personId: string;
  fullName: string;
  email: string;
  canonicalRole: 'Candidate' | 'Employee' | 'Consultant' | 'Alumni';
  currentStatus: 'DEPLOYED' | 'INTERVIEWING' | 'ON_BENCH' | 'ALUMNI';
  historyTimeline: {
    timestamp: string;
    stage: string;
    details: string;
    associatedEntityId?: string;
  }[];
  skills: string[];
  currentAssignment?: {
    clientName: string;
    projectName: string;
    billRate: number;
    startDate: string;
  };
  forceVector: {
    cashContribution: number;
    capacityValue: number;
    trustScore: number;
  };
}

export class PeopleDomainService {
  private static instance: PeopleDomainService;
  private peopleMap: Map<string, PersonLifeStory> = new Map();

  private constructor() {
    this.seedCanonicalPeople();
  }

  public static getInstance(): PeopleDomainService {
    if (!PeopleDomainService.instance) {
      PeopleDomainService.instance = new PeopleDomainService();
    }
    return PeopleDomainService.instance;
  }

  private seedCanonicalPeople(): void {
    this.peopleMap.set('person-arjun-01', {
      personId: 'person-arjun-01',
      fullName: 'Arjun Sharma',
      email: 'arjun.sharma@domain.com',
      canonicalRole: 'Consultant',
      currentStatus: 'DEPLOYED',
      historyTimeline: [
        { timestamp: '2025-11-10T10:00:00Z', stage: 'Candidate Applied', details: 'Sourced via Referral for Senior Java Role' },
        { timestamp: '2025-11-15T14:00:00Z', stage: 'Interview Cleared', details: 'AI Technical Score: 94%' },
        { timestamp: '2025-12-01T09:00:00Z', stage: 'Offer Accepted & Joined', details: 'Joined as Senior Consultant' },
        { timestamp: '2026-02-01T09:00:00Z', stage: 'Deployed to TCS', details: 'Deployed under Java Team Apollo', associatedEntityId: 'tcs-org-001' }
      ],
      skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Kubernetes'],
      currentAssignment: {
        clientName: 'TCS Ltd',
        projectName: 'Java Team Apollo',
        billRate: 85,
        startDate: '2026-02-01'
      },
      forceVector: {
        cashContribution: 14400, // monthly billable
        capacityValue: 0.35,
        trustScore: 0.96
      }
    });

    this.peopleMap.set('person-priya-02', {
      personId: 'person-priya-02',
      fullName: 'Priya Verma',
      email: 'priya.verma@domain.com',
      canonicalRole: 'Candidate',
      currentStatus: 'INTERVIEWING',
      historyTimeline: [
        { timestamp: '2026-01-20T11:30:00Z', stage: 'Candidate Sourced', details: 'Sourced for Lead React Architect' },
        { timestamp: '2026-02-02T16:00:00Z', stage: 'Technical Assessment', details: 'Score: 98%' }
      ],
      skills: ['React', 'TypeScript', 'Node.js', 'System Design'],
      forceVector: {
        cashContribution: 0,
        capacityValue: 0.40,
        trustScore: 0.92
      }
    });
  }

  public getPersonLifeStory(personId: string): PersonLifeStory | undefined {
    return this.peopleMap.get(personId);
  }

  public getAllPeople(): PersonLifeStory[] {
    return Array.from(this.peopleMap.values());
  }
}

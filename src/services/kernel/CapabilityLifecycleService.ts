/**
 * CHATR Capability Operational Lifecycle Service
 * 
 * Formal Operational Lifecycle:
 * Registered ➔ Validated ➔ Compiled ➔ Loaded ➔ Activated ➔ Executing ➔ Suspended ➔ Completed ➔ Archived
 */

export type CapabilityState = 
  | 'Registered' 
  | 'Validated' 
  | 'Compiled' 
  | 'Loaded' 
  | 'Activated' 
  | 'Executing' 
  | 'Suspended' 
  | 'Completed' 
  | 'Archived';

export interface CapabilityInstance {
  capabilityId: string;
  name: string;
  tenantId: string;
  currentState: CapabilityState;
  stateHistory: { state: CapabilityState; timestamp: string }[];
}

export class CapabilityLifecycleService {
  private static instance: CapabilityLifecycleService;
  private instances: Map<string, CapabilityInstance> = new Map();

  private constructor() {
    this.seedCanonicalInstances();
  }

  public static getInstance(): CapabilityLifecycleService {
    if (!CapabilityLifecycleService.instance) {
      CapabilityLifecycleService.instance = new CapabilityLifecycleService();
    }
    return CapabilityLifecycleService.instance;
  }

  private seedCanonicalInstances(): void {
    const timestamp = new Date().toISOString();
    this.instances.set('cap-settle-01', {
      capabilityId: 'cap-settle-01',
      name: 'Capability.ExecuteCommercialSettlement',
      tenantId: 'tenant-tcs-001',
      currentState: 'Activated',
      stateHistory: [
        { state: 'Registered', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { state: 'Validated', timestamp: new Date(Date.now() - 2700000).toISOString() },
        { state: 'Compiled', timestamp: new Date(Date.now() - 1800000).toISOString() },
        { state: 'Loaded', timestamp: new Date(Date.now() - 900000).toISOString() },
        { state: 'Activated', timestamp }
      ]
    });
  }

  public transitionState(capabilityId: string, targetState: CapabilityState): CapabilityInstance | undefined {
    const inst = this.instances.get(capabilityId);
    if (!inst) return undefined;

    inst.currentState = targetState;
    inst.stateHistory.push({ state: targetState, timestamp: new Date().toISOString() });
    return inst;
  }

  public getInstances(): CapabilityInstance[] {
    return Array.from(this.instances.values());
  }
}

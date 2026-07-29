import { ICapabilityManifest } from '../types';
import { CapabilityRegistry } from './CapabilityRegistry';

export type CapabilityState = 
  | 'Installing' 
  | 'Provisioning' 
  | 'Healthy' 
  | 'Updating' 
  | 'Paused' 
  | 'Degraded' 
  | 'Disabled' 
  | 'Failed' 
  | 'Uninstalling';

export interface ICapabilityStatus {
  id: string;
  state: CapabilityState;
  version: string;
  uptime: number; // seconds
  lastError?: string;
  metrics: {
    cpuTime: number;
    aiCalls: number;
    errors: number;
    averageResponseTime: number;
  };
}

export class CapabilityRuntimeManager {
  private static statuses = new Map<string, ICapabilityStatus>();

  static getStatus(capabilityId: string): ICapabilityStatus | undefined {
    return this.statuses.get(capabilityId);
  }

  static getAllStatuses(): ICapabilityStatus[] {
    return Array.from(this.statuses.values());
  }

  static async install(manifest: ICapabilityManifest): Promise<void> {
    this.updateState(manifest.id, 'Installing', manifest.version);
    
    try {
      // 1. Validate manifest contract
      CapabilityRegistry.register(manifest);
      
      this.updateState(manifest.id, 'Provisioning');
      
      // 2. Mock provisioning step (tables, permissions, etc.)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 3. Mark healthy
      this.updateState(manifest.id, 'Healthy');
    } catch (e: any) {
      this.updateState(manifest.id, 'Failed', manifest.version, e.message);
      throw e;
    }
  }

  static async start(capabilityId: string): Promise<void> {
    const status = this.statuses.get(capabilityId);
    if (!status) throw new Error(`Capability ${capabilityId} not found`);
    if (status.state === 'Healthy') return;
    this.updateState(capabilityId, 'Healthy');
  }

  static async pause(capabilityId: string): Promise<void> {
    const status = this.statuses.get(capabilityId);
    if (!status) throw new Error(`Capability ${capabilityId} not found`);
    this.updateState(capabilityId, 'Paused');
  }

  static async resume(capabilityId: string): Promise<void> {
    await this.start(capabilityId);
  }

  static async disable(capabilityId: string): Promise<void> {
    this.updateState(capabilityId, 'Disabled');
  }

  static async uninstall(capabilityId: string): Promise<void> {
    this.updateState(capabilityId, 'Uninstalling');
    await new Promise(resolve => setTimeout(resolve, 500));
    this.statuses.delete(capabilityId);
    CapabilityRegistry.unregister(capabilityId);
  }

  static reportError(capabilityId: string, error: string): void {
    const status = this.statuses.get(capabilityId);
    if (status) {
      status.state = 'Degraded';
      status.lastError = error;
      status.metrics.errors++;
    }
  }

  static recordMetric(capabilityId: string, type: 'aiCalls' | 'cpuTime' | 'responseTime', value: number): void {
    const status = this.statuses.get(capabilityId);
    if (status) {
      if (type === 'aiCalls') status.metrics.aiCalls += value;
      if (type === 'cpuTime') status.metrics.cpuTime += value;
      if (type === 'responseTime') {
        const current = status.metrics.averageResponseTime;
        status.metrics.averageResponseTime = current === 0 ? value : (current + value) / 2;
      }
    }
  }

  private static updateState(id: string, state: CapabilityState, version: string = '1.0.0', error?: string) {
    const existing = this.statuses.get(id);
    if (existing) {
      existing.state = state;
      if (error) existing.lastError = error;
    } else {
      this.statuses.set(id, {
        id,
        state,
        version,
        uptime: 0,
        lastError: error,
        metrics: { cpuTime: 0, aiCalls: 0, errors: 0, averageResponseTime: 0 }
      });
    }
  }
}

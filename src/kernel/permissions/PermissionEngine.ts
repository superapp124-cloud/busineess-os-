/**
 * CHATR Permission Engine
 * Central security authorization engine governing capabilities (files, camera, browser, email, health records).
 */

export type ProtectedResource = 'file_system' | 'camera' | 'microphone' | 'browser' | 'email' | 'calendar' | 'health_records';

export type PermissionAccessLevel = 'denied' | 'prompt' | 'granted';

export interface PermissionPolicy {
  resource: ProtectedResource;
  accessLevel: PermissionAccessLevel;
  grantedToRuntimes: string[];
}

class PermissionEngineService {
  private policies: Map<ProtectedResource, PermissionPolicy> = new Map([
    ['file_system', { resource: 'file_system', accessLevel: 'granted', grantedToRuntimes: ['runtime-intelligence'] }],
    ['camera', { resource: 'camera', accessLevel: 'prompt', grantedToRuntimes: [] }],
    ['microphone', { resource: 'microphone', accessLevel: 'prompt', grantedToRuntimes: [] }],
    ['browser', { resource: 'browser', accessLevel: 'granted', grantedToRuntimes: ['runtime-automation'] }],
    ['email', { resource: 'email', accessLevel: 'granted', grantedToRuntimes: ['runtime-communication'] }],
    ['calendar', { resource: 'calendar', accessLevel: 'granted', grantedToRuntimes: ['runtime-communication'] }],
    ['health_records', { resource: 'health_records', accessLevel: 'granted', grantedToRuntimes: ['runtime-intelligence'] }],
  ]);

  /**
   * Check if a runtime has permission to access a protected resource
   */
  public checkPermission(runtimeId: string, resource: ProtectedResource): boolean {
    const policy = this.policies.get(resource);
    if (!policy) return false;

    if (policy.accessLevel === 'denied') return false;
    if (policy.accessLevel === 'granted') {
      return policy.grantedToRuntimes.includes(runtimeId) || policy.grantedToRuntimes.length === 0;
    }
    return true;
  }

  /**
   * Grant permission to a runtime for a protected resource
   */
  public grantPermission(runtimeId: string, resource: ProtectedResource): void {
    const policy = this.policies.get(resource);
    if (policy) {
      if (!policy.grantedToRuntimes.includes(runtimeId)) {
        policy.grantedToRuntimes.push(runtimeId);
      }
      policy.accessLevel = 'granted';
      console.log(`[PermissionEngine] Granted permission '${resource}' to runtime '${runtimeId}'`);
    }
  }
}

export const PermissionEngine = new PermissionEngineService();

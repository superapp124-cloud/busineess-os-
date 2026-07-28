export class IntentPermissionManager {
  private grantedPermissions: Set<string> = new Set();

  /**
   * Check if a module has a specific permission.
   */
  can(moduleId: string, permissionName: string): boolean {
    const key = `${moduleId}:${permissionName}`;
    // In a real implementation, this would check a user_capability_permissions table in Supabase.
    // For now, we simulate an in-memory grant store.
    return this.grantedPermissions.has(key);
  }

  /**
   * Request permissions for a module.
   * This would typically trigger a UI consent flow for the user.
   */
  async request(moduleId: string, permissionNames: string[]): Promise<boolean> {
    console.log(`[PermissionManager] Capability '${moduleId}' is requesting permissions:`, permissionNames);
    
    // Simulate user consent (auto-grant for now in v1)
    permissionNames.forEach(p => {
      this.grantedPermissions.add(`${moduleId}:${p}`);
    });

    return true;
  }

  /**
   * Revoke a permission from a module.
   */
  async revoke(moduleId: string, permissionName: string): Promise<void> {
    const key = `${moduleId}:${permissionName}`;
    this.grantedPermissions.delete(key);
    console.log(`[PermissionManager] Revoked '${permissionName}' from '${moduleId}'`);
  }
}

export const permissionManager = new IntentPermissionManager();

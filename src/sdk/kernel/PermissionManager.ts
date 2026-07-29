export class PermissionManager {
  private static userRoles = new Set<string>();

  static setUserRoles(roles: string[]) {
    this.userRoles = new Set(roles);
  }

  static hasRole(role: string): boolean {
    if (this.userRoles.has('admin')) return true; // Admins have all roles
    return this.userRoles.has(role);
  }

  static can(action: 'view' | 'create' | 'edit' | 'delete', capabilityId: string): boolean {
    // In a real app, this would check against the ICapabilityManifest's IPermissionMatrix
    // and the user's roles. For now, if they are admin, let them do anything.
    if (this.userRoles.has('admin')) return true;
    
    // Default fallback
    return true; 
  }
}

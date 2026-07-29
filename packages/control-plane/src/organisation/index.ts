export interface Organisation { id: string; name: string; }
export interface OrganisationManager {
  create(name: string): Promise<Organisation>;
  get(id: string): Promise<Organisation | null>;
  delete(id: string): Promise<void>;
}

export interface Tenant { id: string; organisationId: string; name: string; }
export interface TenantManager {
  create(organisationId: string, name: string): Promise<Tenant>;
  get(id: string): Promise<Tenant | null>;
  listByOrg(organisationId: string): Promise<Tenant[]>;
}

export interface Team { id: string; tenantId: string; name: string; }
export interface TeamManager {
  create(tenantId: string, name: string): Promise<Team>;
  get(id: string): Promise<Team | null>;
}

export interface MembershipService {
  addMember(teamId: string, userId: string): Promise<void>;
  removeMember(teamId: string, userId: string): Promise<void>;
  listMembers(teamId: string): Promise<string[]>;
}

export interface IdentityProvider {
  authenticate(token: string): Promise<{ userId: string; claims: Record<string, string> } | null>;
  federateExternalIdentity(provider: string, externalToken: string): Promise<string>;
}

export interface Role { id: string; name: string; permissions: Permission[]; }
export interface Permission { resource: string; action: string; }
export interface RoleManager {
  createRole(name: string, permissions: Permission[]): Promise<Role>;
  assignRole(userId: string, roleId: string): Promise<void>;
  revokeRole(userId: string, roleId: string): Promise<void>;
  getRoles(userId: string): Promise<Role[]>;
}

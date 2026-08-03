import { openTelemetryExporter } from '../telemetry/OpenTelemetryExporter';

export type IdentityType = 'PERSON' | 'DIGITAL_WORKER' | 'TEAM' | 'DEPARTMENT' | 'VENDOR' | 'SERVICE_ACCOUNT' | 'DEVICE';

export interface EnterpriseIdentity {
  id: string;
  type: IdentityType;
  name: string;
  email?: string;
  tenantId: string;
  department?: string;
  roles: string[];
  permissions: string[];
  clearanceLevel: 'Standard' | 'Confidential' | 'Restricted' | 'TopSecret';
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  metadata?: Record<string, any>;
}

/**
 * Subsystem 29: Enterprise Identity Runtime Engine
 * Centralizes authentication, identity binding, organization hierarchy,
 * and privilege resolution across People, Teams, Digital Workers, Vendors, Devices, and Service Accounts.
 */
export class IdentityRuntime {
  private static instance: IdentityRuntime;
  private identities = new Map<string, EnterpriseIdentity>();

  private constructor() {
    this.seedCanonicalIdentities();
  }

  public static getInstance(): IdentityRuntime {
    if (!IdentityRuntime.instance) {
      IdentityRuntime.instance = new IdentityRuntime();
    }
    return IdentityRuntime.instance;
  }

  private seedCanonicalIdentities() {
    this.registerIdentity({
      id: 'id_user_arshid',
      type: 'PERSON',
      name: 'Arshid Hussain Wani',
      email: 'arshid.wani@chatr.enterprise',
      tenantId: 'tenant_global_corp',
      department: 'Executive Operations',
      roles: ['PlatformAdmin', 'ExecutiveApprover'],
      permissions: ['*'],
      clearanceLevel: 'TopSecret',
      status: 'ACTIVE',
    });

    this.registerIdentity({
      id: 'id_worker_recruiter',
      type: 'DIGITAL_WORKER',
      name: 'Recruiter Persona Agent',
      tenantId: 'tenant_global_corp',
      department: 'Human Resources',
      roles: ['RecruitmentSpecialist'],
      permissions: ['hr:candidate:read', 'hr:candidate:write'],
      clearanceLevel: 'Confidential',
      status: 'ACTIVE',
    });

    this.registerIdentity({
      id: 'id_sa_sap_connector',
      type: 'SERVICE_ACCOUNT',
      name: 'SAP ERP Integration Service Account',
      tenantId: 'tenant_global_corp',
      department: 'Finance IT',
      roles: ['ERPIntegrationService'],
      permissions: ['sap:invoice:write', 'sap:po:read'],
      clearanceLevel: 'Restricted',
      status: 'ACTIVE',
    });
  }

  public registerIdentity(identity: EnterpriseIdentity): void {
    this.identities.set(identity.id, identity);
  }

  public getIdentity(id: string): EnterpriseIdentity | undefined {
    return this.identities.get(id);
  }

  public getAllIdentities(): EnterpriseIdentity[] {
    return Array.from(this.identities.values());
  }

  public getIdentitiesByType(type: IdentityType): EnterpriseIdentity[] {
    return this.getAllIdentities().filter(i => i.type === type);
  }

  public validatePermission(identityId: string, requiredPermission: string): boolean {
    const span = openTelemetryExporter.startSpan('IdentityRuntime.ValidatePermission', undefined, { identityId, requiredPermission });

    const identity = this.identities.get(identityId);
    if (!identity || identity.status !== 'ACTIVE') {
      openTelemetryExporter.endSpan(span.spanId, 'ERROR');
      return false;
    }

    const hasAccess = identity.permissions.includes('*') || identity.permissions.includes(requiredPermission);

    openTelemetryExporter.log('INFO', `Identity Permission Verification: ${identityId} -> ${requiredPermission} [${hasAccess ? 'ALLOWED' : 'DENIED'}]`, {
      traceId: span.traceId,
      spanId: span.spanId,
      attributes: { identity, requiredPermission, hasAccess },
    });

    openTelemetryExporter.endSpan(span.spanId, 'OK');
    return hasAccess;
  }
}

export const identityRuntime = IdentityRuntime.getInstance();

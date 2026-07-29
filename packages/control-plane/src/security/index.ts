import { Permission } from '../organisation/index';

export interface RbacService {
  /** Identity → Role → Permission → Resource → Action */
  can(userId: string, action: string, resource: string): Promise<boolean>;
  listPermissions(userId: string): Promise<Permission[]>;
}

export interface EnterpriseSecretStore {
  getSecret(tenantId: string, key: string): Promise<string | null>;
  setSecret(tenantId: string, key: string, value: string): Promise<void>;
  rotateSecret(tenantId: string, key: string): Promise<void>;
}

export interface CertificateLifecycle {
  issueCertificate(tenantId: string): Promise<{ id: string; expiresAt: string }>;
  rotateKey(tenantId: string, certId: string): Promise<{ id: string }>;
  revokeCertificate(certId: string): Promise<void>;
}

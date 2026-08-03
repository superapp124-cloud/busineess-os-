import { describe, it, expect, beforeEach } from 'vitest';
import { securityManager } from '../SecurityManager';

describe('Subsystem 7: Enterprise Security & Zero-Trust Governance', () => {
  beforeEach(() => {
    securityManager.initSession('user_admin_01', 'tenant_enterprise');
  });

  it('Test-SEC-1: AES-256-GCM Web Crypto Credential Vault', async () => {
    const credentialKey = 'sap_api_secret_2026';
    const rawSecret = 'SUPER_SECRET_SAP_OAUTH_TOKEN_9918273';

    await securityManager.storeCredential(credentialKey, rawSecret);
    const retrieved = await securityManager.getCredential(credentialKey);

    expect(retrieved).toBe(rawSecret);
  });

  it('Test-SEC-2: Attribute-Based Access Control (ABAC) Enforcement', () => {
    const allowed = securityManager.evaluateABAC('EXECUTE_ERP_PAYMENT', {
      actorRole: 'Manager',
      tenantId: 'tenant_enterprise',
      classificationLevel: 'CONFIDENTIAL',
    });

    expect(allowed.allowed).toBe(true);

    const denied = securityManager.evaluateABAC('EXECUTE_ERP_PAYMENT', {
      actorRole: 'User', // Insufficient role
      tenantId: 'tenant_enterprise',
      classificationLevel: 'CONFIDENTIAL',
    });

    expect(denied.allowed).toBe(false);
    expect(denied.reason).toContain('does not meet minimum Manager');
  });

  it('Test-SEC-3: Secret Redaction Engine', () => {
    const payload = {
      username: 'rajesh_kumar',
      apiKey: 'sk-prod-991823719823',
      nested: {
        authorization: 'Bearer secret_token_xyz',
      },
    };

    const redacted = securityManager.redactSecrets(payload);
    expect(redacted.apiKey).toBe('[REDACTED_SECRET]');
    expect(redacted.nested.authorization).toBe('[REDACTED_SECRET]');
    expect(redacted.username).toBe('rajesh_kumar');
  });

  it('Test-SEC-4: Cryptographic SHA-256 Audit Log Hash Seals', () => {
    securityManager.audit('user_admin', 'DELETE_RECORD', 'contract_88', 'allowed');
    const logs = securityManager.getAuditLog();
    const lastEntry: any = logs[logs.length - 1];

    expect(lastEntry).toBeDefined();
    expect(lastEntry.hashSeal).toContain('sha256:');
  });
});

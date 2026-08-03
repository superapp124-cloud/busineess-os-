import { describe, it, expect, beforeEach } from 'vitest';
import { IntegrationRuntime } from '../IntegrationRuntime';

describe('Subsystem 6: Integration Runtime & Connector Security', () => {
  let runtime: IntegrationRuntime;

  beforeEach(() => {
    runtime = IntegrationRuntime.getInstance();
  });

  it('Test-IR-1: OAuth2 Token Auto-Refresh Lifecycle', async () => {
    const conn = runtime.getConnector('conn_sap_erp');
    expect(conn).toBeDefined();

    // Expire token manually
    if (conn?.oauthConfig) {
      conn.oauthConfig.expiresAt = Date.now() - 1000;
    }

    const token = await runtime.ensureValidToken('conn_sap_erp');
    expect(token).toContain('token_refreshed_');
    expect(conn?.oauthConfig?.expiresAt).toBeGreaterThan(Date.now());
  });

  it('Test-IR-2: Circuit Breaker Tripping on Consecutive Failures', async () => {
    const testConnectorId = 'conn_test_failing';
    runtime.registerConnector({
      id: testConnectorId,
      name: 'Failing Test Connector',
      category: 'CRM',
      version: 'v1.0',
      status: 'Healthy',
      permissions: ['read_crm'],
      failureThreshold: 2,
    });

    const failingCall = async () => {
      throw new Error('Remote API 500 Server Error');
    };

    // 1st Failure -> Degraded
    await expect(runtime.executeConnectorCall(testConnectorId, failingCall)).rejects.toThrow();
    expect(runtime.getConnector(testConnectorId)?.status).toBe('Degraded');

    // 2nd Failure -> Circuit Breaker OPEN (Offline)
    await expect(runtime.executeConnectorCall(testConnectorId, failingCall)).rejects.toThrow();
    expect(runtime.getConnector(testConnectorId)?.status).toBe('Offline');

    // Subsequent call fails fast at Circuit Breaker level
    await expect(runtime.executeConnectorCall(testConnectorId, async () => 'ok')).rejects.toThrow(
      'Circuit Breaker OPEN'
    );
  });

  it('Test-IR-3: Capability Permission Manifest Validator', () => {
    const required = ['read_po', 'write_invoice'];
    const granted = ['read_po', 'write_invoice', 'erp_sync'];
    const insufficient = ['read_po'];

    expect(runtime.validatePermissions(required, granted)).toBe(true);
    expect(runtime.validatePermissions(required, insufficient)).toBe(false);
  });
});

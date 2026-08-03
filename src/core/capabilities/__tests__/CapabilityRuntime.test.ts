import { describe, it, expect, beforeEach } from 'vitest';
import { CapabilityRuntime, ICapability, SchemaValidationError, CircuitOpenError } from '../CapabilityRuntime';

describe('Subsystem 9: Capability Runtime & ARB Production Contracts (REQ-CAP-006 to REQ-CAP-010)', () => {
  let runtime: CapabilityRuntime;

  beforeEach(() => {
    runtime = new CapabilityRuntime();

    const sampleCap: ICapability = {
      manifest: {
        id: 'cap_invoice_ocr',
        name: 'Invoice OCR Parser',
        version: '2.1.0',
        publisher: 'CHATR Enterprise',
        description: 'Parses PDF invoice to json',
        requiredScopes: ['doc:read', 'ocr:parse'],
        inputSchema: {
          type: 'object',
          required: ['rawFileUri'],
          properties: { rawFileUri: { type: 'string' } },
        },
        outputSchema: {
          type: 'object',
          required: ['vendorName', 'amount'],
          properties: { vendorName: { type: 'string' } },
        },
        timeoutMs: 1000,
        trustLevel: 'EnterpriseCertified',
      },
      async execute(input: any) {
        if (input.shouldFail) throw new Error('OCR Parser Error');
        return { vendorName: 'ALOIS Solutions', amount: 120000 };
      },
    };

    runtime.registerCapability(sampleCap, 'Active');
  });

  it('Test 1: Manifest Scopes & Permission Boundary', async () => {
    // Missing required scope 'ocr:parse'
    await expect(
      runtime.executeCapability('cap_invoice_ocr', { rawFileUri: 'file://invoice.pdf' }, ['doc:read'])
    ).rejects.toThrow('AccessDeniedError');

    // Granted required scopes
    const res = await runtime.executeCapability(
      'cap_invoice_ocr',
      { rawFileUri: 'file://invoice.pdf' },
      ['doc:read', 'ocr:parse']
    );

    expect(res.success).toBe(true);
    expect(res.data.vendorName).toBe('ALOIS Solutions');
  });

  it('Test 2: Schema Validation (REQ-CAP-009)', async () => {
    // Missing required field 'rawFileUri'
    await expect(
      runtime.executeCapability('cap_invoice_ocr', {}, ['doc:read', 'ocr:parse'])
    ).rejects.toThrow(SchemaValidationError);
  });

  it('Test 3: Capability Provenance Tracking (REQ-CAP-010)', async () => {
    const res = await runtime.executeCapability(
      'cap_invoice_ocr',
      { rawFileUri: 'file://invoice.pdf' },
      ['doc:read', 'ocr:parse'],
      'corr_1001'
    );

    expect(res.provenance).toBeDefined();
    expect(res.provenance.correlationId).toBe('corr_1001');
    expect(res.provenance.capabilityId).toBe('cap_invoice_ocr');
    expect(res.provenance.capabilityVersion).toBe('2.1.0');
    expect(res.provenance.publisher).toBe('CHATR Enterprise');
    expect(res.provenance.status).toBe('SUCCESS');
  });

  it('Test 4: Circuit Breaker State Machine & Quarantining', async () => {
    // 3 consecutive failures
    await runtime.executeCapability('cap_invoice_ocr', { rawFileUri: 'f1', shouldFail: true }, ['doc:read', 'ocr:parse']);
    await runtime.executeCapability('cap_invoice_ocr', { rawFileUri: 'f1', shouldFail: true }, ['doc:read', 'ocr:parse']);
    await runtime.executeCapability('cap_invoice_ocr', { rawFileUri: 'f1', shouldFail: true }, ['doc:read', 'ocr:parse']);

    const rec = runtime.getCapabilityRecord('cap_invoice_ocr');
    expect(rec?.health).toBe('Quarantined');
    expect(runtime.getCircuitBreakerState('cap_invoice_ocr')).toBe('Open');

    // Subsequent execution blocked by Open Circuit
    await expect(
      runtime.executeCapability('cap_invoice_ocr', { rawFileUri: 'f1' }, ['doc:read', 'ocr:parse'])
    ).rejects.toThrow(CircuitOpenError);
  });

  it('Test 5: Circuit Recovery Probe (Half-Open -> Closed)', async () => {
    // Trip circuit to Open
    await runtime.executeCapability('cap_invoice_ocr', { rawFileUri: 'f1', shouldFail: true }, ['doc:read', 'ocr:parse']);
    await runtime.executeCapability('cap_invoice_ocr', { rawFileUri: 'f1', shouldFail: true }, ['doc:read', 'ocr:parse']);
    await runtime.executeCapability('cap_invoice_ocr', { rawFileUri: 'f1', shouldFail: true }, ['doc:read', 'ocr:parse']);

    // Probe Half-Open
    runtime.probeHalfOpen('cap_invoice_ocr');
    expect(runtime.getCircuitBreakerState('cap_invoice_ocr')).toBe('Half-Open');

    // 2 Successful Probes
    await runtime.executeCapability('cap_invoice_ocr', { rawFileUri: 'f1' }, ['doc:read', 'ocr:parse']);
    await runtime.executeCapability('cap_invoice_ocr', { rawFileUri: 'f1' }, ['doc:read', 'ocr:parse']);

    // Circuit should recover to Closed
    expect(runtime.getCircuitBreakerState('cap_invoice_ocr')).toBe('Closed');
  });

  it('Test 6: Governance Lifecycle Rules', async () => {
    runtime.setLifecycle('cap_invoice_ocr', 'Retired');

    await expect(
      runtime.executeCapability('cap_invoice_ocr', { rawFileUri: 'f1' }, ['doc:read', 'ocr:parse'])
    ).rejects.toThrow('Cannot execute capability in \'Retired\' lifecycle stage');
  });

  it('Test 7: Concurrent Isolation', async () => {
    const promises = Array.from({ length: 50 }, (_, i) =>
      runtime.executeCapability(
        'cap_invoice_ocr',
        { rawFileUri: `file://inv_${i}.pdf` },
        ['doc:read', 'ocr:parse']
      )
    );

    const results = await Promise.all(promises);
    expect(results.length).toBe(50);
    expect(results.every(r => r.success)).toBe(true);
  });
});

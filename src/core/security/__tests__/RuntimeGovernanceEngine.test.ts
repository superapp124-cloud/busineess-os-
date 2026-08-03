import { describe, it, expect } from 'vitest';
import { RuntimeGovernanceEngine } from '../RuntimeGovernanceEngine';

describe('Subsystem 26: Runtime Governance Engine ("Should this happen?")', () => {
  let engine: RuntimeGovernanceEngine;

  beforeEach(() => {
    engine = RuntimeGovernanceEngine.getInstance();
  });

  it('Test 1: Routine Action Evaluation (PROCEED)', async () => {
    const res = await engine.evaluateGovernance({
      action: 'approve_expense',
      targetEntity: 'person:arshid',
      actor: 'manager_deepu',
      tenantId: 'tenant_demo',
      impactUSD: 500,
    });

    expect(res.allowed).toBe(true);
    expect(res.suggestedAction).toBe('PROCEED');
    expect(res.riskScore).toBeLessThan(0.5);
  });

  it('Test 2: High-Risk Action Guard (ESCALATE_LEGAL)', async () => {
    const res = await engine.evaluateGovernance({
      action: 'terminate_employee',
      targetEntity: 'person:emp_991',
      actor: 'ai_hr_agent',
      tenantId: 'tenant_demo',
    });

    expect(res.allowed).toBe(false);
    expect(res.requiresLegalApproval).toBe(true);
    expect(res.suggestedAction).toBe('ESCALATE_LEGAL');
  });

  it('Test 3: High Financial Impact Escalation (ESCALATE_EXECUTIVE)', async () => {
    const res = await engine.evaluateGovernance({
      action: 'vendor_payout',
      targetEntity: 'org:alois',
      actor: 'finance_lead',
      tenantId: 'tenant_finance',
      impactUSD: 120000,
    });

    expect(res.allowed).toBe(false);
    expect(res.requiresExecutiveEscalation).toBe(true);
    expect(res.suggestedAction).toBe('ESCALATE_EXECUTIVE');
  });
});

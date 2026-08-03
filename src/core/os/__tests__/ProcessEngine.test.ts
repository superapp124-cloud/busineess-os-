import { describe, it, expect } from 'vitest';
import { ProcessEngine } from '../ProcessEngine';

describe('Business Process Engine (Process Layer Above Missions)', () => {
  let engine: ProcessEngine;

  beforeEach(() => {
    engine = ProcessEngine.getInstance();
  });

  it('Test 1: Create Multi-Month Enterprise Process (Hire to Retire)', () => {
    const process = engine.createProcess({
      name: 'Hire to Retire — Executive Onboarding',
      category: 'H2R',
      tenantId: 'tenant_enterprise',
      slaBudgetHours: 2160, // 90 days SLA
    });

    expect(process.id).toContain('proc_');
    expect(process.category).toBe('H2R');
    expect(process.status).toBe('ACTIVE');
  });

  it('Test 2: Bind Missions to Enterprise Process', () => {
    const process = engine.createProcess({
      name: 'Quote to Cash — Enterprise Software Contract',
      category: 'Q2C',
      tenantId: 'tenant_sales',
    });

    engine.bindMissionToProcess(process.id, 'm_candidate_01');
    engine.bindMissionToProcess(process.id, 'm_interview_01');
    engine.bindMissionToProcess(process.id, 'm_offer_01');

    const fetched = engine.getProcess(process.id);
    expect(fetched?.missionIds.length).toBe(3);
    expect(fetched?.missionIds).toContain('m_offer_01');
  });
});

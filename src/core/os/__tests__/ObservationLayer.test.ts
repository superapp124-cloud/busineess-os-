import { describe, it, expect } from 'vitest';
import { ObservationLayer } from '../ObservationLayer';

describe('Enterprise Observation Layer (Universal Platform Ingestion Gateway)', () => {
  let layer: ObservationLayer;

  beforeEach(() => {
    layer = ObservationLayer.getInstance();
  });

  it('Test 1: Chat Module MessageObserved Ingestion', async () => {
    const obs = await layer.observe('MessageObserved', {
      sourceModule: 'Chat',
      tenantId: 'tenant_demo',
      userId: 'user_arshid',
      data: { text: 'Approve vendor payment of ₹1,20,000 for ALOIS Solutions' },
    });

    expect(obs.id).toContain('obs_');
    expect(obs.type).toBe('MessageObserved');
    expect(obs.correlationId).toBeDefined();
    expect(obs.traceId).toBeDefined();
  });

  it('Test 2: Recruitment Module DocumentObserved Resume Ingestion', async () => {
    const obs = await layer.observe('DocumentObserved', {
      sourceModule: 'Recruitment',
      tenantId: 'tenant_demo',
      userId: 'hr_lead',
      data: { resumeUri: 'file://resume_deepu.pdf', candidateName: 'Deepu' },
    });

    expect(obs.type).toBe('DocumentObserved');
    expect(obs.payload.sourceModule).toBe('Recruitment');
  });

  it('Test 3: Healthcare Module Prescription Upload Ingestion', async () => {
    const obs = await layer.observe('DocumentObserved', {
      sourceModule: 'Healthcare',
      tenantId: 'tenant_health',
      userId: 'dr_sharma',
      data: { prescriptionUri: 'file://rx_metformin.pdf', patientId: 'p_88192' },
    });

    expect(obs.type).toBe('DocumentObserved');
    expect(obs.payload.sourceModule).toBe('Healthcare');
  });

  it('Test 4: CRM EmailObserved Opportunity Ingestion', async () => {
    const obs = await layer.observe('EmailObserved', {
      sourceModule: 'CRM',
      tenantId: 'tenant_sales',
      userId: 'rep_sales',
      data: { from: 'client@enterprise.com', subject: 'RFQ for 500 Software Licenses' },
    });

    expect(obs.type).toBe('EmailObserved');
  });

  it('Test 5: Calendar MeetingObserved Schedule Ingestion', async () => {
    const obs = await layer.observe('CalendarObserved', {
      sourceModule: 'Calendar',
      tenantId: 'tenant_demo',
      userId: 'user_arshid',
      data: { meetingTitle: 'Quarterly Board Review', startTime: Date.now() + 86400000 },
    });

    expect(obs.type).toBe('CalendarObserved');
  });
});

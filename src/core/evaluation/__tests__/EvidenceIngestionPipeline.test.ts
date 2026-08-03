import { describe, it, expect, beforeEach } from 'vitest';
import { EvidenceIngestionPipeline } from '../EvidenceIngestionPipeline';
import { customerEvidenceFramework } from '../CustomerEvidenceFramework';

describe('Subsystem 30: Evidence Ingestion Pipeline (Operational Ingestion & Provenance)', () => {
  let pipeline: EvidenceIngestionPipeline;

  beforeEach(() => {
    pipeline = EvidenceIngestionPipeline.getInstance();
  });

  it('Test 1: Ingest CI/CD GitHub Actions test payload into Section 1', () => {
    const evidence = pipeline.ingestOperationalPayload({
      sectionId: 'sec_1_first_impression',
      evidenceType: 'UnitTest',
      category: 'Internal',
      description: 'GitHub Actions Automated UI Onboarding Test',
      source: 'github-actions-ci-job-99182',
      generatedBy: 'GitHub Actions CI',
      systemOrigin: 'CI_PIPELINE',
      persona: 'Developer',
      metricValue: '100% Onboarding Pass',
    });

    expect(evidence).toBeDefined();
    expect(evidence.source).toContain('GitHub Actions CI');
    expect(evidence.freshness).toBe('Fresh');
  });

  it('Test 2: Ingest OpenTelemetry APM performance payload into Section 9', () => {
    const evidence = pipeline.ingestOperationalPayload({
      sectionId: 'sec_9_ux',
      evidenceType: 'PerformanceBenchmark',
      category: 'Internal',
      description: 'k6 Load Lab Sub-25ms Execution Latency Benchmark',
      source: 'k6-load-lab-run-4410',
      generatedBy: 'Performance Lab',
      systemOrigin: 'PERFORMANCE_LAB',
      persona: 'Developer',
      metricValue: '14.2 ms avg',
    });

    expect(evidence).toBeDefined();
    expect(evidence.weight).toBe(3);
  });

  it('Test 3: Ingest Pilot Customer NPS Survey payload into Section 11', () => {
    const evidence = pipeline.ingestOperationalPayload({
      sectionId: 'sec_11_business_value',
      evidenceType: 'NPS',
      category: 'External',
      description: 'Pilot Customer Executive NPS Survey',
      source: 'Qualtrics NPS Portal',
      generatedBy: 'Research Team',
      systemOrigin: 'NPS_SURVEY',
      persona: 'CEO',
      metricValue: 'NPS +68',
      quote: 'CHATR has fundamentally unified how our executive team operates.',
    });

    expect(evidence).toBeDefined();
    expect(evidence.category).toBe('External');
    expect(evidence.weight).toBe(5);
  });

  it('Test 4: Verify ingested evidence appears in CustomerEvidenceFramework dashboard data', () => {
    const sections = customerEvidenceFramework.getEvaluationSections();
    const sec11 = sections.find(s => s.id === 'sec_11_business_value');
    expect(sec11?.evidence.length).toBeGreaterThan(0);
  });
});

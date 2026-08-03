import { describe, it, expect, beforeEach } from 'vitest';
import { CustomerEvidenceFramework } from '../CustomerEvidenceFramework';

describe('Customer Evidence Framework (Persona, Journey, Freshness & Overall Confidence)', () => {
  let framework: CustomerEvidenceFramework;

  beforeEach(() => {
    framework = CustomerEvidenceFramework.getInstance();
  });

  it('Test 1: Verify 12 Evaluation Sections registered', () => {
    const sections = framework.getEvaluationSections();
    expect(sections.length).toBe(12);
  });

  it('Test 2: Persona Evidence Summaries generated for 8 Personas', () => {
    const personas = framework.getPersonaSummaries();
    expect(personas.length).toBe(8);

    const recruiter = personas.find(p => p.persona === 'Recruiter');
    expect(recruiter).toBeDefined();
    expect(recruiter?.evidenceCount).toBeGreaterThan(0);
  });

  it('Test 3: Macro Journey Evidence Records retrieved', () => {
    const journeys = framework.getJourneys();
    expect(journeys.length).toBeGreaterThan(0);

    const hiring = journeys.find(j => j.journeyId === 'j_candidate_hiring');
    expect(hiring?.completionRatePercent).toBe(96);
  });

  it('Test 4: Calculate 82% Overall Enterprise Readiness Confidence Score', () => {
    const maturity = framework.getMaturityProgress();
    expect(maturity.overallConfidenceScore).toBe(82);
  });
});

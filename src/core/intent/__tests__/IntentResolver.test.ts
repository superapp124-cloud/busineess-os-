import { describe, it, expect } from 'vitest';
import { IntentResolver } from '../IntentResolver';

describe('Subsystem 28: Intent Resolver Engine (Decoupled Package Resolution)', () => {
  let resolver: IntentResolver;

  beforeEach(() => {
    resolver = IntentResolver.getInstance();
  });

  it('Test 1: Resolve Installed Package Blueprint for RecruitmentOS', () => {
    const blueprint = resolver.resolveIntent('@chatr-packs/recruitment-os', 'CandidateScreeningMission');
    expect(blueprint).toBeDefined();
    expect(blueprint.resolvedVersion).toBe('2.1.0');
    expect(blueprint.targetMissionTemplate).toBe('CandidateScreeningMission');
    expect(blueprint.boundConnectors).toContain('sys:workday');
    expect(blueprint.boundCapabilities).toContain('cap_ocr_service');
  });

  it('Test 2: Resolve Installed Package Blueprint for HealthcareOS', () => {
    const blueprint = resolver.resolveIntent('@chatr-packs/healthcare-os');
    expect(blueprint).toBeDefined();
    expect(blueprint.targetMissionTemplate).toBe('PatientRegistrationMission');
    expect(blueprint.boundPolicies).toContain('pol_hipaa_phi_redaction');
  });

  it('Test 3: Uninstalled Package Resolution Error', () => {
    expect(() => {
      resolver.resolveIntent('@chatr-packs/uninstalled-pack');
    }).toThrow('IntentResolverError');
  });
});

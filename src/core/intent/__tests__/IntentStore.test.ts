import { describe, it, expect, beforeEach } from 'vitest';
import { IntentStore, IntentPackManifest } from '../IntentStore';

describe('Enterprise Intent Store & Package Manager Engine', () => {
  let store: IntentStore;

  beforeEach(() => {
    store = IntentStore.getInstance();
  });

  it('Test 1: Install & Resolve RecruitmentOS Enterprise Intent Pack', () => {
    const record = store.getInstalledPack('@chatr-packs/recruitment-os');
    expect(record).toBeDefined();
    expect(record?.manifest.domain).toBe('Recruitment');
    expect(record?.manifest.connectors).toContain('sys:workday');
    expect(record?.manifest.capabilities).toContain('cap_ocr_service');
    expect(record?.manifest.policies).toContain('pol_eeoc_compliance');
  });

  it('Test 2: Install & Resolve HealthcareOS FHIR Clinical Pack', () => {
    const blueprint = store.resolvePackageBlueprint('@chatr-packs/healthcare-os');
    expect(blueprint).toBeDefined();
    expect(blueprint?.domain).toBe('Healthcare');
    expect(blueprint?.capabilities).toContain('PrescriptionAnalysisCapability');
    expect(blueprint?.policies).toContain('pol_hipaa_phi_redaction');
  });

  it('Test 3: Signature Validation Enforcement on Invalid Packages', () => {
    const invalidPack: IntentPackManifest = {
      id: '@chatr-packs/malicious-pack',
      name: 'Corrupt Pack',
      version: '1.0.0',
      domain: 'Security',
      publisher: 'Unknown',
      signature: 'invalid_raw_signature', // Must start with sha256:
      missionTemplates: [],
      capabilities: [],
      connectors: [],
      policies: [],
      inferencePlugins: [],
      knowledgePacks: [],
      aiModels: [],
      prompts: [],
      digitalWorkers: [],
      uiExtensions: [],
      dashboards: [],
      automations: [],
      permissions: [],
      workflows: [],
      reports: [],
      forms: [],
    };

    expect(() => {
      store.installPack(invalidPack);
    }).toThrow('PackageSignatureError');
  });

  it('Test 4: Search Enterprise Intent Exchange', () => {
    const results = store.searchIntentExchange('Healthcare');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('@chatr-packs/healthcare-os');
  });
});

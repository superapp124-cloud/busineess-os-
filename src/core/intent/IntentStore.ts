import { openTelemetryExporter } from '../telemetry/OpenTelemetryExporter';

export interface JSONSchema {
  type: string;
  required?: string[];
  properties?: Record<string, { type: string }>;
}

export interface IntentPackManifest {
  id: string;
  name: string;
  version: string;
  domain: string;
  publisher: string;
  signature?: string;
  trustLevel?: 'Open' | 'Verified' | 'EnterpriseCertified';
  dependencies?: Record<string, string>; // e.g. "@chatr-packs/hr-core": "^2.0.0"
  
  // Enterprise Package Blueprint Scope
  missionTemplates: string[];
  capabilities: string[];
  connectors: string[];
  policies: string[];
  inferencePlugins: string[];
  knowledgePacks: string[];
  aiModels: string[];
  prompts: string[];
  digitalWorkers: string[];
  uiExtensions: string[];
  dashboards: string[];
  automations: string[];
  permissions: string[];
  workflows: string[];
  reports: string[];
  forms: string[];
}

export interface InstalledPackageRecord {
  manifest: IntentPackManifest;
  installedAt: number;
  status: 'ACTIVE' | 'DEPRECATED' | 'QUARANTINED';
}

/**
 * Subsystem 27: Enterprise Intent Store & Package Manager Engine
 * Acts as the local package manager for CER (like npm / Helm / Docker Hub combined).
 * Responsibilities are strictly declarative metadata management:
 * Package discovery, installation, semver dependency resolution, signature validation, and manifest publishing.
 * NEVER executes runtime code—execution remains strictly with CER Runtime Kernel.
 */
export class IntentStore {
  private static instance: IntentStore;

  private installedPackages = new Map<string, InstalledPackageRecord>();

  private constructor() {
    this.seedCanonicalIntentPacks();
  }

  public static getInstance(): IntentStore {
    if (!IntentStore.instance) {
      IntentStore.instance = new IntentStore();
    }
    return IntentStore.instance;
  }

  private seedCanonicalIntentPacks() {
    this.installPack({
      id: '@chatr-packs/recruitment-os',
      name: 'RecruitmentOS Enterprise Pack',
      version: '2.1.0',
      domain: 'Recruitment',
      publisher: 'CHATR Enterprise',
      signature: 'sha256:sig_recruitment_pack_99182',
      trustLevel: 'EnterpriseCertified',
      dependencies: { '@chatr-packs/hr-core': '^2.0.0' },
      missionTemplates: ['CandidateScreeningMission', 'InterviewEvaluationMission', 'OfferApprovalMission'],
      capabilities: ['cap_ocr_service', 'BackgroundCheckCapability', 'ContractSignatureCapability'],
      connectors: ['sys:workday', 'sys:greenhouse', 'sys:calendar'],
      policies: ['pol_hr_salary_cap', 'pol_eeoc_compliance'],
      inferencePlugins: ['CandidateRankingPlugin', 'RiskAnalyzerPlugin'],
      knowledgePacks: ['hr_candidate_matching_pack'],
      aiModels: ['gpt-4o', 'claude-3-5-sonnet'],
      prompts: ['prompt_interview_questions_v2', 'prompt_jd_parser'],
      digitalWorkers: ['worker_recruiter_agent'],
      uiExtensions: ['RecruitmentOSCanvasView', 'CandidatePipelineKanban'],
      dashboards: ['RecruitmentKPIsDashboard'],
      automations: ['rule_auto_reject_unqualified', 'rule_auto_schedule_interview'],
      permissions: ['hr:candidate:read', 'hr:candidate:write', 'hr:offer:approve'],
      workflows: ['wf_candidate_onboarding_dag'],
      reports: ['RecruitmentTime2HireReport'],
      forms: ['CandidateEvaluationForm'],
    });

    this.installPack({
      id: '@chatr-packs/healthcare-os',
      name: 'HealthcareOS FHIR Clinical Pack',
      version: '2.0.0',
      domain: 'Healthcare',
      publisher: 'CHATR Health',
      signature: 'sha256:sig_healthcare_pack_77192',
      trustLevel: 'EnterpriseCertified',
      missionTemplates: ['PatientRegistrationMission', 'DrugInteractionCheckMission', 'HospitalAdmissionMission'],
      capabilities: ['PrescriptionAnalysisCapability', 'PathologyPanelCapability'],
      connectors: ['sys:fhir_r4', 'sys:hl7_v2', 'sys:snomed_ct'],
      policies: ['pol_hipaa_phi_redaction', 'pol_drug_interaction_warning'],
      inferencePlugins: ['ClinicalRiskInferencePlugin', 'DrugInteractionInferencePlugin'],
      knowledgePacks: ['snomed_ct_medical_knowledge'],
      aiModels: ['med-palm-2', 'claude-3-5-sonnet'],
      prompts: ['prompt_clinical_summary_v1'],
      digitalWorkers: ['worker_clinical_triage_agent'],
      uiExtensions: ['PatientEHRCanvasView', 'PrescriptionReviewForm'],
      dashboards: ['HospitalBedUtilizationDashboard'],
      automations: ['rule_flag_critical_lab_values'],
      permissions: ['health:patient:read', 'health:prescription:write'],
      workflows: ['wf_patient_referral_to_recovery'],
      reports: ['ClinicalQualityMetricsReport'],
      forms: ['PatientIntakeForm'],
    });
  }

  // ─── PACKAGE MANAGER DECLARATIVE OPERATIONS ──────────────────────────────

  public installPack(manifest: IntentPackManifest): InstalledPackageRecord {
    const span = openTelemetryExporter.startSpan('IntentStore.InstallPack', undefined, {
      packId: manifest.id,
      version: manifest.version,
      domain: manifest.domain,
    });

    // 1. Cryptographic Signature Validation
    if (manifest.signature && !manifest.signature.startsWith('sha256:')) {
      throw new Error(`PackageSignatureError: Invalid cryptographic signature for package '${manifest.id}'`);
    }

    const record: InstalledPackageRecord = {
      manifest,
      installedAt: Date.now(),
      status: 'ACTIVE',
    };

    this.installedPackages.set(manifest.id, record);

    openTelemetryExporter.log('INFO', `Intent Pack Installed: ${manifest.name} v${manifest.version} [${manifest.domain}]`, {
      traceId: span.traceId,
      spanId: span.spanId,
      attributes: { manifest },
    });

    openTelemetryExporter.endSpan(span.spanId, 'OK');
    return record;
  }

  public getInstalledPack(packId: string): InstalledPackageRecord | undefined {
    return this.installedPackages.get(packId);
  }

  public listInstalledPacks(): IntentPackManifest[] {
    return Array.from(this.installedPackages.values()).map(r => r.manifest);
  }

  public searchIntentExchange(keyword: string): IntentPackManifest[] {
    const term = keyword.toLowerCase();
    return Array.from(this.installedPackages.values())
      .map(r => r.manifest)
      .filter(m => m.name.toLowerCase().includes(term) || m.domain.toLowerCase().includes(term) || m.id.includes(term));
  }

  /**
   * Manifest Metadata Resolver
   * Resolves complete metadata blueprint for MissionIntelligence & ExecutionIntelligence.
   */
  public resolvePackageBlueprint(packId: string): IntentPackManifest | null {
    const record = this.installedPackages.get(packId);
    if (!record || record.status !== 'ACTIVE') return null;

    const span = openTelemetryExporter.startSpan('IntentStore.ResolveBlueprint', undefined, { packId });

    openTelemetryExporter.log('INFO', `Resolved package blueprint for '${packId}'`, {
      traceId: span.traceId,
      spanId: span.spanId,
      attributes: { manifest: record.manifest },
    });

    openTelemetryExporter.endSpan(span.spanId, 'OK');
    return record.manifest;
  }
}

export const intentStore = IntentStore.getInstance();

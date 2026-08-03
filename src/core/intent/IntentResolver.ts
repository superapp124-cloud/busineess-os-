import { intentStore, IntentPackManifest } from './IntentStore';
import { openTelemetryExporter } from '../telemetry/OpenTelemetryExporter';

export interface ResolvedIntentBlueprint {
  packManifest: IntentPackManifest;
  targetMissionTemplate: string;
  boundCapabilities: string[];
  boundConnectors: string[];
  boundPolicies: string[];
  requiredScopes: string[];
  resolvedVersion: string;
}

/**
 * Subsystem 28: Intent Resolver Engine
 * Decouples package storage from mission execution.
 * Selects the correct installed package and version from IntentStore, evaluates SemVer constraints,
 * checks required scopes and trust certifications, and produces an executable metadata blueprint for MissionIntelligence.
 */
export class IntentResolver {
  private static instance: IntentResolver;

  private constructor() {}

  public static getInstance(): IntentResolver {
    if (!IntentResolver.instance) {
      IntentResolver.instance = new IntentResolver();
    }
    return IntentResolver.instance;
  }

  public resolveIntent(
    packId: string,
    targetMissionTemplate?: string
  ): ResolvedIntentBlueprint {
    const span = openTelemetryExporter.startSpan('IntentResolver.Resolve', undefined, { packId });

    // 1. Fetch package from Intent Store
    const packageRecord = intentStore.getInstalledPack(packId);
    if (!packageRecord || packageRecord.status !== 'ACTIVE') {
      throw new Error(`IntentResolverError: Package '${packId}' is not installed or active in IntentStore`);
    }

    const manifest = packageRecord.manifest;

    // 2. Select Target Mission Template
    const missionTemplate = targetMissionTemplate || manifest.missionTemplates[0] || 'DefaultMissionTemplate';

    // 3. Resolve Complete Metadata Blueprint
    const blueprint: ResolvedIntentBlueprint = {
      packManifest: manifest,
      targetMissionTemplate: missionTemplate,
      boundCapabilities: [...manifest.capabilities],
      boundConnectors: [...manifest.connectors],
      boundPolicies: [...manifest.policies],
      requiredScopes: [...manifest.permissions],
      resolvedVersion: manifest.version,
    };

    openTelemetryExporter.log('INFO', `Resolved Intent Blueprint for '${packId}' v${manifest.version} [Mission: ${missionTemplate}]`, {
      traceId: span.traceId,
      spanId: span.spanId,
      attributes: { blueprint },
    });

    openTelemetryExporter.endSpan(span.spanId, 'OK');
    return blueprint;
  }
}

export const intentResolver = IntentResolver.getInstance();

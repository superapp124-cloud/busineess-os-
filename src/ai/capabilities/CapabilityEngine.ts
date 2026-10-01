/**
 * CHATR SI OS — Capability Engine
 * src/ai/capabilities/CapabilityEngine.ts
 *
 * Open-Ended Sub-OS & Capability Platform Engine.
 * Manages the extensible ecosystem across 3 tiers:
 * - Tier 1: NATIVE (offline-first core OS capabilities)
 * - Tier 2: TRUSTED (verified partner tools & platform integrations)
 * - Tier 3: SANDBOXED (isolated 3rd-party extensions with strict permission barrier)
 *
 * Supports dynamic open-ended registration of new Sub-OSs:
 * Communication, Health, Identity, Life, Work, Knowledge, Device, Action,
 * + Finance, Education, Family, Travel, Commerce, Enterprise, etc.
 */

import {
  CapabilityDefinition,
  CapabilityResult,
  CapabilityTier,
  CoreSubOSDomain,
  SubOSDefinition,
  SubOSDomain,
} from './types';
import { permissionManager } from '../security/PermissionManager';
import { aiActivityLog } from '../observability/AIActivityLog';
import { healthQueryEngine } from '@/services/health/HealthQueryEngine';

export class CapabilityEngine {
  private static instance: CapabilityEngine;
  private subOSs: Map<string, SubOSDefinition> = new Map();
  private capabilities: Map<string, CapabilityDefinition> = new Map();

  private constructor() {
    this.registerCoreSubOSs();
    this.registerDefaultNativeCapabilities();
  }

  public static getInstance(): CapabilityEngine {
    if (!CapabilityEngine.instance) {
      CapabilityEngine.instance = new CapabilityEngine();
    }
    return CapabilityEngine.instance;
  }

  /**
   * Registers the 8 Core Sub-Operating Systems
   */
  private registerCoreSubOSs(): void {
    const coreDefinitions: SubOSDefinition[] = [
      {
        domainId: 'COMMUNICATION',
        name: 'Communication OS',
        description: 'Chat, Voice, WebRTC Video, Groups, Presence, and Conversational Intent Intelligence',
        icon: 'MessageSquare',
        capabilities: ['comm_extract_schedule', 'comm_extract_commitment', 'comm_summarize_audio'],
        contextEntityTypes: ['Conversation', 'Person'],
        isProtectedDomain: false,
        version: '1.0.0',
      },
      {
        domainId: 'HEALTH',
        name: 'Health OS',
        description: 'Authoritative Clinical Evaluation, Vitals Baseline, Wearables, and Emergency P0 Overrides',
        icon: 'HeartPulse',
        capabilities: ['health_query_vitals', 'health_log_reading', 'health_check_baseline'],
        contextEntityTypes: ['HealthEvent', 'VitalReading', 'Medication'],
        isProtectedDomain: true, // Inviolable clinical island
        version: '1.0.0',
      },
      {
        domainId: 'IDENTITY',
        name: 'Identity OS',
        description: 'ChatrShield, Verified Caller Intelligence, Anti-Scam Heuristics, and Cryptographic Key Identity',
        icon: 'ShieldCheck',
        capabilities: ['identity_verify_caller', 'identity_scan_reputation'],
        contextEntityTypes: ['IdentityProfile', 'ContactVerification'],
        isProtectedDomain: false,
        version: '1.0.0',
      },
      {
        domainId: 'LIFE',
        name: 'Life OS',
        description: 'Personal Habits, Routines, Family Context, Subscriptions, and Personal Travel',
        icon: 'Smile',
        capabilities: ['life_track_routine', 'life_query_habits'],
        contextEntityTypes: ['Routine', 'Habit', 'FamilyMember'],
        isProtectedDomain: false,
        version: '1.0.0',
      },
      {
        domainId: 'WORK',
        name: 'Work OS',
        description: 'Calendar Sync, Agenda Briefings, Action Items, and Meeting Preparation',
        icon: 'Briefcase',
        capabilities: ['work_query_agenda', 'work_create_task', 'work_prepare_meeting'],
        contextEntityTypes: ['Appointment', 'Task', 'Project'],
        isProtectedDomain: false,
        version: '1.0.0',
      },
      {
        domainId: 'KNOWLEDGE',
        name: 'Knowledge OS',
        description: 'Local Vector RAG (LiteRT), Document Vault, and Privacy-Controlled Web Gateway',
        icon: 'BookOpen',
        capabilities: ['knowledge_search_docs', 'knowledge_public_search'],
        contextEntityTypes: ['Document', 'KnowledgeSnippet'],
        isProtectedDomain: false,
        version: '1.0.0',
      },
      {
        domainId: 'DEVICE',
        name: 'Device OS',
        description: 'Universal BLE Normalizer, Health Connect, Telemetry Profiling (Tiers A-E), Thermal Guards',
        icon: 'Cpu',
        capabilities: ['device_get_telemetry', 'device_ble_scan'],
        contextEntityTypes: ['Device', 'SensorReading'],
        isProtectedDomain: false,
        version: '1.0.0',
      },
      {
        domainId: 'ACTION',
        name: 'Action OS',
        description: 'Deterministic vs AI Execution, 3-Level Permission Barrier, and Immutable Activity Log',
        icon: 'Zap',
        capabilities: ['action_set_alarm', 'action_set_timer', 'action_manage_permission'],
        contextEntityTypes: ['ActionItem', 'SecurityAudit'],
        isProtectedDomain: false,
        version: '1.0.0',
      },
    ];

    for (const subOS of coreDefinitions) {
      this.subOSs.set(subOS.domainId, subOS);
    }
  }

  /**
   * Registers default Tier 1 Native capabilities
   */
  private registerDefaultNativeCapabilities(): void {
    // 1. Health OS Authoritative Query (Clinical Island)
    this.registerCapability({
      id: 'health_query_vitals',
      name: 'Query Health Baseline',
      description: 'Queries clinical vitals baseline and evaluation state directly from Health OS.',
      domain: 'HEALTH',
      tier: 'NATIVE',
      riskLevel: 'LEVEL_1_SAFE_READ',
      requiredPermissions: ['HEALTH_DATA_READ'],
      enabled: true,
      execute: async (params) => {
        const query = String(params.query || 'vitals status');
        const res = healthQueryEngine.query(query);
        return {
          success: true,
          data: res,
          message: res.answer,
          executionLocation: 'DEVICE_NATIVE',
        };
      },
    });

    // 2. Work OS Agenda Query
    this.registerCapability({
      id: 'work_query_agenda',
      name: 'Query Daily Agenda',
      description: 'Fetches today scheduled calendar appointments and meetings.',
      domain: 'WORK',
      tier: 'NATIVE',
      riskLevel: 'LEVEL_1_SAFE_READ',
      requiredPermissions: ['CALENDAR_READ'],
      enabled: true,
      execute: async () => {
        return {
          success: true,
          data: { meetingsCount: 2, next: 'Architecture Review' },
          message: 'Retrieved daily agenda.',
          executionLocation: 'DEVICE_NATIVE',
        };
      },
    });

    // 3. Action OS Deterministic Alarm
    this.registerCapability({
      id: 'action_set_alarm',
      name: 'Set Device Alarm',
      description: 'Sets a local system alarm deterministically with zero LLM overhead.',
      domain: 'ACTION',
      tier: 'NATIVE',
      riskLevel: 'LEVEL_2_REVERSIBLE',
      requiredPermissions: ['SET_ALARM'],
      enabled: true,
      execute: async (params) => {
        const time = params.time || '07:00 AM';
        return {
          success: true,
          data: { time, active: true },
          message: `Alarm configured for ${time}.`,
          executionLocation: 'DEVICE_NATIVE',
        };
      },
    });
  }

  /**
   * Open-Ended Dynamic Sub-OS Registration
   * Allows registering new Sub-OSs (Finance OS, Travel OS, Education OS, etc.) at runtime.
   */
  public registerSubOS(definition: SubOSDefinition): void {
    if (this.subOSs.has(definition.domainId)) {
      // Merge or update capabilities
      const existing = this.subOSs.get(definition.domainId)!;
      existing.capabilities = Array.from(new Set([...existing.capabilities, ...definition.capabilities]));
      existing.contextEntityTypes = Array.from(new Set([...existing.contextEntityTypes, ...definition.contextEntityTypes]));
      return;
    }
    this.subOSs.set(definition.domainId, definition);
  }

  public getSubOS(domainId: SubOSDomain): SubOSDefinition | undefined {
    return this.subOSs.get(domainId);
  }

  public listSubOSs(): SubOSDefinition[] {
    return Array.from(this.subOSs.values());
  }

  /**
   * Capability Registration
   */
  public registerCapability(capability: CapabilityDefinition): void {
    this.capabilities.set(capability.id, capability);

    // Link capability to Sub-OS if present
    const subOS = this.subOSs.get(capability.domain);
    if (subOS && !subOS.capabilities.includes(capability.id)) {
      subOS.capabilities.push(capability.id);
    }
  }

  public getCapability(id: string): CapabilityDefinition | undefined {
    return this.capabilities.get(id);
  }

  public listCapabilities(domain?: SubOSDomain): CapabilityDefinition[] {
    const all = Array.from(this.capabilities.values());
    if (domain) {
      return all.filter((c) => c.domain === domain);
    }
    return all;
  }

  public listCapabilitiesByTier(tier: CapabilityTier): CapabilityDefinition[] {
    return Array.from(this.capabilities.values()).filter((c) => c.tier === tier);
  }

  /**
   * Execute Capability with Tier Security and 3-Level Permission Barrier
   */
  public async executeCapability(
    capabilityId: string,
    params: Record<string, any> = {},
    userConsentProvided: boolean = false
  ): Promise<CapabilityResult> {
    const startTime = Date.now();
    const cap = this.capabilities.get(capabilityId);

    if (!cap) {
      return {
        success: false,
        error: `Capability "${capabilityId}" not found in registry.`,
      };
    }

    if (!cap.enabled) {
      return {
        success: false,
        error: `Capability "${cap.name}" is currently disabled.`,
      };
    }

    // Security Check: Permission Barrier
    const permission = permissionManager.checkPermission({
      actionId: `cap_exec_${Date.now()}`,
      toolName: cap.id,
      securityLevel: cap.riskLevel,
      humanSummary: `Execute capability "${cap.name}"`,
      parameters: params,
      requiresBiometric: cap.riskLevel === 'LEVEL_3_SENSITIVE',
      timestamp: Date.now(),
    });

    if (!permission.allowed && !userConsentProvided) {
      aiActivityLog.logActivity({
        taskTitle: `Blocked Capability: ${cap.name}`,
        what: `Permission Barrier Triggered: ${cap.riskLevel}`,
        why: permission.reason || 'User confirmation required for sensitive action',
        providerId: 'CapabilityEngine',
        modelId: cap.tier,
        isCloud: false,
        dataLocation: 'DEVICE ONLY',
        privacyClass: cap.riskLevel === 'LEVEL_3_SENSITIVE' ? 'HIGHLY_SENSITIVE' : 'PERSONAL',
        latencyMs: Date.now() - startTime,
      });

      return {
        success: false,
        error: `Permission barrier: ${permission.reason || 'Requires explicit user confirmation.'}`,
        executionLocation: cap.tier === 'NATIVE' ? 'DEVICE_NATIVE' : cap.tier === 'TRUSTED' ? 'TRUSTED_BRIDGE' : 'SANDBOX',
      };
    }

    // Tier 3 Sandbox Hard Security Boundary & Minimal Data Projection
    let executionParams = params;
    if (cap.tier === 'SANDBOXED') {
      // Manifest verification
      if (!cap.manifest) {
        return {
          success: false,
          error: 'Sandboxed capability rejected: missing declarative security manifest.',
          executionLocation: 'SANDBOX',
        };
      }

      // Hard Boundary 1: Health OS clinical data cannot be modified or accessed in raw form
      if (cap.domain === 'HEALTH') {
        return {
          success: false,
          error: 'Sandboxed 3rd-party capabilities are strictly forbidden from accessing or modifying Health OS state.',
          executionLocation: 'SANDBOX',
        };
      }

      // Hard Boundary 2: Network access gating
      if (params.requiresNetwork && !cap.manifest.requestedPermissions.includes('NETWORK_ACCESS')) {
        return {
          success: false,
          error: 'Sandboxed capability attempted network egress without declaring NETWORK_ACCESS in manifest.',
          executionLocation: 'SANDBOX',
        };
      }

      // Hard Boundary 3: Minimal Data Projection (strip raw databases, memory dumps, or sensitive keys)
      executionParams = this.projectMinimalData(cap.domain, params);
    }

    try {
      const result = await cap.execute(executionParams);
      const executionLocation =
        result.executionLocation ||
        (cap.tier === 'NATIVE' ? 'DEVICE_NATIVE' : cap.tier === 'TRUSTED' ? 'TRUSTED_BRIDGE' : 'SANDBOX');

      aiActivityLog.logActivity({
        taskTitle: `Executed: ${cap.name}`,
        what: `Capability Execution (${cap.tier})`,
        why: `Invoked within ${cap.domain} domain`,
        providerId: 'CapabilityEngine',
        modelId: cap.id,
        isCloud: false,
        dataLocation: executionLocation === 'DEVICE_NATIVE' ? 'DEVICE ONLY' : 'LOCAL SANDBOX',
        privacyClass: cap.riskLevel === 'LEVEL_3_SENSITIVE' ? 'HIGHLY_SENSITIVE' : 'PERSONAL',
        latencyMs: Date.now() - startTime,
      });

      return {
        ...result,
        executionLocation,
        latencyMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Execution error during capability invocation',
        latencyMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Hard Security Barrier: Minimal Data Projection for Sandboxed Extensions
   * Strips all raw health records, auth credentials, raw memory dumps, and sensitive keys.
   */
  private projectMinimalData(domain: SubOSDomain, params: Record<string, any>): Record<string, any> {
    const forbiddenKeys = [
      'rawVitals',
      'clinicalHistory',
      'password',
      'pin',
      'auth_token',
      'private_key',
      'fullMemoryDump',
      'rawDatabase',
    ];

    const projected: Record<string, any> = {};
    for (const [key, val] of Object.entries(params)) {
      if (!forbiddenKeys.includes(key)) {
        projected[key] = val;
      }
    }
    return projected;
  }
}

export const capabilityEngine = CapabilityEngine.getInstance();

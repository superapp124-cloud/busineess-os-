/**
 * CHATR SI OS — Capability Engine & Sub-OS Types
 * src/ai/capabilities/types.ts
 *
 * Types for the extensible open-ended Sub-OS platform and 3-tier capability system:
 * - Tier 1: CHATR Native (offline-first, embedded in runtime)
 * - Tier 2: Trusted Tools / Verified Partner Services
 * - Tier 3: Sandboxed Extensions / 3rd-Party Agents
 */

export type CapabilityTier = 'NATIVE' | 'TRUSTED' | 'SANDBOXED';

export type CoreSubOSDomain =
  | 'COMMUNICATION'
  | 'HEALTH'
  | 'IDENTITY'
  | 'LIFE'
  | 'WORK'
  | 'KNOWLEDGE'
  | 'DEVICE'
  | 'ACTION';

// Open-ended domain: core domains plus any dynamically registered Sub-OS (Finance, Travel, Education, etc.)
export type SubOSDomain = CoreSubOSDomain | (string & {});

export type SecurityRiskLevel = 'LEVEL_1_SAFE_READ' | 'LEVEL_2_REVERSIBLE' | 'LEVEL_3_SENSITIVE';

export interface CapabilityManifest {
  author?: string;
  version?: string;
  description?: string;
  sandboxPolicy?: 'STRICT_MEDIATED' | 'DIRECT';
  requestedPermissions: string[];
}

export interface CapabilityResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  executionLocation?: 'DEVICE_NATIVE' | 'TRUSTED_BRIDGE' | 'SANDBOX';
  latencyMs?: number;
}

export interface CapabilityDefinition {
  id: string;
  name: string;
  description: string;
  domain: SubOSDomain;
  tier: CapabilityTier;
  riskLevel: SecurityRiskLevel;
  requiredPermissions: string[];
  enabled: boolean;
  manifest?: CapabilityManifest;
  execute: (params: Record<string, any>, context?: any) => Promise<CapabilityResult>;
}

export interface SubOSDefinition {
  domainId: SubOSDomain;
  name: string;
  description: string;
  icon?: string;
  capabilities: string[]; // capability IDs
  contextEntityTypes: string[]; // entity types contributed to PersonalContextGraph
  isProtectedDomain?: boolean; // e.g. Health OS is clinical and protected
  version?: string;
}

export interface BriefingActionOption {
  label: string;
  actionId: string;
  riskLevel: SecurityRiskLevel;
  params?: Record<string, any>;
}

export interface BriefingCard {
  id: string;
  domain: SubOSDomain;
  title: string;
  summary: string;
  severity: 'INFO' | 'ATTENTION' | 'CRITICAL';
  suggestedAction?: string;
  actionOptions: BriefingActionOption[];
  timestamp: number;
}

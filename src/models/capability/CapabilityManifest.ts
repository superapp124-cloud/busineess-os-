/**
 * CHATR Capability Manifest Definition
 * Generic model & provider capability interface across CHATR Operating System features.
 */

export type CapabilityCategory = 'document' | 'vision' | 'audio' | 'browser' | 'code' | 'search' | 'reasoning';

export type PrivacyLevel = 'local-only' | 'hybrid' | 'cloud-allowed';

export interface CapabilityManifest {
  id: string;
  name: string;
  category: CapabilityCategory;
  capabilities: string[]; // e.g. ['longDocumentRWA', 'formulas', 'tables', 'handwriting', 'ocr', 'code-execution']
  requirements: {
    minVramMb?: number;
    minRamMb?: number;
    requiresGpu?: boolean;
    supportsOffline: boolean;
  };
  priority: number; // Higher value = higher preference
  costPerOp: number; // Cost in USD (0 for local)
  privacyLevel: PrivacyLevel;
  avgLatencyMs: number;
  providerVersion: string;
}

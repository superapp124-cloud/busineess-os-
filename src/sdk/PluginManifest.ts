/**
 * CHATR Developer Plugin SDK - Manifest Schema (ADR-008 & ADR-009)
 * Standardized manifest structure for third-party developer plugins.
 */

import { CapabilityCategory, PrivacyLevel } from '../models/capability/CapabilityManifest';
import { ProtectedResource } from '../kernel/permissions/PermissionEngine';

export interface PluginProviderDeclaration {
  id: string;
  name: string;
  category: CapabilityCategory;
  capabilities: string[];
  privacyLevel: PrivacyLevel;
  supportsOffline: boolean;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string; // SemVer e.g. "1.0.0"
  description: string;
  author: string;
  license: string;
  compatibleKernelVersion: string; // e.g. "^3.0"
  requestedPermissions: ProtectedResource[];
  providers: PluginProviderDeclaration[];
  entryPoint: string;
  signature?: string;
  sha256Checksum: string;
}

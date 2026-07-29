/**
 * CapabilityContract
 * 
 * This is the single source of truth for a Capability. 
 * Everything derives from the Contract: Manifests, Repositories, Events, 
 * Permissions, Policies, and SDK generation.
 * 
 * Developers define the *what*, and the Kernel handles the *how*.
 */

export interface IContractInput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
}

export interface IContractOutput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
}

export interface IContractEvent {
  name: string;
  payloadSchema: Record<string, any>;
  description?: string;
}

export interface IContractResource {
  cpuLimit?: string;
  memoryLimit?: string;
  maxQueueDepth?: number;
  apiTokensPerMinute?: number;
  aiTokensPerMonth?: number;
}

export interface IContractMigration {
  fromVersion: string;
  toVersion: string;
  handler: string; // Ref to migration script
}

export interface CapabilityContract {
  // Identity
  id: string;
  version: string;
  minimumKernelVersion: string;

  // Metadata
  name: string;
  publisher: string;
  description: string;
  tags: string[];

  // IO & Events
  inputs: IContractInput[];
  outputs: IContractOutput[];
  events: IContractEvent[];

  // Graph & Data
  businessObjects: string[]; // References to IBusinessObjectDefinition
  dependencies: string[]; // IDs of other capabilities

  // Governance
  permissionsRequired: string[];
  policiesEnforced: string[]; // IDs of policies this capability respects
  
  // Resources
  resourceLimits: IContractResource;

  // Lifecycle
  migrations: IContractMigration[];
}

import { Identifier, Version } from '../../common';
import { Permission, Publisher } from '../../identity';
import { ActionDefinition } from '../contracts/ActionDefinition';

export type CapabilityStatus = 'ENABLED' | 'DISABLED' | 'EXPERIMENTAL' | 'DEPRECATED';

export interface CapabilityDependency {
  name: string;
  versionRange: string;
  optional?: boolean;
}

export interface CapabilityManifest extends Identifier {
  name: string;
  version: Version;
  minimumKernelVersion: Version;
  maximumKernelVersion?: Version;
  publisher: Publisher;
  status: CapabilityStatus;
  permissions: Permission[];
  actions: ActionDefinition[];
  dependencies: CapabilityDependency[];
}

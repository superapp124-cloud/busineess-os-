import { Identifier } from '../common';
import { CapabilityManifest } from '../capabilities/manifests/CapabilityManifest';

export interface Agent extends Identifier {
  name: string;
  description: string;
  allowedCapabilities: string[]; // Capability IDs or wildcard
}

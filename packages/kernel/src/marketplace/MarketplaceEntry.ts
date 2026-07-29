import { Identifier, Version } from '../common';
import { Publisher } from '../identity';
import { TrustLevel } from './TrustLevel';
import { CapabilityManifest } from '../capabilities/manifests/CapabilityManifest';
import { ConnectorManifest } from '../connectors/manifests/ConnectorManifest';

export interface MarketplaceEntry extends Identifier {
  type: 'CAPABILITY' | 'CONNECTOR';
  manifest: CapabilityManifest | ConnectorManifest;
  publisher: Publisher;
  trustLevel: TrustLevel;
  downloads: number;
  rating: number;
  publishedAt: number;
}

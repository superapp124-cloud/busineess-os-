import { ImmutablePackageMetadata, MutablePackageMetadata } from '../registry/Repositories';

export interface DiscoveryQuery {
  namespace?: string;
  kind?: string;
  minimumTrustScore?: number;
  compatibleKernelVersion?: string;
  keyword?: string;
}

export interface DiscoveryResult {
  immutable: ImmutablePackageMetadata;
  mutable: MutablePackageMetadata;
}

export interface DiscoveryService {
  /**
   * CQRS Read-only projection for navigating the ecosystem.
   * Never exposes mutation APIs.
   */
  search(query: DiscoveryQuery): Promise<DiscoveryResult[]>;
  getLatestVersion(namespace: string, packageName: string): Promise<DiscoveryResult | null>;
}

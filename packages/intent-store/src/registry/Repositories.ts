import { PackageIdentity } from './PackageIdentity';
import { PackageKind } from './PackageKind';

export interface ImmutablePackageMetadata {
  identity: PackageIdentity;
  kind: PackageKind;
  archiveUrl: string;
  manifestVersion: string;
  schemaVersion: string;
  minimumKernel: string;
  maximumTestedKernel: string;
  sdkVersion: string;
  cliVersion: string;
  conformanceVersion: string;
  publishedAt: string;
}

export interface MutablePackageMetadata {
  downloadCount: number;
  trustScore: number;
  communityRating: number;
  deprecationFlag: boolean;
  documentationLinks: string[];
}

export interface PackageRepository {
  save(metadata: ImmutablePackageMetadata): Promise<void>;
  get(identity: Pick<PackageIdentity, 'namespace' | 'packageName' | 'version'>): Promise<ImmutablePackageMetadata | null>;
}

export interface VersionRepository {
  updateMutableData(identity: Pick<PackageIdentity, 'namespace' | 'packageName' | 'version'>, data: Partial<MutablePackageMetadata>): Promise<void>;
  getMutableData(identity: Pick<PackageIdentity, 'namespace' | 'packageName' | 'version'>): Promise<MutablePackageMetadata | null>;
}

export interface PackageIdentity {
  publisherId: string;
  namespace: string;
  packageName: string;
  packageType: string;
  version: string;
  digest: string;
  signature: string;
}

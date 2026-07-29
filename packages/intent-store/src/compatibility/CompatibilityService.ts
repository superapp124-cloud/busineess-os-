import { PackageIdentity } from '../registry/PackageIdentity';

export interface CompatibilityService {
  /**
   * Answers the question: "Can these packages coexist?"
   * Validates minimum kernel versions and checks for conflicting actions or dependencies.
   */
  checkCompatibility(packages: PackageIdentity[], targetKernelVersion: string): Promise<boolean>;
}

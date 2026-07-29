import { PackageIdentity } from '../registry/PackageIdentity';

export interface InstallPlan {
  packages: PackageIdentity[];
  dependencyGraph: Record<string, string[]>;
  conflicts: string[];
  warnings: string[];
  requiredConnectors: string[];
  kernelCompatibility: boolean;
  executionOrder: string[];
}

export interface DependencyPlanner {
  /**
   * Answers the question: "What should be installed?"
   * Produces an immutable Install Plan without executing the installation.
   */
  resolvePlan(requestedPackage: PackageIdentity, targetKernelVersion: string): Promise<InstallPlan>;
}

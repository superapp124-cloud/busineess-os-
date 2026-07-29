import { InstallPlan } from '@chatr/intent-store';

export type Environment = 'dev' | 'staging' | 'production';

export interface DeploymentStrategy {
  type: 'immediate' | 'rolling' | 'blue-green' | 'canary';
  // Intentionally thin interface — strategies are plugged in later
}

export interface DeploymentRecord { id: string; plan: InstallPlan; environment: Environment; strategy: DeploymentStrategy; deployedAt: string; deployedBy: string; }

export interface EnvironmentManager {
  listEnvironments(): Environment[];
  getConfig(environment: Environment): Promise<Record<string, string>>;
}

export interface PromotionEngine {
  promote(plan: InstallPlan, from: Environment, to: Environment, strategy: DeploymentStrategy): Promise<DeploymentRecord>;
}

export interface DeploymentHistory {
  record(entry: DeploymentRecord): Promise<void>;
  list(environment: Environment): Promise<DeploymentRecord[]>;
}

export interface RollbackManager {
  rollback(environment: Environment, targetDeploymentId: string): Promise<void>;
}

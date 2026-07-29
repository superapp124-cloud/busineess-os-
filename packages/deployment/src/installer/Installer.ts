import { InstallPlan } from '@chatr/intent-store';

export interface Installer {
  executePlan(plan: InstallPlan): Promise<void>;
}

import { InstallPlan } from '@chatr/intent-store';

export interface Rollback {
  rollback(previousPlan: InstallPlan): Promise<void>;
}

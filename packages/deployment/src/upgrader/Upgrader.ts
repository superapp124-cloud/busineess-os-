import { InstallPlan } from '@chatr/intent-store';

export interface Upgrader {
  upgrade(plan: InstallPlan): Promise<void>;
}

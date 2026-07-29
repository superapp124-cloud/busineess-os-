import { ExecutionPlan } from '../execution/ExecutionPlan';
import { Result } from '../common';

export interface PlanValidator {
  validate(plan: ExecutionPlan): Promise<Result<boolean>>;
}

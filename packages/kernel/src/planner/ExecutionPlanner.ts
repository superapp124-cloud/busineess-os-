import { Intent } from './Intent';
import { ExecutionPlan } from '../execution/ExecutionPlan';
import { ExecutionContext } from '../execution/ExecutionContext';

export interface ExecutionPlanner {
  createPlan(intent: Intent, context: ExecutionContext): Promise<ExecutionPlan>;
}

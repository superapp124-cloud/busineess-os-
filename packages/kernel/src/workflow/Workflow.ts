import { Identifier } from '../common';
import { ExecutionPlan } from '../execution/ExecutionPlan';

export interface Workflow extends Identifier {
  name: string;
  description: string;
  planTemplate: ExecutionPlan;
}

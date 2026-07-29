import { Identifier } from '../common';
import { PolicyContext } from './PolicyContext';
import { PolicyDecision } from './PolicyDecision';

export interface PolicyRule extends Identifier {
  name: string;
  description: string;
  evaluate(context: PolicyContext): Promise<PolicyDecision>;
}

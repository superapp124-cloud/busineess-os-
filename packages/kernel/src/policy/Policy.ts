import { PolicyContext } from './PolicyContext';
import { PolicyDecision } from './PolicyDecision';
import { PolicyRule } from './PolicyRule';

export interface Policy {
  rules: PolicyRule[];
  evaluateAll(context: PolicyContext): Promise<PolicyDecision>;
}

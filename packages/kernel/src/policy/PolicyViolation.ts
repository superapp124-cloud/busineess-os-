import { ChatrError } from '../common';
import { PolicyDecision } from './PolicyDecision';
import { PolicyContext } from './PolicyContext';

export interface PolicyViolation extends ChatrError {
  decision: PolicyDecision;
  context: PolicyContext;
}

import { ExecutionStep } from './contracts/index';
import { RankedCapability } from './CapabilityMatcher';
import { Goal } from './GoalDecomposer';

export interface ExecutionGraphBuilder {
  build(goals: Goal[], capabilities: RankedCapability[]): Promise<ExecutionStep[]>;
}

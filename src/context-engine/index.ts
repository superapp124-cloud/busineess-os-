// Public API — import from here, not from internal modules
export { ContextEngineProvider, useContextEngine } from './ContextEngine';
export { SignalBus, emit } from './SignalBus';
export { classifyDocument } from './AIClassifier';
export { inferUserGoal } from './goalIntelligence';
export type { ClassificationResult } from './AIClassifier';
export type { GoalIntelligenceResult, InferredGoal, PrimaryDecision, ProactivePrompt, DynamicGoalTab } from './goalIntelligence';
export type {
  Signal,
  SignalType,
  ContextSource,
  ContextState,
  ContextAction,
  ContextInsight,
  ContextRecommendation,
  Entity,
  DomainId,
  IntelligencePlugin,
} from './types';

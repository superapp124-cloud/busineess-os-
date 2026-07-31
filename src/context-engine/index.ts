// Public API — import from here, not from internal modules
export { ContextEngineProvider, useContextEngine } from './ContextEngine';
export { SignalBus, emit } from './SignalBus';
export { classifyDocument } from './AIClassifier';
export type { ClassificationResult } from './AIClassifier';
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

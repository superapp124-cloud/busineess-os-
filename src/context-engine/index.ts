// Public API — import from here, not from internal modules
export { ContextEngineProvider, useContextEngine } from './ContextEngine';
export { SignalBus, emit } from './SignalBus';
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

/**
 * CHATR SI OS — Platform Index (Phase 6 & Phase 7)
 * src/ai/index.ts
 */

export * from './runtime/types';
export * from './runtime/ChatrLocalRuntime';
export * from './runtime/DeviceCapabilityEngine';

export * from './models/types';
export * from './models/ModelRegistry';
export * from './models/ModelSelectionEngine';
export * from './models/ModelUpdateManager';

export * from './privacy/types';
export * from './privacy/PrivacyRouter';

export * from './security/types';
export * from './security/PermissionManager';

export * from './memory/types';
export * from './memory/LocalMemoryStore';

export * from './RAG/LocalKnowledgeEngine';

export * from './tools/types';
export * from './tools/ChatrToolRegistry';

export * from './personalization/PreferenceStore';

export * from './notifications/NotificationDecisionAdapter';

export * from './observability/AIActivityLog';
export * from './observability/IntentMetricsEngine';

export * from './context/PersonalContextEngine';
export * from './context/PersonalContextGraph';

export * from './proactive/ProactiveIntelligenceEngine';
export * from './proactive/DailyBriefEngine';

export * from './router/IntelligenceSelector';
export * from './router/ChatrAIRouter';

export * from './agents/PersonalAgent';

export * from './capabilities/types';
export * from './capabilities/CapabilityEngine';

export * from './communication/CommunicationIntelligence';

export * from './protocol/ChatrInteractionProtocol';

export * from './router/UniversalIntentRouter';
export * from './journeys/RealWorldJourneys';

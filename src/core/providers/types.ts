export type ProviderRole = 
  | 'SearchProvider' 
  | 'ExecutionProvider' 
  | 'VerificationProvider' 
  | 'NotificationProvider' 
  | 'StorageProvider' 
  | 'SchedulerProvider' 
  | 'PaymentProvider' 
  | 'AIProvider' 
  | 'EnterpriseMemoryProvider';

export type ExecutionStrategy =
  | 'API'
  | 'DEEP_LINK'
  | 'BROWSER'
  | 'AUTOMATION'
  | 'LOCAL'
  | 'AGENT'
  | string; // Future-proof

export type ExecutionReceiptStatus = 
  | 'Started' 
  | 'Running' 
  | 'Waiting' 
  | 'Completed' 
  | 'Cancelled' 
  | 'Failed';

export interface ExecutionReceipt {
  status: ExecutionReceiptStatus;
  providerId: string;
  strategyUsed: ExecutionStrategy;
  message?: string;
  data?: any;
}

export interface ProviderCapabilities {
  canSearch?: boolean;
  canBook?: boolean;
  canCancel?: boolean;
  canVerify?: boolean;
}

export interface ProviderRequirements {
  needsInternet?: boolean;
  needsLocation?: boolean;
  needsLogin?: boolean;
  needsGPS?: boolean;
  needsPayment?: boolean;
}

export interface ProviderMetrics {
  confidence: number;       // 0 to 100
  latencyMs: number;
  estimatedCost?: number;
  successRate?: number;
}

export interface ProviderHealth {
  isHealthy: boolean;
  lastChecked: number;
}

export interface ExecutionContext {
  intent: string;
  parameters: Record<string, any>;
}

export interface IProvider {
  id: string;
  name: string;
  type: string; // e.g. 'flight', 'hotel', 'cab'
  role: ProviderRole;
  
  // Declaration
  supportedStrategies?(): ExecutionStrategy[];
  capabilities(): ProviderCapabilities;
  requirements?(): ProviderRequirements;
  
  // Real-time state
  health(): Promise<ProviderHealth>;
  metrics?(): Promise<ProviderMetrics>;
  authenticate(): Promise<boolean>;
  
  // Execution Methods
  discover?(context: ExecutionContext): Promise<any[]>;
  execute?(context: ExecutionContext): Promise<ExecutionReceipt>;
  verify?(receiptId: string): Promise<any>;
}

export type ProviderTier = 'tier1_native' | 'tier2_limited' | 'tier3_deeplink';

export interface ProviderManifest {
  id: string; // e.g. 'ext.google', 'ext.linkedin'
  name: string;
  tier: ProviderTier;
  capabilities: string[]; // e.g. 'Read Mail', 'Send Mail', 'Search'
  scopes: string[]; // Required OAuth scopes
  rateLimits?: {
    requestsPerMinute: number;
  };
  features: {
    streaming: boolean;
    realtime: boolean;
    offlineSync: boolean;
    webhooks: boolean;
  };
}

export type ActivityType = 'email' | 'message' | 'notification' | 'task' | 'meeting' | 'document' | 'invoice' | 'issue';
export type ActivityPriority = 'low' | 'normal' | 'high' | 'urgent';
export type SecurityLevel = 'public' | 'internal' | 'confidential' | 'restricted';

export interface UnifiedActivityItem {
  id: string;
  provider: string; // e.g. 'google', 'slack'
  providerType: string; // e.g. 'email', 'chat', 'crm'
  accountId: string;
  workspaceId?: string;
  
  type: ActivityType;
  priority: ActivityPriority;
  securityLevel: SecurityLevel;
  
  sender: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  
  timestamp: number;
  preview: string;
  
  actions: string[]; // dynamically resolved against capabilities
  capabilities: string[]; 
  deepLink?: string; // used for Tier 3 or falling back
  attachments: Array<{ id: string; name: string; type: string; url?: string }>;
  
  status: 'unread' | 'read' | 'action_needed' | 'completed';
  aiSummary?: string;
  
  intent?: string; // Grouping key for Intent Timeline
  confidence?: number;
  threadId?: string;
  labels: string[];
}


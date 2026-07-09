export type CommitmentStatus = 
  | 'detected' 
  | 'understood' 
  | 'validated' 
  | 'suggested' 
  | 'extracting'
  | 'needs_input'
  | 'searching'
  | 'results_ready'
  | 'preview_ready'
  | 'confirmed' 
  | 'executing' 
  | 'waiting' 
  | 'observed'
  | 'reality_verified' 
  | 'completed' 
  | 'learned'
  | 'archived'
  | 'canceled';

export type OutcomeType = 
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'SCHEDULE' | 'NOTIFY' 
  | 'COMMUNICATE' | 'ANALYZE' | 'RETRIEVE' | 'APPROVE' | 'PAY';

export interface Intent {
  action: string;
  confidence: number;
  entities?: Record<string, any>;
}

export interface Commitment {
  id: string;
  type?: string; 
  capability: string;
  title: string;
  description?: string;
  status: CommitmentStatus;
  confidence: number;
  createdAt?: number;
  participants?: any[];
  schedule?: {
    relative?: string;
    resolved?: string;
    raw?: string;
  };
  metadata?: Record<string, any>;
  permissions?: string[];
  requiresApproval?: boolean;
  
  // Execution Context
  entities?: Record<string, any>;
  missingFields?: MissingField[];
  searchResults?: any[];
  selectedResult?: any;
  preview?: CommitmentPreview;
  
  // Verification Context
  realityVerified?: boolean;
  verificationDetails?: RealityVerificationResult;
  updatedAt?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

export interface Preview {
  title: string;
  subtitle: string;
  actions: string[];
  metadata?: Record<string, any>;
}

export interface ExecutionResult {
  success: boolean;
  commitmentId: string;
  message?: string;
  providerData?: any; // Data from provider
}

export interface RealityVerificationResult {
  verified: boolean;
  provider: string; // e.g. "Amadeus"
  timestamp: string;
  transactionId: string; // e.g. "PNR123"
  evidence: any; // Raw auditable payload
}

export interface ExtractedEntities {
  [key: string]: any;
}

export interface ResolvedEntities extends ExtractedEntities {
  _resolved?: true;
}

export interface MissingField {
  key: string;           
  label: string;         
  type: 'text' | 'choice' | 'date';
  options?: string[];    
}

export interface CommitmentPreview {
  icon?: string;
  title: string;
  lines: { label: string; value: string }[];
  cta: string;           
}

export interface CapabilityPlaybook {
  extract(rawText: string): ExtractedEntities;
  resolve(entities: ExtractedEntities, context: any): Promise<ResolvedEntities>;
  getMissingFields(entities: ResolvedEntities): MissingField[];
  
  // Universal Playbook Contract Methods
  requiresSearch?(entities: ResolvedEntities): boolean;
  buildSearchQuery?(entities: ResolvedEntities): any;
  formatSearchResults?(results: any[]): any[];
  buildPreview(entities: ResolvedEntities, selectedResult?: any): CommitmentPreview;
  
  // Search Configuration for Universal Engine
  searchConfiguration?: {
    columns: { key: string; label: string; type?: 'currency' | 'time' | 'text' | 'boolean' }[];
    sortOptions?: { key: string; label: string; direction: 'asc' | 'desc' }[];
    primaryActionLabel?: string;
  };
}

export interface CapabilityManifest {
  // Identity
  id: string;
  name: string;
  version: string;
  category: string;
  outcomeType: OutcomeType;
  providerName?: string;
  
  // Constraints
  maxExecutionTime?: string;
  requiresNetwork: boolean;
  requiresAuthentication: boolean;
  supportsRetry: boolean;
  supportsOfflineQueue: boolean;
  estimatedLatency?: string;

  // Runtime
  maturity: 0 | 1 | 2 | 3 | 4 | 5;
  permissions: string[];
  executionPolicy: 'immediate' | 'confirmation_required' | 'biometric_confirmation' | 'confirmation_and_undo';
  
  // Versioning
  capabilityVersion: string;
  sdkVersion: string;
  minimumKernel: string;
  maximumTestedKernel?: string;
  migrationVersion?: string;

  // Product
  description: string;
  examples: string[];
  tags: string[];
  icon?: string;
  keywords: string[];

  // Graph Edges
  edges?: {
    type: 'suggests' | 'may_require' | 'followed_by';
    target: string;
  }[];
}

export interface Capability {
  manifest: CapabilityManifest;
  playbook?: CapabilityPlaybook;
  
  validate(commitment: Commitment): Promise<ValidationResult>;
  planner?(commitment: Commitment): Promise<any>;
  preview?(commitment: Commitment): Preview;
  executor(commitment: Commitment, provider: Provider): Promise<ExecutionResult>;
  verifier?(commitment: Commitment, provider: Provider): Promise<RealityVerificationResult>;
  undo?(commitmentId: string, provider: Provider): Promise<void>;
  tests?(): Promise<boolean>;
}

export interface Provider {
  id: string;
  name: string;
  type: string;
  authenticate(): Promise<boolean>;
  executeAction(action: string, payload: any): Promise<any>;
}

export interface UnderstandingService {
  resolve(text: string, context: any): Promise<Intent>;
}

export interface CommitmentPlanner {
  plan(intent: Intent): Promise<Commitment | null>;
}

export interface CommitmentRuntime {
  execute(commitment: Commitment): Promise<void>;
}

export interface RealityEngine {
  verify(commitment: Commitment, capability: Capability, provider: Provider): Promise<RealityVerificationResult>;
}

export interface LearningEngine {
  learn(commitment: Commitment): Promise<void>;
}

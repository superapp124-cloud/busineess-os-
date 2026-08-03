// CHATR Enterprise Runtime (CER) - Core Universal Object Model
// This file defines the fundamental ontological primitives of the runtime.
// Everything in the enterprise maps to one of these 14 primitives.

// ------------------------------------------------------------------
// 1. Artifact
// ------------------------------------------------------------------
export interface Artifact {
  id: string;
  sourceUri: string;
  typeHint: string;
  rawFile?: File; 
  rawText?: string;
  createdAt: string;
  hash?: string;
}

// ------------------------------------------------------------------
// 2. Enterprise Event Envelope
// ------------------------------------------------------------------
export type EventClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
export type EnterpriseObjectKind = 'Person' | 'Organization' | 'System' | 'Policy' | 'Knowledge' | 'Artifact' | 'Mission' | 'Connector' | 'Decision';

export interface TraceContext {
  correlationId: string;
  causationId?: string;
  missionId?: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
}

export interface EnterpriseEvent {
  id: string; // UUIDv7
  sequenceNumber?: number; // Monotonically increasing per partition
  type: string;
  schemaVersion: string;
  tenantId: string;
  actorId: string;
  source: string;
  aggregateId: string;
  aggregateKind: EnterpriseObjectKind;
  payload: unknown;
  occurredAt: string;
  traceContext: TraceContext;
  idempotencyKey: string;
  classification: EventClassification;
  metadata: Record<string, unknown>;
}

export interface ProjectionHandler {
  name: string;
  version: string;
  applyEvent(event: EnterpriseEvent): Promise<void> | void;
  getCheckpoint(): string;
  getLastEventId(): string;
  getLastTimestamp(): string;
}

// ------------------------------------------------------------------
// 3. Person
// ------------------------------------------------------------------
export interface Person {
  id: string;
  name: string;
  email?: string;
  role: string;
  department?: string;
  status?: 'Active' | 'Pending' | 'Waiting' | 'Reviewing' | 'Not notified';
}

// ------------------------------------------------------------------
// 4. Organization
// ------------------------------------------------------------------
export interface Organization {
  id: string;
  name: string;
  type: 'Internal' | 'Vendor' | 'Customer' | 'Partner' | 'Regulator';
}

// ------------------------------------------------------------------
// 5. Policy
// ------------------------------------------------------------------
export interface Policy {
  id: string;
  name: string;
  description: string;
  department: string;
  version: string;
}

// ------------------------------------------------------------------
// 6. Knowledge
// ------------------------------------------------------------------
export interface KnowledgeProvenance {
  sourceUri: string;
  chunkIndex?: number;
  modelId?: string;
  updatedAt?: string;
}

export interface Knowledge {
  id: string;
  category: 'SOP' | 'Template' | 'HistoricalPrecedent' | 'OperationalState' | 'ClinicalGuideline' | 'PolicyPack';
  content: string;
  vector?: number[]; // Dense embedding vector
  provenance?: KnowledgeProvenance;
  score?: number; // Similarity score [0.0, 1.0]
}

// ------------------------------------------------------------------
// 7. Memory
// ------------------------------------------------------------------
export interface Memory {
  id: string;
  level: 'Session' | 'Mission' | 'Department' | 'Enterprise' | 'LongTerm';
  key: string;
  value: any;
  retentionPolicy?: string;
}

// ------------------------------------------------------------------
// 8. Decision
// ------------------------------------------------------------------
export interface Decision {
  id: string;
  action?: string;
  label?: string; // legacy support
  type?: 'Approve' | 'Reject' | 'Negotiate' | 'Escalate' | 'Custom'; // legacy support
  impact?: 'High' | 'Medium' | 'Low'; // legacy support
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Negotiating';
  approverId?: string;
}

// ------------------------------------------------------------------
// 9. Task
// ------------------------------------------------------------------
export interface Task {
  id: string;
  title: string;
  status: 'Open' | 'InProgress' | 'Blocked' | 'Completed';
  assigneeId?: string;
  dueDate?: string;
}

// ------------------------------------------------------------------
// 10. Capability
// ------------------------------------------------------------------
export interface CapabilityMetadata {
  id: string;
  name: string;
  category: string;
  requiredContext: string[];
  produces: string[];
  cost: number;
  latency: number;
  executionMode: 'synchronous' | 'asynchronous';
  version: string;
}

export interface ICapability {
  metadata: CapabilityMetadata;
  execute(context: any): Promise<any>;
}

// ------------------------------------------------------------------
// 11. Workflow
// ------------------------------------------------------------------
export interface Workflow {
  id: string;
  name?: string;
  title?: string;
  steps: any[]; // relaxed for legacy support
  currentStepIndex?: number;
}

// ------------------------------------------------------------------
// 12. Automation
// ------------------------------------------------------------------
export interface Automation {
  id: string;
  triggerEvent: string;
  action: string;
  enabled: boolean;
}

// ------------------------------------------------------------------
// 13. Connector
// ------------------------------------------------------------------
export interface Connector {
  id: string;
  system: 'CRM' | 'ERP' | 'HRIS' | 'Email' | 'Slack';
  status: 'Connected' | 'Disconnected' | 'Error';
}

// ------------------------------------------------------------------
// 14. Mission (The core orchestration primitive)
// ------------------------------------------------------------------
export interface MissionNode {
  id: string;
  type: string; // e.g., 'Risk Review', 'Finance Approval'
  status: 'Pending' | 'Active' | 'Completed' | 'Blocked';
  dependencies: string[]; // Node IDs
}

export interface ExecutionStep {
  id: string;
  action: string;
  capabilityId?: string;
  status: 'Pending' | 'Executing' | 'Completed' | 'Failed' | 'Retrying' | 'Rolled_Back' | 'Compensated';
  retries: number;
  maxRetries: number;
  timeoutMs?: number;
  dependsOn?: string[]; // Dependent step IDs for DAG parallel execution
  errorReason?: string;
  compensationAction?: string; // e.g., 'rollback_payment'
}

export interface Recommendation {
  action?: string;
  id?: string;
  title?: string;
  impact?: 'High' | 'Medium' | 'Low' | 'High Impact' | 'Medium Impact' | 'Low Impact';
  estimatedTime?: string;
  actionId?: string;
  estimatedValue?: string;
  implementationTime?: string;
  departmentsAffected?: string[];
  riskReduction?: 'Low' | 'Medium' | 'High' | 'Critical';
  evidenceQuality?: 'Poor' | 'Moderate' | 'Strong' | 'Excellent';
  basedOn?: string[];
  missingEvidence?: string[];
  reason?: string;
  type?: 'Mission' | 'Capability' | 'Policy' | 'Automation' | 'Connector' | 'Knowledge';
}

export type MissionLifecycleState = 'Draft' | 'Created' | 'Ready' | 'Running' | 'Waiting Approval' | 'Approved' | 'Executing' | 'Completed' | 'Failed' | 'Cancelled' | 'Archived';
export type CapabilityLifecycleState = 'Requested' | 'Queued' | 'Running' | 'Retrying' | 'Succeeded' | 'Failed' | 'Rolled Back';

export interface InferenceContext {
  enterpriseGraph: any; // We will use EnterpriseGraph or pass nodes/edges
  enterpriseState: any; // Mission state, connector state
  knowledge: any;       // Knowledge Fabric retrieval results
  missionContext?: MissionExecutionContext;
  triggeringEvent: EnterpriseEvent;
  retrievalResults: KnowledgeObject[];
  traceContext: TraceContext;
  timestamp: string;
}

export interface BaseInferenceHypothesis {
  id: string;
  type: string;
  pluginId: string;
  rawConfidence: number;
  confidence: number; // Calibrated
  evidence: string[];
  reasoningPath: string;
  alternativeMatches: string[];
  policiesApplied: string[];
  graphTraversal: string[];
}

export interface RelationshipHypothesis extends BaseInferenceHypothesis {
  type: 'RelationshipHypothesis';
  sourceId: string;
  targetId: string;
  relationshipType: string;
}

export interface RiskHypothesis extends BaseInferenceHypothesis {
  type: 'RiskHypothesis';
  riskScore: number;
  riskFactors: string[];
}

export interface ComplianceHypothesis extends BaseInferenceHypothesis {
  type: 'ComplianceHypothesis';
  policyId: string;
  isCompliant: boolean;
  violations: string[];
}

export interface MissionRecommendation extends BaseInferenceHypothesis {
  type: 'MissionRecommendation';
  missionName: string;
  suggestedPlan: any[]; // Or ExecutionStep[]
}

export type InferenceHypothesis = RelationshipHypothesis | RiskHypothesis | ComplianceHypothesis | MissionRecommendation;

export interface MissionFinding {
  id: string;
  title: string;
  detail: string;
  confidence: 'High' | 'Medium' | 'Needs review';
  source: string;
}

export interface MissionAuditEntry {
  id: string;
  label: string;
  detail: string;
export interface EnterpriseObject {
  id: string;
  type: EnterpriseObjectKind;
  name: string;
  classification?: EventClassification;
  properties: Record<string, any>;
}

export type KnowledgeLifecycleState = 'Draft' | 'Active' | 'Superseded' | 'Archived' | 'Deleted';
export type MemoryScope = 'Session' | 'Conversation' | 'Mission' | 'Department' | 'Tenant' | 'Global';

export interface Provenance {
  sourceArtifact?: string;
  enterpriseEvent?: string;
  mission?: string;
  capability?: string;
  provider?: string;
  model?: string;
  author?: string;
  created: string;
  confidence: number;
  evidence: string[];
  chain: string[]; // Sequential list of transformations
}

export interface KnowledgeObject extends EnterpriseObject {
  content: string;
  summary?: string;
  language?: string;
  embeddingId?: string; // Reference to vector store
  provenance: Provenance;
  confidence: number;
  validity?: { start: string; end?: string };
  retentionPolicy?: string;
  scope: MemoryScope;
  citations: string[];
  relationships: string[]; // Edge IDs or target node IDs
  lifecycleState: KnowledgeLifecycleState;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string; // e.g., 'MANAGES', 'BELONGS_TO', 'GOVERNS'
  
  confidence: number;
  evidence: string[];
  policy?: string;
  validity?: {
    start: string;
    end?: string;
    status: 'Active' | 'Revoked';
  };
  version: number;
  provenance: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResolvedContextNode {
  node: EnterpriseObject;
  confidence: number; // 0-100
  evidence: string[];
  relatedNodes?: EnterpriseObject[];
}

export type MissionState = 'DRAFT' | 'EVALUATION' | 'PENDING_APPROVAL' | 'APPROVED' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'REJECTED';

export interface MissionExecutionContext {
  id: string;
  trigger: EnterpriseEvent;
  mission: string;
  
  // Mission Lifecycle
  lifecycleState: MissionState;
  
  // Explicit Human Support
  actionRequired: 'AI Completed' | 'AI Recommended' | 'Human Approval Required' | 'Human Action Required' | 'External Dependency' | 'Manual Triage';
  
  // Mission Graph
  missionGraph: MissionNode[];
  
  // Decisions & Explainability
  recommendations: Recommendation[];
  hypotheses?: InferenceHypothesis[];
  
  // Execution Orchestration
  executionPlan: ExecutionStep[];
  findings?: MissionFinding[];
  contextSummary?: string[];
  auditTrail?: MissionAuditEntry[];
  
  // Unified Digital Twin / Graph
  resolvedContext: ResolvedContextNode[];
  
  // Executive KPIs
  businessOutcomes: {
      manualWorkEliminated: string;
      decisionsAccelerated: number;
      riskPrevented: 'Low' | 'Medium' | 'High' | 'Critical';
      financialValueCreated: string;
      automationCompletionRate: string;
      slaImprovement: string;
  };
}

// ------------------------------------------------------------------
// UI Legacy Bridge & Old Engine Types (To keep app 100% stable while we build)
// ------------------------------------------------------------------
export type WorkspaceCardType = 'summary' | 'extraction' | 'warning' | 'insight' | 'checklist' | 'actions' | 'people' | 'timeline';
export interface WorkspaceCard {
  id: string;
  type: WorkspaceCardType;
  title: string;
  priority: number;
  data: Record<string, any>;
}
export interface WorkspaceAction {
  id: string;
  label: string;
  variant: 'primary' | 'secondary' | 'danger';
  icon?: string;
  payload?: Record<string, any>;
}
export interface WorkspaceDefinition {
  title: string;
  subtitle: string;
  status: 'processing' | 'ready' | 'needs_attention';
  confidence: number;
  cards: WorkspaceCard[];
  primaryAction: WorkspaceAction;
  secondaryActions: WorkspaceAction[];
  missingContext: string[];
  warnings: string[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface Readiness {
  percentage: number;
  isReady: boolean;
  missingContext: string[];
}

export interface Outcome {
  id: string;
  description: string;
  status: 'Pending' | 'Completed' | 'Failed';
}

export interface ContextNode {
  id: string;
  title: string;
  type: string;
  metadata: string;
  relevanceScore: number;
}

export interface HistoryEvent {
  id: string;
  event: string;
  timestamp: string;
  details?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  description?: string;
}

export interface Entity {
  id: string;
  type: string;
  value: string;
  confidence: number;
}

export interface Relationship {
  sourceId: string;
  targetId: string;
  type: string;
}

export interface Source {
  origin: string;
  author?: string;
}

export interface ArtifactState {
  artifact: Artifact;
  metadata: Record<string, any>;
  content: string;
  entities: Entity[];
  relationships: Relationship[];
  timeline: TimelineEvent[];
  confidence: number;
  source: Source;
}

export interface WorkspaceState {
  artifact: Artifact;
  goal: Goal;
  readiness: Readiness;
  decisions: Decision[];
  recommendations: Recommendation[];
  relatedContext: ContextNode[];
  history: HistoryEvent[];
  timeline: TimelineEvent[];
  people: Person[];
  workflows: Workflow[];
  viewer: string;
}

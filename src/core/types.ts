// CHATR Work OS v2.0 - Core Types
// This file defines the absolute source of truth for the Universal Work Processing Pipeline.

export interface Artifact {
  id: string;
  sourceUri: string;
  typeHint: string;
  rawFile?: File; // Present if uploaded locally
  rawText?: string;
  createdAt: string;
}

export interface Entity {
  id: string;
  type: string; // e.g., 'Person', 'Company', 'Amount'
  value: string;
  confidence: number;
}

export interface Relationship {
  sourceId: string;
  targetId: string;
  type: string; // e.g., 'WORKS_FOR', 'MENTIONS', 'SIGNED_BY'
}

export interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  description?: string;
}

export interface Source {
  origin: string; // e.g., 'upload', 'email', 'crm'
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

// ------------------------------------------------------------------
// Engine Types
// ------------------------------------------------------------------

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string; // e.g., 'Hire', 'Pay', 'Understand', 'Sign'
}

export interface Readiness {
  percentage: number; // 0 - 100
  isReady: boolean;
  missingContext: string[]; // e.g., ['Job Description', 'Salary Range']
}

export interface Decision {
  id: string;
  label: string;
  type: 'Approve' | 'Reject' | 'Negotiate' | 'Escalate' | 'Custom';
  impact?: 'High' | 'Medium' | 'Low';
}

export interface Outcome {
  id: string;
  description: string;
  status: 'Pending' | 'Completed' | 'Failed';
}

export interface Recommendation {
  id: string;
  title: string;
  impact: 'High Impact' | 'Medium Impact' | 'Low Impact';
  estimatedTime: string; // e.g., '2 minutes'
  actionId?: string;
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

export interface Person {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Pending' | 'Waiting' | 'Reviewing' | 'Not notified';
}

export interface WorkflowStep {
  id: string;
  actor: string;
  action: string;
  status: 'Pending' | 'Active' | 'Completed';
}

export interface Workflow {
  id: string;
  title: string;
  steps: WorkflowStep[];
  currentStepIndex: number;
}

// ------------------------------------------------------------------
// Workspace State
// ------------------------------------------------------------------

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
  viewer: string; // Identifier for Viewer Registry (e.g., 'PDF_VIEWER')
}

// ------------------------------------------------------------------
// Core Engine Interfaces
// ------------------------------------------------------------------

export interface Extractor {
  supports(mimeType: string, extension: string): boolean;
  extract(input: Artifact): Promise<ArtifactState>;
}

export interface IGoalEngine {
  determineGoal(state: ArtifactState): Promise<Goal>;
}

export interface IReadinessEngine {
  evaluateReadiness(state: ArtifactState, goal: Goal): Promise<Readiness>;
}

export interface IDecisionEngine {
  findDecisions(state: ArtifactState, goal: Goal): Promise<Decision[]>;
}

export interface IOutcomeEngine {
  predictOutcomes(decision: Decision): Promise<Outcome[]>;
}

export interface IWorkflowPlanner {
  planWorkflow(goal: Goal, decision?: Decision): Promise<Workflow>;
}

export interface IRecommendationEngine {
  generateRecommendations(state: ArtifactState, goal: Goal): Promise<Recommendation[]>;
}

export interface IMemoryEngine {
  findHistoricalContext(artifact: Artifact): Promise<HistoryEvent[]>;
}

export interface IWorkGraph {
  addNode(node: any): Promise<void>;
  addEdge(edge: Relationship): Promise<void>;
  getRelatedNodes(nodeId: string): Promise<ContextNode[]>;
}

export interface IContextGapEngine {
  findMissingContext(state: ArtifactState, goal: Goal): Promise<string[]>;
}

export interface IArtifactEngine {
  process(artifact: Artifact): Promise<ArtifactState>;
}

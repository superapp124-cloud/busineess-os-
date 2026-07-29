/**
 * CHATR Intent Execution Model (IEM)
 * A semantic, deterministic, and portable graph for executing AI intents.
 */

export type IEMNodeType = 
  | 'Task'
  | 'Decision'
  | 'Approval'
  | 'Parallel'
  | 'Retry'
  | 'Compensation'
  | 'End';

export interface IEMNodeBase {
  id: string;
  type: IEMNodeType;
  name: string;
  next?: string;
  metadata?: Record<string, any>;
}

export interface IEMTaskNode extends IEMNodeBase {
  type: 'Task';
  capabilityId: string;
  toolId: string;
  inputs: Record<string, any>;
  retryPolicy?: RetryPolicy;
  compensationPolicy?: CompensationPolicy;
}

export interface IEMDecisionNode extends IEMNodeBase {
  type: 'Decision';
  condition: string; // Evaluated against execution context
  onTrue: string;
  onFalse: string;
}

export interface IEMApprovalNode extends IEMNodeBase {
  type: 'Approval';
  approverRole: string;
  timeoutMinutes: number;
  onApprove: string;
  onReject: string;
  onTimeout: string;
  escalationPolicy?: EscalationPolicy;
}

export interface IEMParallelNode extends IEMNodeBase {
  type: 'Parallel';
  branches: string[]; // Start node IDs for parallel branches
  nextAfterAll: string;
}

export interface IEMEndNode extends IEMNodeBase {
  type: 'End';
  outcome: 'Success' | 'Failure' | 'Compensated' | 'Rejected';
}

export type IEMNode = 
  | IEMTaskNode
  | IEMDecisionNode
  | IEMApprovalNode
  | IEMParallelNode
  | IEMEndNode;

export interface IntentExecutionGraph {
  id: string;
  intentId: string;
  startNode: string;
  nodes: Record<string, IEMNode>;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  timeoutMs: number;
  idempotent: boolean;
}

export interface CompensationPolicy {
  action: 'Undo' | 'Compensate' | 'Ignore' | 'Escalate' | 'Manual Review';
  compensationNodeId?: string; // If 'Compensate', run this node
}

export interface EscalationPolicy {
  escalateToRole: string;
  timeoutMinutes: number;
}

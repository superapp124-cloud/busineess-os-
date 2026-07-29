export type WorkflowStatus = 
  | 'Pending'
  | 'Running'
  | 'Paused'     // E.g., waiting for human approval
  | 'Failed'
  | 'Compensating'
  | 'Completed'
  | 'Terminated';

export interface WorkflowState {
  execution_id: string;
  workflow_id: string;
  intent_id: string;
  status: WorkflowStatus;
  current_step: string;
  retry_count: number;
  
  started_at: number;
  updated_at: number;
  completed_at?: number;
  
  parent_execution?: string;
  child_execution?: string;
  correlation_id: string;

  // Context holds inputs, outputs, and intermediary state passed between nodes
  context: Record<string, any>;
  
  // History of execution trace
  history: ExecutionHistoryEntry[];
}

export interface ExecutionHistoryEntry {
  nodeId: string;
  status: 'Started' | 'Success' | 'Failed' | 'Compensated' | 'Skipped';
  timestamp: number;
  error?: string;
}

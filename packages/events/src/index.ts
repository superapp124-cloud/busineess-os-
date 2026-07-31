/**
 * Universal Event Taxonomy for CHATR Runtime
 */

export type RuntimeEvent =
  // Connector Lifecycle
  | 'connector.discovered'
  | 'connector.connected'
  | 'connector.failed'
  | 'connector.disconnected'
  | 'connector.health_changed'
  
  // Data Signals
  | 'message.arrived'
  | 'document.changed'
  | 'calendar.event_starting'
  | 'task.completed'
  | 'transaction.detected'
  
  // Identity & Discovery
  | 'identity.created'
  | 'identity.updated'
  | 'environment.change_detected'
  
  // Permissions & Security
  | 'permission.granted'
  | 'permission.revoked'
  | 'policy.violation'
  
  // Intent & Execution
  | 'intent.received'
  | 'intent.resolved'
  | 'intent.rejected'
  | 'workflow.started'
  | 'workflow.step_completed'
  | 'workflow.awaiting_approval'
  | 'workflow.finished'
  | 'workflow.failed'
  | 'execution.retry_queued'
  | 'execution.compensating'
  
  // Agents & Intelligence
  | 'agent.task_started'
  | 'agent.task_completed'
  | 'intelligence.query_completed'
  
  // Storage & Knowledge
  | 'graph.node_added'
  | 'graph.edge_added'
  | 'graph.updated'
  | 'memory.stored'
  | 'memory.recalled'
  
  // System & Resource
  | 'trust.score_changed'
  | 'model.selected'
  | 'resource.contention'
  | 'sync.checkpoint_saved'
  | 'sync.conflict_detected'
  
  // Kernel Lifecycle
  | 'kernel.boot_started'
  | 'kernel.boot_complete'
  | 'kernel.shutdown_initiated'
  | 'kernel.crash_detected';

export interface EventMetadata {
  eventId: string;
  timestamp: number;
  sourcePackage: string;
  correlationId?: string;
  identityId?: string;
  causationId?: string;
}

export type EventHandler<T = unknown> = (payload: T, meta: EventMetadata) => void;
export type Unsubscribe = () => void;

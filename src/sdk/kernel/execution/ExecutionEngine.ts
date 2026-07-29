import { IntentExecutionGraph, IEMNodeBase, IEMTaskNode, IEMDecisionNode, IEMApprovalNode, IEMParallelNode, IEMEndNode } from './IntentExecutionModel';
import { WorkflowState, WorkflowStatus } from './WorkflowState';
import { EventMesh } from '../EventMesh';
import { ActivityCentre } from '../ActivityCentre';

export class ExecutionEngine {
  // In a production system, this would be backed by a persistent data store like Redis or PostgreSQL.
  private static activeExecutions = new Map<string, WorkflowState>();

  static startExecution(graph: IntentExecutionGraph, initialContext: Record<string, any>): string {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const correlationId = `corr_${Date.now()}`;
    
    const state: WorkflowState = {
      execution_id: executionId,
      workflow_id: graph.id,
      intent_id: graph.intentId,
      status: 'Pending',
      current_step: graph.startNode,
      retry_count: 0,
      started_at: Date.now(),
      updated_at: Date.now(),
      correlation_id: correlationId,
      context: initialContext,
      history: []
    };

    this.activeExecutions.set(executionId, state);
    this.persistState(state);
    
    // Kick off execution asynchronously
    setTimeout(() => this.runLoop(executionId, graph), 0);
    
    return executionId;
  }

  private static async runLoop(executionId: string, graph: IntentExecutionGraph) {
    const state = this.activeExecutions.get(executionId);
    if (!state) return;

    if (state.status === 'Pending') {
      state.status = 'Running';
    }

    while (state.status === 'Running' || state.status === 'Compensating') {
      const node = graph.nodes[state.current_step];
      if (!node) {
        this.failExecution(state, `Node ${state.current_step} not found`);
        break;
      }

      state.updated_at = Date.now();
      
      try {
        await this.executeNode(node, state, graph);
      } catch (error: any) {
        await this.handleNodeFailure(node, state, graph, error);
      }
    }
  }

  private static async executeNode(node: IEMNodeBase, state: WorkflowState, graph: IntentExecutionGraph) {
    state.history.push({ nodeId: node.id, status: 'Started', timestamp: Date.now() });

    switch (node.type) {
      case 'Task':
        await this.executeTask(node as IEMTaskNode, state);
        state.current_step = node.next || '';
        break;
      case 'Decision':
        const decisionNode = node as IEMDecisionNode;
        // Evaluate condition (simplified for demonstration)
        const isTrue = !!state.context[decisionNode.condition];
        state.current_step = isTrue ? decisionNode.onTrue : decisionNode.onFalse;
        break;
      case 'Approval':
        this.requestApproval(node as IEMApprovalNode, state);
        state.status = 'Paused'; // Stop loop, wait for human
        break;
      case 'Parallel':
        // Simplified parallel execution
        const parallelNode = node as IEMParallelNode;
        state.current_step = parallelNode.nextAfterAll; 
        // Real implementation would spawn child executions
        break;
      case 'End':
        const endNode = node as IEMEndNode;
        state.status = endNode.outcome === 'Success' ? 'Completed' : 'Failed';
        state.completed_at = Date.now();
        break;
      case 'Retry':
        // Retry logic managed by handleNodeFailure primarily, but explicit retry nodes can jump back
        break;
      case 'Compensation':
        // Executed during rollback
        break;
    }

    if (state.status !== 'Paused' && state.status !== 'Failed' && state.status !== 'Completed') {
      state.history.push({ nodeId: node.id, status: 'Success', timestamp: Date.now() });
    }
    
    this.persistState(state);
  }

  private static async executeTask(node: IEMTaskNode, state: WorkflowState) {
    // In a real system, this delegates via CQRS Command to the specific capability
    // For now, simulate delay and execution
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  private static requestApproval(node: IEMApprovalNode, state: WorkflowState) {
    ActivityCentre.log({
      capabilityId: 'kernel-execution',
      type: 'approval',
      title: `Approval Required: ${node.name}`,
      description: `Execution ${state.execution_id} requires human approval.`,
      priority: 'high'
    });
    
    // The UI would listen to ActivityCentre, present to user, and call .resumeExecution(executionId, decision)
  }

  static resumeExecution(executionId: string, graph: IntentExecutionGraph, decision: 'Approve' | 'Reject') {
    const state = this.activeExecutions.get(executionId);
    if (!state || state.status !== 'Paused') return;

    const currentNode = graph.nodes[state.current_step] as IEMApprovalNode;
    if (currentNode?.type === 'Approval') {
      state.current_step = decision === 'Approve' ? currentNode.onApprove : currentNode.onReject;
      state.status = 'Running';
      state.history.push({ nodeId: currentNode.id, status: 'Success', timestamp: Date.now() });
      this.persistState(state);
      this.runLoop(executionId, graph);
    }
  }

  private static async handleNodeFailure(node: IEMNodeBase, state: WorkflowState, graph: IntentExecutionGraph, error: any) {
    state.history.push({ nodeId: node.id, status: 'Failed', timestamp: Date.now(), error: error.message });
    
    if (node.type === 'Task') {
      const taskNode = node as IEMTaskNode;
      if (taskNode.retryPolicy && state.retry_count < taskNode.retryPolicy.maxRetries) {
        state.retry_count++;
        // Apply backoff here
        // Then re-run
        return;
      }

      if (taskNode.compensationPolicy) {
        state.status = 'Compensating';
        const p = taskNode.compensationPolicy;
        
        switch (p.action) {
          case 'Undo':
            // Implicit undo logic
            break;
          case 'Compensate':
            if (p.compensationNodeId) {
              state.current_step = p.compensationNodeId;
              return;
            }
            break;
          case 'Ignore':
            state.status = 'Running';
            state.current_step = taskNode.next || '';
            return;
          case 'Escalate':
          case 'Manual Review':
            state.status = 'Paused';
            return;
        }
      }
    }
    
    this.failExecution(state, error.message);
  }

  private static failExecution(state: WorkflowState, reason: string) {
    state.status = 'Failed';
    state.completed_at = Date.now();
    this.persistState(state);
    
    EventMesh.publish('execution.failed', { executionId: state.execution_id, reason });
  }

  private static persistState(state: WorkflowState) {
    // In production: UPDATE workflow_states SET ... WHERE execution_id = ...
    EventMesh.publish('execution.state_changed', state);
  }

  static getExecution(id: string): WorkflowState | undefined {
    return this.activeExecutions.get(id);
  }
}


import { OSCommand } from './Types';
import { EventBus } from './EventBus';
import { WorkflowCompiler } from './Compiler';
import { RuntimeAdapter } from './RuntimeAdapter';
import { ActiveSchemaAnalyzer } from './SchemaAnalyzer';
import { AutomationIntentService } from './IntentService';
import { KernelStore } from './KernelStore';

class Bus {
  async dispatch(command: OSCommand) {
    console.log(`[CommandBus] Received: ${command.type}`, command.payload);
    
    switch (command.type) {
      case 'MOVE_NODE':
        EventBus.publish({ type: 'NODE_MOVED', payload: command.payload, timestamp: Date.now() });
        break;
      case 'CREATE_NODE':
        EventBus.publish({ type: 'NODE_CREATED', payload: command.payload, timestamp: Date.now() });
        break;
      case 'CREATE_EDGE':
        const rawEdge = command.payload.edge;
        ActiveSchemaAnalyzer.analyzeEdge(rawEdge, {}, {}).then(edge => {
          EventBus.publish({ type: 'EDGE_CREATED', payload: { edge }, timestamp: Date.now() });
          EventBus.publish({ type: 'SCHEMA_MAPPED', payload: { edgeId: edge.id, metadata: edge.metadata }, timestamp: Date.now() });
        });
        break;
      case 'LOAD_WORKFLOW':
        EventBus.publish({ type: 'WORKFLOW_LOADED', payload: command.payload, timestamp: Date.now() });
        break;
      case 'GENERATE_WORKFLOW':
        AutomationIntentService.processIntent(command.payload.intent, {} as any).then(plan => {
          EventBus.publish({ type: 'WORKFLOW_GENERATED', payload: { plan }, timestamp: Date.now() });
        });
        break;
      case 'RECOMMEND_FIX':
        // The Kernel receives the recommendation and emits an event for the UI to ask for approval
        EventBus.publish({ type: 'FIX_RECOMMENDED', payload: command.payload, timestamp: Date.now() });
        break;
      case 'COMPILE_WORKFLOW':
        try {
          const state = KernelStore.getState();
          const executionGraph = WorkflowCompiler.compile({ nodes: state.nodes, edges: state.edges });
          console.log('[Compiler] Generated Execution Graph:', executionGraph);
          EventBus.publish({ type: 'WORKFLOW_COMPILED', payload: { plan: executionGraph }, timestamp: Date.now() });
        } catch (e: any) {
          console.error('[Compiler] Failed:', e.message);
        }
        break;
      case 'RUN_WORKFLOW':
        try {
          const state = KernelStore.getState();
          const executionGraph = WorkflowCompiler.compile({ nodes: state.nodes, edges: state.edges });
          
          // Fire and forget runtime execution (it publishes its own telemetry events)
          RuntimeAdapter.execute(executionGraph, command.payload.workflowId || 'session-1').catch(e => {
            console.error('[Runtime] Execution halted due to node failure:', e);
          });
        } catch (e: any) {
          console.error('[Runtime] Cannot run invalid graph:', e.message);
        }
        break;
    }
  }
}

export const CommandBus = new Bus();

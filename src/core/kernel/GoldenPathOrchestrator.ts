import { EnterpriseEventBus } from './EnterpriseEventBus';
import { EnterpriseGraph } from './EnterpriseGraph';
import { IntentResolutionEngine } from '../runtime/IntentResolutionEngine';
import { ContextResolutionEngine } from '../runtime/ContextResolutionEngine';
import { MissionPlanner } from '../runtime/MissionPlanner';
import { AuditService } from '../services/AuditService';
import { MissionExecutionContext } from '../types';
import { EnterpriseInferenceEngine } from './inference/EnterpriseInferenceEngine';

import { ExecutionPlanner } from '../runtime/ExecutionPlanner';

/**
 * @deprecated Scheduled for removal.
 * The CER Kernel is now entirely event-driven via MissionIntelligence and ExecutionIntelligence.
 * Do not import or instantiate this class. Violations will cause ArchitectureValidator failures.
 * 
 * Golden Path Orchestrator
 * The legacy master workflow controller inside the CER Kernel.
 */
export class GoldenPathOrchestrator {
  private static instance: GoldenPathOrchestrator;
  
  private eventBus: EnterpriseEventBus;
  private graph: EnterpriseGraph;
  private auditService: AuditService;
  private inferenceEngine: EnterpriseInferenceEngine;

  private intentEngine: IntentResolutionEngine;
  private contextEngine: ContextResolutionEngine;
  private missionPlanner: MissionPlanner;
  private executionPlanner: ExecutionPlanner;

  private constructor() {
    this.eventBus = EnterpriseEventBus.getInstance();
    this.graph = EnterpriseGraph.getInstance();
    this.auditService = AuditService.getInstance();
    this.inferenceEngine = EnterpriseInferenceEngine.getInstance();

    // In a future refactor, these will be renamed to the 'Intelligence' variants 
    // and moved into the Kernel. For Phase 2, we reuse the legacy instances securely.
    this.intentEngine = new IntentResolutionEngine();
    this.contextEngine = new ContextResolutionEngine();
    this.missionPlanner = new MissionPlanner();
    this.executionPlanner = new ExecutionPlanner();

    this.initializeSubscriptions();
  }

  public static getInstance(): GoldenPathOrchestrator {
    if (!GoldenPathOrchestrator.instance) {
      GoldenPathOrchestrator.instance = new GoldenPathOrchestrator();
    }
    return GoldenPathOrchestrator.instance;
  }

  private initializeSubscriptions() {
    console.log('[GoldenPathOrchestrator] Mounting listeners for Golden Path lifecycle...');
    this.eventBus.subscribe('ArtifactObserved', this.handleArtifactObserved.bind(this));
    this.eventBus.subscribe('HumanApprovalEvent', this.handleHumanApproval.bind(this));
  }

  private async handleArtifactObserved(event: any) {
    console.log(`[GoldenPathOrchestrator] Initiating Golden Path for Event: ${event.id}`);
    const sourceUri = event.payload.sourceUri || event.payload.name;

    try {
      // 1. Intent Intelligence
      const intentResult = await this.intentEngine.resolveIntent(event);
      
      // 2. Context Intelligence
      const contextGraph = await this.contextEngine.resolveContext(event, intentResult);
      
      // 3. Mission Intelligence
      const { MissionIntelligence } = await import('./intelligence/MissionIntelligence');
      const missionEngine = MissionIntelligence.getInstance();
      
      const missionContext = await missionEngine.createMission(event, intentResult.inferredMission, contextGraph);
      
      // In the legacy synchronous flow, we manually simulate Execution Planner
      // In Phase 2, this happens via the Event Bus independently.
      const missionPlan = await this.missionPlanner.planMission(contextGraph);
      const executableMission = await this.executionPlanner.buildExecutionPlan(missionPlan);
      // Mutate the context for this legacy transition
      missionContext.missionGraph = intentResult.missionGraph;
      missionContext.executionPlan = executableMission.executionSequence.map((id: string, index: number) => ({
        id: `step_${index}`,
        action: `Execute ${id}`,
        status: 'Pending'
      }));
      missionContext.actionRequired = executableMission.executionSequence.length > 0 ? 'Human Approval Required' : 'Human Action Required';
      missionContext.recommendations = await this.executionPlanner.execute(executableMission);

      missionEngine.transitionState(missionContext.id, 'PENDING_APPROVAL');

      // 3.7 Evaluate Inference Engine Hypotheses
      const hypotheses = await this.inferenceEngine.evaluate(missionContext);
      missionContext.hypotheses = hypotheses;

      // Map hypotheses to recommendations if applicable
      hypotheses.forEach(hyp => {
        if (hyp.proposedAction) {
          missionContext.recommendations.push(hyp.proposedAction);
        }
      });

      // 4. Publish Event
      console.log(`[GoldenPathOrchestrator] Pausing for Human Approval. Emitting StateUpdated...`);
      // We emit this via the new bus structure (MissionIntelligence handled the state change above)
      // This allows the legacy UI to pick it up if needed.
      this.eventBus.publish({ 
        id: (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36).substring(2),
        type: 'StateUpdated',
        schemaVersion: '1.0',
        tenantId: event.tenantId || 'system',
        actorId: 'system',
        source: 'GoldenPathOrchestrator',
        aggregateId: missionContext.id,
        aggregateKind: 'Mission',
        occurredAt: new Date().toISOString(),
        payload: missionContext,
        traceContext: event.traceContext,
        idempotencyKey: `goldenpath_${missionContext.id}`,
        classification: 'INTERNAL',
        metadata: {}
      } as any);
      
    } catch (err) {
      console.error('[GoldenPathOrchestrator] Golden Path execution failed:', err);
    }
  }

  private async handleHumanApproval(event: any) {
    const { sourceUri, workSession } = event.payload;
    const missionContext = workSession as MissionExecutionContext;
    console.log(`[GoldenPathOrchestrator] Legacy handleHumanApproval triggered for ${sourceUri}.`);
    
    // In the new architecture, we delegate the actual approval transition to MissionIntelligence
    try {
      const { MissionIntelligence } = await import('./intelligence/MissionIntelligence');
      const missionEngine = MissionIntelligence.getInstance();
      
      // Simulate actor ID from context
      const actorId = event.actorId || 'human_user';
      
      await missionEngine.approveMission(missionContext.id, actorId);
      console.log(`[GoldenPathOrchestrator] Approval routed to MissionIntelligence. ExecutionIntelligence will take over.`);
    } catch (err) {
      console.error('[GoldenPathOrchestrator] Failed to route approval:', err);
    }
  }
}

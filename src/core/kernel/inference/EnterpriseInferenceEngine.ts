import { EnterpriseEventBus } from '../EnterpriseEventBus';
import { EnterpriseKnowledgeRuntime } from '../knowledge/EnterpriseKnowledgeRuntime';
import { EnterpriseGraph } from '../EnterpriseGraph';
import { InferencePlugin } from './InferencePlugin';
import { EnterpriseEvent, InferenceContext, InferenceHypothesis } from '../../types';
import { TraceProvider } from '../../telemetry/TraceProvider';

export class EnterpriseInferenceEngine {
  private static instance: EnterpriseInferenceEngine;
  
  private bus: EnterpriseEventBus;
  private knowledge: EnterpriseKnowledgeRuntime;
  private graph: EnterpriseGraph;
  
  private pluginRegistry: Map<string, InferencePlugin> = new Map();

  private constructor() {
    this.bus = EnterpriseEventBus.getInstance();
    this.knowledge = EnterpriseKnowledgeRuntime.getInstance();
    this.graph = EnterpriseGraph.getInstance();
    this.initializeSubscriptions();
  }

  public static getInstance(): EnterpriseInferenceEngine {
    if (!EnterpriseInferenceEngine.instance) {
      EnterpriseInferenceEngine.instance = new EnterpriseInferenceEngine();
    }
    return EnterpriseInferenceEngine.instance;
  }

  public registerPlugin(plugin: InferencePlugin) {
    console.log(`[EnterpriseInferenceEngine] Registering plugin: ${plugin.id}`);
    this.pluginRegistry.set(plugin.id, plugin);
  }

  private initializeSubscriptions() {
    // Listen for events that require reasoning
    this.bus.subscribe('ArtifactObserved', this.handleTriggerEvent.bind(this));
    // Could also subscribe to SystemStateUpdated or specific thresholds in the future
  }

  private async handleTriggerEvent(event: EnterpriseEvent) {
    const tracer = TraceProvider.getInstance();
    const parentContext = event.metadata?.traceContext;
    const span = tracer.startSpan(`Inference.evaluate(${event.type})`, parentContext);
    span.setAttribute('event.id', event.id);

    console.log(`[EnterpriseInferenceEngine] Triggered by ${event.type}. Beginning Inference Pipeline...`);

    // 1. Construct Immutable Inference Context
    const payload = event.payload as any;
    
    // Attempt basic retrieval bounds on the event to prepopulate context
    const retrievalResults = payload.vendorName 
      ? await this.knowledge.retrieve(payload.vendorName) 
      : [];

    const context: InferenceContext = {
      enterpriseGraph: this.graph, // Readonly adapter in production
      enterpriseState: {}, // Mocked for now
      knowledge: this.knowledge,
      triggeringEvent: event,
      retrievalResults,
      traceContext: event.traceContext,
      timestamp: new Date().toISOString()
    };

    // 2. Execute Plugins Parallel
    const plugins = Array.from(this.pluginRegistry.values());
    const hypothesisPromises = plugins.map(async p => {
       const childSpan = tracer.startSpan(`Plugin.${p?.id ?? 'unknown'}`, span.context);
       try {
          if (!p || typeof p.execute !== 'function') {
            console.warn(`[EnterpriseInferenceEngine] Plugin ${p?.id ?? 'unknown'} has no execute method — skipping.`);
            childSpan.end();
            return [];
          }
          const res = await p.execute(context);
          childSpan.setAttribute('hypotheses.count', res.length);
          childSpan.end();
          return res;
       } catch (err: any) {
          console.error(`[EnterpriseInferenceEngine] Plugin ${p?.id ?? 'unknown'} failed:`, err);
          childSpan.setAttribute('error', err.message);
          childSpan.end();
          return [];
       }
    });
    
    const results = await Promise.all(hypothesisPromises);
    const rawHypotheses: InferenceHypothesis[] = results.flat();

    console.log(`[EnterpriseInferenceEngine] Generated ${rawHypotheses.length} hypotheses.`);

    // 3. Conflict Resolution & Calibration
    const conflictSpan = tracer.startSpan('Inference.resolveConflicts', span.context);
    const calibratedHypotheses = this.resolveConflicts(rawHypotheses);
    conflictSpan.end();

    // 4. Publish Results
    this.publishInferenceGenerated(event, context, calibratedHypotheses, span.context);
    span.end();
  }

  private resolveConflicts(hypotheses: InferenceHypothesis[]): InferenceHypothesis[] {
    // Basic mock calibration: just pass through.
    // In production, resolves competing relationships or risk scores.
    return hypotheses.map(h => {
      h.confidence = Math.min(100, h.rawConfidence + 5); // Example calibration
      return h;
    });
  }

  private publishInferenceGenerated(triggerEvent: EnterpriseEvent, context: InferenceContext, hypotheses: InferenceHypothesis[], traceContext: any) {
    // The MissionRecommendation is usually the final output that MissionIntelligence consumes
    const missionRec = hypotheses.find(h => h.type === 'MissionRecommendation');

    const inferenceEvent: EnterpriseEvent = {
      id: (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36).substring(2),
      type: 'InferenceGenerated', // Renamed from InferenceCompleted
      schemaVersion: '1.0',
      tenantId: triggerEvent.tenantId,
      actorId: 'system:inference',
      source: 'EnterpriseInferenceEngine',
      aggregateId: `inference_${Date.now()}`,
      aggregateKind: 'InferenceResult',
      payload: { 
        triggerEvent,
        hypotheses,
        missionRecommendation: missionRec
      },
      occurredAt: new Date().toISOString(),
      traceContext: triggerEvent.traceContext,
      idempotencyKey: `inference_gen_${Date.now()}`,
      classification: 'INTERNAL',
      metadata: {}
    };

    this.bus.publish(inferenceEvent);
  }
}

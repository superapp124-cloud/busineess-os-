import { EnterpriseGraph } from './EnterpriseGraph';
import { EnterpriseEventBus } from './EnterpriseEventBus';
import { ProjectionEngine } from './ProjectionEngine';
import { GoldenPathOrchestrator } from './GoldenPathOrchestrator';
import { CapabilityRegistry } from './CapabilityRegistry';
import { IntegrationRuntime } from './IntegrationRuntime';
import { EnterpriseKnowledgeFabric } from './EnterpriseKnowledgeFabric';
import { HRKnowledgePack } from '../knowledge/HRKnowledgePack';
import { FinanceKnowledgePack } from '../knowledge/FinanceKnowledgePack';
import { IntentKernel } from '../../kernel/IntentKernel';
import { EnterpriseInferenceEngine } from './inference/EnterpriseInferenceEngine';
import { RiskAnalyzerPlugin } from './inference/plugins/RiskAnalyzerPlugin';

/**
 * Enterprise Bootstrap Runtime
 * Handles the async initialization of all enterprise-grade components.
 */
export class BootstrapRuntime {
  private static instance: BootstrapRuntime;
  private isBooted = false;

  private constructor() {}

  public static getInstance(): BootstrapRuntime {
    if (!BootstrapRuntime.instance) {
      BootstrapRuntime.instance = new BootstrapRuntime();
    }
    return BootstrapRuntime.instance;
  }

  public async boot(): Promise<void> {
    if (this.isBooted) return;
    
    console.log('[BootstrapRuntime] 🚀 Initiating CER Kernel Boot Sequence...');
    const start = performance.now();

    // 1. Boot the legacy Intent Kernel (Phase 1 Support)
    await IntentKernel.boot();

    // 2. Initialize Enterprise State Stores
    const graph = EnterpriseGraph.getInstance();
    await graph.initialize();

    // 2.1 Boot Air-Gapped / Cloud Infrastructure
    const deploymentMode = process.env.DEPLOYMENT_MODE || 'AIR_GAPPED'; // Mocking production air-gapped env
    console.log(`[Bootstrap] Platform booting in ${deploymentMode} mode.`);
    
    if (deploymentMode === 'AIR_GAPPED') {
      const { AirGappedLLMProvider } = await import('../ai/providers/AirGappedLLMProvider');
      const llm = new AirGappedLLMProvider();
      console.log(`[Bootstrap] Initialized ${llm.id}. External web capabilities disabled.`);
    }

    // 2.5 Initialize Enterprise Inference Engine
    console.log('[Bootstrap] Mounting Enterprise Inference Engine...');
    const inferenceEngine = EnterpriseInferenceEngine.getInstance();
    inferenceEngine.registerPlugin(new RiskAnalyzerPlugin());

    // 4. Mount Enterprise Event Bus
    console.log('[Bootstrap] Mounting Enterprise Event Bus...');
    const eventBus = EnterpriseEventBus.getInstance();
    eventBus.start();

    // 4.1 Mount Projection Engine & Handlers
    console.log('[Bootstrap] Mounting Projection Engine & Handlers...');
    const projectionEngine = ProjectionEngine.getInstance();
    
    const { GraphProjection } = await import('./GraphProjection');
    const { AuditProjection } = await import('./AuditProjection');
    const { EnterpriseStateProjection } = await import('./EnterpriseStateProjection');
    const { KnowledgeProjectionHandler } = await import('./KnowledgeProjectionHandler');
    
    projectionEngine.registerHandler(new GraphProjection());
    projectionEngine.registerHandler(new AuditProjection());
    projectionEngine.registerHandler(new EnterpriseStateProjection());
    projectionEngine.registerHandler(new KnowledgeProjectionHandler());
    
    projectionEngine.start();

    // 4.2 Mount Intelligence Engines
    console.log('[Bootstrap] Mounting Intelligence Engines...');
    const { MissionIntelligence } = await import('./intelligence/MissionIntelligence');
    const { ExecutionIntelligence } = await import('./intelligence/ExecutionIntelligence');
    const { EnterpriseKnowledgeRuntime } = await import('./knowledge/EnterpriseKnowledgeRuntime');
    MissionIntelligence.getInstance();
    ExecutionIntelligence.getInstance();
    EnterpriseKnowledgeRuntime.getInstance();

    // 4.5 Mount Golden Path Orchestrator
    console.log('[Bootstrap] Mounting Golden Path Orchestrator...');
    const orchestrator = GoldenPathOrchestrator.getInstance();

    // 5. Initialize Extensibility Layer (Phase 3)
    console.log('[Bootstrap] Initializing Capability Registry & Integration Runtime...');
    const capabilityRegistry = CapabilityRegistry.getInstance();
    const integrationRuntime = IntegrationRuntime.getInstance();

    // 6. Mount Knowledge Packs into the Enterprise Knowledge Fabric
    console.log('[Bootstrap] Mounting Modular Knowledge Packs...');
    const knowledgeFabric = EnterpriseKnowledgeFabric.getInstance();
    
    knowledgeFabric.registerPack(HRKnowledgePack.id, HRKnowledgePack);
    knowledgeFabric.registerPack(FinanceKnowledgePack.id, FinanceKnowledgePack);

    this.isBooted = true;
    // 4.6 Initialize Reference Scenarios
    console.log('[Bootstrap] Initializing Reference Workflows (Finance, Legal, HR, Procurement, Mass Domains)...');
    const { FinanceScenario } = await import('../scenarios/FinanceScenario');
    const { LegalScenario } = await import('../scenarios/LegalScenario');
    const { HRScenario } = await import('../scenarios/HRScenario');
    const { ProcurementScenario } = await import('../scenarios/ProcurementScenario');
    const { MassiveScenarioLoader } = await import('../scenarios/MassiveScenarioLoader');
    
    // Register Inference Engine Plugins
    const { RelationshipPlugin } = await import('./inference/plugins/RelationshipPlugin');
    const { PolicyEvaluationPlugin } = await import('./inference/plugins/PolicyEvaluationPlugin');
    const { RiskPlugin } = await import('./inference/plugins/RiskPlugin');
    const { MissionRecommendationPlugin } = await import('./inference/plugins/MissionRecommendationPlugin');
    inferenceEngine.registerPlugin(new RelationshipPlugin());
    inferenceEngine.registerPlugin(new PolicyEvaluationPlugin());
    inferenceEngine.registerPlugin(new RiskPlugin());
    inferenceEngine.registerPlugin(new MissionRecommendationPlugin());
    
    const financeScenario = new FinanceScenario();
    const legalScenario = new LegalScenario();
    const hrScenario = new HRScenario();
    const procurementScenario = new ProcurementScenario();
    const massScenario = new MassiveScenarioLoader();
    
    // Seed Knowledge
    financeScenario.seedKnowledge();
    legalScenario.seedKnowledge();
    hrScenario.seedKnowledge();
    procurementScenario.seedKnowledge();
    massScenario.seedKnowledge();

    console.log('[Bootstrap] CER Kernel v1.0 Boot Sequence Complete. All systems nominal.');
    
    // 5. Trigger Reference Workflow (Mock Invoice Arrival)
    setTimeout(() => {
      console.log('[Bootstrap] Simulating incoming ArtifactObserved (Acme Corp Invoice - $15,000)...');
      EnterpriseEventBus.getInstance().publish({
        id: (typeof window !== 'undefined' && window.crypto?.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36).slice(2),
        type: 'ArtifactObserved',
        schemaVersion: '1.0',
        tenantId: 'system',
        actorId: 'system:scanner',
        source: 'InvoiceScanner',
        aggregateId: `invoice_${Date.now()}`,
        aggregateKind: 'Artifact',
        payload: { type: 'Invoice', id: `INV-${Date.now()}`, amount: 15000, vendorName: 'Acme Corp' },
        occurredAt: new Date().toISOString(),
        traceContext: { correlationId: 'ref_flow', traceId: 'ref_flow', spanId: 'ref_flow' },
        idempotencyKey: `invoice_arrival_${Date.now()}`,
        classification: 'INTERNAL',
        metadata: {}
      });
    }, 2000); // 2 second delay to ensure boot is complete
  }

  private async loadConfiguration() {
    console.log('[Bootstrap] Loading enterprise configuration...');
    // Simulated async load
    return new Promise(resolve => setTimeout(resolve, 100));
  }

  private async initializeSecurity() {
    console.log('[Bootstrap] Initializing Identity & Security Context...');
    // Simulated async load
    return new Promise(resolve => setTimeout(resolve, 100));
  }

  private async discoverPlugins() {
    console.log('[Bootstrap] Discovering Platform Plugins and Connectors...');
    // Simulated async load
    return new Promise(resolve => setTimeout(resolve, 100));
  }
}

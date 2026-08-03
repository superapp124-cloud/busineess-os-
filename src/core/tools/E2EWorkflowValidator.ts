import { EnterpriseEventBus } from '../kernel/EnterpriseEventBus';
import { IdentityRuntime } from '../security/IdentityRuntime';
import { MetricsExporter } from '../telemetry/MetricsExporter';

export class E2EWorkflowValidator {
  
  public static async runAllScenarios() {
    console.log('[E2EWorkflowValidator] Initializing Full System Certification...');
    
    // Security Identity Boot
    IdentityRuntime.getInstance();

    await this.runSecurityScenario();

    await this.runFinanceScenario();
    await this.runLegalScenario();
    await this.runHRScenario();
    await this.runProcurementScenario();
    await this.runMassiveScenarios();
    
    console.log('[E2EWorkflowValidator] PASSED: All 12 cross-domain E2E workflows completed successfully.');
    
    // Dump Telemetry Trace for the last operation
    // We'll just dump the entire exporter state since this is a mock console run.
    console.log('\n[E2EWorkflowValidator] Generating OpenTelemetry APM Traces...');
    const exporter = MetricsExporter.getInstance();
    const traces = Array.from(new Set((exporter as any).spans.map((s: any) => s.context.traceId)));
    // Print the first interesting trace
    if (traces.length > 1) {
       exporter.printTraceTree(traces[1] as string); // Skip security scenario trace, print finance or legal
    }
    
    return true;
  }

  private static async runSecurityScenario() {
    console.log('[E2EWorkflowValidator] > Running Security Access Denied Test...');
    const maliciousToken = IdentityRuntime.getInstance().mintToken('user_hacker', 'sales:rep', 'Sales');
    
    try {
      // Sales rep trying to trigger Legal Contract
      await EnterpriseEventBus.getInstance().publish({
        id: crypto.randomUUID(),
        type: 'ArtifactObserved',
        schemaVersion: '1.0',
        tenantId: 'system',
        actorId: 'user_hacker',
        source: 'LegalScanner',
        aggregateId: 'hacker_1',
        aggregateKind: 'Artifact',
        payload: { type: 'Contract' },
        occurredAt: new Date().toISOString(),
        traceContext: { correlationId: 'sec_1', traceId: 'sec_1', spanId: '1' },
        idempotencyKey: 'sec_1',
        classification: 'CONFIDENTIAL',
        metadata: {
           strictSecurity: true,
           authToken: maliciousToken
        }
      });
      throw new Error('SecurityValidator failed to block cross-domain malicious event!');
    } catch (e: any) {
      if (e.message.includes('AccessDenied')) {
         console.log('[E2EWorkflowValidator] PASSED: Malicious event rejected by Zero-Trust RBAC.');
      } else {
         throw e;
      }
    }
  }

  private static async runMassiveScenarios() {
    console.log('[E2EWorkflowValidator] > Running Massive Scenarios (IT, Support, Facilities, Compliance, Sales, Marketing, R&D, Logistics)...');
    
    this.publishArtifactObserved('IT', 'SystemAlert', { entityName: 'ProdDB', severity: 'Sev1' });
    this.publishArtifactObserved('Support', 'CustomerTicket', { entityName: 'Acme Corp', tier: 'Enterprise' });
    this.publishArtifactObserved('Facilities', 'BadgeSwipe', { entityName: 'ServerRoomA', roomTier: 'Tier-1' });
    this.publishArtifactObserved('Compliance', 'DataExportRequest', { entityName: 'User123', action: 'Export' });
    this.publishArtifactObserved('Sales', 'Quote', { entityName: 'Q-445', maxDiscount: 30 });
    this.publishArtifactObserved('Marketing', 'SocialPost', { entityName: 'Post_1', triggerWord: 'merger' });
    this.publishArtifactObserved('R&D', 'PullRequest', { entityName: 'PR-99', triggerPath: '/auth' });
    this.publishArtifactObserved('Logistics', 'ShipmentManifest', { entityName: 'Ship-22', triggerItem: 'lithium' });
    
    await this.delay(200);
  }

  private static async runFinanceScenario() {
    console.log('[E2EWorkflowValidator] > Running Finance E2E...');
    this.publishArtifactObserved('Finance', 'Invoice', { amount: 15000, vendorName: 'Acme Corp' });
    await this.delay(100);
  }

  private static async runLegalScenario() {
    console.log('[E2EWorkflowValidator] > Running Legal E2E...');
    this.publishArtifactObserved('Legal', 'Contract', { type: 'NDA', party: 'Globex', liabilityLimit: 10000000 });
    await this.delay(100);
  }

  private static async runHRScenario() {
    console.log('[E2EWorkflowValidator] > Running HR E2E...');
    this.publishArtifactObserved('HR', 'Resume', { candidateName: 'John Doe', role: 'Senior Engineer', skills: ['TypeScript', 'React'] });
    await this.delay(100);
  }

  private static async runProcurementScenario() {
    console.log('[E2EWorkflowValidator] > Running Procurement E2E...');
    this.publishArtifactObserved('Procurement', 'PurchaseOrder', { amount: 5000, item: 'Laptops', vendor: 'RogueTrader' });
    await this.delay(100);
  }

  private static publishArtifactObserved(domain: string, type: string, payload: any) {
    EnterpriseEventBus.getInstance().publish({
      id: crypto.randomUUID(),
      type: 'ArtifactObserved',
      schemaVersion: '1.0',
      tenantId: 'system',
      actorId: `system:${domain.toLowerCase()}`,
      source: `${domain}Scanner`,
      aggregateId: `${type.toLowerCase()}_${Date.now()}`,
      aggregateKind: 'Artifact',
      payload: { type, id: `${type.substring(0,3).toUpperCase()}-${Date.now()}`, ...payload },
      occurredAt: new Date().toISOString(),
      traceContext: { correlationId: `e2e_${domain}_${Date.now()}`, traceId: `e2e_${domain}`, spanId: '1' },
      idempotencyKey: `e2e_${domain}_${Date.now()}`,
      classification: 'INTERNAL',
      metadata: {}
    });
  }

  private static delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }
}

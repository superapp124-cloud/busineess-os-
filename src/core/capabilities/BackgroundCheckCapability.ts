import { ICapability, CapabilityMetadata } from '../types';
import { EnterpriseEventBus } from '../kernel/EnterpriseEventBus';

export class BackgroundCheckCapability implements ICapability {
  public metadata: CapabilityMetadata = {
    id: 'cap_bg_check',
    name: 'Dispatch to Background Check API',
    description: 'Mocks dispatching a candidate to a third-party screening service.',
    category: 'HR',
    requiredContext: ['candidateName'],
    produces: ['screeningId'],
    cost: 50,
    latency: 800,
    executionMode: 'asynchronous',
    version: '1.0.0'
  };

  private bus = EnterpriseEventBus.getInstance();

  public async execute(context: any): Promise<any> {
    console.log(`[BackgroundCheckCapability] Executing capability: ${this.metadata.name}`);
    await new Promise(res => setTimeout(res, this.metadata.latency));

    this.bus.publish({
      id: crypto.randomUUID(),
      type: 'ConnectorStateChanged',
      schemaVersion: '1.0',
      tenantId: 'system',
      actorId: 'system:capability',
      source: 'BackgroundCheckCapability',
      aggregateId: 'connector_bgcheck',
      aggregateKind: 'Connector',
      payload: { status: 'Dispatched', screeningId: `bg_${Date.now()}` },
      occurredAt: new Date().toISOString(),
      traceContext: { correlationId: 'cap_hr', traceId: 'cap_hr', spanId: 'cap_hr' },
      idempotencyKey: `exec_hr_${Date.now()}`,
      classification: 'INTERNAL',
      metadata: {}
    });

    console.log(`[BackgroundCheckCapability] Execution Complete. Sent to Screening API.`);
    return [{ action: 'Background Screening', status: 'Success' }];
  }
}

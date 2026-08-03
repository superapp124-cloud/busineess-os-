import { ICapability, CapabilityMetadata } from '../types';
import { EnterpriseEventBus } from '../kernel/EnterpriseEventBus';

export class ERPStagingCapability implements ICapability {
  public metadata: CapabilityMetadata = {
    id: 'cap_erp_staging',
    name: 'Post to ERP Staging',
    description: 'Mocks posting a financial invoice into the ERP staging tables.',
    category: 'Finance',
    requiredContext: ['amount', 'approval_required'],
    produces: ['erp_sync_id'],
    cost: 0,
    latency: 1000,
    executionMode: 'asynchronous',
    version: '1.0.0'
  };

  private bus = EnterpriseEventBus.getInstance();

  public async execute(context: any): Promise<any> {
    console.log(`[ERPStagingCapability] Executing capability: ${this.metadata.name}`);
    
    // Simulate API delay
    await new Promise(res => setTimeout(res, this.metadata.latency));

    // Emit Connector State Changed
    this.bus.publish({
      id: crypto.randomUUID(),
      type: 'ConnectorStateChanged',
      schemaVersion: '1.0',
      tenantId: 'system',
      actorId: 'system:capability',
      source: 'ERPStagingCapability',
      aggregateId: 'connector_erp_sap',
      aggregateKind: 'Connector',
      payload: { status: 'Synced', syncId: `sync_${Date.now()}` },
      occurredAt: new Date().toISOString(),
      traceContext: { correlationId: 'cap_exec', traceId: 'cap_exec', spanId: 'cap_exec' },
      idempotencyKey: `exec_erp_${Date.now()}`,
      classification: 'INTERNAL',
      metadata: {}
    });

    console.log(`[ERPStagingCapability] Execution Complete. Sent to Staging.`);
    return [{ action: 'ERP Sync', status: 'Success' }];
  }
}

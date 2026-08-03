import { ICapability, CapabilityMetadata } from '../types';
import { EnterpriseEventBus } from '../kernel/EnterpriseEventBus';

export class SupplierDispatchCapability implements ICapability {
  public metadata: CapabilityMetadata = {
    id: 'cap_po_dispatch',
    name: 'Dispatch Purchase Order to Supplier',
    description: 'Mocks sending a PO to the supplier B2B API.',
    category: 'Procurement',
    requiredContext: ['item', 'amount'],
    produces: ['supplierOrderId'],
    cost: 0,
    latency: 500,
    executionMode: 'asynchronous',
    version: '1.0.0'
  };

  private bus = EnterpriseEventBus.getInstance();

  public async execute(context: any): Promise<any> {
    console.log(`[SupplierDispatchCapability] Executing capability: ${this.metadata.name}`);
    await new Promise(res => setTimeout(res, this.metadata.latency));

    this.bus.publish({
      id: crypto.randomUUID(),
      type: 'ConnectorStateChanged',
      schemaVersion: '1.0',
      tenantId: 'system',
      actorId: 'system:capability',
      source: 'SupplierDispatchCapability',
      aggregateId: 'connector_supplier',
      aggregateKind: 'Connector',
      payload: { status: 'Dispatched', supplierOrderId: `po_${Date.now()}` },
      occurredAt: new Date().toISOString(),
      traceContext: { correlationId: 'cap_pro', traceId: 'cap_pro', spanId: 'cap_pro' },
      idempotencyKey: `exec_pro_${Date.now()}`,
      classification: 'INTERNAL',
      metadata: {}
    });

    console.log(`[SupplierDispatchCapability] Execution Complete. Sent to Supplier API.`);
    return [{ action: 'PO Dispatch', status: 'Success' }];
  }
}

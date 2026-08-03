import { ICapability, CapabilityMetadata } from '../types';
import { EnterpriseEventBus } from '../kernel/EnterpriseEventBus';

abstract class MockCapability implements ICapability {
  public abstract metadata: CapabilityMetadata;
  private bus = EnterpriseEventBus.getInstance();

  public async execute(context: any): Promise<any> {
    console.log(`[${this.constructor.name}] Executing capability: ${this.metadata.name}`);
    await new Promise(res => setTimeout(res, this.metadata.latency));

    this.bus.publish({
      id: crypto.randomUUID(),
      type: 'ConnectorStateChanged',
      schemaVersion: '1.0',
      tenantId: 'system',
      actorId: 'system:capability',
      source: this.constructor.name,
      aggregateId: `conn_${this.metadata.id}`,
      aggregateKind: 'Connector',
      payload: { status: 'Dispatched', actionId: `${this.metadata.id}_${Date.now()}` },
      occurredAt: new Date().toISOString(),
      traceContext: { correlationId: 'cap_mass', traceId: 'cap_mass', spanId: 'cap_mass' },
      idempotencyKey: `exec_${this.metadata.id}_${Date.now()}`,
      classification: 'INTERNAL',
      metadata: {}
    });

    console.log(`[${this.constructor.name}] Execution Complete.`);
    return [{ action: this.metadata.name, status: 'Success' }];
  }
}

export class PagerDutyCapability extends MockCapability {
  metadata: CapabilityMetadata = { id: 'cap_pager_duty', name: 'PagerDuty Dispatch', description: '', category: 'IT', requiredContext: [], produces: [], cost: 0, latency: 100, executionMode: 'asynchronous', version: '1.0.0' };
}
export class TicketEscalationCapability extends MockCapability {
  metadata: CapabilityMetadata = { id: 'cap_ticket_escalation', name: 'Ticket Escalation', description: '', category: 'Support', requiredContext: [], produces: [], cost: 0, latency: 100, executionMode: 'asynchronous', version: '1.0.0' };
}
export class DoorLockdownCapability extends MockCapability {
  metadata: CapabilityMetadata = { id: 'cap_door_lockdown', name: 'Door Lockdown', description: '', category: 'Facilities', requiredContext: [], produces: [], cost: 0, latency: 100, executionMode: 'asynchronous', version: '1.0.0' };
}
export class PrivacyAuditCapability extends MockCapability {
  metadata: CapabilityMetadata = { id: 'cap_privacy_audit', name: 'Privacy Audit', description: '', category: 'Compliance', requiredContext: [], produces: [], cost: 0, latency: 100, executionMode: 'asynchronous', version: '1.0.0' };
}
export class DealDeskCapability extends MockCapability {
  metadata: CapabilityMetadata = { id: 'cap_deal_desk', name: 'Deal Desk Review', description: '', category: 'Sales', requiredContext: [], produces: [], cost: 0, latency: 100, executionMode: 'asynchronous', version: '1.0.0' };
}
export class BrandApprovalCapability extends MockCapability {
  metadata: CapabilityMetadata = { id: 'cap_brand_approval', name: 'Brand Approval', description: '', category: 'Marketing', requiredContext: [], produces: [], cost: 0, latency: 100, executionMode: 'asynchronous', version: '1.0.0' };
}
export class SecurityScanCapability extends MockCapability {
  metadata: CapabilityMetadata = { id: 'cap_security_scan', name: 'Security Scan', description: '', category: 'R&D', requiredContext: [], produces: [], cost: 0, latency: 100, executionMode: 'asynchronous', version: '1.0.0' };
}
export class HazmatComplianceCapability extends MockCapability {
  metadata: CapabilityMetadata = { id: 'cap_hazmat_compliance', name: 'Hazmat Compliance Check', description: '', category: 'Logistics', requiredContext: [], produces: [], cost: 0, latency: 100, executionMode: 'asynchronous', version: '1.0.0' };
}

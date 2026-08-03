import { EnterpriseObject } from '../ontology/EnterpriseObject';

/**
 * Audit Service
 * Platform Service responsible for an immutable ledger of all execution actions.
 */
export class AuditService {
  private static instance: AuditService;
  private auditLog: any[] = [];

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  public logExecution(action: string, object: EnterpriseObject, context: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      targetId: object.id,
      targetType: object.type,
      context
    };
    this.auditLog.push(entry);
    console.log(`[AuditService] Immutable log recorded: ${action} on ${object.type} (${object.id})`);
  }

  public getAuditTrail() {
    return this.auditLog;
  }
}

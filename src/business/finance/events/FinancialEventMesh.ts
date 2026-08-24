/**
 * CHATR Financial Event Mesh (Phase 2A)
 * Canonical event contracts, normalization, and routing.
 *
 * Core rule:
 * Business OS Subsystems -> Financial Events -> Normalizer -> Accounting Proposal -> Policy Engine -> Posting Engine -> GL
 */

export interface CanonicalFinancialEvent {
  event_id: string;
  event_type: FinancialEventType;
  organization_id: string;
  legal_entity_id?: string;
  source_system: 'chatr-crm' | 'chatr-recruitment' | 'stripe' | 'razorpay' | 'bank-csv' | 'manual';
  source_object_type: string;
  source_object_id: string;
  source_event_id?: string;
  idempotency_key: string;
  occurred_at: string;
  schema_version: string;
  currency: string;
  payload: Record<string, unknown>;
  correlation_id?: string;
}

export type FinancialEventType =
  | 'customer.created'
  | 'customer.updated'
  | 'vendor.created'
  | 'vendor.updated'
  | 'contract.created'
  | 'contract.signed'
  | 'contract.modified'
  | 'contract.cancelled'
  | 'invoice.created'
  | 'invoice.updated'
  | 'invoice.sent'
  | 'invoice.overdue'
  | 'invoice.credited'
  | 'invoice.cancelled'
  | 'payment.received'
  | 'payment.refunded'
  | 'payment.failed'
  | 'bill.created'
  | 'bill.approved'
  | 'bill.rejected'
  | 'bill.paid'
  | 'expense.created'
  | 'expense.approved'
  | 'expense.rejected'
  | 'bank.transaction.received';

export class FinancialEventMesh {
  /**
   * Generates a deterministic idempotency key for an event if not explicitly provided
   */
  public static generateIdempotencyKey(
    sourceSystem: string,
    objectType: string,
    objectId: string,
    eventType: string,
    versionOrTimestamp: string
  ): string {
    return `fin:${sourceSystem}:${objectType}:${objectId}:${eventType}:${versionOrTimestamp}`;
  }

  /**
   * Validates that an incoming event strictly complies with the canonical schema
   */
  public static validateEvent(event: Partial<CanonicalFinancialEvent>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!event.event_type) errors.push('event_type is required');
    if (!event.organization_id) errors.push('organization_id is required');
    if (!event.source_system) errors.push('source_system is required');
    if (!event.source_object_id) errors.push('source_object_id is required');
    if (!event.idempotency_key) errors.push('idempotency_key is required');
    if (!event.currency || event.currency.length !== 3) errors.push('Valid 3-letter currency code is required');
    if (!event.payload || typeof event.payload !== 'object') errors.push('Valid JSON payload object is required');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Normalizes arbitrary business events (e.g. from CRM or Recruitment) into canonical financial events
   */
  public static normalizeBusinessEvent(
    rawType: string,
    rawPayload: any,
    orgId: string,
    legalEntityId: string,
    sourceSystem: 'chatr-crm' | 'chatr-recruitment' | 'stripe' | 'razorpay' | 'bank-csv' | 'manual'
  ): CanonicalFinancialEvent {
    let eventType: FinancialEventType;
    let objectType = 'generic';
    let objectId = rawPayload.id || String(Date.now());
    let currency = rawPayload.currency || 'INR';

    switch (rawType) {
      case 'crm.deal.won':
      case 'deal.won':
        eventType = 'invoice.created';
        objectType = 'deal';
        break;
      case 'recruitment.offer.accepted':
      case 'candidate.hired':
        eventType = 'expense.created';
        objectType = 'offer';
        break;
      case 'stripe.payment_intent.succeeded':
      case 'razorpay.payment.captured':
        eventType = 'payment.received';
        objectType = 'payment';
        break;
      default:
        eventType = (rawType as FinancialEventType) || 'invoice.created';
    }

    const idempotencyKey = this.generateIdempotencyKey(
      sourceSystem,
      objectType,
      objectId,
      eventType,
      rawPayload.updated_at || new Date().toISOString().substring(0, 10)
    );

    return {
      event_id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      event_type: eventType,
      organization_id: orgId,
      legal_entity_id: legalEntityId,
      source_system: sourceSystem,
      source_object_type: objectType,
      source_object_id: objectId,
      idempotency_key: idempotencyKey,
      occurred_at: new Date().toISOString(),
      schema_version: '1.0',
      currency,
      payload: rawPayload,
    };
  }
}

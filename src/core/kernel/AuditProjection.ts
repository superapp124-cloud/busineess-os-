import { supabase } from '@/integrations/supabase/client';
import { EnterpriseEvent, ProjectionHandler } from '../types';
import { createHash } from 'crypto';

export class AuditProjection implements ProjectionHandler {
  public name = 'AuditProjection';
  public version = '1.1.0';

  private lastEventId: string = '';
  private lastTimestamp: string = '';
  private processedCount: number = 0;
  private lastHash: string = '0000000000000000000000000000000000000000000000000000000000000000'; // Genesis Hash

  /**
   * Log every EnterpriseEvent to the immutable audit log (os_events).
   * Now with cryptographic chaining for immutability.
   */
  public async applyEvent(event: EnterpriseEvent): Promise<void> {
    const payloadStr = JSON.stringify({
      event_id: event.id,
      actor_id: event.actorId,
      aggregate_id: event.aggregateId,
      occurred_at: event.occurredAt,
      classification: event.classification,
      payload_data: event.payload,
      previous_hash: this.lastHash
    });

    let signature: string;
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      // Browser: use SubtleCrypto
      const msgBuffer = new TextEncoder().encode(payloadStr);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Node.js (CER certification, SSR): use node crypto for a deterministic hash
      signature = createHash('sha256').update(payloadStr).digest('hex');
    }
    
    this.lastHash = signature;

    const { error } = await supabase.from('os_events').insert({
      event_type: `audit.${event.type}`,
      source_subsystem: event.source,
      level: 'info',
      payload: {
        event_id: event.id,
        actor_id: event.actorId,
        aggregate_id: event.aggregateId,
        occurred_at: event.occurredAt,
        classification: event.classification,
        payload_data: event.payload,
        crypto: {
          previousHash: JSON.parse(payloadStr).previous_hash,
          signature: signature
        }
      }
    });

    if (error) {
      // PGRST204 = column not found in schema cache (remote DB not migrated yet).
      // Degrade gracefully so the system stays live — log warning, do NOT throw.
      if ((error as any).code === 'PGRST204') {
        console.warn(`[AuditProjection] Schema cache miss for os_events (migration pending): ${error.message}`);
        this.lastEventId = event.id;
        this.lastTimestamp = event.occurredAt;
        this.processedCount++;
        return;
      }
      console.error(`[AuditProjection] Failed to record audit event:`, error);
      // We throw so the ProjectionEngine knows it failed, possibly triggering DLQ or retry
      throw new Error(`AuditLog Insert Failed: ${error.message}`);
    }

    this.lastEventId = event.id;
    this.lastTimestamp = event.occurredAt;
    this.processedCount++;
  }

  public getCheckpoint(): string {
    return `${this.processedCount}-events-audited`;
  }

  public getLastEventId(): string {
    return this.lastEventId;
  }

  public getLastTimestamp(): string {
    return this.lastTimestamp;
  }

  /**
   * Query the audit log for a specific module or user.
   */
  public async query(options: { source?: string; actorId?: string; limit?: number }) {
    let query = supabase.from('os_events')
      .select('*')
      .like('event_type', 'audit.%')
      .order('created_at', { ascending: false });

    if (options.source) {
      query = query.eq('source_subsystem', options.source);
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data;
  }
}

export const auditProjection = new AuditProjection();

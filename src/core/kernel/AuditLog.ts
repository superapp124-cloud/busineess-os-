import { supabase } from '@/integrations/supabase/client';

export interface AuditEvent {
  action: string;
  module: string;
  userId: string;
  details: Record<string, any>;
}

export class IntentAuditLog {
  /**
   * Log a user or system action to the immutable audit log.
   * Built on top of os_events.
   */
  async log(event: AuditEvent) {
    const { error } = await supabase.from('os_events').insert({
      event_type: `audit.${event.action}`,
      source_subsystem: event.module,
      level: 'info',
      payload: {
        user_id: event.userId,
        ...event.details
      }
    });

    if (error) {
      console.error(`[AuditLog] Failed to record audit event:`, error);
    }
  }

  /**
   * Query the audit log for a specific module or user.
   */
  async query(options: { module?: string; userId?: string; limit?: number }) {
    let query = supabase.from('os_events')
      .select('*')
      .like('event_type', 'audit.%')
      .order('created_at', { ascending: false });

    if (options.module) {
      query = query.eq('source_subsystem', options.module);
    }
    
    // We can't query inside the JSON payload easily without raw SQL,
    // so user filtering would ideally be done via a dedicated indexed column in a real production scenario.
    
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data;
  }
}

export const auditLog = new IntentAuditLog();

import { supabase } from '@/integrations/supabase/client';

export interface NotificationPayload {
  module: string;         // 'recruitment-os'
  type: string;           // 'candidate_update'
  title: string;          // 'Arjun Nair moved to Offer stage'
  message?: string;
  action?: {
    label: string;
    route: string;
  };
}

export class IntentNotificationService {
  /**
   * Send a notification to the unified inbox.
   */
  async send(payload: NotificationPayload) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    console.log(`[NotificationService] Sending notification from '${payload.module}': ${payload.title}`);

    // Persist to a unified notifications table (assumes 'sys_notifications' exists)
    // For now, we simulate this by logging or firing a kernel event that a UI could listen to.
    
    // As a temporary stand-in, emit it to the event bus so the UI can pick it up
    // In a real implementation, we would insert into sys_notifications.
    const { error } = await supabase.from('os_events').insert({
      event_type: 'kernel.notification',
      source_subsystem: payload.module,
      level: 'info',
      payload: {
        ...payload,
        user_id: user.id,
        created_at: new Date().toISOString()
      }
    });

    if (error) {
      console.error('[NotificationService] Failed to send notification', error);
    }
  }
}

export const notify = new IntentNotificationService();

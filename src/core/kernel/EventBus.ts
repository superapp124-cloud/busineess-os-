import { supabase } from '@/integrations/supabase/client';

export type EventCallback = (payload: any) => Promise<void> | void;

class IntentEventBus {
  private listeners: Map<string, EventCallback[]> = new Map();
  private isListeningToSupabase = false;

  /**
   * Emit an event both locally and to the Supabase os_events table.
   * This is the backbone of cross-module automation.
   */
  async emit(eventType: string, payload: any, sourceSubsystem: string = 'kernel') {
    // 1. Notify local in-memory listeners immediately
    this.notifyLocalListeners(eventType, payload);

    // 2. Persist to os_events for audit and cross-client processing
    const { error } = await supabase.from('os_events').insert({
      event_type: eventType,
      source_subsystem: sourceSubsystem,
      payload,
      level: 'info'
    });

    if (error) {
      console.error(`[EventBus] Failed to emit ${eventType} to DB:`, error);
    }
  }

  /**
   * Subscribe to an event type.
   */
  on(eventType: string, callback: EventCallback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
    this.ensureSupabaseListener();
  }

  /**
   * Unsubscribe from an event type.
   */
  off(eventType: string, callback: EventCallback) {
    if (!this.listeners.has(eventType)) return;
    const filtered = this.listeners.get(eventType)!.filter(cb => cb !== callback);
    this.listeners.set(eventType, filtered);
  }

  private notifyLocalListeners(eventType: string, payload: any) {
    const callbacks = this.listeners.get(eventType) || [];
    callbacks.forEach(cb => {
      try {
        cb(payload);
      } catch (err) {
        console.error(`[EventBus] Error in listener for ${eventType}:`, err);
      }
    });
  }

  private ensureSupabaseListener() {
    if (this.isListeningToSupabase) return;
    this.isListeningToSupabase = true;

    // Listen to real-time events inserted into os_events
    // This allows modules on different clients/sessions to react.
    supabase.channel('kernel-events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'os_events' },
        (payload) => {
          const newEvent = payload.new as any;
          this.notifyLocalListeners(newEvent.event_type, newEvent.payload);
        }
      )
      .subscribe();
  }
}

export const eventBus = new IntentEventBus();

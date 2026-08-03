import { supabase } from '@/integrations/supabase/client';
import { IEventBus, EventCallback, EventContext } from '../contracts/events/IEventBus';
import { IObservability } from '../contracts/common/Observability';

/**
 * The EventBus implementation that fulfills the IEventBus contract.
 * For Phase 1, this wraps the legacy Supabase real-time broadcasting logic 
 * to ensure existing components don't break, while offering the new strongly-typed API.
 */
export class EventBus implements IEventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isListeningToSupabase = false;
  private observability?: IObservability;

  constructor(observability?: IObservability) {
    this.observability = observability;
  }

  public publish<T>(eventName: string, payload: T, source: string): void {
    const context: EventContext = {
      eventId: (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36).substring(2),
      timestamp: Date.now(),
      source,
    };

    if (this.observability) {
      this.observability.logger.debug(`[EventBus] Publishing ${eventName} from ${source}`, { eventId: context.eventId });
    }

    // 1. Notify local in-memory listeners immediately
    this.notifyLocalListeners(eventName, payload, context);

    // 2. Persist to os_events for audit and cross-client processing (Legacy wrapping)
    supabase.from('os_events').insert({
      event_type: eventName,
      source_subsystem: source,
      payload,
      level: 'info'
    }).then(({ error }) => {
      if (error) {
        if (this.observability) {
          this.observability.logger.error(`[EventBus] Failed to emit ${eventName} to DB:`, error);
        } else {
          console.error(`[EventBus] Failed to emit ${eventName} to DB:`, error);
        }
      }
    });
  }

  public subscribe<T>(eventName: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    
    // Typecast to handle the generic
    const internalCallback = callback as unknown as EventCallback<any>;
    this.listeners.get(eventName)!.add(internalCallback);
    this.ensureSupabaseListener();

    return () => {
      const subs = this.listeners.get(eventName);
      if (subs) {
        subs.delete(internalCallback);
        if (subs.size === 0) {
          this.listeners.delete(eventName);
        }
      }
    };
  }

  private notifyLocalListeners(eventName: string, payload: any, context: EventContext) {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(payload, context);
        } catch (err: any) {
          if (this.observability) {
            this.observability.logger.error(`[EventBus] Error in listener for ${eventName}`, err);
          } else {
            console.error(`[EventBus] Error in listener for ${eventName}:`, err);
          }
        }
      });
    }
  }

  private ensureSupabaseListener() {
    if (this.isListeningToSupabase) return;
    this.isListeningToSupabase = true;

    // Listen to real-time events inserted into os_events (Legacy support)
    supabase.channel('kernel-events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'os_events' },
        (payload) => {
          const newEvent = payload.new as any;
          const context: EventContext = {
            eventId: newEvent.id || ((typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36).substring(2)),
            timestamp: new Date(newEvent.created_at).getTime() || Date.now(),
            source: newEvent.source_subsystem || 'supabase-sync',
          };
          this.notifyLocalListeners(newEvent.event_type, newEvent.payload, context);
        }
      )
      .subscribe();
  }
}

// Temporary legacy export to avoid immediately breaking files that import eventBus
// This will be removed in Phase 4 when everything uses `kernel.resolve('IEventBus')`.
export const eventBus = new EventBus();

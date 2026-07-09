/**
 * CHATR Kernel Runtime v2.0 — EventBus
 *
 * Layer 2 — Runtime Infrastructure
 *
 * Priority-tiered, typed, distributed-ready event bus.
 *
 * Priority Tiers:
 *   critical   — user-blocking (CALL_STARTED, AUTH_CHANGED, CRASH_DETECTED)
 *   high       — user-facing, fast (TASK_CREATED, MESSAGE_RECEIVED)
 *   normal     — standard flow (SEARCH_EXECUTED, KNOWLEDGE_UPDATED)
 *   background — non-user-facing (TELEMETRY_FLUSHED, CACHE_UPDATED)
 *
 * Persistence:
 *   Events tagged persist=true are forwarded to the TimelineEngine for
 *   IndexedDB storage. UI-only events are discarded after delivery.
 *
 * Distributed:
 *   A WebSocket bridge can be attached via setDistributedTransport() to
 *   forward/receive events across devices or CHATR instances.
 */

import { CHATREvent, EventHandler, EventPriority } from './types';

// ─── Known event catalog ──────────────────────────────────────────────────────

export const EVENTS = {
  // critical
  KERNEL_READY:          'KERNEL_READY',
  KERNEL_CRASHED:        'KERNEL_CRASHED',
  AUTH_CHANGED:          'AUTH_CHANGED',
  CALL_STARTED:          'CALL_STARTED',
  CALL_ENDED:            'CALL_ENDED',
  MEETING_FINISHED:      'MEETING_FINISHED',
  CRASH_DETECTED:        'CRASH_DETECTED',

  // high
  TASK_CREATED:          'TASK_CREATED',
  MESSAGE_RECEIVED:      'MESSAGE_RECEIVED',
  COMMITMENT_CREATED:    'COMMITMENT_CREATED',
  COMMITMENT_COMPLETED:  'COMMITMENT_COMPLETED',
  CONTACT_UPDATED:       'CONTACT_UPDATED',
  INTENT_DETECTED:       'INTENT_DETECTED',
  DOCUMENT_UPLOADED:     'DOCUMENT_UPLOADED',
  WORKSPACE_CHANGED:     'WORKSPACE_CHANGED',

  // normal
  SEARCH_EXECUTED:       'SEARCH_EXECUTED',
  KNOWLEDGE_UPDATED:     'KNOWLEDGE_UPDATED',
  RELATIONSHIP_UPDATED:  'RELATIONSHIP_UPDATED',
  AI_RESPONSE_READY:     'AI_RESPONSE_READY',
  TIMELINE_UPDATED:      'TIMELINE_UPDATED',
  PLUGIN_INSTALLED:      'PLUGIN_INSTALLED',
  PLUGIN_ENABLED:        'PLUGIN_ENABLED',
  PLUGIN_DISABLED:       'PLUGIN_DISABLED',

  // background
  TELEMETRY_FLUSHED:     'TELEMETRY_FLUSHED',
  CACHE_UPDATED:         'CACHE_UPDATED',
  INDEX_UPDATED:         'INDEX_UPDATED',
  WORKER_COMPLETED:      'WORKER_COMPLETED',
  SYNC_COMPLETED:        'SYNC_COMPLETED',
} as const;

export type EventType = typeof EVENTS[keyof typeof EVENTS];

// Persist-flag catalog — must be explicit
const PERSISTENT_EVENTS = new Set<string>([
  EVENTS.CALL_STARTED, EVENTS.CALL_ENDED, EVENTS.MEETING_FINISHED,
  EVENTS.TASK_CREATED, EVENTS.DOCUMENT_UPLOADED, EVENTS.COMMITMENT_CREATED,
  EVENTS.COMMITMENT_COMPLETED, EVENTS.CONTACT_UPDATED, EVENTS.WORKSPACE_CHANGED,
  EVENTS.AUTH_CHANGED,
]);

// Priority queue ordering
const PRIORITY_ORDER: Record<EventPriority, number> = {
  critical:   0,
  high:       1,
  normal:     2,
  background: 3,
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Subscription = {
  id: string;
  handler: EventHandler<unknown>;
  priority: EventPriority;
  once: boolean;
};

type DistributedTransport = {
  send(event: CHATREvent): void;
  onReceive(handler: (event: CHATREvent) => void): () => void;
};

// ─── EventBus ────────────────────────────────────────────────────────────────

class EventBusImpl {
  private subscribers = new Map<string, Subscription[]>();
  private wildcard: Subscription[] = [];
  private persistenceHandler: ((event: CHATREvent) => void) | null = null;
  private transport: DistributedTransport | null = null;
  private transportCleanup: (() => void) | null = null;
  private _eventCount = 0;
  private _throughputWindow: number[] = [];

  // ── Subscribe ──────────────────────────────────────────────────────────────

  on<T = unknown>(
    type: string,
    handler: EventHandler<T>,
    opts?: { priority?: EventPriority; once?: boolean }
  ): () => void {
    const sub: Subscription = {
      id: crypto.randomUUID(),
      handler: handler as EventHandler<unknown>,
      priority: opts?.priority ?? 'normal',
      once: opts?.once ?? false,
    };

    const list = this.subscribers.get(type) ?? [];
    list.push(sub);
    // Keep list sorted by priority so critical handlers always run first
    list.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    this.subscribers.set(type, list);

    return () => this.off(type, sub.id);
  }

  once<T = unknown>(type: string, handler: EventHandler<T>): () => void {
    return this.on(type, handler, { once: true });
  }

  onAny(handler: EventHandler<unknown>): () => void {
    const sub: Subscription = {
      id: crypto.randomUUID(),
      handler,
      priority: 'background',
      once: false,
    };
    this.wildcard.push(sub);
    return () => {
      this.wildcard = this.wildcard.filter(s => s.id !== sub.id);
    };
  }

  private off(type: string, subId: string) {
    const list = this.subscribers.get(type);
    if (!list) return;
    this.subscribers.set(type, list.filter(s => s.id !== subId));
  }

  // ── Publish ───────────────────────────────────────────────────────────────

  publish<T = unknown>(
    type: string,
    payload: T,
    opts?: {
      priority?: EventPriority;
      source?: string;
      correlationId?: string;
    }
  ): CHATREvent<T> {
    const event: CHATREvent<T> = {
      id: crypto.randomUUID(),
      type,
      payload,
      priority: opts?.priority ?? this.inferPriority(type),
      timestamp: Date.now(),
      source: opts?.source ?? 'system',
      persist: PERSISTENT_EVENTS.has(type),
      correlationId: opts?.correlationId,
    };

    // Metrics and tracking
    this.trackThroughput();
    
    // Add to history
    this._eventHistory.push(event);
    if (this._eventHistory.length > this.MAX_HISTORY) {
      this._eventHistory.shift();
    }
    this.deliver(event);

    // Forward to distributed transport if attached
    if (this.transport) {
      try { this.transport.send(event); } catch { /* non-fatal */ }
    }

    // Forward to persistence layer if needed
    if (event.persist && this.persistenceHandler) {
      this.persistenceHandler(event);
    }

    return event;
  }

  private deliver(event: CHATREvent<unknown>) {
    const subs = this.subscribers.get(event.type) ?? [];
    const toRemove: string[] = [];

    for (const sub of subs) {
      try {
        const result = sub.handler(event);
        if (result instanceof Promise) result.catch(console.error);
      } catch (err) {
        console.error(`[EventBus] Handler error for ${event.type}:`, err);
      }
      if (sub.once) toRemove.push(sub.id);
    }

    // Wildcard subscribers (background priority, called last)
    for (const sub of this.wildcard) {
      try { sub.handler(event); } catch { /* non-fatal */ }
    }

    if (toRemove.length) {
      this.subscribers.set(
        event.type,
        subs.filter(s => !toRemove.includes(s.id))
      );
    }
  }

  // ── Distributed Transport ─────────────────────────────────────────────────

  /**
   * Attach a WebSocket or other transport to receive remote events.
   * Remote events are delivered locally but NOT re-forwarded to avoid loops.
   */
  setDistributedTransport(transport: DistributedTransport): void {
    this.transportCleanup?.();
    this.transport = transport;
    this.transportCleanup = transport.onReceive((event) => {
      // Deliver locally without re-forwarding
      this.deliver(event as CHATREvent<unknown>);
      if (event.persist && this.persistenceHandler) {
        this.persistenceHandler(event);
      }
    });
  }

  removeDistributedTransport(): void {
    this.transportCleanup?.();
    this.transport = null;
    this.transportCleanup = null;
  }

  // ── Persistence ───────────────────────────────────────────────────────────

  /**
   * Set the handler that will persist events tagged persist=true.
   * Called by TimelineEngine during its init().
   */
  setPersistenceHandler(handler: (event: CHATREvent) => void): void {
    this.persistenceHandler = handler;
  }

  // ── Metrics ───────────────────────────────────────────────────────────────

  private inferPriority(type: string): EventPriority {
    if ([EVENTS.KERNEL_READY, EVENTS.KERNEL_CRASHED, EVENTS.AUTH_CHANGED,
         EVENTS.CALL_STARTED, EVENTS.CALL_ENDED, EVENTS.MEETING_FINISHED,
         EVENTS.CRASH_DETECTED].includes(type as EventType)) return 'critical';
    if ([EVENTS.TASK_CREATED, EVENTS.MESSAGE_RECEIVED, EVENTS.COMMITMENT_CREATED,
         EVENTS.COMMITMENT_COMPLETED, EVENTS.CONTACT_UPDATED, EVENTS.INTENT_DETECTED,
         EVENTS.DOCUMENT_UPLOADED, EVENTS.WORKSPACE_CHANGED].includes(type as EventType)) return 'high';
    if ([EVENTS.TELEMETRY_FLUSHED, EVENTS.CACHE_UPDATED, EVENTS.INDEX_UPDATED,
         EVENTS.WORKER_COMPLETED, EVENTS.SYNC_COMPLETED].includes(type as EventType)) return 'background';
    return 'normal';
  }

  private trackThroughput() {
    const now = Date.now();
    this._eventCount++;
    this._throughputWindow.push(now);
    // Keep only last 60 seconds
    const cutoff = now - 60_000;
    this._throughputWindow = this._throughputWindow.filter(t => t > cutoff);
  }

  private _eventHistory: CHATREvent[] = [];
  private readonly MAX_HISTORY = 5000;

  get history(): CHATREvent[] {
    return [...this._eventHistory];
  }

  get throughputPerSecond(): number {
    return this._throughputWindow.length / 60;
  }

  get totalEventCount(): number {
    return this._eventCount;
  }

  replay(events: CHATREvent[]): void {
    console.warn(`[EventBus] Replaying ${events.length} events...`);
    for (const event of events) {
      // Direct delivery without re-persisting or history tracking
      this.deliver(event);
    }
  }

  reset(): void {
    this.subscribers.clear();
    this.wildcard = [];
    this._eventCount = 0;
    this._throughputWindow = [];
    this._eventHistory = [];
  }
}

export const eventBus = new EventBusImpl();
export type { EventBusImpl };

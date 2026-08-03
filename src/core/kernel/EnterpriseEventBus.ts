import { EnterpriseEvent } from '../types';
import { DistributedEventStore } from '../persistence/DistributedEventStore';
import type { EnterpriseEventStore } from './EnterpriseEventStore';
import { DeadLetterQueueStore, InMemoryDLQStore } from './DeadLetterQueueStore';
import { SecurityValidator } from '../security/SecurityValidator';
import { IdentityRuntime } from '../security/IdentityRuntime';
import { TraceProvider } from '../telemetry/TraceProvider';

/**
 * Enterprise Event Bus
 * Publisher -> Event Store -> Dispatcher -> Subscribers
 */
export class EnterpriseEventBus {
  private static instance: EnterpriseEventBus;
  private store: DistributedEventStore;
  private dlq: DeadLetterQueueStore;
  
  // Subscriber routing map: eventType -> Set of callbacks
  private subscribers: Map<string, Set<Function>> = new Map();

  private constructor() {
    this.store = new DistributedEventStore();
    this.dlq = new InMemoryDLQStore();
    
    // Connect to distributed backend
    this.store.connect().catch(e => console.error(e));

    // The Dispatcher: Listens to the immutable store and routes to subscribers
    this.store.subscribe((event: EnterpriseEvent) => {
      this.dispatch(event);
    });
  }

  public static getInstance(): EnterpriseEventBus {
    if (!EnterpriseEventBus.instance) {
      EnterpriseEventBus.instance = new EnterpriseEventBus();
    }
    return EnterpriseEventBus.instance;
  }

  public start() {
    console.log('[EnterpriseEventBus] Publisher/Dispatcher initialized.');
  }

  /**
   * Publishers ONLY call publish().
   * The bus guarantees it lands in the Event Store before any dispatching occurs.
   */
  public async publish(event: EnterpriseEvent): Promise<void> {
    // Enterprise Zero-Trust Incremental Rollout
    if (!event.metadata?.authToken) {
       if (event.metadata?.strictSecurity) {
          SecurityValidator.authorizeEvent(event); // Will throw AccessDenied
       } else {
          // Legacy support: auto-provision system token
          event.metadata = event.metadata || {};
          event.metadata.authToken = IdentityRuntime.getInstance().mintToken(event.actorId || 'system', 'system:admin', 'system');
       }
    } else {
       SecurityValidator.authorizeEvent(event);
    }

    console.log(`[EnterpriseEventBus] Publishing event: ${event.type} (${event.id})`);
    await this.store.append(event);
  }

  /**
   * Components subscribe to the Dispatcher.
   * Subscriber logic must be idempotent.
   */
  public subscribe(eventType: string, callback: (event: EnterpriseEvent) => Promise<void> | void) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(callback);
  }

  /**
   * Internal Dispatcher logic. Routes stored events to active subscribers.
   */
  private async dispatch(event: EnterpriseEvent) {
    // 1. Extract Parent Trace Context from Event Metadata
    const tracer = TraceProvider.getInstance();
    const parentContext = event.metadata?.traceContext;
    
    // 2. Start Dispatch Span
    const span = tracer.startSpan(`EventBus.dispatch(${event.type})`, parentContext);
    span.setAttribute('event.id', event.id);
    span.setAttribute('tenant.id', event.tenantId);

    const callbacks = this.subscribers.get(event.type) || new Set();
    const wildcardCallbacks = this.subscribers.get('*') || new Set();
    
    const allCallbacks = new Set([...callbacks, ...wildcardCallbacks]);
    
    if (allCallbacks.size === 0) {
      span.end();
      return;
    }

    // 3. Inject new span context back into event for downstream services
    event.metadata = event.metadata || {};
    event.metadata.traceContext = span.context;

    for (const cb of Array.from(allCallbacks)) {
      try {
        await cb(event);
      } catch (err: any) {
        console.error(`[EnterpriseEventBus] Subscriber failed on event ${event.id}:`, err);
        // Route to DLQ
        this.dlq.append({
          event,
          failedAt: new Date().toISOString(),
          errorReason: err.message || String(err),
          retryCount: 0,
          subscriberId: cb.name || 'AnonymousSubscriber'
        });
      }
    }
    
    span.end();
  }
}

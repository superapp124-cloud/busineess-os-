import type {
  PlatformEvent,
  PlatformEventHandler,
  PlatformEventInput,
  PlatformUnsubscribe,
} from '@/platform/types';

type HandlerSet = Set<PlatformEventHandler<any>>;

const wildcardType = '*';

function createEventId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export class PlatformEventBus {
  private handlers = new Map<string, HandlerSet>();

  subscribe<TPayload = unknown>(
    type: string,
    handler: PlatformEventHandler<TPayload>
  ): PlatformUnsubscribe {
    const handlers = this.handlers.get(type) ?? new Set();
    handlers.add(handler as PlatformEventHandler<any>);
    this.handlers.set(type, handlers);

    return {
      unsubscribe: () => {
        handlers.delete(handler as PlatformEventHandler<any>);
        if (handlers.size === 0) {
          this.handlers.delete(type);
        }
      },
    };
  }

  async publish<TPayload = unknown>(
    input: PlatformEventInput<TPayload>
  ): Promise<PlatformEvent<TPayload>> {
    const event: PlatformEvent<TPayload> = {
      ...input,
      id: input.id ?? createEventId(),
      timestamp: input.timestamp ?? new Date().toISOString(),
      version: input.version ?? 1,
    };

    const handlers = [
      ...(this.handlers.get(event.type) ?? []),
      ...(this.handlers.get(wildcardType) ?? []),
    ];

    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error('[PlatformEventBus] handler failed', {
            eventType: event.type,
            eventId: event.id,
            error,
          });
        }
      })
    );

    return event;
  }

  subscribeAll(handler: PlatformEventHandler): PlatformUnsubscribe {
    return this.subscribe(wildcardType, handler);
  }
}

export const platformEventBus = new PlatformEventBus();

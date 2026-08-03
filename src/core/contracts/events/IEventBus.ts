import { IRuntime } from '../common/Lifecycle';

/**
 * Interface representing a subscriber callback for an event.
 */
export type EventCallback<T = any> = (payload: T, context: EventContext) => void | Promise<void>;

/**
 * Metadata associated with an emitted event.
 */
export interface EventContext {
  eventId: string;
  timestamp: number;
  source: string;
  correlationId?: string;
}

/**
 * The core Event Bus interface for cross-domain communication.
 */
export interface IEventBus {
  /**
   * Publishes an event to the bus.
   * @param eventName The standard dot-notation event name (e.g. 'identity.login.completed')
   * @param payload The data associated with the event
   * @param source The origin emitting the event
   */
  publish<T>(eventName: string, payload: T, source: string): void;

  /**
   * Subscribes to an event on the bus.
   * @param eventName The name of the event to listen for
   * @param callback The function to execute when the event fires
   * @returns A function to unsubscribe
   */
  subscribe<T>(eventName: string, callback: EventCallback<T>): () => void;
}

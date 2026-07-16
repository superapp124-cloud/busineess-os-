'use strict';

/**
 * CHATR Kernel — Event Bus
 *
 * The central nervous system of CHATR Core.
 * All modules publish events here. All modules subscribe here.
 * No module calls another module directly. (Golden Rule)
 *
 * Genesis v1.0
 */

const { EventEmitter } = require('events');
const { createEventEnvelope } = require('./schema.cjs');

class KernelEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Allow many future module subscribers
    this._metrics = {
      published: 0,
      byEvent: {},
    };
    this._traces = new Map(); // correlationId -> { events: [{ stage, time }], start: time }
  }

  /**
   * Publish a Kernel Event.
   * @param {string} eventName - e.g. KERNEL.OBSERVATION.CREATED
   * @param {object} payload
   */
  publish(eventName, payload = {}) {
    this._metrics.published++;
    this._metrics.byEvent[eventName] = (this._metrics.byEvent[eventName] || 0) + 1;
    
    const envelope = createEventEnvelope(eventName, payload);
    const correlationId = envelope.correlationId;
    const timestamp = envelope.timestamp_ms;

    // --- OBSERVABILITY TRACING ---
    if (!this._traces.has(correlationId)) {
      this._traces.set(correlationId, { start: timestamp, events: [] });
      
      // Cleanup traces after 10 seconds to prevent memory leak
      setTimeout(() => this._traces.delete(correlationId), 10000);
    }
    
    const trace = this._traces.get(correlationId);
    if (trace) {
      const prevEvent = trace.events.length > 0 ? trace.events[trace.events.length - 1] : null;
      const duration = prevEvent ? (timestamp - prevEvent.time) : 0;
      trace.events.push({ stage: envelope.stage, time: timestamp, duration, eventName: envelope.event_type });
      
      if (eventName === 'KERNEL.ACTION.EXECUTED' || eventName === 'KERNEL.SUGGESTION.DISMISSED' || eventName === 'KERNEL.ACTION.CONFIRMED') {
        const path = trace.events.map(e => `${e.stage}(${e.duration}ms)`).join(' -> ');
        console.log(`\n🔍 [OBSERVABILITY TRACE] ${correlationId}\n${path}\n`);
        
        // Write structured trace to file
        const fs = require('fs');
        const pathModule = require('path');
        const traceFile = pathModule.join(process.env.APPDATA || process.env.HOME || '', '.chatr', 'trace.jsonl');
        const traceRecord = {
          correlationId,
          start: trace.start,
          end: timestamp,
          duration: timestamp - trace.start,
          events: trace.events,
          finalEvent: envelope.event_type,
          payload: envelope.payload // Can contain metrics like timeToConfirm from UI
        };
        try {
          fs.appendFileSync(traceFile, JSON.stringify(traceRecord) + '\n');
        } catch (e) {
          console.error('[EventBus] Failed to write trace log', e);
        }
      }
    }

    this.emit(eventName, envelope);
    if (eventName !== envelope.event_type) {
      this.emit(envelope.event_type, envelope);
    }
    
    // Also emit to a global wildcard for the Event Router
    this.emit('*', { eventName, eventType: envelope.event_type, envelope });
  }

  /**
   * Subscribe to a Kernel Event or wildcard.
   * @param {string} eventName (use '*' to listen to all events)
   * @param {Function} handler
   */
  subscribe(eventName, handler) {
    this.on(eventName, handler);
  }

  /**
   * Unsubscribe from a Kernel Event.
   */
  unsubscribe(eventName, handler) {
    this.off(eventName, handler);
  }

  /**
   * Return event throughput metrics.
   */
  getMetrics() {
    return { ...this._metrics };
  }
}

// Singleton — one bus for the entire Kernel
const bus = new KernelEventBus();

module.exports = { KernelEventBus, bus };

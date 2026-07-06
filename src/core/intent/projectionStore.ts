import { Understanding } from './types';

export interface KernelEvent {
  id: string;
  timestamp: number;
  stage: string;
  correlationId: string;
  payload: any;
}

export interface ProjectionState {
  understanding: Understanding | null;
  isReady: boolean;
  activeCorrelationId: string | null;
  activeSuggestion: any | null;
  latencyMetrics: Record<string, number>;
  events: KernelEvent[];
  cursor: number; // For time travel, points to the currently applied event index
}

type Subscriber = (state: ProjectionState) => void;

class ProjectionStore {
  private state: ProjectionState;
  private subscribers: Set<Subscriber>;
  private stageTimestamps: Record<string, number> = {};

  constructor() {
    this.subscribers = new Set();
    this.state = this.getInitialState();
  }

  private getInitialState(): ProjectionState {
    return {
      understanding: null,
      isReady: false,
      activeCorrelationId: null,
      activeSuggestion: null,
      latencyMetrics: {},
      events: [],
      cursor: -1
    };
  }

  subscribe(callback: Subscriber) {
    this.subscribers.add(callback);
    callback(this.state);
    return () => this.subscribers.delete(callback);
  }

  private notify() {
    this.subscribers.forEach(s => s(this.state));
  }

  public getState() {
    return this.state;
  }

  public handleEvent(event: KernelEvent) {
    // Only append real events if we are at the edge of the cursor (not time-traveling)
    if (this.state.cursor === this.state.events.length - 1) {
      this.state.events.push(event);
      this.state.cursor++;
      this.applyEvent(event, true);
    } else {
      // If we are actively time-traveling, push to history but do not apply immediately
      this.state.events.push(event);
    }
  }

  private applyEvent(event: KernelEvent, updateMetrics: boolean) {
    const { stage, correlationId, payload } = event;

    if (this.state.activeCorrelationId && correlationId !== this.state.activeCorrelationId) {
      if (stage === 'OBSERVATION.CREATED') {
        this.resetStateForNewIntent(correlationId);
      } else {
        return; // Ignore stale events
      }
    } else if (!this.state.activeCorrelationId) {
      this.resetStateForNewIntent(correlationId);
    }

    if (updateMetrics) {
      const now = Date.now(); // We use local time for UI metrics
      const lastStageTime = Object.values(this.stageTimestamps).pop() || now;
      const latency = now - lastStageTime;
      this.stageTimestamps[stage] = now;
      this.state.latencyMetrics = { ...this.state.latencyMetrics, [stage]: latency };
    }

    if (stage === 'UNDERSTANDING.CREATED') {
      const classifications = payload.classifications;
      if (classifications?.length > 0) {
        this.state.understanding = classifications[0] as Understanding;
      }
    } else if (stage === 'ACTION.REVEALED') {
      if (this.state.understanding) {
        this.state.understanding = {
          ...this.state.understanding,
          _action: payload.action,
          readyForSuggestion: true
        };
      }
      this.state.isReady = true;
    } else if (stage === 'CONTEXT.RESOLVED') {
       // Typically context resolution comes bundled before ACTION.REVEALED, 
       // but we could explicitly update UI state here if needed
    } else if (stage === 'SUGGESTION.PROPOSED') {
      this.state.activeSuggestion = payload;
      this.state.isReady = true;
    }

    this.notify();
  }

  private resetStateForNewIntent(correlationId: string) {
    this.state.activeCorrelationId = correlationId;
    this.state.understanding = null;
    this.state.activeSuggestion = null;
    this.state.isReady = false;
    this.state.latencyMetrics = {};
    this.stageTimestamps = { 'START': Date.now() };
  }

  public reset() {
    this.state = this.getInitialState();
    this.stageTimestamps = {};
    this.notify();
  }

  // --- Time Travel Debugging ---

  public stepForward() {
    if (this.state.cursor < this.state.events.length - 1) {
      this.state.cursor++;
      this.applyEvent(this.state.events[this.state.cursor], false);
    }
  }

  public stepBackward() {
    if (this.state.cursor >= 0) {
      this.state.cursor--;
      this.rebuildStateFromHistory(this.state.cursor);
    }
  }

  public play() {
    this.state.cursor = this.state.events.length - 1;
    this.rebuildStateFromHistory(this.state.cursor);
  }

  public stop() {
    this.reset();
  }

  private rebuildStateFromHistory(targetCursor: number) {
    // Save events array before rebuilding
    const allEvents = this.state.events;
    
    // Wipe state clean
    this.state = {
      understanding: null,
      isReady: false,
      activeCorrelationId: null,
      activeSuggestion: null,
      latencyMetrics: {}, // We don't replay metrics during time travel
      events: allEvents,
      cursor: targetCursor
    };

    // Reapply events up to cursor
    for (let i = 0; i <= targetCursor; i++) {
      this.applyEvent(allEvents[i], false);
    }
    
    this.notify();
  }
}

export const projectionStore = new ProjectionStore();

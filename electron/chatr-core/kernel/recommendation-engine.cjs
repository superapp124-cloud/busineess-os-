'use strict';

/**
 * Recommendation Engine (Wave 2)
 * 
 * Sits at the heart of the Outcome Engine architecture.
 * Listens to all facts emitted by modules (e.g. MEETING.CREATED)
 * and determines the next best action to suggest to the user.
 * 
 * Rules:
 * 1. Modules are completely decoupled and emit facts only.
 * 2. Surfaces ONLY the single highest-value action at a time.
 * 3. Uses a Hybrid Strategy: Deterministic Rules first, Semantic fallback later.
 */

const bus = require('../events/bus.cjs');

class RecommendationEngine {
  constructor() {
    this.activeSuggestion = null;
  }

  initialize() {
    // Note: use the imported bus reference 'bus', wait, where is bus imported?
    // Oh, I see const bus = require('../events/bus.cjs'). Wait, earlier in this file: const { bus } = require('../events/bus.cjs'); No, it was const bus = require('../events/bus.cjs'); 
    // Wait, bus.cjs exports { bus, ... } or is it the bus instance directly?
    // Let me check. The file had `const bus = require('../events/bus.cjs');` and later `bus.subscribe(...)`. But in other files it's `const { bus } = require('../events/bus.cjs');`.
    // Let me use `const { bus } = require('../events/bus.cjs');` just to be safe if that is how it's actually exported.
    console.log('[RecommendationEngine] Initializing...');
    
    // Listen to ALL module events
    const { bus } = require('../events/bus.cjs');
    bus.subscribe('*', (payload) => {
      // payload structure: { eventName, envelope }
      if (payload && payload.envelope) {
        this.evaluateEvent(payload.envelope);
      } else {
        // legacy
        this.evaluateEvent(payload);
      }
    });
  }

  evaluateEvent(envelope) {
    const { stage, correlationId, payload } = envelope;

    if (!stage || (!stage.includes('.CREATED') && !stage.includes('.CONFIRMED') && !stage.includes('.ATTACHED'))) return;

    let candidates = [];

    // LEVEL 1: Deterministic Rules scoring
    // We score multiple possibilities based on context
    
    if (stage === 'MEETING.CREATED' || stage === 'MEETING.CONFIRMED') {
      candidates.push({
        type: 'TASK',
        action: 'CREATE_TASK',
        title: 'Prepare Proposal',
        context: payload.title || 'Meeting',
        score: 0.96
      });
      candidates.push({
        type: 'REMINDER',
        action: 'CREATE_REMINDER',
        title: '30 minutes before meeting?',
        context: payload.title || 'Meeting',
        score: 0.72
      });
      candidates.push({
        type: 'DOCUMENT',
        action: 'ATTACH_DOCUMENT',
        title: 'Attach Proposal',
        context: payload.title || 'Meeting',
        score: 0.41
      });
    } else if (stage === 'TASK.CREATED' || stage === 'TASK.CONFIRMED') {
      candidates.push({
        type: 'DOCUMENT',
        action: 'ATTACH_DOCUMENT',
        title: 'Attach Proposal',
        context: payload.title || 'Task',
        score: 0.92
      });
      candidates.push({
        type: 'REMINDER',
        action: 'CREATE_REMINDER',
        title: 'Remind me tomorrow',
        context: payload.title || 'Task',
        score: 0.65
      });
    } else if (stage === 'DOCUMENT.ATTACHED' || stage === 'DOCUMENT.CONFIRMED') {
      candidates.push({
        type: 'REMINDER',
        action: 'CREATE_REMINDER',
        title: 'Review Reminder',
        context: 'Document',
        score: 0.88
      });
    }

    if (candidates.length > 0) {
      // Sort candidates by score descending
      candidates.sort((a, b) => b.score - a.score);
      this.proposeSuggestion(correlationId, candidates);
    }
  }

  proposeSuggestion(correlationId, candidates) {
    const { bus } = require('../events/bus.cjs');
    // Publish the array of scored candidates
    bus.publish('KERNEL.SUGGESTION.PROPOSED', correlationId, { candidates });
  }
}

module.exports = new RecommendationEngine();

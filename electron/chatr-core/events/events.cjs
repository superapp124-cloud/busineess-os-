'use strict';

/**
 * CHATR Kernel — Event Constants
 *
 * All Kernel Event names are defined here.
 * Every publisher and subscriber uses these constants — never raw strings.
 *
 * Genesis v1.0
 */

const CORE = {
  // ── Request Lifecycle ────────────────────────────────────────────────────────
  REQUEST_STARTED:        'CORE.REQUEST_STARTED',
  REQUEST_NORMALIZED:     'CORE.REQUEST_NORMALIZED',
  REQUEST_COMPLETED:      'CORE.REQUEST_COMPLETED',
  REQUEST_FAILED:         'CORE.REQUEST_FAILED',
  REQUEST_CANCELLED:      'CORE.REQUEST_CANCELLED',

  // ── Context Lifecycle ────────────────────────────────────────────────────────
  CONTEXT_RESOLVING:      'CORE.CONTEXT_RESOLVING',
  CONTEXT_RESOLVED:       'CORE.CONTEXT_RESOLVED',

  // ── Provider Lifecycle ───────────────────────────────────────────────────────
  PROVIDER_RESOLVED:      'CORE.PROVIDER_RESOLVED',
  PROVIDER_STARTED:       'CORE.PROVIDER_STARTED',
  PROVIDER_FAILED:        'CORE.PROVIDER_FAILED',

  // ── Streaming Lifecycle ──────────────────────────────────────────────────────
  STREAM_STARTED:         'CORE.STREAM_STARTED',
  STREAM_DELTA:           'CORE.STREAM_DELTA',
  STREAM_COMPLETED:       'CORE.STREAM_COMPLETED',
  STREAM_FAILED:          'CORE.STREAM_FAILED',
  STREAM_CANCELLED:       'CORE.STREAM_CANCELLED',

  // ── Persistence ──────────────────────────────────────────────────────────────
  PERSIST_STARTED:        'CORE.PERSIST_STARTED',
  PERSIST_COMPLETED:      'CORE.PERSIST_COMPLETED',
  PERSIST_FAILED:         'CORE.PERSIST_FAILED',

  // ── Recovery (Hook reserved — unused in v0.1) ────────────────────────────────
  RECOVERY_TRIGGERED:     'CORE.RECOVERY_TRIGGERED',
  RECOVERY_COMPLETED:     'CORE.RECOVERY_COMPLETED',

  // ── System ──────────────────────────────────────────────────────────────────
  ERROR:                  'CORE.ERROR',
  KERNEL_READY:           'CORE.KERNEL_READY',
  MODULE_REGISTERED:      'CORE.MODULE_REGISTERED',
};

// ── Intent Observer Events ────────────────────────────────────────────────────
// The Intent Observer subscribes to REQUEST_COMPLETED and publishes these.
// No side effects. Zero execution. Purely observational.
const INTENT = {
  OBSERVATION_STARTED:   'INTENT.OBSERVATION_STARTED',
  OBSERVATION_COMPLETED: 'INTENT.OBSERVATION_COMPLETED',
  DETECTED:              'INTENT.DETECTED',
};

// ── Intelligence Lifecycle (Milestone 4) ────────────────────────────────────
const INTELLIGENCE = {
  OBSERVATION_CREATED:    'INTELLIGENCE.OBSERVATION.CREATED',
  CLASSIFICATION_CREATED: 'INTELLIGENCE.CLASSIFICATION.CREATED',
  CONTEXT_RESOLVED:       'INTELLIGENCE.CONTEXT.RESOLVED',
  UNDERSTANDING_ENRICHED: 'INTELLIGENCE.UNDERSTANDING.ENRICHED',
  SUGGESTION_CREATED:     'INTELLIGENCE.SUGGESTION.CREATED',
  USER_ACCEPTED:          'INTELLIGENCE.USER_ACCEPTED',
  EXECUTION_REQUESTED:    'INTELLIGENCE.EXECUTION_REQUESTED',
  COMMITMENT_CREATED:     'INTELLIGENCE.COMMITMENT_CREATED',
  REALITY_VERIFIED:       'INTELLIGENCE.REALITY_VERIFIED',
  LEARNING_UPDATED:       'INTELLIGENCE.LEARNING_UPDATED',
};

module.exports = {
  CORE,
  INTENT,
  INTELLIGENCE,
};

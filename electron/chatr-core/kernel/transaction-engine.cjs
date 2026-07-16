'use strict';

const crypto = require('crypto');
const { TransactionAuditLog } = require('./transaction-audit-log.cjs');

/**
 * CHATR Kernel — Transaction Engine
 * Platform Milestone P1.4
 *
 * The single authority for transaction lifecycle.
 * Responsible for creating, transitioning, and recovering transactions.
 *
 * Transaction State Machine:
 *
 *   PENDING
 *     │
 *     ▼ dispatchPayment()
 *   PAYMENT_PENDING
 *     │
 *     ├──(confirmed)──► PAYMENT_CONFIRMED
 *     │                        │
 *     │                        ▼ verify()
 *     │                 VERIFIED ──► TRACKING
 *     │
 *     ├──(retryable)──► PAYMENT_RETRYABLE
 *     │                        │
 *     │                        ▼ retry()
 *     │                 PAYMENT_PENDING (loop)
 *     │
 *     └──(hard fail)──► PAYMENT_FAILED
 *                              │
 *                              ▼ cancel()
 *                       PAYMENT_CANCELLED
 *
 * ABI: chatr.transaction.v0_9_rc
 */

const ABI_VERSION = 'chatr.transaction.v0_9_rc';

const TRANSACTION_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_RETRYABLE: 'PAYMENT_RETRYABLE',
  PAYMENT_CANCELLED: 'PAYMENT_CANCELLED',
  VERIFIED: 'VERIFIED',
  TRACKING: 'TRACKING',
  COMPLETED: 'COMPLETED',
});

// Legal state transitions — enforced strictly
const LEGAL_TRANSITIONS = {
  [TRANSACTION_STATUS.PENDING]:            [TRANSACTION_STATUS.PAYMENT_PENDING, TRANSACTION_STATUS.PAYMENT_CANCELLED],
  [TRANSACTION_STATUS.PAYMENT_PENDING]:    [TRANSACTION_STATUS.PAYMENT_CONFIRMED, TRANSACTION_STATUS.PAYMENT_FAILED, TRANSACTION_STATUS.PAYMENT_RETRYABLE],
  [TRANSACTION_STATUS.PAYMENT_CONFIRMED]:  [TRANSACTION_STATUS.VERIFIED],
  [TRANSACTION_STATUS.PAYMENT_RETRYABLE]: [TRANSACTION_STATUS.PAYMENT_PENDING, TRANSACTION_STATUS.PAYMENT_CANCELLED],
  [TRANSACTION_STATUS.PAYMENT_FAILED]:     [TRANSACTION_STATUS.PAYMENT_CANCELLED],
  [TRANSACTION_STATUS.VERIFIED]:           [TRANSACTION_STATUS.TRACKING],
  [TRANSACTION_STATUS.TRACKING]:           [TRANSACTION_STATUS.COMPLETED],
  [TRANSACTION_STATUS.PAYMENT_CANCELLED]:  [],
  [TRANSACTION_STATUS.COMPLETED]:          [],
};

class TransactionEngine {
  constructor(options = {}) {
    this._bus = options.bus;
    this._auditLog = options.auditLog || new TransactionAuditLog();
    // Store: transactionId -> transaction object
    this._transactions = new Map();
    // Idempotency store: idempotency_key -> transactionId
    this._idempotencyKeys = new Map();
  }

  /**
   * Create a new transaction.
   * Returns a chatr.transaction.v0_9_rc ABI object — safe for IPC.
   *
   * @param {object} params
   * @param {string} params.goalId
   * @param {string} params.provider
   * @param {number} params.amount
   * @param {string} params.currency
   * @param {string} params.entityType  e.g. 'restaurant_order', 'flight_booking', 'hotel_reservation'
   * @param {string} [params.idempotencyKey]  Caller-provided. Prevents double-charge.
   * @param {boolean} params.paymentRequired
   */
  create(params) {
    const {
      goalId,
      provider,
      amount,
      currency = 'INR',
      entityType = 'unknown',
      paymentRequired = true,
    } = params;

    // ── Idempotency check ──────────────────────────────────────────────
    const idempotencyKey = params.idempotencyKey || `${goalId}_${provider}_${amount}`;
    if (this._idempotencyKeys.has(idempotencyKey)) {
      const existingId = this._idempotencyKeys.get(idempotencyKey);
      const existing = this._transactions.get(existingId);
      this._auditLog.append(existingId, 'DUPLICATE_REJECTED', { idempotencyKey });
      return this._buildABI(existing);
    }

    const transactionId = `txn_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const transaction = {
      abi: ABI_VERSION,
      transaction_id: transactionId,
      idempotency_key: idempotencyKey,
      goal_id: goalId,
      provider,
      status: TRANSACTION_STATUS.PENDING,
      amount,
      currency,
      entity_type: entityType,
      payment_required: paymentRequired,
      created_at: now,
      updated_at: now,
      retry_count: 0,
    };

    this._transactions.set(transactionId, transaction);
    this._idempotencyKeys.set(idempotencyKey, transactionId);
    this._auditLog.append(transactionId, 'CREATED', { provider, amount, entityType });
    this._publish('kernel.transaction.created', this._buildABI(transaction));

    return this._buildABI(transaction);
  }

  /**
   * Transition a transaction to a new status.
   * Enforces the legal state transition table.
   */
  transition(transactionId, newStatus, metadata = {}) {
    const tx = this._transactions.get(transactionId);
    if (!tx) throw new Error(`Transaction ${transactionId} not found`);

    const allowed = LEGAL_TRANSITIONS[tx.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Illegal transition: ${tx.status} → ${newStatus} for transaction ${transactionId}`);
    }

    tx.status = newStatus;
    tx.updated_at = new Date().toISOString();
    if (newStatus === TRANSACTION_STATUS.PAYMENT_RETRYABLE) {
      tx.retry_count += 1;
    }

    this._auditLog.append(transactionId, `STATUS_CHANGED_TO_${newStatus}`, metadata);
    this._publish('kernel.transaction.state_changed', { ...this._buildABI(tx), metadata });

    return this._buildABI(tx);
  }

  /**
   * Get a transaction ABI by ID.
   */
  get(transactionId) {
    const tx = this._transactions.get(transactionId);
    if (!tx) return null;
    return this._buildABI(tx);
  }

  /**
   * Return the audit trail for a transaction.
   */
  auditTrail(transactionId) {
    return this._auditLog.forTransaction(transactionId);
  }

  // ─── Private ────────────────────────────────────────────────────────────

  _buildABI(tx) {
    // Safe-for-IPC projection — no payment credentials included
    return {
      abi: tx.abi,
      transaction_id: tx.transaction_id,
      goal_id: tx.goal_id,
      provider: tx.provider,
      status: tx.status,
      amount: tx.amount,
      currency: tx.currency,
      entity_type: tx.entity_type,
      payment_required: tx.payment_required,
      retry_count: tx.retry_count,
      created_at: tx.created_at,
      updated_at: tx.updated_at,
    };
  }

  _publish(event, data) {
    if (this._bus) this._bus.publish(event, data);
  }
}

let _instance = null;
function getTransactionEngine(options = {}) {
  if (!_instance) _instance = new TransactionEngine(options);
  return _instance;
}

module.exports = { TransactionEngine, TRANSACTION_STATUS, LEGAL_TRANSITIONS, getTransactionEngine };

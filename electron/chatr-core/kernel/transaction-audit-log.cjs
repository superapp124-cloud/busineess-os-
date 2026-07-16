'use strict';

/**
 * CHATR Kernel — Transaction Audit Log
 * Platform Milestone P1.4
 *
 * Immutable append-only record of every transaction state change.
 * Never modified after written. Used for replay, recovery, and debugging.
 */
class TransactionAuditLog {
  constructor() {
    // In production: flush to disk or a structured log sink
    this._log = [];
  }

  /**
   * Append an entry. Cannot be removed or modified.
   */
  append(transactionId, event, payload = {}) {
    const entry = Object.freeze({
      transaction_id: transactionId,
      event,
      payload,
      recorded_at: new Date().toISOString(),
      seq: this._log.length,
    });
    this._log.push(entry);
    return entry;
  }

  /**
   * Read all entries for a transaction (read-only view).
   */
  forTransaction(transactionId) {
    return this._log.filter(e => e.transaction_id === transactionId);
  }

  /**
   * Return the entire log length (for metrics).
   */
  size() {
    return this._log.length;
  }
}

module.exports = { TransactionAuditLog };

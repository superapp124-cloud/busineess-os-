'use strict';

/**
 * CHATR Kernel — Execution Scheduler (v0.9 RC)
 * 
 * Contract:
 * - A time allocator, NEVER a decision-maker.
 * - Does not own execution state.
 * - Allocates ExecutionSlots based on fairness, priority, and rate limits.
 * - Enforces Lease Validation.
 */

const crypto = require('crypto');
const ABI = 'chatr.execution_slot.v0_9_rc';
const QUEUE_COLLECTION = 'kernel_scheduler_queue_v0_9_rc';

class Scheduler {
  constructor(options = {}) {
    this.persistence = options.persistence || this._fallbackPersistence();
    this.now = options.now || (() => new Date().toISOString());
    this.queue = [];
    this.processedRequests = new Set(); // To enforce idempotency
    
    // For fairness (Round Robin or aging)
    this.goalAllocations = new Map();

    this.loadFromDisk();
  }

  _fallbackPersistence() {
    return {
      store: () => true,
      retrieve: () => null,
      query: () => []
    };
  }

  loadFromDisk() {
    try {
      const records = this.persistence.query ? this.persistence.query(QUEUE_COLLECTION, {}) : [];
      if (Array.isArray(records)) {
        this.queue = records;
      }
    } catch (err) {
      // Ignore
    }
  }

  persistQueue() {
    if (this.persistence && this.persistence.store) {
      this.persistence.store(QUEUE_COLLECTION, { id: 'singleton_queue', queue: this.queue });
    }
  }

  /**
   * Submit a request for execution. 
   * Idempotent by goal_id + step_id.
   */
  requestSlot(goalId, workflowStep, leaseId, priority = 50, timestampMs = Date.now()) {
    const reqKey = `${goalId}:${workflowStep}`;
    if (this.processedRequests.has(reqKey)) {
      return; // Idempotent
    }

    this.queue.push({
      goal_id: goalId,
      workflow_step: workflowStep,
      lease_id: leaseId,
      priority: priority,
      queued_at: timestampMs,
      key: reqKey
    });

    this.processedRequests.add(reqKey);
    this.persistQueue();
  }

  /**
   * Determine the next valid slot, enforcing Fairness and Lease.
   * Runs in <2ms.
   */
  allocateNext(activeLeases = new Set()) {
    if (this.queue.length === 0) return null;

    // 1. Sort queue by Priority first, but apply an "aging" boost for fairness
    const nowMs = Date.now();
    this.queue.sort((a, b) => {
      // Boost priority by +1 for every 1000ms queued to prevent starvation
      const ageA = nowMs - a.queued_at;
      const ageB = nowMs - b.queued_at;
      
      // Penalize goals that have had a lot of allocations recently (Fairness)
      const allocA = this.goalAllocations.get(a.goal_id) || 0;
      const allocB = this.goalAllocations.get(b.goal_id) || 0;

      const effectivePriorityA = a.priority + Math.floor(ageA / 1000) - (allocA * 10);
      const effectivePriorityB = b.priority + Math.floor(ageB / 1000) - (allocB * 10);

      return effectivePriorityB - effectivePriorityA; // Descending
    });

    // 2. Select the first valid item
    for (let i = 0; i < this.queue.length; i++) {
      const candidate = this.queue[i];

      // Lease validation
      if (!activeLeases.has(candidate.lease_id)) {
        // Skip this item (it will age out or be removed, or wait for lease)
        continue;
      }

      // We found our candidate! Remove it.
      this.queue.splice(i, 1);
      this.processedRequests.delete(candidate.key); // Free up for future steps if needed

      // Update fairness counter
      this.goalAllocations.set(candidate.goal_id, (this.goalAllocations.get(candidate.goal_id) || 0) + 1);
      
      this.persistQueue();

      return {
        abi: ABI,
        goal_id: candidate.goal_id,
        workflow_step: candidate.workflow_step,
        scheduled_at: this.now(),
        priority: candidate.priority,
        lease_id: candidate.lease_id,
        execution_window: 'immediate',
        sequence: Date.now() // Simple sequence generator
      };
    }

    return null; // No items had a valid lease
  }
}

module.exports = { Scheduler };

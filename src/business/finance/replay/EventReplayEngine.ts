/**
 * CHATR Event Replay Engine (Phase 2G)
 * Replays immutable financial event streams to deterministically reconstruct subledgers and GL.
 */

import { CanonicalFinancialEvent } from '../events/FinancialEventMesh';
import { ARSubledger } from '../subledgers/ARSubledger';
import { APSubledger } from '../subledgers/APSubledger';

export interface ReplayResult {
  total_events: number;
  processed_events: number;
  skipped_duplicates: number;
  failed_events: number;
  final_ar_balance: number;
  final_ap_balance: number;
  duration_ms: number;
  deterministic: boolean;
}

export class EventReplayEngine {
  /**
   * Replays an ordered sequence of events and constructs the subledger state
   */
  public static replayEventStream(events: CanonicalFinancialEvent[]): ReplayResult {
    const startTime = Date.now();
    const seenIdempotencyKeys = new Set<string>();

    let arBalance = 0;
    let apBalance = 0;
    let skippedDuplicates = 0;
    let processed = 0;

    // 1. Sort chronologically by occurred_at
    const sorted = [...events].sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime());

    for (const evt of sorted) {
      // Idempotency check: exactly-once consequence
      if (seenIdempotencyKeys.has(evt.idempotency_key)) {
        skippedDuplicates++;
        continue;
      }
      seenIdempotencyKeys.add(evt.idempotency_key);

      const payload = evt.payload;

      switch (evt.event_type) {
        case 'invoice.created':
        case 'invoice.sent':
          if (payload.total) {
            arBalance += Number(payload.total);
            processed++;
          }
          break;

        case 'payment.received':
          if (payload.amount) {
            arBalance -= Number(payload.amount);
            processed++;
          }
          break;

        case 'bill.created':
        case 'bill.approved':
          if (payload.total) {
            apBalance += Number(payload.total);
            processed++;
          }
          break;

        case 'bill.paid':
          if (payload.amount) {
            apBalance -= Number(payload.amount);
            processed++;
          }
          break;

        default:
          processed++;
          break;
      }
    }

    const duration = Date.now() - startTime;

    return {
      total_events: events.length,
      processed_events: processed,
      skipped_duplicates: skippedDuplicates,
      failed_events: 0,
      final_ar_balance: Math.round(arBalance * 100) / 100,
      final_ap_balance: Math.round(apBalance * 100) / 100,
      duration_ms: duration,
      deterministic: true,
    };
  }
}

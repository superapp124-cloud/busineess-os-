/**
 * CHATR HEALTH OS — HealthDeduplicationEngine
 *
 * Prevents identical or overlapping biometric readings from multi-channel
 * pipelines (e.g. Garmin -> Health Connect -> CHATR vs direct BLE connection).
 */

import { NormalizedHealthSample } from './DeviceTypes';

export class HealthDeduplicationEngine {
  private static seenSignatures = new Set<string>();
  private static maxCacheSize = 2000;

  /**
   * Generates a deterministic signature for a sample based on
   * metric type, rounded timestamp (1-minute bucket), and value.
   */
  static getSignature(sample: NormalizedHealthSample): string {
    const timeMs = new Date(sample.timestamp).getTime();
    // Round to 1-minute window
    const minuteBucket = Math.floor(timeMs / (60 * 1000));
    return `${sample.userId}_${sample.metric}_${minuteBucket}_${sample.value}`;
  }

  /**
   * Checks if a sample has already been processed or stored
   */
  static isDuplicate(sample: NormalizedHealthSample): boolean {
    const signature = this.getSignature(sample);
    if (this.seenSignatures.has(signature)) {
      return true;
    }

    // Add to cache
    this.seenSignatures.add(signature);

    // Prune cache if it grows too large
    if (this.seenSignatures.size > this.maxCacheSize) {
      const iter = this.seenSignatures.values();
      for (let i = 0; i < 500; i++) {
        const next = iter.next();
        if (next.done) break;
        this.seenSignatures.delete(next.value);
      }
    }

    return false;
  }

  /**
   * Filters an array of samples, removing duplicates in-memory
   */
  static deduplicateBatch(samples: NormalizedHealthSample[]): NormalizedHealthSample[] {
    const result: NormalizedHealthSample[] = [];
    for (const sample of samples) {
      if (!this.isDuplicate(sample)) {
        result.push(sample);
      }
    }
    return result;
  }

  static clearCache() {
    this.seenSignatures.clear();
  }
}

/**
 * CHATR HEALTH OS — HealthSourceResolver
 *
 * Resolves source conflicts when multiple devices report the same biometric
 * within overlapping timeframes (e.g. ECG chest strap vs wrist PPG smartwatch).
 */

import { CanonicalHealthMetric, NormalizedHealthSample } from './DeviceTypes';

export class HealthSourceResolver {

  /**
   * Given conflicting samples for the same metric within the same measurement window,
   * select the sample with the highest clinical confidence.
   */
  static resolveBestSample(
    sampleA: NormalizedHealthSample,
    sampleB: NormalizedHealthSample
  ): NormalizedHealthSample {
    // 1. Compare confidence ratings
    if (sampleA.confidence > sampleB.confidence) return sampleA;
    if (sampleB.confidence > sampleA.confidence) return sampleB;

    // 2. Tie-break: Prefer direct BLE medical device over aggregate cloud channel
    const channelPriority: Record<string, number> = {
      bluetooth_le: 4,
      health_connect: 3,
      healthkit: 3,
      cloud_partner: 2,
      manual_entry: 1,
    };

    const prioA = channelPriority[sampleA.sourceChannel] || 0;
    const prioB = channelPriority[sampleB.sourceChannel] || 0;

    if (prioA >= prioB) return sampleA;
    return sampleB;
  }

  /**
   * Groups a batch of samples by metric and minute bucket, resolving any conflicts
   */
  static resolveBatch(samples: NormalizedHealthSample[]): NormalizedHealthSample[] {
    const bucketMap = new Map<string, NormalizedHealthSample>();

    for (const sample of samples) {
      const timeMs = new Date(sample.timestamp).getTime();
      const minuteBucket = Math.floor(timeMs / (60 * 1000));
      const key = `${sample.metric}_${minuteBucket}`;

      const existing = bucketMap.get(key);
      if (!existing) {
        bucketMap.set(key, sample);
      } else {
        bucketMap.set(key, this.resolveBestSample(existing, sample));
      }
    }

    return Array.from(bucketMap.values());
  }
}

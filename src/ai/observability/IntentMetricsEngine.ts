/**
 * CHATR SI OS — Intent Completion Rate (ICR) & Quality Quadrant Engine
 * src/ai/observability/IntentMetricsEngine.ts
 *
 * Implements the 4-Metric Quality Quadrant:
 * 1. Intent Completion Rate (ICR): Did CHATR accomplish the requested goal?
 * 2. Human Effort Removed: How much manual work disappeared? (apps, taps, time saved)
 * 3. Unnecessary Intervention Rate (UIR): How often did CHATR ask for something it could safely determine itself?
 * 4. Incorrect Action Rate (IAR): How often did CHATR execute something incorrectly? (Very high penalty for sensitive errors)
 *
 * Balance: Maximum useful autonomy within user-controlled boundaries.
 */

export interface EffortMetrics {
  appsAvoided: number;
  tapsAvoided: number;
  timeSavedSeconds: number;
}

export interface IntentRecord {
  intentId: string;
  timestamp: number;
  rawInput: string;
  domain: string;
  stage: 'EXPRESSED' | 'UNDERSTOOD' | 'EXECUTED' | 'VERIFIED' | 'COMPLETED_EFFORTLESS' | 'FAILED';
  effort: EffortMetrics;
  wasCorrect: boolean;
  hadUnnecessaryIntervention: boolean;
  requiresBiometricConfirmation?: boolean;
  notes?: string;
}

export interface AggregatedIntentKPIs {
  totalIntents: number;
  understoodCount: number;
  executedCount: number;
  verifiedCount: number;
  effortlessCompletedCount: number;
  // 4-Part Quality Quadrant:
  intentCompletionRatePercent: number; // 1. ICR
  totalAppsAvoided: number;            // 2. Effort: Apps
  totalTapsAvoided: number;            // 2. Effort: Taps
  totalTimeSavedSeconds: number;       // 2. Effort: Time
  totalTimeSavedMinutes: number;
  unnecessaryInterventionRatePercent: number; // 3. UIR
  incorrectActionRatePercent: number;         // 4. IAR
  userTrustScore: number;                     // Unified Trust Score (0-100)
}

const STORAGE_KEY_INTENT_METRICS = 'chatr.ai.intent_metrics';

export class IntentMetricsEngine {
  private static instance: IntentMetricsEngine;
  private records: IntentRecord[] = [];

  private constructor() {
    this.restore();
  }

  public static getInstance(): IntentMetricsEngine {
    if (!IntentMetricsEngine.instance) {
      IntentMetricsEngine.instance = new IntentMetricsEngine();
    }
    return IntentMetricsEngine.instance;
  }

  private restore(): void {
    if (typeof globalThis.localStorage === 'undefined') return;
    try {
      const raw = globalThis.localStorage.getItem(STORAGE_KEY_INTENT_METRICS);
      if (raw) {
        this.records = JSON.parse(raw);
      }
    } catch {
      this.records = [];
    }
  }

  private persist(): void {
    if (typeof globalThis.localStorage === 'undefined') return;
    try {
      const trimmed = this.records.slice(-1000);
      globalThis.localStorage.setItem(STORAGE_KEY_INTENT_METRICS, JSON.stringify(trimmed));
    } catch {}
  }

  /**
   * Records an intent lifecycle transition, effort metrics, and correctness validation
   */
  public recordIntent(record: {
    intentId?: string;
    rawInput: string;
    domain: string;
    stage: 'EXPRESSED' | 'UNDERSTOOD' | 'EXECUTED' | 'VERIFIED' | 'COMPLETED_EFFORTLESS' | 'FAILED';
    effort?: Partial<EffortMetrics>;
    wasCorrect?: boolean;
    hadUnnecessaryIntervention?: boolean;
    notes?: string;
  }): IntentRecord {
    const id = record.intentId || `intent_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const defaultEffort: EffortMetrics = {
      appsAvoided: record.domain === 'TRAVEL' ? 3 : record.domain === 'HEALTH' ? 2 : 1,
      tapsAvoided: record.domain === 'COMMUNICATION' ? 8 : record.domain === 'TRAVEL' ? 14 : 6,
      timeSavedSeconds: record.domain === 'COMMUNICATION' && record.rawInput.length > 100 ? 120 : 30,
    };

    const finalEffort: EffortMetrics = {
      appsAvoided: record.effort?.appsAvoided ?? defaultEffort.appsAvoided,
      tapsAvoided: record.effort?.tapsAvoided ?? defaultEffort.tapsAvoided,
      timeSavedSeconds: record.effort?.timeSavedSeconds ?? defaultEffort.timeSavedSeconds,
    };

    const newRecord: IntentRecord = {
      intentId: id,
      timestamp: Date.now(),
      rawInput: record.rawInput,
      domain: record.domain,
      stage: record.stage,
      effort: finalEffort,
      wasCorrect: record.wasCorrect ?? (record.stage !== 'FAILED'),
      hadUnnecessaryIntervention: record.hadUnnecessaryIntervention ?? false,
      notes: record.notes,
    };

    this.records.push(newRecord);
    this.persist();
    return newRecord;
  }

  /**
   * Computes the aggregated 4-Part Quality Quadrant
   */
  public getKPIs(): AggregatedIntentKPIs {
    const total = this.records.length;
    if (total === 0) {
      return {
        totalIntents: 0,
        understoodCount: 0,
        executedCount: 0,
        verifiedCount: 0,
        effortlessCompletedCount: 0,
        intentCompletionRatePercent: 100,
        totalAppsAvoided: 0,
        totalTapsAvoided: 0,
        totalTimeSavedSeconds: 0,
        totalTimeSavedMinutes: 0,
        unnecessaryInterventionRatePercent: 0,
        incorrectActionRatePercent: 0,
        userTrustScore: 100,
      };
    }

    let understood = 0;
    let executed = 0;
    let verified = 0;
    let effortless = 0;
    let appsAvoided = 0;
    let tapsAvoided = 0;
    let timeSaved = 0;
    let incorrectCount = 0;
    let unnecessaryInterventionCount = 0;

    for (const r of this.records) {
      if (['UNDERSTOOD', 'EXECUTED', 'VERIFIED', 'COMPLETED_EFFORTLESS'].includes(r.stage)) understood++;
      if (['EXECUTED', 'VERIFIED', 'COMPLETED_EFFORTLESS'].includes(r.stage)) executed++;
      if (['VERIFIED', 'COMPLETED_EFFORTLESS'].includes(r.stage)) verified++;
      if (r.stage === 'COMPLETED_EFFORTLESS') effortless++;

      appsAvoided += r.effort.appsAvoided;
      tapsAvoided += r.effort.tapsAvoided;
      timeSaved += r.effort.timeSavedSeconds;

      if (!r.wasCorrect) incorrectCount++;
      if (r.hadUnnecessaryIntervention) unnecessaryInterventionCount++;
    }

    const icr = (effortless / total) * 100;
    const uir = (unnecessaryInterventionCount / total) * 100;
    const iar = (incorrectCount / total) * 100;

    // Trust calculation: heavy penalty on incorrect actions, moderate penalty on unnecessary interventions
    const trustScore = Math.max(0, Math.min(100, icr * (1 - (iar / 100) * 2.0) * (1 - (uir / 100) * 0.5)));

    return {
      totalIntents: total,
      understoodCount: understood,
      executedCount: executed,
      verifiedCount: verified,
      effortlessCompletedCount: effortless,
      intentCompletionRatePercent: Math.round(icr * 10) / 10,
      totalAppsAvoided: appsAvoided,
      totalTapsAvoided: tapsAvoided,
      totalTimeSavedSeconds: timeSaved,
      totalTimeSavedMinutes: Math.round(timeSaved / 60),
      unnecessaryInterventionRatePercent: Math.round(uir * 10) / 10,
      incorrectActionRatePercent: Math.round(iar * 10) / 10,
      userTrustScore: Math.round(trustScore * 10) / 10,
    };
  }

  public clear(): void {
    this.records = [];
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.removeItem(STORAGE_KEY_INTENT_METRICS);
    }
  }
}

export const intentMetricsEngine = IntentMetricsEngine.getInstance();

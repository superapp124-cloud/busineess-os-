/**
 * CHATR HEALTH OS — PersonalBaselineEngine
 *
 * Learns the user's own normal ranges from their actual health history.
 * This is what makes CHATR Health OS personal — not generic thresholds.
 *
 * Rules:
 *  - Never invent a baseline. If insufficient data: return null.
 *  - Minimum data requirement: 5+ readings over 7+ days for a domain.
 *  - Uses user_health_profiles.baseline JSON column for persistence.
 *  - Does NOT create new tables — extends existing user_health_profiles.
 */

import { supabase } from '@/integrations/supabase/client';
import { localHealthStore } from './LocalHealthStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BaselineRange {
  min: number;
  max: number;
  average: number;
  stdDev: number;
  sampleCount: number;
  periodDays: number;
  lastUpdated: string; // ISO
}

export interface PersonalBaseline {
  // Vital domains (null = insufficient data)
  blood_pressure_systolic: BaselineRange | null;
  blood_pressure_diastolic: BaselineRange | null;
  heart_rate: BaselineRange | null;
  weight: BaselineRange | null;
  glucose: BaselineRange | null;
  temperature: BaselineRange | null;
  oxygen_saturation: BaselineRange | null;
  step_count?: BaselineRange | null;
  sleep_duration?: BaselineRange | null;
  ranges?: Record<string, BaselineRange>;
  // Behavioral domains
  medication_adherence_rate: number | null;  // 0–1, null if < 5 data points
  // Meta
  established: boolean;   // true if at least 1 domain has sufficient data
  establishedDomains: string[];
  computedAt: string; // ISO
}

export interface BaselineStatus {
  established: boolean;
  domains: Record<string, 'established' | 'insufficient_data' | 'no_data'>;
  message: string;  // shown in UI
}

// ─── Statistical helpers ───────────────────────────────────────────────────────

function computeStats(values: number[]): Omit<BaselineRange, 'periodDays' | 'lastUpdated'> | null {
  if (values.length < 5) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const average = sum / sorted.length;

  const variance = sorted.reduce((acc, v) => acc + Math.pow(v - average, 2), 0) / sorted.length;
  const stdDev = Math.sqrt(variance);

  // Use ±2 sigma for baseline range (captures ~95% of normal readings)
  return {
    min: Math.max(0, average - 2 * stdDev),
    max: average + 2 * stdDev,
    average,
    stdDev,
    sampleCount: values.length,
  };
}

// ─── Engine class ─────────────────────────────────────────────────────────────

class PersonalBaselineEngineImpl {

  /**
   * Compute the user's personal baseline from their historical vital data.
   * Uses chronic_vitals table (existing — untouched).
   * Minimum: 5 readings over 7+ days per domain.
   */
  async computeBaseline(userId: string, lookbackDays = 90): Promise<PersonalBaseline> {
    const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);
    let vitals: Array<{ vital_type: string; value: number; recorded_at: string }> | null = null;
    let intakeLog: Array<{ status: string; scheduled_time: string }> | null = null;

    try {
      const { data: vData } = await supabase
        .from('chronic_vitals')
        .select('vital_type, value, recorded_at')
        .eq('user_id', userId)
        .gte('recorded_at', since.toISOString())
        .order('recorded_at', { ascending: true });
      vitals = vData;

      const { data: iData } = await supabase
        .from('medicine_intake_log')
        .select('status, scheduled_time')
        .eq('user_id', userId)
        .gte('scheduled_time', since.toISOString());
      intakeLog = iData;
    } catch (e) {
      console.warn('[PersonalBaselineEngine] Supabase offline fallback for baseline computation:', e);
    }

    const now = new Date();
    const establishedDomains: string[] = [];

    // ── Group vitals by type ───────────────────────────────────────────────
    const grouped: Record<string, { values: number[]; dates: string[] }> = {};

    for (const v of vitals || []) {
      if (!grouped[v.vital_type]) {
        grouped[v.vital_type] = { values: [], dates: [] };
      }
      grouped[v.vital_type].values.push(Number(v.value));
      grouped[v.vital_type].dates.push(v.recorded_at);
    }

    // Merge offline local vitals
    const localSamples = localHealthStore.getVitals(undefined, lookbackDays);
    for (const s of localSamples) {
      if (!grouped[s.metric]) {
        grouped[s.metric] = { values: [], dates: [] };
      }
      grouped[s.metric].values.push(Number(s.value));
      grouped[s.metric].dates.push(s.timestamp);
    }

    const buildRange = (vitalType: string): BaselineRange | null => {
      const group = grouped[vitalType];
      if (!group || group.values.length < 5) return null;

      // Check date spread (need ≥7 days of data)
      const dates = group.dates.map(d => new Date(d).getTime());
      const periodMs = Math.max(...dates) - Math.min(...dates);
      const periodDays = periodMs / (1000 * 60 * 60 * 24);
      if (periodDays < 7) return null;

      const stats = computeStats(group.values);
      if (!stats) return null;

      establishedDomains.push(vitalType);
      return {
        ...stats,
        periodDays: Math.round(periodDays),
        lastUpdated: now.toISOString(),
      };
    };

    // ── Medication adherence ───────────────────────────────────────────────
    let adherenceRate: number | null = null;
    if (intakeLog && intakeLog.length >= 5) {
      const taken = intakeLog.filter(l => l.status === 'taken').length;
      adherenceRate = taken / intakeLog.length;
      if (adherenceRate !== null) establishedDomains.push('medication_adherence');
    }

    const ranges: Record<string, BaselineRange> = {};
    const bpSys = buildRange('blood_pressure_systolic');
    const bpDia = buildRange('blood_pressure_diastolic');
    const hr = buildRange('heart_rate');
    const wt = buildRange('weight');
    const bg = buildRange('blood_glucose') || buildRange('glucose');
    const temp = buildRange('temperature');
    const spo2 = buildRange('oxygen_saturation') || buildRange('spo2');
    const steps = buildRange('step_count') || buildRange('steps');
    const sleep = buildRange('sleep_duration') || buildRange('sleep_duration_seconds');

    if (bpSys) ranges['blood_pressure_systolic'] = bpSys;
    if (bpDia) ranges['blood_pressure_diastolic'] = bpDia;
    if (hr) ranges['heart_rate'] = hr;
    if (wt) ranges['weight'] = wt;
    if (bg) { ranges['blood_glucose'] = bg; ranges['glucose'] = bg; }
    if (temp) ranges['temperature'] = temp;
    if (spo2) { ranges['oxygen_saturation'] = spo2; ranges['spo2'] = spo2; }
    if (steps) { ranges['step_count'] = steps; ranges['steps'] = steps; }
    if (sleep) { ranges['sleep_duration'] = sleep; ranges['sleep_duration_seconds'] = sleep; }

    const baseline: PersonalBaseline = {
      blood_pressure_systolic: bpSys,
      blood_pressure_diastolic: bpDia,
      heart_rate: hr,
      weight: wt,
      glucose: bg,
      temperature: temp,
      oxygen_saturation: spo2,
      step_count: steps,
      sleep_duration: sleep,
      ranges,
      medication_adherence_rate: adherenceRate,
      established: establishedDomains.length > 0,
      establishedDomains,
      computedAt: now.toISOString(),
    };

    localHealthStore.saveBaseline(baseline);
    return baseline;
  }

  /**
   * Persist the computed baseline into user_health_profiles.
   * Uses the existing 'baseline' JSON column (or adds to profile JSON).
   * Does NOT alter the user_health_profiles table schema.
   */
  async persistBaseline(userId: string, baseline: PersonalBaseline): Promise<void> {
    // Upsert into user_health_profiles baseline column
    const { error } = await supabase
      .from('user_health_profiles')
      .upsert(
        {
          user_id: userId,
          baseline: baseline as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      // If baseline column doesn't exist yet, fail silently
      // The OS will still work without persisted baseline
      console.warn('[PersonalBaselineEngine] Could not persist baseline:', error.message);
    }
  }

  /**
   * Load previously computed baseline from user_health_profiles.
   * Returns null if no baseline exists yet.
   */
  async loadBaseline(userId: string): Promise<PersonalBaseline | null> {
    const { data, error } = await supabase
      .from('user_health_profiles')
      .select('baseline')
      .eq('user_id', userId)
      .single();

    if (error || !data?.baseline) return null;

    return data.baseline as unknown as PersonalBaseline;
  }

  /**
   * Compute the delta between a new reading and the user's baseline.
   * Returns null if no baseline exists for this vital type.
   * Positive = above baseline, negative = below.
   */
  deltaFromBaseline(
    baseline: PersonalBaseline | null,
    vitalType: keyof Omit<PersonalBaseline, 'established' | 'establishedDomains' | 'computedAt' | 'medication_adherence_rate'>,
    value: number
  ): number | null {
    if (!baseline) return null;
    const range = baseline[vitalType];
    if (!range) return null;
    return (value - range.average) / (range.stdDev || 1);
  }

  /**
   * Generate a human-readable baseline status for the UI.
   * Never shows technical numbers — shows status labels.
   */
  getBaselineStatus(baseline: PersonalBaseline | null): BaselineStatus {
    if (!baseline) {
      return {
        established: false,
        domains: {},
        message: 'CHATR needs more health history to learn your personal baseline',
      };
    }

    const domains: Record<string, 'established' | 'insufficient_data' | 'no_data'> = {
      blood_pressure: baseline.blood_pressure_systolic ? 'established' : 'insufficient_data',
      heart_rate: baseline.heart_rate ? 'established' : 'insufficient_data',
      weight: baseline.weight ? 'established' : 'insufficient_data',
      glucose: baseline.glucose ? 'established' : 'insufficient_data',
      medication_adherence: baseline.medication_adherence_rate !== null ? 'established' : 'insufficient_data',
    };

    const establishedCount = Object.values(domains).filter(v => v === 'established').length;
    const message = establishedCount === 0
      ? 'Not enough data yet to establish your personal baseline'
      : `Personal baseline established for ${establishedCount} health domain${establishedCount > 1 ? 's' : ''}`;

    return {
      established: baseline.established,
      domains,
      message,
    };
  }

  /**
   * Get cached personal baseline from local store
   */
  getBaseline(): PersonalBaseline | null {
    return localHealthStore.getBaseline();
  }
}

export const PersonalBaselineEngine = new PersonalBaselineEngineImpl();

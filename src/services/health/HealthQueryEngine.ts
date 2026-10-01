/**
 * CHATR HEALTH OS — HealthQueryEngine
 *
 * Local Semantic Memory & Health Query Layer
 *
 * Answers natural language health questions ("What changed in my sleep this month?",
 * "How is my blood pressure trending?", "Is my heart rate normal?") 100% locally,
 * deterministically, and with zero LLM hallucination.
 *
 * Operates offline using LocalHealthStore, PersonalBaselineEngine, and HealthStateEngine.
 */

import { localHealthStore, HealthProvenanceRecord } from './LocalHealthStore';
import { PersonalBaselineEngine } from './PersonalBaselineEngine';
import { HealthStateEngine, ComputedHealthState } from './HealthStateEngine';
import { CanonicalHealthMetric, NormalizedHealthSample } from './devices/DeviceTypes';

export interface HealthQueryResult {
  answer: string;
  metric?: CanonicalHealthMetric;
  timeRange: string;
  dataPointsCount: number;
  currentAverage?: number;
  previousAverage?: number;
  trendDirection?: 'improving' | 'stable' | 'declining' | 'elevated' | 'insufficient_data';
  deltaPercentage?: number;
  inBaselineRange?: boolean;
  provenanceSources: string[];
  safetyAlert?: string;
  suggestedActionRoute?: string;
}

export class HealthQueryEngineImpl {
  /**
   * Determine if this natural language query is health/vitals related.
   */
  public canHandle(query: string): boolean {
    const q = query.toLowerCase().trim();
    const keywords = [
      'sleep', 'slept', 'insomnia', 'deep sleep', 'rem sleep',
      'blood pressure', 'bp', 'systolic', 'diastolic', 'hypertension',
      'heart rate', 'pulse', 'bpm', 'resting heart', 'rhr',
      'glucose', 'sugar', 'blood sugar', 'diabetes',
      'steps', 'walked', 'walking', 'activity', 'exercise',
      'weight', 'weighed', 'kg', 'lbs', 'bmi',
      'spo2', 'oxygen', 'saturation',
      'baseline', 'health state', 'health summary', 'my vitals',
      'health', 'how is my health', 'my health', 'health status',
      'how am i doing', 'vitals status', 'vitals trend'
    ];
    return keywords.some(k => q.includes(k));
  }

  /**
   * Process query and return structured, explainable health intelligence.
   */
  public query(query: string, name?: string): HealthQueryResult {
    const q = query.toLowerCase().trim();

    // 1. Safety Emergency Triage First
    if (/heart attack|stroke|chest pain|can't breathe|unconscious|passing out|severe bleeding/i.test(q)) {
      return {
        answer: `🚨 **Immediate Medical Emergency Warning**\n\nIf you or someone nearby is experiencing chest pain, difficulty breathing, or signs of stroke:\n\n• **Call 108 or 102 immediately**\n• Rest quietly and do not strain\n• Unlock your door for paramedics\n\nDo not rely on app responses for acute emergencies.`,
        timeRange: 'immediate',
        dataPointsCount: 0,
        provenanceSources: ['Emergency Safety Protocol'],
        safetyAlert: 'Emergency protocol triggered',
        suggestedActionRoute: '/care'
      };
    }

    // 2. Identify Metric Target
    let targetMetric: CanonicalHealthMetric | null = null;
    let metricLabel = '';
    let unit = '';

    if (/sleep|slept|rest|rem|insomnia/i.test(q)) {
      targetMetric = 'sleep_duration';
      metricLabel = 'Sleep Duration';
      unit = 'hrs';
    } else if (/blood pressure|bp|systolic|diastolic|hypertens/i.test(q)) {
      targetMetric = 'blood_pressure_systolic';
      metricLabel = 'Blood Pressure';
      unit = 'mmHg';
    } else if (/heart rate|pulse|bpm|resting heart|rhr/i.test(q)) {
      targetMetric = 'heart_rate';
      metricLabel = 'Heart Rate';
      unit = 'bpm';
    } else if (/glucose|sugar|diabetes/i.test(q)) {
      targetMetric = 'blood_glucose';
      metricLabel = 'Blood Glucose';
      unit = 'mg/dL';
    } else if (/steps|walked|activity|exercise/i.test(q)) {
      targetMetric = 'step_count';
      metricLabel = 'Steps';
      unit = 'steps';
    } else if (/weight|kg|lbs|bmi/i.test(q)) {
      targetMetric = 'weight';
      metricLabel = 'Weight';
      unit = 'kg';
    } else if (/spo2|oxygen|saturation/i.test(q)) {
      targetMetric = 'oxygen_saturation';
      metricLabel = 'Blood Oxygen (SpO2)';
      unit = '%';
    }

    // 3. Handle Overall Health Summary / Baseline Query
    if (!targetMetric || /baseline|health state|health summary|how am i doing|overview/i.test(q)) {
      return this.generateOverallSummary(q, name);
    }

    // 4. Metric-specific local analysis
    return this.analyzeMetric(targetMetric, metricLabel, unit, q);
  }

  private analyzeMetric(
    metric: CanonicalHealthMetric,
    label: string,
    unit: string,
    query: string
  ): HealthQueryResult {
    const isMonthly = /month|30 days|monthly/i.test(query);
    const days = isMonthly ? 30 : 7;
    const timeRangeStr = isMonthly ? 'Last 30 days' : 'Last 7 days';

    const vitals = localHealthStore.getVitals(metric, days);
    const baseline = localHealthStore.getBaseline() || PersonalBaselineEngine.getBaseline();
    const baselineRange = baseline?.ranges ? baseline.ranges[metric] : (baseline as any)?.[metric];

    // Collect provenance
    const sourcesSet = new Set<string>();
    vitals.forEach(v => {
      const p = localHealthStore.getProvenance(v.id);
      if (p?.deviceName) sourcesSet.add(p.deviceName);
      else if (p?.source) sourcesSet.add(p.source);
    });
    const provenanceSources = sourcesSet.size > 0 ? Array.from(sourcesSet) : ['Local Device Store'];

    // If zero data recorded
    if (vitals.length === 0) {
      return {
        answer: `📊 **${label}**: No readings have been logged in the ${timeRangeStr.toLowerCase()}.\n\nYou can log readings anytime by tapping the **microphone** on Health Hub ("My BP is 120 over 80") or connecting a Bluetooth device.`,
        metric,
        timeRange: timeRangeStr,
        dataPointsCount: 0,
        provenanceSources: ['Local Store (empty)'],
        trendDirection: 'insufficient_data',
        suggestedActionRoute: '/health'
      };
    }

    // For sleep, convert raw minutes or seconds to hours
    const normalizeVal = (val: number): number => {
      if (metric === 'sleep_duration') {
        return val > 24 ? Number((val / 60).toFixed(1)) : Number(val.toFixed(1));
      }
      return Number(val.toFixed(1));
    };

    const values = vitals.map(v => normalizeVal(v.value));
    const currentAvg = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const latestVal = values[0];

    // Calculate trend if we have multiple readings
    let trendDirection: 'improving' | 'stable' | 'declining' | 'elevated' | 'insufficient_data' = 'stable';
    let deltaPercentage = 0;
    let trendExplanation = '';

    if (values.length >= 2) {
      const half = Math.floor(values.length / 2);
      const recentHalf = values.slice(0, half);
      const olderHalf = values.slice(half);

      const recentAvg = recentHalf.reduce((a, b) => a + b, 0) / recentHalf.length;
      const olderAvg = olderHalf.reduce((a, b) => a + b, 0) / olderHalf.length;

      if (olderAvg > 0) {
        deltaPercentage = Number((((recentAvg - olderAvg) / olderAvg) * 100).toFixed(1));
      }

      if (metric === 'sleep_duration' || metric === 'step_count') {
        if (deltaPercentage >= 5) {
          trendDirection = 'improving';
          trendExplanation = `trending up by +${deltaPercentage}%`;
        } else if (deltaPercentage <= -5) {
          trendDirection = 'declining';
          trendExplanation = `trending down by ${deltaPercentage}%`;
        } else {
          trendDirection = 'stable';
          trendExplanation = 'holding steady';
        }
      } else if (metric === 'blood_pressure_systolic' || metric === 'blood_glucose' || metric === 'heart_rate') {
        if (deltaPercentage >= 5) {
          trendDirection = 'elevated';
          trendExplanation = `higher by +${deltaPercentage}%`;
        } else if (deltaPercentage <= -5) {
          trendDirection = 'improving';
          trendExplanation = `lower by ${deltaPercentage}%`;
        } else {
          trendDirection = 'stable';
          trendExplanation = 'holding steady';
        }
      }
    }

    // Compare with personal baseline
    let inBaseline = true;
    let baselineText = '';
    if (baselineRange) {
      if (currentAvg < baselineRange.min) {
        inBaseline = false;
        baselineText = `• **Baseline comparison**: Below your normal range (${baselineRange.min}–${baselineRange.max} ${unit})`;
      } else if (currentAvg > baselineRange.max) {
        inBaseline = false;
        baselineText = `• **Baseline comparison**: Above your normal range (${baselineRange.min}–${baselineRange.max} ${unit})`;
      } else {
        baselineText = `• **Baseline comparison**: Within your expected range (${baselineRange.min}–${baselineRange.max} ${unit})`;
      }
    } else {
      baselineText = `• **Personal baseline**: Calibrating (requires 7–14 days of readings)`;
    }

    // Check for paired diastolic values if metric is blood_pressure_systolic
    let diastolicInfo = '';
    let metricTitle = label;

    if (metric === 'blood_pressure_systolic') {
      metricTitle = 'Blood Pressure';
      const diastolicValues = vitals
        .map(v => v.secondaryValue)
        .filter((val): val is number => typeof val === 'number');

      if (diastolicValues.length > 0) {
        const diaAvg = Math.round(diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length);
        const latestDia = diastolicValues[0];
        const minDia = Math.min(...diastolicValues);
        const maxDia = Math.max(...diastolicValues);

        diastolicInfo = `
• **Systolic BP Average**: **${currentAvg} mmHg** (${trendExplanation || 'steady'})
• **Diastolic BP Average**: **${diaAvg} mmHg**
• **Latest reading**: ${latestVal}/${latestDia} mmHg
• **Range observed**: Systolic ${minVal}–${maxVal} mmHg, Diastolic ${minDia}–${maxDia} mmHg across ${vitals.length} reading${vitals.length > 1 ? 's' : ''}`;
      } else {
        diastolicInfo = `
• **Systolic BP Average**: **${currentAvg} mmHg** (${trendExplanation || 'steady'})
• **Latest reading**: ${latestVal} mmHg (Systolic)
• **Range observed**: Systolic ${minVal} to ${maxVal} mmHg across ${vitals.length} reading${vitals.length > 1 ? 's' : ''}`;
      }
    }

    // Compose clinical Markdown answer
    const answer = metric === 'blood_pressure_systolic'
      ? `### 🩺 ${metricTitle} Analysis (${timeRangeStr})
${diastolicInfo}
${baselineText}
• **Data Sources**: ${provenanceSources.join(', ')}

*Note: This analysis is computed entirely on-device from your recorded vitals history.*`
      : `### 🩺 ${label} Analysis (${timeRangeStr})

• **Average**: **${currentAvg} ${unit}** (${trendExplanation || 'steady'})
• **Latest reading**: ${latestVal} ${unit}
• **Range observed**: ${minVal} to ${maxVal} ${unit} across ${vitals.length} reading${vitals.length > 1 ? 's' : ''}
${baselineText}
• **Data Sources**: ${provenanceSources.join(', ')}

*Note: This analysis is computed entirely on-device from your recorded vitals history.*`;

    return {
      answer,
      metric,
      timeRange: timeRangeStr,
      dataPointsCount: vitals.length,
      currentAverage: currentAvg,
      trendDirection,
      deltaPercentage,
      inBaselineRange: inBaseline,
      provenanceSources,
      suggestedActionRoute: '/health'
    };
  }

  private generateOverallSummary(query: string, name?: string): HealthQueryResult {
    const baseline = localHealthStore.getBaseline() || PersonalBaselineEngine.getBaseline();
    const events = localHealthStore.getEvents();
    const vitals = localHealthStore.getVitals();

    const state = HealthStateEngine.compute(
      events,
      baseline,
      vitals.map(v => ({ vital_type: v.metric, value: v.value, recorded_at: v.timestamp }))
    );

    const greeting = name ? `Hello ${name}, here` : 'Here';
    const activeDomains = Object.entries(state.domainStates).filter(([_, d]) => d.hasData);

    let domainBulletList = '';
    if (activeDomains.length > 0) {
      domainBulletList = activeDomains
        .map(([key, d]) => `• **${key.charAt(0).toUpperCase() + key.slice(1)}**: ${d.label} — ${d.observation}`)
        .join('\n');
    } else {
      domainBulletList = '• Establishing baseline — log your daily vitals or connect devices to activate continuous insights.';
    }

    const answer = `### 🌟 Personal Health OS Overview

${greeting} is your real-time on-device health state:

• **Overall State**: **${state.label}** ${state.score ? `(Score: ${state.score}/100)` : '(Calibrating)'}
• **Confidence**: Math confidence ${Math.round(state.confidence * 100)}% based on ${state.eventsAnalyzed} events

${domainBulletList}

${state.activeSafetyFlags.length > 0 ? `⚠️ **Safety alerts**: ${state.activeSafetyFlags.join(', ')}\n` : ''}
*Computed 100% locally on your phone without cloud dependence.*`;

    return {
      answer,
      timeRange: 'Current',
      dataPointsCount: state.eventsAnalyzed,
      trendDirection: state.state === 'improving' ? 'improving' : state.state === 'needs_attention' ? 'declining' : 'stable',
      provenanceSources: ['Local Health OS Engine'],
      suggestedActionRoute: '/health'
    };
  }
}

export const healthQueryEngine = new HealthQueryEngineImpl();

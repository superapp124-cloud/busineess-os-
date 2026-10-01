/**
 * CHATR HEALTH OS — HealthEventEvaluator
 *
 * Connects: Universal Devices → Health Events → Personal Baseline
 *
 * Evaluates normalized health samples against:
 * 1. Clinical Emergency Red-Flags (P0 = Immediate Safety Override)
 * 2. Personal Baseline Ranges (μ ± 2σ statistical anomaly detection)
 * 3. Clinical Guidelines (when baseline is still calibrating)
 *
 * Produces fully contextualized HealthEvent metadata (priority, isAnomaly, baselineDelta, anomalyReason).
 */

import { NormalizedHealthSample, CanonicalHealthMetric } from './devices/DeviceTypes';
import { PersonalBaseline, BaselineRange } from './PersonalBaselineEngine';
import { EventPriority, HealthEvent } from './HealthEventService';

export const CLINICAL_SAFETY_SPEC = {
  version: '2026.1',
  citations: [
    'AHA/ACC 2017/2024 Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults',
    'ADA 2025 Standards of Medical Care in Diabetes: Glycemic Targets',
    'WHO Clinical Guidance for Hypoxemia and Pulse Oximetry Management',
  ],
  guidelines: {
    blood_pressure_crisis_systolic: 180,
    blood_pressure_crisis_diastolic: 120,
    blood_pressure_stage2_systolic: 140,
    blood_pressure_stage2_diastolic: 90,
    spo2_critical: 90,
    glucose_hypo_critical: 54,
    glucose_hyper_critical: 350,
    heart_rate_tachy_critical: 150,
    heart_rate_brady_critical: 40,
  },
};

export interface EvaluatedVitalResult {
  priority: EventPriority;
  isAnomaly: boolean;
  baselineDelta: number | null;
  anomalyReason: string | null;
  context: string;
  recommendedAction: string;
  actionRoute: string;
  requiresConfirmation?: boolean;
  confirmationGuidance?: string;
}

export class HealthEventEvaluator {
  /**
   * Evaluate a vital sample against clinical emergency red flags and personal baseline.
   */
  public static evaluateSample(
    sample: NormalizedHealthSample,
    baseline: PersonalBaseline | null
  ): EvaluatedVitalResult {
    const metric = sample.metric as CanonicalHealthMetric;
    const val = Number(sample.value);
    const secVal = sample.secondaryValue ? Number(sample.secondaryValue) : undefined;
    const deviceName = sample.sourceDeviceName || 'Health Device';

    // ──────────────────────────────────────────────────────────────────────────
    // 1. Clinical Emergency Red Flags (P0 = Immediate Safety Override)
    // ──────────────────────────────────────────────────────────────────────────

    // Blood Pressure: Hypertensive Crisis (Systolic >= 180 or Diastolic >= 120)
    // Ref: AHA/ACC 2017/2024 Guidelines. Protocol advises 5-minute seated rest & retake to confirm.
    if (metric === 'blood_pressure_systolic') {
      if (val >= CLINICAL_SAFETY_SPEC.guidelines.blood_pressure_crisis_systolic ||
          (secVal && secVal >= CLINICAL_SAFETY_SPEC.guidelines.blood_pressure_crisis_diastolic)) {
        return {
          priority: 0,
          isAnomaly: true,
          baselineDelta: 3.5,
          anomalyReason: `Hypertensive crisis alert: BP ${val}/${secVal || '—'} mmHg is critically elevated. Guideline protocol: Rest quietly for 5 minutes and retake measurement to confirm. If accompanied by acute symptoms (chest pain, shortness of breath, numbness, vision changes), seek immediate emergency care (Call 108/102).`,
          context: `Critical Blood Pressure: ${val}/${secVal || '—'} mmHg`,
          recommendedAction: 'Emergency Care',
          actionRoute: '/care',
          requiresConfirmation: true,
          confirmationGuidance: 'Rest quietly seated for 5 minutes with feet flat on the floor, then retake measurement to rule out cuff artifact.',
        };
      }
    }

    // Oxygen Saturation: Severe Hypoxemia (< 90%)
    if ((metric === 'oxygen_saturation' || (metric as string) === 'spo2') && val < 90) {
      return {
        priority: 0,
        isAnomaly: true,
        baselineDelta: -3.5,
        anomalyReason: `Severe hypoxemia alert: Blood oxygen is critically low (${val}%). Seek urgent medical care.`,
        context: `Critical Blood Oxygen: ${val}%`,
        recommendedAction: 'Emergency Protocol',
        actionRoute: '/care',
      };
    }

    // Heart Rate: Severe Tachycardia (> 150 bpm) or Severe Bradycardia (< 40 bpm)
    if (metric === 'heart_rate') {
      if (val >= 150 || val <= 40) {
        return {
          priority: 0,
          isAnomaly: true,
          baselineDelta: val >= 150 ? 3.5 : -3.5,
          anomalyReason: `Cardiac alert: Heart rate is ${val} bpm (critically ${val >= 150 ? 'elevated' : 'low'}).`,
          context: `Critical Heart Rate: ${val} bpm`,
          recommendedAction: 'Emergency Protocol',
          actionRoute: '/care',
        };
      }
    }

    // Blood Glucose: Severe Hypoglycemia (< 54 mg/dL) or Hyperglycemia (> 350 mg/dL)
    if (metric === 'blood_glucose') {
      if (val < 54 || val > 350) {
        return {
          priority: 0,
          isAnomaly: true,
          baselineDelta: val < 54 ? -3.5 : 3.5,
          anomalyReason: `Critical glucose alert: Blood glucose is ${val} mg/dL (${val < 54 ? 'severe hypoglycemia' : 'severe hyperglycemia'}).`,
          context: `Critical Glucose: ${val} mg/dL`,
          recommendedAction: 'Emergency Care',
          actionRoute: '/care',
        };
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. Personal Baseline Comparison (μ ± 2σ)
    // ──────────────────────────────────────────────────────────────────────────

    const range: BaselineRange | undefined | null = baseline?.ranges
      ? baseline.ranges[metric]
      : (baseline as any)?.[metric];

    if (range && range.sampleCount >= 5 && range.stdDev > 0) {
      const z = (val - range.average) / range.stdDev;
      // Anomaly when reading is outside 2 standard deviations (~95% confidence interval)
      if (Math.abs(z) >= 2.0) {
        const direction = z > 0 ? 'above' : 'below';
        const formattedDelta = Math.abs(z).toFixed(1);
        return {
          priority: 2, // P2 = Action required
          isAnomaly: true,
          baselineDelta: Number(z.toFixed(2)),
          anomalyReason: `Reading is ${formattedDelta}σ ${direction} your personal baseline (${range.min}–${range.max} ${sample.unit})`,
          context: `${deviceName}: ${metric.replace(/_/g, ' ')} outside normal range (${val} ${sample.unit})`,
          recommendedAction: 'Review Vitals',
          actionRoute: '/chronic-vitals',
        };
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. Clinical Guidelines Check (when personal baseline is calibrating)
    // ──────────────────────────────────────────────────────────────────────────

    if (!range || range.sampleCount < 5) {
      // Stage 2 Hypertension: Systolic >= 140 or Diastolic >= 90
      if (metric === 'blood_pressure_systolic' && (val >= 140 || (secVal && secVal >= 90))) {
        return {
          priority: 2,
          isAnomaly: true,
          baselineDelta: 2.1,
          anomalyReason: `Elevated blood pressure: ${val}/${secVal || '—'} mmHg (Stage 2 Hypertension range).`,
          context: `${deviceName}: Elevated BP ${val}/${secVal || '—'} mmHg`,
          recommendedAction: 'Consult Doctor',
          actionRoute: '/teleconsultation',
        };
      }

      // Elevated Fasting Glucose >= 126 mg/dL
      if (metric === 'blood_glucose' && val >= 180) {
        return {
          priority: 2,
          isAnomaly: true,
          baselineDelta: 2.0,
          anomalyReason: `Elevated glucose reading: ${val} mg/dL is notably high.`,
          context: `${deviceName}: Elevated glucose ${val} mg/dL`,
          recommendedAction: 'Review Diet & Meds',
          actionRoute: '/chronic-vitals',
        };
      }

      // Elevated Resting Heart Rate >= 100 bpm
      if (metric === 'heart_rate' && val >= 110) {
        return {
          priority: 2,
          isAnomaly: true,
          baselineDelta: 2.0,
          anomalyReason: `Elevated pulse: Heart rate is ${val} bpm.`,
          context: `${deviceName}: High heart rate ${val} bpm`,
          recommendedAction: 'Check Vitals',
          actionRoute: '/chronic-vitals',
        };
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. Normal Vital Reading (P4 = Routine Wellness / Info)
    // ──────────────────────────────────────────────────────────────────────────

    return {
      priority: 4,
      isAnomaly: false,
      baselineDelta: null,
      anomalyReason: null,
      context: `${deviceName}: ${metric.replace(/_/g, ' ')} = ${val} ${sample.unit}`,
      recommendedAction: 'View Vitals',
      actionRoute: '/chronic-vitals',
    };
  }

  /**
   * Build a canonical HealthEvent from an evaluated sample.
   */
  public static createHealthEvent(
    sample: NormalizedHealthSample,
    baseline: PersonalBaseline | null
  ): HealthEvent {
    const evaluation = this.evaluateSample(sample, baseline);

    return {
      id: `evt_${sample.id}`,
      userId: sample.userId,
      eventType: 'vital_recorded',
      sourceTable: 'chronic_vitals',
      sourceRecordId: sample.id,
      eventValue: {
        metric: sample.metric,
        value: sample.value,
        secondaryValue: sample.secondaryValue,
        unit: sample.unit,
        channel: sample.sourceChannel,
        device: sample.sourceDeviceName,
        anomalyReason: evaluation.anomalyReason,
      },
      eventContext: evaluation.context,
      eventAt: new Date(sample.timestamp),
      confidence: sample.confidence,
      priority: evaluation.priority,
      isAnomaly: evaluation.isAnomaly,
      baselineDelta: evaluation.baselineDelta,
      anomalyReason: evaluation.anomalyReason,
      processed: false,
    };
  }
}

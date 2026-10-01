/**
 * CHATR HEALTH OS — HealthVoiceParser
 *
 * Fast, deterministic voice intent parser that converts natural speech transcripts
 * (from Whisper ONNX or native SpeechRecognizer) into structured HealthEvents.
 *
 * ZERO LLM token cost. ZERO network dependency. 100% offline.
 * Non-diagnostic: Extracts measurements and observations only.
 */

import { CanonicalHealthMetric, NormalizedHealthSample } from './devices/DeviceTypes';
import { HealthEvent } from './HealthEventService';
import { localHealthStore } from './LocalHealthStore';
import { HealthEventEvaluator } from './HealthEventEvaluator';

export interface VoiceHealthParseResult {
  success: boolean;
  metric?: CanonicalHealthMetric;
  sample?: NormalizedHealthSample;
  event?: HealthEvent;
  feedbackText: string;
  rawTranscript: string;
}

export class HealthVoiceParser {
  /**
   * Parse a voice transcript into a structured health event
   */
  public static parse(transcript: string, userId: string = 'user'): VoiceHealthParseResult {
    const text = transcript.trim().toLowerCase();
    const id = `voice_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date();

    // 1. Blood Pressure: "BP 128 over 82", "blood pressure 120/80", "130 by 85"
    const bpMatch = text.match(/(?:bp|blood\s*pressure)?\s*(\d{2,3})\s*(?:over|\/|by)\s*(\d{2,3})/i);
    if (bpMatch) {
      const systolic = parseInt(bpMatch[1], 10);
      const diastolic = parseInt(bpMatch[2], 10);

      // Basic sanity bounds check
      if (systolic >= 60 && systolic <= 260 && diastolic >= 40 && diastolic <= 150) {
        const sample: NormalizedHealthSample = {
          id,
          userId,
          metric: 'blood_pressure_systolic',
          value: systolic,
          secondaryValue: diastolic,
          unit: 'mmHg',
          timestamp: now.toISOString(),
          source: 'voice',
          quality: 'acceptable',
          confidence: 0.95,
        };

        const event: HealthEvent = {
          id: `evt_${id}`,
          userId,
          eventType: 'vital_recorded',
          sourceTable: 'chronic_vitals',
          sourceRecordId: id,
          eventValue: { systolic, diastolic, metric: 'blood_pressure', unit: 'mmHg' },
          eventContext: `Voice logged blood pressure: ${systolic}/${diastolic} mmHg`,
          eventAt: now,
          confidence: 0.95,
          priority: (systolic >= 180 || diastolic >= 120) ? 0 : 3,
          isAnomaly: false,
          baselineDelta: null,
          anomalyReason: null,
          processed: false,
        };

        return {
          success: true,
          metric: 'blood_pressure_systolic',
          sample,
          event,
          feedbackText: `Recorded Blood Pressure: ${systolic}/${diastolic} mmHg`,
          rawTranscript: transcript,
        };
      }
    }

    // 2. Heart Rate / Pulse: "heart rate 72", "pulse 80 bpm", "hr 65"
    const hrMatch = text.match(/(?:heart\s*rate|pulse|hr)\s*(?:is|was|at)?\s*(\d{2,3})(?:\s*bpm)?/i);
    if (hrMatch) {
      const bpm = parseInt(hrMatch[1], 10);
      if (bpm >= 35 && bpm <= 230) {
        const sample: NormalizedHealthSample = {
          id,
          userId,
          metric: 'heart_rate',
          value: bpm,
          unit: 'bpm',
          timestamp: now.toISOString(),
          source: 'voice',
          quality: 'acceptable',
          confidence: 0.95,
        };

        const event: HealthEvent = {
          id: `evt_${id}`,
          userId,
          eventType: 'vital_recorded',
          sourceTable: 'chronic_vitals',
          sourceRecordId: id,
          eventValue: { heartRate: bpm, metric: 'heart_rate', unit: 'bpm' },
          eventContext: `Voice logged heart rate: ${bpm} bpm`,
          eventAt: now,
          confidence: 0.95,
          priority: 3,
          isAnomaly: false,
          baselineDelta: null,
          anomalyReason: null,
          processed: false,
        };

        return {
          success: true,
          metric: 'heart_rate',
          sample,
          event,
          feedbackText: `Recorded Heart Rate: ${bpm} bpm`,
          rawTranscript: transcript,
        };
      }
    }

    // 3. Weight: "weight 79.5 kilos", "weigh 80 kg", "78.2 kgs"
    const weightMatch = text.match(/(?:weight|weigh|weighed)\s*(?:is|was|at)?\s*(\d{2,3}(?:\.\d+)?)\s*(kilos?|kg|pounds|lbs)?/i);
    if (weightMatch) {
      let weightVal = parseFloat(weightMatch[1]);
      const unit = weightMatch[2]?.toLowerCase() || 'kg';
      let normalizedKg = weightVal;
      if (unit.startsWith('pound') || unit === 'lbs') {
        normalizedKg = parseFloat((weightVal * 0.453592).toFixed(1));
      }

      const sample: NormalizedHealthSample = {
        id,
        userId,
        metric: 'body_weight_kg',
        value: normalizedKg,
        unit: 'kg',
        timestamp: now.toISOString(),
        source: 'voice',
        quality: 'acceptable',
        confidence: 0.95,
      };

      const event: HealthEvent = {
        id: `evt_${id}`,
        userId,
        eventType: 'vital_recorded',
        sourceTable: 'chronic_vitals',
        sourceRecordId: id,
        eventValue: { weight: normalizedKg, unit: 'kg' },
        eventContext: `Voice logged weight: ${normalizedKg} kg`,
        eventAt: now,
        confidence: 0.95,
        priority: 4,
        isAnomaly: false,
        baselineDelta: null,
        anomalyReason: null,
        processed: false,
      };

      return {
        success: true,
        metric: 'body_weight_kg',
        sample,
        event,
        feedbackText: `Recorded Weight: ${normalizedKg} kg`,
        rawTranscript: transcript,
      };
    }

    // 4. Blood Glucose: "blood sugar 98", "glucose 110", "sugar 95 mg/dl"
    const glucoseMatch = text.match(/(?:blood\s*sugar|glucose|sugar)\s*(?:is|was|at)?\s*(\d{2,3}(?:\.\d+)?)/i);
    if (glucoseMatch) {
      const glucose = parseFloat(glucoseMatch[1]);
      if (glucose >= 20 && glucose <= 600) {
        const sample: NormalizedHealthSample = {
          id,
          userId,
          metric: 'blood_glucose',
          value: glucose,
          unit: 'mg/dL',
          timestamp: now.toISOString(),
          source: 'voice',
          quality: 'acceptable',
          confidence: 0.95,
        };

        const event: HealthEvent = {
          id: `evt_${id}`,
          userId,
          eventType: 'vital_recorded',
          sourceTable: 'chronic_vitals',
          sourceRecordId: id,
          eventValue: { glucose, unit: 'mg/dL' },
          eventContext: `Voice logged blood glucose: ${glucose} mg/dL`,
          eventAt: now,
          confidence: 0.95,
          priority: (glucose < 54 || glucose > 350) ? 0 : 3,
          isAnomaly: false,
          baselineDelta: null,
          anomalyReason: null,
          processed: false,
        };

        return {
          success: true,
          metric: 'blood_glucose',
          sample,
          event,
          feedbackText: `Recorded Blood Glucose: ${glucose} mg/dL`,
          rawTranscript: transcript,
        };
      }
    }

    // 5. Activity / Steps: "I walked 8000 steps", "walked 10000 steps", "steps 6500"
    const stepsMatch = text.match(/(?:walked|ran|steps)\s*(?:about)?\s*(\d{1,6})\s*(?:steps)?/i);
    if (stepsMatch) {
      const steps = parseInt(stepsMatch[1], 10);
      if (steps > 0 && steps <= 100000) {
        const sample: NormalizedHealthSample = {
          id,
          userId,
          metric: 'steps',
          value: steps,
          unit: 'steps',
          timestamp: now.toISOString(),
          source: 'voice',
          quality: 'acceptable',
          confidence: 0.9,
        };

        const event: HealthEvent = {
          id: `evt_${id}`,
          userId,
          eventType: 'vital_recorded',
          sourceTable: 'chronic_vitals',
          sourceRecordId: id,
          eventValue: { steps, metric: 'steps' },
          eventContext: `Voice logged steps: ${steps.toLocaleString()}`,
          eventAt: now,
          confidence: 0.9,
          priority: 4,
          isAnomaly: false,
          baselineDelta: null,
          anomalyReason: null,
          processed: false,
        };

        return {
          success: true,
          metric: 'steps',
          sample,
          event,
          feedbackText: `Recorded Activity: ${steps.toLocaleString()} steps`,
          rawTranscript: transcript,
        };
      }
    }

    // 6. Sleep: "I slept 7 hours", "slept 8.5 hours", "sleep 6 hours"
    const sleepMatch = text.match(/(?:slept|sleep)\s*(?:for|about)?\s*(\d{1,2}(?:\.\d+)?)\s*hours?/i);
    if (sleepMatch) {
      const hours = parseFloat(sleepMatch[1]);
      if (hours >= 1 && hours <= 24) {
        const seconds = Math.round(hours * 3600);
        const sample: NormalizedHealthSample = {
          id,
          userId,
          metric: 'sleep_duration_seconds',
          value: seconds,
          unit: 'seconds',
          timestamp: now.toISOString(),
          source: 'voice',
          quality: 'acceptable',
          confidence: 0.9,
        };

        const event: HealthEvent = {
          id: `evt_${id}`,
          userId,
          eventType: 'vital_recorded',
          sourceTable: 'chronic_vitals',
          sourceRecordId: id,
          eventValue: { sleepHours: hours, durationSeconds: seconds },
          eventContext: `Voice logged sleep: ${hours} hours`,
          eventAt: now,
          confidence: 0.9,
          priority: 4,
          isAnomaly: false,
          baselineDelta: null,
          anomalyReason: null,
          processed: false,
        };

        return {
          success: true,
          metric: 'sleep_duration_seconds',
          sample,
          event,
          feedbackText: `Recorded Sleep: ${hours} hours`,
          rawTranscript: transcript,
        };
      }
    }

    // 7. Oxygen Saturation (SpO2): "oxygen 98%", "spo2 97 percent"
    const spo2Match = text.match(/(?:oxygen|spo2|o2)\s*(?:is|was|at)?\s*(\d{2,3})(?:\s*%|\s*percent)?/i);
    if (spo2Match) {
      const spo2 = parseInt(spo2Match[1], 10);
      if (spo2 >= 50 && spo2 <= 100) {
        const sample: NormalizedHealthSample = {
          id,
          userId,
          metric: 'oxygen_saturation',
          value: spo2,
          unit: '%',
          timestamp: now.toISOString(),
          source: 'voice',
          quality: 'acceptable',
          confidence: 0.95,
        };

        const event: HealthEvent = {
          id: `evt_${id}`,
          userId,
          eventType: 'vital_recorded',
          sourceTable: 'chronic_vitals',
          sourceRecordId: id,
          eventValue: { oxygen_saturation: spo2, unit: '%' },
          eventContext: `Voice logged oxygen saturation: ${spo2}%`,
          eventAt: now,
          confidence: 0.95,
          priority: spo2 < 90 ? 0 : 3,
          isAnomaly: false,
          baselineDelta: null,
          anomalyReason: null,
          processed: false,
        };

        return {
          success: true,
          metric: 'oxygen_saturation',
          sample,
          event,
          feedbackText: `Recorded Oxygen Saturation: ${spo2}%`,
          rawTranscript: transcript,
        };
      }
    }

    return {
      success: false,
      feedbackText: "Could not recognize a health metric. Try: 'BP 120 over 80', 'heart rate 72', 'weight 75 kilos', or 'slept 7 hours'.",
      rawTranscript: transcript,
    };
  }

  /**
   * Parse voice transcript and directly commit to LocalHealthStore
   */
  public static async commitParsedVoice(transcript: string, userId: string = 'user'): Promise<VoiceHealthParseResult> {
    const result = this.parse(transcript, userId);
    if (result.success && result.sample) {
      const baseline = localHealthStore.getBaseline();
      const evaluatedEvent = HealthEventEvaluator.createHealthEvent(result.sample, baseline);
      result.event = evaluatedEvent;

      localHealthStore.saveEvent(evaluatedEvent, {
        eventId: evaluatedEvent.id,
        source: 'voice',
        measurementMethod: 'manual_voice',
        quality: 'acceptable',
        confidence: result.sample.confidence,
        timestamp: new Date().toISOString(),
      });
      localHealthStore.saveVital(result.sample);

      if (evaluatedEvent.isAnomaly && evaluatedEvent.anomalyReason) {
        result.feedbackText += ` ⚠️ ${evaluatedEvent.anomalyReason}`;
      }
    }
    return result;
  }
}

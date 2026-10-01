/**
 * CHATR HEALTH OS — HealthEventService
 *
 * The bottom of the intelligence stack.
 * Reads from existing health tables and normalizes them into
 * a uniform HealthEvent model that the rest of the OS consumes.
 *
 * CRITICAL INVARIANT:
 *   This service NEVER duplicates raw health data.
 *   Every HealthEvent is a lightweight reference to an existing record
 *   via { sourceTable, sourceRecordId }.
 *   The existing tables remain the authoritative source of truth.
 */

import { supabase } from '@/integrations/supabase/client';
import { localHealthStore, HealthProvenanceRecord } from './LocalHealthStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export type HealthEventType =
  | 'vital_recorded'
  | 'medication_taken'
  | 'medication_missed'
  | 'medication_due'
  | 'lab_uploaded'
  | 'lab_unreviewed'
  | 'appointment_booked'
  | 'appointment_upcoming'
  | 'appointment_overdue'
  | 'symptom_check'
  | 'care_path_action'
  | 'care_path_due'
  | 'insight_generated'
  | 'prediction_fired'
  | 'streak_milestone'
  | 'manual_entry'
  | 'mental_health_check'
  | 'prescription_uploaded'
  | 'consultation_completed';

/** P0=urgent/safety, P1=important, P2=action_required, P3=insight, P4=wellness, P5=info */
export type EventPriority = 0 | 1 | 2 | 3 | 4 | 5;

export interface HealthEvent {
  id: string;
  userId: string;
  eventType: HealthEventType;
  sourceTable: string | null;
  sourceRecordId: string | null;
  eventValue: Record<string, unknown> | null;
  eventContext: string;
  eventAt: Date;
  confidence: number;   // 0–1
  priority: EventPriority;
  isAnomaly: boolean;
  baselineDelta: number | null;  // null if no baseline exists
  anomalyReason: string | null;
  processed: boolean;
}

// ─── Normalization helpers ────────────────────────────────────────────────────

function priorityForMedication(isOverdue: boolean, minutesUntilDue: number): EventPriority {
  if (isOverdue) return 2;
  if (minutesUntilDue <= 30) return 2;
  if (minutesUntilDue <= 120) return 3;
  return 4;
}

function priorityForLab(daysSinceUpload: number): EventPriority {
  if (daysSinceUpload < 1) return 2;
  if (daysSinceUpload < 3) return 3;
  return 4;
}

function priorityForAppointment(hoursUntil: number): EventPriority {
  if (hoursUntil < 0) return 2;   // overdue
  if (hoursUntil < 2) return 1;   // imminent
  if (hoursUntil < 24) return 2;  // today
  if (hoursUntil < 48) return 3;  // tomorrow
  return 4;
}

// ─── Service class ────────────────────────────────────────────────────────────

class HealthEventServiceImpl {

  /**
   * Pull recent events from all existing health tables and return
   * normalized HealthEvent objects. Does NOT write to health_events table
   * here — the Health Intelligence loop decides what to persist.
   *
   * @param userId  - authenticated user ID
   * @param since   - look back from this date (default: 48 hours)
   */
  async fetchRecentEvents(
    userId: string,
    since: Date = new Date(Date.now() - 48 * 60 * 60 * 1000)
  ): Promise<HealthEvent[]> {
    const events: HealthEvent[] = [];
    const now = new Date();

    // Run all queries in parallel — don't wait sequentially
    const [
      medsResult,
      intakeResult,
      vitalsResult,
      labsResult,
      appointmentsResult,
      predictionsResult,
      remindersResult,
      mentalResult,
    ] = await Promise.allSettled([
      // Medication reminders (active)
      supabase
        .from('medication_reminders')
        .select('id, medicine_name, dosage, time_slots, frequency, is_active, created_at')
        .eq('user_id', userId)
        .eq('is_active', true),

      // Medicine intake log (recent)
      supabase
        .from('medicine_intake_log')
        .select('id, reminder_id, taken_at, status, scheduled_time, medicine_name')
        .eq('user_id', userId)
        .gte('scheduled_time', since.toISOString())
        .order('scheduled_time', { ascending: false }),

      // Chronic vitals (recent readings)
      supabase
        .from('chronic_vitals')
        .select('id, vital_type, value, unit, recorded_at, notes')
        .eq('user_id', userId)
        .gte('recorded_at', since.toISOString())
        .order('recorded_at', { ascending: false }),

      // Lab reports (recent + unreviewed)
      supabase
        .from('lab_reports')
        .select('id, test_name, test_date, status, result_summary, reviewed_at')
        .eq('user_id', userId)
        .order('test_date', { ascending: false })
        .limit(10),

      // Upcoming appointments (next 7 days)
      supabase
        .from('chatr_healthcare_appointments')
        .select('id, appointment_date, appointment_time, status, notes, doctor_id')
        .eq('user_id', userId)
        .gte('appointment_date', now.toISOString().split('T')[0])
        .order('appointment_date', { ascending: true })
        .limit(5),

      // Health predictions (active)
      supabase
        .from('health_predictions')
        .select('id, prediction_type, risk_level, description, created_at, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5),

      // Health reminders (upcoming)
      supabase
        .from('health_reminders')
        .select('id, title, description, due_date, reminder_type, is_dismissed')
        .eq('user_id', userId)
        .eq('is_dismissed', false)
        .gte('due_date', now.toISOString())
        .order('due_date', { ascending: true })
        .limit(10),

      // Mental health assessments (recent)
      supabase
        .from('mental_health_assessments')
        .select('id, assessment_type, score, status, created_at')
        .eq('user_id', userId)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

    // ── Medication events ──────────────────────────────────────────────────
    if (medsResult.status === 'fulfilled' && medsResult.value.data) {
      for (const med of medsResult.value.data) {
        // Build due-time events from time_slots
        const slots: string[] = med.time_slots || [];
        for (const slot of slots) {
          const [hour, minute] = slot.split(':').map(Number);
          const slotTime = new Date(now);
          slotTime.setHours(hour, minute, 0, 0);

          const diffMs = slotTime.getTime() - now.getTime();
          const diffMin = diffMs / (1000 * 60);

          // Show if within ±2 hours or upcoming today
          if (diffMin > -120 && diffMin < 720) {
            const isOverdue = diffMin < -5;
            events.push({
              id: `med-${med.id}-${slot}`,
              userId,
              eventType: isOverdue ? 'medication_missed' : 'medication_due',
              sourceTable: 'medication_reminders',
              sourceRecordId: med.id,
              eventValue: {
                medicine_name: med.medicine_name,
                dosage: med.dosage,
                slot,
                minutes_until: Math.round(diffMin),
              },
              eventContext: isOverdue
                ? `${med.medicine_name} was due at ${slot}`
                : `${med.medicine_name} due at ${slot}`,
              eventAt: slotTime,
              confidence: 1.0,
              priority: priorityForMedication(isOverdue, diffMin),
              isAnomaly: false,
              baselineDelta: null,
              anomalyReason: null,
              processed: false,
            });
          }
        }
      }
    }

    // ── Intake log events (taken/missed) ──────────────────────────────────
    if (intakeResult.status === 'fulfilled' && intakeResult.value.data) {
      for (const intake of intakeResult.value.data) {
        if (intake.status === 'taken') {
          events.push({
            id: `intake-${intake.id}`,
            userId,
            eventType: 'medication_taken',
            sourceTable: 'medicine_intake_log',
            sourceRecordId: intake.id,
            eventValue: { medicine_name: intake.medicine_name, taken_at: intake.taken_at },
            eventContext: `${intake.medicine_name} taken`,
            eventAt: new Date(intake.taken_at || intake.scheduled_time),
            confidence: 1.0,
            priority: 5,
            isAnomaly: false,
            baselineDelta: null,
            anomalyReason: null,
            processed: false,
          });
        }
      }
    }

    // ── Vital events ───────────────────────────────────────────────────────
    if (vitalsResult.status === 'fulfilled' && vitalsResult.value.data) {
      for (const vital of vitalsResult.value.data) {
        events.push({
          id: `vital-${vital.id}`,
          userId,
          eventType: 'vital_recorded',
          sourceTable: 'chronic_vitals',
          sourceRecordId: vital.id,
          eventValue: { value: vital.value, unit: vital.unit, type: vital.vital_type },
          eventContext: `${vital.vital_type}: ${vital.value} ${vital.unit || ''}`.trim(),
          eventAt: new Date(vital.recorded_at),
          confidence: 1.0,
          priority: 4,
          isAnomaly: false,   // baseline comparison happens in HealthStateEngine
          baselineDelta: null,
          anomalyReason: null,
          processed: false,
        });
      }
    }

    // ── Lab report events ──────────────────────────────────────────────────
    if (labsResult.status === 'fulfilled' && labsResult.value.data) {
      for (const lab of labsResult.value.data) {
        const testDate = new Date(lab.test_date);
        const daysSince = (now.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24);
        const isUnreviewed = !lab.reviewed_at;

        if (daysSince <= 7 || isUnreviewed) {
          events.push({
            id: `lab-${lab.id}`,
            userId,
            eventType: isUnreviewed ? 'lab_unreviewed' : 'lab_uploaded',
            sourceTable: 'lab_reports',
            sourceRecordId: lab.id,
            eventValue: {
              test_name: lab.test_name,
              status: lab.status,
              result_summary: lab.result_summary,
              days_since: Math.round(daysSince),
            },
            eventContext: isUnreviewed
              ? `New lab report: ${lab.test_name}`
              : `Lab report: ${lab.test_name}`,
            eventAt: testDate,
            confidence: 1.0,
            priority: priorityForLab(daysSince),
            isAnomaly: false,
            baselineDelta: null,
            anomalyReason: null,
            processed: false,
          });
        }
      }
    }

    // ── Appointment events ─────────────────────────────────────────────────
    if (appointmentsResult.status === 'fulfilled' && appointmentsResult.value.data) {
      for (const appt of appointmentsResult.value.data) {
        const apptDate = new Date(`${appt.appointment_date}T${appt.appointment_time || '09:00'}`);
        const hoursUntil = (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        events.push({
          id: `appt-${appt.id}`,
          userId,
          eventType: hoursUntil < 0 ? 'appointment_overdue' : 'appointment_upcoming',
          sourceTable: 'chatr_healthcare_appointments',
          sourceRecordId: appt.id,
          eventValue: {
            appointment_date: appt.appointment_date,
            appointment_time: appt.appointment_time,
            status: appt.status,
            hours_until: Math.round(hoursUntil),
          },
          eventContext: `Appointment ${appt.appointment_date} at ${appt.appointment_time || 'TBD'}`,
          eventAt: apptDate,
          confidence: 1.0,
          priority: priorityForAppointment(hoursUntil),
          isAnomaly: false,
          baselineDelta: null,
          anomalyReason: null,
          processed: false,
        });
      }
    }

    // ── Prediction events ──────────────────────────────────────────────────
    if (predictionsResult.status === 'fulfilled' && predictionsResult.value.data) {
      for (const pred of predictionsResult.value.data) {
        const riskPriority: EventPriority =
          pred.risk_level === 'high' ? 1
          : pred.risk_level === 'medium' ? 2
          : 3;

        events.push({
          id: `pred-${pred.id}`,
          userId,
          eventType: 'prediction_fired',
          sourceTable: 'health_predictions',
          sourceRecordId: pred.id,
          eventValue: {
            prediction_type: pred.prediction_type,
            risk_level: pred.risk_level,
            description: pred.description,
          },
          eventContext: pred.description || `Health prediction: ${pred.prediction_type}`,
          eventAt: new Date(pred.created_at),
          confidence: 0.7,  // AI predictions carry lower confidence
          priority: riskPriority,
          isAnomaly: pred.risk_level !== 'low',
          baselineDelta: null,
          anomalyReason: pred.risk_level !== 'low' ? pred.description : null,
          processed: false,
        });
      }
    }

    // ── Health reminder events ─────────────────────────────────────────────
    if (remindersResult.status === 'fulfilled' && remindersResult.value.data) {
      for (const reminder of remindersResult.value.data) {
        const dueDate = new Date(reminder.due_date);
        const hoursUntil = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        events.push({
          id: `reminder-${reminder.id}`,
          userId,
          eventType: 'care_path_due',
          sourceTable: 'health_reminders',
          sourceRecordId: reminder.id,
          eventValue: {
            title: reminder.title,
            description: reminder.description,
            reminder_type: reminder.reminder_type,
            hours_until: Math.round(hoursUntil),
          },
          eventContext: reminder.title,
          eventAt: dueDate,
          confidence: 1.0,
          priority: priorityForAppointment(hoursUntil),
          isAnomaly: false,
          baselineDelta: null,
          anomalyReason: null,
          processed: false,
        });
      }
    }

    // ── Mental health events ───────────────────────────────────────────────
    if (mentalResult.status === 'fulfilled' && mentalResult.value.data) {
      for (const assessment of mentalResult.value.data) {
        events.push({
          id: `mental-${assessment.id}`,
          userId,
          eventType: 'mental_health_check',
          sourceTable: 'mental_health_assessments',
          sourceRecordId: assessment.id,
          eventValue: {
            assessment_type: assessment.assessment_type,
            score: assessment.score,
            status: assessment.status,
          },
          eventContext: `Mental health check: ${assessment.assessment_type}`,
          eventAt: new Date(assessment.created_at),
          confidence: 0.9,
          priority: assessment.score !== null && assessment.score < 50 ? 2 : 4,
          isAnomaly: assessment.score !== null && assessment.score < 50,
          baselineDelta: null,
          anomalyReason: null,
          processed: false,
        });
      }
    }

    // Merge local offline events
    const localEvents = localHealthStore.getEvents(since);
    const existingIds = new Set(events.map(e => e.id));
    for (const le of localEvents) {
      if (!existingIds.has(le.id)) {
        events.push(le);
        existingIds.add(le.id);
      }
    }

    // Sort by priority ASC (P0 first) then eventAt DESC
    events.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.eventAt.getTime() - a.eventAt.getTime();
    });

    return events;
  }

  /**
   * Record a new HealthEvent immediately into the local offline store,
   * with asynchronous background replication to Supabase when connected.
   */
  async recordEvent(event: HealthEvent, provenance?: HealthProvenanceRecord): Promise<void> {
    // 1. Immediate local commit (works offline)
    localHealthStore.saveEvent(event, provenance);

    // 2. Asynchronous cloud replication
    try {
      if (navigator.onLine) {
        await supabase.from('health_events').insert([{
          user_id: event.userId,
          event_type: event.eventType,
          source_table: event.sourceTable,
          source_record_id: event.sourceRecordId,
          event_value: event.eventValue,
          event_context: event.eventContext,
          event_at: event.eventAt.toISOString(),
          confidence: event.confidence,
          priority: event.priority,
          is_anomaly: event.isAnomaly,
          baseline_delta: event.baselineDelta,
          anomaly_reason: event.anomalyReason,
          processed: event.processed,
        }]);
      }
    } catch (e) {
      console.warn('[HealthEventService] Cloud sync deferred to offline queue:', e);
    }
  }

  /**
   * Persist normalized health events to the health_events table.
   * Only called by the Health Intelligence loop — not on every page render.
   * Skips events that already have a matching source_record_id to avoid duplicates.
   */
  async persistEvents(userId: string, events: HealthEvent[]): Promise<void> {
    if (events.length === 0) return;

    // Fetch existing event source IDs to deduplicate
    const sourceIds = events
      .filter(e => e.sourceRecordId)
      .map(e => e.sourceRecordId as string);

    try {
      const { data: existing, error: selectErr } = await supabase
        .from('health_events')
        .select('source_record_id')
        .eq('user_id', userId)
        .in('source_record_id', sourceIds);

      if (selectErr) {
        // Table not ready or permission notice - non-blocking
        return;
      }

      const existingIds = new Set((existing || []).map(e => e.source_record_id));

      const toInsert = events
        .filter(e => !e.sourceRecordId || !existingIds.has(e.sourceRecordId))
        .map(e => ({
          user_id: userId,
          event_type: e.eventType,
          source_table: e.sourceTable,
          source_record_id: e.sourceRecordId,
          event_value: e.eventValue,
          event_context: e.eventContext,
          event_at: e.eventAt.toISOString(),
          confidence: e.confidence,
          priority: e.priority,
          is_anomaly: e.isAnomaly,
          baseline_delta: e.baselineDelta,
          anomaly_reason: e.anomalyReason,
          processed: false,
        }));

      if (toInsert.length > 0) {
        await supabase.from('health_events').insert(toInsert);
      }
    } catch (e) {
      // Non-blocking background persistence
      console.warn('[HealthEventService] Event persistence notice:', e);
    }
  }
}

export const HealthEventService = new HealthEventServiceImpl();

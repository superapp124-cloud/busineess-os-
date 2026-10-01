/**
 * CHATR HEALTH OS — HealthMemoryService
 *
 * Provides longitudinal health memory by querying the user's
 * EXISTING health data records. This is the "LEARN" step.
 *
 * INVARIANT: Queries only EXISTING authorized health tables.
 * No fake memory. No duplicate storage.
 * Enables questions like:
 *  - "What changed in my health this month?"
 *  - "When was my last lab?"
 *  - "How has my BP changed?"
 *  - "What happened after my last doctor appointment?"
 */

import { supabase } from '@/integrations/supabase/client';
import { localHealthStore } from './LocalHealthStore';
import { CrossDomainObservation } from './core/HealthOSContract';
export type { CrossDomainObservation };

export interface HealthMemoryEntry {
  id: string;
  type: 'vital' | 'medication' | 'lab' | 'appointment' | 'consultation' | 'symptom' | 'mental' | 'milestone';
  title: string;
  summary: string;
  occurredAt: Date;
  sourceTable: string;
  sourceId: string;
  metadata: Record<string, unknown>;
}

export interface HealthTimeline {
  entries: HealthMemoryEntry[];
  totalCount: number;
  periodStart: Date;
  periodEnd: Date;
}

class HealthMemoryServiceImpl {

  /**
   * Build a chronological timeline of health events for the given period.
   * Queries existing tables — no duplication.
   */
  async getTimeline(
    userId: string,
    periodDays = 30
  ): Promise<HealthTimeline> {
    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    const entries: HealthMemoryEntry[] = [];

    const [vitals, labs, appts, teleconsults, symptoms, mentalChecks, intake] =
      await Promise.allSettled([

        supabase
          .from('chronic_vitals')
          .select('id, vital_type, value, unit, recorded_at')
          .eq('user_id', userId)
          .gte('recorded_at', since.toISOString())
          .order('recorded_at', { ascending: false })
          .limit(20),

        supabase
          .from('lab_reports')
          .select('id, test_name, test_date, status, result_summary')
          .eq('user_id', userId)
          .gte('test_date', since.toISOString().split('T')[0])
          .order('test_date', { ascending: false })
          .limit(10),

        supabase
          .from('chatr_healthcare_appointments')
          .select('id, appointment_date, appointment_time, status, notes')
          .eq('user_id', userId)
          .gte('appointment_date', since.toISOString().split('T')[0])
          .order('appointment_date', { ascending: false })
          .limit(10),

        supabase
          .from('teleconsultation_bookings')
          .select('id, created_at, status, notes')
          .eq('user_id', userId)
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: false })
          .limit(5),

        supabase
          .from('symptom_checks')
          .select('id, symptoms, severity, created_at')
          .eq('user_id', userId)
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: false })
          .limit(10),

        supabase
          .from('mental_health_assessments')
          .select('id, assessment_type, score, status, created_at')
          .eq('user_id', userId)
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: false })
          .limit(5),

        supabase
          .from('medicine_intake_log')
          .select('id, medicine_name, status, taken_at, scheduled_time')
          .eq('user_id', userId)
          .gte('scheduled_time', since.toISOString())
          .eq('status', 'taken')
          .order('scheduled_time', { ascending: false })
          .limit(30),
      ]);

    // ── Vitals ─────────────────────────────────────────────────────────────
    if (vitals.status === 'fulfilled' && vitals.value.data) {
      for (const v of vitals.value.data) {
        entries.push({
          id: `vital-${v.id}`,
          type: 'vital',
          title: `${v.vital_type.replace(/_/g, ' ')} recorded`,
          summary: `${v.value} ${v.unit || ''}`.trim(),
          occurredAt: new Date(v.recorded_at),
          sourceTable: 'chronic_vitals',
          sourceId: v.id,
          metadata: { vital_type: v.vital_type, value: v.value, unit: v.unit },
        });
      }
    }

    // ── Labs ───────────────────────────────────────────────────────────────
    if (labs.status === 'fulfilled' && labs.value.data) {
      for (const l of labs.value.data) {
        entries.push({
          id: `lab-${l.id}`,
          type: 'lab',
          title: `${l.test_name} lab report`,
          summary: l.result_summary || l.status || 'Lab result available',
          occurredAt: new Date(l.test_date),
          sourceTable: 'lab_reports',
          sourceId: l.id,
          metadata: { test_name: l.test_name, status: l.status },
        });
      }
    }

    // ── Appointments ───────────────────────────────────────────────────────
    if (appts.status === 'fulfilled' && appts.value.data) {
      for (const a of appts.value.data) {
        entries.push({
          id: `appt-${a.id}`,
          type: 'appointment',
          title: `Doctor appointment`,
          summary: a.status || 'Appointment scheduled',
          occurredAt: new Date(`${a.appointment_date}T${a.appointment_time || '09:00'}`),
          sourceTable: 'chatr_healthcare_appointments',
          sourceId: a.id,
          metadata: { date: a.appointment_date, status: a.status },
        });
      }
    }

    // ── Teleconsults ───────────────────────────────────────────────────────
    if (teleconsults.status === 'fulfilled' && teleconsults.value.data) {
      for (const t of teleconsults.value.data) {
        entries.push({
          id: `consult-${t.id}`,
          type: 'consultation',
          title: 'Teleconsultation',
          summary: t.status || 'Consultation completed',
          occurredAt: new Date(t.created_at),
          sourceTable: 'teleconsultation_bookings',
          sourceId: t.id,
          metadata: { status: t.status },
        });
      }
    }

    // ── Symptoms ───────────────────────────────────────────────────────────
    if (symptoms.status === 'fulfilled' && symptoms.value.data) {
      for (const s of symptoms.value.data) {
        const symptomList = Array.isArray(s.symptoms)
          ? s.symptoms.join(', ')
          : String(s.symptoms || 'Symptom check');
        entries.push({
          id: `symptom-${s.id}`,
          type: 'symptom',
          title: 'Symptom check',
          summary: symptomList,
          occurredAt: new Date(s.created_at),
          sourceTable: 'symptom_checks',
          sourceId: s.id,
          metadata: { symptoms: s.symptoms, severity: s.severity },
        });
      }
    }

    // ── Mental health ──────────────────────────────────────────────────────
    if (mentalChecks.status === 'fulfilled' && mentalChecks.value.data) {
      for (const m of mentalChecks.value.data) {
        entries.push({
          id: `mental-${m.id}`,
          type: 'mental',
          title: `Mental health check`,
          summary: m.score !== null ? `Score: ${m.score}/100` : m.status || 'Check completed',
          occurredAt: new Date(m.created_at),
          sourceTable: 'mental_health_assessments',
          sourceId: m.id,
          metadata: { assessment_type: m.assessment_type, score: m.score },
        });
      }
    }

    // ── Medication milestones ──────────────────────────────────────────────
    if (intake.status === 'fulfilled' && intake.value.data) {
      const medicineGroups: Record<string, number> = {};
      for (const i of intake.value.data) {
        const name = i.medicine_name || 'Medicine';
        medicineGroups[name] = (medicineGroups[name] || 0) + 1;
      }
      for (const [name, count] of Object.entries(medicineGroups)) {
        entries.push({
          id: `milestone-${name}`,
          type: 'milestone',
          title: `${name} taken ${count} time${count > 1 ? 's' : ''}`,
          summary: `${count} dose${count > 1 ? 's' : ''} recorded this period`,
          occurredAt: since,
          sourceTable: 'medicine_intake_log',
          sourceId: name,
          metadata: { medicine_name: name, count },
        });
      }
    }

    // ── Offline local events from LocalHealthStore ───────────────────────
    const localEvents = localHealthStore.getEvents(since);
    const existingEntryIds = new Set(entries.map(e => e.sourceId));

    for (const le of localEvents) {
      if (existingEntryIds.has(le.id) || (le.sourceRecordId && existingEntryIds.has(le.sourceRecordId))) {
        continue;
      }
      entries.push({
        id: `local-${le.id}`,
        type: le.eventType.startsWith('medication') ? 'medication'
          : le.eventType.startsWith('lab') ? 'lab'
          : le.eventType.startsWith('appointment') ? 'appointment'
          : 'vital',
        title: le.isAnomaly ? `⚠️ ${le.eventContext}` : le.eventContext,
        summary: le.anomalyReason || (le.eventValue ? Object.entries(le.eventValue).map(([k, v]) => `${k}: ${v}`).join(', ') : 'Observation recorded'),
        occurredAt: le.eventAt,
        sourceTable: le.sourceTable || 'local_health_store',
        sourceId: le.id,
        metadata: {
          isAnomaly: le.isAnomaly,
          priority: le.priority,
          baselineDelta: le.baselineDelta,
          eventValue: le.eventValue,
        },
      });
      existingEntryIds.add(le.id);
    }

    // Sort by date descending
    entries.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    return {
      entries,
      totalCount: entries.length,
      periodStart: since,
      periodEnd: new Date(),
    };
  }

  /**
   * Answer "What changed in my health this period?"
   * Returns a structured summary of notable changes.
   */
  async getChangeSummary(userId: string, periodDays = 30): Promise<{
    changes: string[];
    highlights: string[];
    noChanges: boolean;
  }> {
    const timeline = await this.getTimeline(userId, periodDays);

    if (timeline.entries.length === 0) {
      return { changes: [], highlights: [], noChanges: true };
    }

    const changes: string[] = [];
    const highlights: string[] = [];

    const labCount = timeline.entries.filter(e => e.type === 'lab').length;
    const apptCount = timeline.entries.filter(e => e.type === 'appointment').length;
    const vitalCount = timeline.entries.filter(e => e.type === 'vital').length;
    const consultCount = timeline.entries.filter(e => e.type === 'consultation').length;
    const milestones = timeline.entries.filter(e => e.type === 'milestone');
    const anomalies = timeline.entries.filter(e => (e.metadata as any)?.isAnomaly);

    if (anomalies.length > 0) {
      highlights.push(`⚠️ ${anomalies.length} reading${anomalies.length > 1 ? 's' : ''} outside your normal baseline`);
    }
    if (labCount > 0) changes.push(`${labCount} lab report${labCount > 1 ? 's' : ''} in the last ${periodDays} days`);
    if (apptCount > 0) changes.push(`${apptCount} doctor appointment${apptCount > 1 ? 's' : ''}`);
    if (vitalCount > 0) changes.push(`${vitalCount} vital reading${vitalCount > 1 ? 's' : ''} recorded`);
    if (consultCount > 0) highlights.push(`${consultCount} teleconsultation${consultCount > 1 ? 's' : ''} completed`);
    if (milestones.length > 0) {
      const totalDoses = milestones.reduce((acc, m) => acc + (m.metadata.count as number || 0), 0);
      highlights.push(`${totalDoses} medication dose${totalDoses > 1 ? 's' : ''} tracked`);
    }

    return { changes, highlights, noChanges: changes.length === 0 && highlights.length === 0 };
  }

  /**
   * Cross-Domain Multidimensional Reasoning
   * Strictly separates factual observation from baseline deviation,
   * potential correlation, and clinical alerts.
   * NEVER turns correlation into diagnosis.
   */
  async getCrossDomainObservations(userId: string): Promise<CrossDomainObservation[]> {
    const observations: CrossDomainObservation[] = [];
    const baseline = localHealthStore.getBaseline();
    const vitals = localHealthStore.getVitals();

    const recentSteps = vitals.find(v => v.metric === 'steps');
    const recentSleep = vitals.find(v => v.metric === 'sleep_duration_seconds');
    const recentBP = vitals.find(v => v.metric === 'blood_pressure_systolic');

    // 1. Cross-domain: Sleep vs Activity
    if (recentSteps && recentSleep && baseline) {
      const stepVal = recentSteps.value;
      const sleepHours = recentSleep.value < 24 ? recentSleep.value : Number((recentSleep.value / 3600).toFixed(1));
      const stepBase = baseline.step_count?.average;
      const sleepBase = baseline.sleep_duration?.average;

      if (stepBase && sleepBase) {
        const stepDelta = stepVal - stepBase;
        const sleepDelta = sleepHours - sleepBase;

        if (stepDelta > 1500 && sleepDelta < -1.0) {
          observations.push({
            id: 'obs_activity_sleep_divergence',
            observed: `Your activity was ${stepVal.toLocaleString()} steps, while sleep was ${sleepHours} hours.`,
            comparedWithBaseline: `Activity was higher than your recent pattern (${Math.round(stepBase).toLocaleString()} steps), while sleep was lower than your recent baseline (${sleepBase.toFixed(1)} hrs).`,
            possibleRelationship: 'Elevated daytime physical exertion paired with a shorter recovery window.',
            clinicallySignificant: false,
            actionRecommendation: 'Prioritize earlier wind-down to support cardiovascular recovery.',
          });
        }
      }
    }

    // 2. Cross-domain: Blood Pressure check
    if (recentBP && baseline?.blood_pressure_systolic) {
      const bpVal = recentBP.value;
      const bpDia = recentBP.secondaryValue;
      const bpBaseSys = baseline.blood_pressure_systolic.average;

      if (bpVal >= 180 || (bpDia && bpDia >= 120)) {
        observations.push({
          id: 'obs_bp_hypertensive_alert',
          observed: `Blood pressure recorded at ${bpVal}${bpDia ? `/${bpDia}` : ''} mmHg.`,
          comparedWithBaseline: `Critically elevated above your personal baseline average of ${Math.round(bpBaseSys)} mmHg.`,
          possibleRelationship: 'Acute cardiovascular strain or situational reading error.',
          clinicallySignificant: true,
          actionRecommendation: 'Rest quietly for 5 minutes and retake measurement to confirm. If symptomatic, seek immediate emergency care.',
        });
      }
    }

    return observations;
  }
}

export const HealthMemoryService = new HealthMemoryServiceImpl();

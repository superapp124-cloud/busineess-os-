/**
 * CHATR HEALTH OS — HealthStateEngine
 *
 * Computes the user's overall Health State and per-domain states
 * from the normalized HealthEvent stream + PersonalBaseline.
 *
 * This is the "UNDERSTAND" step of: SENSE → UNDERSTAND → NOTIFY → ACT → VERIFY → LEARN
 *
 * Rules:
 *  - Health State is computed from REAL data only.
 *  - 'unknown' when insufficient data exists.
 *  - Never manufactures a score.
 *  - Every state is explainable (observation + supporting data + confidence).
 *  - P0 events (safety) always override state to 'needs_attention'.
 */

import { HealthEvent } from './HealthEventService';
import { PersonalBaseline, PersonalBaselineEngine, BaselineRange } from './PersonalBaselineEngine';
import { localHealthStore } from './LocalHealthStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export type HealthStateValue = 'stable' | 'improving' | 'needs_attention' | 'unknown';

export interface VitalSubstate {
  metric: string;
  label: string;
  state: HealthStateValue;
  observation: string;
  latestReading?: string;
  isAnomaly: boolean;
  priority: number;
}

export interface DomainState {
  state: HealthStateValue;
  label: string;
  confidence: number;       // 0–1
  observation: string;      // "Your BP is within your normal range"
  supportingData: string[]; // ["3 readings this week", "Average 118/76"]
  timePeriod: string;       // "Last 7 days"
  hasData: boolean;
  substates?: Record<string, VitalSubstate>;
}

export interface ComputedHealthState {
  state: HealthStateValue;
  label: string;
  score: number | null;       // null = insufficient data, NEVER fake
  confidence: number;         // 0–1
  domainStates: Record<string, DomainState>;
  vitalSubstates?: Record<string, VitalSubstate>;
  activeSafetyFlags: string[];
  computedAt: Date;
  eventsAnalyzed: number;
}

// Domain keys
export type HealthDomain =
  | 'medications'
  | 'vitals'
  | 'labs'
  | 'appointments'
  | 'mental'
  | 'activity'
  | 'sleep';

// ─── Label maps ───────────────────────────────────────────────────────────────

const STATE_LABELS: Record<HealthStateValue, string> = {
  stable: 'Stable',
  improving: 'Improving',
  needs_attention: 'Needs Attention',
  unknown: 'Not Enough Data',
};

// ─── Engine class ─────────────────────────────────────────────────────────────

class HealthStateEngineImpl {

  /**
   * Compute the full health state from events + baseline.
   * This is the primary entry point called by useHealthOS().
   */
  compute(
    events: HealthEvent[],
    baseline: PersonalBaseline | null,
    vitalHistory: Array<{ vital_type: string; value: number; recorded_at: string }>
  ): ComputedHealthState {
    const now = new Date();
    const safetyFlags: string[] = [];

    // ── P0 events override everything ──────────────────────────────────────
    const p0Events = events.filter(e => e.priority === 0);
    if (p0Events.length > 0) {
      safetyFlags.push(...p0Events.map(e => e.eventContext));
    }

    // ── Per-domain computation ─────────────────────────────────────────────
    const domainStates: Record<string, DomainState> = {};

    domainStates.medications = this.computeMedicationDomain(events);
    const vitalsResult = this.computeVitalsDomain(events, vitalHistory, baseline);
    domainStates.vitals = vitalsResult.domainState;
    domainStates.labs = this.computeLabsDomain(events);
    domainStates.appointments = this.computeAppointmentsDomain(events);
    domainStates.mental = this.computeMentalDomain(events);
    domainStates.activity = this.computeActivityDomain(events, baseline);
    domainStates.sleep = this.computeSleepDomain(events, baseline);

    // ── Overall state ──────────────────────────────────────────────────────
    const domainValues = Object.values(domainStates);
    const domainsWithData = domainValues.filter(d => d.hasData);

    // No data at all → unknown
    if (domainsWithData.length === 0 || (events.length === 0 && !baseline?.established)) {
      return {
        state: 'unknown',
        label: STATE_LABELS.unknown,
        score: null,
        confidence: 0,
        domainStates,
        vitalSubstates: vitalsResult.substates,
        activeSafetyFlags: safetyFlags,
        computedAt: now,
        eventsAnalyzed: events.length,
      };
    }

    // Safety override
    if (p0Events.length > 0 || safetyFlags.length > 0) {
      return {
        state: 'needs_attention',
        label: STATE_LABELS.needs_attention,
        score: this.computeScore(domainsWithData),
        confidence: 0.9,
        domainStates,
        vitalSubstates: vitalsResult.substates,
        activeSafetyFlags: safetyFlags,
        computedAt: now,
        eventsAnalyzed: events.length,
      };
    }

    // Count states across domains with data
    const needsAttention = domainsWithData.filter(d => d.state === 'needs_attention').length;
    const improving = domainsWithData.filter(d => d.state === 'improving').length;
    const stable = domainsWithData.filter(d => d.state === 'stable').length;

    let state: HealthStateValue;
    let confidence: number;

    if (needsAttention > 0) {
      state = 'needs_attention';
      confidence = Math.min(0.9, 0.5 + needsAttention * 0.15);
    } else if (improving > stable) {
      state = 'improving';
      confidence = Math.min(0.85, 0.5 + improving * 0.1);
    } else if (stable > 0) {
      state = 'stable';
      confidence = Math.min(0.9, 0.5 + stable * 0.1);
    } else {
      state = 'unknown';
      confidence = 0;
    }

    // Dampen confidence if only 1 domain has data
    if (domainsWithData.length === 1) confidence *= 0.7;

    return {
      state,
      label: STATE_LABELS[state],
      score: this.computeScore(domainsWithData),
      confidence,
      domainStates,
      vitalSubstates: vitalsResult.substates,
      activeSafetyFlags: safetyFlags,
      computedAt: now,
      eventsAnalyzed: events.length,
    };
  }

  // ── Domain: Medications ──────────────────────────────────────────────────

  private computeMedicationDomain(events: HealthEvent[]): DomainState {
    const medEvents = events.filter(e =>
      e.eventType === 'medication_taken' ||
      e.eventType === 'medication_missed' ||
      e.eventType === 'medication_due'
    );

    if (medEvents.length === 0) {
      return this.noDataState('No medication data available');
    }

    const missed = medEvents.filter(e => e.eventType === 'medication_missed').length;
    const taken = medEvents.filter(e => e.eventType === 'medication_taken').length;
    const total = missed + taken;
    const adherence = total > 0 ? taken / total : 1;

    const dueSoon = medEvents.filter(e =>
      e.eventType === 'medication_due' &&
      e.eventValue?.['minutes_until'] !== undefined &&
      Number(e.eventValue['minutes_until']) > 0 &&
      Number(e.eventValue['minutes_until']) <= 60
    ).length;

    let state: HealthStateValue;
    let observation: string;
    const supportingData: string[] = [];

    if (missed > 0 && adherence < 0.8) {
      state = 'needs_attention';
      observation = 'Some medications were missed recently';
      supportingData.push(`${missed} missed dose${missed > 1 ? 's' : ''} detected`);
    } else if (adherence >= 0.9 && taken > 0) {
      state = 'stable';
      observation = 'Medication schedule is on track';
      supportingData.push(`${taken} dose${taken > 1 ? 's' : ''} taken on time`);
    } else {
      state = 'stable';
      observation = 'No active medication concerns';
    }

    if (dueSoon > 0) {
      supportingData.push(`${dueSoon} medication${dueSoon > 1 ? 's' : ''} due in the next hour`);
    }

    return {
      state,
      label: STATE_LABELS[state],
      confidence: Math.min(0.9, 0.5 + total * 0.08),
      observation,
      supportingData,
      timePeriod: 'Last 48 hours',
      hasData: true,
    };
  }

  // ── Domain: Vitals ───────────────────────────────────────────────────────

  private computeVitalsDomain(
    events: HealthEvent[],
    vitalHistory: Array<{ vital_type: string; value: number; recorded_at: string }>,
    baseline: PersonalBaseline | null
  ): { domainState: DomainState; substates: Record<string, VitalSubstate> } {
    const vitalEvents = events.filter(e => e.eventType === 'vital_recorded');
    const localSamples = localHealthStore.getVitals();

    if (vitalEvents.length === 0 && vitalHistory.length === 0 && localSamples.length === 0) {
      return {
        domainState: this.noDataState('No vital signs recorded yet'),
        substates: {},
      };
    }

    const substates: Record<string, VitalSubstate> = {
      blood_pressure: {
        metric: 'blood_pressure',
        label: 'Blood Pressure',
        state: 'stable',
        observation: 'Blood pressure is within normal limits',
        isAnomaly: false,
        priority: 4,
      },
      heart_rate: {
        metric: 'heart_rate',
        label: 'Heart Rate',
        state: 'stable',
        observation: 'Heart rate is normal',
        isAnomaly: false,
        priority: 4,
      },
      weight: {
        metric: 'weight',
        label: 'Weight',
        state: 'stable',
        observation: 'Weight is steady',
        isAnomaly: false,
        priority: 4,
      },
      glucose: {
        metric: 'glucose',
        label: 'Blood Glucose',
        state: 'stable',
        observation: 'Blood glucose is normal',
        isAnomaly: false,
        priority: 4,
      },
      oxygen: {
        metric: 'oxygen',
        label: 'Blood Oxygen (SpO2)',
        state: 'stable',
        observation: 'Blood oxygen is normal',
        isAnomaly: false,
        priority: 4,
      },
    };

    const hasDataForMetric: Record<string, boolean> = {
      blood_pressure: false,
      heart_rate: false,
      weight: false,
      glucose: false,
      oxygen: false,
    };

    const getSubVitalKey = (m?: string): string | null => {
      if (!m) return null;
      const lower = m.toLowerCase();
      if (lower.includes('blood_pressure') || lower.includes('bp') || lower.includes('systolic') || lower.includes('diastolic')) return 'blood_pressure';
      if (lower.includes('heart_rate') || lower.includes('pulse') || lower.includes('bpm')) return 'heart_rate';
      if (lower.includes('weight') || lower.includes('bmi')) return 'weight';
      if (lower.includes('glucose') || lower.includes('sugar')) return 'glucose';
      if (lower.includes('oxygen') || lower.includes('spo2')) return 'oxygen';
      return null;
    };

    // 1. Process recent vital events
    for (const event of vitalEvents) {
      const metric = (event.eventValue?.['metric'] || event.eventValue?.['vital_type'] || event.eventValue?.['type']) as string | undefined;
      const subKey = getSubVitalKey(metric);
      if (!subKey) continue;

      hasDataForMetric[subKey] = true;
      const sub = substates[subKey];

      const val = event.eventValue?.['value'];
      const secVal = event.eventValue?.['secondaryValue'];
      const unit = event.eventValue?.['unit'] || '';
      if (val !== undefined && !sub.latestReading) {
        sub.latestReading = secVal ? `${val}/${secVal} ${unit}`.trim() : `${val} ${unit}`.trim();
      }

      if (event.priority === 0) {
        sub.state = 'needs_attention';
        sub.priority = 0;
        sub.isAnomaly = true;
        sub.observation = event.anomalyReason || event.eventContext || 'Critical reading detected';
      } else if (event.isAnomaly) {
        if (sub.priority > 2) {
          sub.state = 'needs_attention';
          sub.priority = event.priority || 2;
          sub.isAnomaly = true;
          sub.observation = event.anomalyReason || 'Reading deviates from your personal baseline';
        }
      }
    }

    // 2. Check local samples for metrics that had no events
    for (const sample of localSamples) {
      const subKey = getSubVitalKey(sample.metric);
      if (subKey && !hasDataForMetric[subKey]) {
        hasDataForMetric[subKey] = true;
        substates[subKey].latestReading = sample.secondaryValue
          ? `${sample.value}/${sample.secondaryValue} ${sample.unit}`
          : `${sample.value} ${sample.unit}`;
      }
    }

    // 3. Mark metrics with no data as unknown
    for (const key of Object.keys(hasDataForMetric)) {
      if (!hasDataForMetric[key]) {
        substates[key].state = 'unknown';
        substates[key].observation = 'No recent readings recorded';
      }
    }

    // 4. Determine overall vitals state (Worst-case across active vitals)
    const activeSubstates = Object.values(substates).filter(s => s.state !== 'unknown');
    const hasNeedsAttention = activeSubstates.some(s => s.state === 'needs_attention');
    const hasCritical = activeSubstates.some(s => s.priority === 0);

    const overallVitalsState: HealthStateValue = hasNeedsAttention
      ? 'needs_attention'
      : activeSubstates.length > 0
        ? 'stable'
        : 'unknown';

    // Supporting data breakdown
    const supportingData: string[] = [];
    activeSubstates.forEach(s => {
      const stateBadge = s.priority === 0 ? 'Critical' : s.state === 'needs_attention' ? 'Needs Attention' : 'Stable';
      supportingData.push(`${s.label}: ${stateBadge} ${s.latestReading ? `(${s.latestReading})` : ''} — ${s.observation}`);
    });

    // Formulate clear, non-contradictory observation
    let observation = 'Vitals are stable and within your personal baseline';
    if (hasCritical) {
      const criticalSubs = activeSubstates.filter(s => s.priority === 0);
      observation = `Critical alert on ${criticalSubs.map(s => s.label).join(', ')}: immediate attention required`;
    } else if (hasNeedsAttention) {
      const alertSubs = activeSubstates.filter(s => s.state === 'needs_attention');
      observation = `${alertSubs.map(s => s.label).join(', ')} outside baseline range; review recommended`;
    } else if (activeSubstates.length === 0) {
      observation = 'No vital signs recorded yet';
    }

    const domainState: DomainState = {
      state: overallVitalsState,
      label: STATE_LABELS[overallVitalsState],
      confidence: activeSubstates.length >= 2 ? 0.9 : 0.7,
      observation,
      supportingData,
      timePeriod: 'Last 48 hours',
      hasData: activeSubstates.length > 0,
      substates,
    };

    return { domainState, substates };
  }

  // ── Domain: Labs ─────────────────────────────────────────────────────────

  private computeLabsDomain(events: HealthEvent[]): DomainState {
    const labEvents = events.filter(e =>
      e.eventType === 'lab_uploaded' || e.eventType === 'lab_unreviewed'
    );

    if (labEvents.length === 0) {
      return this.noDataState('No recent lab reports');
    }

    const unreviewed = labEvents.filter(e => e.eventType === 'lab_unreviewed').length;

    return {
      state: unreviewed > 0 ? 'needs_attention' : 'stable',
      label: unreviewed > 0 ? STATE_LABELS.needs_attention : STATE_LABELS.stable,
      confidence: 0.9,
      observation: unreviewed > 0
        ? `${unreviewed} lab report${unreviewed > 1 ? 's' : ''} awaiting review`
        : 'Lab reports are up to date',
      supportingData: [`${labEvents.length} report${labEvents.length > 1 ? 's' : ''} found`],
      timePeriod: 'Last 7 days',
      hasData: true,
    };
  }

  // ── Domain: Appointments ──────────────────────────────────────────────────

  private computeAppointmentsDomain(events: HealthEvent[]): DomainState {
    const apptEvents = events.filter(e =>
      e.eventType === 'appointment_upcoming' ||
      e.eventType === 'appointment_overdue'
    );

    if (apptEvents.length === 0) {
      return this.noDataState('No upcoming appointments');
    }

    const overdue = apptEvents.filter(e => e.eventType === 'appointment_overdue').length;
    const upcoming = apptEvents.filter(e => e.eventType === 'appointment_upcoming');
    const within24h = upcoming.filter(e => {
      const hours = e.eventValue?.['hours_until'] as number | undefined;
      return hours !== undefined && hours <= 24;
    }).length;

    let state: HealthStateValue = 'stable';
    let observation = 'No urgent appointment actions';
    const supportingData: string[] = [];

    if (overdue > 0) {
      state = 'needs_attention';
      observation = `${overdue} appointment${overdue > 1 ? 's' : ''} may need follow-up`;
    } else if (within24h > 0) {
      state = 'needs_attention';
      observation = `Appointment within the next 24 hours`;
      supportingData.push(`${within24h} appointment${within24h > 1 ? 's' : ''} today or tomorrow`);
    } else if (upcoming.length > 0) {
      state = 'stable';
      observation = 'Upcoming appointments scheduled';
      supportingData.push(`${upcoming.length} appointment${upcoming.length > 1 ? 's' : ''} upcoming`);
    }

    return {
      state,
      label: STATE_LABELS[state],
      confidence: 0.9,
      observation,
      supportingData,
      timePeriod: 'Next 7 days',
      hasData: true,
    };
  }

  // ── Domain: Mental Health ─────────────────────────────────────────────────

  private computeMentalDomain(events: HealthEvent[]): DomainState {
    const mentalEvents = events.filter(e => e.eventType === 'mental_health_check');

    if (mentalEvents.length === 0) {
      return this.noDataState('No mental health check-ins recorded');
    }

    const latest = mentalEvents[0];
    const score = latest.eventValue?.['score'] as number | undefined;
    const lowScore = score !== undefined && score < 50;

    return {
      state: lowScore ? 'needs_attention' : 'stable',
      label: lowScore ? STATE_LABELS.needs_attention : STATE_LABELS.stable,
      confidence: 0.75,
      observation: lowScore
        ? 'Recent mental health check suggests you may need support'
        : 'Mental health check-in recorded',
      supportingData: score !== undefined ? [`Last score: ${score}/100`] : [],
      timePeriod: 'Last 48 hours',
      hasData: true,
    };
  }

  // ── Domain: Activity ───────────────────────────────────────────────────────

  private computeActivityDomain(events: HealthEvent[], baseline: PersonalBaseline | null): DomainState {
    const activityVitals = localHealthStore.getVitals('step_count', 7);
    if (activityVitals.length === 0) {
      return this.noDataState('No step or activity data recorded recently');
    }

    const latest = activityVitals[0];
    const avgSteps = Math.round(
      activityVitals.reduce((sum, s) => sum + s.value, 0) / activityVitals.length
    );
    const supportingData: string[] = [
      `Latest: ${Math.round(latest.value).toLocaleString()} steps`,
      `7-day average: ${avgSteps.toLocaleString()} steps/day`,
    ];

    let state: HealthStateValue = 'stable';
    let observation = 'Activity levels are steady';

    if (baseline?.ranges['step_count']) {
      const b = baseline.ranges['step_count'];
      if (avgSteps >= b.mean * 1.1) {
        state = 'improving';
        observation = 'Daily steps are above your baseline average';
      } else if (avgSteps < b.min) {
        state = 'needs_attention';
        observation = 'Activity is lower than your usual baseline';
      }
    } else {
      if (avgSteps >= 8000) {
        state = 'improving';
        observation = 'Meeting healthy daily physical activity target';
      } else if (avgSteps < 3000) {
        state = 'needs_attention';
        observation = 'Activity is notably low; aim for light walking';
      }
    }

    return {
      state,
      label: STATE_LABELS[state],
      confidence: Math.min(0.9, 0.5 + activityVitals.length * 0.08),
      observation,
      supportingData,
      timePeriod: 'Last 7 days',
      hasData: true,
    };
  }

  // ── Domain: Sleep ──────────────────────────────────────────────────────────

  private computeSleepDomain(events: HealthEvent[], baseline: PersonalBaseline | null): DomainState {
    const sleepVitals = localHealthStore.getVitals('sleep_duration', 7);
    if (sleepVitals.length === 0) {
      return this.noDataState('No sleep tracking data recorded recently');
    }

    const latest = sleepVitals[0];
    const latestHours = latest.value < 24 ? latest.value : latest.value / 60;
    const avgHours = Number((
      sleepVitals.reduce((sum, s) => sum + (s.value < 24 ? s.value : s.value / 60), 0) / sleepVitals.length
    ).toFixed(1));

    const supportingData: string[] = [
      `Latest sleep: ${latestHours.toFixed(1)} hrs`,
      `7-day average: ${avgHours.toFixed(1)} hrs/night`,
    ];

    let state: HealthStateValue = 'stable';
    let observation = 'Sleep duration is consistent';

    if (avgHours < 6) {
      state = 'needs_attention';
      observation = 'Average sleep is under 6 hours; chronic debt risk';
    } else if (avgHours >= 7 && avgHours <= 9) {
      state = 'improving';
      observation = 'Sleep duration is optimal (7–9 hours)';
    }

    return {
      state,
      label: STATE_LABELS[state],
      confidence: Math.min(0.9, 0.5 + sleepVitals.length * 0.08),
      observation,
      supportingData,
      timePeriod: 'Last 7 days',
      hasData: true,
    };
  }

  // ── Score computation ─────────────────────────────────────────────────────

  /**
   * Compute a health score (50–100) from domain states.
   * Returns null if fewer than 2 domains have data.
   * NEVER returns a fake score.
   */
  private computeScore(domainsWithData: DomainState[]): number | null {
    if (domainsWithData.length < 2) return null;

    const domainScore = (d: DomainState): number => {
      switch (d.state) {
        case 'stable': return 90 * d.confidence;
        case 'improving': return 80 * d.confidence;
        case 'needs_attention': return 55 * d.confidence;
        case 'unknown': return 0;
      }
    };

    const totalWeight = domainsWithData.reduce((acc, d) => acc + d.confidence, 0);
    if (totalWeight === 0) return null;

    const weightedScore = domainsWithData.reduce(
      (acc, d) => acc + domainScore(d) * d.confidence,
      0
    ) / totalWeight;

    return Math.round(Math.max(50, Math.min(100, weightedScore)));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private noDataState(observation: string): DomainState {
    return {
      state: 'unknown',
      label: STATE_LABELS.unknown,
      confidence: 0,
      observation,
      supportingData: [],
      timePeriod: '—',
      hasData: false,
    };
  }
}

export const HealthStateEngine = new HealthStateEngineImpl();

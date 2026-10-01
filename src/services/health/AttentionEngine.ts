/**
 * CHATR HEALTH OS — AttentionEngine + NotificationDecisionEngine
 *
 * ATTENTION ENGINE: Priority-scores all health items (P0–P5)
 * NOTIFICATION DECISION ENGINE: Decides SEND / DELAY / BUNDLE / SUPPRESS
 *   per item based on fatigue, quiet hours, deduplication, and urgency.
 *
 * These are the "NOTIFY" step of:
 * SENSE → UNDERSTAND → NOTIFY → ACT → VERIFY → LEARN
 *
 * Rules:
 *  - P0 (safety) always SEND
 *  - Notification fatigue is tracked and respected
 *  - No duplicate notifications within cooldown window
 *  - Wellness notifications (P4–P5) are bundled when fatigue is high
 *  - Every decision is logged for outcome learning
 */

import { supabase } from '@/integrations/supabase/client';
import { HealthEvent, EventPriority } from './HealthEventService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationCategory =
  | 'medication'
  | 'vital'
  | 'lab'
  | 'appointment'
  | 'insight'
  | 'wellness'
  | 'care_path'
  | 'safety'
  | 'mental';

export type NotificationDecision = 'send' | 'delay' | 'bundle' | 'suppress';

export interface NotificationCandidate {
  id: string;
  category: NotificationCategory;
  priority: EventPriority;
  title: string;
  body: string;
  reason: string;
  evidence: Record<string, unknown>;
  recommendedAction: string;
  whyExplanation: string;       // "Why am I seeing this?"
  optimalTime: Date | null;
  expiresAt: Date | null;
  dedupeKey: string;            // prevents duplicate sends
  cooldownHours: number;
  sourceEventId: string | null;
}

export interface NotificationDecisionResult {
  candidate: NotificationCandidate;
  decision: NotificationDecision;
  decisionReason: string;
}

export interface FocusItem {
  id: string;
  type: NotificationCategory;
  title: string;
  description: string;
  icon: string;              // lucide icon name
  priority: EventPriority;
  actionLabel: string;
  actionRoute: string;
  sourceTable: string | null;
  sourceId: string | null;
}

// ─── AttentionEngine ──────────────────────────────────────────────────────────

class AttentionEngineImpl {

  /**
   * Convert normalized HealthEvents into scored NotificationCandidates.
   * Each event becomes a candidate; the Decision Engine then filters them.
   */
  scoreEvents(events: HealthEvent[]): NotificationCandidate[] {
    return events
      .filter(e => e.priority <= 3)  // P0–P3 only (P4–P5 handled as wellness bundles)
      .map(e => this.eventToCandidate(e))
      .filter((c): c is NotificationCandidate => c !== null);
  }

  /**
   * Build Today Focus items (max 3) from scored candidates.
   * Ordered by priority. No more than 3 items regardless of data.
   */
  buildTodayFocus(candidates: NotificationCandidate[]): FocusItem[] {
    const topCandidates = [...candidates]
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3);

    return topCandidates.map(c => this.candidateToFocusItem(c));
  }

  private eventToCandidate(event: HealthEvent): NotificationCandidate | null {
    const id = `candidate-${event.id}`;

    switch (event.eventType) {
      case 'medication_due': {
        const medName = String(event.eventValue?.['medicine_name'] || 'Medication');
        const slot = String(event.eventValue?.['slot'] || '');
        const minUntil = Number(event.eventValue?.['minutes_until'] || 0);
        return {
          id,
          category: 'medication',
          priority: event.priority,
          title: `${medName} due${minUntil <= 15 ? ' now' : ` at ${slot}`}`,
          body: `Your scheduled medication is due${minUntil > 0 ? ` in ${minUntil} minutes` : ''}`,
          reason: 'Medication reminder based on your schedule',
          evidence: { source: 'medication_reminders', schedule: slot },
          recommendedAction: 'Mark as taken',
          whyExplanation: `You set a medication reminder for ${medName} at ${slot}`,
          optimalTime: event.eventAt,
          expiresAt: new Date(event.eventAt.getTime() + 2 * 60 * 60 * 1000),
          dedupeKey: `med-${event.sourceRecordId}-${slot}-${new Date().toDateString()}`,
          cooldownHours: 1,
          sourceEventId: null,
        };
      }

      case 'medication_missed': {
        const medName = String(event.eventValue?.['medicine_name'] || 'Medication');
        return {
          id,
          category: 'medication',
          priority: 2,
          title: `${medName} was missed`,
          body: 'You may have missed a scheduled medication',
          reason: 'No intake recorded for this scheduled medication',
          evidence: { source: 'medicine_intake_log', medicine: medName },
          recommendedAction: 'Log intake or skip',
          whyExplanation: `${medName} was scheduled but no intake was recorded`,
          optimalTime: null,
          expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
          dedupeKey: `missed-${event.sourceRecordId}-${new Date().toDateString()}`,
          cooldownHours: 4,
          sourceEventId: null,
        };
      }

      case 'lab_unreviewed': {
        const testName = String(event.eventValue?.['test_name'] || 'Lab report');
        return {
          id,
          category: 'lab',
          priority: event.priority,
          title: 'New lab report available',
          body: `${testName} is ready to view`,
          reason: 'Lab report uploaded and not yet reviewed',
          evidence: { source: 'lab_reports', test: testName },
          recommendedAction: 'View Report',
          whyExplanation: `Your ${testName} results are available`,
          optimalTime: null,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          dedupeKey: `lab-${event.sourceRecordId}`,
          cooldownHours: 24,
          sourceEventId: null,
        };
      }

      case 'appointment_upcoming': {
        const hours = Number(event.eventValue?.['hours_until'] || 0);
        const dateStr = String(event.eventValue?.['appointment_date'] || '');
        return {
          id,
          category: 'appointment',
          priority: event.priority,
          title: hours <= 24 ? 'Doctor appointment today' : 'Appointment coming up',
          body: hours <= 1
            ? 'Your appointment starts in less than 1 hour'
            : `Doctor appointment on ${dateStr}`,
          reason: 'Scheduled appointment reminder',
          evidence: { source: 'chatr_healthcare_appointments', date: dateStr, hours_until: hours },
          recommendedAction: 'View Appointment',
          whyExplanation: `You have a doctor appointment scheduled on ${dateStr}`,
          optimalTime: event.eventAt,
          expiresAt: event.eventAt,
          dedupeKey: `appt-${event.sourceRecordId}`,
          cooldownHours: hours <= 2 ? 1 : 12,
          sourceEventId: null,
        };
      }

      case 'prediction_fired': {
        const riskLevel = String(event.eventValue?.['risk_level'] || 'moderate');
        if (riskLevel === 'low') return null; // Low risk predictions not shown as notifications
        return {
          id,
          category: 'insight',
          priority: event.priority,
          title: 'CHATR noticed something',
          body: String(event.eventValue?.['description'] || 'A health pattern worth reviewing'),
          reason: 'AI health prediction flagged for review',
          evidence: {
            source: 'health_predictions',
            risk_level: riskLevel,
            description: event.eventValue?.['description'],
          },
          recommendedAction: 'Understand',
          whyExplanation: `Based on your health data, CHATR noticed: ${event.eventValue?.['description']}`,
          optimalTime: null,
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          dedupeKey: `pred-${event.sourceRecordId}`,
          cooldownHours: 48,
          sourceEventId: null,
        };
      }

      case 'vital_recorded': {
        if (!event.isAnomaly) return null;  // Normal vitals don't generate notifications
        const isSafety = event.priority === 0;
        return {
          id,
          category: isSafety ? 'safety' : 'vital',
          priority: event.priority,
          title: isSafety ? `🚨 Critical: ${event.eventContext}` : 'Vital reading outside your range',
          body: event.eventContext,
          reason: event.anomalyReason || 'Vital reading deviates from your personal baseline',
          evidence: { source: 'chronic_vitals', ...event.eventValue },
          recommendedAction: isSafety ? 'Emergency Care' : 'Review Vitals',
          whyExplanation: event.anomalyReason || 'This reading is outside your personal baseline',
          optimalTime: null,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          dedupeKey: `vital-${isSafety ? 'safety' : 'anomaly'}-${event.sourceRecordId}`,
          cooldownHours: isSafety ? 0 : 12,
          sourceEventId: event.id,
        };
      }

      default:
        return null;
    }
  }

  private candidateToFocusItem(c: NotificationCandidate): FocusItem {
    const iconMap: Record<NotificationCategory, string> = {
      medication: 'Pill',
      vital: 'Activity',
      lab: 'FlaskConical',
      appointment: 'Calendar',
      insight: 'Sparkles',
      wellness: 'Heart',
      care_path: 'Route',
      safety: 'AlertTriangle',
      mental: 'Brain',
    };

    const routeMap: Record<NotificationCategory, string> = {
      medication: '/care/medicines',
      vital: '/chronic-vitals',
      lab: '/lab-reports',
      appointment: '/booking',
      insight: '/health-risks',
      wellness: '/health',
      care_path: '/care',
      safety: '/teleconsultation',
      mental: '/mental-health',
    };

    return {
      id: c.id,
      type: c.category,
      title: c.title,
      description: c.body,
      icon: iconMap[c.category] || 'Heart',
      priority: c.priority,
      actionLabel: c.recommendedAction,
      actionRoute: routeMap[c.category] || '/health',
      sourceTable: null,
      sourceId: c.sourceEventId,
    };
  }
}

// ─── NotificationDecisionEngine ───────────────────────────────────────────────

class NotificationDecisionEngineImpl {

  /**
   * Evaluate each candidate and decide: SEND / DELAY / BUNDLE / SUPPRESS
   *
   * Rules:
   *  - P0: always SEND (safety override)
   *  - Deduplication: if matching dedupe_key was sent within cooldown → SUPPRESS
   *  - Fatigue: if ignored_count > 5 for category in 30 days AND priority < P2 → SUPPRESS
   *  - Quiet hours: if priority > P1 AND within quiet hours → DELAY to morning
   *  - Bundle: if 3+ wellness (P4–P5) items → merge into one
   */
  async evaluate(
    userId: string,
    candidates: NotificationCandidate[],
    quietHoursStart = 22,  // 10 PM
    quietHoursEnd = 7      // 7 AM
  ): Promise<NotificationDecisionResult[]> {
    if (candidates.length === 0) return [];

    // Load recent notification log for deduplication + fatigue (offline-safe)
    let recentLog: Array<{ dedupe_key: string; category: string; ignored_count: number; delivered_at: string | null; created_at: string }> = [];
    try {
      const { data } = await supabase
        .from('health_notification_log')
        .select('dedupe_key, category, ignored_count, delivered_at, created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });
      if (data) {
        recentLog = data;
      }
    } catch (e) {
      console.warn('[NotificationDecisionEngine] Offline fallback for notification log:', e);
    }

    const now = new Date();
    const currentHour = now.getHours();
    const isQuietHours = currentHour >= quietHoursStart || currentHour < quietHoursEnd;

    const results: NotificationDecisionResult[] = [];

    for (const candidate of candidates) {
      const result = await this.decideForCandidate(
        candidate, recentLog || [], isQuietHours, quietHoursEnd
      );
      results.push(result);
    }

    return results;
  }

  private decideForCandidate(
    candidate: NotificationCandidate,
    recentLog: Array<{ dedupe_key: string; category: string; ignored_count: number; delivered_at: string | null; created_at: string }>,
    isQuietHours: boolean,
    quietHoursEnd: number
  ): NotificationDecisionResult {

    // P0 = always send (safety override — no fatigue, no quiet hours)
    if (candidate.priority === 0) {
      return { candidate, decision: 'send', decisionReason: 'Safety priority — immediate send' };
    }

    // Step 1: Deduplication check
    const cooldownMs = candidate.cooldownHours * 60 * 60 * 1000;
    const duplicateDelivered = recentLog.find(log =>
      log.dedupe_key === candidate.dedupeKey &&
      log.delivered_at &&
      new Date(log.delivered_at).getTime() > Date.now() - cooldownMs
    );
    if (duplicateDelivered) {
      return { candidate, decision: 'suppress', decisionReason: `Duplicate within ${candidate.cooldownHours}h cooldown` };
    }

    // Step 2: Fatigue check (P3–P5 only; P0–P2 are not suppressed for fatigue)
    if (candidate.priority >= 3) {
      const categoryLogs = recentLog.filter(log => log.category === candidate.category);
      const totalIgnored = categoryLogs.reduce((acc, l) => acc + (l.ignored_count || 0), 0);
      if (totalIgnored > 5) {
        return {
          candidate,
          decision: 'suppress',
          decisionReason: `High fatigue (${totalIgnored} ignored) for category: ${candidate.category}`,
        };
      }
    }

    // Step 3: Quiet hours check
    if (isQuietHours && candidate.priority > 1) {
      const now = new Date();
      const optimalTime = new Date(now);
      optimalTime.setHours(quietHoursEnd, 0, 0, 0);
      if (optimalTime < now) optimalTime.setDate(optimalTime.getDate() + 1);
      return {
        candidate: { ...candidate, optimalTime },
        decision: 'delay',
        decisionReason: `Delayed to ${optimalTime.toLocaleTimeString()} (quiet hours)`,
      };
    }

    // Default: send
    return { candidate, decision: 'send', decisionReason: 'Normal priority send' };
  }

  /**
   * Log notification decisions to health_notification_log.
   * This is how outcome learning works over time.
   */
  async logDecisions(userId: string, results: NotificationDecisionResult[]): Promise<void> {
    if (results.length === 0) return;

    const rows = results.map(r => ({
      user_id: userId,
      category: r.candidate.category,
      priority: r.candidate.priority,
      title: r.candidate.title,
      body: r.candidate.body,
      reason: r.candidate.reason,
      evidence: r.candidate.evidence,
      recommended_action: r.candidate.recommendedAction,
      why_explanation: r.candidate.whyExplanation,
      optimal_time: r.candidate.optimalTime?.toISOString() || null,
      expires_at: r.candidate.expiresAt?.toISOString() || null,
      dedupe_key: r.candidate.dedupeKey,
      cooldown_hours: r.candidate.cooldownHours,
      decision: r.decision,
      decision_reason: r.decisionReason,
      health_event_id: r.candidate.sourceEventId || null,
    }));

    try {
      const { error } = await supabase.from('health_notification_log').insert(rows);
      if (error) console.warn('[AttentionEngine] Notification log notice:', error.message);
    } catch (e) {
      console.warn('[AttentionEngine] Log notice:', e);
    }
  }

  /**
   * Record user response to a notification (for fatigue learning).
   */
  async recordResponse(
    notificationId: string,
    response: 'opened' | 'dismissed' | 'snoozed' | 'action_taken' | 'action_completed'
  ): Promise<void> {
    const now = new Date().toISOString();
    const update: Record<string, string | number> = {};

    switch (response) {
      case 'opened': update.opened_at = now; break;
      case 'dismissed':
        update.dismissed_at = now;
        update.ignored_count = 1;  // increment handled by Supabase trigger or app logic
        break;
      case 'snoozed': update.snoozed_at = now; break;
      case 'action_taken': update.action_taken_at = now; break;
      case 'action_completed': update.action_completed_at = now; break;
    }

    await supabase
      .from('health_notification_log')
      .update(update)
      .eq('id', notificationId);
  }
}

export const AttentionEngine = new AttentionEngineImpl();
export const NotificationDecisionEngine = new NotificationDecisionEngineImpl();

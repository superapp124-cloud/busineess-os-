/**
 * CHATR SI OS — Notification Decision Adapter
 * src/ai/notifications/NotificationDecisionAdapter.ts
 *
 * Adapts context-aware proactive notifications to user modes (MINIMAL, BALANCED, PROACTIVE)
 * while preserving the inviolable authority of NotificationDecisionEngine.
 */

import { preferenceStore } from '../personalization/PreferenceStore';

export type NotificationUrgency = 'CRITICAL' | 'IMPORTANT' | 'USEFUL';

export interface ProactiveNotificationCandidate {
  id: string;
  category: 'MEDICINE' | 'DEVICE' | 'HEALTH_TREND' | 'SLEEP' | 'APPOINTMENT' | 'WORK';
  title: string;
  body: string;
  urgency: NotificationUrgency;
  actionPayload?: Record<string, unknown>;
  timestamp: number;
}

export class NotificationDecisionAdapter {
  private static instance: NotificationDecisionAdapter;

  private constructor() {}

  public static getInstance(): NotificationDecisionAdapter {
    if (!NotificationDecisionAdapter.instance) {
      NotificationDecisionAdapter.instance = new NotificationDecisionAdapter();
    }
    return NotificationDecisionAdapter.instance;
  }

  /**
   * Evaluates if a proactive notification candidate should be dispatched to the user
   */
  public shouldNotify(candidate: ProactiveNotificationCandidate): boolean {
    const mode = preferenceStore.getPreferences().notificationsMode;

    // 1. CRITICAL (e.g. Blood Pressure P0, Medicine Due): ALWAYS notify regardless of mode
    if (candidate.urgency === 'CRITICAL') {
      return true;
    }

    // 2. MINIMAL mode: Drops all non-critical notifications
    if (mode === 'MINIMAL') {
      return false;
    }

    // 3. BALANCED mode: Delivers CRITICAL and IMPORTANT; filters USEFUL
    if (mode === 'BALANCED') {
      return candidate.urgency === 'IMPORTANT';
    }

    // 4. PROACTIVE mode: Delivers all vetted insights
    return true;
  }
}

export const notificationDecisionAdapter = NotificationDecisionAdapter.getInstance();

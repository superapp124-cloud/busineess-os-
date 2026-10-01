/**
 * CHATR SI OS — Personal Daily Brief Engine
 * src/ai/proactive/DailyBriefEngine.ts
 *
 * Generates an ultra-concise, non-overwhelming daily briefing.
 * Maximum 3 high-impact items / cards.
 *
 * Card-Based Minimalist Intent UX:
 * "I found 3 things that matter today... What can I handle?"
 * Anti-Dashboard Rule: Do NOT overwhelm the user with a dashboard of metrics.
 */

import { personalContextEngine, CompactPersonalContext } from '../context/PersonalContextEngine';
import { preferenceStore } from '../personalization/PreferenceStore';
import { BriefingCard } from '../capabilities/types';

export interface DailyBrief {
  greeting: string;
  items: string[];
  cards: BriefingCard[];
  generatedAt: number;
}

export class DailyBriefEngine {
  private static instance: DailyBriefEngine;

  private constructor() {}

  public static getInstance(): DailyBriefEngine {
    if (!DailyBriefEngine.instance) {
      DailyBriefEngine.instance = new DailyBriefEngine();
    }
    return DailyBriefEngine.instance;
  }

  /**
   * Generates at most 3 structured high-impact briefing cards for the minimalist UX
   * "I found 3 things that matter today... What can I handle?"
   */
  public generateBriefingCards(): BriefingCard[] {
    const context = personalContextEngine.getSnapshot();
    const cards: BriefingCard[] = [];

    // Card 1: Work OS — Next Meeting or Calendar Status
    if (context.nextMeetingTitle && context.nextMeetingMinutesAway) {
      cards.push({
        id: 'card_meeting_today',
        domain: 'WORK',
        title: `Upcoming: ${context.nextMeetingTitle}`,
        summary: `Starts in ${context.nextMeetingMinutesAway} minutes (${context.calendarMeetingsCount} meetings scheduled today).`,
        severity: context.nextMeetingMinutesAway < 30 ? 'ATTENTION' : 'INFO',
        suggestedAction: 'Review agenda or join call',
        actionOptions: [
          { label: 'Review Agenda', actionId: 'work_review_agenda', riskLevel: 'LEVEL_1_SAFE_READ' },
          { label: 'Join Call', actionId: 'work_join_meeting', riskLevel: 'LEVEL_1_SAFE_READ' },
          { label: 'Snooze 10m', actionId: 'work_snooze_alert', riskLevel: 'LEVEL_2_REVERSIBLE' },
        ],
        timestamp: Date.now(),
      });
    } else if (context.calendarMeetingsCount > 0) {
      cards.push({
        id: 'card_calendar_overview',
        domain: 'WORK',
        title: 'Work Schedule',
        summary: `You have ${context.calendarMeetingsCount} meetings scheduled today.`,
        severity: 'INFO',
        suggestedAction: 'Open schedule',
        actionOptions: [
          { label: 'View Agenda', actionId: 'work_view_agenda', riskLevel: 'LEVEL_1_SAFE_READ' },
        ],
        timestamp: Date.now(),
      });
    } else {
      cards.push({
        id: 'card_calendar_clear',
        domain: 'WORK',
        title: 'Calendar Clear',
        summary: 'No upcoming meetings on your schedule today.',
        severity: 'INFO',
        suggestedAction: 'Plan focus time',
        actionOptions: [
          { label: 'Block Focus Time', actionId: 'work_block_focus', riskLevel: 'LEVEL_2_REVERSIBLE' },
        ],
        timestamp: Date.now(),
      });
    }

    // Card 2: Health OS — Baseline & Vitals Context
    if (context.sleepStatus === 'below_baseline') {
      cards.push({
        id: 'card_health_sleep',
        domain: 'HEALTH',
        title: 'Sleep Below Baseline',
        summary: 'Recorded sleep was shorter than your personal baseline.',
        severity: 'ATTENTION',
        suggestedAction: 'Consider lighter schedule or earlier rest tonight',
        actionOptions: [
          { label: 'View Baseline', actionId: 'health_view_baseline', riskLevel: 'LEVEL_1_SAFE_READ' },
          { label: 'Snooze Health Advice', actionId: 'health_snooze', riskLevel: 'LEVEL_2_REVERSIBLE' },
        ],
        timestamp: Date.now(),
      });
    } else if (context.healthState === 'needs_attention') {
      cards.push({
        id: 'card_health_alert',
        domain: 'HEALTH',
        title: 'Health Baseline Alert',
        summary: 'Health OS recorded a vital reading outside typical baseline.',
        severity: 'ATTENTION',
        suggestedAction: 'Check latest reading',
        actionOptions: [
          { label: 'Inspect Reading', actionId: 'health_inspect', riskLevel: 'LEVEL_1_SAFE_READ' },
        ],
        timestamp: Date.now(),
      });
    } else {
      cards.push({
        id: 'card_health_nominal',
        domain: 'HEALTH',
        title: 'Health Baseline Stable',
        summary: 'Your resting vitals and sleep baseline are in the nominal range.',
        severity: 'INFO',
        suggestedAction: 'All vitals tracking normally',
        actionOptions: [
          { label: 'Log Vitals', actionId: 'health_log_vitals', riskLevel: 'LEVEL_2_REVERSIBLE' },
        ],
        timestamp: Date.now(),
      });
    }

    // Card 3: Action / Life OS — Pending Commitments & Tasks
    if (context.tasksDueCount > 0) {
      cards.push({
        id: 'card_tasks_due',
        domain: 'LIFE',
        title: 'Action Items Due',
        summary: `You have ${context.tasksDueCount} active commitment/task due today.`,
        severity: 'ATTENTION',
        suggestedAction: 'Review and complete',
        actionOptions: [
          { label: 'View Tasks', actionId: 'life_view_tasks', riskLevel: 'LEVEL_1_SAFE_READ' },
          { label: 'Mark Done', actionId: 'life_complete_task', riskLevel: 'LEVEL_2_REVERSIBLE' },
        ],
        timestamp: Date.now(),
      });
    } else {
      cards.push({
        id: 'card_tasks_done',
        domain: 'LIFE',
        title: 'All Commitments Met',
        summary: 'All scheduled tasks, reminders, and daily habits are up to date.',
        severity: 'INFO',
        suggestedAction: 'No pending items',
        actionOptions: [
          { label: 'Add Quick Task', actionId: 'life_add_task', riskLevel: 'LEVEL_2_REVERSIBLE' },
        ],
        timestamp: Date.now(),
      });
    }

    // Strict invariant: Maximum 3 cards
    return cards.slice(0, 3);
  }

  /**
   * Generates at most 3 important things for the user's day
   */
  public generateBrief(): DailyBrief {
    const context = personalContextEngine.getSnapshot();
    const prefs = preferenceStore.getPreferences();
    const cards = this.generateBriefingCards();

    const items: string[] = cards.map(c => `${c.title}: ${c.summary}`);
    const greeting = `${context.timeOfDay.toUpperCase()} BRIEFING for ${prefs.name.toUpperCase()}`;

    return {
      greeting,
      items,
      cards,
      generatedAt: Date.now(),
    };
  }

  public formatBriefAsText(): string {
    const brief = this.generateBrief();
    return [
      `🌅 ${brief.greeting}`,
      ...brief.items.map((item, i) => `${i + 1}. ${item}`)
    ].join('\n');
  }
}

export const dailyBriefEngine = DailyBriefEngine.getInstance();

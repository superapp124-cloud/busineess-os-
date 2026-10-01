/**
 * CHATR SI OS — Personal Context Engine
 * src/ai/context/PersonalContextEngine.ts
 *
 * Consolidates ambient device signals, calendar, tasks, Health OS status,
 * connected BLE sensors, and user preferences into a compact structured context.
 *
 * CRITICAL RULE: Never dump raw databases or chat histories into the LLM context.
 */

import { preferenceStore } from '../personalization/PreferenceStore';
import { privacyRouter } from '../privacy/PrivacyRouter';

export interface DeviceStatusSummary {
  connectedCount: number;
  watchConnected: boolean;
  ringConnected: boolean;
  bpMonitorConnected: boolean;
  glucoseMeterConnected: boolean;
  batteryLevelPercent: number;
  batteryLow: boolean;
}

export interface CompactPersonalContext {
  time: string;                     // e.g. "08:15"
  day: string;                      // e.g. "Monday"
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  healthState: 'stable' | 'needs_attention' | 'critical' | 'unknown';
  sleepStatus: 'optimal' | 'normal' | 'below_baseline' | 'unknown';
  activityLevel: 'low' | 'normal' | 'high';
  calendarMeetingsCount: number;
  nextMeetingTitle?: string;
  nextMeetingMinutesAway?: number;
  tasksDueCount: number;
  devicesSummary: string;           // e.g. "3_connected"
  privacyPolicy: 'local_only' | 'hybrid_allowed';
  recentEvent?: string;
}

export class PersonalContextEngine {
  private static instance: PersonalContextEngine;

  private connectedDevices: DeviceStatusSummary = {
    connectedCount: 3,
    watchConnected: true,
    ringConnected: true,
    bpMonitorConnected: true,
    glucoseMeterConnected: false,
    batteryLevelPercent: 82,
    batteryLow: false,
  };

  private currentHealthState: 'stable' | 'needs_attention' | 'critical' | 'unknown' = 'stable';
  private currentSleepStatus: 'optimal' | 'normal' | 'below_baseline' | 'unknown' = 'normal';
  private currentActivity: 'low' | 'normal' | 'high' = 'normal';

  private constructor() {}

  public static getInstance(): PersonalContextEngine {
    if (!PersonalContextEngine.instance) {
      PersonalContextEngine.instance = new PersonalContextEngine();
    }
    return PersonalContextEngine.instance;
  }

  /**
   * Updates health context directly from Health OS events
   */
  public updateHealthContext(
    state: 'stable' | 'needs_attention' | 'critical',
    sleep: 'optimal' | 'normal' | 'below_baseline',
    activity: 'low' | 'normal' | 'high'
  ): void {
    this.currentHealthState = state;
    this.currentSleepStatus = sleep;
    this.currentActivity = activity;
  }

  /**
   * Updates device status from BLE / universal device normalizer
   */
  public updateDeviceStatus(status: Partial<DeviceStatusSummary>): void {
    this.connectedDevices = { ...this.connectedDevices, ...status };
  }

  /**
   * Generates the compact structured context for PersonalAgent decision-making
   */
  public getSnapshot(): CompactPersonalContext {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const time = `${hours.toString().padStart(2, '0')}:${minutes}`;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[now.getDay()];

    let timeOfDay: CompactPersonalContext['timeOfDay'] = 'morning';
    if (hours >= 12 && hours < 17) timeOfDay = 'afternoon';
    else if (hours >= 17 && hours < 21) timeOfDay = 'evening';
    else if (hours >= 21 || hours < 5) timeOfDay = 'night';

    const policy = privacyRouter.getPolicy();
    const privacyPolicy = policy.privateModeStrict || !policy.cloudAIAllowed ? 'local_only' : 'hybrid_allowed';

    return {
      time,
      day,
      timeOfDay,
      healthState: this.currentHealthState,
      sleepStatus: this.currentSleepStatus,
      activityLevel: this.currentActivity,
      calendarMeetingsCount: 2,
      nextMeetingTitle: 'Strategy Presentation',
      nextMeetingMinutesAway: 45,
      tasksDueCount: 1,
      devicesSummary: `${this.connectedDevices.connectedCount}_connected`,
      privacyPolicy,
      recentEvent: this.currentSleepStatus === 'below_baseline' ? 'Sleep 5h 20m (below usual 7h baseline)' : undefined,
    };
  }

  /**
   * Formats the compact context as a concise string for LLM system prompt injection
   */
  public formatContextForPrompt(): string {
    const s = this.getSnapshot();
    return [
      `[Context: Time ${s.time} ${s.day} (${s.timeOfDay}) | Health: ${s.healthState} | Sleep: ${s.sleepStatus} | Schedule: ${s.calendarMeetingsCount} meetings | Tasks: ${s.tasksDueCount} due | Devices: ${s.devicesSummary} | Privacy: ${s.privacyPolicy}]`
    ].join('\n');
  }
}

export const personalContextEngine = PersonalContextEngine.getInstance();

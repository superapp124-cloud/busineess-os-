/**
 * CHATR SI OS — Proactive Intelligence Engine
 * src/ai/proactive/ProactiveIntelligenceEngine.ts
 *
 * Evaluates contextual candidates and cross-domain opportunities.
 * Enforces the Anti-Notification-Fatigue barrier:
 * - Does this matter?
 * - Does it require action?
 * - Is now appropriate?
 * - Has the user already been informed?
 * - Would this create notification fatigue?
 *
 * Cross-Domain Intelligence:
 * Combines Health + Calendar + Routines into actionable observations without
 * making medical conclusions or false causal claims.
 */

import { personalContextEngine, CompactPersonalContext } from '../context/PersonalContextEngine';
import { preferenceStore } from '../personalization/PreferenceStore';
import { notificationDecisionAdapter } from '../notifications/NotificationDecisionAdapter';

export interface ProactiveOpportunity {
  id: string;
  category: 'PREPARATION' | 'HEALTH_OBSERVATION' | 'COMMITMENT' | 'ROUTINE';
  observation: string;
  suggestion?: string;
  requiresAction: boolean;
  confidence: number; // 0.0 - 1.0
  urgency: 'CRITICAL' | 'IMPORTANT' | 'USEFUL';
  timestamp: number;
}

export class ProactiveIntelligenceEngine {
  private static instance: ProactiveIntelligenceEngine;
  private informedEventIds: Set<string> = new Set();
  private recentNotificationsTimestamps: number[] = [];

  private constructor() {}

  public static getInstance(): ProactiveIntelligenceEngine {
    if (!ProactiveIntelligenceEngine.instance) {
      ProactiveIntelligenceEngine.instance = new ProactiveIntelligenceEngine();
    }
    return ProactiveIntelligenceEngine.instance;
  }

  /**
   * Evaluates the current personal context to detect cross-domain opportunities
   */
  public evaluateContext(): ProactiveOpportunity[] {
    const context = personalContextEngine.getSnapshot();
    const opportunities: ProactiveOpportunity[] = [];

    // Cross-Domain Intelligence Example:
    // Health (Sleep below baseline) + Work (Upcoming Meeting)
    if (context.sleepStatus === 'below_baseline' && context.nextMeetingMinutesAway && context.nextMeetingMinutesAway <= 60) {
      opportunities.push({
        id: `opp_prep_${context.day}_${context.nextMeetingTitle}`,
        category: 'PREPARATION',
        observation: `You have "${context.nextMeetingTitle}" in ${context.nextMeetingMinutesAway} minutes and your recorded sleep was below baseline.`,
        suggestion: 'Would you like me to prepare your meeting notes and briefing summary now?',
        requiresAction: true,
        confidence: 0.90,
        urgency: 'IMPORTANT',
        timestamp: Date.now(),
      });
    }

    // Health Safety Override: If Health State is critical, immediately generate opportunity
    if (context.healthState === 'critical') {
      opportunities.push({
        id: `opp_crit_${Date.now()}`,
        category: 'HEALTH_OBSERVATION',
        observation: 'Critical vital safety alert detected in Health OS.',
        suggestion: 'Please review your emergency guidance or contact your healthcare professional.',
        requiresAction: true,
        confidence: 1.0,
        urgency: 'CRITICAL',
        timestamp: Date.now(),
      });
    }

    return opportunities;
  }

  /**
   * Determines whether an opportunity should be dispatched to the user
   * Checks fatigue, user mode, duplicate delivery, and timing.
   */
  public shouldDeliver(opportunity: ProactiveOpportunity): { deliver: boolean; reason: string } {
    const now = Date.now();
    const mode = preferenceStore.getPreferences().notificationsMode;

    // 1. Critical safety events: ALWAYS DELIVER
    if (opportunity.urgency === 'CRITICAL') {
      return { deliver: true, reason: 'Critical safety alert must be delivered immediately.' };
    }

    // 2. Duplicate Check: Has user already been informed?
    if (this.informedEventIds.has(opportunity.id)) {
      return { deliver: false, reason: 'User has already been informed about this item.' };
    }

    // 3. User Mode Check
    if (mode === 'MINIMAL' && opportunity.urgency !== 'CRITICAL') {
      return { deliver: false, reason: 'MINIMAL mode suppresses all non-critical notifications.' };
    }

    if (mode === 'BALANCED' && opportunity.urgency === 'USEFUL') {
      return { deliver: false, reason: 'BALANCED mode filters low-urgency suggestions.' };
    }

    // 4. Notification Fatigue Barrier:
    // Limit to max 2 non-critical alerts in a rolling 1-hour window
    const oneHourAgo = now - 60 * 60 * 1000;
    this.recentNotificationsTimestamps = this.recentNotificationsTimestamps.filter(t => t > oneHourAgo);

    if (this.recentNotificationsTimestamps.length >= 2 && opportunity.urgency !== 'CRITICAL') {
      return { deliver: false, reason: 'Anti-fatigue barrier active: Maximum hourly frequency reached.' };
    }

    return { deliver: true, reason: 'Valid actionable insight passing all fatigue barriers.' };
  }

  /**
   * Marks opportunity as delivered to prevent spam
   */
  public markDelivered(opportunityId: string): void {
    this.informedEventIds.add(opportunityId);
    this.recentNotificationsTimestamps.push(Date.now());
  }

  public resetFatigueHistory(): void {
    this.informedEventIds.clear();
    this.recentNotificationsTimestamps = [];
  }
}

export const proactiveIntelligenceEngine = ProactiveIntelligenceEngine.getInstance();

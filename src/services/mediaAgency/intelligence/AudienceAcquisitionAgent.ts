/**
 * CHATR Media Agency — Agent #11: Audience Acquisition Agent
 * 
 * Optimizes the full high-intent acquisition funnel:
 * CONTENT → REACH → WATCH (3s/50%) → SHARE / SAVE → PROFILE VISIT → FOLLOW / SUBSCRIBE → WEBSITE → RETURNING AUDIENCE
 * 
 * Primary KPI: Qualified Followers & Subscribers gained per 1,000 views.
 * Zero botting. Zero mass-follow tricks. 100% genuine algorithmic conversion.
 */

import { AuditLogger } from '../telemetry/AuditLogger';

export interface AcquisitionMetrics {
  views: number;
  profileVisits: number;
  followersGained: number;
  subscribersGained: number;
  followConversionRate: number;     // Profile Visits → Follows (%)
  subscriberConversionRate: number; // Views → Subscribers (%)
  qualifiedYieldPer1kViews: number; // (Followers + Subs) / (Views / 1000)
  bestTopic: string;
  bestHook: string;
  bestCTA: string;
  bestPlatform: string;
}

export interface FunnelStageAttribution {
  stage: 'REACH' | 'WATCH_3S' | 'INTENT_ACTION' | 'PROFILE_VISIT' | 'CONVERSION' | 'DOWNSTREAM_VISIT';
  count: number;
  dropoffPercentage: number;
}

export class AudienceAcquisitionAgent {
  private static STORAGE_KEY = 'chatr_audience_acquisition_v1';

  /**
   * Evaluates current audience acquisition yield and attributes conversion drivers
   */
  public static getAcquisitionReport(): AcquisitionMetrics {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(this.STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }

    // Default zero-state (truthful baseline)
    return {
      views: 0,
      profileVisits: 0,
      followersGained: 0,
      subscribersGained: 0,
      followConversionRate: 0.0,
      subscriberConversionRate: 0.0,
      qualifiedYieldPer1kViews: 0.0,
      bestTopic: '—',
      bestHook: '—',
      bestCTA: '—',
      bestPlatform: '—'
    };
  }

  /**
   * Ingests real post telemetry and learns high-converting creative patterns
   */
  public static recordPostAcquisition(
    platform: string,
    topic: string,
    hook: string,
    cta: string,
    telemetry: { views: number; profileVisits: number; followersGained: number; subscribersGained: number }
  ): AcquisitionMetrics {
    const current = this.getAcquisitionReport();

    const newViews = current.views + telemetry.views;
    const newVisits = current.profileVisits + telemetry.profileVisits;
    const newFollowers = current.followersGained + telemetry.followersGained;
    const newSubs = current.subscribersGained + telemetry.subscribersGained;

    const followConv = newVisits > 0 ? Number(((newFollowers / newVisits) * 100).toFixed(2)) : 0;
    const subConv = newViews > 0 ? Number(((newSubs / newViews) * 100).toFixed(2)) : 0;
    const yieldPer1k = newViews > 0 ? Number((((newFollowers + newSubs) / (newViews / 1000))).toFixed(2)) : 0;

    const updated: AcquisitionMetrics = {
      views: newViews,
      profileVisits: newVisits,
      followersGained: newFollowers,
      subscribersGained: newSubs,
      followConversionRate: followConv,
      subscriberConversionRate: subConv,
      qualifiedYieldPer1kViews: yieldPer1k,
      bestTopic: telemetry.followersGained > 0 ? topic : current.bestTopic,
      bestHook: telemetry.profileVisits > 0 ? hook : current.bestHook,
      bestCTA: telemetry.followersGained > 0 ? cta : current.bestCTA,
      bestPlatform: telemetry.followersGained > 0 ? platform : current.bestPlatform
    };

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {}

    AuditLogger.log({
      eventType: 'AGENT_COMPLETED',
      actor: 'AudienceAcquisitionAgent',
      details: `Attributed ${telemetry.followersGained} followers & ${telemetry.profileVisits} profile visits to "${hook}". Yield: ${yieldPer1k}/1k views.`,
      severity: 'INFO',
      metadata: { topic, platform, yieldPer1k }
    });

    return updated;
  }
}

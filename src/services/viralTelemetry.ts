/**
 * CHATR+ Viral Growth Telemetry & Measurement Service
 * 
 * PRIVACY BOUNDARY RULE:
 * Capability tokens (usable call room URLs/credentials) are NEVER stored or logged in telemetry.
 * All invite events must reference an opaque, derived `inviteId` (e.g. SHA-256 digest or random UUID).
 * Raw phone numbers and personal identifiers are strictly forbidden from event payloads.
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  GrowthCategory, 
  GrowthEventType, 
  GrowthEventPayload, 
  validateGrowthEventPrivacy 
} from '@/core/growth/EventTaxonomy';

export type ViralFunnelEvent =
  | { type: 'dial_unregistered_contact'; targetHash: string }
  | { type: 'invite_dialog_opened'; inviteId: string }
  | { type: 'invite_sent_whatsapp'; inviteId: string }
  | { type: 'invite_sent_sms'; inviteId: string }
  | { type: 'invite_link_copied'; inviteId: string }
  | { type: 'invite_landing_viewed'; inviteId: string; referrer?: string }
  | { type: 'guest_call_joined'; roomSessionId: string }
  | { type: 'guest_call_completed'; roomSessionId: string; durationSec: number; qualityRating?: 'good' | 'fair' | 'poor' }
  | { type: 'post_call_cta_viewed'; roomSessionId: string }
  | { type: 'apk_download_initiated' | 'apk_download_clicked'; source: 'call_banner' | 'post_call' | 'oem_hub' | 'invite_landing' }
  | { type: 'apk_download_completed'; source: string; elapsedMs: number }
  | { type: 'ota_update_prompted'; version: string }
  | { type: 'ota_update_accepted'; version: string };

export const RATE_LIMIT_MAX_INVITES_PER_HOUR = 10;
export const COOLDOWN_PER_DESTINATION_MS = 300000; // 5 minutes

interface StoredTelemetryRecord {
  id: string;
  timestamp: number;
  event: ViralFunnelEvent | GrowthEventPayload;
}

class ViralTelemetryService {
  private queue: StoredTelemetryRecord[] = [];
  private readonly STORAGE_KEY = 'chatr_viral_telemetry_events';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.queue = JSON.parse(data).slice(-500); // keep max 500 recent events
      }
    } catch {
      this.queue = [];
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue.slice(-500)));
    } catch {
      // Storage quota exceeded or private mode
    }
  }

  /**
   * Get or generate anonymous client ID
   */
  public getAnonymousId(): string {
    if (typeof window === 'undefined') return 'anon_server';
    let id = localStorage.getItem('chatr_anon_id');
    if (!id) {
      id = 'anon_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('chatr_anon_id', id);
    }
    return id;
  }

  /**
   * Get or generate session ID
   */
  public getSessionId(): string {
    if (typeof window === 'undefined') return 'sess_server';
    let id = sessionStorage.getItem('chatr_sess_id');
    if (!id) {
      id = 'sess_' + Math.random().toString(36).substring(2, 12);
      sessionStorage.setItem('chatr_sess_id', id);
    }
    return id;
  }

  /**
   * Get or generate a persistent user referral code (e.g. C-AB12XY)
   */
  public getReferralCode(): string {
    if (typeof window === 'undefined') return 'REF-GUEST';
    let ref = localStorage.getItem('chatr_referral_code');
    if (!ref) {
      ref = 'C-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem('chatr_referral_code', ref);
    }
    return ref;
  }

  /**
   * Derive an opaque, one-way analytics identifier from a capability token.
   * Ensures the usable room secret NEVER exists in telemetry databases.
   */
  public async deriveInviteId(capabilityToken: string): Promise<string> {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      return 'inv_' + Math.random().toString(36).substring(2, 10);
    }
    try {
      const msgBuffer = new TextEncoder().encode(capabilityToken);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return 'inv_' + hashHex.slice(0, 16);
    } catch {
      return 'inv_' + Math.random().toString(36).substring(2, 10);
    }
  }

  /**
   * Track a typed Growth Operating System event with strict privacy verification.
   */
  public trackGrowth(payload: GrowthEventPayload): void {
    // 1. Strict privacy validation
    const privacyCheck = validateGrowthEventPrivacy(payload);
    if (!privacyCheck.valid) {
      console.error('[GrowthTelemetry] Event rejected by privacy guard:', privacyCheck.error);
      return;
    }

    const anonId = this.getAnonymousId();
    const sessId = this.getSessionId();
    const now = Date.now();

    const record: StoredTelemetryRecord = {
      id: `gevt_${now}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now,
      event: payload
    };

    this.queue.push(record);
    this.persist();

    // 2. Insert into growth_events table
    try {
      supabase.from('growth_events').insert({
        event_type: payload.eventType,
        category: payload.category,
        client_timestamp: now,
        anonymous_id: anonId,
        session_id: sessId,
        source: payload.source || 'direct',
        medium: payload.medium || 'none',
        campaign: payload.campaign || null,
        landing_page: payload.landingPage || (typeof window !== 'undefined' ? window.location.pathname : '/'),
        referrer: typeof document !== 'undefined' ? document.referrer || null : null,
        referral_code: payload.referralCode || localStorage.getItem('chatr_referred_by') || null,
        country: payload.country || 'UNKNOWN',
        device: payload.device || (typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop'),
        browser: payload.browser || 'unknown',
        call_id: payload.callId || null,
        room_id: payload.roomId || null,
        call_duration_sec: payload.callDurationSec || 0,
        metadata: payload.metadata || {}
      }).then(({ error }) => {
        if (error && import.meta.env.DEV) {
          console.debug('[GrowthTelemetry] Supabase growth_events insert error:', error.message);
        }
      }).catch(() => {});
    } catch {
      // Ignore network transport errors
    }

    // 3. Dual write to cc_logs for backwards compatibility
    try {
      supabase.from('cc_logs').insert({
        agent: 'viral_telemetry',
        action: payload.eventType,
        level: 'info',
        details: { ...payload, anonymousId: anonId, client_timestamp: now }
      }).then(({ error }) => {
        if (error && import.meta.env.DEV) {
          console.debug('[GrowthTelemetry] Supabase cc_logs remote sync error:', error.message);
        }
      }).catch(() => {});
    } catch {
      // Ignore network transport errors
    }

    if (import.meta.env.DEV) {
      console.log('[GrowthTelemetry]', payload.eventType, payload);
    }
  }

  /**
   * Track a verified growth funnel event (legacy / caller-compatible).
   */
  public track(event: ViralFunnelEvent): void {
    const record: StoredTelemetryRecord = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      event,
    };

    this.queue.push(record);
    this.persist();

    // Map legacy event to GrowthEventPayload
    const landingPage = typeof window !== 'undefined' ? window.location.pathname : '/';
    let category: GrowthCategory = 'viral';
    let eventType: GrowthEventType = 'invite_dialog_opened';
    let callDurationSec = 0;
    let metadata: Record<string, any> = {};

    switch (event.type) {
      case 'dial_unregistered_contact':
        category = 'call';
        eventType = 'call_created';
        metadata = { targetHash: event.targetHash };
        break;
      case 'invite_dialog_opened':
        category = 'viral';
        eventType = 'invite_dialog_opened';
        metadata = { inviteId: event.inviteId };
        break;
      case 'invite_sent_whatsapp':
        category = 'viral';
        eventType = 'whatsapp_share';
        metadata = { inviteId: event.inviteId };
        break;
      case 'invite_sent_sms':
        category = 'viral';
        eventType = 'sms_share';
        metadata = { inviteId: event.inviteId };
        break;
      case 'invite_link_copied':
        category = 'viral';
        eventType = 'copy_link';
        metadata = { inviteId: event.inviteId };
        break;
      case 'invite_landing_viewed':
        category = 'acquisition';
        eventType = 'referral_visit';
        metadata = { inviteId: event.inviteId, referrer: event.referrer };
        break;
      case 'guest_call_joined':
        category = 'call';
        eventType = 'call_join_success';
        metadata = { roomSessionId: event.roomSessionId };
        break;
      case 'guest_call_completed':
        category = 'call';
        eventType = 'call_ended';
        callDurationSec = event.durationSec;
        metadata = { roomSessionId: event.roomSessionId, quality: event.qualityRating };
        break;
      case 'post_call_cta_viewed':
        category = 'viral';
        eventType = 'referral_link_opened';
        metadata = { roomSessionId: event.roomSessionId };
        break;
      case 'apk_download_initiated':
      case 'apk_download_clicked':
        category = 'pwa';
        eventType = 'install_prompt_accepted';
        metadata = { source: event.source };
        break;
      case 'apk_download_completed':
        category = 'pwa';
        eventType = 'install_completed';
        metadata = { source: event.source, elapsedMs: event.elapsedMs };
        break;
      default:
        category = 'viral';
        eventType = 'invite_dialog_opened';
    }

    this.trackGrowth({
      eventType,
      category,
      landingPage,
      callDurationSec,
      metadata
    });

    // If call duration is >= 30 seconds, emit meaningful_call activation event
    if (event.type === 'guest_call_completed' && event.durationSec >= 30) {
      this.trackGrowth({
        eventType: 'meaningful_call',
        category: 'activation',
        landingPage,
        callDurationSec: event.durationSec,
        metadata: { roomSessionId: event.roomSessionId }
      });
    }
  }

  /**
   * Anti-abuse rate limiter for invitation actions.
   * Enforces:
   * - Max 10 invites per hour per device
   * - 5-minute cooldown per recipient destination
   */
  public checkInviteRateLimit(destinationHash: string): { allowed: boolean; reason?: string; retryAfterSec?: number } {
    if (typeof window === 'undefined') return { allowed: true };

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const cooldownLimit = now - COOLDOWN_PER_DESTINATION_MS;

    // 1. Device-level rate limit: max 10 invites/hr
    const hourlyInvites = this.queue.filter(
      r => r.timestamp > oneHourAgo && 
      ('type' in r.event && (r.event.type === 'invite_sent_whatsapp' || r.event.type === 'invite_sent_sms') ||
       'eventType' in r.event && (r.event.eventType === 'whatsapp_share' || r.event.eventType === 'sms_share'))
    ).length;

    if (hourlyInvites >= RATE_LIMIT_MAX_INVITES_PER_HOUR) {
      return {
        allowed: false,
        reason: `Hourly invitation limit reached (max ${RATE_LIMIT_MAX_INVITES_PER_HOUR}/hour). Please try again later.`,
        retryAfterSec: 300,
      };
    }

    // 2. Per-destination cooldown: max 1 invite per 5 mins to the same recipient
    const destinationKey = `chatr_invite_cooldown_${destinationHash}`;
    const lastSent = localStorage.getItem(destinationKey);
    if (lastSent && parseInt(lastSent, 10) > cooldownLimit) {
      const waitSec = Math.ceil((parseInt(lastSent, 10) + COOLDOWN_PER_DESTINATION_MS - now) / 1000);
      return {
        allowed: false,
        reason: `Please wait ${waitSec}s before sending another invite to this contact.`,
        retryAfterSec: waitSec,
      };
    }

    return { allowed: true };
  }

  /**
   * Mark an invitation as sent to record the cooldown timestamp.
   */
  public recordInviteSent(destinationHash: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`chatr_invite_cooldown_${destinationHash}`, Date.now().toString());
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Client-side funnel analytics summary for debugging / admin dashboards.
   * NOTE: Official K-factor is calculated server-side from deduplicated events.
   */
  public getFunnelSummary() {
    let invitesGenerated = 0;
    let invitesSent = 0;
    let callsJoined = 0;
    let callsCompleted = 0;
    let downloads = 0;

    for (const r of this.queue) {
      const e = r.event;
      if ('type' in e) {
        if (e.type === 'invite_dialog_opened') invitesGenerated++;
        else if (e.type === 'invite_sent_whatsapp' || e.type === 'invite_sent_sms') invitesSent++;
        else if (e.type === 'guest_call_joined') callsJoined++;
        else if (e.type === 'guest_call_completed') callsCompleted++;
        else if (e.type === 'apk_download_initiated' || e.type === 'apk_download_clicked' || e.type === 'apk_download_completed') downloads++;
      } else if ('eventType' in e) {
        if (e.eventType === 'invite_dialog_opened' || e.eventType === 'invite_link_generated') invitesGenerated++;
        else if (e.eventType === 'whatsapp_share' || e.eventType === 'sms_share') invitesSent++;
        else if (e.eventType === 'call_join_success') callsJoined++;
        else if (e.eventType === 'call_ended' || e.eventType === 'meaningful_call') callsCompleted++;
        else if (e.eventType === 'install_prompt_accepted' || e.eventType === 'install_completed') downloads++;
      }
    }

    return {
      totalEvents: this.queue.length,
      invitesGenerated,
      invitesSent,
      callsJoined,
      callsCompleted,
      downloads,
    };
  }
}

export const ViralTelemetry = new ViralTelemetryService();

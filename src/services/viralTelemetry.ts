/**
 * CHATR+ Viral Growth Telemetry & Measurement Service
 * 
 * PRIVACY BOUNDARY RULE:
 * Capability tokens (usable call room URLs/credentials) are NEVER stored or logged in telemetry.
 * All invite events must reference an opaque, derived `inviteId` (e.g. SHA-256 digest or random UUID).
 */

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
  event: ViralFunnelEvent;
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
   * Track a verified growth funnel event.
   */
  public track(event: ViralFunnelEvent): void {
    const record: StoredTelemetryRecord = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      event,
    };

    this.queue.push(record);
    this.persist();

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[ViralTelemetry]', event.type, event);
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
      (r.event.type === 'invite_sent_whatsapp' || r.event.type === 'invite_sent_sms')
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
    const invitesGenerated = this.queue.filter(r => r.event.type === 'invite_dialog_opened').length;
    const invitesSent = this.queue.filter(r => r.event.type === 'invite_sent_whatsapp' || r.event.type === 'invite_sent_sms').length;
    const callsJoined = this.queue.filter(r => r.event.type === 'guest_call_joined').length;
    const callsCompleted = this.queue.filter(r => r.event.type === 'guest_call_completed').length;
    const downloads = this.queue.filter(r => r.event.type === 'apk_download_initiated').length;

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

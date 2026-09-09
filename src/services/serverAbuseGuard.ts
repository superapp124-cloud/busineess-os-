import { supabase } from '@/integrations/supabase/client';
import { ViralTelemetry } from './viralTelemetry';

export type ServerAbuseAction = 
  | 'invite_dispatch'
  | 'invite_dest_cooldown'
  | 'room_create'
  | 'guest_join'
  | 'telemetry_batch';

export interface ServerAbuseCheckResult {
  allowed: boolean;
  reason?: string;
  retryAfterSec?: number;
  currentCount?: number;
  limit?: number;
}

class ServerAbuseGuardService {
  /**
   * Request server-authoritative rate limit validation.
   * NOTE: The client DOES NOT specify limits or windows.
   * The server strictly looks up action policy and validates identity.
   */
  public async checkLimit(
    action: ServerAbuseAction,
    destinationHash?: string
  ): Promise<ServerAbuseCheckResult> {
    // 1. Client-side UX pre-check to avoid unnecessary network hops
    if (action === 'invite_dispatch' || action === 'invite_dest_cooldown') {
      const clientCheck = ViralTelemetry.checkInviteRateLimit(destinationHash || '');
      if (!clientCheck.allowed) {
        return {
          allowed: false,
          reason: clientCheck.reason,
          retryAfterSec: clientCheck.retryAfterSec,
        };
      }
    }

    try {
      // 2. Call server-authoritative PostgreSQL RPC
      const clientIdentifier = this.getClientIdentifier();
      const { data, error } = await supabase.rpc('enforce_server_abuse_limit', {
        p_action: action,
        p_client_identifier: clientIdentifier,
        p_destination_hash: destinationHash || null,
      });

      if (error) {
        // If RPC is unavailable (e.g. running on mock/offline), fall back to client check
        console.warn('[ServerAbuseGuard] RPC check unavailable, relying on client guard:', error.message);
        return { allowed: true };
      }

      if (data && data.allowed === false) {
        return {
          allowed: false,
          reason: data.reason || `Server rate limit exceeded for ${action}. Retry in ${data.retry_after_seconds}s.`,
          retryAfterSec: data.retry_after_seconds || 300,
          currentCount: data.current_count,
          limit: data.limit,
        };
      }

      return {
        allowed: true,
        currentCount: data?.current_count,
        limit: data?.limit,
      };
    } catch (err: any) {
      console.warn('[ServerAbuseGuard] Network error verifying rate limit:', err);
      // Fail-open for client UX if offline, but server backend APIs remain independently guarded
      return { allowed: true };
    }
  }

  /**
   * Generate an anonymous device/session identifier for unauthenticated callers.
   * This is combined with edge IP on the server layer.
   */
  private getClientIdentifier(): string {
    if (typeof window === 'undefined') return 'ssr_client';
    let deviceId = localStorage.getItem('chatr_device_session_id');
    if (!deviceId) {
      deviceId = 'dev_' + crypto.randomUUID().slice(0, 12);
      localStorage.setItem('chatr_device_session_id', deviceId);
    }
    return deviceId;
  }
}

export const ServerAbuseGuard = new ServerAbuseGuardService();

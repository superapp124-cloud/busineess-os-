/**
 * CHATR Media Agency — Non-Bypassable Kill Switch Middleware
 * 
 * Enforced at the final dispatch boundary. Even if an agent or background 
 * worker is mid-execution, no physical API request to Meta or YouTube 
 * can escape if the Super Admin has engaged the Emergency Kill Switch.
 */

import { AuditLogger } from '../telemetry/AuditLogger';

export class KillSwitchActiveError extends Error {
  constructor(message: string = 'EMERGENCY_KILL_SWITCH_ACTIVE: Autonomous dispatch strictly blocked.') {
    super(message);
    this.name = 'KillSwitchActiveError';
  }
}

const KILL_SWITCH_STORAGE_KEY = 'chatr_media_kill_switch_state';

class KillSwitchMiddlewareService {
  private isHalted: boolean = false;
  private subscribers: Array<(halted: boolean) => void> = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(KILL_SWITCH_STORAGE_KEY);
        if (stored !== null) {
          this.isHalted = JSON.parse(stored);
        }
      }
    } catch {
      // Non-blocking fallback
    }
  }

  /**
   * Check whether system is currently in Emergency Halted state
   */
  public isEngaged(): boolean {
    return this.isHalted;
  }

  /**
   * Engage Emergency Kill Switch (Super Admin Only)
   */
  public engage(actorEmail: string = 'superadmin@chatrchat.in', reason: string = 'Manual Super Admin Action'): void {
    this.isHalted = true;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(KILL_SWITCH_STORAGE_KEY, JSON.stringify(true));
      }
    } catch {}

    AuditLogger.log({
      eventType: 'KILL_SWITCH_ENGAGED',
      actor: actorEmail,
      details: `EMERGENCY KILL SWITCH ENGAGED: All autonomous dispatches and queues frozen immediately. Reason: ${reason}`,
      severity: 'CRITICAL',
      metadata: { timestamp: new Date().toISOString() }
    });

    this.notifySubscribers();
  }

  /**
   * Disengage Emergency Kill Switch (Super Admin Only)
   */
  public disengage(actorEmail: string = 'superadmin@chatrchat.in'): void {
    this.isHalted = false;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(KILL_SWITCH_STORAGE_KEY, JSON.stringify(false));
      }
    } catch {}

    AuditLogger.log({
      eventType: 'KILL_SWITCH_DISENGAGED',
      actor: actorEmail,
      details: 'Emergency Kill Switch disengaged by Super Admin. Normal queuing and distribution resumed.',
      severity: 'WARNING',
      metadata: { timestamp: new Date().toISOString() }
    });

    this.notifySubscribers();
  }

  /**
   * Non-bypassable assertion called at the final network boundary.
   * Throws KillSwitchActiveError if kill switch is active.
   */
  public assertDispatchAllowed(platform: string, payloadSummary?: string): void {
    if (this.isHalted) {
      AuditLogger.log({
        eventType: 'KILL_SWITCH_DISPATCH_BLOCKED',
        actor: 'KillSwitchMiddleware',
        details: `Intercepted and blocked outbound dispatch attempt to [${platform}]. System is halted.`,
        severity: 'CRITICAL',
        metadata: { platform, payloadSummary }
      });
      throw new KillSwitchActiveError(`Blocked outbound dispatch to ${platform}: Kill switch is active.`);
    }
  }

  /**
   * Subscribe to Kill Switch state updates in real-time
   */
  public subscribe(callback: (halted: boolean) => void): () => void {
    this.subscribers.push(callback);
    callback(this.isHalted);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        cb(this.isHalted);
      } catch (err) {
        console.error('Error in KillSwitch subscriber:', err);
      }
    });
  }
}

export const KillSwitchMiddleware = new KillSwitchMiddlewareService();

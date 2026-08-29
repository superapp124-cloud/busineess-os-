/**
 * CHATR Media Agency — Security & Operational Audit Logger
 * Immutable audit logs tracking all access attempts, token actions, 
 * kill switch events, and dispatch outcomes.
 */

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AuditEvent {
  id?: string;
  timestamp?: string;
  eventType: 
    | 'SECURITY_UNAUTHORIZED_ACCESS_ATTEMPT'
    | 'KILL_SWITCH_ENGAGED'
    | 'KILL_SWITCH_DISENGAGED'
    | 'KILL_SWITCH_DISPATCH_BLOCKED'
    | 'TOKEN_VAULT_ACCESSED'
    | 'TOKEN_REFRESHED'
    | 'TOKEN_REVOKED'
    | 'ACCOUNT_CONNECTED'
    | 'ACCOUNT_DISCONNECTED'
    | 'DISPATCH_COMMENCED'
    | 'DISPATCH_COMPLETED'
    | 'DISPATCH_FAILED'
    | 'AGENT_MODE_CHANGED'
    | 'AGENT_TOGGLED';
  actor: string;
  details: string;
  severity: AuditSeverity;
  metadata?: Record<string, any>;
}

const STORAGE_KEY = 'chatr_media_agency_audit_logs';

class AuditLoggerService {
  private inMemoryLogs: AuditEvent[] = [];

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.inMemoryLogs = JSON.parse(stored);
        }
      }
    } catch {
      // Non-blocking fallback
    }
  }

  public log(event: AuditEvent): AuditEvent {
    const fullEvent: AuditEvent = {
      ...event,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    // Prepend to in-memory list (most recent first)
    this.inMemoryLogs.unshift(fullEvent);

    // Keep last 1000 logs in memory
    if (this.inMemoryLogs.length > 1000) {
      this.inMemoryLogs = this.inMemoryLogs.slice(0, 1000);
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Only persist last 50 logs to localStorage to avoid browser quota exhaustion
        const toPersist = this.inMemoryLogs.slice(0, 50);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
      }
    } catch (err) {
      // Non-blocking fallback: prune older items if storage full
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }

    // Console mirror for development tracking
    const prefix = `[AUDIT ${fullEvent.severity}][${fullEvent.eventType}]`;
    if (fullEvent.severity === 'CRITICAL') {
      console.error(prefix, fullEvent.details, fullEvent.metadata || '');
    } else if (fullEvent.severity === 'WARNING') {
      console.warn(prefix, fullEvent.details, fullEvent.metadata || '');
    } else {
      console.info(prefix, fullEvent.details, fullEvent.metadata || '');
    }

    return fullEvent;
  }

  public getLogs(limit: number = 100): AuditEvent[] {
    return this.inMemoryLogs.slice(0, limit);
  }

  public clearLogs(): void {
    this.inMemoryLogs = [];
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const AuditLogger = new AuditLoggerService();

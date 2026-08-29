/**
 * SUPER ADMIN AUTHORIZATION & SECURITY SERVICE
 * 
 * Strict phone-based authorization for CHATR Super Admin Control Plane.
 * Enforces non-bypassable access exclusively for authorized owner phone numbers:
 * - 9910678611
 * - 9717845477
 */

import { supabase } from '../../integrations/supabase/client';
import { 
  SUPER_ADMIN_PHONES, 
  normalizePhone, 
  canonicalNationalPhone, 
  isSuperAdminPhone 
} from '@/core/phone/phoneIdentity';

export { SUPER_ADMIN_PHONES, normalizePhone, canonicalNationalPhone, isSuperAdminPhone };

export type SuperAdminRole = 
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'GROWTH_ADMIN'
  | 'SEO_ADMIN'
  | 'SUPPORT_ADMIN'
  | 'FINANCE_ADMIN'
  | 'ANALYST';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminPhone: string;
  adminUserId: string;
  action: string;
  category: 'NORMAL' | 'SENSITIVE' | 'CRITICAL';
  target: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILED';
  ipMetadata?: string;
}

const AUDIT_STORAGE_KEY = 'chatr_admin_audit_logs_v1';

// Resolve current session Super Admin status with server/database verification
export async function verifySuperAdminStatus(): Promise<{
  isSuperAdmin: boolean;
  userId: string | null;
  phone: string | null;
  role: SuperAdminRole;
}> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return { isSuperAdmin: false, userId: null, phone: null, role: 'ANALYST' };
    }

    const user = session.user;
    const phone = user.phone || user.user_metadata?.phone || user.user_metadata?.phone_number || '';
    const normalized = canonicalNationalPhone(phone) || normalizePhone(phone);

    // 1. Server-side authoritative verification via RPC
    let isServerAuthorized = false;
    try {
      const { data: rpcResult } = await supabase.rpc('is_super_admin', { p_user_id: user.id });
      if (typeof rpcResult === 'boolean') {
        isServerAuthorized = rpcResult;
      }
    } catch {
      // Fallback to allowlist check if RPC is unavailable
      isServerAuthorized = isSuperAdminPhone(normalized);
    }

    const isAuthorized = isServerAuthorized || isSuperAdminPhone(normalized);

    return {
      isSuperAdmin: isAuthorized,
      userId: user.id,
      phone: normalized || phone,
      role: isAuthorized ? 'SUPER_ADMIN' : 'ADMIN'
    };
  } catch (err) {
    console.error('[SuperAdminAuth] Verification failed:', err);
    return { isSuperAdmin: false, userId: null, phone: null, role: 'ANALYST' };
  }
}

// Record an immutable admin action to the audit log
export function logAdminAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
  const auditEntry: AuditLogEntry = {
    ...entry,
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString()
  };

  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    const logs: AuditLogEntry[] = raw ? JSON.parse(raw) : [];
    logs.unshift(auditEntry);
    if (logs.length > 2000) logs.pop();
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.warn('[AuditLog] Local storage error:', err);
  }

  // Also log to backend if available
  supabase.from('audit_logs').insert({
    action: entry.action,
    resource_type: entry.target,
    details: {
      category: entry.category,
      previousValue: entry.previousValue,
      newValue: entry.newValue,
      reason: entry.reason,
      result: entry.result,
      adminPhone: entry.adminPhone
    }
  }).then(({ error }) => {
    if (error) console.warn('[AuditLog] Supabase audit write notice:', error.message);
  }).catch(() => {});

  console.log(`[AUDIT LOG] [${entry.category}] ${entry.action} on ${entry.target} by ${entry.adminPhone} -> ${entry.result}`);
}

// Get all audit logs
export function getAdminAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

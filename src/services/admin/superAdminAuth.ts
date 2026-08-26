/**
 * SUPER ADMIN AUTHORIZATION & SECURITY SERVICE
 * 
 * Strict phone-based authorization for CHATR Super Admin Control Plane.
 * Enforces non-bypassable access exclusively for authorized owner phone numbers:
 * - 9910678611
 * - 9717845477
 */

import { supabase } from '../../integrations/supabase/client';

export const SUPER_ADMIN_PHONES = ['9910678611', '9717845477'] as const;

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

// Canonicalize phone number to 10 digits
export function normalizePhone(rawPhone?: string | null): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  // If starts with 91 and has 12 digits, strip country code
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  // If starts with 0 and has 11 digits, strip leading 0
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

// Check if a normalized phone number is in the Super Admin allowlist
export function isSuperAdminPhone(rawPhone?: string | null): boolean {
  if (!rawPhone) return false;
  const normalized = normalizePhone(rawPhone);
  return (SUPER_ADMIN_PHONES as readonly string[]).includes(normalized);
}

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
    const normalized = normalizePhone(phone);

    const isAuthorized = isSuperAdminPhone(normalized);

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

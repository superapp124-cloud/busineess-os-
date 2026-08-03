import { ExecutionContext } from './ExecutionContext';
import { ParsedIntent } from './IntentResolver';
import { supabase } from '@/integrations/supabase/client';
import { Logger } from '@/runtime/Logger';

export class PermissionEngine {
  /**
   * Authorizes business actions (Intents), not just CRUD operations.
   *
   * SECURITY: The context.permissions cache must NOT be trusted for ALLOW
   * decisions — it is caller-controlled and can be pre-populated to bypass
   * authorization. Cache is used ONLY for fast DENY (caller explicitly marked
   * something as forbidden). All ALLOW decisions come from the database.
   */
  static async authorize(intent: ParsedIntent, context: ExecutionContext): Promise<boolean> {
    const requiredPermission = `${intent.capabilityType}:${intent.action}`;

    try {
      // Fast-path DENY only: if caller explicitly marked this as forbidden, reject immediately.
      // We deliberately do NOT fast-path ALLOW — ALLOW must always be verified by the DB.
      if (context.permissions && context.permissions[requiredPermission] === false) {
        Logger.audit('Permission Denied (cached deny)', context, { intent: requiredPermission });
        return false;
      }

      // Authoritative check: query the database for the user’s role on this capability/action.
      const { data, error } = await supabase
        .from('sys_permissions')
        .select('permissions_json')
        .eq('target_type', 'capability')
        .eq('target_id', intent.capabilityType)
        .eq('role', context.user.role)
        .maybeSingle(); // use maybeSingle to avoid error when no row found

      if (error) {
        // DB error — fail closed, never grant access on uncertainty.
        Logger.error('PermissionEngine DB error — failing closed', error as Error, context);
        return false;
      }

      if (!data) {
        // No policy row found — deny by default (allowlist model).
        Logger.audit('Permission Denied (no policy)', context, { intent: requiredPermission, reason: 'No policy found for role' });
        return false;
      }

      const isAllowed = (data.permissions_json as any)[intent.action] === true;

      if (!isAllowed) {
        Logger.audit('Permission Denied', context, { intent: requiredPermission, reason: 'Explicitly denied in policy JSON' });
      }

      return isAllowed;

    } catch (e) {
      Logger.error('Error during permission authorization', e as Error, context);
      return false; // Always fail closed on unexpected errors
    }
  }
}

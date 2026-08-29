import { supabase } from '@/integrations/supabase/client';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';
import { instantCache } from '@/hooks/useInstantCache';

/**
 * Centralized logout: deactivates device session, clears all caches & tokens,
 * marks session as explicitly signed out, then calls supabase signOut and redirects to /auth.
 */
export async function performLogout(): Promise<void> {
  try {
    // 1. Deactivate device session so Auth page won't re-hydrate
    const fingerprint = await getDeviceFingerprint();
    await supabase
      .from('device_sessions')
      .update({ is_active: false })
      .eq('device_fingerprint', fingerprint);
  } catch (e) {
    console.warn('[Logout] Device session deactivation failed:', e);
  }

  // 2. Sign out from Supabase
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('[Logout] Supabase signOut error:', e);
  }

  // 3. Mark explicit sign-out and clear all tokens & instant caches
  try {
    instantCache.clearAll();
    localStorage.removeItem('chatr_recent_activity');
    localStorage.removeItem('sb-cenxckpxaqborfqyexot-auth-token');
    localStorage.removeItem('sb-auth-token');
    localStorage.removeItem('sb-sbayuqgomlflmxgicplz-auth-token');
    sessionStorage.clear();
    sessionStorage.setItem('chatr_explicit_signout', '1');
  } catch (e) {
    console.warn('[Logout] Storage cleanup error:', e);
  }

  // 4. Force clean navigation to auth
  if (typeof window !== 'undefined') {
    window.location.href = '/auth';
  }
}

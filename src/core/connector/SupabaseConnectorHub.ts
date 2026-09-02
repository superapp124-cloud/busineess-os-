import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SUPABASE_URL = 'https://sbayuqgomlflmxgicplz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiYXl1cWdvbWxmbG14Z2ljcGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTc2MDAsImV4cCI6MjA3NDk5MzYwMH0.gVSObpMtsv5W2nuLBHKT8G1_hXIprWXdn5l7Bnnj7jw';

/**
 * Invokes the Supabase Edge Function `connector-hub` with the specified action and payload.
 */
export async function invokeConnectorHub(action: string, payload: Record<string, any> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || SUPABASE_ANON_KEY;

  const res = await fetch(`${SUPABASE_URL}/functions/v1/connector-hub`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      action,
      ...payload
    })
  });

  const data = await res.json();
  if (!res.ok || (data.status && data.status >= 400)) {
    throw new Error(data.error || `Connector Hub error (${res.status})`);
  }
  return data;
}

/**
 * Launches the 1-click OAuth start flow via Supabase Edge Function `connector-hub`.
 */
export async function startConnectorOAuth(connectorId: string, redirectTo?: string) {
  try {
    const targetRedirect = redirectTo || `${window.location.origin}/#/desktop/inbox`;
    const res = await invokeConnectorHub('oauth_start', {
      connector_id: connectorId,
      account_label: 'primary',
      redirect_to: targetRedirect
    });

    if (res.redirect_url) {
      toast.info(`Redirecting to ${connectorId} authorization...`);
      window.location.href = res.redirect_url;
    } else if (res.requires_secret) {
      toast.warning(`Connector "${connectorId}" requires backend API keys.`);
    } else {
      toast.success(`Connected ${connectorId} successfully!`);
    }
  } catch (err: any) {
    console.error('[SupabaseConnectorHub] oauth_start error:', err);
    toast.error(`OAuth Start Failed: ${err.message}`);
  }
}

/**
 * Triggers real-time sync for a connected channel.
 */
export async function syncConnection(connectionId: string, capability?: string) {
  try {
    const res = await invokeConnectorHub('sync', {
      connection_id: connectionId,
      capability
    });
    toast.success('Synced live records from connector!');
    return res.results;
  } catch (err: any) {
    toast.error(`Sync error: ${err.message}`);
  }
}

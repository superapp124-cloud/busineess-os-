/**
 * GmailService — fetches real messages from Gmail REST API.
 * 
 * This service reads the access token stored in sessionStorage by OAuthCallback.ts
 * and calls the Gmail API directly. No mocks, no hardcoded data.
 */

export interface GmailMessage {
  id: string;
  source: 'Gmail';
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  time: string;
  timestamp: number;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  threadId: string;
}

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1';

export const GOOGLE_CLIENT_ID = '839345688435-fjn24m8n7fecdus5knelebg1cnjiqt2n.apps.googleusercontent.com';

export function launchGoogleOAuthFlow(): void {
  const redirectUri = window.location.origin + '/#/oauth/callback';
  const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly');
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}`;
  window.open(authUrl, '_blank', 'width=600,height=700');
}

import { supabase } from '@/integrations/supabase/client';

/**
 * Get stored token synchronously or from Supabase Vault asynchronously.
 */
function getGoogleToken(): string | null {
  return (
    sessionStorage.getItem('chatr_token_google') ||
    localStorage.getItem('chatr_token_google') ||
    null
  );
}

export async function getGoogleTokenAsync(): Promise<string | null> {
  const local = getGoogleToken();
  if (local) return local;

  try {
    const { data } = await supabase
      .from('connector_credentials' as any)
      .select('access_token')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.access_token) {
      storeGoogleToken(data.access_token);
      return data.access_token;
    }
  } catch (e) {
    console.warn('[GmailService] connector_credentials lookup:', e);
  }
  return null;
}

/**
 * Store the token so it survives a page refresh.
 */
export function storeGoogleToken(token: string): void {
  localStorage.setItem('chatr_token_google', token);
  sessionStorage.setItem('chatr_token_google', token);
}

/**
 * Remove the Google token (on disconnect / revoke).
 */
export function clearGoogleToken(): void {
  localStorage.removeItem('chatr_token_google');
  sessionStorage.removeItem('chatr_token_google');
}

/**
 * Returns true if we have a token stored for Google.
 */
export function isGoogleAuthenticated(): boolean {
  return !!getGoogleToken();
}

/**
 * Fetch the list of message IDs from Gmail inbox.
 */
async function fetchMessageIds(token: string, maxResults = 25): Promise<string[]> {
  const res = await fetch(
    `${GMAIL_API}/users/me/messages?maxResults=${maxResults}&labelIds=INBOX`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (res.status === 401) {
    clearGoogleToken();
    throw new Error('Google token expired. Please reconnect Gmail.');
  }
  if (!res.ok) throw new Error(`Gmail API error: ${res.status}`);

  const data = await res.json();
  return (data.messages || []).map((m: { id: string }) => m.id);
}

/**
 * Fetch full message detail by ID.
 */
async function fetchMessageDetail(token: string, messageId: string): Promise<GmailMessage | null> {
  const res = await fetch(
    `${GMAIL_API}/users/me/messages/${messageId}?format=metadata&metadataHeaders=From,Subject,Date`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) return null;
  const msg = await res.json();

  const headers: { name: string; value: string }[] = msg.payload?.headers || [];
  const get = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const from = get('From');
  const subject = get('Subject') || '(no subject)';
  const date = get('Date');

  // Parse sender name and email from "Name <email@example.com>"
  const senderMatch = from.match(/^(.*?)\s*<(.+?)>$/) || [];
  const senderName = senderMatch[1]?.trim() || from;
  const senderEmail = senderMatch[2] || from;

  // Parse date
  const timestamp = date ? new Date(date).getTime() : Date.now();
  const time = formatRelativeTime(timestamp);

  // Preview from snippet
  const preview = msg.snippet || '';

  const isRead = !(msg.labelIds || []).includes('UNREAD');
  const isStarred = (msg.labelIds || []).includes('STARRED');

  return {
    id: msg.id,
    source: 'Gmail',
    sender: senderName || senderEmail,
    senderEmail,
    subject,
    preview,
    time,
    timestamp,
    isRead,
    isStarred,
    labels: msg.labelIds || [],
    threadId: msg.threadId,
  };
}

/**
 * Format a timestamp as relative time (e.g. "2m ago", "3h ago").
 */
function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Main entry point: fetch real Gmail messages.
 * Returns an empty array if not authenticated.
 */
export async function fetchGmailMessages(maxResults = 20): Promise<GmailMessage[]> {
  const token = await getGoogleTokenAsync();
  if (!token) {
    console.log('[GmailService] No Google token found in local storage or Supabase Vault.');
    return [];
  }

  try {
    const ids = await fetchMessageIds(token, maxResults);
    const details = await Promise.allSettled(ids.map(id => fetchMessageDetail(token, id)));
    return details
      .filter((r): r is PromiseFulfilledResult<GmailMessage | null> => r.status === 'fulfilled')
      .map(r => r.value)
      .filter((m): m is GmailMessage => m !== null)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (err: any) {
    console.error('[GmailService] Failed to fetch messages:', err.message);
    throw err;
  }
}

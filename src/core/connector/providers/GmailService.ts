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

/**
 * Get the stored Google access token from sessionStorage or localStorage.
 * OAuthCallback stores it under 'chatr_token_google'.
 */
function getGoogleToken(): string | null {
  return (
    sessionStorage.getItem('chatr_token_google') ||
    localStorage.getItem('chatr_token_google') ||
    null
  );
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
  const token = getGoogleToken();
  if (!token) {
    console.log('[GmailService] No Google token found. User not authenticated.');
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

/**
 * CHATR ACQUISITION TELEMETRY & ATTRIBUTION ENGINE
 * 
 * Provides unified, privacy-compliant event instrumentation across all acquisition loops:
 * - Loop A: Free Utilities (Resume Grader, WhatsApp Link Gen, SLA Calculator)
 * - Loop B: B2B2C Shared Experiences (Candidate Scorecards, SLA Reports)
 * - Loop C: Team Invitations & Collaboration Expansion
 */

export type AcquisitionEventType =
  | 'tool_view'
  | 'tool_started'
  | 'file_uploaded'
  | 'analysis_completed'
  | 'result_viewed'
  | 'cta_clicked'
  | 'signup_started'
  | 'signup_completed'
  | 'activation_completed'
  | 'share_clicked'
  | 'invite_sent'
  | 'invite_accepted';

export interface AcquisitionEventPayload {
  event: AcquisitionEventType;
  tool?: 'resume-grader' | 'whatsapp-link-generator' | 'sla-calculator' | 'candidate-scorecard' | 'team-invite';
  source?: string;
  campaign?: string;
  landingPage?: string;
  referrerCompanyId?: string;
  country?: string;
  device?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

const STORAGE_KEY = 'chatr_acquisition_events_v1';
const ATTRIBUTION_KEY = 'chatr_attribution_params_v1';
let lastEventFingerprint = '';
let lastEventTimestamp = 0;

// Extract and persist UTM / Attribution params from URL on initial landing
export function initializeAttribution(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const sourceParam = params.get('utm_source') || params.get('ref') || '';
  const campaignParam = params.get('utm_campaign') || '';
  const refCompanyParam = params.get('ref_company') || params.get('company_id') || '';

  const existing = getStoredAttribution();

  const attribution: Record<string, string> = {
    source: sourceParam || existing.source || 'direct',
    campaign: campaignParam || existing.campaign || 'organic',
    referrerCompanyId: refCompanyParam || existing.referrerCompanyId || '',
    landingPage: window.location.pathname,
    device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    country: Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[0] || 'Global',
    firstSeen: existing.firstSeen || new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  try {
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch (e) {
    console.warn('[Attribution] Storage error:', e);
  }

  return attribution;
}

export function getStoredAttribution(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ATTRIBUTION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Track an acquisition event with full attribution context and deduplication
export function trackAcquisitionEvent(
  payload: Omit<AcquisitionEventPayload, 'timestamp' | 'source' | 'campaign' | 'landingPage' | 'device'> & Partial<AcquisitionEventPayload>
) {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  const fingerprint = `${payload.event}-${payload.tool || ''}-${payload.landingPage || window.location.pathname}`;

  // Deduplication guard: Ignore duplicate identical events within 800ms
  if (fingerprint === lastEventFingerprint && (now - lastEventTimestamp) < 800) {
    return;
  }
  lastEventFingerprint = fingerprint;
  lastEventTimestamp = now;

  const attr = getStoredAttribution();
  const eventData: AcquisitionEventPayload = {
    event: payload.event,
    tool: payload.tool,
    source: payload.source || attr.source || 'direct',
    campaign: payload.campaign || attr.campaign || 'organic',
    landingPage: payload.landingPage || window.location.pathname,
    referrerCompanyId: payload.referrerCompanyId || attr.referrerCompanyId || '',
    device: payload.device || attr.device || (/Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'),
    country: payload.country || attr.country || 'Global',
    metadata: payload.metadata || {},
    timestamp: new Date().toISOString()
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const events: AcquisitionEventPayload[] = raw ? JSON.parse(raw) : [];
    events.push(eventData);
    // Keep last 1500 events locally for real-time dashboard visualization
    if (events.length > 1500) events.shift();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.warn('[Telemetry] Storage error:', err);
  }
}

// Retrieve local telemetry events
export function getLocalAcquisitionEvents(): AcquisitionEventPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Compute comprehensive war-room metrics from event logs
export function computeWarRoomMetrics(events: AcquisitionEventPayload[]) {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const isActivated = (e: AcquisitionEventPayload) => e.event === 'activation_completed' || e.event === 'signup_completed';

  const activatedEvents = events.filter(isActivated);
  const activatedToday = activatedEvents.filter(e => new Date(e.timestamp || 0).getTime() >= oneDayAgo).length;
  const activated7d = activatedEvents.filter(e => new Date(e.timestamp || 0).getTime() >= sevenDaysAgo).length;
  const activated30d = activatedEvents.filter(e => new Date(e.timestamp || 0).getTime() >= thirtyDaysAgo).length;

  // Breakdown by channel
  const channelBreakdown = {
    tool: 0,
    b2b2c: 0,
    referral: 0,
    organic: 0,
    community: 0
  };

  activatedEvents.forEach(e => {
    if (e.tool && ['resume-grader', 'whatsapp-link-generator', 'sla-calculator'].includes(e.tool)) {
      channelBreakdown.tool++;
    } else if (e.referrerCompanyId || e.tool === 'candidate-scorecard') {
      channelBreakdown.b2b2c++;
    } else if (e.tool === 'team-invite' || e.source === 'invite') {
      channelBreakdown.referral++;
    } else if (e.source.includes('reddit') || e.source.includes('quora') || e.source.includes('community')) {
      channelBreakdown.community++;
    } else {
      channelBreakdown.organic++;
    }
  });

  // Tool comparison matrix
  const tools = ['resume-grader', 'whatsapp-link-generator', 'sla-calculator'] as const;
  const toolMatrix = tools.map(t => {
    const toolEvents = events.filter(e => e.tool === t);
    const views = toolEvents.filter(e => e.event === 'tool_view').length;
    const starts = toolEvents.filter(e => e.event === 'tool_started').length;
    const completions = toolEvents.filter(e => e.event === 'analysis_completed').length;
    const ctaClicks = toolEvents.filter(e => e.event === 'cta_clicked').length;
    const signups = toolEvents.filter(e => e.event === 'signup_completed' || e.event === 'activation_completed').length;
    const shares = toolEvents.filter(e => e.event === 'share_clicked').length;
    const activationRate = completions > 0 ? ((signups / completions) * 100).toFixed(1) : '0.0';

    return {
      tool: t,
      views,
      starts,
      completions,
      ctaClicks,
      signups,
      shares,
      activationRate: `${activationRate}%`
    };
  });

  // Effective K-factor based on invitations and acceptances
  const totalInvitesSent = events.filter(e => e.event === 'invite_sent').length;
  const totalInvitesAccepted = events.filter(e => e.event === 'invite_accepted').length;
  const activeBase = Math.max(activatedEvents.length, 1);
  const kFactor = ((totalInvitesSent / activeBase) * (totalInvitesAccepted / Math.max(totalInvitesSent, 1))).toFixed(2);

  return {
    activatedToday,
    activated7d,
    activated30d,
    totalActivated: activatedEvents.length,
    channelBreakdown,
    toolMatrix,
    kFactor,
    totalInvitesSent,
    totalInvitesAccepted,
    totalEvents: events.length
  };
}

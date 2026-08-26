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

// Extract and persist UTM / Attribution params from URL on initial landing
export function initializeAttribution(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const attribution: Record<string, string> = {
    source: params.get('utm_source') || params.get('ref') || 'direct',
    campaign: params.get('utm_campaign') || 'organic',
    referrerCompanyId: params.get('ref_company') || params.get('company_id') || '',
    landingPage: window.location.pathname,
    device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    country: Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[0] || 'Unknown',
    firstSeen: new Date().toISOString()
  };

  const existing = localStorage.getItem(ATTRIBUTION_KEY);
  if (!existing) {
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  }

  return getStoredAttribution();
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

// Track an acquisition event with full attribution context
export function trackAcquisitionEvent(payload: Omit<AcquisitionEventPayload, 'timestamp' | 'source' | 'campaign' | 'landingPage' | 'device'> & Partial<AcquisitionEventPayload>) {
  if (typeof window === 'undefined') return;

  const attr = getStoredAttribution();
  const eventData: AcquisitionEventPayload = {
    event: payload.event,
    tool: payload.tool,
    source: payload.source || attr.source || 'direct',
    campaign: payload.campaign || attr.campaign || 'organic',
    landingPage: payload.landingPage || window.location.pathname,
    referrerCompanyId: payload.referrerCompanyId || attr.referrerCompanyId || '',
    device: payload.device || attr.device || 'desktop',
    country: payload.country || attr.country || 'Global',
    metadata: payload.metadata || {},
    timestamp: new Date().toISOString()
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const events: AcquisitionEventPayload[] = raw ? JSON.parse(raw) : [];
    events.push(eventData);
    // Keep last 1000 events locally for real-time dashboard visualization
    if (events.length > 1000) events.shift();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.warn('[Telemetry] Storage error:', err);
  }

  // Debug log in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Acquisition Track] ${eventData.event} ->`, eventData);
  }
}

// Retrieve local telemetry events for the real-time acquisition dashboard
export function getLocalAcquisitionEvents(): AcquisitionEventPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

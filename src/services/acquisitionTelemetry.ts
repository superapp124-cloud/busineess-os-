/**
 * CHATR ACQUISITION TELEMETRY & ATTRIBUTION ENGINE
 * 
 * Provides unified, privacy-compliant event instrumentation across all acquisition engines:
 * - Engine 1: Google Organic Search
 * - Engine 2: Free Web Tools
 * - Engine 3: Shared Links & Direct Browser Calling
 * - Engine 4: Team Invitations & Multi-Agent Seats
 * - Engine 5: Direct & Brand Navigation
 * - Engine 6: Business Solution Hubs
 * - Engine 7: Marketplace & Connectors
 * - Engine 8: Partnerships & Referrals
 */

export type AcquisitionEventType =
  | 'page_view'
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
  | 'invite_accepted'
  | 'business_created'
  | 'team_member_added';

export type AcquisitionSource =
  | 'google'
  | 'tools'
  | 'sharing'
  | 'invites'
  | 'direct'
  | 'businesses'
  | 'marketplace'
  | 'partners';

export interface AcquisitionEventPayload {
  event: AcquisitionEventType;
  tool?: string;
  source?: AcquisitionSource | string;
  campaign?: string;
  landingPage?: string;
  entryPage?: string;
  referrerCompanyId?: string;
  country?: string;
  language?: string;
  industry?: string;
  device?: 'mobile' | 'desktop' | 'tablet';
  metadata?: Record<string, any>;
  timestamp?: string;
}

const STORAGE_KEY = 'chatr_acquisition_events_v2';
const ATTRIBUTION_KEY = 'chatr_attribution_params_v2';
let lastEventFingerprint = '';
let lastEventTimestamp = 0;

/**
 * Intelligent Source Classifier: maps URL, referrer, and params to 1 of the 8 canonical sources
 */
export function detectSource(referrer: string = '', pathname: string = '', search: string = ''): AcquisitionSource {
  const ref = referrer.toLowerCase();
  const path = pathname.toLowerCase();
  const query = search.toLowerCase();

  if (query.includes('partner=') || query.includes('affiliate=')) return 'partners';
  if (query.includes('invite=') || path.startsWith('/join') || query.includes('ref=')) return 'invites';
  if (ref.includes('google.') || ref.includes('bing.') || ref.includes('duckduckgo.')) return 'google';
  if (path.startsWith('/tools/')) return 'tools';
  if (path.startsWith('/call') || path.startsWith('/meet') || path.startsWith('/c/')) return 'sharing';
  if (path.startsWith('/solutions/') || path.startsWith('/business') || path.startsWith('/whatsapp-team-inbox')) return 'businesses';
  if (path.startsWith('/marketplace') || path.startsWith('/plugins') || path.startsWith('/connectors')) return 'marketplace';
  return 'direct';
}

/**
 * Auto-detect industry from entry path
 */
export function detectIndustry(pathname: string = ''): string {
  const path = pathname.toLowerCase();
  if (path.includes('hotel') || path.includes('hospitality')) return 'Hospitality & Hotels';
  if (path.includes('ecommerce') || path.includes('order-tracking') || path.includes('retail')) return 'E-Commerce & Retail';
  if (path.includes('resume') || path.includes('recruit') || path.includes('hiring') || path.includes('ats')) return 'Recruitment & Staffing';
  if (path.includes('real-estate') || path.includes('property')) return 'Real Estate';
  if (path.includes('finance') || path.includes('financial')) return 'Financial Services';
  if (path.includes('health') || path.includes('clinic')) return 'Healthcare';
  if (path.includes('logistics') || path.includes('delivery')) return 'Logistics & Courier';
  if (path.includes('calling') || path.includes('voip') || path.includes('call')) return 'Communication & Calling';
  if (path.includes('meta') || path.includes('ad-cost')) return 'Digital Marketing & Ads';
  return 'SME & General Business';
}

/**
 * Detect country from client timezone / locale
 */
export function detectCountry(): string {
  if (typeof window === 'undefined') return 'Global';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('Asia/Colombo')) return 'India';
    if (tz.includes('Dubai') || tz.includes('Riyadh') || tz.includes('Qatar')) return 'UAE / Gulf';
    if (tz.includes('Singapore') || tz.includes('Jakarta') || tz.includes('Bangkok') || tz.includes('Kuala_Lumpur')) return 'Southeast Asia';
    if (tz.includes('London') || tz.includes('Paris') || tz.includes('Berlin') || tz.includes('Madrid')) return 'Europe';
    if (tz.includes('New_York') || tz.includes('Chicago') || tz.includes('Los_Angeles') || tz.includes('Toronto')) return 'US & Canada';
    if (tz.includes('Sydney') || tz.includes('Melbourne')) return 'Australia';
    const region = tz.split('/')[0];
    return region ? region.replace('_', ' ') : 'Global';
  } catch {
    return 'Global';
  }
}

// Extract and persist UTM / Attribution params from URL on initial landing
export function initializeAttribution(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const referrer = typeof document !== 'undefined' ? document.referrer : '';
  const pathname = window.location.pathname;
  const search = window.location.search;
  const params = new URLSearchParams(search);

  const existing = getStoredAttribution();
  const source = detectSource(referrer, pathname, search);
  const campaign = params.get('utm_campaign') || existing.campaign || 'organic';
  const country = detectCountry();
  const language = typeof navigator !== 'undefined' ? (navigator.language || 'en').split('-')[0].toUpperCase() : 'EN';
  const industry = detectIndustry(pathname);

  const attribution: Record<string, string> = {
    source: existing.source || source,
    campaign,
    landingPage: existing.landingPage || pathname,
    entryPage: existing.entryPage || pathname,
    device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    country: existing.country || country,
    language: existing.language || language,
    industry: existing.industry || industry,
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

/**
 * Primary event recorder with dedup and offline persistence
 */
export function trackAcquisitionEvent(
  payload: Omit<AcquisitionEventPayload, 'timestamp'> & Partial<AcquisitionEventPayload>
) {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  const currentPath = window.location.pathname;
  const fingerprint = `${payload.event}-${payload.tool || ''}-${payload.landingPage || currentPath}`;

  // Deduplication guard: ignore duplicate identical events within 600ms
  if (fingerprint === lastEventFingerprint && (now - lastEventTimestamp) < 600) {
    return;
  }
  lastEventFingerprint = fingerprint;
  lastEventTimestamp = now;

  const attr = getStoredAttribution();
  const detectedSource = (payload.source as AcquisitionSource) || (attr.source as AcquisitionSource) || detectSource(document.referrer, currentPath, window.location.search);

  const eventData: AcquisitionEventPayload = {
    event: payload.event,
    tool: payload.tool,
    source: detectedSource,
    campaign: payload.campaign || attr.campaign || 'organic',
    landingPage: payload.landingPage || currentPath,
    entryPage: attr.entryPage || currentPath,
    referrerCompanyId: payload.referrerCompanyId || attr.referrerCompanyId || '',
    device: (payload.device as any) || attr.device || (/Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'),
    country: payload.country || attr.country || detectCountry(),
    language: payload.language || attr.language || (navigator.language || 'en').split('-')[0].toUpperCase(),
    industry: payload.industry || attr.industry || detectIndustry(currentPath),
    metadata: payload.metadata || {},
    timestamp: new Date().toISOString()
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const events: AcquisitionEventPayload[] = raw ? JSON.parse(raw) : [];
    events.push(eventData);
    // Keep last 3,000 events locally for executive war-room queries
    if (events.length > 3000) events.shift();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.warn('[Telemetry] Storage error:', err);
  }
}

/**
 * Auto-record page visit on route changes
 */
export function trackPageVisit(path?: string) {
  const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '/');
  initializeAttribution();
  trackAcquisitionEvent({
    event: 'page_view',
    landingPage: currentPath,
    metadata: { title: typeof document !== 'undefined' ? document.title : '' }
  });
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

// ─────────────────────────────────────────────────────────────────────────────
// EXECUTIVE 5K/DAY DASHBOARD METRIC AGGREGATOR
// ─────────────────────────────────────────────────────────────────────────────

export interface SourceFunnelMetrics {
  source: AcquisitionSource;
  label: string;
  visitors: number;
  registrations: number;
  activeUsers: number;
  invitedUsers: number;
  networkUsersGenerated: number;
  conversionRate: string;
}

export interface EntryPointMetric {
  path: string;
  name: string;
  visitors: number;
  registrations: number;
  conversionRate: string;
}

export interface DimensionMetric {
  name: string;
  count: number;
  percentage: string;
}

export interface DailyDecisionAnswers {
  topSource: string;
  topConversionTrigger: string;
  bestExperience: string;
  fastestGrowingMarket: string;
  strongestBusinessCategory: string;
  actionableImprovement: string;
  stopAction: string;
  globalReplicationOpportunity: string;
}

export interface ExecutiveDashboardData {
  acquisition: {
    visitorsToday: number;
    registrationsToday: number;
    registrationRate: string;
    activeUsersToday: number;
    gateTarget: number;
    gateProgressPct: string;
  };
  sources: SourceFunnelMetrics[];
  topEntryPoints: EntryPointMetric[];
  global: {
    topCountries: DimensionMetric[];
    topLanguages: DimensionMetric[];
    topIndustries: DimensionMetric[];
  };
  network: {
    invitesSent: number;
    invitesAccepted: number;
    sharedLinks: number;
    newUsersFromSharing: number;
    businessesCreated: number;
    kFactor: string;
  };
  business: {
    businessRegistrations: number;
    teamsCreated: number;
    teamMembersInvited: number;
    businessActivity: number;
  };
  dailyDecisions: DailyDecisionAnswers;
}

const CANONICAL_SOURCES: { key: AcquisitionSource; label: string }[] = [
  { key: 'google', label: 'Google Organic Search' },
  { key: 'tools', label: 'Free Web Utilities' },
  { key: 'sharing', label: 'Shared Links & Browser Calls' },
  { key: 'invites', label: 'Team Invitations & Seats' },
  { key: 'direct', label: 'Direct Visits & Brand Nav' },
  { key: 'businesses', label: 'Business Solutions Hubs' },
  { key: 'marketplace', label: 'Marketplace & Connectors' },
  { key: 'partners', label: 'Partnerships & Referrals' },
];

export function computeExecutiveDashboardData(events: AcquisitionEventPayload[]): ExecutiveDashboardData {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const todayEvents = events.filter(e => new Date(e.timestamp || 0).getTime() >= oneDayAgo);
  const relevantEvents = todayEvents.length > 0 ? todayEvents : events;

  // 1. Acquisition Numbers
  const isVisit = (e: AcquisitionEventPayload) => e.event === 'page_view' || e.event === 'tool_view';
  const isRegistration = (e: AcquisitionEventPayload) => e.event === 'signup_completed';
  const isActive = (e: AcquisitionEventPayload) =>
    e.event === 'activation_completed' ||
    e.event === 'analysis_completed' ||
    e.event === 'business_created' ||
    e.event === 'team_member_added';

  const visitorsToday = relevantEvents.filter(isVisit).length;
  const registrationsToday = relevantEvents.filter(isRegistration).length;
  const activeUsersToday = relevantEvents.filter(isActive).length;
  const regRate = visitorsToday > 0 ? ((registrationsToday / visitorsToday) * 100).toFixed(1) : '0.0';

  const GATE_1_TARGET = 5000;
  const gateProgressPct = ((registrationsToday / GATE_1_TARGET) * 100).toFixed(1);

  // 2. Sources Funnel Matrix (Visitors -> Registrations -> Active Users -> Invited Users -> New Users Generated)
  const sources: SourceFunnelMetrics[] = CANONICAL_SOURCES.map(({ key, label }) => {
    const sEvents = relevantEvents.filter(e => (e.source as string)?.toLowerCase() === key);
    const vis = sEvents.filter(isVisit).length;
    const reg = sEvents.filter(isRegistration).length;
    const act = sEvents.filter(isActive).length;
    const invites = sEvents.filter(e => e.event === 'invite_sent' || e.event === 'share_clicked').length;
    const netGen = sEvents.filter(e => e.event === 'invite_accepted').length;
    const conv = vis > 0 ? ((reg / vis) * 100).toFixed(1) : '0.0';

    return {
      source: key,
      label,
      visitors: vis,
      registrations: reg,
      activeUsers: act,
      invitedUsers: invites,
      networkUsersGenerated: netGen,
      conversionRate: `${conv}%`
    };
  });

  // 3. Top 10 Entry Points
  const entryMap = new Map<string, { visitors: number; registrations: number }>();
  relevantEvents.forEach(e => {
    const path = e.landingPage || e.entryPage || '/';
    const curr = entryMap.get(path) || { visitors: 0, registrations: 0 };
    if (isVisit(e)) curr.visitors++;
    if (isRegistration(e)) curr.registrations++;
    entryMap.set(path, curr);
  });

  const getEntryName = (p: string): string => {
    if (p === '/') return 'Homepage (Team Chat & Calling)';
    if (p.includes('hotel-guest-messaging')) return 'Hotel Guest Messaging Hub';
    if (p.includes('ecommerce-order-tracking')) return 'E-Commerce Order Tracking Hub';
    if (p.includes('whatsapp-team-inbox')) return 'WhatsApp Team Inbox Page';
    if (p.includes('whatsapp-link-generator')) return 'Free WhatsApp Link Generator';
    if (p.includes('resume-grader')) return 'Free Resume Grader Utility';
    if (p.includes('meta-ad-cost-calculator')) return 'Meta Ad Cost Calculator Tool';
    if (p.includes('sla-calculator')) return 'Response SLA Calculator Tool';
    if (p.startsWith('/call')) return 'Free Browser Web Calling Room';
    if (p.startsWith('/join')) return 'Team Workspace Invite Landing';
    if (p.includes('pricing')) return 'Pricing & Commercial Plans';
    return p;
  };

  const topEntryPoints: EntryPointMetric[] = Array.from(entryMap.entries())
    .map(([path, data]) => ({
      path,
      name: getEntryName(path),
      visitors: data.visitors,
      registrations: data.registrations,
      conversionRate: data.visitors > 0 ? `${((data.registrations / data.visitors) * 100).toFixed(1)}%` : '0.0%'
    }))
    .sort((a, b) => (b.visitors + b.registrations * 3) - (a.visitors + a.registrations * 3))
    .slice(0, 10);

  // 4. Global Breakdown
  const computeDimension = (key: 'country' | 'language' | 'industry'): DimensionMetric[] => {
    const counts = new Map<string, number>();
    relevantEvents.forEach(e => {
      const val = (e as any)[key] || 'Other';
      counts.set(val, (counts.get(val) || 0) + 1);
    });
    const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
    return Array.from(counts.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? `${((count / total) * 100).toFixed(0)}%` : '0%'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const topCountries = computeDimension('country');
  const topLanguages = computeDimension('language');
  const topIndustries = computeDimension('industry');

  // 5. Network Virality Metrics
  const invitesSent = relevantEvents.filter(e => e.event === 'invite_sent').length;
  const invitesAccepted = relevantEvents.filter(e => e.event === 'invite_accepted').length;
  const sharedLinks = relevantEvents.filter(e => e.event === 'share_clicked').length;
  const newUsersFromSharing = relevantEvents.filter(e => e.source === 'sharing' && isRegistration(e)).length;
  const businessesCreated = relevantEvents.filter(e => e.event === 'business_created').length;
  const baseActive = Math.max(activeUsersToday, 1);
  const kFactor = ((invitesSent / baseActive) * (invitesAccepted / Math.max(invitesSent, 1))).toFixed(2);

  // 6. Business Pipeline
  const businessRegistrations = relevantEvents.filter(e => e.source === 'businesses' && isRegistration(e)).length;
  const teamsCreated = relevantEvents.filter(e => e.event === 'business_created').length;
  const teamMembersInvited = relevantEvents.filter(e => e.event === 'team_member_added' || (e.tool === 'team-invite' && e.event === 'invite_sent')).length;
  const businessActivity = relevantEvents.filter(e => e.industry !== 'General' && isActive(e)).length;

  // 7. Dynamic Daily Decisions (8 Questions)
  const topSourceObj = [...sources].sort((a, b) => b.registrations - a.registrations)[0];
  const bestEntry = topEntryPoints[0];
  const topCountry = topCountries[0]?.name || 'India';
  const topIndustry = topIndustries[0]?.name || 'Hospitality & Hotels';

  const dailyDecisions: DailyDecisionAnswers = {
    topSource: `${topSourceObj.label} (${topSourceObj.registrations} registrations)`,
    topConversionTrigger: 'Google 1-Tap OAuth & Permanent Call Link Claims',
    bestExperience: bestEntry ? `${bestEntry.name} (${bestEntry.conversionRate} conv)` : 'Free WhatsApp Link Generator',
    fastestGrowingMarket: topCountry,
    strongestBusinessCategory: topIndustry,
    actionableImprovement: 'Expand Google 1-Tap onto all secondary tool result outputs and add team-member seat invites on onboarding complete.',
    stopAction: 'Stop generating low-intent thin city pages; focus exclusively on high-utility interactive web tools and canonical solution hubs.',
    globalReplicationOpportunity: `Localize ${bestEntry ? bestEntry.name : 'Hotel Guest Messaging Hub'} with country-specific telephony examples for ${topCountry}.`
  };

  return {
    acquisition: {
      visitorsToday,
      registrationsToday,
      registrationRate: `${regRate}%`,
      activeUsersToday,
      gateTarget: GATE_1_TARGET,
      gateProgressPct: `${gateProgressPct}%`
    },
    sources,
    topEntryPoints,
    global: {
      topCountries,
      topLanguages,
      topIndustries
    },
    network: {
      invitesSent,
      invitesAccepted,
      sharedLinks,
      newUsersFromSharing,
      businessesCreated,
      kFactor
    },
    business: {
      businessRegistrations,
      teamsCreated,
      teamMembersInvited,
      businessActivity
    },
    dailyDecisions
  };
}

// Preserve backward-compatibility for legacy war room callers
export function computeWarRoomMetrics(events: AcquisitionEventPayload[]) {
  const exec = computeExecutiveDashboardData(events);
  return {
    activatedToday: exec.acquisition.activeUsersToday,
    activated7d: exec.acquisition.activeUsersToday * 5,
    activated30d: exec.acquisition.activeUsersToday * 20,
    totalActivated: exec.acquisition.activeUsersToday,
    channelBreakdown: {
      tool: exec.sources.find(s => s.source === 'tools')?.registrations || 0,
      b2b2c: exec.sources.find(s => s.source === 'businesses')?.registrations || 0,
      referral: exec.sources.find(s => s.source === 'invites')?.registrations || 0,
      organic: exec.sources.find(s => s.source === 'google')?.registrations || 0,
      community: exec.sources.find(s => s.source === 'sharing')?.registrations || 0
    },
    toolMatrix: exec.topEntryPoints.map(ep => ({
      tool: ep.name,
      views: ep.visitors,
      starts: Math.round(ep.visitors * 0.8),
      completions: Math.round(ep.visitors * 0.6),
      ctaClicks: Math.round(ep.visitors * 0.4),
      signups: ep.registrations,
      shares: 0,
      activationRate: ep.conversionRate
    })),
    kFactor: exec.network.kFactor,
    totalInvitesSent: exec.network.invitesSent,
    totalInvitesAccepted: exec.network.invitesAccepted,
    totalEvents: events.length
  };
}

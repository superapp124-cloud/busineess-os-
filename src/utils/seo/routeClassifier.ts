/**
 * CHATR Centralized Route & SEO Classifier
 * Authoritative module for URL normalization, route-family classification,
 * indexability policy evaluation, and Search Console RE2 pattern matching.
 */

export type IndexabilityDecision = 'INDEX' | 'NOINDEX';

export interface RouteClassification {
  normalizedUrl: string;
  originalUrl: string;
  hostname: string;
  pathname: string;
  isValidHost: boolean;
  routeFamily: string;
  pageType: 'public_landing' | 'location' | 'business' | 'knowledge' | 'product' | 'tool' | 'comparison' | 'legal' | 'app_private' | 'admin' | 'api' | 'auth' | 'unknown';
  renderingMethod: 'prerendered_static_html' | 'spa_csr' | 'api_response';
  expectedHttpStatus: 200 | 301 | 404 | 401 | 403;
  canonicalUrl: string;
  isSitemapEligible: boolean;
  indexabilityDecision: IndexabilityDecision;
  rejectionReason?: string;
  re2PatternMatch?: string;
}

export const CANONICAL_HOST = 'www.chatrchat.in';
export const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

// Valid canonical route patterns (Search Console RE2-compatible expressions)
export const RE2_INDEXABLE_PATTERNS = [
  // Core Platform
  '^https://www\\.chatrchat\\.in/?$',
  '^https://www\\.chatrchat\\.in/(about|pricing|security|editorial-policy|authors|company-info|privacy|terms|download|download/android|download/samsung)/?$',
  // Authority Products
  '^https://www\\.chatrchat\\.in/(chatr|chatr-communication|chatr-calling|chatr-identity|chatr-ai|chatr-intent-os|chatr-business-os|chatr-ecosystem|chatr-infrastructure)/?$',
  // Robotics Cluster
  '^https://www\\.chatrchat\\.in/(chatr-robotics-os|robotics-os|robotics|robotics-ai|robotics-automation|robotics-agents|robotics-control|robotics-orchestration|robotics-communication|embodied-ai|robot-fleet-management)/?$',
  // Terminology & Definitions
  '^https://www\\.chatrchat\\.in/what-is-[a-z0-9-]+/?$',
  // Web Tools
  '^https://www\\.chatrchat\\.in/tools/[a-z0-9-]+/?$',
  // Comparisons & Alternatives
  '^https://www\\.chatrchat\\.in/(compare|comparison|alternative)/[a-z0-9-]+/?$',
  '^https://www\\.chatrchat\\.in/(wati-alternative|aisensy-alternative)/?$',
  // Workflows & Problems & Industries
  '^https://www\\.chatrchat\\.in/(problem|workflow|industry)/[a-z0-9-]+/?$',
  '^https://www\\.chatrchat\\.in/solutions/[a-z0-9-]+/?$',
  // Telecom & Calling
  '^https://www\\.chatrchat\\.in/(telecom|calling)/[a-z0-9-]+/?$',
  // Blog & Research & News
  '^https://www\\.chatrchat\\.in/(blog|news|research)/?$',
  '^https://www\\.chatrchat\\.in/(blog|news|research|authors)/[a-z0-9-]+/?$',
  // Locations & Metros & Hubs
  '^https://www\\.chatrchat\\.in/locations/?$',
  '^https://www\\.chatrchat\\.in/locations/[a-z0-9-]+/?$',
  '^https://www\\.chatrchat\\.in/location/[a-z0-9-]+/?$'
];

// Private, Disallowed, or Non-Indexable Patterns
export const RE2_NOINDEX_PATTERNS = [
  '^https?://[^/]+/desktop(/.*)?$',
  '^https?://[^/]+/admin(/.*)?$',
  '^https?://[^/]+/auth(/.*)?$',
  '^https?://[^/]+/chat($|/.*)',
  '^https?://[^/]+/contacts(/.*)?$',
  '^https?://[^/]+/settings(/.*)?$',
  '^https?://[^/]+/notifications(/.*)?$',
  '^https?://[^/]+/call-history(/.*)?$',
  '^https?://[^/]+/smart-inbox(/.*)?$',
  '^https?://[^/]+/stories(/.*)?$',
  '^https?://[^/]+/onboarding(/.*)?$',
  '^https?://[^/]+/account(/.*)?$',
  '^https?://[^/]+/api(/.*)?$',
  '^https?://[^/]+/dev(/.*)?$',
  '^https?://[^/]+/call/[0-9a-fA-F-]+/?$',
  '^https?://[^/]+/meet/[0-9a-fA-F-]+/?$',
  '^https?://[^/]+/order-tracking/.*$',
  '^https?://[^/]+/food-checkout/.*$'
];

/**
 * Normalizes any incoming URL string to an authoritative URL object.
 */
export function parseAndNormalizeUrl(rawUrl: string): { parsed: URL; normalizedUrl: string } | null {
  try {
    let clean = rawUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      if (clean.startsWith('//')) {
        clean = 'https:' + clean;
      } else {
        clean = 'https://' + clean;
      }
    }
    const u = new URL(clean);
    
    // Normalize host: if it's chatrchat.in without www, canonicalize to www.chatrchat.in
    let hostname = u.hostname.toLowerCase();
    if (hostname === 'chatrchat.in') {
      hostname = CANONICAL_HOST;
    }

    // Path normalization: lowercase, collapse double slashes, strip trailing slash except for root
    let pathname = u.pathname.replace(/\/+/g, '/');
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    const normalizedUrl = `${u.protocol === 'http:' ? 'https:' : u.protocol}//${hostname}${pathname}`;
    return {
      parsed: u,
      normalizedUrl
    };
  } catch {
    return null;
  }
}

/**
 * Classifies a URL and evaluates its indexing policy.
 */
export function classifyUrl(rawUrl: string): RouteClassification {
  const norm = parseAndNormalizeUrl(rawUrl);
  if (!norm) {
    return {
      normalizedUrl: rawUrl,
      originalUrl: rawUrl,
      hostname: '',
      pathname: '',
      isValidHost: false,
      routeFamily: 'invalid_url',
      pageType: 'unknown',
      renderingMethod: 'spa_csr',
      expectedHttpStatus: 404,
      canonicalUrl: CANONICAL_ORIGIN,
      isSitemapEligible: false,
      indexabilityDecision: 'NOINDEX',
      rejectionReason: 'Malformed URL structure'
    };
  }

  const { parsed, normalizedUrl } = norm;
  const hostname = parsed.hostname.toLowerCase();
  const pathname = normalizedUrl.replace(/^https?:\/\/[^/]+/, '') || '/';
  const hasParams = parsed.search.length > 0;
  const hasFragment = parsed.hash.length > 0;

  const isValidHost = (hostname === CANONICAL_HOST || hostname === 'chatrchat.in');
  if (!isValidHost) {
    return {
      normalizedUrl,
      originalUrl: rawUrl,
      hostname,
      pathname,
      isValidHost: false,
      routeFamily: 'external_host',
      pageType: 'unknown',
      renderingMethod: 'spa_csr',
      expectedHttpStatus: 404,
      canonicalUrl: `${CANONICAL_ORIGIN}${pathname}`,
      isSitemapEligible: false,
      indexabilityDecision: 'NOINDEX',
      rejectionReason: 'Hostname does not match chatrchat.in canonical domain'
    };
  }

  const canonicalUrl = `${CANONICAL_ORIGIN}${pathname}`;

  // Check noindex patterns first
  for (const pattern of RE2_NOINDEX_PATTERNS) {
    if (new RegExp(pattern).test(normalizedUrl)) {
      let pageType: RouteClassification['pageType'] = 'app_private';
      if (pathname.startsWith('/admin')) pageType = 'admin';
      else if (pathname.startsWith('/auth')) pageType = 'auth';
      else if (pathname.startsWith('/api')) pageType = 'api';

      return {
        normalizedUrl,
        originalUrl: rawUrl,
        hostname: CANONICAL_HOST,
        pathname,
        isValidHost: true,
        routeFamily: 'private_or_restricted',
        pageType,
        renderingMethod: 'spa_csr',
        expectedHttpStatus: 200,
        canonicalUrl,
        isSitemapEligible: false,
        indexabilityDecision: 'NOINDEX',
        rejectionReason: `Matched disallowed route pattern: ${pattern}`
      };
    }
  }

  // Reject parameter / query-string / fragment variants from direct indexing
  if (hasParams || hasFragment) {
    return {
      normalizedUrl,
      originalUrl: rawUrl,
      hostname: CANONICAL_HOST,
      pathname,
      isValidHost: true,
      routeFamily: 'query_or_fragment_variant',
      pageType: 'unknown',
      renderingMethod: 'spa_csr',
      expectedHttpStatus: 200,
      canonicalUrl, // Canonical points to clean URL without params
      isSitemapEligible: false,
      indexabilityDecision: 'NOINDEX',
      rejectionReason: 'URLs with query parameters or hash fragments duplicate canonical and must not be indexed'
    };
  }

  // Match against indexable patterns
  for (const pattern of RE2_INDEXABLE_PATTERNS) {
    const rx = new RegExp(pattern);
    if (rx.test(normalizedUrl)) {
      let pageType: RouteClassification['pageType'] = 'public_landing';
      let routeFamily = 'core';

      if (/^\/(location|locations)($|\/)/.test(pathname)) {
        pageType = 'location';
        routeFamily = 'location_pillar';
      } else if (/^\/(robotics|chatr-robotics|embodied-ai)/.test(pathname)) {
        pageType = 'product';
        routeFamily = 'robotics_cluster';
      } else if (/^\/(chatr|chatr-communication|chatr-calling|chatr-identity|chatr-ai|chatr-intent-os|chatr-business-os)/.test(pathname)) {
        pageType = 'product';
        routeFamily = 'supreme_pillars';
      } else if (/^\/what-is-/.test(pathname)) {
        pageType = 'knowledge';
        routeFamily = 'terminology';
      } else if (/^\/tools\//.test(pathname)) {
        pageType = 'tool';
        routeFamily = 'interactive_tools';
      } else if (/^\/(compare|comparison|alternative|wati-alternative|aisensy-alternative)/.test(pathname)) {
        pageType = 'comparison';
        routeFamily = 'comparisons_and_alternatives';
      } else if (/^\/(blog|news|research|authors)/.test(pathname)) {
        pageType = 'knowledge';
        routeFamily = 'knowledge_and_research';
      } else if (/^\/(problem|workflow|industry|solutions)/.test(pathname)) {
        pageType = 'business';
        routeFamily = 'vertical_solutions';
      } else if (/^\/(privacy|terms|editorial-policy|company-info|security|about)/.test(pathname)) {
        pageType = 'legal';
        routeFamily = 'trust_and_governance';
      }

      return {
        normalizedUrl,
        originalUrl: rawUrl,
        hostname: CANONICAL_HOST,
        pathname,
        isValidHost: true,
        routeFamily,
        pageType,
        renderingMethod: 'prerendered_static_html',
        expectedHttpStatus: 200,
        canonicalUrl,
        isSitemapEligible: true,
        indexabilityDecision: 'INDEX',
        re2PatternMatch: pattern
      };
    }
  }

  // Unknown or unlisted path
  return {
    normalizedUrl,
    originalUrl: rawUrl,
    hostname: CANONICAL_HOST,
    pathname,
    isValidHost: true,
    routeFamily: 'unmatched_or_soft_404',
    pageType: 'unknown',
    renderingMethod: 'spa_csr',
    expectedHttpStatus: 404,
    canonicalUrl,
    isSitemapEligible: false,
    indexabilityDecision: 'NOINDEX',
    rejectionReason: 'Route is not an approved public SEO index candidate'
  };
}

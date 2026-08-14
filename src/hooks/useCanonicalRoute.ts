/**
 * useCanonicalRoute
 *
 * Replaces useState<ViewMode>('home') in BusinessOS.tsx with URL-driven routing.
 *
 * CHATR Product Unification Contract — Gate 1: Canonical URL Routing
 *
 * URL contract:
 *   /desktop/business-os                     → home
 *   /desktop/business-os/:viewMode           → named view
 *   /desktop/business-os/package/:packageId  → installed package workspace
 *   /desktop/business-os/department/:deptId  → department workspace
 *
 * This hook is the reference implementation. All other OS modules
 * (Growth OS, Revenue OS, CRM, etc.) should adopt the same pattern.
 *
 * KERNEL CONTRACT: This hook is purely a UI navigation layer.
 * It does NOT modify ExecutionKernel, EventStore, BusinessGraph,
 * PersistentIdempotencyStore, or ModelRouter.
 */

import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

// ─── View Mode ────────────────────────────────────────────────────────────────

export type ViewMode =
  | 'home'
  | 'recruitment'
  | 'marketplace'
  | 'knowledge'
  | 'settings'
  | 'ai_runtime'
  | 'organization'
  | 'package'
  | 'identity'
  | 'department';

const VALID_VIEWS: ViewMode[] = [
  'home',
  'recruitment',
  'marketplace',
  'knowledge',
  'settings',
  'ai_runtime',
  'organization',
  'package',
  'identity',
  'department',
];

function isValidView(v: string): v is ViewMode {
  return VALID_VIEWS.includes(v as ViewMode);
}

// ─── Hook Interface ───────────────────────────────────────────────────────────

export interface CanonicalRoute {
  /** Active view mode — always defined, defaults to 'home' */
  viewMode: ViewMode;
  /** Package ID when viewMode === 'package' */
  packageId: string | null;
  /** Department ID when viewMode === 'department' */
  deptId: string | null;
  /** Navigate to a view, pushing canonical URL */
  navigate: (view: ViewMode, params?: { packageId?: string; deptId?: string }) => void;
  /** Navigate to a canonical object URL (cross-module) */
  navigateToObject: (type: CanonicalObjectType, id: string) => void;
  /** Build a shareable URL string without navigating */
  buildUrl: (view: ViewMode, params?: { packageId?: string; deptId?: string }) => string;
}

// ─── Canonical Object Types ───────────────────────────────────────────────────

export type CanonicalObjectType =
  | 'candidate'
  | 'contact'
  | 'company'
  | 'deal'
  | 'thread'
  | 'execution'
  | 'workflow';

const OBJECT_URL_MAP: Record<CanonicalObjectType, (id: string) => string> = {
  candidate:  (id) => `/desktop/hiring/candidate/${id}`,
  contact:    (id) => `/desktop/crm/contact/${id}`,
  company:    (id) => `/desktop/crm/company/${id}`,
  deal:       (id) => `/desktop/crm/deal/${id}`,
  thread:     (id) => `/desktop/inbox/thread/${id}`,
  execution:  (id) => `/desktop/execution/${id}`,
  workflow:   (id) => `/desktop/workflow/${id}`,
};

// ─── Implementation ───────────────────────────────────────────────────────────

/**
 * Base path for Business OS — used to build canonical URLs.
 * Must match the route registered in App.tsx.
 */
const BUSINESS_OS_BASE = '/desktop/business-os';

export function useCanonicalRoute(): CanonicalRoute {
  const params = useParams<{ viewMode?: string; packageId?: string; deptId?: string }>();
  const nav = useNavigate();
  const location = useLocation();

  // Resolve viewMode from URL params, falling back to 'home'
  let viewMode: ViewMode = 'home';

  if (params.viewMode) {
    if (isValidView(params.viewMode)) {
      viewMode = params.viewMode;
    } else if (params.viewMode === 'package' && params.packageId) {
      viewMode = 'package';
    } else if (params.viewMode === 'department' && params.deptId) {
      viewMode = 'department';
    }
  }

  // Detect package/department from URL segment
  const packageId: string | null =
    (viewMode === 'package' && params.packageId) ? params.packageId : null;
  const deptId: string | null =
    (viewMode === 'department' && params.deptId) ? params.deptId : null;

  // Build a canonical URL string
  const buildUrl = useCallback(
    (view: ViewMode, p?: { packageId?: string; deptId?: string }): string => {
      if (view === 'home') return BUSINESS_OS_BASE;
      if (view === 'package' && p?.packageId) return `${BUSINESS_OS_BASE}/package/${p.packageId}`;
      if (view === 'department' && p?.deptId) return `${BUSINESS_OS_BASE}/department/${p.deptId}`;
      return `${BUSINESS_OS_BASE}/${view}`;
    },
    []
  );

  // Navigate to a Business OS view
  const navigate = useCallback(
    (view: ViewMode, p?: { packageId?: string; deptId?: string }) => {
      const url = buildUrl(view, p);
      // Avoid pushing duplicate history entries
      if (location.pathname !== url) {
        nav(url);
      }
    },
    [nav, buildUrl, location.pathname]
  );

  // Navigate to a canonical business object URL (cross-module)
  const navigateToObject = useCallback(
    (type: CanonicalObjectType, id: string) => {
      const urlBuilder = OBJECT_URL_MAP[type];
      if (urlBuilder) {
        nav(urlBuilder(id));
      } else {
        console.warn(`[useCanonicalRoute] Unknown object type: ${type}`);
      }
    },
    [nav]
  );

  return { viewMode, packageId, deptId, navigate, navigateToObject, buildUrl };
}

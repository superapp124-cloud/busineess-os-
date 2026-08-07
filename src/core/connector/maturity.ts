import type { ConnectorDefinition } from './types';

/**
 * Connector maturity — what a customer can rely on.
 *
 * production — fully supported and monitored
 * beta       — stable, feedback welcome
 * preview    — functional but evolving
 * community  — third-party maintained
 */
export type ConnectorMaturity = 'production' | 'beta' | 'preview' | 'community';

export const MATURITY_LABEL: Record<ConnectorMaturity, string> = {
  production: 'Production',
  beta: 'Beta',
  preview: 'Preview',
  community: 'Community',
};

export const MATURITY_BLURB: Record<ConnectorMaturity, string> = {
  production: 'Fully supported and monitored.',
  beta: 'Stable — feedback welcome.',
  preview: 'Functional but still evolving.',
  community: 'Maintained by the community.',
};

/** Badge colors for the UI (Tailwind utility classes). */
export const MATURITY_STYLE: Record<ConnectorMaturity, { bg: string; text: string; border: string }> = {
  production: {
    bg: 'bg-violet-100 dark:bg-violet-950/60',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-800',
  },
  beta: {
    bg: 'bg-blue-100 dark:bg-blue-950/50',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  preview: {
    bg: 'bg-amber-100 dark:bg-amber-950/50',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  community: {
    bg: 'bg-slate-100 dark:bg-zinc-800',
    text: 'text-slate-600 dark:text-zinc-400',
    border: 'border-slate-200 dark:border-zinc-700',
  },
};

/** Explicit overrides; anything absent is derived from availability. */
const OVERRIDES: Record<string, ConnectorMaturity> = {
  gmail:             'production',
  google_calendar:   'production',
  google_drive:      'production',
  google_contacts:   'production',
  google_meet:       'beta',
  outlook:           'production',
  outlook_calendar:  'production',
  onedrive:          'beta',
  microsoft_teams:   'production',
  whatsapp:          'beta',
  slack:             'production',
  discord:           'preview',
  github:            'production',
  jira:              'beta',
  confluence:        'preview',
  notion:            'beta',
  trello:            'preview',
  asana:             'beta',
  linkedin:          'preview',
  salesforce:        'beta',
  hubspot:           'beta',
  zoom:              'beta',
  stripe:            'production',
  razorpay:          'production',
  dropbox:           'beta',
  imap:              'preview',
};

export function maturityOf(definition: ConnectorDefinition): ConnectorMaturity {
  const override = OVERRIDES[definition.id];
  if (override) return override;
  if (definition.availability === 'community') return 'community';
  if (definition.availability === 'coming_soon') return 'preview';
  return 'beta';
}

export function maturityCounts(
  definitions: ConnectorDefinition[],
): Record<ConnectorMaturity, number> {
  const counts: Record<ConnectorMaturity, number> = {
    production: 0,
    beta: 0,
    preview: 0,
    community: 0,
  };
  definitions.forEach((d) => {
    counts[maturityOf(d)] += 1;
  });
  return counts;
}

/**
 * CHATR Global Growth Operating System (GGCS)
 * Formal Event Taxonomy & Attribution Contract
 * 
 * Strict Truth Rules:
 * - Real events only, zero fabricated minimums
 * - Privacy boundary: raw phone numbers and room secrets MUST NOT be included
 */

export type GrowthCategory =
  | 'acquisition'
  | 'signup'
  | 'activation'
  | 'viral'
  | 'retention'
  | 'pwa'
  | 'call';

export type GrowthEventType =
  // Acquisition
  | 'landing_view'
  | 'organic_visit'
  | 'search_landing'
  | 'referral_visit'
  | 'direct_visit'
  | 'social_visit'
  | 'call_link_visit'
  
  // Signup
  | 'signup_started'
  | 'signup_completed'
  | 'signup_failed'
  | 'anonymous_to_account'

  // Activation
  | 'first_call_started'
  | 'first_call_connected'
  | 'first_call_completed'
  | 'meaningful_call' // Duration >= 30 seconds
  | 'activation_completed'

  // Viral Loop
  | 'invite_dialog_opened'
  | 'invite_link_generated'
  | 'whatsapp_share'
  | 'sms_share'
  | 'copy_link'
  | 'telegram_share'
  | 'referral_link_opened'
  | 'referral_signup'
  | 'referral_activation'

  // Retention
  | 'return_visit'
  | 'second_call'
  | 'third_call'
  | 'day_1_return'
  | 'day_7_return'
  | 'day_30_return'

  // PWA Loop
  | 'install_prompt_shown'
  | 'install_prompt_accepted'
  | 'install_completed'
  | 'pwa_opened'

  // Call Lifecycle
  | 'call_created'
  | 'call_join_attempt'
  | 'call_join_success'
  | 'call_ended';

export interface GrowthEventPayload {
  eventType: GrowthEventType;
  category: GrowthCategory;
  landingPage: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referralCode?: string;
  referralUserId?: string;
  callId?: string;
  roomId?: string;
  callDurationSec?: number;
  country?: string;
  device?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  metadata?: Record<string, any>;
}

export interface GrowthAction {
  id: string;
  actionType: 'SEO_CREATE_PAGE' | 'SEO_IMPROVE_CTR' | 'VIRAL_LOOP_TWEAK' | 'PWA_FLOW_OPTIMIZE' | 'LOCALIZATION';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  source: 'GSC_OPPORTUNITY_ENGINE' | 'VIRAL_DROP_OFF' | 'RETENTION_ALERT';
  query?: string;
  targetPage?: string;
  country?: string;
  expectedImpact: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DEPLOYED' | 'DISMISSED';
  createdAt: string;
}

export interface GscOpportunity {
  id: string;
  query: string;
  targetPage: string;
  country: string;
  quadrant: 'WIN_NOW' | 'ATTACK' | 'CREATE' | 'FIX' | 'EXPAND';
  currentPosition: number;
  impressions: number;
  clicks: number;
  ctr: number;
  commercialIntent: 'HIGH' | 'MEDIUM' | 'LOW';
  opportunityScore: number;
  recommendedAction: string;
  status: 'DETECTED' | 'ASSIGNED' | 'EXECUTING' | 'RESOLVED';
}

/**
 * Validates that event payload adheres to privacy invariants
 */
export function validateGrowthEventPrivacy(payload: GrowthEventPayload): { valid: boolean; error?: string } {
  const json = JSON.stringify(payload);
  // Check for E.164 phone numbers (e.g. +91...)
  if (/\+?[1-9]\d{7,14}/.test(json)) {
    return { valid: false, error: 'PRIVACY VIOLATION: Unmasked phone number detected in telemetry payload.' };
  }
  return { valid: true };
}

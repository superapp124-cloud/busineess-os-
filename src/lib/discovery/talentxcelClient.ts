/**
 * TalentXcel Supabase Client
 *
 * Targets: dthlgsnakhoftinssokm (talentxcel.in production database)
 *
 * SERVER-SIDE: use createTXServiceClient() for all UDX workers and GSC sync.
 * BROWSER-SAFE: use createTXBrowserClient() for read-only UI queries.
 *
 * This is SEPARATE from the CHATR database (cenxckpxaqborfqyexot).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const TX_SUPABASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co';

/**
 * Public anon key — browser-safe, read-only operations.
 * Governed by RLS policies on the TalentXcel database.
 */
export const TX_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

/**
 * Browser-safe client — use for UI, SSR with user context.
 * Respects RLS. Cannot write to UDX discovery tables.
 */
export function createTXBrowserClient(): SupabaseClient {
  return createClient(TX_SUPABASE_URL, TX_SUPABASE_ANON_KEY);
}

/**
 * Server-side service role client — use ONLY in:
 * - GSC sync workers
 * - UDX Core Loop
 * - Supabase Edge Functions
 * - Migration scripts
 *
 * NEVER expose SERVICE_ROLE_KEY to the browser.
 *
 * @throws if TALENTXCEL_SERVICE_ROLE_KEY env var is not set
 */
export function createTXServiceClient(): SupabaseClient {
  const serviceKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error(
      '[TalentXcel Supabase] TALENTXCEL_SERVICE_ROLE_KEY is not set.\n' +
      'Get it from: https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/settings/api\n' +
      'This client is server-side only. Never expose service role keys to the browser.'
    );
  }

  return createClient(TX_SUPABASE_URL, serviceKey, {
    auth: { persistSession: false },
  });
}

/**
 * Tenant ID constant for TalentXcel.
 * All UDX tables use tenant_id='talentxcel' for TalentXcel rows.
 */
export const TX_TENANT_ID = 'talentxcel' as const;

/**
 * GSC property identifier as registered in Google Search Console.
 */
export const TX_GSC_PROPERTY = 'sc-domain:talentxcel.in' as const;

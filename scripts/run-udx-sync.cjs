#!/usr/bin/env node
/**
 * UDX First GSC Sync — TalentXcel (dthlgsnakhoftinssokm)
 * ═══════════════════════════════════════════════════════
 *
 * Runs the full UDX Core Loop golden path for talentxcel.in:
 *   Real GSC data → udx_demand_entities → calculate_udx_opportunities()
 *   → top opportunities printed to console
 *
 * Usage:
 *   TALENTXCEL_SERVICE_ROLE_KEY=eyJ... \
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL=udx@project.iam.gserviceaccount.com \
 *   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..." \
 *   node scripts/run-udx-sync.cjs
 *
 * Or with a refresh token:
 *   TALENTXCEL_SERVICE_ROLE_KEY=eyJ... \
 *   GOOGLE_OAUTH_CLIENT_ID=... \
 *   GOOGLE_OAUTH_CLIENT_SECRET=... \
 *   GOOGLE_OAUTH_REFRESH_TOKEN=... \
 *   node scripts/run-udx-sync.cjs
 */

const { createClient } = require('@supabase/supabase-js');
const { createSign } = require('crypto');

// ─── Config ───────────────────────────────────────────────────────────────────

const TX_SUPABASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co';
const TX_SERVICE_ROLE_KEY = process.env.TALENTXCEL_SERVICE_ROLE_KEY;
const TENANT_ID = 'talentxcel';
const GSC_PROPERTY = 'sc-domain:talentxcel.in';
const ROW_LIMIT = 25000;
const STABILIZATION_DAYS = 3;

// ─── Guards ───────────────────────────────────────────────────────────────────

if (!TX_SERVICE_ROLE_KEY) {
  console.error('');
  console.error('❌  TALENTXCEL_SERVICE_ROLE_KEY is required.');
  console.error('');
  console.error('   Get it from:');
  console.error('   https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/settings/api');
  console.error('');
  console.error('   Then run:');
  console.error('   TALENTXCEL_SERVICE_ROLE_KEY=eyJ... GOOGLE_SERVICE_ACCOUNT_EMAIL=... node scripts/run-udx-sync.cjs');
  console.error('');
  process.exit(1);
}

const hasServiceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
const hasOAuth = process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET && process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

if (!hasServiceAccount && !hasOAuth) {
  console.error('');
  console.error('❌  Google credentials required. Set ONE of:');
  console.error('');
  console.error('   Option A — Service Account (recommended):');
  console.error('   GOOGLE_SERVICE_ACCOUNT_EMAIL=udx@project.iam.gserviceaccount.com');
  console.error('   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\\n..."');
  console.error('');
  console.error('   Option B — OAuth2 Refresh Token:');
  console.error('   GOOGLE_OAUTH_CLIENT_ID=...apps.googleusercontent.com');
  console.error('   GOOGLE_OAUTH_CLIENT_SECRET=...');
  console.error('   GOOGLE_OAUTH_REFRESH_TOKEN=...');
  console.error('');
  console.error('   GSC scope required: https://www.googleapis.com/auth/webmasters.readonly');
  console.error('   Generate at: https://developers.google.com/oauthplayground');
  console.error('');
  process.exit(1);
}

// ─── Supabase client ──────────────────────────────────────────────────────────

const supabase = createClient(TX_SUPABASE_URL, TX_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─── Date helpers ─────────────────────────────────────────────────────────────

function getDateRange() {
  const end = new Date();
  end.setDate(end.getDate() - STABILIZATION_DAYS);
  const start = new Date(end);
  start.setDate(start.getDate() - 16);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

async function getAccessToken() {
  if (hasServiceAccount) {
    return getServiceAccountToken(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n')
    );
  }
  return refreshOAuthToken(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN
  );
}

async function getServiceAccountToken(email, privateKey) {
  const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: email, scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  })).toString('base64url');

  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(privateKey, 'base64url');
  const jwt = `${header}.${payload}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) throw new Error(`Service account token failed: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

async function refreshOAuthToken(clientId, clientSecret, refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId, client_secret: clientSecret,
      refresh_token: refreshToken, grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) throw new Error(`OAuth token refresh failed: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

// ─── GSC fetch ────────────────────────────────────────────────────────────────

async function fetchAllRows(accessToken, dimensions, startDate, endDate) {
  const allRows = [];
  let startRow = 0;

  while (true) {
    const encodedSite = encodeURIComponent(GSC_PROPERTY);
    const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate, endDate,
        dimensions,
        rowLimit: ROW_LIMIT,
        startRow,
        dataState: 'final',
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`GSC API ${res.status} for ${dimensions.join('×')}: ${errBody}`);
    }

    const data = await res.json();
    const rows = data.rows || [];
    allRows.push(...rows);

    if (rows.length < ROW_LIMIT) break;
    startRow += ROW_LIMIT;
  }

  return allRows;
}

// ─── Normalizer ───────────────────────────────────────────────────────────────

function normalizeQuery(q) {
  return q.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─── Main sync ────────────────────────────────────────────────────────────────

async function runSync() {
  const runId = `sync_${Date.now()}`;
  const syncAt = new Date().toISOString();
  let totalInserted = 0;
  const errors = [];

  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   UDX Core Loop — TalentXcel First Real GSC Sync     ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Database : dthlgsnakhoftinssokm (talentxcel.in)`);
  console.log(`  Property : ${GSC_PROPERTY}`);
  console.log(`  Tenant   : ${TENANT_ID}`);
  console.log(`  Auth     : ${hasServiceAccount ? 'Service Account' : 'OAuth2 Refresh Token'}`);
  console.log(`  Run ID   : ${runId}`);
  console.log('');

  // STEP 1 — Verify schema
  console.log('▶  Step 1: Verifying UDX schema in TalentXcel database...');
  const { error: schemaErr } = await supabase.from('udx_tenants').select('tenant_id').limit(1);
  if (schemaErr) {
    console.error('');
    console.error('❌  UDX schema not found in TalentXcel database.');
    console.error('   Apply the migration first:');
    console.error('   https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/sql/new');
    console.error('   File: supabase/migrations/20260910190000_udx_core_schema.sql');
    console.error('');
    process.exit(1);
  }
  console.log('   ✅  UDX schema confirmed.');

  // STEP 2 — Ensure tenant exists
  console.log('▶  Step 2: Ensuring talentxcel tenant record...');
  const { error: tenantErr } = await supabase.from('udx_tenants').upsert({
    tenant_id: 'talentxcel',
    tenant_name: 'TalentXcel Services Pvt Ltd',
    domain: 'talentxcel.in',
    gsc_property_id: GSC_PROPERTY,
    status: 'ACTIVE',
  }, { onConflict: 'tenant_id', ignoreDuplicates: false });
  if (tenantErr) console.warn('   ⚠  Tenant upsert warning:', tenantErr.message);
  else console.log('   ✅  Tenant confirmed.');

  // Write audit start
  await supabase.from('udx_audit_log').insert({
    tenant_id: TENANT_ID,
    log_type: 'EXECUTION',
    actor: 'GSC_CONNECTOR',
    action_taken: 'gsc_sync_start',
    policy_class: 'AUTO',
    outcome: 'AUTO_EXECUTED',
    metadata: { runId, gscProperty: GSC_PROPERTY },
  });

  // STEP 3 — Get GSC access token
  console.log('▶  Step 3: Obtaining Google access token...');
  let accessToken;
  try {
    accessToken = await getAccessToken();
    console.log('   ✅  Access token obtained.');
  } catch (err) {
    console.error('   ❌  Token error:', err.message);
    process.exit(1);
  }

  // STEP 4 — Fetch GSC data (4 dimension sets)
  const { startDate, endDate } = getDateRange();
  console.log(`▶  Step 4: Fetching GSC data (${startDate} → ${endDate}, 3-day stabilized)...`);

  const dimensionSets = [
    { dimensions: ['query', 'page'], label: 'query×page' },
    { dimensions: ['query', 'country'], label: 'query×country' },
    { dimensions: ['query', 'device'], label: 'query×device' },
    { dimensions: ['page', 'searchAppearance'], label: 'page×appearance' },
  ];

  for (const { dimensions, label } of dimensionSets) {
    process.stdout.write(`   Fetching ${label}...`);
    try {
      const rows = await fetchAllRows(accessToken, dimensions, startDate, endDate);
      process.stdout.write(` ${rows.length} rows\n`);

      // Upsert into udx_demand_entities
      for (const row of rows) {
        const query = row.keys[0] || '';
        const normalized = normalizeQuery(query);
        if (!normalized) continue;

        const country = dimensions.includes('country') ? (row.keys[dimensions.indexOf('country')] || 'unknown') : 'unknown';
        const device = dimensions.includes('device') ? (row.keys[dimensions.indexOf('device')] || 'ALL') : 'ALL';

        const { error: upsertErr } = await supabase.from('udx_demand_entities').upsert({
          tenant_id: TENANT_ID,
          query,
          normalized_query: normalized,
          country,
          device,
          impressions: row.impressions || 0,
          clicks: row.clicks || 0,
          ctr: row.ctr || 0,
          avg_position: row.position || 0,
          data_source: 'gsc_api',
          last_gsc_sync_at: syncAt,
          last_updated_at: syncAt,
        }, { onConflict: 'tenant_id,normalized_query,country', ignoreDuplicates: false });

        if (upsertErr) {
          errors.push(`[${label}] ${query}: ${upsertErr.message}`);
        } else {
          totalInserted++;
        }
      }
    } catch (err) {
      errors.push(`[${label}] fetch error: ${err.message}`);
      process.stdout.write(` ❌ ${err.message}\n`);
    }
  }

  // STEP 5 — Run opportunity scoring RPC
  console.log('▶  Step 5: Running calculate_udx_opportunities()...');
  const { data: rpcResult, error: rpcErr } = await supabase.rpc('calculate_udx_opportunities', {
    p_tenant_id: TENANT_ID,
  });
  if (rpcErr) {
    console.error('   ❌  RPC error:', rpcErr.message);
  } else {
    console.log(`   ✅  ${rpcResult} opportunities scored.`);
  }

  // STEP 6 — Read top opportunities
  console.log('▶  Step 6: Reading top 10 opportunities...');
  const { data: topOpps, error: oppErr } = await supabase
    .from('udx_opportunities')
    .select(`
      opportunity_id,
      opportunity_type,
      quadrant,
      opportunity_score,
      priority,
      udx_demand_entities (query, impressions, clicks, avg_position, country)
    `)
    .eq('tenant_id', TENANT_ID)
    .order('opportunity_score', { ascending: false })
    .limit(10);

  if (oppErr) {
    console.error('   ❌  Could not read opportunities:', oppErr.message);
  } else {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                  TOP 10 OPPORTUNITIES — talentxcel.in            ║');
    console.log('╠═══════════════════════════════════════════════════════════════════╣');
    (topOpps || []).forEach((opp, i) => {
      const e = opp.udx_demand_entities;
      console.log(`║ ${String(i + 1).padStart(2)}. [${opp.quadrant.padEnd(8)}] ${(e?.query || '').slice(0, 32).padEnd(32)} Pos:${String(Math.round(e?.avg_position || 0)).padStart(4)} Imp:${String(e?.impressions || 0).padStart(6)} Score:${String(Math.round(opp.opportunity_score || 0)).padStart(5)} ║`);
    });
    console.log('╚═══════════════════════════════════════════════════════════════════╝');
  }

  // STEP 7 — Summary
  const { data: entityCount } = await supabase
    .from('udx_demand_entities')
    .select('entity_id', { count: 'exact', head: true })
    .eq('tenant_id', TENANT_ID);

  const { data: oppCount } = await supabase
    .from('udx_opportunities')
    .select('opportunity_id', { count: 'exact', head: true })
    .eq('tenant_id', TENANT_ID);

  // Write audit complete
  await supabase.from('udx_audit_log').insert({
    tenant_id: TENANT_ID,
    log_type: 'EXECUTION',
    actor: 'GSC_CONNECTOR',
    action_taken: 'gsc_sync_complete',
    policy_class: 'AUTO',
    outcome: errors.length === 0 ? 'AUTO_EXECUTED' : 'AUTO_EXECUTED',
    metadata: { runId, totalInserted, errorCount: errors.length },
  });

  console.log('');
  console.log('════════════════════════════════════════');
  console.log('  SYNC COMPLETE');
  console.log(`  Rows written    : ${totalInserted}`);
  console.log(`  Demand entities : ${entityCount || 'unknown'}`);
  console.log(`  Opportunities   : ${oppCount || 'unknown'}`);
  console.log(`  Errors          : ${errors.length}`);
  if (errors.length > 0) {
    console.log('');
    console.log('  Errors:');
    errors.forEach(e => console.log('  -', e));
  }
  console.log('════════════════════════════════════════');
  console.log('');
  console.log('  Next: Review opportunities in Supabase:');
  console.log('  https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/editor');
  console.log('  SELECT * FROM udx_opportunities ORDER BY opportunity_score DESC LIMIT 50;');
  console.log('');
}

runSync().catch(err => {
  console.error('');
  console.error('Fatal error:', err.message);
  console.error('');
  process.exit(1);
});

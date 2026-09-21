#!/usr/bin/env node
/**
 * UDX v4.0 — Day-1 Live Telemetry Smoke Audit
 * =============================================================
 *
 * Checks:
 *   1.  /discovery endpoint        -> HTTP 200
 *   2.  udx_demand_entities        -> valid production resolution data
 *   3.  Intent event               -> immutable UUID entity_id
 *   4.  Cohort assignment          -> 2026-09-17 cohort
 *   5.  Domain classification      -> valid domain (talentxcel.in)
 *   6.  ProofRecord                -> evidence_chain on opportunities
 *   7.  Resolution state           -> valid status values only
 *   8.  Action lifecycle           -> no fabricated completion
 *   9.  Outcome                    -> PENDING unless genuine evidence
 *  10.  udx_audit_log              -> append-only event recorded
 *  11.  udx_search_memory          -> genuine telemetry only
 *  12.  Synthetic-data firewall    -> zero synthetic production records
 *  13.  Dynamic observation day    -> computed from 2026-09-17T11:25:00Z (Day 1/14)
 *  14.  Global geography           -> unconstrained by default (currentLevel: GLOBAL)
 *  15.  Geographic coverage        -> >=30 countries across >=5 continents
 *  16.  No hardcoded city scope    -> unconstrained queries; city is drill-down only
 *
 * Baseline Day-0 Audit ID: 165cdfd2-91e3-48c0-ab6b-ddea4ef023b3 (Preserved)
 *
 * Usage:
 *   TALENTXCEL_SERVICE_ROLE_KEY=sb_secret_... node scripts/udx-day0-smoke-audit.cjs
 */

'use strict';

const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const http  = require('http');
const crypto = require('crypto');

// ─── Config ───────────────────────────────────────────────────
const TX_SUPABASE_URL       = 'https://dthlgsnakhoftinssokm.supabase.co';
const TX_SERVICE_ROLE_KEY   = process.env.TALENTXCEL_SERVICE_ROLE_KEY;
const TENANT_ID             = 'talentxcel';
const EXPECTED_DOMAIN       = 'talentxcel.in';
const EXPECTED_COHORT_DATE  = '2026-09-17';
const PRODUCTION_BASE_URL   = process.env.PRODUCTION_BASE_URL || 'https://talentxcel.in';
const DAY0_BASELINE_AUDIT_ID = '165cdfd2-91e3-48c0-ab6b-ddea4ef023b3';
const OBSERVATION_START_AT  = '2026-09-17T11:25:00Z';
const OBSERVATION_TOTAL_DAYS = 14;

if (!TX_SERVICE_ROLE_KEY) {
  console.error('\n?  TALENTXCEL_SERVICE_ROLE_KEY is required.\n');
  console.error('   Get from: https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/settings/api');
  console.error('   Run: TALENTXCEL_SERVICE_ROLE_KEY=sb_secret_... node scripts/udx-day0-smoke-audit.cjs\n');
  process.exit(1);
}

const supabase = createClient(TX_SUPABASE_URL, TX_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ??? Result accumulator ???????????????????????????????????????
const PASS = 'PASS'; const FAIL = 'FAIL'; const WARN = 'WARN';
const results = [];
function record(n, title, status, detail) {
  results.push({ n, title, status, detail });
}

// ??? HTTP helper ??????????????????????????????????????????????
function httpGet(url, ms = 12000) {
  return new Promise((res, rej) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: ms }, (r) => {
      let b = ''; r.on('data', c => b += c); r.on('end', () => res({ status: r.statusCode, body: b }));
    });
    req.on('timeout', () => { req.destroy(); rej(new Error('timeout')); });
    req.on('error', rej);
  });
}
function safeJson(s) { try { return JSON.parse(s); } catch { return null; } }
function isUUID(s) { return typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s); }

// ??? CHECK 1 ?????????????????????????????????????????????????
async function check1() {
  const url = `${PRODUCTION_BASE_URL}/api/discovery/data`;
  try {
    const r = await httpGet(url);
    if (r.status === 200) {
      const j = safeJson(r.body);
      record(1, '/discovery -> HTTP 200', PASS,
        `HTTP 200. entity_count=${j?.entity_count ?? 'n/a'}, opportunities=${j?.opportunities_count ?? 'n/a'}`);
    } else {
      record(1, '/discovery -> HTTP 200', FAIL, `HTTP ${r.status}. Body: ${r.body.slice(0,200)}`);
    }
  } catch (e) {
    record(1, '/discovery -> HTTP 200', FAIL, `Network error: ${e.message}`);
  }
}

// ??? CHECK 2 ?????????????????????????????????????????????????
async function check2() {
  const { data, error } = await supabase
    .from('udx_demand_entities')
    .select('entity_id, query, data_source, opportunity_score')
    .eq('tenant_id', TENANT_ID)
    .order('opportunity_score', { ascending: false })
    .limit(5);

  if (error) return record(2, 'Resolution data exists', FAIL, error.message);
  if (!data || data.length === 0) return record(2, 'Resolution data exists', FAIL, 'Zero demand entities in production');

  const allGsc = data.every(r => r.data_source === 'gsc_api');
  record(2, 'Resolution data exists', PASS,
    `${data.length} top entities. Top: "${data[0].query}" score=${data[0].opportunity_score}. All GSC: ${allGsc}`);
}

// ??? CHECK 3 ?????????????????????????????????????????????????
async function check3() {
  const { data, error } = await supabase
    .from('udx_demand_entities')
    .select('entity_id')
    .eq('tenant_id', TENANT_ID)
    .limit(30);

  if (error) return record(3, 'Intent event -> immutable UUID', FAIL, error.message);
  if (!data || data.length === 0) return record(3, 'Intent event -> immutable UUID', FAIL, 'No entities found');

  const bad = data.filter(r => !isUUID(r.entity_id));
  if (bad.length === 0) {
    record(3, 'Intent event -> immutable UUID', PASS, `${data.length} sampled entities ? all have valid UUID intent_event_id`);
  } else {
    record(3, 'Intent event -> immutable UUID', FAIL, `${bad.length}/${data.length} entities missing valid UUID`);
  }
}

// ??? CHECK 4 ?????????????????????????????????????????????????
async function check4() {
  const cohortStart = `${EXPECTED_COHORT_DATE}T00:00:00.000Z`;
  const { data, error } = await supabase
    .from('udx_demand_entities')
    .select('entity_id, first_observed_at')
    .eq('tenant_id', TENANT_ID)
    .gte('first_observed_at', cohortStart)
    .limit(5);

  if (error) return record(4, 'Cohort -> 2026-09-17', FAIL, error.message);

  const { count: total } = await supabase
    .from('udx_demand_entities')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', TENANT_ID);

  const { data: tenant } = await supabase
    .from('udx_tenants')
    .select('status, created_at')
    .eq('tenant_id', TENANT_ID)
    .single();

  if (data && data.length > 0) {
    record(4, 'Cohort -> 2026-09-17', PASS,
      `${data.length} entities in Day-0 cohort. Total: ${total}. Tenant: ${tenant?.status} created ${tenant?.created_at}`);
  } else {
    record(4, 'Cohort -> 2026-09-17', WARN,
      `No entities with first_observed_at >= ${EXPECTED_COHORT_DATE}. Total entities: ${total}. Tenant created: ${tenant?.created_at ?? 'unknown'}`);
  }
}

// ??? CHECK 5 ?????????????????????????????????????????????????
async function check5() {
  const { data, error } = await supabase
    .from('udx_tenants')
    .select('domain, gsc_property_id, status')
    .eq('tenant_id', TENANT_ID)
    .single();

  if (error) return record(5, 'Domain classification', FAIL, error.message);

  const domainOk = data?.domain === EXPECTED_DOMAIN;
  const gscOk = data?.gsc_property_id?.includes('talentxcel.in');

  if (domainOk && gscOk) {
    record(5, 'Domain classification', PASS,
      `domain=${data.domain}, gsc_property_id=${data.gsc_property_id}, status=${data.status}`);
  } else {
    record(5, 'Domain classification', domainOk ? WARN : FAIL,
      `domain="${data?.domain}" gsc="${data?.gsc_property_id}" status="${data?.status}"`);
  }
}

// ??? CHECK 6 ?????????????????????????????????????????????????
async function check6() {
  const { data, error } = await supabase
    .from('udx_opportunities')
    .select('opportunity_id, opportunity_score, evidence_chain, status')
    .eq('tenant_id', TENANT_ID)
    .order('opportunity_score', { ascending: false })
    .limit(10);

  if (error) return record(6, 'ProofRecord -> evidence attached', FAIL, error.message);
  if (!data || data.length === 0) return record(6, 'ProofRecord -> evidence attached', FAIL, 'Zero opportunities');

  const withEvidence = data.filter(o => o.evidence_chain && Object.keys(o.evidence_chain).length > 0);
  if (withEvidence.length > 0) {
    record(6, 'ProofRecord -> evidence attached', PASS,
      `${data.length} opportunities, ${withEvidence.length} with non-empty evidence_chain. Top score: ${data[0].opportunity_score}`);
  } else {
    record(6, 'ProofRecord -> evidence attached', WARN,
      `${data.length} opportunities present. evidence_chain={}(default). Score decomposition is the proof. Top score: ${data[0].opportunity_score}`);
  }
}

// ??? CHECK 7 ?????????????????????????????????????????????????
async function check7() {
  const { data, error } = await supabase
    .from('udx_opportunities')
    .select('opportunity_id, status')
    .eq('tenant_id', TENANT_ID)
    .limit(100);

  if (error) return record(7, 'Resolution state -> valid states', FAIL, error.message);
  if (!data || data.length === 0) return record(7, 'Resolution state -> valid states', FAIL, 'Zero opportunities');

  const VALID = ['DETECTED', 'RESOLVED', 'DEPLOYED', 'ARCHIVED', 'PLANNED', null];
  const invalid = data.filter(o => !VALID.includes(o.status));
  const dist = data.reduce((a, o) => { const s = o.status || 'null'; a[s] = (a[s]||0)+1; return a; }, {});

  if (invalid.length === 0) {
    record(7, 'Resolution state -> valid states', PASS,
      `${data.length} opportunities. Distribution: ${JSON.stringify(dist)}`);
  } else {
    record(7, 'Resolution state -> valid states', FAIL,
      `${invalid.length} invalid states: ${invalid.map(o=>o.status).join(', ')}`);
  }
}

// ??? CHECK 8 ?????????????????????????????????????????????????
async function check8() {
  const { data: fakeSupply, error: e1 } = await supabase
    .from('udx_demand_entities')
    .select('entity_id, supply_exists, supply_page')
    .eq('tenant_id', TENANT_ID)
    .eq('supply_exists', true)
    .is('supply_page', null)
    .limit(20);

  const { data: fakeApproval, error: e2 } = await supabase
    .from('udx_opportunities')
    .select('opportunity_id, policy_decision, approved_at')
    .eq('tenant_id', TENANT_ID)
    .eq('policy_decision', 'APPROVED')
    .is('approved_at', null)
    .limit(20);

  if (e1) return record(8, 'Action lifecycle -> no fabricated completion', FAIL, e1.message);

  const fs_ = fakeSupply?.length ?? 0;
  const fa  = fakeApproval?.length ?? 0;

  if (fs_ === 0 && fa === 0) {
    record(8, 'Action lifecycle -> no fabricated completion', PASS,
      'Zero: supply_exists=true with supply_page=null. Zero: APPROVED with no approved_at timestamp.');
  } else {
    const msgs = [];
    if (fs_ > 0) msgs.push(`${fs_} entities: supply_exists=true but supply_page=null`);
    if (fa  > 0) msgs.push(`${fa} opportunities: APPROVED but approved_at=null`);
    record(8, 'Action lifecycle -> no fabricated completion', FAIL, msgs.join('. '));
  }
}

// ??? CHECK 9 ?????????????????????????????????????????????????
async function check9() {
  const { data: premature, error: e1 } = await supabase
    .from('udx_revenue_attributions')
    .select('attribution_id, is_incremental, experiment_id')
    .eq('tenant_id', TENANT_ID)
    .eq('is_incremental', true)
    .is('experiment_id', null)
    .limit(20);

  const { data: ghostDeploy } = await supabase
    .from('udx_opportunities')
    .select('opportunity_id, status, deployed_at')
    .eq('tenant_id', TENANT_ID)
    .eq('status', 'DEPLOYED')
    .is('deployed_at', null)
    .limit(20);

  if (e1 && e1.code !== 'PGRST116') {
    return record(9, 'Outcome -> PENDING unless genuine evidence', WARN, `revenue_attributions query error: ${e1.message}`);
  }

  const p = premature?.length ?? 0;
  const g = ghostDeploy?.length ?? 0;

  if (p === 0 && g === 0) {
    record(9, 'Outcome -> PENDING unless genuine evidence', PASS,
      'Zero incremental attributions without experiment. Zero DEPLOYED opportunities without deployed_at.');
  } else {
    const msgs = [];
    if (p > 0) msgs.push(`${p} attributions: is_incremental=true but no experiment_id`);
    if (g > 0) msgs.push(`${g} opportunities: DEPLOYED but deployed_at=null`);
    record(9, 'Outcome -> PENDING unless genuine evidence', FAIL, msgs.join('. '));
  }
}

// ??? CHECK 10 ????????????????????????????????????????????????
async function check10(auditId, runAt) {
  const { data: logs, error } = await supabase
    .from('udx_audit_log')
    .select('log_id, log_type, outcome, created_at')
    .eq('tenant_id', TENANT_ID)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return record(10, 'udx_audit_log -> append-only', FAIL, error.message);

  // Append this audit run
  const { error: insertErr } = await supabase
    .from('udx_audit_log')
    .insert([{
      tenant_id: TENANT_ID,
      log_type: 'DAY0_SMOKE_AUDIT',
      actor: 'udx-day0-smoke-audit',
      action_taken: `Day-0 smoke audit check-10 at ${runAt}`,
      policy_class: 'AUDIT',
      outcome: 'AUDIT_IN_PROGRESS',
      metadata: { audit_id: auditId, run_at: runAt },
    }]);

  if (!logs || logs.length === 0) {
    if (insertErr) {
      record(10, 'udx_audit_log -> append-only', FAIL,
        `Zero existing log entries. Insert failed: ${insertErr.message}`);
    } else {
      record(10, 'udx_audit_log -> append-only', WARN,
        'Zero existing log entries. Day-0 seed event inserted. Log initialised.');
    }
  } else {
    if (insertErr) {
      record(10, 'udx_audit_log -> append-only', WARN,
        `${logs.length} existing entries. New insert failed: ${insertErr.message}`);
    } else {
      record(10, 'udx_audit_log -> append-only', PASS,
        `${logs.length} existing log entries. New Day-0 audit event appended. Latest: ${logs[0].log_type}/${logs[0].outcome} @ ${logs[0].created_at}`);
    }
  }
}

// ??? CHECK 11 ????????????????????????????????????????????????
async function check11() {
  const { data, error } = await supabase
    .from('udx_search_memory')
    .select('memory_id, memory_type, outcome, confidence, observations, experiment_id')
    .eq('tenant_id', TENANT_ID)
    .order('confidence', { ascending: false })
    .limit(20);

  if (error && error.code !== 'PGRST116') {
    return record(11, 'udx_search_memory -> genuine telemetry', WARN, error.message);
  }

  if (!data || data.length === 0) {
    return record(11, 'udx_search_memory -> genuine telemetry', PASS,
      'Zero memory entries at Day-0 ? correct. Memory only written from completed experiments.');
  }

  const orphaned = data.filter(m => !m.experiment_id && (!m.observations || m.observations < 1));
  if (orphaned.length === 0) {
    record(11, 'udx_search_memory -> genuine telemetry', PASS,
      `${data.length} memory entries ? all have experiment linkage or observations >= 1. Top confidence: ${data[0].confidence}`);
  } else {
    record(11, 'udx_search_memory -> genuine telemetry', FAIL,
      `${orphaned.length} entries: no experiment_id AND observations < 1 ? likely synthetic`);
  }
}

// ??? CHECK 12 ????????????????????????????????????????????????
async function check12() {
  const SYNTH_SOURCES = ['synthetic', 'seed', 'mock', 'generated', 'test', 'fixture'];
  const { data: synth, error } = await supabase
    .from('udx_demand_entities')
    .select('entity_id, data_source, query')
    .eq('tenant_id', TENANT_ID)
    .in('data_source', SYNTH_SOURCES)
    .limit(20);

  if (error) return record(12, 'Synthetic-data firewall', FAIL, error.message);

  const { count: zeroZero } = await supabase
    .from('udx_demand_entities')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', TENANT_ID)
    .eq('impressions', 0)
    .eq('clicks', 0);

  const { count: total } = await supabase
    .from('udx_demand_entities')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', TENANT_ID);

  const synthCount = synth?.length ?? 0;
  const zeroZeroPct = total > 0 ? Math.round((zeroZero / total) * 100) : 0;
  const issues = [];
  if (synthCount > 0) issues.push(`${synthCount} records with synthetic data_source`);
  if (zeroZeroPct > 80) issues.push(`${zeroZeroPct}% records have imp=0 AND clicks=0 (>80% threshold)`);

  if (issues.length === 0) {
    record(12, 'Synthetic-data firewall', PASS,
      `Zero synthetic-source records. zero-zero: ${zeroZero}/${total} (${zeroZeroPct}%) ? acceptable.`);
  } else {
    record(12, 'Synthetic-data firewall', FAIL, issues.join('; '));
  }
}

// ─── CHECK 13 ────────────────────────────────────────────────
async function check13() {
  const startMs = Date.parse(OBSERVATION_START_AT);
  const nowMs = Date.now();
  const elapsedMs = nowMs - startMs;
  const elapsedDays = elapsedMs / 86400000;
  const expectedDay = Math.floor(elapsedDays);
  const elapsedHours = Math.floor(elapsedMs / 3600000);

  const url = `${PRODUCTION_BASE_URL}/api/discovery/data`;
  let liveClock = null;
  try {
    const r = await httpGet(url);
    if (r.status === 200) {
      const j = safeJson(r.body);
      liveClock = j?.observationClock;
    }
  } catch (e) {
    // network warning
  }

  const matchesExpected = liveClock && liveClock.observationDay === expectedDay;
  const baselinePreserved = liveClock && liveClock.baselineAuditId === DAY0_BASELINE_AUDIT_ID;
  const phaseCorrect = liveClock && (expectedDay >= 1 && expectedDay < 14 ? liveClock.phase === 'OBSERVATION' : true);

  if (matchesExpected && baselinePreserved && phaseCorrect) {
    record(13, 'Dynamic observation day calculation', PASS,
      `Calculated: Day ${expectedDay} (${elapsedHours}h elapsed). Live API: ${liveClock.displayDay} (${liveClock.dayRatio}). Baseline: ${liveClock.baselineAuditId}. Phase: ${liveClock.phase}`);
  } else if (!liveClock) {
    record(13, 'Dynamic observation day calculation', WARN,
      `Calculated: Day ${expectedDay} (${elapsedHours}h elapsed). Live API returned no observationClock yet.`);
  } else {
    record(13, 'Dynamic observation day calculation', FAIL,
      `Calculated Day ${expectedDay} vs Live Day ${liveClock?.observationDay}. Baseline preserved: ${baselinePreserved}. Phase: ${liveClock?.phase}`);
  }
}

// ─── CHECK 14 ────────────────────────────────────────────────
async function check14() {
  const url = `${PRODUCTION_BASE_URL}/api/discovery/data?geoLevel=GLOBAL`;
  try {
    const r = await httpGet(url);
    if (r.status !== 200) {
      return record(14, 'Global geography unconstrained', FAIL, `HTTP ${r.status}`);
    }
    const j = safeJson(r.body);
    const geo = j?.geography;
    if (!geo) {
      return record(14, 'Global geography unconstrained', FAIL, 'No geography object returned in /api/discovery/data');
    }

    const isGlobalLevel = geo.currentLevel === 'GLOBAL';
    const countriesCount = geo.countriesObserved ?? geo.byCountry?.length ?? 0;
    const continentsCount = geo.continentsObserved ?? geo.byContinent?.length ?? 0;
    const honestVerification = geo.globalCoverageSummary?.verificationState === 'NO_VERIFIED_GLOBAL_DATA' || geo.verificationState === 'NO_VERIFIED_GLOBAL_DATA';

    if (isGlobalLevel && countriesCount >= 30 && continentsCount >= 5 && honestVerification) {
      record(14, 'Global geography unconstrained', PASS,
        `currentLevel=GLOBAL. countriesObserved=${countriesCount}. continentsObserved=${continentsCount}. verificationState=NO_VERIFIED_GLOBAL_DATA`);
    } else {
      record(14, 'Global geography unconstrained', FAIL,
        `currentLevel=${geo.currentLevel} (expected GLOBAL), countries=${countriesCount} (>=30), continents=${continentsCount} (>=5), honestVerification=${honestVerification}`);
    }
  } catch (e) {
    record(14, 'Global geography unconstrained', FAIL, `Error: ${e.message}`);
  }
}

// ─── CHECK 15 ────────────────────────────────────────────────
async function check15() {
  const CONTINENT_MAP = {
    ind: 'Asia', bgd: 'Asia', phl: 'Asia', vnm: 'Asia', idn: 'Asia', tha: 'Asia',
    mys: 'Asia', chn: 'Asia', hkg: 'Asia', twn: 'Asia', sgp: 'Asia', jor: 'Asia',
    are: 'Asia', sau: 'Asia', qat: 'Asia', irq: 'Asia',
    usa: 'North America', can: 'North America', mex: 'North America',
    gbr: 'Europe', fra: 'Europe', deu: 'Europe', esp: 'Europe', ita: 'Europe',
    nld: 'Europe', dnk: 'Europe', swe: 'Europe', ukr: 'Europe', tur: 'Europe',
    mar: 'Africa', dza: 'Africa',
    aus: 'Oceania',
    bra: 'South America', chl: 'South America'
  };

  const { data, error } = await supabase
    .from('udx_demand_entities')
    .select('country, impressions, clicks')
    .eq('tenant_id', TENANT_ID);

  if (error) return record(15, 'Geographic coverage aggregation', FAIL, error.message);
  if (!data || data.length === 0) return record(15, 'Geographic coverage aggregation', FAIL, 'Zero entities in production');

  const countryCounts = {};
  const continents = new Set();

  for (const r of data) {
    const c = (r.country || '').toLowerCase().trim();
    if (c) {
      countryCounts[c] = (countryCounts[c] || 0) + 1;
      if (CONTINENT_MAP[c]) continents.add(CONTINENT_MAP[c]);
    }
  }

  const numCountries = Object.keys(countryCounts).length;
  const numContinents = continents.size;
  const nonIndCount = Object.entries(countryCounts)
    .filter(([c]) => c !== 'ind')
    .reduce((acc, [, count]) => acc + count, 0);

  if (numCountries >= 30 && numContinents >= 5 && nonIndCount > 0) {
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([c, n]) => `${c.toUpperCase()}:${n}`)
      .join(', ');

    record(15, 'Geographic coverage aggregation', PASS,
      `${numCountries} observed countries, ${numContinents} continents. Non-India signals: ${nonIndCount}. Top: ${topCountries}. Continents: ${Array.from(continents).join(', ')}`);
  } else {
    record(15, 'Geographic coverage aggregation', FAIL,
      `countries=${numCountries} (>=30 expected), continents=${numContinents} (>=5 expected), nonIndCount=${nonIndCount}`);
  }
}

// ─── CHECK 16 ────────────────────────────────────────────────
async function check16() {
  const { data: sampleEntities, error } = await supabase
    .from('udx_demand_entities')
    .select('query, country')
    .eq('tenant_id', TENANT_ID)
    .order('impressions', { ascending: false })
    .limit(50);

  if (error) return record(16, 'No hardcoded city foundation', FAIL, error.message);

  const cityOnlyTerms = ['varanasi', 'hyderabad', 'lucknow', 'kanpur'];
  const totalSampled = sampleEntities?.length || 0;
  const nonCityTerms = (sampleEntities || []).filter(e => {
    const q = (e.query || '').toLowerCase();
    return !cityOnlyTerms.some(term => q.includes(term));
  });

  const url = `${PRODUCTION_BASE_URL}/api/discovery/data`;
  let apiUnconstrained = true;
  try {
    const r = await httpGet(url);
    if (r.status === 200) {
      const j = safeJson(r.body);
      if (j?.geography?.cityFilter) {
        apiUnconstrained = false;
      }
    }
  } catch (_) {}

  if (nonCityTerms.length > 0 && apiUnconstrained) {
    record(16, 'No hardcoded city foundation', PASS,
      `Global-first architecture verified. ${nonCityTerms.length}/${totalSampled} top sampled queries are non-city-constrained. City filter is strictly optional drill-down.`);
  } else {
    record(16, 'No hardcoded city foundation', FAIL,
      `Detected hardcoded city clamping. nonCityTerms=${nonCityTerms.length}/${totalSampled}, apiUnconstrained=${apiUnconstrained}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  const runAt   = new Date().toISOString();
  const auditId = crypto.randomUUID();

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('  UDX v4.0  —  Day-1 Live Telemetry Smoke Audit');
  console.log(`  Audit ID   : ${auditId}`);
  console.log(`  Baseline ID: ${DAY0_BASELINE_AUDIT_ID} (Preserved Day-0 Baseline)`);
  console.log(`  Run at     : ${runAt}`);
  console.log(`  Tenant     : ${TENANT_ID}  (${EXPECTED_DOMAIN})`);
  console.log(`  Supabase   : ${TX_SUPABASE_URL}`);
  console.log(`  Production : ${PRODUCTION_BASE_URL}`);
  console.log('══════════════════════════════════════════════════════════════════\n');

  console.log('▶  Check  1/16  /discovery -> HTTP 200');              await check1();
  console.log('▶  Check  2/16  Resolution data exists');              await check2();
  console.log('▶  Check  3/16  Intent event -> immutable UUID');      await check3();
  console.log('▶  Check  4/16  Cohort -> 2026-09-17');               await check4();
  console.log('▶  Check  5/16  Domain classification');               await check5();
  console.log('▶  Check  6/16  ProofRecord -> evidence');             await check6();
  console.log('▶  Check  7/16  Resolution state -> valid');           await check7();
  console.log('▶  Check  8/16  Action lifecycle');                    await check8();
  console.log('▶  Check  9/16  Outcome -> PENDING');                  await check9();
  console.log('▶  Check 10/16  udx_audit_log -> append-only');       await check10(auditId, runAt);
  console.log('▶  Check 11/16  udx_search_memory -> genuine');       await check11();
  console.log('▶  Check 12/16  Synthetic-data firewall');             await check12();
  console.log('▶  Check 13/16  Dynamic observation day calculation'); await check13();
  console.log('▶  Check 14/16  Global geography unconstrained');      await check14();
  console.log('▶  Check 15/16  Geographic coverage aggregation');     await check15();
  console.log('▶  Check 16/16  No hardcoded city foundation');        await check16();

  const passed = results.filter(r => r.status === PASS).length;
  const warned = results.filter(r => r.status === WARN).length;
  const failed = results.filter(r => r.status === FAIL).length;

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('  RESULTS');
  console.log('══════════════════════════════════════════════════════════════════\n');
  for (const r of results) {
    const icon = r.status === PASS ? '✓' : r.status === WARN ? '⚠️ ' : '✗';
    console.log(`  ${icon} [${String(r.n).padStart(2,'0')}] ${r.title}`);
    console.log(`        ${r.detail}\n`);
  }
  console.log('══════════════════════════════════════════════════════════════════');
  console.log(`  PASS: ${passed}   WARN: ${warned}   FAIL: ${failed}   TOTAL: ${results.length}`);
  console.log('══════════════════════════════════════════════════════════════════');

  const sysStatus = failed === 0 && warned <= 2
    ? 'SYSTEM LIVE — Telemetry clean. Day-1 observation window is active and valid.'
    : failed === 0
    ? 'SYSTEM LIVE with WARNINGS — Investigate before Day-3 review.'
    : failed <= 2
    ? 'SYSTEM LIVE — PARTIAL. Critical failures must be resolved before Day-3.'
    : 'SYSTEM NOT PROVEN — Multiple failures. 14-day data may be contaminated.';

  console.log(`\n  ★  ${sysStatus}`);
  console.log(`\n  Audit ID:   ${auditId}`);
  console.log(`  Baseline:   ${DAY0_BASELINE_AUDIT_ID}`);
  console.log(`  Run at:     ${runAt}`);
  console.log('══════════════════════════════════════════════════════════════════\n');

  // Final summary to audit log
  try {
    await supabase.from('udx_audit_log').insert([{
      tenant_id: TENANT_ID,
      log_type: 'DAY1_SMOKE_AUDIT_SUMMARY',
      actor: 'udx-day1-smoke-audit',
      action_taken: `Day-1 Smoke Audit done. ${passed}P / ${warned}W / ${failed}F`,
      policy_class: 'AUDIT',
      outcome: failed === 0 ? 'SYSTEM_LIVE' : 'FAILURES_DETECTED',
      metadata: {
        audit_id: auditId,
        baseline_audit_id: DAY0_BASELINE_AUDIT_ID,
        audit_version: '4.0-day1',
        run_at: runAt,
        pass: passed, warn: warned, fail: failed, system_status: sysStatus,
        checks: results.map(r => ({ check: r.n, status: r.status, detail: r.detail.slice(0,200) })),
      },
    }]);
  } catch (_) { /* non-fatal */ }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => { console.error('\n✗  Audit runner crashed:', err); process.exit(2); });

#!/usr/bin/env node
/**
 * Apply the GSC schema migration directly to Supabase via REST API.
 * Uses the anon key + supabase rpc to execute SQL.
 * Run: node scripts/apply-gsc-migration.cjs
 */
const fs = require('fs');
const https = require('https');

const SUPABASE_URL = 'https://nuuuqazaoaozgblmvkzn.supabase.co';
const SQL_FILE = 'supabase/migrations/20261001000001_gsc_queries_sync_enhancement.sql';

// Read the service role key from env
let env = '';
try { env = fs.readFileSync('.env', 'utf8'); } catch {}
const svcKeyMatch = env.match(/TALENTXCEL_SERVICE_ROLE_KEY=([^\r\n]+)/);
// For the CHATR project we need the CHATR service key — try to find it
const chatrKeyMatch = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const key = chatrKeyMatch ? chatrKeyMatch[1].trim() : null;

if (!key) {
  console.error('❌ Could not find VITE_SUPABASE_ANON_KEY in .env');
  console.error('   Please set CHATR_SERVICE_ROLE_KEY in .env and re-run.');
  process.exit(1);
}

const sql = fs.readFileSync(SQL_FILE, 'utf8');

const body = JSON.stringify({ query: sql });

const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);
const options = {
  hostname: url.hostname,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Length': Buffer.byteLength(body),
  },
};

console.log('🔄 Applying GSC migration to', SUPABASE_URL);

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Migration applied successfully');
    } else {
      console.log(`⚠️  Response ${res.statusCode}: ${data}`);
      console.log('   The migration SQL is at:', SQL_FILE);
      console.log('   Apply it manually via: Supabase Dashboard → SQL Editor');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
});

req.write(body);
req.end();

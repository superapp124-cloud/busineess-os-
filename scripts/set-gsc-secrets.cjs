#!/usr/bin/env node
/**
 * Set Supabase Edge Function secrets for gsc-sync using the Management API.
 * Run: node scripts/set-gsc-secrets.cjs
 */
const fs = require('fs');
const https = require('https');

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'nuuuqazaoaozgblmvkzn';
const env = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';

function extractEnvValue(key) {
  const lines = env.split('\n');
  for (const line of lines) {
    if (line.startsWith(key + '=')) {
      let val = line.slice(key.length + 1).trim();
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      return val;
    }
  }
  return null;
}

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || extractEnvValue('SUPABASE_ACCESS_TOKEN');


// Also collect multiline private key
function extractPrivateKey() {
  const match = env.match(/GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="([\s\S]*?)"\s*\n/);
  if (match) return match[1];
  return extractEnvValue('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
}

const email = extractEnvValue('GOOGLE_SERVICE_ACCOUNT_EMAIL')?.replace(/"/g, '');
const privateKey = extractPrivateKey();
const supabaseUrl = 'https://nuuuqazaoaozgblmvkzn.supabase.co';

if (!email) { console.error('❌ GOOGLE_SERVICE_ACCOUNT_EMAIL not found in .env'); process.exit(1); }
if (!privateKey) { console.error('❌ GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY not found in .env'); process.exit(1); }

const secrets = [
  { name: 'GOOGLE_SERVICE_ACCOUNT_EMAIL', value: email },
  { name: 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY', value: privateKey },
  // SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected — do NOT set them manually
];

console.log(`🔑 Setting ${secrets.length} secrets for project ${PROJECT_REF}...`);
console.log('   GOOGLE_SERVICE_ACCOUNT_EMAIL =', email);
console.log('   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = [', privateKey.length, 'chars]');

function apiRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'api.supabase.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let d = '';
      res.on('data', (chunk) => { d += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  // POST /v1/projects/{ref}/secrets (bulk upsert)
  const result = await apiRequest(
    `/v1/projects/${PROJECT_REF}/secrets`,
    'POST',
    secrets
  );

  if (result.status >= 200 && result.status < 300) {
    console.log('✅ Secrets set successfully');
    console.log('   Now triggering GSC sync...\n');
    await triggerSync();
  } else {
    console.error(`❌ Failed to set secrets (HTTP ${result.status}):`, result.body);
  }
}

async function triggerSync() {
  const env2 = fs.readFileSync('.env', 'utf8');
  const anon = env2.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/)?.[1]?.trim();

  if (!anon) {
    console.log('⚠️  Could not find anon key — trigger sync manually from admin panel');
    return;
  }

  console.log('🔄 Calling gsc-sync edge function (action=sync)...');
  const { default: fetch } = await import('node-fetch').catch(() => ({ default: null }));
  const fetchFn = fetch || globalThis.fetch;

  try {
    const res = await fetchFn(`https://${PROJECT_REF}.supabase.co/functions/v1/gsc-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anon}`,
      },
      body: JSON.stringify({ action: 'sync' }),
    });
    const data = await res.json();
    console.log('Sync response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('⚠️  Sync call note:', e.message);
    console.log('   Trigger manually from admin: CHATR → Sitemaps → "Sync GSC Now"');
  }
}

main().catch(console.error);

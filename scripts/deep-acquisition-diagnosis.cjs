const fs = require('fs');
const { createSign } = require('crypto');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const env = fs.readFileSync('.env', 'utf8');
  const email = 'antigravity-search@talentxcel-login.iam.gserviceaccount.com';
  const line = env.split('\n').find(l => l.startsWith('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY='));
  let rawKey = line ? line.slice('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY='.length).trim() : '';
  if (rawKey.startsWith('"') && rawKey.endsWith('"')) rawKey = rawKey.slice(1, -1);
  const privateKey = rawKey.replace(/\\n/g, '\n');

  // Supabase Client
  const supabaseUrl = env.split('\n').find(l => l.startsWith('VITE_SUPABASE_URL='))?.split('=')[1]?.trim();
  const supabaseKey = env.split('\n').find(l => l.startsWith('VITE_SUPABASE_ANON_KEY='))?.split('=')[1]?.trim();
  let supabase = null;
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }

  // 1. Google OAuth JWT
  const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: email,
    scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');

  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const jwt = `${header}.${payload}.${sign.sign(privateKey, 'base64url')}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const { access_token } = await tokenRes.json();
  if (!access_token) {
    console.error('Failed to authenticate with Google Search Console');
    return;
  }

  const siteUrl = 'sc-domain:chatrchat.in';
  const encodedSite = encodeURIComponent(siteUrl);

  const today = new Date();
  const endDate = new Date(today.getTime() - 3 * 86400000).toISOString().split('T')[0];
  const startDate = new Date(today.getTime() - 31 * 86400000).toISOString().split('T')[0];

  console.log(`\n================================================================`);
  console.log(`CHATR FORENSIC ACQUISITION DIAGNOSIS (LAST 28 DAYS: ${startDate} to ${endDate})`);
  console.log(`================================================================\n`);

  // Query 1: All Queries
  const queriesRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: 500
    })
  });
  const queriesData = await queriesRes.json();
  const allQueries = queriesData.rows || [];

  // Query 2: All Pages
  const pagesRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: 500
    })
  });
  const pagesData = await pagesRes.json();
  const allPages = pagesData.rows || [];

  // Query 3: Query + Page Pairs (To see where queries actually land)
  const qpRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['query', 'page'],
      rowLimit: 500
    })
  });
  const qpData = await qpRes.json();
  const allQP = qpData.rows || [];

  // Query 4: Country breakdown
  const countryRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['country'],
      rowLimit: 20
    })
  });
  const countryData = await countryRes.json();
  const allCountries = countryData.rows || [];

  // Totals
  const totalClicks = allQueries.reduce((acc, q) => acc + q.clicks, 0);
  const totalImpressions = allQueries.reduce((acc, q) => acc + q.impressions, 0);
  const blendedCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  console.log(`TOTAL PERFORMANCE SUMMARY (28 Days):`);
  console.log(`  Total Google Impressions: ${totalImpressions.toLocaleString()}`);
  console.log(`  Total Google Clicks:      ${totalClicks.toLocaleString()}`);
  console.log(`  Blended Search CTR:       ${blendedCtr.toFixed(2)}%`);
  console.log(`  Daily Search Clicks Avg:  ${(totalClicks / 28).toFixed(1)} clicks/day\n`);

  // Section 1: Every Query Producing Clicks
  const clickQueries = allQueries.filter(q => q.clicks > 0);
  console.log(`----------------------------------------------------------------`);
  console.log(`1. ALL QUERIES PRODUCING CLICKS (${clickQueries.length} queries)`);
  console.log(`----------------------------------------------------------------`);
  clickQueries.forEach((q, i) => {
    console.log(`  ${i + 1}. "${q.keys[0]}" -> Clicks: ${q.clicks} | Imp: ${q.impressions} | CTR: ${(q.ctr * 100).toFixed(1)}% | Pos: ${q.position.toFixed(1)}`);
  });
  if (!clickQueries.length) console.log('  None found.');

  // Section 2: Top Pages Receiving Clicks & Traffic
  const clickPages = allPages.filter(p => p.clicks > 0);
  console.log(`\n----------------------------------------------------------------`);
  console.log(`2. ALL LANDING PAGES RECEIVING CLICKS (${clickPages.length} pages)`);
  console.log(`----------------------------------------------------------------`);
  clickPages.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.keys[0]} -> Clicks: ${p.clicks} | Imp: ${p.impressions} | CTR: ${(p.ctr * 100).toFixed(1)}% | Pos: ${p.position.toFixed(1)}`);
  });

  // Section 3: High Impression Queries with Low/Zero CTR (Striking Distance / Opportunity)
  const strikingDistance = allQueries
    .filter(q => q.impressions >= 10 && q.position <= 25)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25);
  console.log(`\n----------------------------------------------------------------`);
  console.log(`3. STRIKING DISTANCE OPPORTUNITIES (Position 1–25, Ranked by Impressions)`);
  console.log(`----------------------------------------------------------------`);
  strikingDistance.forEach((q, i) => {
    console.log(`  ${i + 1}. "${q.keys[0]}" | Imp: ${q.impressions} | Clicks: ${q.clicks} | CTR: ${(q.ctr * 100).toFixed(1)}% | Pos: ${q.position.toFixed(1)}`);
  });

  // Section 4: Query to Page Mismatch Analysis (Where queries land)
  console.log(`\n----------------------------------------------------------------`);
  console.log(`4. QUERY-TO-LANDING-PAGE ROUTING AUDIT (Top 20 Query Pairs)`);
  console.log(`----------------------------------------------------------------`);
  allQP
    .filter(qp => qp.impressions >= 5)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20)
    .forEach((qp, i) => {
      console.log(`  ${i + 1}. Query: "${qp.keys[0]}" (Imp: ${qp.impressions}, Clicks: ${qp.clicks}, Pos: ${qp.position.toFixed(1)})`);
      console.log(`     Landed on: ${qp.keys[1]}`);
    });

  // Section 5: Country Breakdown
  console.log(`\n----------------------------------------------------------------`);
  console.log(`5. TOP SEARCH COUNTRIES`);
  console.log(`----------------------------------------------------------------`);
  allCountries.slice(0, 10).forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.keys[0].toUpperCase()}: Imp: ${c.impressions} | Clicks: ${c.clicks}`);
  });

  // Section 6: Real Supabase User / Registration Data
  console.log(`\n----------------------------------------------------------------`);
  console.log(`6. REAL SUPABASE USER ACQUISITION & ACTIVATION AUDIT`);
  console.log(`----------------------------------------------------------------`);
  if (supabase) {
    try {
      const { data: profiles, error: pErr, count: pCount } = await supabase
        .from('profiles')
        .select('id, created_at, username', { count: 'exact' });
      
      console.log(`  Total Profiles in Database: ${pCount || (profiles ? profiles.length : 'N/A')}`);
      
      // Recent registrations in last 28 days
      if (profiles && profiles.length) {
        const cutoff = new Date(today.getTime() - 28 * 86400000).toISOString();
        const recent = profiles.filter(p => p.created_at >= cutoff);
        console.log(`  New Profiles Created (Last 28 Days): ${recent.length}`);
        console.log(`  Average New Users/Day: ${(recent.length / 28).toFixed(2)} users/day`);
      }

      // Check workspaces
      const { count: wCount } = await supabase.from('workspaces').select('id', { count: 'exact', head: true });
      console.log(`  Total Workspaces Created: ${wCount || 0}`);

      // Check session rooms / calls
      const { count: rCount } = await supabase.from('session_rooms').select('id', { count: 'exact', head: true });
      console.log(`  Total Call Sessions Created: ${rCount || 0}`);
    } catch (e) {
      console.log('  Supabase query error:', e.message);
    }
  } else {
    console.log('  Supabase client not initialized.');
  }

  console.log(`\n================================================================`);
  console.log(`DIAGNOSTIC RUN COMPLETE`);
  console.log(`================================================================\n`);
}

main().catch(console.error);

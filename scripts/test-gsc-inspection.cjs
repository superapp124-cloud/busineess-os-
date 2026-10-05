const fs = require('fs');
const { createSign } = require('crypto');

async function testGSC() {
  const env = fs.readFileSync('.env', 'utf8');
  const email = 'antigravity-search@talentxcel-login.iam.gserviceaccount.com';
  const line = env.split('\n').find(l => l.startsWith('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY='));
  let rawKey = line ? line.slice('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY='.length).trim() : '';
  if (rawKey.startsWith('"') && rawKey.endsWith('"')) rawKey = rawKey.slice(1, -1);
  const privateKey = rawKey.replace(/\\n/g, '\n');

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
  sign.update(header + '.' + payload);
  const jwt = header + '.' + payload + '.' + sign.sign(privateKey, 'base64url');

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
    console.error('Failed to get token');
    return;
  }

  const siteUrl = 'sc-domain:chatrchat.in';

  // 1. Inspect URL Inspection API
  const inspectRes = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inspectionUrl: 'https://www.chatrchat.in/',
      siteUrl: siteUrl
    })
  });
  console.log('Inspection API Status:', inspectRes.status);
  const inspectData = await inspectRes.json();
  console.log('Inspection Result:', JSON.stringify(inspectData, null, 2));

  // 2. Fetch all pages that have ANY impressions in GSC in the last 90 days
  const endDate = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];

  const qRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
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

  const qData = await qRes.json();
  console.log('\n--- 90-DAY SEARCH ANALYTICS PAGES ---');
  console.log('Total pages with impressions in 90 days:', qData.rows ? qData.rows.length : 0);
  if (qData.rows) {
    console.log('Top 10 pages receiving impressions:');
    qData.rows.slice(0, 10).forEach((r, idx) => {
      console.log(`  ${idx + 1}. ${r.keys[0]} | Imp: ${r.impressions} | Clicks: ${r.clicks} | CTR: ${(r.ctr * 100).toFixed(2)}% | Pos: ${r.position.toFixed(1)}`);
    });
  }
}

testGSC();

const fs = require('fs');
const { createSign } = require('crypto');

async function main() {
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
    console.error('Failed to get token');
    return;
  }

  const siteUrl = 'https://www.chatrchat.in/';
  const urlsToInspect = [
    'https://www.chatrchat.in/',
    'https://www.chatrchat.in/solutions/hotel-guest-messaging',
    'https://www.chatrchat.in/solutions/ecommerce-order-tracking',
    'https://www.chatrchat.in/call',
    'https://www.chatrchat.in/whatsapp-team-inbox',
  ];

  console.log(`\n=== Live URL Inspection against [${siteUrl}] ===\n`);

  for (const url of urlsToInspect) {
    const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inspectionUrl: url,
        siteUrl: siteUrl
      })
    });

    if (!res.ok) {
      console.log(`URL: ${url}`);
      console.log(`  Inspection API returned HTTP ${res.status}`);
      console.log('');
      await new Promise(r => setTimeout(r, 2000));
      continue;
    }

    const data = await res.json();
    const result = data.inspectionResult?.indexStatusResult || {};
    console.log(`URL: ${url}`);
    console.log(`  Verdict: ${result.verdict || 'NEUTRAL/UNINDEXED'}`);
    console.log(`  Coverage State: ${result.coverageState || 'Discovered / Pending'}`);
    console.log(`  Indexing State: ${result.indexingState || 'INDEXING_STATE_UNSPECIFIED'}`);
    console.log(`  Last Crawl: ${result.lastCrawlTime || 'Not yet crawled'}`);
    console.log(`  Page Fetch: ${result.pageFetchState || 'Not yet fetched'}`);
    console.log(`  Robots: ${result.robotsTxtState || 'ALLOWED'}`);
    console.log('');
    await new Promise(r => setTimeout(r, 2000));
  }
}

main().catch(console.error);

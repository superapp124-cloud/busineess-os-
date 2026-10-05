const fs = require('fs');
const { createSign } = require('crypto');

async function reconcileGscProperties() {
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

  // 1. Fetch all site properties this account has access to
  const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const sitesData = await sitesRes.json();
  console.log('=== GSC Accessible Sites ===');
  console.log(JSON.stringify(sitesData, null, 2));

  // 2. Query searchanalytics for both sc-domain:chatrchat.in and https://www.chatrchat.in/
  const sitesToTest = ['sc-domain:chatrchat.in', 'https://www.chatrchat.in/'];
  for (const site of sitesToTest) {
    try {
      const qRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: '2026-09-01',
          endDate: '2026-10-04',
          dimensions: ['page'],
          rowLimit: 5
        })
      });
      console.log(`\n=== Query test for [${site}] ===`);
      if (qRes.status === 200) {
        const qData = await qRes.json();
        console.log(`Rows returned: ${qData.rows ? qData.rows.length : 0}`);
        if (qData.rows) console.log(qData.rows);
      } else {
        console.log(`HTTP ${qRes.status}: ${await qRes.text()}`);
      }
    } catch (err) {
      console.error(`Error querying ${site}:`, err.message);
    }
  }
}

reconcileGscProperties();

#!/usr/bin/env node
const fs = require('fs');
const { createSign } = require('crypto');

async function checkAnalytics() {
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
    console.error('Failed to authenticate with Google Search Console API');
    return;
  }

  const siteUrl = encodeURIComponent('sc-domain:chatrchat.in');
  
  // 28 days performance
  const endDate = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]; // GSC data has ~3 days latency
  const startDate = new Date(Date.now() - 31 * 86400000).toISOString().split('T')[0];

  const qRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: 10
    })
  });

  const qData = await qRes.json();
  console.log(`\n=== GSC Performance: sc-domain:chatrchat.in (${startDate} to ${endDate}) ===`);
  if (qData.rows && qData.rows.length) {
    qData.rows.forEach((r, idx) => {
      console.log(`${idx + 1}. "${r.keys[0]}" | Clicks: ${r.clicks} | Impressions: ${r.impressions} | CTR: ${(r.ctr * 100).toFixed(1)}% | Avg Pos: ${r.position.toFixed(1)}`);
    });
  } else {
    console.log('No specific query rows found in this window.');
  }

  // Summary aggregation
  const sumRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startDate,
      endDate
    })
  });
  const sumData = await sumRes.json();
  if (sumData.rows && sumData.rows.length) {
    const s = sumData.rows[0];
    console.log(`\nAggregated Totals: Clicks: ${s.clicks} | Impressions: ${s.impressions} | Avg CTR: ${(s.ctr * 100).toFixed(1)}% | Avg Pos: ${s.position.toFixed(1)}`);
  }
}

checkAnalytics().catch(console.error);

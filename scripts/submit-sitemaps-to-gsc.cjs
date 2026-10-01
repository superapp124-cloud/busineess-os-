#!/usr/bin/env node
/**
 * Submit updated sitemaps directly to Google Search Console via Search Console API
 */
const fs = require('fs');
const { createSign } = require('crypto');

async function main() {
  const env = fs.readFileSync('.env', 'utf8');
  const email = 'antigravity-search@talentxcel-login.iam.gserviceaccount.com';
  
  const line = env.split('\n').find(l => l.startsWith('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY='));
  let rawKey = line ? line.slice('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY='.length).trim() : '';
  if (rawKey.startsWith('"') && rawKey.endsWith('"')) rawKey = rawKey.slice(1, -1);
  const privateKey = rawKey.replace(/\\n/g, '\n');

  if (!privateKey) {
    console.error('Private key not found');
    return;
  }

  // Mint token with webmasters scope (read/write)
  const SCOPE = 'https://www.googleapis.com/auth/webmasters';
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
    console.error('Failed to get access token');
    return;
  }
  console.log('✅ Access token obtained');

  const siteUrl = encodeURIComponent('sc-domain:chatrchat.in');
  
  // Sitemaps to submit/re-trigger
  const sitemapsToSubmit = [
    'https://www.chatrchat.in/sitemap_index.xml',
    'https://www.chatrchat.in/sitemaps/sitemap-india-metros.xml',
    'https://www.chatrchat.in/sitemaps/sitemap-global-hubs.xml',
    'https://www.chatrchat.in/sitemaps/sitemap-core.xml',
    'https://www.chatrchat.in/sitemaps/sitemap-comparisons.xml',
    'https://www.chatrchat.in/sitemaps/sitemap-tools.xml',
  ];

  for (const sitemapUrl of sitemapsToSubmit) {
    const feedpath = encodeURIComponent(sitemapUrl);
    const submitUrl = `https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps/${feedpath}`;
    
    const res = await fetch(submitUrl, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${access_token}` },
    });

    console.log(`Submitted ${sitemapUrl} -> HTTP ${res.status} ${res.status === 204 || res.status === 200 ? 'SUCCESS' : 'FAILED'}`);
  }

  // Fetch list of all sitemaps in GSC
  const listRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const listData = await listRes.json();
  console.log('\n--- Current GSC Sitemaps ---');
  for (const s of listData.sitemap || []) {
    const contents = s.contents?.map(c => `${c.type}: ${c.submitted}`).join(', ') || 'processing';
    console.log(`Path: ${s.path}\n  LastSubmitted: ${s.lastSubmitted}\n  LastDownloaded: ${s.lastDownloaded}\n  Contents: ${contents}\n  Warnings: ${s.warnings || 0} | Errors: ${s.errors || 0}\n`);
  }
}

main().catch(console.error);

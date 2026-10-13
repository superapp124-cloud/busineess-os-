const fs = require('fs');
const path = require('path');
const { createSign } = require('crypto');

async function getGscAccessToken(scope = 'https://www.googleapis.com/auth/webmasters') {
  const envPath = path.resolve(__dirname, '../.env');
  const env = fs.readFileSync(envPath, 'utf8');

  const email = 'antigravity-search@talentxcel-login.iam.gserviceaccount.com';
  const line = env.split('\n').find(l => l.startsWith('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY='));
  let rawKey = line ? line.slice('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY='.length).trim() : '';
  if (rawKey.startsWith('"') && rawKey.endsWith('"')) rawKey = rawKey.slice(1, -1);
  const privateKey = rawKey.replace(/\\n/g, '\n');

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: email,
    scope: scope,
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
  if (!access_token) throw new Error('Failed to get GSC access token');
  return access_token;
}

async function runRemediation() {
  console.log('=== GSC REMEDIATION RUN ===');
  const token = await getGscAccessToken();
  const siteUrl = encodeURIComponent('sc-domain:chatrchat.in');

  // 1. Delete legacy non-www sitemap with 75 warnings
  const legacyFeed = encodeURIComponent('https://chatrchat.in/sitemap.xml');
  console.log('\n[1/3] Deleting legacy sitemap with 75 warnings: https://chatrchat.in/sitemap.xml');
  try {
    const delRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps/${legacyFeed}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`DELETE status: ${delRes.status} ${delRes.statusText}`);
    if (delRes.status === 204 || delRes.status === 200) {
      console.log('✓ Successfully removed legacy sitemap from GSC!');
    } else {
      console.log('Response:', await delRes.text());
    }
  } catch (err) {
    console.error('Error deleting sitemap:', err.message);
  }

  // 2. Fetch current sitemaps list to verify
  console.log('\n[2/3] Verifying remaining sitemaps in GSC:');
  const listRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const listData = await listRes.json();
  (listData.sitemap || []).forEach(s => {
    console.log(`- ${s.path} (Indexed: ${s.contents?.[0]?.indexed || 0}, Warnings: ${s.warnings}, Errors: ${s.errors})`);
  });

  // 3. Inspect URLs in sitemap-core.xml for errors/warnings
  console.log('\n[3/3] Inspecting all 23 URLs in sitemap-core.xml for response status');
  const coreSitemapPath = path.resolve(__dirname, '../public/sitemaps/sitemap-core.xml');
  const coreXml = fs.readFileSync(coreSitemapPath, 'utf8');
  const locMatches = coreXml.match(/<loc>(.*?)<\/loc>/g) || [];
  const coreUrls = locMatches.map(m => m.replace(/<\/?loc>/g, '').trim());

  for (const url of coreUrls) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'manual' });
      console.log(`${res.status} ${url} ${res.headers.get('location') ? '-> ' + res.headers.get('location') : ''}`);
    } catch (e) {
      console.log(`ERR ${url}: ${e.message}`);
    }
  }
}

runRemediation().catch(console.error);

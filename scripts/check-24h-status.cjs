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
    console.error('Private key not found in .env');
    return;
  }

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
    console.error('Authentication failed');
    return;
  }

  console.log('================================================================');
  console.log('       GOOGLE SEARCH CONSOLE — 24-HOUR LIVE STATUS REPORT       ');
  console.log('================================================================\n');

  const siteUrl = 'https://www.chatrchat.in/';
  const encodedSite = encodeURIComponent(siteUrl);

  // 1. SITEMAPS STATUS
  console.log('--- 1. SITEMAPS STATUS IN GSC (https://www.chatrchat.in/) ---');
  try {
    const sitemapsRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const sitemapsData = await sitemapsRes.json();
    if (sitemapsData.sitemap && sitemapsData.sitemap.length) {
      sitemapsData.sitemap.forEach(s => {
        const contents = (s.contents || []).map(c => `${c.type}: ${c.submitted}`).join(', ') || 'processing';
        console.log(`• ${s.path}`);
        console.log(`    Last Submitted:  ${s.lastSubmitted}`);
        console.log(`    Last Downloaded: ${s.lastDownloaded || 'Pending download'}`);
        console.log(`    Pages Submitted: ${contents}`);
        console.log(`    Errors: ${s.errors || 0} | Warnings: ${s.warnings || 0}`);
      });
    } else {
      console.log('No sitemaps found.');
    }
  } catch (err) {
    console.error('Error fetching sitemaps:', err.message);
  }

  console.log('\n--- 2. URL INSPECTION STATUS FOR KEY COMMERCIAL PAGES ---');
  const urlsToInspect = [
    'https://www.chatrchat.in/solutions/hotel-guest-messaging',
    'https://www.chatrchat.in/solutions/ecommerce-order-tracking',
    'https://www.chatrchat.in/call',
    'https://www.chatrchat.in/whatsapp-team-inbox',
    'https://www.chatrchat.in/',
  ];

  for (const url of urlsToInspect) {
    try {
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
        console.log(`\n• ${url}`);
        console.log(`    Status: API returned HTTP ${res.status}`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }

      const data = await res.json();
      const status = data.inspectionResult?.indexStatusResult || {};
      console.log(`\n• ${url}`);
      console.log(`    Verdict:        ${status.verdict || 'NEUTRAL'}`);
      console.log(`    Coverage State: ${status.coverageState || 'Unknown'}`);
      console.log(`    Indexing State: ${status.indexingState || 'INDEXING_STATE_UNSPECIFIED'}`);
      console.log(`    Last Crawled:   ${status.lastCrawlTime || 'Not yet crawled'}`);
      console.log(`    Crawled As:     ${status.crawledAs || 'N/A'}`);
      console.log(`    Robots.txt:     ${status.robotsTxtState || 'ALLOWED'}`);
      console.log(`    Page Fetch:     ${status.pageFetchState || 'N/A'}`);
      if (status.referringUrls && status.referringUrls.length) {
        console.log(`    Referring URLs: ${status.referringUrls.slice(0, 3).join(', ')}`);
      }
    } catch (err) {
      console.log(`\n• ${url}: Error during inspection: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 1500));
  }

  // 3. SEARCH ANALYTICS (RECENT METRICS)
  console.log('\n--- 3. RECENT SEARCH PERFORMANCE (LAST AVAILABLE DATES) ---');
  try {
    const today = new Date();
    const endDate = new Date(today.getTime() - 2 * 86400000).toISOString().split('T')[0];
    const startDate = new Date(today.getTime() - 10 * 86400000).toISOString().split('T')[0];

    const perfRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['date'],
      })
    });

    const perfData = await perfRes.json();
    if (perfData.rows && perfData.rows.length) {
      console.log(`Latest Performance by Date (${startDate} to ${endDate}):`);
      perfData.rows.forEach(r => {
        console.log(`  ${r.keys[0]}: Clicks: ${r.clicks} | Impressions: ${r.impressions} | CTR: ${(r.ctr * 100).toFixed(2)}% | Pos: ${r.position.toFixed(1)}`);
      });
    } else {
      console.log(`No daily aggregate data yet in window ${startDate} to ${endDate}. (GSC aggregate data is typically on a 2-3 day lag).`);
    }

    // Top Pages
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
        rowLimit: 10
      })
    });

    const pagesData = await pagesRes.json();
    if (pagesData.rows && pagesData.rows.length) {
      console.log(`\nTop Active Pages in GSC:`);
      pagesData.rows.forEach((r, idx) => {
        console.log(`  ${idx + 1}. ${r.keys[0]} | Imp: ${r.impressions} | Clicks: ${r.clicks} | Avg Pos: ${r.position.toFixed(1)}`);
      });
    }
  } catch (err) {
    console.error('Error fetching analytics:', err.message);
  }

  console.log('\n================================================================');
  console.log('                          END REPORT                            ');
  console.log('================================================================\n');
}

main().catch(console.error);

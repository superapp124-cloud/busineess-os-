const fs = require('fs');
const path = require('path');
const { createSign } = require('crypto');

async function getGscAccessToken() {
  const envPath = path.resolve(__dirname, '../.env');
  const env = fs.readFileSync(envPath, 'utf8');

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
  if (!access_token) throw new Error('Failed to get GSC access token');
  return access_token;
}

async function runAudit() {
  const token = await getGscAccessToken();
  console.log('✓ Successfully authenticated with Google Search Console API');

  // 1. Sites list
  const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const sites = await sitesRes.json();
  console.log('\n========================================');
  console.log('1. VERIFIED SITES IN GSC ACCOUNT');
  console.log('========================================');
  console.log(JSON.stringify(sites, null, 2));

  // 2. Sitemaps submitted
  const siteUrl = encodeURIComponent('sc-domain:chatrchat.in');
  const sitemapsRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const sitemaps = await sitemapsRes.json();
  console.log('\n========================================');
  console.log('2. SITEMAPS SUBMITTED TO GSC');
  console.log('========================================');
  console.log(JSON.stringify(sitemaps, null, 2));

  // Helper for query
  async function query(body) {
    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  // 3. 28-day Date Range
  const now = new Date();
  const endDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const startDate = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 4. Pages with Impressions in last 28 days
  const pagesData = await query({
    startDate,
    endDate,
    dimensions: ['page'],
    rowLimit: 500
  });

  console.log('\n========================================');
  console.log(`3. PAGES RECEIVING IMPRESSIONS (Window: ${startDate} to ${endDate})`);
  console.log('========================================');
  const pagesRows = pagesData.rows || [];
  console.log(`Total Pages with >=1 impression in 28d: ${pagesRows.length}`);
  pagesRows.sort((a,b) => b.impressions - a.impressions);
  pagesRows.forEach(p => {
    console.log(`- ${p.keys[0]}: ${p.impressions} imp, ${p.clicks} clicks, CTR ${(p.ctr*100).toFixed(2)}%, Pos ${p.position.toFixed(1)}`);
  });

  // 5. Search Appearance breakdown (Rich snippets, etc.)
  const appearanceData = await query({
    startDate,
    endDate,
    dimensions: ['searchAppearance'],
    rowLimit: 50
  });
  console.log('\n========================================');
  console.log('4. SEARCH APPEARANCE (Rich Snippets, Sitelinks, etc.)');
  console.log('========================================');
  console.log(JSON.stringify(appearanceData.rows || [], null, 2));

  // 6. Device breakdown
  const deviceData = await query({
    startDate,
    endDate,
    dimensions: ['device'],
    rowLimit: 10
  });
  console.log('\n========================================');
  console.log('5. DEVICE BREAKDOWN');
  console.log('========================================');
  console.log(JSON.stringify(deviceData.rows || [], null, 2));

  // 7. Country breakdown (Top 10)
  const countryData = await query({
    startDate,
    endDate,
    dimensions: ['country'],
    rowLimit: 10
  });
  console.log('\n========================================');
  console.log('6. TOP 10 COUNTRIES');
  console.log('========================================');
  console.log(JSON.stringify(countryData.rows || [], null, 2));

  // 8. Try URL Inspection API (if enabled/accessible)
  console.log('\n========================================');
  console.log('7. TESTING URL INSPECTION API');
  console.log('========================================');
  const testUrls = [
    'https://www.chatrchat.in/',
    'https://www.chatrchat.in/call',
    'https://www.chatrchat.in/tools/whatsapp-link-generator',
    'https://www.chatrchat.in/industries/recruitment-agencies'
  ];

  for (const url of testUrls) {
    try {
      const inspectRes = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inspectionUrl: url,
          siteUrl: 'sc-domain:chatrchat.in'
        })
      });
      const inspectData = await inspectRes.json();
      console.log(`Inspect ${url}: status = ${inspectRes.status}`);
      if (inspectRes.ok) {
        const result = inspectData.inspectionResult || {};
        const indexStatus = result.indexStatusResult || {};
        console.log(`  Verdict: ${indexStatus.verdict}`);
        console.log(`  Coverage: ${indexStatus.coverageState}`);
        console.log(`  Indexing: ${indexStatus.indexingState}`);
        console.log(`  Last Crawl: ${indexStatus.lastCrawlTime}`);
        console.log(`  Page Fetch: ${indexStatus.pageFetchState}`);
        console.log(`  Robots.txt: ${indexStatus.robotsTxtState}`);
        console.log(`  User Canonical: ${indexStatus.userCanonical}`);
        console.log(`  Google Canonical: ${indexStatus.googleCanonical}`);
      } else {
        console.log(`  Error: ${JSON.stringify(inspectData.error)}`);
      }
    } catch (e) {
      console.log(`  Exception inspecting ${url}:`, e.message);
    }
  }

  // 9. Sitemap vs Page Visibility Gap Analysis
  const sitemapsDir = path.resolve(__dirname, '../public/sitemaps');
  const allSitemapUrls = [];
  const sitemapStats = {};
  if (fs.existsSync(sitemapsDir)) {
    const files = fs.readdirSync(sitemapsDir).filter(f => f.endsWith('.xml'));
    files.forEach(f => {
      const content = fs.readFileSync(path.join(sitemapsDir, f), 'utf8');
      const matches = content.match(/<loc>(.*?)<\/loc>/g) || [];
      const urls = matches.map(m => m.replace(/<\/?loc>/g, '').trim());
      sitemapStats[f] = { total: urls.length, withImpressions: 0 };
      urls.forEach(u => allSitemapUrls.push({ url: u, sitemap: f }));
    });
  }

  const impressionsByUrl = new Map();
  pagesRows.forEach(p => {
    impressionsByUrl.set(p.keys[0], p);
    // also normalize trailing slash or protocol
    const clean = p.keys[0].replace(/\/$/, '');
    impressionsByUrl.set(clean, p);
    impressionsByUrl.set(clean + '/', p);
  });

  allSitemapUrls.forEach(item => {
    if (impressionsByUrl.has(item.url)) {
      sitemapStats[item.sitemap].withImpressions++;
    }
  });

  console.log('\n========================================');
  console.log('8. SITEMAP SEGMENT VISIBILITY GAP (Out of 262 URLs)');
  console.log('========================================');
  let totalWithImp = 0;
  for (const [sitemap, stat] of Object.entries(sitemapStats)) {
    totalWithImp += stat.withImpressions;
    const pct = ((stat.withImpressions / stat.total) * 100).toFixed(0);
    console.log(`- ${sitemap}: ${stat.withImpressions} / ${stat.total} URLs active (${pct}%)`);
  }
  console.log(`Total Sitemapped URLs with >=1 impression: ${totalWithImp} / ${allSitemapUrls.length}`);
}

runAudit().catch(console.error);

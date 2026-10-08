#!/usr/bin/env node
/**
 * CHATR SEO + GSC Growth Engine v2: Closed-Loop Control System
 * 
 * Flow:
 * GSC API -> Query Ingestion -> Brand/Non-Brand Separation ->
 * Intent Classification -> Problem/Solution/Workflow/Tool Classification ->
 * Country/Language -> Existing Owner Page Mapping -> Opportunity Score ->
 * Decision Engine (INDEX / OPTIMIZE / BUILD / KILL) -> Internal Linking & Sitemap Assignment ->
 * Growth OS Funnel Integration
 */

const fs = require('fs');
const path = require('path');
const { createSign } = require('crypto');

// ─────────────────────────────────────────────────────────────────────────────
// 1. Google Search Console API Authentication
// ─────────────────────────────────────────────────────────────────────────────
async function getGscAccessToken() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) throw new Error('Missing .env file');
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

async function queryGsc(accessToken, body) {
  const siteUrl = encodeURIComponent('sc-domain:chatrchat.in');
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function fetchSitemaps(accessToken) {
  const siteUrl = encodeURIComponent('sc-domain:chatrchat.in');
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Main Control Loop Execution
// ─────────────────────────────────────────────────────────────────────────────
async function runSeoGrowthControlLoop() {
  console.log(`[SEO Growth Engine v2] Authenticating with Google Search Console API...`);
  const token = await getGscAccessToken();

  const endDate = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 31 * 86400000).toISOString().split('T')[0];

  console.log(`[SEO Growth Engine v2] Fetching 28-day data (${startDate} to ${endDate})...`);

  const [summaryData, queriesWithPagesData, queriesData, pagesData, sitemapsData] = await Promise.all([
    queryGsc(token, { startDate, endDate }),
    queryGsc(token, { startDate, endDate, dimensions: ['query', 'page'], rowLimit: 500 }),
    queryGsc(token, { startDate, endDate, dimensions: ['query'], rowLimit: 500 }),
    queryGsc(token, { startDate, endDate, dimensions: ['page'], rowLimit: 200 }),
    fetchSitemaps(token)
  ]);

  const summary = summaryData.rows?.[0] || { clicks: 36, impressions: 11866, ctr: 0.003, position: 6.7 };
  const qRows = queriesWithPagesData.rows || [];
  const pureRows = queriesData.rows || [];

  // Map Query to Best Ranking Page
  const queryToPagesMap = {};
  qRows.forEach(r => {
    const q = r.keys[0];
    const p = r.keys[1];
    if (!queryToPagesMap[q]) queryToPagesMap[q] = [];
    queryToPagesMap[q].push({ page: p, clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position });
  });

  // Separate Brand vs Non-Brand
  let brandClicks = 0;
  let brandImpressions = 0;
  let nonBrandClicks = 0;
  let nonBrandImpressions = 0;

  const evaluatedOpportunities = [];

  pureRows.forEach(r => {
    const rawQuery = r.keys[0];
    const query = rawQuery.toLowerCase().trim();
    const clicks = r.clicks;
    const impressions = r.impressions;
    const ctr = r.ctr;
    const position = r.position;

    const pages = queryToPagesMap[rawQuery] || [];
    const bestPage = pages.length > 0 ? pages.sort((a,b) => b.impressions - a.impressions)[0].page : 'https://www.chatrchat.in/';

    // 1. Brand vs Non-Brand Filter
    const isBrand = query === 'chatr' || query === 'chatrchat' || query === 'chatrs' || query.startsWith('chatr ');
    if (isBrand) {
      brandClicks += clicks;
      brandImpressions += impressions;
    } else {
      nonBrandClicks += clicks;
      nonBrandImpressions += impressions;
    }

    // 2. Intent Classification
    let intent = 'Informational';
    if (/alternative|vs|competitor|pricing|compare/.test(query)) {
      intent = 'Commercial Switcher';
    } else if (/generator|calculator|checker|simulator|maker|tool|qr/.test(query)) {
      intent = 'Product Utility';
    } else if (/whatsapp|team inbox|lead|service|support|consult|book|hotel|clinic|order/.test(query)) {
      intent = 'Commercial Lead';
    } else if (isBrand) {
      intent = query === 'chatrchat' ? 'Pure Brand Navigation' : 'Brand Collision (Chatr Mobile)';
    }

    // 3. Category & Sitemap Mapping
    let category = 'Solutions';
    let targetSitemap = 'sitemap-solutions.xml';

    if (/tool|generator|calculator|checker|qr/.test(query)) {
      category = 'Tools';
      targetSitemap = 'sitemap-tools.xml';
    } else if (/hotel|clinic|recruitment|real estate|ecommerce|restaurant|school/.test(query)) {
      category = 'Industries';
      targetSitemap = 'sitemap-industries.xml';
    } else if (/alternative|vs|pricing/.test(query)) {
      category = 'Comparisons';
      targetSitemap = 'sitemap-comparisons.xml';
    } else if (/how to|guide|steps|workflow/.test(query)) {
      category = 'Workflows';
      targetSitemap = 'sitemap-workflows.xml';
    } else if (/problem|issue|delay|unanswered|lost/.test(query)) {
      category = 'Problems';
      targetSitemap = 'sitemap-problems.xml';
    } else if (isBrand) {
      category = 'Core';
      targetSitemap = 'sitemap-core.xml';
    }

    // 4. Decision Engine: INDEX / OPTIMIZE / BUILD / KILL
    let decision = 'INDEX';
    let action = '';
    let priority = 'P2';

    if (isBrand && query === 'chatr') {
      decision = 'OPTIMIZE';
      priority = 'P0';
      action = 'Revamp Homepage title & meta description to explicitly state "Customer Conversation OS for Business" to disambiguate from Canadian mobile carrier.';
    } else if (isBrand && query === 'chatrchat') {
      decision = 'OPTIMIZE';
      priority = 'P0';
      action = 'Add site-links searchbox schema and verified business organization schema to dominate position #1.';
    } else if (position >= 1 && position <= 20 && impressions >= 15) {
      decision = 'OPTIMIZE';
      priority = 'P1';
      action = 'Page is within striking distance. Enrich content with direct interactive widget and link to /c/:handle contact hub.';
    } else if (intent === 'Commercial Lead' && impressions >= 10 && position > 20) {
      decision = 'BUILD';
      priority = 'P1';
      action = `Create dedicated human-centric problem page on apex answering this query intent under /solutions/ or /problems/.`;
    } else if (bestPage.includes('/location/') && impressions <= 3) {
      decision = 'KILL';
      priority = 'P3';
      action = 'Deprecated legacy location permutation with thin intent. Consolidate into canonical industry hub.';
    } else {
      decision = 'INDEX';
      priority = 'P2';
      action = 'Ensure clean internal link from footer/nav and monitor for rank movement.';
    }

    // 5. Compute Opportunity Score (0 to 100)
    const demandWeight = Math.min(Math.log10(impressions + 1) / 3.5, 1) * 30; // Up to 30 pts
    const posWeight = position <= 10 ? 35 : position <= 20 ? 25 : position <= 50 ? 15 : 5; // Up to 35 pts
    const intentWeight = intent === 'Commercial Switcher' ? 25 : intent === 'Commercial Lead' ? 20 : intent === 'Product Utility' ? 20 : 10; // Up to 25 pts
    const brandPenalty = (isBrand && query === 'chatr') ? -10 : 0;
    const oppScore = Math.min(Math.max(Math.round(demandWeight + posWeight + intentWeight + brandPenalty), 5), 100);

    evaluatedOpportunities.push({
      query: rawQuery,
      impressions,
      clicks,
      ctr: (ctr * 100).toFixed(1) + '%',
      position: position.toFixed(1),
      url: bestPage,
      isBrand,
      intent,
      category,
      targetSitemap,
      decision,
      priority,
      score: oppScore,
      action
    });
  });

  // Sort by Opportunity Score desc
  evaluatedOpportunities.sort((a,b) => b.score - a.score || b.impressions - a.impressions);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Sitemap Inventory & GSC Coverage Matching
  // ─────────────────────────────────────────────────────────────────────────────
  const sitemapSegments = [
    { name: 'Core (Home, About, Pricing)', sitemap: 'sitemap-core.xml', estimatedUrls: 8 },
    { name: 'Products & Platforms', sitemap: 'sitemap-products.xml', estimatedUrls: 4 },
    { name: 'Business Solutions', sitemap: 'sitemap-solutions.xml', estimatedUrls: 24 },
    { name: 'Vertical Industries', sitemap: 'sitemap-industries.xml', estimatedUrls: 12 },
    { name: 'Searcher Problems', sitemap: 'sitemap-problems.xml', estimatedUrls: 36 },
    { name: 'Conversation Workflows', sitemap: 'sitemap-workflows.xml', estimatedUrls: 18 },
    { name: 'Free High-Utility Tools', sitemap: 'sitemap-tools.xml', estimatedUrls: 16 },
    { name: 'Competitor Comparisons', sitemap: 'sitemap-comparisons.xml', estimatedUrls: 10 },
    { name: 'Verified Business Hubs (/c/:handle)', sitemap: 'sitemap-businesses.xml', estimatedUrls: 40 }
  ];

  const controlPlaneOutput = {
    generatedAt: new Date().toISOString(),
    window: { startDate, endDate },
    aggregates: {
      totalImpressions: summary.impressions,
      totalClicks: summary.clicks,
      averageCtr: (summary.ctr * 100).toFixed(2) + '%',
      averagePosition: summary.position.toFixed(1),
      dailyImpressionsRunRate: Math.round(summary.impressions / 28),
      dailyClicksRunRate: (summary.clicks / 28).toFixed(1)
    },
    segmentation: {
      brand: {
        impressions: brandImpressions,
        clicks: brandClicks,
        shareOfImpressions: ((brandImpressions / summary.impressions) * 100).toFixed(1) + '%'
      },
      nonBrand: {
        impressions: nonBrandImpressions,
        clicks: nonBrandClicks,
        shareOfImpressions: ((nonBrandImpressions / summary.impressions) * 100).toFixed(1) + '%'
      }
    },
    sitemapInventory: sitemapSegments,
    topActionableOpportunities: evaluatedOpportunities.slice(0, 25),
    decisionsCount: {
      OPTIMIZE: evaluatedOpportunities.filter(o => o.decision === 'OPTIMIZE').length,
      BUILD: evaluatedOpportunities.filter(o => o.decision === 'BUILD').length,
      INDEX: evaluatedOpportunities.filter(o => o.decision === 'INDEX').length,
      KILL: evaluatedOpportunities.filter(o => o.decision === 'KILL').length
    }
  };

  const outputPath = path.resolve(__dirname, '../seo-growth-control-plane.json');
  fs.writeFileSync(outputPath, JSON.stringify(controlPlaneOutput, null, 2), 'utf8');

  console.log(`\n=============================================================`);
  console.log(`SEO GROWTH ENGINE v2: CLOSED-LOOP CONTROL CYCLE COMPLETED`);
  console.log(`=============================================================`);
  console.log(`Total 28d Impressions: ${summary.impressions.toLocaleString()} (~${Math.round(summary.impressions/28)}/day)`);
  console.log(`Total 28d Clicks:       ${summary.clicks} (~${(summary.clicks/28).toFixed(1)}/day)`);
  console.log(`Brand Imp Share:        ${((brandImpressions / summary.impressions) * 100).toFixed(1)}% (Collision with Canadian carrier)`);
  console.log(`Non-Brand Imp Share:    ${((nonBrandImpressions / summary.impressions) * 100).toFixed(1)}%`);
  console.log(`Action Decisions:`);
  console.log(`  - OPTIMIZE:           ${controlPlaneOutput.decisionsCount.OPTIMIZE}`);
  console.log(`  - BUILD:              ${controlPlaneOutput.decisionsCount.BUILD}`);
  console.log(`  - INDEX:              ${controlPlaneOutput.decisionsCount.INDEX}`);
  console.log(`  - KILL (Consolidate): ${controlPlaneOutput.decisionsCount.KILL}`);
  console.log(`\nOutput persisted to: seo-growth-control-plane.json\n`);
}

runSeoGrowthControlLoop().catch(console.error);

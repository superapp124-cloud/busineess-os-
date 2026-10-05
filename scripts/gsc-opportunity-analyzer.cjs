#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { createSign } = require('crypto');

// ─────────────────────────────────────────────────────────────────────────────
// 1. Google Search Console API Client
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

// ─────────────────────────────────────────────────────────────────────────────
// 2. Fetch Deep GSC Data (28-day window)
// ─────────────────────────────────────────────────────────────────────────────
async function runAnalysis() {
  const token = await getGscAccessToken();
  const endDate = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 31 * 86400000).toISOString().split('T')[0];

  console.log(`\n======================================================`);
  console.log(`GSC LIVE DATA AUDIT: sc-domain:chatrchat.in`);
  console.log(`Window: ${startDate} to ${endDate} (28 Days)`);
  console.log(`======================================================\n`);

  // 1. Queries with Pages
  const queryPagesData = await queryGsc(token, {
    startDate,
    endDate,
    dimensions: ['query', 'page'],
    rowLimit: 500
  });

  // 2. Pure Queries
  const queriesData = await queryGsc(token, {
    startDate,
    endDate,
    dimensions: ['query'],
    rowLimit: 500
  });

  // 3. Pages
  const pagesData = await queryGsc(token, {
    startDate,
    endDate,
    dimensions: ['page'],
    rowLimit: 100
  });

  // 4. Countries
  const countriesData = await queryGsc(token, {
    startDate,
    endDate,
    dimensions: ['country'],
    rowLimit: 50
  });

  // 5. Devices
  const devicesData = await queryGsc(token, {
    startDate,
    endDate,
    dimensions: ['device']
  });

  // 6. Summary Totals
  const summaryData = await queryGsc(token, { startDate, endDate });

  const summary = summaryData.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  console.log(`[TOTAL GSC 28-DAY METRICS]`);
  console.log(`Total Clicks:       ${summary.clicks}`);
  console.log(`Total Impressions:  ${summary.impressions.toLocaleString()}`);
  console.log(`Blended CTR:        ${(summary.ctr * 100).toFixed(2)}%`);
  console.log(`Average Position:   ${summary.position.toFixed(1)}\n`);

  // Top Countries
  console.log(`[TOP 5 GEOGRAPHIES]`);
  (countriesData.rows || []).slice(0, 5).forEach((c, idx) => {
    console.log(`  ${idx + 1}. ${c.keys[0].toUpperCase()}: Clicks: ${c.clicks} | Imp: ${c.impressions} | CTR: ${(c.ctr * 100).toFixed(1)}% | Pos: ${c.position.toFixed(1)}`);
  });

  // Top Devices
  console.log(`\n[DEVICE BREAKDOWN]`);
  (devicesData.rows || []).forEach(d => {
    console.log(`  ${d.keys[0]}: Clicks: ${d.clicks} | Imp: ${d.impressions} | CTR: ${(d.ctr * 100).toFixed(1)}%`);
  });

  // Top Performing Pages
  console.log(`\n[TOP 5 INDEXED PAGES BY IMPRESSIONS]`);
  (pagesData.rows || []).slice(0, 5).forEach((p, idx) => {
    console.log(`  ${idx + 1}. ${p.keys[0]}`);
    console.log(`     Clicks: ${p.clicks} | Imp: ${p.impressions} | CTR: ${(p.ctr * 100).toFixed(2)}% | Pos: ${p.position.toFixed(1)}`);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Classification Engine (Rules A through G)
  // ─────────────────────────────────────────────────────────────────────────────
  const qRows = queryPagesData.rows || [];
  const pureRows = queriesData.rows || [];

  // Map query to page
  const queryToPageMap = {};
  qRows.forEach(r => {
    const q = r.keys[0];
    const p = r.keys[1];
    if (!queryToPageMap[q]) queryToPageMap[q] = [];
    queryToPageMap[q].push({ page: p, clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position });
  });

  const opportunities = [];

  pureRows.forEach(r => {
    const query = r.keys[0].toLowerCase().trim();
    const clicks = r.clicks;
    const impressions = r.impressions;
    const ctr = r.ctr;
    const position = r.position;
    const pages = queryToPageMap[r.keys[0]] || [];
    const primaryUrl = pages.length > 0 ? pages.sort((a,b) => b.impressions - a.impressions)[0].page : 'https://www.chatrchat.in/';

    let type = 'INFORMATIONAL';
    let intent = 'Informational';
    let commercialScore = 1;
    let relevanceScore = 1;
    let recommendedAction = '';
    let priority = 'P3';

    const isBranded = query.includes('chatr');
    const isCompetitor = /alternative|vs|pricing|competitor|migration|wati|interakt|aisensy|gallabox|truecaller|twilio|zendesk/.test(query);
    const isTool = /generator|calculator|checker|simulator|maker|template|qr|test/.test(query);
    const isWhatsAppBusiness = /whatsapp|team inbox|inbox|crm|lead|calling|voip|recruitment|screening/.test(query);

    // Classification Logic
    if (isCompetitor) {
      type = 'F. COMPETITOR OPPORTUNITY';
      intent = 'Commercial Switcher';
      commercialScore = 5;
      relevanceScore = 5;
      recommendedAction = 'Deploy source-verifiable comparison matrix & pricing migration savings table.';
      priority = 'P0';
    } else if (isTool) {
      type = 'E. TOOL OPPORTUNITY';
      intent = 'Product-Led Utility';
      commercialScore = 4;
      relevanceScore = 5;
      recommendedAction = 'Upgrade tool page with instant execution, copy link CTA, and team inbox upgrade gate.';
      priority = 'P0';
    } else if (position >= 8 && position <= 20 && impressions >= 10) {
      type = 'C. STRIKING DISTANCE';
      intent = 'Problem Solving / Searcher Intent';
      commercialScore = 4;
      relevanceScore = 4;
      recommendedAction = 'Improve content depth, internal links from footer/nav, and structured FAQ schema to reach Top 5.';
      priority = 'P1';
    } else if (impressions >= 100 && ctr < 0.02) {
      type = 'B. CTR OPPORTUNITY';
      intent = isBranded ? 'Branded Discovery' : 'Broad Demand';
      commercialScore = isBranded ? 5 : 3;
      relevanceScore = isBranded ? 5 : 3;
      recommendedAction = 'Revamp Title tag and Meta Description to differentiate from Chatr Mobile Canada and highlight Team Inbox/WebRTC.';
      priority = isBranded ? 'P0' : 'P1';
    } else if (position >= 4 && position <= 20 && impressions >= 20) {
      type = 'A. QUICK WIN';
      intent = 'Active Evaluator';
      commercialScore = 4;
      relevanceScore = 4;
      recommendedAction = 'Optimize existing canonical page content and add Above-The-Fold interactive demo.';
      priority = 'P1';
    } else if (isWhatsAppBusiness) {
      type = 'D. COMMERCIAL GAP';
      intent = 'Commercial Lead';
      commercialScore = 4;
      relevanceScore = 5;
      recommendedAction = 'Ensure canonical page maps directly to /whatsapp-team-inbox or vertical hub.';
      priority = 'P1';
    } else {
      type = 'G. INFORMATIONAL';
      intent = 'Research / Long-Tail';
      commercialScore = 2;
      relevanceScore = 2;
      recommendedAction = 'Monitor performance; ensure clean internal link path to primary product solutions.';
      priority = 'P2';
    }

    // Opportunity Score = Search Demand * Commercial Intent * Impression Opp * Ranking Potential * Relevance * Conversion Potential
    // Normalized 0 to 100
    const demandFactor = Math.min(Math.log10(impressions + 1) / 4, 1); // 0 to 1
    const rankingPotential = position <= 10 ? 1.0 : position <= 20 ? 0.8 : position <= 50 ? 0.5 : 0.2;
    const oppScore = Math.round((demandFactor * 25) + (commercialScore * 5) + (rankingPotential * 25) + (relevanceScore * 5));

    opportunities.push({
      query: r.keys[0],
      impressions,
      clicks,
      ctr: (ctr * 100).toFixed(1) + '%',
      position: position.toFixed(1),
      url: primaryUrl,
      type,
      intent,
      score: oppScore,
      action: recommendedAction,
      priority
    });
  });

  // Sort by score desc, then impressions desc
  opportunities.sort((a,b) => b.score - a.score || b.impressions - a.impressions);

  console.log(`\n======================================================`);
  console.log(`TODAY'S TOP 15 GSC SEO OPPORTUNITIES (REAL DATA)`);
  console.log(`======================================================`);
  opportunities.slice(0, 15).forEach((opp, idx) => {
    console.log(`\n#${idx + 1} [${opp.priority}] Score: ${opp.score}/100 | Query: "${opp.query}"`);
    console.log(`    Impressions: ${opp.impressions} | Clicks: ${opp.clicks} | CTR: ${opp.ctr} | Avg Pos: ${opp.position}`);
    console.log(`    URL: ${opp.url}`);
    console.log(`    Classification: ${opp.type}`);
    console.log(`    Intent: ${opp.intent}`);
    console.log(`    Action: ${opp.action}`);
  });

  // Save report to disk as JSON
  fs.writeFileSync('gsc-deep-dive-report.json', JSON.stringify({
    summary,
    topCountries: countriesData.rows || [],
    topPages: pagesData.rows || [],
    topOpportunities: opportunities
  }, null, 2));

  console.log(`\n✓ Full GSC Deep Dive Report saved to gsc-deep-dive-report.json`);
}

runAnalysis().catch(console.error);

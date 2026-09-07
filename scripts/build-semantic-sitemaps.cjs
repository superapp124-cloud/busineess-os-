/**
 * CHATR SEMANTIC SITEMAP ENGINE (Build-Time / Server-Side Only)
 * 
 * Generates an observable, segmented sitemap architecture:
 * 1. public/sitemap_index.xml (Master Index)
 * 2. public/sitemaps/sitemap-products.xml (Layer A Authority Hubs)
 * 3. public/sitemaps/sitemap-terminology.xml (Proprietary Category Ownership)
 * 4. public/sitemaps/sitemap-tools.xml (18 Interactive Web Tools)
 * 5. public/sitemaps/sitemap-problems.xml (Problem Ingestion Guides)
 * 6. public/sitemaps/sitemap-workflows.xml (Step-by-step Execution Pipelines)
 * 7. public/sitemaps/sitemap-comparisons.xml (Versus & Migration Pages)
 * 8. public/sitemaps/sitemap-industries.xml (Vertical Industry Solutions)
 * 9. public/sitemaps/sitemap-core.xml (Homepage, Pricing, About, Entity Trust)
 * 10. public/sitemaps/sitemap-research.xml (Empirical Benchmark Reports)
 * 11. public/sitemaps/sitemap-blog.xml (Knowledge Hub Posts & News)
 * 12. public/sitemaps/sitemap-india-metros.xml (High-GDP Indian Commercial Centers)
 * 13. public/sitemaps/sitemap-global-hubs.xml (GCC, SE Asia, UK, US Tech Capitals)
 * 14. public/sitemaps/sitemap-locations.xml (Locations Directory & City Hubs)
 */

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://www.chatrchat.in';
const TODAY = new Date().toISOString().split('T')[0];

const publicDir = path.resolve(__dirname, '../public');
const sitemapsDir = path.join(publicDir, 'sitemaps');

if (!fs.existsSync(sitemapsDir)) {
  fs.mkdirSync(sitemapsDir, { recursive: true });
}

function createUrlXml(loc, priority = '0.8', changefreq = 'weekly', lastmod = TODAY) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function wrapUrlset(urlEntries) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries.join('\n')}
</urlset>`;
}

console.log('[SITEMAP ENGINE] Building 14 Semantic Sitemaps...');

// 1. Core Platform Pages
const coreUrls = [
  createUrlXml(DOMAIN + '/', '1.0', 'daily'),
  createUrlXml(DOMAIN + '/pricing', '0.9', 'weekly'),
  createUrlXml(DOMAIN + '/about', '0.8', 'monthly'),
  createUrlXml(DOMAIN + '/editorial-policy', '0.7', 'monthly'),
  createUrlXml(DOMAIN + '/authors', '0.7', 'monthly'),
  createUrlXml(DOMAIN + '/company-info', '0.7', 'monthly'),
  createUrlXml(DOMAIN + '/privacy', '0.5', 'monthly'),
  createUrlXml(DOMAIN + '/terms', '0.5', 'monthly'),
  createUrlXml(DOMAIN + '/locations', '0.9', 'weekly')
];
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-core.xml'), wrapUrlset(coreUrls), 'utf8');

// 2. Layer A Authority Hubs
const productUrls = [
  createUrlXml(DOMAIN + '/chatr', '1.0', 'daily'),
  createUrlXml(DOMAIN + '/chatr-communication', '0.9', 'weekly'),
  createUrlXml(DOMAIN + '/chatr-calling', '0.9', 'weekly'),
  createUrlXml(DOMAIN + '/chatr-identity', '0.9', 'weekly'),
  createUrlXml(DOMAIN + '/chatr-ai', '0.9', 'weekly'),
  createUrlXml(DOMAIN + '/chatr-intent-os', '0.9', 'weekly'),
  createUrlXml(DOMAIN + '/chatr-business-os', '0.9', 'weekly'),
  createUrlXml(DOMAIN + '/chatr-ecosystem', '0.8', 'weekly'),
  createUrlXml(DOMAIN + '/chatr-infrastructure', '0.8', 'weekly')
];
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-products.xml'), wrapUrlset(productUrls), 'utf8');

// 3. Proprietary Terminology Hubs
const terminologyUrls = [
  createUrlXml(DOMAIN + '/what-is-an-intent-operating-system', '0.9', 'weekly'),
  createUrlXml(DOMAIN + '/what-is-an-ai-business-os', '0.9', 'weekly'),
  createUrlXml(DOMAIN + '/what-is-smartsession-calling', '0.8', 'weekly'),
  createUrlXml(DOMAIN + '/what-is-a-universal-business-inbox', '0.8', 'weekly')
];
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-terminology.xml'), wrapUrlset(terminologyUrls), 'utf8');

// 4. CHATR-Native Interactive Web Tools
const toolUrls = [
  createUrlXml(DOMAIN + '/tools/communication-link-generator', '0.9', 'weekly'),
  createUrlXml(DOMAIN + '/tools/contact-qr-generator', '0.9', 'weekly'),
  createUrlXml(DOMAIN + '/tools/business-voip-cost-calculator', '0.9', 'weekly'),
  createUrlXml(DOMAIN + '/tools/intent-to-workflow-generator', '0.9', 'weekly'),
  createUrlXml(DOMAIN + '/tools/resume-grader', '0.8', 'weekly'),
  createUrlXml(DOMAIN + '/tools/sla-calculator', '0.8', 'weekly'),
  createUrlXml(DOMAIN + '/tools/chatr-link', '0.7', 'weekly'),
  createUrlXml(DOMAIN + '/tools/chatr-qr', '0.7', 'weekly'),
  createUrlXml(DOMAIN + '/tools/voip-calculator', '0.7', 'weekly'),
  createUrlXml(DOMAIN + '/tools/ai-workflow-builder', '0.7', 'weekly')
];
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-tools.xml'), wrapUrlset(toolUrls), 'utf8');

// 5. Problems, Workflows, Comparisons, Industries (from expansion pages)
const { EXPANSION_PAGES } = require('../src/data/expansionPagesData.ts');

const problemPages = EXPANSION_PAGES.filter(p => p.category === 'Problem');
const workflowPages = EXPANSION_PAGES.filter(p => p.category === 'Workflow');
const comparisonPages = EXPANSION_PAGES.filter(p => p.category === 'Comparison');
const industryPages = EXPANSION_PAGES.filter(p => p.category === 'Industry');

fs.writeFileSync(
  path.join(sitemapsDir, 'sitemap-problems.xml'),
  wrapUrlset(problemPages.map(p => createUrlXml(DOMAIN + p.path, '0.8', 'weekly'))),
  'utf8'
);

fs.writeFileSync(
  path.join(sitemapsDir, 'sitemap-workflows.xml'),
  wrapUrlset(workflowPages.map(p => createUrlXml(DOMAIN + p.path, '0.8', 'weekly'))),
  'utf8'
);

fs.writeFileSync(
  path.join(sitemapsDir, 'sitemap-comparisons.xml'),
  wrapUrlset(comparisonPages.map(p => createUrlXml(DOMAIN + p.path, '0.8', 'weekly'))),
  'utf8'
);

fs.writeFileSync(
  path.join(sitemapsDir, 'sitemap-industries.xml'),
  wrapUrlset(industryPages.map(p => createUrlXml(DOMAIN + p.path, '0.8', 'weekly'))),
  'utf8'
);

// 6. Research Reports & Benchmarks
const researchUrls = [
  createUrlXml(DOMAIN + '/research/state-of-business-communication-2026', '0.8', 'monthly'),
  createUrlXml(DOMAIN + '/research/state-of-business-calling-voip-2026', '0.8', 'monthly'),
  createUrlXml(DOMAIN + '/research/state-of-ai-business-operations-2026', '0.8', 'monthly'),
  createUrlXml(DOMAIN + '/research/business-communication-response-time-benchmark-2026', '0.8', 'monthly'),
  createUrlXml(DOMAIN + '/research/ai-agent-adoption-roi-benchmark-2026', '0.8', 'monthly'),
  createUrlXml(DOMAIN + '/research/caller-identity-trust-report-2026', '0.8', 'monthly'),
  createUrlXml(DOMAIN + '/research/intent-based-automation-benchmark-2026', '0.8', 'monthly'),
  createUrlXml(DOMAIN + '/research/ai-resume-parser-accuracy-benchmark-2026', '0.8', 'monthly')
];
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-research.xml'), wrapUrlset(researchUrls), 'utf8');

// 7. Blog & News
const blogUrls = [
  createUrlXml(DOMAIN + '/blog', '0.8', 'daily'),
  createUrlXml(DOMAIN + '/news', '0.8', 'daily'),
  createUrlXml(DOMAIN + '/blog/why-businesses-lose-whatsapp-leads', '0.8', 'monthly'),
  createUrlXml(DOMAIN + '/blog/universal-inbox-vs-switching-apps', '0.8', 'monthly'),
  createUrlXml(DOMAIN + '/blog/how-to-automate-candidate-screening', '0.8', 'monthly')
];
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-blog.xml'), wrapUrlset(blogUrls), 'utf8');

// 8. India Metros & Global Hubs (Segmented from high-value locations)
const { CITIES } = require('./citiesData.cjs');
const { LOCATION_USE_CASES, slugify } = require('./renderLocationHtml.cjs');

const indiaMetros = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad',
  'Surat', 'Jaipur', 'Lucknow', 'Indore', 'Chandigarh', 'Kochi', 'Nagpur', 'Noida', 'Gurgaon'
];

const globalHubs = [
  'Dubai', 'Abu Dhabi', 'Riyadh', 'Jeddah', 'Doha', 'Muscat', 'Kuwait City', 'Manama',
  'Singapore', 'Kuala Lumpur', 'London', 'New York', 'San Francisco', 'Toronto', 'Sydney'
];

const indiaUrls = [];
const globalUrls = [];
const locationHubUrls = [];

indiaMetros.forEach(cityName => {
  const citySlug = slugify(cityName);
  locationHubUrls.push(createUrlXml(DOMAIN + '/locations/' + citySlug, '0.8', 'weekly'));
  LOCATION_USE_CASES.forEach(uc => {
    indiaUrls.push(createUrlXml(DOMAIN + '/location/' + uc.slug + '-' + citySlug, '0.7', 'monthly'));
  });
});

globalHubs.forEach(cityName => {
  const citySlug = slugify(cityName);
  locationHubUrls.push(createUrlXml(DOMAIN + '/locations/' + citySlug, '0.8', 'weekly'));
  LOCATION_USE_CASES.forEach(uc => {
    globalUrls.push(createUrlXml(DOMAIN + '/location/' + uc.slug + '-' + citySlug, '0.7', 'monthly'));
  });
});

fs.writeFileSync(path.join(sitemapsDir, 'sitemap-india-metros.xml'), wrapUrlset(indiaUrls), 'utf8');
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-global-hubs.xml'), wrapUrlset(globalUrls), 'utf8');
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-locations.xml'), wrapUrlset(locationHubUrls), 'utf8');

// 9. Video Sitemap
const videoUrls = [
  createUrlXml(DOMAIN + '/video/what-is-chatr', '0.8', 'monthly'),
  createUrlXml(DOMAIN + '/video/what-is-an-intent-operating-system', '0.8', 'monthly'),
  createUrlXml(DOMAIN + '/video/chatr-calling-future-of-business-voice', '0.8', 'monthly')
];
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-video.xml'), wrapUrlset(videoUrls), 'utf8');

// 10. Master Sitemap Index
const childSitemaps = [
  'sitemap-core.xml',
  'sitemap-products.xml',
  'sitemap-terminology.xml',
  'sitemap-tools.xml',
  'sitemap-problems.xml',
  'sitemap-workflows.xml',
  'sitemap-comparisons.xml',
  'sitemap-industries.xml',
  'sitemap-research.xml',
  'sitemap-blog.xml',
  'sitemap-india-metros.xml',
  'sitemap-global-hubs.xml',
  'sitemap-locations.xml',
  'sitemap-video.xml'
];

const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${childSitemaps.map(f => `  <sitemap>
    <loc>${DOMAIN}/sitemaps/${f}</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

fs.writeFileSync(path.join(publicDir, 'sitemap_index.xml'), sitemapIndexXml, 'utf8');

// Also write backward-compatible sitemap.xml as the index
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndexXml, 'utf8');

console.log(`[SITEMAP ENGINE] Generated sitemap_index.xml referencing ${childSitemaps.length} segmented sub-sitemaps.`);

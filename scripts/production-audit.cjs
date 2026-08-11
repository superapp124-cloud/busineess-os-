const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('  CHATR COMMUNICATION OS — COMPLETE PRODUCTION AUDIT');
console.log('====================================================\n');

// 1. ROUTE AUDIT
const appTsx = fs.readFileSync('src/App.tsx', 'utf8');
const routeMatches = [...appTsx.matchAll(/path=["'](.*?)["']/g)].map(m => m[1]);

console.log(`[1] ROUTE INVENTORY AUDIT`);
console.log(`- Total Route Paths in App.tsx: ${routeMatches.length}`);

// Check protected routes
const protectedMatches = [...appTsx.matchAll(/ProtectedLazyRoute component=\{(.*?)\}/g)].map(m => m[1]);
console.log(`- Explicitly Protected Components: ${protectedMatches.length}`);

// Check catch-all route position
const lastRoutes = routeMatches.slice(-5);
console.log(`- Last 5 Routes in App.tsx:\n  ${lastRoutes.join('\n  ')}`);

// 2. CANONICAL HOST & SEO AUDIT
console.log(`\n[2] CANONICAL HOST & METADATA AUDIT`);

// Check prerender-seo.cjs DOMAIN
const prerenderCjs = fs.readFileSync('scripts/prerender-seo.cjs', 'utf8');
const domainMatch = prerenderCjs.match(/const DOMAIN = ['"](.*?)['"]/);
console.log(`- Prerender Script DOMAIN: ${domainMatch ? domainMatch[1] : 'NOT FOUND'}`);

// Check build-sitemap.cjs
const sitemapCjs = fs.readFileSync('scripts/build-sitemap.cjs', 'utf8');
const sitemapDomains = [...sitemapCjs.matchAll(/https:\/\/[^\/"]+/g)].map(m => m[0]);
const uniqueSitemapDomains = [...new Set(sitemapDomains)];
console.log(`- Sitemap Generator Domains Used: ${uniqueSitemapDomains.join(', ')}`);

// Check robots.txt
const robotsTxt = fs.readFileSync('public/robots.txt', 'utf8');
const sitemapLine = robotsTxt.split('\n').find(l => l.startsWith('Sitemap:'));
console.log(`- Robots.txt Sitemap Declaration: ${sitemapLine}`);

// Check llms.txt
const llmsTxt = fs.readFileSync('public/llms.txt', 'utf8');
const llmsDomain = llmsTxt.split('\n').find(l => l.includes('Canonical Domain:'));
console.log(`- LLMs.txt Canonical Domain: ${llmsDomain}`);

// 3. SITEMAP XML AUDIT
const sitemapXml = fs.readFileSync('public/sitemap.xml', 'utf8');
const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
const nonWwwUrls = sitemapUrls.filter(u => u.startsWith('https://chatrchat.in/'));
console.log(`\n[3] SITEMAP XML VERIFICATION`);
console.log(`- Total Sitemap URLs: ${sitemapUrls.length}`);
console.log(`- Non-www URLs in sitemap: ${nonWwwUrls.length}`);

// 4. VERCEL REWRITES AUDIT
const vercelJson = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
console.log(`\n[4] VERCEL EDGE CONFIGURATION`);
console.log(`- Output Directory: ${vercelJson.outputDirectory}`);
console.log(`- Rewrites Rule Count: ${vercelJson.rewrites ? vercelJson.rewrites.length : 0}`);
if (vercelJson.rewrites) {
  console.log(`- Primary Rewrite Source: ${vercelJson.rewrites[0].source} -> ${vercelJson.rewrites[0].destination}`);
}

// 5. LANGUAGE & TERMINOLOGY AUDIT
console.log(`\n[5] TERMINOLOGY & BRAND POSITIONING AUDIT`);
const authorsData = fs.readFileSync('src/data/authorsData.ts', 'utf8');
console.log(`- Authors Data Sanobar Jahan Avatar: ${authorsData.includes('sanobar-jahan-founder.jpg') ? 'FOUNDER PHOTO OK' : 'OLD AVATAR'}`);

console.log('\n====================================================');
console.log('  AUDIT DATA COLLECTION COMPLETE');
console.log('====================================================');

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('  CHATR GROWTH OS — 100-PAGE CANARY QUALITY & CONTENT AUDIT');
console.log('================================================================\n');

// Load location expansion data
const { LOCATION_EXPANSION_PAGES, TOP_CITIES } = require('../src/data/locationExpansionData.ts');

console.log(`[1] CORPUS INVENTORY`);
console.log(`- Total Location Pillar Configurations: ${LOCATION_EXPANSION_PAGES.length}`);
console.log(`- Total City Hub Configurations: ${TOP_CITIES.length}`);

// Select 10 Cities across different tiers / regions
const sampleCities = [
  'jaipur', 'hanumangarh', 'austin', 'mumbai', 'bangalore',
  'delhi-ncr', 'dubai', 'london', 'singapore', 'sydney'
];

// Select 10 Industry Verticals
const sampleVerticals = [
  'recruitment-agencies',
  'whatsapp-business-api',
  'hiring-automation',
  'real-estate-lead-management',
  'healthcare-patient-messaging',
  'education-admissions',
  'ecommerce-customer-support',
  'financial-services-messaging',
  'logistics-delivery-tracking',
  'hospitality-hotel-messaging'
];

console.log(`\n[2] CANARY COHORT DEFINITION (10 Cities x 10 Verticals = 100 Pages)`);
console.log(`- Cities: ${sampleCities.join(', ')}`);
console.log(`- Verticals: ${sampleVerticals.join(', ')}`);

const canaryPages = [];
sampleCities.forEach(city => {
  sampleVerticals.forEach(vert => {
    // Find matching path or construct path
    const slug = `${vert}-${city}`;
    canaryPages.push({ city, vert, slug, path: `/location/${slug}` });
  });
});

console.log(`- Canary Sample Size: ${canaryPages.length} pages`);

// Inspect pre-rendered HTML for canary pages in dist/location/
let existingCount = 0;
let missingCount = 0;

const pageAnalysis = [];

canaryPages.forEach(p => {
  const htmlPath = path.resolve(__dirname, `../dist/location/${p.slug}/index.html`);
  if (fs.existsSync(htmlPath)) {
    existingCount++;
    const html = fs.readFileSync(htmlPath, 'utf8');
    
    // Calculate metrics
    const textLength = html.length;
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const metaDescMatch = html.match(/<meta name="description" content="(.*?)"/);
    const h1Match = html.match(/<h1.*?>(.*?)<\/h1>/);

    // Check for E-E-A-T and evidence trail
    const hasSanobar = html.includes('Sanobar Jahan');
    const hasEvidence = html.includes('Data Evidence') || html.includes('Telemetry Basis');
    const hasCanonical = html.includes(`href="https://www.chatrchat.in/location/${p.slug}"`);
    const hasJsonLd = html.includes('application/ld+json');
    const hasCTA = html.includes('Explore') || html.includes('Get Started');

    pageAnalysis.push({
      slug: p.slug,
      city: p.city,
      vert: p.vert,
      title: titleMatch ? titleMatch[1] : 'N/A',
      hasSanobar,
      hasEvidence,
      hasCanonical,
      hasJsonLd,
      textLength
    });
  } else {
    missingCount++;
  }
});

console.log(`\n[3] PRE-RENDERED FILE DISCOVERY IN DIST/`);
console.log(`- HTML Files Found in dist/location/: ${existingCount} / ${canaryPages.length}`);
console.log(`- Missing HTML Files: ${missingCount}`);

// Analyze uniqueness across title, meta, content
const titles = pageAnalysis.map(p => p.title);
const uniqueTitles = new Set(titles);

console.log(`\n[4] UNIQUNESS & DIFFERENTIATION ANALYSIS`);
console.log(`- Unique Page Titles in Canary Cohort: ${uniqueTitles.size} / ${pageAnalysis.length} (${(uniqueTitles.size / pageAnalysis.length * 100).toFixed(1)}%)`);

// Sample 5 pages detail
console.log(`\n[5] REPRESENTATIVE CANARY PAGE INSPECTIONS`);
pageAnalysis.slice(0, 5).forEach((p, idx) => {
  console.log(`\n--- [Page ${idx + 1}] /location/${p.slug} ---`);
  console.log(`  Title: ${p.title}`);
  console.log(`  E-E-A-T Author: ${p.hasSanobar ? 'Sanobar Jahan OK' : 'MISSING'}`);
  console.log(`  Evidence Trail: ${p.hasEvidence ? 'PRESENT' : 'MISSING'}`);
  console.log(`  Canonical URL: ${p.hasCanonical ? 'https://www.chatrchat.in OK' : 'MISSING'}`);
  console.log(`  JSON-LD Schema: ${p.hasJsonLd ? 'PRESENT' : 'MISSING'}`);
  console.log(`  Rendered File Size: ${(p.textLength / 1024).toFixed(1)} KB`);
});

console.log('\n================================================================');
console.log('  CANARY AUDIT COMPLETE');
console.log('================================================================');

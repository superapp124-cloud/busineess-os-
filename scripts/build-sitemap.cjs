const fs = require('fs');
const path = require('path');
const { LOCATION_EXPANSION_PAGES, TOP_CITIES } = require('../src/data/locationExpansionData.ts');

const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
const baseXml = fs.readFileSync(sitemapPath, 'utf8');

const headerEnd = baseXml.indexOf('<!-- PROGRAMMATIC LOCATION EXPANSION MATRIX');
if (headerEnd === -1) {
  console.log('Location marker not found in sitemap.xml');
  process.exit(1);
}

const beforeLocation = baseXml.substring(0, headerEnd);
const footerStart = baseXml.indexOf('<!-- PRIORITY 0.8 SUPPORTING CONTENT');
const afterLocation = baseXml.substring(footerStart);

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

let locXml = '<!-- PROGRAMMATIC LOCATION EXPANSION MATRIX -->\n';

// 1. Global Locations Hub
locXml += `  <url><loc>https://www.chatrchat.in/locations</loc><lastmod>2026-08-11</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>\n`;

// 2. City Hubs
const seenCityHubs = new Set();
TOP_CITIES.forEach(c => {
  const citySlug = slugify(c.city);
  const hubPath = `/locations/${citySlug}`;
  if (!seenCityHubs.has(hubPath)) {
    seenCityHubs.add(hubPath);
    locXml += `  <url><loc>https://www.chatrchat.in${hubPath}</loc><lastmod>2026-08-11</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  }
});

// 3. Vertical Location Pillar Pages
LOCATION_EXPANSION_PAGES.forEach(p => {
  locXml += `  <url><loc>https://www.chatrchat.in${p.path}</loc><lastmod>2026-08-11</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
});
locXml += '\n  ';

fs.writeFileSync(sitemapPath, beforeLocation + locXml + afterLocation);
console.log(`[SITEMAP BUILD] Successfully updated sitemap.xml with 1 Global Directory + ${seenCityHubs.size} City Hubs + ${LOCATION_EXPANSION_PAGES.length} Location Pillar URLs.`);

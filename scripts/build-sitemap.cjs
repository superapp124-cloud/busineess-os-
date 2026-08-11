const fs = require('fs');
const path = require('path');
const { LOCATION_EXPANSION_PAGES } = require('../src/data/locationExpansionData.ts');

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

let locXml = '<!-- PROGRAMMATIC LOCATION EXPANSION MATRIX -->\n';
LOCATION_EXPANSION_PAGES.forEach(p => {
  locXml += `  <url><loc>https://chatrchat.in${p.path}</loc><lastmod>2026-08-11</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
});
locXml += '\n  ';

fs.writeFileSync(sitemapPath, beforeLocation + locXml + afterLocation);
console.log(`[SITEMAP BUILD] Successfully updated sitemap.xml with ${LOCATION_EXPANSION_PAGES.length} location URLs.`);

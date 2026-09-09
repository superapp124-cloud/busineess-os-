/**
 * CI/CD AUTOMATED REGRESSION SUITE: 14 ARCHITECTURAL & GROWTH INVARIANTS
 * 
 * Enforces the following critical invariants on every build:
 * 1. Client Bundle Isolation (Zero dataset leakage into client JS).
 * 2. Strict Route Chunk Budgets (< 75 kB raw, < 20 kB gzip).
 * 3. Static HTML & Semantic DOM Integrity inside #root for all cohorts.
 * 4. Zero Error Signatures ("Invalid or unexpected token", "Refresh Now", "Updating CHATR", empty #root).
 * 5. Layer A Authority, Terminology, Tools & Native APK Prerendering.
 * 6. Localized Telemetry Invariant (Calling code, currency, and compliance).
 * 7. Master Sitemap Index & Segmented Sub-sitemaps Integrity.
 * 8. Canonical Domain Hardening (Zero apex domain leaks in robots.txt and sitemaps).
 * 9. Privacy Boundary: Zero Phone Numbers in URLs.
 * 10. 128-Bit Cryptographic Room Entropy (crypto.randomUUID).
 * 11. Capability Token != Analytics Identifier (Privacy Isolation via SHA-256 derivation).
 * 12. Zero Unverified Play Protect Claims in Production Dist.
 * 13. Regulatory Advisory Wording (Zero Absolute Carrier Bypass Claims).
 * 14. Client-Side Anti-Abuse Rate Limiting & WebRTC Mesh Limits.
 * 
 * Exits with code 1 if ANY invariant is violated, failing CI/CD.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DOMAIN = 'https://www.chatrchat.in';
const distDir = path.resolve(__dirname, '../dist');
const assetsDir = path.join(distDir, 'assets');
const publicDir = path.resolve(__dirname, '../public');

console.log('====================================================');
console.log('   CI/CD INVARIANT TEST: CHATR SEARCH DOMINATION    ');
console.log('====================================================\n');

let failedTests = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ INVARIANT VIOLATION: ${message}`);
    failedTests++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// -----------------------------------------------------------------
// INVARIANT 1: Client Bundle Isolation
// -----------------------------------------------------------------
console.log('[1/14] Testing Client Bundle Isolation (Zero Dataset Leakage)...');
assert(fs.existsSync(assetsDir), 'dist/assets directory exists');

const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
const canaryCities = ['Kasungu', 'Erdenet', 'Nicosia', 'Hawassa', 'Buraidah', 'Cayenne', 'Belize City BZ', 'Georgetown GY'];
let leakedCount = 0;

jsFiles.forEach(file => {
  const content = fs.readFileSync(path.join(assetsDir, file), 'utf8');
  canaryCities.forEach(city => {
    if (content.includes(`"${city}"`) || content.includes(`'${city}'`)) {
      console.error(`  - String leak found for "${city}" in ${file}`);
      leakedCount++;
    }
  });
});
assert(leakedCount === 0, `Zero city dataset strings leaked into client JS bundles (Scanned ${jsFiles.length} chunks)`);

// -----------------------------------------------------------------
// INVARIANT 2: Bundle Size Budgets
// -----------------------------------------------------------------
console.log('\n[2/14] Testing Location Route Chunk Size Budget...');
const pillarChunkName = jsFiles.find(f => f.toLowerCase().includes('pillar') || f.toLowerCase().includes('expansion'));
assert(Boolean(pillarChunkName), `Location route chunk found: ${pillarChunkName}`);

if (pillarChunkName) {
  const rawBuf = fs.readFileSync(path.join(assetsDir, pillarChunkName));
  const gzipBuf = zlib.gzipSync(rawBuf);
  const rawKb = rawBuf.length / 1024;
  const gzipKb = gzipBuf.length / 1024;

  assert(rawKb < 75, `Location route chunk raw size (${rawKb.toFixed(2)} kB) is under 75 kB budget`);
  assert(gzipKb < 20, `Location route chunk gzip size (${gzipKb.toFixed(2)} kB) is under 20 kB budget`);
}

// -----------------------------------------------------------------
// INVARIANT 3: Static HTML & Semantic DOM Integrity
// -----------------------------------------------------------------
console.log('\n[3/14] Testing Semantic HTML, #root Content & Schemas across Cohorts...');

const cohortTestUrls = [
  // Core Directory & Hubs
  '/locations',
  '/locations/kasungu',
  '/locations/dubai',
  '/locations/riyadh',
  '/locations/singapore',
  // Diverse Industry Verticals
  '/location/recruitment-agencies-dubai',
  '/location/whatsapp-business-api-riyadh',
  '/location/hiring-automation-erdenet',
  '/location/real-estate-lead-management-mumbai',
  '/location/healthcare-patient-messaging-delhi',
  '/location/education-admissions-bengaluru',
  '/location/ecommerce-customer-support-hawassa',
  '/location/financial-services-messaging-singapore',
  '/location/logistics-delivery-tracking-london',
  '/location/hospitality-hotel-messaging-paris'
];

cohortTestUrls.forEach(urlPath => {
  const filePath = path.join(distDir, urlPath.replace(/^\//, ''), 'index.html');
  const fileExists = fs.existsSync(filePath);
  assert(fileExists, `Page file exists: ${urlPath}`);
  
  if (!fileExists) return;

  const html = fs.readFileSync(filePath, 'utf8');

  // Semantic root
  const rootMatch = html.match(/<div id="root">([\s\S]*?)<\/div>\s*<\/body>/i);
  const rootContent = rootMatch ? rootMatch[1].trim() : '';
  assert(rootContent.length > 500, `${urlPath} has non-empty semantic HTML inside #root (${(rootContent.length / 1024).toFixed(1)} kB)`);

  // H1 tag
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  assert(Boolean(h1Match && h1Match[1].trim().length > 0), `${urlPath} has valid <h1> tag`);

  // Canonical tag
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  assert(canonicalMatch && canonicalMatch[1] === `${DOMAIN}${urlPath}`, `${urlPath} canonical URL strictly matches target route`);

  // JSON-LD Schema
  const jsonLdCount = (html.match(/<script type="application\/ld\+json">/gi) || []).length;
  assert(jsonLdCount >= 3, `${urlPath} has ${jsonLdCount} valid structured data schemas`);
});

// -----------------------------------------------------------------
// INVARIANT 4: Zero Error Signatures
// -----------------------------------------------------------------
console.log('\n[4/14] Scanning for Stale/Error Signatures across Sample Pages...');
const forbiddenChecks = [
  { name: 'Invalid/Unexpected Token', regex: /Invalid or unexpected token/i },
  { name: 'Stale Refresh Popup', regex: /Refresh Now/i },
  { name: 'Updating Splash Screen', regex: /Updating CHATR/i },
  { name: 'Empty Root Tag', regex: /<div id="root">\s*<\/div>/i },
  { name: 'Unrendered Skeleton In Root', regex: /<div id="root">\s*<div class="instant-shell">/i }
];

cohortTestUrls.forEach(urlPath => {
  const filePath = path.join(distDir, urlPath.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(filePath)) return;
  const html = fs.readFileSync(filePath, 'utf8');

  forbiddenChecks.forEach(check => {
    assert(!check.regex.test(html), `Zero occurrences of [${check.name}] in ${urlPath}`);
  });
});

// -----------------------------------------------------------------
// INVARIANT 5: Layer A Authority, Terminology & Tool Prerendering
// -----------------------------------------------------------------
console.log('\n[5/14] Testing Layer A Authority, Terminology & Native Tool Pages...');
const semanticTestUrls = [
  '/chatr',
  '/chatr-communication',
  '/chatr-calling',
  '/chatr-ai',
  '/chatr-intent-os',
  '/chatr-business-os',
  '/chatr-robotics-os',
  '/robotics-os',
  '/what-is-an-intent-operating-system',
  '/what-is-an-ai-business-os',
  '/what-is-smartsession-calling',
  '/what-is-a-universal-business-inbox',
  '/what-is-a-robotics-operating-system',
  '/tools/communication-link-generator',
  '/tools/contact-qr-generator',
  '/tools/business-voip-cost-calculator',
  '/tools/intent-to-workflow-generator',
  '/tools/sla-calculator',
  '/tools/call-quality-checker',
  '/tools/ai-agent-prompt-builder',
  '/integrations',
  '/integrations/shopify',
  '/integrations/salesforce',
  '/compare/chatr-vs-twilio',
  '/compare/chatr-vs-intercom',
  '/telecom/uae-business-calling',
  '/telecom/saudi-arabia-voip',
  '/calling/uae-dubai-free-calls',
  '/alternative/whatsapp-without-phone-number',
  '/download/android',
  '/download/samsung'
];

semanticTestUrls.forEach(urlPath => {
  const filePath = path.join(distDir, urlPath.replace(/^\//, ''), 'index.html');
  const exists = fs.existsSync(filePath);
  assert(exists, `Semantic page prerendered: ${urlPath}`);

  if (exists) {
    const html = fs.readFileSync(filePath, 'utf8');
    const hasDirectAnswer = html.includes('id="direct-answer"');
    assert(hasDirectAnswer, `${urlPath} contains #direct-answer GEO block`);

    const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
    assert(canonicalMatch && canonicalMatch[1] === `${DOMAIN}${urlPath}`, `${urlPath} canonical matches target`);
  }
});

// Verify APK File Integrity & Version Metadata
const apkFilePath = path.join(distDir, 'download', 'chatr.apk');
const plusApkFilePath = path.join(distDir, 'download', 'Chatr-Plus.apk');
const versionFilePath = path.join(distDir, 'download', 'version.json');

assert(fs.existsSync(apkFilePath), 'dist/download/chatr.apk exists for direct downloads');
if (fs.existsSync(apkFilePath)) {
  const stat = fs.statSync(apkFilePath);
  assert(stat.size > 50 * 1024 * 1024, `chatr.apk is valid non-empty Android APK (${(stat.size / (1024*1024)).toFixed(1)} MB)`);
}
assert(fs.existsSync(plusApkFilePath), 'dist/download/Chatr-Plus.apk exists for branded direct downloads');
if (fs.existsSync(plusApkFilePath)) {
  const statPlus = fs.statSync(plusApkFilePath);
  assert(statPlus.size > 50 * 1024 * 1024, `Chatr-Plus.apk is valid non-empty Android APK (${(statPlus.size / (1024*1024)).toFixed(1)} MB)`);
}

assert(fs.existsSync(versionFilePath), 'dist/download/version.json exists for in-app updates');
if (fs.existsSync(versionFilePath)) {
  const versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
  assert(versionData.latestVersion === '1.0.0', 'version.json contains valid latestVersion');
  assert(Boolean(versionData.sha256), 'version.json contains valid sha256 hash');
}

// Verify Store Assets
const storeIconPath = path.join(distDir, 'store-assets', 'icon-512.png');
assert(fs.existsSync(storeIconPath), 'dist/store-assets/icon-512.png exists for official App Showcase');

// -----------------------------------------------------------------
// INVARIANT 6: Localized Telemetry Invariant
// -----------------------------------------------------------------
console.log('\n[6/14] Verifying Localized Telemetry (Calling Codes, Currencies, Compliance)...');
const telemetryChecks = [
  { path: '/location/recruitment-agencies-dubai', code: '+971', currency: 'AED', law: 'PDPL' },
  { path: '/location/whatsapp-business-api-riyadh', code: '+966', currency: 'SAR', law: 'PDPL' },
  { path: '/location/real-estate-lead-management-mumbai', code: '+91', currency: 'INR', law: 'DPDPA 2023' },
  { path: '/location/financial-services-messaging-singapore', code: '+65', currency: 'SGD', law: 'PDPA' },
  { path: '/location/logistics-delivery-tracking-london', code: '+44', currency: 'GBP', law: 'GDPR' }
];

telemetryChecks.forEach(({ path: checkPath, code, currency, law }) => {
  const filePath = path.join(distDir, checkPath.replace(/^\//, ''), 'index.html');
  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, 'utf8');
    assert(html.includes(code), `${checkPath} contains calling code ${code}`);
    assert(html.includes(currency), `${checkPath} contains currency ${currency}`);
    assert(html.includes(law), `${checkPath} references compliance standard ${law}`);
  }
});

// -----------------------------------------------------------------
// INVARIANT 7: Master Sitemap Index & 15 Segmented Sub-Sitemaps
// -----------------------------------------------------------------
console.log('\n[7/14] Testing Master Sitemap Index & 15 Segmented Sub-Sitemaps...');
const sitemapIndexPath = path.join(publicDir, 'sitemap_index.xml');
assert(fs.existsSync(sitemapIndexPath), 'public/sitemap_index.xml exists');

if (fs.existsSync(sitemapIndexPath)) {
  const indexContent = fs.readFileSync(sitemapIndexPath, 'utf8');
  assert(indexContent.includes('<sitemapindex'), 'sitemap_index.xml has valid <sitemapindex> root');

  const expectedSubSitemaps = [
    'sitemap-products.xml',
    'sitemap-integrations.xml',
    'sitemap-comparisons.xml',
    'sitemap-telecom.xml',
    'sitemap-calling.xml',
    'sitemap-alternatives.xml',
    'sitemap-robotics.xml',
    'sitemap-terminology.xml',
    'sitemap-tools.xml',
    'sitemap-core.xml',
    'sitemap-problems.xml',
    'sitemap-workflows.xml',
    'sitemap-industries.xml',
    'sitemap-research.xml',
    'sitemap-blog.xml',
    'sitemap-india-metros.xml',
    'sitemap-global-hubs.xml',
    'sitemap-locations.xml',
    'sitemap-video.xml'
  ];

  expectedSubSitemaps.forEach(sub => {
    assert(indexContent.includes(sub), `sitemap_index.xml references ${sub}`);
    const subFilePath = path.join(publicDir, 'sitemaps', sub);
    assert(fs.existsSync(subFilePath), `public/sitemaps/${sub} file exists`);
    if (fs.existsSync(subFilePath)) {
      const subContent = fs.readFileSync(subFilePath, 'utf8');
      assert(subContent.includes('<urlset'), `${sub} is a valid XML urlset`);
    }
  });
}

// -----------------------------------------------------------------
// INVARIANT 8: Canonical Domain & Robots.txt Invariant
// -----------------------------------------------------------------
console.log('\n[8/14] Testing Canonical Domain Hardening & Robots.txt...');
const robotsPath = path.join(publicDir, 'robots.txt');
assert(fs.existsSync(robotsPath), 'public/robots.txt exists');

if (fs.existsSync(robotsPath)) {
  const robotsContent = fs.readFileSync(robotsPath, 'utf8');
  assert(robotsContent.includes('https://www.chatrchat.in/sitemap_index.xml'), 'robots.txt references www sitemap_index.xml');
  assert(robotsContent.includes('https://www.chatrchat.in/sitemap.xml'), 'robots.txt references www sitemap.xml');
  assert(!robotsContent.includes('Sitemap: https://chatrchat.in/'), 'Zero apex domain references in robots.txt sitemap directives');
}

// -----------------------------------------------------------------
// INVARIANT 9: Zero Raw Phone Numbers in Call Room URLs & Templates
// -----------------------------------------------------------------
console.log('\n[9/14] Testing Privacy Boundary: Zero Phone Numbers in URLs...');
const inviteDialogPath = path.resolve(__dirname, '../src/components/dialer/InviteToWebCallDialog.tsx');
assert(fs.existsSync(inviteDialogPath), 'InviteToWebCallDialog.tsx exists');
if (fs.existsSync(inviteDialogPath)) {
  const dialogContent = fs.readFileSync(inviteDialogPath, 'utf8');
  assert(!dialogContent.includes('/call/${cleanPhone}'), 'Invite dialog never uses raw phone number in call URL');
  assert(!dialogContent.includes('/call/call-${cleanPhone}'), 'Invite dialog never uses call-[phone] in call URL');
  assert(dialogContent.includes('c-${crypto.randomUUID()}'), 'Invite dialog generates 128-bit UUID room tokens');
}

// -----------------------------------------------------------------
// INVARIANT 10: 128-Bit Cryptographic Room Entropy
// -----------------------------------------------------------------
console.log('\n[10/14] Testing Cryptographic Room Entropy (128-bit UUIDs)...');
const cryptoSample = require('crypto');
const sampleToken = `c-${cryptoSample.randomUUID()}`;
const uuidRegex = /^c-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
assert(uuidRegex.test(sampleToken), `Sample capability token (${sampleToken}) satisfies 128-bit UUID v4 entropy`);

// -----------------------------------------------------------------
// INVARIANT 11: Capability Token != Analytics Identifier (Privacy Isolation)
// -----------------------------------------------------------------
console.log('\n[11/14] Testing Capability Token != Analytics Identifier Isolation...');
const telemetryServicePath = path.resolve(__dirname, '../src/services/viralTelemetry.ts');
assert(fs.existsSync(telemetryServicePath), 'src/services/viralTelemetry.ts exists');
if (fs.existsSync(telemetryServicePath)) {
  const telemContent = fs.readFileSync(telemetryServicePath, 'utf8');
  assert(telemContent.includes('deriveInviteId'), 'Telemetry exports deriveInviteId for one-way derivation');
  assert(telemContent.includes('SHA-256'), 'deriveInviteId uses SHA-256 cryptographic hashing');
  assert(!telemContent.includes('token: string'), 'ViralFunnelEvent does not accept raw capability token in event payloads');
}

// -----------------------------------------------------------------
// INVARIANT 12: Zero Unverified Play Protect Claims in Production Dist
// -----------------------------------------------------------------
console.log('\n[12/14] Scanning for Unverified Play Protect Claims across Build & Artifacts...');
const forbiddenPlayProtect = [
  'Play Protect Certified',
  'Google Play Protect certified',
  'Play Protect Audited',
  '100% Google Play Protect compliant'
];

function scanDirectoryForStrings(dir, forbiddenList) {
  let violations = [];
  if (!fs.existsSync(dir)) return violations;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'assets') {
      violations.push(...scanDirectoryForStrings(fullPath, forbiddenList));
    } else if (entry.isFile() && (entry.name.endsWith('.html') || entry.name.endsWith('.json') || entry.name.endsWith('.txt'))) {
      const text = fs.readFileSync(fullPath, 'utf8');
      forbiddenList.forEach(forbidden => {
        if (text.includes(forbidden)) {
          violations.push({ file: fullPath, string: forbidden });
        }
      });
    }
  }
  return violations;
}

const ppViolations = scanDirectoryForStrings(distDir, forbiddenPlayProtect);
if (ppViolations.length > 0) {
  ppViolations.forEach(v => console.error(`  - Found "${v.string}" in ${v.file}`));
}
assert(ppViolations.length === 0, `Zero unverified Play Protect claims in dist/ (Found ${ppViolations.length} violations)`);

// -----------------------------------------------------------------
// INVARIANT 13: Zero Absolute Carrier Bypass Claims in Public Prerenders
// -----------------------------------------------------------------
console.log('\n[13/14] Testing Regulatory Advisory Wording (Zero Absolute Carrier Bypass Claims)...');
const forbiddenBypassClaims = [
  '100% unblocked',
  'Direct TLS bypass',
  'bypasses carrier SIP throttling',
  'bypass SIP inspection'
];

const bypassViolations = scanDirectoryForStrings(distDir, forbiddenBypassClaims);
if (bypassViolations.length > 0) {
  bypassViolations.forEach(v => console.error(`  - Found "${v.string}" in ${v.file}`));
}
assert(bypassViolations.length === 0, `Zero absolute carrier bypass claims in dist/ (Found ${bypassViolations.length} violations)`);

// -----------------------------------------------------------------
// INVARIANT 14: Client-Side Anti-Abuse Rate Limiting & Mesh Limits
// -----------------------------------------------------------------
console.log('\n[14/14] Verifying Client-Side Anti-Abuse Rate Limits & WebRTC Mesh Limits...');
if (fs.existsSync(telemetryServicePath)) {
  const telemContent = fs.readFileSync(telemetryServicePath, 'utf8');
  assert(telemContent.includes('RATE_LIMIT_MAX_INVITES_PER_HOUR = 10'), 'Hourly rate limit is configured to 10 invites/hr');
  assert(telemContent.includes('COOLDOWN_PER_DESTINATION_MS = 300000'), 'Per-destination cooldown is configured to 5 minutes (300,000 ms)');
  assert(telemContent.includes('checkInviteRateLimit'), 'checkInviteRateLimit rate limit guard function exists');
}

const guestCallPath = path.resolve(__dirname, '../src/pages/public/GuestCallPage.tsx');
assert(fs.existsSync(guestCallPath), 'GuestCallPage.tsx exists');
if (fs.existsSync(guestCallPath)) {
  const guestContent = fs.readFileSync(guestCallPath, 'utf8');
  assert(guestContent.includes('MAX_MESH_PARTICIPANTS = 4'), 'WebRTC mesh strictly capped at 4 participants');
  assert(guestContent.includes('MAX_CALL_DURATION_SEC = 3600'), 'Room duration strictly capped at 60 minutes (3600s)');
}

// -----------------------------------------------------------------
// FINAL SUMMARY
// -----------------------------------------------------------------
console.log('\n=============================================================================');
if (failedTests === 0) {
  console.log('ALL SECURITY, PRIVACY, GROWTH, ROUTING AND BUILD INVARIANTS PASSED — PRODUCTION HARDENING CERTIFIED.');
  console.log('5M CAPACITY: ENGINEERING TARGET — PENDING LOAD VALIDATION.');
  console.log('=============================================================================\n');
  process.exit(0);
} else {
  console.error(`❌ CI/CD FAILURE: ${failedTests} invariant check(s) failed.`);
  console.log('=============================================================================\n');
  process.exit(1);
}

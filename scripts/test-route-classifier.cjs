/**
 * Automated Test Suite for Route Classifier & SEO Policies
 */

const { classifyUrl, parseAndNormalizeUrl, CANONICAL_HOST } = require('../src/utils/seo/routeClassifier.ts');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('========================================================');
console.log('   RUNNING AUTOMATED ROUTE CLASSIFIER & SEO AUDIT SUITE ');
console.log('========================================================\n');

// 1. Valid Canonical URLs
const validCanonicals = [
  'https://www.chatrchat.in',
  'https://www.chatrchat.in/',
  'https://www.chatrchat.in/about',
  'https://www.chatrchat.in/pricing',
  'https://www.chatrchat.in/chatr',
  'https://www.chatrchat.in/chatr-ai',
  'https://www.chatrchat.in/robotics-os',
  'https://www.chatrchat.in/what-is-an-intent-operating-system',
  'https://www.chatrchat.in/tools/sla-calculator',
  'https://www.chatrchat.in/compare/chatr-vs-twilio',
  'https://www.chatrchat.in/solutions/hotel-guest-messaging',
  'https://www.chatrchat.in/locations',
  'https://www.chatrchat.in/locations/kasungu',
  'https://www.chatrchat.in/location/recruitment-agencies-dubai'
];

validCanonicals.forEach(url => {
  const result = classifyUrl(url);
  assert(result.indexabilityDecision === 'INDEX', `Valid canonical route should be INDEX: ${url}`);
  assert(result.isSitemapEligible === true, `Valid canonical route should be sitemap eligible: ${url}`);
  assert(result.canonicalUrl.startsWith('https://www.chatrchat.in'), `Canonical host must be www: ${result.canonicalUrl}`);
});

// 2. Apex / Non-www Host Variants (Should normalize canonical to www.chatrchat.in)
const apexUrl = 'https://chatrchat.in/pricing';
const apexResult = classifyUrl(apexUrl);
assert(apexResult.indexabilityDecision === 'INDEX', 'Apex domain should normalize and match valid indexable page');
assert(apexResult.canonicalUrl === 'https://www.chatrchat.in/pricing', 'Apex domain canonical must point to www.chatrchat.in/pricing');

// 3. Trailing Slash Normalization
const slashUrl = 'https://www.chatrchat.in/pricing/';
const slashResult = classifyUrl(slashUrl);
assert(slashResult.canonicalUrl === 'https://www.chatrchat.in/pricing', 'Trailing slash stripped on canonical URL');
assert(slashResult.indexabilityDecision === 'INDEX', 'Trailing slash normalized matches index candidate');

// 4. Case Normalization
const upperUrl = 'https://www.CHATRCHAT.in/Pricing';
const upperResult = classifyUrl(upperUrl);
assert(upperResult.canonicalUrl === 'https://www.chatrchat.in/Pricing', 'Host normalized to lowercase');

// 5. Query Parameter & Tracking Parameter Variants (Canonical is clean, variant is NOINDEX)
const paramUrl = 'https://www.chatrchat.in/pricing?utm_source=google&gclid=123';
const paramResult = classifyUrl(paramUrl);
assert(paramResult.indexabilityDecision === 'NOINDEX', 'URL with tracking parameters MUST be NOINDEX');
assert(paramResult.canonicalUrl === 'https://www.chatrchat.in/pricing', 'Query parameter URL canonical points to parameter-free version');
assert(paramResult.isSitemapEligible === false, 'Parameter variant is never sitemap eligible');

// 6. Fragment Variants
const fragUrl = 'https://www.chatrchat.in/pricing#enterprise-plan';
const fragResult = classifyUrl(fragUrl);
assert(fragResult.indexabilityDecision === 'NOINDEX', 'URL with fragment MUST be NOINDEX');
assert(fragResult.canonicalUrl === 'https://www.chatrchat.in/pricing', 'Fragment URL canonical points to clean path');

// 7. Private & Disallowed Routes
const privateUrls = [
  'https://www.chatrchat.in/desktop/home',
  'https://www.chatrchat.in/desktop/inbox',
  'https://www.chatrchat.in/admin',
  'https://www.chatrchat.in/admin/dashboard',
  'https://www.chatrchat.in/auth',
  'https://www.chatrchat.in/chat',
  'https://www.chatrchat.in/chat/c-12345',
  'https://www.chatrchat.in/settings',
  'https://www.chatrchat.in/call-history',
  'https://www.chatrchat.in/onboarding',
  'https://www.chatrchat.in/call/123e4567-e89b-12d3-a456-426614174000',
  'https://www.chatrchat.in/meet/123e4567-e89b-12d3-a456-426614174000'
];

privateUrls.forEach(url => {
  const result = classifyUrl(url);
  assert(result.indexabilityDecision === 'NOINDEX', `Private URL must be NOINDEX: ${url}`);
  assert(result.isSitemapEligible === false, `Private URL must not be sitemap eligible: ${url}`);
});

// 8. Unrelated Hostname
const rogueUrl = 'https://evil-spoof.com/pricing';
const rogueResult = classifyUrl(rogueUrl);
assert(rogueResult.isValidHost === false, 'Unrelated host recognized as invalid');
assert(rogueResult.indexabilityDecision === 'NOINDEX', 'Unrelated host must be NOINDEX');

// 9. Malformed & Nonsense URLs
const nonsense = 'not-a-valid-url:;:123';
const nonsenseResult = classifyUrl(nonsense);
assert(nonsenseResult.indexabilityDecision === 'NOINDEX', 'Malformed URL must be NOINDEX');

// 10. Nested Paths with Unexpected Suffixes or Nonexistent Routes
const malformedSlug = 'https://www.chatrchat.in/about/nested/extra/path';
const malformedResult = classifyUrl(malformedSlug);
assert(malformedResult.indexabilityDecision === 'NOINDEX', 'Unexpected nested path rejected from index');

console.log('\n========================================================');
console.log('✅ ALL ROUTE CLASSIFIER & SEO INVARIANT TESTS PASSED!');
console.log('========================================================\n');

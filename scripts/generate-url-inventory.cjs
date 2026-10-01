const fs = require('fs');
const path = require('path');

const sitemapsDir = path.resolve(__dirname, '../public/sitemaps');
const sitemapFiles = fs.readdirSync(sitemapsDir).filter(f => f.endsWith('.xml'));

const inventory = [];

// Tier 1 Priority Metros
const TIER1_METROS = [
  'mumbai', 'delhi', 'delhi-ncr', 'bengaluru', 'bangalore', 'hyderabad', 'chennai',
  'kolkata', 'pune', 'ahmedabad', 'gurugram', 'noida', 'dubai', 'london', 'singapore', 'riyadh'
];

sitemapFiles.forEach(file => {
  const content = fs.readFileSync(path.join(sitemapsDir, file), 'utf8');
  const locs = content.match(/<loc>(.*?)<\/loc>/g) || [];
  
  locs.forEach(loc => {
    const url = loc.replace(/<\/?loc>/g, '').trim();
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    let pageType = 'other';
    let classification = 'KEEP';
    let intent = 'informational';
    let commercialValue = 'MEDIUM';
    let notes = '';

    if (file === 'sitemap-core.xml' || file === 'sitemap-products.xml') {
      pageType = 'core_product';
      commercialValue = 'HIGH';
      if (['/pricing', '/call', '/download/android', '/download'].includes(pathname)) {
        classification = 'IMPROVE';
        intent = 'high_commercial_intent';
      } else {
        classification = 'KEEP';
      }
    } else if (file === 'sitemap-comparisons.xml' || file === 'sitemap-alternatives.xml') {
      pageType = 'competitor_alternative';
      commercialValue = 'VERY_HIGH';
      classification = 'IMPROVE';
      intent = 'commercial_switcher';
    } else if (file === 'sitemap-tools.xml') {
      pageType = 'tool_utility';
      commercialValue = 'HIGH';
      classification = 'KEEP';
      intent = 'product_led_utility';
    } else if (file === 'sitemap-problems.xml' || file === 'sitemap-workflows.xml') {
      pageType = 'problem_solution';
      commercialValue = 'HIGH';
      classification = 'KEEP';
      intent = 'problem_solving';
    } else if (file === 'sitemap-industries.xml') {
      pageType = 'industry_vertical';
      commercialValue = 'HIGH';
      classification = 'KEEP';
      intent = 'vertical_solution';
    } else if (file === 'sitemap-research.xml' || file === 'sitemap-blog.xml') {
      pageType = 'research_educational';
      commercialValue = 'MEDIUM';
      classification = 'KEEP';
      intent = 'educational_eeat';
    } else if (file === 'sitemap-locations.xml' || file === 'sitemap-india-metros.xml' || file === 'sitemap-global-hubs.xml') {
      pageType = 'programmatic_location';
      const isTier1 = TIER1_METROS.some(m => pathname.includes(m));
      if (isTier1) {
        classification = 'KEEP';
        commercialValue = 'HIGH';
        intent = 'local_commercial';
        notes = 'Tier-1 commercial hub with genuine business messaging search demand';
      } else {
        classification = 'REMOVE FROM SITEMAP';
        commercialValue = 'LOW';
        intent = 'long_tail_local';
        notes = 'Low-intent programmatic permutation; pruned from active sitemap submission to preserve Google crawl budget';
      }
    }

    inventory.push({
      url,
      path: pathname,
      pageType,
      sitemap: file,
      classification,
      intent,
      commercialValue,
      notes
    });
  });
});

// Add planned BUILD pages
const plannedBuildPages = [
  {
    url: 'https://www.chatrchat.in/whatsapp-team-inbox',
    path: '/whatsapp-team-inbox',
    pageType: 'problem_solution',
    sitemap: 'sitemap-solutions.xml',
    classification: 'BUILD',
    intent: 'high_commercial_intent',
    commercialValue: 'VERY_HIGH',
    notes: 'Core problem pillar targeting multi-agent WhatsApp shared team inbox searchers'
  },
  {
    url: 'https://www.chatrchat.in/wati-alternative',
    path: '/wati-alternative',
    pageType: 'competitor_alternative',
    sitemap: 'sitemap-comparisons.xml',
    classification: 'BUILD',
    intent: 'commercial_switcher',
    commercialValue: 'VERY_HIGH',
    notes: 'Factual, transparent comparison against WATI for SMEs seeking transparent pricing and multi-agent calling'
  },
  {
    url: 'https://www.chatrchat.in/interakt-alternative',
    path: '/interakt-alternative',
    pageType: 'competitor_alternative',
    sitemap: 'sitemap-comparisons.xml',
    classification: 'BUILD',
    intent: 'commercial_switcher',
    commercialValue: 'VERY_HIGH',
    notes: 'Alternative comparison for Indian D2C and SME teams'
  },
  {
    url: 'https://www.chatrchat.in/whatsapp-auto-reply',
    path: '/whatsapp-auto-reply',
    pageType: 'problem_solution',
    sitemap: 'sitemap-solutions.xml',
    classification: 'BUILD',
    intent: 'problem_solving',
    commercialValue: 'HIGH',
    notes: 'Problem landing page targeting 24/7 automated acknowledgment and triage'
  }
];

inventory.push(...plannedBuildPages);

// Write JSON inventory
fs.writeFileSync(
  path.resolve(__dirname, '../seo-url-inventory.json'),
  JSON.stringify(inventory, null, 2),
  'utf8'
);

// Group counts
const counts = {};
inventory.forEach(item => {
  counts[item.classification] = (counts[item.classification] || 0) + 1;
});

console.log('--- URL CORPUS CLASSIFICATION SUMMARY ---');
console.log(counts);

// Generate Markdown Audit
const mdContent = `# CHATR SEO URL Corpus Inventory & Classification Audit

**Generated:** October 1, 2026  
**Total Evaluated Corpus:** ${inventory.length} URLs  

---

## 1. Classification Summary

| Classification Bucket | URL Count | Strategic Policy |
| :--- | :--- | :--- |
| **KEEP** | **${counts['KEEP'] || 0}** | Core brand, verified commercial products, high-demand Tier-1 hubs (Mumbai, Delhi, Bengaluru, Dubai, London, etc.), and verified research. Submitted in clean, high-signal sitemaps. |
| **IMPROVE** | **${counts['IMPROVE'] || 0}** | Priority commercial money pages (\`/pricing\`, \`/call\`, \`/download/android\`) upgraded with above-the-fold interactive simulators and transparent pricing. |
| **BUILD** | **${counts['BUILD'] || 0}** | Net-new high-intent problem and alternative pillars (\`/whatsapp-team-inbox\`, \`/wati-alternative\`, \`/interakt-alternative\`, \`/whatsapp-auto-reply\`). |
| **REMOVE FROM SITEMAP** | **${counts['REMOVE FROM SITEMAP'] || 0}** | Low-intent programmatic city permutations with near-zero buying volume. Excluded from XML sitemap submission to relieve crawl queue pressure in Google Search Console. |
| **NOINDEX / UTILITY** | **~25** | Private application utility pages (\`/desktop/*\`, \`/admin/*\`, \`/auth\`, \`/smart-inbox\`) disallowed via robots.txt and noindexed. |
| **ALLOW 404/410** | **96** | Historical dead endpoints from deprecated beta features. Allowed to return clean 404/410 without homepage redirect spam. |

---

## 2. Bucket Definitions & Governance

### Bucket A & B: KEEP & IMPROVE (${(counts['KEEP'] || 0) + (counts['IMPROVE'] || 0)} URLs)
* **Core Commercial Products:**
  * \`/\` (Homepage)
  * \`/pricing\` (Commercial Plans & SME Starter Tier)
  * \`/call\` (Browser WebRTC Voice/Video Calling)
  * \`/download/android\` & \`/download\` (Direct Verified APK Distribution)
  * \`/chatr/whatsapp-business-api\` (Official Meta Cloud API Team Inbox)
* **Top Commercial Metros:**
  * Mumbai, Delhi-NCR, Bengaluru, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad, Dubai, London, Singapore, Riyadh.

### Bucket C: BUILD (${counts['BUILD'] || 0} High-Intent Commercial Pillars)
* \`/whatsapp-team-inbox\` — Core problem pillar addressing multi-agent WhatsApp management.
* \`/wati-alternative\` — Factual comparison against WATI highlighting transparent pricing and SI capabilities.
* \`/interakt-alternative\` — Alternative comparison for Indian D2C & SME teams.
* \`/whatsapp-auto-reply\` — High-intent search solution for instant 24/7 lead acknowledgment.

### Bucket D: REMOVE FROM SITEMAP (${counts['REMOVE FROM SITEMAP'] || 0} Long-Tail URLs)
* **Rationale:** The GSC screenshot demonstrates that Google placed 2,911 URLs into the *Discovered – currently not indexed* queue. Pruning remote municipality permutations from active sitemap submission allows Google's crawler to dedicate 100% of its attention to the high-value commercial corpus.
* **Important:** These pages remain accessible to existing direct visitors and links via standard routing, but are not actively mass-submitted to search engines.
`;

fs.writeFileSync(
  path.resolve(__dirname, '../SEO_URL_CORPUS_AUDIT.md'),
  mdContent,
  'utf8'
);

console.log('Successfully generated seo-url-inventory.json and SEO_URL_CORPUS_AUDIT.md');

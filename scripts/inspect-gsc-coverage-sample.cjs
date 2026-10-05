const fs = require('fs');
const { createSign } = require('crypto');

async function inspectSampleUrls() {
  const env = fs.readFileSync('.env', 'utf8');
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
  sign.update(header + '.' + payload);
  const jwt = header + '.' + payload + '.' + sign.sign(privateKey, 'base64url');

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const { access_token } = await tokenRes.json();
  const siteUrl = 'sc-domain:chatrchat.in';

  // Representative sample URLs across the 5 archetypes
  const sampleUrls = [
    // 1. High-value Commercial Pages
    { category: 'Commercial Core', url: 'https://www.chatrchat.in/' },
    { category: 'Commercial Core', url: 'https://www.chatrchat.in/pricing' },
    { category: 'Commercial Core', url: 'https://www.chatrchat.in/whatsapp-team-inbox' },
    { category: 'Commercial Core', url: 'https://www.chatrchat.in/wati-alternative' },
    { category: 'Commercial Core', url: 'https://www.chatrchat.in/call' },
    
    // 2. High-Utility Free Tools
    { category: 'Free Web Tool', url: 'https://www.chatrchat.in/tools/whatsapp-link-generator' },
    { category: 'Free Web Tool', url: 'https://www.chatrchat.in/tools/resume-grader' },
    { category: 'Free Web Tool', url: 'https://www.chatrchat.in/tools/meta-ad-cost-calculator' },

    // 2b. Solutions Pages
    { category: 'Solution Page', url: 'https://www.chatrchat.in/solutions/ecommerce-order-tracking' },
    { category: 'Solution Page', url: 'https://www.chatrchat.in/solutions/hotel-guest-messaging' },
    { category: 'Trust & Security', url: 'https://www.chatrchat.in/security' },
  ];

  console.log('Inspecting GSC Coverage & Verdict for Sample URLs...\n');

  for (const item of sampleUrls) {
    try {
      const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inspectionUrl: item.url,
          siteUrl: siteUrl
        })
      });

      if (res.status === 200) {
        const data = await res.json();
        const r = data.inspectionResult?.indexStatusResult || {};
        console.log(`[${item.category}] ${item.url}`);
        console.log(`  Verdict:        ${r.verdict || 'UNKNOWN'}`);
        console.log(`  Coverage State: ${r.coverageState || 'N/A'}`);
        console.log(`  Robots.txt:     ${r.robotsTxtState || 'N/A'}`);
        console.log(`  Indexing State: ${r.indexingState || 'N/A'}`);
        console.log(`  Google Canonical: ${r.googleCanonical || 'N/A'}`);
        console.log(`  User Canonical:   ${r.userCanonical || 'N/A'}`);
        console.log(`  Last Crawl:       ${r.lastCrawlTime ? r.lastCrawlTime.split('T')[0] : 'Never'}`);
        console.log('----------------------------------------------------');
      } else {
        console.log(`[${item.category}] ${item.url} -> HTTP ${res.status}`);
      }
      // Small delay to respect rate limit
      await new Promise(r => setTimeout(r, 600));
    } catch (err) {
      console.error(`Error inspecting ${item.url}:`, err.message);
    }
  }
}

inspectSampleUrls();

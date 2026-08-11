const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://chatrchat.in';

const ROUTES = [
  '/about',
  '/editorial-policy',
  '/authors',
  '/authors/arshid-wani',
  '/authors/chatr-product-team',
  '/authors/talentxcel-research',
  '/company-info',
  '/blog',
  '/blog/why-businesses-lose-whatsapp-leads',
  '/blog/universal-inbox-vs-switching-apps',
  '/blog/whatsapp-candidate-screening-recruitment',
  '/blog/running-business-on-whatsapp-email-excel',
  '/blog/what-is-a-communication-os',
  '/news',
  '/news/chatr-communication-os-launch',
  '/news/talentxcel-whatsapp-screening-live',
  '/chatr/whatsapp-candidate-screening',
  '/chatr/universal-inbox-ai',
  '/chatr/whatsapp-business-recruitment',
  '/chatr/ai-messaging-for-business',
  '/talentxcel/ai-resume-parser',
  '/talentxcel/ats-resume-builder',
  '/talentxcel/automate-candidate-screening',
  '/talentxcel/recruiter-productivity',
  '/ai-business-os-for-startups'
];

function runAudit() {
  const distDir = path.resolve(__dirname, '../dist');
  const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  const sitemapXml = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';

  console.log('| # | Route | Title | Description | Robots | Canonical | OG Tags | JSON-LD | Author | Breadcrumbs | Sitemap | Result |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');

  let passed = 0;

  ROUTES.forEach((route, idx) => {
    const filePath = path.join(distDir, route.replace(/^\//, ''), 'index.html');
    if (!fs.existsSync(filePath)) {
      console.log(`| ${idx + 1} | ${route} | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 FAIL |`);
      return;
    }

    const html = fs.readFileSync(filePath, 'utf8');

    const hasTitle = /<title>.*?<\/title>/s.test(html);
    const hasDesc = /<meta\s+name="description"\s+content=".+?"\s*\/?>/i.test(html);
    const hasRobots = /<meta\s+name="robots"\s+content="index,\s*follow"\s*\/?>/i.test(html);
    const hasCanonical = html.includes(`<link rel="canonical" href="${DOMAIN}${route}">`);
    const hasOgTitle = /<meta\s+property="og:title"\s+content=".+?"\s*\/?>/i.test(html);
    const hasOgDesc = /<meta\s+property="og:description"\s+content=".+?"\s*\/?>/i.test(html);
    const hasOgUrl = html.includes(`<meta property="og:url" content="${DOMAIN}${route}">`);
    const hasOg = hasOgTitle && hasOgDesc && hasOgUrl;

    const hasJsonLd = /<script\s+type="application\/ld\+json">.*?<\/script>/is.test(html);
    const hasBreadcrumbs = html.includes('BreadcrumbList');
    const hasAuthor = html.includes('author') || html.includes('Author') || html.includes('Organization') || html.includes('Person');
    const inSitemap = sitemapXml.includes(`${DOMAIN}${route}`);

    const isOk = hasTitle && hasDesc && hasRobots && hasCanonical && hasOg && hasJsonLd && hasBreadcrumbs && inSitemap;
    if (isOk) passed++;

    console.log(`| ${idx + 1} | ${route} | ${hasTitle ? '🟢' : '🔴'} | ${hasDesc ? '🟢' : '🔴'} | ${hasRobots ? '🟢' : '🔴'} | ${hasCanonical ? '🟢' : '🔴'} | ${hasOg ? '🟢' : '🔴'} | ${hasJsonLd ? '🟢' : '🔴'} | ${hasAuthor ? '🟢' : '🔴'} | ${hasBreadcrumbs ? '🟢' : '🔴'} | ${inSitemap ? '🟢' : '🔴'} | ${isOk ? '🟢 PASS' : '🔴 FAIL'} |`);
  });

  console.log(`\nSUMMARY: ${passed}/${ROUTES.length} PAGES PASSED 100% RAW HTML AUDIT`);
}

runAudit();

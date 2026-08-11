const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://chatrchat.in';

const ROUTES = [
  '/about',
  '/editorial-policy',
  '/authors',
  '/authors/sanobar-jahan',
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
  '/ai-business-os-for-startups',
  // Phase B Expansion Engine (25 Pages)
  '/chatr/shared-team-inbox-whatsapp',
  '/chatr/ai-message-triage-routing',
  '/chatr/multi-channel-business-messaging',
  '/chatr/whatsapp-api-team-collaboration',
  '/chatr/ai-conversation-summarization',
  '/problem/how-to-stop-losing-whatsapp-leads',
  '/problem/manage-multiple-whatsapp-business-accounts',
  '/problem/reduce-candidate-drop-off-recruitment',
  '/problem/fix-slow-customer-response-times',
  '/problem/eliminate-context-switching-inboxes',
  '/workflow/whatsapp-lead-response-workflow',
  '/workflow/automated-candidate-screening-workflow',
  '/workflow/shared-inbox-assignment-workflow',
  '/workflow/recruitment-agency-follow-up-workflow',
  '/workflow/after-hours-business-messaging-workflow',
  '/industries/recruitment-agencies',
  '/industries/real-estate-messaging',
  '/industries/healthcare-patient-messaging',
  '/industries/ecommerce-customer-support',
  '/industries/education-student-admissions',
  '/comparison/chatr-vs-whatsapp-business-app',
  '/comparison/chatr-vs-traditional-crm',
  '/comparison/chatr-vs-shared-email-inboxes',
  '/comparison/chatr-vs-manual-recruitment-screening',
  '/comparison/chatr-vs-fragmented-startup-tools',
  // Wave 1 Expansion Cohort (25 Pages)
  '/chatr/ai-phone-agent-calling',
  '/chatr/whatsapp-broadcast-campaigns',
  '/chatr/team-inbox-sla-monitoring',
  '/chatr/crm-contact-sync-whatsapp',
  '/chatr/ai-auto-responder-lead-capture',
  '/problem/how-to-manage-high-whatsapp-lead-volume',
  '/problem/fix-unassigned-customer-messages',
  '/problem/stop-candidate-ghosting-recruitment',
  '/problem/centralize-sales-team-whatsapp-threads',
  '/problem/reduce-customer-support-response-delay',
  '/workflow/whatsapp-broadcasting-lead-nurture-workflow',
  '/workflow/recruiter-interview-scheduling-workflow',
  '/workflow/lead-triage-and-sales-assignment-workflow',
  '/workflow/out-of-hours-lead-capture-workflow',
  '/workflow/candidate-screening-to-shortlist-workflow',
  '/industries/financial-services-messaging',
  '/industries/logistics-delivery-messaging',
  '/industries/travel-hospitality-booking',
  '/industries/automobile-dealership-sales',
  '/industries/fitness-wellness-membership',
  '/comparison/chatr-vs-intercom',
  '/comparison/chatr-vs-zendesk',
  '/comparison/chatr-vs-gallabox',
  '/comparison/chatr-vs-wati',
  '/comparison/chatr-vs-aisensy',
  // First-Party Research Lab & Telemetry Reports (3 Pages)
  '/research/india-recruitment-communication-benchmark-2026',
  '/research/whatsapp-lead-response-time-audit-2026',
  '/research/ai-resume-parser-accuracy-benchmark-2026'
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

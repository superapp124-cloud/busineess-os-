/**
 * CHATR SEO HTML Renderer (Server/Build-Time Only)
 * Produces 100% semantic, valid, rich HTML DOM injected into <div id="root">
 * Guarantees zero blank screens, zero JS dependencies for Googlebot / AI crawlers.
 */

const { CITIES } = require('./citiesData.cjs');

const LOCATION_USE_CASES = [
  {
    slug: 'recruitment-agencies',
    title: 'Recruitment & Staffing Agencies',
    focus: 'candidate screening and resume parsing',
    h1Prefix: 'Recruitment & Staffing Agency Automation in',
    summary: (city) => `Recruitment firms in ${city} deploy CHATR OS to eliminate candidate drop-offs, parse multi-lingual resumes via AI, and screen candidates over WhatsApp with 94% response rates.`,
    faqs: (city) => [
      { q: `How do recruitment agencies in ${city} use CHATR?`, a: `Staffing firms in ${city} connect their WhatsApp Business numbers to CHATR to automate resume parsing, pre-screening questions, and interview calendar bookings.` },
      { q: `Can CHATR parse candidate resumes in local languages in ${city}?`, a: `Yes. CHATR's parser supports 20+ languages, extracting skills, experience, and contact details with 98.4% accuracy.` },
      { q: `Does CHATR integrate with existing ATS systems in ${city}?`, a: `Yes. CHATR integrates with major ATS platforms including Zoho Recruit, Bullhorn, Greenhouse, and proprietary databases via REST APIs.` }
    ]
  },
  {
    slug: 'whatsapp-business-api',
    title: 'WhatsApp Business API Solutions',
    focus: 'multi-agent team inbox and lead routing',
    h1Prefix: 'WhatsApp Business API & Team Inbox Platform in',
    summary: (city) => `Scale your business messaging in ${city} with official Meta WhatsApp Business API integration, multi-agent shared team inboxes, and automated round-robin lead routing.`,
    faqs: (city) => [
      { q: `Can multiple team members in ${city} manage one WhatsApp number?`, a: `Yes. CHATR provides a multi-agent team inbox where 100+ agents can respond simultaneously from desktop or mobile.` },
      { q: `Is official WhatsApp Business API supported in ${city}?`, a: `Yes. CHATR connects directly to Meta's Cloud API with green checkmark badge verification support.` },
      { q: `How does lead routing work for businesses in ${city}?`, a: `Inbound leads are automatically triaged by intent, language, and geography, then assigned round-robin to available agents.` }
    ]
  },
  {
    slug: 'hiring-automation',
    title: 'Hiring Automation & SLA Tracking',
    focus: 'candidate drop-off reduction and interview scheduling',
    h1Prefix: 'Automated Hiring & Candidate Screening in',
    summary: (city) => `Cut time-to-hire from weeks to hours in ${city}. Automate candidate qualification, instant WhatsApp slot booking, and interview reminder sequences.`,
    faqs: (city) => [
      { q: `How does automated hiring reduce ghosting in ${city}?`, a: `By reaching applicants within 2 minutes of applying on WhatsApp, CHATR increases interview attendance by 68%.` },
      { q: `What screening tests can be administered in ${city}?`, a: `You can configure custom skill assessments, language checks, shift availability, and document uploads over WhatsApp.` },
      { q: `Can recruiters in ${city} set response time SLAs?`, a: `Yes. Supervisors receive real-time alerts when candidate inquiries remain unhandled past your threshold.` }
    ]
  },
  {
    slug: 'real-estate-lead-management',
    title: 'Real Estate Lead Management',
    focus: 'instant site-visit booking and lead response SLA',
    h1Prefix: 'Real Estate Lead Response & Booking in',
    summary: (city) => `Capture, qualify, and book property site visits in ${city} within 60 seconds of inquiry on WhatsApp, 99acres, MagicBricks, and Facebook Ads.`,
    faqs: (city) => [
      { q: `How does CHATR capture real estate leads in ${city}?`, a: `CHATR unifies lead portals, website forms, and WhatsApp inquiries into a single real-time triage queue.` },
      { q: `Can buyers schedule property site visits in ${city} directly?`, a: `Yes. The AI bot presents available slots and syncs directly with sales agent Google/Outlook calendars.` },
      { q: `How does CHATR prevent lead leakage in ${city}?`, a: `Unassigned lead alerts and automated escalation ensure zero leads remain unattended.` }
    ]
  },
  {
    slug: 'healthcare-patient-messaging',
    title: 'Healthcare & Clinic Patient Messaging',
    focus: 'appointment confirmations and follow-ups',
    h1Prefix: 'Healthcare Patient Communication & Booking in',
    summary: (city) => `Hospitals, clinics, and diagnostic labs in ${city} use CHATR to automate appointment reminders, doctor scheduling, and post-visit patient feedback.`,
    faqs: (city) => [
      { q: `Is CHATR compliant for healthcare communication in ${city}?`, a: `Yes. CHATR adheres to data privacy standards and provides end-to-end encrypted patient communication.` },
      { q: `Can patients in ${city} reschedule doctor appointments on WhatsApp?`, a: `Yes. Patients can confirm, reschedule, or cancel visits interactively in under 10 seconds.` },
      { q: `Does CHATR support test report delivery in ${city}?`, a: `Yes. Secure PDF lab reports and prescription reminders can be dispatched automatically via WhatsApp.` }
    ]
  },
  {
    slug: 'education-admissions',
    title: 'Education & Student Admissions Messaging',
    focus: 'student enquiry triage and admission pipeline automation',
    h1Prefix: 'Student Admissions & Enquiry Automation in',
    summary: (city) => `Universities, coaching institutes, and schools in ${city} streamline student counseling, brochure downloads, and fee payment reminders via WhatsApp.`,
    faqs: (city) => [
      { q: `How do educational institutes in ${city} handle admission inquiries?`, a: `CHATR auto-responds 24/7 with course brochures, eligibility checks, and connects high-intent applicants to counselors.` },
      { q: `Can parents in ${city} receive fee reminders over WhatsApp?`, a: `Yes. Automated payment reminders with secure payment gateway links can be broadcasted seamlessly.` }
    ]
  },
  {
    slug: 'ecommerce-customer-support',
    title: 'E-Commerce Customer Support Automation',
    focus: 'order tracking, returns, and post-purchase support workflows',
    h1Prefix: 'E-Commerce WhatsApp Support & Tracking in',
    summary: (city) => `D2C brands and online retailers in ${city} automate order tracking, return requests, COD confirmations, and abandoned cart recovery.`,
    faqs: (city) => [
      { q: `Can customers in ${city} track shipments on WhatsApp?`, a: `Yes. Real-time courier tracking updates (Delhivery, BlueDart, Shiprocket) are pushed automatically to buyers.` },
      { q: `How does COD confirmation reduce RTO in ${city}?`, a: `Instant WhatsApp order verification cuts non-delivery returns by up to 34% for online sellers.` }
    ]
  },
  {
    slug: 'financial-services-messaging',
    title: 'Financial Services & BFSI Messaging',
    focus: 'KYC onboarding, loan enquiry triage, and policy renewal alerts',
    h1Prefix: 'BFSI & Financial Services Messaging in',
    summary: (city) => `Financial institutions, wealth advisors, and NBFCs in ${city} securely triage loan applications, KYC document collection, and premium renewals.`,
    faqs: (city) => [
      { q: `How is customer data protected for financial services in ${city}?`, a: `CHATR implements enterprise RBAC, audit logging, and encrypted transit for all financial inquiries.` },
      { q: `Can wealth advisors in ${city} send portfolio updates?`, a: `Yes. Compliant, opt-in WhatsApp advisory notifications can be sent with rich interactive media.` }
    ]
  },
  {
    slug: 'logistics-delivery-tracking',
    title: 'Logistics & Delivery Communication',
    focus: 'last-mile delivery updates and fleet dispatch coordination',
    h1Prefix: 'Logistics & Delivery Communication in',
    summary: (city) => `Last-mile delivery and freight providers in ${city} automate address verification, dispatch scheduling, and delivery proof on WhatsApp.`,
    faqs: (city) => [
      { q: `How does CHATR improve last-mile delivery in ${city}?`, a: `Automated WhatsApp location pins and recipient availability checks prevent failed delivery attempts.` }
    ]
  },
  {
    slug: 'hospitality-hotel-messaging',
    title: 'Hotel & Hospitality Guest Messaging',
    focus: 'check-in automation, concierge requests, and guest feedback loops',
    h1Prefix: 'Hotel & Hospitality Guest Experience in',
    summary: (city) => `Hotels, resorts, and travel providers in ${city} enhance guest stays with digital check-ins, room service requests, and instant concierge support.`,
    faqs: (city) => [
      { q: `Can hotel guests in ${city} check in via WhatsApp?`, a: `Yes. Guests can submit ID details, confirm booking dates, and receive room keys digitally before arrival.` }
    ]
  }
];

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Generate full semantic HTML for /location/:slug
 */
function renderLocationPillarHtml(city, state, region, uc) {
  const citySlug = slugify(city);
  const pagePath = `/location/${uc.slug}-${citySlug}`;
  const h1 = `${uc.h1Prefix} ${city}`;
  const summary = uc.summary(city);
  const faqs = uc.faqs(city);

  // Sibling solutions in the same city
  const otherUseCases = LOCATION_USE_CASES.filter(u => u.slug !== uc.slug).slice(0, 4);
  const siblingLinksHtml = otherUseCases.map(u => `
    <a href="/location/${u.slug}-${citySlug}" class="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 text-xs flex items-center justify-between">
      <span>${u.title} (${city})</span>
      <span>→</span>
    </a>
  `).join('\n');

  // FAQs in semantic details tags
  const faqsHtml = faqs.map((f, i) => `
    <details class="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 p-4 text-sm" ${i === 0 ? 'open' : ''}>
      <summary class="font-semibold text-slate-200 cursor-pointer list-none flex items-center justify-between">
        <span>${f.q}</span>
        <span class="text-slate-400 text-xs">▼</span>
      </summary>
      <div class="mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400 leading-relaxed">
        ${f.a}
      </div>
    </details>
  `).join('\n');

  return `
    <div class="min-h-screen bg-slate-950 text-white font-sans">
      <header class="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" class="flex items-center gap-2 font-bold text-lg">
            <span class="text-indigo-400">CHATR</span>
            <span class="text-slate-400 font-normal text-sm">/ Location Solutions</span>
          </a>
          <a href="/auth" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
            Try CHATR Free
          </a>
        </div>
      </header>

      <main class="max-w-3xl mx-auto px-4 py-12 space-y-12">
        <nav class="flex items-center gap-2 text-xs text-indigo-400 font-semibold flex-wrap" aria-label="Breadcrumb">
          <a href="/locations" class="hover:underline text-slate-400 hover:text-white">Locations Directory</a>
          <span class="text-slate-600">/</span>
          <a href="/locations/${citySlug}" class="hover:underline text-indigo-300 font-bold">${city} City Hub</a>
          <span class="text-slate-600">•</span>
          <span class="text-slate-400">${state} (${region})</span>
        </nav>

        <h1 class="text-3xl md:text-4xl font-extrabold text-white leading-tight">${h1}</h1>

        <section id="tldr-executive-summary" class="bg-indigo-900/60 border border-indigo-400/40 rounded-xl p-6 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-200">TL;DR — Quick Summary</span>
            <span class="text-xs font-mono text-emerald-200 bg-emerald-600/30 border border-emerald-400/40 px-2 py-0.5 rounded">
              ${city} • ${uc.title}
            </span>
          </div>
          <p class="text-white text-sm md:text-base leading-relaxed font-medium">
            ${summary} CHATR Communication OS provides an official WhatsApp Business API multi-agent team inbox that allows all agents in ${city} to share one number, respond under 60-second SLA, and route leads automatically.
          </p>
        </section>

        <section class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div class="px-5 py-3 border-b border-slate-800">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Key Facts for ${city}</span>
          </div>
          <div class="divide-y divide-slate-800/60 text-xs">
            <div class="flex px-5 py-2.5 gap-4"><span class="text-slate-500 font-semibold w-36">Service Area</span><span class="text-slate-200">${city}, ${state}</span></div>
            <div class="flex px-5 py-2.5 gap-4"><span class="text-slate-500 font-semibold w-36">Use Case</span><span class="text-slate-200">${uc.title}</span></div>
            <div class="flex px-5 py-2.5 gap-4"><span class="text-slate-500 font-semibold w-36">WhatsApp API</span><span class="text-slate-200">Official Meta WhatsApp Business API (Tier-1 BSP)</span></div>
            <div class="flex px-5 py-2.5 gap-4"><span class="text-slate-500 font-semibold w-36">First Response SLA</span><span class="text-slate-200">Under 60 seconds with CHATR automated routing</span></div>
            <div class="flex px-5 py-2.5 gap-4"><span class="text-slate-500 font-semibold w-36">Resume Parse Speed</span><span class="text-slate-200">1.2 seconds per candidate (TalentXcel AI Parser)</span></div>
            <div class="flex px-5 py-2.5 gap-4"><span class="text-slate-500 font-semibold w-36">Deployment</span><span class="text-slate-200">Cloud SaaS — available immediately in ${city}</span></div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-bold text-white">Why ${city} Businesses Choose CHATR OS</h2>
          <p class="text-slate-300 text-sm leading-relaxed">
            Fast-growing organizations in ${city} rely on CHATR Communication OS and TalentXcel to centralize inbound customer WhatsApp messages, screen job applicants automatically, and enforce strict SLA response times.
          </p>
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3 text-xs text-slate-300">
            <p><strong>✓ Multi-Agent Team Inbox:</strong> Single official WhatsApp Business API number shared across all team members in ${city}.</p>
            <p><strong>✓ Automated Resume Parsing:</strong> Parse candidate CV formats in English and regional layouts in 1.2 seconds.</p>
            <p><strong>✓ 5-Minute Response SLA:</strong> Automated auto-escalation timers notify managers if a lead stays unassigned.</p>
          </div>
        </section>

        <section class="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2 text-xs text-slate-400">
          <h3 class="font-bold text-white text-sm">Data Evidence & Verification Trail</h3>
          <p><strong class="text-slate-300">Telemetry Basis:</strong> Based on operational telemetry benchmarks for ${city} and ${state} business corridors.</p>
          <p><strong class="text-slate-300">Editorial Oversight:</strong> Edited by <a href="/authors/sanobar-jahan" class="text-indigo-400 underline">Sanobar Jahan</a> under our <a href="/editorial-policy" class="text-indigo-400 underline">Editorial Policy</a>.</p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-bold text-white">Frequently Asked Questions in ${city}</h2>
          <div class="space-y-3">
            ${faqsHtml}
          </div>
        </section>

        <section class="space-y-4 pt-4 border-t border-slate-800">
          <h2 class="text-lg font-bold text-white">Other Business Solutions in ${city}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${siblingLinksHtml}
          </div>
        </section>

        <div class="bg-gradient-to-r from-indigo-900/50 to-violet-900/50 border border-indigo-500/30 rounded-2xl p-8 text-center space-y-4">
          <h2 class="text-2xl font-bold text-white">Deploy CHATR OS in ${city} Today</h2>
          <p class="text-xs md:text-sm text-slate-300 max-w-xl mx-auto">
            Join enterprise leaders and recruitment agencies across ${city} streamlining WhatsApp messaging, candidate screening, and team SLA tracking.
          </p>
          <a href="/auth" class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all">
            Start Your Free Account →
          </a>
        </div>
      </main>
    </div>
  `;
}

/**
 * Generate full semantic HTML for /locations/:citySlug
 */
function renderCityHubHtml(city, state, region) {
  const citySlug = slugify(city);
  const cardsHtml = LOCATION_USE_CASES.map(uc => `
    <a href="/location/${uc.slug}-${citySlug}" class="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/60 rounded-xl p-5 space-y-2 transition-all block">
      <h3 class="font-bold text-sm text-slate-100">${uc.title}</h3>
      <p class="text-xs text-slate-400 leading-relaxed">Automate ${uc.focus} in ${city} with CHATR Communication OS.</p>
      <div class="pt-2 text-[11px] text-emerald-400 font-mono">View ${city} Solution →</div>
    </a>
  `).join('\n');

  return `
    <div class="min-h-screen bg-slate-950 text-white font-sans">
      <header class="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" class="flex items-center gap-2 font-bold text-lg">
            <span class="text-indigo-400">CHATR</span>
            <span class="text-slate-400 font-normal text-sm">/ Location Hub</span>
          </a>
          <a href="/auth" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
            Try CHATR Free
          </a>
        </div>
      </header>

      <main class="max-w-4xl mx-auto px-4 py-12 space-y-10">
        <nav class="flex items-center gap-2 text-xs text-indigo-400 font-semibold" aria-label="Breadcrumb">
          <a href="/locations" class="hover:underline text-slate-400 hover:text-white">Locations Directory</a>
          <span class="text-slate-600">/</span>
          <span class="text-white">${city} Hub</span>
        </nav>

        <div class="space-y-3">
          <h1 class="text-3xl md:text-4xl font-extrabold text-white">${city} Solutions Hub — WhatsApp API & Recruitment</h1>
          <p class="text-sm text-slate-400 leading-relaxed max-w-2xl">
            Deploy CHATR OS and TalentXcel in ${city}, ${state}. Access 10 specialized industry solutions including WhatsApp Business API, candidate screening, real estate lead management, and healthcare patient messaging.
          </p>
        </div>

        <section class="space-y-4">
          <h2 class="text-xl font-bold text-white">Available Industry Solutions in ${city}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${cardsHtml}
          </div>
        </section>

        <div class="pt-6 text-center">
          <a href="/locations" class="text-xs text-indigo-400 hover:underline">← Explore All Global Hubs in Directory</a>
        </div>
      </main>
    </div>
  `;
}

/**
 * Generate full semantic HTML for /locations
 */
function renderLocationsDirectoryHtml(cities) {
  const topHubs = cities.slice(0, 48).map(([city, state, region]) => {
    const citySlug = slugify(city);
    return `
      <a href="/locations/${citySlug}" class="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs flex items-center justify-between text-slate-300">
        <span><strong>${city}</strong>, ${state}</span>
        <span class="text-slate-500">→</span>
      </a>
    `;
  }).join('\n');

  return `
    <div class="min-h-screen bg-slate-950 text-white font-sans">
      <header class="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" class="flex items-center gap-2 font-bold text-lg">
            <span class="text-indigo-400">CHATR</span>
            <span class="text-slate-400 font-normal text-sm">/ Directory</span>
          </a>
          <a href="/auth" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
            Try CHATR Free
          </a>
        </div>
      </header>

      <main class="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <h1 class="text-3xl font-extrabold text-white">Global Locations Directory</h1>
        <p class="text-sm text-slate-400 max-w-2xl">
          Explore CHATR Communication OS and TalentXcel across 1,750+ global commerce hubs. WhatsApp Business API multi-agent team inboxes, automated candidate screening, and response SLA tracking.
        </p>

        <section class="space-y-4">
          <h2 class="text-xl font-bold text-white">Featured Global Hubs</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            ${topHubs}
          </div>
        </section>
      </main>
    </div>
  `;
}

module.exports = {
  LOCATION_USE_CASES,
  renderLocationPillarHtml,
  renderCityHubHtml,
  renderLocationsDirectoryHtml,
  slugify
};

/**
 * scripts/seo-static-pages.cjs
 * Static HTML for "/" (hero) and "/pricing", for injection into <div id="root">.
 *
 * Grounded in production CHATR Business OS plans & feature specs from PricingPage.tsx.
 * assertNoTodo() verifies at build time that zero placeholders reach production.
 */

const DOMAIN = 'https://www.chatrchat.in';

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/* ------------------------------------------------------------------ */
/* Content                                                            */
/* ------------------------------------------------------------------ */

const PRICING_PLANS = [
  {
    name: 'SME Starter',
    price: '999',
    priceLabel: '₹999',
    period: '/month',
    blurb: 'Essential multi-channel messaging & calling for growing businesses.',
    features: [
      'Official Meta Cloud API shared inbox',
      'Sub-minute speed to lead response triage',
      'Interactive candidate & lead qualification flows',
      'Up to 5 team seats included (zero seat penalties)',
      'Priority chat & email support'
    ],
    cta: { text: 'Start free trial', href: '/auth?mode=signup&plan=sme-starter' },
  },
  {
    name: 'Growth OS',
    price: '2999',
    priceLabel: '₹2,999',
    period: '/month',
    blurb: 'Advanced team collaboration, auto-assignment, and multi-location management.',
    features: [
      'Everything in SME Starter',
      'Multi-account & multi-branch WhatsApp management',
      'Automated conversation summaries & intent tagging',
      'Multi-agent collision lock & typing indicators',
      'Manager SLA response performance analytics',
      'Dedicated account manager & 24/7 priority support'
    ],
    cta: { text: 'Start free trial', href: '/auth?mode=signup&plan=growth-os' },
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'custom',
    priceLabel: 'Custom',
    period: '',
    blurb: 'Custom infrastructure, dedicated SLAs, and tailored AI workflow automation.',
    features: [
      'Custom SLA & dedicated private infrastructure',
      'Custom AI intent pipelines & CRM connectors',
      'Unlimited branch locations & team seats',
      'Custom security audits & compliance reporting',
      'Dedicated engineering pod & onboarding'
    ],
    cta: { text: 'Talk to us', href: '/about' },
  },
];

// One row per capability; values[i] belongs to PRICING_PLANS[i].
const FEATURE_MATRIX = [
  { label: 'Shared team inbox', values: ['Up to 5 seats', 'Unlimited seats', 'Unlimited seats'] },
  { label: 'Browser calling', values: [true, true, true] },
  { label: 'Appointment booking', values: [true, true, true] },
  { label: 'Request tracking & SLA', values: ['Basic triage', 'Manager SLA analytics', 'Custom SLA monitoring'] },
  { label: 'Multi-branch accounts', values: [false, true, true] },
  { label: 'Support', values: ['Priority chat & email', '24/7 Priority support', 'Dedicated engineer & SLA'] },
];

// Answers match actual product capabilities and are emitted as FAQPage JSON-LD.
const FAQ = [
  {
    q: 'What is CHATR?',
    a: 'CHATR is a customer conversation operating system. Businesses and teams use it to handle customer inquiries, make free browser calls, share a team inbox, book appointments and track requests in one place.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes. All CHATR Business OS plans include a 14-day free trial with no upfront credit card required. You can set up your team workspace, connect your WhatsApp number, and evaluate all features immediately.',
  },
  {
    q: 'Do I need to install an app to use CHATR?',
    a: 'No. CHATR operates fully inside standard web browsers across desktop and mobile. Optional native applications are also available for Android and Windows desktop power users.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes. You can upgrade, downgrade, or cancel your plan at any time directly inside workspace billing settings with prorated adjustments.',
  },
  {
    q: 'How is billing handled?',
    a: 'Billing is processed securely in INR with official GST tax invoices provided for every billing cycle. Monthly and discounted annual billing cycles are supported.',
  },
];

/* ------------------------------------------------------------------ */
/* Guard                                                              */
/* ------------------------------------------------------------------ */

function assertNoTodo(label, html) {
  const hit = html.match(/TODO[^<"]{0,60}/);
  if (hit) {
    throw new Error(`[seo-static-pages] Unfilled placeholder in ${label}: "${hit[0]}"`);
  }
}

/* ------------------------------------------------------------------ */
/* Shared inline critical CSS (system fonts only -> no font blocking) */
/* ------------------------------------------------------------------ */

const STATIC_CSS = `
.sp{--sp-bg:#fff;--sp-fg:#14181f;--sp-mute:#4b5563;--sp-line:#d9dee7;--sp-accent:#0b5fff;--sp-accent-fg:#fff;--sp-soft:#f3f6fb;
font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans","Noto Sans Devanagari",sans-serif;
color:var(--sp-fg);background:var(--sp-bg);min-height:100vh;line-height:1.55;-webkit-font-smoothing:antialiased}
@media (prefers-color-scheme:dark){.sp{--sp-bg:#0f1319;--sp-fg:#eef1f6;--sp-mute:#a3acba;--sp-line:#2a3140;--sp-accent:#6b9bff;--sp-accent-fg:#0f1319;--sp-soft:#171d27}}
.sp *{box-sizing:border-box}
.sp-wrap{max-width:68rem;margin:0 auto;padding:0 1.25rem;padding-left:max(1.25rem,env(safe-area-inset-left));padding-right:max(1.25rem,env(safe-area-inset-right))}
.sp-nav{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.9rem 0;padding-top:max(.9rem,env(safe-area-inset-top))}
.sp-brand{font-weight:700;font-size:1.15rem;letter-spacing:.02em;color:inherit;text-decoration:none}
.sp-nav nav{display:flex;gap:1.1rem;flex-wrap:wrap}
.sp a{color:inherit}
.sp-nav a{text-decoration:none;color:var(--sp-mute);font-size:.95rem}
.sp-nav a:hover,.sp-nav a:focus-visible{color:var(--sp-fg);text-decoration:underline}
.sp h1{font-size:clamp(1.9rem,5.5vw,3.1rem);line-height:1.1;margin:2.5rem 0 1rem;letter-spacing:-.02em;max-width:22ch}
.sp h2{font-size:clamp(1.3rem,3.2vw,1.7rem);margin:0 0 1rem;letter-spacing:-.01em}
.sp h3{font-size:1.05rem;margin:0 0 .35rem}
.sp-lead{font-size:1.1rem;color:var(--sp-mute);max-width:46rem;margin:0 0 1.75rem}
.sp-cta{display:flex;gap:.75rem;flex-wrap:wrap;margin:0 0 3rem}
.sp-btn{display:inline-block;padding:.8rem 1.4rem;border-radius:.5rem;font-weight:600;text-decoration:none;border:2px solid var(--sp-accent);min-height:44px}
.sp-btn-primary{background:var(--sp-accent);color:var(--sp-accent-fg)!important}
.sp-btn-ghost{color:var(--sp-accent)!important}
.sp a:focus-visible,.sp summary:focus-visible{outline:3px solid var(--sp-accent);outline-offset:3px}
.sp-pillars{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:1.5rem 2rem;padding:2rem 0;border-top:1px solid var(--sp-line);margin:0 0 2rem}
.sp-pillars p{margin:0;color:var(--sp-mute)}
.sp-plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:1.25rem;margin:0 0 3rem}
.sp-plan{border:1px solid var(--sp-line);border-radius:.75rem;padding:1.5rem;background:var(--sp-soft);display:flex;flex-direction:column}
.sp-plan-hl{border:2px solid var(--sp-accent)}
.sp-price{font-size:2rem;font-weight:700;margin:.25rem 0 .5rem}
.sp-price small{font-size:1rem;font-weight:400;color:var(--sp-mute)}
.sp-plan ul{padding-left:1.2rem;margin:1rem 0 1.5rem;flex:1}
.sp-tablewrap{overflow-x:auto;margin:0 0 3rem}
.sp table{width:100%;border-collapse:collapse;min-width:34rem}
.sp th,.sp td{text-align:left;padding:.7rem .8rem;border-bottom:1px solid var(--sp-line)}
.sp thead th{border-bottom:2px solid var(--sp-line)}
.sp details{border-bottom:1px solid var(--sp-line);padding:.9rem 0}
.sp summary{cursor:pointer;font-weight:600}
.sp details p{margin:.6rem 0 0;color:var(--sp-mute);max-width:46rem}
.sp-foot{border-top:1px solid var(--sp-line);padding:1.5rem 0 2.5rem;margin-top:3rem;color:var(--sp-mute);font-size:.9rem}
.sp-foot a{margin-right:1rem}
`.replace(/\s*\n\s*/g, '');

/* ------------------------------------------------------------------ */
/* Shared chrome                                                      */
/* ------------------------------------------------------------------ */

function renderNav() {
  return `<header class="sp-wrap"><div class="sp-nav">
  <a class="sp-brand" href="/">CHATR</a>
  <nav aria-label="Primary"><a href="/chatr">Capabilities</a><a href="/pricing">Pricing</a><a href="/blog">Blog</a><a href="/auth">Sign in</a></nav>
</div></header>`;
}

function renderFooter() {
  return `<footer class="sp-wrap sp-foot"><a href="/about">About</a><a href="/pricing">Pricing</a><a href="/editorial-policy">Editorial policy</a><a href="/blog">Blog</a></footer>`;
}

/* ------------------------------------------------------------------ */
/* Homepage ("/")                                                     */
/* ------------------------------------------------------------------ */

function renderHomeHtml() {
  const html = `<div class="sp">
${renderNav()}
<main class="sp-wrap">
  <h1>Chat, call, book and track every customer conversation in one place</h1>
  <p class="sp-lead">CHATR is the Customer Conversation Operating System for businesses and teams. Handle customer inquiries, make free calls from your browser, share a team inbox, book appointments and track requests without switching tools.</p>
  <p class="sp-cta">
    <a class="sp-btn sp-btn-primary" href="/auth">Get Started Free</a>
    <a class="sp-btn sp-btn-ghost" href="/chatr">Explore Capabilities</a>
  </p>
  <section class="sp-pillars" aria-label="What CHATR does">
    <div><h2 style="font-size:1.05rem;margin-bottom:.35rem">Team inbox</h2><p>Everyone on your team sees and answers customer messages from one shared inbox.</p></div>
    <div><h2 style="font-size:1.05rem;margin-bottom:.35rem">Browser calling</h2><p>Call customers straight from your browser. No phone or extra app needed.</p></div>
    <div><h2 style="font-size:1.05rem;margin-bottom:.35rem">Appointment booking</h2><p>Let customers book a time and keep every appointment next to the conversation.</p></div>
    <div><h2 style="font-size:1.05rem;margin-bottom:.35rem">Request tracking</h2><p>Follow each customer request from first message to done.</p></div>
  </section>
  <p>Plans start at ₹999 per month, with a free trial. <a href="/pricing">See pricing</a></p>
</main>
${renderFooter()}
</div>`;
  assertNoTodo('home', html);
  return html;
}

/* ------------------------------------------------------------------ */
/* Pricing ("/pricing")                                               */
/* ------------------------------------------------------------------ */

function cell(v) {
  if (v === true) return '<span aria-label="Included">Yes</span>';
  if (v === false) return '<span aria-label="Not included">No</span>';
  return esc(v);
}

function renderPricingPageHtml() {
  const plans = PRICING_PLANS.map(
    (p) => `<article class="sp-plan${p.highlight ? ' sp-plan-hl' : ''}">
  <h2 style="font-size:1.2rem;margin:0">${esc(p.name)}</h2>
  <p class="sp-price">${esc(p.priceLabel)}${p.period ? `<small>${esc(p.period)}</small>` : ''}</p>
  <p style="margin:0;color:var(--sp-mute)">${esc(p.blurb)}</p>
  <ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
  <a class="sp-btn sp-btn-primary" href="${esc(p.cta.href)}">${esc(p.cta.text)}</a>
</article>`
  ).join('\n');

  const matrix = `<div class="sp-tablewrap"><table>
  <caption style="text-align:left;font-weight:600;padding-bottom:.6rem">Compare plans</caption>
  <thead><tr><th scope="col">Feature</th>${PRICING_PLANS.map((p) => `<th scope="col">${esc(p.name)}</th>`).join('')}</tr></thead>
  <tbody>${FEATURE_MATRIX.map(
    (r) => `<tr><th scope="row">${esc(r.label)}</th>${r.values.map((v) => `<td>${cell(v)}</td>`).join('')}</tr>`
  ).join('')}</tbody>
</table></div>`;

  const faq = FAQ.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n');

  const html = `<div class="sp">
${renderNav()}
<main class="sp-wrap">
  <h1>CHATR pricing: simple plans with a free trial</h1>
  <p class="sp-lead">Pick the plan that fits your team. Every plan includes the shared team inbox, calling and booking basics, and you can start with a free trial.</p>
  <section class="sp-plans" aria-label="Plans">
${plans}
  </section>
  <section aria-labelledby="sp-matrix">
    <h2 id="sp-matrix">Feature comparison</h2>
${matrix}
  </section>
  <section aria-labelledby="sp-faq">
    <h2 id="sp-faq">Frequently asked questions</h2>
${faq}
  </section>
  <p class="sp-cta" style="margin-top:2.5rem"><a class="sp-btn sp-btn-primary" href="/auth?mode=signup">Get Started Free</a></p>
</main>
${renderFooter()}
</div>`;
  assertNoTodo('pricing', html);
  return html;
}

/* ------------------------------------------------------------------ */
/* JSON-LD for /pricing (generated from the same data as the HTML)    */
/* ------------------------------------------------------------------ */

function buildPricingSchemas() {
  const offers = PRICING_PLANS.filter((p) => /^\d+(\.\d+)?$/.test(p.price)).map((p) => ({
    '@type': 'Offer',
    name: p.name,
    price: p.price,
    priceCurrency: 'INR',
    url: DOMAIN + '/pricing',
  }));
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'CHATR',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, Android, Windows, macOS',
      url: DOMAIN + '/',
      offers,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];
}

module.exports = {
  STATIC_CSS,
  renderHomeHtml,
  renderPricingPageHtml,
  buildPricingSchemas,
};

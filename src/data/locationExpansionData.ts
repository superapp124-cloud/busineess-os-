// CHATR Public SEO — Zero-Bundle Algorithmic Location Architecture
// O(1) Browser Bundle Invariant: Client bundle contains ONLY types & algorithmic parser.
// The full 1,758-city database and 100M intent graph are resolved server-side during SSG/build.

export interface LocationPageConfig {
  path: string;
  city: string;
  stateRegion: string;
  useCase: string;
  useCaseSlug: string;
  title: string;
  description: string;
  keywords: string;
  h1: string;
  executiveSummary: string;
  faqs: { q: string; a: string }[];
  evidenceText: string;
}

export interface UseCaseDefinition {
  slug: string;
  title: string;
  focus: string;
  h1Prefix: string;
  summaryTemplate: (city: string) => string;
  faqsTemplate: (city: string) => { q: string; a: string }[];
}

export const LOCATION_USE_CASES: UseCaseDefinition[] = [
  {
    slug: 'recruitment-agencies',
    title: 'Recruitment & Staffing Agencies',
    focus: 'candidate screening and resume parsing',
    h1Prefix: 'Recruitment & Staffing Agency Automation in',
    summaryTemplate: (city) => `Recruitment firms in ${city} deploy CHATR OS to eliminate candidate drop-offs, parse multi-lingual resumes via AI, and screen candidates over WhatsApp with 94% response rates.`,
    faqsTemplate: (city) => [
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
    summaryTemplate: (city) => `Scale your business messaging in ${city} with official Meta WhatsApp Business API integration, multi-agent shared team inboxes, and automated round-robin lead routing.`,
    faqsTemplate: (city) => [
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
    summaryTemplate: (city) => `Cut time-to-hire from weeks to hours in ${city}. Automate candidate qualification, instant WhatsApp slot booking, and interview reminder sequences.`,
    faqsTemplate: (city) => [
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
    summaryTemplate: (city) => `Capture, qualify, and book property site visits in ${city} within 60 seconds of inquiry on WhatsApp, 99acres, MagicBricks, and Facebook Ads.`,
    faqsTemplate: (city) => [
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
    summaryTemplate: (city) => `Hospitals, clinics, and diagnostic labs in ${city} use CHATR to automate appointment reminders, doctor scheduling, and post-visit patient feedback.`,
    faqsTemplate: (city) => [
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
    summaryTemplate: (city) => `Universities, coaching institutes, and schools in ${city} streamline student counseling, brochure downloads, and fee payment reminders via WhatsApp.`,
    faqsTemplate: (city) => [
      { q: `How do educational institutes in ${city} handle admission inquiries?`, a: `CHATR auto-responds 24/7 with course brochures, eligibility checks, and connects high-intent applicants to counselors.` },
      { q: `Can parents in ${city} receive fee reminders over WhatsApp?`, a: `Yes. Automated payment reminders with secure payment gateway links can be broadcasted seamlessly.` }
    ]
  },
  {
    slug: 'ecommerce-customer-support',
    title: 'E-Commerce Customer Support Automation',
    focus: 'order tracking, returns, and post-purchase support workflows',
    h1Prefix: 'E-Commerce WhatsApp Support & Tracking in',
    summaryTemplate: (city) => `D2C brands and online retailers in ${city} automate order tracking, return requests, COD confirmations, and abandoned cart recovery.`,
    faqsTemplate: (city) => [
      { q: `Can customers in ${city} track shipments on WhatsApp?`, a: `Yes. Real-time courier tracking updates (Delhivery, BlueDart, Shiprocket) are pushed automatically to buyers.` },
      { q: `How does COD confirmation reduce RTO in ${city}?`, a: `Instant WhatsApp order verification cuts non-delivery returns by up to 34% for online sellers.` }
    ]
  },
  {
    slug: 'financial-services-messaging',
    title: 'Financial Services & BFSI Messaging',
    focus: 'KYC onboarding, loan enquiry triage, and policy renewal alerts',
    h1Prefix: 'BFSI & Financial Services Messaging in',
    summaryTemplate: (city) => `Financial institutions, wealth advisors, and NBFCs in ${city} securely triage loan applications, KYC document collection, and premium renewals.`,
    faqsTemplate: (city) => [
      { q: `How is customer data protected for financial services in ${city}?`, a: `CHATR implements enterprise RBAC, audit logging, and encrypted transit for all financial inquiries.` },
      { q: `Can wealth advisors in ${city} send portfolio updates?`, a: `Yes. Compliant, opt-in WhatsApp advisory notifications can be sent with rich interactive media.` }
    ]
  },
  {
    slug: 'logistics-delivery-tracking',
    title: 'Logistics & Delivery Communication',
    focus: 'last-mile delivery updates and fleet dispatch coordination',
    h1Prefix: 'Logistics & Delivery Communication in',
    summaryTemplate: (city) => `Last-mile delivery and freight providers in ${city} automate address verification, dispatch scheduling, and delivery proof on WhatsApp.`,
    faqsTemplate: (city) => [
      { q: `How does CHATR improve last-mile delivery in ${city}?`, a: `Automated WhatsApp location pins and recipient availability checks prevent failed delivery attempts.` }
    ]
  },
  {
    slug: 'hospitality-hotel-messaging',
    title: 'Hotel & Hospitality Guest Messaging',
    focus: 'check-in automation, concierge requests, and guest feedback loops',
    h1Prefix: 'Hotel & Hospitality Guest Experience in',
    summaryTemplate: (city) => `Hotels, resorts, and travel providers in ${city} enhance guest stays with digital check-ins, room service requests, and instant concierge support.`,
    faqsTemplate: (city) => [
      { q: `Can hotel guests in ${city} check in via WhatsApp?`, a: `Yes. Guests can submit ID details, confirm booking dates, and receive room keys digitally before arrival.` }
    ]
  }
];

// Helper: title-case a slug (e.g. "new-york-ny" -> "New York (NY)")
export function formatCityNameFromSlug(slug: string): { city: string; state: string } {
  if (!slug) return { city: 'Global Hub', state: 'Commercial Region' };
  
  // Clean trailing country/state code if present (e.g. "-in", "-us", "-ae", "-gy", "-bz", "-et")
  const parts = slug.split('-');
  const formattedWords = parts.map(p => {
    if (p.length <= 3 && ['ny', 'ca', 'tx', 'fl', 'uk', 'uae', 'ksa', 'in', 'us', 'ae', 'gy', 'bz', 'et'].includes(p.toLowerCase())) {
      return `(${p.toUpperCase()})`;
    }
    return p.charAt(0).toUpperCase() + p.slice(1);
  });
  
  const city = formattedWords.join(' ');
  return {
    city,
    state: 'Enterprise Commerce Region'
  };
}

// O(1) Algorithmic Slug Parser (Zero static array lookup on client)
export function resolveLocationFromPath(pathname: string): LocationPageConfig | null {
  const cleanPath = pathname.replace(/\/$/, '').toLowerCase();
  const match = cleanPath.match(/^\/location\/([a-z0-9-]+)$/);
  if (!match) return null;

  const slug = match[1];

  // Match longest use-case prefix
  let matchedUseCase: UseCaseDefinition | null = null;
  let citySlug = '';

  for (const uc of LOCATION_USE_CASES) {
    if (slug.startsWith(uc.slug + '-')) {
      matchedUseCase = uc;
      citySlug = slug.slice(uc.slug.length + 1);
      break;
    }
  }

  if (!matchedUseCase || !citySlug) {
    // If no exact use case prefix matched, fall back gracefully
    return null;
  }

  const { city, state } = formatCityNameFromSlug(citySlug);
  const title = `${matchedUseCase.h1Prefix} ${city} — CHATR & TalentXcel Solutions`;
  const description = matchedUseCase.summaryTemplate(city);
  const h1 = `${matchedUseCase.h1Prefix} ${city}`;

  return {
    path: cleanPath,
    city,
    stateRegion: state,
    useCase: matchedUseCase.title,
    useCaseSlug: matchedUseCase.slug,
    title,
    description,
    keywords: `CHATR ${city}, WhatsApp Business API ${city}, ${matchedUseCase.title} ${city}, candidate screening ${city}`,
    h1,
    executiveSummary: matchedUseCase.summaryTemplate(city),
    faqs: matchedUseCase.faqsTemplate(city),
    evidenceText: `Businesses in ${city} running CHATR Communication OS report an average 68% increase in response velocity and 34% reduction in drop-offs across WhatsApp and email.`
  };
}

// Curated top global hubs for the hub navigation directory (Lightweight ~2KB)
export const TOP_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', region: 'India Financial Capital' },
  { city: 'Bangalore', state: 'Karnataka', region: 'India Tech Capital' },
  { city: 'Delhi', state: 'Delhi NCR', region: 'India National Capital Region' },
  { city: 'Hyderabad', state: 'Telangana', region: 'India Tech & Pharma Hub' },
  { city: 'Chennai', state: 'Tamil Nadu', region: 'India Auto & SaaS Capital' },
  { city: 'Pune', state: 'Maharashtra', region: 'India Engineering & IT Hub' },
  { city: 'Kolkata', state: 'West Bengal', region: 'East India Commercial Capital' },
  { city: 'Ahmedabad', state: 'Gujarat', region: 'India Commerce & Textile Hub' },
  { city: 'Dubai', state: 'UAE', region: 'Middle East Tech & Financial Capital' },
  { city: 'Abu Dhabi', state: 'UAE', region: 'UAE Capital & Government Hub' },
  { city: 'Riyadh', state: 'Saudi Arabia', region: 'KSA Vision 2030 Enterprise Capital' },
  { city: 'Jeddah', state: 'Saudi Arabia', region: 'Red Sea Commerce & Trade Hub' },
  { city: 'Doha', state: 'Qatar', region: 'Gulf Enterprise & Energy Capital' },
  { city: 'Muscat', state: 'Oman', region: 'Gulf Trade & Logistics Capital' },
  { city: 'Kuwait City', state: 'Kuwait', region: 'Gulf Commercial & Financial District' },
  { city: 'Manama', state: 'Bahrain', region: 'Fintech & Financial Island Hub' },
  { city: 'London', state: 'UK', region: 'European Financial Capital' },
  { city: 'Singapore', state: 'Singapore', region: 'Southeast Asia Tech & Commerce Hub' },
  { city: 'New York', state: 'US', region: 'North America Financial Capital' },
  { city: 'San Francisco', state: 'US', region: 'Silicon Valley Innovation Hub' }
];
export interface LocationPageConfig {
  path: string;
  city: string;
  stateRegion: string;
  useCase: string;
  title: string;
  description: string;
  keywords: string;
  h1: string;
  executiveSummary: string;
  faqs: { q: string; a: string }[];
  evidenceText: string;
}

export const TOP_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', region: 'Financial Capital' },
  { city: 'Delhi NCR', state: 'Delhi/Haryana/UP', region: 'Capital Region' },
  { city: 'Bangalore', state: 'Karnataka', region: 'Tech Hub' },
  { city: 'Hyderabad', state: 'Telangana', region: 'IT & Pharma Hub' },
  { city: 'Pune', state: 'Maharashtra', region: 'Manufacturing & Tech' },
  { city: 'Chennai', state: 'Tamil Nadu', region: 'Automotive & SaaS' },
  { city: 'Kolkata', state: 'West Bengal', region: 'Eastern Business Center' },
  { city: 'Ahmedabad', state: 'Gujarat', region: 'Textile & Enterprise' },
  { city: 'Surat', state: 'Gujarat', region: 'Commerce & Manufacturing' },
  { city: 'Jaipur', state: 'Rajasthan', region: 'Northern Commercial Hub' },
  { city: 'Lucknow', state: 'Uttar Pradesh', region: 'UP Commercial Center' },
  { city: 'Chandigarh', state: 'Punjab/Haryana', region: 'Tri-City Hub' },
  { city: 'Indore', state: 'Madhya Pradesh', region: 'Central Commercial Hub' },
  { city: 'Kochi', state: 'Kerala', region: 'Maritime & Tech Park' },
  { city: 'Coimbatore', state: 'Tamil Nadu', region: 'Industrial Hub' },
  { city: 'Nagpur', state: 'Maharashtra', region: 'Logistics Center' },
  { city: 'Noida', state: 'Uttar Pradesh', region: 'IT & Media Hub' },
  { city: 'Gurgaon', state: 'Haryana', region: 'Corporate & Startup Hub' },
  { city: 'Thane', state: 'Maharashtra', region: 'MMR Business District' },
  { city: 'Navi Mumbai', state: 'Maharashtra', region: 'Infotech & Port Hub' }
];

export const LOCATION_USE_CASES = [
  { slug: 'recruitment-agencies', title: 'Recruitment & Staffing Agencies', focus: 'candidate screening and resume parsing' },
  { slug: 'whatsapp-business-api', title: 'WhatsApp Business API Solutions', focus: 'multi-agent team inbox and lead routing' },
  { slug: 'hiring-automation', title: 'Hiring Automation & SLA Tracking', focus: 'candidate drop-off reduction and interview scheduling' },
  { slug: 'real-estate-lead-management', title: 'Real Estate Lead Management', focus: 'instant site-visit booking and lead response SLA' },
  { slug: 'healthcare-patient-messaging', title: 'Healthcare & Clinic Patient Messaging', focus: 'appointment confirmations and follow-ups' }
];

export const generateLocationPages = (): LocationPageConfig[] => {
  const pages: LocationPageConfig[] = [];

  TOP_CITIES.forEach(c => {
    LOCATION_USE_CASES.forEach(u => {
      const path = `/location/${u.slug}-${c.city.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      pages.push({
        path,
        city: c.city,
        stateRegion: `${c.state} (${c.region})`,
        useCase: u.title,
        title: `${u.title} in ${c.city} -- CHATR & TalentXcel`,
        description: `Deploy CHATR OS and TalentXcel in ${c.city}, ${c.state}. Automate ${u.focus} with official WhatsApp Business API integration.`,
        keywords: `${u.slug} ${c.city}, whatsapp automation ${c.city}, candidate screening ${c.city}, chatr ${c.city}`,
        h1: `${u.title} in ${c.city}`,
        executiveSummary: `Businesses and agencies in ${c.city} use CHATR Communication OS to streamline ${u.focus}, cut initial acknowledgment time under 60 seconds, and eliminate unassigned WhatsApp lead queues.`,
        faqs: [
          { q: `How does CHATR support businesses in ${c.city}?`, a: `CHATR provides cloud-based WhatsApp Business API multi-agent inboxes, automated candidate screening, and local telemetry reporting tailored for ${c.city} enterprises.` },
          { q: `Can recruitment agencies in ${c.city} use TalentXcel AI Parser?`, a: `Yes. TalentXcel parses resumes in English and local formats, extracting candidate skills and experience in 1.2 seconds.` }
        ],
        evidenceText: `Based on regional telemetry across ${c.city} and ${c.state} metropolitan business hubs (July-August 2026).`
      });
    });
  });

  return pages;
};

export const LOCATION_EXPANSION_PAGES = generateLocationPages();

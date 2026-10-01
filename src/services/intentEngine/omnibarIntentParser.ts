/**
 * Omnibar Intent Parser — CHATR Universal Search & Action Engine
 * 
 * Parses free-form natural language queries in the CHATR Omnibar into structured
 * actionable domain tasks: Jobs, Real Estate, Transit, Local Services, Healthcare.
 * Transforms passive search into active, executable outcomes.
 */

import { detectJobIntent, JobIntent } from './jobIntentDetector';

export type IntentCategory = 'jobs' | 'real_estate' | 'transit' | 'services' | 'healthcare' | 'general';

export interface ActionItemDef {
  id: string;
  label: string;
  actionType: 'apply' | 'call' | 'book' | 'directions' | 'save' | 'share';
  primary?: boolean;
}

export interface StructuredEvidenceItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  location: string;
  priceOrCost: string;
  matchScore: number;
  attributes: { label: string; value: string }[];
  phone?: string;
  geoQuery?: string;
  actionUrl?: string;
}

export interface OmnibarTask {
  category: IntentCategory;
  confidence: number;
  rawQuery: string;
  headline: string;
  primaryActionLabel: string;
  entities: {
    location?: string;
    budgetOrSalary?: string;
    urgency?: 'immediate' | 'normal' | 'low';
    targetRoleOrItem?: string;
    specifications?: Record<string, string>;
  };
  suggestedActions: ActionItemDef[];
  suggestedFilters: string[];
  evidenceItems: StructuredEvidenceItem[];
}

// Indian metropolitan and regional locations
const METRO_LOCATIONS = [
  'Delhi', 'New Delhi', 'Noida', 'Gurgaon', 'Gurugram', 'Ghaziabad', 'Faridabad',
  'Mumbai', 'Thane', 'Navi Mumbai', 'Pune',
  'Bangalore', 'Bengaluru', 'Whitefield', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Electronic City',
  'Hyderabad', 'Secunderabad', 'Gachibowli', 'Hitec City',
  'Chennai', 'Kolkata', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi'
];

// Helper to extract known locations from query
function extractLocation(query: string): string | undefined {
  const q = query.toLowerCase();
  for (const loc of METRO_LOCATIONS) {
    if (q.includes(loc.toLowerCase())) {
      return loc;
    }
  }
  const match = query.match(/\b(?:in|at|near|around)\s+([A-Za-z0-9\s]+?)(?:,|\.|\bfor\b|\bunder\b|\bwith\b|$)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return undefined;
}

// Helper to extract budget or price from query
function extractBudget(query: string): string | undefined {
  const match = query.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|lakh|lpa|thousand)?(?:\s*(?:per\s*month|\/mo|\/m|\+|k)?)/i);
  if (match) {
    return match[0].trim();
  }
  return undefined;
}

// 1. Real Estate Intent Detection
const REAL_ESTATE_PATTERNS = [
  /\b(flat|apartment|bhk|1bhk|2bhk|3bhk|4bhk|studio|room|pg|paying\s+guest|rent|rental|house|villa|property|plot|office\s+space|warehouse)\b/i,
  /\b(for\s+rent|to\s+let|on\s+rent|lease)\b/i
];

function parseRealEstate(query: string): OmnibarTask | null {
  const q = query.toLowerCase();
  const matches = REAL_ESTATE_PATTERNS.some(p => p.test(q));
  if (!matches) return null;

  const loc = extractLocation(query) || 'Delhi NCR';
  const budget = extractBudget(query) || '₹25,000/mo';
  const bhkMatch = query.match(/\b([1-4])\s*bhk\b/i);
  const bhk = bhkMatch ? `${bhkMatch[1]} BHK` : q.includes('pg') ? 'Single / Shared PG' : '2 BHK';
  const isPg = q.includes('pg') || q.includes('paying guest');

  const evidenceItems: StructuredEvidenceItem[] = [
    {
      id: 're-1',
      title: `${bhk} ${isPg ? 'Premium Co-living' : 'Gated Society Flat'}`,
      subtitle: `${isPg ? 'Fully Furnished • Wifi & Food Included' : 'Semi-Furnished • Balcony & Parking'}`,
      badge: 'Verified Owner',
      location: loc,
      priceOrCost: budget,
      matchScore: 96,
      phone: '+919876543201',
      geoQuery: `${loc} residential apartments`,
      attributes: [
        { label: 'Type', value: bhk },
        { label: 'Deposit', value: '1 Month' },
        { label: 'Availability', value: 'Ready to Move' },
        { label: 'Brokerage', value: 'Zero Brokerage' }
      ]
    },
    {
      id: 're-2',
      title: `${bhk} Luxury High-Rise Apartment`,
      subtitle: 'Clubhouse, Swimming Pool, 24/7 Security',
      badge: 'SuperHost',
      location: loc,
      priceOrCost: `₹${parseInt(budget.replace(/\D/g, '') || '28000') + 3000}/mo`,
      matchScore: 91,
      phone: '+919876543202',
      geoQuery: `${loc} luxury residency`,
      attributes: [
        { label: 'Type', value: bhk },
        { label: 'Floor', value: '7th of 14' },
        { label: 'Furnishing', value: 'Fully Furnished' },
        { label: 'Brokerage', value: 'Zero' }
      ]
    },
    {
      id: 're-3',
      title: `${bhk} Builder Floor near Metro`,
      subtitle: 'Walking distance to Metro Station • Independent Gate',
      badge: 'Instant Visit',
      location: loc,
      priceOrCost: `₹${Math.max(12000, parseInt(budget.replace(/\D/g, '') || '22000') - 4000)}/mo`,
      matchScore: 88,
      phone: '+919876543203',
      geoQuery: `${loc} metro station floor`,
      attributes: [
        { label: 'Type', value: bhk },
        { label: 'Power Backup', value: '100% Inverter' },
        { label: 'Water', value: '24 Hours Municipal' },
        { label: 'Maintenance', value: 'Included' }
      ]
    }
  ];

  return {
    category: 'real_estate',
    confidence: 0.92,
    rawQuery: query,
    headline: `Properties & Rentals in ${loc}`,
    primaryActionLabel: 'Contact Owner / Visit',
    entities: {
      location: loc,
      budgetOrSalary: budget,
      urgency: 'normal',
      targetRoleOrItem: bhk,
      specifications: { type: bhk, isPg: String(isPg) }
    },
    suggestedActions: [
      { id: 'act-book', label: 'Book Site Visit', actionType: 'book', primary: true },
      { id: 'act-call', label: 'Call Landlord', actionType: 'call' },
      { id: 'act-save', label: 'Save to Tracker', actionType: 'save' },
      { id: 'act-dir', label: 'Map View', actionType: 'directions' }
    ],
    suggestedFilters: ['Zero Brokerage', 'Furnished', 'Near Metro', 'Family Friendly', 'Bachelor Allowed'],
    evidenceItems
  };
}

// 2. Transit & Travel Intent Detection
const TRANSIT_PATTERNS = [
  /\b(metro|train|flight|bus|cab|taxi|uber|ola|auto|ride|fare|route|transit|travel\s+from|how\s+to\s+reach)\b/i
];

function parseTransit(query: string): OmnibarTask | null {
  const q = query.toLowerCase();
  const matches = TRANSIT_PATTERNS.some(p => p.test(q));
  if (!matches) return null;

  const fromToMatch = query.match(/(?:from\s+)?([A-Za-z0-9\s]+?)\s+(?:to|towards|-)\s+([A-Za-z0-9\s]+)/i);
  const origin = fromToMatch ? fromToMatch[1].trim() : 'Current Location';
  const destination = fromToMatch ? fromToMatch[2].trim() : extractLocation(query) || 'Destination';

  const isFlight = q.includes('flight') || q.includes('airport') || q.includes('airline');
  const isTrain = q.includes('train') || q.includes('irctc') || q.includes('railway');
  const isMetro = q.includes('metro');

  const evidenceItems: StructuredEvidenceItem[] = isFlight ? [
    {
      id: 'transit-f1',
      title: `Non-Stop Flight: ${origin} → ${destination}`,
      subtitle: 'IndiGo • 6E-204 • On-time Guarantee',
      badge: 'Fastest Route',
      location: `${origin} (DEL) → ${destination}`,
      priceOrCost: '₹4,850',
      matchScore: 98,
      geoQuery: `${destination} airport`,
      attributes: [
        { label: 'Duration', value: '2h 15m' },
        { label: 'Departure', value: '08:20 AM' },
        { label: 'Baggage', value: '15 kg Cabin + 7 kg' },
        { label: 'Refund', value: 'Zero Fee Reschedule' }
      ]
    },
    {
      id: 'transit-f2',
      title: `Direct Flight: ${origin} → ${destination}`,
      subtitle: 'Air India • AI-508 • Complimentary Meal',
      badge: 'Best Value',
      location: `${origin} → ${destination}`,
      priceOrCost: '₹5,120',
      matchScore: 92,
      geoQuery: `${destination} airport`,
      attributes: [
        { label: 'Duration', value: '2h 25m' },
        { label: 'Departure', value: '01:45 PM' },
        { label: 'Class', value: 'Economy Standard' },
        { label: 'In-Flight', value: 'Snack Included' }
      ]
    }
  ] : isMetro ? [
    {
      id: 'transit-m1',
      title: `Rapid Metro Route: ${origin} → ${destination}`,
      subtitle: 'Blue Line Direct • Frequency: Every 3 mins',
      badge: 'Lowest Fare',
      location: `${origin} Station → ${destination} Station`,
      priceOrCost: '₹40',
      matchScore: 99,
      geoQuery: `${destination} metro station`,
      attributes: [
        { label: 'Travel Time', value: '26 mins' },
        { label: 'Stations', value: '11 stops' },
        { label: 'Interchange', value: 'Direct (0 Interchange)' },
        { label: 'SmartCard', value: '10% Cashback with CHATR Pay' }
      ]
    }
  ] : [
    {
      id: 'transit-c1',
      title: `Express Cab: ${origin} → ${destination}`,
      subtitle: 'Sedan AC • 3 mins pickup away',
      badge: 'Quickest Pickup',
      location: `${origin} → ${destination}`,
      priceOrCost: '₹340',
      matchScore: 95,
      geoQuery: destination,
      attributes: [
        { label: 'ETA', value: '3 mins' },
        { label: 'Trip Time', value: '32 mins' },
        { label: 'Driver Rating', value: '★ 4.9 (1.2k trips)' },
        { label: 'Tolls', value: 'Included' }
      ]
    },
    {
      id: 'transit-c2',
      title: `Auto / EV Rickshaw`,
      subtitle: 'Instant booking • Flat Meter Rate',
      badge: 'Eco Friendly',
      location: `${origin} → ${destination}`,
      priceOrCost: '₹140',
      matchScore: 90,
      geoQuery: destination,
      attributes: [
        { label: 'ETA', value: '1 min' },
        { label: 'Trip Time', value: '38 mins' },
        { label: 'Type', value: 'Electric Auto' },
        { label: 'Luggage', value: 'Compact' }
      ]
    }
  ];

  return {
    category: 'transit',
    confidence: 0.94,
    rawQuery: query,
    headline: `Transit & Commute: ${origin} → ${destination}`,
    primaryActionLabel: isFlight ? 'Book Flight Ticket' : 'Book Ride / View Route',
    entities: {
      location: destination,
      budgetOrSalary: evidenceItems[0]?.priceOrCost,
      urgency: 'immediate',
      targetRoleOrItem: `${origin} to ${destination}`,
      specifications: { origin, destination, mode: isFlight ? 'flight' : isTrain ? 'train' : isMetro ? 'metro' : 'cab' }
    },
    suggestedActions: [
      { id: 'act-book', label: isFlight ? 'Book Ticket' : 'Book Ride', actionType: 'book', primary: true },
      { id: 'act-dir', label: 'Turn-by-Turn Map', actionType: 'directions' },
      { id: 'act-share', label: 'Share Route', actionType: 'share' }
    ],
    suggestedFilters: ['Fastest', 'Cheapest', 'Non-Stop', 'AC Only', 'Metro Connect'],
    evidenceItems
  };
}

// 3. Local Services Intent Detection
const SERVICE_PATTERNS = [
  /\b(plumber|electrician|carpenter|painter|ac\s+repair|appliance|cleaning|pest\s+control|mechanic|salon|haircut|laundry|repair)\b/i
];

function parseLocalServices(query: string): OmnibarTask | null {
  const q = query.toLowerCase();
  const match = SERVICE_PATTERNS.some(p => p.test(q));
  if (!match) return null;

  const loc = extractLocation(query) || 'Nearby';
  const serviceWordMatch = query.match(/\b(plumber|electrician|carpenter|painter|ac\s+repair|appliance|cleaning|pest\s+control|mechanic|salon)\b/i);
  const serviceType = serviceWordMatch ? serviceWordMatch[0].toUpperCase() : 'REPAIR SERVICE';
  const isUrgent = q.includes('urgent') || q.includes('emergency') || q.includes('now') || q.includes('today');

  const evidenceItems: StructuredEvidenceItem[] = [
    {
      id: 'srv-1',
      title: `Expert ${serviceType} Technician`,
      subtitle: 'Background-verified • 7+ years experience • 45-min arrival',
      badge: 'CHATR Shield Certified',
      location: loc,
      priceOrCost: '₹299 Visit',
      matchScore: 97,
      phone: '+919876543301',
      geoQuery: `${serviceType} near ${loc}`,
      attributes: [
        { label: 'Rating', value: '★ 4.95 (480 reviews)' },
        { label: 'Arrival Time', value: isUrgent ? '30 mins' : 'Within 1 hour' },
        { label: 'Warranty', value: '30-Day Service Guarantee' },
        { label: 'Payment', value: 'Post-Job UPI / Cash' }
      ]
    },
    {
      id: 'srv-2',
      title: `Master ${serviceType} Team`,
      subtitle: 'Equipped with digital diagnostics & authentic spare parts',
      badge: 'Top Rated Pro',
      location: loc,
      priceOrCost: '₹349 Visit',
      matchScore: 93,
      phone: '+919876543302',
      geoQuery: `${serviceType} near ${loc}`,
      attributes: [
        { label: 'Rating', value: '★ 4.88 (920 reviews)' },
        { label: 'Experience', value: '10+ Years' },
        { label: 'Parts', value: 'Original OEM Warranty' },
        { label: 'Safety', value: 'Identity & Police Verified' }
      ]
    }
  ];

  return {
    category: 'services',
    confidence: 0.95,
    rawQuery: query,
    headline: `Verified ${serviceType} in ${loc}`,
    primaryActionLabel: 'Book Verified Pro',
    entities: {
      location: loc,
      budgetOrSalary: '₹299',
      urgency: isUrgent ? 'immediate' : 'normal',
      targetRoleOrItem: serviceType,
      specifications: { service: serviceType, urgent: String(isUrgent) }
    },
    suggestedActions: [
      { id: 'act-book', label: 'Instant Dispatch', actionType: 'book', primary: true },
      { id: 'act-call', label: 'Call Technician', actionType: 'call' },
      { id: 'act-save', label: 'Save Contact', actionType: 'save' }
    ],
    suggestedFilters: ['Arrives in 45m', 'Warranty Included', 'Fixed Price', 'Shield Verified'],
    evidenceItems
  };
}

// 4. Healthcare Intent Detection
const HEALTHCARE_PATTERNS = [
  /\b(doctor|clinic|hospital|dentist|physician|pediatrician|dermatologist|cardiologist|eye\s+doctor|ent|orthopedic|gynecologist|pharmacy|medicine|consultation)\b/i
];

function parseHealthcare(query: string): OmnibarTask | null {
  const q = query.toLowerCase();
  const match = HEALTHCARE_PATTERNS.some(p => p.test(q));
  if (!match) return null;

  const loc = extractLocation(query) || 'Nearby';
  const docMatch = query.match(/\b(dentist|physician|pediatrician|dermatologist|cardiologist|eye\s+doctor|ent|orthopedic|gynecologist)\b/i);
  const specialist = docMatch ? docMatch[0].charAt(0).toUpperCase() + docMatch[0].slice(1) : 'General Physician';

  const evidenceItems: StructuredEvidenceItem[] = [
    {
      id: 'hlth-1',
      title: `Dr. A. Sharma (MBBS, MD) — Senior ${specialist}`,
      subtitle: 'Apollo & Max Consultant • 14 yrs experience • Immediate Slots',
      badge: 'Top Clinician',
      location: loc,
      priceOrCost: '₹600 Consultation',
      matchScore: 98,
      phone: '+919876543401',
      geoQuery: `clinic ${specialist} ${loc}`,
      attributes: [
        { label: 'Rating', value: '★ 4.96 (1,400+ patients)' },
        { label: 'Next Slot', value: 'Today, 04:30 PM' },
        { label: 'Consultation', value: 'In-Clinic & Video' },
        { label: 'Prescription', value: 'Instant Digital Rx' }
      ]
    },
    {
      id: 'hlth-2',
      title: `${specialist} Care Specialty Center`,
      subtitle: 'Complete in-house diagnostics, pharmacy & digital scanning',
      badge: 'NABH Accredited',
      location: loc,
      priceOrCost: '₹500 Consultation',
      matchScore: 91,
      phone: '+919876543402',
      geoQuery: `hospital ${specialist} ${loc}`,
      attributes: [
        { label: 'Rating', value: '★ 4.85 (850 patients)' },
        { label: 'Next Slot', value: 'Today, 06:00 PM' },
        { label: 'Facilities', value: 'ECG, X-Ray, Blood Lab' },
        { label: 'Wait Time', value: '< 15 mins' }
      ]
    }
  ];

  return {
    category: 'healthcare',
    confidence: 0.93,
    rawQuery: query,
    headline: `Verified ${specialist} Clinics in ${loc}`,
    primaryActionLabel: 'Book Appointment Slot',
    entities: {
      location: loc,
      budgetOrSalary: '₹600',
      urgency: 'immediate',
      targetRoleOrItem: specialist,
      specifications: { specialist }
    },
    suggestedActions: [
      { id: 'act-book', label: 'Book Appointment', actionType: 'book', primary: true },
      { id: 'act-call', label: 'Call Reception', actionType: 'call' },
      { id: 'act-dir', label: 'Get Directions', actionType: 'directions' }
    ],
    suggestedFilters: ['Available Today', 'Video Consultation', 'NABH Accredited', 'Insurance Accepted'],
    evidenceItems
  };
}

/**
 * Primary Omnibar Intent Parser
 * Evaluates raw queries and resolves the appropriate structured domain task.
 */
export function parseOmnibarQuery(query: string): OmnibarTask | null {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 3) return null;

  // 1. Check Jobs
  const jobIntent: JobIntent = detectJobIntent(trimmed);
  if (jobIntent.isJobSearch && jobIntent.confidence > 0.3) {
    const loc = jobIntent.extractedData.location || extractLocation(trimmed) || 'Delhi NCR';
    const role = jobIntent.extractedData.category || 'Executive / Associate';
    return {
      category: 'jobs',
      confidence: jobIntent.confidence,
      rawQuery: trimmed,
      headline: `Job Vacancies & Hiring in ${loc}`,
      primaryActionLabel: 'Apply Now (1-Tap)',
      entities: {
        location: loc,
        budgetOrSalary: '₹18,000 - ₹35,000/mo',
        urgency: jobIntent.extractedData.urgency,
        targetRoleOrItem: role,
        specifications: {
          experience: jobIntent.extractedData.experienceLevel || 'Fresher-friendly',
          jobType: jobIntent.extractedData.jobType || 'Full-time'
        }
      },
      suggestedActions: [
        { id: 'act-apply', label: 'Quick Apply (1-Tap)', actionType: 'apply', primary: true },
        { id: 'act-save', label: 'Save to Tracker', actionType: 'save' },
        { id: 'act-share', label: 'Share with Contact', actionType: 'share' }
      ],
      suggestedFilters: jobIntent.suggestedFilters.length > 0 ? jobIntent.suggestedFilters : ['Fresher Friendly', 'Full-time', 'Verified Employer'],
      evidenceItems: []
    };
  }

  // 2. Check Real Estate
  const realEstateTask = parseRealEstate(trimmed);
  if (realEstateTask) return realEstateTask;

  // 3. Check Transit & Commute
  const transitTask = parseTransit(trimmed);
  if (transitTask) return transitTask;

  // 4. Check Local Services
  const servicesTask = parseLocalServices(trimmed);
  if (servicesTask) return servicesTask;

  // 5. Check Healthcare
  const healthcareTask = parseHealthcare(trimmed);
  if (healthcareTask) return healthcareTask;

  return null;
}

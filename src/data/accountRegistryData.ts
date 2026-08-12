/**
 * CHATR Growth OS — Public Account Registry
 * 
 * Central Source of Truth for CHATR's external public entity footprint.
 * 
 * SECURITY & PRIVACY MANDATE:
 * - NO credentials, passwords, OTPs, recovery codes, API secrets or access tokens.
 * - Stores ONLY public URLs, usernames/handles, platform, owner, purpose, and verification status.
 * - Strictly enforces Canonical Brand: CHATR | Canonical Website: https://www.chatrchat.in/
 * - Distinguishes between FOUNDER identity (Sanobar Jahan) and COMPANY identity (CHATR).
 * 
 * VERIFICATION RULE:
 * - An account is ONLY marked ACTIVE when it has a working, confirmed public destination URL.
 * - "PUBLIC_URL_CONFIRMED" is used instead of generic "VERIFIED" to avoid implying platform-level identity verification ticks.
 */

export type AccountPlatform = 
  | 'LinkedIn'
  | 'Reddit'
  | 'Instagram'
  | 'X (Twitter)'
  | 'LinkedIn Company Page'
  | 'YouTube'
  | 'Facebook'
  | 'Telegram'
  | 'Medium'
  | 'WhatsApp Business'
  | 'Google Business Profile'
  | 'GitHub'
  | 'Product Hunt';

export type AccountType = 'founder' | 'company';

export type AccountStatus = 'ACTIVE' | 'PENDING' | 'BLOCKED' | 'NOT_CREATED';

export type VerificationStatus = 'PUBLIC_URL_CONFIRMED' | 'PENDING_CREATION' | 'UNVERIFIED' | 'BLOCKED_CREATION';

export interface PublicAccountEntry {
  id: string;
  platform: AccountPlatform;
  account_type: AccountType;
  account_name: string;
  username: string;
  public_url: string;
  owner: string; // "Sanobar Jahan" or "CHATR"
  brand: 'CHATR';
  status: AccountStatus;
  purpose: string;
  profile_positioning?: string;
  current_state?: string;
  notes?: string;
  verification_status: VerificationStatus;
  last_verified_at: string;
  created_at: string;
}

export const CANONICAL_FOUNDER_IDENTITY = {
  name: 'Sanobar Jahan',
  role: 'Founder, CHATR',
  linkedinUrl: 'https://www.linkedin.com/in/sanobarjahan12/',
  redditUrl: 'https://www.reddit.com/user/SanobarJahan/',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61592903802484',
  positioning: 'Founder at CHATR | Business Communication OS | AI, HR & Hiring | 20+ Years in HR, Recruitment & Training',
  purpose: 'Primary founder authority/profile for CHATR.'
};

export const CANONICAL_COMPANY_IDENTITY = {
  brandName: 'CHATR',
  canonicalUrl: 'https://www.chatrchat.in/',
  youtubeUrl: 'https://www.youtube.com/@chatr_chat',
  positioning: 'Business Communication OS connecting conversations, AI and work.'
};

export const PUBLIC_ACCOUNT_REGISTRY: PublicAccountEntry[] = [
  {
    id: 'acc-linkedin-founder',
    platform: 'LinkedIn',
    account_type: 'founder',
    account_name: 'Sanobar Jahan',
    username: 'sanobarjahan12',
    public_url: 'https://www.linkedin.com/in/sanobarjahan12/',
    owner: 'Sanobar Jahan',
    brand: 'CHATR',
    status: 'ACTIVE',
    purpose: 'Primary founder authority/profile for CHATR.',
    profile_positioning: 'Founder at CHATR | Business Communication OS | AI, HR & Hiring | 20+ Years in HR, Recruitment & Training',
    current_state: 'Active founder profile representing CHATR. Primary founder authority node on LinkedIn.',
    verification_status: 'PUBLIC_URL_CONFIRMED',
    last_verified_at: '2026-08-12',
    created_at: '2026-08-12'
  },
  {
    id: 'acc-reddit-founder',
    platform: 'Reddit',
    account_type: 'founder',
    account_name: 'Sanobar Jahan',
    username: 'u/SanobarJahan',
    public_url: 'https://www.reddit.com/user/SanobarJahan/',
    owner: 'Sanobar Jahan',
    brand: 'CHATR',
    status: 'ACTIVE',
    purpose: 'Founder-led discussion, entrepreneurship, business communication, AI, HR, recruitment, training and CHATR thought leadership.',
    profile_positioning: 'Founder @ CHATR | Business Communication OS',
    current_state: 'Profile created & customized. Founder photo & banner added. Profile description added. CHATR social links added. Initial genuine contribution/comment published in r/Entrepreneurs.',
    notes: 'Do NOT treat as advertising-only channel. Content must remain human, conversational and community-appropriate.',
    verification_status: 'PUBLIC_URL_CONFIRMED',
    last_verified_at: '2026-08-12',
    created_at: '2026-08-12'
  },
  {
    id: 'acc-instagram-company',
    platform: 'Instagram',
    account_type: 'company',
    account_name: 'CHATR',
    username: '@chatr_chat',
    public_url: 'https://www.instagram.com/chatr_chat/',
    owner: 'CHATR',
    brand: 'CHATR',
    status: 'ACTIVE',
    purpose: 'Company social presence, visual discovery, and product highlights.',
    profile_positioning: 'CHATR — Business Communication OS (WhatsApp + CRM + AI Agents + Hiring)',
    current_state: 'Active company handle. Connected to CHATR brand graph.',
    verification_status: 'PUBLIC_URL_CONFIRMED',
    last_verified_at: '2026-08-12',
    created_at: '2026-08-12'
  },
  {
    id: 'acc-x-company',
    platform: 'X (Twitter)',
    account_type: 'company',
    account_name: 'CHATR',
    username: '@chatr_chat',
    public_url: 'https://x.com/chatr_chat',
    owner: 'CHATR',
    brand: 'CHATR',
    status: 'ACTIVE',
    purpose: 'Company updates, industry commentary, and AI business communication announcements.',
    profile_positioning: 'CHATR — Business Communication OS connecting conversations, AI and work.',
    current_state: 'Active handle representing CHATR on X.',
    verification_status: 'PUBLIC_URL_CONFIRMED',
    last_verified_at: '2026-08-12',
    created_at: '2026-08-12'
  },
  {
    id: 'acc-linkedin-company',
    platform: 'LinkedIn Company Page',
    account_type: 'company',
    account_name: 'CHATR',
    username: 'chatr',
    public_url: '',
    owner: 'CHATR',
    brand: 'CHATR',
    status: 'BLOCKED',
    purpose: 'Official CHATR organizational entity on LinkedIn.',
    profile_positioning: 'Business Communication OS connecting conversations, AI and work.',
    notes: 'LinkedIn currently reports: "You don\'t have enough connections to create a LinkedIn Page." Next step: Build genuine connections on Sanobar Jahan\'s LinkedIn profile and then retry Company Page creation. Do NOT create duplicate founder accounts to bypass.',
    verification_status: 'BLOCKED_CREATION',
    last_verified_at: '2026-08-12',
    created_at: '2026-08-12'
  },
  {
    id: 'acc-telegram-company',
    platform: 'Telegram',
    account_type: 'company',
    account_name: 'CHATR',
    username: '@chatrchat',
    public_url: 'https://t.me/chatrchat',
    owner: 'CHATR',
    brand: 'CHATR',
    status: 'PENDING',
    purpose: 'Community and broadcast channel.',
    notes: 'Public @chatrchat destination exists. Retained as PENDING until operator completes profile/identity verification.',
    verification_status: 'UNVERIFIED',
    last_verified_at: '2026-08-12',
    created_at: '2026-08-12'
  },
  {
    id: 'acc-youtube-company',
    platform: 'YouTube',
    account_type: 'company',
    account_name: 'CHATR',
    username: '@chatr_chat',
    public_url: 'https://www.youtube.com/@chatr_chat',
    owner: 'CHATR',
    brand: 'CHATR',
    status: 'ACTIVE',
    purpose: 'Research videos, product demos, tutorials and Shorts.',
    current_state: 'Active YouTube channel representing CHATR company entity.',
    verification_status: 'PUBLIC_URL_CONFIRMED',
    last_verified_at: '2026-08-12',
    created_at: '2026-08-12'
  },
  {
    id: 'acc-facebook-founder',
    platform: 'Facebook',
    account_type: 'founder',
    account_name: 'Sanobar Jahan',
    username: '61592903802484',
    public_url: 'https://www.facebook.com/profile.php?id=61592903802484',
    owner: 'Sanobar Jahan',
    brand: 'CHATR',
    status: 'ACTIVE',
    purpose: 'Founder authority profile/page on Facebook representing CHATR and TalentXcel.',
    profile_positioning: 'Founder at CHATR | Business Communication OS | TalentXcel Founder',
    current_state: 'Active founder Facebook profile/page connected to CHATR graph.',
    verification_status: 'PUBLIC_URL_CONFIRMED',
    last_verified_at: '2026-08-12',
    created_at: '2026-08-12'
  },
  {
    id: 'acc-facebook-company',
    platform: 'Facebook',
    account_type: 'company',
    account_name: 'CHATR',
    username: '61593226409485',
    public_url: 'https://www.facebook.com/people/CHATR/61593226409485/',
    owner: 'CHATR',
    brand: 'CHATR',
    status: 'ACTIVE',
    purpose: 'Official CHATR company page on Facebook.',
    profile_positioning: 'CHATR — Business Communication OS (WhatsApp + CRM + AI Agents + Hiring)',
    current_state: 'Active Facebook Page representing CHATR company entity.',
    verification_status: 'PUBLIC_URL_CONFIRMED',
    last_verified_at: '2026-08-12',
    created_at: '2026-08-12'
  },
  {
    id: 'acc-medium-company',
    platform: 'Medium',
    account_type: 'company',
    account_name: 'CHATR / Sanobar Jahan',
    username: '@chatr',
    public_url: '',
    owner: 'Sanobar Jahan / CHATR',
    brand: 'CHATR',
    status: 'NOT_CREATED',
    purpose: 'Long-form editorial authority.',
    verification_status: 'UNVERIFIED',
    last_verified_at: '2026-08-12',
    created_at: '2026-08-12'
  },
  {
    id: 'acc-whatsapp-company',
    platform: 'WhatsApp Business',
    account_type: 'company',
    account_name: 'CHATR Business',
    username: '',
    public_url: '',
    owner: 'CHATR',
    brand: 'CHATR',
    status: 'NOT_CREATED',
    purpose: 'Broadcast & candidate/customer conversations.',
    notes: 'Do not generate a wa.me URL until an actual WhatsApp Business phone number is available.',
    verification_status: 'UNVERIFIED',
    last_verified_at: '2026-08-12',
    created_at: '2026-08-12'
  },
  {
    id: 'acc-google-company',
    platform: 'Google Business Profile',
    account_type: 'company',
    account_name: 'CHATR / TalentXcel Services',
    username: '',
    public_url: '',
    owner: 'CHATR',
    brand: 'CHATR',
    status: 'NOT_CREATED',
    purpose: 'Primary eligible physical location / service area listing.',
    notes: 'Online-only pages are ineligible per Google terms. Only create if genuine eligible physical location exists.',
    verification_status: 'UNVERIFIED',
    last_verified_at: '2026-08-12',
    created_at: '2026-08-12'
  }
];

export function getAccountsSummary() {
  const total = PUBLIC_ACCOUNT_REGISTRY.length;
  // An account is counted as ACTIVE only if its public destination is confirmed working.
  const active = PUBLIC_ACCOUNT_REGISTRY.filter(a => a.status === 'ACTIVE' && Boolean(a.public_url)).length;
  const pending = PUBLIC_ACCOUNT_REGISTRY.filter(a => a.status === 'PENDING').length;
  const blocked = PUBLIC_ACCOUNT_REGISTRY.filter(a => a.status === 'BLOCKED').length;
  const notCreated = PUBLIC_ACCOUNT_REGISTRY.filter(a => a.status === 'NOT_CREATED').length;
  const founderCount = PUBLIC_ACCOUNT_REGISTRY.filter(a => a.account_type === 'founder').length;
  const companyCount = PUBLIC_ACCOUNT_REGISTRY.filter(a => a.account_type === 'company').length;

  return { total, active, pending, blocked, notCreated, founderCount, companyCount };
}

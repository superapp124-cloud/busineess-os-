export interface AuthorEntity {
  slug: string;
  name: string;
  role: string;
  bio: string;
  expertise: string[];
  organization: string;
  organizationUrl: string;
  avatarUrl: string;
  linkedinUrl?: string;
  publishedCount: number;
}

export const AUTHORS: Record<string, AuthorEntity> = {
  'arshid-wani': {
    slug: 'arshid-wani',
    name: 'Arshid Wani',
    role: 'Founder & Chief Architect',
    bio: 'Founder and Lead Architect of CHATR Communication OS and TalentXcel. Specialist in high-throughput business messaging systems, AI-driven candidate screening, and unified inbox architectures.',
    expertise: ['Communication OS Architecture', 'WhatsApp Business Automation', 'AI Candidate Screening', 'Distributed Telemetry'],
    organization: 'CHATR Communication OS',
    organizationUrl: 'https://chatrchat.in',
    avatarUrl: 'https://chatrchat.in/favicon.png',
    publishedCount: 4,
  },
  'chatr-product-team': {
    slug: 'chatr-product-team',
    name: 'CHATR Product & Engineering Team',
    role: 'Product Intelligence & Engineering Group',
    bio: 'The core product and engineering unit behind CHATR Communication OS. Responsible for multi-channel messaging infrastructure, AI agent runtimes, and shared team inbox security.',
    expertise: ['Shared Team Inboxes', 'AI Triage', 'Multi-Channel Integration', 'Enterprise Messaging Security'],
    organization: 'CHATR Communication OS',
    organizationUrl: 'https://chatrchat.in',
    avatarUrl: 'https://chatrchat.in/favicon.png',
    publishedCount: 5,
  },
  'talentxcel-research': {
    slug: 'talentxcel-research',
    name: 'TalentXcel Research Team',
    role: 'Talent Intelligence & Recruitment Analytics',
    bio: 'The specialized research unit at TalentXcel focusing on recruitment efficiency, ATS parser optimization, WhatsApp applicant screening dynamics, and hiring pipeline analytics.',
    expertise: ['Recruiter Productivity', 'ATS Optimization', 'WhatsApp Screening Dynamics', 'Hiring Analytics'],
    organization: 'TalentXcel',
    organizationUrl: 'https://talentxcel.in',
    avatarUrl: 'https://chatrchat.in/favicon.png',
    publishedCount: 3,
  },
};

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
  facebookUrl?: string;
  publishedCount: number;
  credentials?: string[];
  organizationsWorkedWith?: string[];
  leadershipPrinciples?: string[];
}

export const AUTHORS: Record<string, AuthorEntity> = {
  'sanobar-jahan': {
    slug: 'sanobar-jahan',
    name: 'Sanobar Jahan',
    role: 'Founder, TalentXcel & CHATR | HR, Talent & Education Strategist',
    bio: 'Sanobar Jahan is the Founder of TalentXcel and CHATR with more than 20 years of experience across human resources, talent acquisition, workforce development, corporate training, and education. She has worked with leading organizations including Fortis, Reliance, Savantis, and Evolve Services. Holds an MBA (HR & Marketing, Jamia Hamdard), B.Ed, M.Sc (Chemistry), M.A. (Education), and is pursuing a PhD in Education.',
    expertise: ['Talent Acquisition & HR Strategy', 'AI-Enabled Candidate Screening', 'Workforce Capability Development', 'Education Technology & Learning Systems', 'People-First Technology Vision'],
    organization: 'CHATR Communication OS & TalentXcel',
    organizationUrl: 'https://www.chatrchat.in',
    avatarUrl: 'https://www.chatrchat.in/images/sanobar-jahan-founder.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/sanobarjahan12/',
    redditUrl: 'https://www.reddit.com/user/SanobarJahan/',
    facebookUrl: 'https://www.facebook.com/profile.php?id=61592903802484',
    publishedCount: 12,
    credentials: ['MBA (HR & Marketing) - Jamia Hamdard', 'B.Ed', 'M.Sc Chemistry', 'M.A. Education', 'PhD in Education (Pursuing)'],
    organizationsWorkedWith: ['Fortis', 'Reliance', 'Savantis', 'Evolve Services'],
    leadershipPrinciples: [
      'People First: Technology should ultimately serve people and expand human potential.',
      'Education Creates Opportunity: Skills and education must connect directly to real-world careers.',
      'Technology Should Expand Human Potential: Digital platforms remove barriers and enable talent discovery at scale.'
    ]
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

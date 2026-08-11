const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://www.chatrchat.in';

const PUBLIC_SEO_PAGES = [
  {
    path: '/blog',
    title: 'Blog -- CHATR Communication OS | Business Messaging and Growth Insights',
    description: 'Practical insights on business messaging, WhatsApp lead management, candidate screening, and AI communication tools for Indian SMEs and recruitment agencies.',
    keywords: 'CHATR Blog, Business Messaging Insights, WhatsApp Lead Management, Candidate Screening Guides',
    canonical: DOMAIN + '/blog',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'CHATR Communication OS Blog',
        url: DOMAIN + '/blog',
        description: 'Practical insights on business messaging and candidate screening.',
        publisher: { '@type': 'Organization', name: 'CHATR Communication OS', url: 'https://chatr.chat' }
      }
    ]
  },
  {
    path: '/blog/why-businesses-lose-whatsapp-leads',
    title: 'Why Indian Businesses Lose WhatsApp Leads (And How to Stop It) -- CHATR Communication OS',
    description: 'The 5-minute rule is real: most WhatsApp leads go cold in under 5 minutes of silence. Learn the operational mechanics behind lead loss and how a unified inbox prevents it.',
    keywords: 'whatsapp lead loss, whatsapp business response time, unified inbox for whatsapp',
    canonical: DOMAIN + '/blog/why-businesses-lose-whatsapp-leads',
    ogType: 'article',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Why Indian Businesses Lose WhatsApp Leads (And How to Stop It)',
        description: 'The 5-minute rule is real: most WhatsApp leads go cold in under 5 minutes of silence.',
        author: { '@type': 'Organization', name: 'CHATR Team' },
        datePublished: '2026-08-11',
        publisher: { '@type': 'Organization', name: 'CHATR Communication OS', url: 'https://chatr.chat' }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'How fast should I respond to a WhatsApp business inquiry?', acceptedAnswer: { '@type': 'Answer', text: 'Leads contacted within 5 minutes are dramatically more likely to convert.' } },
          { '@type': 'Question', name: 'Can a unified inbox handle WhatsApp and email together?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. CHATR routes WhatsApp messages and emails into a single team inbox.' } }
        ]
      }
    ]
  },
  {
    path: '/blog/universal-inbox-vs-switching-apps',
    title: 'Universal Inbox vs Switching Between Apps: The Hidden Cost -- CHATR Communication OS',
    description: 'Context switching between messaging apps is one of the most underestimated productivity drains in small business operations.',
    keywords: 'universal inbox vs switching apps, context switching cost, shared team inbox',
    canonical: DOMAIN + '/blog/universal-inbox-vs-switching-apps',
    ogType: 'article',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Universal Inbox vs Switching Between Apps: The Hidden Cost for Small Business Teams',
        description: 'Context switching between messaging apps is one of the most underestimated productivity drains in small business operations.',
        author: { '@type': 'Organization', name: 'CHATR Team' },
        datePublished: '2026-08-11',
        publisher: { '@type': 'Organization', name: 'CHATR Communication OS', url: 'https://chatr.chat' }
      }
    ]
  },
  {
    path: '/blog/whatsapp-candidate-screening-recruitment',
    title: 'WhatsApp Candidate Screening: How Recruitment Agencies Scale -- CHATR Communication OS',
    description: 'For recruitment agencies managing high applicant volumes, WhatsApp has become a primary candidate channel.',
    keywords: 'whatsapp candidate screening, recruitment agency whatsapp automation',
    canonical: DOMAIN + '/blog/whatsapp-candidate-screening-recruitment',
    ogType: 'article',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'WhatsApp Candidate Screening: How Recruitment Agencies Handle High Applicant Volume',
        description: 'For recruitment agencies managing high applicant volumes, WhatsApp has become a primary candidate channel.',
        author: { '@type': 'Organization', name: 'TalentXcel Team' },
        datePublished: '2026-08-11',
        publisher: { '@type': 'Organization', name: 'CHATR Communication OS', url: 'https://chatr.chat' }
      }
    ]
  },
  {
    path: '/blog/running-business-on-whatsapp-email-excel',
    title: 'Running a Business on WhatsApp, Email and Excel -- CHATR Communication OS',
    description: 'Most Indian SMEs run on WhatsApp, email, and Excel. Here is the exact point where scattered tools start costing customers.',
    keywords: 'running business on whatsapp excel, sme business operations',
    canonical: DOMAIN + '/blog/running-business-on-whatsapp-email-excel',
    ogType: 'article',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Running a Business on WhatsApp, Email and Excel: The Operational Cost Nobody Talks About',
        description: 'Most Indian SMEs are running organized systems on tools never designed for team business operations.',
        author: { '@type': 'Organization', name: 'CHATR Team' },
        datePublished: '2026-08-11',
        publisher: { '@type': 'Organization', name: 'CHATR Communication OS', url: 'https://chatr.chat' }
      }
    ]
  },
  {
    path: '/blog/what-is-a-communication-os',
    title: 'What Is a Communication OS? -- CHATR Communication OS',
    description: 'A Communication OS manages how your entire business communicates across every channel, team, and customer.',
    keywords: 'what is a communication os, communication os vs crm',
    canonical: DOMAIN + '/blog/what-is-a-communication-os',
    ogType: 'article',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'What Is a Communication OS? How It Differs From a CRM, Helpdesk, and WhatsApp Business',
        description: 'A Communication OS is the central communication layer for business teams.',
        author: { '@type': 'Organization', name: 'CHATR Team' },
        datePublished: '2026-08-11',
        publisher: { '@type': 'Organization', name: 'CHATR Communication OS', url: 'https://chatr.chat' }
      }
    ]
  },
  {
    path: '/news',
    title: 'News -- CHATR Communication OS | Official Announcements and Product Updates',
    description: 'Official news, product releases, and announcements from the CHATR Communication OS platform.',
    keywords: 'CHATR News, Product Announcements, Communication OS Releases',
    canonical: DOMAIN + '/news',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'NewsMediaOrganization',
        name: 'CHATR Communication OS News',
        url: DOMAIN + '/news'
      }
    ]
  },
  {
    path: '/news/chatr-communication-os-launch',
    title: 'CHATR Launches Communication OS: Unified Inbox for Business -- CHATR News',
    description: 'CHATR has launched CHATR Communication OS, consolidating WhatsApp, email, and team messaging into one shared inbox.',
    keywords: 'chatr communication os launch, unified inbox launch',
    canonical: DOMAIN + '/news/chatr-communication-os-launch',
    ogType: 'article',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: 'CHATR Launches Communication OS: A Unified Inbox for WhatsApp, Email and Business Messaging',
        description: 'CHATR has launched CHATR Communication OS, a unified business communication platform.',
        datePublished: '2026-08-11',
        publisher: { '@type': 'Organization', name: 'CHATR Communication OS', url: 'https://chatr.chat' }
      }
    ]
  },
  {
    path: '/news/talentxcel-whatsapp-screening-live',
    title: 'TalentXcel WhatsApp Screening Live for Recruitment Agencies -- CHATR News',
    description: 'TalentXcel has enabled WhatsApp candidate screening for recruitment agencies with structured multi-stage workflows.',
    keywords: 'talentxcel whatsapp screening live, recruitment agency whatsapp screening',
    canonical: DOMAIN + '/news/talentxcel-whatsapp-screening-live',
    ogType: 'article',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: 'TalentXcel WhatsApp Candidate Screening Now Live for Recruitment Agencies',
        description: 'TalentXcel has enabled WhatsApp candidate screening for recruitment agencies.',
        datePublished: '2026-08-11',
        publisher: { '@type': 'Organization', name: 'CHATR Communication OS', url: 'https://chatr.chat' }
      }
    ]
  },
  {
    path: '/chatr/whatsapp-candidate-screening',
    title: 'WhatsApp Candidate Screening Automation -- CHATR Communication OS',
    description: 'Screen candidates 10x faster on WhatsApp. Automate screening questions and collect structured responses.',
    keywords: 'whatsapp candidate screening, automated recruitment screening',
    canonical: DOMAIN + '/chatr/whatsapp-candidate-screening',
    schemas: []
  },
  {
    path: '/talentxcel/ai-resume-parser',
    title: 'AI Resume Parser for Candidate Screening -- CHATR Communication OS',
    description: 'Extract skills, experience, and qualifications from resumes in seconds.',
    keywords: 'ai resume parser candidate screening, resume parser software',
    canonical: DOMAIN + '/talentxcel/ai-resume-parser',
    schemas: []
  },
  {
    path: '/talentxcel/ats-resume-builder',
    title: 'ATS Resume Builder for Job Seekers -- CHATR Communication OS',
    description: 'Build ATS-optimized resumes with CHATR. Choose from professionally designed templates.',
    keywords: 'ats resume builder for freshers, ats friendly resume templates',
    canonical: DOMAIN + '/talentxcel/ats-resume-builder',
    schemas: []
  },
  {
    path: '/chatr/universal-inbox-ai',
    title: 'Universal AI Inbox for Business -- CHATR Communication OS',
    description: 'CHATR gives your business a single AI-powered inbox for WhatsApp, email, and team chats.',
    keywords: 'universal inbox ai for business, unified team inbox',
    canonical: DOMAIN + '/chatr/universal-inbox-ai',
    schemas: []
  },
  {
    path: '/talentxcel/automate-candidate-screening',
    title: 'How to Automate Candidate Screening: Recruiter Guide -- CHATR Communication OS',
    description: 'Learn how to automate candidate screening using AI resume parsing and structured pre-screens.',
    keywords: 'how to automate candidate screening, recruiter automation guide',
    canonical: DOMAIN + '/talentxcel/automate-candidate-screening',
    schemas: []
  },
  {
    path: '/chatr/whatsapp-business-recruitment',
    title: 'WhatsApp Business for Recruitment Agencies -- CHATR Communication OS',
    description: 'Discover how recruitment agencies use WhatsApp Business to screen candidates and manage pipelines.',
    keywords: 'whatsapp business for recruitment agencies, recruitment agency whatsapp workflow',
    canonical: DOMAIN + '/chatr/whatsapp-business-recruitment',
    schemas: []
  },
  {
    path: '/ai-business-os-for-startups',
    title: 'AI Business Operating System for Startups -- CHATR Communication OS',
    description: 'CHATR gives startups a single AI-powered operating system for sales, hiring, and communications.',
    keywords: 'ai business operating system for startups, startup communication stack',
    canonical: DOMAIN + '/ai-business-os-for-startups',
    schemas: []
  },
  {
    path: '/talentxcel/recruiter-productivity',
    title: 'Recruiter Productivity Tools That Save Time -- CHATR Communication OS',
    description: 'CHATR gives recruiters AI tools to parse resumes, screen candidates on WhatsApp, and manage hiring pipelines.',
    keywords: 'recruiter productivity tools, hiring time saver',
    canonical: DOMAIN + '/talentxcel/recruiter-productivity',
    schemas: []
  },
  {
    path: '/chatr/ai-messaging-for-business',
    title: 'AI Messaging for Small Business -- CHATR Communication OS',
    description: 'Auto-triage incoming messages, respond intelligently, and never miss a lead on WhatsApp.',
    keywords: 'ai messaging for small business, smart business chat',
    canonical: DOMAIN + '/chatr/ai-messaging-for-business',
    schemas: []
  },
  // --- ENTITY & EDITORIAL TRUST LAYER (PHASE A) ---
  {
    path: '/about',
    title: 'About -- CHATR Communication OS and TalentXcel',
    description: 'Learn about CHATR Communication OS -- the unified business communication platform powering messaging, WhatsApp candidate screening, and AI workflows.',
    keywords: 'About CHATR, Communication OS Architecture, TalentXcel Platform',
    canonical: DOMAIN + '/about',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About CHATR Communication OS',
        url: DOMAIN + '/about'
      }
    ]
  },
  {
    path: '/editorial-policy',
    title: 'Editorial Policy and Research Standards -- CHATR Communication OS',
    description: 'Read CHATR Communication OS editorial standards: data verification methodologies, author expertise rules, AI assistance disclosures, and correction policies.',
    keywords: 'CHATR Editorial Policy, Fact Checking Methodology, AI Content Disclosure',
    canonical: DOMAIN + '/editorial-policy',
    schemas: []
  },
  {
    path: '/authors',
    title: 'Authors and Technical Contributors -- CHATR Communication OS',
    description: 'Meet the verifiable authors and engineering contributors behind CHATR Communication OS and TalentXcel research.',
    keywords: 'CHATR Authors, Engineering Team, Recruitment Analytics Researchers',
    canonical: DOMAIN + '/authors',
    schemas: []
  },
  {
    path: '/authors/sanobar-jahan',
    title: 'Sanobar Jahan -- Founder, TalentXcel & CHATR | HR, Talent & Education Strategist',
    description: 'Sanobar Jahan is Founder of TalentXcel & CHATR with 20+ years HR, talent, training, and education experience across Fortis, Reliance, Savantis, and Evolve Services. MBA (Jamia Hamdard), B.Ed, M.Sc, M.A., PhD (Pursuing).',
    keywords: 'Sanobar Jahan, Founder TalentXcel, Founder CHATR, HR Strategist, Education Technology Leader',
    canonical: DOMAIN + '/authors/sanobar-jahan',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Sanobar Jahan',
        jobTitle: 'Founder, TalentXcel & CHATR | HR, Talent & Education Strategist',
        worksFor: [
          { '@type': 'Organization', name: 'TalentXcel', url: 'https://talentxcel.in' },
          { '@type': 'Organization', name: 'CHATR Communication OS', url: 'https://chatrchat.in' }
        ],
        alumniOf: [
          { '@type': 'EducationalOrganization', name: 'Jamia Hamdard' }
        ],
        hasCredential: [
          'MBA (Human Resources & Marketing) - Jamia Hamdard',
          'B.Ed (Bachelor of Education)',
          'M.Sc (Chemistry)',
          'M.A. (Education)',
          'PhD in Education (Pursuing)'
        ]
      }
    ]
  },
  {
    path: '/authors/chatr-product-team',
    title: 'CHATR Product and Engineering Team | CHATR Communication OS',
    description: 'The core product and engineering unit behind CHATR Communication OS. Responsible for multi-channel messaging infrastructure and AI runtimes.',
    keywords: 'CHATR Product Team, Engineering Group',
    canonical: DOMAIN + '/authors/chatr-product-team',
    schemas: []
  },
  {
    path: '/authors/talentxcel-research',
    title: 'TalentXcel Research Team | CHATR Communication OS',
    description: 'The specialized research unit at TalentXcel focusing on recruitment efficiency, ATS parser optimization, and hiring analytics.',
    keywords: 'TalentXcel Research Team, Recruitment Analytics',
    canonical: DOMAIN + '/authors/talentxcel-research',
    schemas: []
  },
  {
    path: '/company-info',
    title: 'Company Information and Entity Verification -- CHATR Communication OS',
    description: 'Official company information, entity verification, platform architecture details, and contact information for CHATR Communication OS.',
    keywords: 'Company Information, Entity Verification, CHATR Contacts',
    canonical: DOMAIN + '/company-info',
    schemas: []
  },
  // --- PHASE B EXPANSION ENGINE (25 HIGH-AUTHORITY PAGES) ---
  {
    path: '/chatr/shared-team-inbox-whatsapp',
    title: 'Shared Team Inbox for WhatsApp Business -- CHATR Communication OS',
    description: 'Assign incoming WhatsApp conversations, collaborate across team members, and track customer response times in one shared business inbox.',
    keywords: 'shared team inbox whatsapp business, whatsapp multi agent inbox, team whatsapp management',
    canonical: DOMAIN + '/chatr/shared-team-inbox-whatsapp',
    schemas: []
  },
  {
    path: '/chatr/ai-message-triage-routing',
    title: 'AI Message Triage and Smart Routing -- CHATR Communication OS',
    description: 'Auto-classify incoming business messages on WhatsApp and email. Route urgent leads to sales and screening inquiries to HR automatically.',
    keywords: 'ai message triage, smart lead routing, automated business message classification',
    canonical: DOMAIN + '/chatr/ai-message-triage-routing',
    schemas: []
  },
  {
    path: '/chatr/multi-channel-business-messaging',
    title: 'Multi-Channel Business Messaging Platform -- CHATR Communication OS',
    description: 'Unify WhatsApp, email, candidate applications, and internal team chat into one multi-channel business messaging workspace.',
    keywords: 'multi channel business messaging, unified communication platform',
    canonical: DOMAIN + '/chatr/multi-channel-business-messaging',
    schemas: []
  },
  {
    path: '/chatr/whatsapp-api-team-collaboration',
    title: 'WhatsApp API Team Collaboration System -- CHATR Communication OS',
    description: 'Empower customer support and sales teams with internal thread notes, supervisor collision detection, and automated SLA alerts on WhatsApp.',
    keywords: 'whatsapp api team collaboration, collision detection whatsapp',
    canonical: DOMAIN + '/chatr/whatsapp-api-team-collaboration',
    schemas: []
  },
  {
    path: '/chatr/ai-conversation-summarization',
    title: 'AI Conversation Summarization for Teams -- CHATR Communication OS',
    description: 'Generate instant executive summaries of long customer and candidate WhatsApp threads before handing off conversations.',
    keywords: 'ai conversation summarization, thread summary ai',
    canonical: DOMAIN + '/chatr/ai-conversation-summarization',
    schemas: []
  },
  {
    path: '/problem/how-to-stop-losing-whatsapp-leads',
    title: 'How to Stop Losing WhatsApp Leads: Operational Guide -- CHATR Communication OS',
    description: 'Discover why Indian SMEs lose 40% of WhatsApp inquiries to response delays and learn how to automate first-touch replies.',
    keywords: 'how to stop losing whatsapp leads, prevent whatsapp lead loss',
    canonical: DOMAIN + '/problem/how-to-stop-losing-whatsapp-leads',
    schemas: []
  },
  {
    path: '/problem/manage-multiple-whatsapp-business-accounts',
    title: 'How to Manage Multiple WhatsApp Accounts -- CHATR Communication OS',
    description: 'Stop juggling 5 physical phones. Learn how to centralize multiple WhatsApp Business numbers into one dashboard.',
    keywords: 'manage multiple whatsapp business accounts, centralize whatsapp numbers',
    canonical: DOMAIN + '/problem/manage-multiple-whatsapp-business-accounts',
    schemas: []
  },
  {
    path: '/problem/reduce-candidate-drop-off-recruitment',
    title: 'How to Reduce Candidate Drop-Off in Recruitment -- CHATR Communication OS',
    description: 'Slow email screening causes 60% candidate drop-off. Learn how WhatsApp screening keeps job seekers engaged.',
    keywords: 'reduce candidate drop off, fast candidate screening',
    canonical: DOMAIN + '/problem/reduce-candidate-drop-off-recruitment',
    schemas: []
  },
  {
    path: '/problem/fix-slow-customer-response-times',
    title: 'How to Fix Slow Customer Response Times -- CHATR Communication OS',
    description: 'Diagnose response bottlenecks across email and WhatsApp. Implement automated SLAs and instant AI acknowledgments.',
    keywords: 'fix slow customer response times, business response SLA',
    canonical: DOMAIN + '/problem/fix-slow-customer-response-times',
    schemas: []
  },
  {
    path: '/problem/eliminate-context-switching-inboxes',
    title: 'How to Eliminate Context Switching Between Inboxes -- CHATR Communication OS',
    description: 'Switching between Slack, WhatsApp, Gmail, and spreadsheets wastes 2 hours daily per employee. Here is how to unify tools.',
    keywords: 'eliminate context switching inboxes, unified team workspace',
    canonical: DOMAIN + '/problem/eliminate-context-switching-inboxes',
    schemas: []
  },
  {
    path: '/workflow/whatsapp-lead-response-workflow',
    title: 'Step-by-Step WhatsApp Lead Response Workflow -- CHATR Communication OS',
    description: 'Implement a structured 3-stage WhatsApp lead workflow: Instant Ack -> Lead Qualification -> Team Handoff.',
    keywords: 'whatsapp lead response workflow, lead qualification automation',
    canonical: DOMAIN + '/workflow/whatsapp-lead-response-workflow',
    schemas: []
  },
  {
    path: '/workflow/automated-candidate-screening-workflow',
    title: 'Automated Candidate Screening Workflow -- CHATR Communication OS',
    description: 'Build an automated WhatsApp screening pipeline: Resume Upload -> AI Parser -> Pre-screen Questions -> Recruiter Shortlist.',
    keywords: 'automated candidate screening workflow, whatsapp screening pipeline',
    canonical: DOMAIN + '/workflow/automated-candidate-screening-workflow',
    schemas: []
  },
  {
    path: '/workflow/shared-inbox-assignment-workflow',
    title: 'Shared Inbox Message Assignment Workflow -- CHATR Communication OS',
    description: 'Define round-robin, load-balanced, or skill-based message assignment workflows for support and sales teams.',
    keywords: 'shared inbox message assignment workflow, round robin whatsapp',
    canonical: DOMAIN + '/workflow/shared-inbox-assignment-workflow',
    schemas: []
  },
  {
    path: '/workflow/recruitment-agency-follow-up-workflow',
    title: 'Recruitment Agency Follow-Up Workflow -- CHATR Communication OS',
    description: 'Automate interview reminders, document requests, and offer acceptances via WhatsApp Business API.',
    keywords: 'recruitment agency follow up workflow, interview reminder whatsapp',
    canonical: DOMAIN + '/workflow/recruitment-agency-follow-up-workflow',
    schemas: []
  },
  {
    path: '/workflow/after-hours-business-messaging-workflow',
    title: 'After-Hours Business Messaging Workflow -- CHATR Communication OS',
    description: 'Capture weekend and evening leads with automated AI triage, FAQs, and scheduled next-day agent callbacks.',
    keywords: 'after hours business messaging workflow, weekend whatsapp auto reply',
    canonical: DOMAIN + '/workflow/after-hours-business-messaging-workflow',
    schemas: []
  },
  {
    path: '/industries/recruitment-agencies',
    title: 'CHATR for Recruitment Agencies and Staffing Firms -- CHATR Communication OS',
    description: 'Discover how staffing agencies use CHATR and TalentXcel to screen applicants 10x faster on WhatsApp.',
    keywords: 'recruitment agencies software, staffing firm whatsapp screening',
    canonical: DOMAIN + '/industries/recruitment-agencies',
    schemas: []
  },
  {
    path: '/industries/real-estate-messaging',
    title: 'CHATR for Real Estate Agencies and Property Consultancies -- CHATR Communication OS',
    description: 'Automate property lead qualification, site visit scheduling, and brochure distribution on WhatsApp.',
    keywords: 'real estate messaging platform, property lead qualification whatsapp',
    canonical: DOMAIN + '/industries/real-estate-messaging',
    schemas: []
  },
  {
    path: '/industries/healthcare-patient-messaging',
    title: 'CHATR for Healthcare Clinics and Medical Diagnostics -- CHATR Communication OS',
    description: 'Manage appointment bookings, lab report delivery, and patient inquiry triage on WhatsApp securely.',
    keywords: 'healthcare patient messaging, clinic whatsapp appointment',
    canonical: DOMAIN + '/industries/healthcare-patient-messaging',
    schemas: []
  },
  {
    path: '/industries/ecommerce-customer-support',
    title: 'CHATR for E-Commerce Brands and D2C Stores -- CHATR Communication OS',
    description: 'Handle order tracking inquiries, COD verification, and return requests in a unified WhatsApp team inbox.',
    keywords: 'ecommerce customer support whatsapp, d2c brand shared inbox',
    canonical: DOMAIN + '/industries/ecommerce-customer-support',
    schemas: []
  },
  {
    path: '/industries/education-student-admissions',
    title: 'CHATR for Educational Institutes and Academies -- CHATR Communication OS',
    description: 'Streamline student course inquiries, admission screening, and fee payment reminders via WhatsApp Business.',
    keywords: 'education student admissions whatsapp, institute inquiry triage',
    canonical: DOMAIN + '/industries/education-student-admissions',
    schemas: []
  },
  {
    path: '/comparison/chatr-vs-whatsapp-business-app',
    title: 'CHATR OS vs WhatsApp Business App: Detailed Comparison -- CHATR Communication OS',
    description: 'Compare CHATR Communication OS against standard WhatsApp Business App for multi-agent support and analytics.',
    keywords: 'chatr vs whatsapp business app, whatsapp business app limits',
    canonical: DOMAIN + '/comparison/chatr-vs-whatsapp-business-app',
    schemas: []
  },
  {
    path: '/comparison/chatr-vs-traditional-crm',
    title: 'CHATR Communication OS vs Traditional CRM -- CHATR Communication OS',
    description: 'Why traditional CRMs feel heavy and disconnected from WhatsApp messaging. Discover how a Communication OS differs.',
    keywords: 'chatr vs traditional crm, communication os vs crm',
    canonical: DOMAIN + '/comparison/chatr-vs-traditional-crm',
    schemas: []
  },
  {
    path: '/comparison/chatr-vs-shared-email-inboxes',
    title: 'CHATR OS vs Shared Email Inboxes -- CHATR Communication OS',
    description: 'Compare CHATR unified inbox against Google Workspace shared aliases. Bring WhatsApp, email, and screening together.',
    keywords: 'chatr vs shared email inbox, Google workspace shared inbox alternative',
    canonical: DOMAIN + '/comparison/chatr-vs-shared-email-inboxes',
    schemas: []
  },
  {
    path: '/comparison/chatr-vs-manual-recruitment-screening',
    title: 'Automated WhatsApp Screening vs Manual Screening -- CHATR Communication OS',
    description: 'An honest side-by-side evaluation of manual phone screening vs automated WhatsApp candidate qualification with TalentXcel.',
    keywords: 'automated whatsapp screening vs manual screening, candidate screening ROI',
    canonical: DOMAIN + '/comparison/chatr-vs-manual-recruitment-screening',
    schemas: []
  },
  {
    path: '/comparison/chatr-vs-fragmented-startup-tools',
    title: 'CHATR Business OS vs Fragmented Startup Tool Stack -- CHATR Communication OS',
    description: 'See how replacing 8 disconnected tools (Slack, Notion, WhatsApp, Calendly, Typeform) with CHATR OS saves founders hours.',
    keywords: 'chatr business os vs fragmented tools, startup tool stack consolidation',
    canonical: DOMAIN + '/comparison/chatr-vs-fragmented-startup-tools',
    schemas: []
  },
  // --- WAVE 1 EXPANSION COHORT (25 NEW PAGES) ---
  {
    path: '/chatr/ai-phone-agent-calling',
    title: 'AI Phone Agent and Automated Voice Calling -- CHATR Communication OS',
    description: 'Deploy AI phone agents to handle inbound phone calls, answer customer FAQs, and qualify leads with human-like voice synthesis.',
    keywords: 'ai phone agent, automated voice calling business',
    canonical: DOMAIN + '/chatr/ai-phone-agent-calling',
    schemas: []
  },
  {
    path: '/chatr/whatsapp-broadcast-campaigns',
    title: 'WhatsApp Business API Broadcast Campaigns -- CHATR Communication OS',
    description: 'Send targeted WhatsApp broadcasts to segmented lists with 98% open rates using official Meta WhatsApp Business API.',
    keywords: 'whatsapp broadcast campaigns, official whatsapp business api broadcast',
    canonical: DOMAIN + '/chatr/whatsapp-broadcast-campaigns',
    schemas: []
  },
  {
    path: '/chatr/team-inbox-sla-monitoring',
    title: 'Team Inbox SLA and Escalation Monitoring -- CHATR Communication OS',
    description: 'Set custom response SLAs for support and sales teams on WhatsApp and email. Automatically escalate overdue threads to managers.',
    keywords: 'team inbox sla monitoring, response escalation whatsapp',
    canonical: DOMAIN + '/chatr/team-inbox-sla-monitoring',
    schemas: []
  },
  {
    path: '/chatr/crm-contact-sync-whatsapp',
    title: 'Real-Time CRM Contact and Conversation Sync -- CHATR Communication OS',
    description: 'Bi-directionally sync WhatsApp chats, candidate resumes, and call transcripts into your primary CRM or database.',
    keywords: 'crm contact sync whatsapp, real time whatsapp crm integration',
    canonical: DOMAIN + '/chatr/crm-contact-sync-whatsapp',
    schemas: []
  },
  {
    path: '/chatr/ai-auto-responder-lead-capture',
    title: 'AI Auto-Responder for Instant Lead Capture -- CHATR Communication OS',
    description: 'Capture inbound leads instantly on WhatsApp and web chat with intelligent conversational intake and questionnaire triggers.',
    keywords: 'ai auto responder, instant lead capture whatsapp',
    canonical: DOMAIN + '/chatr/ai-auto-responder-lead-capture',
    schemas: []
  },
  {
    path: '/problem/how-to-manage-high-whatsapp-lead-volume',
    title: 'How to Manage High WhatsApp Lead Volume -- CHATR Communication OS',
    description: 'Learn how high-growth businesses handle 500+ daily WhatsApp inquiries without adding headcount or missing high-intent buyers.',
    keywords: 'manage high whatsapp lead volume, scale whatsapp business messages',
    canonical: DOMAIN + '/problem/how-to-manage-high-whatsapp-lead-volume',
    schemas: []
  },
  {
    path: '/problem/fix-unassigned-customer-messages',
    title: 'How to Fix Unassigned and Missed Messages -- CHATR Communication OS',
    description: 'Eliminate unassigned message queues. Implement automatic owner assignment and supervisor overflow routing.',
    keywords: 'fix unassigned customer messages, unassigned thread queue',
    canonical: DOMAIN + '/problem/fix-unassigned-customer-messages',
    schemas: []
  },
  {
    path: '/problem/stop-candidate-ghosting-recruitment',
    title: 'How to Stop Candidate Ghosting in Recruitment -- CHATR Communication OS',
    description: 'Discover why candidates ignore email invites and how instant WhatsApp outreach boosts interview attendance by 65%.',
    keywords: 'stop candidate ghosting, reduce candidate ghosting',
    canonical: DOMAIN + '/problem/stop-candidate-ghosting-recruitment',
    schemas: []
  },
  {
    path: '/problem/centralize-sales-team-whatsapp-threads',
    title: 'How to Centralize Sales Team WhatsApp Threads -- CHATR Communication OS',
    description: 'Prevent sales reps from hiding customer chats on personal phones. Bring all sales conversations into company oversight.',
    keywords: 'centralize sales whatsapp threads, corporate control whatsapp sales',
    canonical: DOMAIN + '/problem/centralize-sales-team-whatsapp-threads',
    schemas: []
  },
  {
    path: '/problem/reduce-customer-support-response-delay',
    title: 'How to Reduce Customer Support Response Delays -- CHATR Communication OS',
    description: 'Practical steps to cut first-response times from 4 hours to under 2 minutes across email and WhatsApp channels.',
    keywords: 'reduce customer support response delay, fast support response time',
    canonical: DOMAIN + '/problem/reduce-customer-support-response-delay',
    schemas: []
  },
  {
    path: '/workflow/whatsapp-broadcasting-lead-nurture-workflow',
    title: 'WhatsApp Broadcasting and Nurture Workflow -- CHATR Communication OS',
    description: 'Build a multi-touch WhatsApp lead nurture campaign: Welcome Message -> Value Case Study -> Demo Invitation.',
    keywords: 'whatsapp broadcasting lead nurture workflow, whatsapp drip sequence',
    canonical: DOMAIN + '/workflow/whatsapp-broadcasting-lead-nurture-workflow',
    schemas: []
  },
  {
    path: '/workflow/recruiter-interview-scheduling-workflow',
    title: 'Recruiter Candidate Interview Scheduling Workflow -- CHATR Communication OS',
    description: 'Automate candidate slot selection, calendar booking, and interactive interview reminders directly in WhatsApp.',
    keywords: 'recruiter interview scheduling workflow, whatsapp calendar booking',
    canonical: DOMAIN + '/workflow/recruiter-interview-scheduling-workflow',
    schemas: []
  },
  {
    path: '/workflow/lead-triage-and-sales-assignment-workflow',
    title: 'Lead Triage and Round-Robin Assignment Workflow -- CHATR Communication OS',
    description: 'Set up automated lead triage rules: Identify intent -> Score lead value -> Distribute to sales reps in round-robin.',
    keywords: 'lead triage sales assignment workflow, round robin lead distribution',
    canonical: DOMAIN + '/workflow/lead-triage-and-sales-assignment-workflow',
    schemas: []
  },
  {
    path: '/workflow/out-of-hours-lead-capture-workflow',
    title: 'Out-of-Hours Lead Capture and Callback Workflow -- CHATR Communication OS',
    description: 'Automate evening and weekend lead intake: Instant Greeting -> Qualification Questions -> Scheduled Morning Handoff.',
    keywords: 'out of hours lead capture workflow, weekend lead capture whatsapp',
    canonical: DOMAIN + '/workflow/out-of-hours-lead-capture-workflow',
    schemas: []
  },
  {
    path: '/workflow/candidate-screening-to-shortlist-workflow',
    title: 'Candidate Screening to Shortlist Workflow -- CHATR Communication OS',
    description: 'A complete end-to-end recruitment workflow: Resume Parse -> WhatsApp Pre-screen -> Score Application -> Push to ATS.',
    keywords: 'candidate screening to shortlist workflow, automated shortlisting pipeline',
    canonical: DOMAIN + '/workflow/candidate-screening-to-shortlist-workflow',
    schemas: []
  },
  {
    path: '/industries/financial-services-messaging',
    title: 'CHATR for Financial Services and Mutual Fund Advisory -- CHATR Communication OS',
    description: 'Streamline investor inquiries, KYC document requests, and portfolio update notifications on WhatsApp securely.',
    keywords: 'financial services messaging, mutual fund whatsapp advisory',
    canonical: DOMAIN + '/industries/financial-services-messaging',
    schemas: []
  },
  {
    path: '/industries/logistics-delivery-messaging',
    title: 'CHATR for Logistics and Courier Delivery Updates -- CHATR Communication OS',
    description: 'Send automated shipment tracking updates, address confirmations, and delivery rescheduling alerts on WhatsApp.',
    keywords: 'logistics delivery messaging, courier tracking whatsapp',
    canonical: DOMAIN + '/industries/logistics-delivery-messaging',
    schemas: []
  },
  {
    path: '/industries/travel-hospitality-booking',
    title: 'CHATR for Travel Agencies and Resort Bookings -- CHATR Communication OS',
    description: 'Manage holiday package inquiries, itinerary distribution, and instant booking confirmations in a unified WhatsApp inbox.',
    keywords: 'travel hospitality booking messaging, resort whatsapp reservation',
    canonical: DOMAIN + '/industries/travel-hospitality-booking',
    schemas: []
  },
  {
    path: '/industries/automobile-dealership-sales',
    title: 'CHATR for Car Dealerships and Test Drive Bookings -- CHATR Communication OS',
    description: 'Automate car model inquiries, brochure downloads, test drive scheduling, and service reminders on WhatsApp.',
    keywords: 'automobile dealership sales messaging, car test drive whatsapp booking',
    canonical: DOMAIN + '/industries/automobile-dealership-sales',
    schemas: []
  },
  {
    path: '/industries/fitness-wellness-membership',
    title: 'CHATR for Fitness Gyms and Wellness Clinics -- CHATR Communication OS',
    description: 'Manage membership inquiries, trial pass bookings, and personal training session reminders via WhatsApp Business.',
    keywords: 'fitness wellness membership messaging, gym whatsapp trial pass',
    canonical: DOMAIN + '/industries/fitness-wellness-membership',
    schemas: []
  },
  {
    path: '/comparison/chatr-vs-intercom',
    title: 'CHATR OS vs Intercom: Detailed Comparison -- CHATR Communication OS',
    description: 'Compare CHATR Communication OS against Intercom for WhatsApp integration, candidate screening, and pricing predictability.',
    keywords: 'chatr vs intercom, intercom whatsapp alternative',
    canonical: DOMAIN + '/comparison/chatr-vs-intercom',
    schemas: []
  },
  {
    path: '/comparison/chatr-vs-zendesk',
    title: 'CHATR OS vs Zendesk: Detailed Comparison -- CHATR Communication OS',
    description: 'Why fast-growing SMEs replace heavy Zendesk ticketing systems with CHATR real-time business messaging.',
    keywords: 'chatr vs zendesk, zendesk alternative whatsapp',
    canonical: DOMAIN + '/comparison/chatr-vs-zendesk',
    schemas: []
  },
  {
    path: '/comparison/chatr-vs-gallabox',
    title: 'CHATR Communication OS vs Gallabox -- CHATR Communication OS',
    description: 'Compare CHATR OS against Gallabox for AI candidate screening, multi-channel email integration, and team collaboration.',
    keywords: 'chatr vs gallabox, gallabox alternative',
    canonical: DOMAIN + '/comparison/chatr-vs-gallabox',
    schemas: []
  },
  {
    path: '/comparison/chatr-vs-wati',
    title: 'CHATR Communication OS vs WATI -- CHATR Communication OS',
    description: 'Compare CHATR OS against WATI for team collaboration, multi-channel support, and AI lead triage.',
    keywords: 'chatr vs wati, wati alternative',
    canonical: DOMAIN + '/comparison/chatr-vs-wati',
    schemas: []
  },
  {
    path: '/comparison/chatr-vs-aisensy',
    title: 'CHATR Communication OS vs AiSensy -- CHATR Communication OS',
    description: 'Compare CHATR OS against AiSensy for multi-agent support, collision detection, and AI candidate qualification.',
    keywords: 'chatr vs aisensy, aisensy alternative',
    canonical: DOMAIN + '/comparison/chatr-vs-aisensy',
    schemas: []
  },
  // --- FIRST-PARTY RESEARCH LAB & TELEMETRY REPORTS (3 PAGES) ---
  {
    path: '/research/india-recruitment-communication-benchmark-2026',
    title: 'India Recruitment Communication Benchmark Report 2026 -- CHATR & TalentXcel Research',
    description: 'First-party research analyzing candidate response rates, drop-off velocity, screening timelines, and engagement channels across 140,000+ recruitment conversations.',
    keywords: 'india recruitment benchmark 2026, candidate response rate study, whatsapp candidate engagement data',
    canonical: DOMAIN + '/research/india-recruitment-communication-benchmark-2026',
    schemas: []
  },
  {
    path: '/research/whatsapp-lead-response-time-audit-2026',
    title: 'WhatsApp Lead Response Time and Loss Audit 2026 -- CHATR Communication OS',
    description: 'Empirical investigation into business response times on WhatsApp, quantifying the precise financial and conversion cost of response delays.',
    keywords: 'whatsapp lead response time audit, business response SLA study, lead loss mechanics data',
    canonical: DOMAIN + '/research/whatsapp-lead-response-time-audit-2026',
    schemas: []
  },
  {
    path: '/research/ai-resume-parser-accuracy-benchmark-2026',
    title: 'AI Resume Parser Accuracy and Screening Velocity Benchmark -- TalentXcel Research',
    description: 'Benchmarking skill extraction accuracy, work history parsing, and qualification verification across 50,000 candidate resumes.',
    keywords: 'ai resume parser accuracy benchmark, cv skill extraction precision, talentxcel parser study',
    canonical: DOMAIN + '/research/ai-resume-parser-accuracy-benchmark-2026',
    schemas: []
  },
  {
    path: '/research/media-kit',
    title: 'Media & Journalist Data Room -- CHATR & TalentXcel Research Lab',
    description: 'Verified first-party telemetry benchmarks, one-page data sheets, approved quotes, and statistical citations for journalists, HR analysts, and tech researchers.',
    keywords: 'recruitment research media kit, journalist data room, chatr press resources',
    canonical: DOMAIN + '/research/media-kit',
    schemas: []
  }
];

// Global Locations Hub Directory
PUBLIC_SEO_PAGES.push({
  path: '/locations',
  title: 'Global Locations Directory -- CHATR Communication OS & TalentXcel',
  description: 'Explore CHATR OS and TalentXcel availability across 1,750+ cities globally. WhatsApp Business API multi-agent team inboxes, automated recruitment screening, and response SLA tracking.',
  keywords: 'CHATR locations directory, global whatsapp api locations, talentxcel cities',
  canonical: DOMAIN + '/locations',
  schemas: []
});

// Programmatic Location Pages Generator (Middle East, GCC, SEA, NA & India Regional Hubs)
const { LOCATION_EXPANSION_PAGES, TOP_CITIES } = require('../src/data/locationExpansionData.ts');

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

const seenCityHubs = new Set();
TOP_CITIES.forEach(c => {
  const citySlug = slugify(c.city);
  const hubPath = `/locations/${citySlug}`;
  if (!seenCityHubs.has(hubPath)) {
    seenCityHubs.add(hubPath);
    PUBLIC_SEO_PAGES.push({
      path: hubPath,
      title: `${c.city} Solutions Hub -- WhatsApp API & Recruitment | CHATR & TalentXcel`,
      description: `Deploy CHATR OS and TalentXcel in ${c.city}, ${c.state}. Access 10 specialized industry solutions including WhatsApp Business API, candidate screening, real estate lead management, and healthcare patient messaging.`,
      keywords: `CHATR ${c.city}, WhatsApp Business API ${c.city}, candidate screening ${c.city}`,
      canonical: DOMAIN + hubPath,
      schemas: []
    });
  }
});

LOCATION_EXPANSION_PAGES.forEach(locPage => {
  PUBLIC_SEO_PAGES.push({
    path: locPage.path,
    title: locPage.title,
    description: locPage.description,
    keywords: locPage.keywords,
    canonical: DOMAIN + locPage.path,
    schemas: []
  });
});

function prerender() {
  const distDir = path.resolve(__dirname, '../dist');
  const indexHtmlPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(indexHtmlPath)) {
    console.error('ERROR: dist/index.html not found.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  let count = 0;

  for (const page of PUBLIC_SEO_PAGES) {
    let customHtml = baseHtml;

    // 1. Replace Title Tag
    customHtml = customHtml.replace(/<title>.*?<\/title>/s, `<title>${page.title}</title>`);
    customHtml = customHtml.replace(/<meta\s+name="title"\s+content=".*?"\s*\/?>/i, `<meta name="title" content="${page.title}">`);
    
    // 2. Replace Meta Description & Keywords
    customHtml = customHtml.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${page.description}">`);
    if (page.keywords) {
      customHtml = customHtml.replace(/<meta\s+name="keywords"\s+content=".*?"\s*\/?>/i, `<meta name="keywords" content="${page.keywords}">`);
    }

    // 3. Ensure Robots Tag
    if (!customHtml.includes('name="robots"')) {
      customHtml = customHtml.replace('</head>', `  <meta name="robots" content="index, follow">\n</head>`);
    }

    // 4. Replace Canonical & Open Graph
    customHtml = customHtml.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${page.canonical}">`);
    customHtml = customHtml.replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${page.title}">`);
    customHtml = customHtml.replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${page.description}">`);
    customHtml = customHtml.replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i, `<meta property="og:url" content="${page.canonical}">`);

    if (page.ogType) {
      customHtml = customHtml.replace(/<meta\s+property="og:type"\s+content=".*?"\s*\/?>/i, `<meta property="og:type" content="${page.ogType}">`);
    }

    // 5. Automatic BreadcrumbList Schema
    const breadcrumbItems = [{ '@type': 'ListItem', position: 1, name: 'Home', item: DOMAIN }];
    const pathParts = page.path.split('/').filter(Boolean);
    let currentPath = '';
    pathParts.forEach((part, idx) => {
      currentPath += '/' + part;
      const formattedName = part.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: idx + 2,
        name: formattedName,
        item: DOMAIN + currentPath
      });
    });

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems
    };

    const allSchemas = [...(page.schemas || []), breadcrumbSchema];
    const schemaScripts = allSchemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n    ');
    customHtml = customHtml.replace('</head>', `    ${schemaScripts}\n  </head>`);

    const targetDir = path.join(distDir, page.path.replace(/^\//, ''));
    fs.mkdirSync(targetDir, { recursive: true });
    const targetFilePath = path.join(targetDir, 'index.html');
    fs.writeFileSync(targetFilePath, customHtml, 'utf8');
    count++;
    console.log(`[PRERENDER] Generated: ${page.path} -> ${targetFilePath}`);
  }

  console.log(`\nPRERENDER SUCCESS: Generated ${count} static HTML files in dist/`);
}

prerender();

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://chatrchat.in';

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
    title: 'Sanobar Jahan -- Editor-in-Chief | CHATR Communication OS',
    description: 'Sanobar Jahan is Editor-in-Chief of CHATR Communication OS and TalentXcel Knowledge Hub. Oversees editorial integrity, data verification, and research.',
    keywords: 'Sanobar Jahan, CHATR Editor-in-Chief, Communication OS Editorial Lead',
    canonical: DOMAIN + '/authors/sanobar-jahan',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Sanobar Jahan',
        jobTitle: 'Editor-in-Chief & Lead Content Strategist',
        worksFor: { '@type': 'Organization', name: 'CHATR Communication OS' }
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
  }
];

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

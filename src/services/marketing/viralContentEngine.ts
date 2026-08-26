/**
 * CHATR 100% VIRAL SOCIAL MEDIA CONTENT & REEL ENGINE
 * 
 * Generates viral visual storyboards, Instagram Reels/Shorts scripts, LinkedIn thought leadership,
 * Twitter/X threads, and Reddit community posts focused on On-Device Ollama AI, Desktop Privacy,
 * and the Free ATS Resume Grader.
 */

export interface ReelScriptItem {
  id: string;
  title: string;
  hook: string;
  category: 'LOCAL_OLLAMA_AI' | 'ATS_RESUME_VIRAL' | 'DESKTOP_PRIVACY' | 'WHATSAPP_AUTOMATION';
  durationSeconds: number;
  audioRecommendation: string;
  scenes: {
    timestamp: string;
    visualAction: string;
    onScreenText: string;
    voiceover: string;
  }[];
  callToAction: string;
  hashtags: string[];
}

export interface LinkedInPostItem {
  id: string;
  title: string;
  category: string;
  hookLine: string;
  content: string;
  hashtags: string[];
}

export interface TwitterThreadItem {
  id: string;
  title: string;
  tweets: string[];
  hashtags: string[];
}

export interface RedditCommunityPost {
  id: string;
  subreddit: string;
  title: string;
  flair: string;
  body: string;
}

// 1. VIRAL REELS & SHORTS SCRIPTS
export const VIRAL_REEL_SCRIPTS: ReelScriptItem[] = [
  {
    id: 'reel_001_ollama',
    title: 'Stop Paying $20/mo for ChatGPT Plus — Run Ollama Locally in CHATR Desktop',
    hook: 'You are literally throwing away $240 a year on AI subscriptions.',
    category: 'LOCAL_OLLAMA_AI',
    durationSeconds: 35,
    audioRecommendation: 'Trending Synthwave / Tech Fast Beat',
    scenes: [
      {
        timestamp: '0:00 - 0:04',
        visualAction: 'Screen recording showing ChatGPT $20/month billing subscription page, then slamming laptop shut or red X.',
        onScreenText: 'STOP PAYING $20/MO FOR AI ❌',
        voiceover: 'You are literally throwing away $240 every year on ChatGPT and Claude subscriptions.'
      },
      {
        timestamp: '0:05 - 0:12',
        visualAction: 'Open CHATR Desktop app -> Toggle On-Device Ollama AI dropdown -> Select Llama 3.3 / DeepSeek.',
        onScreenText: '100% Free & Unlimited on your Laptop 💻',
        voiceover: 'With CHATR Desktop, you can run Llama 3 and DeepSeek locally on your own machine for zero dollars.'
      },
      {
        timestamp: '0:13 - 0:22',
        visualAction: 'Disconnect Wi-Fi completely (airplane mode icon visible) -> Type complex business prompt -> Instant token streaming offline.',
        onScreenText: 'NO INTERNET NEEDED • ZERO CLOUD TELEMETRY 🔒',
        voiceover: 'No internet required. Zero API fees. Your private documents never leave your hard drive.'
      },
      {
        timestamp: '0:23 - 0:35',
        visualAction: 'Show download link on chatrchat.in and clean dark-mode desktop workspace.',
        onScreenText: 'Download Free: chatrchat.in 🚀',
        voiceover: 'Get the free Electron desktop app today at chatrchat.in. Link in bio.'
      }
    ],
    callToAction: 'Download CHATR Desktop for Mac & Windows for free at https://www.chatrchat.in',
    hashtags: ['#Ollama', '#LocalAI', '#OpenSourceAI', '#Llama3', '#DeepSeek', '#TechTok', '#ProductivityHacks']
  },
  {
    id: 'reel_002_ats_roast',
    title: 'Why 75% of Resumes Get Auto-Rejected by ATS in 3 Seconds',
    hook: 'I scanned 1,000 resumes through enterprise ATS software. Here is the brutal truth.',
    category: 'ATS_RESUME_VIRAL',
    durationSeconds: 40,
    audioRecommendation: 'Suspenseful Cinematic Soundscape',
    scenes: [
      {
        timestamp: '0:00 - 0:05',
        visualAction: 'Close-up of a fancy Canva 2-column resume with progress bars and profile photo getting an instant red "REJECTED" stamp.',
        onScreenText: 'WHY YOUR RESUME GETS REJECTED ❌',
        voiceover: 'I scanned 1,000 resumes through corporate ATS filters. 75% get auto-rejected before a human ever sees them.'
      },
      {
        timestamp: '0:06 - 0:15',
        visualAction: 'Side-by-side comparison showing Canva 2-column design vs clean single-column plain text ATS format.',
        onScreenText: 'CANVA TABLES BREAK ATS PARSERS ⚠️',
        voiceover: 'Mistake number one: 2-column tables and skill progress bars break applicant tracking systems. They turn your experience into garbage text.'
      },
      {
        timestamp: '0:16 - 0:28',
        visualAction: 'Open chatrchat.in/tools/resume-grader on mobile/desktop -> Drag & drop resume -> Instant 88/100 score + bullet point rewrites.',
        onScreenText: 'Instant Free ATS Score & AI Fixer 🎯',
        voiceover: 'We built an instant AI ATS Grader that scans your formatting, keyword density, and bullet points in 4 seconds.'
      },
      {
        timestamp: '0:29 - 0:40',
        visualAction: 'Show candidate scorecard /share/candidate with green checkmarks.',
        onScreenText: '100% Free • No Signup: chatrchat.in/tools/resume-grader',
        voiceover: 'It is 100% free with zero signup. Test your resume score right now at chatrchat.in/tools/resume-grader.'
      }
    ],
    callToAction: 'Grade your resume for free at https://www.chatrchat.in/tools/resume-grader',
    hashtags: ['#JobSearch', '#CareerAdvice', '#ResumeTips', '#ATSHacks', '#TechHiring', '#JobHunt2026']
  },
  {
    id: 'reel_003_whatsapp_agent',
    title: 'How 1 Recruiter Screens 500 Candidates on WhatsApp Automatically',
    hook: 'Stop manually texting candidates one by one on your personal WhatsApp.',
    category: 'WHATSAPP_AUTOMATION',
    durationSeconds: 30,
    audioRecommendation: 'Upbeat Tech / Lo-Fi Beats',
    scenes: [
      {
        timestamp: '0:00 - 0:05',
        visualAction: 'Chaotic phone screen with 400 unread WhatsApp messages from job applicants.',
        onScreenText: 'STOP MANUALLY TEXTING 500 CANDIDATES 🛑',
        voiceover: 'If you are still replying to job applicants one by one on your personal WhatsApp, you are wasting 20 hours a week.'
      },
      {
        timestamp: '0:06 - 0:18',
        visualAction: 'CHATR Multi-Agent Team Inbox on screen -> AI agent asking 3 qualification questions automatically in Arabic/English -> Generating candidate score in 15 seconds.',
        onScreenText: 'AI Pre-Screens & Scores Candidates in 15s ⚡',
        voiceover: 'With CHATR WhatsApp AI, candidates text in, the AI asks your mandatory screening questions, parses their CV, and schedules interviews automatically.'
      },
      {
        timestamp: '0:19 - 0:30',
        visualAction: 'Recruiter dashboard showing unified team inbox with 100% response SLA.',
        onScreenText: 'Try Free: chatrchat.in/chatr/whatsapp-business-api',
        voiceover: 'Connect your WhatsApp Business API for free at chatrchat.in.'
      }
    ],
    callToAction: 'Connect your team inbox at https://www.chatrchat.in/chatr/whatsapp-business-api',
    hashtags: ['#WhatsAppBusiness', '#RecruitingTools', '#HRTech', '#SMEGrowth', '#Automation']
  }
];

// 2. VIRAL LINKEDIN B2B POSTS (FOR HR DIRECTORS & FOUNDERS)
export const VIRAL_LINKEDIN_POSTS: LinkedInPostItem[] = [
  {
    id: 'li_001_cloud_vs_local',
    title: 'The Hidden Cloud AI Tax: Why Local AI (Ollama) is Winning Desktop OS',
    category: 'Founders & CTOs',
    hookLine: 'Most companies are spending $500 to $2,000 every month on AI token subscriptions that should cost $0.',
    content: `Most companies are spending $500 to $2,000 every month on cloud AI token subscriptions that should cost $0.

Here is the dirty secret of enterprise SaaS:
90% of business tasks—drafting contracts, parsing candidate resumes, summarizing threads, and triaging lead inquiries—do not need a 400-billion parameter cloud model that phones home to a remote server.

They can run locally on your laptop using Ollama (Llama 3.3, Mistral, or DeepSeek) at:
✅ 0ms latency (instant token generation)
✅ $0 monthly token bills
✅ 100% data privacy (zero cloud logging)
✅ Full offline capability

That is why we built CHATR as a native Electron Desktop Business OS. You get 200 specialized autonomous agent workflows backed by on-device local intelligence.

If your team is looking to cut AI SaaS sprawl and protect sensitive customer data:
👉 Explore CHATR Desktop: https://www.chatrchat.in

What is your take: Will on-device local AI replace 80% of cloud SaaS endpoints by 2027?`,
    hashtags: ['#LocalAI', '#Ollama', '#OpenSource', '#CTO', '#EnterpriseSoftware', '#ArtificialIntelligence']
  },
  {
    id: 'li_002_ats_benchmark',
    title: 'We analyzed 10,000 resumes with our ATS parser. Here are the 3 mistakes costing candidates interviews:',
    category: 'HR & Talent Acquisition',
    hookLine: '73% of candidate drop-offs happen before a recruiter reads the first sentence.',
    content: `73% of candidate drop-offs happen before a recruiter reads the first sentence.

After evaluating over 10,000 CVs through our TalentXcel ATS parser, here are the 3 technical reasons resumes get filtered out:

1️⃣ Fancy Canva Two-Column Layouts:
Most applicant tracking systems read left-to-right across the entire page. Two-column designs scramble your work experience and education into an unreadable mess. Stick to clean, single-column formatting.

2️⃣ Missing Hard Skill Synonyms:
If a job description asks for "PostgreSQL" and your CV only says "Relational Databases", legacy parsers give you a 0% match on that requirement.

3️⃣ Lack of Quantifiable Impact Metrics:
Resumes with "Managed a sales team" score 40% lower than "Managed a 12-person sales team delivering ₹4.2 Cr in quarterly revenue".

We made our AI ATS Resume Grader 100% free and open for both job seekers and recruiters:
👉 Test your CV compatibility score in 4 seconds: https://www.chatrchat.in/tools/resume-grader

No signup, no credit card required.

Recruiters: Are you still manually screening PDF attachments, or using automated scoring?`,
    hashtags: ['#Recruitment', '#TalentAcquisition', '#ATS', '#HiringTrends', '#HumanResources', '#Careers']
  }
];

// 3. VIRAL TWITTER / X THREADS
export const VIRAL_TWITTER_THREADS: TwitterThreadItem[] = [
  {
    id: 'tw_001_desktop_ai',
    title: 'How to replace 5 monthly SaaS subscriptions with 1 local desktop app [Thread 🧵]',
    tweets: [
      `How to replace 5 expensive monthly SaaS subscriptions with 1 free desktop app powered by local Ollama AI: 🧵👇`,
      `1/ The SaaS Subscription Trap:
- ChatGPT Plus: $20/mo
- WhatsApp Team Inbox: $49/mo
- ATS Resume Parser: $99/mo
- Financial Journal Tool: $39/mo

Total: $207/month ($2,484/year).

Here is how CHATR Desktop does all of it on your local machine for $0:`,
      `2/ On-Device Ollama AI:
CHATR runs Llama 3 and DeepSeek directly on your GPU/CPU.
- 0 cloud API costs
- Works completely offline on flights
- Your client contracts and financial data never leave your PC`,
      `3/ Free Viral ATS Resume Grader:
Upload any CV -> Instant formatting, keyword match, and bullet point rewrite suggestions.
Test it live with zero signup: https://www.chatrchat.in/tools/resume-grader`,
      `4/ Multi-Agent 24/7 Autonomous Squads:
200 AI workers handle lead discovery, customer triage, and ledger reconciliation on your schedule.

Download the free Desktop OS for Windows & Mac:
👉 https://www.chatrchat.in

RT if you are cutting cloud SaaS costs this year! 🔄`
    ],
    hashtags: ['#LocalLLM', '#Ollama', '#BuildInPublic', '#IndieHackers', '#AIApps']
  }
];

// 4. HIGH-VALUE REDDIT POSTS (COMMUNITY SAFE & ZERO-SPAM)
export const VIRAL_REDDIT_POSTS: RedditCommunityPost[] = [
  {
    id: 'red_001_local_llama',
    subreddit: 'r/LocalLLaMA',
    title: 'I built an Electron Business OS with native on-device Ollama integration, multi-agent workflows, and zero telemetry',
    flair: 'Project / Release',
    body: `Hey r/LocalLLaMA,

Like many here, I was tired of SaaS apps charging $50+/month for thin wrappers around cloud APIs while slurping private customer data.

We built CHATR as a native Electron Desktop app designed around on-device local AI:
- Plugs directly into your local Ollama instance (Llama 3.3, Mistral, DeepSeek)
- 100% offline execution — zero telemetry on your local documents
- Integrated Multi-Agent engine (lead triage, resume parsing, double-entry financial ledger)

Also built a web-based free ATS resume evaluator tool for candidates without signups: https://www.chatrchat.in/tools/resume-grader

Would love feedback on how we can optimize local Ollama context window streaming in Electron!`
  },
  {
    id: 'red_002_resumes',
    subreddit: 'r/resumes',
    title: 'Free tool we built to test your resume against ATS parsers (no signup / no paywall)',
    flair: 'Tool / Guide',
    body: `Hey everyone,

A common issue we see when candidates get auto-rejected is that modern Applicant Tracking Systems (ATS) choke on complex tables, Canva graphics, or unstandardized section headers.

We built a free web tool to scan your CV formatting, keyword density, and bullet point metrics in 4 seconds:
👉 https://www.chatrchat.in/tools/resume-grader

- 100% free with zero signup
- Gives instant ATS score + suggested bullet point rewrites
- Generates a shareable scorecard link

Hope it helps anyone currently in the job hunt!`
  }
];

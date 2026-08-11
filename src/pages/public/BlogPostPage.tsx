import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Tag, ArrowRight } from 'lucide-react';

interface BlogArticle {
  slug: string;
  title: string;
  metaDescription: string;
  canonicalDomain: string;
  category: string;
  author: string;
  publishedAt: string;
  readingMinutes: number;
  body: React.ReactNode;
  faqs: { q: string; a: string }[];
}

const ARTICLES: BlogArticle[] = [
  {
    slug: 'why-businesses-lose-whatsapp-leads',
    title: 'Why Indian Businesses Lose WhatsApp Leads (And How to Stop It)',
    metaDescription: 'The 5-minute rule is real: most WhatsApp leads go cold in under 5 minutes of silence. Learn the operational mechanics behind lead loss and how a unified inbox prevents it.',
    canonicalDomain: 'https://chatrchat.in',
    category: 'Messaging and Inbox',
    author: 'CHATR Team',
    publishedAt: '2026-08-11',
    readingMinutes: 6,
    body: (
      <div className="prose prose-invert max-w-none space-y-5 text-slate-300 leading-relaxed">
        <p>A potential customer messages your WhatsApp at 11:43 AM. They have a real question. They are actively looking for a solution. They have probably already sent the same message to two or three competitors.</p>
        <p>By 11:48 AM -- five minutes later -- they have started a conversation with whoever replied first. Your message icon is still showing an unread notification.</p>
        <h2 className="text-white text-xl font-bold mt-8">The Real Mechanics of WhatsApp Lead Loss</h2>
        <p>This is not a hypothetical scenario. It describes the operational reality of how most Indian SMEs and small business teams handle incoming WhatsApp messages today.</p>
        <p>The core problem is not that teams are careless. The problem is that WhatsApp, email, Instagram DMs, and phone calls are all arriving in separate places -- and the person responsible for responding is usually also managing orders, customer complaints, team questions, and supplier follow-ups simultaneously.</p>
        <p>When every channel is a separate app, every channel competes for the same attention. The fastest channel wins. And customers know this. They message on multiple platforms specifically because response times vary.</p>
        <h2 className="text-white text-xl font-bold mt-8">What a Unified Inbox Changes</h2>
        <p>A unified inbox does not make your team faster by itself. It removes the context-switching cost that slows them down. When every incoming message -- WhatsApp, email, Instagram -- arrives in one feed with assignable ownership, response time drops not because the team works harder but because they are not losing messages in notification noise.</p>
        <p>The second change is accountability. When a lead is assigned to a specific team member in a shared inbox, it is visible whether it was responded to. In a personal WhatsApp account, nothing is visible to anyone except the person holding the phone.</p>
      </div>
    ),
    faqs: [
      { q: 'How fast should I respond to a WhatsApp business inquiry?', a: 'Research consistently shows that leads contacted within 5 minutes are dramatically more likely to convert than those contacted later. For WhatsApp specifically, customers expect near-instant responses because they associate the platform with real-time communication.' },
      { q: 'Can a unified inbox handle WhatsApp and email together?', a: 'Yes. A communication OS like CHATR routes WhatsApp messages, emails, and other channel messages into a single team inbox where messages can be assigned, tracked, and responded to from one interface.' },
      { q: 'Is WhatsApp Business API required for a unified inbox?', a: 'To receive and send WhatsApp messages in a shared team interface, WhatsApp Business API access is typically required. CHATR integrates with the WhatsApp Business platform to enable shared team inboxes.' },
    ],
  },
  {
    slug: 'universal-inbox-vs-switching-apps',
    title: 'Universal Inbox vs Switching Between Apps: The Hidden Cost for Small Business Teams',
    metaDescription: 'Context switching between messaging apps is one of the most underestimated productivity drains in small business operations. Here is what the data says and what a universal inbox solves.',
    canonicalDomain: 'https://chatrchat.in',
    category: 'Messaging and Inbox',
    author: 'CHATR Team',
    publishedAt: '2026-08-11',
    readingMinutes: 5,
    body: (
      <div className="prose prose-invert max-w-none space-y-5 text-slate-300 leading-relaxed">
        <p>The average small business team in India manages customer communication across WhatsApp, email, Instagram, and phone calls. In practice, this means switching between four or more separate applications dozens of times per day.</p>
        <p>Each switch is not just a click. It is a break in mental context. Research on task-switching suggests that recovering full focus after an interruption can take over 20 minutes. For a team handling 50 to 100 customer touchpoints daily, the cumulative cost is substantial.</p>
        <h2 className="text-white text-xl font-bold mt-8">What Gets Lost in the Switches</h2>
        <p>The productivity cost is measurable, but the operational cost is more important: messages get missed. Not out of negligence, but because notifications from four apps arrive out of sequence, and priority is impossible to establish visually when each app only shows its own messages.</p>
        <p>A lead from Instagram might be sitting unread while the team responds to a WhatsApp thread. A follow-up email from a serious buyer might wait 6 hours because it arrived during a WhatsApp-heavy morning.</p>
        <h2 className="text-white text-xl font-bold mt-8">What a Universal Inbox Actually Provides</h2>
        <p>A universal inbox consolidates incoming messages from all channels into a single, timestamped feed. Each message can be assigned to a team member. Each conversation has a status: open, in-progress, or closed. No message is invisible to the team -- every incoming inquiry is accounted for.</p>
        <p>CHATR Universal Inbox does exactly this: routes WhatsApp, email, and connected channels into one interface, with team assignment and response tracking built in.</p>
      </div>
    ),
    faqs: [
      { q: 'What is a universal inbox for business?', a: 'A universal inbox is a single interface that consolidates incoming customer messages from multiple channels (WhatsApp, email, Instagram, etc.) so that a team can manage all conversations in one place with assignment and tracking features.' },
      { q: 'Does CHATR support WhatsApp in its universal inbox?', a: 'Yes. CHATR Universal Inbox integrates with WhatsApp Business to bring WhatsApp conversations into a shared team inbox alongside email and other connected channels.' },
    ],
  },
  {
    slug: 'whatsapp-candidate-screening-recruitment',
    title: 'WhatsApp Candidate Screening: How Recruitment Agencies Handle High Applicant Volume',
    metaDescription: 'For recruitment agencies managing high applicant volumes, WhatsApp has become a primary candidate channel. Here is how structured WhatsApp screening workflows work in practice.',
    canonicalDomain: 'https://chatrchat.in',
    category: 'Recruitment and Hiring',
    author: 'TalentXcel Team',
    publishedAt: '2026-08-11',
    readingMinutes: 7,
    body: (
      <div className="prose prose-invert max-w-none space-y-5 text-slate-300 leading-relaxed">
        <p>For many recruitment agencies in India, WhatsApp has effectively become the primary candidate communication channel. Job postings on Naukri or LinkedIn generate responses, but the fastest candidate-recruiter conversations happen on WhatsApp.</p>
        <p>The problem this creates is straightforward: WhatsApp was designed for person-to-person messaging, not for managing 200 candidates through a hiring pipeline simultaneously.</p>
        <h2 className="text-white text-xl font-bold mt-8">The Volume Problem in WhatsApp Recruitment</h2>
        <p>When a recruitment agency posts a role for a client, they may receive 50 to 300 responses within 24 to 48 hours across WhatsApp, email, and job boards. On WhatsApp specifically, each candidate response opens a separate chat thread on the recruiter's personal phone.</p>
        <p>Managing 200 individual chat threads -- responding, qualifying, scheduling, following up -- from a single personal WhatsApp account is operationally untenable for most agency teams. Messages get missed. Follow-ups slip. Candidates who were genuinely qualified get lost in the noise.</p>
        <h2 className="text-white text-xl font-bold mt-8">Structured Screening Workflows</h2>
        <p>Agencies that handle high volumes effectively use structured screening sequences rather than ad-hoc conversations. A typical WhatsApp screening workflow includes an initial automated acknowledgement, a set of qualification questions, a response window for candidate replies, and a manual review step before shortlisting.</p>
        <p>CHATR's WhatsApp candidate screening tool enables exactly this kind of structured workflow -- bringing candidate responses into a shared recruiter inbox with qualification tracking, rather than leaving every conversation on a recruiter's personal phone.</p>
      </div>
    ),
    faqs: [
      { q: 'Can recruitment agencies use WhatsApp for candidate screening?', a: 'Yes. With WhatsApp Business API integration, recruitment agencies can send structured screening messages to candidates, collect responses in a shared team inbox, and track qualification status -- rather than managing individual chats on personal phones.' },
      { q: 'How does CHATR help recruitment agencies with WhatsApp screening?', a: 'CHATR provides a shared candidate inbox that routes WhatsApp responses into a structured screening interface. Recruiters can see all candidate conversations, assign them to team members, and track screening status in one place.' },
      { q: 'What is the difference between WhatsApp Business and a recruitment screening tool?', a: 'WhatsApp Business provides basic business messaging features but is not designed for team-based candidate management or multi-stage screening workflows. A dedicated screening tool like CHATR adds team inbox, assignment, qualification tracking, and pipeline management on top of WhatsApp communication.' },
    ],
  },
  {
    slug: 'running-business-on-whatsapp-email-excel',
    title: 'Running a Business on WhatsApp, Email and Excel: The Operational Cost Nobody Talks About',
    metaDescription: 'Most Indian SMEs run on a combination of WhatsApp, email, and Excel. This is not disorganization -- it is a real system with real limitations. Here is where the operational cost appears.',
    canonicalDomain: 'https://chatrchat.in',
    category: 'Business Growth',
    author: 'CHATR Team',
    publishedAt: '2026-08-11',
    readingMinutes: 6,
    body: (
      <div className="prose prose-invert max-w-none space-y-5 text-slate-300 leading-relaxed">
        <p>A typical growing Indian SME runs its customer operations on three core tools: WhatsApp for customer communication, email for formal correspondence and vendor management, and Excel or Google Sheets for tracking orders, leads, and follow-ups.</p>
        <p>This is not disorganization. It is a genuine operating system -- one that has been assembled pragmatically from tools that are free, familiar, and immediately available. It works, up to a point.</p>
        <h2 className="text-white text-xl font-bold mt-8">Where the System Breaks</h2>
        <p>The system breaks at scale, at speed, and at handoffs. When the business owner is the only person who has WhatsApp on their phone, no customer conversation can proceed without them. When leads are tracked in a spreadsheet that only one person updates, the team operates with incomplete information. When follow-ups depend on remembering to check a cell in an Excel file, follow-ups get missed.</p>
        <p>The operational cost of this system is not visible in any single missed lead or forgotten follow-up. It is visible in the aggregate: customers who moved to a competitor, deals that stalled because nobody followed up, growth that slowed because the owner became the bottleneck.</p>
        <h2 className="text-white text-xl font-bold mt-8">What the Alternative Looks Like</h2>
        <p>The alternative is not a complex ERP or a 12-module CRM. For most SMEs, the step change comes from consolidating the communication layer -- all customer messages in one place, with team visibility and basic follow-up tracking. That is the operational gap that CHATR closes.</p>
      </div>
    ),
    faqs: [
      { q: 'Is it bad to run a business on WhatsApp and Excel?', a: 'No -- it is a practical approach for early-stage businesses. The limitation becomes apparent as volume grows: individual WhatsApp chats are invisible to the team, and manual Excel tracking cannot scale with the pace of incoming leads and customer conversations.' },
      { q: 'What is the first operational upgrade from WhatsApp and Excel?', a: 'The highest-impact upgrade is usually a shared communication inbox -- one that brings WhatsApp, email, and other channels into a single team interface where messages are visible, assignable, and trackable. This removes the owner as the communication bottleneck.' },
    ],
  },
  {
    slug: 'what-is-a-communication-os',
    title: 'What Is a Communication OS? How It Differs From a CRM, Helpdesk, and WhatsApp Business',
    metaDescription: 'A Communication OS manages how your entire business communicates -- not just your support tickets or sales records. Here is how it is different from a CRM, helpdesk, and WhatsApp Business.',
    canonicalDomain: 'https://chatrchat.in',
    category: 'Product and Technology',
    author: 'CHATR Team',
    publishedAt: '2026-08-11',
    readingMinutes: 8,
    body: (
      <div className="prose prose-invert max-w-none space-y-5 text-slate-300 leading-relaxed">
        <p>A Communication OS is a category of business software that is still being defined in practice. The clearest way to understand it is by contrast: what it is not.</p>
        <h2 className="text-white text-xl font-bold mt-8">Not a CRM</h2>
        <p>A CRM (Customer Relationship Management system) is primarily a database. It stores contact records, deal stages, and interaction history. Most CRMs require manual data entry to stay accurate. A CRM answers the question: "What do we know about this customer?" A Communication OS answers a different question: "How are we talking to this customer right now, and who on our team is responsible?"</p>
        <h2 className="text-white text-xl font-bold mt-8">Not a Helpdesk</h2>
        <p>A helpdesk is optimized for support tickets and issue resolution workflows. It assumes that the customer has a problem and the business is resolving it. A Communication OS handles the full relationship -- sales conversations, onboarding, support, and follow-ups -- not just support tickets.</p>
        <h2 className="text-white text-xl font-bold mt-8">Not WhatsApp Business</h2>
        <p>WhatsApp Business is a messaging tool. It is a single-person interface for a single business number. It has no shared team inbox, no conversation assignment, no cross-channel aggregation, and no integration with other business workflows. A Communication OS uses WhatsApp as one channel among many -- routing WhatsApp conversations into a shared team interface where they can be managed at scale.</p>
        <h2 className="text-white text-xl font-bold mt-8">What a Communication OS Actually Is</h2>
        <p>A Communication OS is the layer that sits between your business and every channel through which customers, candidates, or partners contact you. It brings all incoming conversations into one place, makes them visible to the right team members, enables structured responses and follow-ups, and creates a record of every communication without requiring manual entry.</p>
        <p>CHATR is built as a Communication OS -- not a CRM module, not a helpdesk replacement, but the central communication layer for business teams.</p>
      </div>
    ),
    faqs: [
      { q: 'What is a Communication OS?', a: 'A Communication OS is a business platform that consolidates and manages all incoming and outgoing communications across channels (WhatsApp, email, etc.) in one place, with team visibility, assignment, and workflow capabilities.' },
      { q: 'How is CHATR different from a CRM?', a: 'CHATR is primarily a communication system, not a database. It manages live conversations and team response workflows rather than storing customer records. It can complement a CRM by providing the communication layer that feeds customer interaction data.' },
      { q: 'Can CHATR replace WhatsApp Business?', a: 'CHATR integrates with WhatsApp Business to add team inbox, shared management, and workflow capabilities on top of WhatsApp messaging. It is not a replacement for WhatsApp itself, but it transforms WhatsApp from a personal messaging app into a managed team communication channel.' },
    ],
  },
];

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = ARTICLES.find(a => a.slug === slug);

  useEffect(() => {
    if (!article) return;
    const pageTitle = `${article.title} — CHATR Communication OS`;
    document.title = pageTitle;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
    metaDesc.setAttribute('content', article.metaDescription);
    
    let metaTitle = document.querySelector('meta[name="title"]');
    if (metaTitle) metaTitle.setAttribute('content', pageTitle);
    
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);
    
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', article.metaDescription);
    
    const postUrl = `${article.canonicalDomain}/blog/${article.slug}`;
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', postUrl);
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', postUrl);

    const articleSchema = { '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description: article.metaDescription, author: { '@type': 'Organization', name: article.author }, datePublished: article.publishedAt, publisher: { '@type': 'Organization', name: 'CHATR Communication OS', url: 'https://chatr.chat' } };
    const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: article.faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })) };
    const s1 = document.createElement('script'); s1.id = 'blog-post-article-schema'; s1.type = 'application/ld+json'; s1.textContent = JSON.stringify(articleSchema);
    const s2 = document.createElement('script'); s2.id = 'blog-post-faq-schema'; s2.type = 'application/ld+json'; s2.textContent = JSON.stringify(faqSchema);
    if (!document.getElementById('blog-post-article-schema')) document.head.appendChild(s1);
    if (!document.getElementById('blog-post-faq-schema')) document.head.appendChild(s2);
    return () => { ['blog-post-article-schema', 'blog-post-faq-schema'].forEach(id => { const el = document.getElementById(id); if (el) el.remove(); }); };
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-400">Article not found.</p>
          <Link to="/blog" className="text-indigo-400 hover:underline">Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/blog" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"><ArrowLeft className="w-4 h-4" />Blog</Link>
          <Link to="/auth" id="blog-post-cta-header" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold">Try CHATR Free</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        {/* Header & Meta */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-indigo-400" />{article.category}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-indigo-400" />Published {article.publishedAt}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-indigo-400" />{article.readingMinutes} min read</span>
            <Link to="/authors/chatr-product-team" className="text-indigo-400 hover:underline font-semibold">{article.author}</Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-white">{article.title}</h1>
          
          {/* AI / GEO Direct Answer Block */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Executive Summary & Key Takeaway</span>
            <p className="text-slate-200 text-sm leading-relaxed">{article.metaDescription}</p>
          </div>
        </div>

        {/* Article Body */}
        <div className="border-t border-slate-800 pt-8">{article.body}</div>

        {/* First-Party Source & Evidence Attribution Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <span>Methodology & Data Evidence Trail</span>
          </div>
          <p>
            <strong className="text-slate-300">Source:</strong> CHATR Platform Telemetry & Candidate Response Dynamics (July–August 2026).
          </p>
          <p>
            <strong className="text-slate-300">Editorial Standard:</strong> Reviewed under our <Link to="/editorial-policy" className="text-indigo-400 underline">Editorial Policy</Link>. Fact-checked against visible operational workflows.
          </p>
        </div>

        {/* Author Attribution Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-lg shrink-0">
            C
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">{article.author}</h3>
              <Link to="/authors" className="text-xs text-indigo-400 hover:underline">All Authors →</Link>
            </div>
            <p className="text-xs text-indigo-400 font-semibold">CHATR Engineering & Research Group</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Specialized research unit developing unified business communication infrastructure and AI candidate screening systems.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-lg text-white">Frequently Asked Questions</h2>
          {article.faqs.map((faq, i) => (
            <div key={i} className="border-t border-slate-800 pt-4 space-y-2">
              <p className="font-semibold text-white text-sm">{faq.q}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* CTA Footer */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-indigo-800/20 to-indigo-900/40 border border-indigo-500/30 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-white">Try CHATR Communication OS Today</h2>
          <p className="text-slate-400 text-sm">Universal Team Inbox • WhatsApp Integration • Candidate Screening • AI Agents</p>
          <Link to="/auth" id="blog-post-cta-footer" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default BlogPostPage;

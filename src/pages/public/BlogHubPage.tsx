import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Tag } from 'lucide-react';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  readingMinutes: number;
  category: 'messaging' | 'recruitment' | 'growth' | 'product';
  domain: 'chatr.chat' | 'chatrchat.in' | 'talentxcel.in';
  publishedAt: string;
  author: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'why-businesses-lose-whatsapp-leads',
    title: 'Why Indian Businesses Lose WhatsApp Leads (And How to Stop It)',
    excerpt: 'When a customer messages your WhatsApp and gets no reply within 5 minutes, the conversation is likely over. Here is the operational reality behind lead loss and what a unified inbox changes.',
    readingMinutes: 6,
    category: 'messaging',
    domain: 'chatrchat.in',
    publishedAt: '2026-08-11',
    author: 'CHATR Team',
  },
  {
    slug: 'universal-inbox-vs-switching-apps',
    title: 'Universal Inbox vs Switching Between Apps: The Hidden Cost for Small Business Teams',
    excerpt: 'The average business owner switches between 8 communication apps daily. Each context switch costs focus time. A unified inbox is a multiplier on your team output.',
    readingMinutes: 5,
    category: 'messaging',
    domain: 'chatrchat.in',
    publishedAt: '2026-08-11',
    author: 'CHATR Team',
  },
  {
    slug: 'whatsapp-candidate-screening-recruitment',
    title: 'WhatsApp Candidate Screening: How Recruitment Agencies Handle High Applicant Volume',
    excerpt: 'Recruitment agencies using WhatsApp as a primary candidate channel face a real operational bottleneck: volume. Structured screening workflows separate agencies that scale from those that stall.',
    readingMinutes: 7,
    category: 'recruitment',
    domain: 'chatrchat.in',
    publishedAt: '2026-08-11',
    author: 'TalentXcel Team',
  },
  {
    slug: 'running-business-on-whatsapp-email-excel',
    title: 'Running a Business on WhatsApp, Email and Excel: The Operational Cost Nobody Talks About',
    excerpt: 'Most Indian SMEs are not disorganized. They are running organized systems on tools never designed for team business operations. Here is the exact point where scattered tools start costing customers.',
    readingMinutes: 6,
    category: 'growth',
    domain: 'chatrchat.in',
    publishedAt: '2026-08-11',
    author: 'CHATR Team',
  },
  {
    slug: 'what-is-a-communication-os',
    title: 'What Is a Communication OS? How It Differs From a CRM, Helpdesk, and WhatsApp Business',
    excerpt: 'A Communication OS is not a better CRM. It is not a smarter helpdesk. It is the system that manages how your business communicates across every channel, team, and customer in one place.',
    readingMinutes: 8,
    category: 'product',
    domain: 'chatrchat.in',
    publishedAt: '2026-08-11',
    author: 'CHATR Team',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Articles',
  messaging: 'Messaging and Inbox',
  recruitment: 'Recruitment and Hiring',
  growth: 'Business Growth',
  product: 'Product and Technology',
};

const CATEGORY_COLORS: Record<string, string> = {
  messaging: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  recruitment: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  growth: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  product: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

export const BlogHubPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = React.useState<string>('all');

  useEffect(() => {
    document.title = 'Blog — CHATR Communication OS | Business Messaging & Growth';
    
    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Practical insights on business messaging, WhatsApp lead management, candidate screening, and AI communication tools for Indian SMEs and recruitment agencies.');
    
    // Meta Title
    let metaTitle = document.querySelector('meta[name="title"]');
    if (metaTitle) {
      metaTitle.setAttribute('content', 'Blog — CHATR Communication OS | Business Messaging & Growth');
    }
    
    // OG Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Blog — CHATR Communication OS | Business Messaging & Growth');
    }
    
    // OG Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', 'Practical insights on business messaging, WhatsApp lead management, candidate screening, and AI communication tools for Indian SMEs.');
    }
    
    // OG URL
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://chatrchat.in/blog');
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://chatrchat.in/blog');

    const schema = document.createElement('script');
    schema.id = 'blog-hub-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Blog', name: 'CHATR Communication OS Blog', url: 'https://chatrchat.in/blog', publisher: { '@type': 'Organization', name: 'CHATR Communication OS', url: 'https://chatr.chat', sameAs: ['https://chatrchat.in', 'https://talentxcel.in'] } });
    if (!document.getElementById('blog-hub-schema')) document.head.appendChild(schema);
    return () => { const s = document.getElementById('blog-hub-schema'); if (s) s.remove(); };
  }, []);

  const filtered = activeCategory === 'all' ? BLOG_POSTS : BLOG_POSTS.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <span className="text-indigo-400">CHATR</span>
            <span className="text-slate-400 font-normal text-sm">/ Blog</span>
          </Link>
          <Link to="/auth" id="blog-header-cta" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold">Try CHATR Free</Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono px-4 py-2 rounded-full">
            <BookOpen className="w-3.5 h-3.5" /><span>PRACTICAL INSIGHTS</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">Business Messaging,<br /><span className="text-indigo-400">Recruitment and Growth</span></h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">Operational experience on managing leads, candidates, and customer conversations -- written for Indian business owners, recruiters, and founders.</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button key={key} id={"blog-filter-" + key} onClick={() => setActiveCategory(key)} className={"px-4 py-1.5 rounded-full text-xs font-semibold border transition-all " + (activeCategory === key ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500')}>{label}</button>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((post) => (
            <Link key={post.slug} to={"/blog/" + post.slug} id={"blog-card-" + post.slug} className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 space-y-4 transition-all hover:shadow-lg hover:shadow-indigo-900/20">
              <div className="flex items-center justify-between">
                <span className={"px-2.5 py-0.5 text-[11px] font-semibold rounded border " + CATEGORY_COLORS[post.category]}><Tag className="inline w-2.5 h-2.5 mr-1" />{CATEGORY_LABELS[post.category]}</span>
                <span className="flex items-center gap-1 text-[11px] text-slate-500"><Clock className="w-3 h-3" />{post.readingMinutes} min</span>
              </div>
              <h2 className="font-bold text-lg leading-snug group-hover:text-indigo-300 transition-colors">{post.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
                <span>{post.author}</span>
                <span className="flex items-center gap-1 text-indigo-400 group-hover:translate-x-1 transition-transform">Read <ArrowRight className="w-3.5 h-3.5" /></span>
              </div>
            </Link>
          ))}
        </div>
        <div className="bg-gradient-to-r from-indigo-900/40 via-indigo-800/20 to-indigo-900/40 border border-indigo-500/30 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to run your business on one system?</h2>
          <p className="text-slate-400">Universal Inbox · WhatsApp Integration · Candidate Screening · AI Agents</p>
          <Link to="/auth" id="blog-footer-cta" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors">Get Started Free <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </main>
    </div>
  );
};

export default BlogHubPage;

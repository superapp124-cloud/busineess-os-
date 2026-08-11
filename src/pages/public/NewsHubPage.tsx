import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper, Clock, Calendar } from 'lucide-react';

interface NewsItem {
  slug: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  readingMinutes: number;
}

const NEWS_ITEMS: NewsItem[] = [
  {
    slug: 'chatr-communication-os-launch',
    title: 'CHATR Launches Communication OS: A Unified Inbox for WhatsApp, Email and Business Messaging',
    summary: 'CHATR has launched CHATR Communication OS, a unified business communication platform that consolidates WhatsApp, email, and team messaging into a single shared inbox with AI-assisted workflows.',
    category: 'Product Launch',
    publishedAt: '2026-08-11',
    readingMinutes: 3,
  },
  {
    slug: 'talentxcel-whatsapp-screening-live',
    title: 'TalentXcel WhatsApp Candidate Screening Now Live for Recruitment Agencies',
    summary: 'TalentXcel, part of the CHATR platform, has enabled WhatsApp candidate screening for recruitment agencies -- allowing structured multi-stage screening workflows to run through WhatsApp Business API with full team visibility.',
    category: 'Feature Release',
    publishedAt: '2026-08-11',
    readingMinutes: 2,
  },
];

export const NewsHubPage: React.FC = () => {
  useEffect(() => {
    document.title = 'News -- CHATR | Product Updates and Announcements';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
    metaDesc.setAttribute('content', 'Official news and product updates from CHATR, TalentXcel, and the CHATR Communication OS platform.');
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', 'https://chatrchat.in/news');
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-indigo-400">CHATR</span>
            <span className="text-slate-400 font-normal text-sm">/ News</span>
          </Link>
          <Link to="/auth" id="news-header-cta" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold">Try CHATR Free</Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono px-4 py-2 rounded-full">
            <Newspaper className="w-3.5 h-3.5" /><span>OFFICIAL ANNOUNCEMENTS</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">News and Updates</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">Product milestones, feature releases, and announcements from CHATR and TalentXcel.</p>
        </div>
        <div className="space-y-4">
          {NEWS_ITEMS.map((item) => (
            <Link key={item.slug} to={"/news/" + item.slug} id={"news-card-" + item.slug} className="group block bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 transition-all">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded text-[11px] font-semibold">{item.category}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.publishedAt}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.readingMinutes} min read</span>
              </div>
              <h2 className="font-bold text-lg leading-snug group-hover:text-indigo-300 transition-colors mb-2">{item.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{item.summary}</p>
              <div className="mt-4 flex items-center gap-1 text-indigo-400 text-xs group-hover:translate-x-1 transition-transform">Read announcement <ArrowRight className="w-3.5 h-3.5" /></div>
            </Link>
          ))}
        </div>
        <div className="text-center pt-4">
          <Link to="/blog" id="news-to-blog-link" className="text-indigo-400 hover:underline text-sm">Read our blog for in-depth guides and insights</Link>
        </div>
      </main>
    </div>
  );
};

export default NewsHubPage;

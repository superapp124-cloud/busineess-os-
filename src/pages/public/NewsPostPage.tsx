import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react';

interface NewsArticle {
  slug: string;
  title: string;
  metaDescription: string;
  canonicalDomain: string;
  category: string;
  publishedAt: string;
  readingMinutes: number;
  body: React.ReactNode;
}

const NEWS_ARTICLES: NewsArticle[] = [
  {
    slug: 'chatr-communication-os-launch',
    title: 'CHATR Launches Communication OS: A Unified Inbox for WhatsApp, Email and Business Messaging',
    metaDescription: 'CHATR has launched CHATR Communication OS, a unified business communication platform consolidating WhatsApp, email, and team messaging into one shared inbox with AI-assisted workflows.',
    canonicalDomain: 'https://chatrchat.in',
    category: 'Product Launch',
    publishedAt: '2026-08-11',
    readingMinutes: 3,
    body: (
      <div className="prose prose-invert max-w-none space-y-5 text-slate-300 leading-relaxed">
        <p>CHATR has launched CHATR Communication OS, a unified business communication platform that consolidates WhatsApp, email, and team messaging into a single shared inbox with AI-assisted workflows.</p>
        <p>The platform is designed for Indian SMEs, recruitment agencies, and business teams that currently manage customer and candidate communications across multiple separate applications.</p>
        <h2 className="text-white text-xl font-bold mt-8">Core Capabilities at Launch</h2>
        <ul className="list-disc list-inside space-y-2 text-slate-300">
          <li>Unified team inbox for WhatsApp Business, email, and connected channels</li>
          <li>Conversation assignment and ownership tracking across team members</li>
          <li>WhatsApp candidate screening workflows for recruitment agencies</li>
          <li>AI-assisted message composition and response suggestions</li>
          <li>Cross-device access via web and mobile applications</li>
        </ul>
        <h2 className="text-white text-xl font-bold mt-8">Availability</h2>
        <p>CHATR Communication OS is available now via chatrchat.in and chatr.chat. Teams can sign up directly to begin onboarding.</p>
      </div>
    ),
  },
  {
    slug: 'talentxcel-whatsapp-screening-live',
    title: 'TalentXcel WhatsApp Candidate Screening Now Live for Recruitment Agencies',
    metaDescription: 'TalentXcel has enabled WhatsApp candidate screening for recruitment agencies, allowing structured multi-stage screening workflows to run through WhatsApp Business API with full team visibility.',
    canonicalDomain: 'https://chatrchat.in',
    category: 'Feature Release',
    publishedAt: '2026-08-11',
    readingMinutes: 2,
    body: (
      <div className="prose prose-invert max-w-none space-y-5 text-slate-300 leading-relaxed">
        <p>TalentXcel, the recruitment productivity module of the CHATR platform, has enabled WhatsApp candidate screening for recruitment agencies.</p>
        <p>The feature allows recruitment teams to run structured screening conversations over WhatsApp Business API, with all candidate responses routed into a shared recruiter inbox with qualification status tracking.</p>
        <h2 className="text-white text-xl font-bold mt-8">What This Enables</h2>
        <ul className="list-disc list-inside space-y-2 text-slate-300">
          <li>Send structured screening question sequences to candidates via WhatsApp</li>
          <li>Receive and track all candidate responses in a shared team inbox</li>
          <li>Assign candidates to specific recruiters for follow-up</li>
          <li>Track screening status across multi-stage hiring pipelines</li>
        </ul>
        <h2 className="text-white text-xl font-bold mt-8">Availability</h2>
        <p>WhatsApp candidate screening is available now on TalentXcel at talentxcel.in. Recruitment agencies can sign up to begin using the platform.</p>
      </div>
    ),
  },
];

export const NewsPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = NEWS_ARTICLES.find(a => a.slug === slug);

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
    
    const postUrl = `${article.canonicalDomain}/news/${article.slug}`;
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', postUrl);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', postUrl);

    const schema = document.createElement('script');
    schema.id = 'news-post-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'NewsArticle', headline: article.title, description: article.metaDescription, datePublished: article.publishedAt, publisher: { '@type': 'Organization', name: 'CHATR Communication OS', url: 'https://chatr.chat', sameAs: ['https://chatrchat.in', 'https://talentxcel.in'] } });
    if (!document.getElementById('news-post-schema')) document.head.appendChild(schema);
    return () => { const s = document.getElementById('news-post-schema'); if (s) s.remove(); };
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-400">Article not found.</p>
          <Link to="/news" className="text-indigo-400 hover:underline">Back to News</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/news" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"><ArrowLeft className="w-4 h-4" />News</Link>
          <Link to="/auth" id="news-post-cta-header" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold">Try CHATR Free</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded font-semibold">{article.category}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{article.publishedAt}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readingMinutes} min read</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{article.title}</h1>
          <p className="text-slate-400 text-lg">{article.metaDescription}</p>
        </div>
        <div className="border-t border-slate-800 pt-8">{article.body}</div>
        <div className="bg-gradient-to-r from-indigo-900/40 via-indigo-800/20 to-indigo-900/40 border border-indigo-500/30 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold">Get started with CHATR Communication OS</h2>
          <Link to="/auth" id="news-post-cta-footer" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors">Try CHATR Free <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </main>
    </div>
  );
};

export default NewsPostPage;

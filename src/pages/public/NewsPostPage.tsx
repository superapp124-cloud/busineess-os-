import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';

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
    metaDescription: 'CHATR has launched CHATR Communication OS, a unified business communication platform consolidating WhatsApp, email, and team messaging into one shared inbox with SI-assisted workflows.',
    canonicalDomain: 'https://chatrchat.in',
    category: 'Product Launch',
    publishedAt: '2026-08-11',
    readingMinutes: 3,
    body: (
      <div className="prose prose-invert max-w-none space-y-5 text-slate-300 leading-relaxed">
        <p>CHATR has launched CHATR Communication OS, a unified business communication platform that consolidates WhatsApp, email, and team messaging into a single shared inbox with SI-assisted workflows.</p>
        <p>The platform is designed for Indian SMEs, recruitment agencies, and business teams that currently manage customer and candidate communications across multiple separate applications.</p>
        <h2 className="text-white text-xl font-bold mt-8">Core Capabilities at Launch</h2>
        <ul className="list-disc list-inside space-y-2 text-slate-300">
          <li>Unified team inbox for WhatsApp Business, email, and connected channels</li>
          <li>Conversation assignment and ownership tracking across team members</li>
          <li>WhatsApp candidate screening workflows for recruitment agencies</li>
          <li>SI-assisted message composition and response suggestions</li>
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
  const navigate = useNavigate();
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
      <div className="min-h-screen bg-[#F8F8F5] text-[#111817] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[#53605C]">Article not found.</p>
          <Link to="/news" className="text-[#164E3F] hover:underline font-semibold">Back to News</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => navigate('/auth')}
        isAuthenticated={false}
        onNavigateWorkspace={() => navigate('/desktop/home')}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 flex-1">
        <div>
          <Link to="/news" className="inline-flex items-center gap-2 text-xs font-semibold text-[#53605C] hover:text-[#164E3F] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to News &amp; Announcements
          </Link>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#83918C]">
            <span className="bg-[#EAEFEA] text-[#164E3F] border border-[#D5E0D5] px-2.5 py-0.5 rounded-full font-semibold">
              {article.category}
            </span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{article.publishedAt}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readingMinutes} min read</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-[#111817]">{article.title}</h1>
          <p className="text-[#53605C] text-base sm:text-lg leading-relaxed">{article.metaDescription}</p>
        </div>

        <div className="border-t border-[#DDE3DF] pt-8 text-[#111817]">
          {article.body}
        </div>

        <div className="bg-[#EAEFEA] border border-[#D5E0D5] rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111817]">Get started with CHATR Communication OS</h2>
          <p className="text-[#53605C] text-sm">Unified Team Inbox · Free Browser Calling · Automated Routing</p>
          <div className="pt-2">
            <Link to="/auth" id="news-post-cta-footer" className="inline-flex items-center gap-2 bg-[#164E3F] hover:bg-[#123F33] text-white font-semibold px-8 py-3.5 rounded-full transition-all text-sm shadow-md">
              Try CHATR Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsPostPage;

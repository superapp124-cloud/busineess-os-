import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Newspaper, Clock, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { Footer } from '@/components/Footer';

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
    summary: 'CHATR has launched CHATR Communication OS, a unified business communication platform that consolidates WhatsApp, email, and team messaging into a single shared inbox with smart workflows.',
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
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted && session?.user) setIsAuthenticated(true);
    }).catch(() => {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        setIsAuthenticated(true);
        setAuthModalOpen(false);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleNavigateWorkspace = useCallback(() => {
    navigate('/desktop/home');
  }, [navigate]);

  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    navigate('/desktop/home', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="News — CHATR Communication OS | Announcements & Updates"
        description="Official news, product releases, and announcements from the CHATR Communication OS platform."
        canonicalUrl="https://chatrchat.in/news"
      />

      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 flex-1">
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
            <span className="w-6 h-[1.5px] bg-[#164E3F]" />
            <span>OFFICIAL ANNOUNCEMENTS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111817] leading-[1.1]">
            News &amp; <span className="text-[#164E3F]">Product Updates</span>
          </h1>
          <p className="text-base sm:text-lg text-[#53605C] max-w-xl mx-auto leading-relaxed">
            Product milestones, major architectural releases, and verified announcements from CHATR.
          </p>
        </div>

        <div className="space-y-4">
          {NEWS_ITEMS.map((item) => (
            <Link
              key={item.slug}
              to={"/news/" + item.slug}
              id={"news-card-" + item.slug}
              className="group block bg-white border border-[#DDE3DF] hover:border-[#164E3F]/40 rounded-2xl p-6 sm:p-8 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#83918C] mb-3">
                <span className="bg-[#EAEFEA] text-[#164E3F] border border-[#D5E0D5] px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                  {item.category}
                </span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.publishedAt}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.readingMinutes} min read</span>
              </div>
              <h2 className="font-bold text-lg sm:text-xl text-[#111817] leading-snug group-hover:text-[#164E3F] transition-colors mb-2">
                {item.title}
              </h2>
              <p className="text-[#53605C] text-sm leading-relaxed">{item.summary}</p>
              <div className="mt-4 flex items-center gap-1 text-[#164E3F] font-bold text-xs group-hover:translate-x-1 transition-transform">
                Read announcement <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center pt-4">
          <Link to="/blog" id="news-to-blog-link" className="text-[#164E3F] hover:text-[#123F33] font-semibold text-sm hover:underline">
            Read our blog for in-depth operational guides and insights →
          </Link>
        </div>
      </main>

      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default NewsHubPage;

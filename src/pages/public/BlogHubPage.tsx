import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { Footer } from '@/components/Footer';

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
  {
    slug: 'ai-lead-triage-guide',
    title: 'Lead Triage & Smart Routing: Automating Response Workflows for High-Volume Inboxes',
    excerpt: 'Discover how automated intent classification and message routing reduce lead response times from hours to seconds across WhatsApp and email.',
    readingMinutes: 6,
    category: 'product',
    domain: 'chatrchat.in',
    publishedAt: '2026-08-11',
    author: 'CHATR Team',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Articles',
  messaging: 'Messaging & Inbox',
  recruitment: 'Recruitment & Hiring',
  growth: 'Business Growth',
  product: 'Product & Architecture',
};

const CATEGORY_COLORS: Record<string, string> = {
  messaging: 'bg-[#EAEFEA] text-[#164E3F] border-[#D5E0D5]',
  recruitment: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  growth: 'bg-amber-50 text-amber-800 border-amber-200',
  product: 'bg-blue-50 text-blue-800 border-blue-200',
};

export const BlogHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

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

  const filtered = activeCategory === 'all' ? BLOG_POSTS : BLOG_POSTS.filter(p => p.category === activeCategory);

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'CHATR Communication OS Blog',
    url: 'https://chatrchat.in/blog',
    publisher: {
      '@type': 'Organization',
      name: 'CHATR Communication OS',
      url: 'https://chatr.chat',
      sameAs: ['https://chatrchat.in', 'https://talentxcel.in']
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="Blog — CHATR Communication OS | Business Messaging & Growth"
        description="Practical insights on business messaging, WhatsApp lead management, candidate screening, and communication tools for modern teams."
        canonicalUrl="https://chatrchat.in/blog"
        schemaData={schemaData}
      />

      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 flex-1">
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
            <span className="w-6 h-[1.5px] bg-[#164E3F]" />
            <span>PRACTICAL OPERATIONAL INSIGHTS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111817] leading-[1.1]">
            Business Messaging, <br /><span className="text-[#164E3F]">Customer Calls &amp; Growth</span>
          </h1>
          <p className="text-base sm:text-lg text-[#53605C] max-w-xl mx-auto leading-relaxed">
            Operational frameworks on managing leads, customer conversations, and team speed — written for business owners, recruiters, and founders.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              id={"blog-filter-" + key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === key
                  ? 'bg-[#164E3F] text-white shadow-sm'
                  : 'bg-white text-[#53605C] border border-[#DDE3DF] hover:bg-[#FAFBF9]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Blog Post Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              to={"/blog/" + post.slug}
              id={"blog-card-" + post.slug}
              className="group bg-white border border-[#DDE3DF] hover:border-[#164E3F]/40 rounded-2xl p-6 sm:p-8 space-y-4 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={"px-2.5 py-1 text-[11px] font-semibold rounded-full border " + CATEGORY_COLORS[post.category]}>
                    <Tag className="inline w-2.5 h-2.5 mr-1" />{CATEGORY_LABELS[post.category]}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-[#83918C]">
                    <Clock className="w-3 h-3" />{post.readingMinutes} min read
                  </span>
                </div>
                <h2 className="font-bold text-lg sm:text-xl text-[#111817] group-hover:text-[#164E3F] transition-colors leading-snug">
                  {post.title}
                </h2>
                <p className="text-[#53605C] text-sm leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-4 border-t border-[#DDE3DF]">
                <span className="text-[#83918C] font-semibold">{post.author}</span>
                <span className="flex items-center gap-1 text-[#164E3F] font-bold group-hover:translate-x-1 transition-transform">
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA Card */}
        <div className="bg-[#EAEFEA] border border-[#D5E0D5] rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111817]">Ready to run your business on one system?</h2>
          <p className="text-[#53605C] text-sm">Shared WhatsApp Inbox · Free Browser Calling · Automated Routing · Team CRM</p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                if (isAuthenticated) navigate('/desktop/home');
                else setAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-[#164E3F] hover:bg-[#123F33] text-white font-semibold px-8 py-3.5 rounded-full transition-all text-sm shadow-md cursor-pointer"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/pricing" className="bg-white hover:bg-[#FAFBF9] border border-[#DDE3DF] text-[#111817] font-semibold px-6 py-3.5 rounded-full text-sm shadow-sm transition-colors">
              See Plans &amp; Pricing →
            </Link>
          </div>
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

export default BlogHubPage;

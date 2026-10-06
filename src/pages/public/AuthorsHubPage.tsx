import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCheck, ArrowRight, ShieldCheck, Tag, Building2, ExternalLink } from 'lucide-react';
import { AUTHORS } from '@/data/authorsData';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

export const AuthorsHubPage: React.FC = () => {
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

    const schema = document.createElement('script');
    schema.id = 'authors-hub-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemPage',
      name: 'Authors & Technical Contributors — CHATR Communication OS',
      url: 'https://www.chatrchat.in/authors',
    });
    if (!document.getElementById('authors-hub-schema')) document.head.appendChild(schema);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      const s = document.getElementById('authors-hub-schema');
      if (s) s.remove();
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
        title="Authors & Technical Contributors — CHATR Communication OS"
        description="Meet the verifiable authors and engineering contributors behind CHATR Communication OS and TalentXcel research."
        canonicalUrl="https://www.chatrchat.in/authors"
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 md:py-16 space-y-12">
        {/* Eyebrow & Hero Section */}
        <section className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0EB] border border-[#164E3F]/20 text-[#164E3F] text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>VERIFIABLE E-E-A-T ENTITIES</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111817] tracking-tight">
            Authors & Technical Contributors
          </h1>
          <p className="text-[#53605C] text-sm md:text-base leading-relaxed">
            Every technical article, recruitment benchmark, and product launch note is authored and reviewed by identified specialists in business messaging, candidate screening, and SI operations.
          </p>
        </section>

        {/* Authors Directory Grid */}
        <section className="space-y-6">
          {Object.values(AUTHORS).map((author) => (
            <Link
              key={author.slug}
              to={`/authors/${author.slug}`}
              className="block bg-white border border-[#DDE3DF] hover:border-[#164E3F]/40 rounded-2xl p-6 md:p-8 space-y-5 transition-all hover:shadow-md group cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#E8F0EB] border border-[#164E3F]/20 flex items-center justify-center text-[#164E3F] font-bold text-xl shrink-0 group-hover:border-[#164E3F]/40 transition-colors overflow-hidden">
                    {author.avatarUrl ? (
                      <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover object-top" />
                    ) : (
                      <span>{author.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-[#111817] text-lg sm:text-xl group-hover:text-[#164E3F] transition-colors flex items-center gap-2">
                      <span>{author.name}</span>
                      <ArrowRight className="w-4 h-4 text-[#83918C] group-hover:text-[#164E3F] group-hover:translate-x-1 transition-all" />
                    </h2>
                    <p className="text-xs sm:text-sm text-[#164E3F] font-semibold mt-0.5">
                      {author.role} • {author.organization}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 text-xs bg-[#164E3F] text-white font-semibold px-4 py-2 rounded-full transition-all group-hover:bg-[#123F33] shrink-0 self-start md:self-auto shadow-sm">
                  View Profile & Articles <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <p className="text-[#53605C] text-sm leading-relaxed">
                {author.bio}
              </p>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-[#DDE3DF]">
                {author.expertise.map((exp, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-[#FAFBF9] text-[#53605C] border border-[#DDE3DF] px-3 py-1 rounded-full font-medium">
                    <Tag className="w-3 h-3 text-[#164E3F]" />
                    {exp}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </section>

        {/* Editorial Standards Transparency Card */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#164E3F]">
              <ShieldCheck className="w-4 h-4" />
              <span>Editorial Standards & Verification</span>
            </div>
            <h3 className="font-bold text-[#111817] text-base sm:text-lg">Editorial Transparency & Fact Checking</h3>
            <p className="text-xs sm:text-sm text-[#53605C] leading-relaxed">
              Read CHATR Communication OS research verification standards and author accreditation guidelines.
            </p>
            <p className="text-xs text-[#83918C] pt-1">
              Research from this team powers CHATR SI and the underlying benchmarks driving our product decisions.
            </p>
          </div>
          <Link
            to="/editorial-policy"
            className="text-xs font-semibold bg-white hover:bg-[#FAFBF9] text-[#164E3F] border border-[#164E3F]/30 px-5 py-2.5 rounded-full transition-colors shrink-0 shadow-sm"
          >
            Read Editorial Policy →
          </Link>
        </section>
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default AuthorsHubPage;

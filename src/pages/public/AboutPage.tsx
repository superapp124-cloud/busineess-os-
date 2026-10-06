import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, MessageSquare, Users, Cpu, ArrowRight, 
  Building2, Globe, Award, Check 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { Footer } from '@/components/Footer';
import { AUTHORS } from '@/data/authorsData';

export const AboutPage: React.FC = () => {
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

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About — CHATR Communication OS & TalentXcel',
    url: 'https://chatrchat.in/about',
    mainEntity: {
      '@type': 'Organization',
      name: 'CHATR Communication OS',
      url: 'https://chatrchat.in',
      logo: 'https://chatrchat.in/favicon.png',
      editor: {
        '@type': 'Person',
        name: AUTHORS['sanobar-jahan']?.name || 'Sanobar Jahan',
        jobTitle: AUTHORS['sanobar-jahan']?.role || 'Head of Operations',
      },
      subOrganization: {
        '@type': 'Organization',
        name: 'TalentXcel',
        url: 'https://talentxcel.in',
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="About — CHATR Communication OS & TalentXcel"
        description="Learn about CHATR Communication OS — the unified business communication platform powering messaging, WhatsApp candidate screening, and SI workflows."
        canonicalUrl="https://chatrchat.in/about"
        schemaData={schemaData}
      />

      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 flex-1">
        {/* Executive Summary Block */}
        <section className="space-y-5 text-center max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
            <span className="w-6 h-[1.5px] bg-[#164E3F]" />
            <span>ORGANIZATION &amp; PLATFORM ARCHITECTURE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#111817] tracking-tight leading-[1.1]">
            Connecting Business Messaging &amp;{' '}
            <span className="text-[#164E3F]">Customer Calls in One OS</span>
          </h1>
          <p className="text-base sm:text-lg text-[#53605C] leading-relaxed max-w-2xl mx-auto">
            CHATR Communication OS is the unified business communication platform engineered for modern teams, recruitment agencies, and growing businesses. We consolidate fragmented messaging channels — WhatsApp Business, browser calls, and team chat — into a single, intuitive operating system.
          </p>
        </section>

        {/* Platform Architecture & Brand Structure */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-10 space-y-8 shadow-sm">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111817]">Platform Ecosystem &amp; Organization Hierarchy</h2>
            <p className="text-[#53605C] text-xs sm:text-sm">Clear separation of brand intent, technology layers, and module integrations.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#EAEFEA] text-[#164E3F]">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#111817] text-lg">CHATR Communication OS</h3>
                  <span className="text-xs text-[#164E3F] font-mono">chatrchat.in • chatr.chat</span>
                </div>
              </div>
              <p className="text-[#53605C] text-sm leading-relaxed">
                The core messaging kernel and shared inbox engine. Handles multi-channel triage, team assignment, automated WhatsApp workflows, and WebRTC browser calling.
              </p>
            </div>

            <div className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#EAEFEA] text-[#164E3F]">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#111817] text-lg">TalentXcel Integration</h3>
                  <span className="text-xs text-[#164E3F] font-mono">talentxcel.in</span>
                </div>
              </div>
              <p className="text-[#53605C] text-sm leading-relaxed">
                The specialized recruitment module operating within CHATR OS. Connects resume parsing, candidate qualification scoring, and interview scheduling directly into WhatsApp.
              </p>
            </div>
          </div>
        </section>

        {/* Leadership & Verifiable Entities */}
        <section className="space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111817]">Leadership &amp; Authors</h2>
            <p className="text-[#53605C] text-xs sm:text-sm">Every capability, article, and research benchmark is backed by verifiable creators and engineers.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.values(AUTHORS).map((author) => (
              <div key={author.slug} className="bg-white border border-[#DDE3DF] rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-sm">
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-xl bg-[#EAEFEA] border border-[#D5E0D5] flex items-center justify-center text-[#164E3F] font-bold text-lg overflow-hidden">
                    {author.avatarUrl ? (
                      <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover object-top" />
                    ) : (
                      <span>{author.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111817] text-base">{author.name}</h3>
                    <p className="text-xs text-[#164E3F] font-semibold">{author.role}</p>
                    <p className="text-[11px] text-[#83918C]">{author.organization}</p>
                  </div>
                  <p className="text-xs text-[#53605C] leading-relaxed line-clamp-3">{author.bio}</p>
                </div>
                <Link to={`/authors/${author.slug}`} className="text-xs text-[#164E3F] hover:text-[#123F33] font-bold flex items-center gap-1 pt-3 border-t border-[#DDE3DF]">
                  View Profile &amp; Articles <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Core Principles */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="p-3 w-fit rounded-xl bg-[#EAEFEA] text-[#164E3F]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#111817] text-base">Verifiable Claims</h3>
            <p className="text-xs text-[#53605C] leading-relaxed">We strictly enforce zero-fabrication metrics. Every statistic, benchmark, and workflow description is backed by operational evidence.</p>
          </div>
          <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="p-3 w-fit rounded-xl bg-[#EAEFEA] text-[#164E3F]">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#111817] text-base">Privacy &amp; Governance</h3>
            <p className="text-xs text-[#53605C] leading-relaxed">Built with strict data boundary controls. Candidate resume data and business messaging telemetry are protected by role-based encryption.</p>
          </div>
          <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="p-3 w-fit rounded-xl bg-[#EAEFEA] text-[#164E3F]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#111817] text-base">Editorial Transparency</h3>
            <p className="text-xs text-[#53605C] leading-relaxed">Our research and articles follow explicit editorial policies regarding first-party data methodologies and transparent disclosure.</p>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-[#EAEFEA] border border-[#D5E0D5] rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111817]">Experience CHATR Communication OS</h2>
          <p className="text-[#53605C] text-sm max-w-xl mx-auto">
            Consolidate your business messaging and customer communications into a single intelligent system today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                if (isAuthenticated) navigate('/desktop/home');
                else setAuthModalOpen(true);
              }}
              className="bg-[#164E3F] hover:bg-[#123F33] text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-all shadow-md cursor-pointer"
            >
              Get Started Free
            </button>
            <Link to="/editorial-policy" className="bg-white hover:bg-[#FAFBF9] border border-[#DDE3DF] text-[#111817] font-semibold px-6 py-3.5 rounded-full text-sm transition-colors shadow-sm">
              Read Editorial Policy
            </Link>
          </div>
        </section>
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

export default AboutPage;

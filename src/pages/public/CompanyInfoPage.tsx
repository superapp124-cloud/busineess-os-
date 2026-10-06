import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Mail, Globe, ShieldCheck, FileText, Phone, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { Footer } from '@/components/Footer';

export const CompanyInfoPage: React.FC = () => {
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
    '@type': 'Organization',
    name: 'CHATR Communication OS',
    alternateName: 'ChatrChat',
    url: 'https://chatrchat.in',
    logo: 'https://chatrchat.in/favicon.png',
    sameAs: ['https://chatr.chat', 'https://talentxcel.in'],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Noida',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="Company Information & Entity Verification — CHATR Communication OS"
        description="Official company information, entity verification, platform architecture details, and contact information for CHATR Communication OS and TalentXcel."
        canonicalUrl="https://chatrchat.in/company-info"
        schemaData={schemaData}
      />

      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 flex-1">
        <section className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
            <span className="w-6 h-[1.5px] bg-[#164E3F]" />
            <span>ENTITY &amp; PLATFORM TRANSPARENCY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#111817] tracking-tight leading-tight">
            Company Information &amp; <span className="text-[#164E3F]">Entity Verification</span>
          </h1>
          <p className="text-[#53605C] text-sm sm:text-base leading-relaxed max-w-2xl">
            Official operational context and entity details for CHATR Communication OS and TalentXcel recruitment platform.
          </p>
        </section>

        {/* Entity Details Card */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-10 space-y-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#111817] border-b border-[#DDE3DF] pb-4">Corporate &amp; Platform Context</h2>

          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1.5 p-4 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl">
              <span className="text-xs text-[#83918C] uppercase font-bold tracking-wider font-mono">Primary Operating Platform</span>
              <p className="font-semibold text-[#111817]">CHATR Communication OS</p>
              <p className="text-[#53605C] text-xs">Universal Business Messaging, Calling &amp; Shared Inbox Kernel</p>
            </div>

            <div className="space-y-1.5 p-4 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl">
              <span className="text-xs text-[#83918C] uppercase font-bold tracking-wider font-mono">Recruitment Module Integration</span>
              <p className="font-semibold text-[#111817]">TalentXcel</p>
              <p className="text-[#53605C] text-xs">WhatsApp Candidate Screening &amp; ATS Integration</p>
            </div>

            <div className="space-y-1.5 p-4 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl">
              <span className="text-xs text-[#83918C] uppercase font-bold tracking-wider font-mono">Primary Operational Hub</span>
              <p className="font-semibold text-[#111817] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#164E3F]" /> Noida, Uttar Pradesh, India
              </p>
            </div>

            <div className="space-y-1.5 p-4 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl">
              <span className="text-xs text-[#83918C] uppercase font-bold tracking-wider font-mono">Official Support Contact</span>
              <p className="font-semibold text-[#111817] flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#164E3F]" /> support@chatrchat.in
              </p>
            </div>
          </div>

          <div className="border-t border-[#DDE3DF] pt-6 space-y-3">
            <h3 className="font-bold text-[#111817] text-sm">Associated Web Properties</h3>
            <ul className="space-y-2 text-xs text-[#53605C]">
              <li><strong className="text-[#111817]">chatrchat.in:</strong> SME Growth OS, Knowledge Hub, Public SEO &amp; Observability Dashboard</li>
              <li><strong className="text-[#111817]">chatr.chat:</strong> Communication OS Superapp (Chat, Calling, Workflow Copilot)</li>
              <li><strong className="text-[#111817]">talentxcel.in:</strong> Talent &amp; Recruitment Platform (Job Matching, Resume Parser, Career Tools)</li>
            </ul>
          </div>
        </section>

        {/* Trust & Policy Links */}
        <section className="grid sm:grid-cols-2 gap-4">
          <Link to="/editorial-policy" className="bg-white hover:bg-[#FAFBF9] border border-[#DDE3DF] rounded-2xl p-6 transition-all space-y-2 shadow-sm group">
            <ShieldCheck className="w-5 h-5 text-[#164E3F]" />
            <h3 className="font-bold text-[#111817] text-base group-hover:text-[#164E3F] transition-colors">Editorial Policy</h3>
            <p className="text-xs text-[#53605C]">Review our standards for source attribution, first-party telemetry, and zero-fabrication metrics.</p>
          </Link>

          <Link to="/about" className="bg-white hover:bg-[#FAFBF9] border border-[#DDE3DF] rounded-2xl p-6 transition-all space-y-2 shadow-sm group">
            <Globe className="w-5 h-5 text-[#164E3F]" />
            <h3 className="font-bold text-[#111817] text-base group-hover:text-[#164E3F] transition-colors">About Platform</h3>
            <p className="text-xs text-[#53605C]">Learn about our mission to unify business messaging and customer calls for Indian SMEs.</p>
          </Link>
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

export default CompanyInfoPage;

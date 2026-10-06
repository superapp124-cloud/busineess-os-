import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, FileCheck, CheckCircle2, AlertCircle, RefreshCw, Cpu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { Footer } from '@/components/Footer';

export const EditorialPolicyPage: React.FC = () => {
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
    '@type': 'WebPage',
    name: 'Editorial Policy & Standards — CHATR Communication OS',
    url: 'https://chatrchat.in/editorial-policy',
    description: 'Editorial standards and data verification policies of CHATR Communication OS.',
    publisher: {
      '@type': 'Organization',
      name: 'CHATR Communication OS',
      url: 'https://chatrchat.in',
    },
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="Editorial Policy & Standards — CHATR Communication OS"
        description="Read CHATR Communication OS editorial standards: data verification methodologies, author expertise rules, SI assistance disclosures, and correction policies."
        canonicalUrl="https://chatrchat.in/editorial-policy"
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
            <span>EDITORIAL INTEGRITY &amp; EVIDENCE STANDARDS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#111817] tracking-tight leading-tight">
            Editorial Policy &amp; <span className="text-[#164E3F]">Research Standards</span>
          </h1>
          <p className="text-[#53605C] text-sm sm:text-base leading-relaxed max-w-2xl">
            CHATR Communication OS and TalentXcel maintain strict editorial standards across all published articles, technical guides, product announcements, and benchmark reports. We prioritize factual accuracy, verifiable first-party data, transparent source attribution, and zero-fabrication metrics.
          </p>
        </section>

        {/* Policy Pillars */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-10 space-y-8 shadow-sm">
          <div className="space-y-2.5 pb-6 border-b border-[#DDE3DF]">
            <div className="flex items-center gap-2 text-[#164E3F] font-bold text-lg">
              <FileCheck className="w-5 h-5 text-[#164E3F]" />
              <h2 className="text-[#111817]">1. Verifiable Data &amp; Source Attribution</h2>
            </div>
            <p className="text-[#53605C] text-sm leading-relaxed">
              All statistical claims, response-time benchmarks, candidate drop-off figures, and conversion metrics must include explicit source attribution and methodology context. When first-party CHATR or TalentXcel platform data is cited, the observation window and aggregation methodology are specified directly within the text.
            </p>
          </div>

          <div className="space-y-2.5 pb-6 border-b border-[#DDE3DF]">
            <div className="flex items-center gap-2 text-[#164E3F] font-bold text-lg">
              <CheckCircle2 className="w-5 h-5 text-[#164E3F]" />
              <h2 className="text-[#111817]">2. Author Expertise &amp; Review Requirements</h2>
            </div>
            <p className="text-[#53605C] text-sm leading-relaxed">
              Every article is authored or reviewed by an identified practitioner with domain expertise in business messaging, WhatsApp API integration, candidate screening workflows, or customer operations. Anonymous or unvetted content is prohibited.
            </p>
          </div>

          <div className="space-y-2.5 pb-6 border-b border-[#DDE3DF]">
            <div className="flex items-center gap-2 text-[#164E3F] font-bold text-lg">
              <Cpu className="w-5 h-5 text-[#164E3F]" />
              <h2 className="text-[#111817]">3. AI Assistance Disclosure</h2>
            </div>
            <p className="text-[#53605C] text-sm leading-relaxed">
              Where AI tools are used to assist in research outline generation or preliminary drafting, all technical details, code samples, workflow mechanics, and factual claims undergo mandatory human verification by our engineering leads before publication.
            </p>
          </div>

          <div className="space-y-2.5 pb-6 border-b border-[#DDE3DF]">
            <div className="flex items-center gap-2 text-[#164E3F] font-bold text-lg">
              <RefreshCw className="w-5 h-5 text-[#164E3F]" />
              <h2 className="text-[#111817]">4. Freshness &amp; Material Change Policy</h2>
            </div>
            <p className="text-[#53605C] text-sm leading-relaxed">
              We update publication timestamps only when substantial new data, API workflow changes, or editorial revisions have been incorporated. Superficial date updates without material content enhancements are strictly avoided.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[#164E3F] font-bold text-lg">
              <AlertCircle className="w-5 h-5 text-[#164E3F]" />
              <h2 className="text-[#111817]">5. Correction Policy</h2>
            </div>
            <p className="text-[#53605C] text-sm leading-relaxed">
              If an error or outdated API workflow is identified in any published article, our team corrects the information promptly and includes a clear correction note detailing what was updated and why.
            </p>
          </div>
        </section>

        {/* Contact Footer */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 text-center space-y-3 shadow-sm">
          <h3 className="font-bold text-[#111817] text-base">Editorial Inquiries &amp; Data Verification</h3>
          <p className="text-xs sm:text-sm text-[#53605C]">
            For questions regarding our research methodologies or to suggest corrections, contact the editorial team at{' '}
            <a href="mailto:support@chatrchat.in" className="text-[#164E3F] font-semibold underline">
              support@chatrchat.in
            </a>.
          </p>
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

export default EditorialPolicyPage;

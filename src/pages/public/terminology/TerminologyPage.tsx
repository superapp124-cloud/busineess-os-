import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Workflow, BookOpen, CheckCircle2, ArrowRight, HelpCircle, 
  ChevronDown, Cpu, Sparkles, Layers, ShieldCheck, Zap 
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { getSemanticPageByPath, TERMINOLOGY_PAGES } from '@/data/chatrSearchUniverseData';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { supabase } from '@/integrations/supabase/client';

export const TerminologyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const page = getSemanticPageByPath(currentPath) || TERMINOLOGY_PAGES[0];

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
  }, [currentPath]);

  const handleNavigateWorkspace = useCallback(() => {
    navigate('/desktop/home');
  }, [navigate]);

  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    navigate('/desktop/home', { replace: true });
  }, [navigate]);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": page.h1,
    "description": page.directAnswer,
    "inDefinedTermSet": "https://www.chatrchat.in/terminology",
    "url": `https://www.chatrchat.in${page.path}`
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title={page.title}
        description={page.description}
        keywords={page.keywords}
        schemaData={schemaData}
        canonicalUrl={`https://www.chatrchat.in${page.path}`}
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#53605C] font-medium" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#164E3F] transition-colors">Home</Link>
          <span className="text-[#83918C]">/</span>
          <span className="text-[#164E3F]">Core Terminology</span>
          <span className="text-[#83918C]">/</span>
          <span className="text-[#111817] font-semibold">{page.h1}</span>
        </nav>

        {/* Title & Tagline */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0EB] border border-[#164E3F]/20 text-[#164E3F] text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>OFFICIAL DEFINITION & ARCHITECTURE GUIDE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111817] tracking-tight leading-tight">
            {page.h1}
          </h1>
          <p className="text-base sm:text-lg text-[#53605C] leading-relaxed">
            {page.tagline}
          </p>
        </section>

        {/* The Definitive Answer Block */}
        <section id="canonical-definition" className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#164E3F] bg-[#E8F0EB] px-3 py-1 rounded-full border border-[#164E3F]/20">
              Official Definition
            </span>
            <span className="text-xs text-[#83918C] font-mono">Published by CHATR Architecture</span>
          </div>
          <p className="text-[#111817] text-lg sm:text-xl leading-relaxed font-semibold">
            {page.directAnswer}
          </p>
        </section>

        {/* Core Architectural Pillars */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-[#111817]">Key Architectural Principles</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {page.keyCapabilities.map((cap, idx) => (
              <div key={idx} className="bg-white border border-[#DDE3DF] rounded-2xl p-5 flex items-start gap-3 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-[#164E3F] shrink-0 mt-0.5" />
                <span className="text-sm text-[#111817] leading-relaxed font-medium">{cap}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Tool Funnel */}
        {page.relatedTools && page.relatedTools.length > 0 && (
          <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#164E3F]">Interactive Demonstration</span>
              <h3 className="text-xl font-bold text-[#111817]">Experience {page.h1} in Action</h3>
              <p className="text-[#53605C] text-sm">Test the runtime capabilities directly in your browser with our free interactive tool.</p>
            </div>
            <div className="pt-2">
              {page.relatedTools.map((t, idx) => (
                <Link
                  key={idx}
                  to={t.path}
                  className="inline-flex items-center gap-2 bg-[#164E3F] hover:bg-[#123F33] text-white px-6 py-3 rounded-full font-semibold text-sm transition-all shadow-sm"
                >
                  <span>Launch {t.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Frequently Asked Questions */}
        {page.faqs && page.faqs.length > 0 && (
          <section className="space-y-5">
            <h2 className="text-2xl font-bold text-[#111817]">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {page.faqs.map((faq, idx) => (
                <details key={idx} className="border border-[#DDE3DF] rounded-2xl overflow-hidden bg-white p-5 text-sm group shadow-sm" open={idx === 0}>
                  <summary className="font-semibold text-[#111817] cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.q}</span>
                    <ChevronDown className="w-4 h-4 text-[#83918C] group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="mt-3 pt-3 border-t border-[#DDE3DF] text-xs sm:text-sm text-[#53605C] leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Cross-Link Hubs */}
        <section className="pt-6 border-t border-[#DDE3DF] space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-[#83918C]">Related Pillars & Products</span>
          <div className="flex flex-wrap gap-2.5">
            {page.relatedPages.map((rp, idx) => (
              <Link
                key={idx}
                to={rp.path}
                className="text-xs bg-white hover:bg-[#FAFBF9] text-[#111817] hover:text-[#164E3F] border border-[#DDE3DF] hover:border-[#164E3F]/40 px-4 py-2 rounded-full transition-colors font-medium flex items-center gap-1.5 shadow-sm"
              >
                <span>{rp.title}</span>
                <span className="text-[#164E3F]">→</span>
              </Link>
            ))}
          </div>
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

export default TerminologyPage;

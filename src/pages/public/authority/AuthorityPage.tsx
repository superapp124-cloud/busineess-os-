import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, ShieldCheck, CheckCircle2, ChevronDown, 
  Layers, Activity, Zap, Cpu, PhoneCall, MessageSquare, Fingerprint, 
  Workflow, Globe, Lock, Check 
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { getSemanticPageByPath, AUTHORITY_PAGES } from '@/data/chatrSearchUniverseData';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { supabase } from '@/integrations/supabase/client';

export const AuthorityPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const page = getSemanticPageByPath(currentPath) || AUTHORITY_PAGES[0];

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

  const getUniverseIcon = (universe: string) => {
    switch (universe) {
      case 'calling': return <PhoneCall className="w-5 h-5 text-[#164E3F]" />;
      case 'communication': return <MessageSquare className="w-5 h-5 text-[#164E3F]" />;
      case 'identity': return <Fingerprint className="w-5 h-5 text-[#164E3F]" />;
      case 'ai': return <Sparkles className="w-5 h-5 text-[#164E3F]" />;
      case 'intent-os': return <Workflow className="w-5 h-5 text-[#164E3F]" />;
      case 'robotics-os': return <Cpu className="w-5 h-5 text-[#164E3F]" />;
      default: return <Layers className="w-5 h-5 text-[#164E3F]" />;
    }
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": page.title,
    "headline": page.h1,
    "description": page.description,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, Windows, macOS, Android, iOS",
    "url": `https://www.chatrchat.in${page.path}`,
    "provider": {
      "@type": "Organization",
      "name": "CHATR Intent OS",
      "url": "https://www.chatrchat.in"
    }
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

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#53605C] font-medium" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#164E3F] transition-colors">Home</Link>
          <span className="text-[#83918C]">/</span>
          <span className="text-[#164E3F] capitalize">{page.universe} Universe</span>
          <span className="text-[#83918C]">/</span>
          <span className="text-[#111817] font-semibold">{page.h1}</span>
        </nav>

        {/* Hero Section */}
        <section className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0EB] border border-[#164E3F]/20 text-[#164E3F] text-xs font-semibold">
            {getUniverseIcon(page.universe)}
            <span className="uppercase">{page.layer.replace('-', ' ')} • {page.universe}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111817] tracking-tight leading-tight">
            {page.h1}
          </h1>
          <p className="text-base sm:text-lg text-[#53605C] leading-relaxed">
            {page.tagline}
          </p>
        </section>

        {/* Direct-Answer Definition Block */}
        <section id="direct-answer" className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#164E3F] bg-[#E8F0EB] px-3 py-1 rounded-full border border-[#164E3F]/20">
              Direct Search Definition
            </span>
            <span className="text-xs text-[#83918C] font-mono">Verified Canonical Answer</span>
          </div>
          <p className="text-[#111817] text-base sm:text-lg leading-relaxed font-medium">
            {page.directAnswer}
          </p>
        </section>

        {/* Performance Metrics Matrix */}
        {page.metrics && page.metrics.length > 0 && (
          <section className="grid sm:grid-cols-3 gap-4">
            {page.metrics.map((m, idx) => (
              <div key={idx} className="bg-white border border-[#DDE3DF] rounded-2xl p-6 space-y-1.5 shadow-sm">
                <span className="text-xs font-bold text-[#83918C] uppercase tracking-wider">{m.label}</span>
                <div className="text-3xl font-black text-[#164E3F]">{m.value}</div>
                <p className="text-xs text-[#53605C]">{m.context}</p>
              </div>
            ))}
          </section>
        )}

        {/* Core Architectural Capabilities */}
        <section className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#111817]">Platform Capabilities & Core Architecture</h2>
            <p className="text-[#53605C] text-sm">Engineered for mission-critical reliability, sub-50ms execution, and multi-channel synchronization.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {page.keyCapabilities.map((cap, idx) => (
              <div key={idx} className="bg-white border border-[#DDE3DF] rounded-2xl p-5 flex items-start gap-3 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-[#164E3F] shrink-0 mt-0.5" />
                <span className="text-sm text-[#111817] leading-relaxed font-medium">{cap}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Native CHATR Interactive Tools */}
        {page.relatedTools && page.relatedTools.length > 0 && (
          <section className="space-y-5 bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#164E3F]">Zero Setup • Client-Side Execution</span>
              <h2 className="text-xl font-bold text-[#111817]">Related Interactive Tools</h2>
              <p className="text-[#53605C] text-xs sm:text-sm">Launch native browser tools powered by CHATR Infrastructure with zero registration required.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {page.relatedTools.map((tool, idx) => (
                <Link
                  key={idx}
                  to={tool.path}
                  className="group bg-[#FAFBF9] hover:bg-white border border-[#DDE3DF] hover:border-[#164E3F]/40 rounded-xl p-5 space-y-3 transition-all flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#111817] group-hover:text-[#164E3F] transition-colors">{tool.name}</span>
                      <ArrowRight className="w-4 h-4 text-[#83918C] group-hover:text-[#164E3F] transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="text-xs text-[#53605C] leading-relaxed">{tool.description}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#164E3F] pt-2 border-t border-[#DDE3DF]">
                    Open Tool →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Frequently Asked Questions */}
        {page.faqs && page.faqs.length > 0 && (
          <section className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#111817]">Frequently Asked Questions</h2>
              <p className="text-[#53605C] text-sm">Key architectural and operational questions regarding {page.h1}.</p>
            </div>
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

        {/* Cross-Universe Authority Navigation */}
        {page.relatedPages && page.relatedPages.length > 0 && (
          <section className="pt-6 border-t border-[#DDE3DF] space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[#83918C]">Explore The CHATR Universe</span>
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
        )}

        {/* Conversion Hero CTA */}
        <section className="bg-white border border-[#DDE3DF] rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111817]">
            Experience the Future of Business Execution
          </h2>
          <p className="text-[#53605C] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Eliminate software silos, centralize communication, and empower your team with the CHATR Intent Operating System.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="bg-[#164E3F] hover:bg-[#123F33] text-white font-semibold px-8 py-3.5 rounded-full transition-all shadow-sm text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              Start Free Workspace <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/pricing"
              className="border border-[#DDE3DF] hover:bg-[#FAFBF9] text-[#111817] font-semibold px-6 py-3.5 rounded-full transition-colors text-sm shadow-sm"
            >
              View Plans & Pricing
            </Link>
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

export default AuthorityPage;

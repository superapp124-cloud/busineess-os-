import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, ChevronDown, HelpCircle, Tag, FileText, 
  ArrowRight, Database, ShieldCheck, ExternalLink, AlertCircle, Wrench, Network 
} from 'lucide-react';
import { EXPANSION_PAGES } from '../../data/expansionPagesData';
import { AUTHORS } from '../../data/authorsData';
import { getEvidenceNodesForRoute } from '../../services/evidenceGraphEngine';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

export const ExpansionPillarPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageConfig = EXPANSION_PAGES.find(p => p.path === location.pathname);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const evidenceNodes = pageConfig ? getEvidenceNodesForRoute(pageConfig.path, pageConfig.category) : [];

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

    if (pageConfig) {
      document.title = pageConfig.title;

      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: pageConfig.h1,
        description: pageConfig.description,
        author: {
          '@type': 'Person',
          name: 'Sanobar Jahan',
          jobTitle: 'Founder, TalentXcel & CHATR',
          url: 'https://www.chatrchat.in/authors/sanobar-jahan'
        },
        publisher: {
          '@type': 'Organization',
          name: 'CHATR Communication OS',
          url: 'https://www.chatrchat.in'
        },
        datePublished: '2026-08-11',
        dateModified: '2026-08-11'
      };

      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: pageConfig.faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a }
        }))
      };

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.chatrchat.in' },
          { '@type': 'ListItem', position: 2, name: pageConfig.category, item: `https://www.chatrchat.in#${pageConfig.category.toLowerCase()}` },
          { '@type': 'ListItem', position: 3, name: pageConfig.h1, item: `https://www.chatrchat.in${pageConfig.path}` }
        ]
      };

      const howToSchema = pageConfig.category === 'Problem' ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: pageConfig.h1,
        description: pageConfig.description,
        step: [
          {
            '@type': 'HowToStep',
            name: 'Diagnose Inbound Channel Friction',
            text: 'Identify unassigned message queues, response SLA timeouts, and context-switching bottlenecks across your team inboxes.'
          },
          {
            '@type': 'HowToStep',
            name: 'Implement Immediate Operational Workflows',
            text: 'Establish round-robin routing rules, multi-agent collision locks, and automated after-hours intake auto-responders.'
          },
          {
            '@type': 'HowToStep',
            name: 'Deploy CHATR Business OS Automation',
            text: 'Unify WhatsApp, email, and candidate screening data into a single centralized system with real-time manager SLA alerts.'
          }
        ]
      } : null;

      const scriptArt = document.createElement('script');
      scriptArt.id = 'expansion-article-schema';
      scriptArt.type = 'application/ld+json';
      scriptArt.textContent = JSON.stringify(articleSchema);
      if (!document.getElementById('expansion-article-schema')) document.head.appendChild(scriptArt);

      const scriptFaq = document.createElement('script');
      scriptFaq.id = 'expansion-faq-schema';
      scriptFaq.type = 'application/ld+json';
      scriptFaq.textContent = JSON.stringify(faqSchema);
      if (!document.getElementById('expansion-faq-schema')) document.head.appendChild(scriptFaq);

      const scriptBc = document.createElement('script');
      scriptBc.id = 'expansion-breadcrumb-schema';
      scriptBc.type = 'application/ld+json';
      scriptBc.textContent = JSON.stringify(breadcrumbSchema);
      if (!document.getElementById('expansion-breadcrumb-schema')) document.head.appendChild(scriptBc);

      if (howToSchema) {
        const scriptHowTo = document.createElement('script');
        scriptHowTo.id = 'expansion-howto-schema';
        scriptHowTo.type = 'application/ld+json';
        scriptHowTo.textContent = JSON.stringify(howToSchema);
        if (!document.getElementById('expansion-howto-schema')) document.head.appendChild(scriptHowTo);
      }
    }

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      ['expansion-article-schema', 'expansion-faq-schema', 'expansion-breadcrumb-schema', 'expansion-howto-schema'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    };
  }, [pageConfig]);

  const handleNavigateWorkspace = useCallback(() => {
    navigate('/desktop/home');
  }, [navigate]);

  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    navigate('/desktop/home', { replace: true });
  }, [navigate]);

  if (!pageConfig) {
    return (
      <div className="min-h-screen bg-[#F8F8F5] text-[#111817] flex flex-col justify-between">
        <LandingHeader
          onOpenAuth={() => setAuthModalOpen(true)}
          isAuthenticated={isAuthenticated}
          onNavigateWorkspace={handleNavigateWorkspace}
        />
        <div className="text-center space-y-4 max-w-md mx-auto p-12">
          <p className="text-[#53605C]">Pillar page not found.</p>
          <Link to="/" className="text-[#164E3F] hover:underline font-semibold text-sm">Back to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title={pageConfig.title}
        description={pageConfig.description}
        canonicalUrl={`https://www.chatrchat.in${pageConfig.path}`}
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-12">
        {/* Header & Meta */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0EB] border border-[#164E3F]/20 text-[#164E3F] text-xs font-semibold">
            <Tag className="w-3.5 h-3.5" />
            <span>{pageConfig.category} Engine • Published August 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111817] leading-tight tracking-tight">
            {pageConfig.h1}
          </h1>

          {/* Direct Answer Executive Summary Block */}
          <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#164E3F]">
              <CheckCircle2 className="w-4 h-4 text-[#164E3F]" />
              <span>Executive Summary & Key Takeaway</span>
            </div>
            <p className="text-[#111817] text-sm sm:text-base leading-relaxed font-medium">
              {pageConfig.executiveSummary}
            </p>
          </div>
        </div>

        {/* Diagnostic Root Cause Section (If Problem Category) */}
        {pageConfig.category === 'Problem' && (
          <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#164E3F] font-bold text-base uppercase tracking-wider">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span>Diagnostic Root Cause Analysis</span>
            </div>
            <p className="text-[#53605C] text-xs sm:text-sm leading-relaxed">
              This operational friction typically stems from single-device bottlenecks, lack of automated lead distribution, unmonitored response SLAs, and fragmented communication channels. Without a centralized triage system, teams experience high lead drop-off and delayed customer response times.
            </p>
            <div className="space-y-2 pt-3 border-t border-[#DDE3DF] text-xs text-[#53605C]">
              <span className="font-bold text-[#111817] flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#164E3F]" />
                <span>3 Actionable Non-Software Process Fixes:</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-[#53605C] pl-1">
                <li>Assign dedicated lead triage shifts to prevent off-hours inbox queue backlog.</li>
                <li>Establish rigid 5-minute response SLA targets for first-touch customer inquiries.</li>
                <li>Implement standardized pre-screening question templates across all agent devices.</li>
              </ul>
            </div>
          </section>
        )}

        {/* Strategic Interlinking Triad Box */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#111817] text-base">
            <Network className="w-4 h-4 text-[#164E3F]" />
            <span>Recommended Strategic Interlinking Triad</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <Link to="/workflow/whatsapp-lead-response-workflow" className="bg-[#FAFBF9] hover:bg-white border border-[#DDE3DF] hover:border-[#164E3F]/40 p-4 rounded-xl space-y-1 block transition-all shadow-sm">
              <span className="text-[#164E3F] font-bold text-[10px] block uppercase">Engine 6: Workflow</span>
              <span className="text-[#111817] font-semibold block leading-tight">Lead Response Workflow →</span>
            </Link>
            <Link to="/chatr/whatsapp-candidate-screening" className="bg-[#FAFBF9] hover:bg-white border border-[#DDE3DF] hover:border-[#164E3F]/40 p-4 rounded-xl space-y-1 block transition-all shadow-sm">
              <span className="text-[#164E3F] font-bold text-[10px] block uppercase">Engine 3: Feature</span>
              <span className="text-[#111817] font-semibold block leading-tight">WhatsApp Screening →</span>
            </Link>
            <Link to="/industries/recruitment-agencies" className="bg-[#FAFBF9] hover:bg-white border border-[#DDE3DF] hover:border-[#164E3F]/40 p-4 rounded-xl space-y-1 block transition-all shadow-sm">
              <span className="text-[#164E3F] font-bold text-[10px] block uppercase">Engine 7: Industry</span>
              <span className="text-[#111817] font-semibold block leading-tight">Recruitment Agencies →</span>
            </Link>
          </div>
        </section>

        {/* Core Analysis Section */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-[#111817]">Operational Problem & Structural Solution</h2>
          <p className="text-[#53605C] text-sm sm:text-base leading-relaxed">
            Modern business communication suffers from fragmented channels, slow response times, and unorganized lead queues. {pageConfig.h1} addresses this friction directly by unifying customer touchpoints into an intelligent workflow.
          </p>

          <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
            <h3 className="font-bold text-[#111817] text-base">Key Operational Advantages</h3>
            <ul className="space-y-3 text-xs sm:text-sm text-[#53605C]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#164E3F] shrink-0 mt-0.5" />
                <span><strong className="text-[#111817]">Instant Response SLAs:</strong> Cut initial acknowledgment time from hours to under 60 seconds on WhatsApp.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#164E3F] shrink-0 mt-0.5" />
                <span><strong className="text-[#111817]">Unified Context:</strong> Keep email, WhatsApp, and candidate screening data linked to a single conversation history.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#164E3F] shrink-0 mt-0.5" />
                <span><strong className="text-[#111817]">Role-Based Security:</strong> Protect candidate resumes and customer inquiries with enterprise access controls.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Evidence Graph Node Card */}
        {evidenceNodes.length > 0 && (
          <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#DDE3DF] pb-3">
              <div className="flex items-center gap-2 font-bold text-[#111817] text-base">
                <Database className="w-4 h-4 text-[#164E3F]" />
                <span>Grounded Evidence Graph Trail</span>
              </div>
              <span className="text-xs font-mono text-[#164E3F] bg-[#E8F0EB] border border-[#164E3F]/20 px-2.5 py-0.5 rounded-full font-semibold">
                Verified Observational Finding
              </span>
            </div>

            <div className="space-y-3">
              {evidenceNodes.slice(0, 2).map((ev, idx) => (
                <div key={idx} className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#164E3F] font-bold">Finding ID: {ev.findingId}</span>
                    <span className="text-[#83918C]">{ev.sampleSize}</span>
                  </div>
                  <p className="text-xs text-[#111817] leading-relaxed font-medium">"{ev.claimText}"</p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#DDE3DF] text-xs">
                    <span className="text-[#53605C] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#164E3F]" /> Type: <strong className="text-[#111817]">{ev.claimType}</strong>
                    </span>
                    <Link to={ev.reportPath} className="text-[#164E3F] hover:underline flex items-center gap-1 font-semibold">
                      View Report Methodology <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Methodology & Data Evidence Trail Box */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 space-y-2 text-xs text-[#53605C] shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#111817] text-sm">
            <FileText className="w-4 h-4 text-[#164E3F]" />
            <span>Data Evidence & Verification Trail</span>
          </div>
          <p><strong className="text-[#111817]">Telemetry Basis:</strong> {pageConfig.evidenceText}</p>
          <p>
            <strong className="text-[#111817]">Editorial Oversight:</strong> Edited by <Link to="/authors/sanobar-jahan" className="text-[#164E3F] underline font-semibold">Sanobar Jahan</Link> under our <Link to="/editorial-policy" className="text-[#164E3F] underline">Editorial Policy</Link>.
          </p>
        </section>

        {/* Author Attribution Card */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F0EB] border border-[#164E3F]/20 flex items-center justify-center text-[#164E3F] font-bold text-lg shrink-0">
            S
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#111817] text-base">{AUTHORS['sanobar-jahan'].name}</h3>
              <Link to="/authors/sanobar-jahan" className="text-xs text-[#164E3F] hover:underline font-semibold">View Profile →</Link>
            </div>
            <p className="text-xs text-[#164E3F] font-semibold">{AUTHORS['sanobar-jahan'].role}</p>
            <p className="text-xs text-[#53605C] leading-relaxed">{AUTHORS['sanobar-jahan'].bio}</p>
          </div>
        </section>

        {/* Contextual Product CTA */}
        {pageConfig.ctaTitle && pageConfig.ctaTarget && (
          <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
            <h3 className="text-[#111817] font-bold text-lg">{pageConfig.ctaTitle}</h3>
            <p className="text-[#53605C] text-sm">{pageConfig.ctaDescription}</p>
            <div className="pt-1">
              <Link to={pageConfig.ctaTarget} className="inline-flex items-center gap-2 text-[#164E3F] font-semibold hover:underline text-sm">
                {pageConfig.ctaButtonText || 'Explore Solution'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {/* FAQ Accordion Section */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-lg text-[#111817]">
            <HelpCircle className="w-5 h-5 text-[#164E3F]" />
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {pageConfig.faqs.map((faq, idx) => (
              <div key={idx} className="border border-[#DDE3DF] rounded-xl overflow-hidden bg-[#FAFBF9]">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-white transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-sm text-[#111817]">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#83918C] transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-[#53605C] leading-relaxed border-t border-[#DDE3DF] bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="bg-white border border-[#DDE3DF] rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111817]">Transform Your Team Messaging & Candidate Workflows</h2>
          <p className="text-xs sm:text-sm text-[#53605C] max-w-xl mx-auto leading-relaxed">
            Join forward-thinking SMBs using CHATR Communication OS and TalentXcel to streamline WhatsApp lead triage, candidate screening, and team SLA tracking.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#164E3F] hover:bg-[#123F33] text-white px-7 py-3.5 rounded-full font-semibold text-sm transition-all shadow-sm cursor-pointer"
            >
              <span>Start Your Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
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

export default ExpansionPillarPage;

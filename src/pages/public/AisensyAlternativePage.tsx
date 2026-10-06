import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, CheckCircle2, HelpCircle, 
  PhoneCall, DollarSign, RefreshCw, Zap, Users, MessageSquare, Check 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { InteractiveInboxSimulator } from '@/components/seo/InteractiveInboxSimulator';
import { Footer } from '@/components/Footer';

interface ComparisonRow {
  capability: string;
  category: string;
  chatr: { supported: boolean; detail: string };
  aisensy: { supported: boolean; detail: string };
}

const AISENSY_COMPARISON_DATA: ComparisonRow[] = [
  {
    category: 'Commercial & Pricing',
    capability: 'Base Monthly Pricing',
    chatr: {
      supported: true,
      detail: 'From ₹999/month (SME Starter plan) with transparent billing'
    },
    aisensy: {
      supported: true,
      detail: 'Starts at ₹999 - ₹2,399/month + Meta markup and add-on charges'
    }
  },
  {
    category: 'Commercial & Pricing',
    capability: 'Per-User / Seat Penalties',
    chatr: {
      supported: true,
      detail: 'Team access included without steep per-user tier penalties'
    },
    aisensy: {
      supported: false,
      detail: 'Restricted agent seats on basic tiers; upgrades required for team scale'
    }
  },
  {
    category: 'Commercial & Pricing',
    capability: 'Meta API Conversation Markup',
    chatr: {
      supported: true,
      detail: 'Direct official Meta Cloud API billing with zero conversation surcharges'
    },
    aisensy: {
      supported: false,
      detail: 'Applies third-party platform markups on top of official Meta tariffs'
    }
  },
  {
    category: 'Messaging & Team Inbox',
    capability: 'Multi-Agent Shared Inbox',
    chatr: {
      supported: true,
      detail: 'Full team inbox with real-time assignment, collision detection and typing lock'
    },
    aisensy: {
      supported: true,
      detail: 'Shared team inbox with live chat and manual agent tagging'
    }
  },
  {
    category: 'Messaging & Team Inbox',
    capability: 'Direct Browser WebRTC Calling',
    chatr: {
      supported: true,
      detail: 'Built-in carrier-grade WebRTC voice calling directly in the team browser'
    },
    aisensy: {
      supported: false,
      detail: 'Messaging only; requires external VoIP software or PBX integration'
    }
  },
  {
    category: 'Intelligence & Automation',
    capability: 'Lead & Conversation Qualification',
    chatr: {
      supported: true,
      detail: 'Automated conversational qualification parsing customer needs, budgets, and timelines'
    },
    aisensy: {
      supported: false,
      detail: 'Basic rule-based chatbot flow builder; manual intent parsing'
    }
  },
  {
    category: 'Platform & Extensibility',
    capability: 'Interactive Live Browser Simulator',
    chatr: {
      supported: true,
      detail: 'Interactive sandbox to test lead qualification and team routing live in browser'
    },
    aisensy: {
      supported: false,
      detail: 'Requires sales demo or live WhatsApp setup before product evaluation'
    }
  }
];

export const AisensyAlternativePage: React.FC = () => {
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
    name: 'AiSensy Alternative: CHATR Communication OS',
    description: 'Factual capability and pricing comparison between AiSensy and CHATR for WhatsApp business communication.',
    url: 'https://www.chatrchat.in/aisensy-alternative',
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: 'CHATR Communication OS',
      applicationCategory: 'BusinessApplication',
      offers: {
        '@type': 'Offer',
        price: '999',
        priceCurrency: 'INR'
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="AiSensy Alternative — WhatsApp API, Shared Team Inbox & Calling | CHATR"
        description="Compare CHATR and AiSensy for business WhatsApp communication. Transparent pricing from ₹999/mo, multi-agent shared team inboxes, zero markup on Meta fees, and browser WebRTC calling."
        canonicalUrl="https://www.chatrchat.in/aisensy-alternative"
        keywords="aisensy alternative, aisensy pricing comparison, best aisensy alternatives, whatsapp business api alternatives, chatr vs aisensy"
        schemaData={schemaData}
      />

      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 flex-1">
        {/* Hero Section */}
        <section className="text-center space-y-5 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
            <span className="w-6 h-[1.5px] bg-[#164E3F]" />
            <span>FACTUAL PLATFORM COMPARISON • UPDATED 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111817] leading-[1.1]">
            The Modern <span className="text-[#164E3F]">AiSensy Alternative</span> for WhatsApp &amp; Calling
          </h1>

          <p className="text-base sm:text-lg text-[#53605C] leading-relaxed max-w-2xl mx-auto">
            Looking for an AiSensy alternative without rigid user tier limits or marked-up conversation fees? CHATR unifies official Meta Cloud WhatsApp messaging, multi-agent shared inboxes, and browser voice calling.
          </p>

          <div className="flex items-center justify-center gap-4 pt-3 flex-wrap">
            <button
              onClick={() => {
                if (isAuthenticated) navigate('/desktop/home');
                else setAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#164E3F] hover:bg-[#123F33] text-white text-sm sm:text-base font-semibold shadow-md transition-all cursor-pointer"
            >
              <span>Start Free with CHATR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#comparison"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#FAFBF9] text-[#111817] border border-[#DDE3DF] text-sm sm:text-base font-medium shadow-sm transition-all"
            >
              <span>View Comparison Matrix</span>
            </a>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-[#53605C] flex-wrap font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" /> 0% Markup on Meta Tariffs
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" /> Multi-Agent Shared Inbox
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" /> Browser Voice Calling Included
            </span>
          </div>
        </section>

        {/* Live Simulator Preview */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111817]">Experience CHATR Team Inbox Live</h2>
            <p className="text-xs sm:text-sm text-[#53605C] max-w-md mx-auto">
              Simulate real-time conversation triage, lead qualification, and multi-agent assignment below.
            </p>
          </div>
          <InteractiveInboxSimulator />
        </section>

        {/* Comparison Matrix Section */}
        <section id="comparison" className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111817]">CHATR vs AiSensy: Side-by-Side Comparison</h2>
            <p className="text-xs sm:text-sm text-[#53605C] max-w-lg mx-auto">
              Based on verified documentation and standard commercial specifications.
            </p>
          </div>

          <div className="bg-white border border-[#DDE3DF] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#DDE3DF] bg-[#FAFBF9] text-[#53605C]">
                    <th className="py-4 pl-6 w-1/3 font-semibold">Capability</th>
                    <th className="py-4 px-4 w-1/3 bg-[#EAEFEA] text-[#164E3F] font-bold border-x border-[#DDE3DF]">
                      CHATR Communication OS
                    </th>
                    <th className="py-4 pr-6 w-1/3 text-[#53605C] font-semibold">AiSensy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE3DF]">
                  {AISENSY_COMPARISON_DATA.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#FAFBF9] transition-colors">
                      <td className="py-4 pl-6 space-y-0.5">
                        <span className="text-[10px] font-semibold text-[#164E3F] uppercase tracking-wider block font-mono">
                          {row.category}
                        </span>
                        <span className="font-bold text-[#111817] text-xs sm:text-sm block">{row.capability}</span>
                      </td>
                      <td className="py-4 px-4 space-y-1 bg-[#FAFBF9]/80 border-x border-[#DDE3DF]">
                        <div className="flex items-center gap-1.5 text-[#164E3F] font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Included</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-[#53605C] leading-normal">{row.chatr.detail}</p>
                      </td>
                      <td className="py-4 pr-6 space-y-1">
                        <div className={`flex items-center gap-1.5 font-bold text-xs ${row.aisensy.supported ? 'text-[#53605C]' : 'text-slate-400'}`}>
                          {row.aisensy.supported ? <CheckCircle2 className="w-4 h-4 text-[#83918C] shrink-0" /> : <span className="w-4 h-4 text-center leading-none text-rose-500 font-bold">✕</span>}
                          <span>{row.aisensy.supported ? 'Supported' : 'Tier Limited / Not Included'}</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-[#83918C] leading-normal">{row.aisensy.detail}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Why Switch Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#EAEFEA] text-[#164E3F] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111817]">0% Markup on Meta Fees</h3>
            <p className="text-xs text-[#53605C] leading-relaxed">
              Pay Meta conversation fees directly at standard cost. CHATR does not levy hidden per-message markups or conversation penalties.
            </p>
          </div>

          <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#EAEFEA] text-[#164E3F] flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111817]">WebRTC Voice Calling Included</h3>
            <p className="text-xs text-[#53605C] leading-relaxed">
              Why use one app for WhatsApp and another for customer calls? CHATR lets your team dial and receive crystal-clear HD voice calls right in their browser.
            </p>
          </div>

          <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#EAEFEA] text-[#164E3F] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111817]">Automated Lead Qualification</h3>
            <p className="text-xs text-[#53605C] leading-relaxed">
              Filter incoming messages with automated triage flows that capture customer criteria, verify requirements, and schedule consultations.
            </p>
          </div>
        </section>

        {/* CTA Card */}
        <section className="bg-[#EAEFEA] border border-[#D5E0D5] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111817]">
            Ready to Upgrade from AiSensy?
          </h2>
          <p className="text-xs sm:text-sm text-[#53605C] max-w-xl mx-auto leading-relaxed">
            Start on the ₹999/mo SME Starter plan with full WhatsApp Business API support, shared team inbox, and browser calling.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                if (isAuthenticated) navigate('/desktop/home');
                else setAuthModalOpen(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#164E3F] hover:bg-[#123F33] text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#FAFBF9] border border-[#DDE3DF] text-[#111817] font-semibold text-xs sm:text-sm transition-colors shadow-sm"
            >
              Explore Commercial Pricing
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

export default AisensyAlternativePage;

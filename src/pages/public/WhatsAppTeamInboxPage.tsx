import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Bot, MessageSquare, ArrowRight, ShieldCheck, CheckCircle2, 
  PhoneCall, Zap, HelpCircle, Check, Sparkles 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { InteractiveInboxSimulator } from '@/components/seo/InteractiveInboxSimulator';
import { Footer } from '@/components/Footer';

export const WhatsAppTeamInboxPage: React.FC = () => {
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
    '@type': 'SoftwareApplication',
    name: 'CHATR WhatsApp Shared Team Inbox',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Windows, macOS, Android, iOS',
    offers: {
      '@type': 'Offer',
      price: '999',
      priceCurrency: 'INR'
    },
    description: 'Multi-agent shared team inbox for official WhatsApp Business API with automated lead assignment and SI response assistance.'
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="WhatsApp Team Inbox — Shared Multi-Agent Inbox for Businesses | CHATR"
        description="Connect multiple team members to one official WhatsApp Business number. Round-robin lead routing, collision protection, and automated triage starting at ₹999/mo."
        canonicalUrl="https://www.chatrchat.in/whatsapp-team-inbox"
        keywords="whatsapp team inbox, shared whatsapp inbox, whatsapp multi agent customer service, whatsapp business api inbox, chatr whatsapp"
        schemaData={schemaData}
      />

      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 flex-1">
        {/* Hero Section matching Image 2 */}
        <section className="text-center space-y-5 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
            <span className="w-6 h-[1.5px] bg-[#164E3F]" />
            <span>SHARED WHATSAPP BUSINESS INBOX</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111817] leading-[1.1]">
            One WhatsApp Inbox for Your Entire Team —{' '}
            <span className="text-[#164E3F]">and reply as one.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#53605C] leading-relaxed max-w-2xl mx-auto">
            Stop passing one office phone around. Connect your sales, support, and operations teams to a single official WhatsApp Business number with automated lead routing and collision protection.
          </p>

          <div className="flex items-center justify-center gap-4 pt-3 flex-wrap">
            <button
              onClick={() => {
                if (isAuthenticated) navigate('/desktop/home');
                else setAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#164E3F] hover:bg-[#123F33] text-white text-sm sm:text-base font-semibold shadow-md transition-all cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#interactive-demo"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#FAFBF9] text-[#111817] border border-[#DDE3DF] text-sm sm:text-base font-medium shadow-sm transition-all"
            >
              <span>Try Live Interactive Demo</span>
            </a>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-[#53605C] flex-wrap font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" /> Official Meta Cloud API
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" /> Multi-Agent Collision Lock
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" /> Sub-Minute Speed to Lead
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" /> Plans from ₹999/mo
            </span>
          </div>
        </section>

        {/* Above-The-Fold Interactive Experience */}
        <section id="interactive-demo" className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xs uppercase font-bold tracking-wider text-[#164E3F] font-mono">
              Live Product Experience
            </h2>
            <p className="text-xl sm:text-2xl font-bold text-[#111817]">
              See How Incoming WhatsApp Messages Flow Through CHATR
            </p>
          </div>
          <InteractiveInboxSimulator />
        </section>

        {/* The 4-Stage Operational Architecture */}
        <section className="space-y-8 bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111817]">How CHATR Team Inbox Operates</h2>
            <p className="text-xs sm:text-sm text-[#53605C] max-w-xl mx-auto">
              Every conversation is tracked from first inbound message to final customer resolution with zero lost leads.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div className="p-5 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EAEFEA] border border-[#D5E0D5] text-[#164E3F] font-bold flex items-center justify-center">1</div>
              <h3 className="font-bold text-[#111817] text-sm">Customer Inbound</h3>
              <p className="text-[#53605C] leading-relaxed">
                Prospect messages your verified WhatsApp Business phone number. Delivery confirmed instantly via Meta Cloud webhook.
              </p>
            </div>

            <div className="p-5 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EAEFEA] border border-[#D5E0D5] text-[#164E3F] font-bold flex items-center justify-center">2</div>
              <h3 className="font-bold text-[#111817] text-sm">Automated Triage</h3>
              <p className="text-[#53605C] leading-relaxed">
                CHATR parses incoming text, determines intent (Sales, Support, Billing, or Recruitment), and tags urgency.
              </p>
            </div>

            <div className="p-5 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EAEFEA] border border-[#D5E0D5] text-[#164E3F] font-bold flex items-center justify-center">3</div>
              <h3 className="font-bold text-[#111817] text-sm">Round-Robin Routing</h3>
              <p className="text-[#53605C] leading-relaxed">
                Conversation is assigned to the appropriate team member based on active availability, language, and workload.
              </p>
            </div>

            <div className="p-5 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EAEFEA] border border-[#D5E0D5] text-[#164E3F] font-bold flex items-center justify-center">4</div>
              <h3 className="font-bold text-[#111817] text-sm">Resolution &amp; History</h3>
              <p className="text-[#53605C] leading-relaxed">
                Agent replies from desktop or mobile. Entire conversation history, internal notes, and customer tags are archived securely.
              </p>
            </div>
          </div>
        </section>

        {/* Real Product Capabilities Grid */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111817] text-center">Built for Operational Discipline</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-[#DDE3DF] rounded-2xl space-y-3 shadow-sm">
              <div className="p-3 w-fit rounded-xl bg-[#EAEFEA] text-[#164E3F]">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#111817] text-base">Collision Protection</h3>
              <p className="text-xs text-[#53605C] leading-relaxed">
                See in real-time when another team member is viewing or typing a response. Prevents duplicate replies and conflicting customer promises.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#DDE3DF] rounded-2xl space-y-3 shadow-sm">
              <div className="p-3 w-fit rounded-xl bg-[#EAEFEA] text-[#164E3F]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#111817] text-base">Speed-to-Lead Escalation</h3>
              <p className="text-xs text-[#53605C] leading-relaxed">
                Set custom response SLAs (e.g. 5 minutes). If an assigned agent doesn't acknowledge, CHATR automatically re-routes to an available supervisor.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#DDE3DF] rounded-2xl space-y-3 shadow-sm">
              <div className="p-3 w-fit rounded-xl bg-[#EAEFEA] text-[#164E3F]">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#111817] text-base">Instant Web Calling</h3>
              <p className="text-xs text-[#53605C] leading-relaxed">
                Escalate any chat thread to a 1-tap browser HD voice call. Customers click a link to answer directly in their browser without downloading an app.
              </p>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="space-y-6 bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-[#111817]">
            <HelpCircle className="w-5 h-5 text-[#164E3F]" />
            <h2>Frequently Asked Questions About WhatsApp Team Inboxes</h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-5 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl space-y-2">
              <h3 className="font-semibold text-[#111817]">Can multiple agents use the same WhatsApp Business number simultaneously?</h3>
              <p className="text-[#53605C] leading-relaxed">
                Yes. Unlike the standard WhatsApp Business mobile app (which limits multi-device pairing to 4 devices), CHATR operates on the official Meta WhatsApp Business Cloud API. You can connect unlimited team agents simultaneously across desktop, tablet, and mobile.
              </p>
            </div>

            <div className="p-5 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl space-y-2">
              <h3 className="font-semibold text-[#111817]">Can I keep my existing WhatsApp phone number?</h3>
              <p className="text-[#53605C] leading-relaxed">
                Yes. You can migrate your existing phone number to the official Meta Cloud API through CHATR without losing your business identity or verified brand profile.
              </p>
            </div>

            <div className="p-5 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl space-y-2">
              <h3 className="font-semibold text-[#111817]">How much does CHATR WhatsApp Team Inbox cost?</h3>
              <p className="text-[#53605C] leading-relaxed">
                Plans start at ₹999/month for our SME Starter plan. Unlike legacy competitors that charge steep monthly fees per additional user seat, CHATR pricing includes multi-agent team access out of the box.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Conversion CTA Card */}
        <section className="p-8 md:p-12 rounded-2xl bg-[#EAEFEA] border border-[#D5E0D5] text-center space-y-6 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#111817]">
            Ready to Streamline Your Team's WhatsApp Conversations?
          </h2>
          <p className="text-xs sm:text-sm text-[#53605C] max-w-xl mx-auto">
            Get started in under 5 minutes with our official Meta Cloud API integration. No credit card required.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => {
                if (isAuthenticated) navigate('/desktop/home');
                else setAuthModalOpen(true);
              }}
              className="px-7 py-3.5 rounded-full bg-[#164E3F] hover:bg-[#123F33] text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
            >
              Start Free 14-Day Trial
            </button>
            <Link
              to="/pricing"
              className="px-6 py-3.5 rounded-full bg-white hover:bg-[#FAFBF9] text-[#111817] border border-[#DDE3DF] font-semibold text-sm shadow-sm transition-all"
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

export default WhatsAppTeamInboxPage;

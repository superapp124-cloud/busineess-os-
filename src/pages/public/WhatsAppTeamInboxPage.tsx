import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bot, MessageSquare, ArrowRight, ShieldCheck, CheckCircle2, PhoneCall, Zap, HelpCircle } from 'lucide-react';
import { InteractiveInboxSimulator } from '../../components/seo/InteractiveInboxSimulator';
import { Footer } from '../../components/Footer';

export const WhatsAppTeamInboxPage: React.FC = () => {
  useEffect(() => {
    document.title = 'WhatsApp Team Inbox — Shared Multi-Agent Inbox for Businesses | CHATR';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Connect multiple team members to one official WhatsApp Business number. Round-robin lead routing, collision protection, and automated SI intent triage starting at ₹999/mo.'
      );
    }

    const schema = {
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

    const breadcrumbs = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.chatrchat.in' },
        { '@type': 'ListItem', position: 2, name: 'Solutions', item: 'https://www.chatrchat.in/solutions' },
        { '@type': 'ListItem', position: 3, name: 'WhatsApp Team Inbox', item: 'https://www.chatrchat.in/whatsapp-team-inbox' }
      ]
    };

    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.text = JSON.stringify(schema);
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.text = JSON.stringify(breadcrumbs);
    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-indigo-400">CHATR</span>
            <span className="text-slate-400 font-normal text-sm">/ Solutions</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="text-xs md:text-sm text-slate-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link to="/wati-alternative" className="text-xs md:text-sm text-slate-300 hover:text-white transition-colors">
              WATI Alternative
            </Link>
            <Link
              to="/auth"
              className="text-xs md:text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-colors font-semibold"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        <section className="text-center space-y-6 pt-4">
          <nav className="flex items-center justify-center gap-2 text-xs text-indigo-400 font-mono" aria-label="Breadcrumb">
            <Link to="/" className="hover:underline text-slate-400">Home</Link>
            <span>/</span>
            <span className="text-slate-400">Solutions</span>
            <span>/</span>
            <span className="text-white font-semibold">WhatsApp Team Inbox</span>
          </nav>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            One WhatsApp Inbox for Your Entire Team
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stop passing one office phone around. Connect your sales, support, and recruitment teams to a single official WhatsApp Business number with automated intent triage and collision protection.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2 flex-wrap">
            <a
              href="#interactive-demo"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <span>Try Live Interactive Demo</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/pricing"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm rounded-xl transition-all"
            >
              View Plans from ₹999/mo
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Official Meta Cloud API
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-Agent Collision Lock
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sub-Minute Speed to Lead
            </span>
          </div>
        </section>

        {/* Above-The-Fold Interactive Experience */}
        <section id="interactive-demo" className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xs uppercase font-bold tracking-wider text-indigo-400 font-mono">
              Live Product Experience
            </h2>
            <p className="text-xl md:text-2xl font-bold text-white">
              See How Incoming WhatsApp Messages Flow Through CHATR
            </p>
          </div>
          <InteractiveInboxSimulator />
        </section>

        {/* The 4-Stage Operational Architecture */}
        <section className="space-y-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">How CHATR Team Inbox Operates</h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
              Every conversation is tracked from first inbound message to final resolution with zero lost leads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs md:text-sm">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center">1</div>
              <h3 className="font-bold text-white text-sm">Customer Inbound</h3>
              <p className="text-slate-400 leading-relaxed">
                Prospect messages your verified WhatsApp Business phone number. Delivery confirmed instantly via Meta Cloud webhook.
              </p>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center">2</div>
              <h3 className="font-bold text-white text-sm">SI Intent Triage</h3>
              <p className="text-slate-400 leading-relaxed">
                CHATR SI parses incoming text, determines intent (Sales, Support, Billing, or Recruitment), and tags urgency.
              </p>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center">3</div>
              <h3 className="font-bold text-white text-sm">Round-Robin Assignment</h3>
              <p className="text-slate-400 leading-relaxed">
                Conversation is assigned to the appropriate team member based on active availability, language, and workload.
              </p>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center">4</div>
              <h3 className="font-bold text-white text-sm">Resolution & History</h3>
              <p className="text-slate-400 leading-relaxed">
                Agent replies from desktop or mobile. Entire conversation history, notes, and CRM tags are archived securely.
              </p>
            </div>
          </div>
        </section>

        {/* Real Product Capabilities Grid */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">Built for Operational Discipline</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="p-2.5 w-fit rounded-lg bg-indigo-500/10 text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Collision Protection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                See in real-time when another team member is viewing or typing a response. Prevents duplicate replies and conflicting customer promises.
              </p>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="p-2.5 w-fit rounded-lg bg-emerald-500/10 text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Speed-to-Lead Escalation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Set custom response SLAs (e.g. 5 minutes). If an assigned agent doesn't acknowledge, CHATR automatically re-routes to an available supervisor.
              </p>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="p-2.5 w-fit rounded-lg bg-blue-500/10 text-blue-400">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Instant Web Calling</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Escalate any chat thread to a 1-tap browser HD voice or video call. Customers click a link to answer directly in their browser without downloading an app.
              </p>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="space-y-6 bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h2>Frequently Asked Questions About WhatsApp Team Inboxes</h2>
          </div>

          <div className="space-y-4 text-xs md:text-sm">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h3 className="font-semibold text-white">Can multiple agents use the same WhatsApp Business number simultaneously?</h3>
              <p className="text-slate-400 leading-relaxed">
                Yes. Unlike the standard WhatsApp Business mobile app (which limits multi-device pairing to 4 devices), CHATR operates on the official Meta WhatsApp Business Cloud API. You can connect 100+ agents simultaneously across desktop, tablet, and mobile.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h3 className="font-semibold text-white">Can I keep my existing WhatsApp number?</h3>
              <p className="text-slate-400 leading-relaxed">
                Yes. You can migrate your existing phone number to the official Meta Cloud API through CHATR without losing your business identity.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h3 className="font-semibold text-white">How much does CHATR WhatsApp Team Inbox cost?</h3>
              <p className="text-slate-400 leading-relaxed">
                Plans start at ₹999/month for our SME Starter plan. Unlike legacy providers that charge steep penalties per additional user seat, CHATR pricing includes multi-agent team access out of the box.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Conversion CTA Card */}
        <section className="p-8 md:p-12 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/30 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Ready to Streamline Your Business Conversations?
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto">
            Get started in 5 minutes with our official Meta Cloud API integration. No credit card required for trial.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/auth"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg"
            >
              Start Free 14-Day Trial
            </Link>
            <Link
              to="/pricing"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl transition-all"
            >
              Explore Commercial Pricing
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

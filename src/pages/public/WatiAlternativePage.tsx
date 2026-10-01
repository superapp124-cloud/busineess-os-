import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CheckCircle2, HelpCircle, PhoneCall, DollarSign, RefreshCw } from 'lucide-react';
import { WatiComparisonMatrix } from '../../components/seo/WatiComparisonMatrix';
import { InteractiveInboxSimulator } from '../../components/seo/InteractiveInboxSimulator';
import { Footer } from '../../components/Footer';

export const WatiAlternativePage: React.FC = () => {
  useEffect(() => {
    document.title = 'WATI Alternative — WhatsApp API, Shared Team Inbox & Calling | CHATR';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Compare CHATR and WATI for business messaging. Discover transparent pricing starting at ₹999/mo, multi-agent shared team inboxes, and built-in browser HD voice calling.'
      );
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'WATI Alternative: CHATR Communication OS',
      description: 'Factual capability and pricing comparison between WATI and CHATR for WhatsApp business communication.',
      url: 'https://www.chatrchat.in/wati-alternative',
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

    const breadcrumbs = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.chatrchat.in' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://www.chatrchat.in/comparison' },
        { '@type': 'ListItem', position: 3, name: 'WATI Alternative', item: 'https://www.chatrchat.in/wati-alternative' }
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
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-indigo-400">CHATR</span>
            <span className="text-slate-400 font-normal text-sm">/ Comparison</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/whatsapp-team-inbox" className="text-xs md:text-sm text-slate-300 hover:text-white transition-colors">
              Team Inbox
            </Link>
            <Link to="/pricing" className="text-xs md:text-sm text-slate-300 hover:text-white transition-colors">
              Pricing
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
            <span className="text-slate-400">Comparisons</span>
            <span>/</span>
            <span className="text-white font-semibold">WATI Alternative</span>
          </nav>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            A WATI Alternative for Teams That Need More Than Just Messaging
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Looking for a transparent alternative to WATI? Compare official Meta WhatsApp API plans starting at ₹999/month, multi-agent shared inboxes, built-in browser calling, and autonomous SI triage with zero per-user seat markups.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2 flex-wrap">
            <a
              href="#comparison-matrix"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <span>View Factual Comparison</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#interactive-demo"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm rounded-xl transition-all"
            >
              Try Interactive Simulator
            </a>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Plans from ₹999/mo
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Per-Seat User Markups
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1-Click WhatsApp Number Porting
            </span>
          </div>
        </section>

        {/* Factual Comparison Matrix Section */}
        <section id="comparison-matrix" className="space-y-4">
          <WatiComparisonMatrix />
        </section>

        {/* Product Simulator Experience */}
        <section id="interactive-demo" className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xs uppercase font-bold tracking-wider text-indigo-400 font-mono">
              Interactive Software Experience
            </h2>
            <p className="text-xl md:text-2xl font-bold text-white">
              Experience the CHATR Team Inbox Workflow
            </p>
          </div>
          <InteractiveInboxSimulator />
        </section>

        {/* Honest Fit Analysis: When CHATR vs When WATI */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">Which Solution Fits Your Business?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3>When CHATR May Be the Better Fit</h3>
              </div>
              <ul className="space-y-2.5 text-xs md:text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Predictable Pricing:</strong> You want a straightforward monthly plan (starting at ₹999/mo) without escalating per-user charges as your team expands.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Integrated Voice & Video Calling:</strong> Your business needs to escalate WhatsApp chats into instant browser HD calls without forcing clients to install extra apps.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>On-Device Mobile Experience:</strong> You need full Android carrier-grade calling integration with native lock-screen caller identification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Autonomous SI Workflow Triage:</strong> You want intelligence that parses complex inquiries and categorizes leads by intent rather than rigid keyword menus.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-slate-400" />
                <h3>When WATI May Be the Better Fit</h3>
              </div>
              <ul className="space-y-2.5 text-xs md:text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span><strong>Established Global Footprint:</strong> Your team is already comfortable with WATI's existing ecosystem and prefers an established legacy brand.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span><strong>Text-Only Requirement:</strong> Your business operations have zero requirement for voice or WebRTC calling and focus exclusively on text broadcasts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span><strong>Specific CRM Marketplace Integrations:</strong> You rely on niche third-party marketplace connectors specifically certified for WATI's webhook format.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Seamless Migration Guide */}
        <section className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <RefreshCw className="w-5 h-5 text-indigo-400" />
            <h2>Migrating from WATI to CHATR with Zero Downtime</h2>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Because both CHATR and WATI operate on the official Meta WhatsApp Business Cloud API architecture, switching requires no disruption to your verified number:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-indigo-400 font-bold font-mono">Step 1</span>
              <h3 className="font-semibold text-white">Keep Your Number</h3>
              <p className="text-slate-400 leading-relaxed">
                Log into your Meta Business Manager. Your phone number, verification status, and green checkmark remain intact.
              </p>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-indigo-400 font-bold font-mono">Step 2</span>
              <h3 className="font-semibold text-white">Connect CHATR Endpoint</h3>
              <p className="text-slate-400 leading-relaxed">
                Connect your WABA ID to CHATR using our 1-click Meta OAuth onboarding flow in less than 5 minutes.
              </p>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-indigo-400 font-bold font-mono">Step 3</span>
              <h3 className="font-semibold text-white">Invite Your Team</h3>
              <p className="text-slate-400 leading-relaxed">
                Invite your support and sales team members to your shared dashboard and start handling conversations.
              </p>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="space-y-6 bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h2>Frequently Asked Questions About Switching from WATI</h2>
          </div>

          <div className="space-y-4 text-xs md:text-sm">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h3 className="font-semibold text-white">Will I lose my WhatsApp green tick verification if I switch?</h3>
              <p className="text-slate-400 leading-relaxed">
                No. Official Meta Official Business Account (green tick) status is tied directly to your Facebook Business Manager and phone number, not to any third-party software vendor. Switching to CHATR preserves your verification status.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h3 className="font-semibold text-white">How does CHATR pricing compare to WATI?</h3>
              <p className="text-slate-400 leading-relaxed">
                WATI plans start around ~$49–$59/month (approx ₹4,000–₹5,000/month) and charge extra for additional agent seats. CHATR's SME Starter plan starts at ₹999/month and includes multi-agent team access without steep per-seat fees.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Conversion Card */}
        <section className="p-8 md:p-12 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/30 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Evaluate CHATR for Your Team Today
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto">
            Experience transparent pricing, shared team inboxes, and integrated browser calling. Try CHATR free for 14 days.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/auth"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg"
            >
              Start 14-Day Free Trial
            </Link>
            <Link
              to="/pricing"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl transition-all"
            >
              View Full Pricing Details
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

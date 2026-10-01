import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, CheckCircle2, HelpCircle, 
  PhoneCall, DollarSign, RefreshCw, Zap, Users, MessageSquare 
} from 'lucide-react';
import { InteractiveInboxSimulator } from '../../components/seo/InteractiveInboxSimulator';
import { Footer } from '../../components/Footer';

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
    capability: 'SI Candidate & Lead Screening',
    chatr: {
      supported: true,
      detail: 'Automated conversational qualification parsing resumes, budgets, and availability'
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
      detail: 'Interactive sandbox to test candidate qualification and team routing live in browser'
    },
    aisensy: {
      supported: false,
      detail: 'Requires sales demo or live WhatsApp setup before product evaluation'
    }
  }
];

export const AisensyAlternativePage: React.FC = () => {
  useEffect(() => {
    document.title = 'AiSensy Alternative — WhatsApp API, Shared Team Inbox & Calling | CHATR';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Compare CHATR and AiSensy for business WhatsApp communication. Transparent pricing from ₹999/mo, multi-agent shared team inboxes, zero markup on Meta fees, and browser WebRTC calling.'
      );
    }

    const schema = {
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

    const breadcrumbs = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.chatrchat.in' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://www.chatrchat.in/comparison' },
        { '@type': 'ListItem', position: 3, name: 'AiSensy Alternative', item: 'https://www.chatrchat.in/aisensy-alternative' }
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
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-base">
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-xs font-black tracking-wider">CHATR</span>
            <span className="text-slate-400 font-medium text-xs">/ AiSensy Alternative</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/pricing" className="text-xs text-slate-400 hover:text-white transition-colors">Pricing</Link>
            <Link to="/whatsapp-team-inbox" className="text-xs text-slate-400 hover:text-white transition-colors">Team Inbox</Link>
            <Link
              to="/auth"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/30"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Factual Platform Comparison · Updated 2026</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            The Modern <span className="text-indigo-400">AiSensy Alternative</span> for WhatsApp & Calling
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Looking for an AiSensy alternative without rigid user tier limits or marked-up conversation fees? CHATR unifies official Meta Cloud WhatsApp messaging, multi-agent shared inboxes, and browser voice calling.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30"
            >
              Start Free with CHATR <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#comparison"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs transition-colors"
            >
              View Comparison Matrix
            </a>
          </div>
        </section>

        {/* Live Simulator Preview */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">Experience CHATR Team Inbox Live</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Simulate real-time conversation triage, SI candidate qualification, and multi-agent assignment below.
            </p>
          </div>
          <InteractiveInboxSimulator />
        </section>

        {/* Comparison Matrix Section */}
        <section id="comparison" className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">CHATR vs AiSensy: Side-by-Side Comparison</h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Based on verified documentation and standard commercial specifications.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-3.5 pl-6 w-1/3">Capability</th>
                    <th className="py-3.5 px-4 w-1/3 text-indigo-400">CHATR Business OS</th>
                    <th className="py-3.5 pr-6 w-1/3 text-slate-400">AiSensy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {AISENSY_COMPARISON_DATA.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-4 pl-6 space-y-0.5">
                        <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
                          {row.category}
                        </span>
                        <span className="font-bold text-white text-xs block">{row.capability}</span>
                      </td>
                      <td className="py-4 px-4 space-y-1 bg-indigo-950/10">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Included</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-normal">{row.chatr.detail}</p>
                      </td>
                      <td className="py-4 pr-6 space-y-1">
                        <div className={`flex items-center gap-1.5 font-bold text-xs ${row.aisensy.supported ? 'text-slate-300' : 'text-slate-500'}`}>
                          {row.aisensy.supported ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <span className="w-4 h-4 text-center leading-none text-rose-500 font-bold">✕</span>}
                          <span>{row.aisensy.supported ? 'Supported' : 'Tier Limited / Not Included'}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">{row.aisensy.detail}</p>
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">0% Markup on Meta Fees</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pay Meta conversation fees directly at standard cost. CHATR does not levy hidden per-message markups or conversation penalties.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">WebRTC Voice Calling Included</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Why use one app for WhatsApp and another for customer calls? CHATR lets your team dial and receive crystal-clear HD voice calls right in their browser.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Automated Candidate & Lead Screening</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Filter incoming messages with automated qualification flows that capture candidate criteria, parse documents, and schedule interviews.
            </p>
          </div>
        </section>

        {/* CTA Card */}
        <section className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Upgrade from AiSensy?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Start on the ₹999/mo SME Starter plan with full WhatsApp Business API support, shared team inbox, and browser calling.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors"
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

export default AisensyAlternativePage;

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowRight, 
  Layers, 
  Zap, 
  Users, 
  MessageSquare, 
  Database,
  CheckCircle2,
  XCircle,
  Building2,
  Briefcase
} from 'lucide-react';

const AIBusinessOSStartupsPage: React.FC = () => {
  useEffect(() => {
    // Pure DOM Head Management
    document.title = 'AI Business OS for Startups — CHATR | Replace Fragmented Tools with One System';
    
    // Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'CHATR gives startups a single AI-powered operating system for sales, hiring, communications, and operations. Stop managing 12 different tools. Run everything in one place.');

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://chatrchat.in/ai-business-os-for-startups');

    // JSON-LD Scripts
    const webAppSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "CHATR Business OS",
      "url": "https://chatrchat.in",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web"
    };

    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "CHATR",
      "url": "https://chatrchat.in",
      "sameAs": [
        "https://chatr.chat",
        "https://talentxcel.in"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is an AI business operating system?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "An AI business operating system is a unified platform that connects your company's core functions—communications, talent acquisition, sales, and knowledge management—into a single interface, augmented by artificial intelligence to automate routine tasks and provide intelligent insights."
          }
        },
        {
          "@type": "Question",
          "name": "How is CHATR Business OS different from other startup tools?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Most startup tools solve one specific problem, leading to software bloat, context switching, and fragmented data. CHATR Business OS is designed from the ground up as a unified layer where your communications, applicant tracking, and customer data inherently talk to each other without complex integrations."
          }
        },
        {
          "@type": "Question",
          "name": "What does CHATR replace for startups?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CHATR aims to consolidate point solutions. It provides alternatives to standalone unified inboxes, basic applicant tracking systems (ATS), standalone WhatsApp marketing tools, and basic CRM systems, allowing startups to run leaner operations."
          }
        },
        {
          "@type": "Question",
          "name": "How does CHATR handle hiring and recruitment for startups?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CHATR integrates talent acquisition directly into your operational flow. It features automated WhatsApp candidate screening, resume parsing, and interview scheduling, keeping recruitment data centralized rather than siloed in a separate HR tool."
          }
        },
        {
          "@type": "Question",
          "name": "How do I get started with CHATR Business OS?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can start by creating an account and connecting your primary communication channels (like WhatsApp). From there, you can configure your AI agents for specific tasks like customer support or candidate screening, gradually moving more of your operations into the platform."
          }
        }
      ]
    };

    const scriptApp = document.createElement('script');
    scriptApp.type = 'application/ld+json';
    scriptApp.id = 'schema-webapp';
    scriptApp.text = JSON.stringify(webAppSchema);
    document.head.appendChild(scriptApp);

    const scriptOrg = document.createElement('script');
    scriptOrg.type = 'application/ld+json';
    scriptOrg.id = 'schema-org';
    scriptOrg.text = JSON.stringify(orgSchema);
    document.head.appendChild(scriptOrg);

    const scriptFaq = document.createElement('script');
    scriptFaq.type = 'application/ld+json';
    scriptFaq.id = 'schema-faq';
    scriptFaq.text = JSON.stringify(faqSchema);
    document.head.appendChild(scriptFaq);

    // Visit tracking
    const trackVisit = async () => {
      try {
        await supabase.from('cc_logs').insert({
          domain: 'chatrchat.in',
          path: '/ai-business-os-for-startups',
          event_type: 'page_view'
        });
      } catch (e) {
        console.error('Failed to log visit', e);
      }
    };
    trackVisit();

    return () => {
      document.head.removeChild(scriptApp);
      document.head.removeChild(scriptOrg);
      document.head.removeChild(scriptFaq);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-lg">C</div>
            <span className="font-semibold text-xl tracking-tight">CHATR</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/business-os" className="hover:text-white transition-colors">Business OS</Link>
            <Link to="/ai-agents-for-business" className="hover:text-white transition-colors">AI Agents</Link>
            <Link to="/auth" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors">
              Start Your Business OS
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
            <SparklesIcon className="w-4 h-4" />
            Designed for scaling startups
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            AI Business Operating System for Startups <br />
            <span className="text-indigo-400">— Run Your Company on Intelligence</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Founders are juggling 12 tools—Slack, Notion, HubSpot, WhatsApp, spreadsheets, Calendly. Stop the madness. CHATR gives startups a single AI-powered operating system for sales, hiring, communications, and operations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth" className="px-8 py-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 transition-all">
              Start Your Business OS <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#problem" className="px-8 py-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all">
              Explore the Problem
            </a>
          </div>
        </section>

        {/* The Fragmented Stack Problem */}
        <section id="problem" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">The Fragmented Startup Stack Problem</h2>
              <p className="text-slate-400 mb-6 text-lg">
                As a startup grows, so does its tool stack. You start with email, add a CRM, realize you need an ATS for hiring, set up a shared inbox, and suddenly your team is spending 20% of their day just moving data between tabs.
              </p>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Context Switching:</strong> Employees lose focus toggling between specialized apps.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Data Silos:</strong> Customer conversations live in WhatsApp, hiring data in an ATS, and sales context in a CRM.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Bloated Costs:</strong> Paying $20/user/month across 10 different SaaS products drains startup runway.</span>
                </li>
              </ul>
            </div>
            <div className="bg-slate-900 rounded-2xl p-8 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="relative z-10 grid grid-cols-2 gap-4 opacity-50">
                <div className="bg-slate-800 p-4 rounded-lg text-center font-mono text-sm">WhatsApp API</div>
                <div className="bg-slate-800 p-4 rounded-lg text-center font-mono text-sm">CRM System</div>
                <div className="bg-slate-800 p-4 rounded-lg text-center font-mono text-sm">Helpdesk</div>
                <div className="bg-slate-800 p-4 rounded-lg text-center font-mono text-sm">ATS Platform</div>
                <div className="bg-slate-800 p-4 rounded-lg text-center font-mono text-sm">AI Chatbots</div>
                <div className="bg-slate-800 p-4 rounded-lg text-center font-mono text-sm">Knowledge Base</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent flex items-end justify-center pb-8">
                <div className="text-center">
                  <span className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full font-medium text-sm border border-red-500/20">The Messy Middleware Era is Over</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What is a Business OS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5 bg-slate-900/50">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">What a Business OS Actually Means</h2>
            <p className="text-slate-400 text-lg">
              A Business Operating System isn't just a dashboard. It's the underlying infrastructure where your data, communications, and workflows converge naturally, powered by AI that understands your business context.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-950 p-8 rounded-xl border border-white/5">
              <Database className="w-10 h-10 text-indigo-400 mb-6" />
              <h3 className="text-xl font-semibold mb-3">Unified Data Layer</h3>
              <p className="text-slate-400">One source of truth for customers, candidates, and team knowledge. No more syncing errors or missing context.</p>
            </div>
            <div className="bg-slate-950 p-8 rounded-xl border border-white/5">
              <Zap className="w-10 h-10 text-indigo-400 mb-6" />
              <h3 className="text-xl font-semibold mb-3">AI-Native Architecture</h3>
              <p className="text-slate-400">Not an AI wrapper. Intelligence is baked into the OS to summarize threads, route queries, and draft responses automatically.</p>
            </div>
            <div className="bg-slate-950 p-8 rounded-xl border border-white/5">
              <Layers className="w-10 h-10 text-indigo-400 mb-6" />
              <h3 className="text-xl font-semibold mb-3">Modular Capabilities</h3>
              <p className="text-slate-400">Turn on specific workflows for sales, support, or hiring as you scale, all within the same familiar interface.</p>
            </div>
          </div>
        </section>

        {/* CHATR OS Capability Pillars */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">CHATR OS Capability Pillars</h2>
            <p className="text-slate-400 text-lg max-w-2xl">Everything a growing startup needs to operate efficiently, centralized in one intelligent system.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Pillar 1 */}
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Communications</h3>
              <p className="text-slate-400 mb-6">Centralize external communication across channels. Ensure your team never misses a message.</p>
              <Link to="/chatr/universal-inbox-ai" className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1">
                Explore Universal Inbox AI <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/10 hover:border-violet-500/50 transition-colors">
              <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Hiring & Talent</h3>
              <p className="text-slate-400 mb-6">Streamline recruitment with intelligent parsing and automated candidate outreach via preferred channels.</p>
              <Link to="/chatr/whatsapp-candidate-screening" className="text-violet-400 hover:text-violet-300 font-medium inline-flex items-center gap-1">
                Explore WhatsApp Screening <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Revenue & Sales</h3>
              <p className="text-slate-400 mb-6">Manage leads, track engagement, and automate follow-ups without leaving your workspace.</p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Knowledge Management</h3>
              <p className="text-slate-400 mb-6">Give your AI agents secure access to your internal docs to answer team and customer questions instantly.</p>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
          <h2 className="text-3xl font-bold mb-10 text-center">Traditional Stack vs CHATR Business OS</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-6 font-semibold text-slate-300">Capability</th>
                  <th className="py-4 px-6 font-semibold text-slate-400 bg-slate-900/50">Traditional Stack</th>
                  <th className="py-4 px-6 font-semibold text-indigo-400 bg-indigo-950/20">CHATR Business OS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-4 px-6 font-medium">Customer Support</td>
                  <td className="py-4 px-6 text-slate-400 bg-slate-900/50">Standalone Helpdesk</td>
                  <td className="py-4 px-6 text-slate-200 bg-indigo-950/20 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400"/> Integrated AI Inbox</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Hiring & ATS</td>
                  <td className="py-4 px-6 text-slate-400 bg-slate-900/50">Separate ATS Platform</td>
                  <td className="py-4 px-6 text-slate-200 bg-indigo-950/20 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400"/> Built-in Talent Modules</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Data Sync</td>
                  <td className="py-4 px-6 text-slate-400 bg-slate-900/50">Zapier / Custom APIs</td>
                  <td className="py-4 px-6 text-slate-200 bg-indigo-950/20 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400"/> Native Shared Data Layer</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">AI Integration</td>
                  <td className="py-4 px-6 text-slate-400 bg-slate-900/50">Bolted-on AI wrappers</td>
                  <td className="py-4 px-6 text-slate-200 bg-indigo-950/20 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400"/> AI-Native Foundation</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Cost per User</td>
                  <td className="py-4 px-6 text-slate-400 bg-slate-900/50">Compounded (High)</td>
                  <td className="py-4 px-6 text-slate-200 bg-indigo-950/20 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400"/> Unified (Efficient)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Target Audience */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5 bg-slate-900/50">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Who is CHATR built for?</h2>
            <p className="text-slate-400">Designed for teams that need to move fast without the friction of enterprise legacy software.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-slate-950 p-6 rounded-xl border border-white/5 flex items-start gap-4">
              <Building2 className="w-8 h-8 text-indigo-400 shrink-0" />
              <div>
                <h4 className="font-semibold mb-2">Early-Stage Startups</h4>
                <p className="text-sm text-slate-400">Set the right foundation from day one. Avoid technical debt in your operational stack.</p>
              </div>
            </div>
            <div className="bg-slate-950 p-6 rounded-xl border border-white/5 flex items-start gap-4">
              <Briefcase className="w-8 h-8 text-indigo-400 shrink-0" />
              <div>
                <h4 className="font-semibold mb-2">Bootstrapped Founders</h4>
                <p className="text-sm text-slate-400">Maximize capital efficiency by consolidating paid SaaS subscriptions.</p>
              </div>
            </div>
            <div className="bg-slate-950 p-6 rounded-xl border border-white/5 flex items-start gap-4">
              <Users className="w-8 h-8 text-indigo-400 shrink-0" />
              <div>
                <h4 className="font-semibold mb-2">Scaling SMEs</h4>
                <p className="text-sm text-slate-400">Perfect for teams up to 50 people who need robust processes without the enterprise bloat.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
          <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-lg border border-white/5">
              <h3 className="font-semibold text-lg mb-2">What is an AI business operating system?</h3>
              <p className="text-slate-400">An AI business operating system is a unified platform that connects your company's core functions—communications, talent acquisition, sales, and knowledge management—into a single interface, augmented by artificial intelligence to automate routine tasks and provide intelligent insights.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-lg border border-white/5">
              <h3 className="font-semibold text-lg mb-2">How is CHATR Business OS different from other startup tools?</h3>
              <p className="text-slate-400">Most startup tools solve one specific problem, leading to software bloat, context switching, and fragmented data. CHATR Business OS is designed from the ground up as a unified layer where your communications, applicant tracking, and customer data inherently talk to each other without complex integrations.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-lg border border-white/5">
              <h3 className="font-semibold text-lg mb-2">What does CHATR replace for startups?</h3>
              <p className="text-slate-400">CHATR aims to consolidate point solutions. It provides alternatives to standalone unified inboxes, basic applicant tracking systems (ATS), standalone WhatsApp marketing tools, and basic CRM systems, allowing startups to run leaner operations.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-lg border border-white/5">
              <h3 className="font-semibold text-lg mb-2">How does CHATR handle hiring and recruitment for startups?</h3>
              <p className="text-slate-400">CHATR integrates talent acquisition directly into your operational flow. It features automated WhatsApp candidate screening, resume parsing, and interview scheduling, keeping recruitment data centralized rather than siloed in a separate HR tool.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-lg border border-white/5">
              <h3 className="font-semibold text-lg mb-2">How do I get started with CHATR Business OS?</h3>
              <p className="text-slate-400">You can start by creating an account and connecting your primary communication channels (like WhatsApp). From there, you can configure your AI agents for specific tasks like customer support or candidate screening, gradually moving more of your operations into the platform.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer / Author info */}
      <footer className="border-t border-white/10 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm">
            Written by CHATR Product Team • August 2026
          </div>
          <div className="text-sm text-slate-500">
            &copy; 2026 CHATR. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Simple icon for inline use
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

export { AIBusinessOSStartupsPage };
export default AIBusinessOSStartupsPage;

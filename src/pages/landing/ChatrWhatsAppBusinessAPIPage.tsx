import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, CheckCircle2, ShieldCheck, Zap, ArrowRight, Bot, Users, Globe2, Sparkles, HelpCircle } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

export const ChatrWhatsAppBusinessAPIPage: React.FC = () => {
  useEffect(() => {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', 'https://www.chatrchat.in/chatr/whatsapp-business-api');

    const schema = document.createElement('script');
    schema.id = 'whatsapp-api-page-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'CHATR WhatsApp Business API Platform',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, iOS, Android',
      url: 'https://www.chatrchat.in/chatr/whatsapp-business-api',
      description: 'Official WhatsApp Business API platform for multi-agent team inbox, automated lead distribution, candidate screening, and AI chat automation for Indian businesses.',
      publisher: {
        '@type': 'Organization',
        name: 'CHATR Communication OS',
        url: 'https://www.chatrchat.in'
      }
    });
    if (!document.getElementById('whatsapp-api-page-schema')) document.head.appendChild(schema);
    return () => { const s = document.getElementById('whatsapp-api-page-schema'); if (s) s.remove(); };
  }, []);

  return (
    <>
      <SEOHead
        title="WhatsApp Business API Platform — CHATR Communication OS | Multi-Agent Team Inbox"
        description="Connect your WhatsApp Business API to CHATR. Enable shared team inboxes, automated lead assignment, AI chat agents, and candidate screening without green-tick complexity."
        canonical="https://www.chatrchat.in/chatr/whatsapp-business-api"
      />

      <div className="min-h-screen bg-slate-950 text-white font-sans">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="text-indigo-400">CHATR</span>
              <span className="text-slate-400 font-normal text-sm">/ WhatsApp Business API</span>
            </Link>
            <Link to="/auth" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
              Get Started Free
            </Link>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-16 space-y-16">
          {/* Hero Section */}
          <section className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <MessageSquare className="w-4 h-4" />
              <span>OFFICIAL WHATSAPP BUSINESS API PLATFORM</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Turn WhatsApp Into a <br /><span className="text-indigo-400">Multi-Agent Business Machine</span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed">
              Stop managing customer and candidate inquiries on individual phones. CHATR connects your official WhatsApp Business API into a single shared inbox for sales, recruiting, and operations.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link to="/auth" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30">
                Connect WhatsApp API <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/chatr/universal-inbox-ai" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold px-6 py-3 rounded-xl transition-all">
                Explore Universal Inbox
              </Link>
            </div>
          </section>

          {/* Key Capability Cards */}
          <section className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-lg">Shared Team Inbox</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Allow multiple agents, recruiters, and managers to send and receive WhatsApp messages from one phone number simultaneously with clear owner assignment.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-lg">AI Triage & Qualification</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Automate first-line candidate qualification and customer lead routing. AI agents ask screening questions and hand off qualified leads to your team.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-lg">Lead Response SLA</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Prevent unanswered leads with automated assignment rules and response latency tracking. Cut first-reply times from hours to under 60 seconds.
              </p>
            </div>
          </section>

          {/* Operational Workflow Guide */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">How It Works</span>
              <h2 className="text-2xl font-bold text-white">4 Steps to Deploy CHATR WhatsApp API</h2>
            </div>

            <div className="grid md:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-xs font-extrabold text-indigo-400 font-mono">01. CONNECT</span>
                <h4 className="font-bold text-white text-sm">Link Phone Number</h4>
                <p className="text-slate-400 text-xs">Connect your existing WhatsApp Business number or request a new official API line.</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-xs font-extrabold text-indigo-400 font-mono">02. TEAM</span>
                <h4 className="font-bold text-white text-sm">Invite Teammates</h4>
                <p className="text-slate-400 text-xs">Add sales reps, recruiters, or support agents with role-based inbox permissions.</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-xs font-extrabold text-indigo-400 font-mono">03. AUTOMATE</span>
                <h4 className="font-bold text-white text-sm">Set Up AI Agents</h4>
                <p className="text-slate-400 text-xs">Configure auto-responders, lead assignment rules, and candidate pre-screeners.</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-xs font-extrabold text-indigo-400 font-mono">04. SCALE</span>
                <h4 className="font-bold text-white text-sm">Track & Convert</h4>
                <p className="text-slate-400 text-xs">Monitor response speeds, conversation status, and conversion analytics in real time.</p>
              </div>
            </div>
          </section>

          {/* Related Links & Cross Navigation */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
            <h3 className="font-bold text-white text-lg">Explore CHATR Platform Solutions</h3>
            <div className="grid md:grid-cols-2 gap-4 pt-2 text-xs">
              <Link to="/chatr/whatsapp-candidate-screening" className="block bg-slate-950 border border-slate-800 p-4 rounded-xl hover:border-indigo-500/40 transition-colors space-y-1">
                <div className="font-semibold text-white">WhatsApp Candidate Screening →</div>
                <div className="text-slate-400">Automate applicant shortlisting on WhatsApp for recruitment agencies.</div>
              </Link>
              <Link to="/talentxcel/ai-resume-parser" className="block bg-slate-950 border border-slate-800 p-4 rounded-xl hover:border-indigo-500/40 transition-colors space-y-1">
                <div className="font-semibold text-white">AI Resume Parser →</div>
                <div className="text-slate-400">Extract skills, experience, and candidate profiles from PDFs in seconds.</div>
              </Link>
            </div>
          </section>

          {/* CTA Footer */}
          <section className="text-center bg-gradient-to-r from-indigo-900/40 via-slate-900 to-indigo-900/40 border border-indigo-500/30 rounded-2xl p-10 space-y-4">
            <h2 className="text-2xl font-bold text-white">Ready to connect your WhatsApp Business API?</h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">Start managing customer and candidate conversations in one shared inbox with zero setup hassle.</p>
            <Link to="/auth" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        </main>
      </div>
    </>
  );
};

export default ChatrWhatsAppBusinessAPIPage;

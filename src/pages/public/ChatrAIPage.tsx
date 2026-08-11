import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Cpu, Zap, Shield, FileText, CheckCircle2, ChevronDown, Sparkles, MessageSquare, PhoneCall, Layers, UserCheck } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

export const ChatrAIPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const capabilities = [
    {
      icon: MessageSquare,
      title: 'AI Message Triage & Smart Routing',
      description: 'Automatically analyzes incoming customer inquiries across WhatsApp, email, and web chat. Detects intent, tags urgency, and routes threads to the right team before agents open them.',
      link: '/chatr/ai-message-triage-routing',
      badge: 'Intent Intelligence'
    },
    {
      icon: FileText,
      title: 'AI Conversation Summarization',
      description: 'Generates instant 3-bullet executive summaries for lengthy multi-turn WhatsApp and candidate threads during agent transfers, eliminating 10-minute catch-up reads.',
      link: '/chatr/ai-conversation-summarization',
      badge: 'Team Productivity'
    },
    {
      icon: UserCheck,
      title: 'AI Candidate Screening',
      description: 'Conducts automated WhatsApp pre-screening questionnaires for recruiters, parsing candidate qualifications, experience, and availability at high applicant volumes.',
      link: '/talentxcel/automate-candidate-screening',
      badge: 'Recruitment OS'
    },
    {
      icon: Zap,
      title: 'AI Auto-Responder & Lead Capture',
      description: 'Enforces the 5-minute lead response rule with instant intelligent acknowledgments and qualification prompts, preventing leads from going cold after hours.',
      link: '/chatr/ai-auto-responder-lead-capture',
      badge: 'SLA Engine'
    },
    {
      icon: PhoneCall,
      title: 'AI Phone Agent & Voice Calling',
      description: 'Deploys conversational voice assistants capable of answering inbound phone inquiries, conducting initial candidate calls, and logging transcripts into your workspace.',
      link: '/chatr/ai-phone-agent-calling',
      badge: 'Voice Automation'
    },
    {
      icon: Shield,
      title: 'Local & Private Model Execution',
      description: 'Offers local on-device inference for enterprise privacy needs, ensuring confidential customer messages and health data remain on local hardware.',
      link: '/chatr/ai-messaging-for-business',
      badge: 'Privacy Core'
    }
  ];

  const faqs = [
    {
      q: 'What is CHATR AI?',
      a: 'CHATR AI is an integrated intelligence layer designed specifically for business messaging and candidate screening. It automates message classification, drafts contextual replies, conducts initial candidate screening, and summarizes long threads across WhatsApp, email, and web chat.'
    },
    {
      q: 'How does CHATR AI handle customer data privacy?',
      a: 'CHATR AI operates under strict data isolation protocols. Customer conversations are never used to train global public models. Furthermore, CHATR offers local private model execution for organizations requiring complete data sovereignty.'
    },
    {
      q: 'Can CHATR AI work with WhatsApp Business API?',
      a: 'Yes. CHATR AI integrates natively with WhatsApp Business API to provide automated triage, instant greetings, qualification workflows, and thread summaries directly inside your team inbox.'
    },
    {
      q: 'Does CHATR AI replace human customer support or recruiter teams?',
      a: 'No. CHATR AI acts as a smart assistant (human-in-the-loop). It handles repetitive first-touch triage, qualification, and administrative summaries so human agents and recruiters can focus on high-value conversations and hiring decisions.'
    }
  ];

  return (
    <>
      <SEOHead
        title="CHATR AI — Intelligent Business Messaging & Workflow Automation"
        description="Discover CHATR AI: the intelligent communication layer for WhatsApp, email, and candidate screening. Automate message triage, thread summaries, lead capture, and voice agents."
      />
      <div className="min-h-screen bg-slate-950 text-white font-sans">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-indigo-400 font-extrabold text-lg tracking-tight">
              <Sparkles className="w-5 h-5 text-indigo-400" /> CHATR AI
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/pricing" className="text-xs text-slate-300 hover:text-white transition-colors font-medium">Pricing</Link>
              <Link to="/auth" id="chatr-ai-header-cta" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                Try CHATR Free
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
          {/* Hero Section */}
          <section className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 px-4 py-1.5 rounded-full text-indigo-400 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" /> Platform Intelligence Layer
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              AI Built for Business Messaging & Candidate Workflows
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              Eliminate response delays, automate intent triage, and streamline customer and recruiter conversations across WhatsApp, email, and live channels.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link to="/auth" id="chatr-ai-hero-primary" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm inline-flex items-center gap-2">
                Start Free AI Workspace <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/pricing" id="chatr-ai-hero-pricing" className="border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                View Commercial Plans
              </Link>
            </div>
          </section>

          {/* 6 Core Capabilities Grid */}
          <section className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">6 Core AI Capabilities</h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                Purpose-built AI tools integrated directly into your CHATR workspace.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capabilities.map((cap, i) => (
                <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <cap.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                        {cap.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white leading-snug">{cap.title}</h3>
                    <p className="text-slate-300 text-xs leading-relaxed">{cap.description}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-800/80">
                    <Link to={cap.link} className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-semibold hover:text-indigo-300">
                      Learn More <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Verification & E-E-A-T Evidence Card */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3 text-xs text-slate-400">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Telemetry & Model Evaluation Principles</span>
            </div>
            <p>
              <strong className="text-slate-300">Human-in-the-Loop Architecture:</strong> CHATR AI prioritizes assist-mode drafting and intent classification. Final high-concurrency actions remain under supervisor visibility.
            </p>
            <p>
              <strong className="text-slate-300">Editorial Policy:</strong> Evaluated under our <Link to="/editorial-policy" className="text-indigo-400 underline font-semibold">Editorial & Research Guidelines</Link>.
            </p>
          </section>

          {/* FAQ Section */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white">Frequently Asked Questions About CHATR AI</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors"
                  >
                    <span className="font-semibold text-sm text-slate-200">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 bg-slate-900/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Conversion Card */}
          <section className="bg-gradient-to-r from-indigo-900/40 via-indigo-800/20 to-indigo-900/40 border border-indigo-500/30 rounded-2xl p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Deploy CHATR AI in Your Workspace Today</h2>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Automate message triage, eliminate 5-minute lead response bottlenecks, and screening candidate volumes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link to="/auth" id="chatr-ai-footer-cta" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm inline-flex items-center gap-2">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/pricing" className="border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                View Commercial Plans
              </Link>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default ChatrAIPage;

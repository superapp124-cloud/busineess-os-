import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Bot, Cpu, Zap, Shield, FileText, CheckCircle2, 
  ChevronDown, Sparkles, MessageSquare, PhoneCall, Layers, UserCheck 
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { supabase } from '@/integrations/supabase/client';

export const ChatrAIPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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

  const capabilities = [
    {
      icon: MessageSquare,
      title: 'SI Message Triage & Smart Routing',
      description: 'Automatically analyzes incoming customer inquiries across WhatsApp, email, and web chat. Detects intent, tags urgency, and routes threads to the right team before agents open them.',
      link: '/chatr/ai-message-triage-routing',
      badge: 'Intent Intelligence'
    },
    {
      icon: FileText,
      title: 'SI Conversation Summarization',
      description: 'Generates instant 3-bullet executive summaries for lengthy multi-turn WhatsApp and candidate threads during agent transfers, eliminating 10-minute catch-up reads.',
      link: '/chatr/ai-conversation-summarization',
      badge: 'Team Productivity'
    },
    {
      icon: UserCheck,
      title: 'SI Candidate Screening',
      description: 'Conducts automated WhatsApp pre-screening questionnaires for recruiters, parsing candidate qualifications, experience, and availability at high applicant volumes.',
      link: '/talentxcel/automate-candidate-screening',
      badge: 'Recruitment OS'
    },
    {
      icon: Zap,
      title: 'SI Auto-Responder & Lead Capture',
      description: 'Enforces the 5-minute lead response rule with instant intelligent acknowledgments and qualification prompts, preventing leads from going cold after hours.',
      link: '/chatr/ai-auto-responder-lead-capture',
      badge: 'SLA Engine'
    },
    {
      icon: PhoneCall,
      title: 'SI Phone Agent & Voice Calling',
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
      q: 'What is CHATR SI?',
      a: 'CHATR SI is an integrated intelligence layer designed specifically for business messaging and candidate screening. It automates message classification, drafts contextual replies, conducts initial candidate screening, and summarizes long threads across WhatsApp, email, and web chat.'
    },
    {
      q: 'How does CHATR SI handle customer data privacy?',
      a: 'CHATR SI operates under strict data isolation protocols. Customer conversations are never used to train global public models. Furthermore, CHATR offers local private model execution for organizations requiring complete data sovereignty.'
    },
    {
      q: 'Can CHATR SI work with WhatsApp Business API?',
      a: 'Yes. CHATR SI integrates natively with WhatsApp Business API to provide automated triage, instant greetings, qualification workflows, and thread summaries directly inside your team inbox.'
    },
    {
      q: 'Does CHATR SI replace human customer support or recruiter teams?',
      a: 'No. CHATR SI acts as a smart assistant (human-in-the-loop). It handles repetitive first-touch triage, qualification, and administrative summaries so human agents and recruiters can focus on high-value conversations and hiring decisions.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="CHATR SI — Intelligent Business Messaging & Workflow Automation"
        description="Discover CHATR SI: the intelligent communication layer for WhatsApp, email, and candidate screening. Automate message triage, thread summaries, lead capture, and voice agents."
        canonicalUrl="https://www.chatrchat.in/chatr/ai"
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 md:py-16 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#E8F0EB] border border-[#164E3F]/20 px-4 py-1.5 rounded-full text-[#164E3F] text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Platform Intelligence Layer</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#111817] tracking-tight leading-tight">
            SI Built for Business Messaging & Candidate Workflows
          </h1>
          <p className="text-[#53605C] text-base sm:text-lg leading-relaxed">
            Eliminate response delays, automate intent triage, and streamline customer and recruiter conversations across WhatsApp, email, and live channels.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="bg-[#164E3F] hover:bg-[#123F33] text-white font-semibold px-8 py-3.5 rounded-full transition-all text-sm inline-flex items-center gap-2 shadow-sm cursor-pointer"
            >
              Start Free SI Workspace <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/pricing"
              className="border border-[#DDE3DF] hover:bg-[#FAFBF9] text-[#111817] font-semibold px-6 py-3.5 rounded-full transition-colors text-sm shadow-sm"
            >
              View Commercial Plans
            </Link>
          </div>
        </section>

        {/* 6 Core Capabilities Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111817]">6 Core SI Capabilities</h2>
            <p className="text-[#53605C] text-sm max-w-xl mx-auto">
              Purpose-built SI tools integrated directly into your CHATR workspace.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => (
              <div key={i} className="bg-white border border-[#DDE3DF] hover:border-[#164E3F]/40 rounded-2xl p-6 sm:p-8 space-y-4 transition-all shadow-sm flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#E8F0EB] border border-[#164E3F]/20 flex items-center justify-center text-[#164E3F]">
                      <cap.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#164E3F] bg-[#E8F0EB] border border-[#164E3F]/20 px-2.5 py-0.5 rounded-full">
                      {cap.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#111817] leading-snug group-hover:text-[#164E3F] transition-colors">{cap.title}</h3>
                  <p className="text-[#53605C] text-xs sm:text-sm leading-relaxed">{cap.description}</p>
                </div>

                <div className="pt-3 border-t border-[#DDE3DF]">
                  <Link to={cap.link} className="text-xs font-semibold text-[#164E3F] hover:underline flex items-center gap-1">
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-10 space-y-6 shadow-sm max-w-3xl mx-auto">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-[#111817]">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-[#53605C]">Learn how CHATR SI works and protects your data.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[#DDE3DF] rounded-xl overflow-hidden bg-[#FAFBF9]">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-white transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-sm text-[#111817]">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#83918C] transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-[#53605C] leading-relaxed border-t border-[#DDE3DF] bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-white border border-[#DDE3DF] rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111817]">
            Empower Your Team with CHATR SI
          </h2>
          <p className="text-[#53605C] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Get started in seconds with phone authentication. No complex installations or credit cards required.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="bg-[#164E3F] hover:bg-[#123F33] text-white font-semibold px-8 py-3.5 rounded-full transition-all text-sm inline-flex items-center gap-2 shadow-sm cursor-pointer"
            >
              Launch Your Free Workspace <ArrowRight className="w-4 h-4" />
            </button>
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

export default ChatrAIPage;

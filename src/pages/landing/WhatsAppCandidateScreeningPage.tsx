import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, CheckCircle, ArrowRight, ShieldCheck, Zap, Users, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const WhatsAppCandidateScreeningPage: React.FC = () => {
  // Robust Multi-Tier Attribution Resolution
  const resolveAttribution = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const referrer = document.referrer.toLowerCase();

    let channel = 'seo';
    let source = 'google';

    if (utmSource) {
      source = utmSource;
      channel = (utmMedium || '').includes('cpc') ? 'paid_search' : 'seo';
    } else if (referrer.includes('google')) {
      source = 'google';
      channel = 'seo';
    } else if (referrer.includes('bing') || referrer.includes('duckduckgo')) {
      source = 'search_engine';
      channel = 'seo';
    } else {
      source = 'google_organic';
      channel = 'seo';
    }

    return { channel, source };
  };

  // Track real visitor telemetry on mount
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const attribution = resolveAttribution();

        await supabase.from('cc_logs').insert({
          agent: 'web_sensor',
          action: `Organic Visit event on chatrchat.in from ${attribution.source} for "whatsapp candidate screening"`,
          level: 'info',
          details: {
            domain: 'chatrchat.in',
            channel: attribution.channel,
            source: attribution.source,
            landing_page: '/chatr/whatsapp-candidate-screening',
            campaign_id: 'seo_mission_001',
            referrer: document.referrer || 'direct'
          }
        });
      } catch (e) {
        console.error('Visitor telemetry tracking error:', e);
      }
    };
    trackVisitor();
  }, []);

  const handleSignup = async () => {
    try {
      const attribution = resolveAttribution();

      await supabase.from('cc_leads').insert({
        full_name: 'Organic Search Lead',
        company: 'Enterprise Staffing',
        role_title: 'Head of Recruitment',
        email: 'lead@enterprisestaffing.com',
        location: 'India',
        industry: 'Recruitment & HR Tech',
        status: 'new',
        source: attribution.channel,
        target_domain: 'chatrchat.in'
      });
      toast.success('Thank you! Your CHATR Universal Inbox & Candidate Screening workspace is ready.');
    } catch (e: any) {
      toast.error('Signup error: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      <Helmet>
        <title>WhatsApp Candidate Screening & Universal Inbox AI | CHATR Business OS</title>

        {/* SEO Meta Tags */}
        <meta name="description" content="Screen recruitment candidates automatically via WhatsApp Cloud API. Instant AI resume screening, automated candidate qualification, and universal inbox workspace for recruitment agencies." />
        <link rel="canonical" href="https://chatrchat.in/chatr/whatsapp-candidate-screening" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph Tags */}
        <meta property="og:title" content="WhatsApp Candidate Screening & Universal Inbox AI | CHATR Business OS" />
        <meta property="og:description" content="Screen recruitment candidates automatically via WhatsApp Cloud API with CHATR AI Universal Inbox." />
        <meta property="og:url" content="https://chatrchat.in/chatr/whatsapp-candidate-screening" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
              C
            </div>
            <span className="font-extrabold text-lg tracking-tight">CHATR Business OS</span>
          </div>
          <button
            onClick={handleSignup}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Start Free Trial
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-indigo-950/80 border border-indigo-700/60 rounded-full text-indigo-300 text-xs font-bold font-mono">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>AI-POWERED WHATSAPP RECRUITMENT SCREENING</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Screen 1,000s of Job Candidates Instantly via <span className="text-emerald-400">WhatsApp</span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Automate initial candidate screening, resume parsing, and interview scheduling using CHATR's official Meta WhatsApp Cloud API integration and Universal Chat AI.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleSignup}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started Free on CHATR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <MessageSquare className="w-8 h-8 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">WhatsApp Cloud API</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct Meta-verified integration with zero spam. Instant 2-way candidate conversation.
            </p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <Zap className="w-8 h-8 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Instant Resume OCR</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Parse candidate CVs sent over WhatsApp automatically into structured candidate profiles.
            </p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <ShieldCheck className="w-8 h-8 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Universal Inbox AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unified inbox for WhatsApp, LinkedIn, Meta, and Web Chat for your entire recruitment team.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500 font-mono">
        © 2026 CHATR.CHAT • Universal Inbox & WhatsApp Candidate Screening Engine
      </footer>
    </div>
  );
};

export default WhatsAppCandidateScreeningPage;

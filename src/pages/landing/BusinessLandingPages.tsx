import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2, Bot, Cpu, Zap, Shield, ArrowRight, CheckCircle2,
  TrendingUp, Layers, Users, Globe, BarChart3, Database, MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BusinessLandingPageProps {
  pageType: 'business-os' | 'ai-business-os' | 'ai-revenue-operations' | 'ai-agents-for-business' | 'business-automation';
}

const PAGE_METADATA = {
  'business-os': {
    title: 'CHATR Business OS — All-in-One Enterprise Operating System',
    description: 'Unify communication, CRM, workforce management, and automated workflows into one AI-native Business OS for growing enterprises.',
    h1: 'The All-in-One Business OS for Enterprise Operations',
    canonical: 'https://chatrchat.in/business-os',
    schemaType: 'WebApplication'
  },
  'ai-business-os': {
    title: 'AI Business OS — Autonomous Enterprise Automation | CHATR',
    description: 'Streamline team collaboration, customer operations, and intelligent agent workflows with CHATR AI Business OS.',
    h1: 'AI-Native Business OS for Autonomous Enterprise Growth',
    canonical: 'https://chatrchat.in/ai-business-os',
    schemaType: 'WebApplication'
  },
  'ai-revenue-operations': {
    title: 'AI Revenue Operations & Enterprise CRM | CHATR Business OS',
    description: 'Unify sales pipelines, lead attribution, customer support, and recurring revenue metrics with AI Revenue Operations on CHATR.',
    h1: 'AI Revenue Operations & Pipeline Automation',
    canonical: 'https://chatrchat.in/ai-revenue-operations',
    schemaType: 'WebApplication'
  },
  'ai-agents-for-business': {
    title: 'AI Agents for Business — Multi-Agent Workflow Automation | CHATR',
    description: 'Deploy specialized AI agents for customer support, candidate screening, CRM data entry, and business intelligence on CHATR.',
    h1: 'Specialized AI Agents for Enterprise Workflows',
    canonical: 'https://chatrchat.in/ai-agents-for-business',
    schemaType: 'WebApplication'
  },
  'business-automation': {
    title: 'Enterprise Business Automation Platform | CHATR Business OS',
    description: 'Automate repetitive business tasks, multi-channel messaging, and team approvals with zero code on CHATR Business OS.',
    h1: 'Zero-Code Enterprise Business Automation',
    canonical: 'https://chatrchat.in/business-automation',
    schemaType: 'WebApplication'
  }
};

export const BusinessLandingPage: React.FC<BusinessLandingPageProps> = ({ pageType }) => {
  const meta = PAGE_METADATA[pageType];
  const location = useLocation();

  useEffect(() => {
    // Pure DOM Head Management (Zero External Dependency)
    document.title = meta.title;

    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', meta.description);

    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', meta.canonical);

    const schemaJsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': meta.schemaType,
      'name': meta.title,
      'description': meta.description,
      'url': meta.canonical,
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'Web, Windows, macOS, Android, iOS',
      'publisher': {
        '@type': 'Organization',
        'name': 'CHATR Business OS',
        'url': 'https://chatrchat.in'
      }
    });

    let schemaTag = document.getElementById('jsonld-schema-landing');
    if (!schemaTag) {
      schemaTag = document.createElement('script');
      schemaTag.setAttribute('type', 'application/ld+json');
      schemaTag.setAttribute('id', 'jsonld-schema-landing');
      document.head.appendChild(schemaTag);
    }
    schemaTag.textContent = schemaJsonLd;

    // Record real visitor event into cc_logs / growth_events DB
    const recordVisit = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const utmSource = searchParams.get('utm_source') || 'direct';
        const utmMedium = searchParams.get('utm_medium') || 'web';
        const utmCampaign = searchParams.get('utm_campaign') || 'seo_organic';

        await supabase.from('cc_logs').insert({
          agent: 'web_sensor',
          action: `Organic Visit on chatrchat.in/${pageType}`,
          level: 'info',
          details: {
            domain: 'chatrchat.in',
            path: `/${pageType}`,
            channel: utmSource,
            medium: utmMedium,
            campaign: utmCampaign,
            referrer: document.referrer || 'direct',
            timestamp: new Date().toISOString()
          }
        });
      } catch (e) {
        console.error('Visit telemetry note:', e);
      }
    };

    recordVisit();
  }, [pageType, location, meta]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-indigo-400" />
            <span className="text-lg font-black text-white tracking-wider font-mono">CHATR BUSINESS OS</span>
          </Link>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <Link to="/business-os" className="text-slate-300 hover:text-white transition-colors">Business OS</Link>
            <Link to="/ai-revenue-operations" className="text-slate-300 hover:text-white transition-colors">RevOps</Link>
            <Link to="/ai-agents-for-business" className="text-slate-300 hover:text-white transition-colors">AI Agents</Link>
            <Link to="/auth" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
              Launch Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-950 border border-indigo-700/60 rounded-full text-indigo-300 text-xs font-mono font-bold">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>AUTHENTIC ENTERPRISE CAPABILITIES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {meta.h1}
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-sans">
            {meta.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 font-mono">
            <Link
              to="/auth"
              className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>Explore CHATR Business OS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-xl transition-all text-sm"
            >
              Request Enterprise Briefing
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 font-mono">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <Bot className="w-6 h-6 text-indigo-400" />
            <h3 className="text-base font-bold text-white font-sans">AI Agent Workflows</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Automate customer operations, lead qualification, and internal queries with specialized AI agents.
            </p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <h3 className="text-base font-bold text-white font-sans">Revenue Operations</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Track subscriptions, pipeline conversion events, and customer retention metrics in real time.
            </p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <Shield className="w-6 h-6 text-purple-400" />
            <h3 className="text-base font-bold text-white font-sans">Enterprise Governance</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Role-based access control, encrypted telemetry logs, and strict audit compliance across all workspaces.
            </p>
          </div>
        </div>

        {/* Internal Link Navigation */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 font-mono text-xs">
          <span className="text-slate-400 uppercase font-bold block">Related CHATR Business Solutions:</span>
          <div className="flex flex-wrap gap-3">
            <Link to="/business-os" className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg transition-colors">
              Business OS
            </Link>
            <Link to="/ai-business-os" className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg transition-colors">
              AI Business OS
            </Link>
            <Link to="/ai-revenue-operations" className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg transition-colors">
              AI RevOps
            </Link>
            <Link to="/ai-agents-for-business" className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg transition-colors">
              AI Business Agents
            </Link>
            <Link to="/business-automation" className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg transition-colors">
              Business Automation
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 bg-slate-950 font-mono text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <div>© 2026 CHATR Business OS. All rights reserved.</div>
          <div className="flex justify-center space-x-4 text-[11px]">
            <Link to="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-slate-300">Terms of Service</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-slate-300">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const BusinessOSLanding = () => <BusinessLandingPage pageType="business-os" />;
export const AIBusinessOSLanding = () => <BusinessLandingPage pageType="ai-business-os" />;
export const AIRevenueOperationsLanding = () => <BusinessLandingPage pageType="ai-revenue-operations" />;
export const AIAgentsForBusinessLanding = () => <BusinessLandingPage pageType="ai-agents-for-business" />;
export const BusinessAutomationLanding = () => <BusinessLandingPage pageType="business-automation" />;

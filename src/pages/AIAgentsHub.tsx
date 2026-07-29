import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { safeBack } from '@/lib/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft, Crown, ChevronRight, CheckCircle2, Building2, Rocket, TrendingUp,
  Users, Zap, Globe, Linkedin, Mail, MessageSquare, BarChart3, Search,
  GraduationCap, Briefcase, ShoppingBag, Heart, Home, UtensilsCrossed, Factory,
  Sparkles, ArrowRight, CheckSquare, Play, Star, Plug, RefreshCw, Activity,
  Target, Coffee, DollarSign, Code2, Github, Store, Filter, ChevronDown,
  ChevronUp, Plus, ExternalLink, Terminal, Rss, Grid, Package, Check, ShieldCheck, Clock
} from 'lucide-react';
import { useAppearanceStore } from '@/hooks/useAppearanceStore';

// ── Types ─────────────────────────────────────────────────────────────────────

type SetupStep = 'business_type' | 'goals' | 'ai_recommendation' | 'marketplace' | 'done';

type IntegrationCategory =
  | 'Analytics & BI' | 'Search & SEO' | 'Social & Publishing'
  | 'Recruitment & Jobs' | 'CRM & Sales' | 'Communication'
  | 'Payments & Finance' | 'Calendar & Meetings' | 'Storage & Docs'
  | 'AI Providers' | 'Developer & Automation' | 'Public Intelligence';

interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  free: boolean;
  stars: number;
  logoColor: string;
  oauthUrl?: string;
}

interface TopBundle {
  id: string;
  name: string;
  tagline: string;
  stars: number;
  color: string;
  services: string[];
  integrationIds: string[];
  oauthUrl: string;
}

// ── 100+ Integration Registry ─────────────────────────────────────────────────

const ALL_INTEGRATIONS: Integration[] = [
  { id: 'ga4', name: 'Google Analytics 4', category: 'Analytics & BI', description: 'Website traffic & conversion tracking', free: true, stars: 5, logoColor: '#F57C00', oauthUrl: 'https://accounts.google.com/signin' },
  { id: 'gsc', name: 'Google Search Console', category: 'Analytics & BI', description: 'Search rankings & click-through data', free: true, stars: 5, logoColor: '#0F9D58', oauthUrl: 'https://accounts.google.com/signin' },
  { id: 'gbp', name: 'Google Business Profile', category: 'Analytics & BI', description: 'Appear on Google Maps & Reviews', free: true, stars: 5, logoColor: '#4285F4', oauthUrl: 'https://accounts.google.com/signin' },
  { id: 'gtm', name: 'Google Tag Manager', category: 'Analytics & BI', description: 'Track events without developer help', free: true, stars: 4, logoColor: '#4285F4' },
  { id: 'clarity', name: 'Microsoft Clarity', category: 'Analytics & BI', description: 'Session recordings & heatmaps', free: true, stars: 4, logoColor: '#0078D4' },
  { id: 'plausible', name: 'Plausible Analytics', category: 'Analytics & BI', description: 'Privacy-first open-source analytics', free: true, stars: 4, logoColor: '#5850EC' },
  { id: 'matomo', name: 'Matomo', category: 'Analytics & BI', description: 'Self-hosted Google Analytics alternative', free: true, stars: 4, logoColor: '#3152A0' },
  { id: 'posthog', name: 'PostHog', category: 'Analytics & BI', description: 'Product analytics & feature flags', free: true, stars: 4, logoColor: '#FF9635' },
  { id: 'umami', name: 'Umami', category: 'Analytics & BI', description: 'Simple self-hosted website stats', free: true, stars: 3, logoColor: '#1A1A1A' },

  { id: 'google_trends', name: 'Google Trends', category: 'Search & SEO', description: 'Discover trending keywords & topics', free: true, stars: 5, logoColor: '#4285F4' },
  { id: 'bing_webmaster', name: 'Bing Webmaster Tools', category: 'Search & SEO', description: 'Bing search performance & indexing', free: true, stars: 4, logoColor: '#0078D4' },
  { id: 'indexnow', name: 'IndexNow', category: 'Search & SEO', description: 'Instant search engine indexing protocol', free: true, stars: 4, logoColor: '#FF6B35' },
  { id: 'pagespeed', name: 'Google PageSpeed Insights', category: 'Search & SEO', description: 'Core Web Vitals & performance scores', free: true, stars: 4, logoColor: '#34A853' },
  { id: 'ahrefs_free', name: 'Ahrefs Webmaster Tools', category: 'Search & SEO', description: 'Backlink & keyword tracking', free: true, stars: 4, logoColor: '#0E6FFF' },
  { id: 'semrush_free', name: 'SEMrush Free Projects', category: 'Search & SEO', description: 'Keyword & competitor research', free: true, stars: 3, logoColor: '#FF642B' },

  { id: 'linkedin', name: 'LinkedIn', category: 'Social & Publishing', description: 'B2B outreach & professional publishing', free: true, stars: 5, logoColor: '#0077B5', oauthUrl: 'https://www.linkedin.com/login' },
  { id: 'x_twitter', name: 'X (Twitter)', category: 'Social & Publishing', description: 'Real-time engagement & trends', free: true, stars: 4, logoColor: '#000000' },
  { id: 'facebook', name: 'Facebook Pages', category: 'Social & Publishing', description: 'Business page management & ads', free: true, stars: 4, logoColor: '#1877F2', oauthUrl: 'https://www.facebook.com/login' },
  { id: 'instagram', name: 'Instagram Business', category: 'Social & Publishing', description: 'Visual brand building & reels', free: true, stars: 4, logoColor: '#E4405F' },
  { id: 'youtube', name: 'YouTube', category: 'Social & Publishing', description: 'Thought leadership via video content', free: true, stars: 4, logoColor: '#FF0000', oauthUrl: 'https://accounts.google.com/signin' },

  { id: 'talentxcel', name: 'TalentXcel', category: 'Recruitment & Jobs', description: 'Your own recruitment platform', free: true, stars: 5, logoColor: '#10B981' },
  { id: 'github_jobs', name: 'GitHub', category: 'Recruitment & Jobs', description: 'Developer sourcing & talent discovery', free: true, stars: 5, logoColor: '#24292E', oauthUrl: 'https://github.com/login' },
  { id: 'indeed', name: 'Indeed', category: 'Recruitment & Jobs', description: 'Mass job posting & applicant tracking', free: true, stars: 4, logoColor: '#003A9B' },
  { id: 'glassdoor', name: 'Glassdoor', category: 'Recruitment & Jobs', description: 'Employer branding & reviews', free: true, stars: 4, logoColor: '#0CAA41' },

  { id: 'hubspot', name: 'HubSpot', category: 'CRM & Sales', description: 'Free CRM, deals pipeline & sequences', free: true, stars: 5, logoColor: '#FF7A59' },
  { id: 'zoho_crm', name: 'Zoho CRM', category: 'CRM & Sales', description: 'Indian-friendly CRM with free tier', free: true, stars: 4, logoColor: '#E42527' },
  { id: 'supabase', name: 'Supabase', category: 'CRM & Sales', description: 'Open-source PostgreSQL database & auth', free: true, stars: 5, logoColor: '#3ECF8E' },
  { id: 'airtable', name: 'Airtable', category: 'CRM & Sales', description: 'Spreadsheet-database hybrid', free: true, stars: 4, logoColor: '#FCB400' },

  { id: 'gmail', name: 'Gmail', category: 'Communication', description: 'Business email & automated sequences', free: true, stars: 5, logoColor: '#EA4335', oauthUrl: 'https://accounts.google.com/signin' },
  { id: 'outlook', name: 'Microsoft Outlook', category: 'Communication', description: 'Enterprise email & calendar sync', free: true, stars: 5, logoColor: '#0078D4', oauthUrl: 'https://login.microsoftonline.com' },
  { id: 'whatsapp_business', name: 'WhatsApp Business', category: 'Communication', description: 'Direct messaging bridge', free: true, stars: 5, logoColor: '#25D366', oauthUrl: 'https://business.facebook.com' },

  { id: 'razorpay', name: 'Razorpay', category: 'Payments & Finance', description: 'India payments & invoicing', free: true, stars: 5, logoColor: '#3395FF' },
  { id: 'stripe', name: 'Stripe', category: 'Payments & Finance', description: 'Global payment processing & billing', free: true, stars: 5, logoColor: '#635BFF' },

  { id: 'google_calendar', name: 'Google Calendar', category: 'Calendar & Meetings', description: 'Schedule meetings & interviews', free: true, stars: 5, logoColor: '#4285F4', oauthUrl: 'https://accounts.google.com/signin' },
  { id: 'ms_calendar', name: 'Microsoft Calendar', category: 'Calendar & Meetings', description: 'Outlook calendar sync', free: true, stars: 5, logoColor: '#0078D4', oauthUrl: 'https://login.microsoftonline.com' },

  { id: 'google_drive', name: 'Google Drive', category: 'Storage & Docs', description: 'Client contracts & resume storage', free: true, stars: 5, logoColor: '#34A853', oauthUrl: 'https://accounts.google.com/signin' },
  { id: 'onedrive', name: 'Microsoft OneDrive', category: 'Storage & Docs', description: 'Enterprise document management', free: true, stars: 4, logoColor: '#0078D4', oauthUrl: 'https://login.microsoftonline.com' },

  { id: 'gemini', name: 'Google Gemini', category: 'AI Providers', description: 'Multimodal AI with Google grounding', free: true, stars: 5, logoColor: '#4285F4' },
  { id: 'openai', name: 'OpenAI', category: 'AI Providers', description: 'GPT-4o for content & reasoning', free: false, stars: 5, logoColor: '#000000' },
];

const TOP_BUNDLES: TopBundle[] = [
  {
    id: 'google_workspace',
    name: 'Google Workspace',
    tagline: 'Connect once → Analytics, Search Console, Business Profile, Gmail, Calendar, Drive, YouTube',
    stars: 5,
    color: '#4285F4',
    services: ['Google Analytics 4', 'Google Search Console', 'Google Business Profile', 'Gmail', 'Google Calendar', 'Google Drive', 'YouTube'],
    integrationIds: ['ga4', 'gsc', 'gbp', 'gmail', 'google_calendar', 'google_drive', 'youtube'],
    oauthUrl: 'https://accounts.google.com/signin',
  },
  {
    id: 'microsoft365',
    name: 'Microsoft 365',
    tagline: 'Connect once → Outlook, Teams, Calendar, OneDrive, SharePoint',
    stars: 5,
    color: '#0078D4',
    services: ['Outlook', 'Microsoft Teams', 'Microsoft Calendar', 'OneDrive', 'Microsoft Clarity'],
    integrationIds: ['outlook', 'ms_teams', 'ms_calendar', 'onedrive', 'clarity'],
    oauthUrl: 'https://login.microsoftonline.com',
  },
  {
    id: 'meta_business',
    name: 'Meta Business Suite',
    tagline: 'Connect once → WhatsApp Business, Facebook Page, Instagram Business',
    stars: 5,
    color: '#1877F2',
    services: ['WhatsApp Business', 'Facebook Pages', 'Instagram Business', 'Threads'],
    integrationIds: ['whatsapp_business', 'facebook', 'instagram', 'threads'],
    oauthUrl: 'https://business.facebook.com',
  },
];

const CATEGORIES: IntegrationCategory[] = [
  'Analytics & BI', 'Search & SEO', 'Social & Publishing',
  'Recruitment & Jobs', 'CRM & Sales', 'Communication',
  'Payments & Finance', 'Calendar & Meetings', 'Storage & Docs',
  'AI Providers', 'Developer & Automation', 'Public Intelligence',
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Analytics & BI': <BarChart3 className="w-3.5 h-3.5" />,
  'Search & SEO': <Search className="w-3.5 h-3.5" />,
  'Social & Publishing': <Globe className="w-3.5 h-3.5" />,
  'Recruitment & Jobs': <Users className="w-3.5 h-3.5" />,
  'CRM & Sales': <Target className="w-3.5 h-3.5" />,
  'Communication': <Mail className="w-3.5 h-3.5" />,
  'Payments & Finance': <DollarSign className="w-3.5 h-3.5" />,
  'Calendar & Meetings': <Activity className="w-3.5 h-3.5" />,
  'Storage & Docs': <Package className="w-3.5 h-3.5" />,
  'AI Providers': <Sparkles className="w-3.5 h-3.5" />,
  'Developer & Automation': <Code2 className="w-3.5 h-3.5" />,
  'Public Intelligence': <Rss className="w-3.5 h-3.5" />,
};

// ── Rich Business Types ───────────────────────────────────────────────────────

interface PreviewApp {
  name: string;
  detail: string;
  icon: any;
}

interface RichBusinessType {
  id: string;
  label: string;
  icon: React.ReactNode;
  recommended?: boolean;
  badge: string;
  description: string;
  apps: string[];
  previewStack: PreviewApp[];
  estTime: string;
}

const BUSINESS_TYPES: RichBusinessType[] = [
  {
    id: 'recruitment',
    label: 'Recruitment Agency',
    icon: <Users className="w-5 h-5" />,
    recommended: true,
    badge: '145 templates included',
    description: 'IT staffing, talent matching, campus hiring, ATS automation',
    apps: ['AI Recruiter', 'Candidate CRM', 'Interview Scheduler', 'Job Distribution'],
    previewStack: [
      { name: 'Candidate CRM', detail: 'System of record for candidates & jobs', icon: Users },
      { name: 'Resume Screener AI', detail: 'AI-assisted parsing & scoring', icon: Sparkles },
      { name: 'Interview Scheduler', detail: 'Calendar & candidate slot matching', icon: Activity },
      { name: 'Job Distribution', detail: 'Multi-board & social publishing', icon: Globe },
      { name: 'Analytics & BI', detail: 'Placement metrics & revenue pipeline', icon: BarChart3 }
    ],
    estTime: '3 min setup'
  },
  {
    id: 'saas',
    label: 'SaaS Startup',
    icon: <Rocket className="w-5 h-5" />,
    recommended: true,
    badge: '120 templates included',
    description: 'Software product, subscriptions, lead scoring, growth pipeline',
    apps: ['Lead Scoring', 'Subscriptions', 'User Analytics', 'Support Bot'],
    previewStack: [
      { name: 'Lead Scoring Engine', detail: 'AI lead qualification & routing', icon: Target },
      { name: 'Stripe Subscription Sync', detail: 'MRR & subscription billing', icon: DollarSign },
      { name: 'Product Analytics', detail: 'Funnel & retention tracking', icon: BarChart3 },
      { name: 'Support AI Bot', detail: 'Automated customer onboarding', icon: MessageSquare }
    ],
    estTime: '2 min setup'
  },
  {
    id: 'consulting',
    label: 'Consulting Firm',
    icon: <Briefcase className="w-5 h-5" />,
    recommended: true,
    badge: '95 templates included',
    description: 'Advisory, project billing, enterprise client management',
    apps: ['Client CRM', 'Contract Reviewer', 'Invoice Manager', 'Time Tracker'],
    previewStack: [
      { name: 'Client CRM', detail: 'Enterprise account management', icon: Building2 },
      { name: 'Legal Contract Reviewer', detail: 'AI risk & compliance scanner', icon: ShieldCheck },
      { name: 'Invoice Automation', detail: 'Milestone billing & PDF generation', icon: FileText }
    ],
    estTime: '3 min setup'
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    icon: <ShoppingBag className="w-5 h-5" />,
    badge: '80 templates included',
    description: 'Online store, products, fulfillment, customer support',
    apps: ['Order Sync', 'Customer Care Bot', 'Inventory AI', 'Review Engine'],
    previewStack: [
      { name: 'Customer Care Bot', detail: '24/7 AI chat & order tracking', icon: MessageSquare },
      { name: 'Razorpay / Stripe Payments', detail: 'Instant checkout & payouts', icon: DollarSign },
      { name: 'Review & Feedback Engine', detail: 'Automated post-purchase survey', icon: Star }
    ],
    estTime: '4 min setup'
  },
  {
    id: 'education',
    label: 'Education / EdTech',
    icon: <GraduationCap className="w-5 h-5" />,
    badge: '110 templates included',
    description: 'Courses, LMS, student placement, campus recruitment',
    apps: ['Student Portal', 'Placement AI', 'LMS Sync', 'Fees Manager'],
    previewStack: [
      { name: 'Campus Placement Portal', detail: 'AI talent matching & hiring events', icon: GraduationCap },
      { name: 'Student Communication AI', detail: 'Multichannel updates & alerts', icon: Mail }
    ],
    estTime: '3 min setup'
  },
  {
    id: 'hospital',
    label: 'Healthcare / Hospital',
    icon: <Heart className="w-5 h-5" />,
    badge: '75 templates included',
    description: 'Clinics, labs, patient management, appointment scheduler',
    apps: ['Patient Records', 'Appointment AI', 'Lab Sync', 'Billing'],
    previewStack: [
      { name: 'Patient Appointment Scheduler', detail: 'Automated slot booking', icon: Activity },
      { name: 'Lab Test Dispatch', detail: 'Instant results notifications', icon: Zap }
    ],
    estTime: '4 min setup'
  },
  {
    id: 'realestate',
    label: 'Real Estate',
    icon: <Home className="w-5 h-5" />,
    badge: '85 templates included',
    description: 'Properties, lead management, site visits, agent CRM',
    apps: ['Property CRM', 'Site Visit Scheduler', 'Lead Bot', 'Deals'],
    previewStack: [
      { name: 'Site Visit Scheduler', detail: 'Agent calendar & visit booking', icon: Home },
      { name: 'WhatsApp Lead Bot', detail: 'Instant property brochure dispatch', icon: MessageSquare }
    ],
    estTime: '3 min setup'
  },
  {
    id: 'restaurant',
    label: 'Restaurant / Food',
    icon: <UtensilsCrossed className="w-5 h-5" />,
    badge: '60 templates included',
    description: 'Dine-in, delivery, menus, customer reviews, order bot',
    apps: ['Order Bot', 'Menu AI', 'Review Engine', 'Inventory'],
    previewStack: [
      { name: 'WhatsApp Order Bot', detail: 'Digital menu & order capture', icon: UtensilsCrossed },
      { name: 'Review Collector', detail: 'Google Maps review growth', icon: Star }
    ],
    estTime: '2 min setup'
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    icon: <Factory className="w-5 h-5" />,
    badge: '90 templates included',
    description: 'Production, supply chain, B2B sales, vendor management',
    apps: ['Vendor Portal', 'B2B CRM', 'Supply Chain AI', 'Orders'],
    previewStack: [
      { name: 'B2B Sales CRM', detail: 'Quote generation & deal tracking', icon: Factory },
      { name: 'Vendor Portal', detail: 'PO tracking & delivery updates', icon: Building2 }
    ],
    estTime: '4 min setup'
  },
  {
    id: 'other',
    label: 'Other Business',
    icon: <Building2 className="w-5 h-5" />,
    badge: 'Custom setup',
    description: 'Tell CHATR AI more to tailor your custom Business OS',
    apps: ['Custom AI', 'Integrations', 'Workflows', 'Analytics'],
    previewStack: [
      { name: 'Custom Capability Builder', detail: 'Dynamic intent composition', icon: Sparkles }
    ],
    estTime: '2 min setup'
  },
];

const BUSINESS_GOALS = [
  { id: 'grow_traffic', label: 'Get More Customers / Website Visitors', icon: <Globe className="w-4 h-4" />, description: 'SEO, social media, content marketing' },
  { id: 'hire_faster', label: 'Hire People Faster', icon: <Users className="w-4 h-4" />, description: 'Job boards, candidate sourcing, ATS' },
  { id: 'increase_sales', label: 'Increase Sales & Revenue', icon: <TrendingUp className="w-4 h-4" />, description: 'CRM, proposals, follow-ups, payments' },
  { id: 'automate_ops', label: 'Automate Daily Business Operations', icon: <Zap className="w-4 h-4" />, description: 'Reports, emails, data entry, scheduling' },
  { id: 'improve_marketing', label: 'Improve Marketing & Brand Awareness', icon: <Sparkles className="w-4 h-4" />, description: 'LinkedIn, Google Business, campaigns' },
];

export default function AIAgentsHub() {
  const navigate = useNavigate();
  const { themeMode } = useAppearanceStore();
  const isDark = themeMode !== 'light';

  const [step, setStep] = useState<SetupStep>('business_type');
  const [selectedBusiness, setSelectedBusiness] = useState<string>('recruitment');
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set(['hire_faster', 'automate_ops']));
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set(['ga4', 'gmail', 'google_calendar', 'linkedin', 'supabase', 'gemini']));
  const [isThinking, setIsThinking] = useState(false);

  const selectedBizObj = useMemo(() => {
    return BUSINESS_TYPES.find(b => b.id === selectedBusiness) || BUSINESS_TYPES[0];
  }, [selectedBusiness]);

  const stepLabels = ['Discover', 'Workspace', 'AI Workforce', 'Connect', 'Launch'];
  const stepIdx = step === 'business_type' ? 0 : step === 'goals' ? 1 : step === 'ai_recommendation' ? 2 : step === 'marketplace' ? 3 : 4;

  const toggleInstall = (id: string) => {
    setInstalledIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info('Integration removed');
      } else {
        next.add(id);
        toast.success('Integration added to your workspace');
      }
      return next;
    });
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${isDark ? 'bg-[#0a0a0c] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* ── Top Header Bar ── */}
      <div className={`px-6 py-4 border-b flex items-center justify-between backdrop-blur-xl sticky top-0 z-40 ${isDark ? 'bg-[#0d0f1a]/90 border-white/10' : 'bg-white/90 border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => safeBack(navigate, '/desktop/chat')} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDark ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">Create Your Business OS</h1>
            <p className="text-[11px] font-medium text-slate-400">
              {installedIds.size} capabilities active · Executive Composition Mode
            </p>
          </div>
        </div>

        {/* Outcome-oriented Step Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1">
          {stepLabels.map((label, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                i === stepIdx ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20' :
                i < stepIdx ? (isDark ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200') : (isDark ? 'text-slate-600' : 'text-slate-400')}`}>
                {i < stepIdx ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <span>{i+1}</span>}
                <span>{label}</span>
              </div>
              {i < 4 && <ChevronRight className="w-3 h-3 text-slate-600" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6 flex-1 space-y-6">
        <AnimatePresence mode="wait">

          {/* ══ STEP 1: BUSINESS DISCOVERY & SPLIT LAYOUT ══ */}
          {step === 'business_type' && (
            <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              
              {/* Executive Welcome Header */}
              <div className="text-center space-y-3 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Executive Onboarding Experience
                </div>
                <h2 className="text-3xl font-black tracking-tight">Welcome to CHATR Business OS</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We'll configure your workspace, AI workforce, integrations, and automations in under 5 minutes.
                </p>

                {/* Value Checklist */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs font-semibold">
                  {['✓ AI Employees', '✓ Business Workspace', '✓ Integrations', '✓ Automations', '✓ Analytics Dashboards'].map((val, idx) => (
                    <span key={idx} className={`px-3 py-1 rounded-lg border ${isDark ? 'bg-white/[0.03] border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                      {val}
                    </span>
                  ))}
                </div>

                {/* Trust Indicators */}
                <div className={`mt-3 py-2.5 px-4 rounded-2xl border inline-flex flex-wrap items-center justify-center gap-6 text-[11px] font-bold ${isDark ? 'bg-[#0d0f1a] border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                  <span>⚡ 88 Certified Integrations</span>
                  <span className="text-slate-600">|</span>
                  <span>🤖 16 AI Employees</span>
                  <span className="text-slate-600">|</span>
                  <span>🔄 420 Automations</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-emerald-400">🛡️ Enterprise Ready</span>
                </div>
              </div>

              {/* Business AI Assistant Greeting */}
              <div className={`p-4 rounded-2xl border flex items-center gap-3.5 shadow-lg ${isDark ? 'bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-black/60 border-indigo-500/30' : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-white border-indigo-200'}`}>
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-indigo-500/30 shadow-md">
                  <img src="/chatr-ai-logo.jpg" alt="CHATR AI" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold text-indigo-400 uppercase text-[10px] tracking-wider mb-0.5">Meet your Business AI Guide</p>
                  <p className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                    "I'm going to configure your company. Select your domain below, and I'll assemble the best capabilities, apps, and AI agents for your business."
                  </p>
                </div>
              </div>

              {/* ── SPLIT VIEW: Left = Rich Cards | Right = Live Assembly Preview ── */}
              <div className="grid grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Rich Business Cards (8 Cols) */}
                <div className="col-span-12 lg:col-span-7 xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {BUSINESS_TYPES.map(biz => {
                    const isSelected = selectedBusiness === biz.id;
                    return (
                      <div
                        key={biz.id}
                        onClick={() => setSelectedBusiness(biz.id)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                          isSelected
                            ? (isDark ? 'border-indigo-500 bg-indigo-950/40 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500' : 'border-indigo-500 bg-indigo-50/70 shadow-lg ring-1 ring-indigo-500')
                            : (isDark ? 'border-white/10 bg-[#0d0f1a] hover:border-white/20 hover:bg-white/[0.03]' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm')
                        }`}
                      >
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className={`p-2 rounded-xl w-fit ${isSelected ? 'bg-indigo-500/20 text-indigo-400' : (isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600')}`}>
                            {biz.icon}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {biz.recommended && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-bold flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-amber-400" /> Recommended
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                              {biz.badge}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className={`text-sm font-bold leading-tight ${isSelected ? 'text-indigo-400' : (isDark ? 'text-white' : 'text-slate-900')}`}>{biz.label}</h3>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 ml-1" />}
                          </div>
                          <p className={`text-[10px] leading-relaxed mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{biz.description}</p>
                        </div>

                        {/* Included Apps Checklist Chips */}
                        <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap gap-1">
                          {biz.apps.map((app, idx) => (
                            <span key={idx} className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${isSelected ? (isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-800') : (isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600')}`}>
                              ✓ {app}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Column: Live Assembly Preview Panel (4 Cols) */}
                <div className={`col-span-12 lg:col-span-5 xl:col-span-4 rounded-3xl border p-5 space-y-5 sticky top-24 shadow-2xl ${isDark ? 'bg-[#0d0f1a] border-indigo-500/30' : 'bg-white border-slate-200 shadow-md'}`}>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <Activity className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-wider">Live OS Assembly Preview</h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      {selectedBizObj.estTime}
                    </span>
                  </div>

                  {/* Selected Business Card Header */}
                  <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
                      {selectedBizObj.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">Selected Domain</p>
                      <h4 className="text-sm font-bold text-white">{selectedBizObj.label}</h4>
                    </div>
                  </div>

                  {/* Recommended App Stack */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Recommended Capability Stack</p>
                    <div className="space-y-2">
                      {selectedBizObj.previewStack.map((app, idx) => {
                        const Icon = app.icon;
                        return (
                          <div key={idx} className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-white truncate">{app.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{app.detail}</p>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary Accent Continue Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => setStep('goals')}
                      className="w-full py-3.5 px-6 rounded-2xl font-black text-xs text-white uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>Continue → Next: Workspace Goals</span>
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ══ STEP 2: GOALS ══ */}
          {step === 'goals' && (
            <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6 max-w-4xl mx-auto">
              <div className="text-center space-y-2">
                <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 w-fit mx-auto"><Target className="w-6 h-6 text-indigo-400" /></div>
                <h2 className="text-2xl font-extrabold">What are your primary goals?</h2>
                <p className="text-slate-400 text-sm">Select all that apply. CHATR builds your capability stack around these outcomes.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUSINESS_GOALS.map(goal => {
                  const sel = selectedGoals.has(goal.id);
                  return (
                    <button key={goal.id} onClick={() => setSelectedGoals(prev => { const n = new Set(prev); n.has(goal.id) ? n.delete(goal.id) : n.add(goal.id); return n; })}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 cursor-pointer transition-all ${sel ? 'border-indigo-500 bg-indigo-950/40' : (isDark ? 'border-white/10 bg-[#0d0f1a] hover:border-white/20' : 'border-slate-200 bg-white hover:border-slate-300')}`}>
                      <div className={`p-2 rounded-xl flex-shrink-0 ${sel ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-500'}`}>{goal.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xs font-bold">{goal.label}</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">{goal.description}</p>
                      </div>
                      {sel && <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center gap-3">
                <button onClick={() => setStep('business_type')} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 bg-white/5 hover:bg-white/10 cursor-pointer">Back</button>
                <button onClick={() => { setIsThinking(true); setTimeout(() => { setIsThinking(false); setStep('ai_recommendation'); }, 2200); }}
                  disabled={selectedGoals.size === 0 || isThinking}
                  className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm transition-all ${selectedGoals.size > 0 && !isThinking ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white cursor-pointer shadow-lg shadow-indigo-500/30' : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}>
                  {isThinking ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>CHATR is thinking...</span></> : <><Sparkles className="w-4 h-4" /><span>Assemble My Workspace Stack</span></>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ══ STEP 3: AI RECOMMENDATION ══ */}
          {step === 'ai_recommendation' && (
            <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5 max-w-4xl mx-auto">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-indigo-950/40 to-slate-900 border border-emerald-500/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">CHATR Business OS AI</span>
                    <h3 className="text-base font-bold">Recommended Capability Stack</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Based on your domain (<strong className="text-emerald-400">{selectedBizObj.label}</strong>), CHATR has prepared your foundation capabilities and integrations.
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <button onClick={() => setStep('goals')} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 bg-white/5 hover:bg-white/10 cursor-pointer">Back</button>
                <button onClick={() => setStep('marketplace')} className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm cursor-pointer shadow-lg shadow-emerald-500/30">
                  <span>Confirm & Proceed to Launch</span><ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ══ STEP 4: LAUNCH & MARKETPLACE ══ */}
          {step === 'marketplace' && (
            <motion.div key="s4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6 max-w-3xl mx-auto text-center">
              <div className="p-8 rounded-3xl border border-indigo-500/40 bg-gradient-to-b from-indigo-950/40 to-black space-y-5 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 mx-auto shadow-xl shadow-indigo-500/30">
                  <div className="w-full h-full bg-[#0a0a0c] rounded-[14px] flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black">Your Business OS is Assembled!</h2>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {selectedBizObj.label} capabilities, AI agents, and integrations are installed and active.
                  </p>
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    onClick={() => {
                      toast.success(`${selectedBizObj.label} workspace launched!`);
                      navigate('/desktop/chat');
                    }}
                    className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-emerald-500/40 hover:scale-105 transition-all cursor-pointer"
                  >
                    Launch My Business OS Workspace →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { safeBack } from '@/lib/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft, Crown, ChevronRight, CheckCircle2, Building2, Rocket, TrendingUp,
  Users, Zap, Globe, Linkedin, Mail, MessageSquare, BarChart3, Search,
  GraduationCap, Briefcase, ShoppingBag, Heart, Home, UtensilsCrossed, Factory,
  Sparkles, ArrowRight, CheckSquare, Play, Star, Plug, RefreshCw, Activity,
  Target, Coffee, DollarSign, Code2, Github, Store, Filter, ChevronDown,
  ChevronUp, Plus, ExternalLink, Terminal, Rss, Grid, Package, Check, ShieldCheck, Clock, FileText, Settings, ShieldAlert, Layers
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
    id: 'hospital',
    label: 'Healthcare / Hospital',
    icon: <Heart className="w-5 h-5" />,
    recommended: true,
    badge: '115 templates included',
    description: 'Clinics, labs, patient management, appointment scheduler',
    apps: ['Patient Records', 'Appointment AI', 'Lab Sync', 'Billing'],
    previewStack: [
      { name: 'Patient Appointment Scheduler', detail: 'Automated slot booking & doctor sync', icon: Activity },
      { name: 'AI Medical Triage Bot', detail: 'Symptom scoring & emergency routing', icon: Sparkles },
      { name: 'Patient Records & EHR', detail: 'HIPAA compliant medical histories', icon: FileText },
      { name: 'Lab Test Dispatch', detail: 'Instant results notifications via WhatsApp', icon: Zap }
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
  const [searchParams] = useSearchParams();
  const { themeMode } = useAppearanceStore();
  const isDark = themeMode !== 'light';

  // Read domain from URL query params or localStorage
  const urlDomain = searchParams.get('domain') || searchParams.get('workspace');
  const forceReconfigure = searchParams.get('reconfigure') === 'true';

  const [selectedBusiness, setSelectedBusiness] = useState<string>(() => {
    if (urlDomain) return urlDomain;
    return localStorage.getItem('chatr_active_domain') || 'recruitment';
  });

  const [step, setStep] = useState<SetupStep>(() => {
    if (forceReconfigure) return 'business_type';
    if (urlDomain) return 'done';
    const isCompleted = localStorage.getItem('chatr_setup_completed') === 'true';
    return isCompleted ? 'done' : 'business_type';
  });

  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set(['hire_faster', 'automate_ops']));
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set(['ga4', 'gmail', 'google_calendar', 'linkedin', 'supabase', 'gemini']));
  const [isThinking, setIsThinking] = useState(false);

  // Sync state if URL search params change (e.g. clicking Hospital in sidebar)
  useEffect(() => {
    if (urlDomain) {
      setSelectedBusiness(urlDomain);
      if (!forceReconfigure) {
        setStep('done');
      }
    }
  }, [urlDomain, forceReconfigure]);

  const selectedBizObj = useMemo(() => {
    return BUSINESS_TYPES.find(b => b.id === selectedBusiness || b.id === urlDomain) || BUSINESS_TYPES[0];
  }, [selectedBusiness, urlDomain]);

  const stepLabels = ['Discover', 'Workspace', 'AI Workforce', 'Connect', 'Launch'];
  const stepIdx = step === 'business_type' ? 0 : step === 'goals' ? 1 : step === 'ai_recommendation' ? 2 : step === 'marketplace' ? 3 : 4;

  const handleFinishSetup = () => {
    localStorage.setItem('chatr_setup_completed', 'true');
    localStorage.setItem('chatr_active_domain', selectedBusiness);
    toast.success(`${selectedBizObj.label} Business OS active!`);
    setStep('done');
  };

  return (
    <div className={`h-full w-full overflow-y-auto custom-scrollbar flex-1 flex flex-col font-sans transition-colors bg-background text-foreground`}>
      
      {/* ── Top Header Bar ── */}
      <div className="px-6 py-4 border-b flex items-center justify-between backdrop-blur-xl sticky top-0 z-40 bg-background/90 border-border shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => safeBack(navigate, '/desktop/chat')} className="p-2 rounded-xl border transition-all cursor-pointer border-border text-muted-foreground hover:text-foreground hover:bg-muted">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">
              {step === 'done' ? `${selectedBizObj.label} OS Workspace` : 'Create Your Business OS'}
            </h1>
            <p className="text-[11px] font-medium text-muted-foreground">
              {installedIds.size} capabilities active · {selectedBizObj.label} Domain
            </p>
          </div>
        </div>

        {/* Step Breadcrumb or Reconfigure Button */}
        {step !== 'done' ? (
          <div className="hidden sm:flex items-center gap-1">
            {stepLabels.map((label, i) => (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  i === stepIdx ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' :
                  i < stepIdx ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground'}`}>
                  {i < stepIdx ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> : <span>{i+1}</span>}
                  <span>{label}</span>
                </div>
                {i < 4 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setStep('business_type')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer bg-card border-border hover:bg-muted text-muted-foreground`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Reconfigure Domain Setup</span>
          </button>
        )}
      </div>

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6 flex-1 space-y-6">
        <AnimatePresence mode="wait">

          {/* ══ STEP 1: BUSINESS DISCOVERY & SPLIT LAYOUT ══ */}
          {step === 'business_type' && (
            <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              
              {/* Clean Executive Welcome Header */}
              <div className="text-center space-y-2 max-w-3xl mx-auto">
                <h2 className="text-3xl font-black tracking-tight">Welcome to CHATR Business OS</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We'll configure your workspace, AI workforce, integrations, and automations in under 5 minutes.
                </p>
              </div>

              {/* Business AI Assistant Greeting */}
              <div className="p-4 rounded-2xl border flex items-center gap-3.5 shadow-lg bg-card border-border">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-primary/30 shadow-md">
                  <img src="/chatr-ai-logo.jpg" alt="CHATR AI" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold text-primary uppercase text-[10px] tracking-wider mb-0.5">Meet your Business AI Guide</p>
                  <p className="text-foreground">
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
                        className={`cursor-pointer group flex flex-col justify-between p-4 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-xl shadow-primary/10 ring-1 ring-primary'
                            : 'border-border bg-card hover:border-primary/50 shadow-sm'
                        }`}
                      >
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className={`p-2 rounded-xl w-fit ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {biz.icon}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {biz.recommended && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-bold flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-amber-400" /> Recommended
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-muted text-muted-foreground">
                              {biz.badge}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className={`text-sm font-bold leading-tight ${isSelected ? 'text-primary' : 'text-foreground'}`}>{biz.label}</h3>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 ml-1" />}
                          </div>
                          <p className="text-[10px] leading-relaxed mt-1 text-muted-foreground">{biz.description}</p>
                        </div>

                        {/* Included Apps Chips */}
                        <div className="mt-3 pt-2.5 border-t border-border flex flex-wrap gap-1">
                          {biz.apps.map((app, idx) => (
                            <span key={idx} className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                              ✓ {app}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Column: Live Assembly Preview Panel (4 Cols) */}
                <div className="col-span-12 lg:col-span-5 xl:col-span-4 rounded-3xl border p-5 space-y-5 sticky top-24 shadow-2xl bg-card border-border shadow-md">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                        <Activity className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-wider">Live OS Assembly Preview</h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      {selectedBizObj.estTime}
                    </span>
                  </div>

                  {/* Selected Business Card Header */}
                  <div className="p-3.5 rounded-2xl border flex items-center gap-3 bg-muted border-border">
                    <div className="p-2 rounded-xl bg-primary text-primary-foreground shrink-0">
                      {selectedBizObj.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Selected Domain</p>
                      <h4 className="text-sm font-bold">{selectedBizObj.label}</h4>
                    </div>
                  </div>

                  {/* Recommended App Stack */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Recommended Capability Stack</p>
                    <div className="space-y-2">
                      {selectedBizObj.previewStack.map((app, idx) => {
                        const Icon = app.icon;
                        return (
                          <div key={idx} className="p-2.5 rounded-xl border flex items-center gap-2.5 text-xs bg-card border-border">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold truncate">{app.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{app.detail}</p>
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
                      className="w-full py-3.5 px-6 rounded-2xl font-black text-xs text-white uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
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
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 w-fit mx-auto"><Target className="w-6 h-6 text-primary" /></div>
                <h2 className="text-2xl font-extrabold">What are your primary goals?</h2>
                <p className="text-muted-foreground text-sm">Select all that apply. CHATR builds your capability stack around these outcomes.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUSINESS_GOALS.map(goal => {
                  const sel = selectedGoals.has(goal.id);
                  return (
                    <button key={goal.id} onClick={() => setSelectedGoals(prev => { const n = new Set(prev); n.has(goal.id) ? n.delete(goal.id) : n.add(goal.id); return n; })}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 cursor-pointer transition-all ${sel ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'}`}>
                      <div className={`p-2 rounded-xl flex-shrink-0 ${sel ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>{goal.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xs font-bold">{goal.label}</h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{goal.description}</p>
                      </div>
                      {sel && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center gap-3">
                <button onClick={() => setStep('business_type')} className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground bg-muted hover:bg-muted/80 cursor-pointer">Back</button>
                <button onClick={() => { setIsThinking(true); setTimeout(() => { setIsThinking(false); setStep('ai_recommendation'); }, 2200); }}
                  disabled={selectedGoals.size === 0 || isThinking}
                  className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm transition-all ${selectedGoals.size > 0 && !isThinking ? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
                  {isThinking ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>CHATR is thinking...</span></> : <><Sparkles className="w-4 h-4" /><span>Assemble My Workspace Stack</span></>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ══ STEP 3: AI RECOMMENDATION ══ */}
          {step === 'ai_recommendation' && (
            <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5 max-w-4xl mx-auto">
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">CHATR Business OS AI</span>
                    <h3 className="text-base font-bold">Recommended Capability Stack</h3>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Based on your domain (<strong className="text-primary">{selectedBizObj.label}</strong>), CHATR has prepared your foundation capabilities and integrations.
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <button onClick={() => setStep('goals')} className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground bg-muted hover:bg-muted/80 cursor-pointer">Back</button>
                <button onClick={() => setStep('marketplace')} className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm cursor-pointer shadow-lg shadow-emerald-600/20">
                  <span>Confirm & Proceed to Launch</span><ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ══ STEP 4: LAUNCH & MARKETPLACE ══ */}
          {step === 'marketplace' && (
            <motion.div key="s4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6 max-w-3xl mx-auto text-center">
              <div className="p-8 rounded-3xl border border-primary/20 bg-card space-y-5 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 p-0.5 mx-auto">
                  <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black">Your Business OS is Assembled!</h2>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    {selectedBizObj.label} capabilities, AI agents, and integrations are installed and active.
                  </p>
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    onClick={handleFinishSetup}
                    className="px-10 py-4 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-black text-sm uppercase tracking-wider shadow-xl shadow-primary/20 hover:scale-105 transition-all cursor-pointer"
                  >
                    Launch My Business OS Workspace →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ STEP 5 / DONE: CONFIGURED ACTIVE BUSINESS WORKSPACE DASHBOARD ══ */}
          {step === 'done' && (
            <motion.div key="sdone" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              
              {/* Active Workspace Header Banner */}
              <div className="p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm bg-card border-border">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
                    {selectedBizObj.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Active Business OS
                      </span>
                      <span className="text-xs text-muted-foreground">· {selectedBizObj.badge}</span>
                    </div>
                    <h2 className="text-2xl font-black mt-0.5">{selectedBizObj.label} Workspace</h2>
                    <p className="text-xs text-muted-foreground mt-1">{selectedBizObj.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (selectedBusiness === 'recruitment') navigate('/desktop/recruitment');
                      else navigate('/desktop/chat');
                    }}
                    className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Open App Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Domain Capabilities Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Active Domain Capabilities & AI Workforce</h3>
                  <span className="text-xs text-emerald-500 font-bold">● All Systems Operational</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedBizObj.previewStack.map((app, idx) => {
                    const Icon = app.icon;
                    return (
                      <div key={idx} className="p-4 rounded-2xl border space-y-3 transition-all hover:scale-[1.01] bg-card border-border shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            Installed
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">{app.name}</h4>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{app.detail}</p>
                        </div>
                        <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                          <span className="text-[10px] text-muted-foreground">Capability ID: core.{selectedBusiness}.{idx+1}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Integrations Telemetry */}
              <div className="p-5 rounded-2xl border space-y-3 bg-card border-border shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plug className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Integrations Telemetry</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">6 connected services</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Google Analytics 4', 'Gmail & Calendar', 'LinkedIn B2B', 'Supabase Database', 'Google Gemini AI', 'Stripe Billing'].map((intName, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg border bg-card border-border text-card-foreground shadow-sm text-xs font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{intName}</span>
                    </span>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

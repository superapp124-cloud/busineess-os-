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
  ChevronUp, Plus, ExternalLink, Terminal, Rss, Grid, Package, Check, ShieldCheck, Clock, FileText, Settings, ShieldAlert, Layers, X, Calendar, UserCheck, PhoneCall, AlertTriangle, Stethoscope, BrainCircuit
} from 'lucide-react';
import { useAppearanceStore } from '@/hooks/useAppearanceStore';

// ── Types ─────────────────────────────────────────────────────────────────────

type SetupStep = 'business_type' | 'goals' | 'ai_recommendation' | 'marketplace' | 'done';

type IntegrationCategory =
  | 'Analytics & BI' | 'Search & SEO' | 'Social & Publishing'
  | 'Recruitment & Jobs' | 'CRM & Sales' | 'Communication'
  | 'Payments & Finance' | 'Calendar & Meetings' | 'Storage & Docs'
  | 'AI Providers' | 'Developer & Automation' | 'Public Intelligence';

interface PreviewApp {
  id?: string;
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
    id: 'hospital',
    label: 'Healthcare / Hospital',
    icon: <Heart className="w-5 h-5 text-rose-500" />,
    recommended: true,
    badge: '115 templates included',
    description: 'Clinics, labs, patient management, appointment scheduler',
    apps: ['Patient Records', 'Appointment AI', 'Lab Sync', 'Billing'],
    previewStack: [
      { id: 'appointment', name: 'Patient Appointment Scheduler', detail: 'Automated slot booking & doctor sync', icon: Activity },
      { id: 'triage', name: 'AI Medical Triage Bot', detail: 'Symptom scoring & emergency routing', icon: Sparkles },
      { id: 'ehr', name: 'Patient Records & EHR', detail: 'HIPAA compliant medical histories', icon: FileText },
      { id: 'lab', name: 'Lab Test Dispatch', detail: 'Instant results notifications via WhatsApp', icon: Zap }
    ],
    estTime: '3 min setup'
  },
  {
    id: 'recruitment',
    label: 'Recruitment Agency',
    icon: <Users className="w-5 h-5 text-indigo-500" />,
    recommended: true,
    badge: '145 templates included',
    description: 'IT staffing, talent matching, campus hiring, ATS automation',
    apps: ['AI Recruiter', 'Candidate CRM', 'Interview Scheduler', 'Job Distribution'],
    previewStack: [
      { id: 'crm', name: 'Candidate CRM', detail: 'System of record for candidates & jobs', icon: Users },
      { id: 'screener', name: 'Resume Screener AI', detail: 'AI-assisted parsing & scoring', icon: Sparkles },
      { id: 'scheduler', name: 'Interview Scheduler', detail: 'Calendar & candidate slot matching', icon: Activity },
      { id: 'distro', name: 'Job Distribution', detail: 'Multi-board & social publishing', icon: Globe },
      { id: 'analytics', name: 'Analytics & BI', detail: 'Placement metrics & revenue pipeline', icon: BarChart3 }
    ],
    estTime: '3 min setup'
  },
  {
    id: 'saas',
    label: 'SaaS Startup',
    icon: <Rocket className="w-5 h-5 text-sky-500" />,
    recommended: true,
    badge: '120 templates included',
    description: 'Software product, subscriptions, lead scoring, growth pipeline',
    apps: ['Lead Scoring', 'Subscriptions', 'User Analytics', 'Support Bot'],
    previewStack: [
      { id: 'scoring', name: 'Lead Scoring Engine', detail: 'AI lead qualification & routing', icon: Target },
      { id: 'billing', name: 'Stripe Subscription Sync', detail: 'MRR & subscription billing', icon: DollarSign },
      { id: 'analytics', name: 'Product Analytics', detail: 'Funnel & retention tracking', icon: BarChart3 },
      { id: 'support', name: 'Support AI Bot', detail: 'Automated customer onboarding', icon: MessageSquare }
    ],
    estTime: '2 min setup'
  },
  {
    id: 'consulting',
    label: 'Consulting Firm',
    icon: <Briefcase className="w-5 h-5 text-amber-500" />,
    badge: '95 templates included',
    description: 'Advisory, project billing, enterprise client management',
    apps: ['Client CRM', 'Contract Reviewer', 'Invoice Manager', 'Time Tracker'],
    previewStack: [
      { id: 'crm', name: 'Client CRM', detail: 'Enterprise account management', icon: Building2 },
      { id: 'legal', name: 'Legal Contract Reviewer', detail: 'AI risk & compliance scanner', icon: ShieldCheck },
      { id: 'invoice', name: 'Invoice Automation', detail: 'Milestone billing & PDF generation', icon: FileText }
    ],
    estTime: '3 min setup'
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    icon: <ShoppingBag className="w-5 h-5 text-emerald-500" />,
    badge: '80 templates included',
    description: 'Online store, products, fulfillment, customer support',
    apps: ['Order Sync', 'Customer Care Bot', 'Inventory AI', 'Review Engine'],
    previewStack: [
      { id: 'support', name: 'Customer Care Bot', detail: '24/7 AI chat & order tracking', icon: MessageSquare },
      { id: 'payments', name: 'Razorpay / Stripe Payments', detail: 'Instant checkout & payouts', icon: DollarSign },
      { id: 'reviews', name: 'Review & Feedback Engine', detail: 'Automated post-purchase survey', icon: Star }
    ],
    estTime: '4 min setup'
  },
  {
    id: 'education',
    label: 'Education / EdTech',
    icon: <GraduationCap className="w-5 h-5 text-purple-500" />,
    badge: '110 templates included',
    description: 'Courses, LMS, student placement, campus recruitment',
    apps: ['Student Portal', 'Placement AI', 'LMS Sync', 'Fees Manager'],
    previewStack: [
      { id: 'placement', name: 'Campus Placement Portal', detail: 'AI talent matching & hiring events', icon: GraduationCap },
      { id: 'alerts', name: 'Student Communication AI', detail: 'Multichannel updates & alerts', icon: Mail }
    ],
    estTime: '3 min setup'
  },
  {
    id: 'realestate',
    label: 'Real Estate',
    icon: <Home className="w-5 h-5 text-cyan-500" />,
    badge: '85 templates included',
    description: 'Properties, lead management, site visits, agent CRM',
    apps: ['Property CRM', 'Site Visit Scheduler', 'Lead Bot', 'Deals'],
    previewStack: [
      { id: 'visits', name: 'Site Visit Scheduler', detail: 'Agent calendar & visit booking', icon: Home },
      { id: 'whatsapp', name: 'WhatsApp Lead Bot', detail: 'Instant property brochure dispatch', icon: MessageSquare }
    ],
    estTime: '3 min setup'
  },
  {
    id: 'restaurant',
    label: 'Restaurant / Food',
    icon: <UtensilsCrossed className="w-5 h-5 text-orange-500" />,
    badge: '60 templates included',
    description: 'Dine-in, delivery, menus, customer reviews, order bot',
    apps: ['Order Bot', 'Menu AI', 'Review Engine', 'Inventory'],
    previewStack: [
      { id: 'order', name: 'WhatsApp Order Bot', detail: 'Digital menu & order capture', icon: UtensilsCrossed },
      { id: 'reviews', name: 'Review Collector', detail: 'Google Maps review growth', icon: Star }
    ],
    estTime: '2 min setup'
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    icon: <Factory className="w-5 h-5 text-blue-500" />,
    badge: '90 templates included',
    description: 'Production, supply chain, B2B sales, vendor management',
    apps: ['Vendor Portal', 'B2B CRM', 'Supply Chain AI', 'Orders'],
    previewStack: [
      { id: 'b2b', name: 'B2B Sales CRM', detail: 'Quote generation & deal tracking', icon: Factory },
      { id: 'vendor', name: 'Vendor Portal', detail: 'PO tracking & delivery updates', icon: Building2 }
    ],
    estTime: '4 min setup'
  },
];

const BUSINESS_GOALS = [
  { id: 'grow_traffic', label: 'Get More Customers / Patients / Visitors', icon: <Globe className="w-4 h-4" />, description: 'SEO, social media, appointments, content marketing' },
  { id: 'hire_faster', label: 'Hire Staff & Doctors Faster', icon: <Users className="w-4 h-4" />, description: 'Job boards, candidate sourcing, ATS' },
  { id: 'increase_sales', label: 'Increase Revenue & Billing', icon: <TrendingUp className="w-4 h-4" />, description: 'CRM, proposals, follow-ups, payments' },
  { id: 'automate_ops', label: 'Automate Operations & Triage', icon: <Zap className="w-4 h-4" />, description: 'Reports, patient alerts, data entry, scheduling' },
  { id: 'improve_marketing', label: 'Improve Brand Awareness', icon: <Sparkles className="w-4 h-4" />, description: 'LinkedIn, Google Business, campaigns' },
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
    return localStorage.getItem('chatr_active_domain') || 'hospital';
  });

  const [step, setStep] = useState<SetupStep>(() => {
    if (forceReconfigure) return 'business_type';
    if (urlDomain) return 'done';
    const isCompleted = localStorage.getItem('chatr_setup_completed') === 'true';
    return isCompleted ? 'done' : 'business_type';
  });

  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set(['automate_ops', 'grow_traffic']));
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set(['ga4', 'gmail', 'google_calendar', 'linkedin', 'supabase', 'gemini']));
  const [searchQuery, setSearchQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Healthcare Interactive Modals State
  const [activeModal, setActiveModal] = useState<'appointment' | 'triage' | 'ehr' | 'lab' | null>(null);

  // Form states for Healthcare modals
  const [patientName, setPatientName] = useState('Rahul Verma');
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Sarah Jenkins (Cardiology)');
  const [appointmentDate, setAppointmentDate] = useState('2026-07-30');
  const [symptomsInput, setSymptomsInput] = useState('Severe headache, fever 102°F, light sensitivity');
  const [triageResult, setTriageResult] = useState<{ risk: string; dept: string; priority: string } | null>(null);
  const [labPatientPhone, setLabPatientPhone] = useState('+91 98765 43210');
  const [labTestType, setLabTestType] = useState('Complete Blood Count (CBC) + Lipid Profile');

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

  const handleCardClick = (appId?: string) => {
    if (selectedBusiness === 'hospital') {
      if (appId === 'appointment') setActiveModal('appointment');
      else if (appId === 'triage') setActiveModal('triage');
      else if (appId === 'ehr') setActiveModal('ehr');
      else if (appId === 'lab') setActiveModal('lab');
      else setActiveModal('appointment');
    } else {
      toast.info(`Opening ${appId || 'capability'} for ${selectedBizObj.label}`);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar flex-1 flex flex-col font-sans transition-colors bg-background text-foreground relative">
      
      {/* ── Top Header Bar ── */}
      <div className={`px-6 py-4 border-b flex items-center justify-between backdrop-blur-xl sticky top-0 z-40 ${isDark ? 'bg-[#0d0f1a]/90 border-white/10' : 'bg-white/90 border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => safeBack(navigate, '/desktop/chat')} className={`p-2 rounded-xl border transition-all cursor-pointer ${isDark ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer bg-card border-border hover:bg-muted text-muted-foreground"
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

          {/* ══ STEP 5 / DONE: CHATR INTENT-FIRST BUSINESS EXECUTION SURFACE ══ */}
          {step === 'done' && (
            <motion.div key="sdone" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-4xl mx-auto">
              
              {/* 1. CALM AI CONVERSATIONAL NARRATION BANNER */}
              <div className="p-7 rounded-3xl border bg-gradient-to-br from-violet-950/30 via-card to-card border-violet-500/20 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-400/50" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Operating Normally</span>
                    <span className="text-xs text-muted-foreground">· Pack: {selectedBizObj.label}</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">AI Handled 142 Tasks Overnight</span>
                </div>

                <div>
                  <h2 className="text-2xl font-black tracking-tight">Good Afternoon. Here is your business narration.</h2>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground font-medium leading-relaxed">
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Operational execution on track across {selectedBizObj.previewStack.length} active capability queues.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary shrink-0" />
                      <span>AI completed automated background checks and context updates.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>2 items require human approval gate confirmation before 4:00 PM.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. CORE 4-ANCHOR NAVIGATION */}
              <div className="flex items-center justify-between p-1.5 rounded-2xl bg-muted/40 border border-border/60">
                {[
                  { name: 'Mission', icon: Target },
                  { name: 'Chat', icon: MessageSquare },
                  { name: 'Work', icon: Briefcase },
                  { name: 'Organization', icon: Building2 }
                ].map((anchor, idx) => {
                  const Icon = anchor.icon;
                  return (
                    <button
                      key={anchor.name}
                      onClick={() => toast.info(`Switched to ${anchor.name} surface`)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        idx === 0 ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-card'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{anchor.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* 3. HERO INTENT EXECUTION CANVAS (LIKE CHATGPT / CURSOR FOR BUSINESS) */}
              <div className="p-8 rounded-3xl border bg-card border-border space-y-6 shadow-xl text-center">
                <div className="space-y-2 max-w-xl mx-auto">
                  <h3 className="text-xl md:text-2xl font-black tracking-tight">What would you like your business to accomplish?</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Type any business goal. CHATR parses context, composes execution graphs, and manages execution across capabilities.
                  </p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    setIsThinking(true);
                    chatrOS.submitIntent(searchQuery);
                    toast.success(`Planning execution graph for: "${searchQuery}"`);
                    setTimeout(() => setIsThinking(false), 2500);
                  }
                }} className="relative max-w-2xl mx-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. 'Hire two React developers', 'Collect overdue invoices', 'Prepare payroll'..."
                    className="w-full px-6 py-5 rounded-2xl bg-background border-2 border-primary/30 text-sm focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground shadow-2xl pr-32 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={isThinking}
                    className="absolute right-3 top-3 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {isThinking ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Execute</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Thinking Out Loud Progress Stream */}
                {isThinking && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs space-y-2 max-w-xl mx-auto text-left">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Thinking Out Loud — Executing Graph Pipeline...</span>
                    </div>
                    <div className="space-y-1 text-muted-foreground font-mono text-[11px]">
                      <p>✓ 1. Resolving intent and organizational context...</p>
                      <p>✓ 2. Consulting Capability Registry ({selectedBizObj.previewStack.length} capabilities active)...</p>
                      <p>⏳ 3. Composing multi-capability execution graph...</p>
                    </div>
                  </motion.div>
                )}

                {/* Suggested Intent Chips */}
                <div className="pt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground block mb-3">Or choose a suggested business intent</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      'Hire two React developers',
                      'Collect overdue invoices',
                      'Review today\'s priorities',
                      'Prepare payroll',
                      'Check patient wait times',
                      'Launch marketing campaign'
                    ].map((suggested, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(suggested);
                          chatrOS.submitIntent(suggested);
                          toast.success(`Selected intent: "${suggested}"`);
                        }}
                        className="px-3.5 py-2 rounded-xl border bg-muted/30 border-border/80 hover:border-primary text-xs font-semibold hover:text-primary transition-all cursor-pointer"
                      >
                        {suggested}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. ACTIVE WORK QUEUES & RECENT EXECUTIONS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Work Queues</h3>
                  <span className="text-xs text-emerald-400 font-bold">● Capability Engine Standing By</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedBizObj.previewStack.map((app, idx) => {
                    const Icon = app.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleCardClick(app.id)}
                        className="p-5 rounded-3xl border space-y-4 transition-all hover:scale-[1.02] bg-card border-border shadow-sm hover:border-primary cursor-pointer group text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold text-emerald-500 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            Ready
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{app.name}</h4>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{app.detail}</p>
                        </div>
                        <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                          <span className="text-[11px] font-extrabold text-primary">Open Work Queue →</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

        {/* ══ INTERACTIVE HEALTHCARE MODALS ══ */}

        {/* 1. Patient Appointment Scheduler Modal */}
        {activeModal === 'appointment' && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Patient Appointment Scheduler</h3>
                    <p className="text-xs text-muted-foreground">Schedule doctor consultation & sync slots</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Patient Full Name</label>
                  <input
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Select Doctor & Department</label>
                  <select
                    value={selectedDoctor}
                    onChange={e => setSelectedDoctor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:border-primary"
                  >
                    <option value="Dr. Sarah Jenkins (Cardiology)">Dr. Sarah Jenkins (Cardiology)</option>
                    <option value="Dr. Rajesh Kumar (Neurology)">Dr. Rajesh Kumar (Neurology)</option>
                    <option value="Dr. Ananya Sharma (General Medicine)">Dr. Ananya Sharma (General Medicine)</option>
                    <option value="Dr. Michael Chen (Orthopedics)">Dr. Michael Chen (Orthopedics)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">Appointment Date</label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={e => setAppointmentDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">Time Slot</label>
                    <select className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:border-primary">
                      <option>10:00 AM - 10:30 AM</option>
                      <option>11:30 AM - 12:00 PM</option>
                      <option>03:00 PM - 03:30 PM</option>
                      <option>05:00 PM - 05:30 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-muted-foreground">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success(`Appointment confirmed for ${patientName} with ${selectedDoctor}!`);
                    setActiveModal(null);
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20"
                >
                  Confirm Appointment Booking
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. AI Medical Triage Bot Drawer */}
        {activeModal === 'triage' && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">AI Medical Symptom Triage Bot</h3>
                    <p className="text-xs text-muted-foreground">Symptom scoring & emergency care routing</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Enter Patient Symptoms</label>
                  <textarea
                    rows={3}
                    value={symptomsInput}
                    onChange={e => setSymptomsInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:outline-none focus:border-primary"
                    placeholder="Describe symptoms..."
                  />
                </div>

                {triageResult && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> Risk Score: {triageResult.risk}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px]">
                        Priority: {triageResult.priority}
                      </span>
                    </div>
                    <p className="text-xs font-semibold">Recommended Dept: <strong className="text-foreground">{triageResult.dept}</strong></p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-muted-foreground">
                  Close
                </button>
                <button
                  onClick={() => {
                    setTriageResult({ risk: 'HIGH (88%)', dept: 'Emergency Cardiology', priority: 'CODE RED - Immediate Attending' });
                    toast.warning('Triage analysis complete: High Risk Priority');
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20"
                >
                  Run AI Symptom Triage
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 3. Patient Records & EHR Modal */}
        {activeModal === 'ehr' && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Patient Records & EHR Database</h3>
                    <p className="text-xs text-muted-foreground">HIPAA compliant medical histories & prescriptions</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Rahul Verma (#P-8821)', age: 42, dept: 'Cardiology', allergy: 'Penicillin', blood: 'O+', status: 'Active Admitted' },
                  { name: 'Sunita Patel (#P-9042)', age: 35, dept: 'Neurology', allergy: 'None', blood: 'B+', status: 'Outpatient' },
                  { name: 'Amit Sharma (#P-7731)', age: 58, dept: 'Orthopedics', allergy: 'Sulfa Drugs', blood: 'A+', status: 'Discharged' },
                ].map((pt, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl border border-border bg-muted/40 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-foreground">{pt.name}</h4>
                      <p className="text-[10px] text-muted-foreground">Age {pt.age} · Dept: {pt.dept} · Blood: {pt.blood} · Allergy: {pt.allergy}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {pt.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button onClick={() => setActiveModal(null)} className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                  Done Viewing Records
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 4. Lab Test Dispatch Modal */}
        {activeModal === 'lab' && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Lab Test WhatsApp Dispatch</h3>
                    <p className="text-xs text-muted-foreground">Instant automated report notifications</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Lab Test Report Type</label>
                  <select
                    value={labTestType}
                    onChange={e => setLabTestType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:border-primary"
                  >
                    <option value="Complete Blood Count (CBC) + Lipid Profile">Complete Blood Count (CBC) + Lipid Profile</option>
                    <option value="COVID-19 RT-PCR Test">COVID-19 RT-PCR Test</option>
                    <option value="MRI Brain Scan Report">MRI Brain Scan Report</option>
                    <option value="Thyroid Profile (T3 T4 TSH)">Thyroid Profile (T3 T4 TSH)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Patient WhatsApp Number</label>
                  <input
                    value={labPatientPhone}
                    onChange={e => setLabPatientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-muted-foreground">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success(`Lab report dispatched to ${labPatientPhone} via WhatsApp! Tracking ID: #LAB-${Math.floor(Math.random()*9000+1000)}`);
                    setActiveModal(null);
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                >
                  Dispatch Results via WhatsApp
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}

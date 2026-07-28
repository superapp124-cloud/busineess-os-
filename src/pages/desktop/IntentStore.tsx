import React, { useState } from 'react';
import {
  Search, Star, CheckCircle, Sparkles, Briefcase, Code, Stethoscope,
  TrendingUp, Users, FileText, Zap, Globe, GitBranch, Database,
  Shield, ArrowRight, Play, X, Building2, Calendar, MessageSquare,
  Phone, ChevronRight, Award, Lock, Clock, IndianRupee, Package,
  Layers, Bot, Hash, Mail, Slack, Github, BarChart2, UserCheck,
  Plane, HeartPulse, Scale, GraduationCap, Store, Cpu, BadgeCheck,
  Workflow, RefreshCw, PlusCircle, CheckSquare, Loader2
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────── */
type TabId = 'featured' | 'agents' | 'workflows' | 'connectors' | 'templates' | 'enterprise' | 'developer';
type PriceModel = 'Free' | 'Premium' | 'Pay-per-use' | 'Enterprise' | 'Revenue Share';

interface IntentItem {
  id: string;
  name: string;
  creator: string;
  description: string;
  rating: number;
  reviews: number;
  category: string;
  priceModel: PriceModel;
  priceLabel: string;
  icon: React.ReactNode;
  installed: boolean;
  verified: boolean;
  privacyLevel: 'High' | 'Standard';
  dataResidency: string;
  aiModel: string;
  estimatedTime: string;
  permissions: string[];
  deploySteps?: string[];
  tags?: string[];
}

/* ─── Data ───────────────────────────────────────────────────────────── */

const AGENTS: IntentItem[] = [
  {
    id: 'a1', name: 'RecruitmentOS Agent', creator: 'CHATR Core',
    description: 'End-to-end talent acquisition. Sources candidates from LinkedIn & GitHub, runs AI screening, schedules interviews and drafts offer letters automatically.',
    rating: 4.9, reviews: 1248, category: 'HR & Recruitment', priceModel: 'Free', priceLabel: 'Free',
    icon: <Users className="w-7 h-7" />, installed: true, verified: true,
    privacyLevel: 'High', dataResidency: 'India / EU', aiModel: 'Gemini 1.5 Pro',
    estimatedTime: '2–10 min/task', permissions: ['Calendar', 'Email', 'LinkedIn', 'Files'],
    deploySteps: ['Create Recruitment Workspace', 'Connect LinkedIn & Gmail', 'Install ATS Pipeline', 'Set up screening workflows', 'Enable analytics dashboard'],
    tags: ['HR', 'Recruitment', 'ATS']
  },
  {
    id: 'a2', name: 'Legal Contract Reviewer', creator: 'LexAI Partners',
    description: 'Reads NDAs, MSAs and employment contracts. Highlights liabilities, non-standard clauses and risk areas with cited references.',
    rating: 4.7, reviews: 892, category: 'Legal', priceModel: 'Premium', priceLabel: '₹4,999/mo',
    icon: <Scale className="w-7 h-7" />, installed: false, verified: true,
    privacyLevel: 'High', dataResidency: 'India Only', aiModel: 'Claude 3.5 Sonnet',
    estimatedTime: '3–8 min/contract', permissions: ['Documents', 'Files'],
    deploySteps: ['Install Legal Agent', 'Connect document storage', 'Configure review templates', 'Enable alerts'],
    tags: ['Legal', 'Contracts', 'Risk']
  },
  {
    id: 'a3', name: 'Sales Intelligence Agent', creator: 'CHATR Core',
    description: 'Analyzes your CRM pipeline, identifies warm leads, drafts outreach sequences and surfaces deal-winning intelligence from past conversations.',
    rating: 4.8, reviews: 673, category: 'Sales', priceModel: 'Premium', priceLabel: '₹3,499/mo',
    icon: <TrendingUp className="w-7 h-7" />, installed: false, verified: true,
    privacyLevel: 'Standard', dataResidency: 'Global', aiModel: 'GPT-4o',
    estimatedTime: '1–3 min/lead', permissions: ['CRM', 'Email', 'Calendar'],
    deploySteps: ['Connect CRM', 'Import pipeline', 'Configure sequences', 'Enable scoring'],
    tags: ['Sales', 'CRM', 'Lead Gen']
  },
  {
    id: 'a4', name: 'Finance & Accounting Agent', creator: 'CHATR Core',
    description: 'Automates invoice processing, GST reminders, expense approvals and financial reporting. Alerts on anomalies and cash-flow risks.',
    rating: 4.8, reviews: 521, category: 'Finance', priceModel: 'Free', priceLabel: 'Free',
    icon: <IndianRupee className="w-7 h-7" />, installed: false, verified: true,
    privacyLevel: 'High', dataResidency: 'India Only', aiModel: 'Gemini 1.5 Flash',
    estimatedTime: '1–5 min/invoice', permissions: ['Finance', 'Email', 'Files'],
    deploySteps: ['Connect accounting system', 'Configure tax rules', 'Set approval workflows', 'Enable alerts'],
    tags: ['Finance', 'Accounting', 'GST']
  },
  {
    id: 'a5', name: 'Medical Triage Assistant', creator: 'HealthTech Solutions',
    description: 'HIPAA-compliant agent that conducts preliminary patient symptom screening, routes cases by urgency and updates EMR systems.',
    rating: 4.6, reviews: 334, category: 'Healthcare', priceModel: 'Pay-per-use', priceLabel: '₹50/session',
    icon: <HeartPulse className="w-7 h-7" />, installed: false, verified: true,
    privacyLevel: 'High', dataResidency: 'India Only', aiModel: 'Custom Medical LLM',
    estimatedTime: '3–5 min/patient', permissions: ['Patient Records', 'Messaging'],
    deploySteps: ['HIPAA onboarding', 'Connect EMR', 'Configure triage rules', 'Enable routing'],
    tags: ['Healthcare', 'HIPAA', 'Triage']
  },
  {
    id: 'a6', name: 'Marketing Strategist Agent', creator: 'GrowthOS Lab',
    description: 'Plans campaigns, writes copy, schedules social posts, analyzes performance and iterates based on engagement data.',
    rating: 4.5, reviews: 287, category: 'Marketing', priceModel: 'Premium', priceLabel: '₹2,999/mo',
    icon: <BarChart2 className="w-7 h-7" />, installed: false, verified: false,
    privacyLevel: 'Standard', dataResidency: 'Global', aiModel: 'GPT-4o',
    estimatedTime: '5–15 min/campaign', permissions: ['Social Accounts', 'Analytics', 'Email'],
    deploySteps: ['Connect social accounts', 'Import brand kit', 'Set campaign goals', 'Enable analytics'],
    tags: ['Marketing', 'Social', 'Campaigns']
  },
];

const WORKFLOWS: IntentItem[] = [
  {
    id: 'w1', name: 'Employee Onboarding', creator: 'CHATR Core',
    description: 'Automates the full onboarding journey from offer acceptance to 90-day check-in. Creates accounts, assigns tasks, schedules introductions.',
    rating: 4.9, reviews: 892, category: 'HR & Ops', priceModel: 'Free', priceLabel: 'Free',
    icon: <UserCheck className="w-7 h-7" />, installed: false, verified: true,
    privacyLevel: 'High', dataResidency: 'India / EU', aiModel: 'Rule-based + AI',
    estimatedTime: 'Runs over 90 days', permissions: ['HR System', 'Email', 'Calendar', 'Slack'],
    tags: ['HR', 'Onboarding']
  },
  {
    id: 'w2', name: 'Invoice Approval Pipeline', creator: 'CHATR Core',
    description: 'Routes invoices through multi-level approval, validates against POs, sends reminders and posts to accounting on approval.',
    rating: 4.8, reviews: 654, category: 'Finance', priceModel: 'Free', priceLabel: 'Free',
    icon: <FileText className="w-7 h-7" />, installed: false, verified: true,
    privacyLevel: 'High', dataResidency: 'India Only', aiModel: 'Rule-based',
    estimatedTime: '1–48 hrs/invoice', permissions: ['Finance', 'Email'],
    tags: ['Finance', 'Approval']
  },
  {
    id: 'w3', name: 'Lead Qualification Pipeline', creator: 'SalesTech Co.',
    description: 'Scores inbound leads using firmographic and behavioral signals, routes hot leads to sales and nurtures cold leads automatically.',
    rating: 4.7, reviews: 421, category: 'Sales', priceModel: 'Premium', priceLabel: '₹1,999/mo',
    icon: <TrendingUp className="w-7 h-7" />, installed: false, verified: true,
    privacyLevel: 'Standard', dataResidency: 'Global', aiModel: 'Scoring Model',
    estimatedTime: '< 2 min/lead', permissions: ['CRM', 'Email'],
    tags: ['Sales', 'Leads']
  },
  {
    id: 'w4', name: 'Travel Approval Workflow', creator: 'CHATR Core',
    description: 'Handles travel requests, finds cheapest fares, gets manager approval and books flights + hotels within policy limits.',
    rating: 4.6, reviews: 287, category: 'Operations', priceModel: 'Free', priceLabel: 'Free',
    icon: <Plane className="w-7 h-7" />, installed: false, verified: true,
    privacyLevel: 'Standard', dataResidency: 'India / EU', aiModel: 'Gemini + Rules',
    estimatedTime: '2–6 hrs/request', permissions: ['Calendar', 'Email', 'Travel APIs'],
    tags: ['Travel', 'Ops']
  },
];

const CONNECTORS: IntentItem[] = [
  { id: 'c1', name: 'Gmail', creator: 'Google', description: 'Sync emails, draft AI replies, trigger workflows on email events.', rating: 4.9, reviews: 15400, category: 'Email', priceModel: 'Free', priceLabel: 'Free', icon: <Mail className="w-7 h-7" />, installed: true, verified: true, privacyLevel: 'High', dataResidency: 'US / EU', aiModel: 'N/A', estimatedTime: 'Real-time', permissions: ['Gmail OAuth'], tags: ['Email', 'Google'] },
  { id: 'c2', name: 'Slack', creator: 'Salesforce', description: 'Post alerts, receive commands and sync workspace activity to Slack channels.', rating: 4.8, reviews: 9800, category: 'Messaging', priceModel: 'Free', priceLabel: 'Free', icon: <Slack className="w-7 h-7" />, installed: false, verified: true, privacyLevel: 'High', dataResidency: 'US / EU', aiModel: 'N/A', estimatedTime: 'Real-time', permissions: ['Slack OAuth'], tags: ['Messaging', 'Slack'] },
  { id: 'c3', name: 'GitHub', creator: 'Microsoft', description: 'Trigger agents on PR events, review code and sync issues to your workspace.', rating: 4.7, reviews: 6200, category: 'Engineering', priceModel: 'Free', priceLabel: 'Free', icon: <Github className="w-7 h-7" />, installed: false, verified: true, privacyLevel: 'Standard', dataResidency: 'US', aiModel: 'N/A', estimatedTime: 'Real-time', permissions: ['GitHub OAuth'], tags: ['Engineering', 'GitHub'] },
  { id: 'c4', name: 'Salesforce CRM', creator: 'Salesforce', description: 'Bi-directional sync of leads, contacts and deals with AI-powered enrichment.', rating: 4.6, reviews: 4100, category: 'CRM', priceModel: 'Premium', priceLabel: '₹999/mo', icon: <Database className="w-7 h-7" />, installed: false, verified: true, privacyLevel: 'High', dataResidency: 'US / EU / IN', aiModel: 'N/A', estimatedTime: 'Near real-time', permissions: ['Salesforce OAuth'], tags: ['CRM', 'Salesforce'] },
  { id: 'c5', name: 'WhatsApp Business', creator: 'Meta', description: 'Send AI-powered WhatsApp messages, receive customer queries and route to agents.', rating: 4.8, reviews: 8700, category: 'Messaging', priceModel: 'Pay-per-use', priceLabel: '₹0.50/message', icon: <Phone className="w-7 h-7" />, installed: false, verified: true, privacyLevel: 'High', dataResidency: 'India', aiModel: 'N/A', estimatedTime: 'Real-time', permissions: ['WhatsApp Business API'], tags: ['Messaging', 'WhatsApp'] },
  { id: 'c6', name: 'SAP ERP', creator: 'SAP SE', description: 'Connect financial, HR and supply chain data from SAP to your Intent OS workspace.', rating: 4.5, reviews: 1200, category: 'ERP', priceModel: 'Enterprise', priceLabel: 'Contact Sales', icon: <Building2 className="w-7 h-7" />, installed: false, verified: true, privacyLevel: 'High', dataResidency: 'On-Premise / EU', aiModel: 'N/A', estimatedTime: 'Batch / Real-time', permissions: ['SAP API Key'], tags: ['ERP', 'SAP'] },
];

const TEMPLATES: IntentItem[] = [
  { id: 't1', name: 'Startup Workspace', creator: 'CHATR Core', description: 'Pre-configured workspace for early-stage startups. Includes CRM, recruitment, finance and project management.', rating: 4.9, reviews: 2100, category: 'Startup', priceModel: 'Free', priceLabel: 'Free', icon: <Zap className="w-7 h-7" />, installed: false, verified: true, privacyLevel: 'Standard', dataResidency: 'India / Global', aiModel: 'Multiple', estimatedTime: 'Deploy in 5 min', permissions: ['Email', 'Calendar', 'CRM'], deploySteps: ['Create Startup workspace', 'Install 3 core agents', 'Connect Gmail & Calendar', 'Enable CRM pipeline', 'Set up growth dashboard'], tags: ['Startup', 'All-in-one'] },
  { id: 't2', name: 'Law Firm OS', creator: 'LexAI Partners', description: 'Complete legal operations suite. Contract review, client intake, billing, compliance tracking and matter management.', rating: 4.8, reviews: 543, category: 'Legal', priceModel: 'Enterprise', priceLabel: 'From ₹24,999/mo', icon: <Scale className="w-7 h-7" />, installed: false, verified: true, privacyLevel: 'High', dataResidency: 'India Only', aiModel: 'Claude 3.5 Sonnet', estimatedTime: 'Deploy in 30 min', permissions: ['Files', 'Email', 'Billing'], deploySteps: ['Create Legal workspace', 'Install Contract Reviewer', 'Set up matter management', 'Configure billing pipeline', 'Enable compliance alerts'], tags: ['Legal', 'Enterprise'] },
  { id: 't3', name: 'Recruitment Agency', creator: 'CHATR Core', description: 'Full-stack ATS, candidate pipeline, client management and revenue tracking for recruitment agencies.', rating: 4.9, reviews: 876, category: 'HR', priceModel: 'Premium', priceLabel: '₹12,999/mo', icon: <Users className="w-7 h-7" />, installed: false, verified: true, privacyLevel: 'High', dataResidency: 'India / EU', aiModel: 'Gemini 1.5 Pro', estimatedTime: 'Deploy in 15 min', permissions: ['LinkedIn', 'Email', 'Calendar', 'CRM'], deploySteps: ['Create Agency workspace', 'Install RecruitmentOS Agent', 'Connect LinkedIn & Job Boards', 'Set up client portal', 'Enable revenue analytics'], tags: ['Recruitment', 'Agency'] },
  { id: 't4', name: 'Hospital OS', creator: 'HealthTech Solutions', description: 'HIPAA-compliant hospital workspace. Patient intake, triage, appointment scheduling and EMR integration.', rating: 4.7, reviews: 312, category: 'Healthcare', priceModel: 'Enterprise', priceLabel: 'Contact Sales', icon: <HeartPulse className="w-7 h-7" />, installed: false, verified: true, privacyLevel: 'High', dataResidency: 'India Only', aiModel: 'Custom Medical LLM', estimatedTime: 'Deploy in 2 hrs', permissions: ['Patient Records', 'Messaging', 'EMR'], deploySteps: ['HIPAA onboarding', 'Install Medical Triage Agent', 'Connect EMR system', 'Set up appointment system', 'Configure routing rules'], tags: ['Healthcare', 'HIPAA'] },
];

/* ─── Sub-components ─────────────────────────────────────────────────── */

const PriceBadge: React.FC<{ model: PriceModel; label: string }> = ({ model, label }) => {
  const styles: Record<PriceModel, string> = {
    'Free': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    'Premium': 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    'Pay-per-use': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    'Enterprise': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    'Revenue Share': 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${styles[model]}`}>
      {label}
    </span>
  );
};

const TrustSignals: React.FC<{ item: IntentItem }> = ({ item }) => (
  <div className="grid grid-cols-2 gap-1.5 mt-3 pt-3 border-t border-white/5">
    {item.verified && (
      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
        <BadgeCheck className="w-3 h-3 shrink-0" />
        <span>Verified by CHATR</span>
      </div>
    )}
    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
      <Lock className="w-3 h-3 shrink-0" />
      <span>{item.privacyLevel} Privacy</span>
    </div>
    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
      <Globe className="w-3 h-3 shrink-0" />
      <span>{item.dataResidency}</span>
    </div>
    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
      <Cpu className="w-3 h-3 shrink-0" />
      <span>{item.aiModel}</span>
    </div>
    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
      <Clock className="w-3 h-3 shrink-0" />
      <span>{item.estimatedTime}</span>
    </div>
    {item.permissions.length > 0 && (
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 col-span-2">
        <Shield className="w-3 h-3 shrink-0" />
        <span className="truncate">Needs: {item.permissions.slice(0, 3).join(', ')}</span>
      </div>
    )}
  </div>
);

const ItemCard: React.FC<{
  item: IntentItem;
  onDeploy: (item: IntentItem) => void;
  colorClass?: string;
}> = ({ item, onDeploy, colorClass = 'text-indigo-400 bg-indigo-500/15 border-indigo-500/25' }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="group relative rounded-2xl border border-white/8 bg-[#0e1017] hover:border-white/15 hover:bg-[#13151f] transition-all duration-200 p-5 flex flex-col gap-3 cursor-pointer"
      onClick={() => setExpanded(e => !e)}
    >
      {/* Top Row */}
      <div className="flex items-start gap-3.5">
        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>
            {item.verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
          </div>
          <p className="text-[11px] text-slate-500">By {item.creator}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold text-amber-400">{item.rating}</span>
            <span className="text-[10px] text-slate-500">({item.reviews.toLocaleString()})</span>
          </div>
        </div>
        <PriceBadge model={item.priceModel} label={item.priceLabel} />
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>

      {/* Tags */}
      {item.tags && (
        <div className="flex flex-wrap gap-1">
          {item.tags.map(t => (
            <span key={t} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-500 border border-white/5">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Expanded trust signals */}
      {expanded && <TrustSignals item={item} />}

      {/* Action button */}
      <div className="flex items-center justify-between pt-1">
        <button
          className="text-[10px] text-slate-500 hover:text-white transition-colors flex items-center gap-1"
          onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
        >
          {expanded ? 'Less info' : 'More info'}
          <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>

        {item.installed ? (
          <button
            onClick={e => { e.stopPropagation(); }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold cursor-default"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Installed
          </button>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onDeploy(item); }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            {item.deploySteps ? 'Deploy' : 'Connect'}
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Deploy Modal ─────────────────────────────────────────────────────── */
const DeployModal: React.FC<{
  item: IntentItem;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const [step, setStep] = useState(-1); // -1 = preview, 0..n = deploying
  const [done, setDone] = useState(false);
  const steps = item.deploySteps || ['Installing', 'Configuring', 'Activating'];

  const startDeploy = () => {
    setStep(0);
    steps.forEach((_, i) => {
      setTimeout(() => {
        setStep(i + 1);
        if (i === steps.length - 1) {
          setTimeout(() => setDone(true), 600);
        }
      }, (i + 1) * 1400);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#0d0f1a] shadow-2xl p-6 flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            {item.icon}
          </div>
          <div>
            <h2 className="text-base font-black text-white">{item.name}</h2>
            <p className="text-xs text-slate-400">One-Click Deployment</p>
          </div>
        </div>

        {!done ? (
          <>
            {/* Steps */}
            <div className="flex flex-col gap-2">
              {steps.map((s, i) => {
                const isComplete = step > i;
                const isActive = step === i;
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                    isComplete ? 'border-emerald-500/30 bg-emerald-500/5' :
                    isActive ? 'border-indigo-500/40 bg-indigo-500/8 animate-pulse' :
                    'border-white/5 bg-white/[0.02]'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isComplete ? 'bg-emerald-500/20 text-emerald-400' :
                      isActive ? 'bg-indigo-500/20 text-indigo-400' :
                      'bg-white/5 text-slate-500'
                    }`}>
                      {isComplete ? <CheckCircle className="w-3.5 h-3.5" /> :
                       isActive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                       <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                    <span className={`text-xs font-semibold ${
                      isComplete ? 'text-emerald-300' : isActive ? 'text-white' : 'text-slate-500'
                    }`}>{s}</span>
                  </div>
                );
              })}
            </div>

            {/* Permissions */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Permissions Required</p>
              <div className="flex flex-wrap gap-1.5">
                {item.permissions.map(p => (
                  <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">{p}</span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm font-semibold hover:border-white/20 hover:text-white transition-all cursor-pointer">
                Cancel
              </button>
              {step === -1 && (
                <button
                  onClick={startDeploy}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/30 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Deploy Now
                </button>
              )}
            </div>
          </>
        ) : (
          /* Success State */
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-white mb-1">Deployed Successfully!</h3>
              <p className="text-sm text-slate-400">
                <span className="text-white font-semibold">{item.name}</span> is now active in your Intent OS workspace.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold cursor-pointer hover:from-emerald-500 hover:to-teal-500 transition-all"
            >
              Open Workspace →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Featured Tab ─────────────────────────────────────────────────────── */
const FeaturedTab: React.FC<{ onDeploy: (item: IntentItem) => void }> = ({ onDeploy }) => (
  <div className="flex flex-col gap-8">
    {/* Hero Banner */}
    <div className="relative rounded-3xl overflow-hidden p-8 min-h-[200px] flex flex-col justify-end"
      style={{ background: 'linear-gradient(135deg, #1a0c3a 0%, #0f0d2a 40%, #060c1e 100%)' }}>
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-violet-600/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-96 h-96 bg-indigo-600/15 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 border border-white/10 rounded-3xl pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-violet-400 bg-violet-500/15 border border-violet-500/25 px-2.5 py-1 rounded-full">New Release</span>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">RecruitmentOS Agent v2.0</h2>
        <p className="text-sm text-white/60 max-w-lg mb-4">The most advanced end-to-end talent acquisition agent. Now with AI video interview summaries and offer letter generation.</p>
        <button
          onClick={() => onDeploy(AGENTS[0])}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          Deploy Free
        </button>
      </div>
    </div>

    {/* Collections */}
    <div>
      <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">Featured Collections</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Startup Pack', count: '8 items', icon: <Zap className="w-5 h-5" />, color: 'from-violet-600/20 to-indigo-600/20 border-indigo-500/25 text-indigo-300' },
          { label: 'Enterprise Suite', count: '14 items', icon: <Building2 className="w-5 h-5" />, color: 'from-blue-600/20 to-cyan-600/20 border-blue-500/25 text-blue-300' },
          { label: 'Legal & Compliance', count: '5 items', icon: <Scale className="w-5 h-5" />, color: 'from-slate-600/20 to-slate-700/20 border-slate-500/25 text-slate-300' },
          { label: 'Healthcare OS', count: '6 items', icon: <HeartPulse className="w-5 h-5" />, color: 'from-red-600/20 to-rose-600/20 border-red-500/25 text-red-300' },
        ].map((c, i) => (
          <button key={i} className={`p-4 rounded-2xl border bg-gradient-to-br ${c.color} hover:scale-[1.02] transition-all cursor-pointer text-left flex flex-col gap-2`}>
            <div className="opacity-80">{c.icon}</div>
            <div>
              <p className="text-sm font-bold text-white">{c.label}</p>
              <p className="text-[10px] text-slate-400">{c.count}</p>
            </div>
          </button>
        ))}
      </div>
    </div>

    {/* Top Agents */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Top Intent Agents</h3>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer">View all <ArrowRight className="w-3.5 h-3.5" /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {AGENTS.slice(0, 4).map(agent => (
          <ItemCard key={agent.id} item={agent} onDeploy={onDeploy} colorClass="text-indigo-400 bg-indigo-500/15 border-indigo-500/25" />
        ))}
      </div>
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────── */
const TAB_CONFIG: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
  { id: 'featured', label: 'Featured', icon: <Star className="w-3.5 h-3.5" /> },
  { id: 'agents', label: 'Agents', icon: <Bot className="w-3.5 h-3.5" />, count: AGENTS.length },
  { id: 'workflows', label: 'Workflows', icon: <Workflow className="w-3.5 h-3.5" />, count: WORKFLOWS.length },
  { id: 'connectors', label: 'Connectors', icon: <Globe className="w-3.5 h-3.5" />, count: CONNECTORS.length },
  { id: 'templates', label: 'Templates', icon: <Layers className="w-3.5 h-3.5" />, count: TEMPLATES.length },
  { id: 'enterprise', label: 'Enterprise', icon: <Building2 className="w-3.5 h-3.5" /> },
  { id: 'developer', label: 'Developer', icon: <Code className="w-3.5 h-3.5" /> },
];

const CATEGORY_COLORS: Record<string, string> = {
  'HR & Recruitment': 'text-blue-400 bg-blue-500/15 border-blue-500/25',
  'Legal': 'text-slate-300 bg-slate-500/15 border-slate-500/25',
  'Sales': 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
  'Finance': 'text-amber-400 bg-amber-500/15 border-amber-500/25',
  'Healthcare': 'text-red-400 bg-red-500/15 border-red-500/25',
  'Marketing': 'text-pink-400 bg-pink-500/15 border-pink-500/25',
  'HR & Ops': 'text-blue-400 bg-blue-500/15 border-blue-500/25',
  'Operations': 'text-cyan-400 bg-cyan-500/15 border-cyan-500/25',
  'Email': 'text-red-400 bg-red-500/15 border-red-500/25',
  'Messaging': 'text-green-400 bg-green-500/15 border-green-500/25',
  'Engineering': 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
  'CRM': 'text-blue-400 bg-blue-500/15 border-blue-500/25',
  'ERP': 'text-orange-400 bg-orange-500/15 border-orange-500/25',
  'Startup': 'text-violet-400 bg-violet-500/15 border-violet-500/25',
  'HR': 'text-blue-400 bg-blue-500/15 border-blue-500/25',
};

export const IntentStore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [deployItem, setDeployItem] = useState<IntentItem | null>(null);

  const filterItems = (items: IntentItem[]) =>
    items.filter(i =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const renderGrid = (items: IntentItem[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {filterItems(items).map(item => (
        <ItemCard
          key={item.id}
          item={item}
          onDeploy={setDeployItem}
          colorClass={CATEGORY_COLORS[item.category] || 'text-indigo-400 bg-indigo-500/15 border-indigo-500/25'}
        />
      ))}
    </div>
  );

  return (
    <div
      className="flex flex-col h-full overflow-hidden text-white"
      style={{ background: '#080a10', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* ── Header ── */}
      <div className="flex-shrink-0 px-8 pt-8 pb-5" style={{ borderBottom: '1px solid #ffffff0d' }}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                <Store className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Intent Store</h1>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">Ecosystem</span>
            </div>
            <p className="text-sm text-slate-400">Discover, deploy and orchestrate AI capabilities for your entire business.</p>
          </div>

          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search agents, workflows, connectors…"
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs text-white outline-none"
              style={{ background: '#ffffff0d', border: '1px solid #ffffff12' }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
        {activeTab === 'featured' && <FeaturedTab onDeploy={setDeployItem} />}
        {activeTab === 'agents' && renderGrid(AGENTS)}
        {activeTab === 'workflows' && renderGrid(WORKFLOWS)}
        {activeTab === 'connectors' && renderGrid(CONNECTORS)}
        {activeTab === 'templates' && renderGrid(TEMPLATES)}

        {activeTab === 'enterprise' && (
          <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white mb-2">Enterprise Deployments</h2>
              <p className="text-sm text-slate-400 max-w-md">Custom agent deployments, dedicated infrastructure, SLA guarantees, on-premise data residency and white-labelling for your organization.</p>
            </div>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/25 cursor-pointer">
              <Phone className="w-4 h-4" /> Contact Enterprise Sales
            </button>
          </div>
        )}

        {activeTab === 'developer' && (
          <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <Code className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white mb-2">Developer Program</h2>
              <p className="text-sm text-slate-400 max-w-md">Publish your agents, workflows and connectors to the Intent Store. Set your own pricing, keep 70% of revenue and reach thousands of businesses.</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-left w-full max-w-lg">
              {[
                { label: '70% Revenue Share', icon: <IndianRupee className="w-4 h-4" /> },
                { label: 'Intent OS SDK', icon: <Code className="w-4 h-4" /> },
                { label: 'Verified Badges', icon: <BadgeCheck className="w-4 h-4" /> },
              ].map((f, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 flex flex-col gap-2">
                  <div className="text-emerald-400">{f.icon}</div>
                  <p className="text-xs font-bold text-white">{f.label}</p>
                </div>
              ))}
            </div>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer">
              <PlusCircle className="w-4 h-4" /> Apply to Publish
            </button>
          </div>
        )}
      </div>

      {/* ── Deploy Modal ── */}
      {deployItem && (
        <DeployModal item={deployItem} onClose={() => setDeployItem(null)} />
      )}
    </div>
  );
};

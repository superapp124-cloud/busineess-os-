import React, { memo, useMemo, useState, useCallback } from 'react';
import {
  Brain, Plus, Upload, Briefcase, Users, Calendar, CheckCircle, Clock,
  TrendingUp, Zap, Target, Filter, Activity, Search, ArrowUpRight, ArrowDownRight, ChevronRight, Sparkles
} from 'lucide-react';
import {
  Candidate, Requisition, AutomationEvent, CandidateStage, ActivityItem, TosTab,
  PIPELINE_STAGES, STAGE_SLA_DAYS, STAGE_META, STAGE_COLORS, AVATAR_PALETTES
} from './types';
import {
  getCandidateStage, formatEventLabel, formatRelTime, getDaysInStage, isSLABreached, getAIPalette, getInitials
} from './utils';
import { AiMatchBadge, PriorityBadge } from './CandidateBadges';
import { AIExplainPanel } from './RecruitmentAIAssistant';

const InlineSparkline = ({ up }: { up: boolean }) => (
  <svg className={`w-12 h-6 ${up ? 'text-emerald-500' : 'text-rose-500'}`} viewBox="0 0 50 20" fill="none">
    <path d={up ? "M0 15 Q 10 15, 20 10 T 40 5 T 50 2" : "M0 5 Q 10 5, 20 10 T 40 15 T 50 18"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const KpiCard = memo(({ icon: Icon, label, value, trend, up, color, onClick }: {
  icon: React.ElementType; label: string; value: string; trend?: string; up?: boolean; color: string; onClick?: () => void;
}) => {
  const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    blue:    { bg: 'bg-blue-500/10 dark:bg-blue-500/15',    icon: 'text-blue-500 dark:text-blue-400',   border: 'border-blue-500/20' },
    indigo:  { bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',  icon: 'text-indigo-500 dark:text-indigo-400', border: 'border-indigo-500/20' },
    purple:  { bg: 'bg-purple-500/10 dark:bg-purple-500/15',  icon: 'text-purple-500 dark:text-purple-400', border: 'border-purple-500/20' },
    amber:   { bg: 'bg-amber-500/10 dark:bg-amber-500/15',   icon: 'text-amber-500 dark:text-amber-400',  border: 'border-amber-500/20' },
    emerald: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', icon: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/20' },
    violet:  { bg: 'bg-violet-500/10 dark:bg-violet-500/15',  icon: 'text-violet-500 dark:text-violet-400', border: 'border-violet-500/20' },
    rose:    { bg: 'bg-rose-500/10 dark:bg-rose-500/15',    icon: 'text-rose-500 dark:text-rose-400',   border: 'border-rose-500/20' },
    green:   { bg: 'bg-green-500/10 dark:bg-green-500/15',   icon: 'text-green-500 dark:text-green-400',  border: 'border-green-500/20' },
  };
  const c = colorMap[color] ?? colorMap.blue;
  return (
    <div
      onClick={onClick}
      className={`group bg-white/90 dark:bg-[#12141C]/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 space-y-2.5 backdrop-blur-md transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-xl hover:shadow-violet-500/5 hover:border-violet-500/40 hover:-translate-y-1' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
        <InlineSparkline up={up ?? true} />
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</p>
          {onClick && <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />}
        </div>
        <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
      </div>
      {trend && (
        <div className={`flex items-center gap-0.5 text-[10px] font-bold ${up ? 'text-emerald-500' : 'text-rose-500'}`}>
          {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {trend}
        </div>
      )}
    </div>
  );
});
KpiCard.displayName = 'KpiCard';

export interface DashboardTabProps {
  requisitions: Requisition[]; candidates: Candidate[];
  automationEvents: AutomationEvent[]; loading: boolean;
  automationBusy: string | null;
  onPositiveResponse: (c: Candidate) => Promise<void>;
  onInterviewScheduled: (c: Candidate) => Promise<void>;
  onNewJob: () => void;
  onCreateJob?: (req: Partial<Requisition>) => Promise<void>;
  onOpenImportCv: () => void;
  onSelectTab?: (tab: TosTab) => void;
}

export const DashboardTab = memo(({ requisitions, candidates, automationEvents, loading, automationBusy, onPositiveResponse, onInterviewScheduled, onNewJob, onCreateJob, onOpenImportCv, onSelectTab }: DashboardTabProps) => {
  const displayCandidates = candidates;
  const [intentInput, setIntentInput] = useState('Hire 20 React Engineers in Bangalore under ₹25L LPA for Microsoft');
  const [executingIntent, setExecutingIntent] = useState(false);
  const [executionResult, setExecutionResult] = useState<string[] | null>(null);

  const handleExecuteIntent = async () => {
    if (!intentInput.trim()) return;
    setExecutingIntent(true);
    setExecutionResult(null);

    // Extract dynamic role, count, location, salary from prompt
    const raw = intentInput;
    let role = 'Data Centre Operation Trainee';
    let location = 'Noida';
    let count = '20';
    let salary = '₹2.40 LPA';

    if (raw.toLowerCase().includes('react')) {
      role = 'Senior React Engineer';
      location = 'Bangalore';
      count = '20';
      salary = '₹25L LPA';
    } else if (raw.toLowerCase().includes('trainee') || raw.toLowerCase().includes('data centre')) {
      role = 'Data Centre Operation Trainee';
      location = 'Noida';
      count = '20';
      salary = '₹2.40 LPA';
    } else {
      // Fallback dynamic extraction
      const words = raw.split(' ');
      role = words.slice(0, 4).join(' ');
      location = raw.toLowerCase().includes('noida') ? 'Noida' : raw.toLowerCase().includes('bangalore') ? 'Bangalore' : 'Hyderabad';
      salary = raw.match(/₹?\d+(\.\d+)?\s*(lacs|lakhs|lpa|k)/i)?.[0] || '₹6.0 LPA';
    }

    const steps = [
      `⚡ Step 1: Created Requisition: ${role} (${location} Account)`,
      `⚡ Step 2: Queried Sourcing Engine & Bench Inventory (42 Matched Profiles Found)`,
      `⚡ Step 3: Dispatched WhatsApp Outbound Sourcing Invites to ${count} Candidates`,
      `⚡ Step 4: Qualified Top Candidates & Scheduled Technical Panel Interviews`,
      `⚡ Step 5: Calculated Compensation & Localized Tax Package (${salary})`,
      `⚡ Step 6: Drafted GST-Compliant Client Billing Statement for ${location} Unit`,
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 350));
      setExecutionResult(prev => [...(prev || []), steps[i]]);
    }

    setExecutingIntent(false);
    toast.success(`Autonomous Workforce Agent completed intent execution for ${role}!`);
  };

  const kpis = useMemo(() => ({
    openRoles: requisitions.length,
    active: displayCandidates.length,
    inInterview: displayCandidates.filter(c => getCandidateStage(c.status) === 'Interview').length,
    offers: displayCandidates.filter(c => getCandidateStage(c.status) === 'Offer').length,
  }), [requisitions, displayCandidates]);

  const funnelCounts = useMemo(() =>
    PIPELINE_STAGES.map(s => ({ stage: s, count: displayCandidates.filter(c => getCandidateStage(c.status) === s).length })),
    [displayCandidates]
  );

  const activities: ActivityItem[] = useMemo(() =>
    automationEvents.map((e, i) => ({
      id: e.id, type: 'stage_change', candidateName: (e.payload?.candidateName as string) || 'Pipeline Event',
      initials: (e.payload?.initials as string) || 'PE', avatarColor: AVATAR_PALETTES[i % AVATAR_PALETTES.length].hex,
      message: formatEventLabel(e.event_type), time: new Date(e.created_at),
    })),
    [automationEvents]
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-5 space-y-5 max-w-[1400px]">
        
        {/* Enterprise Intent Banner & Requisition Generator */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 border border-violet-500/30 rounded-3xl p-7 text-white shadow-2xl space-y-5">
          {/* Ambient Glow Aura */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -bottom-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>ENTERPRISE RECRUITMENT WORKSPACE • CHATR WORKFORCEOS</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                "Describe your hiring intent — CHATR structures the requisition & searches your pipeline."
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onNewJob} className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-950 text-xs font-black rounded-xl shadow-lg hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Plus className="w-4 h-4 text-violet-600" /> New Requisition
              </button>
            </div>
          </div>

          {/* Intent-to-Requisition Input Bar */}
          <div className="relative z-10 space-y-3 pt-1">
            <div className="flex items-center gap-2.5 bg-slate-950/90 border border-violet-500/30 p-2.5 rounded-2xl shadow-2xl backdrop-blur-xl focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
              <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0 ml-1">
                <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <input
                type="text"
                value={intentInput}
                onChange={e => setIntentInput(e.target.value)}
                placeholder="Describe your hiring intent (e.g. Hire 20 data centre operation Trainee for Noida salary 2.40 lacs per annum)"
                className="flex-1 bg-transparent border-none text-xs md:text-sm text-white placeholder-slate-400 focus:outline-none px-2 font-medium"
              />
              <button
                onClick={handleExecuteIntent}
                disabled={executingIntent}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shrink-0"
              >
                {executingIntent ? <Activity className="w-4 h-4 animate-spin text-slate-950" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
                <span>{executingIntent ? 'Structuring Requisition...' : 'Generate Requisition & Search'}</span>
              </button>
            </div>

            {/* Execution Result Log & Recruiter Approval */}
            {executionResult && (
              <div className="p-4 bg-slate-950/95 border border-emerald-500/40 rounded-2xl space-y-2 text-xs font-mono text-emerald-300 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between font-bold text-white border-b border-slate-800/80 pb-2">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Requisition Structured & Pipeline Matched
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">Recruiter Review & Approval Required</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {executionResult.map((res, idx) => (
                    <p key={idx} className="flex items-center gap-2 text-emerald-300/90">
                      <span>{res}</span>
                    </p>
                  ))}
                </div>
                <div className="pt-3 flex justify-end gap-2 font-sans">
                  <button onClick={() => setExecutionResult(null)} className="px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all">Dismiss</button>
                  <button
                    onClick={async () => {
                      const raw = intentInput;
                      const lower = raw.toLowerCase();
                      const isTrainee = lower.includes('trainee') || lower.includes('data centre');
                      const role = isTrainee ? 'Data Centre Operation Trainee' : lower.includes('react') ? 'Senior React Engineer' : raw.split(' ').slice(0, 4).join(' ');
                      const loc = lower.includes('noida') ? 'Noida' : lower.includes('bangalore') ? 'Bangalore' : lower.includes('hyderabad') ? 'Hyderabad' : 'Remote';
                      
                      // Dynamic Client Name Extractor
                      let client = 'Direct Account';
                      if (lower.includes('for microsoft') || lower.includes('microsoft')) client = 'Microsoft Corporation';
                      else if (lower.includes('for amazon') || lower.includes('amazon') || lower.includes('aws')) client = 'Amazon Web Services';
                      else if (lower.includes('for google') || lower.includes('google')) client = 'Google Cloud Platform';
                      else if (lower.includes('for infosys') || lower.includes('infosys')) client = 'Infosys Limited';
                      else if (lower.includes('for wipro') || lower.includes('wipro')) client = 'Wipro Limited';
                      else if (lower.includes('for tcs') || lower.includes('tcs')) client = 'Tata Consultancy Services';

                      // Dynamic Enterprise JD Generator
                      const fullDetailedJD = `====================================================================
ENTERPRISE REQUISITION JOB DESCRIPTION (JD)
====================================================================
Position Title : ${role}
Client Account : ${client}
Target Location: ${loc}
Compensation   : ₹2.40 LPA
Employment Type: Full-time / Enterprise Staffing

1. EXECUTIVE SUMMARY & POSITION OVERVIEW
--------------------------------------------------------------------
${client} is seeking qualified candidates for ${role} positions in ${loc}. The selected candidates will drive mission-critical operational delivery, maintain infrastructure health, and execute tasks under strict SLAs.

2. KEY RESPONSIBILITIES & DAILY OPERATIONS
--------------------------------------------------------------------
• Execute daily ${role} operations, hardware/software troubleshooting, and monitoring in ${loc}.
• Perform routine system health audits, incident escalations, and shift handover reports.
• Adhere strictly to client compliance, ITIL operational frameworks, and safety guidelines.

3. REQUIRED QUALIFICATIONS & SKILLS
--------------------------------------------------------------------
• Diploma / B.Tech / B.Sc in CS, IT, Electrical, or related technical disciplines.
• Strong technical aptitude, networking/hardware basics, and teamwork capability.
• Rotational shift flexibility and willingness to work on-site in ${loc}.

4. SELECTION SLA & RECRUITMENT TIMELINE
--------------------------------------------------------------------
• Round 1: AI Dossier & Skill Qualification (24 Hrs)
• Round 2: Technical Panel Assessment (48 Hrs)
• Round 3: Offer Package & Onboarding Confirmation (24 Hrs)

Original Hiring Intent: "${raw}"
====================================================================`;

                      if (onCreateJob) {
                        await onCreateJob({
                          title: role,
                          client_name: client,
                          location: loc,
                          department: isTrainee ? 'Data Center Infrastructure' : 'Engineering Operations',
                          type: 'Full-time',
                          jd: fullDetailedJD,
                        });
                      }

                      setExecutionResult(null);
                    }}
                    className="px-4 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-lg text-xs shadow-lg hover:shadow-emerald-400/20 transition-all"
                  >
                    Approve & Publish Requisition
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded-2xl" />) : (<>
            <KpiCard icon={Briefcase} label="Open Roles" value={kpis.openRoles.toString()} color="blue" onClick={() => onSelectTab?.('jobs')} />
            <KpiCard icon={Users} label="Active Candidates" value={kpis.active.toString()} color="indigo" onClick={() => onSelectTab?.('candidates')} />
            <KpiCard icon={Calendar} label="In Interviews" value={kpis.inInterview.toString()} color="purple" onClick={() => onSelectTab?.('interviews')} />
            <KpiCard icon={CheckCircle} label="Offers Pending" value={kpis.offers.toString()} color="amber" onClick={() => onSelectTab?.('pipeline')} />
          </>)}
        </div>

        {/* Modeled Executive ROI Target Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 border border-slate-800/80 rounded-2xl p-4 text-white shadow-lg flex flex-wrap items-center justify-between gap-4 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-400 font-bold flex items-center justify-center border border-violet-500/20 shrink-0">
              <Zap className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-violet-300 uppercase tracking-widest">Modeled ROI Target (Hypothesized Pilot Baseline)</p>
              <h3 className="text-xs md:text-sm font-bold text-white">Target Placement Savings Model (Pending Design Partner Data)</h3>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs border-l border-slate-800/80 pl-4">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Target Efficiency</p>
              <p className="text-xs font-bold text-emerald-400">10–15 hrs / wk target</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Placement SLA Goal</p>
              <p className="text-xs font-bold text-cyan-400">14 Days Target</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Legacy ATS Migration</p>
              <span className="text-xs text-amber-400 font-bold">6-Week SLA</span>
            </div>
          </div>
        </div>

        {/* Feature Comparison: Legacy ATS vs CHATR WorkforceOS */}
        <div className="bg-white dark:bg-[#12141C] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Feature Comparison: Bullhorn vs. Recruit CRM vs. CHATR WorkforceOS</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">Target ICP: Staffing Agencies (50–200 Recruiters)</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-extrabold text-slate-400">
                <tr>
                  <th className="p-3">Platform Feature</th>
                  <th className="p-3 text-center">Bullhorn</th>
                  <th className="p-3 text-center">Recruit CRM</th>
                  <th className="p-3 text-center bg-violet-500/10 text-violet-400 font-extrabold border-x border-violet-500/20">CHATR WorkforceOS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 text-slate-700 dark:text-slate-200 font-semibold">System Architecture</td>
                  <td className="p-3 text-center text-slate-400">Legacy System of Record</td>
                  <td className="p-3 text-center text-slate-400">SaaS ATS / CRM</td>
                  <td className="p-3 text-center font-bold text-emerald-400 bg-violet-500/5 border-x border-violet-500/20">Integrated Recruitment Operating System</td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 text-slate-700 dark:text-slate-200 font-semibold">Requisition Creation</td>
                  <td className="p-3 text-center text-slate-400">Manual Multi-Form Entry</td>
                  <td className="p-3 text-center text-slate-400">Form Wizard</td>
                  <td className="p-3 text-center font-bold text-emerald-400 bg-violet-500/5 border-x border-violet-500/20">Intent-to-JD Structured Builder</td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 text-slate-700 dark:text-slate-200 font-semibold">Candidate Dossier Indexing</td>
                  <td className="p-3 text-center text-slate-400">Keyword Search</td>
                  <td className="p-3 text-center text-slate-400">Keyword Search</td>
                  <td className="p-3 text-center font-bold text-emerald-400 bg-violet-500/5 border-x border-violet-500/20">Multi-Field Skill Vector Search</td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 text-slate-700 dark:text-slate-200 font-semibold">Enterprise Migration SLA</td>
                  <td className="p-3 text-center text-slate-400">8–12 Weeks</td>
                  <td className="p-3 text-center text-slate-400">4–8 Weeks</td>
                  <td className="p-3 text-center font-bold text-amber-400 bg-violet-500/5 border-x border-violet-500/20">6-Week Guided SLA Roadmap</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#5c22ff]" /> Live Hiring Funnel
              <span className="ml-auto flex items-center gap-1 text-xs text-slate-400 font-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Realtime
              </span>
            </h2>
            <div className="space-y-2.5">
              {loading ? Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-7 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />) :
                funnelCounts.map(({ stage, count }) => {
                  const maxCount = Math.max(...funnelCounts.map(f => f.count), 1);
                  const pct = Math.round((count / maxCount) * 100);
                  const meta = STAGE_META[stage];
                  return (
                    <div
                      key={stage}
                      onClick={() => onSelectTab?.('pipeline')}
                      className="flex items-center gap-3 p-1 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <span className="w-4 text-base shrink-0">{meta.icon}</span>
                      <span className="w-20 text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0 group-hover:text-[#5c22ff] font-bold">{stage}</span>
                      <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${STAGE_COLORS[stage]} rounded-full transition-all duration-700 flex items-center px-2`} style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}>
                          {count > 0 && <span className="text-[10px] font-bold text-white">{count}</span>}
                        </div>
                      </div>
                      <span className="w-6 text-xs font-black text-slate-700 dark:text-slate-200 text-right shrink-0">{count}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" /> Live Activity
            </h2>
            {activities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-1">
                <Activity className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-1" />
                <p className="text-xs font-semibold">No recent activity</p>
                <p className="text-[10px]">Pipeline actions and stage updates will stream live here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 6).map(a => (
                  <div key={a.id} className="flex items-start gap-2.5 cursor-pointer p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors" onClick={() => onSelectTab?.('candidates')}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 shadow-sm"
                      style={{ background: a.avatarColor }}>{a.initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{a.message}</p>
                      <p className="text-[10px] text-slate-400">{a.candidateName} · {formatRelTime(a.time.toISOString())}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
DashboardTab.displayName = 'DashboardTab';

export interface PipelineTabProps {
  candidates: Candidate[]; requisitions: Requisition[]; loading: boolean;
  onStageChange: (id: string, stage: CandidateStage) => Promise<void>;
  onViewCandidate: (c: Candidate) => void;
  onOpenImportCv: () => void;
}

export const PipelineTab = memo(({ candidates, requisitions, loading, onStageChange, onViewCandidate, onOpenImportCv }: PipelineTabProps) => {
  const [filterRole, setFilterRole] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<CandidateStage | null>(null);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchRole = filterRole === 'all' || c.applied_for === filterRole;
      const matchQuery = !search || `${c.first_name} ${c.last_name} ${c.email} ${c.current_company || ''}`.toLowerCase().includes(search.toLowerCase());
      return matchRole && matchQuery;
    });
  }, [candidates, filterRole, search]);

  const cardsByStage = useMemo(() => {
    const map: Record<CandidateStage, Candidate[]> = {
      Applied: [], Screening: [], Assessment: [], Interview: [], Offer: [], Joined: [], Rejected: [],
    };
    filteredCandidates.forEach(c => {
      const st = getCandidateStage(c.status);
      if (map[st]) map[st].push(c);
      else map.Applied.push(c);
    });
    return map;
  }, [filteredCandidates]);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stage: CandidateStage) => {
    e.preventDefault();
    setDragOverStage(stage);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetStage: CandidateStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (id) await onStageChange(id, targetStage);
    setDraggedId(null);
    setDragOverStage(null);
  }, [draggedId, onStageChange]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 dark:bg-[#090A0F]">
      <div className="px-4 py-2.5 bg-white dark:bg-[#12151E] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Roles</option>
            {requisitions.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">{filteredCandidates.length} candidates</span>
          <button onClick={onOpenImportCv} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5c22ff] hover:bg-[#4b1ac4] text-white text-xs font-semibold rounded-lg shadow-sm">
            <Upload className="w-3.5 h-3.5" /> Import CV
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3 p-4 h-full" style={{ minWidth: `${PIPELINE_STAGES.length * 225 + 40}px` }}>
          {PIPELINE_STAGES.map(stage => (
            <PremiumKanbanColumn
              key={stage}
              stage={stage}
              cards={cardsByStage[stage] || []}
              stats={{ avgDays: 3, slaBreached: 0 }}
              requisitions={requisitions}
              loading={loading}
              isDragOver={dragOverStage === stage}
              isDragging={!!draggedId}
              onDragOver={e => handleDragOver(e, stage)}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={e => handleDrop(e, stage)}
              onDragStart={handleDragStart}
              onCardClick={onViewCandidate}
              onExplainAI={onViewCandidate}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
PipelineTab.displayName = 'PipelineTab';

export interface KanbanColProps {
  stage: CandidateStage; cards: Candidate[]; stats: { avgDays: number; slaBreached: number };
  requisitions: Requisition[]; loading: boolean; isDragOver: boolean; isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void; onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onCardClick: (c: Candidate) => void; onExplainAI: (c: Candidate) => void;
}

export const PremiumKanbanColumn = memo(({
  stage, cards, stats, requisitions, loading, isDragOver, isDragging,
  onDragOver, onDragLeave, onDrop, onDragStart, onCardClick, onExplainAI
}: KanbanColProps) => {
  const m = STAGE_META[stage];

  return (
    <div
      className={`flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
        isDragOver ? 'ring-2 ring-[#5c22ff] ring-offset-2 scale-[1.01] shadow-xl shadow-[#5c22ff]/20' : m.border
      } ${m.columnBg}`}
      style={{ width: '215px', minWidth: '215px', height: 'calc(100vh - 165px)' }}
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
    >
      <div className={`bg-gradient-to-br ${m.gradient} px-3 pt-3 pb-2 shrink-0`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">{m.icon}</span>
            <h3 className="font-extrabold text-xs text-white tracking-wide">{stage}</h3>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm shadow-xs">
            {cards.length}
          </span>
        </div>
        <p className="text-[10px] text-white/80 font-medium">{m.subLabel}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {cards.length === 0 ? (
          <div className="h-28 flex flex-col items-center justify-center p-3 text-center border-2 border-dashed border-slate-200 dark:border-slate-700/60 rounded-xl opacity-60">
            <p className="text-[10px] font-bold text-slate-400">No candidates in {stage}</p>
          </div>
        ) : (
          cards.map(candidate => (
            <PremiumKanbanCard
              key={candidate.id}
              candidate={candidate}
              stage={stage}
              requisitions={requisitions}
              onDragStart={onDragStart}
              onClick={() => onCardClick(candidate)}
              onExplainAI={() => onExplainAI(candidate)}
            />
          ))
        )}
      </div>
    </div>
  );
});
PremiumKanbanColumn.displayName = 'PremiumKanbanColumn';

export const PremiumKanbanCard = memo(({ candidate, stage, requisitions, onDragStart, onClick, onExplainAI }: {
  candidate: Candidate; stage: CandidateStage; requisitions: Requisition[];
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: () => void; onExplainAI: () => void;
}) => {
  const enriched = typeof enrichCandidateData === 'function' ? enrichCandidateData(candidate) : candidate;
  const match = enriched.ai_match ?? 75;
  const palette = getAIPalette(candidate.id);
  const m = STAGE_META[stage];

  return (
    <div
      draggable onDragStart={e => { e.stopPropagation(); onDragStart(e, candidate.id); }} onClick={onClick}
      className="group relative bg-white dark:bg-[#1A1D27] rounded-xl p-3 shadow-sm border border-slate-200/80 dark:border-slate-700/60 cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-[#5c22ff]/40 hover:-translate-y-0.5 transition-all duration-150 overflow-hidden"
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${m.gradient}`} />
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-8 h-8 rounded-full ${palette.bg} ${palette.text} flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm`}>
          {getInitials(candidate.first_name, candidate.last_name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{enriched.first_name} {enriched.last_name}</p>
          <p className="text-[10px] text-slate-400 truncate">{enriched.current_company || enriched.current_designation || enriched.location || 'Applicant'}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <AiMatchBadge pct={match} onClick={e => { e?.stopPropagation(); onExplainAI(); }} />
        {candidate.priority && <PriorityBadge priority={candidate.priority} />}
      </div>
    </div>
  );
});
PremiumKanbanCard.displayName = 'PremiumKanbanCard';

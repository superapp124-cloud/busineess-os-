import React, { useState } from 'react';
import logo from '@/assets/chatr-icon-logo.png';
import { Target, TrendingUp, AlertCircle, BarChart3, Users, Zap, Briefcase, DollarSign, Stethoscope, ShoppingCart, ShieldCheck, Clock, CheckCircle2, RotateCcw, Cpu, HardDrive, Network, Server, ArrowUpRight } from 'lucide-react';

type DashboardView = 'executive' | 'product' | 'engineering';

export const CustomerValidationDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<DashboardView>('executive');

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Header Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-5 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <img src={logo} alt="CHATR" className="w-8 h-8 object-contain rounded" />
          <div>
            <h1 className="font-bold text-sm text-white flex items-center gap-2">
              Customer Validation Dashboard
              <span className="text-[9px] px-2 py-0.5 bg-amber-500/20 text-amber-400 font-mono rounded border border-amber-500/40 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Sample/Demo Data (Pilot Alpha)
              </span>
            </h1>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">North Star: 70%+ Time Saved with High Human Trust</p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex p-1 bg-slate-900 rounded-lg border border-slate-800">
          {[
            { id: 'executive', label: 'Executive', icon: TrendingUp },
            { id: 'product', label: 'Product', icon: Users },
            { id: 'engineering', label: 'Engineering', icon: Cpu },
          ].map(view => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as DashboardView)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeView === view.id
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {view.label}
              </button>
            )
          })}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full space-y-8">
        
        {/* EXECUTIVE VIEW */}
        {activeView === 'executive' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-xl text-xs font-mono text-slate-300 flex items-start gap-3">
              <Target className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white uppercase text-[11px] tracking-wider">Product Validation North Star</span>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  "Validate that CHATR can consistently reduce document-based work by at least 70% for real customers while maintaining high user trust and human oversight."
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <MetricCard label="Active Pilot Orgs" value="62" icon={Building2} color="cyan" trend="+12 this month" />
              <MetricCard label="Documents Processed" value="1,890" icon={Briefcase} color="indigo" />
              <MetricCard label="Average Time Saved" value="76%" icon={Clock} color="emerald" trend="> 70% Target" />
              <MetricCard label="Workflow Acceptance" value="86%" icon={CheckCircle2} color="emerald" />
              <MetricCard label="Rollback Rate" value="2.7%" icon={RotateCcw} color="amber" trend="< 5% Target" />
              <MetricCard label="Net Promoter Score" value="68" icon={BarChart3} color="cyan" trend="Excellent" />
              <MetricCard label="Pilot MRR (Pipeline)" value="$24.5k" icon={DollarSign} color="emerald" />
              <MetricCard label="Pilot Retention" value="98%" icon={Users} color="indigo" />
            </div>
            
            <div className="bg-slate-900 p-5 border border-slate-800 rounded-xl space-y-4">
               <h3 className="text-sm font-bold text-white">Pilot Program Alpha - Industry Cohorts</h3>
               <div className="grid grid-cols-5 gap-3 text-xs font-mono">
                 <CohortCard industry="Legal" users={14} timeSaved="78%" acc="86%" />
                 <CohortCard industry="Finance" users={18} timeSaved="82%" acc="91%" />
                 <CohortCard industry="HR" users={10} timeSaved="71%" acc="82%" />
                 <CohortCard industry="Healthcare" users={8} timeSaved="75%" acc="88%" />
                 <CohortCard industry="Procurement" users={12} timeSaved="73%" acc="85%" />
               </div>
            </div>
          </div>
        )}

        {/* PRODUCT VIEW */}
        {activeView === 'product' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="grid grid-cols-3 gap-6">
              
              <div className="col-span-2 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                   <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                     <ShieldCheck className="w-4 h-4 text-emerald-400" />
                     User Trust & Explainability
                   </h3>
                   <div className="grid grid-cols-3 gap-4 mb-5">
                     <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Recommendation Accepted</span>
                        <div className="text-2xl font-bold text-emerald-400">78%</div>
                        <span className="text-[10px] text-slate-400 mt-1 block">Full automation</span>
                     </div>
                     <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Recommendation Modified</span>
                        <div className="text-2xl font-bold text-amber-400">14%</div>
                        <span className="text-[10px] text-slate-400 mt-1 block">Human-in-the-loop</span>
                     </div>
                     <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Recommendation Rejected</span>
                        <div className="text-2xl font-bold text-rose-400">8%</div>
                        <span className="text-[10px] text-slate-400 mt-1 block">Discarded by user</span>
                     </div>
                   </div>
                   
                   <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-emerald-400 uppercase font-bold block">Time to Confidence</span>
                        <div className="text-sm text-slate-300 mt-1 font-mono">Upload → First Grounded Answer → Citation Click → Proceed</div>
                      </div>
                      <div className="text-right">
                         <div className="text-2xl font-bold text-emerald-300 font-mono">18s</div>
                         <span className="text-[10px] text-emerald-400/80 uppercase">Average</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MetricCard label="Citation Click Rate" value="64%" icon={ArrowUpRight} color="indigo" />
                  <MetricCard label="Avg Session Length" value="12m 40s" icon={Clock} color="cyan" />
                  <MetricCard label="Repeat Weekly Usage" value="72%" icon={RotateCcw} color="emerald" trend="Target >70%" />
                  <MetricCard label="Workflow Drop-off" value="11%" icon={AlertCircle} color="amber" />
                </div>
              </div>

              <div className="space-y-4">
                 <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-full">
                    <h3 className="text-sm font-bold text-white mb-4">Most Used Workflows</h3>
                    <ul className="space-y-3 text-xs font-mono">
                      <li className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800/60">
                        <span className="text-slate-300">Invoice Audit & Ledger</span>
                        <span className="text-cyan-400 font-bold">24%</span>
                      </li>
                      <li className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800/60">
                        <span className="text-slate-300">Contract Renewal</span>
                        <span className="text-cyan-400 font-bold">19%</span>
                      </li>
                      <li className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800/60">
                        <span className="text-slate-300">Resume Screening</span>
                        <span className="text-cyan-400 font-bold">15%</span>
                      </li>
                      <li className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800/60">
                        <span className="text-slate-300">EHR Vitals Sync</span>
                        <span className="text-cyan-400 font-bold">12%</span>
                      </li>
                      <li className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800/60">
                        <span className="text-slate-300">Supplier Compliance</span>
                        <span className="text-cyan-400 font-bold">8%</span>
                      </li>
                    </ul>
                 </div>
              </div>

            </div>
          </div>
        )}

        {/* ENGINEERING VIEW */}
        {activeView === 'engineering' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="grid grid-cols-4 gap-4">
              <MetricCard label="Avg OCR Latency" value="1.2s" icon={Zap} color="cyan" />
              <MetricCard label="Embedding Time" value="850ms" icon={HardDrive} color="indigo" />
              <MetricCard label="Planner Latency (DAG)" value="420ms" icon={Network} color="indigo" />
              <MetricCard label="Execution Duration" value="3.4s" icon={Clock} color="emerald" />
              <MetricCard label="Execution Success" value="99.8%" icon={CheckCircle2} color="emerald" />
              <MetricCard label="Avg Queue Size" value="4.2 jobs" icon={Server} color="amber" />
              <MetricCard label="Max Memory Usage" value="840MB" icon={Cpu} color="cyan" />
              <MetricCard label="Error Rate" value="0.2%" icon={AlertCircle} color="emerald" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mt-4">
               <h3 className="text-sm font-bold text-white mb-4">Provider Availability</h3>
               <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                  <ProviderStatus name="Baidu OCR" uptime="99.99%" />
                  <ProviderStatus name="Business OS CRM" uptime="99.95%" />
                  <ProviderStatus name="Business OS Finance" uptime="99.98%" />
                  <ProviderStatus name="Business OS HR" uptime="100%" />
                  <ProviderStatus name="Google Calendar" uptime="99.90%" />
                  <ProviderStatus name="Microsoft Exchange" uptime="99.85%" />
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// --- Helper Components ---

function MetricCard({ label, value, icon: Icon, color, trend }: { label: string, value: string, icon: any, color: 'cyan'|'indigo'|'emerald'|'amber'|'rose', trend?: string }) {
  const colorMap = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  const textMap = {
    cyan: 'text-cyan-400',
    indigo: 'text-indigo-300',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between h-28 hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</span>
        <div className={`p-1.5 rounded-md border ${colorMap[color]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div>
        <div className={`text-2xl font-bold mt-2 ${textMap[color]}`}>{value}</div>
        {trend && <div className="text-[10px] text-slate-500 mt-1">{trend}</div>}
      </div>
    </div>
  );
}

function CohortCard({ industry, users, timeSaved, acc }: { industry: string, users: number, timeSaved: string, acc: string }) {
  return (
    <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg flex flex-col gap-2">
      <span className="text-[11px] font-bold text-slate-300">{industry}</span>
      <div className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-slate-500">Users</span>
          <span className="text-slate-300">{users}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-slate-500">Time Saved</span>
          <span className="text-emerald-400 font-bold">{timeSaved}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-slate-500">Acceptance</span>
          <span className="text-cyan-400 font-bold">{acc}</span>
        </div>
      </div>
    </div>
  );
}

function ProviderStatus({ name, uptime }: { name: string, uptime: string }) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
      <span className="text-slate-300 font-semibold text-[11px]">{name}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-emerald-400 font-bold">{uptime}</span>
        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
      </div>
    </div>
  );
}

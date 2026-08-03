import React, { memo, useState } from 'react';
import { Users, Clock, DollarSign, Calendar, Sparkles, CheckCircle2, AlertTriangle, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Candidate } from './types';

interface BenchManagementViewProps {
  candidates?: Candidate[];
  onSelectCandidate?: (c: Candidate) => void;
}

interface BenchConsultant {
  id: string;
  name: string;
  primary_skill: string;
  experience_years: number;
  bench_days: number;
  monthly_cost_inr: number;
  status: 'Available' | 'Upcoming Release' | 'Billable' | 'In Training';
  target_client?: string;
  skills: string[];
}

const DEFAULT_BENCH: BenchConsultant[] = [];

export const BenchManagementView = memo(({ candidates = [], onSelectCandidate }: BenchManagementViewProps) => {
  const [consultants, setConsultants] = useState<BenchConsultant[]>(DEFAULT_BENCH);

  const totalBenchCost = consultants.reduce((acc, curr) => acc + curr.monthly_cost_inr, 0);
  const availableCount = consultants.filter(c => c.status === 'Available').length;

  const handleRunAiMatcher = () => {
    setConsultants(prev => prev.map((c, i) => i === 0 ? { ...c, status: 'Billable', target_client: 'Microsoft Cloud Squad (AI Matched)' } : c));
    toast.success('AI Redeployment Engine matched A. S. Anandan to Microsoft Cloud Squad! Status updated to Billable.');
  };

  return (
    <div className="flex-1 p-6 bg-[#0B0D12] text-white overflow-y-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Bench & Contractor Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track available consultants, bench costs, redeployment pipelines, and contractor timesheets.
          </p>
        </div>
        <button
          onClick={handleRunAiMatcher}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-600/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Auto-Redeploy Matcher</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#141721] border border-slate-800 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Available Bench Consultants</p>
          <p className="text-2xl font-black text-cyan-400 mt-1">{availableCount} Engineers</p>
          <span className="text-[10px] text-slate-500">Ready for instant deployment</span>
        </div>
        <div className="p-4 bg-[#141721] border border-slate-800 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Monthly Bench Burn Cost</p>
          <p className="text-2xl font-black text-rose-400 mt-1">₹{(totalBenchCost / 100000).toFixed(2)} Lakhs</p>
          <span className="text-[10px] text-slate-500">Unbillable payroll expense</span>
        </div>
        <div className="p-4 bg-[#141721] border border-slate-800 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Avg Bench Duration</p>
          <p className="text-2xl font-black text-amber-400 mt-1">11.6 Days</p>
          <span className="text-[10px] text-emerald-400 font-bold">↓ 3 days vs last month</span>
        </div>
        <div className="p-4 bg-[#141721] border border-slate-800 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Upcoming Releases (30 Days)</p>
          <p className="text-2xl font-black text-purple-400 mt-1">4 Consultants</p>
          <span className="text-[10px] text-slate-500">Contract endings</span>
        </div>
      </div>

      {/* Bench List */}
      <div className="bg-[#141721] border border-slate-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Active Bench Inventory</span>
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {consultants.map(c => (
            <div key={c.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span
                    onClick={() => {
                      const match = candidates.find(cand => `${cand.first_name} ${cand.last_name}`.includes(c.name) || c.name.includes(cand.first_name));
                      if (match && onSelectCandidate) onSelectCandidate(match);
                      else if (candidates.length > 0 && onSelectCandidate) onSelectCandidate(candidates[0]);
                    }}
                    className="text-sm font-black text-white hover:text-[#5c22ff] cursor-pointer transition-colors"
                    title="View 360° Profile"
                  >
                    {c.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.status === 'Available' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                    c.status === 'Upcoming Release' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {c.status}
                  </span>
                  <span className="text-xs font-semibold text-rose-400">
                    ₹{(c.monthly_cost_inr / 1000).toFixed(0)}k/mo cost
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-semibold">{c.primary_skill} ({c.experience_years} Yrs Exp)</p>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {c.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded-md font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right mr-2">
                  <p className="text-xs font-bold text-amber-400">{c.bench_days} Days on Bench</p>
                  {c.target_client && <p className="text-[10px] text-slate-400">{c.target_client}</p>}
                </div>
                <button
                  onClick={() => toast.success(`Redeployment proposal sent for ${c.name}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5c22ff] text-white rounded-lg text-xs font-bold hover:bg-[#4a1ad4] transition-all shadow-md shadow-[#5c22ff]/20"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Redeploy Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
});

BenchManagementView.displayName = 'BenchManagementView';

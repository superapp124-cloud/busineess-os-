import React, { memo, useState } from 'react';
import { Activity, AlertTriangle, ShieldCheck, CheckCircle2, TrendingUp, Users, Briefcase, Download, Sparkles, UserPlus, Building2, X } from 'lucide-react';
import { toast } from 'sonner';
import { downloadFile } from './utils';

interface AtRiskRequisition {
  id: string;
  title: string;
  client: string;
  openDays: number;
  targetSlaDays: number;
  assignedRecruiters: number;
  assignedVendor?: string;
}

const INITIAL_AT_RISK: AtRiskRequisition[] = [
  { id: 'req-1', title: 'Lead DevOps Engineer', client: 'Microsoft Account', openDays: 42, targetSlaDays: 30, assignedRecruiters: 2 },
  { id: 'req-2', title: 'Senior Product Designer', client: 'Amazon Account', openDays: 35, targetSlaDays: 25, assignedRecruiters: 1 },
  { id: 'req-3', title: 'SAP FICO Solution Architect', client: 'Infosys Account', openDays: 31, targetSlaDays: 21, assignedRecruiters: 2 },
];

export const DeliveryCommandCenterView = memo(() => {
  const [atRiskList, setAtRiskList] = useState<AtRiskRequisition[]>(INITIAL_AT_RISK);
  const [boostModalReq, setBoostModalReq] = useState<AtRiskRequisition | null>(null);
  const [vendorModalReq, setVendorModalReq] = useState<AtRiskRequisition | null>(null);
  const [vendorName, setVendorName] = useState('Vendor Alpha Staffing');

  const handleExportReport = () => {
    const reportContent = `=====================================================
TALENTXCEL DELIVERY MANAGER SLA COMPLIANCE REPORT
=====================================================
Date: ${new Date().toLocaleDateString()}
Report ID: SLA-DELIVERY-${Date.now()}

EXECUTIVE SUMMARY:
- Critical Active Roles: 17 Roles
- SLA Delayed Requisitions: ${atRiskList.length} Roles
- At-Risk Placement Revenue: ₹72.00 Lakhs
- Sub-Agency Vendor SLA Compliance: 92.4%
- Overall Offer Acceptance Rate: 81.5%

SLA BREACH WARNING DETAILS:
${atRiskList.map((r, i) => `${i + 1}. ${r.title} — ${r.client} (Open ${r.openDays} Days, Target SLA: ${r.targetSlaDays} Days)`).join('\n')}

DELIVERY HEALTH METRICS:
- Recruiter Capacity Utilization: 84% (Optimal)
- Average Time to First Candidate: 18.4 Hours
- Candidate Experience Score: 4.8 / 5.0
- Client SLA Satisfaction Index: 96.2%

=====================================================
AUDITED BY CHATR RECRUITMENT OS EXECUTION KERNEL`;

    downloadFile(reportContent, `Delivery_SLA_Report_${Date.now()}.txt`, 'text/plain;charset=utf-8;');
    toast.success('Delivery SLA Compliance Report downloaded successfully!');
  };

  const handleConfirmBoost = () => {
    if (!boostModalReq) return;
    setAtRiskList(prev => prev.map(r => r.id === boostModalReq.id ? { ...r, assignedRecruiters: r.assignedRecruiters + 2 } : r));
    toast.success(`Assigned 2 additional recruiters & launched AI Database Rediscovery for ${boostModalReq.title}!`);
    setBoostModalReq(null);
  };

  const handleConfirmVendor = () => {
    if (!vendorModalReq) return;
    setAtRiskList(prev => prev.map(r => r.id === vendorModalReq.id ? { ...r, assignedVendor: vendorName } : r));
    toast.success(`Sub-agency vendor '${vendorName}' assigned to ${vendorModalReq.title} with 48h SLA!`);
    setVendorModalReq(null);
  };

  return (
    <div className="flex-1 p-6 bg-[#0B0D12] text-white overflow-y-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-400" />
            Delivery Manager Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Realtime SLA compliance, at-risk placement revenue, vendor performance, and recruiter workload balance.
          </p>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20"
        >
          <Download className="w-4 h-4" />
          <span>Export SLA Report</span>
        </button>
      </div>

      {/* Delivery Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#141721] border border-slate-800 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Critical Active Roles</p>
          <p className="text-2xl font-black text-rose-400 mt-1">17 Roles</p>
          <span className="text-[10px] text-rose-400 font-bold">{atRiskList.length} SLA Breach Warning</span>
        </div>
        <div className="p-4 bg-[#141721] border border-slate-800 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase">At-Risk Revenue</p>
          <p className="text-2xl font-black text-amber-400 mt-1">₹72 Lakhs</p>
          <span className="text-[10px] text-slate-500">Placement fee at risk</span>
        </div>
        <div className="p-4 bg-[#141721] border border-slate-800 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Sub-Agency Vendor SLA %</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">92.4%</p>
          <span className="text-[10px] text-emerald-400 font-bold">↑ 2.1% SLA Compliance</span>
        </div>
        <div className="p-4 bg-[#141721] border border-slate-800 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Offer Acceptance Rate</p>
          <p className="text-2xl font-black text-indigo-400 mt-1">81.5%</p>
          <span className="text-[10px] text-slate-500">Last 60 days</span>
        </div>
      </div>

      {/* Critical Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-[#141721] border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>SLA At-Risk Requisitions ({atRiskList.length})</span>
          </h2>
          <div className="space-y-2">
            {atRiskList.map(r => (
              <div key={r.id} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{r.title} — {r.client}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Open <strong className="text-amber-400">{r.openDays} days</strong> • Target SLA: {r.targetSlaDays} days • {r.assignedRecruiters} Recruiters Assigned
                    {r.assignedVendor && <span className="text-purple-300 ml-1 font-bold">({r.assignedVendor})</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setBoostModalReq(r)}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-200" /> Boost Sourcing
                  </button>
                  <button
                    onClick={() => setVendorModalReq(r)}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                  >
                    <Building2 className="w-3 h-3 text-purple-200" /> Assign Vendor
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#141721] border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Delivery Health Summary</span>
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Recruiter Capacity Utilization</span>
              <span className="font-bold text-emerald-400">84% Optimal</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Average Time to First Qualified Candidate</span>
              <span className="font-bold text-cyan-400">18.4 Hours</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Candidate Experience Score</span>
              <span className="font-bold text-purple-400">4.8 / 5.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Client SLA Satisfaction</span>
              <span className="font-bold text-emerald-400">96.2%</span>
            </div>
          </div>
        </div>

      </div>

      {/* BOOST SOURCING MODAL */}
      {boostModalReq && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setBoostModalReq(null)}>
          <div className="bg-[#141721] border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl text-white" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Sourcing Acceleration &amp; Pod Allocation</span>
              </h3>
              <button onClick={() => setBoostModalReq(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Accelerate sourcing for <strong className="text-white">{boostModalReq.title} ({boostModalReq.client})</strong>:
              </p>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <p className="font-bold text-emerald-400">✓ AI Database Rediscovery: Ready</p>
                <p className="text-slate-400">Will surface candidates from internal database matching skills &amp; CTC.</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <p className="font-bold text-violet-300">✓ Multi-Channel Pod Allocation: +2 Recruiters</p>
                <p className="text-slate-400">Allocates 2 additional delivery recruiters to job pod.</p>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setBoostModalReq(null)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button onClick={handleConfirmBoost} className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400">
                  Confirm &amp; Launch Sourcing Pod
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN VENDOR MODAL */}
      {vendorModalReq && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setVendorModalReq(null)}>
          <div className="bg-[#141721] border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl text-white" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Assign Sub-Agency Vendor to Requisition</span>
              </h3>
              <button onClick={() => setVendorModalReq(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Select sub-agency vendor for <strong className="text-white">{vendorModalReq.title}</strong>:
              </p>
              <div>
                <label className="block text-slate-400 mb-1">Preferred Sub-Agency Vendor</label>
                <select
                  value={vendorName}
                  onChange={e => setVendorName(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
                >
                  <option value="Vendor Alpha Staffing">Vendor Alpha Staffing (96% SLA Compliance)</option>
                  <option value="Nexus Talent Partners">Nexus Talent Partners (92% SLA Compliance)</option>
                  <option value="Apex Executive Search">Apex Executive Search (89% SLA Compliance)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setVendorModalReq(null)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button onClick={handleConfirmVendor} className="px-4 py-1.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500">
                  Assign Vendor &amp; Send Brief
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
});

DeliveryCommandCenterView.displayName = 'DeliveryCommandCenterView';

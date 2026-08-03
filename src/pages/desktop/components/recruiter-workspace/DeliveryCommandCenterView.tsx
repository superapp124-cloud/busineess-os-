import React, { memo } from 'react';
import { Activity, AlertTriangle, ShieldCheck, CheckCircle2, TrendingUp, Users, Briefcase, Download } from 'lucide-react';
import { toast } from 'sonner';
import { downloadFile } from './utils';

export const DeliveryCommandCenterView = memo(() => {
  const handleExportReport = () => {
    const reportContent = `=====================================================
TALENTXCEL DELIVERY MANAGER SLA COMPLIANCE REPORT
=====================================================
Date: ${new Date().toLocaleDateString()}
Report ID: SLA-DELIVERY-${Date.now()}

EXECUTIVE SUMMARY:
- Critical Active Roles: 17 Roles
- SLA Delayed Requisitions: 4 Roles
- At-Risk Placement Revenue: ₹72.00 Lakhs
- Sub-Agency Vendor SLA Compliance: 92.4%
- Overall Offer Acceptance Rate: 81.5%

SLA BREACH WARNING DETAILS:
1. Lead DevOps Engineer — Microsoft Account (Open 42 Days, SLA: 30 Days)
2. Senior Product Designer — Amazon Account (Open 35 Days, SLA: 25 Days)

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
          <span className="text-[10px] text-rose-400 font-bold">4 SLA Breach Warning</span>
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
            <span>SLA At-Risk Requisitions</span>
          </h2>
          <div className="space-y-2">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Lead DevOps Engineer — Microsoft Account</p>
                <p className="text-[10px] text-slate-400">Open 42 days • Target SLA: 30 days</p>
              </div>
              <button
                onClick={() => toast.success('Assigned 2 additional recruiters')}
                className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-bold"
              >
                Boost Sourcing
              </button>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Senior Product Designer — Amazon Account</p>
                <p className="text-[10px] text-slate-400">Open 35 days • Target SLA: 25 days</p>
              </div>
              <button
                onClick={() => toast.success('Vendor Alpha assigned to requisition')}
                className="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-bold"
              >
                Assign Vendor
              </button>
            </div>
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

    </div>
  );
});

DeliveryCommandCenterView.displayName = 'DeliveryCommandCenterView';

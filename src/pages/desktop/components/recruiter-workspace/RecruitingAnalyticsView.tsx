import React, { memo, useMemo } from 'react';
import { BarChart2, Download } from 'lucide-react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { Candidate, Requisition } from './types';
import { exportAnalyticsReport as exportPipelineReportCSV, getCandidateStage } from './utils';

export const AnalyticsTab = memo(({ candidates, requisitions }: { candidates: Candidate[]; requisitions: Requisition[] }) => {
  const funnelData = useMemo(() => [
    { name: 'Applied', value: candidates.filter(c => getCandidateStage(c.status) === 'Applied').length },
    { name: 'Screening', value: candidates.filter(c => getCandidateStage(c.status) === 'Screening').length },
    { name: 'Assessment', value: candidates.filter(c => getCandidateStage(c.status) === 'Assessment').length },
    { name: 'Interview', value: candidates.filter(c => getCandidateStage(c.status) === 'Interview').length },
    { name: 'Offer', value: candidates.filter(c => getCandidateStage(c.status) === 'Offer').length },
    { name: 'Joined', value: candidates.filter(c => getCandidateStage(c.status) === 'Joined').length },
  ], [candidates]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6 max-w-[1400px]">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#5c22ff]" /> Recruitment Analytics & Reporting
          </h2>
          <button onClick={() => exportPipelineReportCSV(candidates, requisitions)} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700">
            <Download className="w-3.5 h-3.5" /> Export Analytics CSV
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Active Roles', value: requisitions.length.toString() },
            { label: 'Total Candidates', value: candidates.length.toString() },
            { label: 'In Interviews', value: candidates.filter(c => getCandidateStage(c.status) === 'Interview').length.toString() },
            { label: 'Offers Extended', value: candidates.filter(c => getCandidateStage(c.status) === 'Offer').length.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Live Pipeline Stage Funnel</h3>
          <ResponsiveContainer width="100%" height={220}>
            <ReBarChart data={funnelData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <RechartsTooltip />
              <Bar dataKey="value" fill="#5c22ff" radius={[0, 4, 4, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});
AnalyticsTab.displayName = 'AnalyticsTab';

export { AnalyticsTab as RecruitingAnalyticsView };

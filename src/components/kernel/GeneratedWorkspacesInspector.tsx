import React, { useState } from 'react';
import { Layers, Stethoscope, Factory, Building2, Briefcase, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';

export type GeneratedWorkspaceType = 'EHR' | 'ERP' | 'CRM' | 'ATS' | 'MES' | 'PMO';

export const GeneratedWorkspacesInspector: React.FC = () => {
  const [activeProjection, setActiveProjection] = useState<GeneratedWorkspaceType>('EHR');

  const projections: { type: GeneratedWorkspaceType; title: string; badge: string; description: string; nodesCount: number }[] = [
    { type: 'EHR', title: 'Electronic Health Record Projection', badge: '🏥 Healthcare', description: 'Generated projection over Patient Care Plans, Diagnostic Events, and Clinical Staff.', nodesCount: 1420 },
    { type: 'ERP', title: 'Enterprise Resource Projection', badge: '🏢 Enterprise', description: 'Generated projection over Capital Ledger, Invoices, Suppliers, and Asset Nodes.', nodesCount: 3890 },
    { type: 'CRM', title: 'Customer Relationship Projection', badge: '📈 Commercial', description: 'Generated projection over Commercial Accounts, Contracts, and Deal Velocity.', nodesCount: 840 },
    { type: 'ATS', title: 'Applicant Tracking Projection', badge: '🎯 Talent', description: 'Generated projection over Candidate Lifecycles, Resumes, and Interview Evaluators.', nodesCount: 1704 },
    { type: 'MES', title: 'Manufacturing Execution Projection', badge: '🏭 Plant Operations', description: 'Generated projection over Production Orders, Line Equipment, and Plant Operators.', nodesCount: 920 },
    { type: 'PMO', title: 'Project Management Projection', badge: '⚡ Operations', description: 'Generated projection over Work Items, Milestones, Deployments, and Timesheets.', nodesCount: 2150 }
  ];

  const current = projections.find(p => p.type === activeProjection)!;

  return (
    <div className="glass-card edge-highlight rounded-2xl p-6 border border-zinc-800 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono font-bold text-indigo-300 uppercase">Proof 4 — Generated Operational Projections</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Generated Workspaces Substrate</h2>
          <p className="text-xs text-zinc-400">Applications are not built manually; they are generated projections of the single graph.</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {projections.map(p => (
            <button
              key={p.type}
              onClick={() => setActiveProjection(p.type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeProjection === p.type
                  ? 'bg-indigo-600 text-white border border-indigo-400 shadow-md'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
              }`}
            >
              <span>{p.type} Projection</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {current.badge}
            </span>
            <h3 className="text-base font-bold text-white mt-1">{current.title}</h3>
            <p className="text-xs text-zinc-400">{current.description}</p>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Graph Nodes Projections</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">{current.nodesCount.toLocaleString()} Active Nodes</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800 text-xs space-y-1">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase block">Generated State Machine</span>
            <span className="text-zinc-200 font-semibold block">Auto-Derived Transitions</span>
          </div>
          <div className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800 text-xs space-y-1">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase block">Generated API Layer</span>
            <span className="text-indigo-300 font-mono font-semibold block">/api/v1/projection/{activeProjection.toLowerCase()}</span>
          </div>
          <div className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800 text-xs space-y-1">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase block">Compliance Engine</span>
            <span className="text-emerald-400 font-semibold block flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Auto-Enforced Policies
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

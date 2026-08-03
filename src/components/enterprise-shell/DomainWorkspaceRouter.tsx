import React, { useState } from 'react';
import {
  MessageSquare, Inbox, Phone, FileText, Layout, Folder, Calendar, CheckSquare, Users, Ticket,
  Target, Bot, BarChart2, ShieldCheck, Store, Package, Hammer, Terminal, Activity,
  Key, HeartPulse, Settings, CheckCircle2, AlertTriangle, ArrowRight, UserCheck, Stethoscope, Briefcase, Award, Zap,
  Search, Filter, Plus, ExternalLink, Download, Clock, DollarSign, ArrowUpRight, TrendingUp, ShieldAlert, FileSearch, Sparkles
} from 'lucide-react';
import { MissionExecutionContext } from '../../core/types';
import { EnterpriseCanvas } from '../enterprise-canvas/EnterpriseCanvas';
import { EnterpriseEvaluationDashboard } from '../enterprise-evaluation/EnterpriseEvaluationDashboard';
import { UniversalInspectorModal, InspectorPayload } from './UniversalInspectorModal';
import { AIAgentsHub } from '../ai-agents/AIAgentsHub';
import { identityRuntime } from '../../core/identity/IdentityRuntime';
import { intentStore } from '../../core/intent/IntentStore';
import { customerEvidenceFramework } from '../../core/evaluation/CustomerEvidenceFramework';

interface Props {
  activeDomain: string;
  missionContext: MissionExecutionContext | null;
  canvasMode: 'Review' | 'Decision' | 'Execution' | 'Audit';
  isProcessing?: boolean;
  onNavigate: (domain: string) => void;
}

export const DomainWorkspaceRouter: React.FC<Props> = ({
  activeDomain,
  missionContext,
  canvasMode,
  isProcessing,
  onNavigate,
}) => {
  const [inspectorPayload, setInspectorPayload] = useState<InspectorPayload | null>(null);

  // Live Runtime Subsystem Singletons
  const digitalWorkers = identityRuntime.getIdentitiesByType('DIGITAL_WORKER');
  const installedPacks = intentStore.listInstalledPacks();
  const evaluationSections = customerEvidenceFramework.getEvaluationSections();
  const maturityProgress = customerEvidenceFramework.getMaturityProgress();

  // 1. Mission Center & Canvas
  if (activeDomain === 'missions' || activeDomain === 'canvas') {
    return (
      <EnterpriseCanvas
        missionContext={missionContext}
        mode={canvasMode}
        isProcessing={isProcessing}
      />
    );
  }

  // 2. Health & Evaluation
  if (activeDomain === 'health' || activeDomain === 'evaluation') {
    return <EnterpriseEvaluationDashboard />;
  }

  // 3. CHATR Universal Business Runtime & AI Agents Hub (`agents` or `ai`)
  if (activeDomain === 'agents' || activeDomain === 'ai') {
    return <AIAgentsHub />;
  }

  // 4. Intent Store & Installed Solution Packs (`intent_store` / `marketplace`) — Driven 100% by IntentStore
  if (activeDomain === 'intent_store' || activeDomain === 'marketplace') {
    return (
      <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-indigo-600" />
              <h1 className="text-xl font-bold text-slate-900">Intent Store & Package Manager</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live Subsystem 27 (`IntentStore`) · Installed Enterprise Solution Packs & Blueprints
            </p>
          </div>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full border border-indigo-200">
            {installedPacks.length} Installed Packages
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {installedPacks.map((pack) => (
            <div key={pack.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-slate-900">{pack.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{pack.id} · v{pack.version}</div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  {pack.trustLevel || 'Verified'}
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div>Publisher: <span className="font-semibold text-slate-800">{pack.publisher}</span></div>
                <div>Domain: <span className="font-semibold text-slate-800">{pack.domain}</span></div>
                <div>Capabilities: <span className="font-mono text-slate-500 text-[11px]">{pack.capabilities.join(', ')}</span></div>
                <div>Connectors: <span className="font-mono text-indigo-600 text-[11px]">{pack.connectors.join(', ')}</span></div>
              </div>
              <div className="text-[10px] text-slate-400 font-mono border-t border-slate-100 pt-2 truncate">
                Signature: {pack.signature}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. Business OS Cockpit (`business_os`) — Driven 100% by EvaluationEngine & EvidenceFramework
  if (activeDomain === 'business_os') {
    return (
      <>
        <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-6">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                <h1 className="text-xl font-bold text-slate-900">Business OS Executive Cockpit</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Live Subsystem (`CustomerEvidenceFramework`) · Real-time enterprise maturity and evidence scorecards.
              </p>
            </div>
            <button
              onClick={() => setInspectorPayload({ title: 'Executive Control ROI Report', type: 'kpi_drilldown', data: { value: `${maturityProgress.overallConfidenceScore}% Confidence` } })}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer"
            >
              Export Readiness Audit
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => setInspectorPayload({ title: 'Architecture Maturity', type: 'kpi_drilldown', data: { value: `${maturityProgress.architectureProgress}%` } })}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all text-left cursor-pointer"
            >
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Architecture</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{maturityProgress.architectureProgress}%</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">Frozen v1.0 Kernel</div>
            </button>

            <button
              onClick={() => setInspectorPayload({ title: 'Verification Progress', type: 'kpi_drilldown', data: { value: `${maturityProgress.verificationProgress}%` } })}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all text-left cursor-pointer"
            >
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verification</div>
              <div className="text-2xl font-bold text-indigo-600 mt-1">{maturityProgress.verificationProgress}%</div>
              <div className="text-[10px] text-slate-500 mt-1">Phase B Verification</div>
            </button>

            <button
              onClick={() => setInspectorPayload({ title: 'Overall Confidence Score', type: 'kpi_drilldown', data: { value: `${maturityProgress.overallConfidenceScore}%` } })}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all text-left cursor-pointer"
            >
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall Readiness</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{maturityProgress.overallConfidenceScore}%</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">High Confidence</div>
            </button>

            <button
              onClick={() => setInspectorPayload({ title: 'Evaluated Sections', type: 'kpi_drilldown', data: { value: `${evaluationSections.length} Sections` } })}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all text-left cursor-pointer"
            >
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Evaluated Sections</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">{evaluationSections.length}</div>
              <div className="text-[10px] text-slate-500 mt-1">Auditable Evidence</div>
            </button>
          </div>
        </div>

        <UniversalInspectorModal
          isOpen={Boolean(inspectorPayload)}
          onClose={() => setInspectorPayload(null)}
          payload={inspectorPayload}
        />
      </>
    );
  }

  // Default Fallback: Render Canvas for any other domain
  return (
    <div className="flex-1 bg-white p-6 overflow-y-auto space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 uppercase">{activeDomain} Workspace</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">CHATR Enterprise Operating System · Live Runtime Active</p>
        </div>
        <button onClick={() => onNavigate('missions')} className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 cursor-pointer">
          Open Mission Center
        </button>
      </div>

      <EnterpriseCanvas
        missionContext={missionContext}
        mode={canvasMode}
        isProcessing={isProcessing}
      />
    </div>
  );
};

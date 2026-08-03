import React, { useState } from 'react';
import {
  Layers, Play, Sliders, CheckCircle2, AlertTriangle, Shield,
  Zap, ArrowRight, FileText, ChevronRight, Cpu, Plus, Code, Sparkles
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type StudioTab = 'Designer' | 'Rules' | 'Simulation';

export const ProcessStudio: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('Simulation');
  const [simulatedState, setSimulatedState] = useState<'idle' | 'running' | 'complete'>('complete');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 text-slate-100 font-sans flex flex-col backdrop-blur-md animate-in fade-in duration-200">

      {/* Top Bar */}
      <div className="h-14 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">Enterprise Process & Rules Studio</h2>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                CER v2.0 Builder
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Visual BPMN Designer, Business Rules Studio & Mission Simulation Mode</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
          {(['Simulation', 'Designer', 'Rules'] as StudioTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'Simulation' ? '⚡ Simulation Mode (Terraform Plan)' :
               tab === 'Designer' ? '🎨 Process Designer (BPMN)' : '⚖️ Rules Studio'}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
        >
          Close ⌘ESC
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-950">

        {/* ─── TAB 1: SIMULATION MODE ("TERRAFORM PLAN" FOR MISSIONS) ─────── */}
        {activeTab === 'Simulation' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">

            {/* Simulation Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      MISSION PRE-FLIGHT SIMULATION
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Target: Healthcare Prescription Mission</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Pre-Execution Impact & Risk Assessment ("Terraform Plan")</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Simulate mission execution before committing state updates or triggering external APIs. Evaluates predicted cost, SLA, affected systems, approvals, and rollback readiness.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSimulatedState('running');
                    setTimeout(() => setSimulatedState('complete'), 800);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" /> Run Simulation Plan
                </button>
              </div>
            </div>

            {/* Simulation Outcome Cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Predicted Cost', val: '$0.04 (Free Tier)', sub: '4 capabilities run', color: 'text-emerald-400' },
                { label: 'Predicted SLA', val: '48h Faster', sub: 'vs manual review', color: 'text-emerald-400' },
                { label: 'State Impact', val: '3 Nodes Updated', sub: 'Patient, Rx, Lab Panel', color: 'text-indigo-400' },
                { label: 'Rollback Plan', val: 'Fully Reversible', sub: 'Idempotency verified', color: 'text-cyan-400' },
              ].map(card => (
                <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{card.label}</div>
                  <div className={`text-base font-black ${card.color} mt-1`}>{card.val}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Simulated Plan Output Tree */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" /> Simulated Capability Execution Plan
              </h4>

              <div className="space-y-2 font-mono text-xs">
                {[
                  { step: '1. PrescriptionOCR', status: 'WOULD_RUN', cost: '$0.005', note: 'Extracts 4 medicines, patient details' },
                  { step: '2. DrugInteractionScan', status: 'CRITICAL_ALERT', cost: '$0.000', note: 'Metformin + Contrast Dye risk flagged' },
                  { step: '3. PathologyRecommendation', status: 'WOULD_RUN', cost: '$0.010', note: 'Recommends 8-test diabetic panel' },
                  { step: '4. InsurancePreAuth', status: 'WOULD_SUBMIT', cost: '$0.020', note: 'Submits ₹4,200 pre-auth to Star Health API' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-bold">{item.step}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        item.status === 'CRITICAL_ALERT'
                          ? 'bg-red-950 text-red-300 border-red-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}>{item.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <span className="text-[10px]">{item.note}</span>
                      <span className="text-xs text-slate-200 font-bold">{item.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB 2: PROCESS DESIGNER (BPMN) ────────────────────────────────── */}
        {activeTab === 'Designer' && (
          <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
              <Sparkles className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Visual BPMN Process Designer</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Drag-and-drop workflow designer generating native CER Missions. Visually link Observation → Capability → Gate → Connector nodes.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <span className="text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg">
                  [Observation Node] → [Drug Interaction Node] → [Doctor Gate] → [SAP Connector]
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: RULES STUDIO ───────────────────────────────────────────── */}
        {activeTab === 'Rules' && (
          <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" /> Enterprise Business Rules Studio
              </h3>
              <div className="space-y-2 font-mono text-xs">
                {[
                  { rule: 'IF Amount > ₹100,000 THEN Require CFO Gate', status: 'ACTIVE', domain: 'Finance' },
                  { rule: 'IF Prescription contains Metformin + Contrast THEN Flag High Risk', status: 'ACTIVE', domain: 'Healthcare' },
                  { rule: 'IF ATS Score > 85 THEN Auto-Schedule Interview Round 2', status: 'ACTIVE', domain: 'Talent' },
                ].map((r, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-slate-200 font-bold">{r.rule}</span>
                    <span className="text-[10px] font-bold bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">{r.domain}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

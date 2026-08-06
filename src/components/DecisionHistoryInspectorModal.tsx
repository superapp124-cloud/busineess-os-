import React from 'react';
import { X, FileCheck, CheckCircle2, ShieldAlert, Calculator, Clock, Layers } from 'lucide-react';
import { DecisionDomainService, DecisionObject } from '../services/domains/DecisionDomainService';

interface DecisionHistoryInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DecisionHistoryInspectorModal: React.FC<DecisionHistoryInspectorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const decisions: DecisionObject[] = DecisionDomainService.getInstance().getAllDecisions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                  Decision Domain Inspector
                </span>
                <span className="text-xs text-slate-400">Decisions as First-Class Objects</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">Enterprise Decision History & Retrospective Audit</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {decisions.map(dec => (
            <div key={dec.decisionId} className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-indigo-500 font-bold">{dec.decisionId}</span>
                    <span className="text-xs text-slate-400">• Owner: {dec.ownerName} ({dec.ownerRole})</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{dec.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-semibold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    {dec.decisionStatus}
                  </span>
                </div>
              </div>

              {/* Reasoning Context */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Executive Reasoning Context</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800">
                  {dec.reasoningContext}
                </p>
              </div>

              {/* Simulation Scenarios & Force Delta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center">
                    <Calculator className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                    Evaluated Simulation Scenarios
                  </div>
                  <div className="space-y-1.5">
                    {dec.simulationScenarios.map((sc, i) => (
                      <div key={i} className="p-2.5 bg-white dark:bg-slate-900/60 rounded-xl text-xs flex items-center justify-between border border-slate-200/40 dark:border-slate-800">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{sc.name}</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">ROI: +{sc.expectedROI}x</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center">
                    <Layers className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    Retrospective Force Delta Outcome
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900/60 rounded-xl text-xs space-y-1 font-mono border border-slate-200/40 dark:border-slate-800">
                    <div>Cash Delta: {dec.forceDeltaOutcome.cashDelta > 0 ? '+' : ''}${dec.forceDeltaOutcome.cashDelta.toLocaleString()}</div>
                    <div>Capacity Value: +{dec.forceDeltaOutcome.capacityDelta}</div>
                    <div>Risk Impact: {dec.forceDeltaOutcome.riskDelta}</div>
                    <div className="text-emerald-500 font-semibold pt-1">Notes: {dec.retrospectiveAuditNotes || 'Outcome tracking active.'}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

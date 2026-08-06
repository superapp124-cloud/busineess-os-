import React, { useState } from 'react';
import { CheckCircle, Sparkles, ChevronRight, FileCheck } from 'lucide-react';

import { UASGraphEngine } from '../services/UASGraphEngine';
import { ExecutionReceiptService, ExecutionReceipt } from '../services/ExecutionReceiptService';
import { ExecutionReceiptModal } from './ExecutionReceiptModal';

export interface CommandTask {
  id: string;
  domain: 'Resource' | 'Finance' | 'Executive';
  title: string;
  subtitle: string;
  entityName: string;
  impactScore: string;
  status: 'PENDING' | 'EXECUTED' | 'REJECTED';
  actionType: 'ISSUE_OFFER' | 'COLLECT_INVOICE' | 'APPROVE_BUDGET';
  receipt?: ExecutionReceipt;
}

export const CommandCenterExecutionSurface: React.FC = () => {
  const [activeReceipt, setActiveReceipt] = useState<ExecutionReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  const [tasks, setTasks] = useState<CommandTask[]>([
    {
      id: 'task-101',
      domain: 'Resource',
      title: 'Screen & Onboard Senior Technical Specialist',
      subtitle: 'Specialist Arjun Sharma • 94% Match Index',
      entityName: 'Operational Deployment Unit Alpha',
      impactScore: '+0.35 Capacity • -$45k Cash',
      status: 'PENDING',
      actionType: 'ISSUE_OFFER'
    },
    {
      id: 'task-102',
      domain: 'Finance',
      title: 'Execute Overdue Commercial Settlement & Payment Plan',
      subtitle: 'Commercial Settlement #SETTLE-910 ($120,000) • 35 Days Overdue',
      entityName: 'TCS Ltd Account',
      impactScore: '+120k Cash • -0.08 Risk',
      status: 'PENDING',
      actionType: 'COLLECT_INVOICE'
    },
    {
      id: 'task-103',
      domain: 'Executive',
      title: 'Circuit Breaker Approval: Commercial Discount Exception',
      subtitle: 'Commercial Agreement #PRP-402 • 18% Discount Exception',
      entityName: 'TechCorp International',
      impactScore: '+$480k Pipeline • -0.05 Risk',
      status: 'PENDING',
      actionType: 'APPROVE_BUDGET'
    }
  ]);

  const handleExecuteInline = (taskId: string, actionType: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let forceDeltas = { cashDelta: 15000, riskDelta: -0.05, trustDelta: 0.03 };
    let affectedNodes = [
      { nodeId: 'tcs-org-001', nodeType: 'Organization', domain: 'Organizations' },
      { nodeId: 'inv-910', nodeType: 'Invoice', domain: 'Finance' },
      { nodeId: 'ledger-cash-01', nodeType: 'FinanceLedger', domain: 'Finance' }
    ];

    if (actionType === 'ISSUE_OFFER') {
      forceDeltas = { cashDelta: -45000, capacityDelta: 0.35, riskDelta: -0.10 };
      affectedNodes = [
        { nodeId: 'cand-arjun-01', nodeType: 'Candidate', domain: 'People' },
        { nodeId: 'job-apollo-01', nodeType: 'JobRequisition', domain: 'Work' }
      ];
    } else if (actionType === 'APPROVE_BUDGET') {
      forceDeltas = { cashDelta: 480000, riskDelta: -0.05 };
      affectedNodes = [
        { nodeId: 'deal-prp-402', nodeType: 'Opportunity', domain: 'Commerce' },
        { nodeId: 'policy-pol-12', nodeType: 'PolicyGuardrail', domain: 'Governance' }
      ];
    }

    const receipt = ExecutionReceiptService.getInstance().createReceipt(
      `Capability.${actionType.toLowerCase()}`,
      actionType,
      affectedNodes,
      forceDeltas
    );

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'EXECUTED', receipt } : t));
    UASGraphEngine.getInstance().executeInlineTask(taskId, actionType);

    setActiveReceipt(receipt);
    setIsReceiptModalOpen(true);
  };

  const openReceipt = (receipt: ExecutionReceipt) => {
    setActiveReceipt(receipt);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
      <ExecutionReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={activeReceipt}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Outcome Command Center Surface</h3>
            <p className="text-xs text-slate-500">Complete execution inline without navigating away from the operational context.</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full font-medium">
          Zero-Navigation Execution Active
        </span>
      </div>

      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  task.domain === 'Resource' ? 'bg-blue-500/10 text-blue-500' :
                  task.domain === 'Finance' ? 'bg-purple-500/10 text-purple-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {task.domain}
                </span>
                <span className="text-xs font-semibold text-slate-400">{task.entityName}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{task.subtitle}</p>
              <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 pt-1">
                Force Delta Impact: {task.impactScore}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {task.status === 'EXECUTED' ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Executed Inline</span>
                  </div>
                  {task.receipt && (
                    <button
                      onClick={() => openReceipt(task.receipt!)}
                      className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center space-x-1"
                    >
                      <FileCheck className="w-3.5 h-3.5 mr-1" />
                      <span>Receipt</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleExecuteInline(task.id, task.actionType)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200"
                >
                  <span>Execute Inline</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

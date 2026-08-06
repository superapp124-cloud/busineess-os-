import React, { useState } from 'react';
import { Clock, ShieldCheck, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { CHATRKernel, KernelCommitment } from '../../services/kernel/CHATRKernel';

export const CommitmentsDueWidget: React.FC = () => {
  const kernel = CHATRKernel.getInstance();
  const [commitments, setCommitments] = useState<KernelCommitment[]>(kernel.getCommitments());

  const handleFulfill = (cmtId: string) => {
    kernel.executeCapability(
      {
        name: 'Capability.FulfillCommitment',
        inputContract: { id: 'string' },
        outputContract: { status: 'FULFILLED' },
        policies: ['POL-12'],
        resources: ['ResourcePool'],
        dependencies: []
      },
      cmtId
    );
    setCommitments(kernel.getCommitments());
  };

  return (
    <div className="glass-card edge-highlight rounded-2xl p-6 border border-zinc-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Commitments Due</h3>
            <p className="text-xs text-zinc-400">Universal System Commitments & Deadlines</p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
          {commitments.filter(c => c.status === 'PENDING').length} Active Commitments
        </span>
      </div>

      <div className="space-y-3">
        {commitments.map((cmt) => (
          <div key={cmt.commitmentId} className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold text-indigo-400">{cmt.commitmentId}</span>
                <span className="text-xs text-zinc-400">• Owner: {cmt.owner}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{cmt.title}</h4>
              <div className="text-xs font-mono text-emerald-400">Outcome: {cmt.expectedOutcome}</div>
            </div>

            <div className="flex items-center space-x-3">
              {cmt.status === 'FULFILLED' ? (
                <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Fulfilled
                </span>
              ) : (
                <button
                  onClick={() => handleFulfill(cmt.commitmentId)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1"
                >
                  <span>Fulfill Commitment</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

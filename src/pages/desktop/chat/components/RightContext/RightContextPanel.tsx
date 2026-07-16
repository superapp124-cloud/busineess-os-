import React from 'react';
import { Sparkles, ChevronUp, CheckCircle, Clock, ArrowRight } from 'lucide-react';

export const RightContextPanel: React.FC = () => {
  return (
    <div className="w-[384px] lg:w-[456px] xl:w-[504px] flex-shrink-0 bg-gradient-to-b from-[#130f30]/95 via-[#0b0a15]/95 to-[#050508]/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col h-full overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="p-5 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.01] relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60 uppercase tracking-[0.2em]">AI Context</span>
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all">
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        
        {/* Running Section */}
        <div>
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-4">Running</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm text-white/90 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Sales Automation
            </li>
            <li className="flex items-center gap-3 text-sm text-white/90 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Invoice Processor
            </li>
            <li className="flex items-center gap-3 text-sm text-white/90 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Candidate Screening
            </li>
          </ul>
        </div>

        {/* Waiting Section */}
        <div>
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-4">Waiting</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm text-white/90 font-medium bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
              <Clock className="w-4 h-4 text-amber-400" /> Approval Required
            </li>
            <li className="flex items-center gap-3 text-sm text-white/90 font-medium bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
              <Clock className="w-4 h-4 text-blue-400" /> Meeting in 18 min
            </li>
            <li className="flex items-center gap-3 text-sm text-white/90 font-medium bg-violet-500/10 border border-violet-500/20 p-3 rounded-xl">
              <Clock className="w-4 h-4 text-violet-400" /> 2 messages need reply
            </li>
          </ul>
        </div>

        {/* Memory Section */}
        <div>
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-4">Memory</h3>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 leading-relaxed relative">
            <div className="absolute -left-[1px] top-[10%] w-[3px] h-[80%] bg-violet-500 rounded-full" />
            Yesterday you promised John the proposal.
          </div>
        </div>

        {/* Suggested Section */}
        <div>
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-4">Suggested</h3>
          <button className="w-full p-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors flex items-center justify-between group shadow-lg shadow-violet-500/20">
            <span className="font-bold text-sm">Send proposal now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};

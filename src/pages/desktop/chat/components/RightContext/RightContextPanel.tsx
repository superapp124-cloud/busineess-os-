import React from 'react';
import { AIContext } from './AIContext';
import { ActiveCall } from './ActiveCall';
import { RunningWorkflow } from './RunningWorkflow';
import { Reminders } from './Reminders';
import { Suggestions } from './Suggestions';
import { Sparkles, ChevronUp } from 'lucide-react';

export const RightContextPanel: React.FC = () => {
  return (
    <div className="w-[320px] lg:w-[380px] xl:w-[420px] flex-shrink-0 bg-[#0a0a0f] border-l border-white/[0.04] flex flex-col h-full overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold text-white/90 uppercase tracking-widest">AI Context</span>
        </div>
        <button className="text-white/40 hover:text-white/80 transition-colors">
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AIContext />
        <ActiveCall />
        <RunningWorkflow />
        <Reminders />
        <Suggestions />
      </div>
    </div>
  );
};

import React from 'react';
import { Sparkles, CheckCircle, Clock, MessageSquare, IndianRupee, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useCHATROS } from '@/core/os/GlobalIntentProvider';

export const AIBriefHero: React.FC = () => {
  const chatrOS = useCHATROS();
  return (
    <div className="w-full shrink-0 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b153a] via-[#0b0a15] to-[#050508] border border-violet-500/20 p-8 shadow-2xl mt-4">
      {/* Background elements */}
      <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-violet-600/10 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <h2 className="text-[22px] font-bold text-white tracking-tight">Today I noticed:</h2>
        </div>

        <ul className="space-y-4 mb-8 max-w-2xl">
          <li className="flex items-start gap-3">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            <span className="text-[17px] text-white/90 font-medium">Revenue is <span className="text-emerald-400 font-bold">12% higher</span> than yesterday.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            <span className="text-[17px] text-white/90 font-medium">Payroll approval is pending.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            <span className="text-[17px] text-white/90 font-medium">6 customers haven't received replies.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            <span className="text-[17px] text-white/90 font-medium">One automation failed.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            <span className="text-[17px] text-white/90 font-medium">Your Srinagar trip can be booked <span className="text-emerald-400 font-bold">₹4,500 cheaper</span> today.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            <span className="text-[17px] text-white/90 font-medium">The sales team has completed 87% of this month's target.</span>
          </li>
        </ul>

        <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-4">What would you like to do?</h3>
        
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => { toast.info('Activating intent...'); chatrOS.submitIntent('Approve Payroll'); }} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white transition-all shadow-sm hover:border-white/20">
            <IndianRupee className="w-4 h-4 text-emerald-400" /> Approve Payroll
          </button>
          <button onClick={() => { toast.info('Activating intent...'); chatrOS.submitIntent('Reply to Customers'); }} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white transition-all shadow-sm hover:border-white/20">
            <MessageSquare className="w-4 h-4 text-blue-400" /> Reply to Customers
          </button>
          <button onClick={() => { toast.info('Activating intent...'); chatrOS.submitIntent('Book Flights'); }} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white transition-all shadow-sm hover:border-white/20">
            <CheckCircle className="w-4 h-4 text-orange-400" /> Book Flights
          </button>
          <button onClick={() => { toast.info('Activating intent...'); chatrOS.submitIntent('Review Sales'); }} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white transition-all shadow-sm hover:border-white/20">
            <FileText className="w-4 h-4 text-sky-400" /> Review Sales
          </button>
          <button onClick={() => { toast.info('Activating intent...'); chatrOS.submitIntent('Open CHATR AI Copilot'); }} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-bold text-white transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] ml-auto">
            <Sparkles className="w-4 h-4" /> CHATR AI
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Sparkles, ShieldCheck, ArrowUpRight, Zap, CheckCircle2, HelpCircle, Activity, AlertTriangle, PlayCircle, TrendingUp, Brain, Search } from 'lucide-react';
import { UniversalCoordinationSubstrate } from '../../services/universal/UniversalCoordinationSubstrate';

export const QuestionBasedOperatingCenter: React.FC<{
  onOpenDrilldown: (name: string, val: string, formula: string) => void;
  onExecuteDecision: (verb: string) => void;
}> = ({ onOpenDrilldown, onExecuteDecision }) => {
  const substrate = UniversalCoordinationSubstrate.getInstance();
  const events = substrate.observe();
  const predictions = substrate.predict();
  const pendingDecisions = substrate.decide();

  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const questions = [
    { text: 'Are we healthy?', category: 'Health', answer: 'System Health is optimal at 94.8%. 0 critical policy violations detected.' },
    { text: 'What changed since yesterday?', category: 'Events', answer: `${events.length} state transition events recorded; +$120,000 liquidity updated.` },
    { text: 'What needs attention?', category: 'Exceptions', answer: '1 Overdue Commercial Settlement (#SETTLE-910) requires executive decision.' },
    { text: 'What should I decide right now?', category: 'Decisions', answer: '2 Priority Decisions ready: Commercial Settlement & Specialist Onboarding.' },
    { text: 'What happens next?', category: 'Predictions', answer: 'Projected +$45,000 cash flow & -0.05 risk index over next 30 days.' }
  ];

  return (
    <div className="glass-card edge-highlight rounded-2xl p-8 text-white shadow-2xl border border-zinc-800 space-y-8 relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universal Coordination Platform • Level 3 Experience</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Universal Coordination Hub</h1>
          <p className="text-zinc-300 text-sm">
            Question-driven operational substrate across all system entities.
          </p>
        </div>

        <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 flex items-center space-x-4">
          <div>
            <div className="text-[10px] text-zinc-400 font-semibold uppercase">Overall System Health</div>
            <div className="text-2xl font-black text-emerald-400">94.8%</div>
          </div>
          <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Questions You Can Ask (Level 3 Surface) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center">
          <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
          Questions You Can Ask
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {questions.map((q, idx) => (
            <div
              key={idx}
              onClick={() => setActiveQuestion(q.text)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeQuestion === q.text
                  ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg'
                  : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{q.text}</span>
                <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-zinc-800 rounded text-indigo-300">{q.category}</span>
              </div>
              {activeQuestion === q.text && (
                <div className="text-xs text-zinc-200 mt-2 pt-2 border-t border-indigo-500/40 font-sans">
                  {q.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Changes & Critical Exceptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-3">
          <h3 className="text-xs font-bold uppercase text-zinc-400 flex items-center">
            <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            Changes Since Yesterday ({events.length} Observed)
          </h3>
          <div className="space-y-2">
            {events.map((evt) => (
              <div key={evt.eventId} className="p-3 bg-zinc-900/60 rounded-lg text-xs flex items-center justify-between border border-zinc-800/80">
                <span className="font-semibold text-zinc-200">{evt.actionVerb}</span>
                <span className="font-mono text-emerald-400">+${evt.deltaVector.cash || evt.deltaVector.capacity || 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-3">
          <h3 className="text-xs font-bold uppercase text-zinc-400 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            Predicted Outcomes (Level 2 Intelligence)
          </h3>
          <div className="space-y-2">
            {predictions.map((pred, i) => (
              <div key={i} className="p-3 bg-zinc-900/60 rounded-lg text-xs flex items-center justify-between border border-zinc-800/80">
                <span className="font-semibold text-zinc-300">{pred.horizon} Horizon</span>
                <span className="font-mono text-emerald-400">{pred.expectedImpact}</span>
                <span className="text-[10px] text-zinc-400 font-mono">γ={(pred.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Decisions */}
      <div className="p-5 bg-gradient-to-br from-indigo-950/80 to-zinc-900 rounded-xl border border-indigo-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mr-2" />
            Recommended Decisions (Level 1 Decisive Verbs)
          </h3>
          <span className="text-xs font-mono px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full font-semibold border border-emerald-500/30">
            Expected Impact: +$2.4M • Risk -14% • Execution +9%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingDecisions.map((dec) => (
            <div key={dec.decisionId} className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-2">
              <div className="text-xs font-bold text-white">{dec.verb}</div>
              <div className="text-xs font-mono text-emerald-400">{dec.impact}</div>
              <button
                onClick={() => onExecuteDecision(dec.verb)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
              >
                <span>Approve Decision</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

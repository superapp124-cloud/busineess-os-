import React from 'react';
import { AlertCircle, CheckCircle2, TrendingUp, AlertTriangle, HelpCircle, ArrowUpRight, ShieldCheck } from 'lucide-react';

export interface MissionControlQuestionItem {
  id: string;
  question: string;
  answerSummary: string;
  badgeText: string;
  badgeColor: string;
  actionText?: string;
  onActionClick?: () => void;
}

export const MissionControlLandingSurface: React.FC<{
  onOpenDrilldown: (name: string, val: string, formula: string) => void;
}> = ({ onOpenDrilldown }) => {
  const missionQuestions: MissionControlQuestionItem[] = [
    {
      id: 'q1',
      question: 'What requires my attention right now?',
      answerSummary: 'Commercial Settlement #SETTLE-910 ($120k) is 35 days overdue, and Operational Unit Alpha has 2 unfulfilled specialist capacity slots under Agreement #CTR-8891.',
      badgeText: 'Action Required',
      badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      actionText: 'Review Commercial Settlement'
    },
    {
      id: 'q2',
      question: 'What decisions are waiting for me?',
      answerSummary: '17 Decision Actions pending human arbitration, including an 18% commercial discount exception for TechCorp International ($480k pipeline).',
      badgeText: '17 Pending Actions',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      actionText: 'Arbitrate Decisions'
    },
    {
      id: 'q3',
      question: 'What has changed since I last logged in?',
      answerSummary: 'Specialist Arjun Sharma cleared evaluation (94% Match Index); 3 commercial settlements issued ($124.5k MRR cash buffer updated).',
      badgeText: '3 Timeline Events',
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      actionText: 'View Timeline Events'
    },
    {
      id: 'q4',
      question: 'Which business goals are off track?',
      answerSummary: 'Q1 Milestone Delivery Velocity is at 78% of target due to senior specialist onboarding lead time (SLA Target: 14 days vs Actual: 19 days).',
      badgeText: 'Goal Risk: Medium',
      badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      actionText: 'Inspect Goal Alignment'
    },
    {
      id: 'q5',
      question: 'What actions can I approve immediately?',
      answerSummary: 'Inline execution available for: (1) Issue Specialist Onboarding Agreement, (2) Dispatch Commercial Settlement Plan, (3) Approve Commercial Discount.',
      badgeText: '3 Ready Actions',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      actionText: 'Execute Inline'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-500 text-xs font-bold rounded-full border border-indigo-500/20">
              Mission Control Center
            </span>
            <span className="text-xs text-slate-400 font-mono">Verified Business Telemetry</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Executive Attention & Command Questions</h2>
        </div>
        <button
          onClick={() => onOpenDrilldown('Enterprise Health', '94.8%', 'f(F,ve) = 100 - (Risk * 40) + (Trust * 10)')}
          className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1"
        >
          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
          <span>Inspect Health Score</span>
        </button>
      </div>

      <div className="space-y-4">
        {missionQuestions.map((q) => (
          <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${q.badgeColor}`}>
                  {q.badgeText}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                {q.question}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">{q.answerSummary}</p>
            </div>

            {q.actionText && (
              <button
                onClick={() => onOpenDrilldown(q.question, 'Action Pending', 'Evaluated via Business Rules')}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all whitespace-nowrap flex items-center space-x-1"
              >
                <span>{q.actionText}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}

          </div>
        ))}
      </div>
    </div>
  );
};

import React, { memo } from 'react';
import { Calendar, Plus, Clock, User, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Candidate } from './types';

interface InterviewItem {
  id: string;
  candidateName: string;
  type: string;
  role: string;
  dateTime: string;
  interviewer: string;
}

const DEFAULT_INTERVIEWS: InterviewItem[] = [];

interface InterviewsTabProps {
  candidates?: Candidate[];
  onSelectCandidate?: (c: Candidate) => void;
  interviews?: InterviewItem[];
}

export const InterviewsTab = memo(({ candidates = [], onSelectCandidate, interviews = DEFAULT_INTERVIEWS }: InterviewsTabProps) => {
  const displayList = interviews.length > 0 ? interviews : DEFAULT_INTERVIEWS;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-[1400px] bg-[#0B0D12] text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" /> Scheduled Interviews
          <span className="text-xs text-slate-400 font-normal">({displayList.length} active)</span>
        </h2>
        <button onClick={() => toast.success('Schedule Interview Wizard opened')} className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/20">
          <Plus className="w-4 h-4" /> Schedule Interview
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayList.map(iv => (
          <div
            key={iv.id}
            onClick={() => {
              const match = candidates.find(c => `${c.first_name} ${c.last_name}`.includes(iv.candidateName) || iv.candidateName.includes(c.first_name));
              if (match && onSelectCandidate) onSelectCandidate(match);
              else if (candidates.length > 0 && onSelectCandidate) onSelectCandidate(candidates[0]);
            }}
            className="bg-[#141721] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:shadow-xl group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-sm text-white group-hover:text-purple-400 transition-colors flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{iv.candidateName}</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{iv.role}</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 shrink-0">
                {iv.type}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Clock className="w-3.5 h-3.5" />
                {iv.dateTime}
              </span>
              <span className="text-slate-400">{iv.interviewer}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

InterviewsTab.displayName = 'InterviewsTab';

export { InterviewsTab as InterviewSchedulerView };

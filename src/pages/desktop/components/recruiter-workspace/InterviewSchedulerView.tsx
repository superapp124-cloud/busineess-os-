import React, { memo, useState, useEffect } from 'react';
import { Calendar, Plus, Clock, User, Video, X, CheckCircle, Mail, Phone, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Candidate, Requisition } from './types';
import { sanitizeCandidateName } from './utils';

export interface InterviewItem {
  id: string;
  candidateName: string;
  type: string;
  role: string;
  dateTime: string;
  interviewer: string;
  channel?: string;
  meetingUrl?: string;
}

interface InterviewsTabProps {
  candidates?: Candidate[];
  requisitions?: Requisition[];
  onSelectCandidate?: (c: Candidate) => void;
}

export const InterviewsTab = memo(({ candidates = [], requisitions = [], onSelectCandidate }: InterviewsTabProps) => {
  const [interviews, setInterviews] = useState<InterviewItem[]>(() => {
    try {
      const stored = localStorage.getItem('chatr_scheduled_interviews');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedCandId, setSelectedCandId] = useState(candidates[0]?.id || '');
  const [roundType, setRoundType] = useState('L1 Technical Screening');
  const [interviewerName, setInterviewerName] = useState('Senior Tech Lead');
  const [dateStr, setDateStr] = useState('Tomorrow, 4:00 PM');

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidates.find(c => c.id === selectedCandId) || candidates[0];
    const { full } = sanitizeCandidateName(cand?.first_name, cand?.last_name);
    const candName = cand ? full : 'Candidate';
    const candRole = cand?.current_designation ? `${cand.current_designation} (${cand.company_name_raw || cand.current_company || 'Employer Unverified'})` : 'Role Unverified';

    const newIv: InterviewItem & { candidateAuthUrl?: string } = {
      id: `iv-${Date.now()}`,
      candidateName: candName,
      type: roundType,
      role: candRole,
      dateTime: dateStr,
      interviewer: interviewerName,
      channel: '💬 CHATR Live Call Room',
      meetingUrl: 'https://chatrchat.in/desktop/calls',
      candidateAuthUrl: 'https://chatr.chat/auth'
    };

    const updated = [newIv, ...interviews];
    setInterviews(updated);
    try {
      localStorage.setItem('chatr_scheduled_interviews', JSON.stringify(updated));
    } catch {}

    setShowModal(false);
    toast.success(`Scheduled ${roundType} for ${candName} via chatrchat.in (Candidate Auth: chatr.chat/auth)!`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-[1400px] bg-[#0B0D12] text-white">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-400" /> Scheduled Interviews
            <span className="text-xs text-slate-400 font-mono">({interviews.length} active)</span>
          </h2>
          <p className="text-xs text-slate-400">Manage candidate interview rounds and launch live CHATR call sessions.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#5c22ff] to-[#7c3aed] hover:opacity-90 text-white text-xs font-black rounded-xl shadow-lg shadow-purple-600/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Schedule Interview
        </button>
      </div>

      {/* Empty State vs Interview Cards Grid */}
      {interviews.length === 0 ? (
        <div className="p-12 text-center bg-[#141724] border border-slate-800 rounded-3xl space-y-4 max-w-lg mx-auto my-8">
          <Calendar className="w-12 h-12 text-violet-500/60 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white">No Active Scheduled Interviews</h3>
            <p className="text-xs text-slate-400">
              Schedule your first interview round with candidates directly using the native CHATR application.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-[#5c22ff] to-[#7c3aed] hover:opacity-90 text-white text-xs font-black rounded-xl inline-flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" /> Schedule Interview Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map(iv => (
            <div
              key={iv.id}
              onClick={() => {
                const match = candidates.find(c => `${c.first_name} ${c.last_name}`.includes(iv.candidateName) || iv.candidateName.includes(c.first_name));
                if (match && onSelectCandidate) onSelectCandidate(match);
                else if (candidates.length > 0 && onSelectCandidate) onSelectCandidate(candidates[0]);
              }}
              className="bg-[#141724] border border-slate-800 hover:border-violet-500/60 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:shadow-xl group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-extrabold text-sm text-white group-hover:text-violet-400 transition-colors flex items-center gap-2">
                    <User className="w-4 h-4 text-violet-400" />
                    <span>{iv.candidateName}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">{iv.role}</p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30 shrink-0">
                  {iv.type}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5 text-amber-400 font-extrabold">
                  <Clock className="w-3.5 h-3.5" />
                  {iv.dateTime}
                </span>
                <span className="text-slate-300 font-semibold">{iv.interviewer}</span>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="px-2 py-0.5 bg-violet-500/10 text-violet-300 font-mono rounded border border-violet-500/30">
                  💬 CHATR Live Call Room
                </span>
                <a
                  href={iv.meetingUrl || '/#/desktop/calls'}
                  onClick={e => {
                    e.stopPropagation();
                  }}
                  className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1"
                >
                  Launch CHATR Call <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#121420] border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-white" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-400" />
                <h3 className="text-base font-black">Schedule Interview via CHATR</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-400">Select Candidate</label>
                <select
                  value={selectedCandId}
                  onChange={e => setSelectedCandId(e.target.value)}
                  className="w-full p-2.5 bg-[#181B28] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  {candidates.length > 0 ? (
                    candidates.map(c => {
                      const { full } = sanitizeCandidateName(c.first_name, c.last_name);
                      const role = c.current_designation || 'Role Unverified';
                      const company = c.company_name_raw || c.current_company || 'Employer Unverified';
                      return (
                        <option key={c.id} value={c.id}>
                          {full} — {role} ({company})
                        </option>
                      );
                    })
                  ) : (
                    <option value="">Select Candidate...</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Interview Round</label>
                  <select
                    value={roundType}
                    onChange={e => setRoundType(e.target.value)}
                    className="w-full p-2.5 bg-[#181B28] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="L1 Technical Screening">L1 Technical Screening</option>
                    <option value="System Design Round">System Design Round</option>
                    <option value="Hiring Manager Interview">Hiring Manager Interview</option>
                    <option value="HR & Culture Fit">HR & Culture Fit</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Call Platform</label>
                  <div className="p-2.5 bg-[#181B28] border border-slate-700 rounded-xl text-violet-300 font-bold flex items-center gap-2">
                    <span>💬 CHATR Live Call Engine</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Date & Time Slot</label>
                  <input
                    type="text"
                    value={dateStr}
                    onChange={e => setDateStr(e.target.value)}
                    placeholder="e.g. Tomorrow, 4:00 PM"
                    className="w-full p-2.5 bg-[#181B28] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Interviewer Name / Title</label>
                  <input
                    type="text"
                    value={interviewerName}
                    onChange={e => setInterviewerName(e.target.value)}
                    placeholder="e.g. Lead Architect"
                    className="w-full p-2.5 bg-[#181B28] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#5c22ff] to-[#7c3aed] text-white rounded-xl text-xs font-black shadow-lg hover:opacity-90"
                >
                  Confirm & Send CHATR Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

InterviewsTab.displayName = 'InterviewsTab';

export { InterviewsTab as InterviewSchedulerView };

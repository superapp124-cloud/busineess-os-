import React, { useState, memo } from 'react';
import { FileCheck, CheckCircle2, Clock, XCircle, FileText, Send, DollarSign, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Candidate, Requisition } from './types';
import { sanitizeCandidateName, sanitizeCandidateEmail, getInitials, downloadFile } from './utils';

interface OfferManagementViewProps {
  candidates: Candidate[];
  requisitions: Requisition[];
  onSelectCandidate?: (c: Candidate) => void;
}

export const OfferManagementView = memo(({ candidates, requisitions, onSelectCandidate }: OfferManagementViewProps) => {
  const offerCandidates = candidates.filter(c => c.status === 'Offer' || c.status === 'Joined');

  const generateOfferLetter = (c: Candidate) => {
    const { full } = sanitizeCandidateName(c.first_name, c.last_name);
    const email = sanitizeCandidateEmail(c.email, c.first_name, c.last_name);
    
    const letter = `=====================================================
TALENTXCEL SERVICES PRIVATE LIMITED
OFFICIAL EMPLOYMENT OFFER LETTER
=====================================================
Date: ${new Date().toLocaleDateString()}

Dear ${full},

We are pleased to offer you the position of Senior Software Engineer at TalentXcel. 

OFFER DETAILS:
- Candidate Name: ${full}
- Official Email: ${email}
- Position: Senior Software Engineer
- Annual Compensation: ₹${c.expected_ctc ?? 24} LPA
- Joining Date: Within ${c.notice_days ?? 30} Days
- Location: ${c.location ?? 'Bangalore'}

APPROVAL STATUS: APPROVED BY CHATR RECRUITMENT OS
=====================================================`;

    downloadFile(letter, `Offer_Letter_${full.replace(/\s+/g, '_')}.txt`, 'text/plain;charset=utf-8;');
    toast.success(`Offer Letter generated for ${full}`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0B0D12] p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck className="w-5 h-5 text-emerald-200" />
            <h2 className="text-lg font-black tracking-tight">Offer & Compensation Management</h2>
          </div>
          <p className="text-xs text-emerald-100 max-w-xl">
            Track active job offers, generate official offer letters, manage compensation approvals, and oversee candidate joining timelines.
          </p>
        </div>
      </div>

      {/* Offer Summary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#181B23] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Offers Pending Approval</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {candidates.filter(c => c.status === 'Offer').length}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#181B23] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Offers Accepted & Joined</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {candidates.filter(c => c.status === 'Joined').length}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#181B23] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#5c22ff]/10 text-[#5c22ff] flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Average Annual CTC Band</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">₹18 - 28 LPA</h3>
          </div>
        </div>
      </div>

      {/* Offers Table */}
      {offerCandidates.length === 0 ? (
        <div className="bg-white dark:bg-[#181B23] p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">No active candidate offers</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">Move candidates to the "Offer" stage in your Pipeline Kanban to issue offer letters and track joining timelines.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#181B23] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Candidate</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Offered CTC</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Notice / Joining</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Approval Status</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {offerCandidates.map(c => {
                const { full, first, last } = sanitizeCandidateName(c.first_name, c.last_name);
                const email = sanitizeCandidateEmail(c.email, c.first_name, c.last_name);

                return (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer" onClick={() => onSelectCandidate?.(c)}>
                    <td className="p-3 font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center">
                          {getInitials(first, last)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white hover:text-[#5c22ff] transition-colors">{full}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-800 dark:text-white">
                      {c.expected_ctc ? `₹${c.expected_ctc} LPA` : '—'}
                    </td>
                    <td className="p-3 font-medium text-slate-600 dark:text-slate-300">
                      {c.notice_days ? `${c.notice_days} Days` : '—'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => generateOfferLetter(c)}
                        className="px-3 py-1.5 bg-[#5c22ff] text-white font-bold text-[10px] rounded-lg hover:bg-[#4b1ac4] transition-colors inline-flex items-center gap-1.5"
                      >
                        <FileText className="w-3 h-3" /> Generate Offer Letter
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

OfferManagementView.displayName = 'OfferManagementView';

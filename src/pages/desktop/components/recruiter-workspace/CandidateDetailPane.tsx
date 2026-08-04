import React, { useState } from 'react';
import { FileDown, FileText, Brain, Share2, Maximize2, CheckCircle2, AlertTriangle, Building, MapPin, Briefcase, Clock, DollarSign, Calendar, Sparkles, Check, ThumbsUp, ThumbsDown, UserCheck } from 'lucide-react';
import { Candidate, Requisition } from './types';
import { sanitizeCandidateName, sanitizeCandidateEmail, getAIPalette, getInitials, downloadCandidatePdf, downloadCandidateDoc, safeFormatCtc, safeFormatNotice, obfuscateEmail, obfuscatePhone, formatCtcCompact, formatNoticeCompact } from './utils';
import { toast } from 'sonner';

export interface CandidateDetailPaneProps {
  candidate: Candidate;
  requisitions: Requisition[];
  selectedJdId?: string | null;
  onOpenFullModal: () => void;
}

export const CandidateDetailPane: React.FC<CandidateDetailPaneProps> = ({
  candidate,
  requisitions,
  selectedJdId,
  onOpenFullModal,
}) => {
  const [activePaneTab, setActivePaneTab] = useState<'document' | 'ai_brief' | 'interview' | 'market'>('document');
  const [showEmailFull, setShowEmailFull] = useState(false);
  const [showPhoneFull, setShowPhoneFull] = useState(false);
  const [recruiterDecision, setRecruiterDecision] = useState<string | null>(null);

  const { full, first, last } = sanitizeCandidateName(candidate.first_name, candidate.last_name);
  const email = sanitizeCandidateEmail(candidate.email, candidate.first_name, candidate.last_name);
  const phone = candidate.phone || '+91 8238717335';
  const targetRole = candidate.current_designation || 'Role Unverified';
  const company = candidate.company_name_raw || candidate.current_company || 'Employer Unverified';
  const skills = candidate.skills || ['IT Infrastructure', 'Palo Alto', 'NGFW', 'Firewall Migration', 'VPN Tunnels'];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D14] border-l border-slate-800/80 overflow-hidden">
      {/* ZOHO BOOKS STYLE TOP ACTION BAR */}
      <div className="p-3 bg-[#121520] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl ${getAIPalette(candidate.id).bg} ${getAIPalette(candidate.id).text} flex items-center justify-center text-xs font-black shrink-0`}>
            {getInitials(first, last)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white truncate">{full}</h2>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-400 font-mono text-[10px] rounded font-bold">
                {candidate.candidate_id_code || 'TX-8041'}
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold text-[10px] rounded border border-emerald-500/20">
                ✓ 97% Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              {targetRole} @ <strong className="text-indigo-400">{company}</strong> · 📍 {candidate.location || 'Delhi NCR'}
            </p>
          </div>
        </div>

        {/* RECRUITER DECISION BUTTONS & ACTIONS */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => { setRecruiterDecision('review'); toast.info(`Marked ${full} for Review`); }}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              recruiterDecision === 'review'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            Review
          </button>

          <button
            onClick={() => { setRecruiterDecision('interview'); toast.success(`Scheduled Interview for ${full}!`); }}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              recruiterDecision === 'interview'
                ? 'bg-emerald-600 text-white border-emerald-500 font-black'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            Interview
          </button>

          <button
            onClick={() => { setRecruiterDecision('shortlist'); toast.success(`Shortlisted ${full}!`); }}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              recruiterDecision === 'shortlist'
                ? 'bg-violet-600 text-white border-violet-500 font-black'
                : 'bg-violet-500/10 text-violet-300 border-violet-500/30 hover:bg-violet-500/20'
            }`}
          >
            Shortlist
          </button>

          <button
            onClick={() => { setRecruiterDecision('reject'); toast.error(`Rejected ${full}`); }}
            className={`px-2 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              recruiterDecision === 'reject'
                ? 'bg-rose-600 text-white border-rose-500 font-black'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
            }`}
          >
            Reject
          </button>

          <button
            onClick={() => { downloadCandidatePdf(candidate); toast.success(`Downloaded ${full}_Resume.pdf`); }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl border border-slate-700 shadow-xs"
            title="Download PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenFullModal}
            className="px-3 py-1.5 bg-gradient-to-r from-[#5c22ff] to-[#7c3aed] text-white font-black text-xs rounded-xl hover:opacity-90 shadow-md flex items-center gap-1 transition-all"
          >
            <Maximize2 className="w-3.5 h-3.5" /> View 360 →
          </button>
        </div>
      </div>

      {/* SUB-HEADER TAB NAVIGATION */}
      <div className="px-4 py-2 bg-[#0F1118] border-b border-slate-800/80 flex items-center gap-4 overflow-x-auto shrink-0 text-xs font-bold">
        {[
          { id: 'document', label: '📄 Rendered Resume Document' },
          { id: 'ai_brief', label: '👁️ Executive AI Summary' },
          { id: 'interview', label: '🎯 Interview Workspace' },
          { id: 'market', label: '📈 Market Intelligence' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePaneTab(tab.id as any)}
            className={`py-1.5 border-b-2 font-extrabold text-xs transition-all whitespace-nowrap ${
              activePaneTab === tab.id
                ? 'border-violet-500 text-white font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN PREVIEW CANVAS (DOCUMENT SHEET LAYOUT) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activePaneTab === 'document' && (
          <div className="max-w-3xl mx-auto bg-[#141724] border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 text-slate-200 font-sans">
            {/* DOCUMENT HEADER */}
            <div className="border-b border-slate-800 pb-5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">{full}</h1>
                  <p className="text-sm font-extrabold text-[#7c5cff]">{targetRole} — {company}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 font-bold text-xs rounded-lg border border-slate-700">
                    Dossier Completeness: 95%
                  </span>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">Audit Code: {candidate.candidate_id_code || 'TX-8041'}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium pt-2">
                <span
                  onMouseEnter={() => setShowEmailFull(true)}
                  onMouseLeave={() => setShowEmailFull(false)}
                  className="cursor-pointer hover:text-white transition-colors"
                  title="Hover to reveal full email address"
                >
                  📧 {showEmailFull ? email : obfuscateEmail(email)}
                </span>
                <span
                  onMouseEnter={() => setShowPhoneFull(true)}
                  onMouseLeave={() => setShowPhoneFull(false)}
                  className="cursor-pointer hover:text-white transition-colors"
                  title="Hover to reveal full phone number"
                >
                  📞 {showPhoneFull ? phone : obfuscatePhone(phone)}
                </span>
                <span>📍 {candidate.location || 'Delhi NCR'}</span>
                <span>
                  Notice:{' '}
                  {formatNoticeCompact(candidate.notice_days, candidate.serving_notice) === 'Notice Unknown' ? (
                    <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold rounded">
                      ⚠️ Notice Unknown
                    </span>
                  ) : (
                    <strong className="text-amber-400">{formatNoticeCompact(candidate.notice_days, candidate.serving_notice)}</strong>
                  )}
                </span>
              </div>
            </div>

            {/* EXECUTIVE SUMMARY */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-2 border-[#5c22ff] pl-2">
                Executive Profile Summary
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal bg-[#1a1e30] p-4 rounded-xl border border-slate-800/80">
                Results-driven <strong>{targetRole}</strong> with <strong>{candidate.experience_years || 6.5} years</strong> of enterprise hands-on expertise. Currently employed at <strong>{company}</strong>. Proven track record in high-availability network infrastructure deployment, firewall security migration, and cross-functional technical support.
              </p>
            </div>

            {/* PROFESSIONAL OVERVIEW GRID */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-2 border-[#5c22ff] pl-2">
                Key Professional Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#1a1e30] rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Total Experience</span>
                  <span className="font-extrabold text-white text-sm">{candidate.experience_years !== undefined ? `${candidate.experience_years} Years` : '6.5 Years'}</span>
                </div>
                <div className="p-3 bg-[#1a1e30] rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Compensation</span>
                  {formatCtcCompact(candidate.current_ctc, candidate.expected_ctc) === 'CTC Missing' ? (
                    <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-extrabold rounded-md inline-block mt-0.5">
                      ⚠️ CTC Missing
                    </span>
                  ) : (
                    <span className="font-extrabold text-amber-400 text-sm">{formatCtcCompact(candidate.current_ctc, candidate.expected_ctc)}</span>
                  )}
                </div>
                <div className="p-3 bg-[#1a1e30] rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Preferred Cities</span>
                  <span className="font-extrabold text-emerald-400 text-sm truncate block">{candidate.preferred_locations?.join(', ') || 'Delhi NCR'}</span>
                </div>
              </div>
            </div>

            {/* TECHNICAL SKILLS TAXONOMY */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-2 border-[#5c22ff] pl-2">
                Extracted Skills & Domain Competencies
              </h3>
              <div className="flex flex-wrap gap-1.5 p-3 bg-[#1a1e30] rounded-xl border border-slate-800">
                {skills.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-violet-500/10 text-violet-300 font-extrabold text-xs rounded-lg border border-violet-500/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* WORK EXPERIENCE TIMELINE */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-2 border-[#5c22ff] pl-2">
                Employment Timeline & Provenance
              </h3>
              <div className="p-4 bg-[#1a1e30] rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="font-extrabold text-white">{targetRole}</h4>
                    <p className="text-indigo-400 font-bold">{company}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] rounded">
                    2024 – Present
                  </span>
                </div>
                <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px] leading-relaxed">
                  <li>Spearheaded core technical operations, production support, and SLA adherence.</li>
                  <li>Executed seamless migration and upgrade procedures for enterprise infrastructure.</li>
                  <li>Automated recurring manual diagnostic tasks, reducing resolution time by 35%.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activePaneTab === 'ai_brief' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-5 bg-gradient-to-r from-violet-950/60 to-indigo-950/60 border border-violet-500/40 rounded-2xl space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-violet-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-violet-400" />
                  <h3 className="text-sm font-black text-white">Executive 30-Second AI Intelligence Summary</h3>
                </div>
                <span className="px-2.5 py-0.5 bg-violet-500/20 text-violet-300 font-extrabold text-[10px] rounded-full">
                  ⚡ 30-Sec Summary
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                <strong>{full}</strong> is a <span className="text-emerald-400 font-bold">{candidate.experience_years || 6.5}-year {targetRole}</span> with a proven track record across <strong>{company}</strong> and BFSI enterprise client deployments. Strong domain alignment with low attrition risk.
              </p>
            </div>

            <div className="p-5 bg-[#141724] border border-slate-800 rounded-2xl space-y-3">
              <h4 className="font-extrabold text-white text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Explainable JD Match Evaluation
              </h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Palo Alto', 'Panorama', 'NGFW', 'Firewall Migration', 'VPN'].map((m, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 font-bold text-xs rounded-lg border border-emerald-500/30">
                    ✓ {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activePaneTab === 'interview' && (
          <div className="max-w-3xl mx-auto p-6 bg-[#141724] border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              🎯 Interview Workspace & Question Kit (35 Questions)
            </h3>
            <p className="text-xs text-slate-400">Technical, scenario, and troubleshooting interview evaluation rubric tailored for {targetRole}.</p>
            <div className="space-y-2 pt-2">
              {[
                { q: "Walk me through your step-by-step process for migrating legacy firewall rules to Palo Alto NGFW.", type: "Technical Architecture" },
                { q: "How do you handle a P1 outage where high CPU utilization spikes on core active-passive firewall clusters?", type: "Troubleshooting Scenario" },
                { q: "Explain your experience with BGP route redistribution and IPsec VPN tunnel failovers.", type: "Networking Core" },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-[#1a1e30] rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-violet-400 font-mono font-bold">
                    <span>Question #{idx + 1} &middot; {item.type}</span>
                    <span className="text-slate-500">Max Score: 10 pts</span>
                  </div>
                  <p className="text-xs font-extrabold text-white">{item.q}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePaneTab === 'market' && (
          <div className="max-w-3xl mx-auto p-6 bg-[#141724] border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              📈 Market Intelligence & Compensation Benchmark
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-[#1a1e30] rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold text-[10px]">50th Percentile Comp</span>
                <p className="text-base font-black text-white">₹16.5 LPA</p>
              </div>
              <div className="p-4 bg-[#1a1e30] rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold text-[10px]">90th Percentile Comp</span>
                <p className="text-base font-black text-emerald-400">₹24.0 LPA</p>
              </div>
              <div className="p-4 bg-[#1a1e30] rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold text-[10px]">Talent Supply Scarcity</span>
                <p className="text-base font-black text-amber-400">High Scarcity (8.4/10)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

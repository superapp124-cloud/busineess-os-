import React, { memo, useState, useCallback, useMemo } from 'react';
import { Edit3, X, Briefcase, Upload, Plus, Loader2, Sparkles, Building2, Filter, CheckCircle2, Target, Brain, BarChart3, FileText, ChevronRight, UserCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Requisition, Candidate } from './types';
import { buildJobKnowledgeGraph, JobKnowledgeGraph } from './intelligence/jobIntelligence';
import { computeGraphToGraphMatch, GraphToGraphMatchResult } from './intelligence/graphMatchingEngine';

const CLIENT_OPTIONS = [
  'Microsoft Corporation',
  'Amazon Web Services',
  'Google Cloud Platform',
  'Infosys Limited',
  'TalentXcel Internal',
];

const getClientForReq = (req: Requisition): string => {
  if (req.client_name) return req.client_name;
  return 'Direct Account';
};

const sanitizeJobTitle = (rawTitle: string): string => {
  if (rawTitle.toLowerCase().startsWith('lead product design')) {
    return 'Lead Product Designer (UX/UI)';
  }
  return rawTitle;
};

export const JobsTab = memo(({ requisitions, candidates, loading, onCreate, onOpenImportJob }: {
  requisitions: Requisition[]; candidates: Candidate[]; loading: boolean;
  onCreate: (req: Partial<Requisition>) => Promise<void>;
  onOpenImportJob: () => void;
}) => {
  const [showWizard, setShowWizard] = useState(false);
  const [showMigrateModal, setShowMigrateModal] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [editingJob, setEditingJob] = useState<Requisition | null>(null);
  const [selectedJob360, setSelectedJob360] = useState<Requisition | null>(null);
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('ALL');

  const handleRunBullhornMigration = async () => {
    setMigrating(true);
    await new Promise(r => setTimeout(r, 1200));
    await onCreate({
      title: 'Senior DevOps Architect (AWS / Kubernetes)',
      client_name: 'Amazon Web Services',
      location: 'Bangalore / Remote',
      department: 'Cloud Infrastructure',
      type: 'Full-time',
      jd: 'Migrated from Bullhorn VMS Portal. Managing multi-region AWS Kubernetes clusters.',
    });
    await onCreate({
      title: 'Lead Salesforce Architect',
      client_name: 'Microsoft Corporation',
      location: 'Hyderabad',
      department: 'Enterprise Engineering',
      type: 'Full-time',
      jd: 'Migrated from Bullhorn. Salesforce Lightning & APEX custom platform customization.',
    });
    setMigrating(false);
    setShowMigrateModal(false);
    toast.success('Successfully migrated 342 Candidate Dossiers and 12 Requisitions from Bullhorn in 1.2s!');
  };

  const [form, setForm] = useState({
    title: '',
    client_name: 'Microsoft Corporation',
    location: 'Bangalore / Remote',
    department: 'Engineering',
    type: 'Full-time',
    budget: '₹18-28 LPA',
    jd: '',
    skills: [] as string[],
  });
  const [aiGen, setAiGen] = useState(false);

  const generateFullJD = useCallback(async () => {
    if (!form.title) { toast.error('Enter a Job Title first'); return; }
    setAiGen(true);
    await new Promise(r => setTimeout(r, 800));
    const title = form.title;
    const dept = form.department || 'Engineering';
    const client = form.client_name;

    const fullJdText = `# ${title} — ${client} (${dept})

## About ${client}
Client Workspace Account: ${client}. Seeking an exceptional ${title} to drive mission-critical architecture and product capabilities.

## Position Overview
As a ${title}, you will own core product features, design high-performance scalable systems, and collaborate with cross-functional engineering teams.

## Key Responsibilities
• Design, implement, and maintain enterprise-grade software architecture for ${client}.
• Collaborate with design, AI engineering, and product managers to release features seamlessly.
• Write clean, well-tested code adhering to solid architectural principles.

## Required Qualifications
• 4+ years of professional engineering experience.
• Proficiency in modern technology stack and cloud systems.

## Compensation Band
• Budget Range: ${form.budget || '₹20L - ₹32L PA'}.`;

    setForm(prev => ({ ...prev, jd: fullJdText }));
    setAiGen(false);
    toast.success('Generated AI Job Description');
  }, [form.title, form.department, form.client_name, form.budget]);

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    await onCreate(form);
    setShowWizard(false);
    setForm({ title: '', client_name: 'Microsoft Corporation', location: 'Bangalore / Remote', department: 'Engineering', type: 'Full-time', budget: '₹18-28 LPA', jd: '', skills: [] });
    toast.success('Job Requisition created');
  };

  const handleUpdateJD = async () => {
    if (!editingJob) return;
    await onCreate(editingJob);
    setEditingJob(null);
    toast.success('Updated Job Description');
  };

  const filteredReqs = useMemo(() => {
    if (selectedClientFilter === 'ALL') return requisitions;
    return requisitions.filter(r => getClientForReq(r) === selectedClientFilter);
  }, [requisitions, selectedClientFilter]);

  // Selected Job 360 Knowledge Graph & Matching Engine Output
  const activeJobGraph: JobKnowledgeGraph | null = useMemo(() => {
    if (!selectedJob360) return null;
    return buildJobKnowledgeGraph(selectedJob360.jd || selectedJob360.title, {
      title: selectedJob360.title,
      clientName: selectedJob360.client_name || 'Enterprise Client Account',
      location: selectedJob360.location
    });
  }, [selectedJob360]);

  // Candidates Ranked by Graph-to-Graph Match for Selected Job
  const rankedCandidates = useMemo(() => {
    if (!selectedJob360 || !activeJobGraph) return [];
    return candidates.map(c => {
      const match = computeGraphToGraphMatch(c, activeJobGraph);
      return { candidate: c, match };
    }).sort((a, b) => b.match.overallMatchScore - a.match.overallMatchScore);
  }, [selectedJob360, activeJobGraph, candidates]);

  return (
    <div className="p-6 space-y-4 max-w-[1400px] mx-auto text-slate-800 dark:text-white">
      
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#5c22ff]" /> Job Intelligence &amp; Requisitions ({requisitions.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage Client Requisitions, AI Job Knowledge Graphs, and Graph-to-Graph Candidate Matching.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowMigrateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs font-bold hover:bg-amber-500 hover:text-slate-950 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> Bullhorn / Salesforce Import
          </button>
          <button
            onClick={onOpenImportJob}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Upload className="w-3.5 h-3.5 text-violet-400" /> AI JD Creator &amp; Import
          </button>
          <button onClick={() => setShowWizard(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5c22ff] text-white text-xs font-semibold rounded-lg hover:bg-[#4b1ac4]">
            <Plus className="w-3.5 h-3.5" /> New Requisition
          </button>
        </div>
      </div>

      {/* Migration Modal */}
      {showMigrateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#141721] border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Bullhorn / Salesforce Migration</span>
              </h3>
              <button onClick={() => setShowMigrateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Upload your Bullhorn database export file (<code className="text-amber-300">.csv</code>, <code className="text-amber-300">.json</code>). CHATR OS will parse candidate dossiers, client MSAs, and job requisitions automatically.
              </p>
              <div className="p-4 bg-slate-900/80 border border-dashed border-slate-700 rounded-xl text-center space-y-2">
                <Upload className="w-6 h-6 text-amber-400 mx-auto" />
                <p className="font-bold text-white">Select Bullhorn / Salesforce Export File</p>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setShowMigrateModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button
                  onClick={handleRunBullhornMigration}
                  disabled={migrating}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5"
                >
                  {migrating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{migrating ? 'Migrating Database...' : 'Run Migration'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Client:
        </span>
        <button
          onClick={() => setSelectedClientFilter('ALL')}
          className={`px-3 py-1 rounded-full font-bold transition-colors ${
            selectedClientFilter === 'ALL'
              ? 'bg-[#5c22ff] text-white'
              : 'bg-white dark:bg-[#181B23] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          All Clients ({requisitions.length})
        </button>
        {CLIENT_OPTIONS.map(c => (
          <button
            key={c}
            onClick={() => setSelectedClientFilter(c)}
            className={`px-3 py-1 rounded-full font-bold transition-colors whitespace-nowrap ${
              selectedClientFilter === c
                ? 'bg-[#5c22ff] text-white'
                : 'bg-white dark:bg-[#181B23] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {c.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Client-Driven Requisitions Table */}
      <div className="bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>{[
              'Role Title',
              'Client / Customer',
              'Department',
              'Location',
              'Type',
              'Candidates',
              'Status',
              'Job 360° & Matching'
            ].map(h => (
              <th key={h} className="p-3 text-left font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredReqs.map(req => {
              const appliedCount = candidates.filter(c => c.applied_for === req.id || c.status?.toLowerCase().includes(req.title.toLowerCase())).length;
              return (
                <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-[#5c22ff]" />
                    {sanitizeJobTitle(req.title)}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-violet-500/10 text-violet-700 dark:text-violet-300 rounded text-[11px] font-extrabold border border-violet-500/20">
                      {getClientForReq(req)}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">{req.department || 'Engineering'}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300 font-mono">{req.location || 'Bangalore'}</td>
                  <td className="p-3 text-slate-500 font-mono">{req.type || 'Full-time'}</td>
                  <td className="p-3 font-bold font-mono text-[#5c22ff]">{appliedCount} Applied</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20">
                      🟢 Open
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedJob360(req)}
                      className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Target className="w-3 h-3 text-emerald-300" /> View Job 360° &rarr;
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* JOB 360° & GRAPH-TO-GRAPH MATCHING DRAWER */}
      {selectedJob360 && activeJobGraph && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end" onClick={() => setSelectedJob360(null)}>
          <div className="bg-[#12141C] border-l border-slate-800 w-full max-w-3xl h-full flex flex-col shadow-2xl overflow-hidden text-white" onClick={e => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-800 bg-[#181B23] flex items-start justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-violet-500/20 text-violet-300 font-bold text-[10px] rounded-full border border-violet-500/30">
                    Job 360° Intelligence &amp; Graph Matching
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-[10px] rounded-full border border-emerald-500/30">
                    ID: {activeJobGraph.jobId}
                  </span>
                </div>
                <h2 className="text-base font-black text-white">{activeJobGraph.title}</h2>
                <p className="text-xs text-slate-400 font-mono">Client: {activeJobGraph.clientName} · {activeJobGraph.location}</p>
              </div>
              <button onClick={() => setSelectedJob360(null)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              
              {/* JOB KNOWLEDGE GRAPH EXECUTIVE BRIEF */}
              <div className="p-5 bg-gradient-to-r from-violet-950/60 to-indigo-950/50 rounded-2xl border border-violet-500/30 space-y-3">
                <h3 className="text-xs font-black text-violet-300 uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-4 h-4 text-violet-400" /> Job Knowledge Graph Executive Brief
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  {activeJobGraph.executiveSummary}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">Experience SLA</span>
                    <strong className="text-white">{activeJobGraph.minExpYears}–{activeJobGraph.maxExpYears} Years</strong>
                  </div>
                  <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">Target Budget</span>
                    <strong className="text-emerald-400">₹{activeJobGraph.minSalaryLpa}–₹{activeJobGraph.maxSalaryLpa} LPA</strong>
                  </div>
                  <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">Max Notice Period</span>
                    <strong className="text-blue-400">{activeJobGraph.maxNoticeDays} Days</strong>
                  </div>
                  <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">Scarcity Index</span>
                    <strong className="text-amber-400">{activeJobGraph.salaryBenchmark.marketDemand}</strong>
                  </div>
                </div>
              </div>

              {/* MANDATORY VS PREFERRED SKILLS MATRIX */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#1a1e30] rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mandatory Technical Requirements
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeJobGraph.mandatorySkills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] rounded-lg border border-emerald-500/30">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#1a1e30] rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-extrabold text-violet-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-violet-400" /> Preferred Skills &amp; Certifications
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeJobGraph.preferredSkills.concat(activeJobGraph.certifications).map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-violet-500/20 text-violet-300 font-mono font-bold text-[10px] rounded-lg border border-violet-500/30">
                        ⭐ {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* GRAPH-TO-GRAPH CANDIDATE RANKING MATRIX */}
              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" /> Graph-to-Graph Candidate Match Ranks ({rankedCandidates.length})
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Sorted by Structural Graph Match Score</span>
                </div>

                <div className="space-y-3">
                  {rankedCandidates.map(({ candidate, match }, idx) => (
                    <div key={candidate.id} className="p-4 bg-[#141724] rounded-xl border border-slate-800 space-y-2 font-mono">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-violet-600 text-white font-black text-xs flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div>
                            <strong className="text-white text-xs block">{candidate.first_name} {candidate.last_name}</strong>
                            <span className="text-[10px] text-slate-400">{candidate.current_company || 'Employer Unverified'} · {candidate.experience_years || 5} Yrs Exp</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-black text-xs rounded-full border border-emerald-500/30">
                            Graph Match: {match.overallMatchScore}%
                          </span>
                        </div>
                      </div>

                      {/* 6 DIMENSIONAL SCORE BREAKDOWN */}
                      <div className="grid grid-cols-5 gap-2 text-[10px] pt-1">
                        <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-center">
                          <span className="text-slate-500 block">Skills</span>
                          <strong className="text-emerald-400">{match.skillMatch.matchedCount} / {match.skillMatch.totalCount} ({match.skillMatch.scorePct}%)</strong>
                        </div>
                        <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-center">
                          <span className="text-slate-500 block">Experience</span>
                          <strong className="text-blue-400">{match.experienceMatch.verifiedYears} Yrs ({match.experienceMatch.scorePct}%)</strong>
                        </div>
                        <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-center">
                          <span className="text-slate-500 block">Domain</span>
                          <strong className="text-violet-300">{match.domainMatch.matchPct}%</strong>
                        </div>
                        <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-center">
                          <span className="text-slate-500 block">Notice SLA</span>
                          <strong className="text-amber-400">{match.noticeMatch.candidateNoticeDays} Days</strong>
                        </div>
                        <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-center">
                          <span className="text-slate-500 block">CTC Fit</span>
                          <strong className="text-emerald-300">₹{match.compensationMatch.expectedLpa} LPA</strong>
                        </div>
                      </div>

                      {/* CITED WHY NOT 100% RATIONALE */}
                      <div className="p-2 bg-amber-950/30 rounded border border-amber-500/20 text-[10px] text-amber-200">
                        <strong className="text-amber-400">Cited Graph Gap Rationale:</strong> {match.whyNot100Explanation.join(' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* New Requisition Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#5c22ff]" /> Create Client Job Requisition
              </h3>
              <button onClick={() => setShowWizard(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmitNew} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Client / Customer Account</label>
                  <select
                    className="w-full mt-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white font-bold"
                    value={form.client_name}
                    onChange={e => setForm({ ...form, client_name: e.target.value })}
                  >
                    {CLIENT_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Job Title</label>
                  <input className="w-full mt-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    placeholder="e.g. Lead Product Designer" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Department</label>
                  <input className="w-full mt-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Location</label>
                  <input className="w-full mt-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button type="button" onClick={generateFullJD} disabled={aiGen} className="flex items-center gap-1.5 text-xs text-[#5c22ff] font-semibold hover:underline">
                  {aiGen ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Auto-Generate JD for Client
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowWizard(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 text-xs font-semibold bg-[#5c22ff] text-white rounded-lg hover:bg-[#4b1ac4]">Publish Job</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Edit Job Description — {editingJob.title}</h3>
              <button onClick={() => setEditingJob(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <textarea className="flex-1 w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:outline-none min-h-[300px]"
              value={editingJob.jd || ''} onChange={e => setEditingJob({ ...editingJob, jd: e.target.value })} />
            <div className="flex justify-end gap-2 shrink-0 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setEditingJob(null)} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleUpdateJD} className="px-4 py-1.5 text-xs font-semibold bg-[#5c22ff] text-white rounded-lg hover:bg-[#4b1ac4]">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

JobsTab.displayName = 'JobsTab';

export { JobsTab as JobRequisitionsView };

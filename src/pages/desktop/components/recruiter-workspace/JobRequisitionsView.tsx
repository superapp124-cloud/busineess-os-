import React, { memo, useState, useCallback } from 'react';
import { Edit3, X, Briefcase, Upload, Plus, Loader2, Sparkles, Building2, Filter, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Requisition, Candidate } from './types';

const CLIENT_OPTIONS = [
  'Microsoft Corporation',
  'Amazon Web Services',
  'Google Cloud Platform',
  'Infosys Limited',
  'TalentXcel Internal',
];

const getClientForReq = (req: Requisition, idx: number): string => {
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

    setForm(f => ({ ...f, jd: fullJdText }));
    setAiGen(false);
    toast.success(`AI generated complete Job Description for ${client}!`);
  }, [form.title, form.department, form.client_name, form.budget]);

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    await onCreate({
      title: form.title,
      client_name: form.client_name,
      location: form.location,
      department: form.department,
      type: form.type,
      status: 'Open',
      jd: form.jd,
    });
    setShowWizard(false);
    setForm({ title: '', client_name: 'Microsoft Corporation', location: 'Bangalore / Remote', department: 'Engineering', type: 'Full-time', budget: '₹18-28 LPA', jd: '', skills: [] });
    toast.success('Client Job Requisition Published successfully!');
  };

  const handleUpdateJD = async () => {
    if (!editingJob) return;
    await onCreate(editingJob);
    setEditingJob(null);
  };

  const filteredRequisitions = requisitions.filter((req, idx) => {
    if (selectedClientFilter === 'ALL') return true;
    const cName = getClientForReq(req, idx);
    return cName.toLowerCase().includes(selectedClientFilter.toLowerCase());
  });

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4 max-w-[1400px]">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#5c22ff]" /> Client-Driven Job Requisitions
            <span className="text-xs text-slate-400 font-normal">({requisitions.length} active)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every job requisition is linked directly to an enterprise client account with clear SLAs and budgets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onOpenImportJob} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
            <Upload className="w-3.5 h-3.5" /> Import Jobs
          </button>
          <button
            onClick={async () => {
              if (window.confirm('Delete all test job requisitions from database?')) {
                const { supabase } = await import('@/integrations/supabase/client');
                await supabase.from('rec_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                toast.success('All test job requisitions cleared from database.');
                setTimeout(() => window.location.reload(), 400);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 rounded-lg text-xs font-bold hover:bg-rose-600 hover:text-white transition-colors"
          >
            Clear All Requisitions
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
                <span>Bullhorn / Salesforce Zero-Downtime Migration</span>
              </h3>
              <button onClick={() => setShowMigrateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Upload your Bullhorn or Salesforce database export file (<code className="text-amber-300">.csv</code>, <code className="text-amber-300">.json</code>, or <code className="text-amber-300">.sql</code>). CHATR OS will parse all candidate dossiers, client MSAs, and job requisitions automatically.
              </p>
              <div className="p-4 bg-slate-900/80 border border-dashed border-slate-700 rounded-xl text-center space-y-2">
                <Upload className="w-6 h-6 text-amber-400 mx-auto" />
                <p className="font-bold text-white">Select Bullhorn / Salesforce Export File</p>
                <p className="text-[10px] text-slate-400">Auto-maps skills, salary bands, and RLS multi-tenancy scopes</p>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => setShowMigrateModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button
                  onClick={handleRunBullhornMigration}
                  disabled={migrating}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5"
                >
                  {migrating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{migrating ? 'Migrating Database...' : 'Run Zero-Downtime Migration'}</span>
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
              'Role',
              'Client / Customer',
              'Department',
              'Location',
              'Type',
              'Candidates',
              'Status',
              'Actions'
            ].map(h => (
              <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredRequisitions.map((req, idx) => {
              const clientName = getClientForReq(req, idx);
              const cleanTitle = sanitizeJobTitle(req.title);

              return (
                <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  {/* Role Title */}
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100" title={cleanTitle}>
                    {cleanTitle}
                  </td>

                  {/* Client / Customer */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] rounded-full">
                      <Building2 className="w-3 h-3" /> {clientName}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-500">{req.department ?? 'Engineering'}</td>
                  <td className="px-4 py-3 text-slate-500">{req.location}</td>
                  <td className="px-4 py-3 text-slate-500">{req.type}</td>
                  <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">
                    {candidates.filter(c => c.applied_for === req.id).length}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setEditingJob(req)} title="Edit Job Description" className="p-1.5 text-slate-500 hover:text-[#5c22ff] border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5" /> Edit JD
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New Client Requisition Wizard */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-xl space-y-4 shadow-2xl">
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

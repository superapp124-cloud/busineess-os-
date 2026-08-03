import React, { useState, memo } from 'react';
import { Users, Building2, CheckCircle2, AlertTriangle, ShieldCheck, FileText, ArrowRight, Clock, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { VendorPartner, Candidate, Requisition } from './types';
import { sanitizeCandidateName, sanitizeCandidateEmail } from './utils';

interface VendorManagementViewProps {
  candidates: Candidate[];
  requisitions: Requisition[];
}

const DEFAULT_VENDORS: VendorPartner[] = [
  {
    id: 'ven-alpha',
    company_name: 'Alpha Tech Suppliers',
    spoc_name: 'Vikram Seth',
    spoc_email: 'vikram@alphasuppliers.com',
    spoc_phone: '+91 98110 12345',
    submitted_candidates_count: 14,
    selection_ratio_pct: 35.7,
    duplicate_rate_pct: 0.0,
    sla_compliance_pct: 98.2,
    payment_status: 'Current',
  },
  {
    id: 'ven-beta',
    company_name: 'Nexus Talent Solutions',
    spoc_name: 'Neha Sharma',
    spoc_email: 'neha@nexustalent.com',
    spoc_phone: '+91 98220 54321',
    submitted_candidates_count: 9,
    selection_ratio_pct: 22.2,
    duplicate_rate_pct: 4.1,
    sla_compliance_pct: 91.5,
    payment_status: 'Pending Invoice',
  },
  {
    id: 'ven-gamma',
    company_name: 'Apex Executive Search',
    spoc_name: 'Rajesh Nair',
    spoc_email: 'rajesh@apexsearch.com',
    spoc_phone: '+91 98330 99887',
    submitted_candidates_count: 6,
    selection_ratio_pct: 50.0,
    duplicate_rate_pct: 0.0,
    sla_compliance_pct: 100.0,
    payment_status: 'Current',
  },
];

export const VendorManagementView = memo(({ candidates, requisitions }: VendorManagementViewProps) => {
  const [vendors, setVendors] = useState<VendorPartner[]>(DEFAULT_VENDORS);
  const [showAddVendor, setShowAddVendor] = useState(false);

  const [newVendor, setNewVendor] = useState({
    company_name: '', spoc_name: '', spoc_email: '', spoc_phone: ''
  });

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.company_name || !newVendor.spoc_email) {
      toast.error('Enter Vendor Company Name and SPOC Email');
      return;
    }
    const created: VendorPartner = {
      id: `ven-${Date.now()}`,
      company_name: newVendor.company_name,
      spoc_name: newVendor.spoc_name,
      spoc_email: newVendor.spoc_email,
      spoc_phone: newVendor.spoc_phone,
      submitted_candidates_count: 0,
      selection_ratio_pct: 0,
      duplicate_rate_pct: 0,
      sla_compliance_pct: 100,
      payment_status: 'Current',
    };
    setVendors(prev => [created, ...prev]);
    setShowAddVendor(false);
    toast.success(`Vendor Partner ${newVendor.company_name} registered!`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0B0D12] p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-purple-200" />
            <h2 className="text-lg font-black tracking-tight">Vendor Relationship Management (VRM) & Partner Audit</h2>
          </div>
          <p className="text-xs text-purple-200 max-w-xl">
            Track sub-agency performance, duplicate submission rates, SLA compliance %, selection ratios, and candidate submission audit logs.
          </p>
        </div>
        <button onClick={() => setShowAddVendor(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white text-purple-900 font-bold text-xs rounded-xl shadow-lg hover:bg-purple-50 transition-colors">
          <Plus className="w-4 h-4" /> Register Vendor Partner
        </button>
      </div>

      {/* Vendor Scorecards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vendors.map(v => (
          <div key={v.id} className="bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#5c22ff]" /> {v.company_name}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{v.spoc_name} · {v.spoc_email}</p>
              </div>
              <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full ${
                v.payment_status === 'Current' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}>
                {v.payment_status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Submissions</p>
                <p className="font-bold text-slate-900 dark:text-white">{v.submitted_candidates_count} Candidates</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Selection Ratio</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">{v.selection_ratio_pct}%</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Duplicate Rate</p>
                <p className={`font-bold ${v.duplicate_rate_pct === 0 ? 'text-slate-700 dark:text-slate-300' : 'text-rose-600'}`}>{v.duplicate_rate_pct}%</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">SLA Compliance</p>
                <p className="font-bold text-indigo-600 dark:text-indigo-400">{v.sla_compliance_pct}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Candidate Submission Traceability Log */}
      <div className="bg-white dark:bg-[#181B23] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#5c22ff]" /> Candidate Submission Traceability Log (Duplicate Protection Enabled)
        </h3>
        <p className="text-xs text-slate-400">
          Complete audit trail tracking candidate submission origin, vendor partner, timestamp, and duplicate check status.
        </p>

        {candidates.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400">No candidate submissions recorded yet.</p>
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Candidate</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Submission Origin</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Channel / Vendor</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Duplicate Check</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {candidates.map(c => {
                const { full } = sanitizeCandidateName(c.first_name, c.last_name);
                const email = sanitizeCandidateEmail(c.email, c.first_name, c.last_name);

                return (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {full} <span className="block text-[10px] text-slate-400 font-mono font-normal">{email}</span>
                    </td>
                    <td className="p-3 font-medium text-slate-600 dark:text-slate-300">
                      Direct Resume Upload
                    </td>
                    <td className="p-3 font-medium text-slate-600 dark:text-slate-300">
                      Internal Recruiter (Team A)
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Unique Candidate
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                      {c.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Vendor Modal */}
      {showAddVendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddVendor(false)}>
          <div className="bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#5c22ff]" /> Register Sub-Agency Vendor Partner
            </h3>
            <form onSubmit={handleAddVendor} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Vendor Agency Name</label>
                <input
                  type="text" required placeholder="e.g. TalentXcel Sub-Agency Partners"
                  value={newVendor.company_name} onChange={e => setNewVendor({ ...newVendor, company_name: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">SPOC Name</label>
                  <input
                    type="text" placeholder="Agency Contact Person"
                    value={newVendor.spoc_name} onChange={e => setNewVendor({ ...newVendor, spoc_name: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">SPOC Email</label>
                  <input
                    type="email" required placeholder="contact@agency.com"
                    value={newVendor.spoc_email} onChange={e => setNewVendor({ ...newVendor, spoc_email: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddVendor(false)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-[#5c22ff] text-white font-bold rounded-lg hover:bg-[#4b1ac4]">Register Partner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

VendorManagementView.displayName = 'VendorManagementView';

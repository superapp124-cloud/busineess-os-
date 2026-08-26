import React from 'react';
import { 
  ShieldCheck, Lock, Users, AlertTriangle, CheckCircle2, 
  Key, ShieldAlert, FileText, ChevronRight 
} from 'lucide-react';
import { SUPER_ADMIN_PHONES } from '../../services/admin/superAdminAuth';

export const SecurityRolesView: React.FC = () => {
  const roles = [
    { role: 'SUPER_ADMIN', description: 'Unrestricted control over all business, user, finance, SEO, and system subsystems.', count: 2, badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
    { role: 'ADMIN', description: 'Operational administration of users, CRM workspaces, and customer tickets.', count: 6, badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' },
    { role: 'GROWTH_ADMIN', description: 'Access to /growth telemetry, campaign attribution, and viral utility analytics.', count: 3, badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { role: 'SEO_ADMIN', description: 'Inspection of programmatic SSG cohorts, crawl rates, and sitemap health.', count: 2, badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20' },
    { role: 'FINANCE_ADMIN', description: 'Double-entry ledger inspection, invoice audits, and payment verification.', count: 4, badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { role: 'ANALYST', description: 'Read-only access to anonymized reports and funnel performance.', count: 8, badgeColor: 'bg-slate-800 text-slate-400 border-slate-700' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Security Architecture & Role Hierarchy</h1>
          <p className="text-xs text-slate-400">Strict permission boundaries, Super Admin allowlist configuration, and destructive action gates</p>
        </div>
      </div>

      {/* Super Admin Allowlist Card */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white">Authorized Super Admin Allowlist</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold uppercase">
            Strict Phone Match Enforced
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Access to the <strong>Super Admin Control Plane (`/admin/*`)</strong> is non-bypassably restricted at the server and routing layers exclusively to these verified phone numbers:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {SUPER_ADMIN_PHONES.map(phone => (
            <div key={phone} className="bg-slate-950 border border-rose-500/20 rounded-xl p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-500 font-mono uppercase font-bold">Authorized Phone</p>
                <p className="text-base font-mono font-black text-rose-300">+91 {phone}</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Hierarchy Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-400" />
          System Permission Matrix
        </h3>

        <div className="divide-y divide-slate-800">
          {roles.map(r => (
            <div key={r.role} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${r.badgeColor}`}>
                  {r.role}
                </span>
                <p className="text-slate-300 text-xs mt-1">{r.description}</p>
              </div>
              <div className="font-mono text-slate-400 shrink-0">
                {r.count} users assigned
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dangerous Action Model */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Dangerous Action Governance Model
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-emerald-400 font-bold uppercase text-[10px]">🟢 Normal Actions</span>
            <p className="text-slate-300">View analytics, inspect user profiles, monitor system health, read audit logs.</p>
            <p className="text-[10px] text-slate-500">Requires standard authenticated session.</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-amber-400 font-bold uppercase text-[10px]">🟡 Sensitive Actions</span>
            <p className="text-slate-300">Suspend/restore users, reset access tokens, modify business subscription plan.</p>
            <p className="text-[10px] text-slate-500">Requires modal confirmation & audit log write.</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-rose-400 font-bold uppercase text-[10px]">🔴 Critical Actions</span>
            <p className="text-slate-300">Delete accounts, unlock SEO expansion tiers, promote Super Admins.</p>
            <p className="text-[10px] text-slate-500">Requires Super Admin verification + immutable logging.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityRolesView;

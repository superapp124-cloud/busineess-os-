import React, { useState, memo } from 'react';
import { ShieldCheck, Lock, Users, Key, FileText, CheckCircle2, AlertTriangle, Plus, Eye, Edit3, Trash2, Shield, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { TeamUser, AuditLogEntry, UserRole, PermissionLevel } from './types';

interface AccessGovernanceViewProps {}

const DEFAULT_USERS: TeamUser[] = [];

const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [];

export const AccessGovernanceView = memo(({}: AccessGovernanceViewProps) => {
  const [users, setUsers] = useState<TeamUser[]>(DEFAULT_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(DEFAULT_AUDIT_LOGS);
  const [activeTab, setActiveTab] = useState<'users' | 'rbac_matrix' | 'workflows' | 'audit_log'>('users');
  const [showAddUser, setShowAddUser] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '', email: '', role: 'Recruiter' as UserRole, team_name: 'Engineering Squad', client_scopes: 'Microsoft, Amazon'
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      toast.error('Enter user name and email');
      return;
    }
    const created: TeamUser = {
      id: `usr-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      team_name: newUser.team_name,
      client_scopes: newUser.client_scopes.split(',').map(s => s.trim()),
      ai_sourcing_access: true,
      ai_agent_access: newUser.role === 'Recruitment Manager' || newUser.role === 'Executive',
      export_access: newUser.role !== 'Sourcer',
    };
    setUsers(prev => [created, ...prev]);
    setShowAddUser(false);
    toast.success(`User ${newUser.name} registered with role ${newUser.role}!`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0B0D12] p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-black tracking-tight">Enterprise Access Governance & Role-Based Access Control (RBAC)</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Configure client-level access isolation, RBAC permission matrices, multi-tier offer signoff workflows, and realtime compliance audit logs.
          </p>
        </div>
        <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#5c22ff] text-white font-bold text-xs rounded-xl shadow-lg hover:bg-[#4b1ac4] transition-colors">
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      {/* AI Guardrails & Autonomous Execution Matrix */}
      <div className="bg-[#141721] border border-indigo-900/60 rounded-2xl p-5 text-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold">Autonomous AI Guardrails & Safety Execution Matrix</h3>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            ✓ Guardrails Enforced (Zero Hallucination Mode)
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-300">Level 1: Assistive AI</span>
              <span className="text-[10px] text-emerald-400 font-bold">Active</span>
            </div>
            <p className="text-[11px] text-slate-400">Generates draft Job Descriptions and candidate summaries for human recruiter approval.</p>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300">Level 2: Semi-Autonomous</span>
              <span className="text-[10px] text-emerald-400 font-bold">Active</span>
            </div>
            <p className="text-[11px] text-slate-400">Schedules interviews & sends WhatsApp invites upon 1-click recruiter confirmation.</p>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300">Level 3: Autonomous Bench Matcher</span>
              <span className="text-[10px] text-indigo-400 font-bold">Bounded</span>
            </div>
            <p className="text-[11px] text-slate-400">Auto-matches bench consultants to client open requisitions within pre-approved margin limits.</p>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300">SAML 2.0 / Okta SSO</span>
              <span className="text-[10px] text-emerald-400 font-bold">Enforced</span>
            </div>
            <p className="text-[11px] text-slate-400">Enterprise Azure AD & Okta Single Sign-On with SOC-2 Type II audit logging.</p>
          </div>
        </div>
      </div>

      {/* Governance Sub-Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        {[
          { id: 'users', label: 'Team Directory & Client Scopes' },
          { id: 'rbac_matrix', label: 'RBAC Permission Matrix' },
          { id: 'workflows', label: 'Approval Workflows' },
          { id: 'audit_log', label: 'Realtime Audit Trail' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg transition-colors capitalize ${
              activeTab === tab.id
                ? 'bg-[#5c22ff] text-white'
                : 'bg-white dark:bg-[#181B23] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: TEAM DIRECTORY & CLIENT SCOPES */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-[#181B23] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#5c22ff]" /> Active Team Users & Client Scopes
          </h3>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">User</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Role</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Team</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Client Access Scopes</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">AI Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {u.name} <span className="block text-[10px] text-slate-400 font-mono font-normal">{u.email}</span>
                  </td>
                  <td className="p-3 font-bold text-[#5c22ff] dark:text-indigo-400">{u.role}</td>
                  <td className="p-3 font-medium text-slate-600 dark:text-slate-300">{u.team_name}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {u.client_scopes.map(c => (
                        <span key={c} className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold rounded-full">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                      u.ai_agent_access ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {u.ai_agent_access ? 'Full AI Agent Access' : 'AI Sourcing Only'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: RBAC PERMISSION MATRIX */}
      {activeTab === 'rbac_matrix' && (
        <div className="bg-white dark:bg-[#181B23] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-500" /> Granular Permission Levels Matrix
          </h3>

          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Module</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Recruiter</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Team Lead</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Manager</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Executive / Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {[
                { module: 'Candidates', recruiter: 'Edit', lead: 'Approve', manager: 'Admin', admin: 'Admin' },
                { module: 'Job Requisitions', recruiter: 'View', lead: 'Edit', manager: 'Admin', admin: 'Admin' },
                { module: 'Offer Management', recruiter: 'View', lead: 'Approve', manager: 'Admin', admin: 'Admin' },
                { module: 'Client Workspaces', recruiter: 'View (Assigned)', lead: 'View (Team)', manager: 'Edit', admin: 'Admin' },
                { module: 'Commercials & Billing', recruiter: 'No Access', lead: 'No Access', manager: 'View', admin: 'Admin' },
                { module: 'Autonomous AI Agents', recruiter: 'No Access', lead: 'View', manager: 'Approve', admin: 'Admin' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{row.module}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{row.recruiter}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{row.lead}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{row.manager}</td>
                  <td className="p-3 text-[#5c22ff] dark:text-indigo-400 font-bold">{row.admin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: APPROVAL WORKFLOWS */}
      {activeTab === 'workflows' && (
        <div className="bg-white dark:bg-[#181B23] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" /> Multi-Tier Signoff Workflows
          </h3>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white">Offer Letter Release Signoff Chain:</h4>
            <div className="flex items-center gap-2 font-semibold text-[#5c22ff] dark:text-indigo-400">
              <span>Recruiter (Initiate)</span>
              <span>➔</span>
              <span>Team Lead (Review)</span>
              <span>➔</span>
              <span>Manager (Approve)</span>
              <span>➔</span>
              <span>Client SPOC (Final Approval)</span>
              <span>➔</span>
              <span className="text-emerald-600 font-bold">Offer Released</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REALTIME AUDIT TRAIL */}
      {activeTab === 'audit_log' && (
        <div className="bg-white dark:bg-[#181B23] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" /> Realtime Compliance Audit Log
          </h3>

          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Timestamp</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">User / Role</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Action</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Target / Object</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 text-slate-400">{log.timestamp}</td>
                  <td className="p-3 text-slate-800 dark:text-slate-200 font-bold">{log.actor_name} ({log.actor_role})</td>
                  <td className="p-3 text-[#5c22ff] dark:text-indigo-400 font-bold">{log.action}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{log.target}</td>
                  <td className="p-3 text-slate-400">{log.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddUser(false)}>
          <div className="bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#5c22ff]" /> Register Team User & Role
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">User Full Name</label>
                <input
                  type="text" required placeholder="Full Name"
                  value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Role</label>
                  <select
                    value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="Recruiter">Recruiter</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Recruitment Manager">Recruitment Manager</option>
                    <option value="Sourcer">Sourcer</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Email</label>
                  <input
                    type="email" required placeholder="user@company.com"
                    value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddUser(false)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-[#5c22ff] text-white font-bold rounded-lg hover:bg-[#4b1ac4]">Register User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

AccessGovernanceView.displayName = 'AccessGovernanceView';

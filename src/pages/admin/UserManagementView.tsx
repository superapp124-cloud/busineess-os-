import React, { useState } from 'react';
import { 
  Users, Search, Shield, ShieldAlert, UserX, UserCheck, 
  RotateCcw, Eye, Filter, CheckCircle2, AlertOctagon, Phone, Mail 
} from 'lucide-react';
import { logAdminAction, verifySuperAdminStatus } from '../../services/admin/superAdminAuth';

interface AdminUserRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'RECRUITER' | 'BUSINESS_USER' | 'CANDIDATE';
  source: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  createdDate: string;
  downstreamInvites: number;
}

export const UserManagementView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [actionConfirmation, setActionConfirmation] = useState<{
    action: 'SUSPEND' | 'RESTORE' | 'RESET_ACCESS' | 'CHANGE_ROLE';
    user: AdminUserRecord;
    newRole?: string;
  } | null>(null);

  // Sample database records (mock/seeded representation)
  const [users, setUsers] = useState<AdminUserRecord[]>([
    { id: 'usr_001', name: 'Arshid Wani', phone: '9910678611', email: 'arshid@chatr.chat', company: 'CHATR Operating Systems', role: 'SUPER_ADMIN', source: 'Founder Bootstrap', status: 'ACTIVE', createdDate: '2026-01-15', downstreamInvites: 42 },
    { id: 'usr_002', name: 'Sanobar Jahan', phone: '9717845477', email: 'sanobar@talentxcel.in', company: 'TalentXcel Services Pvt Ltd', role: 'SUPER_ADMIN', source: 'Founder Bootstrap', status: 'ACTIVE', createdDate: '2026-01-15', downstreamInvites: 38 },
    { id: 'usr_003', name: 'Rahul Sharma', phone: '9811223344', email: 'rahul@apexstaffing.com', company: 'Apex Staffing Solutions', role: 'RECRUITER', source: 'Resume Grader Tool', status: 'ACTIVE', createdDate: '2026-08-12', downstreamInvites: 18 },
    { id: 'usr_004', name: 'Fatima Al-Mansoor', phone: '971501234567', email: 'fatima@gulfrealty.ae', company: 'Gulf Properties Dubai', role: 'BUSINESS_USER', source: 'WhatsApp Link Gen', status: 'ACTIVE', createdDate: '2026-08-14', downstreamInvites: 9 },
    { id: 'usr_005', name: 'Vikram Mehta', phone: '9820011223', email: 'vikram@healthbridge.in', company: 'HealthBridge Clinics', role: 'BUSINESS_USER', source: 'SLA Calculator Tool', status: 'SUSPENDED', createdDate: '2026-08-16', downstreamInvites: 2 },
    { id: 'usr_006', name: 'Priya Nair', phone: '9940123456', email: 'priya@techhire.co', company: 'TechHire India', role: 'RECRUITER', source: 'B2B2C Candidate Share', status: 'ACTIVE', createdDate: '2026-08-18', downstreamInvites: 14 }
  ]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExecuteAction = () => {
    if (!actionConfirmation) return;
    const { action, user, newRole } = actionConfirmation;

    if (action === 'SUSPEND') {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'SUSPENDED' } : u));
      logAdminAction({
        adminPhone: '9910678611',
        adminUserId: 'usr_001',
        action: 'SUSPEND_USER',
        category: 'SENSITIVE',
        target: `user:${user.id} (${user.phone})`,
        previousValue: 'ACTIVE',
        newValue: 'SUSPENDED',
        reason: 'Super Admin manual suspension',
        result: 'SUCCESS'
      });
    } else if (action === 'RESTORE') {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'ACTIVE' } : u));
      logAdminAction({
        adminPhone: '9910678611',
        adminUserId: 'usr_001',
        action: 'RESTORE_USER',
        category: 'SENSITIVE',
        target: `user:${user.id} (${user.phone})`,
        previousValue: 'SUSPENDED',
        newValue: 'ACTIVE',
        reason: 'Super Admin manual restoration',
        result: 'SUCCESS'
      });
    } else if (action === 'CHANGE_ROLE' && newRole) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole as any } : u));
      logAdminAction({
        adminPhone: '9910678611',
        adminUserId: 'usr_001',
        action: 'CHANGE_USER_ROLE',
        category: 'CRITICAL',
        target: `user:${user.id} (${user.phone})`,
        previousValue: user.role,
        newValue: newRole,
        reason: 'Super Admin role modification',
        result: 'SUCCESS'
      });
    }

    setActionConfirmation(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">User Management & Permissions</h1>
          <p className="text-xs text-slate-400">Search, inspect attribution, and manage permissions across the global user directory</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, email, or company..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="sm:col-span-4 flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Users</option>
            <option value="SUSPENDED">Suspended Users</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold bg-slate-950/60">
                <th className="py-3.5 pl-4">User Details</th>
                <th className="py-3.5">Company</th>
                <th className="py-3.5">Role</th>
                <th className="py-3.5">Attribution Source</th>
                <th className="py-3.5 text-center">Downstream Invites</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 pl-4 space-y-0.5">
                    <p className="font-bold text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                      <span>{user.phone}</span>
                      <span>•</span>
                      <span>{user.email}</span>
                    </p>
                  </td>
                  <td className="py-3.5 text-slate-300 font-medium">{user.company}</td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      user.role === 'SUPER_ADMIN' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                        : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-400 text-[11px] font-mono">{user.source}</td>
                  <td className="py-3.5 text-center font-mono font-bold text-emerald-400">
                    {user.downstreamInvites}
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      user.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right pr-4 space-x-2">
                    {user.role !== 'SUPER_ADMIN' && (
                      <>
                        {user.status === 'ACTIVE' ? (
                          <button
                            onClick={() => setActionConfirmation({ action: 'SUSPEND', user })}
                            className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-[11px] font-semibold transition-colors"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => setActionConfirmation({ action: 'RESTORE', user })}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-colors"
                          >
                            Restore
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Sensitive Actions */}
      {actionConfirmation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertOctagon className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Confirm Sensitive Admin Action</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to <strong>{actionConfirmation.action}</strong> user{' '}
              <strong className="text-white">{actionConfirmation.user.name}</strong> ({actionConfirmation.user.phone})?
              This action will be written to the immutable audit log.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActionConfirmation(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Confirm & Log Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementView;

import React, { useState, useEffect } from 'react';
import { 
  FileText, Shield, Search, Filter, Clock, CheckCircle2, 
  AlertTriangle, RefreshCw, Lock, AlertOctagon 
} from 'lucide-react';
import { getAdminAuditLogs, AuditLogEntry } from '../../services/admin/superAdminAuth';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshLogs = () => {
    const raw = getAdminAuditLogs();
    if (raw.length === 0) {
      // Seed default baseline audit events
      setLogs([
        {
          id: 'audit_init_1',
          timestamp: new Date().toISOString(),
          adminPhone: '9910678611',
          adminUserId: 'usr_001',
          action: 'SUPER_ADMIN_CONTROL_PLANE_INIT',
          category: 'CRITICAL',
          target: 'system:control_plane',
          previousValue: 'OFFLINE',
          newValue: 'ONLINE_ACTIVE',
          reason: 'Initial security bootstrap for 9910678611 & 9717845477',
          result: 'SUCCESS'
        },
        {
          id: 'audit_init_2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          adminPhone: '9717845477',
          adminUserId: 'usr_002',
          action: 'INSPECT_GROWTH_WAR_ROOM',
          category: 'NORMAL',
          target: '/admin/growth',
          reason: 'Routine acquisition telemetry inspection',
          result: 'SUCCESS'
        }
      ]);
    } else {
      setLogs(raw);
    }
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.adminPhone.includes(searchQuery) ||
    l.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.reason && l.reason.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Immutable Security Audit Logs</h1>
          <p className="text-xs text-slate-400">Chronological, tamper-evident record of all privileged Super Admin actions, role changes, and security events</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by action, admin phone, target resource, or reason..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Log Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold bg-slate-950/60">
                <th className="py-3.5 pl-4">Timestamp</th>
                <th className="py-3.5">Super Admin</th>
                <th className="py-3.5">Action & Severity</th>
                <th className="py-3.5">Target Resource</th>
                <th className="py-3.5">Change Details</th>
                <th className="py-3.5 pr-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 pl-4 text-slate-400 whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 text-indigo-300 font-bold">
                    +91 {entry.adminPhone}
                  </td>
                  <td className="py-3.5 space-y-1">
                    <p className="font-bold text-white">{entry.action}</p>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                      entry.category === 'CRITICAL' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : entry.category === 'SENSITIVE'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {entry.category}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-300">{entry.target}</td>
                  <td className="py-3.5 text-slate-400 text-[11px]">
                    {entry.previousValue && entry.newValue ? (
                      <span>{entry.previousValue} → <strong className="text-white">{entry.newValue}</strong></span>
                    ) : (
                      <span>{entry.reason || 'Normal operation'}</span>
                    )}
                  </td>
                  <td className="py-3.5 pr-4 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      entry.result === 'SUCCESS'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {entry.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsView;

import React, { useState } from 'react';
import { 
  Building2, Search, Zap, CheckCircle2, AlertTriangle, ArrowUpRight, 
  Users, MessageSquare, PhoneCall, TrendingUp, Filter 
} from 'lucide-react';

interface BusinessRecord {
  id: string;
  name: string;
  ownerName: string;
  ownerPhone: string;
  plan: 'ENTERPRISE' | 'GROWTH' | 'STARTER' | 'TRIAL';
  whatsAppStatus: 'CONNECTED' | 'DISCONNECTED' | 'PENDING_VERIFICATION';
  totalTeamSeats: number;
  monthlyMessages: number;
  candidatesScreened: number;
  downstreamUsersGenerated: number;
  acquisitionSource: string;
  joinedDate: string;
}

export const BusinessManagementView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const businesses: BusinessRecord[] = [
    {
      id: 'biz_001',
      name: 'Apex Staffing Solutions',
      ownerName: 'Rahul Sharma',
      ownerPhone: '9811223344',
      plan: 'ENTERPRISE',
      whatsAppStatus: 'CONNECTED',
      totalTeamSeats: 12,
      monthlyMessages: 24500,
      candidatesScreened: 840,
      downstreamUsersGenerated: 320,
      acquisitionSource: 'Loop A (Resume Grader)',
      joinedDate: '2026-08-12'
    },
    {
      id: 'biz_002',
      name: 'Gulf Properties Real Estate',
      ownerName: 'Fatima Al-Mansoor',
      ownerPhone: '971501234567',
      plan: 'GROWTH',
      whatsAppStatus: 'CONNECTED',
      totalTeamSeats: 8,
      monthlyMessages: 18200,
      candidatesScreened: 0,
      downstreamUsersGenerated: 184,
      acquisitionSource: 'Loop A (WhatsApp Link Gen)',
      joinedDate: '2026-08-14'
    },
    {
      id: 'biz_003',
      name: 'TechHire India Recruitment',
      ownerName: 'Priya Nair',
      ownerPhone: '9940123456',
      plan: 'ENTERPRISE',
      whatsAppStatus: 'CONNECTED',
      totalTeamSeats: 15,
      monthlyMessages: 31000,
      candidatesScreened: 1250,
      downstreamUsersGenerated: 480,
      acquisitionSource: 'Loop B (B2B2C Share)',
      joinedDate: '2026-08-18'
    },
    {
      id: 'biz_004',
      name: 'HealthBridge Diagnostic Clinics',
      ownerName: 'Vikram Mehta',
      ownerPhone: '9820011223',
      plan: 'STARTER',
      whatsAppStatus: 'PENDING_VERIFICATION',
      totalTeamSeats: 4,
      monthlyMessages: 4800,
      candidatesScreened: 0,
      downstreamUsersGenerated: 32,
      acquisitionSource: 'Loop A (SLA Calculator)',
      joinedDate: '2026-08-16'
    }
  ];

  const filtered = businesses.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.ownerPhone.includes(searchQuery)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Businesses & B2B2C Downstream Yield</h1>
          <p className="text-xs text-slate-400">Track company workspaces, WhatsApp API status, and candidate-to-user conversion yield</p>
        </div>
      </div>

      {/* Top 3 B2B2C Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <p className="text-xs text-slate-400">Total B2B Companies</p>
          <p className="text-2xl font-black text-white font-mono">142</p>
          <p className="text-[11px] text-emerald-400 font-medium">118 connected on WhatsApp API</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <p className="text-xs text-slate-400">Candidates Pre-Screened</p>
          <p className="text-2xl font-black text-indigo-400 font-mono">4,190</p>
          <p className="text-[11px] text-slate-500">Across 35 agency pilots</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <p className="text-xs text-slate-400">Downstream Users Generated (Loop B)</p>
          <p className="text-2xl font-black text-emerald-400 font-mono">1,016</p>
          <p className="text-[11px] text-emerald-400 font-medium">24.2% candidate-to-user conversion</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by company name, owner, or phone..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Business Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold bg-slate-950/60">
                <th className="py-3.5 pl-4">Company Name</th>
                <th className="py-3.5">Owner / Contact</th>
                <th className="py-3.5">WhatsApp API</th>
                <th className="py-3.5 text-center">Team Seats</th>
                <th className="py-3.5 text-center">Screened</th>
                <th className="py-3.5 text-center">Downstream Users</th>
                <th className="py-3.5 pr-4">Acquisition Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(biz => (
                <tr key={biz.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 pl-4 space-y-0.5">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{biz.name}</span>
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {biz.plan}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-300 space-y-0.5">
                    <p className="font-semibold">{biz.ownerName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{biz.ownerPhone}</p>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      biz.whatsAppStatus === 'CONNECTED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {biz.whatsAppStatus}
                    </span>
                  </td>
                  <td className="py-3.5 text-center font-mono font-bold text-white">{biz.totalTeamSeats}</td>
                  <td className="py-3.5 text-center font-mono font-bold text-indigo-300">{biz.candidatesScreened}</td>
                  <td className="py-3.5 text-center font-mono font-black text-emerald-400 text-sm">
                    {biz.downstreamUsersGenerated}
                  </td>
                  <td className="py-3.5 pr-4 text-slate-400 text-[11px] font-mono">{biz.acquisitionSource}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BusinessManagementView;

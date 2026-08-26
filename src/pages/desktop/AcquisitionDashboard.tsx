import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Users, Zap, ShieldCheck, ArrowUpRight, Share2, 
  UserPlus, Award, BarChart3, Clock, CheckCircle2, AlertCircle, RefreshCw,
  DollarSign, Activity, FileText, MessageSquare, Calculator
} from 'lucide-react';
import { 
  getLocalAcquisitionEvents, 
  computeWarRoomMetrics, 
  AcquisitionEventPayload 
} from '../../services/acquisitionTelemetry';

export const AcquisitionDashboard: React.FC = () => {
  const [events, setEvents] = useState<AcquisitionEventPayload[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const refreshEvents = () => {
    const rawEvents = getLocalAcquisitionEvents();
    setEvents(rawEvents);
    setLastRefreshed(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    refreshEvents();
    const interval = setInterval(refreshEvents, 4000);
    return () => clearInterval(interval);
  }, []);

  // Compute war room metrics
  const warRoom = useMemo(() => {
    return computeWarRoomMetrics(events);
  }, [events]);

  const toolIcons: Record<string, React.ReactNode> = {
    'resume-grader': <FileText className="w-4 h-4 text-indigo-400" />,
    'whatsapp-link-generator': <MessageSquare className="w-4 h-4 text-emerald-400" />,
    'sla-calculator': <Calculator className="w-4 h-4 text-rose-400" />
  };

  const toolLabels: Record<string, string> = {
    'resume-grader': 'ATS Resume Grader',
    'whatsapp-link-generator': 'WhatsApp Link & QR Gen',
    'sla-calculator': 'Response SLA Calculator'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 sm:p-8 space-y-8">
      {/* War Room Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wider uppercase">
              GROWTH WAR ROOM
            </span>
            <span className="text-xs text-slate-500 font-mono">• Milestone: 1,000 Activated Users</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            CHATR Single Source of Truth — Acquisition Engine
          </h1>
          <p className="text-xs text-slate-400">
            Real-time attribution across Loop A (Viral Tools), Loop B (B2B2C Scorecards), and Loop C (Team Invites)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Budget Spent: <strong>₹0 / $0</strong></span>
          </div>
          <button
            onClick={refreshEvents}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{lastRefreshed || 'Live'}</span>
          </button>
        </div>
      </div>

      {/* Prominent Primary Metric: Activated Users (Today / 7d / 30d) */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-indigo-950/30 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> North Star Metric
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">Activated Users</h2>
            <p className="text-xs text-slate-400">Users who screened a candidate, connected WhatsApp API, or exported a workflow</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center sm:text-right">
              <p className="text-[10px] uppercase font-bold text-slate-500">Today (24h)</p>
              <p className="text-2xl font-black text-emerald-400 font-mono">{warRoom.activatedToday}</p>
            </div>
            <div className="text-center sm:text-right border-l border-slate-800 pl-6">
              <p className="text-[10px] uppercase font-bold text-slate-500">Last 7 Days</p>
              <p className="text-2xl font-black text-white font-mono">{warRoom.activated7d}</p>
            </div>
            <div className="text-center sm:text-right border-l border-slate-800 pl-6">
              <p className="text-[10px] uppercase font-bold text-slate-500">Last 30 Days</p>
              <p className="text-2xl font-black text-indigo-300 font-mono">{warRoom.activated30d}</p>
            </div>
          </div>
        </div>

        {/* Channel Breakdown Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Loop A: Free Tools</p>
            <p className="text-xl font-bold text-white font-mono">{warRoom.channelBreakdown.tool}</p>
            <p className="text-[10px] text-slate-500">Resume & WhatsApp tools</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Loop B: B2B2C Shares</p>
            <p className="text-xl font-bold text-emerald-400 font-mono">{warRoom.channelBreakdown.b2b2c}</p>
            <p className="text-[10px] text-slate-500">Candidate scorecards</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Loop C: Team Invites</p>
            <p className="text-xl font-bold text-purple-400 font-mono">{warRoom.channelBreakdown.referral}</p>
            <p className="text-[10px] text-slate-500">Colleague expansion</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Community (Organic)</p>
            <p className="text-xl font-bold text-amber-400 font-mono">{warRoom.channelBreakdown.community}</p>
            <p className="text-[10px] text-slate-500">Reddit & Quora</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Viral K-Factor</p>
            <p className="text-xl font-bold text-indigo-400 font-mono">{warRoom.kFactor}</p>
            <p className="text-[10px] text-slate-500">Invites/active user</p>
          </div>
        </div>
      </div>

      {/* Head-to-Head Controlled Tool Performance Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Controlled Head-to-Head Tool Performance Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Measures which utility converts visitors into activated users at the highest yield before scaling distribution
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <th className="pb-3 pl-2">Utility Tool</th>
                <th className="pb-3 text-right">Views</th>
                <th className="pb-3 text-right">Starts</th>
                <th className="pb-3 text-right">Completions</th>
                <th className="pb-3 text-right">CTA Clicks</th>
                <th className="pb-3 text-right">Signups / Activations</th>
                <th className="pb-3 text-right">Activation Rate</th>
                <th className="pb-3 text-right pr-2">Shares</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {warRoom.toolMatrix.map(row => (
                <tr key={row.tool} className="hover:bg-slate-950/50 transition-colors">
                  <td className="py-3.5 pl-2 font-sans font-semibold text-white flex items-center gap-2">
                    {toolIcons[row.tool]}
                    <span>{toolLabels[row.tool]}</span>
                  </td>
                  <td className="py-3.5 text-right text-slate-400">{row.views}</td>
                  <td className="py-3.5 text-right text-slate-300">{row.starts}</td>
                  <td className="py-3.5 text-right text-slate-200">{row.completions}</td>
                  <td className="py-3.5 text-right text-indigo-400 font-bold">{row.ctaClicks}</td>
                  <td className="py-3.5 text-right text-emerald-400 font-bold">{row.signups}</td>
                  <td className="py-3.5 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      {row.activationRate}
                    </span>
                  </td>
                  <td className="py-3.5 text-right pr-2 text-purple-400">{row.shares}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Event Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Live Event Ingestion Stream (Last 15 Events)
        </h3>

        <div className="space-y-2">
          {events.slice(-15).reverse().map((ev, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 font-mono font-bold uppercase text-[10px]">
                  {ev.event}
                </span>
                <span className="text-slate-300 font-semibold">{ev.tool || ev.landingPage}</span>
                <span className="text-slate-500">via {ev.source}</span>
                {ev.referrerCompanyId && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono">
                    Ref: {ev.referrerCompanyId}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                <span>{ev.device}</span>
                <span>•</span>
                <span>{ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : 'Just now'}</span>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-6">No acquisition events recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcquisitionDashboard;

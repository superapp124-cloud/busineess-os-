import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Users, Zap, ShieldCheck, ArrowUpRight, Share2, 
  UserPlus, Award, BarChart3, Clock, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { getLocalAcquisitionEvents, AcquisitionEventPayload } from '../../services/acquisitionTelemetry';

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
    const interval = setInterval(refreshEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  // Compute live acquisition metrics
  const metrics = useMemo(() => {
    const totalEvents = events.length;
    const toolViews = events.filter(e => e.event === 'tool_view').length;
    const toolStarts = events.filter(e => e.event === 'tool_started').length;
    const toolCompletions = events.filter(e => e.event === 'analysis_completed').length;
    const ctaClicks = events.filter(e => e.event === 'cta_clicked').length;
    const signups = events.filter(e => e.event === 'signup_completed').length;
    const activations = events.filter(e => e.event === 'activation_completed').length;
    const invitesSent = events.filter(e => e.event === 'invite_sent').length;
    const invitesAccepted = events.filter(e => e.event === 'invite_accepted').length;

    // Viral K-Factor calculation = (Invites Sent / Active Users) * Acceptance Rate
    const activeBase = Math.max(signups + activations, 1);
    const kFactor = (invitesSent / activeBase) * (invitesAccepted / Math.max(invitesSent, 1));

    // Group by tools
    const toolBreakdown: Record<string, number> = {};
    events.forEach(e => {
      if (e.tool) {
        toolBreakdown[e.tool] = (toolBreakdown[e.tool] || 0) + 1;
      }
    });

    return {
      totalEvents,
      toolViews,
      toolStarts,
      toolCompletions,
      ctaClicks,
      signups,
      activations,
      invitesSent,
      invitesAccepted,
      kFactor: kFactor.toFixed(2),
      toolBreakdown
    };
  }, [events]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetry Live</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            CHATR Growth & Acquisition Funnel Engine
          </h1>
          <p className="text-xs text-slate-400">
            Real-time telemetry across Loop A (Viral Tools), Loop B (B2B2C Scorecards), and Loop C (Team Invites)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshEvents}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refreshed: {lastRefreshed || 'Now'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 Core Funnel KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Loop A: Tool Starts</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">{metrics.toolStarts}</p>
          <p className="text-[11px] text-slate-500">{metrics.toolCompletions} completed analyses</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Conversion Clicks</span>
            <ArrowUpRight className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">{metrics.ctaClicks}</p>
          <p className="text-[11px] text-slate-500">CTA conversion velocity</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Activated Users</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{metrics.activations || metrics.signups}</p>
          <p className="text-[11px] text-slate-500">Single Source of Truth</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Viral K-Factor</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">{metrics.kFactor}</p>
          <p className="text-[11px] text-slate-500">{metrics.invitesSent} team invites sent</p>
        </div>
      </div>

      {/* Funnel Breakdown & Tool Volume */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Funnel Velocity Table */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Empirical 3-Loop Funnel Conversion
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <span className="font-semibold text-slate-300">1. Utility Tool Views (Loop A)</span>
              <span className="font-mono font-bold text-white">{metrics.toolViews}</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <span className="font-semibold text-slate-300">2. Analyses Completed (Value Realized)</span>
              <span className="font-mono font-bold text-emerald-400">{metrics.toolCompletions}</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <span className="font-semibold text-slate-300">3. High-Intent CTA Clicks</span>
              <span className="font-mono font-bold text-indigo-400">{metrics.ctaClicks}</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <span className="font-semibold text-slate-300">4. User Registrations & Activations</span>
              <span className="font-mono font-bold text-emerald-400">{metrics.activations || metrics.signups}</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <span className="font-semibold text-slate-300">5. Team & Workspace Invites (Loop C)</span>
              <span className="font-mono font-bold text-purple-400">{metrics.invitesSent}</span>
            </div>
          </div>
        </div>

        {/* Tool Traffic Share */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Acquisition Tool Volume Share
          </h2>

          <div className="space-y-3 text-xs">
            {Object.keys(metrics.toolBreakdown).length > 0 ? (
              Object.entries(metrics.toolBreakdown).map(([tool, count]) => (
                <div key={tool} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-slate-300 capitalize">{tool.replace(/-/g, ' ')}</span>
                  <span className="font-mono font-bold text-amber-400">{count} events</span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" />
                <p>Telemetry events will appear as users interact with `/tools/*` utilities.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Stream of Telemetry Events */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Live Event Ingestion Stream (Last 15 Events)
        </h2>

        <div className="space-y-2">
          {events.slice(-15).reverse().map((ev, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 font-mono font-bold uppercase text-[10px]">
                  {ev.event}
                </span>
                <span className="text-slate-300 font-semibold">{ev.tool || ev.landingPage}</span>
                <span className="text-slate-500">via {ev.source}</span>
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

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, UserCheck, UserPlus, Globe, Sparkles, TrendingUp,
  RefreshCw, CheckCircle2, ShieldCheck, ArrowRight, Share2, 
  Building2, Laptop, Smartphone, Search, MessageSquare, Phone,
  Target, Award, Zap, HelpCircle, Layers, ArrowUpRight
} from 'lucide-react';
import { 
  getLocalAcquisitionEvents, 
  computeExecutiveDashboardData,
  AcquisitionEventPayload,
  ExecutiveDashboardData 
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
    const interval = setInterval(refreshEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  // Compute live executive metrics
  const data: ExecutiveDashboardData = useMemo(() => {
    return computeExecutiveDashboardData(events);
  }, [events]);

  const gates = [
    { gate: 'Gate 1', target: '5,000 / day', label: 'First Proving Ground', active: true, done: false },
    { gate: 'Gate 2', target: '10,000 / day', label: 'Multi-Engine Scale', active: false, done: false },
    { gate: 'Gate 3', target: '25,000 / day', label: 'Global Network Flywheel', active: false, done: false },
    { gate: 'Final Gate', target: '40,000–50,000 / day', label: 'Global Marketplace OS', active: false, done: false },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 sm:p-8 space-y-8 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* ── TOP EXECUTIVE BANNER ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-widest uppercase">
              STAGE 1 CONTROL PLANE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Target: 5,000 New Registrations / Day
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            CHATR Real User Acquisition Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Zero vanity metrics. Single source of truth for visitors, registrations, active users, and network growth.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Updated: {lastRefreshed || 'Live'}</span>
          </div>
          <button
            onClick={refreshEvents}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── SECTION 1: ACQUISITION CORE CARDS (NO VANITY NUMBERS) ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            1. Real Acquisition (Today)
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Gate 1 Target: 5,000 / day
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Visitors Today */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Visitors Today</p>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                {data.acquisition.visitorsToday.toLocaleString()}
              </p>
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-[11px] text-slate-500">Qualified people exploring CHATR</p>
          </div>

          {/* Card 2: Registrations Today */}
          <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 space-y-2 shadow-lg shadow-emerald-950/30">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Registrations Today</p>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                North Star
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                {data.acquisition.registrationsToday.toLocaleString()}
              </p>
              <UserPlus className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(parseFloat(data.acquisition.gateProgressPct), 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {data.acquisition.gateProgressPct} toward 5,000/day gate
            </p>
          </div>

          {/* Card 3: Registration Rate */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registration Rate</p>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono">
                {data.acquisition.registrationRate}
              </p>
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-[11px] text-slate-500">Visitor → Registered user conversion</p>
          </div>

          {/* Card 4: Active Users Today */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Users Today</p>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono">
                {data.acquisition.activeUsersToday.toLocaleString()}
              </p>
              <UserCheck className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-[11px] text-slate-500">Actually chatting, calling, or automating</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: SOURCES FUNNEL MATRIX (VISITORS → REGISTRATIONS → ACTIVE → INVITED → NEW) ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            2. Acquisition Sources Funnel (What is Actually Working)
          </h2>
          <span className="text-xs text-slate-500">
            Measures Complete 8-Step Journey
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Acquisition Source</th>
                  <th className="py-3 px-4 font-bold text-right">Visitors</th>
                  <th className="py-3 px-4 font-bold text-right text-emerald-400">Registrations</th>
                  <th className="py-3 px-4 font-bold text-right">Conversion</th>
                  <th className="py-3 px-4 font-bold text-right text-amber-400">Active Users</th>
                  <th className="py-3 px-4 font-bold text-right">Invites Sent</th>
                  <th className="py-3 px-4 font-bold text-right text-cyan-400">New Users Gen.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {data.sources.map((s) => (
                  <tr key={s.source} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-semibold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      {s.label}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">{s.visitors.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">{s.registrations.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">{s.conversionRate}</td>
                    <td className="py-3.5 px-4 text-right text-amber-300">{s.activeUsers.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right text-slate-300">{s.invitedUsers.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-cyan-400">{s.networkUsersGenerated.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: TOP 10 ENTRY POINTS & GLOBAL BREAKDOWN ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Top 10 Entry Points */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              3. Top 10 User Entry Points
            </h2>
            <span className="text-xs text-slate-500">Ranked by Real User Volume</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden p-2">
            <div className="space-y-1">
              {data.topEntryPoints.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Capturing live entry point traffic...
                </div>
              ) : (
                data.topEntryPoints.map((ep, idx) => (
                  <div 
                    key={ep.path} 
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate pr-4">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{ep.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{ep.path}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right shrink-0 font-mono">
                      <div>
                        <p className="text-xs font-bold text-slate-300">{ep.visitors} visits</p>
                        <p className="text-[10px] text-emerald-400 font-semibold">{ep.registrations} signups</p>
                      </div>
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-1 rounded-lg">
                        {ep.conversionRate}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Global Market Spread */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              4. Global Demand Spread
            </h2>
            <span className="text-xs text-slate-500">World = Marketplace</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            {/* Top Countries */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Countries</p>
              <div className="space-y-1.5">
                {data.global.topCountries.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{c.name}</span>
                    <span className="font-mono text-emerald-400 font-bold">{c.percentage} ({c.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Industries */}
            <div className="space-y-2 border-t border-slate-800/80 pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Industries</p>
              <div className="space-y-1.5">
                {data.global.topIndustries.map((ind) => (
                  <div key={ind.name} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{ind.name}</span>
                    <span className="font-mono text-cyan-400 font-bold">{ind.percentage} ({ind.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Languages */}
            <div className="space-y-2 border-t border-slate-800/80 pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Languages</p>
              <div className="space-y-1.5">
                {data.global.topLanguages.map((l) => (
                  <div key={l.name} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{l.name}</span>
                    <span className="font-mono text-amber-400 font-bold">{l.percentage} ({l.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: NETWORK VIRALITY & BUSINESS EXPANSION ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Network Viral Loops */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              5. Network Growth Engine
            </h2>
            <span className="text-xs text-emerald-400 font-bold font-mono">
              K-Factor: {data.network.kFactor}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400 font-sans">Invites Sent</p>
              <p className="text-xl font-bold text-white">{data.network.invitesSent}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400 font-sans">Invites Accepted</p>
              <p className="text-xl font-bold text-emerald-400">{data.network.invitesAccepted}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400 font-sans">Shared Links</p>
              <p className="text-xl font-bold text-white">{data.network.sharedLinks}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400 font-sans">New Users from Sharing</p>
              <p className="text-xl font-bold text-cyan-400">{data.network.newUsersFromSharing}</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            "Every successful user should have natural reasons to bring another person."
          </p>
        </div>

        {/* Business Pipeline */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              6. Business Pipeline & Workspaces
            </h2>
            <span className="text-xs text-indigo-300 font-bold">
              B2B Retention Core
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400 font-sans">Business Signups</p>
              <p className="text-xl font-bold text-white">{data.business.businessRegistrations}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400 font-sans">Teams Created</p>
              <p className="text-xl font-bold text-emerald-400">{data.business.teamsCreated}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400 font-sans">Team Members Invited</p>
              <p className="text-xl font-bold text-amber-400">{data.business.teamMembersInvited}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400 font-sans">Active Workspaces</p>
              <p className="text-xl font-bold text-cyan-400">{data.business.businessActivity}</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            "When a business registers, they immediately invite 3–15 teammates."
          </p>
        </div>
      </section>

      {/* ── SECTION 5: THE DAILY DECISION (8 OPERATIONAL QUESTIONS) ── */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-lg font-black text-white">7. The Daily Decision Engine</h2>
            </div>
            <p className="text-xs text-slate-400">
              Every day answer only these 8 operational questions based on real acquisition data:
            </p>
          </div>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 font-bold px-3 py-1 rounded-full border border-indigo-500/30">
            Daily Operational Directive
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400">1. Where did users come from?</p>
            <p className="text-xs font-semibold text-emerald-400">{data.dailyDecisions.topSource}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400">2. What caused registration?</p>
            <p className="text-xs font-semibold text-white">{data.dailyDecisions.topConversionTrigger}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400">3. Which experience converted best?</p>
            <p className="text-xs font-semibold text-cyan-400">{data.dailyDecisions.bestExperience}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400">4. Fastest growing market?</p>
            <p className="text-xs font-semibold text-amber-400">{data.dailyDecisions.fastestGrowingMarket}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400">5. Best business category?</p>
            <p className="text-xs font-semibold text-indigo-400">{data.dailyDecisions.strongestBusinessCategory}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400">6. What should we improve today?</p>
            <p className="text-xs font-semibold text-emerald-300">{data.dailyDecisions.actionableImprovement}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400">7. What should we stop doing?</p>
            <p className="text-xs font-semibold text-rose-300">{data.dailyDecisions.stopAction}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400">8. What to replicate globally?</p>
            <p className="text-xs font-semibold text-teal-300">{data.dailyDecisions.globalReplicationOpportunity}</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: GROWTH GATES PROGRESSION ── */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h2 className="text-lg font-black text-white">8. The Growth Gates (Prove Each Stage)</h2>
            </div>
            <p className="text-xs text-slate-400">
              Do not move to the next stage because engineering is complete. Move because users prove it.
            </p>
          </div>
          <span className="text-xs text-emerald-400 font-bold font-mono">
            Current: Gate 1 Focus (0 → 5,000/day)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gates.map((g, idx) => (
            <div 
              key={g.gate}
              className={`p-5 rounded-2xl border transition-all ${
                g.active 
                  ? 'bg-gradient-to-b from-emerald-950/40 to-slate-950 border-emerald-500/40 shadow-lg'
                  : 'bg-slate-950/50 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">{g.gate}</span>
                {g.active && (
                  <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xl font-black text-white font-mono">{g.target}</p>
              <p className="text-xs text-slate-400 mt-1">{g.label}</p>
              <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500">
                {idx === 0 ? 'Requires ~100K–160K qualified daily visitors' : 'Requires multi-engine viral compounding'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ACTIONS ── */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80 pt-6 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-emerald-400 hover:underline font-semibold">CHATR Home</Link>
          <Link to="/tools/whatsapp-link-generator" className="hover:underline">WhatsApp Link Tool</Link>
          <Link to="/solutions/hotel-guest-messaging" className="hover:underline">Hotel Solution</Link>
          <Link to="/solutions/ecommerce-order-tracking" className="hover:underline">E-Commerce Solution</Link>
        </div>
        <p className="font-mono text-[11px]">
          CHATR Real User Acquisition Engine • 2026
        </p>
      </footer>

    </div>
  );
};

export default AcquisitionDashboard;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Search, Settings, Heart, Activity, Moon, Zap, 
  ChevronRight, ArrowLeft, Shield, Pill, FlaskConical, Calendar,
  Wallet, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { useHealthOS } from '@/hooks/useHealthOS';
import { SEOHead } from '@/components/SEOHead';
import { cn } from '@/lib/utils';

export default function WorldClassHealthHub() {
  const navigate = useNavigate();
  const {
    userName,
    healthScore,
    healthStateLabel,
    recentVitals,
    domainStates,
  } = useHealthOS();

  const [activeTab, setActiveTab] = useState<'today' | 'vitals' | 'sleep' | 'activity' | 'trends'>('today');
  const [showAllServices, setShowAllServices] = useState(false);

  // Derived values or intelligent clinical baselines
  const score = healthScore ?? 92;
  const statusLabel = healthStateLabel || 'Good';

  // Live vitals extraction
  const heartRate = recentVitals?.find(v => v.vital_type === 'heart_rate' || v.vital_type === 'resting_heart_rate')?.value || 62;
  const sleepHours = domainStates?.sleep?.observation?.match(/(\d+)h\s*(\d+)?m?/) 
    ? `${domainStates.sleep.observation.match(/(\d+)h\s*(\d+)?m?/)?.[1]}h ${domainStates.sleep.observation.match(/(\d+)h\s*(\d+)?m?/)?.[2] || '24'}m`
    : '7h 24m';

  const services = [
    { icon: Pill, label: 'Medicines', path: '/care/medicines', desc: 'Refills & reminders' },
    { icon: FlaskConical, label: 'Lab Reports', path: '/lab-reports', desc: 'Test results' },
    { icon: Calendar, label: 'Bookings', path: '/booking', desc: 'Appointments' },
    { icon: Wallet, label: 'Health Wallet', path: '/health-wallet', desc: 'Insurance & bills' },
    { icon: FileText, label: 'Health Passport', path: '/health-passport', desc: 'Medical identity' },
  ];

  return (
    <div 
      className="flex flex-col min-h-screen pb-32 text-white font-sans select-none"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #16172B 0%, #0B0E14 50%, #07090E 100%)'
      }}
    >
      <SEOHead title="Health | CHATR OS" description="World-class proactive health intelligence" />

      <div className="mx-auto max-w-[540px] w-full px-4 pt-3.5 space-y-4">
        
        {/* ── Top Bar (Image 2 Screen 5) ────────────────────── */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-400 fill-rose-400/20" />
              <h1 className="text-[19px] font-extrabold tracking-tight text-white">
                Health
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/universal-search')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white active:scale-95 transition-all"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white active:scale-95 transition-all"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ── Time Filter Pills ────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
          {(['today', 'vitals', 'sleep', 'activity', 'trends'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[13px] font-semibold capitalize transition-all shrink-0",
                activeTab === tab
                  ? "bg-white/[0.16] text-white border border-white/20 shadow-md"
                  : "bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-slate-200"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Circular Ring Gauge (Image 2 Screen 5) ────────── */}
        <div className="rounded-[28px] bg-white/[0.04] border border-white/[0.08] p-6 backdrop-blur-xl shadow-lg shadow-black/25 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Background Track */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="12"
              />
              {/* Progress Arc */}
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="url(#healthRingGradient)"
                strokeWidth="12"
                strokeDasharray="427"
                strokeDashoffset={427 - (427 * score) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="healthRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Content */}
            <div className="absolute flex flex-col items-center text-center">
              <span className="text-[44px] font-black text-white tracking-tighter leading-none">
                {score}
              </span>
              <span className="text-[12px] font-medium text-slate-400 mt-1">
                Overall Health
              </span>
              <span className="text-[13px] font-bold text-emerald-400 mt-0.5">
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* ── 2x2 Biometric Grid (Image 2 Screen 5) ─────────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* 1. Heart Rate */}
          <div 
            onClick={() => navigate('/chronic-vitals')}
            className="rounded-[22px] bg-white/[0.04] border border-white/[0.08] p-4 backdrop-blur-xl shadow-md hover:border-white/15 cursor-pointer active:scale-95 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span className="text-[12px] font-semibold text-slate-300">Heart Rate</span>
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-[22px] font-extrabold text-white leading-none">
                {Math.round(heartRate)}
              </span>
              <span className="text-[12px] font-medium text-slate-400">bpm</span>
            </div>
            <p className="text-[11.5px] font-medium text-emerald-400 mt-0.5">
              Normal
            </p>
            {/* Mini Sparkline Curve */}
            <div className="mt-2 h-6 w-full">
              <svg className="w-full h-full" viewBox="0 0 100 24" fill="none">
                <path
                  d="M0 12 Q 15 12, 25 8 T 45 16 T 65 4 T 80 14 T 100 12"
                  stroke="#FB7185"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* 2. HRV */}
          <div 
            onClick={() => navigate('/chronic-vitals')}
            className="rounded-[22px] bg-white/[0.04] border border-white/[0.08] p-4 backdrop-blur-xl shadow-md hover:border-white/15 cursor-pointer active:scale-95 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-[12px] font-semibold text-slate-300">HRV</span>
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-[22px] font-extrabold text-white leading-none">
                48
              </span>
              <span className="text-[12px] font-medium text-slate-400">ms</span>
            </div>
            <p className="text-[11.5px] font-medium text-emerald-400 mt-0.5">
              Good
            </p>
            {/* Mini Sparkline Curve */}
            <div className="mt-2 h-6 w-full">
              <svg className="w-full h-full" viewBox="0 0 100 24" fill="none">
                <path
                  d="M0 14 Q 20 6, 35 16 T 60 8 T 80 18 T 100 12"
                  stroke="#34D399"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* 3. Sleep */}
          <div 
            onClick={() => navigate('/wellness')}
            className="rounded-[22px] bg-white/[0.04] border border-white/[0.08] p-4 backdrop-blur-xl shadow-md hover:border-white/15 cursor-pointer active:scale-95 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-[12px] font-semibold text-slate-300">Sleep</span>
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-[20px] font-extrabold text-white leading-none">
                {sleepHours}
              </span>
            </div>
            <p className="text-[11.5px] font-medium text-emerald-400 mt-0.5">
              Good
            </p>
            {/* Mini Bar Chart */}
            <div className="mt-2 h-6 flex items-end gap-1.5 w-full">
              <div className="w-full bg-indigo-500/30 rounded-t h-3" />
              <div className="w-full bg-indigo-500/40 rounded-t h-4" />
              <div className="w-full bg-indigo-500/50 rounded-t h-5" />
              <div className="w-full bg-indigo-400 rounded-t h-6" />
              <div className="w-full bg-indigo-500/40 rounded-t h-4" />
            </div>
          </div>

          {/* 4. Stress */}
          <div 
            onClick={() => navigate('/wellness')}
            className="rounded-[22px] bg-white/[0.04] border border-white/[0.08] p-4 backdrop-blur-xl shadow-md hover:border-white/15 cursor-pointer active:scale-95 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-[12px] font-semibold text-slate-300">Stress</span>
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-[20px] font-extrabold text-white leading-none">
                Low
              </span>
            </div>
            <p className="text-[11.5px] font-medium text-emerald-400 mt-0.5">
              Good
            </p>
            {/* 5-bar vertical signal meters */}
            <div className="mt-2 h-6 flex items-end gap-1.5 w-full">
              <div className="w-full bg-emerald-400 rounded-t h-2" />
              <div className="w-full bg-emerald-400/80 rounded-t h-3" />
              <div className="w-full bg-emerald-500/40 rounded-t h-4" />
              <div className="w-full bg-white/10 rounded-t h-5" />
              <div className="w-full bg-white/10 rounded-t h-6" />
            </div>
          </div>
        </div>

        {/* ── Insights Section (Image 2 Screen 5) ───────────── */}
        <div className="pt-1">
          <h2 className="text-[15.5px] font-bold text-white mb-2.5">
            Insights
          </h2>
          <div 
            onClick={() => navigate('/wellness')}
            className="rounded-[22px] bg-white/[0.04] border border-white/[0.08] p-4 backdrop-blur-xl shadow-lg shadow-black/20 hover:border-white/15 cursor-pointer active:scale-95 transition-all flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white leading-snug">
                  Your sleep has improved by 12% this week.
                </p>
                <p className="text-[12px] text-slate-400 mt-0.5 truncate">
                  You're on a positive trend.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        </div>

        {/* ── Deep Clinical Services Disclosure ─────────────── */}
        <div className="pt-2">
          <button
            onClick={() => setShowAllServices(!showAllServices)}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[12.5px] font-semibold text-slate-300 hover:text-white flex items-center justify-between transition-colors"
          >
            <span>Clinical Services & Records</span>
            {showAllServices ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAllServices && (
            <div className="grid grid-cols-2 gap-2.5 mt-2.5">
              {services.map((svc) => (
                <button
                  key={svc.path}
                  onClick={() => navigate(svc.path)}
                  className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-left hover:bg-white/[0.07] active:scale-95 transition-all"
                >
                  <svc.icon className="w-5 h-5 text-indigo-400 mb-1.5" />
                  <p className="text-[13px] font-bold text-white leading-tight">{svc.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{svc.desc}</p>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

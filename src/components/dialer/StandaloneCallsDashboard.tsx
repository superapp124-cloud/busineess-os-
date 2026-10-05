import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  ChevronRight,
  Plus,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  ShieldAlert,
  Activity,
  EyeOff,
  Bell,
  MessageSquare,
  Mic,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInstantCache } from '@/hooks/useInstantCache';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import chatrIconLogo from '@/assets/chatr-icon-logo.png';
import { useDialerData } from '@/hooks/useDialerData';
import { DialerSearchBar } from './DialerSearchBar';
import {
  avatarColorForIdentity,
  callerInitials,
  chooseCallerDisplayName,
  formatPhoneForDisplay,
} from '@/utils/callerIdentityResolver';

type TopContactBubble = {
  id: string;
  name: string;
  phone: string;
  avatar?: string | null;
  initials: string;
  color: string;
};

type DefenseFeatures = {
  aiScreen: boolean;
  scamEngine: boolean;
  darkWeb: boolean;
  antiTracker: boolean;
};

type NativeDefenseState = {
  features?: Partial<DefenseFeatures>;
  lastResult?: {
    decision?: string;
    riskLevel?: string;
    displayName?: string | null;
    summary?: string;
  } | null;
};

type NativeProtectionState = {
  readPhoneState?: boolean;
  readCallLog?: boolean;
  overlay?: boolean;
  callScreeningRole?: boolean;
  callRedirectionRole?: boolean;
  defaultDialer?: boolean;
  nativeCaptureReady?: boolean;
  callerIdReady?: boolean;
  gsmDefenseReady?: boolean;
  incomingGsmReady?: boolean;
  outgoingGsmReady?: boolean;
  fullGsmCoverageReady?: boolean;
  gsmDefenses?: NativeDefenseState;
  stats?: {
    capturedCalls?: number;
    pendingSync?: number;
    knownCallerProfiles?: number;
  };
};

const defaultDefenseFeatures: DefenseFeatures = {
  aiScreen: true,
  scamEngine: true,
  darkWeb: false,
  antiTracker: false,
};

const parseNativeJson = <T,>(raw?: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn('[Shield] Failed to parse native state:', error);
    return null;
  }
};

const readNativeProtectionState = (): NativeProtectionState | null => {
  if (typeof window === 'undefined') return null;
  return parseNativeJson<NativeProtectionState>(window.ChatrNativeRuntime?.getCallerProtectionState?.());
};

const mergeDefenseFeatures = (state?: NativeDefenseState | null): DefenseFeatures => ({
  ...defaultDefenseFeatures,
  ...(state?.features || {}),
});

// Fallback contacts matching the reference design
const mockupContacts: TopContactBubble[] = [
  { id: 'mock-1', name: 'Ahmed', phone: '+919876543210', initials: 'AK', color: '#7C3AED' },
  { id: 'mock-2', name: 'Akshay', phone: '+919876543211', initials: 'AK', color: '#06B6D4' },
  { id: 'mock-3', name: 'Aisha', phone: '+919876543212', initials: 'A', color: '#C084FC' },
  { id: 'mock-4', name: 'Ajay', phone: '+919876543213', initials: 'AJ', color: '#A855F7' },
  { id: 'mock-5', name: 'Asif', phone: '+919876543214', initials: 'AS', color: '#F59E0B' },
];

export const StandaloneCallsDashboard = ({ 
  themeColor = '#8B5CF6', 
  setThemeColor,
  themeMode = 'dark',
  setThemeMode
}: { 
  themeColor?: string, 
  setThemeColor?: (c: string) => void,
  themeMode?: 'dark' | 'light' | 'glass',
  setThemeMode?: (m: 'dark' | 'light' | 'glass') => void
}) => {
  const navigate = useNavigate();
  
  const [threatsBlocked, setThreatsBlocked] = useState<number>(() => {
    const nativeState = readNativeProtectionState();
    return Number(nativeState?.stats?.capturedCalls || 0);
  });

  useEffect(() => {
    const fetchLiveThreats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { count } = await supabase
          .from('caller_reports')
          .select('*', { count: 'exact', head: true })
          .eq('reporter_id', user.id)
          .eq('report_type', 'spam');
        if (typeof count === 'number') {
          setThreatsBlocked(prev => Math.max(prev, count));
        }
      } catch {}
    };
    fetchLiveThreats();
  }, []);
  const { recents: dialerRecents, loading: recentsLoading } = useDialerData();

  const [nativeProtection, setNativeProtection] = useState<NativeProtectionState | null>(() => readNativeProtectionState());
  const [features, setFeatures] = useState<DefenseFeatures>(() =>
    mergeDefenseFeatures(readNativeProtectionState()?.gsmDefenses),
  );

  useEffect(() => {
    const refresh = () => {
      const nextProtection = readNativeProtectionState();
      if (!nextProtection) return;
      setNativeProtection(nextProtection);
      setFeatures(mergeDefenseFeatures(nextProtection.gsmDefenses));

      const blocked = Number(nextProtection.stats?.capturedCalls || 0);
      if (blocked > 0) {
        setThreatsBlocked(prev => Math.max(prev, blocked));
      }
    };

    refresh();
    window.addEventListener('nativeContactPermissionsChanged', refresh as EventListener);
    return () => window.removeEventListener('nativeContactPermissionsChanged', refresh as EventListener);
  }, []);

  const toggleFeature = (key: keyof typeof features) => {
    const readyByKey = {
      aiScreen: Boolean(nativeProtection?.nativeCaptureReady || nativeProtection?.callerIdReady),
      scamEngine: Boolean(nativeProtection?.callScreeningRole || nativeProtection?.nativeCaptureReady),
      darkWeb: Boolean(nativeProtection?.nativeCaptureReady),
      antiTracker: Boolean(nativeProtection?.nativeCaptureReady),
    } satisfies Record<keyof DefenseFeatures, boolean>;

    if (!readyByKey[key]) {
      window.ChatrNativeRuntime?.requestCallerProtectionSetup?.();
      return;
    }

    const enabled = !features[key];
    if (window.ChatrNativeRuntime?.setGsmDefenseFeature) {
      const nextState = parseNativeJson<NativeDefenseState>(
        window.ChatrNativeRuntime.setGsmDefenseFeature(key, enabled),
      );
      setFeatures(mergeDefenseFeatures(nextState));
      setNativeProtection(readNativeProtectionState());
      return;
    }

    setFeatures(prev => ({ ...prev, [key]: enabled }));
  };
  
  const { data: profile } = useInstantCache('user-profile', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return (await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()).data;
  });

  const { data: topContacts } = useInstantCache<TopContactBubble[]>('dashboard-top-contact-bubbles', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const bubbles: TopContactBubble[] = [];

    if (user) {
      const { data } = await supabase
        .from('contacts')
        .select('id, contact_name, contact_phone, profiles:contact_user_id(avatar_url)')
        .eq('user_id', user.id)
        .order('contact_name')
        .limit(8);

      (data || []).forEach((contact: any) => {
        const name = chooseCallerDisplayName([contact.contact_name], contact.contact_phone);
        if (!name) return;

        bubbles.push({
          id: contact.id,
          name,
          phone: contact.contact_phone || '',
          avatar: contact.profiles?.avatar_url || null,
          initials: callerInitials(name, contact.contact_phone),
          color: avatarColorForIdentity(name, contact.contact_phone),
        });
      });
    }

    if (bubbles.length === 0 && window.ChatrNativeRuntime?.getDeviceContacts) {
      try {
        const parsed = JSON.parse(window.ChatrNativeRuntime.getDeviceContacts(8) || '[]');
        if (Array.isArray(parsed)) {
          parsed.forEach((contact: any) => {
            const name = chooseCallerDisplayName(
              [contact.contact_name || contact.displayName],
              contact.normalized_number || contact.phone_number,
            );
            if (!name) return;

            bubbles.push({
              id: contact.id || contact.normalized_number,
              name,
              phone: contact.normalized_number || contact.contact_phone || contact.phone_number || '',
              avatar: contact.photo_uri || null,
              initials: contact.initials || callerInitials(name, contact.normalized_number),
              color: contact.avatar_color || avatarColorForIdentity(name, contact.normalized_number),
            });
          });
        }
      } catch (error) {
        console.warn('[Shield] Native contact bubbles unavailable:', error);
      }
    }

    return bubbles;
  }, { ttl: 3000 });

  const displayContacts = topContacts || [];

  return (
    <div className="calls-dark-theme min-h-screen w-full bg-[#080711] text-white font-sans relative overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* Subtle Top Purple Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-purple-900/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto px-4 pt-11 pb-36 relative z-10 flex flex-col">

        {/* ── TOP HEADER (Brand Logo, Name, Subtitle, Bell, Avatar) ── */}
        <div className="flex items-center justify-between mb-5">
          {/* Brand Logo & Wordmark */}
          <div className="flex items-center gap-3">
            <img 
              src={chatrIconLogo} 
              alt="CHATR" 
              className="w-10 h-10 rounded-2xl object-contain shadow-lg shadow-purple-950/40 border border-white/10"
            />
            <div className="flex flex-col">
              <span className="text-[23px] font-black tracking-tight text-white leading-tight font-sans">
                CHATR
              </span>
              <span className="text-[12px] text-slate-400 font-medium leading-tight">
                Your SI call shield
              </span>
            </div>
          </div>

          {/* Right Header: Notification Bell & Profile Avatar */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-slate-300 hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#080711]" />
            </button>

            <div 
              onClick={() => navigate('/profile')}
              className="relative cursor-pointer active:scale-95 transition-transform"
            >
              <Avatar className="h-10 w-10 border border-white/10 ring-2 ring-purple-500/30">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-purple-900 text-white font-bold text-sm">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'A'}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#080711] rounded-full" />
            </div>
          </div>
        </div>

        {/* ── PERSISTENT SEARCH BAR (Contacts, Numbers & Voice Search) ── */}
        <DialerSearchBar recentCalls={dialerRecents} />

        {/* ── CALL SHIELD BIG CARD (Incoming Protected) ── */}
        <div 
          onClick={() => {
            if (!nativeProtection?.fullGsmCoverageReady) {
              window.ChatrNativeRuntime?.requestOutgoingGsmSetup?.();
            }
          }}
          className="w-full rounded-[26px] bg-gradient-to-r from-[#171233] to-[#120F25] border border-purple-500/35 p-4 flex items-center justify-between shadow-xl shadow-purple-950/25 mb-4 cursor-pointer active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3.5">
            {/* Concentric glowing shield container */}
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/35 to-purple-900/40 border border-purple-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/20">
              <Shield className="w-7 h-7 text-purple-300 fill-purple-500/40" />
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-[0.16em] text-purple-300/80 uppercase">
                CALL SHIELD
              </span>
              <h2 className="text-[18px] font-bold text-white tracking-tight leading-snug">
                Incoming Protected
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[12px] font-bold text-white tabular-nums">
                  {threatsBlocked.toLocaleString()}
                </span>
                <span className="text-[12px] text-slate-400">blocked</span>
                <span className="text-[12px] text-slate-500">•</span>
                <span className="text-[12px] font-medium text-emerald-400">
                  Outgoing shield active
                </span>
              </div>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
        </div>

        {/* ── CONTACTS / FAVORITES ROW ── */}
        <div className="w-full rounded-[24px] bg-[#100D22] border border-white/[0.07] p-3 mb-5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-4 min-w-max px-1">
            {/* + Add Contact Button */}
            <button 
              onClick={() => {
                window.ChatrNativeRuntime?.requestContactsPermission?.();
                navigate('/calls/contacts');
              }}
              className="flex flex-col items-center gap-1 shrink-0 group active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-[#181432] border border-dashed border-purple-400/40 flex items-center justify-center text-purple-300 group-hover:border-purple-400 group-hover:bg-purple-950/40 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[11px] text-slate-400 font-medium text-center">Add</span>
            </button>

            {/* Contact Bubbles */}
            {displayContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => navigate('/calls/contacts')}
                className="flex flex-col items-center gap-1 shrink-0 active:scale-95 transition-transform"
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-[13px] shadow-md border border-white/10 overflow-hidden"
                  style={{ backgroundColor: contact.color }}
                >
                  {contact.avatar ? (
                    <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                  ) : (
                    contact.initials
                  )}
                </div>
                <span className="text-[11px] text-slate-300 font-medium text-center truncate max-w-[54px]">
                  {contact.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── ACTIVE DEFENSES SECTION (2x2 Grid) ── */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[16px] font-bold text-white tracking-tight">Active Defenses</h3>
          <button 
            onClick={() => navigate('/calls/recents')}
            className="text-[12px] font-medium text-slate-400 hover:text-purple-300 flex items-center gap-0.5 transition-colors"
          >
            All Features <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Card 1: SI Call Screen */}
          <div 
            onClick={() => toggleFeature('aiScreen')}
            className="rounded-[22px] bg-gradient-to-br from-[#1E123F] to-[#120C29] border border-purple-500/40 p-4 relative flex flex-col justify-between min-h-[148px] shadow-lg shadow-purple-950/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                <Phone className="w-5 h-5 fill-white/20" />
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </div>

            <div>
              <h4 className="text-[14px] font-bold text-white">SI Call Screen</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Identifies unknown GSM callers on ring.
              </p>
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
              <ChevronRight className="w-4 h-4 text-purple-300/70" />
            </div>
          </div>

          {/* Card 2: Scam Engine */}
          <div 
            onClick={() => toggleFeature('scamEngine')}
            className="rounded-[22px] bg-gradient-to-br from-[#1E123F] to-[#120C29] border border-purple-500/40 p-4 relative flex flex-col justify-between min-h-[148px] shadow-lg shadow-purple-950/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                <ShieldAlert className="w-5 h-5 fill-white/20" />
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            </div>

            <div>
              <h4 className="text-[14px] font-bold text-white">Scam Engine</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Blocks risky incoming calls live.
              </p>
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
              <ChevronRight className="w-4 h-4 text-purple-300/70" />
            </div>
          </div>

          {/* Card 3: Dark Web Scan */}
          <div 
            onClick={() => toggleFeature('darkWeb')}
            className="rounded-[22px] bg-[#120E26] border border-white/[0.08] p-4 relative flex flex-col justify-between min-h-[148px] active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-700/30 flex items-center justify-center text-purple-300">
                <Activity className="w-5 h-5" />
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            </div>

            <div>
              <h4 className="text-[14px] font-bold text-white">Dark Web Scan</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Needs GSM capture setup to detect leaked numbers.
              </p>
            </div>

            <div className="mt-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-white/20 text-[11px] font-medium text-slate-300 hover:border-purple-400 transition-colors">
                Set Up →
              </span>
            </div>
          </div>

          {/* Card 4: Anti-Tracker */}
          <div 
            onClick={() => toggleFeature('antiTracker')}
            className="rounded-[22px] bg-[#120E26] border border-white/[0.08] p-4 relative flex flex-col justify-between min-h-[148px] active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-700/30 flex items-center justify-center text-purple-300">
                <EyeOff className="w-5 h-5" />
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            </div>

            <div>
              <h4 className="text-[14px] font-bold text-white">Anti-Tracker</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Needs call capture permission.
              </p>
            </div>

            <div className="mt-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-white/20 text-[11px] font-medium text-slate-300 hover:border-purple-400 transition-colors">
                Set Up →
              </span>
            </div>
          </div>
        </div>

        {/* ── SPLIT BOTTOM SECTION: Recent Activity & Quick Actions ── */}
        <div className="grid grid-cols-2 gap-3.5 mb-6">
          {/* Left Column: Recent Activity */}
          <div className="rounded-[24px] bg-[#120E26] border border-white/[0.08] p-3 flex flex-col gap-3">
            <div 
              onClick={() => navigate('/calls/recents')}
              className="flex items-center justify-between cursor-pointer hover:text-purple-300 transition-colors"
            >
              <span className="text-[13px] font-bold text-white">Recent Activity</span>
              <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                View All <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            {/* List of recent calls */}
            <div className="space-y-3">
              {dialerRecents && dialerRecents.length > 0 ? (
                dialerRecents.slice(0, 3).map((call) => {
                  const isIncoming = call.direction === 'incoming';
                  const isMissed = call.direction === 'missed';
                  const formattedTime = call.timestamp ? new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  return (
                    <div 
                      key={call.id}
                      onClick={() => navigate('/calls/recents')}
                      className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
                    >
                      <div 
                        className="w-8 h-8 rounded-full text-white font-bold text-[12px] flex items-center justify-center shrink-0 overflow-hidden"
                        style={{ backgroundColor: call.avatarColor || '#7C3AED' }}
                      >
                        {call.avatarUrl ? (
                          <img src={call.avatarUrl} alt={call.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{call.initials || 'C'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-white truncate">{call.displayName || call.phoneNumber}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {isIncoming ? (
                            <PhoneIncoming className="w-2.5 h-2.5 text-emerald-400" />
                          ) : isMissed ? (
                            <PhoneIncoming className="w-2.5 h-2.5 text-rose-400" />
                          ) : (
                            <PhoneOutgoing className="w-2.5 h-2.5 text-emerald-400" />
                          )}
                          <span className={cn(
                            "text-[8px] font-bold px-1.5 py-0.5 rounded-full",
                            isMissed ? "bg-rose-500/20 text-rose-300" : "bg-purple-500/20 text-purple-300"
                          )}>
                            {isMissed ? 'Missed' : isIncoming ? 'Incoming' : 'Outgoing'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-right shrink-0">
                        <span className="text-[9px] text-slate-400">{formattedTime}</span>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-3 text-center">
                  <p className="text-[11px] text-slate-400">No recent calls</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Actions */}
          <div className="rounded-[24px] bg-[#120E26] border border-white/[0.08] p-3 flex flex-col justify-between">
            <div 
              onClick={() => navigate('/calls/keypad')}
              className="flex items-center justify-between mb-2 cursor-pointer hover:text-purple-300 transition-colors"
            >
              <span className="text-[13px] font-bold text-white">Quick Actions</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>

            {/* 2x2 Grid of Quick Actions */}
            <div className="grid grid-cols-2 gap-2 flex-1">
              {/* Secure Chat */}
              <button 
                onClick={() => navigate('/chat')}
                className="rounded-2xl bg-[#1D173C] border border-purple-500/25 p-2 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform aspect-square"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-purple-300" />
                </div>
                <span className="text-[10px] text-slate-300 font-medium text-center leading-tight">
                  Secure<br/>Chat
                </span>
              </button>

              {/* Dial Secure */}
              <button 
                onClick={() => navigate('/calls/keypad')}
                className="rounded-2xl bg-[#112423] border border-emerald-500/25 p-2 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform aspect-square"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <PhoneCall className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[10px] text-slate-300 font-medium text-center leading-tight">
                  Dial<br/>Secure
                </span>
              </button>

              {/* Ask CHATR */}
              <button 
                onClick={() => navigate('/ai-assistant')}
                className="rounded-2xl bg-[#102334] border border-cyan-500/25 p-2 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform aspect-square"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <Mic className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-[10px] text-slate-300 font-medium text-center leading-tight">
                  Ask<br/>CHATR
                </span>
              </button>

              {/* Settings */}
              <button 
                onClick={() => navigate('/settings')}
                className="rounded-2xl bg-[#181824] border border-white/10 p-2 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform aspect-square"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-slate-300" />
                </div>
                <span className="text-[10px] text-slate-300 font-medium text-center leading-tight">
                  Settings
                </span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

import { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, ChevronRight, Sparkles,
  Phone, MessageSquare, CalendarDays, Compass,
  Heart, Wallet, FileText, MoreHorizontal,
  Video, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEOHead } from '@/components/SEOHead';
import { useInstantCache } from '@/hooks/useInstantCache';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNativeHaptics } from '@/hooks/useNativeHaptics';
import { IntelligentHomeFeed } from '@/components/home/IntelligentHomeFeed';
import { UnifiedAIActionsSheet } from '@/components/ai/UnifiedAIActionsSheet';
import { PrivacyExplanationModal } from '@/components/ai/PrivacyExplanationModal';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
};

// Quick action colours — FaceTime-style saturated, visible on dark
const ACTIONS = [
  { id: 'qa-call',   label: 'Call',      icon: Phone,         bg: '#1C4ED8', fg: '#FFFFFF', route: '/calls' },
  { id: 'qa-video',  label: 'Video',     icon: Video,         bg: '#16A34A', fg: '#FFFFFF', route: '/calls' },
  { id: 'qa-msg',    label: 'Message',   icon: MessageSquare, bg: '#7C3AED', fg: '#FFFFFF', route: '/chat' },
  { id: 'qa-find',   label: 'Find',      icon: Compass,       bg: '#0E7490', fg: '#FFFFFF', route: '/universal-search' },
  { id: 'qa-plan',   label: 'Plan',      icon: CalendarDays,  bg: '#B45309', fg: '#FFFFFF', route: null },
  { id: 'qa-health', label: 'Health',    icon: Heart,         bg: '#BE123C', fg: '#FFFFFF', route: '/health' },
  { id: 'qa-pay',    label: 'Pay',       icon: Wallet,        bg: '#92400E', fg: '#FFFFFF', route: '/chatr-wallet' },
  { id: 'qa-more',   label: 'More',      icon: MoreHorizontal,bg: '#374151', fg: '#D1D5DB', route: null },
] as const;

const Home = memo(() => {
  const navigate = useNavigate();
  const haptics = useNativeHaptics();
  const greeting = useMemo(getGreeting, []);
  const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const handleNavigate = useCallback((route: string) => {
    haptics.light();
    navigate(route);
  }, [haptics, navigate]);

  const { data: profile } = useInstantCache('user-profile', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url, username, full_name')
      .eq('id', user.id)
      .maybeSingle();
    return data;
  }, { ttl: 10 * 60 * 1000 });

  const { data: metrics } = useInstantCache('home-metrics', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { balance: 0, appointments: 0, unread: 0, spamBlocked: 0, notificationCount: 0 };

    const [points, appointments, notifs, spam] = await Promise.all([
      supabase.from('chatr_coin_balances').select('total_coins').eq('user_id', user.id).maybeSingle(),
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('patient_id', user.id).gte('appointment_date', new Date().toISOString()),
      supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false),
      supabase.from('caller_reports').select('*', { count: 'exact', head: true }).eq('reporter_id', user.id).eq('report_type', 'spam'),
    ]);

    let realUnreadMessages = 0;
    try {
      const { data: convs } = await supabase.rpc('get_user_conversations_optimized', { p_user_id: user.id });
      if (convs && Array.isArray(convs)) {
        realUnreadMessages = convs.reduce((sum: number, c: any) => sum + (c.unreadcount || c.unread_count || 0), 0);
      }
    } catch {}

    return {
      balance: points.data?.total_coins || 0,
      appointments: appointments.count || 0,
      unread: realUnreadMessages,
      notificationCount: notifs.count || 0,
      spamBlocked: spam.count || 0,
    };
  }, { pollingInterval: 60000 });

  const { data: recentConversations } = useInstantCache('recent-conversations', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data: optimizedData } = await supabase.rpc('get_user_conversations_optimized', { p_user_id: user.id });
    return optimizedData?.slice(0, 5) || [];
  }, { pollingInterval: 30000 });

  const userName = useMemo(() => {
    if (!profile) return 'there';
    return profile.full_name?.split(' ')[0] || profile.username || 'there';
  }, [profile]);

  const handleAction = useCallback((action: typeof ACTIONS[number]) => {
    haptics.light();
    if (action.route) navigate(action.route);
    else setIsAiSheetOpen(true);
  }, [haptics, navigate]);

  return (
    <div
      className="flex flex-col min-h-screen overflow-y-auto font-sans select-none"
      style={{ background: 'linear-gradient(160deg, #0D1117 0%, #111827 50%, #0D1117 100%)' }}
    >
      <SEOHead
        title="Chatr+ — Your Personal SI"
        description="A personal Super Intelligence layer that understands your context, remembers what matters, communicates naturally and helps you get things done."
      />

      {/* ── Status Bar Spacer ─────────────────────────────── */}
      <div style={{ height: 'env(safe-area-inset-top, 44px)' }} />

      <div className="mx-auto max-w-[540px] w-full px-4 pb-36 space-y-5">

        {/* ── Header ─────────────────────────────────────── */}
        <header className="flex items-center justify-between pt-2">
          {/* chatr+ wordmark */}
          <div className="flex items-center gap-1.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-[10px]"
              style={{ background: 'linear-gradient(135deg,#5C22FF,#4f46e5)' }}
            >
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-[19px] font-black tracking-tight text-white">
              chatr<span style={{ color: '#00D084' }}>+</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              type="button"
              onClick={() => handleNavigate('/universal-search')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-slate-300 active:scale-90 transition-all"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Notifications */}
            <button
              id="home-notifications"
              type="button"
              onClick={() => handleNavigate('/notifications')}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-slate-300 active:scale-90 transition-all"
            >
              <Bell className="h-4 w-4" />
              {(metrics?.notificationCount || 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-[1.5px] ring-[#0D1117]" />
              )}
            </button>

            {/* Avatar */}
            <button
              id="home-profile"
              type="button"
              onClick={() => handleNavigate('/profile')}
              className="relative h-9 w-9 rounded-full ring-2 ring-white/20 active:scale-90 transition-all overflow-hidden"
            >
              <Avatar className="h-full w-full">
                <AvatarImage src={profile?.avatar_url ?? undefined} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white font-bold text-[12px]">
                  {userName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0D1117] bg-emerald-400" />
            </button>
          </div>
        </header>

        {/* ── Greeting ───────────────────────────────────── */}
        <section className="pt-1 pb-0.5">
          <p className="text-[13px] font-medium text-slate-400">{greeting} 👋</p>
          <h1 className="text-[32px] font-black text-white tracking-tight leading-[1.1] mt-0.5">
            {userName}
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">What would you like to do today?</p>
        </section>

        {/* ── FaceTime-style Recent Contacts Row ─────────── */}
        {recentConversations && recentConversations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-bold text-slate-300 uppercase tracking-wider">Recent</h2>
              <button
                onClick={() => handleNavigate('/chat')}
                className="flex items-center gap-0.5 text-[12px] font-semibold text-[#5C22FF]"
              >
                See all <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
              {(recentConversations as any[]).map((conv: any) => {
                const name = conv.is_group ? conv.group_name : (conv.otheruser?.full_name || conv.otheruser?.username || 'User');
                const initials = name?.[0]?.toUpperCase() || 'U';
                const avatarUrl = conv.otheruser?.avatar_url;
                const unread = conv.unreadcount || conv.unread_count || 0;
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleNavigate(`/chat/${conv.id}`)}
                    className="flex flex-col items-center gap-1.5 active:opacity-70 transition-all shrink-0"
                  >
                    <div className="relative">
                      <div
                        className="h-[62px] w-[62px] rounded-full overflow-hidden ring-2 shadow-lg"
                        style={{ ringColor: unread > 0 ? '#5C22FF' : 'rgba(255,255,255,0.15)' }}
                      >
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-700">
                            <span className="text-[22px] font-bold text-white">{initials}</span>
                          </div>
                        )}
                      </div>
                      {/* Online dot */}
                      <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#0D1117]" />
                      {/* Unread badge */}
                      {unread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#5C22FF] px-1 text-[9px] font-black text-white ring-1 ring-[#0D1117]">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200 max-w-[62px] truncate text-center leading-none">
                      {name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── FaceTime-style Quick Actions Grid ──────────── */}
        <section>
          <h2 className="text-[13px] font-bold text-slate-300 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            {ACTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={item.id}
                  onClick={() => handleAction(item)}
                  className="flex flex-col items-center justify-center gap-2 py-3.5 rounded-[22px] active:scale-95 transition-all shadow-lg"
                  style={{ backgroundColor: item.bg + '22', border: `1px solid ${item.bg}55` }}
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-[16px] shadow-md"
                    style={{ backgroundColor: item.bg }}
                  >
                    <Icon
                      className="h-[22px] w-[22px]"
                      style={{ color: item.fg }}
                      strokeWidth={2}
                    />
                  </span>
                  <span className="text-[11px] font-bold text-white tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── AI / Omnibar ───────────────────────────────── */}
        <button
          onClick={() => setIsAiSheetOpen(true)}
          className="w-full flex items-center h-[52px] rounded-[26px] border border-white/[0.12] bg-white/[0.04] px-4 backdrop-blur-xl shadow-lg shadow-black/30 hover:border-white/20 active:scale-[0.98] transition-all"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="ml-3 text-[14px] text-slate-400 font-medium flex-1 text-left truncate">
            Ask or tell Chatr+…
          </span>
          <span className="shrink-0 text-[10px] font-black text-slate-500 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded-full">
            AI
          </span>
        </button>

        {/* ── "For You" Intelligent Feed ─────────────────── */}
        <section>
          <IntelligentHomeFeed
            onNavigate={handleNavigate}
            spamBlocked={metrics?.spamBlocked || 0}
            appointmentCount={metrics?.appointments || 0}
            walletBalance={metrics?.balance || 0}
            unreadCount={metrics?.unread || 0}
            onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
          />
        </section>

      </div>

      {/* ── Unified SI Actions Sheet ───────────────────── */}
      <UnifiedAIActionsSheet
        isOpen={isAiSheetOpen}
        onClose={() => setIsAiSheetOpen(false)}
      />

      {/* ── Privacy Explanation Modal ──────────────────── */}
      <PrivacyExplanationModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
});

Home.displayName = 'Home';
export default Home;

import { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, ChevronRight, Search, Sparkles,
  Phone, MessageSquare, CalendarDays, Compass,
  Heart, Wallet, FileText, MoreHorizontal,
  Mic, AudioWaveform
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

const Home = memo(() => {
  const navigate = useNavigate();
  const haptics = useNativeHaptics();
  const greeting = useMemo(getGreeting, []);
  const [searchQuery, setSearchQuery] = useState('');
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
    return optimizedData?.slice(0, 3) || [];
  }, { pollingInterval: 30000 });

  const userName = useMemo(() => {
    if (!profile) return 'Arshid';
    return profile.full_name?.split(' ')[0] || profile.username || 'Arshid';
  }, [profile]);

  // 8 Quick Actions matching Image 2 Screen 1
  const quickActions = [
    {
      id: 'qa-call',
      label: 'Call',
      icon: Phone,
      color: 'text-blue-400',
      bg: 'bg-blue-500/15',
      action: () => handleNavigate('/calls'),
    },
    {
      id: 'qa-msg',
      label: 'Message',
      icon: MessageSquare,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15',
      action: () => handleNavigate('/chat'),
    },
    {
      id: 'qa-plan',
      label: 'Plan',
      icon: CalendarDays,
      color: 'text-violet-400',
      bg: 'bg-violet-500/15',
      action: () => setIsAiSheetOpen(true),
    },
    {
      id: 'qa-find',
      label: 'Find',
      icon: Compass,
      color: 'text-sky-400',
      bg: 'bg-sky-500/15',
      action: () => handleNavigate('/universal-search'),
    },
    {
      id: 'qa-health',
      label: 'Health',
      icon: Heart,
      color: 'text-rose-400',
      bg: 'bg-rose-500/15',
      action: () => handleNavigate('/health'),
    },
    {
      id: 'qa-pay',
      label: 'Pay',
      icon: Wallet,
      color: 'text-amber-400',
      bg: 'bg-amber-500/15',
      action: () => handleNavigate('/chatr-wallet'),
    },
    {
      id: 'qa-sum',
      label: 'Summarize',
      icon: FileText,
      color: 'text-purple-400',
      bg: 'bg-purple-500/15',
      action: () => setIsAiSheetOpen(true),
    },
    {
      id: 'qa-more',
      label: 'More',
      icon: MoreHorizontal,
      color: 'text-slate-400',
      bg: 'bg-white/10',
      action: () => setIsAiSheetOpen(true),
    },
  ];

  return (
    <div
      className="flex flex-col min-h-screen overflow-y-auto pb-32 font-sans text-white select-none"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #16172B 0%, #0B0E14 50%, #07090E 100%)'
      }}
    >
      <SEOHead title="Home | Chatr+" description="Your intelligent communication operating system" />

      <div className="mx-auto max-w-[540px] w-full space-y-4 px-4 pt-3.5 pb-28">

        {/* ── Top Bar (Image 2) ────────────────────────────── */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
            <span className="text-[17px] font-extrabold tracking-wider text-white uppercase">
              CHATR
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="home-notifications"
              type="button"
              onClick={() => handleNavigate('/notifications')}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white active:scale-90 transition-all"
            >
              <Bell className="h-4.5 w-4.5" />
              {(metrics?.notificationCount || 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#0B0E14]" />
              )}
            </button>

            <button
              id="home-profile"
              type="button"
              onClick={() => handleNavigate('/profile')}
              className="relative h-9 w-9 rounded-full ring-1 ring-white/20 active:scale-90 transition-all overflow-hidden"
            >
              <Avatar className="h-full w-full">
                <AvatarImage src={profile?.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white font-bold text-[12px]">
                  {userName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0B0E14] bg-emerald-400 shadow-sm" />
            </button>
          </div>
        </header>

        {/* ── Greeting (Image 2) ───────────────────────────── */}
        <div className="pt-1 pb-1">
          <p className="text-[14px] text-slate-400 font-normal">
            {greeting},
          </p>
          <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-none mt-0.5">
            {userName}
          </h1>
          <p className="text-[13px] text-slate-400 font-normal mt-1.5">
            Tell me what you need, I'll handle it.
          </p>
        </div>

        {/* ── Omnibar SI Intent Input (Image 2) ────────────── */}
        <div className="relative z-20">
          <div
            onClick={() => setIsAiSheetOpen(true)}
            className="flex items-center h-[52px] w-full rounded-[26px] bg-white/[0.05] border border-white/[0.12] px-4 backdrop-blur-xl shadow-lg shadow-black/30 cursor-pointer hover:border-white/20 transition-all"
          >
            <Search className="h-5 w-5 text-slate-400 shrink-0" />
            <span className="ml-3 text-[14px] text-slate-400 font-medium flex-1 truncate">
              {searchQuery || "Ask or tell CHATR..."}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAiSheetOpen(true);
                }}
              >
                <Mic className="h-4.5 w-4.5" />
              </button>
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/40">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* ── 8 Quick Actions Grid (Image 2 Screen 1) ───────── */}
        <section className="grid grid-cols-4 gap-2.5 pt-1">
          {quickActions.map((item) => (
            <button
              key={item.id}
              id={item.id}
              onClick={item.action}
              className="flex flex-col items-center justify-center gap-2 py-3 px-1 rounded-[20px] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] active:scale-95 transition-all shadow-sm shadow-black/20"
            >
              <span className={cn('flex h-10 w-10 items-center justify-center rounded-2xl', item.bg)}>
                <item.icon className={cn('h-5 w-5', item.color)} />
              </span>
              <span className="text-[11px] font-semibold text-slate-200 tracking-tight">
                {item.label}
              </span>
            </button>
          ))}
        </section>

        {/* ── "For you" Feed (Front Door <= 3 Cards) ────────── */}
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

        {/* ── Recent Conversations (Dark Styled) ─────────────── */}
        {recentConversations && recentConversations.length > 0 && (
          <section className="rounded-[24px] bg-white/[0.04] border border-white/[0.08] p-4 backdrop-blur-xl shadow-lg shadow-black/20">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <h3 className="text-[14px] font-bold text-white">Recent Chats</h3>
              </div>
              <button
                id="home-view-all-chats"
                onClick={() => handleNavigate('/chat')}
                className="flex items-center gap-0.5 text-[12px] font-semibold text-indigo-400 hover:text-indigo-300"
              >
                View all <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {recentConversations.map((conv: any) => (
                <button
                  key={conv.id}
                  id={`chat-${conv.id}`}
                  onClick={() => handleNavigate(`/chat/${conv.id}`)}
                  className="flex w-full items-center gap-3 py-3 text-left hover:bg-white/[0.02] active:opacity-70 transition-all rounded-xl px-1"
                >
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 overflow-hidden ring-1 ring-white/10">
                    {conv.otheruser?.avatar_url ? (
                      <img src={conv.otheruser.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[14px] font-bold text-slate-300">
                        {conv.otheruser?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0B0E14] bg-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-white">
                      {conv.is_group ? conv.group_name : conv.otheruser?.username}
                    </p>
                    <p className="mt-0.5 truncate text-[11.5px] font-normal text-slate-400">
                      {conv.lastmessage || 'Tap to chat'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />
                </button>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ── Unified SI Actions Sheet ("What can I do for you?") ─ */}
      <UnifiedAIActionsSheet
        isOpen={isAiSheetOpen}
        onClose={() => setIsAiSheetOpen(false)}
      />

      {/* ── Privacy Explanation Modal ("How was this processed?") ─ */}
      <PrivacyExplanationModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
});

Home.displayName = 'Home';
export default Home;

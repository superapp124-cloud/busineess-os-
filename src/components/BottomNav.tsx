import React, { useCallback, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Sparkles, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { useNativeHaptics } from '@/hooks/useNativeHaptics';
import { prefetchRoute } from '@/routes/lazyPages';
import { useInstantCache } from '@/hooks/useInstantCache';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UnifiedAIActionsSheet } from '@/components/ai/UnifiedAIActionsSheet';

// Primary Navigation matching Image 2:
// Home | Messages | SI (Glowing Center Button) | Health | Me
const navItems = [
  { name: 'Home', path: '/home', icon: Home, id: 'nav-home' },
  { name: 'Messages', path: '/chat', icon: MessageSquare, id: 'nav-messages' },
  { name: 'SI', path: '/ai-assistant', icon: Sparkles, id: 'nav-ai', isAi: true },
  { name: 'Health', path: '/health', icon: Heart, id: 'nav-health' },
  { name: 'Me', path: '/profile', icon: User, id: 'nav-me', isMe: true },
];

export const BottomNav = () => {
  const location = useLocation();
  const haptics = useNativeHaptics();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);
  const searchParams = new URLSearchParams(location.search);

  React.useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cancelled = false;
    const listeners: PluginListenerHandle[] = [];

    const registerKeyboardListeners = async () => {
      const showListener = await Keyboard.addListener('keyboardWillShow', () => setKeyboardVisible(true));
      const hideListener = await Keyboard.addListener('keyboardWillHide', () => setKeyboardVisible(false));

      if (cancelled) {
        showListener.remove();
        hideListener.remove();
        return;
      }

      listeners.push(showListener, hideListener);
    };

    void registerKeyboardListeners();

    return () => {
      cancelled = true;
      listeners.forEach((listener) => listener.remove());
    };
  }, []);

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

  const hasLegacyConversationQuery =
    location.pathname === '/chat' && searchParams.has('conversation');

  const shouldHide =
    location.pathname === '/calls' ||
    location.pathname === '/auth' ||
    location.pathname === '/onboarding' ||
    location.pathname === '/admin' ||
    location.pathname.startsWith('/chat/') ||
    hasLegacyConversationQuery ||
    location.pathname.startsWith('/standalone-messenger/') ||
    location.pathname.startsWith('/status/create') ||
    location.pathname.startsWith('/stories/create') ||
    isKeyboardVisible;

  const handleNavClick = useCallback(() => {
    haptics.light();
  }, [haptics]);

  const handlePrefetch = useCallback((path: string) => {
    switch (path) {
      case '/chat': prefetchRoute(() => import('@/pages/Chat')); break;
      case '/health': prefetchRoute(() => import('@/pages/HealthHub')); break;
      case '/profile': prefetchRoute(() => import('@/pages/Profile')); break;
      default: break;
    }
  }, []);

  if (shouldHide) return null;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[110] flex justify-center"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)'
        }}
      >
        <nav
          className={cn(
            "pointer-events-auto w-[calc(100%-28px)] max-w-[440px] relative",
            "rounded-[32px] border border-white/10",
            "shadow-[0_12px_40px_rgba(0,0,0,0.7)]"
          )}
          style={{
            backgroundColor: 'rgba(10, 14, 23, 0.94)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            isolation: 'isolate'
          }}
        >
          <div className="flex items-center justify-around px-3 py-2">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(item.path + '/') ||
                (item.path === '/chat' && location.pathname.startsWith('/chat'));

              const Icon = item.icon;
              const isAiTab = (item as any).isAi;
              const isMeTab = (item as any).isMe;

              // ── SI Tab — Glowing Floating Center Button (Image 2) ──
              if (isAiTab) {
                return (
                  <button
                    key={item.path}
                    type="button"
                    id={item.id}
                    onClick={() => {
                      haptics.medium();
                      setIsAiSheetOpen(true);
                    }}
                    className="relative flex flex-col items-center justify-center -mt-6 active:scale-90 transition-transform"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div
                      className={cn(
                        'relative flex h-13 w-13 items-center justify-center rounded-[24px]',
                        'bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500',
                        'border border-white/25',
                        'shadow-[0_0_24px_rgba(124,58,237,0.65)]'
                      )}
                    >
                      <Sparkles
                        className="h-6 w-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                        strokeWidth={2.2}
                      />
                    </div>
                  </button>
                );
              }

              // ── Standard Tab ───────────────────────────────────────
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  id={item.id}
                  onClick={handleNavClick}
                  onMouseEnter={() => handlePrefetch(item.path)}
                  onTouchStart={() => handlePrefetch(item.path)}
                  className={cn(
                    'relative flex flex-col items-center justify-center py-1.5 px-3',
                    'transition-all duration-200 active:scale-95',
                    'rounded-2xl',
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  )}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <div className={cn(
                    'relative flex h-7 w-7 items-center justify-center transition-transform',
                    isActive ? 'scale-105' : 'scale-100'
                  )}>
                    {isMeTab ? (
                      <Avatar className={cn(
                        'h-6 w-6 border-2 transition-all',
                        isActive
                          ? 'border-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]'
                          : 'border-white/20'
                      )}>
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-violet-600/30 text-white text-[10px] font-bold">
                          {profile?.full_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Icon
                        className={cn(
                          'h-5 w-5 transition-all',
                          isActive
                            ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]'
                            : 'text-slate-400'
                        )}
                        strokeWidth={isActive ? 2.3 : 1.8}
                      />
                    )}

                    {isActive && (
                      <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.9)]" />
                    )}
                  </div>

                  <span className={cn(
                    'mt-0.5 text-[9.5px] font-semibold tracking-tight transition-colors',
                    isActive ? 'text-white font-bold' : 'text-slate-400'
                  )}>
                    {item.name}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Floating Center SI Actions Sheet ("What can I do for you?") */}
      <UnifiedAIActionsSheet
        isOpen={isAiSheetOpen}
        onClose={() => setIsAiSheetOpen(false)}
      />
    </>
  );
};

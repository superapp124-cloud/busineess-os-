import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Star, Clock, Users, Grid, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNativeHaptics } from '@/hooks/useNativeHaptics';

const dialerItems = [
  { name: 'Call Shield', path: '/calls', icon: Shield },
  { name: 'Favorites', path: '/calls/favorites', icon: Star },
  { name: 'Recents', path: '/calls/recents', icon: Clock },
  { name: 'Contacts', path: '/calls/contacts', icon: Users },
  { name: 'Keypad', path: '/calls/keypad', icon: Grid },
];

export const StandaloneCallsNav = ({ themeColor = '#8B5CF6' }: { themeColor?: string }) => {
  const location = useLocation();
  const haptics = useNativeHaptics();

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 px-4 max-w-md mx-auto">
      <nav className="flex items-center justify-around h-[66px] px-2 rounded-full bg-[#0D0B1B]/95 border border-purple-500/25 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
        {dialerItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/calls' && location.pathname === '/calls/');
          const Icon = item.icon;

          if (isActive) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => haptics.light()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-600/35 border border-purple-500/50 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all"
              >
                <Icon className="w-4 h-4 fill-purple-400 text-purple-300" />
                <span className="text-[11px] font-bold tracking-tight">{item.name}</span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => haptics.light()}
              className="flex flex-col items-center justify-center px-2 py-1 text-slate-400 hover:text-white transition-colors"
            >
              <Icon className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-medium tracking-tight mt-0.5 text-slate-400">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

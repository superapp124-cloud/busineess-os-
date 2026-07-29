import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * FloatingHomeFab — Left-side floating action button for Electron & Desktop OS
 * Directs user immediately to /desktop/home from any page.
 */
export const FloatingHomeFab: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  // Hide on auth, splash, or onboarding full screen routes if needed
  const hiddenRoutes = ['/auth', '/onboarding', '/splash'];
  if (hiddenRoutes.some(route => location.pathname.startsWith(route))) {
    return null;
  }

  const isHome = location.pathname === '/desktop/home' || location.pathname === '/desktop/';

  return (
    <div className="fixed left-6 bottom-6 z-[9999] flex items-center gap-2">
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none rounded-xl border border-white/15 bg-zinc-950/90 px-3 py-1.5 text-label font-bold text-white shadow-2xl backdrop-blur-xl flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            <span>Chief of Staff Home</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => navigate('/desktop/home')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.92 }}
        title="Go to Home (/desktop/home)"
        aria-label="Go to Home"
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-300 shadow-2xl backdrop-blur-xl cursor-pointer group",
          isHome
            ? "border-violet-500/50 bg-violet-600/30 text-violet-300 shadow-violet-500/20"
            : "border-white/15 bg-[#0b0c16]/80 text-white/80 hover:border-violet-400/50 hover:bg-violet-600 hover:text-white hover:shadow-violet-600/30"
        )}
      >
        {/* Glow pulse ring on hover */}
        <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 blur transition-opacity duration-300 group-hover:opacity-40" />

        <Home className="relative h-5 w-5 transition-transform duration-300 group-hover:scale-110" />

        {/* Small active indicator dot */}
        {isHome && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_8px_#8b5cf6]" />
        )}
      </motion.button>
    </div>
  );
};

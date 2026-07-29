import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import chatrLogo from '@/assets/chatr-icon-logo.png';

/**
 * FloatingHomeFab — Left-side floating action button for Electron & Desktop OS
 * Uses Chatr Brand logo aesthetics, fixed positioning (no layout shift), and reliable click handler.
 */
export const FloatingHomeFab: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  // Hide on auth, splash, or onboarding full screen routes
  const hiddenRoutes = ['/auth', '/onboarding', '/splash'];
  if (hiddenRoutes.some(route => location.pathname.startsWith(route))) {
    return null;
  }

  const isHome = location.pathname === '/desktop/home' || location.pathname === '/desktop/';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/desktop/home');
  };

  return (
    <div className="fixed left-6 bottom-6 z-[9999] flex items-center">
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        title="Go to Home (/desktop/home)"
        aria-label="Go to Home"
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-2xl p-0.5 transition-all duration-300 shadow-2xl backdrop-blur-xl cursor-pointer outline-none group border",
          isHome
            ? "border-violet-400/80 bg-violet-600/30 shadow-violet-500/30"
            : "border-white/20 bg-[#0b0c16]/90 hover:border-violet-400 hover:shadow-violet-600/40"
        )}
      >
        {/* Pulsing outer aura ring */}
        <motion.span
          className="absolute -inset-1.5 rounded-2xl border border-violet-500/40"
          animate={{ scale: [0.95, 1.12, 0.95], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Glow background */}
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 opacity-20 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Inner container with Chatr Brand Logo image */}
        <div className="relative h-full w-full rounded-[14px] overflow-hidden bg-zinc-950 flex items-center justify-center p-1.5 border border-white/10">
          <img
            src={chatrLogo}
            alt="Chatr Home"
            className="w-full h-full object-contain rounded-xl drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback to /chatr-ai-logo.jpg if asset loading fails
              (e.currentTarget as HTMLImageElement).src = '/chatr-ai-logo.jpg';
            }}
          />

          {/* Mini Home Badge Overlay at bottom-right */}
          <div className="absolute bottom-1 right-1 h-5 w-5 rounded-lg bg-violet-600/90 border border-white/40 flex items-center justify-center shadow-lg backdrop-blur-md">
            <Home className="h-3 w-3 text-white" />
          </div>
        </div>

        {/* Small active indicator dot */}
        {isHome && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background shadow-[0_0_10px_#34d399]" />
        )}

        {/* Tooltip Popup Badge — Absolutely positioned to the RIGHT to prevent layout shift! */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 8, scale: 0.9 }}
              animate={{ opacity: 1, x: 16, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/20 bg-zinc-950/95 px-3 py-1.5 text-label font-bold text-white shadow-2xl backdrop-blur-xl flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
              <span>Chief of Staff Home</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import chatrLogo from '@/assets/chatr-icon-logo.png';

/**
 * Premium Glassmorphic Home FAB
 * Fixed position on the left, provides a persistent, elegant way to return to the Executive Hub.
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
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="Go to Home (/desktop/home)"
        aria-label="Go to Home"
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-2xl p-0.5 transition-all duration-300 shadow-2xl backdrop-blur-2xl cursor-pointer outline-none group",
          isHome
            ? "bg-primary/20 shadow-primary/30"
            : "bg-background/80 border border-border hover:border-primary/50 hover:shadow-primary/20 hover:-translate-y-1"
        )}
      >
        {/* Subtle glow background on hover */}
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Inner container with Chatr Brand Logo image */}
        <div className="relative h-full w-full rounded-[14px] overflow-hidden bg-card flex items-center justify-center p-2 border border-border shadow-inner transition-transform duration-300 group-hover:scale-[0.96]">
          <img
            src="/chatr-ai-logo.jpg"
            alt="Chatr Home"
            className="w-full h-full object-contain rounded-xl drop-shadow-md"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = chatrLogo;
            }}
          />

          {/* Mini Home Badge Overlay at bottom-right */}
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-xl bg-primary border-[3px] border-card flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
            <Home className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>

        {/* Small active indicator dot */}
        {isHome && (
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background shadow-[0_0_12px_#10b981]" />
        )}

        {/* Tooltip Popup Badge */}
        <div
          className={cn(
            "pointer-events-none absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl border bg-popover px-3 py-1.5 text-[11px] font-bold text-popover-foreground shadow-xl flex items-center gap-2 transition-all duration-300 origin-left",
            isHovered ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 -translate-x-2"
          )}
        >
          <Sparkles className="w-3 h-3 text-primary" />
          <span>Chief of Staff Hub</span>
        </div>
      </button>
    </div>
  );
};

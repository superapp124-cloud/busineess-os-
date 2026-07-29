import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { safeBack } from '@/lib/navigation';

/**
 * Global Keyboard & Desktop Back Navigation Listener
 * Allows users to press Escape or Alt+LeftArrow anywhere in Electron or Web to go back safely.
 */
export function useGlobalBackListener() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input, textarea, or contentEditable element
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        // If Escape is pressed in input, blur it first
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Check for Escape key or Alt + LeftArrow key
      if (e.key === 'Escape' || (e.altKey && e.key === 'ArrowLeft')) {
        // Don't navigate back if already on the main desktop chat page
        if (location.pathname === '/desktop/chat' || location.pathname === '/') {
          return;
        }
        e.preventDefault();
        safeBack(navigate, '/desktop/chat');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, location.pathname]);
}

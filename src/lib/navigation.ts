import { NavigateFunction } from 'react-router-dom';

/**
 * Safely navigates back. If history stack has no prior entry or in Electron,
 * it gracefully falls back to the default route (e.g. '/desktop/chat').
 */
export function safeBack(navigate: NavigateFunction, fallbackPath: string = '/desktop/chat') {
  try {
    if (window.history.length > 1 && window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackPath, { replace: true });
    }
  } catch {
    navigate(fallbackPath, { replace: true });
  }
}

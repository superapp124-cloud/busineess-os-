/**
 * useInstalledModules — persists installed Intent OS modules across sessions.
 * Other components can call `installModule()` to add a workspace to the sidebar.
 */
import { useState, useEffect, useCallback } from 'react';

export interface InstalledModule {
  id: string;
  name: string;
  icon: string;          // lucide icon name as string
  path: string;
  color: string;         // tailwind color token e.g. 'violet'
  installedAt: string;   // ISO date
  structure: string[];   // sub-sections e.g. ['Dashboard', 'AI Recruiter', 'Pipeline']
}

const STORAGE_KEY = 'chatr_installed_modules';

const DEFAULT_MODULES: InstalledModule[] = [];

function load(): InstalledModule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_MODULES;
  } catch {
    return DEFAULT_MODULES;
  }
}

function save(modules: InstalledModule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
}

// Global event so all components react immediately
const BUS_EVENT = 'chatr:modules:updated';

export function useInstalledModules() {
  const [modules, setModules] = useState<InstalledModule[]>(load);

  // Re-sync when another tab/component fires the event
  useEffect(() => {
    const handler = () => setModules(load());
    window.addEventListener(BUS_EVENT, handler);
    return () => window.removeEventListener(BUS_EVENT, handler);
  }, []);

  const installModule = useCallback((mod: InstalledModule) => {
    setModules(prev => {
      const exists = prev.find(m => m.id === mod.id);
      if (exists) return prev;
      const next = [...prev, mod];
      save(next);
      window.dispatchEvent(new Event(BUS_EVENT));
      return next;
    });
  }, []);

  const uninstallModule = useCallback((id: string) => {
    setModules(prev => {
      const next = prev.filter(m => m.id !== id);
      save(next);
      window.dispatchEvent(new Event(BUS_EVENT));
      return next;
    });
  }, []);

  const isInstalled = useCallback((id: string) => {
    return load().some(m => m.id === id);
  }, []);

  return { modules, installModule, uninstallModule, isInstalled };
}

/**
 * useInstalledModules — Real Supabase source of truth.
 *
 * Reads from user_capability_installs via Supabase realtime so the sidebar
 * updates instantly across all tabs/sessions when a module is installed.
 *
 * Falls back to localStorage cache for instant UI on first paint.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InstalledModule {
  id: string;           // install row UUID
  capabilityId: string; // e.g. 'recruitment-os'
  name: string;         // display name e.g. 'Recruitment'
  icon: string;         // lucide icon name
  path: string;         // workspace path
  color: string;        // tailwind color token
  structure: string[];  // sub-sections
  status: string;
  installedAt: string;
  version: string;
}

const CACHE_KEY = 'chatr_installed_modules_cache';

function fromRow(row: any): InstalledModule {
  let path = row.workspace_path;
  if (
    row.capability_id === 'hospital' ||
    row.capability_id?.toLowerCase().includes('hospital') ||
    row.capability_name?.toLowerCase().includes('hospital')
  ) {
    path = '/desktop/ai-agents?domain=hospital';
  }

  return {
    id:           row.id,
    capabilityId: row.capability_id,
    name:         row.capability_name
                    .replace(/ Agent$/, '')
                    .replace(/ OS$/, '')
                    .replace(/ Workspace$/, '')
                    .replace(/ Agency$/, ''),
    icon:         row.icon_name ?? 'Bot',
    path,
    color:        row.color ?? 'indigo',
    structure:    Array.isArray(row.structure)
                    ? row.structure
                    : (row.structure ?? []),
    status:       row.status,
    installedAt:  row.installed_at,
    version:      row.version,
  };
}

function loadCache(): InstalledModule[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCache(modules: InstalledModule[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(modules));
  } catch {}
}

export function useInstalledModules() {
  const [modules, setModules] = useState<InstalledModule[]>(loadCache);
  const [loading, setLoading] = useState(true);

  const fetchModules = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('user_capability_installs')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'installed')
      .order('installed_at', { ascending: true });

    if (error) {
      console.warn('[useInstalledModules] fetch error:', error.message);
      setLoading(false);
      return;
    }

    const mapped = (data ?? []).map(fromRow);
    setModules(mapped);
    saveCache(mapped);
    setLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => { fetchModules(); }, [fetchModules]);

  // Realtime subscription — sidebar updates instantly after deploy
  useEffect(() => {
    const channel = supabase
      .channel('user_capability_installs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_capability_installs' },
        () => { fetchModules(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchModules]);

  /** Optimistic install — adds to local state immediately, DB confirms via realtime */
  const installModule = useCallback((mod: InstalledModule) => {
    setModules(prev => {
      if (prev.find(m => m.capabilityId === mod.capabilityId)) return prev;
      const next = [...prev, mod];
      saveCache(next);
      return next;
    });
  }, []);

  /** Optimistic uninstall */
  const uninstallModule = useCallback((capabilityId: string) => {
    setModules(prev => {
      const next = prev.filter(m => m.capabilityId !== capabilityId);
      saveCache(next);
      return next;
    });
  }, []);

  const isInstalled = useCallback((capabilityId: string): boolean => {
    return modules.some(m => m.capabilityId === capabilityId && m.status === 'installed');
  }, [modules]);

  return { modules, loading, installModule, uninstallModule, isInstalled, refetch: fetchModules };
}

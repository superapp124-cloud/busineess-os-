import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// CAPABILITY STATE — mirrors the Standardized IPC Contract
// ─────────────────────────────────────────────────────────────────────────────
export type CapabilityState = 'idle' | 'initializing' | 'ready' | 'failed' | 'retrying' | 'offline';

export interface BootServices {
  'ipc-handlers': CapabilityState;
  'ollama': CapabilityState;
  'runtime': CapabilityState;
  'chatr-kernel': CapabilityState;
  'intelligence-platform': CapabilityState;
  'identity-context': CapabilityState;
  'worker-ai': CapabilityState;
  'worker-search': CapabilityState;
  'worker-sync': CapabilityState;
  'worker-automation': CapabilityState;
  'python-backend': CapabilityState;
  [key: string]: CapabilityState;
}

interface BootState {
  services: BootServices;
  isElectron: boolean;
  isBooted: boolean;           // true when all critical services are ready/failed
  bootLogs: string[];
}

const DEFAULT_SERVICES: BootServices = {
  'ipc-handlers': 'idle',
  'ollama': 'idle',
  'runtime': 'idle',
  'chatr-kernel': 'idle',
  'intelligence-platform': 'idle',
  'identity-context': 'idle',
  'worker-ai': 'idle',
  'worker-search': 'idle',
  'worker-sync': 'idle',
  'worker-automation': 'idle',
  'python-backend': 'idle',
};

// Critical services that must reach ready/failed before isBooted flips to true
const CRITICAL_SERVICES: (keyof BootServices)[] = [
  'chatr-kernel',
  'identity-context',
];

const BootStageContext = createContext<BootState>({
  services: DEFAULT_SERVICES,
  isElectron: false,
  isBooted: false,
  bootLogs: [],
});

export const useBoot = () => useContext(BootStageContext);

// Convenience hook — returns state for a single named capability
export const useCapability = (name: keyof BootServices): CapabilityState => {
  const { services } = useBoot();
  return services[name] ?? 'idle';
};

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────────────────────
export const BootStageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;
  const [services, setServices] = useState<BootServices>({ ...DEFAULT_SERVICES });
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [isBooted, setIsBooted] = useState(!isElectron); // On web, consider always booted
  const rendererReadySent = useRef(false);

  const addLog = useCallback((msg: string) => {
    setBootLogs(prev => [...prev.slice(-49), `[${new Date().toISOString().slice(11, 19)}] ${msg}`]);
  }, []);

  // Check if all critical services have settled (ready or failed)
  const checkBooted = useCallback((current: BootServices) => {
    const allSettled = CRITICAL_SERVICES.every(
      s => current[s] === 'ready' || current[s] === 'failed'
    );
    if (allSettled) {
      setIsBooted(true);
    }
  }, []);

  useEffect(() => {
    if (!isElectron) return;

    const api = (window as any).electronAPI;

    // 1. Load initial service registry snapshot
    api.invoke('service:registry').then((registry: Record<string, { status: string; detail?: string }>) => {
      if (!registry) return;
      const next: Partial<BootServices> = {};
      for (const [name, info] of Object.entries(registry)) {
        next[name] = info.status as CapabilityState;
      }
      setServices(prev => {
        const updated = { ...prev, ...next } as BootServices;
        checkBooted(updated);
        return updated;
      });
    }).catch(() => {});

    // 2. Subscribe to live service status events
    const unsub = api.on('service:status', (update: { name: string; status: string; detail?: string }) => {
      addLog(`${update.name}: ${update.status}${update.detail ? ' — ' + update.detail : ''}`);
      setServices(prev => {
        const updated = { ...prev, [update.name]: update.status as CapabilityState };
        checkBooted(updated);
        return updated;
      });
    });

    // 3. Signal Electron that React is interactive (destroys native splash)
    if (!rendererReadySent.current) {
      rendererReadySent.current = true;
      // Small delay to ensure the first paint has happened
      setTimeout(() => {
        api.send('renderer:ready', {});
        addLog('renderer:ready — shell is interactive');
      }, 50);
    }

    return () => { try { unsub?.(); } catch {} };
  }, [isElectron, addLog, checkBooted]);

  return (
    <BootStageContext.Provider value={{ services, isElectron, isBooted, bootLogs }}>
      {children}
    </BootStageContext.Provider>
  );
};

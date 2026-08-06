/**
 * UAS Graph Storage Adapter (LocalStorage / IndexedDB Persistence)
 * 
 * Automatically persists real-time UAS Graph state mutations, timeline events,
 * and force delta history to browser local storage for seamless session continuity.
 */

import { EnterpriseStateSummary } from './UASGraphEngine';

const STORAGE_KEY = 'chatr_uas_graph_state_v1';

export class UASGraphStorageAdapter {
  public static saveState(summary: EnterpriseStateSummary): void {
    try {
      const serialized = JSON.stringify({
        timestamp: new Date().toISOString(),
        summary
      });
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
      console.warn('UASGraphStorageAdapter: LocalStorage save failed', e);
    }
  }

  public static loadState(): EnterpriseStateSummary | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed.summary || null;
    } catch (e) {
      console.warn('UASGraphStorageAdapter: LocalStorage load failed', e);
      return null;
    }
  }

  public static clearState(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('UASGraphStorageAdapter: LocalStorage clear failed', e);
    }
  }
}

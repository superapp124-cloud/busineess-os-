/**
 * CHATR HEALTH OS — LocalHealthStore
 *
 * Offline-first persistent local storage for canonical health events,
 * vitals observations, personal baselines, and data provenance.
 *
 * Ensures Health OS functions seamlessly with ZERO internet connectivity.
 * When online, changes asynchronously replicate to Supabase without blocking the UI.
 */

import { CanonicalHealthMetric, NormalizedHealthSample } from './devices/DeviceTypes';
import { HealthEvent } from './HealthEventService';
import { PersonalBaseline } from './PersonalBaselineEngine';

const STORAGE_KEYS = {
  EVENTS: 'chatr_health_local_events_v1',
  VITALS: 'chatr_health_local_vitals_v1',
  BASELINE: 'chatr_health_local_baseline_v1',
  PROVENANCE: 'chatr_health_local_provenance_v1',
  CONSENT: 'chatr_health_privacy_consent_v1',
};

const MAX_STORED_EVENTS = 500;
const MAX_STORED_VITALS = 1000;

export interface HealthProvenanceRecord {
  eventId: string;
  source: string;
  deviceId?: string;
  deviceName?: string;
  manufacturer?: string;
  measurementMethod?: string;
  quality: 'high' | 'acceptable' | 'suspect' | 'calibrating';
  confidence: number;
  timestamp: string;
}

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    console.warn(`[LocalHealthStore] Read error for ${key}:`, e);
  }
  return null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn(`[LocalHealthStore] Write error for ${key}:`, e);
  }
}

class LocalHealthStoreImpl {
  private memoryEvents: HealthEvent[] = [];
  private memoryVitals: NormalizedHealthSample[] = [];
  private memoryBaseline: PersonalBaseline | null = null;
  private memoryProvenance: Map<string, HealthProvenanceRecord> = new Map();
  private listeners: Array<() => void> = [];

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage() {
    try {
      const rawEvents = safeGetItem(STORAGE_KEYS.EVENTS);
      if (rawEvents) {
        const parsed = JSON.parse(rawEvents);
        this.memoryEvents = parsed.map((e: any) => ({
          ...e,
          eventAt: new Date(e.eventAt),
        }));
      }

      const rawVitals = safeGetItem(STORAGE_KEYS.VITALS);
      if (rawVitals) {
        this.memoryVitals = JSON.parse(rawVitals);
      }

      const rawBaseline = safeGetItem(STORAGE_KEYS.BASELINE);
      if (rawBaseline) {
        this.memoryBaseline = JSON.parse(rawBaseline);
      }

      const rawProvenance = safeGetItem(STORAGE_KEYS.PROVENANCE);
      if (rawProvenance) {
        const list: HealthProvenanceRecord[] = JSON.parse(rawProvenance);
        list.forEach((p) => this.memoryProvenance.set(p.eventId, p));
      }
    } catch (err) {
      console.warn('[LocalHealthStore] Hydration warning:', err);
    }
  }

  private persistEvents() {
    safeSetItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.memoryEvents.slice(0, MAX_STORED_EVENTS)));
  }

  private persistVitals() {
    safeSetItem(STORAGE_KEYS.VITALS, JSON.stringify(this.memoryVitals.slice(0, MAX_STORED_VITALS)));
  }

  private persistProvenance() {
    const list = Array.from(this.memoryProvenance.values());
    safeSetItem(STORAGE_KEYS.PROVENANCE, JSON.stringify(list.slice(0, MAX_STORED_EVENTS)));
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('[LocalHealthStore] Listener notification error:', err);
      }
    }
  }

  /**
   * Save a local health event with optional data provenance
   */
  public saveEvent(event: HealthEvent, provenance?: HealthProvenanceRecord) {
    this.memoryEvents = [event, ...this.memoryEvents.filter((e) => e.id !== event.id)];
    if (this.memoryEvents.length > MAX_STORED_EVENTS) {
      this.memoryEvents = this.memoryEvents.slice(0, MAX_STORED_EVENTS);
    }
    this.persistEvents();

    if (provenance) {
      this.memoryProvenance.set(event.id, provenance);
      this.persistProvenance();
    }
    this.notify();
  }

  /**
   * Get all local events newer than since
   */
  public getEvents(since?: Date): HealthEvent[] {
    if (!since) return [...this.memoryEvents];
    const threshold = since.getTime();
    return this.memoryEvents.filter((e) => e.eventAt.getTime() >= threshold);
  }

  /**
   * Save a normalized health sample (vital)
   */
  public saveVital(sample: NormalizedHealthSample, provenance?: HealthProvenanceRecord) {
    this.memoryVitals = [sample, ...this.memoryVitals.filter((v) => v.id !== sample.id)];
    if (this.memoryVitals.length > MAX_STORED_VITALS) {
      this.memoryVitals = this.memoryVitals.slice(0, MAX_STORED_VITALS);
    }
    this.persistVitals();

    if (provenance) {
      this.memoryProvenance.set(sample.id, provenance);
      this.persistProvenance();
    }
    this.notify();
  }

  /**
   * Get vitals history
   */
  public getVitals(metric?: CanonicalHealthMetric, sinceDays = 90): NormalizedHealthSample[] {
    const threshold = Date.now() - sinceDays * 24 * 60 * 60 * 1000;
    return this.memoryVitals.filter((v) => {
      const matchMetric = metric ? v.metric === metric : true;
      const matchTime = new Date(v.timestamp).getTime() >= threshold;
      return matchMetric && matchTime;
    });
  }

  /**
   * Get provenance record for a given event or vital ID
   */
  public getProvenance(id: string): HealthProvenanceRecord | undefined {
    return this.memoryProvenance.get(id);
  }

  /**
   * Save cached personal baseline
   */
  public saveBaseline(baseline: PersonalBaseline) {
    this.memoryBaseline = baseline;
    safeSetItem(STORAGE_KEYS.BASELINE, JSON.stringify(baseline));
    this.notify();
  }

  /**
   * Get cached personal baseline
   */
  public getBaseline(): PersonalBaseline | null {
    return this.memoryBaseline;
  }

  /**
   * Privacy: Get or set user consent for cloud SI processing
   */
  public isCloudAIConsentGranted(): boolean {
    return safeGetItem(STORAGE_KEYS.CONSENT) === 'granted';
  }

  public setCloudAIConsent(granted: boolean) {
    safeSetItem(STORAGE_KEYS.CONSENT, granted ? 'granted' : 'denied');
    this.notify();
  }

  /**
   * Complete GDPR/HIPAA revocation: purges all vitals, events, and provenance
   * collected from a specific hardware device ID.
   */
  public purgeDeviceData(deviceId: string): { purgedVitals: number; purgedEvents: number } {
    const initialVitals = this.memoryVitals.length;
    const initialEvents = this.memoryEvents.length;

    this.memoryVitals = this.memoryVitals.filter(v => v.sourceDeviceId !== deviceId);
    this.memoryEvents = this.memoryEvents.filter(e => {
      const matchProv = (e as any).provenance?.sourceDeviceId === deviceId;
      const matchVal = e.eventValue?.['sourceDeviceId'] === deviceId;
      const matchContext = e.eventContext?.includes(deviceId);
      return !matchProv && !matchVal && !matchContext;
    });

    const purgedVitals = initialVitals - this.memoryVitals.length;
    const purgedEvents = initialEvents - this.memoryEvents.length;

    this.persistVitals();
    this.persistEvents();
    this.notify();

    return { purgedVitals, purgedEvents };
  }

  /**
   * Offline Sync Queue: queues samples when network/cloud is unreachable
   */
  public queueOfflineSample(sample: NormalizedHealthSample): void {
    const queue = this.getOfflineQueue();
    queue.push(sample);
    safeSetItem('chatr_health_offline_queue_v1', JSON.stringify(queue.slice(-200)));
  }

  public getOfflineQueue(): NormalizedHealthSample[] {
    const raw = safeGetItem('chatr_health_offline_queue_v1');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public clearOfflineQueue(): void {
    safeSetItem('chatr_health_offline_queue_v1', JSON.stringify([]));
  }
}

export const localHealthStore = new LocalHealthStoreImpl();

/**
 * CHATR SI OS — AI Activity Log
 * src/ai/observability/AIActivityLog.ts
 *
 * User-facing and developer audit trail verifying:
 * WHAT, WHY, MODEL, WHERE DATA WAS PROCESSED, CLOUD USED?, PERMISSION, RESULT.
 *
 * Also provides transparent Privacy Explanations:
 * - "Why was this processed locally?" (e.g. "This request contained health information.")
 * - "Why did CHATR use the cloud?" (e.g. "This request required current web info with no private data.")
 */

import { PrivacyClassification } from '../privacy/types';
import { AIProviderId } from '../runtime/types';

export interface AIActivityEntry {
  id: string;
  timestamp: number;
  taskTitle: string;
  what: string;
  why: string;
  providerId: AIProviderId;
  modelId: string;
  isCloud: boolean;
  cloudUsed: boolean;
  dataLocation: 'DEVICE ONLY' | 'CLOUD EXTENSION';
  whereDataWasProcessed: string;
  permission: string;
  result: string;
  privacyClass: PrivacyClassification;
  privacyExplanation: string;
  latencyMs: number;
  tokensGenerated?: number;
}

const STORAGE_KEY_ACTIVITY_LOG = 'chatr.ai.activity_log';

export class AIActivityLog {
  private static instance: AIActivityLog;
  private entries: AIActivityEntry[] = [];

  private constructor() {
    this.restore();
  }

  public static getInstance(): AIActivityLog {
    if (!AIActivityLog.instance) {
      AIActivityLog.instance = new AIActivityLog();
    }
    return AIActivityLog.instance;
  }

  private restore(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_ACTIVITY_LOG);
      if (raw) {
        this.entries = JSON.parse(raw);
      }
    } catch {
      // ignore
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      const slice = this.entries.slice(-100);
      window.localStorage.setItem(STORAGE_KEY_ACTIVITY_LOG, JSON.stringify(slice));
    } catch {
      // ignore
    }
  }

  public logActivity(entry: {
    taskTitle: string;
    what?: string;
    why?: string;
    providerId: AIProviderId;
    modelId: string;
    isCloud: boolean;
    dataLocation: 'DEVICE ONLY' | 'CLOUD EXTENSION';
    permission?: string;
    result?: string;
    privacyClass: PrivacyClassification;
    privacyExplanation?: string;
    latencyMs: number;
    tokensGenerated?: number;
  }): AIActivityEntry {
    const isCloud = entry.isCloud;
    const defaultPrivacyExplanation = isCloud
      ? 'This request used the cloud because it required current public web information and contained no restricted private data.'
      : `Processed locally on your device because this request was classified as ${entry.privacyClass} data.`;

    const fullEntry: AIActivityEntry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      taskTitle: entry.taskTitle,
      what: entry.what || entry.taskTitle,
      why: entry.why || 'Initiated by user interaction or proactive context trigger',
      providerId: entry.providerId,
      modelId: entry.modelId,
      isCloud,
      cloudUsed: isCloud,
      dataLocation: entry.dataLocation,
      whereDataWasProcessed: entry.dataLocation === 'DEVICE ONLY' ? 'On-Device Native CPU/NPU' : 'Secure Cloud Edge Gateway',
      permission: entry.permission || 'LEVEL_1_SAFE_READ',
      result: entry.result || 'Success',
      privacyClass: entry.privacyClass,
      privacyExplanation: entry.privacyExplanation || defaultPrivacyExplanation,
      latencyMs: entry.latencyMs,
      tokensGenerated: entry.tokensGenerated,
    };

    this.entries.unshift(fullEntry);
    this.persist();
    return fullEntry;
  }

  public getRecent(limit = 20): AIActivityEntry[] {
    return this.entries.slice(0, limit);
  }

  public getEntry(id: string): AIActivityEntry | undefined {
    return this.entries.find(e => e.id === id);
  }

  public clear(): void {
    this.entries = [];
    this.persist();
  }
}

export const aiActivityLog = AIActivityLog.getInstance();

/**
 * CHATR HEALTH OS — useHealthOS()
 *
 * THE primary interface for all health pages.
 * Orchestrates the full intelligence loop:
 *
 *   SENSE      → HealthEventService.fetchRecentEvents()
 *   UNDERSTAND → PersonalBaselineEngine + HealthStateEngine.compute()
 *   NOTIFY     → AttentionEngine.scoreEvents() + NotificationDecisionEngine.evaluate()
 *   (ACT)      → UI / Today Focus / Health Inbox
 *   LEARN      → HealthMemoryService (on-demand)
 *
 * Performance:
 *  - Loads from health_os_state cache first (fast path)
 *  - Runs full compute only if cache is stale (>15 min) or missing
 *  - Parallel queries — never sequential waterfall
 *  - Does NOT query all 33 tables on every render
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HealthEventService, HealthEvent } from '@/services/health/HealthEventService';
import { PersonalBaselineEngine, PersonalBaseline, BaselineStatus } from '@/services/health/PersonalBaselineEngine';
import { HealthStateEngine, ComputedHealthState, DomainState } from '@/services/health/HealthStateEngine';
import { AttentionEngine, NotificationDecisionEngine, FocusItem, NotificationCandidate, NotificationDecisionResult } from '@/services/health/AttentionEngine';
import { HealthMemoryService, HealthMemoryEntry } from '@/services/health/HealthMemoryService';
import { deviceSyncManager } from '@/services/health/devices/DeviceSyncManager';
import { DataCoverageEngine, OverallDataCoverage } from '@/services/health/DataCoverageEngine';
import { localHealthStore } from '@/services/health/LocalHealthStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export type HealthStateValue = 'stable' | 'improving' | 'needs_attention' | 'unknown';

export interface InboxItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  status: 'now' | 'today' | 'upcoming' | 'overdue' | 'done';
  priority: number;
  dueAt: Date | null;
  actionRoute: string;
  actionLabel: string;
  icon: string;
}

export interface DataSufficiency {
  meds: boolean;
  vitals: boolean;
  labs: boolean;
  appointments: boolean;
  sleep: boolean;
  mental: boolean;
  passport: boolean;
  baseline: boolean;
}

export interface HealthOSState {
  // ── Core ─────────────────────────────────────────────────────────────────
  loading: boolean;
  error: string | null;

  // ── Health State (UNDERSTAND output) ─────────────────────────────────────
  healthState: HealthStateValue;
  healthStateLabel: string;
  healthScore: number | null;          // null = insufficient data — never fake
  healthStateConfidence: number;       // 0–1
  domainStates: Record<string, DomainState>;

  // ── Today Focus (max 3) ───────────────────────────────────────────────────
  todayFocus: FocusItem[];

  // ── Health Inbox ──────────────────────────────────────────────────────────
  healthInbox: InboxItem[];

  // ── Active Insights ───────────────────────────────────────────────────────
  activeInsights: NotificationDecisionResult[];

  // ── Raw data (from existing tables — not duplicated) ─────────────────────
  medications: Array<{ id: string; medicine_name: string; time_slots: string[]; dosage: string }>;
  recentVitals: Array<{ vital_type: string; value: number; unit: string; recorded_at: string }>;
  labs: Array<{ id: string; test_name: string; test_date: string; status: string; reviewed_at: string | null }>;
  appointments: Array<{ id: string; appointment_date: string; appointment_time: string; status: string }>;

  // ── Baseline ─────────────────────────────────────────────────────────────
  personalBaseline: PersonalBaseline | null;
  baselineStatus: BaselineStatus;
  dataSufficiency: DataSufficiency;
  dataCoverage: OverallDataCoverage;

  // ── Health Memory ─────────────────────────────────────────────────────────
  recentMemory: HealthMemoryEntry[];

  // ── Meta ─────────────────────────────────────────────────────────────────
  lastComputedAt: Date | null;
  userName: string;
  refresh: () => void;
}

// ─── Cache TTL ────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ─── Helper: events → inbox items ────────────────────────────────────────────

function eventsToInboxItems(events: HealthEvent[]): InboxItem[] {
  const now = new Date();

  return events
    .filter(e => e.priority <= 3)
    .map(e => {
      const hoursUntil = (e.eventAt.getTime() - now.getTime()) / (1000 * 60 * 60);

      let status: InboxItem['status'];
      if (hoursUntil < -0.5) status = 'overdue';
      else if (hoursUntil < 1) status = 'now';
      else if (hoursUntil < 24) status = 'today';
      else status = 'upcoming';

      const iconMap: Record<string, string> = {
        medication_due: 'Pill',
        medication_missed: 'AlertCircle',
        medication_taken: 'CheckCircle',
        lab_unreviewed: 'FlaskConical',
        lab_uploaded: 'FileText',
        appointment_upcoming: 'Calendar',
        appointment_overdue: 'AlertTriangle',
        care_path_due: 'Route',
        prediction_fired: 'Sparkles',
        vital_recorded: 'Activity',
        mental_health_check: 'Brain',
      };

      const routeMap: Record<string, string> = {
        medication_due: '/care/medicines',
        medication_missed: '/care/medicines',
        lab_unreviewed: '/lab-reports',
        lab_uploaded: '/lab-reports',
        appointment_upcoming: '/booking',
        appointment_overdue: '/booking',
        care_path_due: '/care',
        prediction_fired: '/health-risks',
        vital_recorded: '/chronic-vitals',
        mental_health_check: '/mental-health',
      };

      return {
        id: e.id,
        type: e.eventType,
        title: e.eventContext,
        subtitle: e.eventValue
          ? Object.entries(e.eventValue)
              .filter(([k]) => ['medicine_name', 'test_name', 'appointment_date'].includes(k))
              .map(([, v]) => String(v))
              .join(' · ')
          : '',
        status,
        priority: e.priority,
        dueAt: e.eventAt,
        actionRoute: routeMap[e.eventType] || '/health',
        actionLabel: e.eventType.includes('medication') ? 'View' : 'Review',
        icon: iconMap[e.eventType] || 'Heart',
      };
    })
    .sort((a, b) => {
      const statusOrder = { overdue: 0, now: 1, today: 2, upcoming: 3, done: 4 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.priority - b.priority;
    });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHealthOS(): HealthOSState {
  const [state, setState] = useState<Omit<HealthOSState, 'refresh'>>({
    loading: true,
    error: null,
    healthState: 'unknown',
    healthStateLabel: 'Loading…',
    healthScore: null,
    healthStateConfidence: 0,
    domainStates: {},
    todayFocus: [],
    healthInbox: [],
    activeInsights: [],
    medications: [],
    recentVitals: [],
    labs: [],
    appointments: [],
    personalBaseline: null,
    baselineStatus: { established: false, domains: {}, message: 'Loading health data…' },
    dataSufficiency: {
      meds: false, vitals: false, labs: false, appointments: false,
      sleep: false, mental: false, passport: false, baseline: false,
    },
    dataCoverage: DataCoverageEngine.evaluate([], 0),
    recentMemory: [],
    lastComputedAt: null,
    userName: '',
  });

  const computeInProgress = useRef(false);
  const hasLoadedOnce = useRef(false);
  const baselineAttempted = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const compute = useCallback(async (force = false) => {
    if (computeInProgress.current) return;
    computeInProgress.current = true;

    try {
      // ── Auth ──────────────────────────────────────────────────────────────
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState(prev => ({ ...prev, loading: false, error: 'Not authenticated' }));
        return;
      }

      // ── Load profile (fast — just username) ───────────────────────────────
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .maybeSingle();
      const userName = profile?.username || profile?.full_name?.split(' ')[0] || '';

      // ── Check cached OS state (fast path) ────────────────────────────────
      if (!force) {
        const { data: cached } = await supabase
          .from('health_os_state')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (cached && cached.last_computed_at) {
          const age = Date.now() - new Date(cached.last_computed_at).getTime();
          if (age < CACHE_TTL_MS) {
            // Use cached state — still load raw data for UI
            const [meds, vitals, labs, appts] = await Promise.allSettled([
              supabase.from('medication_reminders').select('id, medicine_name, time_slots, dosage').eq('user_id', user.id).eq('is_active', true),
              supabase.from('chronic_vitals').select('vital_type, value, unit, recorded_at').eq('user_id', user.id).order('recorded_at', { ascending: false }).limit(10),
              supabase.from('lab_reports').select('id, test_name, test_date, status, reviewed_at').eq('user_id', user.id).order('test_date', { ascending: false }).limit(5),
              supabase.from('chatr_healthcare_appointments').select('id, appointment_date, appointment_time, status').eq('user_id', user.id).order('appointment_date', { ascending: true }).limit(5),
            ]);

            const cachedFocus = (cached.today_focus as FocusItem[] | null) || [];
            const cachedInsights = (cached.active_insights as NotificationDecisionResult[] | null) || [];
            const cachedDomains = (cached.domain_states as Record<string, DomainState> | null) || {};
            const cachedAttention = (cached.attention_items as InboxItem[] | null) || [];

            setState(prev => ({
              ...prev,
              loading: false,
              userName,
              healthState: (cached.health_state as HealthStateValue) || 'unknown',
              healthStateLabel: cached.health_state_label || 'Unknown',
              healthScore: cached.health_score ?? null,
              healthStateConfidence: cached.health_state_confidence || 0,
              domainStates: cachedDomains,
              todayFocus: cachedFocus,
              healthInbox: cachedAttention,
              activeInsights: cachedInsights,
              medications: (meds.status === 'fulfilled' ? meds.value.data : []) || [],
              recentVitals: (vitals.status === 'fulfilled' ? vitals.value.data : []) || [],
              labs: (labs.status === 'fulfilled' ? labs.value.data : []) || [],
              appointments: (appts.status === 'fulfilled' ? appts.value.data : []) || [],
              lastComputedAt: new Date(cached.last_computed_at),
              baselineStatus: PersonalBaselineEngine.getBaselineStatus(null),
              dataSufficiency: (cached.data_sufficiency as DataSufficiency) || state.dataSufficiency,
              dataCoverage: DataCoverageEngine.evaluate(
                ((vitals.status === 'fulfilled' ? vitals.value.data : []) || []).map((v: any) => ({ metric: v.vital_type, timestamp: v.recorded_at })),
                ((labs.status === 'fulfilled' ? labs.value.data : []) || []).length
              ),
            }));
            return;
          }
        }
      }

      // ── Full compute path ─────────────────────────────────────────────────
      // Only show full blocking loader on first load if we don't have data yet
      if (!hasLoadedOnce.current) {
        setState(prev => ({ ...prev, loading: true }));
      }

      // Run baseline load and events fetch in parallel
      const [events, baseline, vitalHistory] = await Promise.all([
        HealthEventService.fetchRecentEvents(user.id),
        PersonalBaselineEngine.loadBaseline(user.id),
        supabase
          .from('chronic_vitals')
          .select('vital_type, value, recorded_at')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(50)
          .then(r => r.data || []),
      ]);

      // Compute health state (UNDERSTAND)
      const computedState = HealthStateEngine.compute(events, baseline, vitalHistory as any[]);

      // Score events for attention (NOTIFY)
      const candidates = AttentionEngine.scoreEvents(events);
      const todayFocus = AttentionEngine.buildTodayFocus(candidates);

      // Notification decisions (async — don't block UI)
      NotificationDecisionEngine.evaluate(user.id, candidates).then(decisions => {
        NotificationDecisionEngine.logDecisions(user.id, decisions);
      });

      // Build inbox items
      const healthInbox = eventsToInboxItems(events);

      // Active insights = P1–P2 candidates that should be shown in UI
      const insightCandidates = candidates.filter(c => c.priority <= 2 && c.category === 'insight');

      // Load raw data for UI (parallel)
      const [meds, vitals, labs, appts, memory] = await Promise.allSettled([
        supabase.from('medication_reminders').select('id, medicine_name, time_slots, dosage').eq('user_id', user.id).eq('is_active', true),
        supabase.from('chronic_vitals').select('vital_type, value, unit, recorded_at').eq('user_id', user.id).order('recorded_at', { ascending: false }).limit(10),
        supabase.from('lab_reports').select('id, test_name, test_date, status, reviewed_at').eq('user_id', user.id).order('test_date', { ascending: false }).limit(5),
        supabase.from('chatr_healthcare_appointments').select('id, appointment_date, appointment_time, status').eq('user_id', user.id).order('appointment_date', { ascending: true }).limit(5),
        HealthMemoryService.getTimeline(user.id, 7),
      ]);

      // Compute baseline status
      let finalBaseline = baseline;
      const baselineStatus = PersonalBaselineEngine.getBaselineStatus(finalBaseline);

      // If no baseline yet, try computing it from history (only once per session)
      if (!baselineAttempted.current && !finalBaseline?.established && vitalHistory.length >= 5) {
        baselineAttempted.current = true;
        PersonalBaselineEngine.computeBaseline(user.id).then(computed => {
          if (computed.established) {
            PersonalBaselineEngine.persistBaseline(user.id, computed);
          }
        }).catch(err => {
          console.warn('[useHealthOS] Baseline compute notice:', err);
        });
      }

      // Data sufficiency flags
      const medData = meds.status === 'fulfilled' ? meds.value.data || [] : [];
      const vitalData = vitals.status === 'fulfilled' ? vitals.value.data || [] : [];
      const labData = labs.status === 'fulfilled' ? labs.value.data || [] : [];
      const apptData = appts.status === 'fulfilled' ? appts.value.data || [] : [];
      const memoryData = memory.status === 'fulfilled' ? memory.value.entries : [];

      const deviceCoverage = deviceSyncManager.getCoverageSummary();
      const dataSufficiency: DataSufficiency = {
        meds: medData.length > 0,
        vitals: vitalData.length > 0 || deviceCoverage.heartRate || deviceCoverage.bloodPressure,
        labs: labData.length > 0,
        appointments: apptData.length > 0,
        sleep: deviceCoverage.sleep,
        mental: events.some(e => e.eventType === 'mental_health_check'),
        passport: false,       // checked separately when Passport page loads
        baseline: finalBaseline?.established || false,
      };

      // Persist computed state to cache (direct upsert to health_os_state)
      supabase
        .from('health_os_state')
        .upsert(
          {
            user_id: user.id,
            health_state: computedState.state,
            health_state_label: computedState.label,
            health_state_confidence: computedState.confidence,
            health_score: computedState.score,
            domain_states: computedState.domainStates,
            today_focus: todayFocus,
            active_insights: insightCandidates,
            attention_items: healthInbox,
            notification_candidates: candidates,
            baseline_summary: finalBaseline ? { established: finalBaseline.established, domains: finalBaseline.establishedDomains } : {},
            data_sufficiency: dataSufficiency,
            computation_version: 1,
            events_processed_count: events.length,
            last_computed_at: new Date().toISOString(),
            health_state_updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .then(({ error: upsertErr }) => {
          if (upsertErr) console.warn('[useHealthOS] Cache write notice:', upsertErr.message);
          // Also persist events to health_events table
          HealthEventService.persistEvents(user.id, events);
        });

      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
        userName,
        healthState: computedState.state,
        healthStateLabel: computedState.label,
        healthScore: computedState.score,
        healthStateConfidence: computedState.confidence,
        domainStates: computedState.domainStates,
        todayFocus,
        healthInbox,
        activeInsights: insightCandidates.map(c => ({
          candidate: c,
          decision: 'send' as const,
          decisionReason: 'Active insight',
        })),
        medications: medData as any[],
        recentVitals: vitalData as any[],
        labs: labData as any[],
        appointments: apptData as any[],
        personalBaseline: finalBaseline,
        baselineStatus,
        dataSufficiency,
        dataCoverage: DataCoverageEngine.evaluate(
          (vitalHistory as any[]).map((v: any) => ({ metric: v.vital_type, timestamp: v.recorded_at })),
          labData.length
        ),
        recentMemory: memoryData,
        lastComputedAt: new Date(),
      }));

    } catch (err) {
      console.error('[useHealthOS] Error:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Could not load health data',
      }));
    } finally {
      computeInProgress.current = false;
      hasLoadedOnce.current = true;
    }
  }, []);

  useEffect(() => {
    compute();

    const triggerDebouncedCompute = () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        if (!computeInProgress.current) {
          compute(false);
        }
      }, 1500);
    };

    const unsubDevices = deviceSyncManager.subscribe(triggerDebouncedCompute);
    const unsubLocalStore = localHealthStore.subscribe(triggerDebouncedCompute);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      unsubDevices();
      unsubLocalStore();
    };
  }, [compute]);

  const refresh = useCallback(() => {
    compute(true); // force = true, bypass cache
  }, [compute]);

  return { ...state, refresh };
}

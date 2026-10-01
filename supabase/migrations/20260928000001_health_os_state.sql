-- ============================================================
-- CHATR HEALTH OS — Orchestration Layer Schema
-- Migration: 20260928000001_health_os_state.sql
--
-- IMPORTANT: This migration creates ONLY 3 new tables.
-- All 33+ existing health tables remain UNCHANGED.
-- These new tables are the orchestration/intelligence layer —
-- they are computed caches and event indexes, NOT clinical records.
-- The existing tables remain the authoritative source of truth.
-- ============================================================

-- ------------------------------------------------------------
-- TABLE 1: health_os_state
-- Computed, materialized state cache.
-- Updated by the Health Intelligence loop, not by raw user input.
-- healthScore is NULL when insufficient data exists — never fake.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.health_os_state (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Computed overall state
  -- 'stable' | 'improving' | 'needs_attention' | 'unknown'
  health_state             text NOT NULL DEFAULT 'unknown',
  health_state_label       text,
  health_state_confidence  float NOT NULL DEFAULT 0,  -- 0.0 = no data, 1.0 = high confidence
  -- NULL means insufficient data — we never show a fake number
  health_score             integer,
  health_state_updated_at  timestamptz NOT NULL DEFAULT now(),

  -- Per-domain states (only populated where data actually exists)
  -- Keys: heart, bp, sleep, activity, weight, glucose, hydration, recovery, medications, mental
  -- Each: { state: string, label: string, confidence: number, observation: string,
  --         supporting_data: string[], time_period: string }
  domain_states            jsonb NOT NULL DEFAULT '{}',

  -- Today Focus items (max 3, ordered by priority)
  -- Each: { id, type, title, description, icon, priority, action, source_table, source_id }
  today_focus              jsonb NOT NULL DEFAULT '[]',

  -- Active insights (max 2, must be evidence-backed)
  -- Each: { id, observation, source, data_used, baseline, confidence,
  --         interpretation, recommended_action, why_explanation }
  active_insights          jsonb NOT NULL DEFAULT '[]',

  -- Items requiring user attention (Health Inbox source)
  -- Each: { id, type, title, subtitle, status, priority, due_at, action_route, source_table, source_id }
  attention_items          jsonb NOT NULL DEFAULT '[]',

  -- Notification candidates evaluated by the Decision Engine
  -- Each: { id, category, priority, title, body, evidence, dedupe_key,
  --         decision, decision_reason, cooldown_hours, optimal_time }
  notification_candidates  jsonb NOT NULL DEFAULT '[]',

  -- Baseline summary (cached from user_health_profiles baseline JSON)
  baseline_summary         jsonb NOT NULL DEFAULT '{}',

  -- AI insight cache — avoid calling edge function on every render
  last_ai_insight          text,
  last_ai_insight_at       timestamptz,

  -- Data sufficiency flags — tells UI which domains have enough data
  -- Keys: meds, vitals, labs, appointments, sleep, activity, mental, passport
  data_sufficiency         jsonb NOT NULL DEFAULT '{}',

  -- Computation metadata
  last_computed_at         timestamptz NOT NULL DEFAULT now(),
  computation_version      integer NOT NULL DEFAULT 1,
  events_processed_count   integer NOT NULL DEFAULT 0,

  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),

  UNIQUE(user_id)
);

ALTER TABLE public.health_os_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their health OS state"
  ON public.health_os_state
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_health_os_state_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER health_os_state_updated_at
  BEFORE UPDATE ON public.health_os_state
  FOR EACH ROW
  EXECUTE FUNCTION public.set_health_os_state_updated_at();

-- ------------------------------------------------------------
-- TABLE 2: health_events
-- Normalized event layer. Each row is a REFERENCE to an existing
-- health record — it does NOT duplicate the raw data.
-- source_table + source_record_id point back to the original row.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.health_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event classification
  -- vital_recorded | medication_taken | medication_missed | medication_due
  -- lab_uploaded | lab_unreviewed | appointment_booked | appointment_upcoming
  -- appointment_overdue | symptom_check | care_path_action | care_path_due
  -- insight_generated | prediction_fired | streak_milestone | manual_entry
  -- mental_health_check | prescription_uploaded | consultation_completed
  event_type       text NOT NULL,

  -- Reference to original record (no duplication of raw data)
  source_table     text,
  source_record_id uuid,

  -- Normalized event payload (summary only — not full raw record)
  -- Example: { value: 120, unit: 'mmHg', type: 'systolic' }
  event_value      jsonb,
  event_context    text,
  event_at         timestamptz NOT NULL DEFAULT now(),

  -- Intelligence metadata
  confidence       float NOT NULL DEFAULT 1.0,
  -- P0=urgent/safety P1=important P2=action_required P3=insight P4=wellness P5=info
  priority         integer NOT NULL DEFAULT 3,
  is_anomaly       boolean NOT NULL DEFAULT false,
  -- Deviation from personal baseline; null if no baseline established yet
  baseline_delta   float,
  anomaly_reason   text,

  -- Processing state (for the Intelligence loop)
  processed        boolean NOT NULL DEFAULT false,
  processed_at     timestamptz,

  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_health_events_user_time
  ON public.health_events(user_id, event_at DESC);
CREATE INDEX idx_health_events_type
  ON public.health_events(user_id, event_type);
CREATE INDEX idx_health_events_unprocessed
  ON public.health_events(user_id, processed)
  WHERE processed = false;
CREATE INDEX idx_health_events_priority
  ON public.health_events(user_id, priority, event_at DESC);

ALTER TABLE public.health_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their health events"
  ON public.health_events
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- TABLE 3: health_notification_log
-- Tracks every notification candidate through the Decision Engine.
-- Used for fatigue analysis, deduplication, and outcome learning.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.health_notification_log (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  health_event_id     uuid REFERENCES public.health_events(id) ON DELETE SET NULL,

  -- Notification content
  -- medication | vital | lab | appointment | insight | wellness | care_path | safety
  category            text NOT NULL,
  priority            integer NOT NULL,  -- P0–P5
  title               text NOT NULL,
  body                text,

  -- Evidence and reasoning
  reason              text,           -- why this notification was generated
  evidence            jsonb,          -- references to supporting data records
  recommended_action  text,           -- what the user should do
  why_explanation     text,           -- for the "Why am I seeing this?" feature

  -- Scheduling
  optimal_time        timestamptz,
  expires_at          timestamptz,
  dedupe_key          text NOT NULL,  -- prevents duplicate notifications
  cooldown_hours      integer NOT NULL DEFAULT 24,

  -- Decision Engine outcome
  -- 'send' | 'delay' | 'bundle' | 'suppress'
  decision            text NOT NULL DEFAULT 'send',
  decision_reason     text,

  -- User response tracking (fatigue signals)
  delivered_at        timestamptz,
  opened_at           timestamptz,
  dismissed_at        timestamptz,
  snoozed_at          timestamptz,
  snoozed_until       timestamptz,
  action_taken_at     timestamptz,
  action_completed_at timestamptz,
  -- Number of times user ignored this category without action
  ignored_count       integer NOT NULL DEFAULT 0,

  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_health_notif_user_time
  ON public.health_notification_log(user_id, created_at DESC);
CREATE INDEX idx_health_notif_dedupe
  ON public.health_notification_log(user_id, dedupe_key, created_at DESC);
CREATE INDEX idx_health_notif_category_fatigue
  ON public.health_notification_log(user_id, category, ignored_count);
CREATE INDEX idx_health_notif_undelivered
  ON public.health_notification_log(user_id, decision, delivered_at)
  WHERE delivered_at IS NULL AND decision = 'send';

ALTER TABLE public.health_notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their notification log"
  ON public.health_notification_log
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- HELPER FUNCTIONS
-- ------------------------------------------------------------

-- Upsert health_os_state (called by the Health Intelligence loop)
CREATE OR REPLACE FUNCTION public.upsert_health_os_state(
  p_user_id uuid,
  p_health_state text,
  p_health_state_label text,
  p_health_state_confidence float,
  p_health_score integer,
  p_domain_states jsonb,
  p_today_focus jsonb,
  p_active_insights jsonb,
  p_attention_items jsonb,
  p_notification_candidates jsonb,
  p_baseline_summary jsonb,
  p_data_sufficiency jsonb,
  p_computation_version integer,
  p_events_processed_count integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.health_os_state (
    user_id, health_state, health_state_label, health_state_confidence,
    health_score, domain_states, today_focus, active_insights,
    attention_items, notification_candidates, baseline_summary,
    data_sufficiency, last_computed_at, computation_version,
    events_processed_count, health_state_updated_at
  )
  VALUES (
    p_user_id, p_health_state, p_health_state_label, p_health_state_confidence,
    p_health_score, p_domain_states, p_today_focus, p_active_insights,
    p_attention_items, p_notification_candidates, p_baseline_summary,
    p_data_sufficiency, now(), p_computation_version,
    p_events_processed_count, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    health_state             = EXCLUDED.health_state,
    health_state_label       = EXCLUDED.health_state_label,
    health_state_confidence  = EXCLUDED.health_state_confidence,
    health_score             = EXCLUDED.health_score,
    domain_states            = EXCLUDED.domain_states,
    today_focus              = EXCLUDED.today_focus,
    active_insights          = EXCLUDED.active_insights,
    attention_items          = EXCLUDED.attention_items,
    notification_candidates  = EXCLUDED.notification_candidates,
    baseline_summary         = EXCLUDED.baseline_summary,
    data_sufficiency         = EXCLUDED.data_sufficiency,
    last_computed_at         = now(),
    computation_version      = EXCLUDED.computation_version,
    events_processed_count   = EXCLUDED.events_processed_count,
    health_state_updated_at  = now();
END;
$$;

-- Get fatigue score for a notification category
CREATE OR REPLACE FUNCTION public.get_notification_fatigue_score(
  p_user_id uuid,
  p_category text,
  p_lookback_days integer DEFAULT 30
)
RETURNS float
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total integer;
  v_ignored integer;
BEGIN
  SELECT
    COUNT(*),
    SUM(ignored_count)
  INTO v_total, v_ignored
  FROM public.health_notification_log
  WHERE user_id = p_user_id
    AND category = p_category
    AND created_at > now() - (p_lookback_days || ' days')::interval;

  IF v_total = 0 THEN RETURN 0; END IF;
  RETURN LEAST(1.0, COALESCE(v_ignored, 0)::float / v_total);
END;
$$;

-- ============================================================
-- CHATR HEALTH OS — Run these chunks ONE AT A TIME in the
-- Supabase SQL Editor.
-- Copy each chunk between the ===CHUNK=== markers separately.
-- ============================================================

-- ===CHUNK 1: health_os_state table===
CREATE TABLE IF NOT EXISTS public.health_os_state (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  health_state             text NOT NULL DEFAULT 'unknown',
  health_state_label       text,
  health_state_confidence  float NOT NULL DEFAULT 0,
  health_score             integer,
  health_state_updated_at  timestamptz NOT NULL DEFAULT now(),
  domain_states            jsonb NOT NULL DEFAULT '{}',
  today_focus              jsonb NOT NULL DEFAULT '[]',
  active_insights          jsonb NOT NULL DEFAULT '[]',
  attention_items          jsonb NOT NULL DEFAULT '[]',
  notification_candidates  jsonb NOT NULL DEFAULT '[]',
  baseline_summary         jsonb NOT NULL DEFAULT '{}',
  last_ai_insight          text,
  last_ai_insight_at       timestamptz,
  data_sufficiency         jsonb NOT NULL DEFAULT '{}',
  last_computed_at         timestamptz NOT NULL DEFAULT now(),
  computation_version      integer NOT NULL DEFAULT 1,
  events_processed_count   integer NOT NULL DEFAULT 0,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
)

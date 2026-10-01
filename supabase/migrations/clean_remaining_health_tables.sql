-- ====================================================================
-- CHATR HEALTH OS — REMAINING SUPPORTING TABLES
-- Copy and paste this ENTIRE block into Supabase SQL Editor and click Run.
-- NO custom functions, NO procedural blocks, NO syntax risks.
-- ====================================================================

-- 1. health_events (Event Normalization Layer)
CREATE TABLE IF NOT EXISTS public.health_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type       text NOT NULL,
  source_table     text,
  source_record_id uuid,
  event_value      jsonb,
  event_context    text,
  event_at         timestamptz NOT NULL DEFAULT now(),
  confidence       float NOT NULL DEFAULT 1.0,
  priority         integer NOT NULL DEFAULT 3,
  is_anomaly       boolean NOT NULL DEFAULT false,
  baseline_delta   float,
  anomaly_reason   text,
  processed        boolean NOT NULL DEFAULT false,
  processed_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_events_user_time
  ON public.health_events(user_id, event_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_events_type
  ON public.health_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_health_events_unprocessed
  ON public.health_events(user_id, processed)
  WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_health_events_priority
  ON public.health_events(user_id, priority, event_at DESC);

ALTER TABLE public.health_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'health_events' AND policyname = 'Users own their health events'
  ) THEN
    CREATE POLICY "Users own their health events"
      ON public.health_events FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- 2. health_notification_log (Notification Decision & Fatigue Tracking)
CREATE TABLE IF NOT EXISTS public.health_notification_log (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  health_event_id     uuid REFERENCES public.health_events(id) ON DELETE SET NULL,
  category            text NOT NULL,
  priority            integer NOT NULL,
  title               text NOT NULL,
  body                text,
  reason              text,
  evidence            jsonb,
  recommended_action  text,
  why_explanation     text,
  optimal_time        timestamptz,
  expires_at          timestamptz,
  dedupe_key          text NOT NULL,
  cooldown_hours      integer NOT NULL DEFAULT 24,
  decision            text NOT NULL DEFAULT 'send',
  decision_reason     text,
  delivered_at        timestamptz,
  opened_at           timestamptz,
  dismissed_at        timestamptz,
  snoozed_at          timestamptz,
  snoozed_until       timestamptz,
  action_taken_at     timestamptz,
  action_completed_at timestamptz,
  ignored_count       integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_notif_user_time
  ON public.health_notification_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_notif_dedupe
  ON public.health_notification_log(user_id, dedupe_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_notif_category_fatigue
  ON public.health_notification_log(user_id, category, ignored_count);

ALTER TABLE public.health_notification_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'health_notification_log' AND policyname = 'Users own their notification log'
  ) THEN
    CREATE POLICY "Users own their notification log"
      ON public.health_notification_log FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

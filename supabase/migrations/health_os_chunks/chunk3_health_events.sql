-- CHUNK 3: health_events table + indexes + RLS
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

CREATE POLICY "Users own their health events"
  ON public.health_events
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id)

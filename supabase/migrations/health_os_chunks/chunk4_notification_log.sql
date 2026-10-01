-- CHUNK 4: health_notification_log table + indexes + RLS
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
CREATE INDEX IF NOT EXISTS idx_health_notif_undelivered
  ON public.health_notification_log(user_id, decision, delivered_at)
  WHERE delivered_at IS NULL AND decision = 'send';

ALTER TABLE public.health_notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their notification log"
  ON public.health_notification_log
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id)

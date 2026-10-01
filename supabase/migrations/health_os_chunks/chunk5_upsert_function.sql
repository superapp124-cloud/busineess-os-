-- CHUNK 5: upsert_health_os_state function
-- Run this as a SINGLE block in Supabase SQL Editor
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
AS $func$
BEGIN
  INSERT INTO public.health_os_state (
    user_id,
    health_state,
    health_state_label,
    health_state_confidence,
    health_score,
    domain_states,
    today_focus,
    active_insights,
    attention_items,
    notification_candidates,
    baseline_summary,
    data_sufficiency,
    last_computed_at,
    computation_version,
    events_processed_count,
    health_state_updated_at
  )
  VALUES (
    p_user_id,
    p_health_state,
    p_health_state_label,
    p_health_state_confidence,
    p_health_score,
    p_domain_states,
    p_today_focus,
    p_active_insights,
    p_attention_items,
    p_notification_candidates,
    p_baseline_summary,
    p_data_sufficiency,
    now(),
    p_computation_version,
    p_events_processed_count,
    now()
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
    health_state_updated_at  = now()
END $func$

-- ====================================================================
-- CHATR+ SERVER-AUTHORITATIVE ABUSE & RATE LIMITING ENGINE
-- ====================================================================
-- Security Invariant: The server strictly dictates keys, limits, and windows.
-- Callers/clients CANNOT dictate limits or bypass policies.
-- Zero raw phone numbers: All destination targets must be hashed.
-- ====================================================================

-- 1. Rate Limits Tracking Table
CREATE TABLE IF NOT EXISTS public.server_abuse_limits (
  rate_key TEXT NOT NULL,
  action_type TEXT NOT NULL,
  request_count INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (rate_key, action_type)
);

CREATE INDEX IF NOT EXISTS idx_server_abuse_limits_lookup 
ON public.server_abuse_limits(rate_key, action_type, window_start);

-- Restrict direct table manipulation from clients
ALTER TABLE public.server_abuse_limits ENABLE ROW LEVEL SECURITY;

-- 2. Server-Authoritative Rate Limit Enforcement Function
CREATE OR REPLACE FUNCTION public.enforce_server_abuse_limit(
  p_action TEXT,
  p_client_identifier TEXT,
  p_destination_hash TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit INT;
  v_window_seconds INT;
  v_effective_key TEXT;
  v_record RECORD;
  v_now TIMESTAMPTZ := now();
  v_window_interval INTERVAL;
  v_user_id UUID := auth.uid();
BEGIN
  -- 1. Server-authoritative action policy lookup (CANNOT be overridden by caller)
  CASE p_action
    WHEN 'invite_dispatch' THEN
      v_limit := 10;
      v_window_seconds := 3600; -- 1 hour
      -- Hierarchy: Authenticated UID > Trusted Client ID
      IF v_user_id IS NOT NULL THEN
        v_effective_key := 'uid:' || v_user_id::TEXT;
      ELSE
        v_effective_key := 'guest:' || COALESCE(NULLIF(p_client_identifier, ''), 'unknown');
      END IF;

    WHEN 'invite_dest_cooldown' THEN
      v_limit := 1;
      v_window_seconds := 300; -- 5 minutes per destination
      IF p_destination_hash IS NULL OR length(p_destination_hash) < 6 THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'Missing or invalid destination hash');
      END IF;
      v_effective_key := 'dst:' || p_destination_hash;

    WHEN 'room_create' THEN
      v_limit := 20;
      v_window_seconds := 3600;
      IF v_user_id IS NOT NULL THEN
        v_effective_key := 'uid:' || v_user_id::TEXT;
      ELSE
        v_effective_key := 'guest:' || COALESCE(NULLIF(p_client_identifier, ''), 'unknown');
      END IF;

    WHEN 'guest_join' THEN
      v_limit := 30;
      v_window_seconds := 3600;
      v_effective_key := 'guest:' || COALESCE(NULLIF(p_client_identifier, ''), 'unknown');

    WHEN 'telemetry_batch' THEN
      v_limit := 120;
      v_window_seconds := 60; -- Max 2 batches/sec
      v_effective_key := 'telem:' || COALESCE(NULLIF(p_client_identifier, ''), 'unknown');

    ELSE
      RETURN jsonb_build_object('allowed', false, 'reason', 'Unrecognized rate limit action');
  END CASE;

  v_window_interval := (v_window_seconds || ' seconds')::interval;

  -- 2. Atomic lock and evaluation
  SELECT * INTO v_record
  FROM public.server_abuse_limits
  WHERE rate_key = v_effective_key AND action_type = p_action
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.server_abuse_limits (rate_key, action_type, request_count, window_start)
    VALUES (v_effective_key, p_action, 1, v_now);
    RETURN jsonb_build_object('allowed', true, 'current_count', 1, 'limit', v_limit);
  END IF;

  -- Reset window if expired
  IF v_now - v_record.window_start > v_window_interval THEN
    UPDATE public.server_abuse_limits
    SET request_count = 1, window_start = v_now
    WHERE rate_key = v_effective_key AND action_type = p_action;
    RETURN jsonb_build_object('allowed', true, 'current_count', 1, 'limit', v_limit);
  END IF;

  -- Check limit
  IF v_record.request_count >= v_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'current_count', v_record.request_count,
      'limit', v_limit,
      'retry_after_seconds', GREATEST(1, EXTRACT(EPOCH FROM (v_record.window_start + v_window_interval - v_now))::INT)
    );
  END IF;

  -- Increment within active window
  UPDATE public.server_abuse_limits
  SET request_count = v_record.request_count + 1
  WHERE rate_key = v_effective_key AND action_type = p_action;

  RETURN jsonb_build_object('allowed', true, 'current_count', v_record.request_count + 1, 'limit', v_limit);
END;
$$;

-- Grant execution to all clients (the function enforces security internally via SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION public.enforce_server_abuse_limit(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

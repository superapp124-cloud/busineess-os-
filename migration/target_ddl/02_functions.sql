-- ==============================================================================
-- PART 2: DATABASE FUNCTIONS & STORED PROCEDURES
-- Target: nuuuqazaoaozgblmvkzn
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.sync_micro_task_earning_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_task RECORD;
  v_status public.earning_event_status;
  v_approved_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT id, title, task_type, reward_coins, reward_rupees
  INTO v_task
  FROM public.micro_tasks
  WHERE id = NEW.task_id;

  IF v_task.id IS NULL THEN
    RETURN NEW;
  END IF;

  v_status := CASE NEW.status
    WHEN 'approved' THEN 'approved'::public.earning_event_status
    WHEN 'auto_approved' THEN 'approved'::public.earning_event_status
    WHEN 'rejected' THEN 'rejected'::public.earning_event_status
    WHEN 'auto_rejected' THEN 'rejected'::public.earning_event_status
    ELSE 'pending'::public.earning_event_status
  END;

  v_approved_at := CASE WHEN v_status = 'approved' THEN COALESCE(NEW.created_at, now()) ELSE NULL END;

  UPDATE public.earning_events
  SET
    title = v_task.title,
    description = 'Mission reward',
    status = v_status,
    reward_coins = COALESCE(v_task.reward_coins, 0),
    reward_rupees = COALESCE(v_task.reward_rupees, 0),
    approved_at = v_approved_at,
    metadata = jsonb_build_object(
      'task_id', NEW.task_id,
      'task_type', v_task.task_type,
      'submission_status', NEW.status,
      'assignment_id', NEW.assignment_id
    ),
    updated_at = now()
  WHERE user_id = NEW.user_id
    AND event_type = 'micro_task_reward'::public.earning_event_type
    AND source_table = 'micro_task_submissions'
    AND source_id = NEW.id;

  IF NOT FOUND THEN
    INSERT INTO public.earning_events (
      user_id,
      event_type,
      source_table,
      source_id,
      title,
      description,
      status,
      reward_coins,
      reward_rupees,
      occurred_at,
      approved_at,
      metadata
    )
    VALUES (
      NEW.user_id,
      'micro_task_reward'::public.earning_event_type,
      'micro_task_submissions',
      NEW.id,
      v_task.title,
      'Mission reward',
      v_status,
      COALESCE(v_task.reward_coins, 0),
      COALESCE(v_task.reward_rupees, 0),
      COALESCE(NEW.created_at, now()),
      v_approved_at,
      jsonb_build_object(
        'task_id', NEW.task_id,
        'task_type', v_task.task_type,
        'submission_status', NEW.status,
        'assignment_id', NEW.assignment_id
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = _conversation_id
    AND user_id = _user_id
  )
$function$;

CREATE OR REPLACE FUNCTION public.ensure_user_points_exists(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_points (user_id, balance, lifetime_earned, lifetime_spent)
  VALUES (p_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_default_crm_pipeline()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO crm_pipelines (business_id, name, is_default)
  VALUES (NEW.id, 'Default Sales Pipeline', true);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.backfill_phone_hashes()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  profile_record RECORD;
  phone_normalized TEXT;
  phone_hash_value TEXT;
BEGIN
  FOR profile_record IN 
    SELECT id, phone_number 
    FROM profiles 
    WHERE phone_number IS NOT NULL 
    AND (phone_hash IS NULL OR phone_hash = '')
  LOOP
    NULL;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_delete_old_location_data()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE messages
  SET location_latitude = NULL,
      location_longitude = NULL,
      location_name = NULL
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND (location_latitude IS NOT NULL OR location_longitude IS NOT NULL);
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_old_webrtc_signals()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM webrtc_signals WHERE created_at < NOW() - INTERVAL '5 minutes';
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_saved_searches_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.find_shared_conversation(user1_id uuid, user2_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  shared_conv_id UUID;
BEGIN
  SELECT c.id INTO shared_conv_id
  FROM conversations c
  WHERE c.is_group = false
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp1
      WHERE cp1.conversation_id = c.id AND cp1.user_id = user1_id
    )
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = c.id AND cp2.user_id = user2_id
    )
    AND (
      SELECT COUNT(*) FROM conversation_participants cp
      WHERE cp.conversation_id = c.id
    ) = 2
  ORDER BY c.created_at DESC
  LIMIT 1;
  
  RETURN shared_conv_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_review_replies_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_calls_trust()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_count INTEGER;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
    SELECT COUNT(*) INTO v_count FROM public.calls
    WHERE caller_id = NEW.caller_id AND status = 'completed';
    IF v_count >= 3 THEN
      PERFORM public.award_trust_factor(NEW.caller_id, 'call_behavior', 75, 1.0, 'calls_completed');
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.clean_expired_geo_cache()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.geo_cache WHERE expires_at < NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_message_expiry()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Get disappearing duration from conversation
  SELECT disappearing_messages_duration INTO NEW.expires_at
  FROM public.conversations 
  WHERE id = NEW.conversation_id;
  
  -- If duration is set, calculate expiry time
  IF NEW.expires_at IS NOT NULL THEN
    NEW.expires_at := NOW() + (NEW.expires_at || ' seconds')::INTERVAL;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_universal_timeline(p_conversation_id uuid, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
 RETURNS SETOF timeline_item
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Ensure the caller is part of the conversation
  IF NOT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT * FROM (
    -- 1. MESSAGES
    SELECT
      m.id,
      'message'::text AS timeline_type,
      m.created_at,
      m.sender_id,
      row_to_json(m)::jsonb AS payload
    FROM public.messages m
    WHERE m.conversation_id = p_conversation_id

    UNION ALL

    -- 2. CALLS
    SELECT
      c.id,
      'call'::text AS timeline_type,
      c.started_at AS created_at,
      c.caller_id AS sender_id,
      row_to_json(c)::jsonb AS payload
    FROM public.calls c
    WHERE c.conversation_id = p_conversation_id
  ) AS timeline
  ORDER BY created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_cache_hit_count()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_user_contact_joined()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Wrapped in exception handler to never block profile creation
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trg_telemetry_closed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.closed_at IS NOT NULL AND OLD.closed_at IS NULL THEN
    PERFORM public.refresh_contact_intelligence(NEW.user_id, NEW.contact_id);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_booking_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.booking_number IS NULL THEN
    NEW.booking_number := 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.compute_trust_score(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_score NUMERIC := 50;
  v_total_weight NUMERIC := 0;
  v_weighted_sum NUMERIC := 0;
  v_final INTEGER;
  r RECORD;
BEGIN
  FOR r IN
    SELECT factor_type, factor_value, weight
    FROM public.trust_factors
    WHERE user_id = p_user_id
      AND (expires_at IS NULL OR expires_at > now())
  LOOP
    IF r.factor_type IN ('spam_report', 'fraud_flag') THEN
      v_weighted_sum := v_weighted_sum - (r.factor_value * r.weight);
    ELSE
      v_weighted_sum := v_weighted_sum + (r.factor_value * r.weight);
    END IF;
    v_total_weight := v_total_weight + r.weight;
  END LOOP;

  IF v_total_weight > 0 THEN
    v_score := GREATEST(0, LEAST(100, v_weighted_sum / v_total_weight));
  END IF;

  v_final := ROUND(v_score)::INTEGER;

  INSERT INTO public.user_trust_scores (user_id, trust_score, verification_level, last_updated)
  VALUES (
    p_user_id, v_final,
    CASE
      WHEN v_final >= 80 THEN 'premium'
      WHEN v_final >= 60 THEN 'identity'
      WHEN v_final >= 40 THEN 'email'
      WHEN v_final >= 20 THEN 'phone'
      ELSE 'unverified'
    END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    trust_score = EXCLUDED.trust_score,
    verification_level = EXCLUDED.verification_level,
    last_updated = now();

  RETURN v_final;
END;
$function$;

CREATE OR REPLACE FUNCTION public.grant_ceo_role_to_founder()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.phone_number IS NOT NULL AND regexp_replace(NEW.phone_number, '[^0-9]', '', 'g') IN ('919717845477','9717845477') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'ceo'::public.app_role) ON CONFLICT (user_id, role) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin'::public.app_role) ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_caller_id_aggregate()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_phone TEXT;
  v_total INTEGER;
  v_spam INTEGER;
  v_safe INTEGER;
  v_name TEXT;
  v_type VARCHAR(30);
  v_pct REAL;
  v_label VARCHAR(50);
  v_first TIMESTAMPTZ;
BEGIN
  v_phone := COALESCE(NEW.phone_number, OLD.phone_number);

  SELECT COUNT(*), 
         COUNT(*) FILTER (WHERE report_type IN ('spam','scam','telemarketer','robocall','fraud')),
         COUNT(*) FILTER (WHERE report_type = 'safe'),
         MIN(created_at)
  INTO v_total, v_spam, v_safe, v_first
  FROM caller_reports WHERE phone_number = v_phone;

  IF v_total = 0 THEN
    DELETE FROM caller_id_aggregates WHERE phone_number = v_phone;
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_pct := CASE WHEN v_total > 0 THEN (v_spam::REAL / v_total) * 100 ELSE 0 END;

  SELECT caller_name INTO v_name
  FROM caller_reports WHERE phone_number = v_phone AND caller_name IS NOT NULL
  GROUP BY caller_name ORDER BY COUNT(*) DESC LIMIT 1;

  SELECT report_type INTO v_type
  FROM caller_reports WHERE phone_number = v_phone
  GROUP BY report_type ORDER BY COUNT(*) DESC LIMIT 1;

  v_label := CASE
    WHEN v_pct >= 80 AND v_total >= 5 THEN 'Confirmed Spam'
    WHEN v_pct >= 60 THEN 'Likely Spam'
    WHEN v_pct >= 40 THEN 'Suspected Spam'
    WHEN v_type = 'safe' AND v_total >= 3 THEN 'Verified Safe'
    WHEN v_type = 'business' THEN 'Business'
    ELSE 'Unknown'
  END;

  INSERT INTO caller_id_aggregates (phone_number, community_name, total_reports, spam_reports, safe_reports, spam_percentage, most_common_type, community_label, first_reported_at, last_reported_at, updated_at)
  VALUES (v_phone, v_name, v_total, v_spam, v_safe, v_pct, v_type, v_label, v_first, now(), now())
  ON CONFLICT (phone_number) DO UPDATE SET
    community_name = EXCLUDED.community_name,
    total_reports = EXCLUDED.total_reports,
    spam_reports = EXCLUDED.spam_reports,
    safe_reports = EXCLUDED.safe_reports,
    spam_percentage = EXCLUDED.spam_percentage,
    most_common_type = EXCLUDED.most_common_type,
    community_label = EXCLUDED.community_label,
    first_reported_at = EXCLUDED.first_reported_at,
    last_reported_at = EXCLUDED.last_reported_at,
    updated_at = now();

  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.install_capability(p_capability_id text, p_capability_name text, p_capability_type text, p_workspace_path text, p_icon_name text DEFAULT 'Bot'::text, p_color text DEFAULT 'indigo'::text, p_structure jsonb DEFAULT '[]'::jsonb, p_config jsonb DEFAULT '{}'::jsonb, p_version text DEFAULT '1.0.0'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id    uuid := auth.uid();
  v_install_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.user_capability_installs (
    user_id, capability_id, capability_name, capability_type,
    workspace_path, icon_name, color, structure, config, version, status
  )
  VALUES (
    v_user_id, p_capability_id, p_capability_name, p_capability_type,
    p_workspace_path, p_icon_name, p_color, p_structure, p_config, p_version, 'installed'
  )
  ON CONFLICT (user_id, capability_id)
  DO UPDATE SET
    status          = 'installed',
    capability_name = EXCLUDED.capability_name,
    workspace_path  = EXCLUDED.workspace_path,
    config          = EXCLUDED.config,
    version         = EXCLUDED.version,
    updated_at      = now()
  RETURNING id INTO v_install_id;

  -- Fire kernel event (append-only, so this always succeeds)
  INSERT INTO public.os_events (
    event_type, level, source_subsystem, payload
  ) VALUES (
    'capability.installed',
    'info',
    'intent-store',
    jsonb_build_object(
      'install_id',      v_install_id,
      'capability_id',   p_capability_id,
      'capability_name', p_capability_name,
      'capability_type', p_capability_type,
      'user_id',         v_user_id,
      'workspace_path',  p_workspace_path,
      'version',         p_version
    )
  );

  RETURN jsonb_build_object(
    'install_id',    v_install_id,
    'status',        'installed',
    'capability_id', p_capability_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_wallet_transaction(p_user_id uuid, p_type character varying, p_amount numeric, p_description text, p_reference_type character varying DEFAULT NULL::character varying, p_reference_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_wallet_id UUID;
  v_new_balance DECIMAL(15, 2);
  v_transaction_id UUID;
BEGIN
  SELECT id, balance INTO v_wallet_id, v_new_balance FROM public.chatr_wallet WHERE user_id = p_user_id;
  IF v_wallet_id IS NULL THEN
    INSERT INTO public.chatr_wallet (user_id, balance) VALUES (p_user_id, 0.00) RETURNING id, balance INTO v_wallet_id, v_new_balance;
  END IF;
  IF p_type IN ('credit', 'cashback', 'referral', 'refund') THEN
    v_new_balance := v_new_balance + p_amount;
  ELSIF p_type = 'debit' THEN
    IF v_new_balance < p_amount THEN RAISE EXCEPTION 'Insufficient wallet balance'; END IF;
    v_new_balance := v_new_balance - p_amount;
  END IF;
  INSERT INTO public.chatr_wallet_transactions (wallet_id, user_id, type, amount, balance_after, description, reference_type, reference_id)
  VALUES (v_wallet_id, p_user_id, p_type, p_amount, v_new_balance, p_description, p_reference_type, p_reference_id)
  RETURNING id INTO v_transaction_id;
  UPDATE public.chatr_wallet SET balance = v_new_balance,
    total_spent = CASE WHEN p_type = 'debit' THEN total_spent + p_amount ELSE total_spent END,
    total_earned = CASE WHEN p_type IN ('credit', 'cashback', 'referral') THEN total_earned + p_amount ELSE total_earned END,
    cashback_balance = CASE WHEN p_type = 'cashback' THEN cashback_balance + p_amount ELSE cashback_balance END,
    referral_earnings = CASE WHEN p_type = 'referral' THEN referral_earnings + p_amount ELSE referral_earnings END,
    updated_at = now()
  WHERE id = v_wallet_id;
  RETURN jsonb_build_object('success', true, 'transaction_id', v_transaction_id, 'new_balance', v_new_balance);
END;
$function$;

CREATE OR REPLACE FUNCTION public.uninstall_capability(p_capability_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  UPDATE public.user_capability_installs
  SET status = 'uninstalled', updated_at = now()
  WHERE user_id = v_user_id AND capability_id = p_capability_id;

  INSERT INTO public.os_events (event_type, level, source_subsystem, payload)
  VALUES (
    'capability.uninstalled', 'info', 'intent-store',
    jsonb_build_object('capability_id', p_capability_id, 'user_id', v_user_id)
  );

  RETURN jsonb_build_object('status', 'uninstalled');
END;
$function$;

CREATE OR REPLACE FUNCTION public.dhandha_customer_balance_sync()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  amt NUMERIC;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.customer_id IS NOT NULL THEN
      UPDATE public.dhandha_customers
        SET total_billed = total_billed + NEW.amount,
            outstanding_balance = outstanding_balance + CASE WHEN NEW.status = 'paid' THEN 0 ELSE NEW.amount END,
            total_paid = total_paid + CASE WHEN NEW.status = 'paid' THEN NEW.amount ELSE 0 END
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.customer_id IS NOT NULL THEN
      IF OLD.status <> 'paid' AND NEW.status = 'paid' THEN
        UPDATE public.dhandha_customers
          SET outstanding_balance = GREATEST(outstanding_balance - NEW.amount, 0),
              total_paid = total_paid + NEW.amount
          WHERE id = NEW.customer_id;
      ELSIF OLD.status = 'paid' AND NEW.status <> 'paid' THEN
        UPDATE public.dhandha_customers
          SET outstanding_balance = outstanding_balance + NEW.amount,
              total_paid = GREATEST(total_paid - NEW.amount, 0)
          WHERE id = NEW.customer_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.customer_id IS NOT NULL THEN
      UPDATE public.dhandha_customers
        SET total_billed = GREATEST(total_billed - OLD.amount, 0),
            outstanding_balance = GREATEST(outstanding_balance - CASE WHEN OLD.status = 'paid' THEN 0 ELSE OLD.amount END, 0),
            total_paid = GREATEST(total_paid - CASE WHEN OLD.status = 'paid' THEN OLD.amount ELSE 0 END, 0)
        WHERE id = OLD.customer_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $function$;

CREATE OR REPLACE FUNCTION public.process_coin_payment(p_user_id uuid, p_amount integer, p_merchant_id uuid, p_payment_type character varying, p_description text, p_app_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_balance INTEGER;
  v_payment_id UUID;
BEGIN
  -- Check user balance
  SELECT balance INTO v_user_balance
  FROM user_points
  WHERE user_id = p_user_id;
  
  IF v_user_balance IS NULL OR v_user_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient Chatr Coins';
  END IF;
  
  -- Deduct from user
  UPDATE user_points
  SET balance = balance - p_amount
  WHERE user_id = p_user_id;
  
  -- Add to merchant if specified
  IF p_merchant_id IS NOT NULL THEN
    UPDATE user_points
    SET balance = balance + p_amount
    WHERE user_id = p_merchant_id;
  END IF;
  
  -- Record transaction
  INSERT INTO point_transactions (user_id, amount, transaction_type, source, description)
  VALUES (p_user_id, -p_amount, 'spend', p_payment_type, p_description);
  
  IF p_merchant_id IS NOT NULL THEN
    INSERT INTO point_transactions (user_id, amount, transaction_type, source, description)
    VALUES (p_merchant_id, p_amount, 'earn', p_payment_type, 'Payment received: ' || p_description);
  END IF;
  
  -- Create payment record
  INSERT INTO coin_payments (user_id, app_id, merchant_id, amount, payment_type, description, status)
  VALUES (p_user_id, p_app_id, p_merchant_id, p_amount, p_payment_type, p_description, 'completed')
  RETURNING id INTO v_payment_id;
  
  RETURN v_payment_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_app_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE mini_apps 
  SET 
    rating_average = (SELECT AVG(rating) FROM app_reviews WHERE app_id = NEW.app_id),
    rating_count = (SELECT COUNT(*) FROM app_reviews WHERE app_id = NEW.app_id)
  WHERE id = NEW.app_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.encrypt_kyc_value(value text, user_id uuid)
 RETURNS bytea
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF value IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN pgp_sym_encrypt(
    value, 
    encode(digest(user_id::text || 'chatr_kyc_key_v1', 'sha256'), 'hex')
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.seed_recruitment_demo()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_job1_id uuid := gen_random_uuid();
  v_job2_id uuid := gen_random_uuid();
  v_job3_id uuid := gen_random_uuid();
BEGIN
  -- Only seed if workspace is empty
  IF EXISTS (SELECT 1 FROM rec_jobs WHERE user_id = v_user_id LIMIT 1) THEN
    RETURN;
  END IF;

  -- Insert 3 demo jobs using pre-generated IDs
  INSERT INTO rec_jobs (id, user_id, title, department, location, type, status, description, openings)
  VALUES
    (v_job1_id, v_user_id, 'Senior Product Designer',   'Design',      'Remote',    'Full-time', 'Open',
     'Lead product design, run user research and ship beautiful experiences.', 2),
    (v_job2_id, v_user_id, 'Backend Engineer (Node.js)', 'Engineering', 'Bangalore', 'Full-time', 'Open',
     'Build scalable APIs and microservices for our platform.', 3),
    (v_job3_id, v_user_id, 'Sales Development Rep',      'Sales',       'Mumbai',    'Full-time', 'Open',
     'Generate leads and qualify prospects for our enterprise sales team.', 5);

  -- Insert 8 demo candidates
  INSERT INTO rec_candidates
    (user_id, job_id, first_name, last_name, email, stage, rating, ai_score, ai_summary, source)
  VALUES
    (v_user_id, v_job2_id, 'Priya',   'Sharma',  'priya.sharma@example.com',  'Screening',  4, 87.5,
     'Strong match. 6 years of Node.js. Previously at Razorpay.', 'LinkedIn'),
    (v_user_id, v_job2_id, 'Rahul',   'Mehta',   'rahul.mehta@example.com',   'Interview',  5, 92.0,
     'Excellent candidate. System design skills exceptional. Recommended.', 'Referral'),
    (v_user_id, v_job2_id, 'Sneha',   'Patil',   'sneha.patil@example.com',   'Applied',    3, 71.0,
     'Decent background. Missing microservices experience.', 'Direct'),
    (v_user_id, v_job2_id, 'Arjun',   'Nair',    'arjun.nair@example.com',    'Offer',      5, 95.0,
     'Top performer. Multiple competing offers. Move fast.', 'GitHub'),
    (v_user_id, v_job2_id, 'Kavitha', 'Rajan',   'kavitha.rajan@example.com', 'Assessment', 4, 83.0,
     'Strong fundamentals. Needs a system design round.', 'LinkedIn'),
    (v_user_id, v_job1_id, 'Meera',   'Iyer',    'meera.iyer@example.com',    'Screening',  4, 88.0,
     'Excellent portfolio. Figma skills strong. Great engineer-designer.', 'Behance'),
    (v_user_id, v_job1_id, 'Rohan',   'Kapoor',  'rohan.kapoor@example.com',  'Applied',    3, 74.0,
     'Good visual design but limited product thinking.', 'Direct'),
    (v_user_id, v_job3_id, 'Ananya',  'Singh',   'ananya.singh@example.com',  'Interview',  5, 91.0,
     'High energy, great communicator. Ex-Salesforce. Strong fit.', 'LinkedIn');
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrypt_kyc_value(encrypted_value bytea, user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF encrypted_value IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN pgp_sym_decrypt(
    encrypted_value,
    encode(digest(user_id::text || 'chatr_kyc_key_v1', 'sha256'), 'hex')
  );
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_message_delivery()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.read_at IS NOT NULL AND (OLD.read_at IS NULL OR OLD.read_at IS DISTINCT FROM NEW.read_at) THEN
    UPDATE message_delivery_status
    SET 
      status = 'read',
      read_at = NEW.read_at
    WHERE message_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.expire_old_inter_app_messages()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.inter_app_messages
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at IS NOT NULL
    AND expires_at < now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_app_last_opened()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.chatr_os_apps
  SET last_opened_at = NEW.session_start,
      lifecycle_state = 'running'
  WHERE id = NEW.app_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fin_policy_audit_fn()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ BEGIN INSERT INTO public.audit_logs(organization_id,actor_id,action,resource_type,resource_id,details) SELECT fo.sys_organization_id,auth.uid(),TG_OP,'fin_accounting_policy',NEW.id::text,jsonb_build_object('old_status',CASE WHEN TG_OP='UPDATE' THEN OLD.status ELSE NULL END,'new_status',NEW.status,'policy_type',NEW.policy_type,'version',NEW.version) FROM public.fin_organizations fo WHERE fo.id=NEW.fin_organization_id; RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.increment_job_views(job_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.chatr_jobs SET views_count = views_count + 1 WHERE id = job_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_session_room_host(_room_id uuid, _user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.session_rooms
    WHERE id = _room_id AND host_id = _user_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_session_room_member(_room_id uuid, _user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.session_room_participants
    WHERE room_id = _room_id AND user_id = _user_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.fin_enforce_period_lock()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE v_status TEXT;
BEGIN
  IF NEW.status = 'POSTED' AND (OLD.status IS NULL OR OLD.status != 'POSTED') THEN
    SELECT status INTO v_status FROM public.fin_periods WHERE id = NEW.period_id;
    IF v_status = 'CLOSED' THEN
      RAISE EXCEPTION 'Cannot post into CLOSED period (%). Reopen via workflow approval.', NEW.period_id;
    END IF;
    IF v_status = 'SOFT_CLOSED' AND NEW.entry_type NOT IN ('ADJUSTMENT','CORRECTING','CLOSING','RESTATEMENT') THEN
      RAISE EXCEPTION 'Period is SOFT_CLOSED. Only ADJUSTMENT/CORRECTING/CLOSING/RESTATEMENT allowed.';
    END IF;
  END IF;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.fin_enforce_double_entry()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE v_dr NUMERIC(20,4); v_cr NUMERIC(20,4); v_cnt INTEGER;
BEGIN
  IF NEW.status = 'POSTED' AND (OLD.status IS NULL OR OLD.status != 'POSTED') THEN
    SELECT COALESCE(SUM(functional_debit),0), COALESCE(SUM(functional_credit),0), COUNT(*)
    INTO v_dr, v_cr, v_cnt FROM public.fin_journal_lines WHERE journal_entry_id = NEW.id;
    IF v_cnt < 2 THEN RAISE EXCEPTION 'Journal entry % must have at least 2 lines.', NEW.entry_number; END IF;
    IF ABS(v_dr - v_cr) > 0.01 THEN
      RAISE EXCEPTION 'Double-entry violated for % (%). Dr=% Cr=% Diff=%.', NEW.entry_number, NEW.id, v_dr, v_cr, ABS(v_dr-v_cr);
    END IF;
  END IF;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  IF _user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.sys_tenant_users
    WHERE user_id = _user_id AND (role = _role OR role = 'OWNER' OR role = 'admin')
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND (role::text = _role OR role::text = 'admin')
  ) OR TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fin_events_no_delete()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ BEGIN RAISE EXCEPTION 'fin_events is append-only. DELETE prohibited.'; END; $function$;

CREATE OR REPLACE FUNCTION public.fin_posting_immutability()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF OLD.status = 'POSTED' AND NEW.status NOT IN ('REVERSED') THEN
    RAISE EXCEPTION 'Posted journal entry % is immutable. Use reversal.', OLD.entry_number;
  END IF;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.fin_next_entry_number(p_org_id uuid, p_year integer DEFAULT NULL::integer)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE v_year INTEGER := COALESCE(p_year, EXTRACT(YEAR FROM now())::INTEGER); v_prefix TEXT; v_count INTEGER;
BEGIN
  v_prefix := 'JE-' || v_year || '-';
  SELECT COUNT(*) + 1 INTO v_count FROM public.fin_journal_entries WHERE fin_organization_id = p_org_id AND entry_number LIKE v_prefix || '%';
  RETURN v_prefix || LPAD(v_count::text, 5, '0');
END; $function$;

CREATE OR REPLACE FUNCTION public.fin_get_period_for_date(p_org_id uuid, p_entity_id uuid, p_date date)
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  SELECT id FROM public.fin_periods
  WHERE fin_organization_id=p_org_id AND (legal_entity_id=p_entity_id OR legal_entity_id IS NULL)
    AND start_date<=p_date AND end_date>=p_date
  ORDER BY legal_entity_id NULLS LAST LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.handle_geofence_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_micro_task_completion_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.micro_tasks 
    SET current_completions = current_completions + 1, updated_at = now()
    WHERE id = NEW.task_id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fin_line_immutability()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE v_status TEXT;
BEGIN
  SELECT status INTO v_status FROM public.fin_journal_entries WHERE id = COALESCE(OLD.journal_entry_id, NEW.journal_entry_id);
  IF v_status IN ('POSTED','REVERSED') THEN
    RAISE EXCEPTION 'Cannot modify lines of a % entry. Use reversal.', v_status;
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $function$;

CREATE OR REPLACE FUNCTION public.fin_je_audit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.audit_logs(organization_id,actor_id,action,resource_type,resource_id,details)
    SELECT fo.sys_organization_id, auth.uid(), 'STATUS_CHANGE', 'fin_journal_entry', NEW.id::text,
      jsonb_build_object('entry_number',NEW.entry_number,'from_status',OLD.status,'to_status',NEW.status,
        'posting_date',NEW.posting_date,'source_event_id',NEW.source_event_id,'source_type',NEW.source_type,
        'accounting_standard',NEW.accounting_standard,'ai_proposed',NEW.ai_proposed)
    FROM public.fin_organizations fo WHERE fo.id = NEW.fin_organization_id;
  END IF;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.fin_post_journal_entry(p_entry_id uuid, p_posted_by uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE v_entry public.fin_journal_entries; v_dr NUMERIC(20,4); v_cr NUMERIC(20,4);
BEGIN
  SELECT * INTO v_entry FROM public.fin_journal_entries WHERE id=p_entry_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success',false,'error','Entry not found'); END IF;
  IF v_entry.status NOT IN ('DRAFT','PENDING_APPROVAL') THEN
    RETURN jsonb_build_object('success',false,'error',format('Cannot post from status: %s',v_entry.status)); END IF;
  SELECT COALESCE(SUM(functional_debit),0), COALESCE(SUM(functional_credit),0)
  INTO v_dr, v_cr FROM public.fin_journal_lines WHERE journal_entry_id=p_entry_id;
  IF ABS(v_dr - v_cr) > 0.01 THEN
    RETURN jsonb_build_object('success',false,'error',format('Balance violation: Dr=%s Cr=%s',v_dr,v_cr)); END IF;
  UPDATE public.fin_journal_entries SET status='POSTED',posted_by=p_posted_by,posted_at=now(),updated_at=now() WHERE id=p_entry_id;
  INSERT INTO public.os_events(event_type,level,source_subsystem,payload) VALUES (
    'finance.journal_entry.posted','info','finance-post',
    jsonb_build_object('journal_entry_id',p_entry_id,'entry_number',v_entry.entry_number,
      'organization_id',v_entry.fin_organization_id,'legal_entity_id',v_entry.legal_entity_id,
      'posted_by',p_posted_by,'debit_sum',v_dr,'source_event_id',v_entry.source_event_id,
      'source_type',v_entry.source_type,'accounting_standard',v_entry.accounting_standard));
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.fin_ledger_balances;
  RETURN jsonb_build_object('success',true,'journal_entry_id',p_entry_id,'entry_number',v_entry.entry_number,'posted_at',now());
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('success',false,'error',SQLERRM);
END; $function$;

CREATE OR REPLACE FUNCTION public.insert_finance_account_helper(p_fin_org_id uuid, p_code text, p_name text, p_type text, p_normal text, p_subtype text DEFAULT NULL::text, p_parent text DEFAULT NULL::text, p_depth integer DEFAULT 0, p_allow_post boolean DEFAULT true, p_fs text DEFAULT NULL::text, p_std text DEFAULT 'BOTH'::text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_parent_id UUID := NULL;
BEGIN
  IF p_parent IS NOT NULL THEN
    SELECT id INTO v_parent_id FROM public.fin_accounts
    WHERE fin_organization_id = p_fin_org_id AND legal_entity_id IS NULL AND code = p_parent LIMIT 1;
  END IF;

  INSERT INTO public.fin_accounts (
    fin_organization_id, legal_entity_id, code, name, account_type, account_subtype,
    normal_balance, parent_account_id, depth, accounting_standard, allow_direct_posting, is_system_account, fs_mapping
  )
  VALUES (
    p_fin_org_id, NULL, p_code, p_name, p_type, p_subtype,
    p_normal, v_parent_id, p_depth, p_std, p_allow_post, true, p_fs
  )
  ON CONFLICT (fin_organization_id, legal_entity_id, code) DO NOTHING;
END;
$function$;

CREATE OR REPLACE FUNCTION public.seed_default_chart_of_accounts(p_fin_org_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- ASSETS (1xxx)
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1000','Assets','ASSET','DEBIT','ROOT',NULL,0,false,'balance_sheet.assets');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1100','Current Assets','ASSET','DEBIT','CURRENT_ASSET','1000',1,false,'balance_sheet.current_assets');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1110','Cash and Cash Equivalents','ASSET','DEBIT','CASH','1100',2,true,'balance_sheet.cash');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1111','Petty Cash','ASSET','DEBIT','CASH','1110',3,true,'balance_sheet.cash');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1112','Bank Accounts','ASSET','DEBIT','BANK','1110',3,false,'balance_sheet.cash');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1113','Current Account - Primary','ASSET','DEBIT','BANK','1112',4,true,'balance_sheet.cash');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1114','Savings Account','ASSET','DEBIT','BANK','1112',4,true,'balance_sheet.cash');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1120','Accounts Receivable','ASSET','DEBIT','RECEIVABLE','1100',2,true,'balance_sheet.receivables');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1121','Trade Receivables','ASSET','DEBIT','RECEIVABLE','1120',3,true,'balance_sheet.receivables');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1122','GST Input Tax Credit','ASSET','DEBIT','TAX','1100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1130','Prepaid Expenses','ASSET','DEBIT','PREPAID','1100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1131','Prepaid Rent','ASSET','DEBIT','PREPAID','1130',3,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1132','Prepaid Insurance','ASSET','DEBIT','PREPAID','1130',3,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1140','Short-term Investments','ASSET','DEBIT','INVESTMENT','1100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1150','Inventory','ASSET','DEBIT','INVENTORY','1100',2,true,'balance_sheet.inventory');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1160','Other Current Assets','ASSET','DEBIT','OTHER','1100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1200','Non-Current Assets','ASSET','DEBIT','NONCURRENT_ASSET','1000',1,false,'balance_sheet.noncurrent_assets');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1210','Property, Plant & Equipment (Gross)','ASSET','DEBIT','FIXED_ASSET','1200',2,false,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1211','Land','ASSET','DEBIT','LAND','1210',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1212','Buildings','ASSET','DEBIT','BUILDING','1210',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1213','Computer Equipment','ASSET','DEBIT','EQUIPMENT','1210',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1214','Office Furniture','ASSET','DEBIT','EQUIPMENT','1210',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1215','Leasehold Improvements','ASSET','DEBIT','LEASEHOLD','1210',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1220','Accumulated Depreciation','CONTRA_ASSET','CREDIT','ACC_DEP','1200',2,false,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1221','Accum. Dep - Buildings','CONTRA_ASSET','CREDIT','ACC_DEP','1220',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1222','Accum. Dep - Computer Equipment','CONTRA_ASSET','CREDIT','ACC_DEP','1220',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1223','Accum. Dep - Office Furniture','CONTRA_ASSET','CREDIT','ACC_DEP','1220',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1230','Right-of-Use Assets','ASSET','DEBIT','ROU_ASSET','1200',2,true,'balance_sheet.rou','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1240','Intangible Assets','ASSET','DEBIT','INTANGIBLE','1200',2,true,'balance_sheet.intangibles');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1241','Software Licenses','ASSET','DEBIT','SOFTWARE','1240',3,true,'balance_sheet.intangibles');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1242','Patents & IP','ASSET','DEBIT','IP','1240',3,true,'balance_sheet.intangibles');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1250','Long-term Investments','ASSET','DEBIT','INVESTMENT','1200',2,true,'balance_sheet.investments');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1260','Goodwill','ASSET','DEBIT','GOODWILL','1200',2,true,'balance_sheet.intangibles');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1270','Deferred Tax Asset','ASSET','DEBIT','DEFERRED_TAX','1200',2,true,'balance_sheet.other_noncurrent');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1280','Other Non-Current Assets','ASSET','DEBIT','OTHER','1200',2,true,'balance_sheet.other_noncurrent');

  -- LIABILITIES (2xxx)
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2000','Liabilities','LIABILITY','CREDIT','ROOT',NULL,0,false,'balance_sheet.liabilities');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2100','Current Liabilities','LIABILITY','CREDIT','CURRENT_LIABILITY','2000',1,false,'balance_sheet.current_liabilities');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2110','Accounts Payable','LIABILITY','CREDIT','PAYABLE','2100',2,true,'balance_sheet.payables');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2111','Trade Payables','LIABILITY','CREDIT','PAYABLE','2110',3,true,'balance_sheet.payables');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2120','Accrued Liabilities','LIABILITY','CREDIT','ACCRUAL','2100',2,true,'balance_sheet.accrued');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2121','Accrued Salaries','LIABILITY','CREDIT','ACCRUAL','2120',3,true,'balance_sheet.accrued');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2122','Accrued Expenses','LIABILITY','CREDIT','ACCRUAL','2120',3,true,'balance_sheet.accrued');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2123','Accrued Interest','LIABILITY','CREDIT','ACCRUAL','2120',3,true,'balance_sheet.accrued');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2130','Deferred Revenue','LIABILITY','CREDIT','DEFERRED_REV','2100',2,true,'balance_sheet.deferred_revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2131','Deferred Revenue - Subscriptions','LIABILITY','CREDIT','DEFERRED_REV','2130',3,true,'balance_sheet.deferred_revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2132','Deferred Revenue - Services','LIABILITY','CREDIT','DEFERRED_REV','2130',3,true,'balance_sheet.deferred_revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2140','Tax Payable','LIABILITY','CREDIT','TAX','2100',2,false,'balance_sheet.taxes');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2141','GST Payable','LIABILITY','CREDIT','TAX','2140',3,true,'balance_sheet.taxes');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2142','TDS Payable','LIABILITY','CREDIT','TAX','2140',3,true,'balance_sheet.taxes');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2143','Income Tax Payable','LIABILITY','CREDIT','TAX','2140',3,true,'balance_sheet.taxes');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2150','Short-term Loans','LIABILITY','CREDIT','LOAN','2100',2,true,'balance_sheet.short_term_debt');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2160','Customer Advances','LIABILITY','CREDIT','ADVANCE','2100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2170','Other Current Liabilities','LIABILITY','CREDIT','OTHER','2100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2200','Non-Current Liabilities','LIABILITY','CREDIT','NONCURRENT_LIABILITY','2000',1,false,'balance_sheet.noncurrent_liabilities');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2210','Long-term Loans','LIABILITY','CREDIT','LOAN','2200',2,true,'balance_sheet.long_term_debt');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2220','Lease Liabilities','LIABILITY','CREDIT','LEASE','2200',2,true,'balance_sheet.lease_liabilities','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2230','Deferred Tax Liability','LIABILITY','CREDIT','DEFERRED_TAX','2200',2,true,'balance_sheet.other_noncurrent');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2240','Other Non-Current Liabilities','LIABILITY','CREDIT','OTHER','2200',2,true,'balance_sheet.other_noncurrent');

  -- EQUITY (3xxx)
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3000','Equity','EQUITY','CREDIT','ROOT',NULL,0,false,'balance_sheet.equity');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3100','Share Capital','EQUITY','CREDIT','SHARE_CAPITAL','3000',1,true,'balance_sheet.share_capital');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3110','Ordinary Share Capital','EQUITY','CREDIT','SHARE_CAPITAL','3100',2,true,'balance_sheet.share_capital');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3120','Preference Share Capital','EQUITY','CREDIT','SHARE_CAPITAL','3100',2,true,'balance_sheet.share_capital');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3130','Share Premium','EQUITY','CREDIT','SHARE_PREMIUM','3000',1,true,'balance_sheet.share_premium');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3200','Retained Earnings','EQUITY','CREDIT','RETAINED_EARNINGS','3000',1,true,'balance_sheet.retained_earnings');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3210','Current Year Profit/Loss','EQUITY','CREDIT','CURRENT_YEAR_PL','3200',2,true,'balance_sheet.current_pl');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3300','Other Comprehensive Income','EQUITY','CREDIT','OCI','3000',1,false,'balance_sheet.oci','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3310','OCI - FX Translation Reserve','EQUITY','CREDIT','OCI_FX','3300',2,true,'balance_sheet.oci','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3320','OCI - Revaluation Reserve','EQUITY','CREDIT','OCI_REVAL','3300',2,true,'balance_sheet.oci','IFRS');

  -- REVENUE (4xxx)
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4000','Revenue','REVENUE','CREDIT','ROOT',NULL,0,false,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4100','Operating Revenue','REVENUE','CREDIT','OPERATING','4000',1,false,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4110','Product Revenue','REVENUE','CREDIT','PRODUCT','4100',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4120','Service Revenue','REVENUE','CREDIT','SERVICE','4100',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4130','Subscription Revenue','REVENUE','CREDIT','SUBSCRIPTION','4100',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4140','SaaS Revenue','REVENUE','CREDIT','SAAS','4130',3,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4150','Professional Services Revenue','REVENUE','CREDIT','SERVICES','4100',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4160','Consulting Revenue','REVENUE','CREDIT','CONSULTING','4150',3,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4200','Other Income','REVENUE','CREDIT','OTHER_INCOME','4000',1,false,'income_stmt.other_income');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4210','Interest Income','REVENUE','CREDIT','INTEREST','4200',2,true,'income_stmt.other_income');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4220','Foreign Exchange Gain','REVENUE','CREDIT','FX_GAIN','4200',2,true,'income_stmt.other_income');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4230','Other Income','REVENUE','CREDIT','OTHER','4200',2,true,'income_stmt.other_income');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4300','Contract Revenue (ASC 606 / IFRS 15)','REVENUE','CREDIT','CONTRACT','4000',1,false,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4310','Revenue - Point-in-Time','REVENUE','CREDIT','POT','4300',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4320','Revenue - Over Time (Straight-line)','REVENUE','CREDIT','OT_SL','4300',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4330','Revenue - Over Time (Milestone)','REVENUE','CREDIT','OT_MS','4300',2,true,'income_stmt.revenue');

  -- EXPENSES (5xxx)
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5000','Expenses','EXPENSE','DEBIT','ROOT',NULL,0,false,'income_stmt.expenses');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5100','Cost of Revenue','EXPENSE','DEBIT','COGS','5000',1,false,'income_stmt.cogs');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5110','Cost of Goods Sold','EXPENSE','DEBIT','COGS','5100',2,true,'income_stmt.cogs');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5120','Cost of Services','EXPENSE','DEBIT','COS','5100',2,true,'income_stmt.cogs');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5130','Hosting & Infrastructure','EXPENSE','DEBIT','INFRA','5100',2,true,'income_stmt.cogs');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5140','Third-party API Costs','EXPENSE','DEBIT','API','5100',2,true,'income_stmt.cogs');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5200','Operating Expenses','EXPENSE','DEBIT','OPEX','5000',1,false,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5210','Salaries & Wages','EXPENSE','DEBIT','SALARY','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5211','Employee Salaries','EXPENSE','DEBIT','SALARY','5210',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5212','Employer PF / ESI','EXPENSE','DEBIT','SALARY','5210',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5213','Employee Benefits','EXPENSE','DEBIT','BENEFITS','5210',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5220','Rent & Occupancy','EXPENSE','DEBIT','RENT','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5230','Marketing & Advertising','EXPENSE','DEBIT','MARKETING','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5240','Technology & Software','EXPENSE','DEBIT','TECH','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5250','Professional Fees','EXPENSE','DEBIT','PROFESSIONAL','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5251','Legal Fees','EXPENSE','DEBIT','LEGAL','5250',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5252','Audit & Accounting Fees','EXPENSE','DEBIT','AUDIT','5250',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5260','Travel & Entertainment','EXPENSE','DEBIT','TRAVEL','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5270','Office & Administration','EXPENSE','DEBIT','ADMIN','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5280','Insurance','EXPENSE','DEBIT','INSURANCE','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5290','Depreciation & Amortization','EXPENSE','DEBIT','DEPRECIATION','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5291','Depreciation - PPE','EXPENSE','DEBIT','DEPRECIATION','5290',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5292','Amortization - Intangibles','EXPENSE','DEBIT','AMORTIZATION','5290',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5293','ROU Asset Amortization','EXPENSE','DEBIT','ROU_AMORT','5290',3,true,'income_stmt.opex','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5300','Finance Costs','EXPENSE','DEBIT','FINANCE','5000',1,false,'income_stmt.finance');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5310','Interest Expense','EXPENSE','DEBIT','INTEREST','5300',2,true,'income_stmt.finance');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5311','Bank Charges','EXPENSE','DEBIT','BANK_CHG','5300',2,true,'income_stmt.finance');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5320','Foreign Exchange Loss','EXPENSE','DEBIT','FX_LOSS','5300',2,true,'income_stmt.finance');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5330','Lease Interest Expense','EXPENSE','DEBIT','LEASE_INT','5300',2,true,'income_stmt.finance','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5400','Tax Expense','EXPENSE','DEBIT','TAX','5000',1,false,'income_stmt.tax');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5410','Current Income Tax Expense','EXPENSE','DEBIT','TAX','5400',2,true,'income_stmt.tax');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5420','Deferred Tax Expense','EXPENSE','DEBIT','DEFERRED_TAX','5400',2,true,'income_stmt.tax');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5430','GST Expense (Non-recoverable)','EXPENSE','DEBIT','GST','5400',2,true,'income_stmt.tax');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5500','Other Expenses','EXPENSE','DEBIT','OTHER','5000',1,false,'income_stmt.other');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5510','Write-offs & Impairments','EXPENSE','DEBIT','WRITEOFF','5500',2,true,'income_stmt.other');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5520','Bad Debt Expense','EXPENSE','DEBIT','BAD_DEBT','5500',2,true,'income_stmt.other');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5530','Miscellaneous Expense','EXPENSE','DEBIT','MISC','5500',2,true,'income_stmt.other');

  RETURN 1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fin_sync_payment_allocation()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_inv_paid  NUMERIC(20,4);
  v_inv_total NUMERIC(20,4);
  v_bill_paid NUMERIC(20,4);
  v_bill_total NUMERIC(20,4);
  v_pmt_total NUMERIC(20,4);
  v_pmt_alloc NUMERIC(20,4);
  v_target_inv UUID;
  v_target_bill UUID;
  v_target_pmt UUID;
BEGIN
  v_target_inv  := COALESCE(NEW.invoice_id, OLD.invoice_id);
  v_target_bill := COALESCE(NEW.bill_id, OLD.bill_id);
  v_target_pmt  := COALESCE(NEW.payment_id, OLD.payment_id);

  -- 1. Sync Invoice
  IF v_target_inv IS NOT NULL THEN
    SELECT COALESCE(SUM(allocated_amount + discount_amount), 0) INTO v_inv_paid
    FROM public.fin_payment_allocations WHERE invoice_id = v_target_inv;

    SELECT total INTO v_inv_total FROM public.fin_invoices WHERE id = v_target_inv;

    UPDATE public.fin_invoices
    SET
      amount_paid = v_inv_paid,
      amount_due  = GREATEST(0, v_inv_total - v_inv_paid),
      status = CASE
        WHEN v_inv_paid >= v_inv_total THEN 'PAID'
        WHEN v_inv_paid > 0 THEN 'PARTIALLY_PAID'
        ELSE 'ISSUED'
      END,
      updated_at = now()
    WHERE id = v_target_inv;
  END IF;

  -- 2. Sync Bill
  IF v_target_bill IS NOT NULL THEN
    SELECT COALESCE(SUM(allocated_amount + discount_amount), 0) INTO v_bill_paid
    FROM public.fin_payment_allocations WHERE bill_id = v_target_bill;

    SELECT total INTO v_bill_total FROM public.fin_bills WHERE id = v_target_bill;

    UPDATE public.fin_bills
    SET
      amount_paid = v_bill_paid,
      amount_due  = GREATEST(0, v_bill_total - v_bill_paid),
      status = CASE
        WHEN v_bill_paid >= v_bill_total THEN 'PAID'
        WHEN v_bill_paid > 0 THEN 'PARTIALLY_PAID'
        ELSE status
      END,
      updated_at = now()
    WHERE id = v_target_bill;
  END IF;

  -- 3. Sync Payment unapplied amount
  SELECT amount INTO v_pmt_total FROM public.fin_payments WHERE id = v_target_pmt;
  SELECT COALESCE(SUM(allocated_amount + fee_amount), 0) INTO v_pmt_alloc
  FROM public.fin_payment_allocations WHERE payment_id = v_target_pmt;

  UPDATE public.fin_payments
  SET unapplied_amount = GREATEST(0, v_pmt_total - v_pmt_alloc), updated_at = now()
  WHERE id = v_target_pmt;

  RETURN COALESCE(NEW, OLD);
END; $function$;

CREATE OR REPLACE FUNCTION public.fin_reconcile_subledgers_to_gl(p_org_id uuid, p_entity_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_subledger_ar NUMERIC(20,4) := 0;
  v_gl_ar        NUMERIC(20,4) := 0;
  v_ar_diff      NUMERIC(20,4) := 0;

  v_subledger_ap NUMERIC(20,4) := 0;
  v_gl_ap        NUMERIC(20,4) := 0;
  v_ap_diff      NUMERIC(20,4) := 0;

  v_subledger_cash NUMERIC(20,4) := 0;
  v_gl_cash        NUMERIC(20,4) := 0;
  v_cash_diff      NUMERIC(20,4) := 0;

  v_is_reconciled  BOOLEAN := true;
BEGIN
  -- 1. AR Subledger: Sum of all unpaid / partially paid invoices
  SELECT COALESCE(SUM(amount_due * fx_rate), 0) INTO v_subledger_ar
  FROM public.fin_invoices
  WHERE fin_organization_id = p_org_id
    AND (legal_entity_id = p_entity_id OR p_entity_id IS NULL)
    AND status IN ('ISSUED', 'PARTIALLY_PAID');

  -- GL AR: Current balance in AR accounts (1120, 1121)
  SELECT COALESCE(SUM(jl.functional_debit - jl.functional_credit), 0) INTO v_gl_ar
  FROM public.fin_journal_lines jl
  JOIN public.fin_journal_entries je ON je.id = jl.journal_entry_id
  JOIN public.fin_accounts fa ON fa.id = jl.account_id
  WHERE je.fin_organization_id = p_org_id
    AND (je.legal_entity_id = p_entity_id OR p_entity_id IS NULL)
    AND je.status = 'POSTED'
    AND (fa.code LIKE '112%' OR fa.account_subtype = 'RECEIVABLE');

  v_ar_diff := ABS(v_subledger_ar - v_gl_ar);

  -- 2. AP Subledger: Sum of all unpaid / partially paid bills
  SELECT COALESCE(SUM(amount_due * fx_rate), 0) INTO v_subledger_ap
  FROM public.fin_bills
  WHERE fin_organization_id = p_org_id
    AND (legal_entity_id = p_entity_id OR p_entity_id IS NULL)
    AND status IN ('APPROVED', 'PARTIALLY_PAID');

  -- GL AP: Current balance in AP accounts (2110, 2111)
  SELECT COALESCE(SUM(jl.functional_credit - jl.functional_debit), 0) INTO v_gl_ap
  FROM public.fin_journal_lines jl
  JOIN public.fin_journal_entries je ON je.id = jl.journal_entry_id
  JOIN public.fin_accounts fa ON fa.id = jl.account_id
  WHERE je.fin_organization_id = p_org_id
    AND (je.legal_entity_id = p_entity_id OR p_entity_id IS NULL)
    AND je.status = 'POSTED'
    AND (fa.code LIKE '211%' OR fa.account_subtype = 'PAYABLE');

  v_ap_diff := ABS(v_subledger_ap - v_gl_ap);

  -- Determine pass/fail
  IF v_ar_diff > 1.0 OR v_ap_diff > 1.0 THEN
    v_is_reconciled := false;
  END IF;

  RETURN jsonb_build_object(
    'is_reconciled', v_is_reconciled,
    'ar', jsonb_build_object(
      'subledger_total', v_subledger_ar,
      'gl_total', v_gl_ar,
      'difference', v_ar_diff,
      'status', CASE WHEN v_ar_diff <= 1.0 THEN 'MATCH' ELSE 'MISMATCH' END
    ),
    'ap', jsonb_build_object(
      'subledger_total', v_subledger_ap,
      'gl_total', v_gl_ap,
      'difference', v_ap_diff,
      'status', CASE WHEN v_ap_diff <= 1.0 THEN 'MATCH' ELSE 'MISMATCH' END
    ),
    'reconciled_at', now()
  );
END; $function$;

CREATE OR REPLACE FUNCTION public.calculate_booking_earnings()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    NEW.commission_amount := NEW.total_amount * (SELECT commission_percentage FROM service_providers WHERE id = NEW.provider_id) / 100;
    NEW.provider_earnings := NEW.total_amount - NEW.commission_amount;
    UPDATE service_providers SET total_bookings = total_bookings + 1, total_earnings = total_earnings + NEW.provider_earnings WHERE id = NEW.provider_id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_call_fcm()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only trigger for ringing calls
  IF NEW.status != 'ringing' THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := 'https://sbayuqgomlflmxgicplz.supabase.co/functions/v1/fcm-call-trigger',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(current_setting('request.jwt.claim.sub', true), 'service-trigger'),
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiYXl1cWdvbWxmbG14Z2ljcGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTc2MDAsImV4cCI6MjA3NDk5MzYwMH0.gVSObpMtsv5W2nuLBHKT8G1_hXIprWXdn5l7Bnnj7jw'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'record', jsonb_build_object(
        'id', NEW.id,
        'caller_id', NEW.caller_id,
        'receiver_id', NEW.receiver_id,
        'caller_name', COALESCE(NEW.caller_name, 'Unknown'),
        'caller_avatar', COALESCE(NEW.caller_avatar, ''),
        'caller_phone', COALESCE(NEW.caller_phone, ''),
        'call_type', NEW.call_type,
        'conversation_id', NEW.conversation_id,
        'status', NEW.status
      )
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '[notify_call_fcm] Failed: %', SQLERRM;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_visual_search_cache()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.visual_search_cache WHERE expires_at < now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_session_duration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.session_end IS NOT NULL AND NEW.session_start IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.session_end - NEW.session_start))::INTEGER;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fin_run_integrity_check(p_org_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_anomalies JSONB := '[]'::jsonb;
  v_total_checks INTEGER := 8;
  v_passed_checks INTEGER := 8;
  v_reconcile JSONB;
  v_ar_diff NUMERIC(20,4);
  v_ap_diff NUMERIC(20,4);
  v_score NUMERIC(5,2) := 100.00;
  v_unposted_old INTEGER := 0;
  v_dup_bills INTEGER := 0;
  v_orphan_events INTEGER := 0;
  v_closed_attempts INTEGER := 0;
  v_report_status TEXT := 'HEALTHY';
BEGIN
  -- Check 1 & 2: Subledger to GL Reconciliation
  v_reconcile := public.fin_reconcile_subledgers_to_gl(p_org_id);
  v_ar_diff := (v_reconcile->'ar'->>'difference')::numeric;
  v_ap_diff := (v_reconcile->'ap'->>'difference')::numeric;

  IF v_ar_diff > 1.0 THEN
    v_passed_checks := v_passed_checks - 1;
    v_anomalies := v_anomalies || jsonb_build_object(
      'type', 'AR_GL_MISMATCH',
      'severity', 'CRITICAL',
      'title', 'AR Subledger does not reconcile with GL Control Account',
      'detail', format('Difference of %s between AR subledger (%s) and GL (%s)',
        v_ar_diff, v_reconcile->'ar'->>'subledger_total', v_reconcile->'ar'->>'gl_total')
    );
  END IF;

  IF v_ap_diff > 1.0 THEN
    v_passed_checks := v_passed_checks - 1;
    v_anomalies := v_anomalies || jsonb_build_object(
      'type', 'AP_GL_MISMATCH',
      'severity', 'CRITICAL',
      'title', 'AP Subledger does not reconcile with GL Control Account',
      'detail', format('Difference of %s between AP subledger (%s) and GL (%s)',
        v_ap_diff, v_reconcile->'ap'->>'subledger_total', v_reconcile->'ap'->>'gl_total')
    );
  END IF;

  -- Check 3: Stale unposted drafts (> 14 days old)
  SELECT COUNT(*) INTO v_unposted_old
  FROM public.fin_journal_entries
  WHERE fin_organization_id = p_org_id
    AND status IN ('DRAFT', 'PENDING_APPROVAL')
    AND created_at < now() - INTERVAL '14 days';

  IF v_unposted_old > 0 THEN
    v_passed_checks := v_passed_checks - 1;
    v_anomalies := v_anomalies || jsonb_build_object(
      'type', 'STALE_DRAFT_ENTRIES',
      'severity', 'WARNING',
      'title', format('%s stale unposted draft entries (>14 days)', v_unposted_old),
      'detail', 'Unposted drafts older than 14 days delay monthly closing and ledger accuracy.'
    );
  END IF;

  -- Check 4: Potential duplicate vendor bills (same vendor + total + bill_date)
  SELECT COUNT(*) INTO v_dup_bills
  FROM (
    SELECT vendor_id, bill_number, total, COUNT(*)
    FROM public.fin_bills
    WHERE fin_organization_id = p_org_id AND status != 'VOID'
    GROUP BY vendor_id, bill_number, total
    HAVING COUNT(*) > 1
  ) t;

  IF v_dup_bills > 0 THEN
    v_passed_checks := v_passed_checks - 1;
    v_anomalies := v_anomalies || jsonb_build_object(
      'type', 'DUPLICATE_BILLS',
      'severity', 'HIGH',
      'title', format('%s duplicate vendor bill sets detected', v_dup_bills),
      'detail', 'Multiple bills found with identical vendor, invoice number, and amount.'
    );
  END IF;

  -- Check 5: Orphan events (events in PENDING status for > 2 hours)
  SELECT COUNT(*) INTO v_orphan_events
  FROM public.fin_events
  WHERE fin_organization_id = p_org_id
    AND processing_status = 'PENDING'
    AND created_at < now() - INTERVAL '2 hours';

  IF v_orphan_events > 0 THEN
    v_passed_checks := v_passed_checks - 1;
    v_anomalies := v_anomalies || jsonb_build_object(
      'type', 'ORPHAN_EVENTS',
      'severity', 'WARNING',
      'title', format('%s unprocessed financial events (>2h old)', v_orphan_events),
      'detail', 'Events queued in fin_events have not been processed into the subledger/GL.'
    );
  END IF;

  -- Calculate score
  v_score := ROUND((v_passed_checks::numeric / v_total_checks::numeric) * 100.0, 2);
  IF v_score < 80.0 THEN v_report_status := 'CRITICAL';
  ELSIF v_score < 100.0 THEN v_report_status := 'WARNING';
  ELSE v_report_status := 'HEALTHY';
  END IF;

  -- Insert report snapshot
  INSERT INTO public.fin_integrity_reports (
    fin_organization_id, integrity_score, total_checks, passed_checks,
    ar_gl_diff, ap_gl_diff, cash_gl_diff, anomalies, status
  ) VALUES (
    p_org_id, v_score, v_total_checks, v_passed_checks,
    v_ar_diff, v_ap_diff, 0, v_anomalies, v_report_status
  );

  RETURN jsonb_build_object(
    'integrity_score', v_score,
    'status', v_report_status,
    'total_checks', v_total_checks,
    'passed_checks', v_passed_checks,
    'anomalies', v_anomalies,
    'checked_at', now()
  );
END; $function$;

CREATE OR REPLACE FUNCTION public.update_health_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.order_number := 'CHH' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.find_user_for_call(search_term text)
 RETURNS TABLE(id uuid, username text, phone_number text, is_online boolean, avatar_url text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.phone_number,
    p.is_online,
    p.avatar_url
  FROM profiles p
  WHERE 
    p.id::text = search_term OR
    p.phone_number = search_term OR
    p.phone_search = regexp_replace(search_term, '[^0-9]', '', 'g') OR
    p.email = search_term
  LIMIT 1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_kernel_event_mutation()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    RAISE EXCEPTION 'Kernel Events are immutable. UPDATE and DELETE operations are strictly prohibited.';
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_stealth_mode_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fin_generate_straight_line_schedules(p_obligation_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_pob public.fin_performance_obligations;
  v_contract public.fin_contracts;
  v_months INTEGER;
  v_monthly_amt NUMERIC(20,4);
  v_remainder NUMERIC(20,4);
  v_current_date DATE;
  v_sched_num INTEGER := 1;
  v_count INTEGER := 0;
  v_cur_amt NUMERIC(20,4);
BEGIN
  SELECT * INTO v_pob FROM public.fin_performance_obligations WHERE id = p_obligation_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Obligation % not found', p_obligation_id; END IF;

  SELECT * INTO v_contract FROM public.fin_contracts WHERE id = v_pob.contract_id;

  -- Delete existing scheduled (unrecognized) items
  DELETE FROM public.fin_revenue_schedules
  WHERE obligation_id = p_obligation_id AND status = 'SCHEDULED';

  -- Calculate months between start and end date
  v_months := GREATEST(1, (EXTRACT(YEAR FROM v_pob.end_date) - EXTRACT(YEAR FROM v_pob.start_date)) * 12 + (EXTRACT(MONTH FROM v_pob.end_date) - EXTRACT(MONTH FROM v_pob.start_date)) + 1);

  v_monthly_amt := TRUNC(v_pob.allocated_price / v_months, 2);
  v_remainder := v_pob.allocated_price - (v_monthly_amt * v_months);

  v_current_date := v_pob.start_date;

  FOR i IN 1..v_months LOOP
    -- Add remainder to the last month to ensure exact total sum
    IF i = v_months THEN
      v_cur_amt := v_monthly_amt + v_remainder;
    ELSE
      v_cur_amt := v_monthly_amt;
    END IF;

    INSERT INTO public.fin_revenue_schedules (
      contract_id, obligation_id, schedule_number, scheduled_date,
      scheduled_amount, currency, fx_rate, status
    ) VALUES (
      v_pob.contract_id, p_obligation_id, v_sched_num, v_current_date,
      v_cur_amt, v_contract.currency, v_contract.fx_rate, 'SCHEDULED'
    );

    v_sched_num := v_sched_num + 1;
    v_count := v_count + 1;
    v_current_date := (v_current_date + INTERVAL '1 month')::date;
  END LOOP;

  RETURN v_count;
END; $function$;

CREATE OR REPLACE FUNCTION public.update_provider_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE service_providers SET rating_average = (SELECT AVG(rating) FROM service_reviews WHERE provider_id = NEW.provider_id), rating_count = (SELECT COUNT(*) FROM service_reviews WHERE provider_id = NEW.provider_id) WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fin_run_revenue_integrity_check(p_org_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_anomalies JSONB := '[]'::jsonb;
  v_orphan_schedules INTEGER := 0;
  v_unscheduled_active_contracts INTEGER := 0;
  v_over_recognized_contracts INTEGER := 0;
  v_expired_active_contracts INTEGER := 0;
  v_total_checks INTEGER := 4;
  v_passed_checks INTEGER := 4;
  v_score NUMERIC(5,2) := 100.00;
  v_status TEXT := 'HEALTHY';
BEGIN
  -- Check 1: Active contracts with 0 revenue schedules
  SELECT COUNT(*) INTO v_unscheduled_active_contracts
  FROM public.fin_contracts c
  WHERE c.fin_organization_id = p_org_id
    AND c.status = 'ACTIVE'
    AND NOT EXISTS (SELECT 1 FROM public.fin_revenue_schedules s WHERE s.contract_id = c.id);

  IF v_unscheduled_active_contracts > 0 THEN
    v_passed_checks := v_passed_checks - 1;
    v_anomalies := v_anomalies || jsonb_build_object(
      'type', 'UNSCHEDULED_ACTIVE_CONTRACT',
      'severity', 'HIGH',
      'title', format('%s active contracts have zero revenue recognition schedules', v_unscheduled_active_contracts),
      'detail', 'Active contracts must have scheduled recognition obligations under ASC 606.'
    );
  END IF;

  -- Check 2: Recognized revenue exceeds contract transaction price
  SELECT COUNT(*) INTO v_over_recognized_contracts
  FROM public.fin_contracts
  WHERE fin_organization_id = p_org_id
    AND recognized_revenue > transaction_price + 0.01;

  IF v_over_recognized_contracts > 0 THEN
    v_passed_checks := v_passed_checks - 1;
    v_anomalies := v_anomalies || jsonb_build_object(
      'type', 'OVER_RECOGNIZED_CONTRACT',
      'severity', 'CRITICAL',
      'title', format('%s contracts have recognized revenue exceeding transaction price', v_over_recognized_contracts),
      'detail', 'Recognized revenue cannot exceed total allocated transaction price.'
    );
  END IF;

  -- Check 3: Expired contracts still in ACTIVE state
  SELECT COUNT(*) INTO v_expired_active_contracts
  FROM public.fin_contracts
  WHERE fin_organization_id = p_org_id
    AND status = 'ACTIVE'
    AND end_date < CURRENT_DATE
    AND deferred_revenue <= 0.01;

  IF v_expired_active_contracts > 0 THEN
    v_passed_checks := v_passed_checks - 1;
    v_anomalies := v_anomalies || jsonb_build_object(
      'type', 'EXPIRED_ACTIVE_CONTRACTS',
      'severity', 'WARNING',
      'title', format('%s contracts past end date still marked ACTIVE', v_expired_active_contracts),
      'detail', 'Fully recognized expired contracts should be transitioned to COMPLETED.'
    );
  END IF;

  v_score := ROUND((v_passed_checks::numeric / v_total_checks::numeric) * 100.0, 2);
  IF v_score < 80.0 THEN v_status := 'CRITICAL';
  ELSIF v_score < 100.0 THEN v_status := 'WARNING';
  ELSE v_status := 'HEALTHY';
  END IF;

  RETURN jsonb_build_object(
    'integrity_score', v_score,
    'status', v_status,
    'total_checks', v_total_checks,
    'passed_checks', v_passed_checks,
    'anomalies', v_anomalies,
    'checked_at', now()
  );
END; $function$;

CREATE OR REPLACE FUNCTION public.calculate_app_session_duration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.session_end IS NOT NULL AND OLD.session_end IS NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.session_end - NEW.session_start))::INTEGER;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fin_recognize_schedule_item(p_schedule_id uuid, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_sched public.fin_revenue_schedules;
  v_pob public.fin_performance_obligations;
  v_contract public.fin_contracts;
  v_je_id UUID;
  v_entry_num TEXT;
  v_period_id UUID;
  v_func_amt NUMERIC(20,4);
BEGIN
  SELECT * INTO v_sched FROM public.fin_revenue_schedules WHERE id = p_schedule_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Schedule item not found'); END IF;
  IF v_sched.status != 'SCHEDULED' THEN
    RETURN jsonb_build_object('success', false, 'error', format('Item is already in status: %s', v_sched.status));
  END IF;

  SELECT * INTO v_pob FROM public.fin_performance_obligations WHERE id = v_sched.obligation_id;
  SELECT * INTO v_contract FROM public.fin_contracts WHERE id = v_sched.contract_id;

  -- Find period for scheduled date
  SELECT id INTO v_period_id
  FROM public.fin_periods
  WHERE fin_organization_id = v_contract.fin_organization_id
    AND start_date <= v_sched.scheduled_date AND end_date >= v_sched.scheduled_date
  LIMIT 1;

  IF v_period_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No open accounting period found for scheduled date');
  END IF;

  v_entry_num := public.fin_next_entry_number(v_contract.fin_organization_id);
  v_func_amt := TRUNC(v_sched.scheduled_amount * v_sched.fx_rate, 2);

  -- 1. Insert Journal Entry (Double-Entry Header)
  INSERT INTO public.fin_journal_entries (
    fin_organization_id, legal_entity_id, period_id, entry_number, posting_date,
    transaction_currency, functional_currency, reporting_currency, fx_rate,
    source_type, source_id, entry_type, accounting_standard, status,
    memo, created_by, posted_by, posted_at
  ) VALUES (
    v_contract.fin_organization_id, v_contract.legal_entity_id, v_period_id, v_entry_num, v_sched.scheduled_date,
    v_sched.currency, 'INR', 'INR', v_sched.fx_rate,
    'REVENUE_RECOGNITION', v_contract.contract_number, 'REVENUE_RECOGNITION', v_contract.accounting_standard, 'POSTED',
    format('Revenue recognized for contract %s (%s)', v_contract.contract_number, v_pob.title),
    p_user_id, p_user_id, now()
  ) RETURNING id INTO v_je_id;

  -- 2. Line 1: Dr Deferred Revenue (Debit Liability -> decrease liability)
  INSERT INTO public.fin_journal_lines (
    journal_entry_id, line_number, account_id, debit_amount, credit_amount, currency,
    functional_debit, functional_credit, memo
  ) VALUES (
    v_je_id, 1, v_pob.deferred_rev_account_id, v_sched.scheduled_amount, 0, v_sched.currency,
    v_func_amt, 0, format('Deferred revenue released: %s', v_pob.title)
  );

  -- 3. Line 2: Cr Revenue (Credit Revenue -> increase revenue)
  INSERT INTO public.fin_journal_lines (
    journal_entry_id, line_number, account_id, debit_amount, credit_amount, currency,
    functional_debit, functional_credit, memo
  ) VALUES (
    v_je_id, 2, v_pob.revenue_account_id, 0, v_sched.scheduled_amount, v_sched.currency,
    0, v_func_amt, format('Revenue recognized: %s', v_pob.title)
  );

  -- 4. Mark Schedule Item as RECOGNIZED
  UPDATE public.fin_revenue_schedules
  SET
    status = 'RECOGNIZED',
    recognized_amount = scheduled_amount,
    recognized_at = now(),
    journal_entry_id = v_je_id,
    updated_at = now()
  WHERE id = p_schedule_id;

  -- 5. Update Contract totals
  UPDATE public.fin_contracts
  SET
    recognized_revenue = recognized_revenue + v_sched.scheduled_amount,
    deferred_revenue   = GREATEST(0, transaction_price - (recognized_revenue + v_sched.scheduled_amount)),
    updated_at = now()
  WHERE id = v_sched.contract_id;

  -- 6. Refresh Materialized Ledger View
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.fin_ledger_balances;

  RETURN jsonb_build_object(
    'success', true,
    'schedule_id', p_schedule_id,
    'journal_entry_id', v_je_id,
    'entry_number', v_entry_num,
    'recognized_amount', v_sched.scheduled_amount
  );
END; $function$;

CREATE OR REPLACE FUNCTION public.fin_match_bank_transactions(p_bank_account_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_tx RECORD;
  v_pmt RECORD;
  v_matched_count INTEGER := 0;
  v_exception_count INTEGER := 0;
BEGIN
  -- Loop through all UNMATCHED bank transactions for this account
  FOR v_tx IN
    SELECT * FROM public.fin_bank_transactions
    WHERE bank_account_id = p_bank_account_id AND match_status = 'UNMATCHED'
    ORDER BY transaction_date ASC
  LOOP
    -- Rule 1: Exact Reference Match + Amount Match (Incoming Payment)
    IF v_tx.transaction_type = 'CREDIT' AND v_tx.reference_number IS NOT NULL THEN
      SELECT * INTO v_pmt FROM public.fin_payments
      WHERE status = 'POSTED'
        AND reference_number = v_tx.reference_number
        AND amount = v_tx.amount
      LIMIT 1;

      IF FOUND THEN
        -- Match Found!
        UPDATE public.fin_bank_transactions
        SET match_status = 'AUTO_MATCHED', matched_payment_id = v_pmt.id, updated_at = now()
        WHERE id = v_tx.id;

        INSERT INTO public.fin_reconciliation_matches (
          bank_transaction_id, payment_id, match_rule, confidence_score,
          bank_amount, ledger_amount, fee_difference, variance
        ) VALUES (
          v_tx.id, v_pmt.id, 'EXACT_REF_AND_AMOUNT', 1.0,
          v_tx.amount, v_pmt.amount, 0, 0
        );

        v_matched_count := v_matched_count + 1;
        CONTINUE;
      END IF;
    END IF;

    -- Rule 2: Date Window (+/- 3 days) + Exact Amount Match
    IF v_tx.transaction_type = 'CREDIT' THEN
      SELECT * INTO v_pmt FROM public.fin_payments
      WHERE status = 'POSTED'
        AND amount = v_tx.amount
        AND payment_date BETWEEN (v_tx.transaction_date - INTERVAL '3 days')::date AND (v_tx.transaction_date + INTERVAL '3 days')::date
        AND NOT EXISTS (SELECT 1 FROM public.fin_bank_transactions bt WHERE bt.matched_payment_id = fin_payments.id)
      LIMIT 1;

      IF FOUND THEN
        UPDATE public.fin_bank_transactions
        SET match_status = 'AUTO_MATCHED', matched_payment_id = v_pmt.id, updated_at = now()
        WHERE id = v_tx.id;

        INSERT INTO public.fin_reconciliation_matches (
          bank_transaction_id, payment_id, match_rule, confidence_score,
          bank_amount, ledger_amount, fee_difference, variance
        ) VALUES (
          v_tx.id, v_pmt.id, 'DATE_WINDOW_AMOUNT', 0.95,
          v_tx.amount, v_pmt.amount, 0, 0
        );

        v_matched_count := v_matched_count + 1;
        CONTINUE;
      END IF;
    END IF;

    -- If no rule matched, insert into Exception Queue for AI / Human review
    INSERT INTO public.fin_reconciliation_exceptions (
      bank_transaction_id, exception_type, severity, suggested_action, status
    ) VALUES (
      v_tx.id, 'UNRECOGNIZED_TRANSACTION', 'MEDIUM',
      'Review counterparty narrative or assign to customer invoice / vendor bill', 'OPEN'
    ) ON CONFLICT DO NOTHING;

    v_exception_count := v_exception_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'matched_count', v_matched_count,
    'exception_count', v_exception_count,
    'processed_at', now()
  );
END; $function$;

CREATE OR REPLACE FUNCTION public.phonebook_opt_out(p_phone_hash text, p_reason text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.phonebook_opt_outs (phone_hash, reason)
  VALUES (p_phone_hash, p_reason)
  ON CONFLICT (phone_hash) DO NOTHING;

  UPDATE public.contacts_hash SET opt_out = true, updated_at = now()
  WHERE phone_hash = p_phone_hash;

  DELETE FROM public.contacts_name_votes WHERE phone_hash = p_phone_hash;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_user_contacts(user_uuid uuid, contact_list jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  contact_item jsonb;
  matched_user_id uuid;
BEGIN
  FOR contact_item IN SELECT * FROM jsonb_array_elements(contact_list)
  LOOP
    IF contact_item->>'email' IS NOT NULL THEN
      SELECT id INTO matched_user_id
      FROM profiles
      WHERE email = contact_item->>'email'
      LIMIT 1;
      
      IF matched_user_id IS NOT NULL THEN
        INSERT INTO contacts (user_id, contact_user_id, contact_name, contact_phone, is_registered)
        VALUES (
          user_uuid,
          matched_user_id,
          contact_item->>'name',
          contact_item->>'phone',
          true
        )
        ON CONFLICT (user_id, contact_phone) 
        DO UPDATE SET 
          contact_user_id = matched_user_id,
          is_registered = true,
          contact_name = EXCLUDED.contact_name;
        
        CONTINUE;
      END IF;
    END IF;
    
    IF contact_item->>'phone' IS NOT NULL THEN
      SELECT id INTO matched_user_id
      FROM profiles
      WHERE phone_number = contact_item->>'phone'
      LIMIT 1;
      
      IF matched_user_id IS NOT NULL THEN
        INSERT INTO contacts (user_id, contact_user_id, contact_name, contact_phone, is_registered)
        VALUES (
          user_uuid,
          matched_user_id,
          contact_item->>'name',
          contact_item->>'phone',
          true
        )
        ON CONFLICT (user_id, contact_phone) 
        DO UPDATE SET 
          contact_user_id = matched_user_id,
          is_registered = true,
          contact_name = EXCLUDED.contact_name;
      ELSE
        INSERT INTO contacts (user_id, contact_name, contact_phone, is_registered)
        VALUES (
          user_uuid,
          contact_item->>'name',
          contact_item->>'phone',
          false
        )
        ON CONFLICT (user_id, contact_phone) 
        DO UPDATE SET contact_name = EXCLUDED.contact_name;
      END IF;
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.bos_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_append_only()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    RAISE EXCEPTION 'The os_events table is append-only. UPDATE and DELETE operations are strictly prohibited.';
    RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fin_calculate_90_day_cash_forecast(p_org_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_actual_cash NUMERIC(20,4) := 0;
  v_ar_due_30   NUMERIC(20,4) := 0;
  v_ar_due_60   NUMERIC(20,4) := 0;
  v_ar_due_90   NUMERIC(20,4) := 0;
  v_ap_due_30   NUMERIC(20,4) := 0;
  v_ap_due_60   NUMERIC(20,4) := 0;
  v_ap_due_90   NUMERIC(20,4) := 0;
  v_contracts_30 NUMERIC(20,4) := 0;
  v_contracts_60 NUMERIC(20,4) := 0;
  v_contracts_90 NUMERIC(20,4) := 0;
  v_net_cash_30  NUMERIC(20,4) := 0;
  v_net_cash_60  NUMERIC(20,4) := 0;
  v_net_cash_90  NUMERIC(20,4) := 0;
BEGIN
  -- 1. Actual Cash in Bank Accounts
  SELECT COALESCE(SUM(current_statement_balance), 0) INTO v_actual_cash
  FROM public.fin_bank_accounts
  WHERE fin_organization_id = p_org_id AND is_active = true;

  -- 2. Expected Inflows: Outstanding AR Invoices Due
  SELECT
    COALESCE(SUM(CASE WHEN due_date <= CURRENT_DATE + INTERVAL '30 days' THEN amount_due ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN due_date > CURRENT_DATE + INTERVAL '30 days' AND due_date <= CURRENT_DATE + INTERVAL '60 days' THEN amount_due ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN due_date > CURRENT_DATE + INTERVAL '60 days' AND due_date <= CURRENT_DATE + INTERVAL '90 days' THEN amount_due ELSE 0 END), 0)
  INTO v_ar_due_30, v_ar_due_60, v_ar_due_90
  FROM public.fin_invoices
  WHERE fin_organization_id = p_org_id AND status IN ('ISSUED', 'PARTIALLY_PAID');

  -- 3. Expected Inflows: Contract Scheduled Releases
  SELECT
    COALESCE(SUM(CASE WHEN scheduled_date <= CURRENT_DATE + INTERVAL '30 days' THEN scheduled_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN scheduled_date > CURRENT_DATE + INTERVAL '30 days' AND scheduled_date <= CURRENT_DATE + INTERVAL '60 days' THEN scheduled_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN scheduled_date > CURRENT_DATE + INTERVAL '60 days' AND scheduled_date <= CURRENT_DATE + INTERVAL '90 days' THEN scheduled_amount ELSE 0 END), 0)
  INTO v_contracts_30, v_contracts_60, v_contracts_90
  FROM public.fin_revenue_schedules
  WHERE contract_id IN (SELECT id FROM fin_contracts WHERE fin_organization_id = p_org_id AND status = 'ACTIVE')
    AND status = 'SCHEDULED';

  -- 4. Expected Outflows: AP Bills Due
  SELECT
    COALESCE(SUM(CASE WHEN due_date <= CURRENT_DATE + INTERVAL '30 days' THEN amount_due ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN due_date > CURRENT_DATE + INTERVAL '30 days' AND due_date <= CURRENT_DATE + INTERVAL '60 days' THEN amount_due ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN due_date > CURRENT_DATE + INTERVAL '60 days' AND due_date <= CURRENT_DATE + INTERVAL '90 days' THEN amount_due ELSE 0 END), 0)
  INTO v_ap_due_30, v_ap_due_60, v_ap_due_90
  FROM public.fin_bills
  WHERE fin_organization_id = p_org_id AND status IN ('APPROVED', 'PARTIALLY_PAID');

  -- 5. Calculate 30 / 60 / 90 Net Cash Position
  v_net_cash_30 := v_actual_cash + v_ar_due_30 - v_ap_due_30;
  v_net_cash_60 := v_net_cash_30 + v_ar_due_60 - v_ap_due_60;
  v_net_cash_90 := v_net_cash_60 + v_ar_due_90 - v_ap_due_90;

  RETURN jsonb_build_object(
    'actual_cash', v_actual_cash,
    'day_30', jsonb_build_object('inflows', v_ar_due_30, 'outflows', v_ap_due_30, 'net_cash_position', v_net_cash_30),
    'day_60', jsonb_build_object('inflows', v_ar_due_60, 'outflows', v_ap_due_60, 'net_cash_position', v_net_cash_60),
    'day_90', jsonb_build_object('inflows', v_ar_due_90, 'outflows', v_ap_due_90, 'net_cash_position', v_net_cash_90),
    'calculated_at', now()
  );
END; $function$;

CREATE OR REPLACE FUNCTION public.fin_initialize_close_checklist(p_period_id uuid, p_entity_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_period public.fin_periods;
  v_chk_id UUID;
BEGIN
  SELECT * INTO v_period FROM public.fin_periods WHERE id = p_period_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Period not found'; END IF;

  INSERT INTO public.fin_close_checklists (
    fin_organization_id, legal_entity_id, period_id, title, total_tasks, completed_tasks, completion_pct, status
  ) VALUES (
    v_period.fin_organization_id, p_entity_id, p_period_id,
    format('Month-End Close: %s', v_period.period_name),
    8, 0, 0, 'IN_PROGRESS'
  )
  ON CONFLICT (period_id, legal_entity_id) DO UPDATE SET updated_at = now()
  RETURNING id INTO v_chk_id;

  -- Seed Standard 8 Close Tasks in Required Sequence
  INSERT INTO public.fin_close_tasks (checklist_id, task_code, task_name, sequence_order, category, status)
  VALUES
    (v_chk_id, 'AR_RECON', 'Reconcile Accounts Receivable Subledger to GL', 1, 'SUBLEDGER_RECON', 'PENDING'),
    (v_chk_id, 'AP_RECON', 'Reconcile Accounts Payable Subledger to GL', 2, 'SUBLEDGER_RECON', 'PENDING'),
    (v_chk_id, 'BANK_RECON', 'Complete Bank Account Reconciliations', 3, 'SUBLEDGER_RECON', 'PENDING'),
    (v_chk_id, 'REV_REC', 'Execute ASC 606 Revenue Recognition Schedules', 4, 'REVENUE_EXPENSE', 'PENDING'),
    (v_chk_id, 'ACCRUALS_PREPAIDS', 'Post Expense Accruals & Prepaid Amortizations', 5, 'REVENUE_EXPENSE', 'PENDING'),
    (v_chk_id, 'FIXED_ASSETS', 'Run Monthly Depreciation Schedules', 6, 'ASSET_LIABILITY', 'PENDING'),
    (v_chk_id, 'TAX_COMPLIANCE', 'Validate GST / TDS / Tax Output Balances', 7, 'TAX_COMPLIANCE', 'PENDING'),
    (v_chk_id, 'FINAL_SIGNOFF', 'Financial Integrity Verification & Management Review', 8, 'REVIEW_SIGNOFF', 'PENDING')
  ON CONFLICT (checklist_id, task_code) DO NOTHING;

  RETURN v_chk_id;
END; $function$;

CREATE OR REPLACE FUNCTION public.fin_generate_financial_statements(p_org_id uuid, p_entity_id uuid, p_period_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_revenue NUMERIC(20,4) := 0;
  v_cogs    NUMERIC(20,4) := 0;
  v_opex    NUMERIC(20,4) := 0;
  v_assets  NUMERIC(20,4) := 0;
  v_liab    NUMERIC(20,4) := 0;
  v_equity  NUMERIC(20,4) := 0;
  v_net_inc NUMERIC(20,4) := 0;
BEGIN
  -- 1. P&L: Revenue
  SELECT COALESCE(SUM(jl.functional_credit - jl.functional_debit), 0) INTO v_revenue
  FROM public.fin_journal_lines jl
  JOIN public.fin_journal_entries je ON je.id = jl.journal_entry_id
  JOIN public.fin_accounts fa ON fa.id = jl.account_id
  WHERE je.fin_organization_id = p_org_id
    AND (je.legal_entity_id = p_entity_id OR p_entity_id IS NULL)
    AND je.period_id = p_period_id
    AND je.status = 'POSTED'
    AND fa.account_type IN ('REVENUE', 'CONTRA_EXPENSE');

  -- 2. P&L: Operating Expenses
  SELECT COALESCE(SUM(jl.functional_debit - jl.functional_credit), 0) INTO v_opex
  FROM public.fin_journal_lines jl
  JOIN public.fin_journal_entries je ON je.id = jl.journal_entry_id
  JOIN public.fin_accounts fa ON fa.id = jl.account_id
  WHERE je.fin_organization_id = p_org_id
    AND (je.legal_entity_id = p_entity_id OR p_entity_id IS NULL)
    AND je.period_id = p_period_id
    AND je.status = 'POSTED'
    AND fa.account_type IN ('EXPENSE', 'CONTRA_REVENUE');

  v_net_inc := v_revenue - v_opex;

  -- 3. Balance Sheet: Assets
  SELECT COALESCE(SUM(jl.functional_debit - jl.functional_credit), 0) INTO v_assets
  FROM public.fin_journal_lines jl
  JOIN public.fin_journal_entries je ON je.id = jl.journal_entry_id
  JOIN public.fin_accounts fa ON fa.id = jl.account_id
  WHERE je.fin_organization_id = p_org_id
    AND (je.legal_entity_id = p_entity_id OR p_entity_id IS NULL)
    AND je.status = 'POSTED'
    AND fa.account_type IN ('ASSET', 'CONTRA_LIABILITY');

  -- 4. Balance Sheet: Liabilities
  SELECT COALESCE(SUM(jl.functional_credit - jl.functional_debit), 0) INTO v_liab
  FROM public.fin_journal_lines jl
  JOIN public.fin_journal_entries je ON je.id = jl.journal_entry_id
  JOIN public.fin_accounts fa ON fa.id = jl.account_id
  WHERE je.fin_organization_id = p_org_id
    AND (je.legal_entity_id = p_entity_id OR p_entity_id IS NULL)
    AND je.status = 'POSTED'
    AND fa.account_type IN ('LIABILITY', 'CONTRA_ASSET');

  v_equity := v_assets - v_liab;

  RETURN jsonb_build_object(
    'pnl', jsonb_build_object(
      'total_revenue', v_revenue,
      'operating_expenses', v_opex,
      'net_income', v_net_inc,
      'gross_margin_pct', CASE WHEN v_revenue > 0 THEN ROUND((v_net_inc / v_revenue) * 100.0, 2) ELSE 0 END
    ),
    'balance_sheet', jsonb_build_object(
      'total_assets', v_assets,
      'total_liabilities', v_liab,
      'total_equity', v_equity,
      'is_balanced', ABS(v_assets - (v_liab + v_equity)) <= 0.01
    ),
    'generated_at', now()
  );
END; $function$;

CREATE OR REPLACE FUNCTION public.kg_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_cache_hit(cache_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.search_cache
  SET 
    hit_count = hit_count + 1,
    last_updated = now()
  WHERE id = cache_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_mobile_action_queue_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_dpdp_opt_out()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF EXISTS (SELECT 1 FROM public.dpdp_opt_outs WHERE hashed_number = NEW.hashed_number) THEN
        RETURN NULL; -- Silently discard
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_cron_jobs_health(name_filter text DEFAULT '%digest%'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'cron'
AS $function$
DECLARE
  result jsonb;
BEGIN
  -- Only admins/ceos can call
  IF NOT (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'ceo'::public.app_role)
  ) THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_jsonb(t)), '[]'::jsonb)
  INTO result
  FROM (
    SELECT
      j.jobid,
      j.jobname,
      j.schedule,
      j.active,
      (
        SELECT row_to_jsonb(lr)
        FROM (
          SELECT r.runid, r.status, r.return_message, r.start_time, r.end_time,
                 EXTRACT(EPOCH FROM (r.end_time - r.start_time)) * 1000 AS duration_ms
          FROM cron.job_run_details r
          WHERE r.jobid = j.jobid
          ORDER BY r.start_time DESC NULLS LAST
          LIMIT 1
        ) lr
      ) AS last_run,
      (
        SELECT COALESCE(jsonb_agg(row_to_jsonb(rr) ORDER BY rr.start_time DESC), '[]'::jsonb)
        FROM (
          SELECT r.runid, r.status, r.return_message, r.start_time, r.end_time,
                 EXTRACT(EPOCH FROM (r.end_time - r.start_time)) * 1000 AS duration_ms
          FROM cron.job_run_details r
          WHERE r.jobid = j.jobid
          ORDER BY r.start_time DESC NULLS LAST
          LIMIT 20
        ) rr
      ) AS recent_runs,
      (
        SELECT COUNT(*)::int FROM cron.job_run_details r
        WHERE r.jobid = j.jobid AND r.status = 'failed'
          AND r.start_time > now() - interval '24 hours'
      ) AS failures_24h,
      (
        SELECT COUNT(*)::int FROM cron.job_run_details r
        WHERE r.jobid = j.jobid AND r.start_time > now() - interval '24 hours'
      ) AS runs_24h,
      (
        SELECT COUNT(*)::int FROM cron.job_run_details r
        WHERE r.jobid = j.jobid AND r.status = 'running'
      ) AS currently_running
    FROM cron.job j
    WHERE j.jobname ILIKE name_filter
  ) t;

  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.toggle_message_reaction(p_message_id uuid, p_user_id uuid, p_emoji text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_reactions JSONB;
  v_new_reactions JSONB;
  v_reaction JSONB;
  v_found BOOLEAN := FALSE;
BEGIN
  -- Get current reactions
  SELECT COALESCE(reactions, '[]'::jsonb) INTO v_reactions
  FROM messages
  WHERE id = p_message_id;

  -- Check if user already reacted with this emoji
  v_new_reactions := '[]'::jsonb;
  
  FOR v_reaction IN SELECT * FROM jsonb_array_elements(v_reactions)
  LOOP
    IF v_reaction->>'user_id' = p_user_id::TEXT AND v_reaction->>'emoji' = p_emoji THEN
      v_found := TRUE;
      -- Skip this reaction (remove it)
    ELSE
      v_new_reactions := v_new_reactions || v_reaction;
    END IF;
  END LOOP;

  -- If not found, add the reaction
  IF NOT v_found THEN
    v_new_reactions := v_new_reactions || jsonb_build_object(
      'emoji', p_emoji,
      'user_id', p_user_id,
      'created_at', NOW()
    );
  END IF;

  -- Update the message
  UPDATE messages
  SET reactions = v_new_reactions
  WHERE id = p_message_id;

  RETURN v_new_reactions;
END;
$function$;

CREATE OR REPLACE FUNCTION public.lookup_caller_id(p_phone text)
 RETURNS TABLE(community_name text, spam_percentage real, total_reports integer, community_label character varying, most_common_type character varying)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT community_name, spam_percentage, total_reports, community_label, most_common_type
  FROM caller_id_aggregates
  WHERE phone_number = p_phone;
$function$;

CREATE OR REPLACE FUNCTION public.normalize_phone_search()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.phone_number IS NOT NULL THEN
    NEW.phone_search = regexp_replace(NEW.phone_number, '[\s\-]', '', 'g');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_messages()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM public.messages 
    WHERE expires_at IS NOT NULL 
      AND expires_at < NOW() 
      AND is_expired = FALSE
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_trending_searches()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.trending_searches (query, category, search_count, last_searched_at)
  VALUES (NEW.query_text, NEW.category, 1, NEW.timestamp)
  ON CONFLICT (query) 
  DO UPDATE SET 
    search_count = trending_searches.search_count + 1,
    last_searched_at = NEW.timestamp,
    category = COALESCE(EXCLUDED.category, trending_searches.category);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_username text;
  v_phone text;
BEGIN
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone_number',
    'User_' || substring(NEW.id::text from 1 for 8)
  );
  
  v_phone := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'phone_number'
  );
  
  -- Create profile
  INSERT INTO public.profiles (
    id, username, avatar_url, email, phone_number, onboarding_completed
  )
  VALUES (
    NEW.id, v_username, NEW.raw_user_meta_data->>'avatar_url', NEW.email, v_phone, false
  )
  ON CONFLICT (id) DO UPDATE SET
    phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    username = COALESCE(EXCLUDED.username, public.profiles.username),
    onboarding_completed = false,
    updated_at = now();
  
  -- Award welcome points (only if not already awarded)
  INSERT INTO public.user_points (user_id, balance, lifetime_earned)
  VALUES (NEW.id, 100, 100)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Record transaction (only if not already recorded)
  INSERT INTO public.point_transactions (user_id, amount, transaction_type, source, description)
  VALUES (NEW.id, 100, 'earn', 'signup_bonus', 'Welcome to Chatr! 🎉')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_api_limit(api text, daily_max integer DEFAULT 10000)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_usage INTEGER;
  result JSONB;
BEGIN
  INSERT INTO public.chatr_api_usage (api_name, date, request_count, daily_limit)
  VALUES (api, CURRENT_DATE, 1, daily_max)
  ON CONFLICT (api_name, date) 
  DO UPDATE SET request_count = public.chatr_api_usage.request_count + 1
  RETURNING request_count INTO current_usage;
  
  result := jsonb_build_object(
    'current', current_usage,
    'limit', daily_max,
    'remaining', daily_max - current_usage,
    'allowed', current_usage <= (daily_max * 0.9)
  );
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.purge_on_dpdp_opt_out()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    DELETE FROM public.contact_label_frequencies WHERE hashed_number = NEW.hashed_number;
    DELETE FROM public.contact_label_votes WHERE hashed_number = NEW.hashed_number;
    -- Intentionally NOT deleting from caller_reports to prevent reputation laundering
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_contact_label_frequency()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.contact_label_frequencies (hashed_number, normalized_label, frequency_count)
    VALUES (NEW.hashed_number, NEW.normalized_label, 1)
    ON CONFLICT (hashed_number, normalized_label)
    DO UPDATE SET
        frequency_count = public.contact_label_frequencies.frequency_count + 1,
        updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.bump_circle_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.wellness_circles SET members_count = members_count + 1 WHERE id = NEW.circle_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.wellness_circles SET members_count = GREATEST(members_count - 1, 0) WHERE id = OLD.circle_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $function$;

CREATE OR REPLACE FUNCTION public.bump_wellness_community_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.wellness_communities SET members_count = members_count + 1 WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.wellness_communities SET members_count = GREATEST(members_count - 1, 0) WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $function$;

CREATE OR REPLACE FUNCTION public.bump_story_likes_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.wellness_stories SET likes_count = likes_count + 1 WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.wellness_stories SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $function$;

CREATE OR REPLACE FUNCTION public.bump_post_likes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.official_account_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.official_account_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $function$;

CREATE OR REPLACE FUNCTION public.add_call_participant(p_call_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE calls 
  SET is_group = true
  WHERE id = p_call_id;
  
  INSERT INTO call_participants (call_id, user_id, audio_enabled, video_enabled, is_active)
  VALUES (p_call_id, p_user_id, true, true, true)
  ON CONFLICT (call_id, user_id) DO NOTHING;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_chatr_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_business_owner(_business_id uuid, _user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM business_profiles
    WHERE id = _business_id
    AND user_id = _user_id
  )
$function$;

CREATE OR REPLACE FUNCTION public.increment_job_applications_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.job_listings SET applications_count = applications_count + 1 WHERE id = NEW.job_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_last_seen()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.last_seen_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_community_members(community_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE conversations
  SET member_count = COALESCE(member_count, 0) + 1
  WHERE id = community_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_approve_verified_developer()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF (SELECT is_verified FROM developer_profiles WHERE id = NEW.developer_id) = true
     AND (SELECT COUNT(*) FROM app_submissions WHERE developer_id = NEW.developer_id AND submission_status = 'approved') < 2 THEN
    NEW.submission_status := 'approved';
    NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_phone_hash()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.phone_number IS NOT NULL AND (NEW.phone_hash IS NULL OR OLD.phone_number IS DISTINCT FROM NEW.phone_number) THEN
    NEW.phone_hash := NULL;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.encrypt_health_value(value numeric, user_id uuid)
 RETURNS bytea
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN pgp_sym_encrypt(
    value::text, 
    encode(digest(user_id::text || 'chatr_health_key_v1', 'sha256'), 'hex')
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_lead_last_contacted()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.activity_type IN ('call', 'meeting', 'email', 'message') AND NEW.completed_at IS NOT NULL THEN
    UPDATE crm_leads
    SET last_contacted_at = NEW.completed_at
    WHERE id = NEW.lead_id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_workspace_owner(_workspace_id uuid, _user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = _workspace_id AND w.owner_id = _user_id
  )
$function$;

CREATE OR REPLACE FUNCTION public.enforce_server_abuse_limit(p_action text, p_client_identifier text, p_destination_hash text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_disappearing_messages()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM messages
  WHERE created_at < NOW() - INTERVAL '1 second' * (
    SELECT COALESCE(disappearing_messages_duration, 0)
    FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND disappearing_messages_duration IS NOT NULL
  )
  AND EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND disappearing_messages_duration IS NOT NULL
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id uuid, _user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = _workspace_id AND w.owner_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.workspace_members m
    WHERE m.workspace_id = _workspace_id AND m.user_id = _user_id
  )
$function$;

CREATE OR REPLACE FUNCTION public.decrypt_health_value(encrypted_value bytea, user_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF encrypted_value IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN pgp_sym_decrypt(
    encrypted_value,
    encode(digest(user_id::text || 'chatr_health_key_v1', 'sha256'), 'hex')
  )::numeric;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_user_referral_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_code text;
  user_id_val uuid;
BEGIN
  user_id_val := auth.uid();
  SELECT code INTO new_code FROM referral_codes WHERE user_id = user_id_val;
  IF new_code IS NOT NULL THEN RETURN new_code; END IF;
  new_code := upper(substring(md5(random()::text) from 1 for 8));
  INSERT INTO referral_codes (user_id, code) VALUES (user_id_val, new_code) RETURNING code INTO new_code;
  RETURN new_code;
END;
$function$;

CREATE OR REPLACE FUNCTION public.community_post_likes_counter()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $function$;

CREATE OR REPLACE FUNCTION public.encrypt_kyc_on_save()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.document_number IS NOT NULL THEN
    NEW.document_number_encrypted := encrypt_kyc_value(NEW.document_number, NEW.user_id);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_contacts_trust()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_count INTEGER; v_uid UUID;
BEGIN
  v_uid := COALESCE(NEW.user_id, OLD.user_id);
  SELECT COUNT(*) INTO v_count FROM public.contacts WHERE user_id = v_uid;
  IF v_count >= 5 THEN
    PERFORM public.award_trust_factor(v_uid, 'usage_history', 70, 0.7, 'contacts_synced');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_old_fcm_delivery_logs()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.fcm_delivery_logs WHERE created_at < now() - INTERVAL '7 days';
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_context_cache()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.call_context_cache WHERE expires_at < NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.encrypt_bmi_on_save()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.weight_encrypted := encrypt_health_value(NEW.weight_kg, NEW.user_id);
  NEW.height_encrypted := encrypt_health_value(NEW.height_cm, NEW.user_id);
  NEW.bmi_encrypted := encrypt_health_value(NEW.bmi_value, NEW.user_id);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_call_participants(p_call_id uuid)
 RETURNS TABLE(user_id uuid, username text, avatar_url text, audio_enabled boolean, video_enabled boolean, is_active boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    cp.user_id,
    p.username,
    p.avatar_url,
    cp.audio_enabled,
    cp.video_enabled,
    cp.is_active
  FROM call_participants cp
  JOIN profiles p ON p.id = cp.user_id
  WHERE cp.call_id = p_call_id
  AND cp.is_active = true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_tutor_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE tutors 
  SET rating_average = (
    SELECT AVG(rating) FROM tutor_reviews WHERE tutor_id = NEW.tutor_id
  )
  WHERE id = NEW.tutor_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.haversine_distance_km(lat1 numeric, lng1 numeric, lat2 numeric, lng2 numeric)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  R CONSTANT NUMERIC := 6371;
  dlat NUMERIC;
  dlng NUMERIC;
  a NUMERIC;
  c NUMERIC;
BEGIN
  IF lat1 IS NULL OR lng1 IS NULL OR lat2 IS NULL OR lng2 IS NULL THEN
    RETURN NULL;
  END IF;
  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2) * sin(dlng/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN ROUND((R * c)::NUMERIC, 2);
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_gsc_opportunities(p_property_id character varying)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_inserted INT := 0;
BEGIN
    DELETE FROM public.gsc_opportunities WHERE property_id = p_property_id;

    INSERT INTO public.gsc_opportunities (
        property_id, query, target_page, country, quadrant,
        current_position, impressions, clicks, ctr, commercial_intent,
        opportunity_score, recommended_action, status
    )
    SELECT 
        q.property_id,
        q.query,
        q.page,
        q.country,
        CASE 
            WHEN q.position BETWEEN 4.0 AND 10.0 AND q.impressions >= 100 THEN 'WIN_NOW'
            WHEN q.position BETWEEN 10.1 AND 20.0 AND q.impressions >= 50 THEN 'ATTACK'
            WHEN q.position > 20.0 AND q.impressions >= 200 THEN 'CREATE'
            WHEN q.position <= 5.0 AND q.ctr < 0.05 AND q.impressions >= 100 THEN 'FIX'
            ELSE 'EXPAND'
        END AS quadrant,
        q.position,
        q.impressions,
        q.clicks,
        q.ctr,
        CASE
            WHEN q.query ILIKE '%call%' OR q.query ILIKE '%free%' OR q.query ILIKE '%alternative%' OR q.query ILIKE '%without phone%' THEN 'HIGH'
            WHEN q.query ILIKE '%business%' OR q.query ILIKE '%inbox%' OR q.query ILIKE '%tool%' THEN 'MEDIUM'
            ELSE 'LOW'
        END AS commercial_intent,
        (
            q.impressions * 
            (0.15 - LEAST(0.15, q.ctr)) * 
            (CASE WHEN q.position <= 10 THEN 2.0 WHEN q.position <= 20 THEN 1.5 ELSE 1.0 END) *
            (CASE 
                WHEN q.query ILIKE '%call%' OR q.query ILIKE '%free%' OR q.query ILIKE '%without phone%' THEN 2.5
                ELSE 1.0 
             END)
        )::NUMERIC(8,2) AS opportunity_score,
        CASE 
            WHEN q.position BETWEEN 4.0 AND 10.0 THEN 'Optimize above-the-fold content and internal links to reach Top 3'
            WHEN q.position BETWEEN 10.1 AND 20.0 THEN 'Publish targeted cohort page with dedicated intent FAQs and schema'
            WHEN q.position > 20.0 THEN 'Create dedicated free tool or comparison landing page'
            WHEN q.position <= 5.0 AND q.ctr < 0.05 THEN 'Rewrite meta title and OpenGraph description to improve SERP click-through'
            ELSE 'Localize into regional hub and add WhatsApp invitation anchor'
        END AS recommended_action,
        'DETECTED'
    FROM (
        SELECT 
            property_id, query, page, country,
            SUM(clicks) as clicks,
            SUM(impressions) as impressions,
            AVG(position)::NUMERIC(5,2) as position,
            (SUM(clicks)::NUMERIC / NULLIF(SUM(impressions), 0))::NUMERIC(6,4) as ctr
        FROM public.gsc_queries
        WHERE property_id = p_property_id
        GROUP BY property_id, query, page, country
        HAVING SUM(impressions) >= 20
    ) q;

    GET DIAGNOSTICS v_inserted = ROW_COUNT;
    RETURN v_inserted;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_sso_token(app_id_param uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  token_value text;
  user_id_val uuid;
BEGIN
  user_id_val := auth.uid();
  
  IF user_id_val IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Use MD5 hash of random and timestamp for token generation
  token_value := encode(digest(random()::text || clock_timestamp()::text || user_id_val::text, 'sha256'), 'base64');
  
  INSERT INTO sso_tokens (token, user_id, app_id, expires_at)
  VALUES (token_value, user_id_val, app_id_param, now() + interval '5 minutes');
  
  RETURN token_value;
END;
$function$;

CREATE OR REPLACE FUNCTION public.community_post_comments_counter()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $function$;

CREATE OR REPLACE FUNCTION public.update_follower_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE official_accounts 
    SET follower_count = follower_count + 1
    WHERE id = NEW.account_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE official_accounts 
    SET follower_count = follower_count - 1
    WHERE id = OLD.account_id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_messages_trust()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.sender_id IS NOT NULL THEN
    PERFORM public.award_trust_factor(NEW.sender_id, 'response_rate', 60, 0.4, 'first_message');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_conversations_optimized(p_user_id uuid)
 RETURNS TABLE(id uuid, group_name text, group_icon_url text, is_group boolean, is_community boolean, community_description text, lastmessage text, lastmessagetime timestamp with time zone, otheruser jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH user_convs AS (
    SELECT cp.conversation_id
    FROM conversation_participants cp
    WHERE cp.user_id = p_user_id
    LIMIT 50
  ),
  last_messages AS (
    SELECT DISTINCT ON (m.conversation_id)
      m.conversation_id,
      m.content,
      m.created_at
    FROM messages m
    WHERE m.conversation_id IN (SELECT conversation_id FROM user_convs)
    ORDER BY m.conversation_id, m.created_at DESC
  ),
  other_users AS (
    SELECT DISTINCT ON (cp.conversation_id)
      cp.conversation_id,
      jsonb_build_object(
        'id', p.id,
        'username', p.username,
        'avatar_url', p.avatar_url,
        'is_online', p.is_online
      ) as user_data
    FROM conversation_participants cp
    JOIN profiles p ON p.id = cp.user_id
    JOIN conversations c ON c.id = cp.conversation_id
    WHERE cp.conversation_id IN (SELECT conversation_id FROM user_convs)
      AND cp.user_id != p_user_id
      AND c.is_group = false
  )
  SELECT 
    c.id,
    c.group_name,
    c.group_icon_url,
    c.is_group,
    c.is_community,
    c.community_description,
    lm.content as lastmessage,
    lm.created_at as lastmessagetime,
    ou.user_data as otheruser
  FROM conversations c
  JOIN user_convs uc ON uc.conversation_id = c.id
  LEFT JOIN last_messages lm ON lm.conversation_id = c.id
  LEFT JOIN other_users ou ON ou.conversation_id = c.id
  ORDER BY lm.created_at DESC NULLS LAST;
END;
$function$;

CREATE OR REPLACE FUNCTION public.track_brand_impression(p_brand_id uuid, p_placement_id uuid, p_user_id uuid, p_impression_type text, p_detected_object text DEFAULT NULL::text, p_duration integer DEFAULT 0)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_cost INTEGER;
  v_impression_id UUID;
  v_budget INTEGER;
BEGIN
  -- Get cost based on impression type
  SELECT 
    CASE 
      WHEN p_impression_type = 'interaction' THEN cost_per_interaction
      ELSE cost_per_impression
    END,
    budget_remaining
  INTO v_cost, v_budget
  FROM brand_partnerships
  WHERE id = p_brand_id;
  
  -- Check if brand has budget
  IF v_budget < v_cost THEN
    RAISE EXCEPTION 'Insufficient brand budget';
  END IF;
  
  -- Record impression
  INSERT INTO brand_impressions (
    brand_id, placement_id, user_id, impression_type, 
    detected_object, duration_seconds
  )
  VALUES (
    p_brand_id, p_placement_id, p_user_id, p_impression_type,
    p_detected_object, p_duration
  )
  RETURNING id INTO v_impression_id;
  
  -- Deduct from budget
  UPDATE brand_partnerships
  SET budget_remaining = budget_remaining - v_cost
  WHERE id = p_brand_id;
  
  RETURN v_impression_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_badge_trust()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_value NUMERIC;
BEGIN
  IF COALESCE(NEW.is_active, true) = true THEN
    v_value := CASE NEW.badge_type
      WHEN 'elite' THEN 100 WHEN 'premium' THEN 90
      WHEN 'verified' THEN 85 ELSE 70 END;
    PERFORM public.award_trust_factor(NEW.user_id, 'kyc_verified', v_value, 2.0, 'badge_' || NEW.badge_type);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.recompute_champions()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  r RECORD;
  v_points integer;
  v_tier text;
  v_streak integer;
  v_referrals integer;
  v_calls integer;
  v_prev_tier text;
  v_prev_rank integer;
  v_count integer := 0;
BEGIN
  FOR r IN SELECT id FROM auth.users LOOP
    SELECT COUNT(*) INTO v_referrals FROM public.referrals WHERE referrer_id = r.id;
    SELECT COALESCE(current_streak, 0) INTO v_streak FROM public.user_streaks WHERE user_id = r.id;
    v_streak := COALESCE(v_streak, 0);
    SELECT COUNT(*) INTO v_calls FROM public.calls WHERE caller_id = r.id AND status = 'completed';

    v_points := (v_referrals * 10) + (v_streak * 5) + (v_calls * 1);

    v_tier := CASE
      WHEN v_points >= 2000 THEN 'Platinum'
      WHEN v_points >= 500  THEN 'Gold'
      WHEN v_points >= 100  THEN 'Silver'
      ELSE 'Bronze'
    END;

    SELECT tier, rank INTO v_prev_tier, v_prev_rank FROM public.champions WHERE user_id = r.id;

    INSERT INTO public.champions (user_id, points, tier, streak_days, referral_count, calls_made, badge_earned_at, previous_rank, updated_at)
    VALUES (r.id, v_points, v_tier, v_streak, v_referrals, v_calls,
            CASE WHEN v_prev_tier IS DISTINCT FROM v_tier THEN now() ELSE NULL END,
            v_prev_rank, now())
    ON CONFLICT (user_id) DO UPDATE SET
      points = EXCLUDED.points,
      tier = EXCLUDED.tier,
      streak_days = EXCLUDED.streak_days,
      referral_count = EXCLUDED.referral_count,
      calls_made = EXCLUDED.calls_made,
      previous_rank = public.champions.rank,
      badge_earned_at = CASE WHEN public.champions.tier IS DISTINCT FROM EXCLUDED.tier THEN now() ELSE public.champions.badge_earned_at END,
      updated_at = now();

    IF v_prev_tier IS NOT NULL AND v_prev_tier <> v_tier THEN
      INSERT INTO public.champion_notifications (user_id, kind, old_value, new_value, message)
      VALUES (r.id, 'tier_up', v_prev_tier, v_tier,
              'You reached ' || v_tier || ' tier! New perks unlocked.');
    END IF;

    v_count := v_count + 1;
  END LOOP;

  -- Update ranks based on points
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY points DESC, updated_at ASC) AS rn
    FROM public.champions
    WHERE points > 0
  )
  UPDATE public.champions c
  SET rank = ranked.rn
  FROM ranked
  WHERE c.id = ranked.id;

  -- Notify rank changes for top 100
  INSERT INTO public.champion_notifications (user_id, kind, old_value, new_value, message)
  SELECT user_id, 'rank_up', previous_rank::text, rank::text,
         'Your rank jumped to #' || rank::text
  FROM public.champions
  WHERE rank IS NOT NULL AND rank <= 100
    AND previous_rank IS NOT NULL AND rank < previous_rank;

  RETURN v_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_brand_for_object(p_object_type text, p_user_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(brand_id uuid, brand_name text, placement_id uuid, replacement_asset_url text, replacement_type text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    bp.brand_id,
    b.brand_name,
    bp.id as placement_id,
    bp.replacement_asset_url,
    bp.replacement_type
  FROM brand_placements bp
  JOIN brand_partnerships b ON b.id = bp.brand_id
  WHERE bp.object_type = p_object_type
    AND bp.is_active = true
    AND b.status = 'active'
    AND b.budget_remaining > b.cost_per_impression
  ORDER BY bp.priority DESC, RANDOM()
  LIMIT 1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_automation_metrics(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_active_count integer;
    v_runs_today integer;
    v_time_saved_seconds integer;
BEGIN
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT count(*) INTO v_active_count
    FROM public.automation_rules
    WHERE user_id = p_user_id AND is_active = true;

    SELECT count(*) INTO v_runs_today
    FROM public.automation_logs
    WHERE user_id = p_user_id AND created_at >= now() - interval '24 hours';

    SELECT COALESCE(sum(time_saved_seconds), 0) INTO v_time_saved_seconds
    FROM public.automation_logs
    WHERE user_id = p_user_id;

    RETURN json_build_object(
        'activeCount', v_active_count,
        'runsToday', v_runs_today,
        'timeSavedSeconds', v_time_saved_seconds
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.refresh_contact_intelligence(p_user_id uuid, p_contact_id text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_total        INTEGER;
  v_answered     INTEGER;
  v_resolved     INTEGER;
  v_missed       INTEGER;
  v_voicemail    INTEGER;
  v_pickup       REAL;
  v_resolution   REAL;
  v_best_hour    SMALLINT;
  v_pref_route   TEXT;
  v_avg_voip     REAL;
  v_avg_gsm      REAL;
  v_avg_clarity  REAL;
  v_last_call    TIMESTAMPTZ;
  v_last_outcome TEXT;
BEGIN
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE c.status = 'completed'),
    COUNT(*) FILTER (WHERE ct.outcome_tag = 'resolved'),
    COUNT(*) FILTER (WHERE c.status IN ('missed', 'no_answer')),
    COUNT(*) FILTER (WHERE ct.outcome_tag = 'voicemail')
  INTO v_total, v_answered, v_resolved, v_missed, v_voicemail
  FROM public.calls c
  LEFT JOIN public.call_telemetry ct ON ct.call_id = c.id::TEXT
  WHERE c.caller_id::TEXT = p_user_id::TEXT
    AND c.receiver_id::TEXT = p_contact_id;

  v_pickup     := CASE WHEN v_total > 0 THEN v_answered::REAL / v_total ELSE 0.5 END;
  v_resolution := CASE WHEN v_answered > 0 THEN v_resolved::REAL / v_answered ELSE 0.5 END;

  SELECT EXTRACT(HOUR FROM c.started_at)::SMALLINT
  INTO v_best_hour
  FROM public.calls c
  WHERE c.caller_id::TEXT = p_user_id::TEXT
    AND c.receiver_id::TEXT = p_contact_id
    AND c.status = 'completed'
  GROUP BY EXTRACT(HOUR FROM c.started_at)
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  SELECT ct.route_chosen
  INTO v_pref_route
  FROM public.call_telemetry ct
  WHERE ct.user_id = p_user_id AND ct.contact_id = p_contact_id
  GROUP BY ct.route_chosen
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  SELECT
    AVG((ct.network_start_state->>'voipScore')::REAL),
    AVG((ct.network_start_state->>'gsmScore')::REAL),
    AVG(c.clarity_score)
  INTO v_avg_voip, v_avg_gsm, v_avg_clarity
  FROM public.call_telemetry ct
  JOIN public.calls c ON c.id::TEXT = ct.call_id
  WHERE ct.user_id = p_user_id AND ct.contact_id = p_contact_id;

  SELECT c.started_at, ct.outcome_tag
  INTO v_last_call, v_last_outcome
  FROM public.calls c
  LEFT JOIN public.call_telemetry ct ON ct.call_id = c.id::TEXT
  WHERE c.caller_id::TEXT = p_user_id::TEXT AND c.receiver_id::TEXT = p_contact_id
  ORDER BY c.started_at DESC NULLS LAST
  LIMIT 1;

  INSERT INTO public.contact_intelligence (
    user_id, contact_id,
    total_calls, answered_calls, resolved_calls, missed_calls, voicemail_calls,
    pickup_likelihood, resolution_rate,
    best_hour_utc,
    optimal_call_window_start, optimal_call_window_end,
    preferred_route,
    avg_voip_score, avg_gsm_score, avg_clarity_score,
    last_call_at, last_outcome,
    last_updated
  ) VALUES (
    p_user_id, p_contact_id,
    COALESCE(v_total, 0), COALESCE(v_answered, 0), COALESCE(v_resolved, 0),
    COALESCE(v_missed, 0), COALESCE(v_voicemail, 0),
    COALESCE(v_pickup, 0.5), COALESCE(v_resolution, 0.5),
    v_best_hour,
    CASE WHEN v_best_hour IS NOT NULL THEN make_time(v_best_hour, 0, 0) ELSE NULL END,
    CASE WHEN v_best_hour IS NOT NULL THEN make_time(LEAST(v_best_hour + 2, 23), 0, 0) ELSE NULL END,
    COALESCE(v_pref_route, 'GSM'),
    v_avg_voip, v_avg_gsm, v_avg_clarity,
    v_last_call, v_last_outcome,
    NOW()
  )
  ON CONFLICT (user_id, contact_id) DO UPDATE SET
    total_calls           = EXCLUDED.total_calls,
    answered_calls        = EXCLUDED.answered_calls,
    resolved_calls        = EXCLUDED.resolved_calls,
    missed_calls          = EXCLUDED.missed_calls,
    voicemail_calls       = EXCLUDED.voicemail_calls,
    pickup_likelihood     = EXCLUDED.pickup_likelihood,
    resolution_rate       = EXCLUDED.resolution_rate,
    best_hour_utc         = EXCLUDED.best_hour_utc,
    optimal_call_window_start = EXCLUDED.optimal_call_window_start,
    optimal_call_window_end   = EXCLUDED.optimal_call_window_end,
    preferred_route       = EXCLUDED.preferred_route,
    avg_voip_score        = EXCLUDED.avg_voip_score,
    avg_gsm_score         = EXCLUDED.avg_gsm_score,
    avg_clarity_score     = EXCLUDED.avg_clarity_score,
    last_call_at          = EXCLUDED.last_call_at,
    last_outcome          = EXCLUDED.last_outcome,
    last_updated          = NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_participant_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  participant_count INTEGER;
  is_group_chat BOOLEAN;
BEGIN
  SELECT is_group INTO is_group_chat
  FROM conversations
  WHERE id = NEW.conversation_id;
  
  IF is_group_chat THEN
    SELECT COUNT(*) INTO participant_count
    FROM conversation_participants
    WHERE conversation_id = NEW.conversation_id;
    
    IF participant_count >= 256 THEN
      RAISE EXCEPTION 'Group chat cannot have more than 256 participants';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_micro_task_admin(check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.micro_task_admins WHERE user_id = check_user_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_push_token_diagnostics()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'ceo'::app_role)) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  WITH all_users AS (
    SELECT p.id AS user_id, p.username, p.phone_number
    FROM profiles p
  ),
  token_summary AS (
    SELECT user_id, COUNT(*) AS token_count, MAX(last_used_at) AS last_token_used_at
    FROM device_tokens GROUP BY user_id
  ),
  failed_digests AS (
    SELECT user_id, COUNT(*) AS failed_count, MAX(last_attempt_at) AS last_failure
    FROM notifications
    WHERE type = 'digest_update'
      AND delivery_status IN ('failed','failed_permanent')
    GROUP BY user_id
  )
  SELECT jsonb_build_object(
    'summary', jsonb_build_object(
      'users_with_no_token', (SELECT COUNT(*) FROM all_users u LEFT JOIN token_summary t ON t.user_id = u.user_id WHERE t.token_count IS NULL OR t.token_count = 0),
      'users_with_invalid_flag', (SELECT COUNT(*) FROM user_push_health WHERE has_valid_token = false),
      'users_with_failed_digests', (SELECT COUNT(*) FROM failed_digests),
      'total_failed_notifications', (SELECT COALESCE(SUM(failed_count),0) FROM failed_digests)
    ),
    'problem_users', COALESCE((
      SELECT jsonb_agg(row_to_jsonb(x)) FROM (
        SELECT
          u.user_id,
          u.username,
          u.phone_number,
          COALESCE(t.token_count, 0) AS token_count,
          t.last_token_used_at,
          COALESCE(h.has_valid_token, (t.token_count > 0)) AS has_valid_token,
          h.last_error,
          h.consecutive_failures,
          COALESCE(f.failed_count, 0) AS failed_digest_count,
          f.last_failure
        FROM all_users u
        LEFT JOIN token_summary t ON t.user_id = u.user_id
        LEFT JOIN user_push_health h ON h.user_id = u.user_id
        LEFT JOIN failed_digests f ON f.user_id = u.user_id
        WHERE COALESCE(t.token_count, 0) = 0
           OR COALESCE(h.has_valid_token, true) = false
           OR COALESCE(f.failed_count, 0) > 0
        ORDER BY COALESCE(f.failed_count, 0) DESC, COALESCE(h.consecutive_failures, 0) DESC
        LIMIT 200
      ) x
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_referral_reward(referral_code_param text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_referrer_user_id UUID;
  v_referred_user_id UUID;
  v_normalized_code TEXT;
  v_referral_id UUID;
  v_referrer_event_id UUID;
BEGIN
  v_referred_user_id := auth.uid();
  v_normalized_code := upper(trim(referral_code_param));

  IF v_referred_user_id IS NULL OR v_normalized_code IS NULL OR v_normalized_code = '' THEN
    RETURN FALSE;
  END IF;

  SELECT user_id
  INTO v_referrer_user_id
  FROM public.referral_codes
  WHERE upper(code) = v_normalized_code
  LIMIT 1;

  IF v_referrer_user_id IS NULL OR v_referrer_user_id = v_referred_user_id THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.referrals WHERE referred_id = v_referred_user_id
  ) THEN
    RETURN EXISTS (
      SELECT 1 FROM public.referrals WHERE referred_id = v_referred_user_id AND referrer_id = v_referrer_user_id
    );
  END IF;

  PERFORM public.ensure_user_points_exists(v_referrer_user_id);
  PERFORM public.ensure_user_points_exists(v_referred_user_id);

  INSERT INTO public.referrals (
    referrer_id,
    referred_id,
    reward_claimed,
    referral_code,
    status,
    verified_at,
    rewarded_at
  )
  VALUES (
    v_referrer_user_id,
    v_referred_user_id,
    true,
    v_normalized_code,
    'rewarded'::public.referral_status,
    now(),
    now()
  )
  RETURNING id INTO v_referral_id;

  INSERT INTO public.earning_events (
    user_id,
    event_type,
    source_table,
    source_id,
    title,
    description,
    status,
    reward_coins,
    reward_rupees,
    occurred_at,
    approved_at,
    paid_at,
    metadata
  )
  VALUES (
    v_referrer_user_id,
    'referral_referrer_bonus'::public.earning_event_type,
    'referrals',
    v_referral_id,
    'Referral reward',
    'Friend signed up and completed verification',
    'paid'::public.earning_event_status,
    50,
    0,
    now(),
    now(),
    now(),
    jsonb_build_object('referred_user_id', v_referred_user_id, 'referral_code', v_normalized_code)
  ) RETURNING id INTO v_referrer_event_id;

  IF NOT EXISTS (
    SELECT 1 FROM public.earning_events
    WHERE user_id = v_referred_user_id
      AND event_type = 'referral_signup_bonus'::public.earning_event_type
      AND source_table = 'referrals'
      AND source_id = v_referral_id
  ) THEN
    INSERT INTO public.earning_events (
      user_id,
      event_type,
      source_table,
      source_id,
      title,
      description,
      status,
      reward_coins,
      reward_rupees,
      occurred_at,
      approved_at,
      paid_at,
      metadata
    )
    VALUES (
      v_referred_user_id,
      'referral_signup_bonus'::public.earning_event_type,
      'referrals',
      v_referral_id,
      'Welcome referral bonus',
      'Bonus for joining with a valid invite code',
      'paid'::public.earning_event_status,
      25,
      0,
      now(),
      now(),
      now(),
      jsonb_build_object('referrer_id', v_referrer_user_id, 'referral_code', v_normalized_code)
    );
  END IF;

  INSERT INTO public.referral_rewards (
    referrer_id,
    referred_user_id,
    referral_code,
    points_awarded,
    reward_rupees,
    status,
    completed_at,
    approved_at,
    paid_at,
    earning_event_id
  )
  VALUES (
    v_referrer_user_id,
    v_referred_user_id,
    v_normalized_code,
    50,
    0,
    'paid'::public.earning_event_status,
    now(),
    now(),
    now(),
    v_referrer_event_id
  )
  ON CONFLICT (referrer_id, referred_user_id)
  DO UPDATE SET
    referral_code = EXCLUDED.referral_code,
    points_awarded = EXCLUDED.points_awarded,
    reward_rupees = EXCLUDED.reward_rupees,
    status = EXCLUDED.status,
    completed_at = EXCLUDED.completed_at,
    approved_at = EXCLUDED.approved_at,
    paid_at = EXCLUDED.paid_at,
    earning_event_id = EXCLUDED.earning_event_id;

  UPDATE public.user_points
  SET balance = balance + 50,
      lifetime_earned = lifetime_earned + 50,
      updated_at = now()
  WHERE user_id = v_referrer_user_id;

  INSERT INTO public.point_transactions (user_id, amount, transaction_type, source, description)
  VALUES (v_referrer_user_id, 50, 'earn', 'referral', 'Referral reward: friend signed up and verified');

  UPDATE public.user_points
  SET balance = balance + 25,
      lifetime_earned = lifetime_earned + 25,
      updated_at = now()
  WHERE user_id = v_referred_user_id;

  INSERT INTO public.point_transactions (user_id, amount, transaction_type, source, description)
  VALUES (v_referred_user_id, 25, 'earn', 'referral_bonus', 'Welcome bonus for joining with a referral code');

  UPDATE public.referral_codes
  SET uses = COALESCE(uses, 0) + 1
  WHERE upper(code) = v_normalized_code;

  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_conversations()
 RETURNS TABLE(conversation_id uuid, is_group boolean, group_name text, group_icon_url text, other_user_id uuid, other_user_name text, other_user_avatar text, other_user_online boolean, last_message text, last_message_type text, last_message_at timestamp with time zone, last_message_sender_id uuid, unread_count bigint, is_muted boolean, is_archived boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  RETURN QUERY
  WITH user_conversations AS (
    -- Get all conversations the user is part of
    SELECT 
      cp.conversation_id,
      cp.is_muted,
      cp.is_archived,
      cp.last_read_at
    FROM conversation_participants cp
    WHERE cp.user_id = current_user_id
  ),
  last_messages AS (
    -- Get the last message for each conversation
    SELECT DISTINCT ON (m.conversation_id)
      m.conversation_id,
      m.content,
      m.message_type,
      m.created_at,
      m.sender_id
    FROM messages m
    WHERE m.conversation_id IN (SELECT uc.conversation_id FROM user_conversations uc)
      AND m.is_deleted = false
    ORDER BY m.conversation_id, m.created_at DESC
  ),
  unread_counts AS (
    -- Count unread messages per conversation
    SELECT 
      m.conversation_id,
      COUNT(*) as unread
    FROM messages m
    JOIN user_conversations uc ON uc.conversation_id = m.conversation_id
    WHERE m.sender_id != current_user_id
      AND m.is_deleted = false
      AND (uc.last_read_at IS NULL OR m.created_at > uc.last_read_at)
    GROUP BY m.conversation_id
  ),
  other_participants AS (
    -- Get the other user in 1-to-1 conversations
    SELECT DISTINCT ON (cp.conversation_id)
      cp.conversation_id,
      p.id as user_id,
      COALESCE(p.username, p.email, 'User') as username,
      p.avatar_url,
      COALESCE(p.is_online, false) as is_online
    FROM conversation_participants cp
    JOIN profiles p ON p.id = cp.user_id
    JOIN conversations c ON c.id = cp.conversation_id
    WHERE cp.conversation_id IN (SELECT uc.conversation_id FROM user_conversations uc)
      AND cp.user_id != current_user_id
      AND c.is_group = false
    ORDER BY cp.conversation_id, cp.joined_at
  )
  SELECT 
    c.id as conversation_id,
    c.is_group,
    c.group_name,
    c.group_icon_url,
    op.user_id as other_user_id,
    op.username as other_user_name,
    op.avatar_url as other_user_avatar,
    op.is_online as other_user_online,
    lm.content as last_message,
    lm.message_type as last_message_type,
    lm.created_at as last_message_at,
    lm.sender_id as last_message_sender_id,
    COALESCE(uc_counts.unread, 0) as unread_count,
    uc.is_muted,
    uc.is_archived
  FROM user_conversations uc
  JOIN conversations c ON c.id = uc.conversation_id
  LEFT JOIN last_messages lm ON lm.conversation_id = c.id
  LEFT JOIN unread_counts uc_counts ON uc_counts.conversation_id = c.id
  LEFT JOIN other_participants op ON op.conversation_id = c.id
  WHERE uc.is_archived = false
  ORDER BY lm.created_at DESC NULLS LAST;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_health_passport_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_call_as_missed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'ended' AND OLD.status = 'ringing' AND NEW.started_at IS NULL THEN
    NEW.missed = true;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_qr_sessions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.qr_login_sessions
  SET status = 'expired'
  WHERE status = 'pending' 
    AND expires_at < now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.lookup_caller_id(p_hashed_number text, p_raw_number text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  best_label TEXT;
  aggregate_record RECORD;
  direct_spam_count INTEGER;
  final_name TEXT;
  final_trust INTEGER;
  final_spam_reports INTEGER;
  is_opted_out BOOLEAN;
BEGIN
  -- Check DPDP Opt-Out
  SELECT EXISTS(SELECT 1 FROM public.dpdp_opt_outs WHERE hashed_number = p_hashed_number) INTO is_opted_out;

  -- Get best community label
  SELECT normalized_label INTO best_label
  FROM public.contact_label_frequencies
  WHERE hashed_number = p_hashed_number
  ORDER BY frequency_count DESC
  LIMIT 1;

  -- Get legacy aggregates if any
  SELECT community_name, total_reports, spam_reports, spam_percentage, most_common_type, community_label
  INTO aggregate_record
  FROM public.caller_id_aggregates
  WHERE phone_number = p_raw_number
  LIMIT 1;

  -- Direct spam reports from the real caller_reports table
  SELECT COUNT(*)
  INTO direct_spam_count
  FROM public.caller_reports
  WHERE phone_number = p_raw_number
    AND report_type IN ('spam','scam','telemarketer','robocall','fraud');

  IF is_opted_out THEN
      final_name := 'Unknown Caller';
  ELSE
      final_name := COALESCE(best_label, aggregate_record.community_name, 'Unknown Caller');
  END IF;

  final_spam_reports := GREATEST(COALESCE(aggregate_record.spam_reports, 0), COALESCE(direct_spam_count, 0));

  -- Calculate trust score (simple version: 100 - (spam * 20), min 5)
  final_trust := GREATEST(5, 100 - (final_spam_reports * 20));

  RETURN json_build_object(
    'name', final_name,
    'trust_score', final_trust,
    'spam_reports', final_spam_reports,
    'opted_out', is_opted_out
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'consumer');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_micro_task_fraud_score()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.micro_task_user_scores (user_id, risk_score, total_flags, last_flag_at)
  VALUES (NEW.user_id, NEW.risk_score_delta, 1, now())
  ON CONFLICT (user_id) DO UPDATE SET
    risk_score = micro_task_user_scores.risk_score + NEW.risk_score_delta,
    total_flags = micro_task_user_scores.total_flags + 1,
    last_flag_at = now(),
    is_soft_blocked = (micro_task_user_scores.risk_score + NEW.risk_score_delta) >= 30,
    updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_name_confidence(p_phone_hash text)
 RETURNS TABLE(name text, name_confidence numeric, frequency integer, trust_score integer, is_business boolean, is_spam boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT name, name_confidence, frequency, trust_score, is_business, is_spam
  FROM public.contacts_hash
  WHERE phone_hash = p_phone_hash AND opt_out = false;
$function$;

CREATE OR REPLACE FUNCTION public.update_agent_sessions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_nutrition_summary()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.nutrition_daily_summary (user_id, summary_date, total_calories, total_protein_g, total_carbs_g, total_fat_g, total_water_ml)
  SELECT 
    NEW.user_id,
    NEW.log_date,
    COALESCE(SUM(calories), 0),
    COALESCE(SUM(protein_g), 0),
    COALESCE(SUM(carbs_g), 0),
    COALESCE(SUM(fat_g), 0),
    COALESCE(SUM(water_ml), 0)
  FROM public.nutrition_logs
  WHERE user_id = NEW.user_id AND log_date = NEW.log_date
  ON CONFLICT (user_id, summary_date)
  DO UPDATE SET
    total_calories = EXCLUDED.total_calories,
    total_protein_g = EXCLUDED.total_protein_g,
    total_carbs_g = EXCLUDED.total_carbs_g,
    total_fat_g = EXCLUDED.total_fat_g,
    total_water_ml = EXCLUDED.total_water_ml;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_home_service_provider_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE home_service_providers 
  SET 
    rating_average = (SELECT AVG(rating) FROM home_service_reviews WHERE provider_id = NEW.provider_id),
    rating_count = (SELECT COUNT(*) FROM home_service_reviews WHERE provider_id = NEW.provider_id)
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_direct_conversation(other_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  existing_conv_id UUID;
  new_conv_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF current_user_id = other_user_id THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;
  
  existing_conv_id := public.find_shared_conversation(current_user_id, other_user_id);
  
  IF existing_conv_id IS NOT NULL THEN
    RETURN existing_conv_id;
  END IF;
  
  INSERT INTO conversations (created_by, is_group)
  VALUES (current_user_id, false)
  RETURNING id INTO new_conv_id;
  
  INSERT INTO conversation_participants (conversation_id, user_id, role)
  VALUES 
    (new_conv_id, current_user_id, 'member'),
    (new_conv_id, other_user_id, 'member');
  
  RETURN new_conv_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_conversation_messages(p_conversation_id uuid, p_limit integer DEFAULT 50, p_before timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(message_id uuid, sender_id uuid, sender_name text, sender_avatar text, content text, message_type text, created_at timestamp with time zone, is_edited boolean, is_deleted boolean, is_starred boolean, reply_to_id uuid, media_url text, media_attachments jsonb, reactions jsonb, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Verify user is a participant
  IF NOT EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = p_conversation_id 
    AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Not a participant in this conversation';
  END IF;
  
  RETURN QUERY
  SELECT 
    m.id as message_id,
    m.sender_id,
    COALESCE(p.username, p.email, 'User') as sender_name,
    p.avatar_url as sender_avatar,
    m.content,
    m.message_type,
    m.created_at,
    m.is_edited,
    m.is_deleted,
    m.is_starred,
    m.reply_to_id,
    m.media_url,
    m.media_attachments,
    m.reactions,
    m.status
  FROM messages m
  LEFT JOIN profiles p ON p.id = m.sender_id
  WHERE m.conversation_id = p_conversation_id
    AND (p_before IS NULL OR m.created_at < p_before)
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$function$;

CREATE OR REPLACE FUNCTION public.track_app_usage(p_app_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO app_usage (user_id, app_id, usage_count, last_used_at)
  VALUES (auth.uid(), p_app_id, 1, now())
  ON CONFLICT (user_id, app_id) 
  DO UPDATE SET 
    usage_count = app_usage.usage_count + 1,
    last_used_at = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_bmi(p_height_cm numeric, p_weight_kg numeric)
 RETURNS TABLE(bmi_value numeric, bmi_category text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_bmi NUMERIC(4,2);
  v_category TEXT;
  v_height_m NUMERIC;
BEGIN
  v_height_m := p_height_cm / 100;
  v_bmi := ROUND(p_weight_kg / (v_height_m * v_height_m), 2);
  
  v_category := CASE
    WHEN v_bmi < 18.5 THEN 'underweight'
    WHEN v_bmi >= 18.5 AND v_bmi < 25 THEN 'normal'
    WHEN v_bmi >= 25 AND v_bmi < 30 THEN 'overweight'
    ELSE 'obese'
  END;
  
  RETURN QUERY SELECT v_bmi, v_category;
END;
$function$;

CREATE OR REPLACE FUNCTION public.lookup_name_confidence_bulk(p_phone_hashes text[])
 RETURNS TABLE(phone_hash text, name text, name_confidence numeric, frequency integer, trust_score integer, is_business boolean, is_spam boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT phone_hash, name, name_confidence, frequency, trust_score, is_business, is_spam
  FROM public.contacts_hash
  WHERE phone_hash = ANY(p_phone_hashes) AND opt_out = false;
$function$;

CREATE OR REPLACE FUNCTION public.get_public_profile(handle_input text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  clean_handle text := lower(regexp_replace(coalesce(handle_input, ''), '^@', ''));
  profile_record RECORD;
  discovery_record jsonb;
  identities_record jsonb;
BEGIN
  IF clean_handle = '' THEN
    RETURN NULL;
  END IF;

  SELECT p.id, p.username, p.avatar_url, p.primary_handle
  INTO profile_record
  FROM public.profiles p
  WHERE lower(coalesce(p.primary_handle, '')) = clean_handle
     OR lower(coalesce(p.username, '')) = clean_handle
  LIMIT 1;

  IF profile_record.id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', ui.id,
        'handle', ui.handle,
        'suffix', ui.suffix,
        'full_handle', ui.full_handle,
        'display_name', ui.display_name,
        'bio', ui.bio,
        'avatar_url', ui.avatar_url,
        'identity_type', ui.identity_type,
        'is_active', ui.is_active,
        'visibility', ui.visibility,
        'auto_reply_enabled', ui.auto_reply_enabled,
        'ai_clone_enabled', ui.ai_clone_enabled,
        'ai_clone_personality', ui.ai_clone_personality,
        'ai_clone_boundaries', ui.ai_clone_boundaries,
        'created_at', ui.created_at
      )
      ORDER BY ui.created_at
    ),
    '[]'::jsonb
  )
  INTO identities_record
  FROM public.user_identities ui
  WHERE ui.user_id = profile_record.id
    AND ui.is_active = true
    AND ui.visibility = 'public';

  SELECT to_jsonb(d)
  INTO discovery_record
  FROM (
    SELECT
      udp.headline,
      udp.skills,
      udp.company,
      udp.job_title,
      udp.location,
      udp.city,
      udp.country,
      udp.industry,
      udp.website,
      udp.social_links,
      udp.is_searchable,
      udp.search_visibility,
      udp.allow_messages_from,
      udp.allow_calls_from,
      udp.show_phone_to,
      udp.anonymous_mode
    FROM public.user_discovery_profiles udp
    WHERE udp.user_id = profile_record.id
      AND udp.is_searchable = true
      AND COALESCE(udp.anonymous_mode, false) = false
    LIMIT 1
  ) d;

  RETURN jsonb_build_object(
    'profile', jsonb_build_object(
      'id', profile_record.id,
      'username', profile_record.username,
      'avatar_url', profile_record.avatar_url,
      'primary_handle', profile_record.primary_handle
    ),
    'identities', identities_record,
    'discovery', discovery_record
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.consume_prekey(p_target_user_id uuid)
 RETURNS TABLE(prekey_id integer, public_key text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_prekey_id INTEGER;
  v_public_key TEXT;
  v_pk_uuid UUID;
BEGIN
  SELECT ep.id, ep.prekey_id, ep.public_key
  INTO v_pk_uuid, v_prekey_id, v_public_key
  FROM e2e_prekeys ep
  WHERE ep.user_id = p_target_user_id AND ep.is_used = false
  ORDER BY ep.prekey_id ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_pk_uuid IS NULL THEN
    RAISE EXCEPTION 'No prekeys available for this user';
  END IF;

  UPDATE e2e_prekeys SET is_used = true, used_by = auth.uid(), used_at = now()
  WHERE id = v_pk_uuid;

  RETURN QUERY SELECT v_prekey_id, v_public_key;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_compute_trust()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := COALESCE(NEW.user_id, OLD.user_id);
  IF v_user_id IS NOT NULL THEN
    PERFORM public.compute_trust_score(v_user_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_search_suggestion_popularity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.search_suggestions (suggestion_text, category, popularity_score, last_used_at)
  VALUES (NEW.query_text, NEW.intent, 1, NEW.timestamp)
  ON CONFLICT (suggestion_text) 
  DO UPDATE SET 
    popularity_score = public.search_suggestions.popularity_score + 1,
    last_used_at = NEW.timestamp,
    category = COALESCE(EXCLUDED.category, public.search_suggestions.category);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_channel_admin(_channel_id uuid, _user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.channel_members cm
    WHERE cm.channel_id = _channel_id
      AND cm.user_id = _user_id
      AND cm.role IN ('admin', 'owner')
  );
$function$;

CREATE OR REPLACE FUNCTION public.update_execution_queue_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_chatr_plus_service_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.chatr_plus_services 
  SET 
    rating_average = (SELECT AVG(rating) FROM public.chatr_plus_reviews WHERE service_id = NEW.service_id),
    rating_count = (SELECT COUNT(*) FROM public.chatr_plus_reviews WHERE service_id = NEW.service_id)
  WHERE id = NEW.service_id;
  
  UPDATE public.chatr_plus_sellers 
  SET 
    rating_average = (SELECT AVG(rating) FROM public.chatr_plus_reviews WHERE seller_id = NEW.seller_id),
    rating_count = (SELECT COUNT(*) FROM public.chatr_plus_reviews WHERE seller_id = NEW.seller_id)
  WHERE id = NEW.seller_id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only: % is not permitted', TG_OP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_fame_score()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.fame_leaderboard (user_id, total_fame_score, total_posts, total_viral_posts, total_coins_earned)
  VALUES (NEW.user_id, NEW.ai_virality_score, 1, CASE WHEN NEW.is_viral THEN 1 ELSE 0 END, NEW.coins_earned)
  ON CONFLICT (user_id) DO UPDATE SET
    total_fame_score = public.fame_leaderboard.total_fame_score + NEW.ai_virality_score,
    total_posts = public.fame_leaderboard.total_posts + 1,
    total_viral_posts = public.fame_leaderboard.total_viral_posts + (CASE WHEN NEW.is_viral THEN 1 ELSE 0 END),
    total_coins_earned = public.fame_leaderboard.total_coins_earned + NEW.coins_earned,
    updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_profile_trust_factors()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.phone_number IS NOT NULL AND length(NEW.phone_number) >= 10 THEN
    PERFORM public.award_trust_factor(NEW.id, 'phone_verified', 80, 1.5, 'profile_phone');
  END IF;
  IF NEW.avatar_url IS NOT NULL AND length(NEW.avatar_url) > 5 THEN
    PERFORM public.award_trust_factor(NEW.id, 'social_verified', 60, 0.8, 'profile_avatar');
  END IF;
  IF NEW.username IS NOT NULL AND length(NEW.username) > 2
     AND NEW.username NOT LIKE 'User\_%' ESCAPE '\' THEN
    PERFORM public.award_trust_factor(NEW.id, 'social_verified', 50, 0.5, 'profile_username');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.award_trust_factor(p_user_id uuid, p_factor_type text, p_factor_value numeric, p_weight numeric, p_source text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.trust_factors
  WHERE user_id = p_user_id AND factor_type = p_factor_type
    AND COALESCE(source, '') = COALESCE(p_source, '');
  INSERT INTO public.trust_factors (user_id, factor_type, factor_value, weight, source)
  VALUES (p_user_id, p_factor_type, p_factor_value, p_weight, p_source);
END;
$function$;

CREATE OR REPLACE FUNCTION public.recompute_home_solutions_total()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_total NUMERIC(10,2) := 0;
  v_item JSONB;
  v_price NUMERIC(10,2);
  v_qty INT;
  v_unit NUMERIC(10,2);
BEGIN
  IF NEW.category = 'material' THEN
    -- Materials: items is an array of {id, qty}
    FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.items) LOOP
      SELECT unit_price INTO v_unit
        FROM public.home_solutions_catalog
        WHERE code = (v_item->>'id') AND is_active = true;
      IF v_unit IS NULL THEN
        RAISE EXCEPTION 'Invalid catalog item: %', v_item->>'id';
      END IF;
      v_qty := COALESCE((v_item->>'qty')::INT, 1);
      v_total := v_total + (v_unit * v_qty);
    END LOOP;
    NEW.total_amount := v_total;
  ELSE
    -- Worker / interior: single item × quantity
    SELECT unit_price INTO v_unit
      FROM public.home_solutions_catalog
      WHERE code = NEW.item_code AND is_active = true;
    IF v_unit IS NULL THEN
      -- Custom-quote items have unit_price 0 → leave total NULL
      NEW.total_amount := NULL;
    ELSIF v_unit = 0 THEN
      NEW.total_amount := NULL;
    ELSE
      NEW.total_amount := v_unit * GREATEST(NEW.quantity, 1);
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_medicine_streak()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.status = 'taken' THEN
        INSERT INTO public.health_streaks (user_id, family_member_id, streak_type, current_streak, longest_streak, last_activity_date, coins_earned)
        VALUES (NEW.user_id, NEW.family_member_id, 'medicine_adherence', 1, 1, CURRENT_DATE, 5)
        ON CONFLICT (user_id, family_member_id, streak_type)
        DO UPDATE SET
            current_streak = CASE 
                WHEN health_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN health_streaks.current_streak + 1
                WHEN health_streaks.last_activity_date = CURRENT_DATE THEN health_streaks.current_streak
                ELSE 1
            END,
            longest_streak = GREATEST(health_streaks.longest_streak, 
                CASE 
                    WHEN health_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN health_streaks.current_streak + 1
                    ELSE 1
                END
            ),
            last_activity_date = CURRENT_DATE,
            coins_earned = health_streaks.coins_earned + 5,
            updated_at = now();
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_default_identities()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.primary_handle IS NOT NULL AND (OLD.primary_handle IS NULL OR OLD.primary_handle != NEW.primary_handle) THEN
    -- Create public identity
    INSERT INTO public.user_identities (user_id, handle, suffix, display_name, identity_type, visibility)
    VALUES (NEW.id, NEW.primary_handle, 'public', COALESCE(NEW.username, NEW.primary_handle), 'personal', 'public')
    ON CONFLICT (handle, suffix) DO UPDATE SET display_name = EXCLUDED.display_name;

    -- Create work identity
    INSERT INTO public.user_identities (user_id, handle, suffix, display_name, identity_type, visibility)
    VALUES (NEW.id, NEW.primary_handle, 'work', COALESCE(NEW.username, NEW.primary_handle) || ' (Work)', 'business', 'contacts')
    ON CONFLICT (handle, suffix) DO NOTHING;

    -- Create private identity
    INSERT INTO public.user_identities (user_id, handle, suffix, display_name, identity_type, visibility)
    VALUES (NEW.id, NEW.primary_handle, 'private', COALESCE(NEW.username, NEW.primary_handle) || ' (Private)', 'private', 'private')
    ON CONFLICT (handle, suffix) DO NOTHING;

    -- Create AI clone identity
    INSERT INTO public.user_identities (user_id, handle, suffix, display_name, identity_type, visibility)
    VALUES (NEW.id, NEW.primary_handle, 'ai', COALESCE(NEW.username, NEW.primary_handle) || ' AI', 'ai_clone', 'public')
    ON CONFLICT (handle, suffix) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.seed_business_number(p_phone_hash text, p_name text, p_trust integer DEFAULT 90)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.contacts_hash (
    phone_hash, name, name_confidence, frequency, trust_score,
    is_business, data_source, last_enriched_at
  )
  VALUES (
    p_phone_hash, p_name, 1.0, 1, GREATEST(0, LEAST(100, p_trust)),
    true, 'business_seed', now()
  )
  ON CONFLICT (phone_hash) DO UPDATE SET
    name = EXCLUDED.name,
    is_business = true,
    name_confidence = 1.0,
    trust_score = GREATEST(public.contacts_hash.trust_score, EXCLUDED.trust_score),
    data_source = 'business_seed',
    updated_at = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_invite_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_record RECORD;
  reward_amount INTEGER := 50;
BEGIN
  -- Check if this user's email/phone was invited
  SELECT * INTO invite_record
  FROM contact_invites
  WHERE (contact_email = NEW.email OR contact_phone = NEW.phone_number)
    AND status IN ('pending', 'sent', 'clicked')
    AND reward_given = false
  LIMIT 1;
  
  IF invite_record IS NOT NULL THEN
    -- Update invite status
    UPDATE contact_invites
    SET status = 'joined',
        joined_at = now(),
        joined_user_id = NEW.id,
        reward_given = true
    WHERE id = invite_record.id;
    
    -- Reward the inviter
    UPDATE user_points
    SET balance = balance + reward_amount,
        lifetime_earned = lifetime_earned + reward_amount
    WHERE user_id = invite_record.inviter_id;
    
    -- Log the reward transaction
    INSERT INTO point_transactions (user_id, amount, transaction_type, source, description)
    VALUES (invite_record.inviter_id, reward_amount, 'earn', 'referral', 
            'Friend ' || COALESCE(NEW.username, NEW.email, 'Someone') || ' joined via your invite!');
    
    -- Also reward the new user
    UPDATE user_points
    SET balance = balance + 25,
        lifetime_earned = lifetime_earned + 25
    WHERE user_id = NEW.id;
    
    INSERT INTO point_transactions (user_id, amount, transaction_type, source, description)
    VALUES (NEW.id, 25, 'earn', 'referral_bonus', 'Welcome bonus for joining via invite!');
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.recompute_contact_hash(p_phone_hash text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_top_name TEXT;
  v_top_votes INTEGER;
  v_total INTEGER;
  v_confidence NUMERIC(5,4);
  v_trust INTEGER;
BEGIN
  SELECT name_display, votes
    INTO v_top_name, v_top_votes
  FROM public.contacts_name_votes
  WHERE phone_hash = p_phone_hash
  ORDER BY votes DESC, updated_at DESC
  LIMIT 1;

  SELECT COALESCE(SUM(votes), 0) INTO v_total
  FROM public.contacts_name_votes
  WHERE phone_hash = p_phone_hash;

  IF v_total = 0 THEN
    RETURN;
  END IF;

  v_confidence := ROUND((v_top_votes::NUMERIC / v_total)::NUMERIC, 4);
  v_trust := LEAST(100, v_total * 5);

  INSERT INTO public.contacts_hash (
    phone_hash, name, name_confidence, frequency, trust_score, last_enriched_at, updated_at
  )
  VALUES (
    p_phone_hash, v_top_name, v_confidence, v_total, v_trust, now(), now()
  )
  ON CONFLICT (phone_hash) DO UPDATE SET
    name = CASE WHEN public.contacts_hash.is_business THEN public.contacts_hash.name ELSE EXCLUDED.name END,
    name_confidence = EXCLUDED.name_confidence,
    frequency = EXCLUDED.frequency,
    trust_score = GREATEST(public.contacts_hash.trust_score, EXCLUDED.trust_score),
    last_enriched_at = now(),
    updated_at = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_chatr_plus_payment(p_user_id uuid, p_amount integer, p_transaction_type character varying, p_payment_method character varying, p_booking_id uuid DEFAULT NULL::uuid, p_description text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_transaction_id UUID;
  v_wallet_balance INTEGER;
BEGIN
  -- Check wallet balance if payment method is wallet
  IF p_payment_method = 'wallet' THEN
    SELECT balance INTO v_wallet_balance FROM public.chatr_plus_wallet WHERE user_id = p_user_id;
    
    IF v_wallet_balance IS NULL OR v_wallet_balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;
    
    -- Deduct from wallet
    UPDATE public.chatr_plus_wallet
    SET balance = balance - p_amount,
        total_spent = total_spent + p_amount
    WHERE user_id = p_user_id;
  END IF;
  
  -- Create transaction record
  INSERT INTO public.chatr_plus_transactions (
    user_id, transaction_type, amount, status, payment_method, booking_id, description
  )
  VALUES (
    p_user_id, p_transaction_type, p_amount, 'success', p_payment_method, p_booking_id, p_description
  )
  RETURNING id INTO v_transaction_id;
  
  -- Update booking payment status if applicable
  IF p_booking_id IS NOT NULL THEN
    UPDATE public.chatr_plus_bookings
    SET payment_status = 'paid',
        payment_transaction_id = v_transaction_id
    WHERE id = p_booking_id;
  END IF;
  
  RETURN v_transaction_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_contacts_sync_queue(p_batch_size integer DEFAULT 50)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_row RECORD;
  v_item JSONB;
  v_hash TEXT;
  v_name TEXT;
  v_norm TEXT;
  v_processed INTEGER := 0;
BEGIN
  FOR v_row IN
    SELECT id, payload
    FROM public.contacts_sync_queue
    WHERE status = 'pending' AND consent_given = true
    ORDER BY created_at
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE public.contacts_sync_queue SET status = 'processing' WHERE id = v_row.id;

    BEGIN
      FOR v_item IN SELECT * FROM jsonb_array_elements(v_row.payload)
      LOOP
        v_hash := NULLIF(trim(v_item->>'phone_hash'), '');
        v_name := NULLIF(trim(v_item->>'name'), '');
        CONTINUE WHEN v_hash IS NULL OR v_name IS NULL;

        -- Respect opt-outs (DPDP)
        IF EXISTS (SELECT 1 FROM public.phonebook_opt_outs WHERE phone_hash = v_hash) THEN
          CONTINUE;
        END IF;

        v_norm := lower(regexp_replace(v_name, '\s+', ' ', 'g'));

        INSERT INTO public.contacts_name_votes (phone_hash, name_normalized, name_display, votes)
        VALUES (v_hash, v_norm, v_name, 1)
        ON CONFLICT (phone_hash, name_normalized)
        DO UPDATE SET votes = public.contacts_name_votes.votes + 1, updated_at = now();

        PERFORM public.recompute_contact_hash(v_hash);
      END LOOP;

      UPDATE public.contacts_sync_queue
        SET status = 'completed', processed_at = now()
        WHERE id = v_row.id;
      v_processed := v_processed + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.contacts_sync_queue
        SET status = 'failed', error = SQLERRM, processed_at = now()
        WHERE id = v_row.id;
    END;
  END LOOP;

  RETURN v_processed;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_mutual_contact(user1_email text, user2_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user1_id UUID;
  user2_id UUID;
  user1_phone TEXT;
  user2_phone TEXT;
  user1_username TEXT;
  user2_username TEXT;
BEGIN
  SELECT id, phone_number, username INTO user1_id, user1_phone, user1_username
  FROM profiles WHERE email = user1_email;
  
  SELECT id, phone_number, username INTO user2_id, user2_phone, user2_username
  FROM profiles WHERE email = user2_email;
  
  IF user1_id IS NOT NULL AND user2_id IS NOT NULL THEN
    INSERT INTO contacts (user_id, contact_user_id, contact_name, contact_phone, is_registered)
    VALUES (user1_id, user2_id, COALESCE(user2_username, user2_email), COALESCE(user2_phone, user2_email), true)
    ON CONFLICT (user_id, contact_phone) DO UPDATE SET
      contact_user_id = user2_id,
      is_registered = true,
      contact_name = EXCLUDED.contact_name;
    
    INSERT INTO contacts (user_id, contact_user_id, contact_name, contact_phone, is_registered)
    VALUES (user2_id, user1_id, COALESCE(user1_username, user1_email), COALESCE(user1_phone, user1_email), true)
    ON CONFLICT (user_id, contact_phone) DO UPDATE SET
      contact_user_id = user1_id,
      is_registered = true,
      contact_name = EXCLUDED.contact_name;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.find_emotion_matches(p_user_id uuid, p_emotion character varying)
 RETURNS TABLE(match_user_id uuid, username text, avatar_url text, emotion character varying, intensity integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ec.user_id,
    p.username,
    p.avatar_url,
    ec.current_emotion,
    ec.intensity
  FROM emotion_circles ec
  JOIN profiles p ON p.id = ec.user_id
  WHERE ec.current_emotion = p_emotion
    AND ec.user_id != p_user_id
    AND ec.looking_for_connection = true
    AND ec.active_until > now()
  ORDER BY ec.created_at DESC
  LIMIT 10;
END;
$function$;


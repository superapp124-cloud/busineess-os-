-- Migration: 20260829150000_phone_first_identity_hardening.sql
-- Description: Hardens phone-first canonical identity model.
-- Business Identity = Normalized Phone Number
-- Relational Database Key = auth.users.id (UUID)
-- Zero destructive operations: Additive only.

-- 1. Ensure phone search index and trigger on public.users
CREATE OR REPLACE FUNCTION public.set_users_phone_search()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.phone_search := regexp_replace(COALESCE(NEW.phone_number, ''), '[^0-9]', '', 'g');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_users_phone_search ON public.users;
CREATE TRIGGER trg_set_users_phone_search
  BEFORE INSERT OR UPDATE OF phone_number ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_users_phone_search();

-- 2. Ensure canonical phone extraction in handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_phone TEXT;
  v_clean_phone TEXT;
BEGIN
  -- Extract phone from all possible Auth sources
  v_phone := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'phone'
  );

  -- If phone is still null and email is synthetic (e.g. 919910678611@chatr.local), extract from email
  IF (v_phone IS NULL OR v_phone = '') AND NEW.email LIKE '%@chatr.local' THEN
    v_phone := split_part(NEW.email, '@', 1);
  END IF;

  -- Compute normalized phone digits for search
  v_clean_phone := regexp_replace(COALESCE(v_phone, ''), '[^0-9]', '', 'g');

  INSERT INTO public.users (
    id,
    username,
    phone_number,
    phone_search,
    email,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    v_phone,
    v_clean_phone,
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    phone_number = COALESCE(EXCLUDED.phone_number, public.users.phone_number),
    phone_search = COALESCE(EXCLUDED.phone_search, public.users.phone_search),
    email = COALESCE(EXCLUDED.email, public.users.email),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- 3. Canonical Phone Lookup RPC Function (SECURITY DEFINER)
-- Allows frontend and edge functions to resolve any phone number to canonical user identity
CREATE OR REPLACE FUNCTION public.find_user_by_phone(p_phone TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  display_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_clean TEXT;
  v_national TEXT;
BEGIN
  IF p_phone IS NULL OR trim(p_phone) = '' THEN
    RETURN;
  END IF;

  -- Normalize clean digits
  v_clean := regexp_replace(p_phone, '[^0-9]', '', 'g');
  
  -- Compute national 10-digit format for India context if 12-digit starts with 91
  IF length(v_clean) = 12 AND substring(v_clean from 1 for 2) = '91' THEN
    v_national := substring(v_clean from 3);
  ELSIF length(v_clean) = 11 AND substring(v_clean from 1 for 1) = '0' THEN
    v_national := substring(v_clean from 2);
  ELSE
    v_national := v_clean;
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.full_name,
    u.display_name,
    u.phone_number,
    u.avatar_url,
    u.created_at
  FROM public.users u
  WHERE 
    u.phone_search = v_clean
    OR u.phone_search = v_national
    OR u.phone_search = ('91' || v_national)
    OR u.phone_number = p_phone
    OR u.phone_number = ('+' || v_clean)
    OR u.phone_number = ('+91' || v_national)
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.find_user_by_phone(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_user_by_phone(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.find_user_by_phone(TEXT) TO service_role;

-- 4. Harden is_super_admin function with phone resolution across all sources
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_phone TEXT;
  v_normalized TEXT;
  v_is_super BOOLEAN := false;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- 1. Check auth.users phone
  SELECT phone INTO v_phone FROM auth.users WHERE id = p_user_id;
  
  -- 2. Check auth.users raw_user_meta_data
  IF v_phone IS NULL OR v_phone = '' THEN
    SELECT raw_user_meta_data->>'phone_number' INTO v_phone FROM auth.users WHERE id = p_user_id;
  END IF;

  IF v_phone IS NULL OR v_phone = '' THEN
    SELECT raw_user_meta_data->>'phone' INTO v_phone FROM auth.users WHERE id = p_user_id;
  END IF;

  -- 3. Check public.users phone_number
  IF v_phone IS NULL OR v_phone = '' THEN
    SELECT phone_number INTO v_phone FROM public.users WHERE id = p_user_id;
  END IF;

  -- 4. Check synthetic email if phone was stored as synthetic email prefix
  IF v_phone IS NULL OR v_phone = '' THEN
    SELECT split_part(email, '@', 1) INTO v_phone FROM auth.users WHERE id = p_user_id AND email LIKE '%@chatr.local';
  END IF;

  IF v_phone IS NULL OR v_phone = '' THEN
    RETURN false;
  END IF;

  -- Normalize phone (strip non-digits, leading 91 or 0)
  v_normalized := regexp_replace(v_phone, '\D', '', 'g');
  IF length(v_normalized) = 12 AND substring(v_normalized from 1 for 2) = '91' THEN
    v_normalized := substring(v_normalized from 3);
  ELSIF length(v_normalized) = 11 AND substring(v_normalized from 1 for 1) = '0' THEN
    v_normalized := substring(v_normalized from 2);
  END IF;

  -- Check against authoritative allowlist (9910678611, 9717845477)
  SELECT EXISTS(
    SELECT 1 FROM public.super_admin_allowlist 
    WHERE phone = v_normalized AND is_active = true
  ) INTO v_is_super;

  RETURN v_is_super;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO service_role;

-- 5. Backfill phone_search and phone_number for any existing user rows that need sync
UPDATE public.users pu
SET 
  phone_number = COALESCE(pu.phone_number, u.phone, split_part(u.email, '@', 1)),
  phone_search = regexp_replace(COALESCE(pu.phone_number, u.phone, split_part(u.email, '@', 1)), '[^0-9]', '', 'g')
FROM auth.users u
WHERE pu.id = u.id AND (pu.phone_number IS NULL OR pu.phone_search IS NULL OR pu.phone_search = '');


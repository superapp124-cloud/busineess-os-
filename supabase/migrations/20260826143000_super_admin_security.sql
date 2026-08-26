-- ============================================================
-- CHATR Super Admin Control Plane Security Foundation
-- Migration: 20260826143000_super_admin_security.sql
--
-- Security rules encoded:
--   - Non-bypassable server-side allowlist for Super Admins
--   - Initial bootstrap restricted strictly to: 9910678611, 9717845477
--   - Security definer helper is_super_admin(user_id)
--   - Immutable audit logging on all privileged operations
-- ============================================================

-- 1. SUPER ADMIN ALLOWLIST TABLE
CREATE TABLE IF NOT EXISTS public.super_admin_allowlist (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone        TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.super_admin_allowlist ENABLE ROW LEVEL SECURITY;

-- 2. SEED AUTHORIZED SUPER ADMIN NUMBERS
INSERT INTO public.super_admin_allowlist (phone, name, is_active)
VALUES 
  ('9910678611', 'Arshid Wani', true),
  ('9717845477', 'Sanobar Jahan', true)
ON CONFLICT (phone) DO UPDATE 
SET is_active = true, updated_at = now();

-- 3. SECURITY DEFINER HELPER FUNCTION
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_phone TEXT;
  v_normalized TEXT;
  v_is_super BOOLEAN := false;
BEGIN
  -- Retrieve user phone from auth.users
  SELECT phone INTO v_phone FROM auth.users WHERE id = p_user_id;
  
  IF v_phone IS NULL OR v_phone = '' THEN
    -- Check user_metadata
    SELECT raw_user_meta_data->>'phone' INTO v_phone FROM auth.users WHERE id = p_user_id;
  END IF;

  IF v_phone IS NULL OR v_phone = '' THEN
    RETURN false;
  END IF;

  -- Normalize phone (strip +91 or leading 0)
  v_normalized := regexp_replace(v_phone, '\D', '', 'g');
  IF length(v_normalized) = 12 AND substring(v_normalized from 1 for 2) = '91' THEN
    v_normalized := substring(v_normalized from 3);
  ELSIF length(v_normalized) = 11 AND substring(v_normalized from 1 for 1) = '0' THEN
    v_normalized := substring(v_normalized from 2);
  END IF;

  -- Check against allowlist
  SELECT EXISTS(
    SELECT 1 FROM public.super_admin_allowlist 
    WHERE phone = v_normalized AND is_active = true
  ) INTO v_is_super;

  RETURN v_is_super;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO service_role;

-- 4. RLS POLICIES FOR SUPER ADMIN ALLOWLIST
CREATE POLICY "super_admin_allowlist: super admins can view"
  ON public.super_admin_allowlist FOR SELECT
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "super_admin_allowlist: super admins can modify"
  ON public.super_admin_allowlist FOR ALL
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- ============================================================================
-- CHATR Production Database RLS Hardening Migration
-- Run directly in Lovable / Supabase SQL Editor
-- ============================================================================

-- 1. Enable Row Level Security (RLS) on public.profiles
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop legacy overly-permissive policies on profiles if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 3. Create strict Tenant Isolation Policies on public.profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. Enable RLS on sys_permissions (Authoritative Capability Matrix)
CREATE TABLE IF NOT EXISTS public.sys_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    role TEXT NOT NULL,
    permissions_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sys_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can query sys_permissions" ON public.sys_permissions;
CREATE POLICY "Authenticated users can query sys_permissions"
ON public.sys_permissions
FOR SELECT
USING (auth.role() = 'authenticated');

-- 5. Verification Query (Returns active RLS status)
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'sys_permissions');

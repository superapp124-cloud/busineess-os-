-- ============================================================================
-- CHATR Enterprise RLS Policy Consolidation & Least-Privilege Migration
-- Objective: Eliminate duplicate policies and remove redundant global SELECTs
-- ============================================================================

-- 1. Clean up duplicate and overly-broad SELECT policies on public.profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can search profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- 2. Consolidate to explicit, non-overlapping least-privilege policies

-- A. Own Profile Access (Select, Insert, Update)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- B. Contact & Collaborator Profile Access (Explicit RLS)
DROP POLICY IF EXISTS "Users can view contacts profiles" ON public.profiles;
CREATE POLICY "Users can view contacts profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE (user_id = auth.uid() AND contact_user_id = public.profiles.id)
       OR (contact_user_id = auth.uid() AND user_id = public.profiles.id)
  )
);

-- C. Admin Access Policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  (auth.jwt() ->> 'role') IN ('admin', 'superadmin', 'service_role')
);

-- 3. sys_permissions Policy (Authenticated Read Access)
DROP POLICY IF EXISTS "Users can query active role permissions" ON public.sys_permissions;
DROP POLICY IF EXISTS "Authenticated users can query sys_permissions" ON public.sys_permissions;
CREATE POLICY "Authenticated users can query sys_permissions" 
ON public.sys_permissions FOR SELECT 
USING (auth.role() = 'authenticated');

-- 4. Active Policy Inspection Report (Verifies active policies)
SELECT 
    tablename,
    policyname,
    cmd AS operation,
    qual AS using_clause
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'sys_permissions')
ORDER BY tablename, policyname;

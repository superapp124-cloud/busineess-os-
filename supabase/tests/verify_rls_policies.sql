-- ============================================================================
-- CHATR Enterprise RLS Policy Definition & Enforcement Verification Query
-- Run directly in Lovable / Supabase SQL Editor
-- ============================================================================

-- 1. Inspect all active RLS Policy Definitions on public.profiles and public.sys_permissions
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd AS operation,
    roles,
    qual AS using_expression,
    with_check AS check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'sys_permissions')
ORDER BY tablename, policyname;

-- 2. Verify Table RLS Status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'sys_permissions');

-- ============================================================================
-- CHATR RLS Security Policy Test & Verification Script
-- Run directly in Lovable / Supabase SQL Editor
-- ============================================================================

-- 1. Check Row Level Security (RLS) is enabled on core tables
SELECT 
    schemaname, 
    tablename, 
    rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'sys_permissions', 'rec_candidates', 'rec_jobs');

-- 2. Inspect active policies on public.profiles
SELECT 
    policyname, 
    cmd AS operation, 
    qual AS select_expression, 
    with_check AS check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

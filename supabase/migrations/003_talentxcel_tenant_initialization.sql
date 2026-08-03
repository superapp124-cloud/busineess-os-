-- ============================================================================
-- CHATR Production Tenant Initialization: TalentXcel Services Private Limited
-- Target Primary Administrator Login: 9717845477
-- ============================================================================

-- 1. Ensure sys_organizations table exists
CREATE TABLE IF NOT EXISTS public.sys_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_name TEXT NOT NULL UNIQUE,
    primary_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS on sys_organizations
ALTER TABLE public.sys_organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can query sys_organizations" ON public.sys_organizations;
CREATE POLICY "Authenticated users can query sys_organizations"
ON public.sys_organizations FOR SELECT
USING (auth.role() = 'authenticated');

-- 3. Idempotently Seed First Production Organization
INSERT INTO public.sys_organizations (org_name, primary_phone)
VALUES ('TalentXcel Services Private Limited', '9717845477')
ON CONFLICT (org_name) DO NOTHING;

-- 4. Idempotently Link Administrator Profile for 9717845477
-- Updates existing profile for phone 9717845477 or creates system record if matching
UPDATE public.profiles
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{organization_name}',
    '"TalentXcel Services Private Limited"'
)
WHERE phone LIKE '%9717845477%';

-- 5. Verification Query
SELECT id, org_name, primary_phone, created_at 
FROM public.sys_organizations 
WHERE org_name = 'TalentXcel Services Private Limited';

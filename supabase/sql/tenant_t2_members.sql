CREATE TABLE IF NOT EXISTS public.sys_org_members (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       uuid NOT NULL REFERENCES public.sys_organizations(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         text NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE(org_id, user_id)
);

ALTER TABLE public.sys_org_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sys_org_members_user ON public.sys_org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_sys_org_members_org ON public.sys_org_members(org_id);
ALTER TABLE public.sys_org_members REPLICA IDENTITY FULL;

CREATE TABLE IF NOT EXISTS public.sys_organizations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  slug         text UNIQUE,
  owner_id     uuid NOT NULL REFERENCES auth.users(id),
  settings     jsonb DEFAULT '{}'::jsonb,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE public.sys_organizations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sys_orgs_owner ON public.sys_organizations(owner_id);
ALTER TABLE public.sys_organizations REPLICA IDENTITY FULL;

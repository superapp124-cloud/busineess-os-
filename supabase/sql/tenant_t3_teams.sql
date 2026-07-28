CREATE TABLE IF NOT EXISTS public.sys_teams (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       uuid NOT NULL REFERENCES public.sys_organizations(id) ON DELETE CASCADE,
  name         text NOT NULL,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE public.sys_teams ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sys_teams_org ON public.sys_teams(org_id);
ALTER TABLE public.sys_teams REPLICA IDENTITY FULL;

CREATE TABLE IF NOT EXISTS public.sys_workspaces (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES public.sys_organizations(id) ON DELETE CASCADE,
  team_id         uuid REFERENCES public.sys_teams(id) ON DELETE CASCADE,
  capability_id   text NOT NULL,
  capability_name text NOT NULL,
  settings        jsonb DEFAULT '{}'::jsonb,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.sys_workspaces ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sys_ws_org ON public.sys_workspaces(org_id);
ALTER TABLE public.sys_workspaces REPLICA IDENTITY FULL;

CREATE TABLE IF NOT EXISTS public.sys_organizations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, slug text UNIQUE, owner_id uuid NOT NULL REFERENCES auth.users(id), settings jsonb DEFAULT '{}'::jsonb, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
ALTER TABLE public.sys_organizations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sys_orgs_owner ON public.sys_organizations(owner_id);
ALTER TABLE public.sys_organizations REPLICA IDENTITY FULL;

CREATE TABLE IF NOT EXISTS public.sys_org_members (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL REFERENCES public.sys_organizations(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role text NOT NULL DEFAULT 'member', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), UNIQUE(org_id, user_id));
ALTER TABLE public.sys_org_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sys_org_members_user ON public.sys_org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_sys_org_members_org ON public.sys_org_members(org_id);
ALTER TABLE public.sys_org_members REPLICA IDENTITY FULL;

CREATE TABLE IF NOT EXISTS public.sys_teams (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL REFERENCES public.sys_organizations(id) ON DELETE CASCADE, name text NOT NULL, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
ALTER TABLE public.sys_teams ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sys_teams_org ON public.sys_teams(org_id);
ALTER TABLE public.sys_teams REPLICA IDENTITY FULL;

CREATE TABLE IF NOT EXISTS public.sys_workspaces (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL REFERENCES public.sys_organizations(id) ON DELETE CASCADE, team_id uuid REFERENCES public.sys_teams(id) ON DELETE CASCADE, capability_id text NOT NULL, capability_name text NOT NULL, settings jsonb DEFAULT '{}'::jsonb, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
ALTER TABLE public.sys_workspaces ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sys_ws_org ON public.sys_workspaces(org_id);
ALTER TABLE public.sys_workspaces REPLICA IDENTITY FULL;

DROP POLICY IF EXISTS "orgs_user_all" ON public.sys_organizations;
CREATE POLICY "orgs_user_all" ON public.sys_organizations FOR ALL USING (owner_id = auth.uid() OR id IN (SELECT org_id FROM public.sys_org_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "org_members_user_all" ON public.sys_org_members;
CREATE POLICY "org_members_user_all" ON public.sys_org_members FOR ALL USING (user_id = auth.uid() OR org_id IN (SELECT id FROM public.sys_organizations WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "teams_user_all" ON public.sys_teams;
CREATE POLICY "teams_user_all" ON public.sys_teams FOR ALL USING (org_id IN (SELECT org_id FROM public.sys_org_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "workspaces_user_all" ON public.sys_workspaces;
CREATE POLICY "workspaces_user_all" ON public.sys_workspaces FOR ALL USING (org_id IN (SELECT org_id FROM public.sys_org_members WHERE user_id = auth.uid()));

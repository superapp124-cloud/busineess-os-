-- Policies for Organizations
DROP POLICY IF EXISTS "orgs_user_all" ON public.sys_organizations;
CREATE POLICY "orgs_user_all" ON public.sys_organizations FOR ALL 
USING (
  owner_id = auth.uid() 
  OR id IN (SELECT org_id FROM public.sys_org_members WHERE user_id = auth.uid())
);

-- Policies for Org Members
DROP POLICY IF EXISTS "org_members_user_all" ON public.sys_org_members;
CREATE POLICY "org_members_user_all" ON public.sys_org_members FOR ALL 
USING (
  user_id = auth.uid() 
  OR org_id IN (
    SELECT id FROM public.sys_organizations WHERE owner_id = auth.uid()
  )
);

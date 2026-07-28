DROP POLICY IF EXISTS "orgs_user_all" ON public.sys_organizations;
CREATE POLICY "orgs_user_all" ON public.sys_organizations FOR ALL 
USING (
  owner_id = auth.uid() 
  OR id IN (SELECT org_id FROM public.sys_org_members WHERE user_id = auth.uid())
);

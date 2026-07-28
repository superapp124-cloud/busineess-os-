DROP POLICY IF EXISTS "teams_user_all" ON public.sys_teams;
CREATE POLICY "teams_user_all" ON public.sys_teams FOR ALL 
USING (
  org_id IN (
    SELECT org_id FROM public.sys_org_members WHERE user_id = auth.uid()
  )
);

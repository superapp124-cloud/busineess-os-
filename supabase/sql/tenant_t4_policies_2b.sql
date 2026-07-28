DROP POLICY IF EXISTS "workspaces_user_all" ON public.sys_workspaces;
CREATE POLICY "workspaces_user_all" ON public.sys_workspaces FOR ALL 
USING (
  org_id IN (
    SELECT org_id FROM public.sys_org_members WHERE user_id = auth.uid()
  )
);

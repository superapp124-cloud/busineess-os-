DROP POLICY IF EXISTS "org_members_user_all" ON public.sys_org_members;
CREATE POLICY "org_members_user_all" ON public.sys_org_members FOR ALL 
USING (
  user_id = auth.uid() 
  OR org_id IN (
    SELECT id FROM public.sys_organizations WHERE owner_id = auth.uid()
  )
);

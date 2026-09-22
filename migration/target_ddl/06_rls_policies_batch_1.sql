-- ==============================================================================
-- PART 6: ROW LEVEL SECURITY POLICIES (Batch 1 of 2)
-- Total policies in this batch: 592
-- Target: nuuuqazaoaozgblmvkzn
-- ==============================================================================

DO $$ BEGIN
  CREATE POLICY "fin_policy_admin" ON public."fin_accounting_policies"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::text))
  WITH CHECK (has_role(auth.uid(), 'admin'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_policy_view" ON public."fin_accounting_policies"
  FOR SELECT
  USING (((status = ANY (ARRAY['ACTIVE'::text, 'SUPERSEDED'::text])) AND (fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read gsc_properties" ON public."gsc_properties"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Service full access gsc_properties" ON public."gsc_properties"
  FOR ALL
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Granted users can view their access" ON public."identity_access_rules"
  FOR SELECT
  USING ((granted_to_user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Identity owners manage access rules" ON public."identity_access_rules"
  FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM user_identities ui
  WHERE ((ui.id = identity_access_rules.identity_id) AND (ui.user_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM user_identities ui
  WHERE ((ui.id = identity_access_rules.identity_id) AND (ui.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Join circle" ON public."circle_members"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Leave circle" ON public."circle_members"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "View circle members" ON public."circle_members"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_contracts manage" ON public."fin_contracts"
  FOR ALL
  USING ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'member'::text)))
  WITH CHECK ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'member'::text)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_contracts view" ON public."fin_contracts"
  FOR SELECT
  USING ((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create projects" ON public."app_builder_projects"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their projects" ON public."app_builder_projects"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their projects" ON public."app_builder_projects"
  FOR SELECT
  USING (((auth.uid() = user_id) OR (is_published = true)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can add participants to conversations" ON public."conversation_participants"
  FOR INSERT
  WITH CHECK (((EXISTS ( SELECT 1
   FROM conversations
  WHERE ((conversations.id = conversation_participants.conversation_id) AND (conversations.created_by = auth.uid())))) OR (user_id = auth.uid())))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view participants in their conversations" ON public."conversation_participants"
  FOR SELECT
  USING (is_conversation_participant(conversation_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view events" ON public."community_events_db"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can create events" ON public."community_events_db"
  FOR INSERT
  WITH CHECK ((auth.uid() IS NOT NULL))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can add their own reactions" ON public."story_reactions"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own reactions" ON public."story_reactions"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own reactions" ON public."story_reactions"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view all reactions" ON public."story_reactions"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create symptom checks" ON public."symptom_checks"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own symptom checks" ON public."symptom_checks"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their symptom checks" ON public."symptom_checks"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view categories" ON public."app_categories"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view AR filters" ON public."ar_brand_filters"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_cn view" ON public."fin_credit_notes"
  FOR SELECT
  USING ((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view search cache" ON public."search_cache"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages search_cache" ON public."search_cache"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users create own redemptions" ON public."champion_reward_redemptions"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users view own redemptions" ON public."champion_reward_redemptions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own scheduled notifications" ON public."scheduled_notifications"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own scheduled notifications" ON public."scheduled_notifications"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own scheduled notifications" ON public."scheduled_notifications"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own scheduled notifications" ON public."scheduled_notifications"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_invoices manage" ON public."fin_invoices"
  FOR ALL
  USING ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'member'::text)))
  WITH CHECK ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'member'::text)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_invoices view" ON public."fin_invoices"
  FOR SELECT
  USING ((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage all points" ON public."user_points"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their points record" ON public."user_points"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own points" ON public."user_points"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own points" ON public."user_points"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own reports" ON public."caller_reports"
  FOR INSERT
  WITH CHECK ((auth.uid() = reporter_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own reports" ON public."caller_reports"
  FOR DELETE
  USING ((auth.uid() = reporter_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view all reports for caller ID" ON public."caller_reports"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can read attribution" ON public."seo_attribution"
  FOR SELECT
  USING ((has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ceo'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can record their own arrival" ON public."seo_attribution"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Providers can view own payouts" ON public."provider_payouts"
  FOR SELECT
  USING ((provider_id IN ( SELECT service_providers.id
   FROM service_providers
  WHERE (service_providers.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their emergency contacts" ON public."emergency_contacts"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Team members can access crm_agent_tasks" ON public."crm_agent_tasks"
  FOR ALL
  USING (((business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid()))) OR (business_id IN ( SELECT business_profiles.id
   FROM business_profiles
  WHERE (business_profiles.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can join challenges" ON public."challenge_participants"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own favorites" ON public."favorite_results"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own favorites" ON public."favorite_results"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own favorites" ON public."favorite_results"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own favorites" ON public."favorite_results"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage settlements" ON public."point_settlements"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage secrets vault" ON public."secrets_vault"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their signals" ON public."webrtc_signals"
  FOR DELETE
  USING ((auth.uid() = to_user))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can send signals" ON public."webrtc_signals"
  FOR INSERT
  WITH CHECK ((auth.uid() = from_user))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their signals" ON public."webrtc_signals"
  FOR SELECT
  USING ((auth.uid() = to_user))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Enable read for authenticated users" ON public."ai_traces"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_alloc manage" ON public."fin_payment_allocations"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_alloc view" ON public."fin_payment_allocations"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can only view own login streaks" ON public."chatr_login_streaks"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their streaks" ON public."chatr_login_streaks"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages login_streaks" ON public."chatr_login_streaks"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users can insert own login_streak" ON public."chatr_login_streaks"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users can update own login_streak" ON public."chatr_login_streaks"
  FOR UPDATE
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own notification preferences" ON public."notification_preferences"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own notification preferences" ON public."notification_preferences"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own notification preferences" ON public."notification_preferences"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their wallet" ON public."chatr_wallet"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their wallet" ON public."chatr_wallet"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their transactions" ON public."wallet_transactions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view businesses" ON public."local_business_db"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can add businesses" ON public."local_business_db"
  FOR INSERT
  WITH CHECK ((auth.uid() IS NOT NULL))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own businesses" ON public."local_business_db"
  FOR UPDATE
  USING ((auth.uid() = added_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "kg_nodes_tenant_delete" ON public."kg_nodes"
  FOR DELETE
  USING (((auth.uid())::text = tenant_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "kg_nodes_tenant_insert" ON public."kg_nodes"
  FOR INSERT
  WITH CHECK (((auth.uid())::text = tenant_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "kg_nodes_tenant_select" ON public."kg_nodes"
  FOR SELECT
  USING (((auth.uid())::text = tenant_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "kg_nodes_tenant_update" ON public."kg_nodes"
  FOR UPDATE
  USING (((auth.uid())::text = tenant_id))
  WITH CHECK (((auth.uid())::text = tenant_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "API usage is readable by everyone" ON public."chatr_api_usage"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "admin_manage_submissions" ON public."micro_task_submissions"
  FOR ALL
  USING (is_micro_task_admin(auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "create_own_submissions" ON public."micro_task_submissions"
  FOR INSERT
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "view_own_submissions" ON public."micro_task_submissions"
  FOR SELECT
  USING ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read gsc_opportunities" ON public."gsc_opportunities"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Service full access gsc_opportunities" ON public."gsc_opportunities"
  FOR ALL
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can read and write Finance ledgers" ON public."testbed_finance_ledgers"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can mark their own notifications read" ON public."champion_notifications"
  FOR UPDATE
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own champion notifications" ON public."champion_notifications"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active rewards" ON public."chatr_coin_rewards"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view availability" ON public."provider_availability"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Providers can manage own availability" ON public."provider_availability"
  FOR ALL
  USING ((provider_id IN ( SELECT service_providers.id
   FROM service_providers
  WHERE (service_providers.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Create own stories" ON public."wellness_stories"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Delete own stories" ON public."wellness_stories"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Update own stories" ON public."wellness_stories"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "View public stories" ON public."wellness_stories"
  FOR SELECT
  USING (((is_public = true) OR (auth.uid() = user_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own posts" ON public."fame_cam_posts"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own fame cam posts" ON public."fame_cam_posts"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own posts" ON public."fame_cam_posts"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own fame cam posts" ON public."fame_cam_posts"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own fame cam posts" ON public."fame_cam_posts"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own posts" ON public."fame_cam_posts"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view all fame cam posts" ON public."fame_cam_posts"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view all posts" ON public."fame_cam_posts"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Team members can access crm_lead_dossiers" ON public."crm_lead_dossiers"
  FOR ALL
  USING (((business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid()))) OR (business_id IN ( SELECT business_profiles.id
   FROM business_profiles
  WHERE (business_profiles.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their notification bundles" ON public."notification_bundles"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated can look up phonebook" ON public."contacts_hash"
  FOR SELECT
  USING ((opt_out = false))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO insert metrics" ON public."cc_metrics"
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'ceo'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO view metrics" ON public."cc_metrics"
  FOR SELECT
  USING (has_role(auth.uid(), 'ceo'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Creators can update their communities" ON public."communities"
  FOR UPDATE
  USING ((auth.uid() = created_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public communities are viewable by everyone" ON public."communities"
  FOR SELECT
  USING ((is_public = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create communities" ON public."communities"
  FOR INSERT
  WITH CHECK ((auth.uid() = created_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view profile music" ON public."profile_music"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their profile music" ON public."profile_music"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Channels are viewable by everyone." ON public."channels"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can manage channels." ON public."channels"
  FOR ALL
  USING ((auth.uid() = owner_id))
  WITH CHECK ((auth.uid() = owner_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can read and write HR candidates" ON public."testbed_hr_candidates"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create referrals" ON public."referral_rewards"
  FOR INSERT
  WITH CHECK ((auth.uid() = referrer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their referrals" ON public."referral_rewards"
  FOR SELECT
  USING (((auth.uid() = referrer_id) OR (auth.uid() = referred_user_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all read statuses" ON public."announcement_reads"
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can mark announcements as read" ON public."announcement_reads"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their read status" ON public."announcement_reads"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their earned badges" ON public."chatr_user_badges"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their subscription" ON public."chatr_user_subscriptions"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their subscription" ON public."chatr_user_subscriptions"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own subscription" ON public."chatr_user_subscriptions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view reactions" ON public."community_post_reactions"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage own reactions del" ON public."community_post_reactions"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage own reactions ins" ON public."community_post_reactions"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their wallet" ON public."chatr_plus_wallet"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their wallet" ON public."chatr_plus_wallet"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their wallet" ON public."chatr_plus_wallet"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Patient can cancel own appointment" ON public."appointments"
  FOR DELETE
  USING ((auth.uid() = patient_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Patient or provider can update appointment" ON public."appointments"
  FOR UPDATE
  USING (((auth.uid() = patient_id) OR (auth.uid() = provider_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Patient or provider can view appointment" ON public."appointments"
  FOR SELECT
  USING (((auth.uid() = patient_id) OR (auth.uid() = provider_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create appointments" ON public."appointments"
  FOR INSERT
  WITH CHECK ((auth.uid() = patient_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authors can delete own posts" ON public."community_posts"
  FOR DELETE
  USING ((auth.uid() = author_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authors can update own posts" ON public."community_posts"
  FOR UPDATE
  USING ((auth.uid() = author_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can create posts" ON public."community_posts"
  FOR INSERT
  WITH CHECK (((auth.uid() = author_id) AND (EXISTS ( SELECT 1
   FROM conversation_participants cp
  WHERE ((cp.conversation_id = community_posts.community_id) AND (cp.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "View posts in public communities or as member" ON public."community_posts"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM conversations c
  WHERE ((c.id = community_posts.community_id) AND ((c.is_public = true) OR (EXISTS ( SELECT 1
           FROM conversation_participants cp
          WHERE ((cp.conversation_id = c.id) AND (cp.user_id = auth.uid())))))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own automation rules" ON public."automation_rules"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own interactions" ON public."user_search_interactions"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own interactions" ON public."user_search_interactions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own energy pulse sessions" ON public."energy_pulse_sessions"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Active jobs are viewable by everyone" ON public."job_listings"
  FOR SELECT
  USING (((is_active = true) OR (posted_by = auth.uid())))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Posters can delete own jobs" ON public."job_listings"
  FOR DELETE
  USING ((auth.uid() = posted_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Posters can update own jobs" ON public."job_listings"
  FOR UPDATE
  USING ((auth.uid() = posted_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can post jobs" ON public."job_listings"
  FOR INSERT
  WITH CHECK ((auth.uid() = posted_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own coin balance" ON public."chatr_coin_balances"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages chatr_coin_balances" ON public."chatr_coin_balances"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can set typing status" ON public."typing_indicators"
  FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = typing_indicators.conversation_id) AND (conversation_participants.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own typing status" ON public."typing_indicators"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view typing indicators in their conversations" ON public."typing_indicators"
  FOR SELECT
  USING ((conversation_id IN ( SELECT DISTINCT messages.conversation_id
   FROM messages
  WHERE (messages.sender_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their stealth mode" ON public."user_stealth_modes"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can join rooms" ON public."audio_room_participants"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can leave rooms" ON public."audio_room_participants"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view participants in rooms they're in" ON public."audio_room_participants"
  FOR SELECT
  USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM audio_room_participants arp2
  WHERE ((arp2.room_id = audio_room_participants.room_id) AND (arp2.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow inserts to os_events" ON public."os_events"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow selects on os_events" ON public."os_events"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Deny deletes to os_events" ON public."os_events"
  FOR DELETE
  USING (false)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Deny updates to os_events" ON public."os_events"
  FOR UPDATE
  USING (false)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage own rec_candidates" ON public."rec_candidates"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "rec_candidates_user_all" ON public."rec_candidates"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own context cache" ON public."call_context_cache"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own streaks" ON public."user_streaks"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own streaks" ON public."user_streaks"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own streaks" ON public."user_streaks"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage own prefs" ON public."smart_push_preferences"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Patients can view their access audit" ON public."medical_access_audit"
  FOR SELECT
  USING ((patient_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages medical_access_audit" ON public."medical_access_audit"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own streaks" ON public."health_streaks"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update notes in their conversations" ON public."conversation_notes"
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = conversation_notes.conversation_id) AND (conversation_participants.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can upsert notes in their conversations" ON public."conversation_notes"
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = conversation_notes.conversation_id) AND (conversation_participants.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view notes in their conversations" ON public."conversation_notes"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = conversation_notes.conversation_id) AND (conversation_participants.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view active deals" ON public."merchant_deals"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Vendors can manage own deals" ON public."merchant_deals"
  FOR ALL
  USING ((vendor_id IN ( SELECT vendors.id
   FROM vendors
  WHERE (vendors.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their ad commission" ON public."chatr_business_ad_rewards"
  FOR SELECT
  USING ((auth.uid() = referrer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete approvals" ON public."workflow_approvals"
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Approvers and admins can update approvals" ON public."workflow_approvals"
  FOR UPDATE
  USING (((approver_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Involved users can view approvals" ON public."workflow_approvals"
  FOR SELECT
  USING (((requested_by = auth.uid()) OR (approver_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Requesters can create approvals" ON public."workflow_approvals"
  FOR INSERT
  WITH CHECK (((requested_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view available offerings" ON public."business_offerings"
  FOR SELECT
  USING ((available = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Business owners can manage offerings" ON public."business_offerings"
  FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM business_profiles
  WHERE ((business_profiles.id = business_offerings.business_id) AND (business_profiles.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own highlights" ON public."story_highlights"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own highlights" ON public."story_highlights"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own highlights" ON public."story_highlights"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view all highlights" ON public."story_highlights"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "System can create alerts" ON public."search_alerts"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own alerts" ON public."search_alerts"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own alerts" ON public."search_alerts"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can send messages to their conversations" ON public."messages"
  FOR INSERT
  WITH CHECK (((auth.uid() = sender_id) AND (EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = messages.conversation_id) AND (conversation_participants.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own messages" ON public."messages"
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = messages.conversation_id) AND (conversation_participants.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view messages in their conversations" ON public."messages"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = messages.conversation_id) AND (conversation_participants.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can install apps" ON public."chatr_os_apps"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can uninstall non-system apps" ON public."chatr_os_apps"
  FOR DELETE
  USING (((auth.uid() = user_id) AND (is_system_app = false)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their apps" ON public."chatr_os_apps"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own installed apps" ON public."chatr_os_apps"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own AI agents" ON public."ai_agents"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own AI agents" ON public."ai_agents"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own AI agents" ON public."ai_agents"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own AI agents" ON public."ai_agents"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own FCM delivery logs" ON public."fcm_delivery_logs"
  FOR SELECT
  USING (((auth.uid() = caller_id) OR (auth.uid() = receiver_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view comments" ON public."post_comments"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create comments" ON public."post_comments"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own comments" ON public."post_comments"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own comments" ON public."post_comments"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Backend only access to auth exchange attempts" ON public."auth_exchange_attempts"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "admin_manage_verifications" ON public."micro_task_verifications"
  FOR ALL
  USING (is_micro_task_admin(auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read metrics" ON public."search_performance_metrics"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_rec_sess view" ON public."fin_reconciliation_sessions"
  FOR SELECT
  USING ((bank_account_id IN ( SELECT fin_bank_accounts.id
   FROM fin_bank_accounts
  WHERE (fin_bank_accounts.fin_organization_id IN ( SELECT fo.id
           FROM (fin_organizations fo
             JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
          WHERE (stu.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "User achievements are viewable by everyone" ON public."user_fame_achievements"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public insert to growth_events" ON public."growth_events"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read growth_events" ON public."growth_events"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Service full access growth_events" ON public."growth_events"
  FOR ALL
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage packages" ON public."point_packages"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active packages" ON public."point_packages"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage own rec_jobs" ON public."rec_jobs"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "rec_jobs_user_all" ON public."rec_jobs"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can create workflow versions" ON public."workflow_versions"
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM business_workflows w
  WHERE ((w.id = workflow_versions.workflow_id) AND (w.profile_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can view workflow versions" ON public."workflow_versions"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM business_workflows w
  WHERE ((w.id = workflow_versions.workflow_id) AND (w.profile_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO delete plans" ON public."cc_plans"
  FOR DELETE
  USING (has_role(auth.uid(), 'ceo'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO insert plans" ON public."cc_plans"
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'ceo'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO update plans" ON public."cc_plans"
  FOR UPDATE
  USING (has_role(auth.uid(), 'ceo'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO view plans" ON public."cc_plans"
  FOR SELECT
  USING (has_role(auth.uid(), 'ceo'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can install apps" ON public."user_installed_apps"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can uninstall apps" ON public."user_installed_apps"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update app usage" ON public."user_installed_apps"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their installed apps" ON public."user_installed_apps"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own prescriptions" ON public."prescription_uploads"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read their own organization" ON public."organizations"
  FOR SELECT
  USING ((id IN ( SELECT enterprise_users.organization_id
   FROM enterprise_users
  WHERE (enterprise_users.id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own scheduled messages" ON public."scheduled_messages"
  FOR ALL
  USING ((auth.uid() = sender_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own workflows" ON public."business_workflows"
  FOR ALL
  USING ((auth.uid() = profile_id))
  WITH CHECK ((auth.uid() = profile_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view templates" ON public."studio_design_templates"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO and admins manage outreach" ON public."cc_outreach"
  FOR ALL
  USING ((has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'admin'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own audit logs" ON public."audit_logs"
  FOR INSERT
  WITH CHECK ((actor_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own audit logs" ON public."audit_logs"
  FOR SELECT
  USING (((actor_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_events_insert" ON public."fin_events"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_events_view" ON public."fin_events"
  FOR SELECT
  USING ((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view offers" ON public."local_offers_db"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can add offers" ON public."local_offers_db"
  FOR INSERT
  WITH CHECK ((auth.uid() IS NOT NULL))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own offers" ON public."local_offers_db"
  FOR UPDATE
  USING ((auth.uid() = posted_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can view their workspaces" ON public."workspaces"
  FOR SELECT
  USING (is_workspace_member(id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can delete their workspaces" ON public."workspaces"
  FOR DELETE
  USING ((owner_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can update their workspaces" ON public."workspaces"
  FOR UPDATE
  USING ((owner_id = auth.uid()))
  WITH CHECK ((owner_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own workspaces" ON public."workspaces"
  FOR INSERT
  WITH CHECK ((owner_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view active verified vendors" ON public."vendors"
  FOR SELECT
  USING (((is_verified = true) AND (is_active = true)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Vendors can insert own profile" ON public."vendors"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Vendors can update own profile" ON public."vendors"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Vendors can view own profile" ON public."vendors"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their health goals" ON public."health_goals"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers can create bookings" ON public."service_bookings"
  FOR INSERT
  WITH CHECK ((auth.uid() = customer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers can update their bookings" ON public."service_bookings"
  FOR UPDATE
  USING ((auth.uid() = customer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers can view their bookings" ON public."service_bookings"
  FOR SELECT
  USING ((auth.uid() = customer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Providers can update assigned bookings" ON public."service_bookings"
  FOR UPDATE
  USING ((provider_id IN ( SELECT service_providers.id
   FROM service_providers
  WHERE (service_providers.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Providers can view their bookings" ON public."service_bookings"
  FOR SELECT
  USING ((provider_id IN ( SELECT service_providers.id
   FROM service_providers
  WHERE (service_providers.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view published posts" ON public."official_account_posts"
  FOR SELECT
  USING (((is_published = true) OR (EXISTS ( SELECT 1
   FROM official_accounts oa
  WHERE ((oa.id = official_account_posts.account_id) AND (oa.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can delete posts" ON public."official_account_posts"
  FOR DELETE
  USING ((EXISTS ( SELECT 1
   FROM official_accounts oa
  WHERE ((oa.id = official_account_posts.account_id) AND (oa.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can insert posts" ON public."official_account_posts"
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM official_accounts oa
  WHERE ((oa.id = official_account_posts.account_id) AND (oa.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can update posts" ON public."official_account_posts"
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM official_accounts oa
  WHERE ((oa.id = official_account_posts.account_id) AND (oa.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own nutrition logs" ON public."nutrition_logs"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own nutrition logs" ON public."nutrition_logs"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own nutrition logs" ON public."nutrition_logs"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own nutrition logs" ON public."nutrition_logs"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own imported contacts" ON public."gmail_imported_contacts"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own imported contacts" ON public."gmail_imported_contacts"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own imported contacts" ON public."gmail_imported_contacts"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their blocked contacts" ON public."blocked_contacts"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Business owners can manage pipelines" ON public."crm_pipelines"
  FOR ALL
  USING ((business_id IN ( SELECT btm.business_id
   FROM business_team_members btm
  WHERE ((btm.user_id = auth.uid()) AND (btm.role = ANY (ARRAY['owner'::text, 'admin'::text]))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Team members can view pipelines" ON public."crm_pipelines"
  FOR SELECT
  USING ((business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view medication interactions" ON public."medication_interactions"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Vendors can view own settlements" ON public."vendor_settlements"
  FOR SELECT
  USING ((vendor_id IN ( SELECT vendors.id
   FROM vendors
  WHERE (vendors.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can unlock their own achievements" ON public."game_user_achievements"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own achievements" ON public."game_user_achievements"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Session participants can access" ON public."cce_sessions"
  FOR ALL
  USING (((auth.uid() = initiator_id) OR (auth.uid() = peer_id)))
  WITH CHECK (((auth.uid() = initiator_id) OR (auth.uid() = peer_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can share moments" ON public."moment_shares"
  FOR ALL
  USING ((auth.uid() = shared_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_vendors manage" ON public."fin_vendors"
  FOR ALL
  USING ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'member'::text)))
  WITH CHECK ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'member'::text)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_vendors view" ON public."fin_vendors"
  FOR SELECT
  USING ((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage all roles" ON public."user_roles"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage all user_roles" ON public."user_roles"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own roles" ON public."user_roles"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can only view own referral network" ON public."chatr_referral_network"
  FOR SELECT
  USING (((auth.uid() = user_id) OR (auth.uid() = root_user_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their network" ON public."chatr_referral_network"
  FOR SELECT
  USING (((auth.uid() = root_user_id) OR (auth.uid() = user_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages chatr_referral_network" ON public."chatr_referral_network"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Team members can create leads" ON public."crm_leads"
  FOR INSERT
  WITH CHECK ((business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Team members can delete leads" ON public."crm_leads"
  FOR DELETE
  USING ((business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Team members can update leads" ON public."crm_leads"
  FOR UPDATE
  USING ((business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Team members can view business leads" ON public."crm_leads"
  FOR SELECT
  USING ((business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own transcriptions" ON public."voice_transcriptions"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages voice_transcriptions" ON public."voice_transcriptions"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can insert messages." ON public."channel_messages"
  FOR INSERT
  WITH CHECK (((auth.uid() = sender_id) AND is_channel_admin(channel_id, auth.uid())))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Messages are viewable by everyone." ON public."channel_messages"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their seller settings" ON public."seller_mode_settings"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own events" ON public."geofence_events"
  FOR INSERT
  WITH CHECK (((auth.uid())::text = (user_id)::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own events" ON public."geofence_events"
  FOR SELECT
  USING (((auth.uid())::text = (user_id)::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own parallel you challenges" ON public."parallel_you_challenges"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Enable insert access for authenticated users" ON public."candidates"
  FOR INSERT
  WITH CHECK ((auth.role() = 'authenticated'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Enable read access for authenticated users" ON public."candidates"
  FOR SELECT
  USING ((auth.role() = 'authenticated'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Enable update access for authenticated users" ON public."candidates"
  FOR UPDATE
  USING ((auth.role() = 'authenticated'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create vaccination records" ON public."vaccination_records"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their vaccination records" ON public."vaccination_records"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage vaccination records" ON public."vaccination_records"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their vaccination records" ON public."vaccination_records"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their vaccination records" ON public."vaccination_records"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create QR payments" ON public."qr_payments"
  FOR INSERT
  WITH CHECK ((auth.uid() = payer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their QR payments" ON public."qr_payments"
  FOR UPDATE
  USING (((auth.uid() = payer_id) OR (auth.uid() = receiver_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their QR payments" ON public."qr_payments"
  FOR SELECT
  USING (((auth.uid() = payer_id) OR (auth.uid() = receiver_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active catalog items" ON public."business_catalog"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Business team can manage catalog" ON public."business_catalog"
  FOR ALL
  USING ((business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Vendors can manage own deal merchant details" ON public."deal_merchant_details"
  FOR ALL
  USING ((vendor_id IN ( SELECT vendors.id
   FROM vendors
  WHERE (vendors.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can insert own KYC documents" ON public."seller_kyc_documents"
  FOR INSERT
  WITH CHECK ((seller_id IN ( SELECT chatr_plus_sellers.id
   FROM chatr_plus_sellers
  WHERE (chatr_plus_sellers.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can view own KYC documents" ON public."seller_kyc_documents"
  FOR SELECT
  USING ((seller_id IN ( SELECT chatr_plus_sellers.id
   FROM chatr_plus_sellers
  WHERE (chatr_plus_sellers.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view verified businesses" ON public."business_profiles"
  FOR SELECT
  USING ((verified = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Business owners can manage their profile" ON public."business_profiles"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active apps" ON public."mini_apps"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Developers can delete their apps" ON public."mini_apps"
  FOR DELETE
  USING ((auth.uid() = developer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Developers can insert apps" ON public."mini_apps"
  FOR INSERT
  WITH CHECK ((auth.uid() = developer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Developers can update their apps" ON public."mini_apps"
  FOR UPDATE
  USING ((auth.uid() = developer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their prescriptions" ON public."prescriptions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own metrics" ON public."network_metrics"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own metrics" ON public."network_metrics"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all profiles" ON public."profiles"
  FOR SELECT
  USING (((auth.jwt() ->> 'role'::text) = ANY (ARRAY['admin'::text, 'superadmin'::text, 'service_role'::text])))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own profile" ON public."profiles"
  FOR INSERT
  WITH CHECK ((auth.uid() = id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public."profiles"
  FOR UPDATE
  USING ((auth.uid() = id))
  WITH CHECK ((auth.uid() = id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view contacts profiles" ON public."profiles"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM contacts
  WHERE (((contacts.user_id = auth.uid()) AND (contacts.contact_user_id = profiles.id)) OR ((contacts.contact_user_id = auth.uid()) AND (contacts.user_id = profiles.id))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own profile" ON public."profiles"
  FOR SELECT
  USING ((auth.uid() = id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their contacts' profiles" ON public."profiles"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM contacts
  WHERE ((contacts.user_id = auth.uid()) AND (contacts.contact_user_id = profiles.id)))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own location" ON public."last_locations"
  FOR UPDATE
  USING (((auth.uid() = user_id) OR (session_id IS NOT NULL)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can upsert their own location" ON public."last_locations"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own location" ON public."last_locations"
  FOR SELECT
  USING (((auth.uid() = user_id) OR (auth.uid() IS NULL)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active plans" ON public."subscription_plans"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view trending searches" ON public."trending_searches"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages trending_searches" ON public."trending_searches"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage expirations" ON public."point_expirations"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their expirations" ON public."point_expirations"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_interco manage" ON public."fin_intercompany_transactions"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_interco view" ON public."fin_intercompany_transactions"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own rewards" ON public."user_rewards"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own rewards" ON public."user_rewards"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own rewards" ON public."user_rewards"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Tier rewards readable by all authenticated users" ON public."champion_tier_rewards"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own contact intelligence" ON public."contact_intelligence"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can upsert their own contact intelligence" ON public."contact_intelligence"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own contact intelligence" ON public."contact_intelligence"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "tenant_isolation_policy" ON public."legal_contracts"
  FOR ALL
  USING (((org_id = auth.uid()) AND (deleted_at IS NULL)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage photos in their albums" ON public."album_photos"
  FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM photo_albums
  WHERE ((photo_albums.id = album_photos.album_id) AND (photo_albums.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view photos in accessible albums" ON public."album_photos"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_prepaids manage" ON public."fin_prepaids"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_prepaids view" ON public."fin_prepaids"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Providers can view their appointments" ON public."chatr_healthcare_appointments"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM chatr_healthcare
  WHERE ((chatr_healthcare.id = chatr_healthcare_appointments.provider_id) AND (chatr_healthcare.owner_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create appointments" ON public."chatr_healthcare_appointments"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own appointments" ON public."chatr_healthcare_appointments"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own appointments" ON public."chatr_healthcare_appointments"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view badges" ON public."user_badges"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "System can create referrals" ON public."referrals"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create referrals" ON public."referrals"
  FOR INSERT
  WITH CHECK ((auth.uid() = referrer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own referrals" ON public."referrals"
  FOR UPDATE
  USING ((auth.uid() = referrer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own referrals" ON public."referrals"
  FOR SELECT
  USING (((auth.uid() = referrer_id) OR (auth.uid() = referred_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their referrals" ON public."referrals"
  FOR SELECT
  USING (((auth.uid() = referrer_id) OR (auth.uid() = referred_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view verified providers" ON public."home_service_providers"
  FOR SELECT
  USING ((verified = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Providers can manage their profile" ON public."home_service_providers"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can read public identity keys" ON public."e2e_identity_keys"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own identity keys" ON public."e2e_identity_keys"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "bos_tenant_insert" ON public."bos_records"
  FOR INSERT
  WITH CHECK (((auth.uid())::text = tenant_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "bos_tenant_select" ON public."bos_records"
  FOR SELECT
  USING (((auth.uid())::text = tenant_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "bos_tenant_update" ON public."bos_records"
  FOR UPDATE
  USING (((auth.uid())::text = tenant_id))
  WITH CHECK (((auth.uid())::text = tenant_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own subscriptions" ON public."push_subscriptions"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own subscriptions" ON public."push_subscriptions"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own subscriptions" ON public."push_subscriptions"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own subscriptions" ON public."push_subscriptions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view daily challenges" ON public."game_daily_challenges"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Enable read for authenticated users" ON public."workflow_state"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_inv_lines manage" ON public."fin_invoice_lines"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_inv_lines view" ON public."fin_invoice_lines"
  FOR SELECT
  USING ((invoice_id IN ( SELECT fin_invoices.id
   FROM fin_invoices
  WHERE (fin_invoices.fin_organization_id IN ( SELECT fo.id
           FROM (fin_organizations fo
             JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
          WHERE (stu.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own AI execution logs" ON public."ai_execution_log"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create transactions" ON public."chatr_plus_transactions"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their transactions" ON public."chatr_plus_transactions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can read and write Travel bookings" ON public."testbed_travel_bookings"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own recordings" ON public."call_recordings"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own recordings" ON public."call_recordings"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own recordings" ON public."call_recordings"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view mutual friends" ON public."mutual_friends"
  FOR SELECT
  USING (((auth.uid() = user_a) OR (auth.uid() = user_b)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert tasks in their workspaces" ON public."workspace_tasks"
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM workspace_members
  WHERE ((workspace_members.workspace_id = workspace_tasks.workspace_id) AND (workspace_members.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update tasks in their workspaces" ON public."workspace_tasks"
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM workspace_members
  WHERE ((workspace_members.workspace_id = workspace_tasks.workspace_id) AND (workspace_members.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view tasks in their workspaces" ON public."workspace_tasks"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM workspace_members
  WHERE ((workspace_members.workspace_id = workspace_tasks.workspace_id) AND (workspace_members.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own click logs" ON public."click_logs"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can only insert own click logs" ON public."click_logs"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can only view own click logs" ON public."click_logs"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own click logs" ON public."click_logs"
  FOR SELECT
  USING (((auth.uid() = user_id) OR (auth.uid() IS NULL)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read growth_actions" ON public."growth_actions"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Service full access growth_actions" ON public."growth_actions"
  FOR ALL
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Host can update room" ON public."session_rooms"
  FOR UPDATE
  USING ((host_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create rooms" ON public."session_rooms"
  FOR INSERT
  WITH CHECK ((host_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read rooms they are part of or host" ON public."session_rooms"
  FOR SELECT
  USING (((host_id = auth.uid()) OR is_session_room_member(id, auth.uid())))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins read gsc sync log" ON public."seo_gsc_sync"
  FOR SELECT
  USING ((has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ceo'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Create circles" ON public."wellness_circles"
  FOR INSERT
  WITH CHECK ((auth.uid() = created_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owner delete circles" ON public."wellness_circles"
  FOR DELETE
  USING ((auth.uid() = created_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owner update circles" ON public."wellness_circles"
  FOR UPDATE
  USING ((auth.uid() = created_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "View public circles" ON public."wellness_circles"
  FOR SELECT
  USING (((is_private = false) OR (auth.uid() = created_by)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their shares" ON public."chatr_shares"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages shares" ON public."chatr_shares"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users can insert own share" ON public."chatr_shares"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view specializations" ON public."specializations"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "admin_view_fraud_flags" ON public."micro_task_fraud_flags"
  FOR SELECT
  USING (is_micro_task_admin(auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages micro_task_fraud_flags" ON public."micro_task_fraud_flags"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_fx_admin" ON public."fin_fx_rates"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::text))
  WITH CHECK (has_role(auth.uid(), 'admin'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_fx_view" ON public."fin_fx_rates"
  FOR SELECT
  USING ((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_bills manage" ON public."fin_bills"
  FOR ALL
  USING ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'member'::text)))
  WITH CHECK ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'member'::text)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_bills view" ON public."fin_bills"
  FOR SELECT
  USING ((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert executions" ON public."execution_queue"
  FOR INSERT
  WITH CHECK ((created_by = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own executions" ON public."execution_queue"
  FOR UPDATE
  USING ((created_by = auth.uid()))
  WITH CHECK ((created_by = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own queued executions" ON public."execution_queue"
  FOR SELECT
  USING ((created_by = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Patients can create consents" ON public."provider_access_consents"
  FOR INSERT
  WITH CHECK ((auth.uid() = patient_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Patients can delete their consents" ON public."provider_access_consents"
  FOR DELETE
  USING ((auth.uid() = patient_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Patients can revoke their consents" ON public."provider_access_consents"
  FOR UPDATE
  USING ((auth.uid() = patient_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own consents" ON public."provider_access_consents"
  FOR SELECT
  USING (((auth.uid() = patient_id) OR (auth.uid() = provider_id) OR has_role(auth.uid(), 'admin'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_bank_stmt manage" ON public."fin_bank_statements"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_bank_stmt view" ON public."fin_bank_statements"
  FOR SELECT
  USING ((bank_account_id IN ( SELECT fin_bank_accounts.id
   FROM fin_bank_accounts
  WHERE (fin_bank_accounts.fin_organization_id IN ( SELECT fo.id
           FROM (fin_organizations fo
             JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
          WHERE (stu.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their templates" ON public."quick_reply_templates"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create payments" ON public."coin_payments"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their payments" ON public."coin_payments"
  FOR SELECT
  USING (((auth.uid() = user_id) OR (auth.uid() = merchant_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage recipients of their broadcasts" ON public."broadcast_recipients"
  FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM broadcast_lists
  WHERE ((broadcast_lists.id = broadcast_recipients.broadcast_id) AND (broadcast_lists.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete sent requests" ON public."connection_requests"
  FOR DELETE
  USING ((auth.uid() = sender_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can send connection requests" ON public."connection_requests"
  FOR INSERT
  WITH CHECK ((auth.uid() = sender_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update received requests" ON public."connection_requests"
  FOR UPDATE
  USING ((auth.uid() = receiver_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their connection requests" ON public."connection_requests"
  FOR SELECT
  USING (((auth.uid() = sender_id) OR (auth.uid() = receiver_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_pob manage" ON public."fin_performance_obligations"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_pob view" ON public."fin_performance_obligations"
  FOR SELECT
  USING ((contract_id IN ( SELECT fin_contracts.id
   FROM fin_contracts
  WHERE (fin_contracts.fin_organization_id IN ( SELECT fo.id
           FROM (fin_organizations fo
             JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
          WHERE (stu.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_bill_lines manage" ON public."fin_bill_lines"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_bill_lines view" ON public."fin_bill_lines"
  FOR SELECT
  USING ((bill_id IN ( SELECT fin_bills.id
   FROM fin_bills
  WHERE (fin_bills.fin_organization_id IN ( SELECT fo.id
           FROM (fin_organizations fo
             JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
          WHERE (stu.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_jl_insert" ON public."fin_journal_lines"
  FOR INSERT
  WITH CHECK ((journal_entry_id IN ( SELECT je.id
   FROM fin_journal_entries je
  WHERE ((je.status = 'DRAFT'::text) AND (je.created_by = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_jl_view" ON public."fin_journal_lines"
  FOR SELECT
  USING ((journal_entry_id IN ( SELECT je.id
   FROM ((fin_journal_entries je
     JOIN fin_organizations fo ON ((fo.id = je.fin_organization_id)))
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Missions readable by authenticated" ON public."champion_missions"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_acc_admin" ON public."fin_accounts"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::text))
  WITH CHECK (has_role(auth.uid(), 'admin'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_acc_view" ON public."fin_accounts"
  FOR SELECT
  USING ((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view and manage flags" ON public."content_flags"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can flag content" ON public."content_flags"
  FOR INSERT
  WITH CHECK ((auth.uid() = flagged_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own map hunt progress" ON public."map_hunt_progress"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Service full access gsc_sync_runs" ON public."gsc_sync_runs"
  FOR ALL
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own mobile actions" ON public."mobile_action_queue"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own mobile actions" ON public."mobile_action_queue"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own mobile actions" ON public."mobile_action_queue"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Caregivers can manage own alerts" ON public."caregiver_alerts"
  FOR ALL
  USING ((auth.uid() = caregiver_user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create payments" ON public."upi_payments"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert upi payments" ON public."upi_payments"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can only view their own upi payments" ON public."upi_payments"
  FOR SELECT
  USING (((auth.uid() = user_id) OR (auth.uid() = seller_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update pending payments" ON public."upi_payments"
  FOR UPDATE
  USING (((auth.uid() = user_id) AND (status = 'pending'::text)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own payments" ON public."upi_payments"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Insert own stats" ON public."user_stats"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Update own stats" ON public."user_stats"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "View user stats" ON public."user_stats"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own game profile" ON public."game_user_profiles"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users insert own engagement" ON public."user_feature_engagement"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users see own engagement" ON public."user_feature_engagement"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users update own engagement" ON public."user_feature_engagement"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own search logs" ON public."search_logs"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own searches" ON public."search_logs"
  FOR INSERT
  WITH CHECK (((auth.uid() = user_id) OR (user_id IS NULL)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can only view their own search history" ON public."search_logs"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own search logs" ON public."search_logs"
  FOR SELECT
  USING (((auth.uid() = user_id) OR (auth.uid() IS NULL)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage all earning events" ON public."earning_events"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own earning events" ON public."earning_events"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Enable read for authenticated users" ON public."platform_events"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update users" ON public."enterprise_users"
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM enterprise_users enterprise_users_1
  WHERE ((enterprise_users_1.id = auth.uid()) AND (enterprise_users_1.organization_id = enterprise_users_1.organization_id) AND (enterprise_users_1.role = 'Administrator'::enterprise_role_type)))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read colleagues in same organization" ON public."enterprise_users"
  FOR SELECT
  USING ((organization_id IN ( SELECT enterprise_users_1.organization_id
   FROM enterprise_users enterprise_users_1
  WHERE (enterprise_users_1.id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can delete customers" ON public."workspace_customers"
  FOR DELETE
  USING (is_workspace_member(workspace_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can manage customers" ON public."workspace_customers"
  FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can update customers" ON public."workspace_customers"
  FOR UPDATE
  USING (is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (is_workspace_member(workspace_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can view customers" ON public."workspace_customers"
  FOR SELECT
  USING (is_workspace_member(workspace_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_payments manage" ON public."fin_payments"
  FOR ALL
  USING ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'member'::text)))
  WITH CHECK ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'member'::text)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_payments view" ON public."fin_payments"
  FOR SELECT
  USING ((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active services" ON public."provider_services"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Providers can manage own services" ON public."provider_services"
  FOR ALL
  USING ((provider_id IN ( SELECT service_providers.id
   FROM service_providers
  WHERE (service_providers.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create orders" ON public."food_orders"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their orders" ON public."food_orders"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert transcriptions" ON public."call_transcriptions"
  FOR INSERT
  WITH CHECK ((auth.uid() IS NOT NULL))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can read transcriptions" ON public."call_transcriptions"
  FOR SELECT
  USING ((auth.uid() IS NOT NULL))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own memories" ON public."call_memories"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own memories" ON public."call_memories"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own memories" ON public."call_memories"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own memories" ON public."call_memories"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can view their fees" ON public."chatr_platform_fees"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM chatr_plus_sellers
  WHERE ((chatr_plus_sellers.id = chatr_platform_fees.seller_id) AND (chatr_plus_sellers.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own AI keys" ON public."user_ai_keys"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own medical ID" ON public."medical_id"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_rec_exc view" ON public."fin_reconciliation_exceptions"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "own sync runs" ON public."connector_sync_runs"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Enable insert access for authenticated users" ON public."requisitions"
  FOR INSERT
  WITH CHECK ((auth.role() = 'authenticated'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Enable read access for authenticated users" ON public."requisitions"
  FOR SELECT
  USING ((auth.role() = 'authenticated'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Enable update access for authenticated users" ON public."requisitions"
  FOR UPDATE
  USING ((auth.role() = 'authenticated'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can insert link previews" ON public."link_previews"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can read link previews" ON public."link_previews"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own preferences" ON public."user_preferences"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "admin_view_admins" ON public."micro_task_admins"
  FOR SELECT
  USING ((is_micro_task_admin(auth.uid()) OR (user_id = auth.uid())))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "tenant_isolation_policy" ON public."growth_assets"
  FOR ALL
  USING (((org_id = auth.uid()) AND (deleted_at IS NULL)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can submit contact form" ON public."contact_submissions"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their broadcast lists" ON public."broadcast_lists"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_customers manage" ON public."fin_customers"
  FOR ALL
  USING ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'member'::text)))
  WITH CHECK ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'member'::text)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_customers view" ON public."fin_customers"
  FOR SELECT
  USING ((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own lab reports" ON public."lab_reports"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own lab reports" ON public."lab_reports"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own lab reports" ON public."lab_reports"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own lab reports" ON public."lab_reports"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view leaderboard" ON public."leaderboard_cache"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own emotionsync challenges" ON public."emotionsync_challenges"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage location history" ON public."location_search_history"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Business owners can manage team" ON public."business_team_members"
  FOR ALL
  USING (is_business_owner(business_id, auth.uid()))
  WITH CHECK (is_business_owner(business_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Team members can view their team" ON public."business_team_members"
  FOR SELECT
  USING (((user_id = auth.uid()) OR is_business_owner(business_id, auth.uid())))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert encrypted messages" ON public."encrypted_messages"
  FOR INSERT
  WITH CHECK ((auth.uid() = sender_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own encrypted messages" ON public."encrypted_messages"
  FOR SELECT
  USING (((auth.uid() = sender_id) OR (auth.uid() = recipient_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view health conditions" ON public."health_conditions"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Providers can create updates" ON public."booking_status_updates"
  FOR INSERT
  WITH CHECK ((auth.uid() = updated_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view booking updates" ON public."booking_status_updates"
  FOR SELECT
  USING ((booking_id IN ( SELECT service_bookings.id
   FROM service_bookings
  WHERE ((service_bookings.customer_id = auth.uid()) OR (service_bookings.provider_id IN ( SELECT service_providers.id
           FROM service_providers
          WHERE (service_providers.user_id = auth.uid())))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create API keys" ON public."mcp_api_keys"
  FOR INSERT
  WITH CHECK ((created_by = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own API keys" ON public."mcp_api_keys"
  FOR DELETE
  USING ((created_by = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own API keys" ON public."mcp_api_keys"
  FOR UPDATE
  USING ((created_by = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own API keys" ON public."mcp_api_keys"
  FOR SELECT
  USING ((created_by = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Merchants create own customers" ON public."dhandha_customers"
  FOR INSERT
  WITH CHECK ((merchant_id IN ( SELECT merchant_profiles.id
   FROM merchant_profiles
  WHERE (merchant_profiles.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Merchants delete own customers" ON public."dhandha_customers"
  FOR DELETE
  USING ((merchant_id IN ( SELECT merchant_profiles.id
   FROM merchant_profiles
  WHERE (merchant_profiles.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Merchants update own customers" ON public."dhandha_customers"
  FOR UPDATE
  USING ((merchant_id IN ( SELECT merchant_profiles.id
   FROM merchant_profiles
  WHERE (merchant_profiles.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Merchants view own customers" ON public."dhandha_customers"
  FOR SELECT
  USING ((merchant_id IN ( SELECT merchant_profiles.id
   FROM merchant_profiles
  WHERE (merchant_profiles.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers and providers can update bookings" ON public."home_service_bookings"
  FOR UPDATE
  USING (((auth.uid() = customer_id) OR (EXISTS ( SELECT 1
   FROM home_service_providers
  WHERE ((home_service_providers.id = home_service_bookings.provider_id) AND (home_service_providers.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers can create bookings" ON public."home_service_bookings"
  FOR INSERT
  WITH CHECK ((auth.uid() = customer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers can view their bookings" ON public."home_service_bookings"
  FOR SELECT
  USING ((auth.uid() = customer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Providers can view their bookings" ON public."home_service_bookings"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM home_service_providers
  WHERE ((home_service_providers.id = home_service_bookings.provider_id) AND (home_service_providers.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view reviews" ON public."service_reviews"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers can create reviews" ON public."service_reviews"
  FOR INSERT
  WITH CHECK ((auth.uid() = customer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can read game levels" ON public."game_levels"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "own connections" ON public."connector_connections"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO and admins read revenue" ON public."cc_revenue_metrics"
  FOR SELECT
  USING ((has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'admin'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO and admins write revenue" ON public."cc_revenue_metrics"
  FOR ALL
  USING ((has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'admin'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_le_admin" ON public."fin_legal_entities"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::text))
  WITH CHECK (has_role(auth.uid(), 'admin'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_le_view" ON public."fin_legal_entities"
  FOR SELECT
  USING ((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active codes for validation" ON public."chatr_referral_codes"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their referral code" ON public."chatr_referral_codes"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages chatr_referral_codes" ON public."chatr_referral_codes"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can view youth posts" ON public."youth_posts"
  FOR SELECT
  USING ((auth.role() = 'authenticated'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own posts" ON public."youth_posts"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own posts" ON public."youth_posts"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own posts" ON public."youth_posts"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own medications" ON public."medications"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can join rooms" ON public."room_participants"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view room participants" ON public."room_participants"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM live_rooms
  WHERE ((live_rooms.id = room_participants.room_id) AND ((live_rooms.is_public = true) OR (live_rooms.host_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own statuses" ON public."statuses"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own statuses" ON public."statuses"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own statuses" ON public."statuses"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view active statuses" ON public."statuses"
  FOR SELECT
  USING (((is_active = true) AND (expires_at > now())))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view community comments" ON public."community_post_comments"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users create own community comments" ON public."community_post_comments"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users delete own community comments" ON public."community_post_comments"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users update own community comments" ON public."community_post_comments"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update applications" ON public."ambassador_applications"
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all applications" ON public."ambassador_applications"
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own application" ON public."ambassador_applications"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own application" ON public."ambassador_applications"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can only view own referrals" ON public."chatr_referrals"
  FOR SELECT
  USING (((auth.uid() = referrer_id) OR (auth.uid() = referred_user_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their referrals" ON public."chatr_referrals"
  FOR SELECT
  USING (((auth.uid() = referrer_id) OR (auth.uid() = referred_user_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages chatr_referrals" ON public."chatr_referrals"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can install plugins" ON public."user_installed_plugins"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can uninstall plugins" ON public."user_installed_plugins"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their plugins" ON public."user_installed_plugins"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their installed plugins" ON public."user_installed_plugins"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins manage page inventory" ON public."seo_pages"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Page inventory is public" ON public."seo_pages"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage filter prefs" ON public."search_filter_preferences"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins manage templates" ON public."notification_templates"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated can view active templates" ON public."notification_templates"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their challenge progress" ON public."user_challenge_progress"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update doctor applications" ON public."doctor_applications"
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all doctor applications" ON public."doctor_applications"
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view doctor_applications" ON public."doctor_applications"
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own doctor application" ON public."doctor_applications"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own doctor application" ON public."doctor_applications"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update app submissions" ON public."app_submissions"
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role)))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update submissions" ON public."app_submissions"
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all app submissions" ON public."app_submissions"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role)))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all submissions" ON public."app_submissions"
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view app_submissions" ON public."app_submissions"
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Developers can create submissions" ON public."app_submissions"
  FOR INSERT
  WITH CHECK ((developer_id IN ( SELECT developer_profiles.id
   FROM developer_profiles
  WHERE (developer_profiles.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Developers can update their pending submissions" ON public."app_submissions"
  FOR UPDATE
  USING (((developer_id IN ( SELECT developer_profiles.id
   FROM developer_profiles
  WHERE (developer_profiles.user_id = auth.uid()))) AND (submission_status = 'pending'::text)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Developers can view their own submissions" ON public."app_submissions"
  FOR SELECT
  USING ((developer_id IN ( SELECT developer_profiles.id
   FROM developer_profiles
  WHERE (developer_profiles.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create app submissions" ON public."app_submissions"
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM developer_profiles
  WHERE ((developer_profiles.id = app_submissions.developer_id) AND (developer_profiles.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own app submissions" ON public."app_submissions"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM developer_profiles
  WHERE ((developer_profiles.id = app_submissions.developer_id) AND (developer_profiles.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view chat triggers" ON public."chat_brand_triggers"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view available slots" ON public."teleconsultation_slots"
  FOR SELECT
  USING (((is_available = true) OR (booked_by = auth.uid())))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins manage feature catalog" ON public."feature_catalog"
  FOR ALL
  USING ((has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ceo'::app_role)))
  WITH CHECK ((has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ceo'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can read feature catalog" ON public."feature_catalog"
  FOR SELECT
  USING ((active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can read unused prekeys for session setup" ON public."e2e_prekeys"
  FOR SELECT
  USING ((is_used = false))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own prekeys" ON public."e2e_prekeys"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own orders" ON public."medicine_orders"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view reviews" ON public."home_service_reviews"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers can create reviews" ON public."home_service_reviews"
  FOR INSERT
  WITH CHECK ((auth.uid() = customer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own intake log" ON public."medicine_intake_log"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create sessions" ON public."device_sessions"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;


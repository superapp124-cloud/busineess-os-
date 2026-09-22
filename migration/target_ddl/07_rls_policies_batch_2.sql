-- ==============================================================================
-- PART 7: ROW LEVEL SECURITY POLICIES (Batch 2 of 2)
-- Total policies in this batch: 592
-- Target: nuuuqazaoaozgblmvkzn
-- ==============================================================================

DO $$ BEGIN
  CREATE POLICY "Users can delete their sessions" ON public."device_sessions"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their sessions" ON public."device_sessions"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own sessions" ON public."device_sessions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active sellers" ON public."chatr_plus_sellers"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can update their own profile" ON public."chatr_plus_sellers"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create seller profile" ON public."chatr_plus_sellers"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "OTP table is private" ON public."otp_verifications"
  FOR ALL
  USING (false)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active tutors" ON public."tutors"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Tutors can update their own profile" ON public."tutors"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their tutor profile" ON public."tutors"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Status owners can see who viewed" ON public."status_views"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM user_status
  WHERE ((user_status.id = status_views.status_id) AND (user_status.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can record status views" ON public."status_views"
  FOR INSERT
  WITH CHECK ((auth.uid() = viewer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can record their views" ON public."status_views"
  FOR INSERT
  WITH CHECK ((auth.uid() = viewer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view status views" ON public."status_views"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own rep sessions" ON public."ai_rep_sessions"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "System can manage trust factors" ON public."trust_factors"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own trust factors" ON public."trust_factors"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Rewards readable by authenticated" ON public."champion_rewards"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own challenge participation" ON public."health_challenge_participants"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own challenge participation" ON public."health_challenge_participants"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view challenge participants" ON public."health_challenge_participants"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_amend view" ON public."fin_contract_amendments"
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
  CREATE POLICY "Users can view their creator rewards" ON public."chatr_creator_rewards"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own media files" ON public."media_files"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own media files" ON public."media_files"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own settings" ON public."user_settings"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own settings" ON public."user_settings"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own settings" ON public."user_settings"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can create broadcasts" ON public."workspace_broadcasts"
  FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can delete broadcasts" ON public."workspace_broadcasts"
  FOR DELETE
  USING (is_workspace_member(workspace_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can update broadcasts" ON public."workspace_broadcasts"
  FOR UPDATE
  USING (is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (is_workspace_member(workspace_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can view broadcasts" ON public."workspace_broadcasts"
  FOR SELECT
  USING (is_workspace_member(workspace_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "tenant_isolation_policy" ON public."legal_cases"
  FOR ALL
  USING (((org_id = auth.uid()) AND (deleted_at IS NULL)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO and admins manage dev tasks" ON public."cc_dev_tasks"
  FOR ALL
  USING ((has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'admin'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Story owners can see who viewed their stories" ON public."story_views"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM stories
  WHERE ((stories.id = story_views.story_id) AND (stories.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create story views" ON public."story_views"
  FOR INSERT
  WITH CHECK ((auth.uid() = viewer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Viewers can see their own views" ON public."story_views"
  FOR SELECT
  USING ((auth.uid() = viewer_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own assessments" ON public."mental_health_assessments"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own assessments" ON public."mental_health_assessments"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own dimensions" ON public."user_dimensions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read gsc_queries" ON public."gsc_queries"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Service full access gsc_queries" ON public."gsc_queries"
  FOR ALL
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Availability is publicly viewable" ON public."doctor_availability"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Doctors manage own availability" ON public."doctor_availability"
  FOR ALL
  USING ((auth.uid() = doctor_id))
  WITH CHECK ((auth.uid() = doctor_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own medication reminders" ON public."medication_reminders"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active public rooms" ON public."audio_rooms"
  FOR SELECT
  USING (((is_public = true) AND (is_active = true)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Host can update their own rooms" ON public."audio_rooms"
  FOR UPDATE
  USING ((auth.uid() = host_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own rooms" ON public."audio_rooms"
  FOR INSERT
  WITH CHECK ((auth.uid() = host_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "sales_leads_user_all" ON public."sales_leads"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view analytics for their agents" ON public."ai_agent_analytics"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM ai_agents
  WHERE ((ai_agents.id = ai_agent_analytics.agent_id) AND (ai_agents.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_org_admin" ON public."fin_organizations"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::text))
  WITH CHECK (has_role(auth.uid(), 'admin'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_org_view" ON public."fin_organizations"
  FOR SELECT
  USING ((sys_organization_id IN ( SELECT sys_tenant_users.organization_id
   FROM sys_tenant_users
  WHERE (sys_tenant_users.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins see all pushes" ON public."smart_push_log"
  FOR SELECT
  USING ((has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ceo'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users see own pushes" ON public."smart_push_log"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their subscriptions" ON public."stealth_mode_subscriptions"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view geo cache" ON public."geo_cache"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "System can insert geo cache" ON public."geo_cache"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can create geofences" ON public."geofences"
  FOR INSERT
  WITH CHECK ((auth.uid() = created_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Geofences are viewable by everyone" ON public."geofences"
  FOR SELECT
  USING ((active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own geofences" ON public."geofences"
  FOR DELETE
  USING ((auth.uid() = created_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own geofences" ON public."geofences"
  FOR UPDATE
  USING ((auth.uid() = created_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own communication events" ON public."communication_events"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own communication events" ON public."communication_events"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own communication events" ON public."communication_events"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view monetization leads" ON public."monetization_leads"
  FOR SELECT
  USING ((auth.uid() IN ( SELECT user_roles.user_id
   FROM user_roles
  WHERE (user_roles.role = 'admin'::app_role))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "System can create monetization leads" ON public."monetization_leads"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_exp_org_all" ON public."finance_expenses"
  FOR ALL
  USING ((org_id IN ( SELECT sys_org_members.org_id
   FROM sys_org_members
  WHERE (sys_org_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own preauth requests" ON public."insurance_preauth"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own preauth requests" ON public."insurance_preauth"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own preauth requests" ON public."insurance_preauth"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own energy pulse progress" ON public."energy_pulse_progress"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can create conversations" ON public."conversations"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their conversations" ON public."conversations"
  FOR UPDATE
  USING (((auth.uid() = created_by) OR (EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = conversations.id) AND (conversation_participants.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view conversations they participate in" ON public."conversations"
  FOR SELECT
  USING (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = conversations.id) AND (conversation_participants.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users and sellers can update bookings" ON public."chatr_plus_bookings"
  FOR UPDATE
  USING (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM chatr_plus_sellers
  WHERE ((chatr_plus_sellers.id = chatr_plus_bookings.seller_id) AND (chatr_plus_sellers.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create bookings" ON public."chatr_plus_bookings"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their bookings" ON public."chatr_plus_bookings"
  FOR SELECT
  USING (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM chatr_plus_sellers
  WHERE ((chatr_plus_sellers.id = chatr_plus_bookings.seller_id) AND (chatr_plus_sellers.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their transactions" ON public."chatr_coin_transactions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages chatr_coin_transactions" ON public."chatr_coin_transactions"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Merchants can create transactions" ON public."dhandha_transactions"
  FOR INSERT
  WITH CHECK ((merchant_id IN ( SELECT merchant_profiles.id
   FROM merchant_profiles
  WHERE (merchant_profiles.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Merchants can update their transactions" ON public."dhandha_transactions"
  FOR UPDATE
  USING ((merchant_id IN ( SELECT merchant_profiles.id
   FROM merchant_profiles
  WHERE (merchant_profiles.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Merchants can view their transactions" ON public."dhandha_transactions"
  FOR SELECT
  USING ((merchant_id IN ( SELECT merchant_profiles.id
   FROM merchant_profiles
  WHERE (merchant_profiles.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own agent sessions" ON public."agent_sessions"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "tenant_isolation_policy" ON public."growth_competitors"
  FOR ALL
  USING (((org_id = auth.uid()) AND (deleted_at IS NULL)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Restaurant owners can view their orders" ON public."chatr_food_orders"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM chatr_restaurants
  WHERE ((chatr_restaurants.id = chatr_food_orders.restaurant_id) AND (chatr_restaurants.owner_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create orders" ON public."chatr_food_orders"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own orders" ON public."chatr_food_orders"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own orders" ON public."chatr_food_orders"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage own rec_offer_letters" ON public."rec_offer_letters"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "rec_offers_user_all" ON public."rec_offer_letters"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users insert own sync batches" ON public."contacts_sync_queue"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users read own sync batches" ON public."contacts_sync_queue"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view verified developers" ON public."developer_profiles"
  FOR SELECT
  USING (((is_verified = true) OR (auth.uid() = user_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create developer profile" ON public."developer_profiles"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own developer profile" ON public."developer_profiles"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their developer profile" ON public."developer_profiles"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own developer profile" ON public."developer_profiles"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own developer profile" ON public."developer_profiles"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Menu items are viewable by everyone" ON public."chatr_menu_items"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Restaurant owners can manage menu" ON public."chatr_menu_items"
  FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM chatr_restaurants
  WHERE ((chatr_restaurants.id = chatr_menu_items.restaurant_id) AND (chatr_restaurants.owner_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Searchable profiles visible to authenticated users" ON public."user_discovery_profiles"
  FOR SELECT
  USING (((is_searchable = true) AND (anonymous_mode = false)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage their own discovery profile" ON public."user_discovery_profiles"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can view own settlements" ON public."seller_settlements"
  FOR SELECT
  USING ((auth.uid() = seller_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Challenges are viewable by everyone" ON public."fame_cam_challenges"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view achievements" ON public."game_achievements"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own notifications" ON public."notification_queue"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own tasks" ON public."tasks"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Host create programs" ON public."wellness_programs"
  FOR INSERT
  WITH CHECK ((auth.uid() = host_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Host delete programs" ON public."wellness_programs"
  FOR DELETE
  USING ((auth.uid() = host_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Host update programs" ON public."wellness_programs"
  FOR UPDATE
  USING ((auth.uid() = host_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "View active programs" ON public."wellness_programs"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view menu categories" ON public."menu_categories"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Vendors can manage own menu categories" ON public."menu_categories"
  FOR ALL
  USING ((vendor_id IN ( SELECT vendors.id
   FROM vendors
  WHERE (vendors.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_inv_org_all" ON public."finance_invoices"
  FOR ALL
  USING ((org_id IN ( SELECT sys_org_members.org_id
   FROM sys_org_members
  WHERE (sys_org_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can view their transactions" ON public."seller_transactions"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM home_service_providers hsp
  WHERE ((hsp.id = seller_transactions.seller_id) AND (hsp.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all transactions" ON public."point_transactions"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create transactions" ON public."point_transactions"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own transactions" ON public."point_transactions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Business owners can manage subscription" ON public."business_subscriptions"
  FOR ALL
  USING ((business_id IN ( SELECT business_profiles.id
   FROM business_profiles
  WHERE (business_profiles.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Business owners can view their subscription" ON public."business_subscriptions"
  FOR SELECT
  USING (((business_id IN ( SELECT business_profiles.id
   FROM business_profiles
  WHERE (business_profiles.user_id = auth.uid()))) OR (business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage rewards" ON public."point_rewards"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active rewards" ON public."point_rewards"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own devices" ON public."linked_devices"
  FOR ALL
  USING ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own devices" ON public."linked_devices"
  FOR SELECT
  USING ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own automation logs" ON public."automation_logs"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own automation logs" ON public."automation_logs"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view medicine catalog" ON public."medicine_catalog"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view available menu items" ON public."menu_items"
  FOR SELECT
  USING ((is_available = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Vendors can manage own menu items" ON public."menu_items"
  FOR ALL
  USING ((vendor_id IN ( SELECT vendors.id
   FROM vendors
  WHERE (vendors.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "edges_org_all" ON public."sys_knowledge_edges"
  FOR ALL
  USING ((org_id IN ( SELECT sys_org_members.org_id
   FROM sys_org_members
  WHERE (sys_org_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own api keys" ON public."api_keys"
  FOR ALL
  USING ((auth.uid() = profile_id))
  WITH CHECK ((auth.uid() = profile_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their emotion circle status" ON public."emotion_circles"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view active circles for matching" ON public."emotion_circles"
  FOR SELECT
  USING (((looking_for_connection = true) AND (active_until > now())))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can grant/revoke permissions" ON public."app_permissions"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view permissions for their apps" ON public."app_permissions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can only view own rate limits" ON public."rate_limits"
  FOR SELECT
  USING ((((auth.uid())::text = identifier) OR (identifier ~~ (('%'::text || (auth.uid())::text) || '%'::text))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Like a story" ON public."story_likes"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Unlike a story" ON public."story_likes"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "View story likes" ON public."story_likes"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins and Auditors can read audit logs" ON public."enterprise_audit_logs"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM enterprise_users
  WHERE ((enterprise_users.id = auth.uid()) AND (enterprise_users.organization_id = enterprise_audit_logs.organization_id) AND (enterprise_users.role = ANY (ARRAY['Administrator'::enterprise_role_type, 'Auditor'::enterprise_role_type]))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone in org can insert audit logs" ON public."enterprise_audit_logs"
  FOR INSERT
  WITH CHECK ((organization_id IN ( SELECT enterprise_users.organization_id
   FROM enterprise_users
  WHERE (enterprise_users.id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_bank_tx manage" ON public."fin_bank_transactions"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_bank_tx view" ON public."fin_bank_transactions"
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
  CREATE POLICY "System can create notifications" ON public."notifications"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "System can insert notifications" ON public."notifications"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own notifications" ON public."notifications"
  FOR UPDATE
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own notifications" ON public."notifications"
  FOR SELECT
  USING ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their seller analytics" ON public."seller_analytics"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own call logs" ON public."business_call_logs"
  FOR INSERT
  WITH CHECK ((auth.uid() = profile_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read their own call logs" ON public."business_call_logs"
  FOR SELECT
  USING ((auth.uid() = profile_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Everyone can view active food vendors" ON public."food_vendors"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can add training data to their agents" ON public."ai_agent_training"
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM ai_agents
  WHERE ((ai_agents.id = ai_agent_training.agent_id) AND (ai_agents.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete training data from their agents" ON public."ai_agent_training"
  FOR DELETE
  USING ((EXISTS ( SELECT 1
   FROM ai_agents
  WHERE ((ai_agents.id = ai_agent_training.agent_id) AND (ai_agents.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view training data for their agents" ON public."ai_agent_training"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM ai_agents
  WHERE ((ai_agents.id = ai_agent_training.agent_id) AND (ai_agents.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "System can insert translations" ON public."message_translations"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert translations" ON public."message_translations"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read translations for accessible messages" ON public."message_translations"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM (messages m
     JOIN conversation_participants cp ON ((cp.conversation_id = m.conversation_id)))
  WHERE ((m.id = message_translations.message_id) AND (cp.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own translations" ON public."message_translations"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own visual searches" ON public."visual_search_history"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own visual searches" ON public."visual_search_history"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their rewards settings" ON public."rewards_mode_settings"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create reports" ON public."message_reports"
  FOR INSERT
  WITH CHECK ((auth.uid() = reported_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their reports" ON public."message_reports"
  FOR SELECT
  USING ((auth.uid() = reported_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Team members can manage conversations" ON public."business_conversations"
  FOR ALL
  USING ((business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Team members can view business conversations" ON public."business_conversations"
  FOR SELECT
  USING ((business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read visual cache" ON public."visual_search_cache"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active services" ON public."chatr_plus_services"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can create services" ON public."chatr_plus_services"
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM chatr_plus_sellers
  WHERE ((chatr_plus_sellers.id = chatr_plus_services.seller_id) AND (chatr_plus_sellers.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can update their services" ON public."chatr_plus_services"
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM chatr_plus_sellers
  WHERE ((chatr_plus_sellers.id = chatr_plus_services.seller_id) AND (chatr_plus_sellers.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active services" ON public."services"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own family members" ON public."health_family_members"
  FOR ALL
  USING ((auth.uid() = caregiver_user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their search history" ON public."chatr_search_history"
  FOR ALL
  USING (((auth.uid() = user_id) OR (user_id IS NULL)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "tenant_isolation_policy" ON public."growth_campaigns"
  FOR ALL
  USING (((org_id = auth.uid()) AND (deleted_at IS NULL)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can cancel pending requests" ON public."seller_withdrawal_requests"
  FOR UPDATE
  USING (((EXISTS ( SELECT 1
   FROM home_service_providers hsp
  WHERE ((hsp.id = seller_withdrawal_requests.seller_id) AND (hsp.user_id = auth.uid())))) AND (status = 'pending'::text)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can create withdrawal requests" ON public."seller_withdrawal_requests"
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM home_service_providers hsp
  WHERE ((hsp.id = seller_withdrawal_requests.seller_id) AND (hsp.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can view their withdrawal requests" ON public."seller_withdrawal_requests"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM home_service_providers hsp
  WHERE ((hsp.id = seller_withdrawal_requests.seller_id) AND (hsp.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own leaderboard entries" ON public."game_leaderboards"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read leaderboards" ON public."game_leaderboards"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own invites" ON public."contact_invites"
  FOR INSERT
  WITH CHECK ((auth.uid() = inviter_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own invites" ON public."contact_invites"
  FOR UPDATE
  USING ((auth.uid() = inviter_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own invites" ON public."contact_invites"
  FOR SELECT
  USING ((auth.uid() = inviter_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own parallel you profile" ON public."parallel_you_profiles"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Leaderboard is viewable by everyone" ON public."fame_leaderboard"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own 2FA" ON public."two_factor_auth"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view verified accounts" ON public."official_accounts"
  FOR SELECT
  USING (((is_verified = true) OR (auth.uid() = user_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create accounts" ON public."official_accounts"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their accounts" ON public."official_accounts"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "System can insert impressions" ON public."brand_impressions"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own impressions" ON public."brand_impressions"
  FOR SELECT
  USING ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own stories" ON public."stories"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own stories" ON public."stories"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view non-expired stories from their contacts" ON public."stories"
  FOR SELECT
  USING (((expires_at > now()) AND ((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM contacts
  WHERE ((contacts.user_id = auth.uid()) AND (contacts.contact_user_id = stories.user_id) AND (contacts.is_registered = true)))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Create wellness communities" ON public."wellness_communities"
  FOR INSERT
  WITH CHECK ((auth.uid() = created_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owner delete wellness communities" ON public."wellness_communities"
  FOR DELETE
  USING ((auth.uid() = created_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owner update wellness communities" ON public."wellness_communities"
  FOR UPDATE
  USING ((auth.uid() = created_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "View active wellness communities" ON public."wellness_communities"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own health predictions" ON public."health_predictions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own webhooks" ON public."webhooks"
  FOR ALL
  USING ((auth.uid() = profile_id))
  WITH CHECK ((auth.uid() = profile_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create tasks in their conversations" ON public."message_tasks"
  FOR INSERT
  WITH CHECK (((auth.uid() = assigner_id) AND (EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = message_tasks.conversation_id) AND (conversation_participants.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view tasks in their conversations" ON public."message_tasks"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = message_tasks.conversation_id) AND (conversation_participants.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active categories" ON public."chatr_plus_categories"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can update sessions" ON public."qr_login_sessions"
  FOR UPDATE
  USING ((auth.uid() IS NOT NULL))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Only authenticated users can create QR sessions" ON public."qr_login_sessions"
  FOR INSERT
  WITH CHECK ((auth.uid() IS NOT NULL))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read own QR sessions" ON public."qr_login_sessions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages micro_task_user_scores" ON public."micro_task_user_scores"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "view_own_score" ON public."micro_task_user_scores"
  FOR SELECT
  USING (((user_id = auth.uid()) OR is_micro_task_admin(auth.uid())))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Team members can create activities" ON public."crm_activities"
  FOR INSERT
  WITH CHECK ((business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Team members can delete activities" ON public."crm_activities"
  FOR DELETE
  USING ((business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Team members can update activities" ON public."crm_activities"
  FOR UPDATE
  USING ((business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Team members can view activities" ON public."crm_activities"
  FOR SELECT
  USING ((business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own chat folder items" ON public."chat_folder_items"
  FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM chat_folders
  WHERE ((chat_folders.id = chat_folder_items.folder_id) AND (chat_folders.user_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM chat_folders
  WHERE ((chat_folders.id = chat_folder_items.folder_id) AND (chat_folders.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create own teleconsultations" ON public."teleconsultation_bookings"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own teleconsultations" ON public."teleconsultation_bookings"
  FOR UPDATE
  USING (((auth.uid() = user_id) OR (auth.uid() = doctor_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own teleconsultations" ON public."teleconsultation_bookings"
  FOR SELECT
  USING (((auth.uid() = user_id) OR (auth.uid() = doctor_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can report reviews" ON public."reported_reviews"
  FOR INSERT
  WITH CHECK ((auth.uid() = reported_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can view their reports" ON public."reported_reviews"
  FOR SELECT
  USING ((auth.uid() = reported_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view public moments" ON public."ai_moments"
  FOR SELECT
  USING ((is_public = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their AI moments" ON public."ai_moments"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "System can insert retry logs" ON public."message_retry_log"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view retry logs for their messages" ON public."message_retry_log"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM messages
  WHERE ((messages.id = message_retry_log.message_id) AND (messages.sender_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_rev_sched manage" ON public."fin_revenue_schedules"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_rev_sched view" ON public."fin_revenue_schedules"
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
  CREATE POLICY "Admins manage opportunities" ON public."seo_opportunities"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their encryption keys" ON public."encryption_keys"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own status" ON public."user_status"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own status" ON public."user_status"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own status" ON public."user_status"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view status from their contacts" ON public."user_status"
  FOR SELECT
  USING (((expires_at > now()) AND ((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM contacts
  WHERE ((contacts.user_id = auth.uid()) AND (contacts.contact_user_id = user_status.user_id)))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all error logs" ON public."error_logs"
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "System can insert error logs" ON public."error_logs"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_map_admin" ON public."fin_account_mappings"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::text))
  WITH CHECK (has_role(auth.uid(), 'admin'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_map_view" ON public."fin_account_mappings"
  FOR SELECT
  USING ((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own drafts" ON public."message_drafts"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own participations" ON public."challenge_participations"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view all participations" ON public."challenge_participations"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can install apps" ON public."app_installs"
  FOR INSERT
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can uninstall apps" ON public."app_installs"
  FOR DELETE
  USING ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their installs" ON public."app_installs"
  FOR UPDATE
  USING ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own installs" ON public."app_installs"
  FOR SELECT
  USING ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_fixed_assets manage" ON public."fin_fixed_assets"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_fixed_assets view" ON public."fin_fixed_assets"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Vendors can update own notifications" ON public."vendor_notifications"
  FOR UPDATE
  USING ((vendor_id IN ( SELECT vendors.id
   FROM vendors
  WHERE (vendors.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Vendors can view own notifications" ON public."vendor_notifications"
  FOR SELECT
  USING ((vendor_id IN ( SELECT vendors.id
   FROM vendors
  WHERE (vendors.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_rec_match view" ON public."fin_reconciliation_matches"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Published designs are public" ON public."studio_user_designs"
  FOR SELECT
  USING ((is_published = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their designs" ON public."studio_user_designs"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their starred messages" ON public."starred_messages"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create calls in their conversations" ON public."calls"
  FOR INSERT
  WITH CHECK (((auth.uid() = caller_id) AND (EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = calls.conversation_id) AND (conversation_participants.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update calls they receive" ON public."calls"
  FOR UPDATE
  USING (((auth.uid() = receiver_id) OR (auth.uid() = caller_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their calls" ON public."calls"
  FOR UPDATE
  USING ((auth.uid() = caller_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view calls in their conversations" ON public."calls"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = calls.conversation_id) AND (conversation_participants.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view calls they receive" ON public."calls"
  FOR SELECT
  USING (((auth.uid() = receiver_id) OR (auth.uid() = caller_id) OR (EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = calls.conversation_id) AND (conversation_participants.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_je_insert" ON public."fin_journal_entries"
  FOR INSERT
  WITH CHECK (((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))) AND (status = 'DRAFT'::text) AND (created_by = auth.uid())))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_je_update" ON public."fin_journal_entries"
  FOR UPDATE
  USING (((created_by = auth.uid()) AND (status = 'DRAFT'::text)))
  WITH CHECK ((status = ANY (ARRAY['DRAFT'::text, 'PENDING_APPROVAL'::text])))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_je_view" ON public."fin_journal_entries"
  FOR SELECT
  USING ((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage analytics" ON public."analytics_data"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view analytics" ON public."analytics_data"
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Developers can view their app analytics" ON public."app_analytics"
  FOR SELECT
  USING ((app_id IN ( SELECT ma.id
   FROM (mini_apps ma
     JOIN developer_profiles dp ON ((ma.id IN ( SELECT mini_apps.id
           FROM mini_apps
          WHERE (mini_apps.id IN ( SELECT app_analytics.app_id
                   FROM app_submissions
                  WHERE ((app_submissions.developer_id = dp.id) AND (app_submissions.submission_status = 'approved'::text))))))))
  WHERE (dp.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages app_analytics" ON public."app_analytics"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "users can insert own app_analytics" ON public."app_analytics"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_close_tasks manage" ON public."fin_close_tasks"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_close_tasks view" ON public."fin_close_tasks"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage earning rules" ON public."point_earning_rules"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active earning rules" ON public."point_earning_rules"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own installs" ON public."user_capability_installs"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "uci_user_all" ON public."user_capability_installs"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Search cache is readable by everyone" ON public."chatr_search_cache"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage brands" ON public."brand_partnerships"
  FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role)))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active brands" ON public."brand_partnerships"
  FOR SELECT
  USING ((status = 'active'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone authenticated can request opt-out" ON public."phonebook_opt_outs"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "sales_deals_user_all" ON public."sales_deals"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_integrity view" ON public."fin_integrity_reports"
  FOR SELECT
  USING ((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view review replies" ON public."review_replies"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can create review replies" ON public."review_replies"
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (home_service_reviews hr
     JOIN home_service_providers hsp ON ((hr.provider_id = hsp.id)))
  WHERE ((hr.id = review_replies.review_id) AND (hsp.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can update their replies" ON public."review_replies"
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM (home_service_reviews hr
     JOIN home_service_providers hsp ON ((hr.provider_id = hsp.id)))
  WHERE ((hr.id = review_replies.review_id) AND (hsp.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Champions are readable by authenticated users" ON public."champions"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Enable read access for all users" ON public."workspace_templates"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can create templates" ON public."workspace_templates"
  FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can delete templates" ON public."workspace_templates"
  FOR DELETE
  USING (is_workspace_member(workspace_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can update templates" ON public."workspace_templates"
  FOR UPDATE
  USING (is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (is_workspace_member(workspace_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can view templates" ON public."workspace_templates"
  FOR SELECT
  USING (is_workspace_member(workspace_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can add reactions" ON public."message_reactions"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own reactions" ON public."message_reactions"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view reactions in their conversations" ON public."message_reactions"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM (messages m
     JOIN conversation_participants cp ON ((cp.conversation_id = m.conversation_id)))
  WHERE ((m.id = message_reactions.message_id) AND (cp.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "System can create activities" ON public."user_activities"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their activities" ON public."user_activities"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_close_chk manage" ON public."fin_close_checklists"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_close_chk view" ON public."fin_close_checklists"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Apps can send messages" ON public."inter_app_messages"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Apps can update message status" ON public."inter_app_messages"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view messages for their apps" ON public."inter_app_messages"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can insert security scans" ON public."message_security_scans"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their scans to provide feedback" ON public."message_security_scans"
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM messages m
  WHERE ((m.id = message_security_scans.message_id) AND ((m.sender_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM conversation_participants cp
          WHERE ((cp.conversation_id = m.conversation_id) AND (cp.user_id = auth.uid())))))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view security scans for their messages" ON public."message_security_scans"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM messages m
  WHERE ((m.id = message_security_scans.message_id) AND ((m.sender_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM conversation_participants cp
          WHERE ((cp.conversation_id = m.conversation_id) AND (cp.user_id = auth.uid())))))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "orgs_user_all" ON public."sys_organizations"
  FOR ALL
  USING (((owner_id = auth.uid()) OR (id IN ( SELECT sys_org_members.org_id
   FROM sys_org_members
  WHERE (sys_org_members.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public identities are viewable by authenticated users" ON public."user_identities"
  FOR SELECT
  USING (((visibility = 'public'::text) AND (is_active = true)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own identities" ON public."user_identities"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can only manage their own contacts" ON public."contacts"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own therapy sessions" ON public."therapy_sessions"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own therapy sessions" ON public."therapy_sessions"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own therapy sessions" ON public."therapy_sessions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own search queries" ON public."search_queries"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own search queries" ON public."search_queries"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users create own bookings" ON public."home_solutions_bookings"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users delete own bookings" ON public."home_solutions_bookings"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users update own bookings" ON public."home_solutions_bookings"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users view own bookings" ON public."home_solutions_bookings"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Vendors and admins update bookings" ON public."home_solutions_bookings"
  FOR UPDATE
  USING ((has_role(auth.uid(), 'vendor'::app_role) OR has_role(auth.uid(), 'admin'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Vendors and admins view all bookings" ON public."home_solutions_bookings"
  FOR SELECT
  USING ((has_role(auth.uid(), 'vendor'::app_role) OR has_role(auth.uid(), 'admin'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active categories" ON public."service_categories"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own onboarding progress" ON public."onboarding_progress"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert summaries" ON public."call_summaries"
  FOR INSERT
  WITH CHECK ((auth.uid() IS NOT NULL))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read their own summaries" ON public."call_summaries"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own summaries" ON public."call_summaries"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage members." ON public."channel_members"
  FOR ALL
  USING (is_channel_admin(channel_id, auth.uid()))
  WITH CHECK (is_channel_admin(channel_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members are viewable by everyone." ON public."channel_members"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can join channels." ON public."channel_members"
  FOR INSERT
  WITH CHECK (((auth.uid() = user_id) AND (role = 'subscriber'::text)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can leave channels." ON public."channel_members"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage announcements" ON public."announcements"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view active announcements" ON public."announcements"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their payment methods" ON public."chatr_payment_methods"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "nodes_org_all" ON public."sys_knowledge_nodes"
  FOR ALL
  USING ((org_id IN ( SELECT sys_org_members.org_id
   FROM sys_org_members
  WHERE (sys_org_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own albums" ON public."photo_albums"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view public albums or own albums" ON public."photo_albums"
  FOR SELECT
  USING (((is_public = true) OR (auth.uid() = user_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view badges" ON public."chatr_badges"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO delete tasks" ON public."cc_tasks"
  FOR DELETE
  USING (has_role(auth.uid(), 'ceo'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO update tasks" ON public."cc_tasks"
  FOR UPDATE
  USING (has_role(auth.uid(), 'ceo'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO view tasks" ON public."cc_tasks"
  FOR SELECT
  USING (has_role(auth.uid(), 'ceo'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO write tasks" ON public."cc_tasks"
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'ceo'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Healthcare providers are viewable by everyone" ON public."chatr_healthcare"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can manage healthcare" ON public."chatr_healthcare"
  FOR ALL
  USING ((auth.uid() = owner_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own health wallet transactions" ON public."health_wallet_transactions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own diagnostics" ON public."network_diagnostics"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own diagnostics" ON public."network_diagnostics"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their transactions" ON public."chatr_wallet_transactions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own wallet" ON public."health_wallet"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own wallet" ON public."health_wallet"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage all payments" ON public."payments"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own payments" ON public."payments"
  FOR INSERT
  WITH CHECK ((auth.uid() = patient_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can only view their own payments" ON public."payments"
  FOR SELECT
  USING (((auth.uid() = patient_id) OR (auth.uid() = provider_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Team members can access crm_evidence_ledger" ON public."crm_evidence_ledger"
  FOR ALL
  USING (((business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid()))) OR (business_id IN ( SELECT business_profiles.id
   FROM business_profiles
  WHERE (business_profiles.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view categories" ON public."business_categories"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active versions" ON public."app_versions"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Developers can manage their app versions" ON public."app_versions"
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (mini_apps ma
     JOIN developer_profiles dp ON ((dp.id = ma.developer_id)))
  WHERE ((ma.id = app_versions.app_id) AND (dp.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view healthcare listings" ON public."healthcare_db"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can add healthcare listings" ON public."healthcare_db"
  FOR INSERT
  WITH CHECK ((auth.uid() IS NOT NULL))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own healthcare listings" ON public."healthcare_db"
  FOR UPDATE
  USING ((auth.uid() = added_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "kg_edges_tenant_delete" ON public."kg_edges"
  FOR DELETE
  USING (((auth.uid())::text = tenant_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "kg_edges_tenant_insert" ON public."kg_edges"
  FOR INSERT
  WITH CHECK (((auth.uid())::text = tenant_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "kg_edges_tenant_select" ON public."kg_edges"
  FOR SELECT
  USING (((auth.uid())::text = tenant_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own subscription items" ON public."subscription_items"
  FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM medicine_subscriptions ms
  WHERE ((ms.id = subscription_items.subscription_id) AND (ms.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view provider specializations" ON public."provider_specializations"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users insert own search analytics" ON public."search_analytics"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users view own search analytics" ON public."search_analytics"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Register session" ON public."session_participants"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Unregister session" ON public."session_participants"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can register for sessions" ON public."session_participants"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "View session participants" ON public."session_participants"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Applicant or employer can update application" ON public."job_applications"
  FOR UPDATE
  USING (((auth.uid() = applicant_id) OR (auth.uid() IN ( SELECT job_listings.posted_by
   FROM job_listings
  WHERE (job_listings.id = job_applications.job_id)))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Applicants and employers can view applications" ON public."job_applications"
  FOR SELECT
  USING (((auth.uid() = applicant_id) OR (auth.uid() IN ( SELECT job_listings.posted_by
   FROM job_listings
  WHERE (job_listings.id = job_applications.job_id)))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Applicants can withdraw" ON public."job_applications"
  FOR DELETE
  USING ((auth.uid() = applicant_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can apply to jobs" ON public."job_applications"
  FOR INSERT
  WITH CHECK ((auth.uid() = applicant_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins view all push health" ON public."user_push_health"
  FOR SELECT
  USING ((has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ceo'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users view own push health" ON public."user_push_health"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages user_push_health" ON public."user_push_health"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Everyone can view active deals" ON public."local_deals"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view delivery status for their messages" ON public."message_delivery_status"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM messages
  WHERE ((messages.id = message_delivery_status.message_id) AND ((messages.sender_id = auth.uid()) OR (message_delivery_status.recipient_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages message_delivery_status" ON public."message_delivery_status"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view reviews" ON public."chatr_plus_reviews"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create reviews for their bookings" ON public."chatr_plus_reviews"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Active deals are viewable by everyone" ON public."chatr_deals"
  FOR SELECT
  USING (((is_active = true) AND ((expires_at IS NULL) OR (expires_at > now()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Merchants can manage own deals" ON public."chatr_deals"
  FOR ALL
  USING ((auth.uid() = merchant_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "own records" ON public."connector_records"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can redeem deals" ON public."deal_redemptions"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their redemptions" ON public."deal_redemptions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own request logs" ON public."mcp_request_logs"
  FOR SELECT
  USING (((user_id = auth.uid()) OR (api_key_id IN ( SELECT mcp_api_keys.id
   FROM mcp_api_keys
  WHERE (mcp_api_keys.created_by = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active bundles" ON public."service_bundles"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO insert logs" ON public."cc_logs"
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'ceo'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO view logs" ON public."cc_logs"
  FOR SELECT
  USING (has_role(auth.uid(), 'ceo'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can leave voicemails" ON public."voicemails"
  FOR INSERT
  WITH CHECK ((auth.uid() = caller_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their voicemails" ON public."voicemails"
  FOR UPDATE
  USING ((auth.uid() = receiver_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their voicemails" ON public."voicemails"
  FOR SELECT
  USING (((auth.uid() = receiver_id) OR (auth.uid() = caller_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own sessions" ON public."e2e_sessions"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own location shares" ON public."location_shares"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own location shares" ON public."location_shares"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own location shares" ON public."location_shares"
  FOR SELECT
  USING (((auth.uid() = user_id) OR (auth.uid() = ANY (shared_with))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert themselves" ON public."session_room_participants"
  FOR INSERT
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read participants of their rooms" ON public."session_room_participants"
  FOR SELECT
  USING (((user_id = auth.uid()) OR is_session_room_member(room_id, auth.uid()) OR is_session_room_host(room_id, auth.uid())))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own participant status" ON public."session_room_participants"
  FOR UPDATE
  USING ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can pin messages in their conversations" ON public."pinned_messages"
  FOR INSERT
  WITH CHECK (((auth.uid() = pinned_by) AND (EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = pinned_messages.conversation_id) AND (conversation_participants.user_id = auth.uid()))))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can unpin messages" ON public."pinned_messages"
  FOR DELETE
  USING ((EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = pinned_messages.conversation_id) AND (conversation_participants.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view pinned messages in their conversations" ON public."pinned_messages"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM conversation_participants
  WHERE ((conversation_participants.conversation_id = pinned_messages.conversation_id) AND (conversation_participants.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own device tokens" ON public."device_tokens"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own device tokens" ON public."device_tokens"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their device tokens" ON public."device_tokens"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own device tokens" ON public."device_tokens"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own device tokens" ON public."device_tokens"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view reviews" ON public."tutor_reviews"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Students can create reviews" ON public."tutor_reviews"
  FOR INSERT
  WITH CHECK ((auth.uid() = student_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active providers" ON public."service_providers"
  FOR SELECT
  USING (((is_active = true) AND (is_verified = true)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Providers can update own profile" ON public."service_providers"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create provider profile" ON public."service_providers"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_accruals manage" ON public."fin_accruals"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_accruals view" ON public."fin_accruals"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own invite links" ON public."invite_links"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own invite links" ON public."invite_links"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view leaderboards" ON public."chatr_leaderboards"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages chatr_leaderboards" ON public."chatr_leaderboards"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins read search metrics" ON public."seo_search_metrics"
  FOR SELECT
  USING ((has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ceo'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can manage restaurants" ON public."chatr_restaurants"
  FOR ALL
  USING ((auth.uid() = owner_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Restaurants are viewable by everyone" ON public."chatr_restaurants"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Achievements are viewable by everyone" ON public."fame_achievements"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage own saved jobs" ON public."job_saved"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own health profile" ON public."user_health_profiles"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own vitals" ON public."chronic_vitals"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their health passport" ON public."health_passport"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own emotionsync progress" ON public."emotionsync_progress"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create memberships" ON public."service_memberships"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own memberships" ON public."service_memberships"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can log their searches" ON public."location_searches"
  FOR INSERT
  WITH CHECK ((auth.uid() IS NOT NULL))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own searches" ON public."location_searches"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage their own rules" ON public."precall_rules"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own subscription" ON public."chatr_plus_user_subscriptions"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own subscription" ON public."chatr_plus_user_subscriptions"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own subscription" ON public."chatr_plus_user_subscriptions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active challenges" ON public."rewards_daily_challenges"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view search results" ON public."search_results"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "System can insert search results" ON public."search_results"
  FOR INSERT
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can only manage their own locations" ON public."user_locations"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own reminders" ON public."medicine_reminders"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_bank_acc manage" ON public."fin_bank_accounts"
  FOR ALL
  USING ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'member'::text)))
  WITH CHECK ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'member'::text)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_bank_acc view" ON public."fin_bank_accounts"
  FOR SELECT
  USING ((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own campaigns" ON public."business_campaigns"
  FOR ALL
  USING ((auth.uid() = profile_id))
  WITH CHECK ((auth.uid() = profile_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "tenant_isolation_policy" ON public."growth_memory"
  FOR ALL
  USING (((org_id = auth.uid()) AND (deleted_at IS NULL)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own devices" ON public."user_devices"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own devices" ON public."user_devices"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own devices" ON public."user_devices"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own devices" ON public."user_devices"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view restaurant details" ON public."restaurant_details"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Vendors can manage own restaurant details" ON public."restaurant_details"
  FOR ALL
  USING ((vendor_id IN ( SELECT vendors.id
   FROM vendors
  WHERE (vendors.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own map hunt clues" ON public."map_hunt_clues"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own BMI records" ON public."bmi_records"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own BMI records" ON public."bmi_records"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own BMI records" ON public."bmi_records"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own FCM tokens" ON public."fcm_tokens"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active coupons" ON public."service_coupons"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own saved searches" ON public."saved_searches"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own saved searches" ON public."saved_searches"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own saved searches" ON public."saved_searches"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own saved searches" ON public."saved_searches"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can view their invoices" ON public."seller_invoices"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM home_service_providers hsp
  WHERE ((hsp.id = seller_invoices.seller_id) AND (hsp.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Trust scores are publicly readable" ON public."user_trust_scores"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own trust score" ON public."user_trust_scores"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users insert own mission progress" ON public."champion_mission_progress"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users update own mission progress" ON public."champion_mission_progress"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users view own mission progress" ON public."champion_mission_progress"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can query sys_permissions" ON public."sys_permissions"
  FOR SELECT
  USING ((auth.role() = 'authenticated'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Trending categories are viewable by everyone" ON public."trending_categories"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can create workflow runs" ON public."workflow_runs"
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM business_workflows w
  WHERE ((w.id = workflow_runs.workflow_id) AND (w.profile_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can update workflow runs" ON public."workflow_runs"
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM business_workflows w
  WHERE ((w.id = workflow_runs.workflow_id) AND (w.profile_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can view workflow runs" ON public."workflow_runs"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM business_workflows w
  WHERE ((w.id = workflow_runs.workflow_id) AND (w.profile_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can send messages" ON public."service_chat_messages"
  FOR INSERT
  WITH CHECK ((auth.uid() = sender_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their chats" ON public."service_chat_messages"
  FOR SELECT
  USING (((auth.uid() = sender_id) OR (auth.uid() = receiver_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own chat folders" ON public."chat_folders"
  FOR ALL
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can view membership" ON public."workspace_members"
  FOR SELECT
  USING (((user_id = auth.uid()) OR is_workspace_owner(workspace_id, auth.uid())))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can add members" ON public."workspace_members"
  FOR INSERT
  WITH CHECK (is_workspace_owner(workspace_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can remove members" ON public."workspace_members"
  FOR DELETE
  USING ((is_workspace_owner(workspace_id, auth.uid()) OR (user_id = auth.uid())))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can update members" ON public."workspace_members"
  FOR UPDATE
  USING (is_workspace_owner(workspace_id, auth.uid()))
  WITH CHECK (is_workspace_owner(workspace_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage own rec_interviews" ON public."rec_interviews"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "rec_interviews_user_all" ON public."rec_interviews"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view expert sessions" ON public."expert_sessions"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Expert create session" ON public."expert_sessions"
  FOR INSERT
  WITH CHECK ((auth.uid() = expert_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Expert delete session" ON public."expert_sessions"
  FOR DELETE
  USING ((auth.uid() = expert_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Expert update session" ON public."expert_sessions"
  FOR UPDATE
  USING ((auth.uid() = expert_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "View sessions" ON public."expert_sessions"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view reviews" ON public."app_reviews"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create reviews" ON public."app_reviews"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their reviews" ON public."app_reviews"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their reviews" ON public."app_reviews"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own merchant profile" ON public."merchant_profiles"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own merchant profile" ON public."merchant_profiles"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own merchant profile" ON public."merchant_profiles"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "sales_activities_user_all" ON public."sales_activities"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_period_admin" ON public."fin_periods"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::text))
  WITH CHECK (has_role(auth.uid(), 'admin'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "fin_period_view" ON public."fin_periods"
  FOR SELECT
  USING ((fin_organization_id IN ( SELECT fo.id
   FROM (fin_organizations fo
     JOIN sys_tenant_users stu ON ((stu.organization_id = fo.sys_organization_id)))
  WHERE (stu.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Students and tutors can update bookings" ON public."tutor_bookings"
  FOR UPDATE
  USING (((auth.uid() = student_id) OR (auth.uid() IN ( SELECT tutors.user_id
   FROM tutors
  WHERE (tutors.id = tutor_bookings.tutor_id)))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Students can create bookings" ON public."tutor_bookings"
  FOR INSERT
  WITH CHECK ((auth.uid() = student_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Students can view their bookings" ON public."tutor_bookings"
  FOR SELECT
  USING (((auth.uid() = student_id) OR (auth.uid() IN ( SELECT tutors.user_id
   FROM tutors
  WHERE (tutors.id = tutor_bookings.tutor_id)))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own participations" ON public."call_participants"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own participations" ON public."call_participants"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own call participations" ON public."call_participants"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read rankings" ON public."search_result_rankings"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Join wellness community" ON public."wellness_community_members"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Leave wellness community" ON public."wellness_community_members"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "View community members" ON public."wellness_community_members"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view cc_approvals" ON public."cc_approvals"
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO insert approvals" ON public."cc_approvals"
  FOR INSERT
  WITH CHECK ((has_role(auth.uid(), 'ceo'::app_role) AND (decided_by = auth.uid())))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO view approvals" ON public."cc_approvals"
  FOR SELECT
  USING (has_role(auth.uid(), 'ceo'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create message forwards" ON public."message_forwards"
  FOR INSERT
  WITH CHECK ((auth.uid() = forwarded_by))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view message forwards in their conversations" ON public."message_forwards"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM (messages m
     JOIN conversation_participants cp ON ((cp.conversation_id = m.conversation_id)))
  WHERE ((m.id = message_forwards.forwarded_message_id) AND (cp.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own logs" ON public."call_logs"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own logs" ON public."call_logs"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own subscriptions" ON public."medicine_subscriptions"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can insert their subscription" ON public."chatr_seller_subscription_plans"
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM chatr_plus_sellers
  WHERE ((chatr_plus_sellers.id = chatr_seller_subscription_plans.seller_id) AND (chatr_plus_sellers.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can update their subscription" ON public."chatr_seller_subscription_plans"
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM chatr_plus_sellers
  WHERE ((chatr_plus_sellers.id = chatr_seller_subscription_plans.seller_id) AND (chatr_plus_sellers.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Sellers can view their subscription" ON public."chatr_seller_subscription_plans"
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM chatr_plus_sellers
  WHERE ((chatr_plus_sellers.id = chatr_seller_subscription_plans.seller_id) AND (chatr_plus_sellers.user_id = auth.uid())))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can read caller ID aggregates" ON public."caller_id_aggregates"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "CEO and admins manage leads" ON public."cc_leads"
  FOR ALL
  USING ((has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'admin'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create wellness data" ON public."wellness_tracking"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their wellness data" ON public."wellness_tracking"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their wellness data" ON public."wellness_tracking"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their wellness data" ON public."wellness_tracking"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their wellness data" ON public."wellness_tracking"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view active challenges" ON public."health_challenges"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own reminders" ON public."health_reminders"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own reminders" ON public."health_reminders"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own reminders" ON public."health_reminders"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own reminders" ON public."health_reminders"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "System can create SSO tokens" ON public."sso_tokens"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own SSO tokens" ON public."sso_tokens"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active placements" ON public."brand_placements"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read suggestions" ON public."search_suggestions"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Business team can manage broadcasts" ON public."business_broadcasts"
  FOR ALL
  USING ((business_id IN ( SELECT business_team_members.business_id
   FROM business_team_members
  WHERE (business_team_members.user_id = auth.uid()))))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers can view sent broadcasts" ON public."business_broadcasts"
  FOR SELECT
  USING ((status = 'sent'::text))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can create activities" ON public."workspace_activities"
  FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can view activities" ON public."workspace_activities"
  FOR SELECT
  USING (is_workspace_member(workspace_id, auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own nutrition summary" ON public."nutrition_daily_summary"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own nutrition summary" ON public."nutrition_daily_summary"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own nutrition summary" ON public."nutrition_daily_summary"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own reminders" ON public."message_reminders"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can follow accounts" ON public."account_followers"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can unfollow accounts" ON public."account_followers"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view followers" ON public."account_followers"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users own their telemetry" ON public."call_telemetry"
  FOR ALL
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own referral codes" ON public."referral_codes"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own referral codes" ON public."referral_codes"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active public rooms" ON public."live_rooms"
  FOR SELECT
  USING (((is_public = true) AND (is_active = true)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Room hosts can manage their rooms" ON public."live_rooms"
  FOR ALL
  USING ((auth.uid() = host_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view kyc_documents" ON public."kyc_documents"
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own KYC docs" ON public."kyc_documents"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own KYC docs" ON public."kyc_documents"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Login attempts are insert only by system" ON public."login_attempts"
  FOR INSERT
  WITH CHECK (((auth.uid() IS NOT NULL) AND (user_id = auth.uid())))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own login attempts" ON public."login_attempts"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their login attempts" ON public."login_attempts"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view native apps" ON public."native_apps"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own usage" ON public."app_usage"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own usage" ON public."app_usage"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own usage" ON public."app_usage"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "admin_manage_assignments" ON public."micro_task_assignments"
  FOR ALL
  USING (is_micro_task_admin(auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "create_own_assignments" ON public."micro_task_assignments"
  FOR INSERT
  WITH CHECK ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "update_own_assignments" ON public."micro_task_assignments"
  FOR UPDATE
  USING ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "view_own_assignments" ON public."micro_task_assignments"
  FOR SELECT
  USING ((user_id = auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage all redemptions" ON public."user_reward_redemptions"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create redemptions" ON public."user_reward_redemptions"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their redemptions" ON public."user_reward_redemptions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their usage sessions" ON public."app_usage_sessions"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their usage sessions" ON public."app_usage_sessions"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own usage sessions" ON public."app_usage_sessions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Everyone can view menu items" ON public."food_menu_items"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create backup records" ON public."backup_history"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their backup records" ON public."backup_history"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their backup history" ON public."backup_history"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "admin_manage_micro_tasks" ON public."micro_tasks"
  FOR ALL
  USING (is_micro_task_admin(auth.uid()))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "view_active_micro_tasks" ON public."micro_tasks"
  FOR SELECT
  USING (((is_active = true) AND ((expires_at IS NULL) OR (expires_at > now())) AND (current_completions < max_completions)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own device caps" ON public."device_capabilities"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view post likes" ON public."post_likes"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can like posts" ON public."post_likes"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can unlike posts" ON public."post_likes"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own contacts" ON public."user_contacts"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own contacts" ON public."user_contacts"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own contacts" ON public."user_contacts"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins manage catalog" ON public."home_solutions_catalog"
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active catalog" ON public."home_solutions_catalog"
  FOR SELECT
  USING (((is_active = true) OR has_role(auth.uid(), 'admin'::app_role)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view subscription plans" ON public."chatr_subscription_plans"
  FOR SELECT
  USING ((is_active = true))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "System can create app sessions" ON public."app_sessions"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "System can update app sessions" ON public."app_sessions"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own app sessions" ON public."app_sessions"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role manages admin_action_logs" ON public."admin_action_logs"
  FOR ALL
  USING (true)
  WITH CHECK (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Members can view community members" ON public."community_members"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can join communities" ON public."community_members"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can leave communities" ON public."community_members"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert trust edges" ON public."trust_graph"
  FOR INSERT
  WITH CHECK ((auth.uid() = source_user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read their own trust graph" ON public."trust_graph"
  FOR SELECT
  USING (((auth.uid() = source_user_id) OR (auth.uid() = target_user_id)))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own trust edges" ON public."trust_graph"
  FOR UPDATE
  USING ((auth.uid() = source_user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their stickers" ON public."ai_stickers"
  FOR ALL
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own vitals" ON public."health_vitals"
  FOR DELETE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own vitals" ON public."health_vitals"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own vitals" ON public."health_vitals"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own vitals" ON public."health_vitals"
  FOR SELECT
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can read identity scores" ON public."identity_scores"
  FOR SELECT
  USING (true)
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert their score" ON public."identity_scores"
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own score" ON public."identity_scores"
  FOR UPDATE
  USING ((auth.uid() = user_id))
;
EXCEPTION WHEN duplicate_object THEN null; END $$;


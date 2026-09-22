-- ==============================================================================
-- PART 5: FOREIGN KEY CONSTRAINTS & INDEXES
-- Target: nuuuqazaoaozgblmvkzn
-- ==============================================================================

-- 1. FOREIGN KEYS
DO $$ BEGIN
  ALTER TABLE public."platform_audit_logs" ADD CONSTRAINT "platform_audit_logs_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES public."platform_events" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_accounting_policies" ADD CONSTRAINT "fin_accounting_policies_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_accounting_policies" ADD CONSTRAINT "fin_accounting_policies_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_accounting_policies" ADD CONSTRAINT "fin_accounting_policies_approval_id_fkey"
  FOREIGN KEY ("approval_id") REFERENCES public."workflow_approvals" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_accounting_policies" ADD CONSTRAINT "fin_accounting_policies_supersedes_id_fkey"
  FOREIGN KEY ("supersedes_id") REFERENCES public."fin_accounting_policies" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."identity_access_rules" ADD CONSTRAINT "identity_access_rules_identity_id_fkey"
  FOREIGN KEY ("identity_id") REFERENCES public."user_identities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."circle_members" ADD CONSTRAINT "circle_members_circle_id_fkey"
  FOREIGN KEY ("circle_id") REFERENCES public."wellness_circles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_contracts" ADD CONSTRAINT "fin_contracts_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_contracts" ADD CONSTRAINT "fin_contracts_source_event_id_fkey"
  FOREIGN KEY ("source_event_id") REFERENCES public."fin_events" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_contracts" ADD CONSTRAINT "fin_contracts_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_contracts" ADD CONSTRAINT "fin_contracts_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES public."fin_customers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."app_builder_projects" ADD CONSTRAINT "app_builder_projects_published_app_id_fkey"
  FOREIGN KEY ("published_app_id") REFERENCES public."mini_apps" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES public."conversations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."community_events_db" ADD CONSTRAINT "community_events_db_organizer_id_fkey"
  FOREIGN KEY ("organizer_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."story_reactions" ADD CONSTRAINT "story_reactions_story_id_fkey"
  FOREIGN KEY ("story_id") REFERENCES public."stories" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."ar_brand_filters" ADD CONSTRAINT "ar_brand_filters_brand_id_fkey"
  FOREIGN KEY ("brand_id") REFERENCES public."brand_partnerships" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_credit_notes" ADD CONSTRAINT "fin_credit_notes_journal_entry_id_fkey"
  FOREIGN KEY ("journal_entry_id") REFERENCES public."fin_journal_entries" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_credit_notes" ADD CONSTRAINT "fin_credit_notes_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_credit_notes" ADD CONSTRAINT "fin_credit_notes_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_credit_notes" ADD CONSTRAINT "fin_credit_notes_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES public."fin_customers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."champion_reward_redemptions" ADD CONSTRAINT "champion_reward_redemptions_reward_id_fkey"
  FOREIGN KEY ("reward_id") REFERENCES public."champion_rewards" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_invoices" ADD CONSTRAINT "fin_invoices_source_event_id_fkey"
  FOREIGN KEY ("source_event_id") REFERENCES public."fin_events" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_invoices" ADD CONSTRAINT "fin_invoices_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_invoices" ADD CONSTRAINT "fin_invoices_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_invoices" ADD CONSTRAINT "fin_invoices_journal_entry_id_fkey"
  FOREIGN KEY ("journal_entry_id") REFERENCES public."fin_journal_entries" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_invoices" ADD CONSTRAINT "fin_invoices_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES public."fin_customers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."provider_payouts" ADD CONSTRAINT "provider_payouts_provider_id_fkey"
  FOREIGN KEY ("provider_id") REFERENCES public."service_providers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_business_graph_edges" ADD CONSTRAINT "sys_business_graph_edges_source_node_id_fkey"
  FOREIGN KEY ("source_node_id") REFERENCES public."sys_business_graph_nodes" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_business_graph_edges" ADD CONSTRAINT "sys_business_graph_edges_target_node_id_fkey"
  FOREIGN KEY ("target_node_id") REFERENCES public."sys_business_graph_nodes" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."crm_agent_tasks" ADD CONSTRAINT "crm_agent_tasks_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES public."business_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."crm_agent_tasks" ADD CONSTRAINT "crm_agent_tasks_lead_id_fkey"
  FOREIGN KEY ("lead_id") REFERENCES public."crm_leads" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."challenge_participants" ADD CONSTRAINT "challenge_participants_challenge_id_fkey"
  FOREIGN KEY ("challenge_id") REFERENCES public."health_challenges" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."favorite_results" ADD CONSTRAINT "favorite_results_result_id_fkey"
  FOREIGN KEY ("result_id") REFERENCES public."search_results" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."ai_traces" ADD CONSTRAINT "ai_traces_instance_id_fkey"
  FOREIGN KEY ("instance_id") REFERENCES public."workflow_state" ("instance_id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_payment_allocations" ADD CONSTRAINT "fin_payment_allocations_payment_id_fkey"
  FOREIGN KEY ("payment_id") REFERENCES public."fin_payments" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_payment_allocations" ADD CONSTRAINT "fin_payment_allocations_bill_id_fkey"
  FOREIGN KEY ("bill_id") REFERENCES public."fin_bills" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_payment_allocations" ADD CONSTRAINT "fin_payment_allocations_invoice_id_fkey"
  FOREIGN KEY ("invoice_id") REFERENCES public."fin_invoices" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."local_business_db" ADD CONSTRAINT "local_business_db_added_by_fkey"
  FOREIGN KEY ("added_by") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."local_business_db" ADD CONSTRAINT "local_business_db_verified_by_fkey"
  FOREIGN KEY ("verified_by") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."micro_task_submissions" ADD CONSTRAINT "micro_task_submissions_task_id_fkey"
  FOREIGN KEY ("task_id") REFERENCES public."micro_tasks" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."micro_task_submissions" ADD CONSTRAINT "micro_task_submissions_assignment_id_fkey"
  FOREIGN KEY ("assignment_id") REFERENCES public."micro_task_assignments" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."gsc_opportunities" ADD CONSTRAINT "gsc_opportunities_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES public."gsc_properties" ("property_id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."provider_availability" ADD CONSTRAINT "provider_availability_provider_id_fkey"
  FOREIGN KEY ("provider_id") REFERENCES public."service_providers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fame_cam_posts" ADD CONSTRAINT "fame_cam_posts_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES public."trending_categories" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."crm_lead_dossiers" ADD CONSTRAINT "crm_lead_dossiers_lead_id_fkey"
  FOREIGN KEY ("lead_id") REFERENCES public."crm_leads" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."crm_lead_dossiers" ADD CONSTRAINT "crm_lead_dossiers_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES public."business_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_event_store" ADD CONSTRAINT "sys_event_store_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."finance_payroll" ADD CONSTRAINT "finance_payroll_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."referral_rewards" ADD CONSTRAINT "referral_rewards_earning_event_id_fkey"
  FOREIGN KEY ("earning_event_id") REFERENCES public."earning_events" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."announcement_reads" ADD CONSTRAINT "announcement_reads_announcement_id_fkey"
  FOREIGN KEY ("announcement_id") REFERENCES public."announcements" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_user_badges" ADD CONSTRAINT "chatr_user_badges_badge_id_fkey"
  FOREIGN KEY ("badge_id") REFERENCES public."chatr_badges" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."community_post_reactions" ADD CONSTRAINT "community_post_reactions_post_id_fkey"
  FOREIGN KEY ("post_id") REFERENCES public."community_posts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."appointments" ADD CONSTRAINT "appointments_service_id_fkey"
  FOREIGN KEY ("service_id") REFERENCES public."services" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."community_posts" ADD CONSTRAINT "community_posts_community_id_fkey"
  FOREIGN KEY ("community_id") REFERENCES public."conversations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."user_search_interactions" ADD CONSTRAINT "user_search_interactions_result_id_fkey"
  FOREIGN KEY ("result_id") REFERENCES public."search_results" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."typing_indicators" ADD CONSTRAINT "typing_indicators_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES public."conversations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."audio_room_participants" ADD CONSTRAINT "audio_room_participants_room_id_fkey"
  FOREIGN KEY ("room_id") REFERENCES public."audio_rooms" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_tenant_users" ADD CONSTRAINT "sys_tenant_users_department_id_fkey"
  FOREIGN KEY ("department_id") REFERENCES public."sys_departments" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_tenant_users" ADD CONSTRAINT "sys_tenant_users_team_id_fkey"
  FOREIGN KEY ("team_id") REFERENCES public."sys_teams" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_tenant_users" ADD CONSTRAINT "sys_tenant_users_workspace_id_fkey"
  FOREIGN KEY ("workspace_id") REFERENCES public."sys_workspaces" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_tenant_users" ADD CONSTRAINT "sys_tenant_users_business_unit_id_fkey"
  FOREIGN KEY ("business_unit_id") REFERENCES public."sys_business_units" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_tenant_users" ADD CONSTRAINT "sys_tenant_users_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."rec_candidates" ADD CONSTRAINT "rec_candidates_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES public."rec_jobs" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."medical_access_audit" ADD CONSTRAINT "medical_access_audit_patient_id_fkey"
  FOREIGN KEY ("patient_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."health_streaks" ADD CONSTRAINT "health_streaks_family_member_id_fkey"
  FOREIGN KEY ("family_member_id") REFERENCES public."health_family_members" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."merchant_deals" ADD CONSTRAINT "merchant_deals_vendor_id_fkey"
  FOREIGN KEY ("vendor_id") REFERENCES public."vendors" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."workflow_approvals" ADD CONSTRAINT "workflow_approvals_run_id_fkey"
  FOREIGN KEY ("run_id") REFERENCES public."workflow_runs" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."workflow_approvals" ADD CONSTRAINT "workflow_approvals_workflow_id_fkey"
  FOREIGN KEY ("workflow_id") REFERENCES public."business_workflows" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_offerings" ADD CONSTRAINT "business_offerings_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES public."business_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."search_alerts" ADD CONSTRAINT "search_alerts_saved_search_id_fkey"
  FOREIGN KEY ("saved_search_id") REFERENCES public."saved_searches" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."messages" ADD CONSTRAINT "messages_original_message_id_fkey"
  FOREIGN KEY ("original_message_id") REFERENCES public."messages" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."messages" ADD CONSTRAINT "messages_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES public."conversations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."messages" ADD CONSTRAINT "messages_sender_id_fkey"
  FOREIGN KEY ("sender_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."messages" ADD CONSTRAINT "messages_reply_to_id_fkey"
  FOREIGN KEY ("reply_to_id") REFERENCES public."messages" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."messages" ADD CONSTRAINT "messages_forwarded_from_id_fkey"
  FOREIGN KEY ("forwarded_from_id") REFERENCES public."messages" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."post_comments" ADD CONSTRAINT "post_comments_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."post_comments" ADD CONSTRAINT "post_comments_post_id_fkey"
  FOREIGN KEY ("post_id") REFERENCES public."youth_posts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."micro_task_verifications" ADD CONSTRAINT "micro_task_verifications_submission_id_fkey"
  FOREIGN KEY ("submission_id") REFERENCES public."micro_task_submissions" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_reconciliation_sessions" ADD CONSTRAINT "fin_reconciliation_sessions_period_id_fkey"
  FOREIGN KEY ("period_id") REFERENCES public."fin_periods" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_reconciliation_sessions" ADD CONSTRAINT "fin_reconciliation_sessions_bank_account_id_fkey"
  FOREIGN KEY ("bank_account_id") REFERENCES public."fin_bank_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_reconciliation_sessions" ADD CONSTRAINT "fin_reconciliation_sessions_statement_id_fkey"
  FOREIGN KEY ("statement_id") REFERENCES public."fin_bank_statements" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."user_fame_achievements" ADD CONSTRAINT "user_fame_achievements_achievement_id_fkey"
  FOREIGN KEY ("achievement_id") REFERENCES public."fame_achievements" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."workflow_versions" ADD CONSTRAINT "workflow_versions_parent_version_id_fkey"
  FOREIGN KEY ("parent_version_id") REFERENCES public."workflow_versions" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."workflow_versions" ADD CONSTRAINT "workflow_versions_workflow_id_fkey"
  FOREIGN KEY ("workflow_id") REFERENCES public."business_workflows" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."user_installed_apps" ADD CONSTRAINT "user_installed_apps_app_id_fkey"
  FOREIGN KEY ("app_id") REFERENCES public."mini_apps" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."prescription_uploads" ADD CONSTRAINT "prescription_uploads_family_member_id_fkey"
  FOREIGN KEY ("family_member_id") REFERENCES public."health_family_members" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."scheduled_messages" ADD CONSTRAINT "scheduled_messages_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES public."conversations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_workflows" ADD CONSTRAINT "business_workflows_profile_id_fkey"
  FOREIGN KEY ("profile_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_workflows" ADD CONSTRAINT "business_workflows_active_version_id_fkey"
  FOREIGN KEY ("active_version_id") REFERENCES public."workflow_versions" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."cc_outreach" ADD CONSTRAINT "cc_outreach_lead_id_fkey"
  FOREIGN KEY ("lead_id") REFERENCES public."cc_leads" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."cc_outreach" ADD CONSTRAINT "cc_outreach_plan_id_fkey"
  FOREIGN KEY ("plan_id") REFERENCES public."cc_plans" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_events" ADD CONSTRAINT "fin_events_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_events" ADD CONSTRAINT "fin_events_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."local_offers_db" ADD CONSTRAINT "local_offers_db_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES public."local_business_db" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."local_offers_db" ADD CONSTRAINT "local_offers_db_posted_by_fkey"
  FOREIGN KEY ("posted_by") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."service_bookings" ADD CONSTRAINT "service_bookings_service_id_fkey"
  FOREIGN KEY ("service_id") REFERENCES public."provider_services" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."service_bookings" ADD CONSTRAINT "service_bookings_provider_id_fkey"
  FOREIGN KEY ("provider_id") REFERENCES public."service_providers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."service_bookings" ADD CONSTRAINT "service_bookings_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES public."service_categories" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."official_account_posts" ADD CONSTRAINT "official_account_posts_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES public."official_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."gmail_imported_contacts" ADD CONSTRAINT "gmail_imported_contacts_chatr_user_id_fkey"
  FOREIGN KEY ("chatr_user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_org_members" ADD CONSTRAINT "sys_org_members_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."crm_pipelines" ADD CONSTRAINT "crm_pipelines_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES public."business_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."vendor_settlements" ADD CONSTRAINT "vendor_settlements_vendor_id_fkey"
  FOREIGN KEY ("vendor_id") REFERENCES public."vendors" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."game_user_achievements" ADD CONSTRAINT "game_user_achievements_achievement_id_fkey"
  FOREIGN KEY ("achievement_id") REFERENCES public."game_achievements" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."moment_shares" ADD CONSTRAINT "moment_shares_moment_id_fkey"
  FOREIGN KEY ("moment_id") REFERENCES public."ai_moments" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_vendors" ADD CONSTRAINT "fin_vendors_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_vendors" ADD CONSTRAINT "fin_vendors_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."crm_leads" ADD CONSTRAINT "crm_leads_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."crm_leads" ADD CONSTRAINT "crm_leads_assigned_to_fkey"
  FOREIGN KEY ("assigned_to") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."crm_leads" ADD CONSTRAINT "crm_leads_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES public."business_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."crm_leads" ADD CONSTRAINT "crm_leads_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES public."conversations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."channel_messages" ADD CONSTRAINT "channel_messages_channel_id_fkey"
  FOREIGN KEY ("channel_id") REFERENCES public."channels" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."geofence_events" ADD CONSTRAINT "geofence_events_geofence_id_fkey"
  FOREIGN KEY ("geofence_id") REFERENCES public."geofences" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."candidates" ADD CONSTRAINT "candidates_applied_for_fkey"
  FOREIGN KEY ("applied_for") REFERENCES public."requisitions" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."vaccination_records" ADD CONSTRAINT "vaccination_records_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_catalog" ADD CONSTRAINT "business_catalog_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES public."business_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."deal_merchant_details" ADD CONSTRAINT "deal_merchant_details_vendor_id_fkey"
  FOREIGN KEY ("vendor_id") REFERENCES public."vendors" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."seller_kyc_documents" ADD CONSTRAINT "seller_kyc_documents_seller_id_fkey"
  FOREIGN KEY ("seller_id") REFERENCES public."chatr_plus_sellers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_profiles" ADD CONSTRAINT "business_profiles_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."mini_apps" ADD CONSTRAINT "mini_apps_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES public."app_categories" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."prescriptions" ADD CONSTRAINT "prescriptions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_intercompany_transactions" ADD CONSTRAINT "fin_intercompany_transactions_from_legal_entity_id_fkey"
  FOREIGN KEY ("from_legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_intercompany_transactions" ADD CONSTRAINT "fin_intercompany_transactions_elimination_entry_id_fkey"
  FOREIGN KEY ("elimination_entry_id") REFERENCES public."fin_journal_entries" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_intercompany_transactions" ADD CONSTRAINT "fin_intercompany_transactions_to_journal_entry_id_fkey"
  FOREIGN KEY ("to_journal_entry_id") REFERENCES public."fin_journal_entries" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_intercompany_transactions" ADD CONSTRAINT "fin_intercompany_transactions_to_legal_entity_id_fkey"
  FOREIGN KEY ("to_legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_intercompany_transactions" ADD CONSTRAINT "fin_intercompany_transactions_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_intercompany_transactions" ADD CONSTRAINT "fin_intercompany_transactions_from_journal_entry_id_fkey"
  FOREIGN KEY ("from_journal_entry_id") REFERENCES public."fin_journal_entries" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."album_photos" ADD CONSTRAINT "album_photos_album_id_fkey"
  FOREIGN KEY ("album_id") REFERENCES public."photo_albums" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_prepaids" ADD CONSTRAINT "fin_prepaids_vendor_id_fkey"
  FOREIGN KEY ("vendor_id") REFERENCES public."fin_vendors" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_prepaids" ADD CONSTRAINT "fin_prepaids_prepaid_asset_account_id_fkey"
  FOREIGN KEY ("prepaid_asset_account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_prepaids" ADD CONSTRAINT "fin_prepaids_expense_account_id_fkey"
  FOREIGN KEY ("expense_account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_prepaids" ADD CONSTRAINT "fin_prepaids_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_prepaids" ADD CONSTRAINT "fin_prepaids_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_healthcare_appointments" ADD CONSTRAINT "chatr_healthcare_appointments_provider_id_fkey"
  FOREIGN KEY ("provider_id") REFERENCES public."chatr_healthcare" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."referrals" ADD CONSTRAINT "referrals_referred_id_fkey"
  FOREIGN KEY ("referred_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."referrals" ADD CONSTRAINT "referrals_referrer_id_fkey"
  FOREIGN KEY ("referrer_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."workflow_checkpoints" ADD CONSTRAINT "workflow_checkpoints_instance_id_fkey"
  FOREIGN KEY ("instance_id") REFERENCES public."workflow_state" ("instance_id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."home_service_providers" ADD CONSTRAINT "home_service_providers_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_invoice_lines" ADD CONSTRAINT "fin_invoice_lines_revenue_account_id_fkey"
  FOREIGN KEY ("revenue_account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_invoice_lines" ADD CONSTRAINT "fin_invoice_lines_department_id_fkey"
  FOREIGN KEY ("department_id") REFERENCES public."sys_departments" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_invoice_lines" ADD CONSTRAINT "fin_invoice_lines_invoice_id_fkey"
  FOREIGN KEY ("invoice_id") REFERENCES public."fin_invoices" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_plus_transactions" ADD CONSTRAINT "chatr_plus_transactions_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES public."chatr_plus_bookings" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."workspace_tasks" ADD CONSTRAINT "workspace_tasks_workspace_id_fkey"
  FOREIGN KEY ("workspace_id") REFERENCES public."workspaces" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."click_logs" ADD CONSTRAINT "click_logs_search_id_fkey"
  FOREIGN KEY ("search_id") REFERENCES public."search_logs" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."session_rooms" ADD CONSTRAINT "session_rooms_host_id_fkey"
  FOREIGN KEY ("host_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."micro_task_fraud_flags" ADD CONSTRAINT "micro_task_fraud_flags_submission_id_fkey"
  FOREIGN KEY ("submission_id") REFERENCES public."micro_task_submissions" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_fx_rates" ADD CONSTRAINT "fin_fx_rates_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bills" ADD CONSTRAINT "fin_bills_vendor_id_fkey"
  FOREIGN KEY ("vendor_id") REFERENCES public."fin_vendors" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bills" ADD CONSTRAINT "fin_bills_source_event_id_fkey"
  FOREIGN KEY ("source_event_id") REFERENCES public."fin_events" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bills" ADD CONSTRAINT "fin_bills_journal_entry_id_fkey"
  FOREIGN KEY ("journal_entry_id") REFERENCES public."fin_journal_entries" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bills" ADD CONSTRAINT "fin_bills_approval_id_fkey"
  FOREIGN KEY ("approval_id") REFERENCES public."workflow_approvals" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bills" ADD CONSTRAINT "fin_bills_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bills" ADD CONSTRAINT "fin_bills_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."provider_access_consents" ADD CONSTRAINT "provider_access_consents_patient_id_fkey"
  FOREIGN KEY ("patient_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bank_statements" ADD CONSTRAINT "fin_bank_statements_bank_account_id_fkey"
  FOREIGN KEY ("bank_account_id") REFERENCES public."fin_bank_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."coin_payments" ADD CONSTRAINT "coin_payments_app_id_fkey"
  FOREIGN KEY ("app_id") REFERENCES public."mini_apps" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_business_graph_nodes" ADD CONSTRAINT "sys_business_graph_nodes_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_business_graph_nodes" ADD CONSTRAINT "sys_business_graph_nodes_entity_id_fkey"
  FOREIGN KEY ("entity_id") REFERENCES public."sys_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."broadcast_recipients" ADD CONSTRAINT "broadcast_recipients_broadcast_id_fkey"
  FOREIGN KEY ("broadcast_id") REFERENCES public."broadcast_lists" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_modules" ADD CONSTRAINT "sys_modules_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_performance_obligations" ADD CONSTRAINT "fin_performance_obligations_contract_id_fkey"
  FOREIGN KEY ("contract_id") REFERENCES public."fin_contracts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_performance_obligations" ADD CONSTRAINT "fin_performance_obligations_revenue_account_id_fkey"
  FOREIGN KEY ("revenue_account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_performance_obligations" ADD CONSTRAINT "fin_performance_obligations_deferred_rev_account_id_fkey"
  FOREIGN KEY ("deferred_rev_account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bill_lines" ADD CONSTRAINT "fin_bill_lines_department_id_fkey"
  FOREIGN KEY ("department_id") REFERENCES public."sys_departments" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bill_lines" ADD CONSTRAINT "fin_bill_lines_expense_account_id_fkey"
  FOREIGN KEY ("expense_account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bill_lines" ADD CONSTRAINT "fin_bill_lines_bill_id_fkey"
  FOREIGN KEY ("bill_id") REFERENCES public."fin_bills" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_journal_lines" ADD CONSTRAINT "fin_journal_lines_department_id_fkey"
  FOREIGN KEY ("department_id") REFERENCES public."sys_departments" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_journal_lines" ADD CONSTRAINT "fin_journal_lines_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_journal_lines" ADD CONSTRAINT "fin_journal_lines_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_journal_lines" ADD CONSTRAINT "fin_journal_lines_journal_entry_id_fkey"
  FOREIGN KEY ("journal_entry_id") REFERENCES public."fin_journal_entries" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_accounts" ADD CONSTRAINT "fin_accounts_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_accounts" ADD CONSTRAINT "fin_accounts_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_accounts" ADD CONSTRAINT "fin_accounts_parent_account_id_fkey"
  FOREIGN KEY ("parent_account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."content_flags" ADD CONSTRAINT "content_flags_reviewed_by_fkey"
  FOREIGN KEY ("reviewed_by") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."content_flags" ADD CONSTRAINT "content_flags_flagged_by_fkey"
  FOREIGN KEY ("flagged_by") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."gsc_sync_runs" ADD CONSTRAINT "gsc_sync_runs_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES public."gsc_properties" ("property_id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."mobile_action_queue" ADD CONSTRAINT "mobile_action_queue_call_id_fkey"
  FOREIGN KEY ("call_id") REFERENCES public."calls" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."mobile_action_queue" ADD CONSTRAINT "mobile_action_queue_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES public."conversations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."mobile_action_queue" ADD CONSTRAINT "mobile_action_queue_candidate_id_fkey"
  FOREIGN KEY ("candidate_id") REFERENCES public."candidates" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_workspaces" ADD CONSTRAINT "sys_workspaces_team_id_fkey"
  FOREIGN KEY ("team_id") REFERENCES public."sys_teams" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_workspaces" ADD CONSTRAINT "sys_workspaces_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_workflows" ADD CONSTRAINT "sys_workflows_entity_id_fkey"
  FOREIGN KEY ("entity_id") REFERENCES public."sys_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."caregiver_alerts" ADD CONSTRAINT "caregiver_alerts_family_member_id_fkey"
  FOREIGN KEY ("family_member_id") REFERENCES public."health_family_members" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_attributes" ADD CONSTRAINT "sys_attributes_entity_id_fkey"
  FOREIGN KEY ("entity_id") REFERENCES public."sys_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."enterprise_users" ADD CONSTRAINT "enterprise_users_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES public."organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."workspace_customers" ADD CONSTRAINT "workspace_customers_profile_id_fkey"
  FOREIGN KEY ("profile_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."workspace_customers" ADD CONSTRAINT "workspace_customers_workspace_id_fkey"
  FOREIGN KEY ("workspace_id") REFERENCES public."workspaces" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_payments" ADD CONSTRAINT "fin_payments_source_event_id_fkey"
  FOREIGN KEY ("source_event_id") REFERENCES public."fin_events" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_payments" ADD CONSTRAINT "fin_payments_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_payments" ADD CONSTRAINT "fin_payments_journal_entry_id_fkey"
  FOREIGN KEY ("journal_entry_id") REFERENCES public."fin_journal_entries" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_payments" ADD CONSTRAINT "fin_payments_bank_account_id_fkey"
  FOREIGN KEY ("bank_account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_payments" ADD CONSTRAINT "fin_payments_vendor_id_fkey"
  FOREIGN KEY ("vendor_id") REFERENCES public."fin_vendors" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_payments" ADD CONSTRAINT "fin_payments_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES public."fin_customers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_payments" ADD CONSTRAINT "fin_payments_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."provider_services" ADD CONSTRAINT "provider_services_provider_id_fkey"
  FOREIGN KEY ("provider_id") REFERENCES public."service_providers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."provider_services" ADD CONSTRAINT "provider_services_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES public."service_categories" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."food_orders" ADD CONSTRAINT "food_orders_vendor_id_fkey"
  FOREIGN KEY ("vendor_id") REFERENCES public."food_vendors" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_platform_fees" ADD CONSTRAINT "chatr_platform_fees_seller_id_fkey"
  FOREIGN KEY ("seller_id") REFERENCES public."chatr_plus_sellers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_platform_fees" ADD CONSTRAINT "chatr_platform_fees_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES public."chatr_plus_bookings" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_reconciliation_exceptions" ADD CONSTRAINT "fin_reconciliation_exceptions_bank_transaction_id_fkey"
  FOREIGN KEY ("bank_transaction_id") REFERENCES public."fin_bank_transactions" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."connector_sync_runs" ADD CONSTRAINT "connector_sync_runs_connection_id_fkey"
  FOREIGN KEY ("connection_id") REFERENCES public."connector_connections" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."ai_memory_conversation" ADD CONSTRAINT "ai_memory_conversation_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."growth_assets" ADD CONSTRAINT "growth_assets_campaign_id_fkey"
  FOREIGN KEY ("campaign_id") REFERENCES public."growth_campaigns" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_customers" ADD CONSTRAINT "fin_customers_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_customers" ADD CONSTRAINT "fin_customers_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."lab_reports" ADD CONSTRAINT "lab_reports_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_team_members" ADD CONSTRAINT "business_team_members_invited_by_fkey"
  FOREIGN KEY ("invited_by") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_team_members" ADD CONSTRAINT "business_team_members_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES public."business_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_team_members" ADD CONSTRAINT "business_team_members_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."booking_status_updates" ADD CONSTRAINT "booking_status_updates_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES public."service_bookings" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."dhandha_customers" ADD CONSTRAINT "dhandha_customers_merchant_id_fkey"
  FOREIGN KEY ("merchant_id") REFERENCES public."merchant_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."home_service_bookings" ADD CONSTRAINT "home_service_bookings_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."home_service_bookings" ADD CONSTRAINT "home_service_bookings_provider_id_fkey"
  FOREIGN KEY ("provider_id") REFERENCES public."home_service_providers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."service_reviews" ADD CONSTRAINT "service_reviews_provider_id_fkey"
  FOREIGN KEY ("provider_id") REFERENCES public."service_providers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."service_reviews" ADD CONSTRAINT "service_reviews_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES public."service_bookings" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_legal_entities" ADD CONSTRAINT "fin_legal_entities_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_legal_entities" ADD CONSTRAINT "fin_legal_entities_parent_entity_id_fkey"
  FOREIGN KEY ("parent_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."youth_posts" ADD CONSTRAINT "youth_posts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."room_participants" ADD CONSTRAINT "room_participants_room_id_fkey"
  FOREIGN KEY ("room_id") REFERENCES public."live_rooms" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."community_post_comments" ADD CONSTRAINT "community_post_comments_post_id_fkey"
  FOREIGN KEY ("post_id") REFERENCES public."community_posts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."user_installed_plugins" ADD CONSTRAINT "user_installed_plugins_app_id_fkey"
  FOREIGN KEY ("app_id") REFERENCES public."mini_apps" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."user_challenge_progress" ADD CONSTRAINT "user_challenge_progress_challenge_id_fkey"
  FOREIGN KEY ("challenge_id") REFERENCES public."rewards_daily_challenges" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."app_submissions" ADD CONSTRAINT "app_submissions_developer_id_fkey"
  FOREIGN KEY ("developer_id") REFERENCES public."developer_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."app_submissions" ADD CONSTRAINT "app_submissions_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES public."app_categories" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."app_submissions" ADD CONSTRAINT "app_submissions_reviewed_by_fkey"
  FOREIGN KEY ("reviewed_by") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chat_brand_triggers" ADD CONSTRAINT "chat_brand_triggers_brand_id_fkey"
  FOREIGN KEY ("brand_id") REFERENCES public."brand_partnerships" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."teleconsultation_slots" ADD CONSTRAINT "teleconsultation_slots_appointment_id_fkey"
  FOREIGN KEY ("appointment_id") REFERENCES public."appointments" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."medicine_orders" ADD CONSTRAINT "medicine_orders_subscription_id_fkey"
  FOREIGN KEY ("subscription_id") REFERENCES public."medicine_subscriptions" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."home_service_reviews" ADD CONSTRAINT "home_service_reviews_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES public."home_service_bookings" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."home_service_reviews" ADD CONSTRAINT "home_service_reviews_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."home_service_reviews" ADD CONSTRAINT "home_service_reviews_provider_id_fkey"
  FOREIGN KEY ("provider_id") REFERENCES public."home_service_providers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."medicine_intake_log" ADD CONSTRAINT "medicine_intake_log_subscription_item_id_fkey"
  FOREIGN KEY ("subscription_item_id") REFERENCES public."subscription_items" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."medicine_intake_log" ADD CONSTRAINT "medicine_intake_log_family_member_id_fkey"
  FOREIGN KEY ("family_member_id") REFERENCES public."health_family_members" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."device_sessions" ADD CONSTRAINT "device_sessions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."status_views" ADD CONSTRAINT "status_views_status_id_fkey"
  FOREIGN KEY ("status_id") REFERENCES public."user_status" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."health_challenge_participants" ADD CONSTRAINT "health_challenge_participants_challenge_id_fkey"
  FOREIGN KEY ("challenge_id") REFERENCES public."health_challenges" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_contract_amendments" ADD CONSTRAINT "fin_contract_amendments_contract_id_fkey"
  FOREIGN KEY ("contract_id") REFERENCES public."fin_contracts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_contract_amendments" ADD CONSTRAINT "fin_contract_amendments_approval_id_fkey"
  FOREIGN KEY ("approval_id") REFERENCES public."workflow_approvals" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."workspace_broadcasts" ADD CONSTRAINT "workspace_broadcasts_workspace_id_fkey"
  FOREIGN KEY ("workspace_id") REFERENCES public."workspaces" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."cc_dev_tasks" ADD CONSTRAINT "cc_dev_tasks_plan_id_fkey"
  FOREIGN KEY ("plan_id") REFERENCES public."cc_plans" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."story_views" ADD CONSTRAINT "story_views_story_id_fkey"
  FOREIGN KEY ("story_id") REFERENCES public."stories" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."story_views" ADD CONSTRAINT "story_views_viewer_id_fkey"
  FOREIGN KEY ("viewer_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."gsc_queries" ADD CONSTRAINT "gsc_queries_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES public."gsc_properties" ("property_id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."medication_reminders" ADD CONSTRAINT "medication_reminders_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."ai_agent_analytics" ADD CONSTRAINT "ai_agent_analytics_agent_id_fkey"
  FOREIGN KEY ("agent_id") REFERENCES public."ai_agents" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_organizations" ADD CONSTRAINT "fin_organizations_sys_organization_id_fkey"
  FOREIGN KEY ("sys_organization_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."communication_events" ADD CONSTRAINT "communication_events_call_id_fkey"
  FOREIGN KEY ("call_id") REFERENCES public."calls" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."communication_events" ADD CONSTRAINT "communication_events_candidate_id_fkey"
  FOREIGN KEY ("candidate_id") REFERENCES public."candidates" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."communication_events" ADD CONSTRAINT "communication_events_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES public."conversations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."monetization_leads" ADD CONSTRAINT "monetization_leads_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."finance_expenses" ADD CONSTRAINT "finance_expenses_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."workflow_metrics" ADD CONSTRAINT "workflow_metrics_instance_id_fkey"
  FOREIGN KEY ("instance_id") REFERENCES public."workflow_state" ("instance_id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_plus_bookings" ADD CONSTRAINT "chatr_plus_bookings_service_id_fkey"
  FOREIGN KEY ("service_id") REFERENCES public."chatr_plus_services" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_plus_bookings" ADD CONSTRAINT "chatr_plus_bookings_seller_id_fkey"
  FOREIGN KEY ("seller_id") REFERENCES public."chatr_plus_sellers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."dhandha_transactions" ADD CONSTRAINT "dhandha_transactions_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES public."dhandha_customers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."dhandha_transactions" ADD CONSTRAINT "dhandha_transactions_merchant_id_fkey"
  FOREIGN KEY ("merchant_id") REFERENCES public."merchant_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."dead_letters" ADD CONSTRAINT "dead_letters_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES public."platform_events" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_food_orders" ADD CONSTRAINT "chatr_food_orders_restaurant_id_fkey"
  FOREIGN KEY ("restaurant_id") REFERENCES public."chatr_restaurants" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."rec_offer_letters" ADD CONSTRAINT "rec_offer_letters_candidate_id_fkey"
  FOREIGN KEY ("candidate_id") REFERENCES public."rec_candidates" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."rec_offer_letters" ADD CONSTRAINT "rec_offer_letters_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES public."rec_jobs" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_menu_items" ADD CONSTRAINT "chatr_menu_items_restaurant_id_fkey"
  FOREIGN KEY ("restaurant_id") REFERENCES public."chatr_restaurants" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."seller_settlements" ADD CONSTRAINT "seller_settlements_payment_id_fkey"
  FOREIGN KEY ("payment_id") REFERENCES public."upi_payments" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fame_cam_challenges" ADD CONSTRAINT "fame_cam_challenges_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES public."trending_categories" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."menu_categories" ADD CONSTRAINT "menu_categories_vendor_id_fkey"
  FOREIGN KEY ("vendor_id") REFERENCES public."vendors" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."finance_invoices" ADD CONSTRAINT "finance_invoices_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_subscriptions" ADD CONSTRAINT "business_subscriptions_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES public."business_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."automation_logs" ADD CONSTRAINT "automation_logs_rule_id_fkey"
  FOREIGN KEY ("rule_id") REFERENCES public."automation_rules" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."menu_items" ADD CONSTRAINT "menu_items_vendor_id_fkey"
  FOREIGN KEY ("vendor_id") REFERENCES public."vendors" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."menu_items" ADD CONSTRAINT "menu_items_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES public."menu_categories" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_knowledge_edges" ADD CONSTRAINT "sys_knowledge_edges_source_node_id_fkey"
  FOREIGN KEY ("source_node_id") REFERENCES public."sys_knowledge_nodes" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_knowledge_edges" ADD CONSTRAINT "sys_knowledge_edges_target_node_id_fkey"
  FOREIGN KEY ("target_node_id") REFERENCES public."sys_knowledge_nodes" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_knowledge_edges" ADD CONSTRAINT "sys_knowledge_edges_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."api_keys" ADD CONSTRAINT "api_keys_profile_id_fkey"
  FOREIGN KEY ("profile_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."app_permissions" ADD CONSTRAINT "app_permissions_app_id_fkey"
  FOREIGN KEY ("app_id") REFERENCES public."chatr_os_apps" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."story_likes" ADD CONSTRAINT "story_likes_story_id_fkey"
  FOREIGN KEY ("story_id") REFERENCES public."wellness_stories" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."enterprise_audit_logs" ADD CONSTRAINT "enterprise_audit_logs_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES public."organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."enterprise_audit_logs" ADD CONSTRAINT "enterprise_audit_logs_actor_id_fkey"
  FOREIGN KEY ("actor_id") REFERENCES public."enterprise_users" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bank_transactions" ADD CONSTRAINT "fin_bank_transactions_bank_account_id_fkey"
  FOREIGN KEY ("bank_account_id") REFERENCES public."fin_bank_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bank_transactions" ADD CONSTRAINT "fin_bank_transactions_statement_id_fkey"
  FOREIGN KEY ("statement_id") REFERENCES public."fin_bank_statements" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bank_transactions" ADD CONSTRAINT "fin_bank_transactions_matched_journal_entry_id_fkey"
  FOREIGN KEY ("matched_journal_entry_id") REFERENCES public."fin_journal_entries" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bank_transactions" ADD CONSTRAINT "fin_bank_transactions_matched_payment_id_fkey"
  FOREIGN KEY ("matched_payment_id") REFERENCES public."fin_payments" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bank_transactions" ADD CONSTRAINT "fin_bank_transactions_source_event_id_fkey"
  FOREIGN KEY ("source_event_id") REFERENCES public."fin_events" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_call_logs" ADD CONSTRAINT "business_call_logs_profile_id_fkey"
  FOREIGN KEY ("profile_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_call_logs" ADD CONSTRAINT "business_call_logs_routing_workflow_id_fkey"
  FOREIGN KEY ("routing_workflow_id") REFERENCES public."business_workflows" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."food_vendors" ADD CONSTRAINT "food_vendors_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES public."business_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."ai_agent_training" ADD CONSTRAINT "ai_agent_training_agent_id_fkey"
  FOREIGN KEY ("agent_id") REFERENCES public."ai_agents" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."message_translations" ADD CONSTRAINT "message_translations_message_id_fkey"
  FOREIGN KEY ("message_id") REFERENCES public."messages" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_ai_policies" ADD CONSTRAINT "sys_ai_policies_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."message_reports" ADD CONSTRAINT "message_reports_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES public."conversations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."message_reports" ADD CONSTRAINT "message_reports_message_id_fkey"
  FOREIGN KEY ("message_id") REFERENCES public."messages" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_conversations" ADD CONSTRAINT "business_conversations_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES public."conversations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_conversations" ADD CONSTRAINT "business_conversations_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES public."business_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_conversations" ADD CONSTRAINT "business_conversations_assigned_to_fkey"
  FOREIGN KEY ("assigned_to") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_conversations" ADD CONSTRAINT "business_conversations_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_plus_services" ADD CONSTRAINT "chatr_plus_services_seller_id_fkey"
  FOREIGN KEY ("seller_id") REFERENCES public."chatr_plus_sellers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_plus_services" ADD CONSTRAINT "chatr_plus_services_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES public."chatr_plus_categories" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."brand_impressions" ADD CONSTRAINT "brand_impressions_brand_id_fkey"
  FOREIGN KEY ("brand_id") REFERENCES public."brand_partnerships" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."brand_impressions" ADD CONSTRAINT "brand_impressions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."brand_impressions" ADD CONSTRAINT "brand_impressions_placement_id_fkey"
  FOREIGN KEY ("placement_id") REFERENCES public."brand_placements" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."webhooks" ADD CONSTRAINT "webhooks_profile_id_fkey"
  FOREIGN KEY ("profile_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."message_tasks" ADD CONSTRAINT "message_tasks_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES public."conversations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."message_tasks" ADD CONSTRAINT "message_tasks_message_id_fkey"
  FOREIGN KEY ("message_id") REFERENCES public."messages" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_plus_categories" ADD CONSTRAINT "chatr_plus_categories_parent_category_id_fkey"
  FOREIGN KEY ("parent_category_id") REFERENCES public."chatr_plus_categories" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."connector_credentials" ADD CONSTRAINT "connector_credentials_connection_id_fkey"
  FOREIGN KEY ("connection_id") REFERENCES public."connector_connections" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."crm_activities" ADD CONSTRAINT "crm_activities_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES public."business_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."crm_activities" ADD CONSTRAINT "crm_activities_assigned_to_fkey"
  FOREIGN KEY ("assigned_to") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."crm_activities" ADD CONSTRAINT "crm_activities_lead_id_fkey"
  FOREIGN KEY ("lead_id") REFERENCES public."crm_leads" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."crm_activities" ADD CONSTRAINT "crm_activities_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chat_folder_items" ADD CONSTRAINT "chat_folder_items_folder_id_fkey"
  FOREIGN KEY ("folder_id") REFERENCES public."chat_folders" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chat_folder_items" ADD CONSTRAINT "chat_folder_items_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES public."conversations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."reported_reviews" ADD CONSTRAINT "reported_reviews_review_id_fkey"
  FOREIGN KEY ("review_id") REFERENCES public."home_service_reviews" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."message_retry_log" ADD CONSTRAINT "message_retry_log_message_id_fkey"
  FOREIGN KEY ("message_id") REFERENCES public."messages" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_revenue_schedules" ADD CONSTRAINT "fin_revenue_schedules_journal_entry_id_fkey"
  FOREIGN KEY ("journal_entry_id") REFERENCES public."fin_journal_entries" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_revenue_schedules" ADD CONSTRAINT "fin_revenue_schedules_period_id_fkey"
  FOREIGN KEY ("period_id") REFERENCES public."fin_periods" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_revenue_schedules" ADD CONSTRAINT "fin_revenue_schedules_contract_id_fkey"
  FOREIGN KEY ("contract_id") REFERENCES public."fin_contracts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_revenue_schedules" ADD CONSTRAINT "fin_revenue_schedules_obligation_id_fkey"
  FOREIGN KEY ("obligation_id") REFERENCES public."fin_performance_obligations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."encryption_keys" ADD CONSTRAINT "encryption_keys_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."error_logs" ADD CONSTRAINT "error_logs_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_account_mappings" ADD CONSTRAINT "fin_account_mappings_debit_account_id_fkey"
  FOREIGN KEY ("debit_account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_account_mappings" ADD CONSTRAINT "fin_account_mappings_credit_account_id_fkey"
  FOREIGN KEY ("credit_account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_account_mappings" ADD CONSTRAINT "fin_account_mappings_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_account_mappings" ADD CONSTRAINT "fin_account_mappings_policy_id_fkey"
  FOREIGN KEY ("policy_id") REFERENCES public."fin_accounting_policies" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_account_mappings" ADD CONSTRAINT "fin_account_mappings_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."message_drafts" ADD CONSTRAINT "message_drafts_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES public."conversations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."challenge_participations" ADD CONSTRAINT "challenge_participations_challenge_id_fkey"
  FOREIGN KEY ("challenge_id") REFERENCES public."fame_cam_challenges" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."challenge_participations" ADD CONSTRAINT "challenge_participations_post_id_fkey"
  FOREIGN KEY ("post_id") REFERENCES public."fame_cam_posts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."app_installs" ADD CONSTRAINT "app_installs_app_id_fkey"
  FOREIGN KEY ("app_id") REFERENCES public."mini_apps" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_fixed_assets" ADD CONSTRAINT "fin_fixed_assets_accum_dep_account_id_fkey"
  FOREIGN KEY ("accum_dep_account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_fixed_assets" ADD CONSTRAINT "fin_fixed_assets_asset_account_id_fkey"
  FOREIGN KEY ("asset_account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_fixed_assets" ADD CONSTRAINT "fin_fixed_assets_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_fixed_assets" ADD CONSTRAINT "fin_fixed_assets_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_fixed_assets" ADD CONSTRAINT "fin_fixed_assets_dep_expense_account_id_fkey"
  FOREIGN KEY ("dep_expense_account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."vendor_notifications" ADD CONSTRAINT "vendor_notifications_vendor_id_fkey"
  FOREIGN KEY ("vendor_id") REFERENCES public."vendors" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_reconciliation_matches" ADD CONSTRAINT "fin_reconciliation_matches_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES public."fin_reconciliation_sessions" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_reconciliation_matches" ADD CONSTRAINT "fin_reconciliation_matches_bank_transaction_id_fkey"
  FOREIGN KEY ("bank_transaction_id") REFERENCES public."fin_bank_transactions" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_reconciliation_matches" ADD CONSTRAINT "fin_reconciliation_matches_payment_id_fkey"
  FOREIGN KEY ("payment_id") REFERENCES public."fin_payments" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_reconciliation_matches" ADD CONSTRAINT "fin_reconciliation_matches_journal_line_id_fkey"
  FOREIGN KEY ("journal_line_id") REFERENCES public."fin_journal_lines" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."studio_user_designs" ADD CONSTRAINT "studio_user_designs_template_id_fkey"
  FOREIGN KEY ("template_id") REFERENCES public."studio_design_templates" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."starred_messages" ADD CONSTRAINT "starred_messages_message_id_fkey"
  FOREIGN KEY ("message_id") REFERENCES public."messages" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."starred_messages" ADD CONSTRAINT "starred_messages_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES public."conversations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."calls" ADD CONSTRAINT "calls_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES public."conversations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."calls" ADD CONSTRAINT "calls_receiver_id_fkey"
  FOREIGN KEY ("receiver_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_journal_entries" ADD CONSTRAINT "fin_journal_entries_policy_version_id_fkey"
  FOREIGN KEY ("policy_version_id") REFERENCES public."fin_accounting_policies" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_journal_entries" ADD CONSTRAINT "fin_journal_entries_approval_id_fkey"
  FOREIGN KEY ("approval_id") REFERENCES public."workflow_approvals" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_journal_entries" ADD CONSTRAINT "fin_journal_entries_reversed_by_id_fkey"
  FOREIGN KEY ("reversed_by_id") REFERENCES public."fin_journal_entries" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_journal_entries" ADD CONSTRAINT "fin_journal_entries_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_journal_entries" ADD CONSTRAINT "fin_journal_entries_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_journal_entries" ADD CONSTRAINT "fin_journal_entries_period_id_fkey"
  FOREIGN KEY ("period_id") REFERENCES public."fin_periods" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_journal_entries" ADD CONSTRAINT "fin_journal_entries_source_event_id_fkey"
  FOREIGN KEY ("source_event_id") REFERENCES public."fin_events" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_journal_entries" ADD CONSTRAINT "fin_journal_entries_reversal_of_id_fkey"
  FOREIGN KEY ("reversal_of_id") REFERENCES public."fin_journal_entries" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."app_analytics" ADD CONSTRAINT "app_analytics_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."app_analytics" ADD CONSTRAINT "app_analytics_app_id_fkey"
  FOREIGN KEY ("app_id") REFERENCES public."mini_apps" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_close_tasks" ADD CONSTRAINT "fin_close_tasks_checklist_id_fkey"
  FOREIGN KEY ("checklist_id") REFERENCES public."fin_close_checklists" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sales_deals" ADD CONSTRAINT "sales_deals_lead_id_fkey"
  FOREIGN KEY ("lead_id") REFERENCES public."sales_leads" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_integrity_reports" ADD CONSTRAINT "fin_integrity_reports_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_entities" ADD CONSTRAINT "sys_entities_module_id_fkey"
  FOREIGN KEY ("module_id") REFERENCES public."sys_modules" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."review_replies" ADD CONSTRAINT "review_replies_review_id_fkey"
  FOREIGN KEY ("review_id") REFERENCES public."home_service_reviews" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."workspace_templates" ADD CONSTRAINT "workspace_templates_workspace_id_fkey"
  FOREIGN KEY ("workspace_id") REFERENCES public."workspaces" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."message_reactions" ADD CONSTRAINT "message_reactions_message_id_fkey"
  FOREIGN KEY ("message_id") REFERENCES public."messages" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."user_activities" ADD CONSTRAINT "user_activities_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_close_checklists" ADD CONSTRAINT "fin_close_checklists_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_close_checklists" ADD CONSTRAINT "fin_close_checklists_period_id_fkey"
  FOREIGN KEY ("period_id") REFERENCES public."fin_periods" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_close_checklists" ADD CONSTRAINT "fin_close_checklists_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."inter_app_messages" ADD CONSTRAINT "inter_app_messages_target_app_id_fkey"
  FOREIGN KEY ("target_app_id") REFERENCES public."chatr_os_apps" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."inter_app_messages" ADD CONSTRAINT "inter_app_messages_source_app_id_fkey"
  FOREIGN KEY ("source_app_id") REFERENCES public."chatr_os_apps" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."message_security_scans" ADD CONSTRAINT "message_security_scans_message_id_fkey"
  FOREIGN KEY ("message_id") REFERENCES public."messages" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."service_categories" ADD CONSTRAINT "fk_parent_category"
  FOREIGN KEY ("parent_id") REFERENCES public."service_categories" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."onboarding_progress" ADD CONSTRAINT "onboarding_progress_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."call_summaries" ADD CONSTRAINT "call_summaries_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."channel_members" ADD CONSTRAINT "channel_members_channel_id_fkey"
  FOREIGN KEY ("channel_id") REFERENCES public."channels" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_knowledge_nodes" ADD CONSTRAINT "sys_knowledge_nodes_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."cc_tasks" ADD CONSTRAINT "cc_tasks_plan_id_fkey"
  FOREIGN KEY ("plan_id") REFERENCES public."cc_plans" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."health_wallet_transactions" ADD CONSTRAINT "health_wallet_transactions_wallet_id_fkey"
  FOREIGN KEY ("wallet_id") REFERENCES public."health_wallet" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."network_diagnostics" ADD CONSTRAINT "network_diagnostics_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_wallet_transactions" ADD CONSTRAINT "chatr_wallet_transactions_wallet_id_fkey"
  FOREIGN KEY ("wallet_id") REFERENCES public."chatr_wallet" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."payments" ADD CONSTRAINT "payments_appointment_id_fkey"
  FOREIGN KEY ("appointment_id") REFERENCES public."appointments" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."crm_evidence_ledger" ADD CONSTRAINT "crm_evidence_ledger_lead_id_fkey"
  FOREIGN KEY ("lead_id") REFERENCES public."crm_leads" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."crm_evidence_ledger" ADD CONSTRAINT "crm_evidence_ledger_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES public."business_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."app_versions" ADD CONSTRAINT "app_versions_app_id_fkey"
  FOREIGN KEY ("app_id") REFERENCES public."mini_apps" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."healthcare_db" ADD CONSTRAINT "healthcare_db_verified_by_fkey"
  FOREIGN KEY ("verified_by") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."healthcare_db" ADD CONSTRAINT "healthcare_db_added_by_fkey"
  FOREIGN KEY ("added_by") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."kg_edges" ADD CONSTRAINT "kg_edges_source_node_id_fkey"
  FOREIGN KEY ("source_node_id") REFERENCES public."kg_nodes" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."kg_edges" ADD CONSTRAINT "kg_edges_target_node_id_fkey"
  FOREIGN KEY ("target_node_id") REFERENCES public."kg_nodes" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."connector_webhook_events" ADD CONSTRAINT "connector_webhook_events_connection_id_fkey"
  FOREIGN KEY ("connection_id") REFERENCES public."connector_connections" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."subscription_items" ADD CONSTRAINT "subscription_items_medicine_id_fkey"
  FOREIGN KEY ("medicine_id") REFERENCES public."medicine_catalog" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."subscription_items" ADD CONSTRAINT "subscription_items_subscription_id_fkey"
  FOREIGN KEY ("subscription_id") REFERENCES public."medicine_subscriptions" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."provider_specializations" ADD CONSTRAINT "provider_specializations_specialization_id_fkey"
  FOREIGN KEY ("specialization_id") REFERENCES public."specializations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."session_participants" ADD CONSTRAINT "session_participants_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES public."expert_sessions" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."job_applications" ADD CONSTRAINT "job_applications_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES public."job_listings" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_departments" ADD CONSTRAINT "sys_departments_business_unit_id_fkey"
  FOREIGN KEY ("business_unit_id") REFERENCES public."sys_business_units" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."local_deals" ADD CONSTRAINT "local_deals_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES public."business_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."message_delivery_status" ADD CONSTRAINT "message_delivery_status_recipient_id_fkey"
  FOREIGN KEY ("recipient_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."message_delivery_status" ADD CONSTRAINT "message_delivery_status_message_id_fkey"
  FOREIGN KEY ("message_id") REFERENCES public."messages" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_plus_reviews" ADD CONSTRAINT "chatr_plus_reviews_seller_id_fkey"
  FOREIGN KEY ("seller_id") REFERENCES public."chatr_plus_sellers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_plus_reviews" ADD CONSTRAINT "chatr_plus_reviews_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES public."chatr_plus_bookings" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_plus_reviews" ADD CONSTRAINT "chatr_plus_reviews_service_id_fkey"
  FOREIGN KEY ("service_id") REFERENCES public."chatr_plus_services" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_teams" ADD CONSTRAINT "sys_teams_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."connector_records" ADD CONSTRAINT "connector_records_connection_id_fkey"
  FOREIGN KEY ("connection_id") REFERENCES public."connector_connections" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."deal_redemptions" ADD CONSTRAINT "deal_redemptions_deal_id_fkey"
  FOREIGN KEY ("deal_id") REFERENCES public."local_deals" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."mcp_request_logs" ADD CONSTRAINT "mcp_request_logs_api_key_id_fkey"
  FOREIGN KEY ("api_key_id") REFERENCES public."mcp_api_keys" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."cc_logs" ADD CONSTRAINT "cc_logs_plan_id_fkey"
  FOREIGN KEY ("plan_id") REFERENCES public."cc_plans" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."session_room_participants" ADD CONSTRAINT "session_room_participants_call_id_fkey"
  FOREIGN KEY ("call_id") REFERENCES public."calls" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."session_room_participants" ADD CONSTRAINT "session_room_participants_room_id_fkey"
  FOREIGN KEY ("room_id") REFERENCES public."session_rooms" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."session_room_participants" ADD CONSTRAINT "session_room_participants_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."pinned_messages" ADD CONSTRAINT "pinned_messages_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES public."conversations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."pinned_messages" ADD CONSTRAINT "pinned_messages_message_id_fkey"
  FOREIGN KEY ("message_id") REFERENCES public."messages" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."device_tokens" ADD CONSTRAINT "device_tokens_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."tutor_reviews" ADD CONSTRAINT "tutor_reviews_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES public."tutor_bookings" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."tutor_reviews" ADD CONSTRAINT "tutor_reviews_tutor_id_fkey"
  FOREIGN KEY ("tutor_id") REFERENCES public."tutors" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_accruals" ADD CONSTRAINT "fin_accruals_period_id_fkey"
  FOREIGN KEY ("period_id") REFERENCES public."fin_periods" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_accruals" ADD CONSTRAINT "fin_accruals_expense_account_id_fkey"
  FOREIGN KEY ("expense_account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_accruals" ADD CONSTRAINT "fin_accruals_liability_account_id_fkey"
  FOREIGN KEY ("liability_account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_accruals" ADD CONSTRAINT "fin_accruals_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_accruals" ADD CONSTRAINT "fin_accruals_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_accruals" ADD CONSTRAINT "fin_accruals_reversal_entry_id_fkey"
  FOREIGN KEY ("reversal_entry_id") REFERENCES public."fin_journal_entries" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_accruals" ADD CONSTRAINT "fin_accruals_journal_entry_id_fkey"
  FOREIGN KEY ("journal_entry_id") REFERENCES public."fin_journal_entries" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_accruals" ADD CONSTRAINT "fin_accruals_source_event_id_fkey"
  FOREIGN KEY ("source_event_id") REFERENCES public."fin_events" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."invite_links" ADD CONSTRAINT "invite_links_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."ai_memory_knowledge" ADD CONSTRAINT "ai_memory_knowledge_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."job_saved" ADD CONSTRAINT "job_saved_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES public."job_listings" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_views" ADD CONSTRAINT "sys_views_entity_id_fkey"
  FOREIGN KEY ("entity_id") REFERENCES public."sys_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chronic_vitals" ADD CONSTRAINT "chronic_vitals_family_member_id_fkey"
  FOREIGN KEY ("family_member_id") REFERENCES public."health_family_members" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."health_passport" ADD CONSTRAINT "health_passport_emergency_contact_id_fkey"
  FOREIGN KEY ("emergency_contact_id") REFERENCES public."emergency_contacts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."health_passport" ADD CONSTRAINT "health_passport_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."location_searches" ADD CONSTRAINT "location_searches_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."search_results" ADD CONSTRAINT "search_results_query_id_fkey"
  FOREIGN KEY ("query_id") REFERENCES public."search_queries" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."medicine_reminders" ADD CONSTRAINT "medicine_reminders_family_member_id_fkey"
  FOREIGN KEY ("family_member_id") REFERENCES public."health_family_members" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."medicine_reminders" ADD CONSTRAINT "medicine_reminders_subscription_item_id_fkey"
  FOREIGN KEY ("subscription_item_id") REFERENCES public."subscription_items" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bank_accounts" ADD CONSTRAINT "fin_bank_accounts_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bank_accounts" ADD CONSTRAINT "fin_bank_accounts_gl_account_id_fkey"
  FOREIGN KEY ("gl_account_id") REFERENCES public."fin_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_bank_accounts" ADD CONSTRAINT "fin_bank_accounts_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_campaigns" ADD CONSTRAINT "business_campaigns_profile_id_fkey"
  FOREIGN KEY ("profile_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."user_devices" ADD CONSTRAINT "user_devices_active_call_id_fkey"
  FOREIGN KEY ("active_call_id") REFERENCES public."calls" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."restaurant_details" ADD CONSTRAINT "restaurant_details_vendor_id_fkey"
  FOREIGN KEY ("vendor_id") REFERENCES public."vendors" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."seller_invoices" ADD CONSTRAINT "seller_invoices_withdrawal_request_id_fkey"
  FOREIGN KEY ("withdrawal_request_id") REFERENCES public."seller_withdrawal_requests" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."champion_mission_progress" ADD CONSTRAINT "champion_mission_progress_mission_id_fkey"
  FOREIGN KEY ("mission_id") REFERENCES public."champion_missions" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."workflow_runs" ADD CONSTRAINT "workflow_runs_workflow_id_fkey"
  FOREIGN KEY ("workflow_id") REFERENCES public."business_workflows" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."service_chat_messages" ADD CONSTRAINT "service_chat_messages_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES public."service_bookings" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_fkey"
  FOREIGN KEY ("workspace_id") REFERENCES public."workspaces" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."rec_interviews" ADD CONSTRAINT "rec_interviews_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES public."rec_jobs" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."rec_interviews" ADD CONSTRAINT "rec_interviews_candidate_id_fkey"
  FOREIGN KEY ("candidate_id") REFERENCES public."rec_candidates" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."app_reviews" ADD CONSTRAINT "app_reviews_app_id_fkey"
  FOREIGN KEY ("app_id") REFERENCES public."mini_apps" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sales_activities" ADD CONSTRAINT "sales_activities_deal_id_fkey"
  FOREIGN KEY ("deal_id") REFERENCES public."sales_deals" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sales_activities" ADD CONSTRAINT "sales_activities_lead_id_fkey"
  FOREIGN KEY ("lead_id") REFERENCES public."sales_leads" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_periods" ADD CONSTRAINT "fin_periods_legal_entity_id_fkey"
  FOREIGN KEY ("legal_entity_id") REFERENCES public."fin_legal_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_periods" ADD CONSTRAINT "fin_periods_reopen_approval_id_fkey"
  FOREIGN KEY ("reopen_approval_id") REFERENCES public."workflow_approvals" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."fin_periods" ADD CONSTRAINT "fin_periods_fin_organization_id_fkey"
  FOREIGN KEY ("fin_organization_id") REFERENCES public."fin_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."tutor_bookings" ADD CONSTRAINT "tutor_bookings_tutor_id_fkey"
  FOREIGN KEY ("tutor_id") REFERENCES public."tutors" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."call_participants" ADD CONSTRAINT "call_participants_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."call_participants" ADD CONSTRAINT "call_participants_call_id_fkey"
  FOREIGN KEY ("call_id") REFERENCES public."calls" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."wellness_community_members" ADD CONSTRAINT "wellness_community_members_community_id_fkey"
  FOREIGN KEY ("community_id") REFERENCES public."wellness_communities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."cc_approvals" ADD CONSTRAINT "cc_approvals_plan_id_fkey"
  FOREIGN KEY ("plan_id") REFERENCES public."cc_plans" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."message_forwards" ADD CONSTRAINT "message_forwards_original_message_id_fkey"
  FOREIGN KEY ("original_message_id") REFERENCES public."messages" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."message_forwards" ADD CONSTRAINT "message_forwards_forwarded_message_id_fkey"
  FOREIGN KEY ("forwarded_message_id") REFERENCES public."messages" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."medicine_subscriptions" ADD CONSTRAINT "medicine_subscriptions_family_member_id_fkey"
  FOREIGN KEY ("family_member_id") REFERENCES public."health_family_members" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sys_business_units" ADD CONSTRAINT "sys_business_units_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."chatr_seller_subscription_plans" ADD CONSTRAINT "chatr_seller_subscription_plans_seller_id_fkey"
  FOREIGN KEY ("seller_id") REFERENCES public."chatr_plus_sellers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."cc_leads" ADD CONSTRAINT "cc_leads_plan_id_fkey"
  FOREIGN KEY ("plan_id") REFERENCES public."cc_plans" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sso_tokens" ADD CONSTRAINT "sso_tokens_app_id_fkey"
  FOREIGN KEY ("app_id") REFERENCES public."mini_apps" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."sso_tokens" ADD CONSTRAINT "sso_tokens_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."brand_placements" ADD CONSTRAINT "brand_placements_brand_id_fkey"
  FOREIGN KEY ("brand_id") REFERENCES public."brand_partnerships" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."business_broadcasts" ADD CONSTRAINT "business_broadcasts_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES public."business_profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."workspace_activities" ADD CONSTRAINT "workspace_activities_workspace_id_fkey"
  FOREIGN KEY ("workspace_id") REFERENCES public."workspaces" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."workspace_activities" ADD CONSTRAINT "workspace_activities_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES public."workspace_customers" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."ai_memory_business" ADD CONSTRAINT "ai_memory_business_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES public."sys_organizations" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."ai_memory_business" ADD CONSTRAINT "ai_memory_business_entity_id_fkey"
  FOREIGN KEY ("entity_id") REFERENCES public."sys_entities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."account_followers" ADD CONSTRAINT "account_followers_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES public."official_accounts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."call_telemetry" ADD CONSTRAINT "call_telemetry_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."referral_codes" ADD CONSTRAINT "referral_codes_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."app_usage" ADD CONSTRAINT "app_usage_app_id_fkey"
  FOREIGN KEY ("app_id") REFERENCES public."mini_apps" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."app_usage" ADD CONSTRAINT "app_usage_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."micro_task_assignments" ADD CONSTRAINT "micro_task_assignments_task_id_fkey"
  FOREIGN KEY ("task_id") REFERENCES public."micro_tasks" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."user_reward_redemptions" ADD CONSTRAINT "user_reward_redemptions_reward_id_fkey"
  FOREIGN KEY ("reward_id") REFERENCES public."point_rewards" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."user_reward_redemptions" ADD CONSTRAINT "user_reward_redemptions_transaction_id_fkey"
  FOREIGN KEY ("transaction_id") REFERENCES public."point_transactions" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."app_usage_sessions" ADD CONSTRAINT "app_usage_sessions_app_id_fkey"
  FOREIGN KEY ("app_id") REFERENCES public."mini_apps" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."food_menu_items" ADD CONSTRAINT "food_menu_items_vendor_id_fkey"
  FOREIGN KEY ("vendor_id") REFERENCES public."food_vendors" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."backup_history" ADD CONSTRAINT "backup_history_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."post_likes" ADD CONSTRAINT "post_likes_post_id_fkey"
  FOREIGN KEY ("post_id") REFERENCES public."youth_posts" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."post_likes" ADD CONSTRAINT "post_likes_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES public."profiles" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."app_sessions" ADD CONSTRAINT "app_sessions_app_id_fkey"
  FOREIGN KEY ("app_id") REFERENCES public."chatr_os_apps" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public."community_members" ADD CONSTRAINT "community_members_community_id_fkey"
  FOREIGN KEY ("community_id") REFERENCES public."communities" ("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_table THEN null; END $$;


-- 2. INDEXES
CREATE INDEX idx_fin_policy_org ON public.fin_accounting_policies USING btree (fin_organization_id, policy_type, status, effective_from);
CREATE INDEX idx_contact_label_frequencies_hashed ON public.contact_label_frequencies USING btree (hashed_number);
CREATE INDEX idx_identity_access_user ON public.identity_access_rules USING btree (granted_to_user_id);
CREATE INDEX idx_identity_access_identity ON public.identity_access_rules USING btree (identity_id);
CREATE UNIQUE INDEX circle_members_circle_id_user_id_key ON public.circle_members USING btree (circle_id, user_id);
CREATE UNIQUE INDEX fin_contracts_num_unique ON public.fin_contracts USING btree (fin_organization_id, contract_number);
CREATE INDEX idx_fin_contracts_org ON public.fin_contracts USING btree (fin_organization_id, status, start_date);
CREATE INDEX idx_fin_contracts_cust ON public.fin_contracts USING btree (customer_id, status);
CREATE INDEX idx_conversation_participants_conv ON public.conversation_participants USING btree (conversation_id, user_id);
CREATE INDEX idx_conv_participants_user ON public.conversation_participants USING btree (user_id, conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants USING btree (user_id);
CREATE UNIQUE INDEX conversation_participants_conversation_id_user_id_key ON public.conversation_participants USING btree (conversation_id, user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants USING btree (conversation_id);
CREATE INDEX idx_conversation_participants_user ON public.conversation_participants USING btree (user_id, conversation_id);
CREATE INDEX idx_events_location ON public.community_events_db USING btree (latitude, longitude);
CREATE INDEX idx_events_date ON public.community_events_db USING btree (event_date);
CREATE UNIQUE INDEX story_reactions_story_id_user_id_key ON public.story_reactions USING btree (story_id, user_id);
CREATE INDEX idx_symptom_checks_user_id ON public.symptom_checks USING btree (user_id);
CREATE INDEX idx_symptom_checks_created_at ON public.symptom_checks USING btree (created_at DESC);
CREATE UNIQUE INDEX fin_cn_number_unique ON public.fin_credit_notes USING btree (fin_organization_id, credit_note_number);
CREATE INDEX idx_search_cache_query ON public.search_cache USING btree (query);
CREATE UNIQUE INDEX search_cache_query_key ON public.search_cache USING btree (query);
CREATE INDEX idx_redemptions_user ON public.champion_reward_redemptions USING btree (user_id);
CREATE INDEX idx_scheduled_notifications_pending ON public.scheduled_notifications USING btree (scheduled_at) WHERE (status = 'pending'::text);
CREATE INDEX idx_scheduled_notifications_user ON public.scheduled_notifications USING btree (user_id);
CREATE INDEX idx_fin_invoices_cust ON public.fin_invoices USING btree (customer_id, status);
CREATE UNIQUE INDEX fin_invoices_number_unique ON public.fin_invoices USING btree (fin_organization_id, invoice_number);
CREATE INDEX idx_fin_invoices_org ON public.fin_invoices USING btree (fin_organization_id, status, due_date);
CREATE INDEX idx_user_points_user_id ON public.user_points USING btree (user_id);
CREATE UNIQUE INDEX user_points_user_id_key ON public.user_points USING btree (user_id);
CREATE INDEX idx_caller_reports_phone ON public.caller_reports USING btree (phone_number);
CREATE INDEX idx_caller_reports_reporter ON public.caller_reports USING btree (reporter_id);
CREATE UNIQUE INDEX caller_reports_reporter_id_phone_number_key ON public.caller_reports USING btree (reporter_id, phone_number);
CREATE INDEX idx_seo_attribution_created ON public.seo_attribution USING btree (created_at DESC);
CREATE INDEX idx_seo_attribution_landing ON public.seo_attribution USING btree (landing_path);
CREATE INDEX idx_sys_business_edges_source ON public.sys_business_graph_edges USING btree (source_node_id);
CREATE INDEX idx_sys_business_edges_target ON public.sys_business_graph_edges USING btree (target_node_id);
CREATE UNIQUE INDEX challenge_participants_challenge_id_user_id_key ON public.challenge_participants USING btree (challenge_id, user_id);
CREATE INDEX idx_favorite_results_result_id ON public.favorite_results USING btree (result_id);
CREATE UNIQUE INDEX favorite_results_user_id_result_id_key ON public.favorite_results USING btree (user_id, result_id);
CREATE INDEX idx_favorite_results_user_id ON public.favorite_results USING btree (user_id);
CREATE INDEX idx_point_settlements_provider ON public.point_settlements USING btree (provider_id);
CREATE UNIQUE INDEX secrets_vault_key_name_key ON public.secrets_vault USING btree (key_name);
CREATE INDEX webrtc_signals_to_user_idx ON public.webrtc_signals USING btree (to_user);
CREATE INDEX idx_webrtc_signals_created_at ON public.webrtc_signals USING btree (created_at);
CREATE INDEX webrtc_signals_call_id_idx ON public.webrtc_signals USING btree (call_id);
CREATE INDEX idx_fin_alloc_bill ON public.fin_payment_allocations USING btree (bill_id) WHERE (bill_id IS NOT NULL);
CREATE INDEX idx_fin_alloc_inv ON public.fin_payment_allocations USING btree (invoice_id) WHERE (invoice_id IS NOT NULL);
CREATE INDEX idx_fin_alloc_pmt ON public.fin_payment_allocations USING btree (payment_id);
CREATE INDEX idx_login_streaks_user ON public.chatr_login_streaks USING btree (user_id);
CREATE UNIQUE INDEX chatr_login_streaks_user_id_key ON public.chatr_login_streaks USING btree (user_id);
CREATE INDEX idx_login_streaks_current ON public.chatr_login_streaks USING btree (current_streak DESC);
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences USING btree (user_id);
CREATE UNIQUE INDEX notification_preferences_user_id_key ON public.notification_preferences USING btree (user_id);
CREATE INDEX idx_wallet_user_id ON public.chatr_wallet USING btree (user_id);
CREATE UNIQUE INDEX chatr_wallet_user_id_key ON public.chatr_wallet USING btree (user_id);
CREATE INDEX idx_business_location ON public.local_business_db USING btree (latitude, longitude);
CREATE INDEX idx_business_pincode ON public.local_business_db USING btree (pincode);
CREATE INDEX idx_business_city ON public.local_business_db USING btree (city);
CREATE INDEX idx_kg_nodes_tenant ON public.kg_nodes USING btree (tenant_id, node_type);
CREATE INDEX idx_kg_nodes_metadata ON public.kg_nodes USING gin (metadata);
CREATE INDEX idx_kg_nodes_name ON public.kg_nodes USING gin (to_tsvector('english'::regconfig, name));
CREATE UNIQUE INDEX chatr_api_usage_api_name_date_key ON public.chatr_api_usage USING btree (api_name, date);
CREATE INDEX idx_micro_task_submissions_user ON public.micro_task_submissions USING btree (user_id);
CREATE INDEX idx_micro_task_submissions_status ON public.micro_task_submissions USING btree (status);
CREATE INDEX idx_gsc_opp_quadrant ON public.gsc_opportunities USING btree (quadrant);
CREATE INDEX idx_gsc_opp_score ON public.gsc_opportunities USING btree (opportunity_score DESC);
CREATE INDEX idx_champion_notif_user ON public.champion_notifications USING btree (user_id, created_at DESC);
CREATE UNIQUE INDEX chatr_coin_rewards_action_type_key ON public.chatr_coin_rewards USING btree (action_type);
CREATE UNIQUE INDEX provider_availability_provider_id_date_key ON public.provider_availability USING btree (provider_id, date);
CREATE UNIQUE INDEX unique_lead_dossier ON public.crm_lead_dossiers USING btree (lead_id);
CREATE INDEX idx_sys_event_store_aggregate ON public.sys_event_store USING btree (aggregate_id, aggregate_type);
CREATE UNIQUE INDEX contacts_hash_phone_hash_key ON public.contacts_hash USING btree (phone_hash);
CREATE INDEX idx_contacts_hash_frequency ON public.contacts_hash USING btree (frequency DESC);
CREATE INDEX idx_communities_created_by ON public.communities USING btree (created_by);
CREATE INDEX idx_communities_category ON public.communities USING btree (category);
CREATE UNIQUE INDEX profile_music_user_id_key ON public.profile_music USING btree (user_id);
CREATE INDEX idx_fin_pay_org ON public.finance_payroll USING btree (org_id);
CREATE UNIQUE INDEX uq_referral_rewards_pair ON public.referral_rewards USING btree (referrer_id, referred_user_id);
CREATE UNIQUE INDEX referral_rewards_referrer_id_referred_user_id_key ON public.referral_rewards USING btree (referrer_id, referred_user_id);
CREATE INDEX idx_referral_rewards_referrer ON public.referral_rewards USING btree (referrer_id);
CREATE INDEX idx_referral_rewards_referred ON public.referral_rewards USING btree (referred_user_id);
CREATE UNIQUE INDEX announcement_reads_announcement_id_user_id_key ON public.announcement_reads USING btree (announcement_id, user_id);
CREATE UNIQUE INDEX chatr_user_badges_user_id_badge_id_key ON public.chatr_user_badges USING btree (user_id, badge_id);
CREATE INDEX idx_user_subscriptions_user_id ON public.chatr_user_subscriptions USING btree (user_id);
CREATE UNIQUE INDEX chatr_user_subscriptions_user_id_key ON public.chatr_user_subscriptions USING btree (user_id);
CREATE INDEX idx_community_post_reactions_post ON public.community_post_reactions USING btree (post_id);
CREATE UNIQUE INDEX community_post_reactions_post_id_user_id_reaction_type_key ON public.community_post_reactions USING btree (post_id, user_id, reaction_type);
CREATE UNIQUE INDEX chatr_plus_wallet_user_id_key ON public.chatr_plus_wallet USING btree (user_id);
CREATE INDEX idx_appointments_provider ON public.appointments USING btree (provider_id);
CREATE INDEX idx_appointments_patient ON public.appointments USING btree (patient_id);
CREATE INDEX idx_appointments_date ON public.appointments USING btree (appointment_date);
CREATE INDEX idx_community_posts_author ON public.community_posts USING btree (author_id);
CREATE INDEX idx_community_posts_community ON public.community_posts USING btree (community_id, is_pinned DESC, created_at DESC);
CREATE INDEX idx_automation_rules_is_active ON public.automation_rules USING btree (is_active);
CREATE INDEX idx_automation_rules_user_id ON public.automation_rules USING btree (user_id);
CREATE INDEX idx_user_interactions_user_id ON public.user_search_interactions USING btree (user_id);
CREATE INDEX idx_job_listings_posted_by ON public.job_listings USING btree (posted_by);
CREATE INDEX idx_job_listings_active ON public.job_listings USING btree (is_active, created_at DESC);
CREATE UNIQUE INDEX chatr_coin_balances_user_id_key ON public.chatr_coin_balances USING btree (user_id);
CREATE INDEX idx_coin_balances_user ON public.chatr_coin_balances USING btree (user_id);
CREATE INDEX idx_typing_indicators_conversation ON public.typing_indicators USING btree (conversation_id, user_id);
CREATE UNIQUE INDEX user_stealth_modes_user_id_key ON public.user_stealth_modes USING btree (user_id);
CREATE UNIQUE INDEX audio_room_participants_room_id_user_id_left_at_key ON public.audio_room_participants USING btree (room_id, user_id, left_at);
CREATE INDEX idx_os_events_source ON public.os_events USING btree (source_subsystem);
CREATE INDEX idx_os_events_type ON public.os_events USING btree (event_type);
CREATE INDEX idx_os_events_timestamp ON public.os_events USING btree ("timestamp");
CREATE INDEX idx_rec_candidates_user ON public.rec_candidates USING btree (user_id);
CREATE INDEX idx_rec_cands_user ON public.rec_candidates USING btree (user_id);
CREATE INDEX idx_rec_cands_job ON public.rec_candidates USING btree (job_id, stage);
CREATE INDEX idx_rec_candidates_job_stage ON public.rec_candidates USING btree (job_id, stage);
CREATE UNIQUE INDEX call_context_cache_user_id_caller_number_key ON public.call_context_cache USING btree (user_id, caller_number);
CREATE INDEX idx_call_context_cache_expiry ON public.call_context_cache USING btree (expires_at);
CREATE INDEX idx_call_context_cache_lookup ON public.call_context_cache USING btree (user_id, caller_number);
CREATE INDEX idx_user_streaks_user_id ON public.user_streaks USING btree (user_id);
CREATE UNIQUE INDEX user_streaks_user_id_key ON public.user_streaks USING btree (user_id);
CREATE INDEX idx_streaks_user ON public.health_streaks USING btree (user_id);
CREATE UNIQUE INDEX health_streaks_user_id_family_member_id_streak_type_key ON public.health_streaks USING btree (user_id, family_member_id, streak_type);
CREATE UNIQUE INDEX conversation_notes_conversation_id_key ON public.conversation_notes USING btree (conversation_id);
CREATE INDEX idx_workflow_approvals_status ON public.workflow_approvals USING btree (status);
CREATE INDEX idx_workflow_approvals_run_id ON public.workflow_approvals USING btree (run_id);
CREATE INDEX idx_offerings_business ON public.business_offerings USING btree (business_id);
CREATE INDEX idx_event_outbox_status ON public.event_outbox USING btree (status);
CREATE INDEX idx_search_alerts_saved_search ON public.search_alerts USING btree (saved_search_id);
CREATE INDEX idx_search_alerts_user_id ON public.search_alerts USING btree (user_id);
CREATE INDEX idx_messages_encrypted ON public.messages USING btree (is_encrypted) WHERE (is_encrypted = true);
CREATE INDEX idx_messages_conversation_created ON public.messages USING btree (conversation_id, created_at DESC);
CREATE INDEX idx_messages_scheduled ON public.messages USING btree (scheduled_for) WHERE (scheduled_for IS NOT NULL);
CREATE INDEX idx_messages_unread ON public.messages USING btree (conversation_id, sender_id, read_at) WHERE (read_at IS NULL);
CREATE INDEX idx_messages_reactions ON public.messages USING gin (reactions);
CREATE INDEX idx_messages_media_attachments ON public.messages USING gin (media_attachments);
CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id, created_at DESC);
CREATE INDEX idx_messages_expires_at ON public.messages USING btree (expires_at) WHERE ((expires_at IS NOT NULL) AND (is_expired = false));
CREATE INDEX idx_chatr_os_apps_lifecycle_state ON public.chatr_os_apps USING btree (lifecycle_state);
CREATE INDEX idx_chatr_os_apps_package_name ON public.chatr_os_apps USING btree (package_name);
CREATE INDEX idx_chatr_os_apps_user_id ON public.chatr_os_apps USING btree (user_id);
CREATE UNIQUE INDEX chatr_os_apps_user_id_package_name_key ON public.chatr_os_apps USING btree (user_id, package_name);
CREATE INDEX idx_ai_agents_user_id ON public.ai_agents USING btree (user_id);
CREATE INDEX idx_fcm_delivery_logs_created_at ON public.fcm_delivery_logs USING btree (created_at DESC);
CREATE INDEX idx_fcm_delivery_logs_call_id ON public.fcm_delivery_logs USING btree (call_id);
CREATE INDEX auth_exchange_attempts_phone_time_idx ON public.auth_exchange_attempts USING btree (phone_key, created_at DESC);
CREATE INDEX idx_search_metrics_date ON public.search_performance_metrics USING btree (date DESC);
CREATE UNIQUE INDEX search_performance_metrics_search_type_source_date_key ON public.search_performance_metrics USING btree (search_type, source, date);
CREATE UNIQUE INDEX user_fame_achievements_user_id_achievement_id_key ON public.user_fame_achievements USING btree (user_id, achievement_id);
CREATE INDEX idx_growth_events_type_time ON public.growth_events USING btree (event_type, occurred_at DESC);
CREATE INDEX idx_growth_events_user ON public.growth_events USING btree (user_id);
CREATE INDEX idx_growth_events_anon ON public.growth_events USING btree (anonymous_id);
CREATE INDEX idx_growth_events_referral ON public.growth_events USING btree (referral_code);
CREATE INDEX idx_growth_events_category ON public.growth_events USING btree (category);
CREATE INDEX idx_rec_jobs_user ON public.rec_jobs USING btree (user_id, status);
CREATE INDEX idx_rec_jobs_user_status ON public.rec_jobs USING btree (user_id, status);
CREATE INDEX idx_workflow_versions_checksum ON public.workflow_versions USING btree (graph_checksum);
CREATE INDEX idx_workflow_versions_workflow_id ON public.workflow_versions USING btree (workflow_id);
CREATE UNIQUE INDEX workflow_versions_workflow_id_version_key ON public.workflow_versions USING btree (workflow_id, version);
CREATE UNIQUE INDEX user_installed_apps_user_id_app_id_key ON public.user_installed_apps USING btree (user_id, app_id);
CREATE INDEX idx_prescriptions_user ON public.prescription_uploads USING btree (user_id);
CREATE UNIQUE INDEX organizations_domain_key ON public.organizations USING btree (domain);
CREATE INDEX idx_scheduled_messages_scheduled_for ON public.scheduled_messages USING btree (scheduled_for) WHERE (status = 'pending'::text);
CREATE INDEX idx_business_workflows_profile_id ON public.business_workflows USING btree (profile_id);
CREATE INDEX idx_business_workflows_graph_schema ON public.business_workflows USING btree (((graph ->> 'schemaVersion'::text)));
CREATE INDEX idx_cc_outreach_status ON public.cc_outreach USING btree (status);
CREATE INDEX idx_cc_outreach_lead ON public.cc_outreach USING btree (lead_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (entity_type, entity_id);
CREATE INDEX idx_audit_logs_correlation_id ON public.audit_logs USING btree (correlation_id);
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs USING btree (actor_id);
CREATE INDEX idx_fin_events_pend ON public.fin_events USING btree (processing_status, created_at) WHERE (processing_status = ANY (ARRAY['PENDING'::text, 'FAILED'::text]));
CREATE UNIQUE INDEX fin_events_idempotency_unique ON public.fin_events USING btree (idempotency_key);
CREATE INDEX idx_fin_events_org ON public.fin_events USING btree (fin_organization_id, event_type, processing_status);
CREATE INDEX idx_fin_events_src ON public.fin_events USING btree (source_system, source_object_type, source_object_id);
CREATE INDEX idx_fin_events_corr ON public.fin_events USING btree (correlation_id) WHERE (correlation_id IS NOT NULL);
CREATE INDEX idx_offers_pincode ON public.local_offers_db USING btree (pincode);
CREATE INDEX idx_offers_location ON public.local_offers_db USING btree (latitude, longitude);
CREATE INDEX idx_offers_city ON public.local_offers_db USING btree (city);
CREATE INDEX idx_workspaces_owner ON public.workspaces USING btree (owner_id);
CREATE INDEX idx_health_goals_user_status ON public.health_goals USING btree (user_id, status);
CREATE INDEX idx_service_bookings_customer ON public.service_bookings USING btree (customer_id);
CREATE INDEX idx_service_bookings_provider ON public.service_bookings USING btree (provider_id);
CREATE INDEX idx_service_bookings_status ON public.service_bookings USING btree (status);
CREATE UNIQUE INDEX service_bookings_booking_number_key ON public.service_bookings USING btree (booking_number);
CREATE INDEX idx_oap_published ON public.official_account_posts USING btree (is_published, created_at DESC);
CREATE INDEX idx_oap_account ON public.official_account_posts USING btree (account_id);
CREATE INDEX idx_nutrition_logs_user_date ON public.nutrition_logs USING btree (user_id, log_date);
CREATE INDEX idx_gmail_contacts_email ON public.gmail_imported_contacts USING btree (email);
CREATE UNIQUE INDEX gmail_imported_contacts_user_id_email_key ON public.gmail_imported_contacts USING btree (user_id, email);
CREATE INDEX idx_gmail_contacts_phone ON public.gmail_imported_contacts USING btree (phone);
CREATE INDEX idx_gmail_contacts_user ON public.gmail_imported_contacts USING btree (user_id);
CREATE UNIQUE INDEX gmail_imported_contacts_user_id_phone_key ON public.gmail_imported_contacts USING btree (user_id, phone);
CREATE INDEX idx_blocked_contacts_blocked_user_id ON public.blocked_contacts USING btree (blocked_user_id);
CREATE INDEX idx_blocked_contacts_user_id ON public.blocked_contacts USING btree (user_id);
CREATE UNIQUE INDEX blocked_contacts_user_id_blocked_user_id_key ON public.blocked_contacts USING btree (user_id, blocked_user_id);
CREATE INDEX idx_sys_org_members_org ON public.sys_org_members USING btree (org_id);
CREATE INDEX idx_sys_org_members_user ON public.sys_org_members USING btree (user_id);
CREATE UNIQUE INDEX sys_org_members_org_id_user_id_key ON public.sys_org_members USING btree (org_id, user_id);
CREATE INDEX idx_crm_pipelines_business_id ON public.crm_pipelines USING btree (business_id);
CREATE INDEX idx_med_interactions ON public.medication_interactions USING btree (medication_1, medication_2);
CREATE UNIQUE INDEX game_user_achievements_user_id_achievement_id_key ON public.game_user_achievements USING btree (user_id, achievement_id);
CREATE INDEX idx_cce_sessions_session_id ON public.cce_sessions USING btree (session_id);
CREATE UNIQUE INDEX cce_sessions_session_id_key ON public.cce_sessions USING btree (session_id);
CREATE INDEX idx_cce_sessions_initiator ON public.cce_sessions USING btree (initiator_id);
CREATE INDEX idx_fin_vendors_org ON public.fin_vendors USING btree (fin_organization_id, is_active);
CREATE UNIQUE INDEX fin_vendors_code_unique ON public.fin_vendors USING btree (fin_organization_id, vendor_code);
CREATE UNIQUE INDEX user_roles_user_id_role_key ON public.user_roles USING btree (user_id, role);
CREATE INDEX idx_referral_network_root ON public.chatr_referral_network USING btree (root_user_id);
CREATE INDEX idx_referral_network_level ON public.chatr_referral_network USING btree (level);
CREATE INDEX idx_referral_network_user ON public.chatr_referral_network USING btree (user_id);
CREATE INDEX idx_crm_leads_status ON public.crm_leads USING btree (status);
CREATE INDEX idx_crm_leads_assigned_to ON public.crm_leads USING btree (assigned_to);
CREATE INDEX idx_crm_leads_customer_id ON public.crm_leads USING btree (customer_id);
CREATE INDEX idx_crm_leads_business_id ON public.crm_leads USING btree (business_id);
CREATE INDEX idx_voice_transcriptions_message ON public.voice_transcriptions USING btree (message_id);
CREATE UNIQUE INDEX seller_mode_settings_user_id_key ON public.seller_mode_settings USING btree (user_id);
CREATE INDEX idx_geofence_events_geofence ON public.geofence_events USING btree (geofence_id, "timestamp" DESC);
CREATE INDEX idx_geofence_events_user ON public.geofence_events USING btree (user_id, "timestamp" DESC);
CREATE INDEX idx_vaccination_records_user_id ON public.vaccination_records USING btree (user_id);
CREATE INDEX idx_qr_payments_status ON public.qr_payments USING btree (status);
CREATE INDEX idx_qr_payments_receiver ON public.qr_payments USING btree (receiver_id);
CREATE INDEX idx_qr_payments_payer ON public.qr_payments USING btree (payer_id);
CREATE UNIQUE INDEX deal_merchant_details_vendor_id_key ON public.deal_merchant_details USING btree (vendor_id);
CREATE INDEX idx_seller_kyc_seller_id ON public.seller_kyc_documents USING btree (seller_id);
CREATE UNIQUE INDEX business_profiles_user_id_key ON public.business_profiles USING btree (user_id);
CREATE INDEX idx_network_metrics_call ON public.network_metrics USING btree (call_id);
CREATE INDEX idx_network_metrics_user ON public.network_metrics USING btree (user_id);
CREATE INDEX idx_profiles_language ON public.profiles USING btree (preferred_language);
CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);
CREATE UNIQUE INDEX profiles_phone_number_real_unique ON public.profiles USING btree (phone_number) WHERE (phone_number <> '+000000000000'::text);
CREATE INDEX idx_profiles_phone_search ON public.profiles USING btree (phone_search);
CREATE INDEX idx_profiles_phone_number ON public.profiles USING btree (phone_number);
CREATE INDEX idx_profiles_location_updated ON public.profiles USING btree (location_updated_at);
CREATE UNIQUE INDEX profiles_qr_code_token_key ON public.profiles USING btree (qr_code_token);
CREATE UNIQUE INDEX profiles_referral_code_key ON public.profiles USING btree (referral_code);
CREATE INDEX idx_profiles_qr_token ON public.profiles USING btree (qr_code_token);
CREATE INDEX idx_profiles_referral_code ON public.profiles USING btree (referral_code);
CREATE UNIQUE INDEX profiles_google_id_key ON public.profiles USING btree (google_id);
CREATE INDEX idx_profiles_google_id ON public.profiles USING btree (google_id);
CREATE INDEX idx_profiles_phone_hash ON public.profiles USING btree (phone_hash);
CREATE INDEX idx_profiles_username ON public.profiles USING btree (username);
CREATE UNIQUE INDEX profiles_primary_handle_key ON public.profiles USING btree (primary_handle);
CREATE INDEX idx_profiles_handle ON public.profiles USING btree (primary_handle) WHERE (primary_handle IS NOT NULL);
CREATE INDEX idx_profiles_firebase_uid ON public.profiles USING btree (firebase_uid);
CREATE INDEX idx_profiles_online ON public.profiles USING btree (is_online) WHERE (is_online = true);
CREATE UNIQUE INDEX last_locations_session_id_key ON public.last_locations USING btree (session_id);
CREATE UNIQUE INDEX last_locations_user_id_key ON public.last_locations USING btree (user_id);
CREATE INDEX idx_last_locations_user_id ON public.last_locations USING btree (user_id);
CREATE INDEX idx_last_locations_session_id ON public.last_locations USING btree (session_id);
CREATE INDEX idx_trending_searches_count ON public.trending_searches USING btree (search_count DESC);
CREATE UNIQUE INDEX trending_searches_query_key ON public.trending_searches USING btree (query);
CREATE INDEX idx_point_expirations_expires_at ON public.point_expirations USING btree (expires_at);
CREATE INDEX idx_point_expirations_user_id ON public.point_expirations USING btree (user_id);
CREATE INDEX idx_user_rewards_user ON public.user_rewards USING btree (user_id);
CREATE UNIQUE INDEX champion_tier_rewards_tier_key ON public.champion_tier_rewards USING btree (tier);
CREATE INDEX idx_contact_intelligence_user ON public.contact_intelligence USING btree (user_id);
CREATE INDEX idx_contact_intel_pickup ON public.contact_intelligence USING btree (pickup_likelihood DESC);
CREATE INDEX idx_legal_contracts_org ON public.legal_contracts USING btree (org_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_legal_contracts_status ON public.legal_contracts USING btree (status) WHERE (deleted_at IS NULL);
CREATE UNIQUE INDEX fin_prepaid_unique ON public.fin_prepaids USING btree (fin_organization_id, prepaid_number);
CREATE UNIQUE INDEX user_badges_user_type_uniq ON public.user_badges USING btree (user_id, badge_type);
CREATE INDEX idx_user_badges_user ON public.user_badges USING btree (user_id);
CREATE UNIQUE INDEX uq_referrals_referred_user ON public.referrals USING btree (referred_id);
CREATE UNIQUE INDEX referrals_referrer_id_referred_id_key ON public.referrals USING btree (referrer_id, referred_id);
CREATE INDEX idx_referrals_referrer_id ON public.referrals USING btree (referrer_id);
CREATE UNIQUE INDEX uq_referrals_pair ON public.referrals USING btree (referrer_id, referred_id);
CREATE INDEX idx_workflow_checkpoints_instance ON public.workflow_checkpoints USING btree (instance_id);
CREATE UNIQUE INDEX e2e_identity_keys_user_id_key ON public.e2e_identity_keys USING btree (user_id);
CREATE INDEX idx_bos_created ON public.bos_records USING btree (tenant_id, created_at DESC);
CREATE INDEX idx_bos_data_gin ON public.bos_records USING gin (data);
CREATE INDEX idx_bos_status ON public.bos_records USING btree (tenant_id, capability_id, object_name, current_status) WHERE (deleted_at IS NULL);
CREATE INDEX idx_bos_capability ON public.bos_records USING btree (tenant_id, capability_id, object_name) WHERE (deleted_at IS NULL);
CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions USING btree (user_id);
CREATE UNIQUE INDEX push_subscriptions_user_id_endpoint_key ON public.push_subscriptions USING btree (user_id, endpoint);
CREATE UNIQUE INDEX fin_invoice_lines_unique ON public.fin_invoice_lines USING btree (invoice_id, line_number);
CREATE INDEX idx_fin_inv_lines_inv ON public.fin_invoice_lines USING btree (invoice_id);
CREATE INDEX idx_call_recordings_call ON public.call_recordings USING btree (call_id);
CREATE INDEX idx_click_logs_search_id ON public.click_logs USING btree (search_id);
CREATE INDEX idx_click_logs_result_url ON public.click_logs USING btree (result_url);
CREATE INDEX idx_seo_gsc_sync_started ON public.seo_gsc_sync USING btree (started_at DESC);
CREATE INDEX idx_shares_type ON public.chatr_shares USING btree (share_type);
CREATE INDEX idx_shares_code ON public.chatr_shares USING btree (referral_code);
CREATE INDEX idx_shares_user ON public.chatr_shares USING btree (user_id);
CREATE UNIQUE INDEX specializations_name_key ON public.specializations USING btree (name);
CREATE INDEX idx_micro_task_fraud_flags_user ON public.micro_task_fraud_flags USING btree (user_id);
CREATE INDEX idx_fin_fx ON public.fin_fx_rates USING btree (fin_organization_id, from_currency, to_currency, rate_type, effective_date DESC);
CREATE UNIQUE INDEX fin_fx_unique ON public.fin_fx_rates USING btree (fin_organization_id, from_currency, to_currency, rate_type, effective_date);
CREATE INDEX idx_fin_bills_vendor ON public.fin_bills USING btree (vendor_id, status);
CREATE UNIQUE INDEX fin_bills_number_unique ON public.fin_bills USING btree (fin_organization_id, vendor_id, bill_number);
CREATE INDEX idx_fin_bills_org ON public.fin_bills USING btree (fin_organization_id, status, due_date);
CREATE INDEX idx_fin_bills_hash ON public.fin_bills USING btree (fin_organization_id, duplicate_hash);
CREATE INDEX idx_execution_queue_capability ON public.execution_queue USING btree (capability);
CREATE INDEX idx_execution_queue_created_by ON public.execution_queue USING btree (created_by);
CREATE INDEX idx_execution_queue_status_scheduled ON public.execution_queue USING btree (status, scheduled_at) WHERE (status = 'pending'::text);
CREATE INDEX idx_provider_consents_active ON public.provider_access_consents USING btree (is_active, expires_at) WHERE (is_active = true);
CREATE INDEX idx_provider_consents_provider ON public.provider_access_consents USING btree (provider_id);
CREATE INDEX idx_provider_consents_patient ON public.provider_access_consents USING btree (patient_id);
CREATE UNIQUE INDEX provider_access_consents_patient_id_provider_id_key ON public.provider_access_consents USING btree (patient_id, provider_id);
CREATE INDEX idx_fin_bank_stmt_acc ON public.fin_bank_statements USING btree (bank_account_id, start_date DESC);
CREATE INDEX idx_coin_payments_merchant ON public.coin_payments USING btree (merchant_id);
CREATE INDEX idx_coin_payments_user ON public.coin_payments USING btree (user_id);
CREATE INDEX idx_connection_requests_status ON public.connection_requests USING btree (status);
CREATE INDEX idx_connection_requests_receiver ON public.connection_requests USING btree (receiver_id);
CREATE INDEX idx_connection_requests_sender ON public.connection_requests USING btree (sender_id);
CREATE UNIQUE INDEX connection_requests_sender_id_receiver_id_key ON public.connection_requests USING btree (sender_id, receiver_id);
CREATE INDEX idx_fin_pob_contract ON public.fin_performance_obligations USING btree (contract_id);
CREATE UNIQUE INDEX fin_pob_unique ON public.fin_performance_obligations USING btree (contract_id, obligation_number);
CREATE UNIQUE INDEX fin_bill_lines_unique ON public.fin_bill_lines USING btree (bill_id, line_number);
CREATE INDEX idx_fin_bill_lines_bill ON public.fin_bill_lines USING btree (bill_id);
CREATE INDEX idx_fin_jl_acc ON public.fin_journal_lines USING btree (account_id);
CREATE UNIQUE INDEX fin_jl_line_unique ON public.fin_journal_lines USING btree (journal_entry_id, line_number);
CREATE INDEX idx_fin_jl_entry ON public.fin_journal_lines USING btree (journal_entry_id);
CREATE INDEX idx_fin_jl_dept ON public.fin_journal_lines USING btree (department_id) WHERE (department_id IS NOT NULL);
CREATE UNIQUE INDEX champion_missions_code_key ON public.champion_missions USING btree (code);
CREATE INDEX idx_fin_acc_parent ON public.fin_accounts USING btree (parent_account_id) WHERE (parent_account_id IS NOT NULL);
CREATE UNIQUE INDEX fin_acc_code_unique ON public.fin_accounts USING btree (fin_organization_id, legal_entity_id, code);
CREATE INDEX idx_fin_acc_type ON public.fin_accounts USING btree (fin_organization_id, account_type, is_active);
CREATE INDEX idx_fin_acc_code ON public.fin_accounts USING btree (fin_organization_id, code);
CREATE UNIQUE INDEX map_hunt_progress_user_id_key ON public.map_hunt_progress USING btree (user_id);
CREATE INDEX idx_mobile_action_queue_candidate ON public.mobile_action_queue USING btree (candidate_id, created_at DESC) WHERE (candidate_id IS NOT NULL);
CREATE INDEX idx_mobile_action_queue_user_status ON public.mobile_action_queue USING btree (user_id, status, scheduled_for);
CREATE INDEX idx_mobile_action_queue_correlation ON public.mobile_action_queue USING btree (correlation_id) WHERE (correlation_id IS NOT NULL);
CREATE INDEX idx_sys_ws_org ON public.sys_workspaces USING btree (org_id);
CREATE INDEX idx_alerts_caregiver ON public.caregiver_alerts USING btree (caregiver_user_id);
CREATE UNIQUE INDEX game_user_profiles_user_id_key ON public.game_user_profiles USING btree (user_id);
CREATE INDEX idx_ufe_module ON public.user_feature_engagement USING btree (module);
CREATE INDEX idx_ufe_user ON public.user_feature_engagement USING btree (user_id);
CREATE UNIQUE INDEX user_feature_engagement_user_id_feature_key_key ON public.user_feature_engagement USING btree (user_id, feature_key);
CREATE INDEX idx_search_logs_created_at ON public.search_logs USING btree (created_at DESC);
CREATE INDEX idx_search_logs_user_id ON public.search_logs USING btree (user_id);
CREATE INDEX idx_search_logs_session_id ON public.search_logs USING btree (session_id);
CREATE INDEX idx_earning_events_user_occurred_at ON public.earning_events USING btree (user_id, occurred_at DESC);
CREATE INDEX idx_earning_events_status ON public.earning_events USING btree (status);
CREATE UNIQUE INDEX uq_earning_events_source ON public.earning_events USING btree (user_id, event_type, source_table, source_id) WHERE ((source_table IS NOT NULL) AND (source_id IS NOT NULL));
CREATE UNIQUE INDEX platform_events_stream_id_version_key ON public.platform_events USING btree (stream_id, version);
CREATE INDEX idx_platform_events_type ON public.platform_events USING btree (type);
CREATE INDEX idx_platform_events_stream ON public.platform_events USING btree (stream_id);
CREATE UNIQUE INDEX enterprise_users_organization_id_id_key ON public.enterprise_users USING btree (organization_id, id);
CREATE INDEX idx_workspace_customers_ws ON public.workspace_customers USING btree (workspace_id);
CREATE UNIQUE INDEX workspace_customers_workspace_id_profile_id_key ON public.workspace_customers USING btree (workspace_id, profile_id);
CREATE UNIQUE INDEX fin_payments_number_unique ON public.fin_payments USING btree (fin_organization_id, payment_number);
CREATE INDEX idx_fin_payments_vend ON public.fin_payments USING btree (vendor_id) WHERE (vendor_id IS NOT NULL);
CREATE INDEX idx_fin_payments_cust ON public.fin_payments USING btree (customer_id) WHERE (customer_id IS NOT NULL);
CREATE INDEX idx_fin_payments_org ON public.fin_payments USING btree (fin_organization_id, payment_type, payment_date DESC);
CREATE INDEX idx_provider_services_category ON public.provider_services USING btree (category_id);
CREATE INDEX idx_provider_services_provider ON public.provider_services USING btree (provider_id);
CREATE INDEX idx_food_orders_status ON public.food_orders USING btree (status);
CREATE INDEX idx_food_orders_user ON public.food_orders USING btree (user_id);
CREATE INDEX idx_call_transcriptions_call_id ON public.call_transcriptions USING btree (call_id);
CREATE INDEX idx_call_transcriptions_timestamp ON public.call_transcriptions USING btree ("timestamp");
CREATE INDEX idx_call_memories_user ON public.call_memories USING btree (user_id);
CREATE INDEX idx_call_memories_peer ON public.call_memories USING btree (peer_id);
CREATE INDEX idx_call_memories_type ON public.call_memories USING btree (memory_type);
CREATE INDEX idx_call_memories_call ON public.call_memories USING btree (call_id);
CREATE INDEX idx_platform_fees_seller_id ON public.chatr_platform_fees USING btree (seller_id);
CREATE UNIQUE INDEX user_ai_keys_user_id_provider_key ON public.user_ai_keys USING btree (user_id, provider);
CREATE UNIQUE INDEX medical_id_user_id_key ON public.medical_id USING btree (user_id);
CREATE UNIQUE INDEX link_previews_url_key ON public.link_previews USING btree (url);
CREATE INDEX idx_link_previews_url ON public.link_previews USING btree (url);
CREATE UNIQUE INDEX user_preferences_user_id_key ON public.user_preferences USING btree (user_id);
CREATE UNIQUE INDEX micro_task_admins_user_id_key ON public.micro_task_admins USING btree (user_id);
CREATE INDEX idx_growth_assets_org_campaign ON public.growth_assets USING btree (org_id, campaign_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_growth_assets_type ON public.growth_assets USING btree (type) WHERE (deleted_at IS NULL);
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions USING btree (created_at DESC);
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions USING btree (status);
CREATE UNIQUE INDEX fin_customers_code_unique ON public.fin_customers USING btree (fin_organization_id, customer_code);
CREATE INDEX idx_fin_customers_org ON public.fin_customers USING btree (fin_organization_id, is_active);
CREATE UNIQUE INDEX leaderboard_cache_user_id_key ON public.leaderboard_cache USING btree (user_id);
CREATE INDEX idx_location_history_user ON public.location_search_history USING btree (user_id);
CREATE INDEX idx_location_history_coords ON public.location_search_history USING btree (latitude, longitude);
CREATE UNIQUE INDEX location_search_history_user_id_location_name_key ON public.location_search_history USING btree (user_id, location_name);
CREATE INDEX idx_business_team_members_user_id ON public.business_team_members USING btree (user_id);
CREATE UNIQUE INDEX business_team_members_business_id_user_id_key ON public.business_team_members USING btree (business_id, user_id);
CREATE INDEX idx_business_team_members_business_id ON public.business_team_members USING btree (business_id);
CREATE INDEX idx_mcp_api_keys_prefix ON public.mcp_api_keys USING btree (api_key_prefix) WHERE (is_active = true);
CREATE INDEX idx_dhandha_customers_phone ON public.dhandha_customers USING btree (merchant_id, phone);
CREATE INDEX idx_dhandha_customers_merchant ON public.dhandha_customers USING btree (merchant_id);
CREATE INDEX idx_service_reviews_provider ON public.service_reviews USING btree (provider_id);
CREATE UNIQUE INDEX game_levels_game_type_level_number_key ON public.game_levels USING btree (game_type, level_number);
CREATE INDEX idx_connector_connections_user ON public.connector_connections USING btree (user_id, connector_id);
CREATE UNIQUE INDEX connector_connections_user_id_connector_id_account_label_key ON public.connector_connections USING btree (user_id, connector_id, account_label);
CREATE UNIQUE INDEX cc_revenue_metrics_metric_date_key ON public.cc_revenue_metrics USING btree (metric_date);
CREATE INDEX idx_fin_le_org ON public.fin_legal_entities USING btree (fin_organization_id, is_active);
CREATE INDEX idx_fin_le_parent ON public.fin_legal_entities USING btree (parent_entity_id) WHERE (parent_entity_id IS NOT NULL);
CREATE UNIQUE INDEX fin_le_code_unique ON public.fin_legal_entities USING btree (fin_organization_id, entity_code);
CREATE UNIQUE INDEX chatr_referral_codes_code_key ON public.chatr_referral_codes USING btree (code);
CREATE INDEX idx_referral_codes_user ON public.chatr_referral_codes USING btree (user_id);
CREATE UNIQUE INDEX chatr_referral_codes_user_id_key ON public.chatr_referral_codes USING btree (user_id);
CREATE INDEX idx_referral_codes_code ON public.chatr_referral_codes USING btree (code);
CREATE INDEX idx_medications_user ON public.medications USING btree (user_id, is_active, start_date DESC);
CREATE UNIQUE INDEX room_participants_room_id_user_id_key ON public.room_participants USING btree (room_id, user_id);
CREATE INDEX idx_statuses_expires ON public.statuses USING btree (expires_at) WHERE (is_active = true);
CREATE INDEX idx_statuses_user ON public.statuses USING btree (user_id);
CREATE INDEX idx_community_post_comments_post ON public.community_post_comments USING btree (post_id, created_at);
CREATE INDEX idx_referrals_code ON public.chatr_referrals USING btree (referral_code);
CREATE INDEX idx_referrals_referred ON public.chatr_referrals USING btree (referred_user_id);
CREATE INDEX idx_referrals_referrer ON public.chatr_referrals USING btree (referrer_id);
CREATE UNIQUE INDEX chatr_referrals_referred_user_id_key ON public.chatr_referrals USING btree (referred_user_id);
CREATE INDEX idx_referrals_status ON public.chatr_referrals USING btree (status);
CREATE INDEX idx_installed_plugins_user ON public.user_installed_plugins USING btree (user_id);
CREATE UNIQUE INDEX user_installed_plugins_user_id_app_id_key ON public.user_installed_plugins USING btree (user_id, app_id);
CREATE UNIQUE INDEX seo_pages_domain_path_key ON public.seo_pages USING btree (domain, path);
CREATE UNIQUE INDEX search_filter_preferences_user_id_key ON public.search_filter_preferences USING btree (user_id);
CREATE UNIQUE INDEX notification_templates_slug_key ON public.notification_templates USING btree (slug);
CREATE UNIQUE INDEX user_challenge_progress_user_id_challenge_id_date_key ON public.user_challenge_progress USING btree (user_id, challenge_id, date);
CREATE INDEX idx_doctor_applications_user_id ON public.doctor_applications USING btree (user_id);
CREATE INDEX idx_doctor_applications_created_at ON public.doctor_applications USING btree (created_at DESC);
CREATE INDEX idx_doctor_applications_status ON public.doctor_applications USING btree (status);
CREATE INDEX idx_app_submissions_status ON public.app_submissions USING btree (submission_status);
CREATE INDEX idx_app_submissions_developer_id ON public.app_submissions USING btree (developer_id);
CREATE UNIQUE INDEX feature_catalog_feature_key_key ON public.feature_catalog USING btree (feature_key);
CREATE INDEX idx_e2e_prekeys_available ON public.e2e_prekeys USING btree (user_id, is_used) WHERE (is_used = false);
CREATE UNIQUE INDEX e2e_prekeys_user_id_prekey_id_key ON public.e2e_prekeys USING btree (user_id, prekey_id);
CREATE INDEX idx_orders_user ON public.medicine_orders USING btree (user_id);
CREATE UNIQUE INDEX medicine_orders_order_number_key ON public.medicine_orders USING btree (order_number);
CREATE INDEX idx_intake_log_scheduled ON public.medicine_intake_log USING btree (scheduled_at);
CREATE INDEX idx_intake_log_user ON public.medicine_intake_log USING btree (user_id);
CREATE UNIQUE INDEX device_sessions_session_token_key ON public.device_sessions USING btree (session_token);
CREATE INDEX idx_device_sessions_fingerprint ON public.device_sessions USING btree (device_fingerprint);
CREATE UNIQUE INDEX device_sessions_qr_token_key ON public.device_sessions USING btree (qr_token);
CREATE INDEX idx_sellers_is_verified ON public.chatr_plus_sellers USING btree (is_verified);
CREATE INDEX idx_sellers_approval_status ON public.chatr_plus_sellers USING btree (approval_status);
CREATE INDEX idx_otp_expires ON public.otp_verifications USING btree (expires_at);
CREATE INDEX idx_status_views_status ON public.status_views USING btree (status_id);
CREATE UNIQUE INDEX status_views_status_id_viewer_id_key ON public.status_views USING btree (status_id, viewer_id);
CREATE INDEX idx_ai_rep_sessions_started ON public.ai_rep_sessions USING btree (started_at DESC);
CREATE INDEX idx_ai_rep_sessions_caller ON public.ai_rep_sessions USING btree (caller_number);
CREATE INDEX idx_ai_rep_sessions_unreviewed ON public.ai_rep_sessions USING btree (user_id) WHERE (reviewed_at IS NULL);
CREATE INDEX idx_ai_rep_sessions_user_id ON public.ai_rep_sessions USING btree (user_id);
CREATE INDEX idx_trust_factors_type ON public.trust_factors USING btree (user_id, factor_type);
CREATE INDEX idx_trust_factors_user ON public.trust_factors USING btree (user_id);
CREATE UNIQUE INDEX champion_rewards_code_key ON public.champion_rewards USING btree (code);
CREATE INDEX idx_challenge_participants ON public.health_challenge_participants USING btree (challenge_id, user_id, status);
CREATE UNIQUE INDEX health_challenge_participants_challenge_id_user_id_key ON public.health_challenge_participants USING btree (challenge_id, user_id);
CREATE INDEX idx_fin_amend_contract ON public.fin_contract_amendments USING btree (contract_id);
CREATE UNIQUE INDEX fin_amend_unique ON public.fin_contract_amendments USING btree (contract_id, amendment_number);
CREATE INDEX idx_media_files_user ON public.media_files USING btree (user_id);
CREATE INDEX idx_media_files_hash ON public.media_files USING btree (hash, user_id);
CREATE UNIQUE INDEX media_files_hash_user_id_key ON public.media_files USING btree (hash, user_id);
CREATE UNIQUE INDEX user_settings_user_id_key ON public.user_settings USING btree (user_id);
CREATE INDEX idx_workspace_broadcasts_ws ON public.workspace_broadcasts USING btree (workspace_id);
CREATE INDEX idx_legal_cases_org ON public.legal_cases USING btree (org_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_cc_dev_tasks_plan ON public.cc_dev_tasks USING btree (plan_id);
CREATE INDEX idx_cc_dev_tasks_status ON public.cc_dev_tasks USING btree (status);
CREATE UNIQUE INDEX story_views_story_id_viewer_id_key ON public.story_views USING btree (story_id, viewer_id);
CREATE INDEX idx_mental_health_assessments_user ON public.mental_health_assessments USING btree (user_id, assessed_at);
CREATE INDEX idx_gsc_queries_page ON public.gsc_queries USING btree (page);
CREATE UNIQUE INDEX uq_gsc_query_day ON public.gsc_queries USING btree (property_id, sync_date, query, page, country, device);
CREATE INDEX idx_gsc_queries_perf ON public.gsc_queries USING btree (query, impressions DESC, clicks DESC);
CREATE INDEX idx_gsc_queries_country ON public.gsc_queries USING btree (country);
CREATE INDEX idx_doctor_availability_doctor ON public.doctor_availability USING btree (doctor_id);
CREATE INDEX idx_audio_rooms_active ON public.audio_rooms USING btree (is_active, is_public);
CREATE INDEX idx_sales_leads_user ON public.sales_leads USING btree (user_id, status);
CREATE INDEX idx_ai_agent_analytics_agent_id ON public.ai_agent_analytics USING btree (agent_id);
CREATE UNIQUE INDEX ai_agent_analytics_agent_id_date_key ON public.ai_agent_analytics USING btree (agent_id, date);
CREATE UNIQUE INDEX fin_org_sys_unique ON public.fin_organizations USING btree (sys_organization_id);
CREATE INDEX idx_fin_org_sys ON public.fin_organizations USING btree (sys_organization_id);
CREATE INDEX idx_spl_user_sent ON public.smart_push_log USING btree (user_id, sent_at DESC);
CREATE INDEX idx_spl_user_feature ON public.smart_push_log USING btree (user_id, feature_key, sent_at DESC);
CREATE INDEX idx_geo_cache_location ON public.geo_cache USING btree (latitude, longitude);
CREATE INDEX idx_geo_cache_expires ON public.geo_cache USING btree (expires_at);
CREATE INDEX idx_geo_cache_query ON public.geo_cache USING btree (query, category);
CREATE INDEX idx_geofences_location ON public.geofences USING btree (center_lat, center_lng);
CREATE INDEX idx_geofences_type ON public.geofences USING btree (type) WHERE (active = true);
CREATE INDEX idx_communication_events_candidate ON public.communication_events USING btree (candidate_id, created_at DESC) WHERE (candidate_id IS NOT NULL);
CREATE INDEX idx_communication_events_user_created ON public.communication_events USING btree (user_id, created_at DESC);
CREATE INDEX idx_communication_events_type_created ON public.communication_events USING btree (event_type, created_at DESC);
CREATE INDEX idx_communication_events_correlation ON public.communication_events USING btree (correlation_id) WHERE (correlation_id IS NOT NULL);
CREATE INDEX idx_fin_exp_org ON public.finance_expenses USING btree (org_id);
CREATE UNIQUE INDEX energy_pulse_progress_user_id_key ON public.energy_pulse_progress USING btree (user_id);
CREATE INDEX idx_conversations_is_community ON public.conversations USING btree (is_community, is_public);
CREATE INDEX idx_coin_transactions_type ON public.chatr_coin_transactions USING btree (transaction_type);
CREATE INDEX idx_coin_transactions_created ON public.chatr_coin_transactions USING btree (created_at DESC);
CREATE INDEX idx_coin_transactions_user ON public.chatr_coin_transactions USING btree (user_id);
CREATE INDEX idx_dhandha_transactions_created ON public.dhandha_transactions USING btree (created_at DESC);
CREATE INDEX idx_dhandha_transactions_status ON public.dhandha_transactions USING btree (status);
CREATE INDEX idx_dhandha_transactions_merchant ON public.dhandha_transactions USING btree (merchant_id);
CREATE INDEX idx_dhandha_transactions_customer ON public.dhandha_transactions USING btree (customer_id);
CREATE INDEX idx_agent_sessions_user_id ON public.agent_sessions USING btree (user_id);
CREATE INDEX idx_agent_sessions_agent_id ON public.agent_sessions USING btree (agent_id);
CREATE INDEX idx_agent_sessions_last_active ON public.agent_sessions USING btree (last_active_at DESC);
CREATE INDEX idx_growth_competitors_org ON public.growth_competitors USING btree (org_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_contacts_sync_queue_user ON public.contacts_sync_queue USING btree (user_id);
CREATE INDEX idx_contacts_sync_queue_status ON public.contacts_sync_queue USING btree (status, created_at) WHERE (status = 'pending'::text);
CREATE UNIQUE INDEX developer_profiles_user_id_key ON public.developer_profiles USING btree (user_id);
CREATE UNIQUE INDEX developer_profiles_api_key_key ON public.developer_profiles USING btree (api_key);
CREATE INDEX idx_developer_profiles_user_id ON public.developer_profiles USING btree (user_id);
CREATE UNIQUE INDEX user_discovery_profiles_user_id_key ON public.user_discovery_profiles USING btree (user_id);
CREATE INDEX idx_discovery_searchable ON public.user_discovery_profiles USING btree (is_searchable) WHERE (is_searchable = true);
CREATE INDEX idx_discovery_skills ON public.user_discovery_profiles USING gin (skills);
CREATE INDEX idx_discovery_location ON public.user_discovery_profiles USING btree (city, country);
CREATE INDEX idx_fin_inv_org ON public.finance_invoices USING btree (org_id);
CREATE INDEX idx_seller_transactions_seller_id ON public.seller_transactions USING btree (seller_id);
CREATE INDEX idx_seller_transactions_created_at ON public.seller_transactions USING btree (created_at DESC);
CREATE INDEX idx_point_transactions_user_id ON public.point_transactions USING btree (user_id);
CREATE INDEX idx_point_transactions_created_at ON public.point_transactions USING btree (created_at DESC);
CREATE INDEX idx_business_subscriptions_business_id ON public.business_subscriptions USING btree (business_id);
CREATE INDEX idx_linked_devices_user ON public.linked_devices USING btree (user_id, is_active);
CREATE UNIQUE INDEX linked_devices_session_token_key ON public.linked_devices USING btree (session_token);
CREATE INDEX idx_automation_logs_rule_id ON public.automation_logs USING btree (rule_id);
CREATE INDEX idx_automation_logs_created_at ON public.automation_logs USING btree (created_at);
CREATE INDEX idx_automation_logs_user_id ON public.automation_logs USING btree (user_id);
CREATE INDEX idx_sys_edges_source ON public.sys_knowledge_edges USING btree (source_node_id);
CREATE INDEX idx_sys_edges_org ON public.sys_knowledge_edges USING btree (org_id);
CREATE UNIQUE INDEX sys_knowledge_edges_source_node_id_target_node_id_edge_type_key ON public.sys_knowledge_edges USING btree (source_node_id, target_node_id, edge_type);
CREATE INDEX idx_sys_edges_target ON public.sys_knowledge_edges USING btree (target_node_id);
CREATE INDEX idx_api_keys_profile_id ON public.api_keys USING btree (profile_id);
CREATE INDEX idx_emotion_circles_active ON public.emotion_circles USING btree (current_emotion, active_until) WHERE (looking_for_connection = true);
CREATE INDEX idx_app_permissions_app_id ON public.app_permissions USING btree (app_id);
CREATE INDEX idx_app_permissions_user_id ON public.app_permissions USING btree (user_id);
CREATE UNIQUE INDEX app_permissions_app_id_permission_name_key ON public.app_permissions USING btree (app_id, permission_name);
CREATE INDEX idx_rate_limits_identifier ON public.rate_limits USING btree (identifier, action_type);
CREATE UNIQUE INDEX story_likes_story_id_user_id_key ON public.story_likes USING btree (story_id, user_id);
CREATE INDEX idx_fin_bank_tx_ref ON public.fin_bank_transactions USING btree (reference_number) WHERE (reference_number IS NOT NULL);
CREATE INDEX idx_fin_bank_tx_acc_date ON public.fin_bank_transactions USING btree (bank_account_id, transaction_date DESC, match_status);
CREATE INDEX idx_notifications_retry_due ON public.notifications USING btree (next_retry_at) WHERE ((delivery_status = 'failed'::text) AND (next_retry_at IS NOT NULL));
CREATE INDEX idx_notifications_user_type_created ON public.notifications USING btree (user_id, type, created_at DESC);
CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);
CREATE INDEX idx_notifications_read ON public.notifications USING btree (user_id, read);
CREATE UNIQUE INDEX seller_analytics_user_id_date_key ON public.seller_analytics USING btree (user_id, date);
CREATE INDEX idx_business_call_logs_profile_id ON public.business_call_logs USING btree (profile_id);
CREATE INDEX idx_ai_agent_training_agent_id ON public.ai_agent_training USING btree (agent_id);
CREATE INDEX idx_message_translations_lookup ON public.message_translations USING btree (message_id, target_language);
CREATE INDEX idx_message_translations_message ON public.message_translations USING btree (message_id);
CREATE UNIQUE INDEX message_translations_message_id_target_language_key ON public.message_translations USING btree (message_id, target_language);
CREATE INDEX idx_visual_search_user_id ON public.visual_search_history USING btree (user_id);
CREATE UNIQUE INDEX rewards_mode_settings_user_id_key ON public.rewards_mode_settings USING btree (user_id);
CREATE INDEX idx_message_reports_status ON public.message_reports USING btree (status);
CREATE INDEX idx_message_reports_message_id ON public.message_reports USING btree (message_id);
CREATE INDEX idx_business_conversations_business_id ON public.business_conversations USING btree (business_id);
CREATE INDEX idx_business_conversations_status ON public.business_conversations USING btree (status);
CREATE INDEX idx_business_conversations_assigned_to ON public.business_conversations USING btree (assigned_to);
CREATE UNIQUE INDEX business_conversations_business_id_conversation_id_key ON public.business_conversations USING btree (business_id, conversation_id);
CREATE INDEX idx_visual_search_hash ON public.visual_search_cache USING btree (image_hash);
CREATE UNIQUE INDEX visual_search_cache_image_hash_key ON public.visual_search_cache USING btree (image_hash);
CREATE INDEX idx_visual_search_expires ON public.visual_search_cache USING btree (expires_at);
CREATE INDEX idx_family_members_caregiver ON public.health_family_members USING btree (caregiver_user_id);
CREATE INDEX idx_search_history_category ON public.chatr_search_history USING btree (category);
CREATE INDEX idx_search_history_user_id ON public.chatr_search_history USING btree (user_id);
CREATE INDEX idx_growth_campaigns_org ON public.growth_campaigns USING btree (org_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_growth_campaigns_status ON public.growth_campaigns USING btree (status) WHERE (deleted_at IS NULL);
CREATE INDEX idx_withdrawal_requests_seller_id ON public.seller_withdrawal_requests USING btree (seller_id);
CREATE INDEX idx_withdrawal_requests_status ON public.seller_withdrawal_requests USING btree (status);
CREATE INDEX idx_contact_invites_phone ON public.contact_invites USING btree (contact_phone);
CREATE INDEX idx_contact_invites_email ON public.contact_invites USING btree (contact_email);
CREATE UNIQUE INDEX contact_invites_inviter_id_contact_phone_key ON public.contact_invites USING btree (inviter_id, contact_phone);
CREATE UNIQUE INDEX contact_invites_inviter_id_contact_email_key ON public.contact_invites USING btree (inviter_id, contact_email);
CREATE INDEX idx_contact_invites_code ON public.contact_invites USING btree (invite_code);
CREATE UNIQUE INDEX parallel_you_profiles_user_id_key ON public.parallel_you_profiles USING btree (user_id);
CREATE UNIQUE INDEX fame_leaderboard_user_id_key ON public.fame_leaderboard USING btree (user_id);
CREATE UNIQUE INDEX two_factor_auth_user_id_key ON public.two_factor_auth USING btree (user_id);
CREATE INDEX idx_stories_user_id ON public.stories USING btree (user_id);
CREATE INDEX idx_stories_expires_at ON public.stories USING btree (expires_at);
CREATE INDEX idx_health_predictions_user ON public.health_predictions USING btree (user_id, generated_at DESC);
CREATE INDEX idx_webhooks_profile_id ON public.webhooks USING btree (profile_id);
CREATE INDEX idx_message_tasks_conversation ON public.message_tasks USING btree (conversation_id);
CREATE UNIQUE INDEX chatr_plus_categories_slug_key ON public.chatr_plus_categories USING btree (slug);
CREATE INDEX idx_qr_sessions_status ON public.qr_login_sessions USING btree (status, expires_at);
CREATE INDEX idx_qr_sessions_token ON public.qr_login_sessions USING btree (token);
CREATE UNIQUE INDEX qr_login_sessions_token_key ON public.qr_login_sessions USING btree (token);
CREATE UNIQUE INDEX micro_task_user_scores_user_id_key ON public.micro_task_user_scores USING btree (user_id);
CREATE UNIQUE INDEX connector_credentials_connection_id_key ON public.connector_credentials USING btree (connection_id);
CREATE INDEX idx_crm_activities_business_id ON public.crm_activities USING btree (business_id);
CREATE INDEX idx_crm_activities_lead_id ON public.crm_activities USING btree (lead_id);
CREATE INDEX idx_teleconsult_doctor ON public.teleconsultation_bookings USING btree (doctor_id, appointment_date DESC);
CREATE INDEX idx_teleconsult_user ON public.teleconsultation_bookings USING btree (user_id, appointment_date DESC);
CREATE INDEX idx_ai_moments_public ON public.ai_moments USING btree (created_at DESC, like_count DESC) WHERE (is_public = true);
CREATE INDEX idx_retry_message_id ON public.message_retry_log USING btree (message_id);
CREATE UNIQUE INDEX fin_rev_sched_unique ON public.fin_revenue_schedules USING btree (contract_id, obligation_id, schedule_number);
CREATE INDEX idx_fin_rev_sched_contract ON public.fin_revenue_schedules USING btree (contract_id, status);
CREATE INDEX idx_fin_rev_sched_date ON public.fin_revenue_schedules USING btree (scheduled_date, status);
CREATE INDEX idx_seo_opportunities_status ON public.seo_opportunities USING btree (status, created_at DESC);
CREATE INDEX idx_activity_events_entity ON public.activity_events USING btree (entity_type, entity_id);
CREATE INDEX idx_activity_events_org ON public.activity_events USING btree (org_id);
CREATE INDEX idx_error_logs_user_id ON public.error_logs USING btree (user_id);
CREATE INDEX idx_error_logs_created_at ON public.error_logs USING btree (created_at DESC);
CREATE INDEX idx_fin_map_event ON public.fin_account_mappings USING btree (fin_organization_id, event_type, is_active, priority);
CREATE UNIQUE INDEX message_drafts_conversation_id_user_id_key ON public.message_drafts USING btree (conversation_id, user_id);
CREATE INDEX idx_message_drafts_conversation ON public.message_drafts USING btree (conversation_id);
CREATE UNIQUE INDEX challenge_participations_challenge_id_user_id_key ON public.challenge_participations USING btree (challenge_id, user_id);
CREATE UNIQUE INDEX app_installs_user_id_app_id_key ON public.app_installs USING btree (user_id, app_id);
CREATE INDEX idx_app_installs_app ON public.app_installs USING btree (app_id);
CREATE INDEX idx_app_installs_user ON public.app_installs USING btree (user_id);
CREATE UNIQUE INDEX fin_fixed_asset_unique ON public.fin_fixed_assets USING btree (fin_organization_id, asset_number);
CREATE INDEX idx_fin_rec_match_tx ON public.fin_reconciliation_matches USING btree (bank_transaction_id);
CREATE INDEX idx_starred_messages_user_id ON public.starred_messages USING btree (user_id);
CREATE INDEX idx_starred_messages_message_id ON public.starred_messages USING btree (message_id);
CREATE INDEX idx_starred_messages_conversation_id ON public.starred_messages USING btree (conversation_id);
CREATE UNIQUE INDEX starred_messages_user_id_message_id_key ON public.starred_messages USING btree (user_id, message_id);
CREATE INDEX idx_calls_caller_phone ON public.calls USING btree (caller_phone);
CREATE INDEX idx_calls_outcome_status ON public.calls USING btree (outcome_status) WHERE (outcome_status IS NOT NULL);
CREATE INDEX idx_calls_receiver_id ON public.calls USING btree (receiver_id);
CREATE INDEX idx_calls_created_at ON public.calls USING btree (created_at DESC);
CREATE INDEX idx_calls_active ON public.calls USING btree (status, conversation_id) WHERE (status = ANY (ARRAY['ringing'::text, 'active'::text]));
CREATE INDEX idx_calls_receiver_missed ON public.calls USING btree (receiver_id, missed) WHERE (missed = true);
CREATE INDEX idx_calls_receiver_phone ON public.calls USING btree (receiver_phone);
CREATE INDEX idx_calls_started_at ON public.calls USING btree (started_at DESC);
CREATE INDEX idx_calls_status ON public.calls USING btree (status);
CREATE INDEX idx_calls_intent ON public.calls USING btree (pre_call_intent) WHERE (pre_call_intent IS NOT NULL);
CREATE INDEX idx_calls_caller_id ON public.calls USING btree (caller_id);
CREATE INDEX idx_fin_je_srctype ON public.fin_journal_entries USING btree (source_type, source_id) WHERE (source_id IS NOT NULL);
CREATE INDEX idx_fin_je_srcevent ON public.fin_journal_entries USING btree (source_event_id) WHERE (source_event_id IS NOT NULL);
CREATE INDEX idx_fin_je_entity ON public.fin_journal_entries USING btree (legal_entity_id, period_id, status);
CREATE INDEX idx_fin_je_org ON public.fin_journal_entries USING btree (fin_organization_id, status, posting_date DESC);
CREATE UNIQUE INDEX fin_je_num_unique ON public.fin_journal_entries USING btree (fin_organization_id, entry_number);
CREATE INDEX idx_analytics_date ON public.analytics_data USING btree (date);
CREATE UNIQUE INDEX fin_close_task_unique ON public.fin_close_tasks USING btree (checklist_id, task_code);
CREATE INDEX idx_uci_user ON public.user_capability_installs USING btree (user_id, status);
CREATE INDEX idx_user_capability_installs_user ON public.user_capability_installs USING btree (user_id, status);
CREATE UNIQUE INDEX user_capability_installs_user_id_capability_id_key ON public.user_capability_installs USING btree (user_id, capability_id);
CREATE INDEX idx_chatr_search_cache_expires ON public.chatr_search_cache USING btree (expires_at);
CREATE UNIQUE INDEX chatr_search_cache_query_hash_key ON public.chatr_search_cache USING btree (query_hash);
CREATE INDEX idx_chatr_search_cache_hash ON public.chatr_search_cache USING btree (query_hash);
CREATE INDEX idx_sales_deals_user ON public.sales_deals USING btree (user_id, stage);
CREATE INDEX idx_fin_integrity_org ON public.fin_integrity_reports USING btree (fin_organization_id, snapshot_at DESC);
CREATE INDEX idx_champions_points ON public.champions USING btree (points DESC);
CREATE UNIQUE INDEX champions_user_id_key ON public.champions USING btree (user_id);
CREATE INDEX idx_champions_rank ON public.champions USING btree (rank) WHERE (rank IS NOT NULL);
CREATE INDEX idx_workspace_templates_ws ON public.workspace_templates USING btree (workspace_id);
CREATE UNIQUE INDEX message_reactions_message_id_user_id_emoji_key ON public.message_reactions USING btree (message_id, user_id, emoji);
CREATE INDEX idx_activities_type ON public.user_activities USING btree (activity_type);
CREATE INDEX idx_activities_user ON public.user_activities USING btree (user_id);
CREATE UNIQUE INDEX fin_close_unique ON public.fin_close_checklists USING btree (period_id, legal_entity_id);
CREATE INDEX idx_inter_app_messages_target ON public.inter_app_messages USING btree (target_app_id, status);
CREATE INDEX idx_inter_app_messages_sent_at ON public.inter_app_messages USING btree (sent_at DESC);
CREATE INDEX idx_inter_app_messages_user ON public.inter_app_messages USING btree (user_id);
CREATE INDEX idx_message_security_scans_message_id ON public.message_security_scans USING btree (message_id);
CREATE INDEX idx_sys_orgs_owner ON public.sys_organizations USING btree (owner_id);
CREATE UNIQUE INDEX sys_organizations_slug_key ON public.sys_organizations USING btree (slug);
CREATE INDEX idx_user_identities_user ON public.user_identities USING btree (user_id);
CREATE INDEX idx_user_identities_handle ON public.user_identities USING btree (handle);
CREATE INDEX idx_user_identities_full_handle ON public.user_identities USING btree (full_handle);
CREATE INDEX idx_user_identities_type ON public.user_identities USING btree (identity_type);
CREATE UNIQUE INDEX user_identities_handle_suffix_key ON public.user_identities USING btree (handle, suffix);
CREATE INDEX idx_contacts_phone_hash ON public.contacts USING btree (contact_phone_hash);
CREATE INDEX idx_contacts_user_registered ON public.contacts USING btree (user_id, is_registered) WHERE (is_registered = true);
CREATE UNIQUE INDEX contacts_user_id_contact_phone_key ON public.contacts USING btree (user_id, contact_phone);
CREATE INDEX idx_therapy_sessions_user ON public.therapy_sessions USING btree (user_id, scheduled_at);
CREATE INDEX idx_search_queries_user_id ON public.search_queries USING btree (user_id);
CREATE INDEX idx_search_queries_timestamp ON public.search_queries USING btree ("timestamp" DESC);
CREATE INDEX idx_hsb_user_date ON public.home_solutions_bookings USING btree (user_id, created_at DESC);
CREATE INDEX idx_service_categories_parent ON public.service_categories USING btree (parent_id);
CREATE INDEX idx_onboarding_progress_user ON public.onboarding_progress USING btree (user_id);
CREATE INDEX idx_call_summaries_user_id ON public.call_summaries USING btree (user_id);
CREATE INDEX idx_call_summaries_call_id ON public.call_summaries USING btree (call_id);
CREATE INDEX idx_call_summaries_is_scam ON public.call_summaries USING btree (is_scam) WHERE (is_scam = true);
CREATE UNIQUE INDEX channel_members_channel_id_user_id_key ON public.channel_members USING btree (channel_id, user_id);
CREATE UNIQUE INDEX sys_knowledge_nodes_org_id_node_type_entity_id_key ON public.sys_knowledge_nodes USING btree (org_id, node_type, entity_id);
CREATE INDEX idx_sys_nodes_org ON public.sys_knowledge_nodes USING btree (org_id);
CREATE INDEX idx_photo_albums_user ON public.photo_albums USING btree (user_id);
CREATE UNIQUE INDEX chatr_badges_badge_type_key ON public.chatr_badges USING btree (badge_type);
CREATE INDEX idx_chatr_healthcare_type ON public.chatr_healthcare USING btree (provider_type);
CREATE INDEX idx_chatr_healthcare_location ON public.chatr_healthcare USING btree (latitude, longitude);
CREATE INDEX idx_chatr_healthcare_mental ON public.chatr_healthcare USING btree (is_mental_health_provider) WHERE (is_mental_health_provider = true);
CREATE INDEX idx_health_wallet_trans_user ON public.health_wallet_transactions USING btree (user_id, created_at DESC);
CREATE INDEX idx_network_created_at ON public.network_diagnostics USING btree (created_at DESC);
CREATE INDEX idx_network_user_id ON public.network_diagnostics USING btree (user_id);
CREATE INDEX idx_wallet_transactions_wallet_id ON public.chatr_wallet_transactions USING btree (wallet_id);
CREATE INDEX idx_wallet_transactions_user_id ON public.chatr_wallet_transactions USING btree (user_id);
CREATE INDEX idx_payments_provider ON public.payments USING btree (provider_id);
CREATE INDEX idx_payments_patient ON public.payments USING btree (patient_id);
CREATE UNIQUE INDEX business_categories_name_key ON public.business_categories USING btree (name);
CREATE INDEX idx_app_versions_app_id ON public.app_versions USING btree (app_id, version_code DESC);
CREATE UNIQUE INDEX app_versions_app_id_version_code_key ON public.app_versions USING btree (app_id, version_code);
CREATE INDEX idx_healthcare_location ON public.healthcare_db USING btree (latitude, longitude);
CREATE INDEX idx_healthcare_city ON public.healthcare_db USING btree (city);
CREATE INDEX idx_healthcare_pincode ON public.healthcare_db USING btree (pincode);
CREATE UNIQUE INDEX idx_kg_edges_unique_rel ON public.kg_edges USING btree (tenant_id, source_node_id, target_node_id, relation);
CREATE INDEX idx_kg_edges_target ON public.kg_edges USING btree (tenant_id, target_node_id);
CREATE INDEX idx_kg_edges_tenant ON public.kg_edges USING btree (tenant_id, source_node_id);
CREATE INDEX idx_subscription_items_subscription ON public.subscription_items USING btree (subscription_id);
CREATE INDEX idx_search_analytics_intent ON public.search_analytics USING btree (intent);
CREATE INDEX idx_search_analytics_timestamp ON public.search_analytics USING btree ("timestamp" DESC);
CREATE INDEX idx_search_analytics_query ON public.search_analytics USING btree (query_text);
CREATE INDEX idx_search_analytics_user ON public.search_analytics USING btree (user_id);
CREATE UNIQUE INDEX session_participants_session_id_user_id_key ON public.session_participants USING btree (session_id, user_id);
CREATE INDEX idx_job_applications_applicant ON public.job_applications USING btree (applicant_id);
CREATE UNIQUE INDEX job_applications_job_id_applicant_id_key ON public.job_applications USING btree (job_id, applicant_id);
CREATE INDEX idx_job_applications_job ON public.job_applications USING btree (job_id);
CREATE INDEX idx_local_deals_active ON public.local_deals USING btree (is_active, valid_until);
CREATE INDEX idx_delivery_message_id ON public.message_delivery_status USING btree (message_id);
CREATE INDEX idx_delivery_recipient_id ON public.message_delivery_status USING btree (recipient_id);
CREATE UNIQUE INDEX chatr_plus_reviews_booking_id_key ON public.chatr_plus_reviews USING btree (booking_id);
CREATE INDEX idx_chatr_deals_category ON public.chatr_deals USING btree (category);
CREATE INDEX idx_sys_teams_org ON public.sys_teams USING btree (org_id);
CREATE INDEX idx_connector_records_user_time ON public.connector_records USING btree (user_id, occurred_at DESC);
CREATE UNIQUE INDEX connector_records_connection_id_record_type_external_id_key ON public.connector_records USING btree (connection_id, record_type, external_id);
CREATE INDEX idx_connector_records_type ON public.connector_records USING btree (user_id, record_type);
CREATE UNIQUE INDEX deal_redemptions_deal_id_user_id_key ON public.deal_redemptions USING btree (deal_id, user_id);
CREATE INDEX idx_mcp_request_logs_created ON public.mcp_request_logs USING btree (created_at DESC);
CREATE INDEX idx_voicemails_receiver ON public.voicemails USING btree (receiver_id);
CREATE INDEX idx_server_abuse_limits_lookup ON public.server_abuse_limits USING btree (rate_key, action_type, window_start);
CREATE UNIQUE INDEX e2e_sessions_user_id_peer_id_key ON public.e2e_sessions USING btree (user_id, peer_id);
CREATE INDEX idx_e2e_sessions_peer ON public.e2e_sessions USING btree (user_id, peer_id);
CREATE INDEX idx_location_shares_active ON public.location_shares USING btree (is_active) WHERE (is_active = true);
CREATE INDEX idx_location_shares_user_id ON public.location_shares USING btree (user_id);
CREATE UNIQUE INDEX session_room_participants_room_id_user_id_key ON public.session_room_participants USING btree (room_id, user_id);
CREATE UNIQUE INDEX pinned_messages_conversation_id_message_id_key ON public.pinned_messages USING btree (conversation_id, message_id);
CREATE INDEX idx_pinned_messages_message_id ON public.pinned_messages USING btree (message_id);
CREATE INDEX idx_pinned_messages_conversation_id ON public.pinned_messages USING btree (conversation_id);
CREATE INDEX idx_device_tokens_platform ON public.device_tokens USING btree (platform);
CREATE UNIQUE INDEX device_tokens_device_token_key ON public.device_tokens USING btree (device_token);
CREATE INDEX idx_device_tokens_user_id ON public.device_tokens USING btree (user_id);
CREATE UNIQUE INDEX device_tokens_user_device_unique ON public.device_tokens USING btree (user_id, device_token);
CREATE INDEX idx_service_providers_user ON public.service_providers USING btree (user_id);
CREATE INDEX idx_service_providers_location ON public.service_providers USING btree (latitude, longitude);
CREATE UNIQUE INDEX fin_accrual_num_unique ON public.fin_accruals USING btree (fin_organization_id, accrual_number);
CREATE INDEX idx_invite_links_code ON public.invite_links USING btree (invite_code);
CREATE UNIQUE INDEX invite_links_invite_code_key ON public.invite_links USING btree (invite_code);
CREATE INDEX idx_leaderboards_type_period ON public.chatr_leaderboards USING btree (leaderboard_type, period);
CREATE INDEX idx_leaderboards_rank ON public.chatr_leaderboards USING btree (rank);
CREATE INDEX idx_leaderboards_city ON public.chatr_leaderboards USING btree (city);
CREATE INDEX idx_seo_search_metrics_page ON public.seo_search_metrics USING btree (page);
CREATE UNIQUE INDEX seo_search_metrics_site_url_metric_date_page_query_country__key ON public.seo_search_metrics USING btree (site_url, metric_date, page, query, country, device);
CREATE INDEX idx_seo_search_metrics_date ON public.seo_search_metrics USING btree (metric_date DESC);
CREATE INDEX idx_chatr_restaurants_location ON public.chatr_restaurants USING btree (latitude, longitude);
CREATE UNIQUE INDEX job_saved_user_id_job_id_key ON public.job_saved USING btree (user_id, job_id);
CREATE UNIQUE INDEX user_health_profiles_user_id_key ON public.user_health_profiles USING btree (user_id);
CREATE INDEX idx_user_health_profiles_user ON public.user_health_profiles USING btree (user_id);
CREATE INDEX idx_vitals_user ON public.chronic_vitals USING btree (user_id);
CREATE INDEX idx_vitals_recorded ON public.chronic_vitals USING btree (recorded_at);
CREATE UNIQUE INDEX health_passport_passport_number_key ON public.health_passport USING btree (passport_number);
CREATE UNIQUE INDEX health_passport_user_id_key ON public.health_passport USING btree (user_id);
CREATE UNIQUE INDEX emotionsync_progress_user_id_key ON public.emotionsync_progress USING btree (user_id);
CREATE INDEX idx_precall_rules_user ON public.precall_rules USING btree (user_id) WHERE (enabled = true);
CREATE UNIQUE INDEX chatr_plus_user_subscriptions_user_id_key ON public.chatr_plus_user_subscriptions USING btree (user_id);
CREATE INDEX idx_search_results_query_id ON public.search_results USING btree (query_id);
CREATE INDEX idx_search_results_source ON public.search_results USING btree (source);
CREATE UNIQUE INDEX workspace_ai_keys_workspace_id_provider_key ON public.workspace_ai_keys USING btree (workspace_id, provider);
CREATE INDEX idx_user_locations_created_at ON public.user_locations USING btree (created_at DESC);
CREATE INDEX idx_user_locations_user_id ON public.user_locations USING btree (user_id);
CREATE INDEX idx_user_locations_user ON public.user_locations USING btree (user_id, created_at DESC);
CREATE INDEX idx_reminders_user ON public.medicine_reminders USING btree (user_id);
CREATE INDEX idx_fin_bank_acc_org ON public.fin_bank_accounts USING btree (fin_organization_id, is_active);
CREATE UNIQUE INDEX fin_bank_acc_unique ON public.fin_bank_accounts USING btree (fin_organization_id, bank_name, account_number_mask);
CREATE INDEX idx_business_campaigns_profile_id ON public.business_campaigns USING btree (profile_id);
CREATE INDEX idx_growth_memory_org_key ON public.growth_memory USING btree (org_id, key) WHERE (deleted_at IS NULL);
CREATE INDEX idx_user_devices_fingerprint ON public.user_devices USING btree (device_fingerprint);
CREATE INDEX idx_user_devices_online ON public.user_devices USING btree (user_id, is_online) WHERE (is_online = true);
CREATE INDEX idx_user_devices_active_call ON public.user_devices USING btree (user_id, active_call_id) WHERE (active_call_id IS NOT NULL);
CREATE INDEX idx_user_devices_user_id ON public.user_devices USING btree (user_id);
CREATE UNIQUE INDEX user_devices_user_id_device_fingerprint_key ON public.user_devices USING btree (user_id, device_fingerprint);
CREATE UNIQUE INDEX restaurant_details_vendor_id_key ON public.restaurant_details USING btree (vendor_id);
CREATE INDEX idx_bmi_records_user ON public.bmi_records USING btree (user_id, recorded_at);
CREATE UNIQUE INDEX fcm_tokens_user_id_token_key ON public.fcm_tokens USING btree (user_id, token);
CREATE UNIQUE INDEX service_coupons_code_key ON public.service_coupons USING btree (code);
CREATE INDEX idx_saved_searches_active ON public.saved_searches USING btree (user_id, is_active) WHERE (is_active = true);
CREATE INDEX idx_saved_searches_user ON public.saved_searches USING btree (user_id);
CREATE INDEX idx_saved_searches_user_id ON public.saved_searches USING btree (user_id);
CREATE UNIQUE INDEX saved_searches_user_id_query_key ON public.saved_searches USING btree (user_id, query);
CREATE INDEX idx_seller_invoices_seller_id ON public.seller_invoices USING btree (seller_id);
CREATE UNIQUE INDEX seller_invoices_invoice_number_key ON public.seller_invoices USING btree (invoice_number);
CREATE UNIQUE INDEX champion_mission_progress_user_id_mission_id_key ON public.champion_mission_progress USING btree (user_id, mission_id);
CREATE INDEX idx_mission_progress_user ON public.champion_mission_progress USING btree (user_id);
CREATE INDEX idx_workflow_runs_workflow_id ON public.workflow_runs USING btree (workflow_id);
CREATE INDEX idx_workflow_runs_status ON public.workflow_runs USING btree (status);
CREATE INDEX idx_workflow_runs_correlation_id ON public.workflow_runs USING btree (correlation_id);
CREATE INDEX idx_service_chat_messages_booking ON public.service_chat_messages USING btree (booking_id);
CREATE INDEX idx_workspace_members_ws ON public.workspace_members USING btree (workspace_id);
CREATE UNIQUE INDEX workspace_members_workspace_id_user_id_key ON public.workspace_members USING btree (workspace_id, user_id);
CREATE INDEX idx_workspace_members_user ON public.workspace_members USING btree (user_id);
CREATE INDEX idx_rec_interviews_candidate ON public.rec_interviews USING btree (candidate_id);
CREATE UNIQUE INDEX app_reviews_app_id_user_id_key ON public.app_reviews USING btree (app_id, user_id);
CREATE UNIQUE INDEX merchant_profiles_user_id_key ON public.merchant_profiles USING btree (user_id);
CREATE INDEX idx_sales_activities_user ON public.sales_activities USING btree (user_id);
CREATE INDEX idx_fin_period_status ON public.fin_periods USING btree (fin_organization_id, status, start_date);
CREATE UNIQUE INDEX fin_period_unique ON public.fin_periods USING btree (fin_organization_id, legal_entity_id, start_date, period_type);
CREATE INDEX idx_call_participants_user_id ON public.call_participants USING btree (user_id);
CREATE INDEX idx_call_participants_call_id ON public.call_participants USING btree (call_id);
CREATE UNIQUE INDEX call_participants_call_id_user_id_key ON public.call_participants USING btree (call_id, user_id);
CREATE INDEX idx_result_rankings_query ON public.search_result_rankings USING btree (query_text);
CREATE INDEX idx_result_rankings_score ON public.search_result_rankings USING btree (ranking_score DESC);
CREATE UNIQUE INDEX wellness_community_members_community_id_user_id_key ON public.wellness_community_members USING btree (community_id, user_id);
CREATE INDEX idx_message_forwards_original ON public.message_forwards USING btree (original_message_id);
CREATE INDEX idx_message_forwards_forwarded ON public.message_forwards USING btree (forwarded_message_id);
CREATE INDEX idx_call_logs_call ON public.call_logs USING btree (call_id);
CREATE INDEX idx_call_logs_user ON public.call_logs USING btree (user_id);
CREATE INDEX idx_subscriptions_user ON public.medicine_subscriptions USING btree (user_id);
CREATE UNIQUE INDEX chatr_seller_subscription_plans_seller_id_key ON public.chatr_seller_subscription_plans USING btree (seller_id);
CREATE INDEX idx_seller_subscriptions_seller_id ON public.chatr_seller_subscription_plans USING btree (seller_id);
CREATE INDEX idx_cc_leads_status ON public.cc_leads USING btree (status);
CREATE INDEX idx_cc_leads_plan ON public.cc_leads USING btree (plan_id);
CREATE INDEX idx_wellness_tracking_user_date ON public.wellness_tracking USING btree (user_id, date DESC);
CREATE UNIQUE INDEX wellness_tracking_user_id_date_key ON public.wellness_tracking USING btree (user_id, date);
CREATE INDEX idx_health_reminders_user_active ON public.health_reminders USING btree (user_id, is_active, reminder_time);
CREATE UNIQUE INDEX sso_tokens_token_key ON public.sso_tokens USING btree (token);
CREATE INDEX idx_contacts_name_votes_hash ON public.contacts_name_votes USING btree (phone_hash);
CREATE UNIQUE INDEX contacts_name_votes_phone_hash_name_normalized_key ON public.contacts_name_votes USING btree (phone_hash, name_normalized);
CREATE INDEX idx_search_suggestions_trending ON public.search_suggestions USING btree (is_trending) WHERE (is_trending = true);
CREATE UNIQUE INDEX search_suggestions_suggestion_text_key ON public.search_suggestions USING btree (suggestion_text);
CREATE INDEX idx_search_suggestions_popularity ON public.search_suggestions USING btree (popularity_score DESC);
CREATE INDEX idx_search_suggestions_text ON public.search_suggestions USING btree (suggestion_text);
CREATE INDEX idx_workspace_activities_ws ON public.workspace_activities USING btree (workspace_id);
CREATE UNIQUE INDEX nutrition_daily_summary_user_id_summary_date_key ON public.nutrition_daily_summary USING btree (user_id, summary_date);
CREATE UNIQUE INDEX account_followers_account_id_user_id_key ON public.account_followers USING btree (account_id, user_id);
CREATE INDEX idx_call_telemetry_route ON public.call_telemetry USING btree (route_chosen);
CREATE INDEX idx_call_telemetry_outcome ON public.call_telemetry USING btree (outcome_tag);
CREATE INDEX idx_call_telemetry_user ON public.call_telemetry USING btree (user_id);
CREATE INDEX idx_call_telemetry_contact ON public.call_telemetry USING btree (contact_id);
CREATE UNIQUE INDEX referral_codes_code_key ON public.referral_codes USING btree (code);
CREATE INDEX idx_live_rooms_active ON public.live_rooms USING btree (is_active, created_at DESC) WHERE (is_public = true);
CREATE INDEX idx_login_attempts_phone ON public.login_attempts USING btree (phone_number, created_at DESC);
CREATE UNIQUE INDEX native_apps_package_name_key ON public.native_apps USING btree (package_name);
CREATE UNIQUE INDEX app_usage_user_id_app_id_key ON public.app_usage USING btree (user_id, app_id);
CREATE UNIQUE INDEX micro_task_assignments_task_id_user_id_key ON public.micro_task_assignments USING btree (task_id, user_id);
CREATE INDEX idx_micro_task_assignments_task ON public.micro_task_assignments USING btree (task_id, status);
CREATE INDEX idx_micro_task_assignments_user ON public.micro_task_assignments USING btree (user_id, status);
CREATE INDEX idx_user_reward_redemptions_status ON public.user_reward_redemptions USING btree (status);
CREATE UNIQUE INDEX user_reward_redemptions_redemption_code_key ON public.user_reward_redemptions USING btree (redemption_code);
CREATE INDEX idx_user_reward_redemptions_user_id ON public.user_reward_redemptions USING btree (user_id);
CREATE INDEX idx_app_usage_sessions_app_id ON public.app_usage_sessions USING btree (app_id);
CREATE INDEX idx_app_usage_sessions_user_id ON public.app_usage_sessions USING btree (user_id);
CREATE INDEX idx_app_usage_sessions_dates ON public.app_usage_sessions USING btree (session_start, session_end);
CREATE INDEX idx_backup_user ON public.backup_history USING btree (user_id, created_at DESC);
CREATE INDEX idx_micro_tasks_active ON public.micro_tasks USING btree (is_active, expires_at) WHERE (is_active = true);
CREATE INDEX idx_micro_tasks_type ON public.micro_tasks USING btree (task_type);
CREATE UNIQUE INDEX device_capabilities_user_id_key ON public.device_capabilities USING btree (user_id);
CREATE UNIQUE INDEX post_likes_post_id_user_id_key ON public.post_likes USING btree (post_id, user_id);
CREATE INDEX idx_user_contacts_user_id ON public.user_contacts USING btree (user_id);
CREATE UNIQUE INDEX user_contacts_user_id_contact_user_id_key ON public.user_contacts USING btree (user_id, contact_user_id);
CREATE INDEX idx_kernel_events_type ON public.kernel_events USING btree (event_type);
CREATE INDEX idx_kernel_events_aggregate ON public.kernel_events USING btree (aggregate_type, aggregate_id);
CREATE INDEX idx_kernel_events_actor ON public.kernel_events USING btree (actor_id);
CREATE UNIQUE INDEX kernel_events_stream_id_expected_version_key ON public.kernel_events USING btree (stream_id, expected_version);
CREATE INDEX idx_kernel_events_tenant ON public.kernel_events USING btree (tenant_id, "timestamp");
CREATE INDEX idx_kernel_events_stream ON public.kernel_events USING btree (stream_id, expected_version);
CREATE INDEX idx_hsc_category_active ON public.home_solutions_catalog USING btree (category, is_active, sort_order);
CREATE UNIQUE INDEX home_solutions_catalog_code_key ON public.home_solutions_catalog USING btree (code);
CREATE UNIQUE INDEX chatr_subscription_plans_plan_type_key ON public.chatr_subscription_plans USING btree (plan_type);
CREATE INDEX idx_app_sessions_app_id ON public.app_sessions USING btree (app_id);
CREATE INDEX idx_app_sessions_start ON public.app_sessions USING btree (session_start DESC);
CREATE INDEX idx_app_sessions_user_id ON public.app_sessions USING btree (user_id);
CREATE INDEX idx_community_members_user ON public.community_members USING btree (user_id);
CREATE INDEX idx_community_members_community ON public.community_members USING btree (community_id);
CREATE UNIQUE INDEX community_members_community_id_user_id_key ON public.community_members USING btree (community_id, user_id);
CREATE INDEX idx_trust_graph_trust_level ON public.trust_graph USING btree (trust_level);
CREATE UNIQUE INDEX trust_graph_source_user_id_target_user_id_key ON public.trust_graph USING btree (source_user_id, target_user_id);
CREATE INDEX idx_trust_graph_source ON public.trust_graph USING btree (source_user_id);
CREATE INDEX idx_trust_graph_target ON public.trust_graph USING btree (target_user_id);
CREATE INDEX idx_health_vitals_user_type ON public.health_vitals USING btree (user_id, vital_type, recorded_at DESC);
CREATE INDEX idx_health_vitals_recorded ON public.health_vitals USING btree (recorded_at DESC);
CREATE INDEX idx_identity_scores_user_id ON public.identity_scores USING btree (user_id);
CREATE INDEX idx_identity_scores_overall ON public.identity_scores USING btree (overall_score);
CREATE UNIQUE INDEX identity_scores_user_id_key ON public.identity_scores USING btree (user_id);

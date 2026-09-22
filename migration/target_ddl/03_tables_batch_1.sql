-- ==============================================================================
-- PART 3: TABLES & PRIMARY KEYS (Part 1 of 2)
-- Total tables in this batch: 294
-- Target: nuuuqazaoaozgblmvkzn
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public."platform_audit_logs" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "event_id" uuid,
  "actor" character varying NOT NULL,
  "action" character varying NOT NULL,
  "resource" character varying NOT NULL,
  "details" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."platform_audit_logs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_accounting_policies" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid,
  "policy_type" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "version" integer NOT NULL DEFAULT 1,
  "accounting_standard" text NOT NULL,
  "effective_from" date NOT NULL,
  "effective_to" date,
  "status" text NOT NULL DEFAULT 'DRAFT'::text,
  "rule_definition" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "author_id" uuid NOT NULL,
  "approved_by" uuid,
  "approved_at" timestamp with time zone,
  "approval_id" uuid,
  "supersedes_id" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_accounting_policies" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."gsc_properties" (
  "property_id" character varying NOT NULL,
  "display_name" character varying NOT NULL,
  "auth_status" character varying NOT NULL DEFAULT 'CONNECTED'::character varying,
  "last_sync_at" timestamp with time zone,
  "total_clicks_30d" integer DEFAULT 0,
  "total_impressions_30d" integer DEFAULT 0,
  "avg_position" numeric DEFAULT 0.0,
  "avg_ctr" numeric DEFAULT 0.0,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("property_id")
);

ALTER TABLE public."gsc_properties" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."contact_label_frequencies" (
  "hashed_number" text NOT NULL,
  "normalized_label" text NOT NULL,
  "frequency_count" integer NOT NULL DEFAULT 1,
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("hashed_number", "normalized_label")
);

ALTER TABLE public."contact_label_frequencies" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."identity_access_rules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "identity_id" uuid NOT NULL,
  "granted_to_user_id" uuid,
  "granted_to_group" text,
  "permission_level" text NOT NULL DEFAULT 'view'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "expires_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE public."identity_access_rules" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."circle_members" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "circle_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "joined_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."circle_members" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_contracts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid NOT NULL,
  "customer_id" uuid NOT NULL,
  "contract_number" text NOT NULL,
  "title" text NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "fx_rate" numeric NOT NULL DEFAULT 1.0,
  "transaction_price" numeric NOT NULL,
  "allocated_price" numeric NOT NULL DEFAULT 0,
  "recognized_revenue" numeric NOT NULL DEFAULT 0,
  "deferred_revenue" numeric NOT NULL DEFAULT 0,
  "unbilled_revenue" numeric NOT NULL DEFAULT 0,
  "billing_frequency" text NOT NULL DEFAULT 'UPFRONT'::text,
  "payment_terms_days" integer NOT NULL DEFAULT 30,
  "status" text NOT NULL DEFAULT 'DRAFT'::text,
  "version" integer NOT NULL DEFAULT 1,
  "accounting_standard" text NOT NULL DEFAULT 'IFRS'::text,
  "source_event_id" uuid,
  "ai_interpreted" boolean NOT NULL DEFAULT false,
  "ai_confidence" numeric,
  "ai_rationale" text,
  "attachment_url" text,
  "notes" text,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_contracts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."app_builder_projects" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "project_name" character varying NOT NULL,
  "description" text,
  "app_type" character varying DEFAULT 'custom'::character varying,
  "config" jsonb DEFAULT '{}'::jsonb,
  "is_published" boolean DEFAULT false,
  "published_app_id" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."app_builder_projects" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."conversation_participants" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "conversation_id" uuid,
  "user_id" uuid,
  "joined_at" timestamp with time zone DEFAULT now(),
  "role" text DEFAULT 'member'::text,
  "is_muted" boolean DEFAULT false,
  "is_archived" boolean DEFAULT false,
  "last_read_at" timestamp with time zone,
  "is_pinned" boolean NOT NULL DEFAULT false,
  "custom_notification_sound" text DEFAULT 'default'::text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."conversation_participants" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."community_events_db" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "event_title" text NOT NULL,
  "event_description" text NOT NULL,
  "event_type" text NOT NULL,
  "organizer_name" text NOT NULL,
  "organizer_id" uuid NOT NULL,
  "venue_name" text,
  "address" text NOT NULL,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "pincode" text,
  "latitude" numeric,
  "longitude" numeric,
  "event_date" timestamp with time zone NOT NULL,
  "end_date" timestamp with time zone,
  "max_participants" integer,
  "current_participants" integer DEFAULT 0,
  "is_free" boolean DEFAULT true,
  "entry_fee" numeric,
  "verified" boolean DEFAULT false,
  "is_featured" boolean DEFAULT false,
  "view_count" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."community_events_db" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."story_reactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "story_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "reaction" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."story_reactions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."symptom_checks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "symptoms" jsonb NOT NULL,
  "ai_assessment" text,
  "severity_level" text,
  "recommended_actions" jsonb,
  "specialist_type" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."symptom_checks" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."app_categories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "icon" text,
  "display_order" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."app_categories" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."ar_brand_filters" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "brand_id" uuid,
  "filter_name" text NOT NULL,
  "filter_description" text,
  "filter_asset_url" text NOT NULL,
  "preview_image_url" text,
  "category" text,
  "usage_count" integer DEFAULT 0,
  "is_featured" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."ar_brand_filters" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_credit_notes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid NOT NULL,
  "customer_id" uuid NOT NULL,
  "credit_note_number" text NOT NULL,
  "issue_date" date NOT NULL,
  "currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "fx_rate" numeric NOT NULL DEFAULT 1.0,
  "total" numeric NOT NULL DEFAULT 0,
  "unapplied_amount" numeric NOT NULL DEFAULT 0,
  "reason" text,
  "status" text NOT NULL DEFAULT 'ISSUED'::text,
  "journal_entry_id" uuid,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_credit_notes" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."search_cache" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "query" text NOT NULL,
  "response_data" jsonb NOT NULL,
  "hit_count" integer DEFAULT 1,
  "last_updated" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."search_cache" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."champion_reward_redemptions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "reward_id" uuid NOT NULL,
  "points_spent" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "delivery_meta" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."champion_reward_redemptions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."scheduled_notifications" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "type" text NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "data" jsonb DEFAULT '{}'::jsonb,
  "scheduled_at" timestamp with time zone NOT NULL,
  "recurring_frequency" text,
  "recurring_end_date" timestamp with time zone,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "sent_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."scheduled_notifications" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_invoices" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid NOT NULL,
  "customer_id" uuid NOT NULL,
  "invoice_number" text NOT NULL,
  "issue_date" date NOT NULL,
  "due_date" date NOT NULL,
  "currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "fx_rate" numeric NOT NULL DEFAULT 1.0,
  "subtotal" numeric NOT NULL DEFAULT 0,
  "tax_total" numeric NOT NULL DEFAULT 0,
  "discount_total" numeric NOT NULL DEFAULT 0,
  "total" numeric NOT NULL DEFAULT 0,
  "amount_paid" numeric NOT NULL DEFAULT 0,
  "amount_due" numeric NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'DRAFT'::text,
  "journal_entry_id" uuid,
  "source_event_id" uuid,
  "notes" text,
  "terms" text,
  "pdf_url" text,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_invoices" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_points" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "balance" integer NOT NULL DEFAULT 0,
  "lifetime_earned" integer NOT NULL DEFAULT 0,
  "lifetime_spent" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_points" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."caller_reports" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "reporter_id" uuid NOT NULL,
  "phone_number" text NOT NULL,
  "caller_name" text,
  "report_type" character varying NOT NULL DEFAULT 'spam'::character varying,
  "spam_type" character varying,
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."caller_reports" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."seo_attribution" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "session_id" text NOT NULL,
  "user_id" uuid,
  "host" text NOT NULL,
  "landing_path" text NOT NULL,
  "first_touch" jsonb,
  "last_touch" jsonb,
  "referrer_host" text,
  "utm_source" text,
  "utm_medium" text,
  "utm_campaign" text,
  "search_query" text,
  "has_external_signal" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."seo_attribution" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."provider_payouts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "provider_id" uuid NOT NULL,
  "period_start" date NOT NULL,
  "period_end" date NOT NULL,
  "total_earnings" numeric NOT NULL,
  "commission_deducted" numeric NOT NULL,
  "net_payout" numeric NOT NULL,
  "status" text DEFAULT 'pending'::text,
  "payment_method" text,
  "payment_reference" text,
  "processed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."provider_payouts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."emergency_contacts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "name" text NOT NULL,
  "phone_number" text NOT NULL,
  "relationship" text,
  "is_primary" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."emergency_contacts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_business_graph_edges" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "source_node_id" uuid NOT NULL,
  "target_node_id" uuid NOT NULL,
  "relationship_type" text NOT NULL,
  "weight" double precision DEFAULT 1.0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."crm_agent_tasks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_id" uuid NOT NULL,
  "lead_id" uuid,
  "task_type" text NOT NULL,
  "payload" jsonb DEFAULT '{}'::jsonb,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "attempts" integer DEFAULT 0,
  "max_attempts" integer DEFAULT 3,
  "error_log" text,
  "lease_owner" text,
  "lease_expires_at" timestamp with time zone,
  "result" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."crm_agent_tasks" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."challenge_participants" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "challenge_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "current_progress" integer DEFAULT 0,
  "completed" boolean DEFAULT false,
  "completed_at" timestamp with time zone,
  "joined_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."challenge_participants" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."favorite_results" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "result_id" uuid,
  "notes" text,
  "tags" text[],
  "reminder_date" timestamp with time zone,
  "reminder_sent" boolean DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."favorite_results" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."point_settlements" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "provider_id" uuid NOT NULL,
  "points_earned" integer NOT NULL,
  "inr_amount" numeric NOT NULL,
  "settlement_status" text DEFAULT 'pending'::text,
  "settlement_date" timestamp with time zone,
  "payment_reference" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."point_settlements" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."secrets_vault" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "key_name" text NOT NULL,
  "vault_ref" text NOT NULL,
  "description" text,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."secrets_vault" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."webrtc_signals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "call_id" uuid NOT NULL,
  "signal_type" text NOT NULL,
  "signal_data" jsonb NOT NULL,
  "from_user" uuid NOT NULL,
  "to_user" uuid NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."webrtc_signals" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."ai_traces" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "instance_id" uuid,
  "provider_id" character varying NOT NULL,
  "model_id" character varying NOT NULL,
  "prompt" text NOT NULL,
  "response" text,
  "latency_ms" integer NOT NULL,
  "tokens_used" integer NOT NULL DEFAULT 0,
  "execution_context" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."ai_traces" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_payment_allocations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "payment_id" uuid NOT NULL,
  "invoice_id" uuid,
  "bill_id" uuid,
  "allocated_amount" numeric NOT NULL,
  "discount_amount" numeric NOT NULL DEFAULT 0,
  "fee_amount" numeric NOT NULL DEFAULT 0,
  "fx_gain_loss" numeric NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_payment_allocations" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_login_streaks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "current_streak" integer DEFAULT 0,
  "longest_streak" integer DEFAULT 0,
  "last_login_date" date,
  "total_logins" integer DEFAULT 0,
  "streak_rewards_claimed" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_login_streaks" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."notification_preferences" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "chat_notifications" boolean DEFAULT true,
  "app_updates" boolean DEFAULT true,
  "marketing_alerts" boolean DEFAULT false,
  "transaction_alerts" boolean DEFAULT true,
  "call_notifications" boolean DEFAULT true,
  "group_notifications" boolean DEFAULT true,
  "sound_enabled" boolean DEFAULT true,
  "vibration_enabled" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "digest_enabled" boolean DEFAULT true,
  "digest_categories" jsonb DEFAULT jsonb_build_object('wallet', true, 'earnings', true, 'referrals', true, 'missions', true, 'chats', true, 'calls', true, 'bookings', true, 'food', true, 'jobs', true, 'wellness', true),
  PRIMARY KEY ("id")
);

ALTER TABLE public."notification_preferences" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_wallet" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "balance" numeric NOT NULL DEFAULT 0.00,
  "cashback_balance" numeric NOT NULL DEFAULT 0.00,
  "total_spent" numeric NOT NULL DEFAULT 0.00,
  "total_earned" numeric NOT NULL DEFAULT 0.00,
  "referral_earnings" numeric NOT NULL DEFAULT 0.00,
  "currency" character varying DEFAULT 'INR'::character varying,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_wallet" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."wallet_transactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "amount" numeric NOT NULL,
  "type" text NOT NULL,
  "category" text,
  "description" text,
  "reference_id" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."wallet_transactions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."local_business_db" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_name" text NOT NULL,
  "business_type" text NOT NULL,
  "category" text NOT NULL,
  "description" text,
  "address" text NOT NULL,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "pincode" text NOT NULL,
  "latitude" numeric,
  "longitude" numeric,
  "phone_number" text,
  "email" text,
  "website" text,
  "business_hours" jsonb,
  "services_products" text[],
  "rating_average" numeric DEFAULT 0,
  "rating_count" integer DEFAULT 0,
  "verified" boolean DEFAULT false,
  "verified_by" uuid,
  "verified_at" timestamp with time zone,
  "added_by" uuid NOT NULL,
  "monetization_tier" text DEFAULT 'free'::text,
  "is_partner" boolean DEFAULT false,
  "has_active_offers" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."local_business_db" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."kg_nodes" (
  "id" text NOT NULL,
  "tenant_id" text NOT NULL,
  "node_type" text NOT NULL,
  "name" text NOT NULL,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "source_capability" text,
  "source_object_id" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."kg_nodes" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_api_usage" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "api_name" text NOT NULL,
  "date" date DEFAULT CURRENT_DATE,
  "request_count" integer DEFAULT 0,
  "daily_limit" integer DEFAULT 10000,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_api_usage" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."micro_task_submissions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "assignment_id" uuid NOT NULL,
  "task_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "audio_listened_percent" integer,
  "selected_option_index" integer,
  "media_url" text,
  "media_hash" text,
  "rating" integer,
  "voice_note_url" text,
  "submitted_lat" numeric,
  "submitted_lng" numeric,
  "gps_distance_km" numeric,
  "device_hash" text,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "rejection_reason" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."micro_task_submissions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."gsc_opportunities" (
  "opportunity_id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "property_id" character varying,
  "query" text NOT NULL,
  "target_page" text,
  "country" character varying DEFAULT 'GLOBAL'::character varying,
  "quadrant" character varying NOT NULL,
  "current_position" numeric NOT NULL,
  "impressions" integer NOT NULL,
  "clicks" integer NOT NULL,
  "ctr" numeric NOT NULL,
  "commercial_intent" character varying NOT NULL DEFAULT 'MEDIUM'::character varying,
  "opportunity_score" numeric NOT NULL,
  "recommended_action" text NOT NULL,
  "status" character varying NOT NULL DEFAULT 'DETECTED'::character varying,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("opportunity_id")
);

ALTER TABLE public."gsc_opportunities" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."testbed_finance_ledgers" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "transaction_type" text NOT NULL,
  "amount" numeric NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "status" text NOT NULL DEFAULT 'draft'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."testbed_finance_ledgers" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."champion_notifications" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "kind" text NOT NULL,
  "old_value" text,
  "new_value" text NOT NULL,
  "message" text NOT NULL,
  "read_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."champion_notifications" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_coin_rewards" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "action_type" text NOT NULL,
  "coin_amount" integer NOT NULL,
  "rupee_value" numeric NOT NULL,
  "description" text,
  "is_active" boolean DEFAULT true,
  "max_per_day" integer,
  "max_total" integer,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_coin_rewards" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."provider_availability" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "provider_id" uuid NOT NULL,
  "date" date NOT NULL,
  "time_slots" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "is_available" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."provider_availability" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."wellness_stories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "title" text,
  "content" text NOT NULL,
  "media_url" text,
  "category" text,
  "is_public" boolean NOT NULL DEFAULT true,
  "likes_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."wellness_stories" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fame_cam_posts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "media_url" text NOT NULL,
  "media_type" character varying NOT NULL,
  "caption" text,
  "hashtags" text[],
  "ai_virality_score" integer DEFAULT 0,
  "actual_engagement" integer DEFAULT 0,
  "views_count" integer DEFAULT 0,
  "likes_count" integer DEFAULT 0,
  "shares_count" integer DEFAULT 0,
  "coins_earned" integer DEFAULT 0,
  "category_id" uuid,
  "is_viral" boolean DEFAULT false,
  "posted_to_external" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fame_cam_posts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."crm_lead_dossiers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_id" uuid NOT NULL,
  "lead_id" uuid NOT NULL,
  "executive_summary" text,
  "industry" text,
  "company_size" text,
  "estimated_revenue" text,
  "tech_stack" text[],
  "funding_info" jsonb,
  "key_decision_makers" jsonb[],
  "pain_points" text[],
  "competitors" text[],
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."crm_lead_dossiers" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."notification_bundles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "bundle_type" character varying NOT NULL,
  "notification_ids" uuid[] NOT NULL,
  "summary" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."notification_bundles" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_event_store" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL,
  "event_type" text NOT NULL,
  "aggregate_id" uuid NOT NULL,
  "aggregate_type" text NOT NULL,
  "payload" jsonb NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "version" integer NOT NULL DEFAULT 1,
  "actor_id" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."contacts_hash" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "phone_hash" text NOT NULL,
  "name" text,
  "name_confidence" numeric NOT NULL DEFAULT 0,
  "frequency" integer NOT NULL DEFAULT 0,
  "trust_score" integer NOT NULL DEFAULT 0,
  "is_business" boolean NOT NULL DEFAULT false,
  "is_spam" boolean NOT NULL DEFAULT false,
  "data_source" text NOT NULL DEFAULT 'crowdsourced'::text,
  "opt_out" boolean NOT NULL DEFAULT false,
  "last_enriched_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."contacts_hash" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."cc_metrics" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "metric_date" date NOT NULL DEFAULT CURRENT_DATE,
  "revenue" numeric DEFAULT 0,
  "active_users" integer DEFAULT 0,
  "leads_generated" integer DEFAULT 0,
  "conversion_rate" numeric DEFAULT 0,
  "extra" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."cc_metrics" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."communities" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "cover_image_url" text,
  "icon_url" text,
  "category" text,
  "is_public" boolean DEFAULT true,
  "member_count" integer DEFAULT 0,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."communities" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."profile_music" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "track_name" text NOT NULL,
  "artist_name" text,
  "preview_url" text,
  "spotify_uri" text,
  "album_art_url" text,
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."profile_music" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."channels" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "avatar_url" text,
  "owner_id" uuid NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."channels" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."testbed_hr_candidates" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "name" text NOT NULL,
  "role" text NOT NULL,
  "status" text NOT NULL DEFAULT 'sourced'::text,
  "resume_url" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."testbed_hr_candidates" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."finance_payroll" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "org_id" uuid NOT NULL,
  "period_start" date NOT NULL,
  "period_end" date NOT NULL,
  "total_amount" numeric NOT NULL,
  "status" text NOT NULL DEFAULT 'Draft'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."finance_payroll" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."referral_rewards" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "referrer_id" uuid NOT NULL,
  "referred_user_id" uuid NOT NULL,
  "referral_code" text NOT NULL,
  "points_awarded" integer DEFAULT 200,
  "status" earning_event_status NOT NULL DEFAULT 'pending'::earning_event_status,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "reward_rupees" numeric NOT NULL DEFAULT 0,
  "approved_at" timestamp with time zone,
  "paid_at" timestamp with time zone,
  "earning_event_id" uuid,
  PRIMARY KEY ("id")
);

ALTER TABLE public."referral_rewards" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."announcement_reads" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "announcement_id" uuid,
  "user_id" uuid,
  "read_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."announcement_reads" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_user_badges" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "badge_id" uuid NOT NULL,
  "earned_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_user_badges" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_user_subscriptions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "plan_type" character varying NOT NULL DEFAULT 'free'::character varying,
  "status" character varying NOT NULL DEFAULT 'active'::character varying,
  "price" numeric NOT NULL DEFAULT 99.00,
  "start_date" timestamp with time zone NOT NULL DEFAULT now(),
  "end_date" timestamp with time zone,
  "auto_renew" boolean DEFAULT true,
  "payment_method" character varying,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_user_subscriptions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."community_post_reactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "post_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "reaction_type" text NOT NULL DEFAULT 'like'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."community_post_reactions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_plus_wallet" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "balance" integer NOT NULL DEFAULT 0,
  "cashback_earned" integer NOT NULL DEFAULT 0,
  "total_spent" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_plus_wallet" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."appointments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "patient_id" uuid NOT NULL,
  "provider_id" uuid NOT NULL,
  "service_id" uuid,
  "appointment_date" timestamp with time zone NOT NULL,
  "duration_minutes" integer DEFAULT 30,
  "status" text DEFAULT 'pending'::text,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "diagnosis" text,
  "treatment_plan" jsonb DEFAULT '{}'::jsonb,
  "follow_up_date" date,
  "payment_method" text DEFAULT 'cash'::text,
  "points_used" integer DEFAULT 0,
  "cash_amount" numeric DEFAULT 0,
  PRIMARY KEY ("id")
);

ALTER TABLE public."appointments" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."community_posts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "community_id" uuid NOT NULL,
  "author_id" uuid NOT NULL,
  "content" text NOT NULL,
  "image_url" text,
  "is_pinned" boolean NOT NULL DEFAULT false,
  "likes_count" integer NOT NULL DEFAULT 0,
  "comments_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."community_posts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."automation_rules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "name" text,
  "trigger_type" text NOT NULL,
  "action_type" text NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "conditions" jsonb DEFAULT '{}'::jsonb,
  "actions" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."automation_rules" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_search_interactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "result_id" uuid,
  "action" text NOT NULL,
  "timestamp" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_search_interactions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."energy_pulse_sessions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "level" integer NOT NULL,
  "bpm" integer NOT NULL,
  "duration_seconds" integer NOT NULL,
  "total_beats" integer NOT NULL,
  "perfect_hits" integer DEFAULT 0,
  "good_hits" integer DEFAULT 0,
  "missed" integer DEFAULT 0,
  "score" integer DEFAULT 0,
  "combo_max" integer DEFAULT 0,
  "completed" boolean DEFAULT false,
  "coins_earned" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."energy_pulse_sessions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."job_listings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "posted_by" uuid NOT NULL,
  "title" text NOT NULL,
  "company" text NOT NULL,
  "description" text NOT NULL,
  "requirements" text,
  "salary_min" integer,
  "salary_max" integer,
  "location" text,
  "employment_type" text NOT NULL DEFAULT 'full-time'::text,
  "category" text,
  "is_remote" boolean NOT NULL DEFAULT false,
  "is_active" boolean NOT NULL DEFAULT true,
  "expires_at" timestamp with time zone,
  "applications_count" integer NOT NULL DEFAULT 0,
  "views_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."job_listings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_coin_balances" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "total_coins" integer NOT NULL DEFAULT 0,
  "lifetime_earned" integer NOT NULL DEFAULT 0,
  "lifetime_spent" integer NOT NULL DEFAULT 0,
  "current_streak" integer NOT NULL DEFAULT 0,
  "longest_streak" integer NOT NULL DEFAULT 0,
  "last_login_date" date,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_coin_balances" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."typing_indicators" (
  "conversation_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("conversation_id", "user_id")
);

ALTER TABLE public."typing_indicators" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_stealth_modes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "current_mode" text NOT NULL DEFAULT 'default'::text,
  "seller_verified" boolean DEFAULT false,
  "seller_verified_at" timestamp with time zone,
  "rewards_opted_in" boolean DEFAULT false,
  "rewards_opted_in_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_stealth_modes" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."audio_room_participants" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "room_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "is_speaking" boolean DEFAULT false,
  "is_muted" boolean DEFAULT false,
  "joined_at" timestamp with time zone DEFAULT now(),
  "left_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE public."audio_room_participants" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."os_events" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "event_type" text NOT NULL,
  "level" text NOT NULL,
  "source_subsystem" text NOT NULL,
  "timestamp" timestamp with time zone NOT NULL DEFAULT now(),
  "confidence" numeric,
  "verification_status" text,
  "provenance" text,
  "schema_version" text NOT NULL DEFAULT '1.0'::text,
  "producer_version" text NOT NULL DEFAULT '1.0'::text,
  "platform_version" text NOT NULL DEFAULT '1.0'::text,
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY ("id")
);

ALTER TABLE public."os_events" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_tenant_users" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "workspace_id" uuid,
  "team_id" uuid,
  "department_id" uuid,
  "business_unit_id" uuid,
  "organization_id" uuid,
  "role" text NOT NULL DEFAULT 'member'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."rec_candidates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "job_id" uuid,
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "email" text,
  "phone" text,
  "resume_url" text,
  "linkedin_url" text,
  "stage" text NOT NULL DEFAULT 'Applied'::text,
  "rating" integer DEFAULT 0,
  "ai_score" numeric,
  "ai_summary" text,
  "notes" text,
  "source" text DEFAULT 'Direct'::text,
  "tags" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."rec_candidates" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."call_context_cache" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "caller_number" text NOT NULL,
  "context_json" jsonb NOT NULL,
  "cached_at" timestamp with time zone NOT NULL DEFAULT now(),
  "expires_at" timestamp with time zone NOT NULL DEFAULT (now() + '00:05:00'::interval),
  PRIMARY KEY ("id")
);

ALTER TABLE public."call_context_cache" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_streaks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "current_streak" integer DEFAULT 0,
  "longest_streak" integer DEFAULT 0,
  "last_login_date" date,
  "total_logins" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_streaks" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."smart_push_preferences" (
  "user_id" uuid NOT NULL,
  "enabled" boolean NOT NULL DEFAULT true,
  "max_per_day" integer NOT NULL DEFAULT 6,
  "quiet_hours_start" integer NOT NULL DEFAULT 22,
  "quiet_hours_end" integer NOT NULL DEFAULT 8,
  "muted_modules" text[] NOT NULL DEFAULT ARRAY[]::text[],
  "language" text NOT NULL DEFAULT 'en'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("user_id")
);

ALTER TABLE public."smart_push_preferences" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."medical_access_audit" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "patient_id" uuid NOT NULL,
  "provider_id" uuid NOT NULL,
  "accessed_at" timestamp with time zone DEFAULT now(),
  "access_type" text NOT NULL,
  "table_name" text NOT NULL,
  "record_id" uuid,
  "ip_address" text,
  "user_agent" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."medical_access_audit" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."health_streaks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "family_member_id" uuid,
  "streak_type" text NOT NULL,
  "current_streak" integer DEFAULT 0,
  "longest_streak" integer DEFAULT 0,
  "last_activity_date" date,
  "coins_earned" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."health_streaks" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."conversation_notes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "conversation_id" uuid NOT NULL,
  "content" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."conversation_notes" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."merchant_deals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "vendor_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "original_price" numeric NOT NULL,
  "deal_price" numeric NOT NULL,
  "discount_percent" integer,
  "image_url" text,
  "category" text,
  "terms_conditions" text,
  "max_redemptions" integer,
  "current_redemptions" integer DEFAULT 0,
  "per_user_limit" integer DEFAULT 1,
  "valid_from" timestamp with time zone DEFAULT now(),
  "valid_until" timestamp with time zone,
  "is_active" boolean DEFAULT true,
  "is_featured" boolean DEFAULT false,
  "redemption_type" text DEFAULT 'in_store'::text,
  "coupon_code" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."merchant_deals" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_business_ad_rewards" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_id" uuid NOT NULL,
  "referrer_id" uuid,
  "ad_spend_amount" numeric NOT NULL,
  "commission_percentage" numeric DEFAULT 5.0,
  "coins_earned" integer NOT NULL,
  "payment_status" text DEFAULT 'pending'::text,
  "paid_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_business_ad_rewards" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."workflow_approvals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "run_id" uuid,
  "workflow_id" uuid,
  "step_index" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "requested_by" uuid,
  "approver_id" uuid,
  "reason" text,
  "decided_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."workflow_approvals" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."business_offerings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_id" uuid NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "price" numeric,
  "currency" text DEFAULT 'USD'::text,
  "image_url" text,
  "available" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."business_offerings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."event_outbox" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "org_id" uuid NOT NULL,
  "topic" text NOT NULL,
  "payload" jsonb NOT NULL,
  "status" text NOT NULL DEFAULT 'Pending'::text,
  "retry_count" integer DEFAULT 0,
  "error_message" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "processed_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."story_highlights" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "title" text NOT NULL,
  "cover_url" text,
  "stories" text[] DEFAULT '{}'::text[],
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."story_highlights" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."search_alerts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "saved_search_id" uuid,
  "new_results_count" integer DEFAULT 0,
  "alert_type" text DEFAULT 'new_results'::text,
  "alert_data" jsonb DEFAULT '{}'::jsonb,
  "is_read" boolean DEFAULT false,
  "sent_at" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."search_alerts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."messages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "conversation_id" uuid,
  "sender_id" uuid,
  "content" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "read_at" timestamp with time zone,
  "message_type" text DEFAULT 'text'::text,
  "media_url" text,
  "file_name" text,
  "file_size" bigint,
  "duration" integer,
  "reply_to_id" uuid,
  "forwarded_from_id" uuid,
  "is_edited" boolean DEFAULT false,
  "edited_at" timestamp with time zone,
  "is_deleted" boolean DEFAULT false,
  "deleted_at" timestamp with time zone,
  "is_starred" boolean DEFAULT false,
  "location_latitude" numeric,
  "location_longitude" numeric,
  "location_name" text,
  "poll_question" text,
  "poll_options" jsonb,
  "status" text DEFAULT 'sent'::text,
  "reactions" jsonb DEFAULT '[]'::jsonb,
  "scheduled_for" timestamp with time zone,
  "is_encrypted" boolean DEFAULT false,
  "encryption_key_id" text,
  "media_attachments" jsonb DEFAULT '[]'::jsonb,
  "media_thumbnail_url" text,
  "original_message_id" uuid,
  "reply_to_message_content" text,
  "reply_to_sender_name" text,
  "expires_at" timestamp with time zone,
  "is_expired" boolean DEFAULT false,
  "encrypted_iv" text,
  "encrypted_key" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."messages" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_os_apps" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "app_name" text NOT NULL,
  "package_name" text NOT NULL,
  "version" text NOT NULL DEFAULT '1.0.0'::text,
  "install_size" bigint DEFAULT 0,
  "runtime_permissions" jsonb DEFAULT '[]'::jsonb,
  "lifecycle_state" text NOT NULL DEFAULT 'installed'::text,
  "last_opened_at" timestamp with time zone,
  "cpu_usage_avg" double precision DEFAULT 0.0,
  "memory_usage_peak" bigint DEFAULT 0,
  "battery_drain_rate" double precision DEFAULT 0.0,
  "data_usage_total" bigint DEFAULT 0,
  "storage_quota" bigint DEFAULT 104857600,
  "storage_used" bigint DEFAULT 0,
  "is_system_app" boolean DEFAULT false,
  "auto_update_enabled" boolean DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_os_apps" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."ai_agents" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "agent_name" text NOT NULL,
  "agent_avatar_url" text,
  "agent_description" text,
  "agent_personality" text NOT NULL DEFAULT 'helpful and professional'::text,
  "agent_purpose" text NOT NULL,
  "knowledge_base" text,
  "auto_reply_enabled" boolean DEFAULT false,
  "response_delay_seconds" integer DEFAULT 2,
  "greeting_message" text,
  "is_active" boolean DEFAULT true,
  "total_conversations" integer DEFAULT 0,
  "total_messages" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."ai_agents" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fcm_delivery_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "call_id" text NOT NULL,
  "receiver_id" uuid NOT NULL,
  "caller_id" uuid NOT NULL,
  "device_token_masked" text,
  "platform" text,
  "fcm_message_id" text,
  "fcm_status" text NOT NULL DEFAULT 'pending'::text,
  "fcm_error" text,
  "api_version" text DEFAULT 'v1'::text,
  "http_status" integer,
  "tokens_found" integer DEFAULT 0,
  "tokens_sent" integer DEFAULT 0,
  "tokens_failed" integer DEFAULT 0,
  "delivery_latency_ms" integer,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fcm_delivery_logs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."post_comments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "post_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."post_comments" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."auth_exchange_attempts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "phone_key" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."auth_exchange_attempts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."micro_task_verifications" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "submission_id" uuid NOT NULL,
  "verification_type" text NOT NULL,
  "verified_by" uuid,
  "result" text NOT NULL,
  "reason" text,
  "coins_awarded" integer,
  "rupees_awarded" numeric,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."micro_task_verifications" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."search_performance_metrics" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "search_type" character varying NOT NULL,
  "source" character varying NOT NULL,
  "avg_response_time_ms" integer,
  "success_rate" numeric,
  "total_requests" integer DEFAULT 0,
  "failed_requests" integer DEFAULT 0,
  "date" date NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."search_performance_metrics" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_reconciliation_sessions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "bank_account_id" uuid NOT NULL,
  "statement_id" uuid,
  "period_id" uuid NOT NULL,
  "as_of_date" date NOT NULL,
  "statement_ending_balance" numeric NOT NULL,
  "gl_cash_balance" numeric NOT NULL,
  "matched_credits_total" numeric NOT NULL DEFAULT 0,
  "matched_debits_total" numeric NOT NULL DEFAULT 0,
  "unreconciled_difference" numeric NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'IN_PROGRESS'::text,
  "signed_off_by" uuid,
  "signed_off_at" timestamp with time zone,
  "notes" text,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_reconciliation_sessions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_fame_achievements" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "achievement_id" uuid,
  "earned_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_fame_achievements" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."growth_events" (
  "event_id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "event_type" character varying NOT NULL,
  "category" character varying NOT NULL,
  "occurred_at" timestamp with time zone NOT NULL DEFAULT now(),
  "client_timestamp" bigint NOT NULL,
  "server_timestamp" timestamp with time zone NOT NULL DEFAULT now(),
  "anonymous_id" character varying NOT NULL,
  "user_id" uuid,
  "session_id" character varying NOT NULL,
  "source" character varying NOT NULL DEFAULT 'direct'::character varying,
  "medium" character varying DEFAULT 'none'::character varying,
  "campaign" character varying DEFAULT NULL::character varying,
  "landing_page" text NOT NULL,
  "referrer" text,
  "referral_code" character varying DEFAULT NULL::character varying,
  "referral_user_id" uuid,
  "country" character varying DEFAULT 'UNKNOWN'::character varying,
  "language" character varying DEFAULT 'en'::character varying,
  "device" character varying DEFAULT 'desktop'::character varying,
  "browser" character varying DEFAULT 'unknown'::character varying,
  "call_id" character varying DEFAULT NULL::character varying,
  "room_id" character varying DEFAULT NULL::character varying,
  "call_duration_sec" integer DEFAULT 0,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  PRIMARY KEY ("event_id")
);

ALTER TABLE public."growth_events" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."point_packages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "points" integer NOT NULL,
  "price_usd" numeric NOT NULL,
  "bonus_points" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "display_order" integer DEFAULT 0,
  "badge_text" text,
  "popular" boolean DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."point_packages" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."rec_jobs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "title" text NOT NULL,
  "department" text,
  "location" text,
  "type" text NOT NULL DEFAULT 'Full-time'::text,
  "status" text NOT NULL DEFAULT 'Open'::text,
  "description" text,
  "requirements" text,
  "salary_min" integer,
  "salary_max" integer,
  "currency" text DEFAULT 'INR'::text,
  "openings" integer DEFAULT 1,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."rec_jobs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."workflow_versions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "workflow_id" uuid NOT NULL,
  "version" integer NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "nodes" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "edges" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "status" text NOT NULL DEFAULT 'draft'::text,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "manifest" jsonb DEFAULT '{}'::jsonb,
  "graph_checksum" text,
  "published_at" timestamp with time zone,
  "published_by" uuid,
  "parent_version_id" uuid,
  PRIMARY KEY ("id")
);

ALTER TABLE public."workflow_versions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."cc_plans" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "description" text,
  "department" text NOT NULL,
  "impact_level" text NOT NULL DEFAULT 'low'::text,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "generated_by" text NOT NULL DEFAULT 'ai_ceo'::text,
  "payload" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "decided_at" timestamp with time zone,
  "decided_by" uuid,
  PRIMARY KEY ("id")
);

ALTER TABLE public."cc_plans" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_installed_apps" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "app_id" uuid NOT NULL,
  "installed_at" timestamp with time zone DEFAULT now(),
  "last_opened_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_installed_apps" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."prescription_uploads" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "family_member_id" uuid,
  "image_url" text NOT NULL,
  "ocr_raw_text" text,
  "ocr_parsed_data" jsonb,
  "doctor_name" text,
  "hospital_name" text,
  "prescription_date" date,
  "status" text DEFAULT 'pending'::text,
  "verified_by" uuid,
  "verified_at" timestamp with time zone,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."prescription_uploads" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."organizations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "domain" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."organizations" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."provider_runs" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "provider_id" character varying NOT NULL,
  "action" character varying NOT NULL,
  "request_payload" jsonb,
  "response_payload" jsonb,
  "status" character varying NOT NULL,
  "latency_ms" integer NOT NULL,
  "execution_context" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."provider_runs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."scheduled_messages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "conversation_id" uuid NOT NULL,
  "sender_id" uuid NOT NULL,
  "content" text NOT NULL,
  "message_type" text DEFAULT 'text'::text,
  "media_attachments" jsonb,
  "scheduled_for" timestamp with time zone NOT NULL,
  "status" text DEFAULT 'pending'::text,
  "sent_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."scheduled_messages" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."business_workflows" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "profile_id" uuid NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "nodes" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "edges" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "status" text NOT NULL DEFAULT 'draft'::text,
  "run_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "version" integer NOT NULL DEFAULT 1,
  "current_version_id" uuid,
  "graph" jsonb DEFAULT '{}'::jsonb,
  "active_version_id" uuid,
  PRIMARY KEY ("id")
);

ALTER TABLE public."business_workflows" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."studio_design_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "category" text NOT NULL,
  "thumbnail_url" text,
  "template_data" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "dimensions" jsonb DEFAULT '{"width": 1080, "height": 1080}'::jsonb,
  "is_premium" boolean DEFAULT false,
  "usage_count" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."studio_design_templates" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."cc_outreach" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "lead_id" uuid,
  "plan_id" uuid,
  "channel" text NOT NULL DEFAULT 'linkedin'::text,
  "subject" text,
  "message_body" text NOT NULL,
  "sequence_step" integer DEFAULT 1,
  "status" text NOT NULL DEFAULT 'draft'::text,
  "approved_by" uuid,
  "approved_at" timestamp with time zone,
  "sent_at" timestamp with time zone,
  "replied_at" timestamp with time zone,
  "reply_content" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."cc_outreach" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."audit_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "actor_id" uuid,
  "action" text NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" uuid,
  "correlation_id" uuid,
  "changes" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."audit_logs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_events" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "idempotency_key" text NOT NULL,
  "event_type" text NOT NULL,
  "event_version" text NOT NULL DEFAULT '1.0'::text,
  "source_system" text NOT NULL,
  "source_object_type" text,
  "source_object_id" text,
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid,
  "correlation_id" text,
  "causation_id" text,
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "schema_version" text NOT NULL DEFAULT '1.0'::text,
  "processing_status" text NOT NULL DEFAULT 'PENDING'::text,
  "processed_at" timestamp with time zone,
  "error_detail" text,
  "retry_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_events" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."local_offers_db" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "offer_title" text NOT NULL,
  "offer_description" text NOT NULL,
  "offer_type" text NOT NULL,
  "business_id" uuid,
  "business_name" text NOT NULL,
  "discount_percentage" integer,
  "original_price" numeric,
  "offer_price" numeric,
  "address" text,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "pincode" text,
  "latitude" numeric,
  "longitude" numeric,
  "valid_from" timestamp with time zone DEFAULT now(),
  "valid_until" timestamp with time zone,
  "terms_conditions" text,
  "redemption_code" text,
  "redemption_count" integer DEFAULT 0,
  "max_redemptions" integer,
  "verified" boolean DEFAULT false,
  "posted_by" uuid NOT NULL,
  "monetization_tier" text DEFAULT 'free'::text,
  "is_sponsored" boolean DEFAULT false,
  "view_count" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."local_offers_db" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."workspaces" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "owner_id" uuid NOT NULL,
  "name" text NOT NULL,
  "industry" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."workspaces" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."vendors" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "vendor_type" vendor_type NOT NULL,
  "business_name" text NOT NULL,
  "business_email" text,
  "business_phone" text,
  "logo_url" text,
  "cover_image_url" text,
  "description" text,
  "address" text,
  "city" text,
  "state" text,
  "pincode" text,
  "latitude" numeric,
  "longitude" numeric,
  "gst_number" text,
  "pan_number" text,
  "bank_account_number" text,
  "bank_ifsc" text,
  "bank_account_holder" text,
  "is_verified" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "verification_status" text DEFAULT 'pending'::text,
  "verified_at" timestamp with time zone,
  "verified_by" uuid,
  "rating" numeric DEFAULT 0,
  "total_reviews" integer DEFAULT 0,
  "total_orders" integer DEFAULT 0,
  "total_revenue" numeric DEFAULT 0,
  "commission_rate" numeric DEFAULT 10.00,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."vendors" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."health_goals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "goal_type" text NOT NULL,
  "goal_name" text NOT NULL,
  "target_value" numeric NOT NULL,
  "current_value" numeric DEFAULT 0,
  "unit" text NOT NULL,
  "start_date" date NOT NULL DEFAULT CURRENT_DATE,
  "target_date" date,
  "status" text DEFAULT 'active'::text,
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."health_goals" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."service_bookings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "booking_number" text,
  "customer_id" uuid NOT NULL,
  "provider_id" uuid NOT NULL,
  "service_id" uuid NOT NULL,
  "category_id" uuid NOT NULL,
  "scheduled_date" date NOT NULL,
  "scheduled_time" time NOT NULL,
  "service_address" text NOT NULL,
  "latitude" numeric,
  "longitude" numeric,
  "contact_phone" text,
  "special_instructions" text,
  "status" text DEFAULT 'pending'::text,
  "pricing_details" jsonb,
  "subtotal" numeric NOT NULL,
  "discount_amount" numeric DEFAULT 0,
  "total_amount" numeric NOT NULL,
  "commission_amount" numeric,
  "provider_earnings" numeric,
  "coupon_code" text,
  "payment_method" text,
  "payment_status" text DEFAULT 'pending'::text,
  "payment_transaction_id" text,
  "accepted_at" timestamp with time zone,
  "reached_at" timestamp with time zone,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "cancelled_at" timestamp with time zone,
  "cancellation_reason" text,
  "before_photos" jsonb DEFAULT '[]'::jsonb,
  "after_photos" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."service_bookings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."official_account_posts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "account_id" uuid NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "post_type" text NOT NULL DEFAULT 'article'::text,
  "media_url" text,
  "is_published" boolean NOT NULL DEFAULT true,
  "view_count" integer NOT NULL DEFAULT 0,
  "like_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."official_account_posts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."nutrition_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "log_date" date NOT NULL DEFAULT CURRENT_DATE,
  "meal_type" text NOT NULL,
  "food_name" text NOT NULL,
  "calories" integer,
  "protein_g" numeric,
  "carbs_g" numeric,
  "fat_g" numeric,
  "fiber_g" numeric,
  "water_ml" integer,
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."nutrition_logs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."gmail_imported_contacts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "google_contact_id" text,
  "name" text,
  "email" text,
  "phone" text,
  "photo_url" text,
  "is_chatr_user" boolean DEFAULT false,
  "chatr_user_id" uuid,
  "imported_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."gmail_imported_contacts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."blocked_contacts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "blocked_user_id" uuid NOT NULL,
  "blocked_at" timestamp with time zone DEFAULT now(),
  "reason" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."blocked_contacts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_org_members" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "org_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role" text NOT NULL DEFAULT 'member'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."sys_org_members" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."crm_pipelines" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_id" uuid NOT NULL,
  "name" text NOT NULL,
  "stages" jsonb NOT NULL DEFAULT '[{"name": "New Lead", "color": "blue", "order": 1}, {"name": "Contacted", "color": "yellow", "order": 2}, {"name": "Qualified", "color": "purple", "order": 3}, {"name": "Proposal", "color": "orange", "order": 4}, {"name": "Negotiation", "color": "pink", "order": 5}, {"name": "Won", "color": "green", "order": 6}, {"name": "Lost", "color": "red", "order": 7}]'::jsonb,
  "is_default" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."crm_pipelines" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."medication_interactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "medication_1" text NOT NULL,
  "medication_2" text NOT NULL,
  "interaction_severity" text NOT NULL,
  "description" text NOT NULL,
  "recommendation" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."medication_interactions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."vendor_settlements" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "vendor_id" uuid NOT NULL,
  "period_start" date NOT NULL,
  "period_end" date NOT NULL,
  "gross_amount" numeric NOT NULL,
  "commission_amount" numeric NOT NULL,
  "net_amount" numeric NOT NULL,
  "order_count" integer DEFAULT 0,
  "status" text DEFAULT 'pending'::text,
  "payment_reference" text,
  "paid_at" timestamp with time zone,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."vendor_settlements" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."game_user_achievements" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "achievement_id" uuid NOT NULL,
  "unlocked_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."game_user_achievements" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."cce_sessions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "session_id" text NOT NULL,
  "initiator_id" uuid,
  "peer_id" uuid,
  "started_at" timestamp with time zone NOT NULL DEFAULT now(),
  "ended_at" timestamp with time zone,
  "transport_history" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "final_transport" text,
  "total_handoffs" integer DEFAULT 0,
  "avg_quality" double precision,
  "min_quality" double precision,
  "status" text DEFAULT 'active'::text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."cce_sessions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."moment_shares" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "moment_id" uuid NOT NULL,
  "shared_by" uuid NOT NULL,
  "shared_to_platform" character varying,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."moment_shares" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_vendors" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid,
  "vendor_code" text NOT NULL,
  "name" text NOT NULL,
  "email" text,
  "billing_address" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "tax_identifier" text,
  "tds_category" text,
  "currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "payment_terms_days" integer NOT NULL DEFAULT 30,
  "bank_details" jsonb DEFAULT '{}'::jsonb,
  "is_1099_eligible" boolean NOT NULL DEFAULT false,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_vendors" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_roles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "role" app_role NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_roles" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_referral_network" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "root_user_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "level" integer NOT NULL,
  "total_network_size" integer DEFAULT 0,
  "total_coins_from_network" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_referral_network" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."crm_leads" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_id" uuid NOT NULL,
  "customer_id" uuid,
  "conversation_id" uuid,
  "name" text NOT NULL,
  "email" text,
  "phone" text,
  "company" text,
  "status" text DEFAULT 'new'::text,
  "source" text DEFAULT 'manual'::text,
  "deal_value" numeric DEFAULT 0,
  "currency" text DEFAULT 'INR'::text,
  "probability" integer DEFAULT 0,
  "expected_close_date" date,
  "assigned_to" uuid,
  "tags" text[] DEFAULT ARRAY[]::text[],
  "priority" text DEFAULT 'normal'::text,
  "notes" text,
  "custom_fields" jsonb DEFAULT '{}'::jsonb,
  "last_contacted_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."crm_leads" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."voice_transcriptions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "message_id" uuid NOT NULL,
  "transcription" text NOT NULL,
  "language" character varying,
  "confidence" numeric,
  "duration_seconds" integer,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."voice_transcriptions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."channel_messages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "channel_id" uuid NOT NULL,
  "sender_id" uuid NOT NULL,
  "content" text,
  "message_type" text NOT NULL DEFAULT 'text'::text,
  "media_url" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."channel_messages" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."seller_mode_settings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "business_name" text,
  "business_category" text,
  "business_hours" jsonb DEFAULT '{}'::jsonb,
  "quick_replies" jsonb DEFAULT '[]'::jsonb,
  "auto_response_enabled" boolean DEFAULT false,
  "auto_response_message" text,
  "away_message" text,
  "priority_support" boolean DEFAULT false,
  "broadcast_enabled" boolean DEFAULT true,
  "analytics_enabled" boolean DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."seller_mode_settings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."geofence_events" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "geofence_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "event_type" text NOT NULL,
  "lat" double precision NOT NULL,
  "lng" double precision NOT NULL,
  "timestamp" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."geofence_events" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."parallel_you_challenges" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "level" integer NOT NULL,
  "challenge_type" text NOT NULL,
  "challenge_data" jsonb NOT NULL,
  "ai_response" jsonb,
  "user_response" jsonb,
  "winner" text,
  "score" integer DEFAULT 0,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."parallel_you_challenges" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."candidates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "resume_url" text,
  "status" text NOT NULL DEFAULT 'New'::text,
  "rating" integer DEFAULT 0,
  "applied_for" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("id")
);

ALTER TABLE public."candidates" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."vaccination_records" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "vaccine_name" text NOT NULL,
  "dose_number" integer NOT NULL DEFAULT 1,
  "date_administered" date NOT NULL,
  "next_dose_date" date,
  "administered_by" text,
  "batch_number" text,
  "certificate_url" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "url_expires_at" timestamp with time zone,
  "requires_signed_url" boolean DEFAULT true,
  PRIMARY KEY ("id")
);

ALTER TABLE public."vaccination_records" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."qr_payments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "payer_id" uuid NOT NULL,
  "receiver_id" uuid NOT NULL,
  "amount_points" integer NOT NULL,
  "transaction_type" text NOT NULL,
  "qr_token" text NOT NULL,
  "status" text DEFAULT 'pending'::text,
  "description" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "completed_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE public."qr_payments" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."business_catalog" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_id" uuid NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "category" text NOT NULL,
  "price" numeric,
  "currency" text DEFAULT 'INR'::text,
  "images" jsonb DEFAULT '[]'::jsonb,
  "is_service" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "stock_quantity" integer,
  "features" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."business_catalog" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."deal_merchant_details" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "vendor_id" uuid NOT NULL,
  "business_category" text,
  "website_url" text,
  "social_media" jsonb DEFAULT '{}'::jsonb,
  "terms_accepted" boolean DEFAULT false,
  "max_active_deals" integer DEFAULT 10,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."deal_merchant_details" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."seller_kyc_documents" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "seller_id" uuid NOT NULL,
  "document_type" character varying NOT NULL,
  "document_url" text NOT NULL,
  "status" character varying NOT NULL DEFAULT 'pending'::character varying,
  "verified_by" uuid,
  "verified_at" timestamp with time zone,
  "rejection_reason" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."seller_kyc_documents" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."business_profiles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "business_name" text NOT NULL,
  "business_type" text NOT NULL,
  "description" text,
  "logo_url" text,
  "verified" boolean DEFAULT false,
  "verification_date" timestamp with time zone,
  "business_hours" jsonb DEFAULT '{}'::jsonb,
  "contact_info" jsonb DEFAULT '{}'::jsonb,
  "location" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "gst_number" text,
  "pan_number" text,
  "business_email" text,
  "business_phone" text,
  "verification_documents" jsonb DEFAULT '[]'::jsonb,
  "broadcasts_enabled" boolean DEFAULT true,
  "notification_preferences" jsonb DEFAULT '{"daily_digest": true, "new_lead_alerts": true, "sms_notifications": false, "email_notifications": true, "order_notifications": true, "review_notifications": true}'::jsonb,
  PRIMARY KEY ("id")
);

ALTER TABLE public."business_profiles" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."mini_apps" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "app_name" text NOT NULL,
  "description" text,
  "category_id" uuid,
  "developer_id" uuid,
  "icon_url" text,
  "cover_image_url" text,
  "app_url" text NOT NULL,
  "version" text DEFAULT '1.0.0'::text,
  "rating_average" numeric DEFAULT 0,
  "rating_count" integer DEFAULT 0,
  "install_count" integer DEFAULT 0,
  "is_verified" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "tags" text[],
  "screenshots" text[],
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "is_trending" boolean DEFAULT false,
  "launch_date" timestamp with time zone DEFAULT now(),
  "monthly_active_users" integer DEFAULT 0,
  "app_type" character varying DEFAULT 'web'::character varying,
  "apk_url" text,
  "package_name" text,
  "min_android_version" text,
  "file_size_bytes" bigint,
  "downloads_count" integer DEFAULT 0,
  "short_description" text,
  "privacy_policy_url" text,
  "support_email" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."mini_apps" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."prescriptions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "provider_id" uuid,
  "medication_name" text NOT NULL,
  "dosage" text NOT NULL,
  "frequency" text NOT NULL,
  "duration" text,
  "prescribed_date" date NOT NULL DEFAULT CURRENT_DATE,
  "status" text DEFAULT 'active'::text,
  "notes" text,
  "prescription_file_url" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "url_expires_at" timestamp with time zone,
  "requires_signed_url" boolean DEFAULT true,
  PRIMARY KEY ("id")
);

ALTER TABLE public."prescriptions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."network_metrics" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "call_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "timestamp" timestamp with time zone NOT NULL DEFAULT now(),
  "bandwidth_kbps" numeric,
  "packet_loss_percent" numeric,
  "rtt_ms" numeric,
  "jitter_ms" numeric,
  "fps" numeric,
  "resolution_width" integer,
  "resolution_height" integer,
  "codec" text,
  "connection_type" text,
  "candidate_type" text,
  "bitrate_kbps" numeric,
  "frames_dropped" integer,
  "quality_level" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."network_metrics" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."profiles" (
  "id" uuid NOT NULL,
  "username" text NOT NULL,
  "avatar_url" text,
  "status" text DEFAULT 'Hey there! I am using Chatr'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "phone_number" text NOT NULL,
  "is_phone_verified" boolean DEFAULT false,
  "last_seen" timestamp with time zone DEFAULT now(),
  "is_online" boolean DEFAULT false,
  "age" integer,
  "gender" text,
  "medical_history" jsonb DEFAULT '[]'::jsonb,
  "lifestyle" jsonb DEFAULT '{}'::jsonb,
  "health_goals" text[],
  "onboarding_completed" boolean DEFAULT false,
  "email" text NOT NULL,
  "phone_search" text,
  "preferred_language" character varying DEFAULT 'en'::character varying,
  "notification_tone" text DEFAULT '/ringtones/trap-text.mp3'::text,
  "call_ringtone" text DEFAULT '/ringtones/perfect-ring.mp3'::text,
  "qr_code_token" text,
  "streak_count" integer DEFAULT 0,
  "referral_code" text,
  "google_id" text,
  "preferred_auth_method" text DEFAULT 'pin'::text,
  "pin_setup_completed" boolean DEFAULT false,
  "phone_hash" text,
  "profile_completed_at" timestamp with time zone,
  "contacts_synced" boolean DEFAULT false,
  "last_contact_sync" timestamp with time zone,
  "preferred_country_code" text DEFAULT '+91'::text,
  "full_name" text,
  "status_message" text DEFAULT 'Hey there! I''m using chatr.chat'::text,
  "pin" text,
  "auto_translate_enabled" boolean DEFAULT false,
  "auto_backup_enabled" boolean DEFAULT false,
  "auto_backup_frequency" text DEFAULT 'weekly'::text,
  "last_backup_at" timestamp with time zone,
  "location_city" text,
  "location_country" text,
  "location_latitude" double precision,
  "location_longitude" double precision,
  "location_ip" text,
  "location_updated_at" timestamp with time zone,
  "location_sharing_enabled" boolean DEFAULT true,
  "location_precision" text DEFAULT 'city'::text,
  "last_seen_at" timestamp with time zone DEFAULT now(),
  "public_key" text,
  "is_verified" boolean DEFAULT false,
  "firebase_uid" text,
  "pin_hash" text,
  "privacy_settings" jsonb DEFAULT '{}'::jsonb,
  "delivery_address" jsonb,
  "call_forwarding_settings" jsonb DEFAULT '{}'::jsonb,
  "call_blocking_settings" jsonb DEFAULT '{}'::jsonb,
  "ivr_settings" jsonb DEFAULT '{}'::jsonb,
  "speed_dial_settings" jsonb DEFAULT '{}'::jsonb,
  "primary_handle" text,
  "identity_tier" text DEFAULT 'free'::text,
  "ai_clone_enabled" boolean DEFAULT false,
  "discovery_enabled" boolean DEFAULT true,
  "profile_theme_color" text,
  "profile_theme_style" text DEFAULT 'solid'::text,
  "profile_cover_url" text,
  "default_notification_sound" text DEFAULT 'default'::text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."profiles" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."last_locations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "session_id" text,
  "lat" double precision NOT NULL,
  "lon" double precision NOT NULL,
  "accuracy_m" double precision,
  "source" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."last_locations" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."subscription_plans" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "monthly_price" numeric NOT NULL DEFAULT 0,
  "yearly_price" numeric,
  "features" jsonb DEFAULT '{}'::jsonb,
  "limits" jsonb DEFAULT '{}'::jsonb,
  "is_active" boolean DEFAULT true,
  "display_order" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."subscription_plans" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."trending_searches" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "query" text NOT NULL,
  "search_count" integer DEFAULT 1,
  "category" text,
  "last_searched_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."trending_searches" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."point_expirations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "points_amount" integer NOT NULL,
  "earned_at" timestamp with time zone NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."point_expirations" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_intercompany_transactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "from_legal_entity_id" uuid NOT NULL,
  "to_legal_entity_id" uuid NOT NULL,
  "transaction_number" text NOT NULL,
  "transaction_date" date NOT NULL,
  "description" text NOT NULL,
  "amount" numeric NOT NULL,
  "currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "from_journal_entry_id" uuid,
  "to_journal_entry_id" uuid,
  "elimination_entry_id" uuid,
  "status" text NOT NULL DEFAULT 'PENDING'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_intercompany_transactions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_rewards" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "reward_type" text NOT NULL,
  "reward_name" text NOT NULL,
  "reward_value" integer DEFAULT 0,
  "coins_spent" integer DEFAULT 0,
  "status" text DEFAULT 'active'::text,
  "redeemed_at" timestamp with time zone,
  "expires_at" timestamp with time zone,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_rewards" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."champion_tier_rewards" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "tier" text NOT NULL,
  "min_points" integer NOT NULL,
  "perks" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "badge_color" text NOT NULL,
  "badge_icon" text NOT NULL DEFAULT 'medal'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."champion_tier_rewards" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."contact_intelligence" (
  "user_id" uuid NOT NULL,
  "contact_id" text NOT NULL,
  "pickup_likelihood" numeric DEFAULT 0.5,
  "optimal_call_window_start" time,
  "optimal_call_window_end" time,
  "preferred_route" text,
  "volatility" text,
  "drops_prevented_count" integer DEFAULT 0,
  "last_updated" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  "id" uuid DEFAULT gen_random_uuid(),
  "total_calls" integer NOT NULL DEFAULT 0,
  "answered_calls" integer NOT NULL DEFAULT 0,
  "resolved_calls" integer NOT NULL DEFAULT 0,
  "missed_calls" integer NOT NULL DEFAULT 0,
  "voicemail_calls" integer NOT NULL DEFAULT 0,
  "resolution_rate" float4 NOT NULL DEFAULT 0.5,
  "drop_rate" float4 NOT NULL DEFAULT 0.0,
  "best_hour_utc" smallint,
  "avg_voip_score" float4,
  "avg_gsm_score" float4,
  "avg_clarity_score" float4,
  "last_call_at" timestamp with time zone,
  "last_outcome" text,
  PRIMARY KEY ("user_id", "contact_id")
);

ALTER TABLE public."contact_intelligence" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."legal_contracts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "org_id" uuid NOT NULL,
  "title" text NOT NULL,
  "party_name" text NOT NULL,
  "value" numeric,
  "status" text NOT NULL DEFAULT 'Draft'::text,
  "ai_summary" text,
  "risk_factors" jsonb,
  "suggested_review_areas" jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_by" uuid,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer NOT NULL DEFAULT 1,
  PRIMARY KEY ("id")
);

ALTER TABLE public."legal_contracts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."album_photos" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "album_id" uuid NOT NULL,
  "photo_url" text NOT NULL,
  "caption" text,
  "display_order" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."album_photos" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_prepaids" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid NOT NULL,
  "prepaid_number" text NOT NULL,
  "title" text NOT NULL,
  "vendor_id" uuid,
  "total_amount" numeric NOT NULL,
  "amortized_amount" numeric NOT NULL DEFAULT 0,
  "remaining_amount" numeric NOT NULL,
  "currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "prepaid_asset_account_id" uuid NOT NULL,
  "expense_account_id" uuid NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "duration_months" integer NOT NULL,
  "monthly_amortization" numeric NOT NULL,
  "status" text NOT NULL DEFAULT 'ACTIVE'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_prepaids" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_healthcare_appointments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "provider_id" uuid,
  "user_id" uuid,
  "appointment_date" date NOT NULL,
  "appointment_time" time NOT NULL,
  "reason" text,
  "status" text DEFAULT 'pending'::text,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_healthcare_appointments" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_badges" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "badge_type" character varying NOT NULL,
  "verified_at" timestamp with time zone DEFAULT now(),
  "verified_by" uuid,
  "verification_details" jsonb,
  "badge_name" text,
  "purchased_at" timestamp with time zone DEFAULT now(),
  "is_active" boolean NOT NULL DEFAULT true,
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_badges" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."referrals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "referrer_id" uuid NOT NULL,
  "referred_id" uuid NOT NULL,
  "reward_claimed" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  "referral_code" text,
  "status" referral_status NOT NULL DEFAULT 'signed_up'::referral_status,
  "verified_at" timestamp with time zone,
  "rewarded_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE public."referrals" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."workflow_checkpoints" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "instance_id" uuid,
  "node_id" character varying NOT NULL,
  "state_snapshot" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."workflow_checkpoints" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."home_service_providers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "business_name" text NOT NULL,
  "category_id" uuid,
  "description" text,
  "hourly_rate" numeric NOT NULL,
  "availability" jsonb DEFAULT '[]'::jsonb,
  "service_areas" jsonb DEFAULT '[]'::jsonb,
  "rating_average" numeric DEFAULT 0,
  "rating_count" integer DEFAULT 0,
  "completed_jobs" integer DEFAULT 0,
  "verified" boolean DEFAULT false,
  "phone_number" text,
  "avatar_url" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."home_service_providers" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."e2e_identity_keys" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "identity_public_key" text NOT NULL,
  "signed_prekey_public" text NOT NULL,
  "signed_prekey_signature" text NOT NULL,
  "signed_prekey_id" integer NOT NULL DEFAULT 0,
  "registration_id" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."e2e_identity_keys" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."bos_records" (
  "id" text NOT NULL,
  "capability_id" text NOT NULL,
  "object_name" text NOT NULL,
  "tenant_id" text NOT NULL,
  "data" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "deleted_at" timestamp with time zone,
  "archived_at" timestamp with time zone,
  "created_by" text NOT NULL DEFAULT 'system'::text,
  "history" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "current_status" text,
  "pending_policy" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."bos_records" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."push_subscriptions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "endpoint" text NOT NULL,
  "p256dh" text,
  "auth" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."push_subscriptions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."game_daily_challenges" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "game_type" text,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "challenge_type" text NOT NULL DEFAULT 'daily'::text,
  "target_value" integer NOT NULL DEFAULT 1,
  "coin_reward" integer NOT NULL DEFAULT 50,
  "xp_reward" integer NOT NULL DEFAULT 100,
  "is_active" boolean NOT NULL DEFAULT true,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."game_daily_challenges" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."workflow_state" (
  "instance_id" uuid NOT NULL,
  "definition_id" character varying NOT NULL,
  "status" character varying NOT NULL,
  "current_node" character varying,
  "context" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "execution_context" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("instance_id")
);

ALTER TABLE public."workflow_state" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_invoice_lines" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "invoice_id" uuid NOT NULL,
  "line_number" integer NOT NULL,
  "description" text NOT NULL,
  "quantity" numeric NOT NULL DEFAULT 1,
  "unit_price" numeric NOT NULL DEFAULT 0,
  "discount_amount" numeric NOT NULL DEFAULT 0,
  "tax_rate" numeric NOT NULL DEFAULT 0,
  "tax_amount" numeric NOT NULL DEFAULT 0,
  "line_total" numeric NOT NULL DEFAULT 0,
  "revenue_account_id" uuid NOT NULL,
  "department_id" uuid,
  "project_id" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_invoice_lines" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."ai_execution_log" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "execution_id" text NOT NULL,
  "trace_id" text,
  "tenant_id" text,
  "user_id" uuid,
  "capability_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "model" text NOT NULL,
  "duration_ms" integer NOT NULL,
  "estimated_cost" numeric DEFAULT 0,
  "status" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."ai_execution_log" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_plus_transactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "transaction_type" character varying NOT NULL,
  "amount" integer NOT NULL,
  "status" character varying NOT NULL DEFAULT 'pending'::character varying,
  "payment_method" character varying,
  "payment_gateway_ref" character varying,
  "booking_id" uuid,
  "description" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_plus_transactions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."testbed_travel_bookings" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "employee_id" uuid NOT NULL,
  "destination" text NOT NULL,
  "start_date" timestamp with time zone NOT NULL,
  "end_date" timestamp with time zone NOT NULL,
  "status" text NOT NULL DEFAULT 'pending_approval'::text,
  "estimated_cost" numeric NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."testbed_travel_bookings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."call_recordings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "call_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "recording_url" text NOT NULL,
  "duration_seconds" integer,
  "file_size_bytes" bigint,
  "recorded_at" timestamp with time zone DEFAULT now(),
  "expires_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE public."call_recordings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."mutual_friends" (
  "user_a" uuid NOT NULL,
  "user_b" uuid NOT NULL,
  "mutual_friend_ids" uuid[] NOT NULL,
  "mutual_count" integer DEFAULT 0,
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("user_a", "user_b")
);

ALTER TABLE public."mutual_friends" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."workspace_tasks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "task_type" text NOT NULL,
  "state" text NOT NULL,
  "status" text DEFAULT 'pending'::text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "estimated_time_seconds" integer DEFAULT 60,
  "due_date" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."workspace_tasks" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."click_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "search_id" uuid,
  "user_id" uuid,
  "session_id" text NOT NULL,
  "result_rank" integer NOT NULL,
  "result_url" text NOT NULL,
  "result_type" text,
  "time_to_click_ms" integer,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."click_logs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."growth_actions" (
  "action_id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "action_type" character varying NOT NULL,
  "priority" character varying NOT NULL DEFAULT 'MEDIUM'::character varying,
  "source" character varying NOT NULL,
  "query" text,
  "target_page" text,
  "country" character varying DEFAULT NULL::character varying,
  "expected_impact" text NOT NULL,
  "status" character varying NOT NULL DEFAULT 'PENDING'::character varying,
  "created_at" timestamp with time zone DEFAULT now(),
  "completed_at" timestamp with time zone,
  "result_telemetry" jsonb DEFAULT '{}'::jsonb,
  PRIMARY KEY ("action_id")
);

ALTER TABLE public."growth_actions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."session_rooms" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "host_id" uuid,
  "session_goal" text NOT NULL,
  "room_name" text,
  "max_participants" integer DEFAULT 10,
  "status" text DEFAULT 'active'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "ended_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE public."session_rooms" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."seo_gsc_sync" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "site_url" text,
  "range_start" date,
  "range_end" date,
  "status" text NOT NULL,
  "rows_stored" integer NOT NULL DEFAULT 0,
  "error" text,
  "started_at" timestamp with time zone NOT NULL DEFAULT now(),
  "finished_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE public."seo_gsc_sync" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."wellness_circles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "category" text,
  "is_private" boolean NOT NULL DEFAULT false,
  "members_count" integer NOT NULL DEFAULT 0,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."wellness_circles" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_shares" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "share_type" text NOT NULL,
  "shared_item_id" uuid,
  "platform" text,
  "referral_code" text,
  "clicks" integer DEFAULT 0,
  "conversions" integer DEFAULT 0,
  "coins_earned" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_shares" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."specializations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "icon" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."specializations" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."micro_task_fraud_flags" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "submission_id" uuid,
  "flag_type" text NOT NULL,
  "details" jsonb,
  "risk_score_delta" integer DEFAULT 10,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."micro_task_fraud_flags" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_fx_rates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "from_currency" bpchar NOT NULL,
  "to_currency" bpchar NOT NULL,
  "rate" numeric NOT NULL,
  "rate_type" text NOT NULL DEFAULT 'SPOT'::text,
  "effective_date" date NOT NULL,
  "source" text NOT NULL DEFAULT 'manual'::text,
  "notes" text,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_fx_rates" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_bills" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid NOT NULL,
  "vendor_id" uuid NOT NULL,
  "bill_number" text NOT NULL,
  "bill_date" date NOT NULL,
  "due_date" date NOT NULL,
  "currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "fx_rate" numeric NOT NULL DEFAULT 1.0,
  "subtotal" numeric NOT NULL DEFAULT 0,
  "tax_total" numeric NOT NULL DEFAULT 0,
  "total" numeric NOT NULL DEFAULT 0,
  "amount_paid" numeric NOT NULL DEFAULT 0,
  "amount_due" numeric NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'DRAFT'::text,
  "duplicate_hash" text,
  "approval_id" uuid,
  "approved_by" uuid,
  "approved_at" timestamp with time zone,
  "journal_entry_id" uuid,
  "source_event_id" uuid,
  "attachment_url" text,
  "notes" text,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_bills" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."execution_queue" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" uuid,
  "workflow_id" text,
  "execution_id" text,
  "capability" text NOT NULL,
  "provider" text,
  "priority" integer DEFAULT 0,
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "scheduled_at" timestamp with time zone DEFAULT now(),
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "retry_count" integer DEFAULT 0,
  "max_retries" integer DEFAULT 3,
  "error" jsonb,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "worker_id" text,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."execution_queue" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."provider_access_consents" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "patient_id" uuid NOT NULL,
  "provider_id" uuid NOT NULL,
  "granted_at" timestamp with time zone DEFAULT now(),
  "expires_at" timestamp with time zone NOT NULL,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."provider_access_consents" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_bank_statements" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "bank_account_id" uuid NOT NULL,
  "statement_number" text NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "opening_balance" numeric NOT NULL,
  "closing_balance" numeric NOT NULL,
  "total_credits" numeric NOT NULL DEFAULT 0,
  "total_debits" numeric NOT NULL DEFAULT 0,
  "transaction_count" integer NOT NULL DEFAULT 0,
  "matched_count" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'PARSED'::text,
  "source_file_name" text,
  "source_file_url" text,
  "uploaded_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_bank_statements" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."quick_reply_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "template_text" text NOT NULL,
  "category" character varying,
  "usage_count" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."quick_reply_templates" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."coin_payments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "app_id" uuid,
  "merchant_id" uuid,
  "amount" integer NOT NULL,
  "payment_type" character varying NOT NULL,
  "description" text,
  "status" character varying DEFAULT 'completed'::character varying,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."coin_payments" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_business_graph_nodes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL,
  "entity_id" uuid NOT NULL,
  "record_id" uuid NOT NULL,
  "label" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."broadcast_recipients" (
  "broadcast_id" uuid NOT NULL,
  "recipient_id" uuid NOT NULL,
  PRIMARY KEY ("broadcast_id", "recipient_id")
);

ALTER TABLE public."broadcast_recipients" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_modules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "config_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."connection_requests" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "sender_id" uuid NOT NULL,
  "receiver_id" uuid NOT NULL,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."connection_requests" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_performance_obligations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "contract_id" uuid NOT NULL,
  "obligation_number" integer NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "standalone_selling_price" numeric NOT NULL DEFAULT 0,
  "allocated_price" numeric NOT NULL DEFAULT 0,
  "revenue_account_id" uuid NOT NULL,
  "deferred_rev_account_id" uuid NOT NULL,
  "recognition_method" text NOT NULL DEFAULT 'STRAIGHT_LINE'::text,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "satisfaction_status" text NOT NULL DEFAULT 'UNSATISFIED'::text,
  "milestone_condition" text,
  "satisfied_at" timestamp with time zone,
  "satisfied_by" uuid,
  "ai_proposed" boolean NOT NULL DEFAULT false,
  "ai_rationale" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_performance_obligations" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_bill_lines" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "bill_id" uuid NOT NULL,
  "line_number" integer NOT NULL,
  "description" text NOT NULL,
  "quantity" numeric NOT NULL DEFAULT 1,
  "unit_price" numeric NOT NULL DEFAULT 0,
  "tax_rate" numeric NOT NULL DEFAULT 0,
  "tax_amount" numeric NOT NULL DEFAULT 0,
  "line_total" numeric NOT NULL DEFAULT 0,
  "expense_account_id" uuid NOT NULL,
  "department_id" uuid,
  "project_id" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_bill_lines" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_journal_lines" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "journal_entry_id" uuid NOT NULL,
  "line_number" integer NOT NULL,
  "account_id" uuid NOT NULL,
  "debit_amount" numeric NOT NULL DEFAULT 0,
  "credit_amount" numeric NOT NULL DEFAULT 0,
  "currency" bpchar NOT NULL,
  "functional_debit" numeric NOT NULL DEFAULT 0,
  "functional_credit" numeric NOT NULL DEFAULT 0,
  "reporting_debit" numeric NOT NULL DEFAULT 0,
  "reporting_credit" numeric NOT NULL DEFAULT 0,
  "legal_entity_id" uuid,
  "department_id" uuid,
  "project_id" text,
  "cost_center" text,
  "customer_id" uuid,
  "vendor_id" uuid,
  "contract_id" uuid,
  "memo" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_journal_lines" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."champion_missions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "code" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "category" text NOT NULL,
  "target_value" integer NOT NULL,
  "points_reward" integer NOT NULL DEFAULT 0,
  "period" text NOT NULL DEFAULT 'weekly'::text,
  "is_active" boolean NOT NULL DEFAULT true,
  "starts_at" timestamp with time zone NOT NULL DEFAULT now(),
  "ends_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."champion_missions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_accounts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid,
  "code" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "account_type" text NOT NULL,
  "account_subtype" text,
  "normal_balance" text NOT NULL,
  "parent_account_id" uuid,
  "depth" integer NOT NULL DEFAULT 0,
  "accounting_standard" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "allow_direct_posting" boolean NOT NULL DEFAULT true,
  "is_system_account" boolean NOT NULL DEFAULT false,
  "require_dimensions" jsonb DEFAULT '[]'::jsonb,
  "tags" jsonb DEFAULT '[]'::jsonb,
  "fs_mapping" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_accounts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."content_flags" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "content_type" text NOT NULL,
  "content_id" uuid NOT NULL,
  "flagged_by" uuid NOT NULL,
  "reason" text NOT NULL,
  "status" text DEFAULT 'pending'::text,
  "reviewed_by" uuid,
  "reviewed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."content_flags" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."map_hunt_progress" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "current_level" integer DEFAULT 1,
  "total_keys_found" integer DEFAULT 0,
  "total_treasures" integer DEFAULT 0,
  "xp" integer DEFAULT 0,
  "current_hunt_id" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."map_hunt_progress" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."gsc_sync_runs" (
  "run_id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "property_id" character varying,
  "started_at" timestamp with time zone NOT NULL DEFAULT now(),
  "completed_at" timestamp with time zone,
  "status" character varying NOT NULL DEFAULT 'RUNNING'::character varying,
  "date_start" date NOT NULL,
  "date_end" date NOT NULL,
  "rows_synced" integer DEFAULT 0,
  "error_message" text,
  PRIMARY KEY ("run_id")
);

ALTER TABLE public."gsc_sync_runs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."mobile_action_queue" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "action_type" text NOT NULL,
  "target_device_id" uuid,
  "candidate_id" uuid,
  "conversation_id" uuid,
  "call_id" uuid,
  "correlation_id" uuid,
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "attempts" integer NOT NULL DEFAULT 0,
  "scheduled_for" timestamp with time zone NOT NULL DEFAULT now(),
  "claimed_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "error_text" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."mobile_action_queue" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_workspaces" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "org_id" uuid NOT NULL,
  "team_id" uuid,
  "capability_id" text NOT NULL,
  "capability_name" text NOT NULL,
  "settings" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."sys_workspaces" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_workflows" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "entity_id" uuid,
  "name" text NOT NULL,
  "trigger_type" text NOT NULL,
  "workflow_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."caregiver_alerts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "caregiver_user_id" uuid NOT NULL,
  "family_member_id" uuid NOT NULL,
  "alert_type" text NOT NULL,
  "severity" text DEFAULT 'medium'::text,
  "title" text NOT NULL,
  "message" text,
  "is_read" boolean DEFAULT false,
  "is_actioned" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."caregiver_alerts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."upi_payments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "order_id" uuid,
  "order_type" text NOT NULL,
  "seller_id" uuid,
  "amount" numeric NOT NULL,
  "upi_reference" text,
  "payment_screenshot_url" text,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "verified_by" uuid,
  "verified_at" timestamp with time zone,
  "settled_at" timestamp with time zone,
  "settlement_reference" text,
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."upi_payments" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_stats" (
  "user_id" uuid NOT NULL,
  "total_points" integer NOT NULL DEFAULT 0,
  "streak_days" integer NOT NULL DEFAULT 0,
  "level" integer NOT NULL DEFAULT 1,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("user_id")
);

ALTER TABLE public."user_stats" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_attributes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "entity_id" uuid NOT NULL,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "validation_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."game_user_profiles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "total_coins" integer DEFAULT 0,
  "total_xp" integer DEFAULT 0,
  "current_streak" integer DEFAULT 0,
  "longest_streak" integer DEFAULT 0,
  "games_played" integer DEFAULT 0,
  "achievements" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."game_user_profiles" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_feature_engagement" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "feature_key" text NOT NULL,
  "module" text NOT NULL,
  "visit_count" integer NOT NULL DEFAULT 0,
  "last_visited_at" timestamp with time zone,
  "first_visited_at" timestamp with time zone,
  "conversion_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_feature_engagement" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."search_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "session_id" text NOT NULL,
  "query" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "source" text DEFAULT 'web'::text,
  "engine" text DEFAULT 'google_custom_search'::text,
  "gps_lat" double precision,
  "gps_lon" double precision,
  "ip" text,
  "ip_country" text,
  "ip_city" text,
  "ip_lat" double precision,
  "ip_lon" double precision,
  "last_known_lat" double precision,
  "last_known_lon" double precision,
  PRIMARY KEY ("id")
);

ALTER TABLE public."search_logs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."earning_events" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "event_type" earning_event_type NOT NULL,
  "source_table" text,
  "source_id" uuid,
  "title" text NOT NULL,
  "description" text,
  "status" earning_event_status NOT NULL DEFAULT 'pending'::earning_event_status,
  "reward_coins" integer NOT NULL DEFAULT 0,
  "reward_rupees" numeric NOT NULL DEFAULT 0,
  "occurred_at" timestamp with time zone NOT NULL DEFAULT now(),
  "approved_at" timestamp with time zone,
  "paid_at" timestamp with time zone,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."earning_events" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."platform_events" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "stream_id" character varying NOT NULL,
  "version" bigint NOT NULL,
  "type" character varying NOT NULL,
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "execution_context" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."platform_events" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."enterprise_users" (
  "id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "role" enterprise_role_type DEFAULT 'User'::enterprise_role_type,
  "department" text,
  "team" text,
  "mfa_enabled" boolean DEFAULT false,
  "ai_executive_access" boolean DEFAULT false,
  "last_login" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."enterprise_users" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."workspace_customers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL,
  "profile_id" uuid NOT NULL,
  "tags" jsonb DEFAULT '[]'::jsonb,
  "segment" text DEFAULT 'lead'::text,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."workspace_customers" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_payments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid NOT NULL,
  "payment_number" text NOT NULL,
  "payment_type" text NOT NULL,
  "customer_id" uuid,
  "vendor_id" uuid,
  "payment_date" date NOT NULL,
  "amount" numeric NOT NULL,
  "currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "fx_rate" numeric NOT NULL DEFAULT 1.0,
  "functional_amount" numeric NOT NULL DEFAULT 0,
  "unapplied_amount" numeric NOT NULL DEFAULT 0,
  "payment_method" text NOT NULL DEFAULT 'BANK_TRANSFER'::text,
  "bank_account_id" uuid,
  "reference_number" text,
  "status" text NOT NULL DEFAULT 'POSTED'::text,
  "journal_entry_id" uuid,
  "source_event_id" uuid,
  "notes" text,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_payments" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."provider_services" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "provider_id" uuid NOT NULL,
  "category_id" uuid NOT NULL,
  "service_name" text NOT NULL,
  "description" text,
  "pricing_model" text DEFAULT 'fixed'::text,
  "base_price" numeric,
  "currency" text DEFAULT 'INR'::text,
  "duration_minutes" integer,
  "pricing_tiers" jsonb DEFAULT '[]'::jsonb,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."provider_services" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."food_orders" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "vendor_id" uuid NOT NULL,
  "items" jsonb NOT NULL,
  "total_amount" integer NOT NULL,
  "delivery_address" text NOT NULL,
  "status" character varying DEFAULT 'pending'::character varying,
  "created_at" timestamp with time zone DEFAULT now(),
  "order_number" text,
  "subtotal" numeric,
  "delivery_charge" numeric DEFAULT 0,
  "packaging_charge" numeric DEFAULT 0,
  "discount" numeric DEFAULT 0,
  "taxes" numeric DEFAULT 0,
  "payment_method" text DEFAULT 'cod'::text,
  "payment_status" text DEFAULT 'pending'::text,
  "order_status" text DEFAULT 'placed'::text,
  "delivery_instructions" text,
  "estimated_delivery_time" timestamp with time zone,
  "actual_delivery_time" timestamp with time zone,
  "customer_rating" integer,
  "customer_review" text,
  "vendor_notes" text,
  "cancelled_by" text,
  "cancellation_reason" text,
  "refund_status" text,
  "refund_amount" numeric,
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."food_orders" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."call_transcriptions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "call_id" text NOT NULL,
  "text" text NOT NULL,
  "confidence" numeric DEFAULT 0.95,
  "timestamp" timestamp with time zone NOT NULL DEFAULT now(),
  "language" text DEFAULT 'en'::text,
  "speaker_label" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."call_transcriptions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."call_memories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "call_id" uuid,
  "peer_id" uuid,
  "peer_phone" text,
  "memory_type" text NOT NULL DEFAULT 'fact'::text,
  "content" text NOT NULL,
  "importance" integer NOT NULL DEFAULT 3,
  "tags" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "source" text NOT NULL DEFAULT 'call'::text,
  "expires_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."call_memories" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_platform_fees" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "booking_id" uuid,
  "seller_id" uuid,
  "transaction_amount" numeric NOT NULL,
  "platform_fee_percent" numeric DEFAULT 5.00,
  "platform_fee_amount" numeric NOT NULL,
  "processing_fee_percent" numeric DEFAULT 1.50,
  "processing_fee_amount" numeric NOT NULL,
  "total_fee" numeric NOT NULL,
  "seller_payout" numeric NOT NULL,
  "status" character varying DEFAULT 'pending'::character varying,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_platform_fees" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_ai_keys" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "provider" text NOT NULL DEFAULT 'openrouter'::text,
  "encrypted_key" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_ai_keys" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."medical_id" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "blood_type" text,
  "allergies" text[],
  "medical_conditions" text[],
  "medications" text[],
  "organ_donor" boolean DEFAULT false,
  "emergency_notes" text,
  "height_cm" numeric,
  "weight_kg" numeric,
  "date_of_birth" date,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."medical_id" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_reconciliation_exceptions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "bank_transaction_id" uuid NOT NULL,
  "exception_type" text NOT NULL,
  "severity" text NOT NULL DEFAULT 'MEDIUM'::text,
  "suggested_action" text,
  "ai_proposal" jsonb DEFAULT '{}'::jsonb,
  "status" text NOT NULL DEFAULT 'OPEN'::text,
  "resolved_by" uuid,
  "resolved_at" timestamp with time zone,
  "resolution_notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_reconciliation_exceptions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."connector_sync_runs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "connection_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "capability" text NOT NULL,
  "status" text NOT NULL DEFAULT 'running'::text,
  "items_fetched" integer NOT NULL DEFAULT 0,
  "items_upserted" integer NOT NULL DEFAULT 0,
  "error" text,
  "started_at" timestamp with time zone NOT NULL DEFAULT now(),
  "finished_at" timestamp with time zone,
  "duration_ms" integer,
  PRIMARY KEY ("id")
);

ALTER TABLE public."connector_sync_runs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."requisitions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "department" text NOT NULL,
  "location" text NOT NULL,
  "type" text NOT NULL,
  "status" text NOT NULL DEFAULT 'Open'::text,
  "description" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("id")
);

ALTER TABLE public."requisitions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."link_previews" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "url" text NOT NULL,
  "title" text,
  "description" text,
  "image_url" text,
  "favicon_url" text,
  "site_name" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "expires_at" timestamp with time zone DEFAULT (now() + '7 days'::interval),
  PRIMARY KEY ("id")
);

ALTER TABLE public."link_previews" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_preferences" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "wellness_reminder_enabled" boolean DEFAULT false,
  "wellness_reminder_time" time DEFAULT '09:00:00'::time without time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_preferences" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."ai_memory_conversation" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL,
  "participants" jsonb NOT NULL,
  "content" text NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "embedding" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."micro_task_admins" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."micro_task_admins" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."growth_assets" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "org_id" uuid NOT NULL,
  "campaign_id" uuid,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "type" text NOT NULL,
  "status" text NOT NULL DEFAULT 'Draft'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_by" uuid,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer NOT NULL DEFAULT 1,
  PRIMARY KEY ("id")
);

ALTER TABLE public."growth_assets" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."contact_submissions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "email" text NOT NULL,
  "subject" text NOT NULL,
  "message" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "status" text DEFAULT 'new'::text,
  "response" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."contact_submissions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."broadcast_lists" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."broadcast_lists" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_customers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid,
  "customer_code" text NOT NULL,
  "name" text NOT NULL,
  "billing_email" text,
  "billing_address" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "tax_identifier" text,
  "currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "payment_terms_days" integer NOT NULL DEFAULT 30,
  "credit_limit" numeric NOT NULL DEFAULT 0,
  "credit_hold" boolean NOT NULL DEFAULT false,
  "risk_rating" text NOT NULL DEFAULT 'LOW'::text,
  "notes" text,
  "tags" jsonb DEFAULT '[]'::jsonb,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_customers" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."lab_reports" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "report_name" text NOT NULL,
  "file_url" text NOT NULL,
  "file_type" text,
  "category" text,
  "test_date" date,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "url_expires_at" timestamp with time zone,
  "requires_signed_url" boolean DEFAULT true,
  PRIMARY KEY ("id")
);

ALTER TABLE public."lab_reports" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."leaderboard_cache" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "total_points" integer DEFAULT 0,
  "challenges_completed" integer DEFAULT 0,
  "rank" integer,
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."leaderboard_cache" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."emotionsync_challenges" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "level" integer NOT NULL,
  "target_emotion" text NOT NULL,
  "difficulty" text NOT NULL,
  "input_type" text NOT NULL,
  "user_input" text,
  "detected_emotion" text,
  "confidence_score" numeric,
  "success" boolean,
  "time_taken_ms" integer,
  "coins_earned" integer DEFAULT 0,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."emotionsync_challenges" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."location_search_history" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "location_name" text NOT NULL,
  "latitude" numeric NOT NULL,
  "longitude" numeric NOT NULL,
  "search_count" integer DEFAULT 1,
  "last_searched_at" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."location_search_history" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."business_team_members" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role" text NOT NULL,
  "permissions" jsonb DEFAULT '[]'::jsonb,
  "joined_at" timestamp with time zone DEFAULT now(),
  "invited_by" uuid,
  PRIMARY KEY ("id")
);

ALTER TABLE public."business_team_members" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."encrypted_messages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "message_id" uuid NOT NULL,
  "sender_id" uuid NOT NULL,
  "recipient_id" uuid NOT NULL,
  "encrypted_content" text NOT NULL,
  "iv" text NOT NULL,
  "key_id" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."encrypted_messages" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."health_conditions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "name_hindi" text,
  "category" text NOT NULL DEFAULT 'chronic'::text,
  "icon" text,
  "description" text,
  "tracking_metrics" jsonb DEFAULT '[]'::jsonb,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."health_conditions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."booking_status_updates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "booking_id" uuid NOT NULL,
  "status" text NOT NULL,
  "latitude" numeric,
  "longitude" numeric,
  "notes" text,
  "updated_by" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."booking_status_updates" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."mcp_api_keys" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "app_name" text NOT NULL,
  "app_description" text,
  "api_key_hash" text NOT NULL,
  "api_key_prefix" text NOT NULL,
  "permissions" jsonb NOT NULL DEFAULT '["messaging.read", "messaging.send", "calls.read", "calls.initiate", "notifications.send", "brain.query"]'::jsonb,
  "rate_limit_per_minute" integer NOT NULL DEFAULT 60,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_by" uuid NOT NULL,
  "last_used_at" timestamp with time zone,
  "request_count" bigint NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."mcp_api_keys" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."dhandha_customers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "merchant_id" uuid NOT NULL,
  "name" text NOT NULL,
  "phone" text,
  "notes" text,
  "outstanding_balance" numeric NOT NULL DEFAULT 0,
  "total_billed" numeric NOT NULL DEFAULT 0,
  "total_paid" numeric NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."dhandha_customers" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."home_service_bookings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "provider_id" uuid NOT NULL,
  "customer_id" uuid NOT NULL,
  "service_type" text NOT NULL,
  "scheduled_date" timestamp with time zone NOT NULL,
  "duration_hours" integer DEFAULT 2,
  "address" text NOT NULL,
  "description" text,
  "status" text DEFAULT 'pending'::text,
  "total_cost" numeric,
  "payment_status" text DEFAULT 'pending'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."home_service_bookings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."service_reviews" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "booking_id" uuid NOT NULL,
  "provider_id" uuid NOT NULL,
  "customer_id" uuid NOT NULL,
  "rating" integer NOT NULL,
  "review_text" text,
  "photos" jsonb DEFAULT '[]'::jsonb,
  "provider_response" text,
  "provider_response_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."service_reviews" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."game_levels" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "game_type" text NOT NULL,
  "level_number" integer NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "difficulty" text NOT NULL,
  "xp_reward" integer NOT NULL,
  "coin_reward" integer NOT NULL,
  "unlock_requirement" jsonb DEFAULT '{}'::jsonb,
  "level_config" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."game_levels" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."connector_connections" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "connector_id" text NOT NULL,
  "display_name" text,
  "account_label" text,
  "status" text NOT NULL DEFAULT 'disconnected'::text,
  "health" text NOT NULL DEFAULT 'unknown'::text,
  "capabilities" text[] NOT NULL DEFAULT '{}'::text[],
  "scopes" text[] NOT NULL DEFAULT '{}'::text[],
  "last_error" text,
  "last_synced_at" timestamp with time zone,
  "sync_cursor" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "settings" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."connector_connections" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."cc_revenue_metrics" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "metric_date" date NOT NULL DEFAULT CURRENT_DATE,
  "leads_generated" integer DEFAULT 0,
  "outreach_sent" integer DEFAULT 0,
  "conversations_started" integer DEFAULT 0,
  "deals_qualified" integer DEFAULT 0,
  "deals_closed" integer DEFAULT 0,
  "revenue_amount" numeric DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."cc_revenue_metrics" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_legal_entities" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_name" text NOT NULL,
  "entity_code" text NOT NULL,
  "jurisdiction" text NOT NULL DEFAULT 'IN'::text,
  "registration_number" text,
  "functional_currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "accounting_standard" text NOT NULL DEFAULT 'IFRS'::text,
  "is_consolidating" boolean NOT NULL DEFAULT false,
  "parent_entity_id" uuid,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_legal_entities" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_referral_codes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "code" text NOT NULL,
  "qr_code_url" text,
  "total_uses" integer DEFAULT 0,
  "total_rewards" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_referral_codes" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."youth_posts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "content" text NOT NULL,
  "media_urls" text[],
  "media_types" text[],
  "likes_count" integer DEFAULT 0,
  "comments_count" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "mood" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."youth_posts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."medications" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "medication_name" text NOT NULL,
  "dosage" text NOT NULL,
  "frequency" text NOT NULL,
  "start_date" date NOT NULL DEFAULT CURRENT_DATE,
  "end_date" date,
  "prescribed_by" text,
  "purpose" text,
  "side_effects" text[],
  "instructions" text,
  "refill_reminder_date" date,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."medications" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."room_participants" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "room_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "is_speaking" boolean DEFAULT false,
  "joined_at" timestamp with time zone DEFAULT now(),
  "left_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE public."room_participants" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."statuses" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "media_url" text,
  "media_type" text DEFAULT 'image'::text,
  "caption" text,
  "background_color" text,
  "font_style" text,
  "view_count" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "expires_at" timestamp with time zone DEFAULT (now() + '24:00:00'::interval),
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."statuses" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."community_post_comments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "post_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."community_post_comments" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."ambassador_applications" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "full_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "college" text NOT NULL,
  "year" text NOT NULL,
  "city" text NOT NULL,
  "experience" text,
  "social_media" text,
  "why_join" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "reviewed_at" timestamp with time zone,
  "reviewed_by" uuid,
  PRIMARY KEY ("id")
);

ALTER TABLE public."ambassador_applications" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_referrals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "referrer_id" uuid NOT NULL,
  "referred_user_id" uuid NOT NULL,
  "referral_code" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "level" integer NOT NULL DEFAULT 1,
  "coins_earned" integer DEFAULT 0,
  "activated_at" timestamp with time zone,
  "rewarded_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_referrals" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_installed_plugins" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "app_id" uuid NOT NULL,
  "installed_at" timestamp with time zone DEFAULT now(),
  "is_active" boolean DEFAULT true,
  "position" integer DEFAULT 0,
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_installed_plugins" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."seo_pages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "domain" text NOT NULL,
  "path" text NOT NULL,
  "cluster" text NOT NULL,
  "section" text NOT NULL DEFAULT 'pages'::text,
  "primary_intent" text,
  "title" text,
  "description" text,
  "is_indexable" boolean NOT NULL DEFAULT true,
  "content_last_modified" date,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."seo_pages" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."search_filter_preferences" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "default_max_distance" integer DEFAULT 10000,
  "default_min_rating" numeric DEFAULT 0.0,
  "default_price_range" jsonb,
  "preferred_categories" text[],
  "exclude_categories" text[],
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."search_filter_preferences" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."contact_label_votes" (
  "hashed_number" text NOT NULL,
  "normalized_label" text NOT NULL,
  "hashed_uploader" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("hashed_number", "normalized_label", "hashed_uploader")
);

ALTER TABLE public."contact_label_votes" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."notification_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "slug" text NOT NULL,
  "category" text NOT NULL,
  "type" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "action_url" text,
  "trigger_when" text NOT NULL,
  "rationale" text NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."notification_templates" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_challenge_progress" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "challenge_id" uuid NOT NULL,
  "date" date NOT NULL DEFAULT CURRENT_DATE,
  "current_progress" integer DEFAULT 0,
  "completed" boolean DEFAULT false,
  "completed_at" timestamp with time zone,
  "coins_awarded" integer DEFAULT 0,
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_challenge_progress" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."doctor_applications" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "full_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "specialty" text NOT NULL,
  "qualification" text NOT NULL,
  "experience_years" integer NOT NULL,
  "registration_number" text NOT NULL,
  "hospital_affiliation" text,
  "consultation_fee" numeric,
  "preferred_language" text,
  "bio" text,
  "certifications" text[],
  "status" text NOT NULL DEFAULT 'pending'::text,
  "reviewed_by" uuid,
  "reviewed_at" timestamp with time zone,
  "rejection_reason" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."doctor_applications" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."app_submissions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "developer_id" uuid,
  "app_name" text NOT NULL,
  "description" text,
  "icon_url" text,
  "app_url" text NOT NULL,
  "category_id" uuid,
  "tags" text[] DEFAULT '{}'::text[],
  "screenshots" text[] DEFAULT '{}'::text[],
  "privacy_policy_url" text,
  "terms_url" text,
  "support_email" text,
  "submission_status" text DEFAULT 'pending'::text,
  "rejection_reason" text,
  "submitted_at" timestamp with time zone DEFAULT now(),
  "reviewed_at" timestamp with time zone,
  "reviewed_by" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."app_submissions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chat_brand_triggers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "brand_id" uuid,
  "trigger_keywords" text[] NOT NULL,
  "response_type" text DEFAULT 'sticker'::text,
  "response_asset_url" text,
  "max_daily_triggers" integer DEFAULT 100,
  "current_daily_count" integer DEFAULT 0,
  "last_reset_date" date DEFAULT CURRENT_DATE,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chat_brand_triggers" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."teleconsultation_slots" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "provider_id" uuid NOT NULL,
  "slot_date" date NOT NULL,
  "slot_time" time NOT NULL,
  "duration_minutes" integer DEFAULT 30,
  "is_available" boolean DEFAULT true,
  "booked_by" uuid,
  "appointment_id" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."teleconsultation_slots" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."feature_catalog" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "feature_key" text NOT NULL,
  "module" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "cta_route" text NOT NULL,
  "emoji" text,
  "priority" integer NOT NULL DEFAULT 50,
  "active" boolean NOT NULL DEFAULT true,
  "requires_location" boolean NOT NULL DEFAULT false,
  "notification_templates" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."feature_catalog" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."e2e_prekeys" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "prekey_id" integer NOT NULL,
  "public_key" text NOT NULL,
  "is_used" boolean NOT NULL DEFAULT false,
  "used_by" uuid,
  "used_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."e2e_prekeys" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."medicine_orders" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "subscription_id" uuid,
  "order_number" text,
  "items" jsonb NOT NULL,
  "subtotal" numeric NOT NULL,
  "discount" numeric DEFAULT 0,
  "delivery_fee" numeric DEFAULT 0,
  "total" numeric NOT NULL,
  "status" text DEFAULT 'pending'::text,
  "delivery_address" jsonb,
  "expected_delivery" date,
  "delivered_at" timestamp with time zone,
  "payment_status" text DEFAULT 'pending'::text,
  "payment_method" text,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."medicine_orders" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."home_service_reviews" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "provider_id" uuid NOT NULL,
  "customer_id" uuid NOT NULL,
  "booking_id" uuid,
  "rating" integer NOT NULL,
  "review_text" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."home_service_reviews" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."medicine_intake_log" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "family_member_id" uuid,
  "subscription_item_id" uuid,
  "medicine_name" text NOT NULL,
  "scheduled_at" timestamp with time zone NOT NULL,
  "taken_at" timestamp with time zone,
  "status" text DEFAULT 'pending'::text,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."medicine_intake_log" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."device_sessions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "device_type" text NOT NULL,
  "device_name" text NOT NULL,
  "session_token" text NOT NULL,
  "qr_token" text,
  "is_active" boolean DEFAULT true,
  "last_active" timestamp with time zone DEFAULT now(),
  "ip_address" text,
  "user_agent" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "expires_at" timestamp with time zone NOT NULL,
  "device_fingerprint" text,
  "pin_hash" text,
  "biometric_enabled" boolean DEFAULT false,
  "quick_login_enabled" boolean DEFAULT true,
  "session_token_hash" text,
  "qr_token_hash" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."device_sessions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_plus_sellers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "business_name" character varying NOT NULL,
  "business_type" character varying NOT NULL,
  "description" text,
  "logo_url" text,
  "phone_number" character varying,
  "email" character varying,
  "address" text,
  "city" character varying,
  "state" character varying,
  "pincode" character varying,
  "latitude" numeric,
  "longitude" numeric,
  "subscription_plan" character varying NOT NULL DEFAULT 'basic'::character varying,
  "subscription_amount" integer NOT NULL DEFAULT 99,
  "subscription_status" character varying NOT NULL DEFAULT 'active'::character varying,
  "subscription_started_at" timestamp with time zone DEFAULT now(),
  "subscription_expires_at" timestamp with time zone,
  "rating_average" numeric DEFAULT 0,
  "rating_count" integer DEFAULT 0,
  "total_bookings" integer DEFAULT 0,
  "is_verified" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "approval_status" character varying NOT NULL DEFAULT 'pending'::character varying,
  "approval_notes" text,
  "approved_by" uuid,
  "approved_at" timestamp with time zone,
  "rejection_reason" text,
  "kyc_status" character varying DEFAULT 'not_submitted'::character varying,
  "gstin" character varying,
  "pan_number" character varying,
  "aadhar_number" character varying,
  "kyc_documents" jsonb DEFAULT '[]'::jsonb,
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_plus_sellers" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."otp_verifications" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "phone_number" text NOT NULL,
  "otp_code" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "expires_at" timestamp with time zone DEFAULT (now() + '00:10:00'::interval),
  "verified" boolean DEFAULT false,
  "attempts" integer DEFAULT 0,
  PRIMARY KEY ("id")
);

ALTER TABLE public."otp_verifications" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."tutors" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "full_name" text NOT NULL,
  "avatar_url" text,
  "bio" text,
  "subjects" jsonb DEFAULT '[]'::jsonb,
  "hourly_rate" numeric,
  "rating_average" numeric DEFAULT 0,
  "total_sessions" integer DEFAULT 0,
  "years_experience" integer,
  "education" text,
  "languages" jsonb DEFAULT '["English"]'::jsonb,
  "availability" jsonb DEFAULT '{}'::jsonb,
  "is_verified" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."tutors" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."status_views" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "status_id" uuid NOT NULL,
  "viewer_id" uuid NOT NULL,
  "viewed_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."status_views" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."ai_rep_sessions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "call_id" text,
  "caller_number" text NOT NULL,
  "caller_name" text,
  "status" text NOT NULL DEFAULT 'active'::text,
  "transcript" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "fsm_context" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "summary" text,
  "one_line_summary" text,
  "urgency" text DEFAULT 'normal'::text,
  "caller_purpose" text,
  "extracted_actions" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "suggested_reply" text,
  "follow_up_at" timestamp with time zone,
  "reviewed_at" timestamp with time zone,
  "user_action" text,
  "started_at" timestamp with time zone NOT NULL DEFAULT now(),
  "ended_at" timestamp with time zone,
  "duration_seconds" integer,
  PRIMARY KEY ("id")
);

ALTER TABLE public."ai_rep_sessions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."trust_factors" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "factor_type" text NOT NULL,
  "factor_value" numeric NOT NULL DEFAULT 0,
  "weight" numeric NOT NULL DEFAULT 1.0,
  "source" text,
  "evidence" jsonb DEFAULT '{}'::jsonb,
  "expires_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."trust_factors" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."champion_rewards" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "code" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "tier_required" text NOT NULL DEFAULT 'Bronze'::text,
  "points_cost" integer NOT NULL,
  "stock" integer,
  "icon" text NOT NULL DEFAULT 'gift'::text,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."champion_rewards" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."health_challenge_participants" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "challenge_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "current_progress" numeric DEFAULT 0,
  "status" text DEFAULT 'active'::text,
  "joined_at" timestamp with time zone DEFAULT now(),
  "completed_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE public."health_challenge_participants" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_contract_amendments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "contract_id" uuid NOT NULL,
  "amendment_number" integer NOT NULL,
  "effective_date" date NOT NULL,
  "amendment_type" text NOT NULL,
  "price_adjustment" numeric NOT NULL DEFAULT 0,
  "old_transaction_price" numeric NOT NULL,
  "new_transaction_price" numeric NOT NULL,
  "treatment" text NOT NULL DEFAULT 'PROSPECTIVE'::text,
  "description" text NOT NULL,
  "approved_by" uuid,
  "approval_id" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_contract_amendments" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_creator_rewards" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "content_type" text NOT NULL,
  "engagement_score" integer DEFAULT 0,
  "coins_earned" integer DEFAULT 0,
  "revenue_share" numeric DEFAULT 0,
  "period_start" date NOT NULL,
  "period_end" date NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_creator_rewards" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."media_files" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "hash" text NOT NULL,
  "url" text NOT NULL,
  "size" integer NOT NULL,
  "type" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."media_files" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_settings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "push_notifications" boolean DEFAULT true,
  "email_notifications" boolean DEFAULT true,
  "message_notifications" boolean DEFAULT true,
  "call_notifications" boolean DEFAULT true,
  "profile_visibility" text DEFAULT 'everyone'::text,
  "last_seen_visibility" text DEFAULT 'everyone'::text,
  "read_receipts" boolean DEFAULT true,
  "typing_indicators" boolean DEFAULT true,
  "language" text DEFAULT 'en'::text,
  "theme" text DEFAULT 'system'::text,
  "data_usage" text DEFAULT 'auto'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_settings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."workspace_broadcasts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL,
  "name" text NOT NULL,
  "message_template" text NOT NULL,
  "target_segment" text,
  "status" text DEFAULT 'draft'::text,
  "sent_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."workspace_broadcasts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."legal_cases" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "org_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "status" text NOT NULL DEFAULT 'Open'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_by" uuid,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer NOT NULL DEFAULT 1,
  PRIMARY KEY ("id")
);

ALTER TABLE public."legal_cases" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."cc_dev_tasks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "plan_id" uuid,
  "title" text NOT NULL,
  "description" text,
  "task_type" text NOT NULL DEFAULT 'feature'::text,
  "feature_spec" text,
  "api_plan" text,
  "lovable_prompt" text,
  "priority" text NOT NULL DEFAULT 'medium'::text,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "estimated_hours" numeric,
  "assigned_to" text,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."cc_dev_tasks" ENABLE ROW LEVEL SECURITY;


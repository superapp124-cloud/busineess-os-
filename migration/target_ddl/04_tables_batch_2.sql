-- ==============================================================================
-- PART 4: TABLES & PRIMARY KEYS (Part 2 of 2)
-- Total tables in this batch: 294
-- Target: nuuuqazaoaozgblmvkzn
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public."story_views" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "story_id" uuid NOT NULL,
  "viewer_id" uuid NOT NULL,
  "viewed_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."story_views" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."mental_health_assessments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "assessment_type" text NOT NULL,
  "score" integer,
  "responses" jsonb,
  "interpretation" text,
  "recommendations" text[],
  "assessed_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."mental_health_assessments" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_dimensions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "dimension_type" text NOT NULL,
  "dimension_value" text NOT NULL,
  "priority" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_dimensions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."gsc_queries" (
  "id" bigint NOT NULL DEFAULT nextval('gsc_queries_id_seq'::regclass),
  "property_id" character varying,
  "sync_date" date NOT NULL,
  "query" text NOT NULL,
  "page" text NOT NULL,
  "country" character varying NOT NULL DEFAULT 'GLOBAL'::character varying,
  "device" character varying NOT NULL DEFAULT 'ALL'::character varying,
  "clicks" integer NOT NULL DEFAULT 0,
  "impressions" integer NOT NULL DEFAULT 0,
  "ctr" numeric NOT NULL DEFAULT 0.0,
  "position" numeric NOT NULL DEFAULT 0.0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."gsc_queries" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."doctor_availability" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "doctor_id" uuid NOT NULL,
  "day_of_week" integer NOT NULL,
  "start_time" time NOT NULL,
  "end_time" time NOT NULL,
  "slot_minutes" integer NOT NULL DEFAULT 30,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."doctor_availability" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."medication_reminders" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "medicine_name" text NOT NULL,
  "dosage" text NOT NULL,
  "frequency" text NOT NULL,
  "time_slots" text[] NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date,
  "notes" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."medication_reminders" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."audio_rooms" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "host_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "participant_count" integer DEFAULT 0,
  "is_public" boolean DEFAULT true,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "ended_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE public."audio_rooms" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sales_leads" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "email" text,
  "phone" text,
  "company" text,
  "job_title" text,
  "status" text NOT NULL DEFAULT 'New'::text,
  "source" text,
  "ai_score" numeric,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."sales_leads" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."ai_agent_analytics" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "agent_id" uuid NOT NULL,
  "date" date NOT NULL DEFAULT CURRENT_DATE,
  "messages_sent" integer DEFAULT 0,
  "conversations_started" integer DEFAULT 0,
  "average_response_time_seconds" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."ai_agent_analytics" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_organizations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "sys_organization_id" uuid NOT NULL,
  "legal_name" text NOT NULL,
  "timezone" text NOT NULL DEFAULT 'Asia/Kolkata'::text,
  "fiscal_year_start_month" integer NOT NULL DEFAULT 4,
  "fiscal_year_start_day" integer NOT NULL DEFAULT 1,
  "base_currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "reporting_currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "multi_currency_enabled" boolean NOT NULL DEFAULT true,
  "accounting_standard" text NOT NULL DEFAULT 'IFRS'::text,
  "approval_threshold_amount" numeric NOT NULL DEFAULT 100000.00,
  "approval_threshold_currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "mandatory_hitl_operations" jsonb NOT NULL DEFAULT '["payment_initiation", "bank_account_change", "accounting_policy_change", "closed_period_posting", "revenue_recognition_override", "tax_adjustment", "cash_affecting_manual_journal", "revenue_affecting_manual_journal", "intercompany_adjustment", "write_off", "high_risk_ai_action", "coa_structure_change"]'::jsonb,
  "settings" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_organizations" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."smart_push_log" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "feature_key" text NOT NULL,
  "module" text NOT NULL,
  "slot" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "cta_route" text,
  "delivery_status" text NOT NULL DEFAULT 'pending'::text,
  "error" text,
  "ai_reasoning" text,
  "sent_at" timestamp with time zone NOT NULL DEFAULT now(),
  "opened_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."smart_push_log" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."stealth_mode_subscriptions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "plan_type" text NOT NULL,
  "status" text DEFAULT 'active'::text,
  "started_at" timestamp with time zone NOT NULL DEFAULT now(),
  "expires_at" timestamp with time zone,
  "trial_ends_at" timestamp with time zone,
  "amount_paid" numeric,
  "currency" text DEFAULT 'INR'::text,
  "payment_method" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."stealth_mode_subscriptions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."geo_cache" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "query" text NOT NULL,
  "category" text NOT NULL,
  "latitude" numeric NOT NULL,
  "longitude" numeric NOT NULL,
  "radius_km" numeric DEFAULT 5,
  "results" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "sources_used" text[] DEFAULT ARRAY[]::text[],
  "created_at" timestamp with time zone DEFAULT now(),
  "expires_at" timestamp with time zone DEFAULT (now() + '24:00:00'::interval),
  "fetch_duration_ms" integer,
  "result_count" integer DEFAULT 0,
  PRIMARY KEY ("id")
);

ALTER TABLE public."geo_cache" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."geofences" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "type" text NOT NULL,
  "description" text,
  "center_lat" double precision NOT NULL,
  "center_lng" double precision NOT NULL,
  "radius_meters" integer NOT NULL DEFAULT 500,
  "trigger_on_enter" boolean DEFAULT true,
  "trigger_on_exit" boolean DEFAULT false,
  "notification_title" text,
  "notification_body" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "active" boolean DEFAULT true,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."geofences" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."communication_events" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "event_type" text NOT NULL,
  "source" text NOT NULL DEFAULT 'unknown'::text,
  "correlation_id" uuid,
  "conversation_id" uuid,
  "candidate_id" uuid,
  "call_id" uuid,
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "status" text NOT NULL DEFAULT 'received'::text,
  "processed_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."communication_events" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."monetization_leads" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "lead_type" text NOT NULL,
  "listing_id" uuid NOT NULL,
  "listing_type" text NOT NULL,
  "user_id" uuid,
  "action_type" text NOT NULL,
  "location_city" text,
  "location_pincode" text,
  "revenue_potential" numeric DEFAULT 0,
  "is_converted" boolean DEFAULT false,
  "converted_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."monetization_leads" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."finance_expenses" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "org_id" uuid NOT NULL,
  "submitted_by" uuid NOT NULL,
  "merchant" text NOT NULL,
  "amount" numeric NOT NULL,
  "currency" text DEFAULT 'USD'::text,
  "category" text,
  "status" text NOT NULL DEFAULT 'Pending'::text,
  "receipt_url" text,
  "incurred_date" date,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."finance_expenses" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."insurance_preauth" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "insurance_provider" text NOT NULL,
  "policy_number" text NOT NULL,
  "provider_id" uuid,
  "procedure_code" text,
  "procedure_name" text NOT NULL,
  "estimated_cost" numeric,
  "preauth_status" text DEFAULT 'pending'::text,
  "preauth_number" text,
  "approved_amount" numeric,
  "valid_until" date,
  "submitted_at" timestamp with time zone DEFAULT now(),
  "processed_at" timestamp with time zone,
  "notes" text,
  "documents" jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."insurance_preauth" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."energy_pulse_progress" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "current_level" integer DEFAULT 1,
  "high_score" integer DEFAULT 0,
  "total_pulses" integer DEFAULT 0,
  "perfect_hits" integer DEFAULT 0,
  "xp" integer DEFAULT 0,
  "unlocked_themes" text[] DEFAULT ARRAY['default'::text],
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."energy_pulse_progress" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."conversations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "is_group" boolean DEFAULT false,
  "group_name" text,
  "group_description" text,
  "group_icon_url" text,
  "created_by" uuid,
  "disappearing_messages_duration" integer,
  "is_muted" boolean DEFAULT false,
  "custom_wallpaper" text,
  "admin_id" uuid,
  "is_community" boolean DEFAULT false,
  "is_public" boolean DEFAULT false,
  "category" text,
  "member_count" integer DEFAULT 0,
  "community_description" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."conversations" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."ai_models" (
  "id" text NOT NULL,
  "provider" text NOT NULL DEFAULT 'openrouter'::text,
  "model_name" text NOT NULL,
  "supports_chat" boolean DEFAULT true,
  "supports_vision" boolean DEFAULT false,
  "supports_tools" boolean DEFAULT true,
  "supports_streaming" boolean DEFAULT true,
  "cost_rank" integer DEFAULT 1,
  "latency_rank" integer DEFAULT 1,
  "enabled" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."workflow_metrics" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "instance_id" uuid,
  "duration_ms" integer NOT NULL,
  "nodes_executed" integer NOT NULL,
  "tokens_used" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."workflow_metrics" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_plus_bookings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "service_id" uuid NOT NULL,
  "seller_id" uuid NOT NULL,
  "booking_date" timestamp with time zone NOT NULL,
  "status" character varying NOT NULL DEFAULT 'pending'::character varying,
  "customer_name" character varying NOT NULL,
  "customer_phone" character varying NOT NULL,
  "customer_address" text,
  "special_instructions" text,
  "total_amount" integer NOT NULL,
  "platform_fee" integer DEFAULT 0,
  "payment_status" character varying NOT NULL DEFAULT 'pending'::character varying,
  "payment_method" character varying,
  "payment_transaction_id" uuid,
  "cancelled_by" character varying,
  "cancellation_reason" text,
  "cancelled_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_plus_bookings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_coin_transactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "transaction_type" text NOT NULL,
  "amount" integer NOT NULL,
  "source" text NOT NULL,
  "description" text NOT NULL,
  "reference_id" uuid,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_coin_transactions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."dhandha_transactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "merchant_id" uuid NOT NULL,
  "amount" numeric NOT NULL,
  "fee_coins" integer NOT NULL DEFAULT 1,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "upi_link" text NOT NULL,
  "voice_input" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "paid_at" timestamp with time zone,
  "customer_id" uuid,
  PRIMARY KEY ("id")
);

ALTER TABLE public."dhandha_transactions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."agent_sessions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "agent_id" text NOT NULL,
  "session_name" text,
  "messages" jsonb DEFAULT '[]'::jsonb,
  "summary" text,
  "context_tokens" integer DEFAULT 0,
  "total_messages" integer DEFAULT 0,
  "model_used" text,
  "goals" jsonb DEFAULT '[]'::jsonb,
  "open_tasks" jsonb DEFAULT '[]'::jsonb,
  "entities" jsonb DEFAULT '[]'::jsonb,
  "topics" jsonb DEFAULT '[]'::jsonb,
  "mood" text,
  "pinned_context" text,
  "workspace_state" jsonb DEFAULT '{}'::jsonb,
  "memory_references" jsonb DEFAULT '[]'::jsonb,
  "last_active_at" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."agent_sessions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."dead_letters" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "event_id" uuid,
  "error_code" character varying NOT NULL,
  "error_message" text NOT NULL,
  "retry_count" integer NOT NULL DEFAULT 0,
  "last_retry_at" timestamp with time zone,
  "resolved" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."dead_letters" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."growth_competitors" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "org_id" uuid NOT NULL,
  "name" text NOT NULL,
  "market_share" numeric,
  "last_activity" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "deleted_at" timestamp with time zone,
  "version" integer NOT NULL DEFAULT 1,
  PRIMARY KEY ("id")
);

ALTER TABLE public."growth_competitors" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_food_orders" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "restaurant_id" uuid,
  "items" jsonb NOT NULL,
  "subtotal" integer NOT NULL,
  "delivery_fee" integer DEFAULT 0,
  "total" integer NOT NULL,
  "delivery_address" text,
  "delivery_instructions" text,
  "status" text DEFAULT 'pending'::text,
  "payment_method" text DEFAULT 'cod'::text,
  "payment_status" text DEFAULT 'pending'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_food_orders" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."rec_offer_letters" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "candidate_id" uuid NOT NULL,
  "job_id" uuid,
  "offer_text" text NOT NULL DEFAULT ''::text,
  "salary_offered" integer,
  "currency" text DEFAULT 'INR'::text,
  "start_date" date,
  "expiry_date" date,
  "status" text NOT NULL DEFAULT 'draft'::text,
  "sent_at" timestamp with time zone,
  "responded_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."rec_offer_letters" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."contacts_sync_queue" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "payload" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "consent_given" boolean NOT NULL DEFAULT false,
  "item_count" integer NOT NULL DEFAULT 0,
  "error" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "processed_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE public."contacts_sync_queue" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."developer_profiles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "developer_name" text NOT NULL,
  "company_name" text,
  "website" text,
  "bio" text,
  "is_verified" boolean DEFAULT false,
  "total_apps" integer DEFAULT 0,
  "total_downloads" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "portal_enabled" boolean DEFAULT false,
  "api_key" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."developer_profiles" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_menu_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "restaurant_id" uuid,
  "name" text NOT NULL,
  "description" text,
  "price" integer NOT NULL,
  "category" text,
  "image_url" text,
  "is_vegetarian" boolean DEFAULT false,
  "is_vegan" boolean DEFAULT false,
  "is_spicy" boolean DEFAULT false,
  "is_available" boolean DEFAULT true,
  "preparation_time" integer,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_menu_items" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_discovery_profiles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "headline" text,
  "skills" text[] DEFAULT '{}'::text[],
  "company" text,
  "job_title" text,
  "location" text,
  "city" text,
  "country" text,
  "industry" text,
  "website" text,
  "social_links" jsonb DEFAULT '{}'::jsonb,
  "is_searchable" boolean NOT NULL DEFAULT true,
  "search_visibility" text NOT NULL DEFAULT 'everyone'::text,
  "allow_messages_from" text NOT NULL DEFAULT 'everyone'::text,
  "allow_calls_from" text NOT NULL DEFAULT 'contacts_only'::text,
  "show_phone_to" text NOT NULL DEFAULT 'contacts_only'::text,
  "anonymous_mode" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_discovery_profiles" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."seller_settlements" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "seller_id" uuid NOT NULL,
  "payment_id" uuid,
  "amount" numeric NOT NULL,
  "platform_fee" numeric DEFAULT 0,
  "net_amount" numeric NOT NULL,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "settled_at" timestamp with time zone,
  "settlement_reference" text,
  "settlement_method" text,
  "seller_upi_id" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."seller_settlements" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fame_cam_challenges" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "title" character varying NOT NULL,
  "description" text,
  "category_id" uuid,
  "reward_coins" integer DEFAULT 50,
  "duration_seconds" integer,
  "difficulty" character varying DEFAULT 'medium'::character varying,
  "participants_count" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "expires_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fame_cam_challenges" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."game_achievements" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "game_type" text,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "icon" text,
  "coin_reward" integer NOT NULL DEFAULT 100,
  "xp_reward" integer NOT NULL DEFAULT 200,
  "requirement_type" text NOT NULL,
  "requirement_value" integer NOT NULL DEFAULT 1,
  "rarity" text NOT NULL DEFAULT 'common'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."game_achievements" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."notification_queue" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "data" jsonb,
  "status" text DEFAULT 'pending'::text,
  "sent_at" timestamp with time zone,
  "error" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."notification_queue" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."tasks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "due_date" timestamp with time zone,
  "priority" text DEFAULT 'medium'::text,
  "status" text DEFAULT 'pending'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."tasks" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."wellness_programs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "description" text,
  "event_type" text NOT NULL DEFAULT 'online'::text,
  "city" text,
  "venue" text,
  "event_date" timestamp with time zone NOT NULL,
  "cover_image" text,
  "host_id" uuid,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."wellness_programs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."menu_categories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "vendor_id" uuid NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "display_order" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."menu_categories" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."finance_invoices" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "org_id" uuid NOT NULL,
  "client_name" text NOT NULL,
  "amount" numeric NOT NULL,
  "currency" text DEFAULT 'USD'::text,
  "status" text NOT NULL DEFAULT 'Draft'::text,
  "due_date" date,
  "items" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."finance_invoices" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."seller_transactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "seller_id" uuid NOT NULL,
  "booking_id" uuid,
  "service_id" uuid,
  "amount" numeric NOT NULL,
  "transaction_type" text NOT NULL,
  "status" text DEFAULT 'completed'::text,
  "description" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."seller_transactions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."point_transactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "amount" integer NOT NULL,
  "transaction_type" text NOT NULL,
  "source" text NOT NULL,
  "description" text,
  "reference_id" uuid,
  "reference_type" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."point_transactions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."business_subscriptions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_id" uuid NOT NULL,
  "plan_type" text NOT NULL,
  "status" text DEFAULT 'active'::text,
  "monthly_price" numeric DEFAULT 0,
  "features" jsonb DEFAULT '{}'::jsonb,
  "trial_ends_at" timestamp with time zone,
  "billing_cycle_start" date DEFAULT CURRENT_DATE,
  "next_billing_date" date,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."business_subscriptions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."point_rewards" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "points_required" integer NOT NULL,
  "reward_type" text NOT NULL,
  "discount_percentage" integer,
  "discount_amount" numeric,
  "validity_days" integer DEFAULT 30,
  "is_active" boolean DEFAULT true,
  "stock_quantity" integer,
  "max_redemptions_per_user" integer,
  "icon" text,
  "image_url" text,
  "terms" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."point_rewards" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."linked_devices" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "device_name" text,
  "device_type" text DEFAULT 'web'::text,
  "browser" text,
  "os" text,
  "ip_address" text,
  "last_active_at" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone DEFAULT now(),
  "is_active" boolean DEFAULT true,
  "session_token" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."linked_devices" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."automation_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "rule_id" uuid NOT NULL,
  "trigger_type" text NOT NULL,
  "action_taken" text NOT NULL,
  "time_saved_seconds" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."automation_logs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."medicine_catalog" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "generic_name" text,
  "manufacturer" text,
  "category" text,
  "form" text,
  "strength" text,
  "pack_size" integer,
  "mrp" numeric NOT NULL,
  "discounted_price" numeric,
  "requires_prescription" boolean DEFAULT true,
  "for_conditions" text[] DEFAULT '{}'::text[],
  "image_url" text,
  "is_available" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."medicine_catalog" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."menu_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "vendor_id" uuid NOT NULL,
  "category_id" uuid,
  "name" text NOT NULL,
  "description" text,
  "price" numeric NOT NULL,
  "discounted_price" numeric,
  "image_url" text,
  "is_veg" boolean DEFAULT true,
  "is_bestseller" boolean DEFAULT false,
  "is_available" boolean DEFAULT true,
  "preparation_time" integer DEFAULT 15,
  "calories" integer,
  "serves" integer DEFAULT 1,
  "spice_level" integer DEFAULT 1,
  "allergens" text[],
  "customizations" jsonb DEFAULT '[]'::jsonb,
  "display_order" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."menu_items" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_knowledge_edges" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "org_id" uuid NOT NULL,
  "source_node_id" uuid NOT NULL,
  "target_node_id" uuid NOT NULL,
  "edge_type" text NOT NULL,
  "properties" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."sys_knowledge_edges" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."api_keys" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "profile_id" uuid NOT NULL,
  "name" text NOT NULL,
  "key_hash" text NOT NULL,
  "last_used_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."api_keys" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."emotion_circles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "current_emotion" character varying NOT NULL,
  "intensity" integer,
  "looking_for_connection" boolean DEFAULT true,
  "active_until" timestamp with time zone DEFAULT (now() + '00:30:00'::interval),
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."emotion_circles" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."app_permissions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "app_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "permission_name" text NOT NULL,
  "granted" boolean NOT NULL DEFAULT false,
  "granted_at" timestamp with time zone,
  "revoked_at" timestamp with time zone,
  "last_used_at" timestamp with time zone,
  "usage_count" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."app_permissions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."rate_limits" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "identifier" text NOT NULL,
  "action_type" text NOT NULL,
  "attempt_count" integer DEFAULT 1,
  "window_start" timestamp with time zone DEFAULT now(),
  "blocked_until" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."rate_limits" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."story_likes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "story_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."story_likes" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."enterprise_audit_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL,
  "actor_id" uuid,
  "capability_id" text NOT NULL,
  "action" text NOT NULL,
  "severity" text NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."enterprise_audit_logs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_bank_transactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "bank_account_id" uuid NOT NULL,
  "statement_id" uuid,
  "transaction_date" date NOT NULL,
  "value_date" date,
  "amount" numeric NOT NULL,
  "transaction_type" text NOT NULL,
  "currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "description" text NOT NULL,
  "reference_number" text,
  "payee_payer" text,
  "running_balance" numeric,
  "match_status" text NOT NULL DEFAULT 'UNMATCHED'::text,
  "matched_payment_id" uuid,
  "matched_journal_entry_id" uuid,
  "source_event_id" uuid,
  "ai_match_confidence" numeric,
  "ai_proposed_rule" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_bank_transactions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."notifications" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "type" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "read" boolean DEFAULT false,
  "action_url" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "delivery_status" text DEFAULT 'delivered'::text,
  "delivery_error" text,
  "retry_count" integer NOT NULL DEFAULT 0,
  "max_retries" integer NOT NULL DEFAULT 5,
  "next_retry_at" timestamp with time zone,
  "last_attempt_at" timestamp with time zone,
  "is_read" boolean DEFAULT false,
  PRIMARY KEY ("id")
);

ALTER TABLE public."notifications" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."seller_analytics" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "date" date NOT NULL DEFAULT CURRENT_DATE,
  "messages_sent" integer DEFAULT 0,
  "messages_received" integer DEFAULT 0,
  "avg_response_time_seconds" integer,
  "customer_count" integer DEFAULT 0,
  "products_shared" integer DEFAULT 0,
  "broadcasts_sent" integer DEFAULT 0,
  PRIMARY KEY ("id")
);

ALTER TABLE public."seller_analytics" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."business_call_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "profile_id" uuid NOT NULL,
  "caller_number" text NOT NULL,
  "receiver_number" text NOT NULL,
  "direction" text NOT NULL,
  "duration_seconds" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL,
  "routing_workflow_id" uuid,
  "recording_url" text,
  "transcription" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."business_call_logs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."food_vendors" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_id" uuid,
  "name" character varying NOT NULL,
  "description" text,
  "cuisine_type" character varying,
  "avatar_url" text,
  "cover_image_url" text,
  "is_open" boolean DEFAULT true,
  "delivery_time_min" integer DEFAULT 30,
  "delivery_time_max" integer DEFAULT 60,
  "min_order_amount" integer DEFAULT 0,
  "rating_average" numeric DEFAULT 0,
  "rating_count" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."food_vendors" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."ai_agent_training" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "agent_id" uuid NOT NULL,
  "question" text NOT NULL,
  "answer" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."ai_agent_training" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."message_translations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "message_id" uuid,
  "original_language" character varying NOT NULL,
  "target_language" character varying NOT NULL,
  "translated_text" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."message_translations" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."visual_search_history" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "image_url" text NOT NULL,
  "image_analysis" jsonb DEFAULT '{}'::jsonb,
  "search_query_generated" text,
  "results_found" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."visual_search_history" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."rewards_mode_settings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "coin_multiplier" numeric DEFAULT 1.0,
  "daily_challenges_enabled" boolean DEFAULT true,
  "ad_rewards_enabled" boolean DEFAULT true,
  "survey_rewards_enabled" boolean DEFAULT true,
  "streak_bonus_enabled" boolean DEFAULT true,
  "current_streak" integer DEFAULT 0,
  "longest_streak" integer DEFAULT 0,
  "last_activity_date" date,
  "total_coins_earned" integer DEFAULT 0,
  "total_ads_watched" integer DEFAULT 0,
  "total_surveys_completed" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."rewards_mode_settings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_ai_policies" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL,
  "capability_type" text NOT NULL,
  "preferred_provider" text NOT NULL,
  "fallback_allowed" boolean DEFAULT false,
  "fallback_provider" text,
  "policy_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."message_reports" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "message_id" uuid NOT NULL,
  "conversation_id" uuid NOT NULL,
  "reported_by" uuid NOT NULL,
  "reported_user_id" uuid NOT NULL,
  "reason" text NOT NULL,
  "details" text,
  "status" text DEFAULT 'pending'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "reviewed_at" timestamp with time zone,
  "reviewed_by" uuid,
  PRIMARY KEY ("id")
);

ALTER TABLE public."message_reports" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."business_conversations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_id" uuid NOT NULL,
  "customer_id" uuid,
  "conversation_id" uuid NOT NULL,
  "status" text DEFAULT 'open'::text,
  "assigned_to" uuid,
  "tags" text[] DEFAULT ARRAY[]::text[],
  "priority" text DEFAULT 'normal'::text,
  "last_message_at" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."business_conversations" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."visual_search_cache" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "image_hash" text NOT NULL,
  "detected_objects" jsonb,
  "search_results" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "expires_at" timestamp with time zone DEFAULT (now() + '7 days'::interval),
  PRIMARY KEY ("id")
);

ALTER TABLE public."visual_search_cache" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_plus_services" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "seller_id" uuid NOT NULL,
  "category_id" uuid NOT NULL,
  "service_name" character varying NOT NULL,
  "description" text,
  "price_type" character varying NOT NULL DEFAULT 'fixed'::character varying,
  "price" integer,
  "duration_minutes" integer,
  "image_url" text,
  "images" jsonb DEFAULT '[]'::jsonb,
  "availability" jsonb DEFAULT '{"friday": true, "monday": true, "sunday": true, "tuesday": true, "saturday": true, "thursday": true, "wednesday": true}'::jsonb,
  "service_area" character varying,
  "rating_average" numeric DEFAULT 0,
  "rating_count" integer DEFAULT 0,
  "booking_count" integer DEFAULT 0,
  "is_featured" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "tags" text[],
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "pricing_tiers" jsonb DEFAULT '[]'::jsonb,
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_plus_services" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."services" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "provider_id" uuid NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "price" numeric,
  "duration_minutes" integer,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "price_points" integer,
  "point_discount_percentage" integer DEFAULT 0,
  PRIMARY KEY ("id")
);

ALTER TABLE public."services" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."health_family_members" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "caregiver_user_id" uuid NOT NULL,
  "member_name" text NOT NULL,
  "member_phone" text,
  "relationship" text NOT NULL,
  "date_of_birth" date,
  "conditions" text[] DEFAULT '{}'::text[],
  "avatar_url" text,
  "is_active" boolean DEFAULT true,
  "alert_on_missed_dose" boolean DEFAULT true,
  "alert_on_abnormal_vitals" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."health_family_members" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_search_history" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "search_query" text NOT NULL,
  "search_intent" character varying,
  "category" character varying,
  "location" jsonb,
  "results_count" integer DEFAULT 0,
  "clicked_result_id" uuid,
  "clicked_result_type" character varying,
  "session_id" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_search_history" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."growth_campaigns" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "org_id" uuid NOT NULL,
  "name" text NOT NULL,
  "objective" text NOT NULL,
  "status" text NOT NULL DEFAULT 'Draft'::text,
  "budget" numeric,
  "roi_predicted" numeric,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_by" uuid,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer NOT NULL DEFAULT 1,
  PRIMARY KEY ("id")
);

ALTER TABLE public."growth_campaigns" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."seller_withdrawal_requests" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "seller_id" uuid NOT NULL,
  "amount" numeric NOT NULL,
  "bank_account_last4" text,
  "status" text DEFAULT 'pending'::text,
  "requested_at" timestamp with time zone DEFAULT now(),
  "processed_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "rejection_reason" text,
  "transaction_id" text,
  "notes" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."seller_withdrawal_requests" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."game_leaderboards" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "game_type" text NOT NULL,
  "score" integer NOT NULL,
  "level" integer NOT NULL,
  "recorded_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."game_leaderboards" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."benchmark_history" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "provider" character varying NOT NULL,
  "metric_name" character varying NOT NULL,
  "p50_val" numeric,
  "p95_val" numeric,
  "p99_val" numeric,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."benchmark_history" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."contact_invites" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "inviter_id" uuid NOT NULL,
  "contact_email" text,
  "contact_phone" text,
  "contact_name" text,
  "invite_method" text NOT NULL,
  "invite_code" text NOT NULL,
  "status" text DEFAULT 'pending'::text,
  "sent_at" timestamp with time zone DEFAULT now(),
  "clicked_at" timestamp with time zone,
  "joined_at" timestamp with time zone,
  "joined_user_id" uuid,
  "reward_given" boolean DEFAULT false,
  PRIMARY KEY ("id")
);

ALTER TABLE public."contact_invites" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."parallel_you_profiles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "ai_personality" jsonb DEFAULT '{}'::jsonb,
  "chat_patterns" jsonb DEFAULT '{}'::jsonb,
  "evolution_level" integer DEFAULT 1,
  "total_battles" integer DEFAULT 0,
  "wins" integer DEFAULT 0,
  "losses" integer DEFAULT 0,
  "current_level" integer DEFAULT 1,
  "xp" integer DEFAULT 0,
  "last_trained_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."parallel_you_profiles" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fame_leaderboard" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "total_fame_score" integer DEFAULT 0,
  "total_posts" integer DEFAULT 0,
  "total_viral_posts" integer DEFAULT 0,
  "total_coins_earned" integer DEFAULT 0,
  "rank" integer,
  "period" character varying DEFAULT 'all_time'::character varying,
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fame_leaderboard" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."two_factor_auth" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "secret_key_encrypted" text NOT NULL,
  "backup_codes_encrypted" text[],
  "is_enabled" boolean DEFAULT false,
  "last_used_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."two_factor_auth" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."official_accounts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "account_name" text NOT NULL,
  "account_type" text,
  "description" text,
  "logo_url" text,
  "cover_url" text,
  "is_verified" boolean DEFAULT false,
  "follower_count" integer DEFAULT 0,
  "category" text,
  "contact_info" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."official_accounts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."brand_impressions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "brand_id" uuid,
  "placement_id" uuid,
  "user_id" uuid,
  "impression_type" text,
  "video_session_id" uuid,
  "detected_object" text,
  "duration_seconds" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."brand_impressions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."stories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "media_url" text NOT NULL,
  "media_type" text NOT NULL,
  "caption" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "expires_at" timestamp with time zone NOT NULL,
  "privacy" text DEFAULT 'contacts'::text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."stories" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."wellness_communities" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "category" text,
  "city" text,
  "cover_image" text,
  "members_count" integer NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."wellness_communities" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."health_predictions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "prediction_type" text NOT NULL,
  "category" text NOT NULL,
  "prediction_data" jsonb NOT NULL,
  "confidence_score" numeric,
  "generated_at" timestamp with time zone DEFAULT now(),
  "expires_at" timestamp with time zone,
  "is_viewed" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."health_predictions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."webhooks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "profile_id" uuid NOT NULL,
  "name" text NOT NULL,
  "endpoint_url" text NOT NULL,
  "events" text[] NOT NULL DEFAULT '{}'::text[],
  "secret" text NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "last_triggered_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."webhooks" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."message_tasks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "message_id" uuid NOT NULL,
  "conversation_id" uuid NOT NULL,
  "assigner_id" uuid NOT NULL,
  "assignee_id" uuid,
  "title" text NOT NULL,
  "description" text,
  "due_date" timestamp with time zone,
  "status" text DEFAULT 'pending'::text,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."message_tasks" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_plus_categories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" character varying NOT NULL,
  "slug" character varying NOT NULL,
  "description" text,
  "icon_name" character varying,
  "color_scheme" character varying,
  "parent_category_id" uuid,
  "display_order" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_plus_categories" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."qr_login_sessions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "token" text NOT NULL,
  "user_id" uuid,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "device_info" jsonb,
  "ip_address" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "expires_at" timestamp with time zone NOT NULL DEFAULT (now() + '00:02:00'::interval),
  "authenticated_at" timestamp with time zone,
  "scanned_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE public."qr_login_sessions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."micro_task_user_scores" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "risk_score" integer DEFAULT 0,
  "is_soft_blocked" boolean DEFAULT false,
  "total_flags" integer DEFAULT 0,
  "tasks_completed" integer DEFAULT 0,
  "total_earned_coins" integer DEFAULT 0,
  "total_earned_rupees" numeric DEFAULT 0,
  "last_flag_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."micro_task_user_scores" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."connector_credentials" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "connection_id" uuid NOT NULL,
  "access_token" text,
  "refresh_token" text,
  "token_type" text,
  "expires_at" timestamp with time zone,
  "extra" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."connector_credentials" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."crm_activities" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_id" uuid NOT NULL,
  "lead_id" uuid NOT NULL,
  "activity_type" text NOT NULL,
  "subject" text NOT NULL,
  "description" text,
  "scheduled_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "status" text DEFAULT 'pending'::text,
  "created_by" uuid NOT NULL,
  "assigned_to" uuid,
  "duration_minutes" integer,
  "outcome" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "sentiment" text,
  "intent_detected" text,
  "key_takeaways" text[],
  "action_items" jsonb[],
  PRIMARY KEY ("id")
);

ALTER TABLE public."crm_activities" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chat_folder_items" (
  "folder_id" uuid NOT NULL,
  "conversation_id" uuid NOT NULL,
  "added_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("folder_id", "conversation_id")
);

ALTER TABLE public."chat_folder_items" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."teleconsultation_bookings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "doctor_id" uuid,
  "appointment_date" timestamp with time zone NOT NULL,
  "duration_minutes" integer DEFAULT 30,
  "consultation_type" text DEFAULT 'video'::text,
  "reason" text NOT NULL,
  "symptoms" text[],
  "status" text DEFAULT 'scheduled'::text,
  "meeting_link" text,
  "prescription_id" uuid,
  "notes" text,
  "payment_amount" numeric,
  "payment_status" text DEFAULT 'pending'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."teleconsultation_bookings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."reported_reviews" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "review_id" uuid NOT NULL,
  "reported_by" uuid NOT NULL,
  "reason" text NOT NULL,
  "details" text,
  "status" text DEFAULT 'pending'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "reviewed_at" timestamp with time zone,
  "reviewed_by" uuid,
  PRIMARY KEY ("id")
);

ALTER TABLE public."reported_reviews" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."ai_moments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "conversation_snippet" text NOT NULL,
  "emotion_captured" character varying,
  "share_count" integer DEFAULT 0,
  "like_count" integer DEFAULT 0,
  "is_public" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."ai_moments" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."message_retry_log" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "message_id" uuid NOT NULL,
  "retry_count" integer DEFAULT 0,
  "last_retry_at" timestamp with time zone,
  "error_message" text,
  "succeeded" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."message_retry_log" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_revenue_schedules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "contract_id" uuid NOT NULL,
  "obligation_id" uuid NOT NULL,
  "period_id" uuid,
  "schedule_number" integer NOT NULL,
  "scheduled_date" date NOT NULL,
  "scheduled_amount" numeric NOT NULL,
  "recognized_amount" numeric NOT NULL DEFAULT 0,
  "currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "fx_rate" numeric NOT NULL DEFAULT 1.0,
  "status" text NOT NULL DEFAULT 'SCHEDULED'::text,
  "recognized_at" timestamp with time zone,
  "journal_entry_id" uuid,
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_revenue_schedules" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."seo_opportunities" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "domain" text NOT NULL,
  "cluster" text,
  "target_path" text,
  "intent" text NOT NULL,
  "action" text NOT NULL DEFAULT 'create'::text,
  "evidence" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "evidence_source" text NOT NULL,
  "status" text NOT NULL DEFAULT 'proposed'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."seo_opportunities" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."activity_events" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "org_id" uuid NOT NULL,
  "actor_id" uuid,
  "capability" text NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "action" text NOT NULL,
  "payload" jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."encryption_keys" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "public_key" text NOT NULL,
  "device_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "expires_at" timestamp with time zone,
  "revoked_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE public."encryption_keys" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_status" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "media_url" text,
  "media_type" text,
  "content" text,
  "background_color" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "expires_at" timestamp with time zone DEFAULT (now() + '24:00:00'::interval),
  "views_count" integer DEFAULT 0,
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_status" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."error_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "message" text NOT NULL,
  "stack" text,
  "component" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "user_agent" text,
  "url" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."error_logs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_account_mappings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid,
  "event_type" text NOT NULL,
  "event_subtype" text,
  "accounting_standard" text NOT NULL,
  "debit_account_id" uuid NOT NULL,
  "credit_account_id" uuid NOT NULL,
  "conditions" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "policy_id" uuid,
  "priority" integer NOT NULL DEFAULT 100,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_account_mappings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."message_drafts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "conversation_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."message_drafts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."challenge_participations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "challenge_id" uuid,
  "user_id" uuid,
  "post_id" uuid,
  "completed" boolean DEFAULT false,
  "coins_awarded" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."challenge_participations" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."app_installs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "app_id" uuid NOT NULL,
  "installed_version" character varying,
  "device_type" character varying DEFAULT 'web'::character varying,
  "installed_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "is_active" boolean DEFAULT true,
  PRIMARY KEY ("id")
);

ALTER TABLE public."app_installs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_fixed_assets" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid NOT NULL,
  "asset_number" text NOT NULL,
  "asset_name" text NOT NULL,
  "category" text NOT NULL,
  "acquisition_date" date NOT NULL,
  "acquisition_cost" numeric NOT NULL,
  "salvage_value" numeric NOT NULL DEFAULT 0,
  "useful_life_months" integer NOT NULL,
  "depreciation_method" text NOT NULL DEFAULT 'STRAIGHT_LINE'::text,
  "accumulated_depreciation" numeric NOT NULL DEFAULT 0,
  "net_book_value" numeric NOT NULL,
  "asset_account_id" uuid NOT NULL,
  "accum_dep_account_id" uuid NOT NULL,
  "dep_expense_account_id" uuid NOT NULL,
  "status" text NOT NULL DEFAULT 'ACTIVE'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_fixed_assets" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."vendor_notifications" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "vendor_id" uuid NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "type" text DEFAULT 'info'::text,
  "is_read" boolean DEFAULT false,
  "action_url" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."vendor_notifications" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_reconciliation_matches" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "session_id" uuid,
  "bank_transaction_id" uuid NOT NULL,
  "payment_id" uuid,
  "journal_line_id" uuid,
  "match_rule" text NOT NULL,
  "confidence_score" numeric NOT NULL DEFAULT 1.0,
  "bank_amount" numeric NOT NULL,
  "ledger_amount" numeric NOT NULL,
  "fee_difference" numeric NOT NULL DEFAULT 0,
  "variance" numeric NOT NULL DEFAULT 0,
  "is_approved" boolean NOT NULL DEFAULT true,
  "approved_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_reconciliation_matches" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."studio_user_designs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "template_id" uuid,
  "name" text NOT NULL,
  "design_data" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "thumbnail_url" text,
  "exported_url" text,
  "is_published" boolean DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."studio_user_designs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."starred_messages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "message_id" uuid NOT NULL,
  "conversation_id" uuid NOT NULL,
  "starred_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."starred_messages" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."calls" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "conversation_id" uuid NOT NULL,
  "caller_id" uuid NOT NULL,
  "call_type" text NOT NULL,
  "status" text DEFAULT 'ringing'::text,
  "started_at" timestamp with time zone DEFAULT now(),
  "ended_at" timestamp with time zone,
  "duration" integer,
  "caller_name" text,
  "receiver_id" uuid,
  "receiver_name" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "is_group" boolean DEFAULT false,
  "participants" jsonb DEFAULT '[]'::jsonb,
  "missed" boolean DEFAULT false,
  "quality_rating" integer,
  "connection_quality" character varying DEFAULT 'good'::character varying,
  "average_bitrate" integer,
  "packet_loss_percentage" numeric,
  "quality_metrics" jsonb DEFAULT '{}'::jsonb,
  "total_participants" integer DEFAULT 2,
  "reconnection_count" integer DEFAULT 0,
  "caller_avatar" text,
  "receiver_avatar" text,
  "webrtc_state" text DEFAULT 'signaling'::text,
  "caller_phone" text,
  "receiver_phone" text,
  "outcome_status" text,
  "pre_call_intent" text,
  "user_feedback_score" integer,
  "ai_confidence_score" numeric,
  "clarity_score" numeric,
  "has_outcome_logged" boolean DEFAULT false,
  "outcome_tag" text,
  "outcome_note" text,
  "route_type" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."calls" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_journal_entries" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid NOT NULL,
  "period_id" uuid NOT NULL,
  "entry_number" text NOT NULL,
  "posting_date" date NOT NULL,
  "transaction_currency" bpchar NOT NULL,
  "functional_currency" bpchar NOT NULL,
  "reporting_currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "fx_rate" numeric NOT NULL DEFAULT 1.0,
  "fx_rate_functional" numeric NOT NULL DEFAULT 1.0,
  "fx_rate_reporting" numeric NOT NULL DEFAULT 1.0,
  "fx_rate_source" text NOT NULL DEFAULT 'manual'::text,
  "fx_date" date,
  "source_event_id" uuid,
  "source_type" text NOT NULL,
  "source_id" text,
  "source_url" text,
  "entry_type" text NOT NULL DEFAULT 'STANDARD'::text,
  "accounting_standard" text NOT NULL,
  "policy_version_id" uuid,
  "status" text NOT NULL DEFAULT 'DRAFT'::text,
  "reversal_of_id" uuid,
  "reversed_by_id" uuid,
  "reversal_date" date,
  "approval_id" uuid,
  "approved_by" uuid,
  "approved_at" timestamp with time zone,
  "memo" text,
  "reference" text,
  "tags" jsonb DEFAULT '[]'::jsonb,
  "ai_proposed" boolean NOT NULL DEFAULT false,
  "ai_confidence" numeric,
  "ai_rationale" text,
  "created_by" uuid NOT NULL,
  "posted_by" uuid,
  "posted_at" timestamp with time zone,
  "voided_by" uuid,
  "voided_at" timestamp with time zone,
  "void_reason" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_journal_entries" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."analytics_data" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "date" date NOT NULL DEFAULT CURRENT_DATE,
  "total_appointments" integer DEFAULT 0,
  "total_revenue" numeric DEFAULT 0,
  "new_users" integer DEFAULT 0,
  "active_providers" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."analytics_data" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."app_analytics" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "app_id" uuid,
  "user_id" uuid,
  "event_type" text NOT NULL,
  "session_duration" integer,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."app_analytics" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_close_tasks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "checklist_id" uuid NOT NULL,
  "task_code" text NOT NULL,
  "task_name" text NOT NULL,
  "sequence_order" integer NOT NULL DEFAULT 1,
  "category" text NOT NULL,
  "status" text NOT NULL DEFAULT 'PENDING'::text,
  "is_automated" boolean NOT NULL DEFAULT true,
  "assigned_to" uuid,
  "completed_at" timestamp with time zone,
  "completed_by" uuid,
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_close_tasks" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."point_earning_rules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "rule_type" text NOT NULL,
  "points_awarded" integer NOT NULL,
  "description" text,
  "is_active" boolean DEFAULT true,
  "max_daily_claims" integer,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."point_earning_rules" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_capability_installs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "capability_id" text NOT NULL,
  "capability_name" text NOT NULL,
  "capability_type" text NOT NULL DEFAULT 'agent'::text,
  "workspace_path" text NOT NULL,
  "icon_name" text,
  "color" text,
  "structure" jsonb DEFAULT '[]'::jsonb,
  "status" text NOT NULL DEFAULT 'installed'::text,
  "config" jsonb DEFAULT '{}'::jsonb,
  "version" text NOT NULL DEFAULT '1.0.0'::text,
  "installed_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_capability_installs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_search_cache" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "query_hash" text NOT NULL,
  "query" text NOT NULL,
  "results" jsonb,
  "source" text DEFAULT 'google'::text,
  "hit_count" integer DEFAULT 1,
  "created_at" timestamp with time zone DEFAULT now(),
  "expires_at" timestamp with time zone DEFAULT (now() + '24:00:00'::interval),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_search_cache" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."brand_partnerships" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "brand_name" text NOT NULL,
  "brand_logo_url" text,
  "brand_website" text,
  "contact_email" text,
  "status" text DEFAULT 'active'::text,
  "budget_remaining" integer DEFAULT 0,
  "cost_per_impression" integer DEFAULT 10,
  "cost_per_interaction" integer DEFAULT 50,
  "target_categories" text[] DEFAULT '{}'::text[],
  "target_demographics" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."brand_partnerships" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."phonebook_opt_outs" (
  "phone_hash" text NOT NULL,
  "reason" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("phone_hash")
);

ALTER TABLE public."phonebook_opt_outs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sales_deals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "lead_id" uuid,
  "name" text NOT NULL,
  "amount" numeric DEFAULT 0,
  "currency" text DEFAULT 'USD'::text,
  "stage" text NOT NULL DEFAULT 'Discovery'::text,
  "probability" integer DEFAULT 0,
  "expected_close_date" date,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."sales_deals" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_integrity_reports" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "snapshot_at" timestamp with time zone NOT NULL DEFAULT now(),
  "integrity_score" numeric NOT NULL DEFAULT 100.00,
  "total_checks" integer NOT NULL DEFAULT 0,
  "passed_checks" integer NOT NULL DEFAULT 0,
  "ar_gl_diff" numeric NOT NULL DEFAULT 0,
  "ap_gl_diff" numeric NOT NULL DEFAULT 0,
  "cash_gl_diff" numeric NOT NULL DEFAULT 0,
  "anomalies" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "status" text NOT NULL DEFAULT 'HEALTHY'::text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_integrity_reports" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_entities" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "module_id" uuid NOT NULL,
  "name" text NOT NULL,
  "table_name" text NOT NULL,
  "state_machine_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."review_replies" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "review_id" uuid NOT NULL,
  "seller_id" uuid NOT NULL,
  "reply_text" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."review_replies" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."champions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "points" integer NOT NULL DEFAULT 0,
  "tier" text NOT NULL DEFAULT 'Bronze'::text,
  "rank" integer,
  "streak_days" integer NOT NULL DEFAULT 0,
  "referral_count" integer NOT NULL DEFAULT 0,
  "calls_made" integer NOT NULL DEFAULT 0,
  "badge_earned_at" timestamp with time zone,
  "previous_rank" integer,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."champions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."workspace_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL,
  "name" text NOT NULL,
  "content" text NOT NULL,
  "category" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."workspace_templates" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."message_reactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "message_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "emoji" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."message_reactions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_activities" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "activity_type" text NOT NULL,
  "coins_earned" integer DEFAULT 0,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_activities" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_close_checklists" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid NOT NULL,
  "period_id" uuid NOT NULL,
  "title" text NOT NULL,
  "total_tasks" integer NOT NULL DEFAULT 0,
  "completed_tasks" integer NOT NULL DEFAULT 0,
  "completion_pct" numeric NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'IN_PROGRESS'::text,
  "closed_at" timestamp with time zone,
  "closed_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_close_checklists" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."inter_app_messages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "source_app_id" uuid NOT NULL,
  "target_app_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "message_type" text NOT NULL,
  "action" text NOT NULL,
  "payload" jsonb DEFAULT '{}'::jsonb,
  "priority" integer DEFAULT 0,
  "sent_at" timestamp with time zone NOT NULL DEFAULT now(),
  "delivered_at" timestamp with time zone,
  "acknowledged_at" timestamp with time zone,
  "expires_at" timestamp with time zone,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "error_message" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."inter_app_messages" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."message_security_scans" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "message_id" uuid NOT NULL,
  "overall_score" integer NOT NULL DEFAULT 0,
  "overall_level" text NOT NULL DEFAULT 'safe'::text,
  "detections" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "explanation" jsonb,
  "recommended_action" text,
  "scanned_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."message_security_scans" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_organizations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "slug" text,
  "owner_id" uuid NOT NULL,
  "settings" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."sys_organizations" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_identities" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "handle" text NOT NULL,
  "suffix" text NOT NULL DEFAULT 'public'::text,
  "full_handle" text,
  "display_name" text,
  "bio" text,
  "avatar_url" text,
  "identity_type" text NOT NULL DEFAULT 'personal'::text,
  "is_active" boolean NOT NULL DEFAULT true,
  "visibility" text NOT NULL DEFAULT 'public'::text,
  "auto_reply_enabled" boolean NOT NULL DEFAULT false,
  "ai_clone_config" jsonb DEFAULT '{}'::jsonb,
  "ai_clone_enabled" boolean NOT NULL DEFAULT false,
  "ai_clone_personality" text,
  "ai_clone_boundaries" jsonb DEFAULT '{"allow_business": true, "allow_networking": true, "max_reply_length": 500, "allow_job_inquiries": true}'::jsonb,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_identities" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."contacts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "contact_phone" text NOT NULL,
  "contact_user_id" uuid,
  "contact_name" text,
  "is_registered" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  "contact_phone_hash" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."contacts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."therapy_sessions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "therapist_id" uuid NOT NULL,
  "session_type" text NOT NULL,
  "scheduled_at" timestamp with time zone NOT NULL,
  "duration_minutes" integer DEFAULT 45,
  "status" text NOT NULL DEFAULT 'scheduled'::text,
  "session_notes" text,
  "mood_before" integer,
  "mood_after" integer,
  "payment_status" text DEFAULT 'pending'::text,
  "amount" numeric,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."therapy_sessions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."search_queries" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "query_text" text NOT NULL,
  "intent" text,
  "category" text,
  "location_lat" numeric,
  "location_lng" numeric,
  "location_text" text,
  "source" text DEFAULT 'internal'::text,
  "timestamp" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."search_queries" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."home_solutions_bookings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "category" home_solutions_category NOT NULL,
  "item_code" text NOT NULL,
  "item_title" text NOT NULL,
  "item_icon" text,
  "items" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "quantity" integer NOT NULL DEFAULT 1,
  "price_label" text,
  "total_amount" numeric,
  "contact_name" text NOT NULL,
  "contact_phone" text NOT NULL,
  "address" text NOT NULL,
  "preferred_date" date,
  "notes" text,
  "status" home_solutions_status NOT NULL DEFAULT 'pending'::home_solutions_status,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "payment_method" text NOT NULL DEFAULT 'cod'::text,
  "payment_status" text NOT NULL DEFAULT 'pending'::text,
  "cancellation_reason" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."home_solutions_bookings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."service_categories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "icon_url" text,
  "parent_id" uuid,
  "display_order" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."service_categories" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."onboarding_progress" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "step_name" text NOT NULL,
  "completed" boolean DEFAULT false,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."onboarding_progress" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."call_summaries" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "call_id" text NOT NULL,
  "user_id" uuid,
  "summary" text NOT NULL DEFAULT ''::text,
  "key_points" jsonb DEFAULT '[]'::jsonb,
  "action_items" jsonb DEFAULT '[]'::jsonb,
  "topics" jsonb DEFAULT '[]'::jsonb,
  "sentiment" text DEFAULT 'neutral'::text,
  "sentiment_history" jsonb DEFAULT '[]'::jsonb,
  "follow_up_required" boolean DEFAULT false,
  "next_steps" jsonb DEFAULT '[]'::jsonb,
  "transcript" text,
  "trust_score" integer DEFAULT 50,
  "is_scam" boolean DEFAULT false,
  "duration_seconds" integer,
  "participants" jsonb DEFAULT '[]'::jsonb,
  "generated_at" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."call_summaries" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."channel_members" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "channel_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role" text NOT NULL DEFAULT 'subscriber'::text,
  "joined_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."channel_members" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."announcements" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "message" text NOT NULL,
  "created_by" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "is_active" boolean DEFAULT true,
  "target_audience" text DEFAULT 'all'::text,
  "delivery_method" text DEFAULT 'in_app'::text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."announcements" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_payment_methods" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "method_type" character varying NOT NULL,
  "provider" character varying,
  "upi_id" character varying,
  "card_last_4" character varying,
  "is_default" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_payment_methods" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_knowledge_nodes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "org_id" uuid NOT NULL,
  "node_type" text NOT NULL,
  "entity_id" uuid,
  "label" text NOT NULL,
  "properties" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."sys_knowledge_nodes" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."photo_albums" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "name" character varying NOT NULL,
  "description" text,
  "cover_photo_url" text,
  "is_public" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."photo_albums" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_badges" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "badge_type" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "icon_url" text,
  "requirement_type" text NOT NULL,
  "requirement_value" integer NOT NULL,
  "coin_reward" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_badges" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."cc_tasks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "plan_id" uuid,
  "department" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "status" text NOT NULL DEFAULT 'todo'::text,
  "assigned_agent" text,
  "result" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."cc_tasks" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_healthcare" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "owner_id" uuid,
  "name" text NOT NULL,
  "provider_type" text NOT NULL,
  "specialty" text,
  "description" text,
  "address" text,
  "city" text,
  "latitude" numeric,
  "longitude" numeric,
  "phone" text,
  "email" text,
  "website" text,
  "image_url" text,
  "gallery_images" text[],
  "rating_average" numeric DEFAULT 0,
  "rating_count" integer DEFAULT 0,
  "consultation_fee" integer,
  "is_verified" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "available_days" text[],
  "opening_time" time,
  "closing_time" time,
  "accepts_insurance" boolean DEFAULT false,
  "insurance_providers" text[],
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "is_mental_health_provider" boolean DEFAULT false,
  "mental_health_specialties" text[],
  "offers_teletherapy" boolean DEFAULT false,
  "therapy_modes" text[],
  "languages" text[],
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_healthcare" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."health_wallet_transactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "wallet_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "transaction_type" text NOT NULL,
  "amount" numeric NOT NULL,
  "balance_after" numeric NOT NULL,
  "description" text NOT NULL,
  "reference_type" text,
  "reference_id" uuid,
  "status" text DEFAULT 'completed'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."health_wallet_transactions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."network_diagnostics" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "connection_type" text,
  "downlink_speed" numeric,
  "uplink_speed" numeric,
  "latency" numeric,
  "diagnostics_data" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."network_diagnostics" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_wallet_transactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "wallet_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "type" character varying NOT NULL,
  "amount" numeric NOT NULL,
  "balance_after" numeric NOT NULL,
  "description" text,
  "reference_type" character varying,
  "reference_id" uuid,
  "status" character varying DEFAULT 'completed'::character varying,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_wallet_transactions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."health_wallet" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "balance" numeric DEFAULT 0,
  "total_earned" numeric DEFAULT 0,
  "total_spent" numeric DEFAULT 0,
  "insurance_provider" text,
  "insurance_number" text,
  "insurance_expiry" date,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."health_wallet" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."payments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "appointment_id" uuid,
  "provider_id" uuid,
  "patient_id" uuid NOT NULL,
  "amount" numeric NOT NULL,
  "payment_status" text DEFAULT 'pending'::text,
  "payment_method" text,
  "transaction_id" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "points_amount" integer DEFAULT 0,
  "payment_type" text DEFAULT 'cash'::text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."payments" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."crm_evidence_ledger" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_id" uuid NOT NULL,
  "lead_id" uuid NOT NULL,
  "field_name" text NOT NULL,
  "source_url" text NOT NULL,
  "quoted_snippet" text NOT NULL,
  "confidence_score" numeric DEFAULT 0.95,
  "retrieved_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."crm_evidence_ledger" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."business_categories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "icon" text,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."business_categories" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."app_versions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "app_id" uuid NOT NULL,
  "version_code" integer NOT NULL,
  "version_name" character varying NOT NULL,
  "download_url" text,
  "release_notes" text,
  "is_force_update" boolean DEFAULT false,
  "file_size_bytes" bigint,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."app_versions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."healthcare_db" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "type" text NOT NULL,
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
  "specialties" text[],
  "services_offered" text[],
  "rating_average" numeric DEFAULT 0,
  "rating_count" integer DEFAULT 0,
  "verified" boolean DEFAULT false,
  "verified_by" uuid,
  "verified_at" timestamp with time zone,
  "added_by" uuid NOT NULL,
  "monetization_tier" text DEFAULT 'free'::text,
  "is_monetized" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."healthcare_db" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."kg_edges" (
  "id" text NOT NULL,
  "tenant_id" text NOT NULL,
  "source_node_id" text NOT NULL,
  "target_node_id" text NOT NULL,
  "relation" text NOT NULL,
  "weight" numeric NOT NULL DEFAULT 1.0,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."kg_edges" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."connector_webhook_events" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "connector_id" text NOT NULL,
  "connection_id" uuid,
  "event_type" text,
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "processed" boolean NOT NULL DEFAULT false,
  "error" text,
  "received_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."connector_webhook_events" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."subscription_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "subscription_id" uuid NOT NULL,
  "medicine_id" uuid,
  "medicine_name" text NOT NULL,
  "dosage" text,
  "frequency" text,
  "timing" text[] DEFAULT '{}'::text[],
  "quantity_per_month" integer DEFAULT 30,
  "unit_price" numeric,
  "total_price" numeric,
  "is_generic" boolean DEFAULT false,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."subscription_items" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."provider_specializations" (
  "provider_id" uuid NOT NULL,
  "specialization_id" uuid NOT NULL,
  PRIMARY KEY ("provider_id", "specialization_id")
);

ALTER TABLE public."provider_specializations" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."search_analytics" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "query_text" text NOT NULL,
  "search_type" character varying NOT NULL,
  "intent" character varying,
  "result_count" integer DEFAULT 0,
  "clicked_result_id" text,
  "clicked_position" integer,
  "has_location" boolean DEFAULT false,
  "latitude" numeric,
  "longitude" numeric,
  "timestamp" timestamp with time zone DEFAULT now(),
  "response_time_ms" integer,
  "source" character varying,
  PRIMARY KEY ("id")
);

ALTER TABLE public."search_analytics" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."session_participants" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "session_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "joined_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."session_participants" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."job_applications" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "job_id" uuid NOT NULL,
  "applicant_id" uuid NOT NULL,
  "cover_letter" text,
  "resume_url" text,
  "expected_salary" integer,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "employer_notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."job_applications" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_departments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_unit_id" uuid NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."user_push_health" (
  "user_id" uuid NOT NULL,
  "has_valid_token" boolean NOT NULL DEFAULT true,
  "last_checked_at" timestamp with time zone NOT NULL DEFAULT now(),
  "last_error" text,
  "invalid_token_count" integer NOT NULL DEFAULT 0,
  "consecutive_failures" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("user_id")
);

ALTER TABLE public."user_push_health" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."local_deals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_id" uuid,
  "title" character varying NOT NULL,
  "description" text,
  "original_price" integer NOT NULL,
  "discounted_price" integer NOT NULL,
  "discount_percentage" integer,
  "image_url" text,
  "category" character varying,
  "location" text,
  "valid_until" timestamp with time zone,
  "max_redemptions" integer,
  "current_redemptions" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."local_deals" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."message_delivery_status" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "message_id" uuid NOT NULL,
  "recipient_id" uuid NOT NULL,
  "status" text NOT NULL DEFAULT 'sent'::text,
  "delivered_at" timestamp with time zone,
  "read_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."message_delivery_status" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."dpdp_opt_outs" (
  "hashed_number" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("hashed_number")
);

ALTER TABLE public."dpdp_opt_outs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_plus_reviews" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "booking_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "service_id" uuid NOT NULL,
  "seller_id" uuid NOT NULL,
  "rating" integer NOT NULL,
  "review_text" text,
  "images" text[],
  "is_verified" boolean DEFAULT false,
  "helpful_count" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_plus_reviews" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_deals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "merchant_id" uuid,
  "title" text NOT NULL,
  "description" text,
  "category" text NOT NULL,
  "original_price" integer,
  "deal_price" integer,
  "discount_percent" integer,
  "coupon_code" text,
  "image_url" text,
  "terms_conditions" text,
  "location" text,
  "latitude" numeric,
  "longitude" numeric,
  "is_active" boolean DEFAULT true,
  "max_redemptions" integer,
  "current_redemptions" integer DEFAULT 0,
  "starts_at" timestamp with time zone DEFAULT now(),
  "expires_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_deals" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_teams" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "org_id" uuid NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."sys_teams" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."connector_records" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "connection_id" uuid NOT NULL,
  "connector_id" text NOT NULL,
  "capability" text NOT NULL,
  "record_type" text NOT NULL,
  "external_id" text NOT NULL,
  "title" text,
  "body" text,
  "url" text,
  "author" text,
  "participants" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "occurred_at" timestamp with time zone,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."connector_records" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."deal_redemptions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "deal_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "redeemed_at" timestamp with time zone DEFAULT now(),
  "qr_code" text,
  "vendor_id" uuid,
  "redemption_code" text,
  "status" text DEFAULT 'claimed'::text,
  "claimed_at" timestamp with time zone DEFAULT now(),
  "expired_at" timestamp with time zone,
  "amount_saved" numeric,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."deal_redemptions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."mcp_request_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "api_key_id" uuid,
  "user_id" uuid,
  "tool_name" text NOT NULL,
  "request_payload" jsonb,
  "response_status" text NOT NULL,
  "latency_ms" integer,
  "error_message" text,
  "ip_address" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."mcp_request_logs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."service_bundles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "bundle_type" text DEFAULT 'combo'::text,
  "included_services" jsonb NOT NULL,
  "original_price" numeric,
  "bundle_price" numeric NOT NULL,
  "validity_days" integer,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."service_bundles" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."cc_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "agent" text NOT NULL,
  "action" text NOT NULL,
  "level" text NOT NULL DEFAULT 'info'::text,
  "details" jsonb DEFAULT '{}'::jsonb,
  "plan_id" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."cc_logs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."voicemails" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "caller_id" uuid NOT NULL,
  "receiver_id" uuid NOT NULL,
  "audio_url" text NOT NULL,
  "transcription" text,
  "duration_seconds" integer,
  "is_read" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."voicemails" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."server_abuse_limits" (
  "rate_key" text NOT NULL,
  "action_type" text NOT NULL,
  "request_count" integer NOT NULL DEFAULT 1,
  "window_start" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("rate_key", "action_type")
);

ALTER TABLE public."server_abuse_limits" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."e2e_sessions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "peer_id" uuid NOT NULL,
  "session_state" text NOT NULL,
  "root_key" text,
  "chain_key" text,
  "message_number" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."e2e_sessions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."location_shares" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "shared_with" uuid[] NOT NULL,
  "duration" text NOT NULL,
  "expires_at" timestamp with time zone,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."location_shares" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."session_room_participants" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "room_id" uuid,
  "user_id" uuid,
  "joined_at" timestamp with time zone NOT NULL DEFAULT now(),
  "left_at" timestamp with time zone,
  "call_id" uuid,
  PRIMARY KEY ("id")
);

ALTER TABLE public."session_room_participants" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."pinned_messages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "conversation_id" uuid NOT NULL,
  "message_id" uuid NOT NULL,
  "pinned_by" uuid NOT NULL,
  "pinned_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."pinned_messages" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."device_tokens" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "device_token" text NOT NULL,
  "platform" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "last_used_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."device_tokens" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."tutor_reviews" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "tutor_id" uuid,
  "student_id" uuid,
  "booking_id" uuid,
  "rating" integer NOT NULL,
  "review_text" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."tutor_reviews" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."service_providers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "business_name" text NOT NULL,
  "description" text,
  "profile_image_url" text,
  "experience_years" integer,
  "latitude" numeric,
  "longitude" numeric,
  "address" text,
  "city" text,
  "state" text,
  "pincode" text,
  "kyc_status" text DEFAULT 'pending'::text,
  "aadhaar_number" text,
  "pan_number" text,
  "aadhaar_document_url" text,
  "pan_document_url" text,
  "other_documents" jsonb DEFAULT '[]'::jsonb,
  "is_online" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "is_verified" boolean DEFAULT false,
  "verified_at" timestamp with time zone,
  "verified_by" uuid,
  "rating_average" numeric DEFAULT 0,
  "rating_count" integer DEFAULT 0,
  "total_bookings" integer DEFAULT 0,
  "total_earnings" numeric DEFAULT 0,
  "commission_percentage" numeric DEFAULT 20,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "phone_number" text,
  "email" text,
  "base_price" numeric DEFAULT 0,
  "pricing_type" text DEFAULT 'fixed'::text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."service_providers" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_accruals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid NOT NULL,
  "period_id" uuid NOT NULL,
  "accrual_number" text NOT NULL,
  "title" text NOT NULL,
  "accrual_type" text NOT NULL,
  "amount" numeric NOT NULL,
  "currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "expense_account_id" uuid NOT NULL,
  "liability_account_id" uuid NOT NULL,
  "reversal_date" date NOT NULL,
  "status" text NOT NULL DEFAULT 'DRAFT'::text,
  "source_event_id" uuid,
  "journal_entry_id" uuid,
  "reversal_entry_id" uuid,
  "ai_estimated" boolean NOT NULL DEFAULT false,
  "ai_confidence" numeric,
  "ai_rationale" text,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_accruals" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."invite_links" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "invite_code" text NOT NULL,
  "uses_count" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."invite_links" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_leaderboards" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "leaderboard_type" text NOT NULL,
  "score" integer NOT NULL DEFAULT 0,
  "rank" integer,
  "city" text,
  "country" text DEFAULT 'India'::text,
  "period" text NOT NULL DEFAULT 'all_time'::text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_leaderboards" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."seo_search_metrics" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "site_url" text NOT NULL,
  "metric_date" date NOT NULL,
  "page" text NOT NULL DEFAULT ''::text,
  "query" text NOT NULL DEFAULT ''::text,
  "country" text NOT NULL DEFAULT ''::text,
  "device" text NOT NULL DEFAULT ''::text,
  "clicks" numeric NOT NULL DEFAULT 0,
  "impressions" numeric NOT NULL DEFAULT 0,
  "ctr" numeric NOT NULL DEFAULT 0,
  "position" numeric NOT NULL DEFAULT 0,
  "synced_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."seo_search_metrics" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_restaurants" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "owner_id" uuid,
  "name" text NOT NULL,
  "description" text,
  "cuisine_type" text[],
  "address" text,
  "city" text,
  "latitude" numeric,
  "longitude" numeric,
  "phone" text,
  "image_url" text,
  "gallery_images" text[],
  "rating_average" numeric DEFAULT 0,
  "rating_count" integer DEFAULT 0,
  "price_range" text DEFAULT '$$'::text,
  "is_verified" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "delivery_available" boolean DEFAULT true,
  "delivery_fee" integer DEFAULT 0,
  "min_order_amount" integer DEFAULT 0,
  "opening_time" time,
  "closing_time" time,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_restaurants" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fame_achievements" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" character varying NOT NULL,
  "description" text,
  "badge_emoji" character varying,
  "requirement_type" character varying,
  "requirement_value" integer,
  "coin_reward" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fame_achievements" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."ai_memory_knowledge" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL,
  "document_id" uuid,
  "content" text NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "embedding" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."job_saved" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "job_id" uuid NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."job_saved" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_views" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "entity_id" uuid NOT NULL,
  "type" text NOT NULL,
  "name" text NOT NULL,
  "layout_json" jsonb DEFAULT '{}'::jsonb,
  "theme_json" jsonb DEFAULT '{}'::jsonb,
  "behavior_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."user_health_profiles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "conditions" text[] DEFAULT '{}'::text[],
  "date_of_birth" date,
  "gender" text,
  "blood_group" text,
  "height_cm" numeric,
  "weight_kg" numeric,
  "emergency_contact_name" text,
  "emergency_contact_phone" text,
  "preferred_language" text DEFAULT 'en'::text,
  "reminder_preferences" jsonb DEFAULT '{"night": "22:00", "evening": "20:00", "morning": "08:00", "afternoon": "14:00"}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_health_profiles" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chronic_vitals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "family_member_id" uuid,
  "vital_type" text NOT NULL,
  "value" numeric NOT NULL,
  "unit" text,
  "reading_time" text,
  "notes" text,
  "source" text DEFAULT 'manual'::text,
  "recorded_at" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chronic_vitals" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."health_passport" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "passport_number" text NOT NULL DEFAULT ('HP-'::text || lpad((floor((random() * (999999999)::double precision)))::text, 9, '0'::text)),
  "photo_url" text,
  "blood_type" text,
  "allergies" jsonb DEFAULT '[]'::jsonb,
  "chronic_conditions" jsonb DEFAULT '[]'::jsonb,
  "emergency_contact_id" uuid,
  "insurance_provider" text,
  "insurance_number" text,
  "qr_code_data" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "full_name" text,
  "date_of_birth" date,
  "home_address" text,
  "current_address" text,
  "emergency_contacts" jsonb DEFAULT '[]'::jsonb,
  "current_medications" jsonb DEFAULT '[]'::jsonb,
  "past_medical_history" jsonb DEFAULT '{"surgeries": [], "major_illnesses": [], "hospitalizations": []}'::jsonb,
  "vaccination_history" jsonb DEFAULT '[]'::jsonb,
  "family_medical_history" text,
  "primary_physician_name" text,
  "primary_physician_contact" text,
  "specialists" jsonb DEFAULT '[]'::jsonb,
  "preferred_hospital" text,
  "implanted_devices" text,
  "dnr_order" boolean DEFAULT false,
  "organ_donor" boolean DEFAULT false,
  "special_medical_needs" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."health_passport" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."emotionsync_progress" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "current_level" integer DEFAULT 1,
  "total_challenges" integer DEFAULT 0,
  "accuracy_rate" numeric DEFAULT 0,
  "best_streak" integer DEFAULT 0,
  "xp" integer DEFAULT 0,
  "unlocked_emotions" text[] DEFAULT ARRAY['happy'::text, 'sad'::text],
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."emotionsync_progress" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."service_memberships" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "plan_name" text NOT NULL,
  "plan_type" text DEFAULT 'monthly'::text,
  "price" numeric NOT NULL,
  "benefits" jsonb NOT NULL,
  "status" text DEFAULT 'active'::text,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "auto_renew" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."service_memberships" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."location_searches" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "search_query" text NOT NULL,
  "search_type" text NOT NULL,
  "latitude" numeric,
  "longitude" numeric,
  "city" text,
  "state" text,
  "pincode" text,
  "results_count" integer DEFAULT 0,
  "clicked_result_id" uuid,
  "clicked_result_type" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."location_searches" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."precall_rules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "name" text NOT NULL,
  "condition_json" jsonb NOT NULL,
  "decision" text NOT NULL,
  "priority" integer DEFAULT 50,
  "enabled" boolean DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."precall_rules" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_plus_user_subscriptions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "plan_type" character varying NOT NULL DEFAULT 'free'::character varying,
  "amount" integer NOT NULL DEFAULT 0,
  "status" character varying NOT NULL DEFAULT 'inactive'::character varying,
  "started_at" timestamp with time zone,
  "expires_at" timestamp with time zone,
  "auto_renew" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_plus_user_subscriptions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."rewards_daily_challenges" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "challenge_name" text NOT NULL,
  "challenge_description" text,
  "challenge_type" text NOT NULL,
  "target_value" integer NOT NULL,
  "coin_reward" integer NOT NULL,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."rewards_daily_challenges" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."search_results" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "query_id" uuid,
  "title" text NOT NULL,
  "description" text,
  "contact" text,
  "address" text,
  "distance" numeric,
  "rating" numeric DEFAULT 0,
  "review_count" integer DEFAULT 0,
  "price" text,
  "image_url" text,
  "link" text,
  "verified" boolean DEFAULT false,
  "source" text NOT NULL,
  "result_type" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."search_results" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."workspace_ai_keys" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL,
  "provider" text NOT NULL DEFAULT 'openrouter'::text,
  "encrypted_key" text NOT NULL,
  "enabled" boolean DEFAULT true,
  "priority" integer DEFAULT 1,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."workspace_ai_keys" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_locations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "latitude" numeric NOT NULL,
  "longitude" numeric NOT NULL,
  "accuracy" numeric,
  "altitude" numeric,
  "speed" numeric,
  "heading" numeric,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_locations" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."medicine_reminders" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "family_member_id" uuid,
  "subscription_item_id" uuid,
  "medicine_name" text NOT NULL,
  "scheduled_time" time NOT NULL,
  "days_of_week" int4[] DEFAULT '{0,1,2,3,4,5,6}'::integer[],
  "reminder_type" text DEFAULT 'push'::text,
  "is_active" boolean DEFAULT true,
  "snooze_minutes" integer DEFAULT 10,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."medicine_reminders" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_bank_accounts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid NOT NULL,
  "gl_account_id" uuid NOT NULL,
  "bank_name" text NOT NULL,
  "account_name" text NOT NULL,
  "account_number_mask" text NOT NULL,
  "ifsc_or_routing" text,
  "currency" bpchar NOT NULL DEFAULT 'INR'::bpchar,
  "account_type" text NOT NULL DEFAULT 'CURRENT'::text,
  "opening_balance" numeric NOT NULL DEFAULT 0,
  "current_ledger_balance" numeric NOT NULL DEFAULT 0,
  "current_statement_balance" numeric NOT NULL DEFAULT 0,
  "unreconciled_amount" numeric NOT NULL DEFAULT 0,
  "last_reconciled_at" timestamp with time zone,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_bank_accounts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."business_campaigns" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "profile_id" uuid NOT NULL,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "audience_segment" text NOT NULL,
  "content" text,
  "status" text NOT NULL DEFAULT 'draft'::text,
  "sent_count" integer NOT NULL DEFAULT 0,
  "open_count" integer NOT NULL DEFAULT 0,
  "click_count" integer NOT NULL DEFAULT 0,
  "scheduled_for" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."business_campaigns" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."growth_memory" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "org_id" uuid NOT NULL,
  "key" text NOT NULL,
  "value" jsonb NOT NULL,
  "confidence" numeric DEFAULT 1.0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "deleted_at" timestamp with time zone,
  "version" integer NOT NULL DEFAULT 1,
  PRIMARY KEY ("id")
);

ALTER TABLE public."growth_memory" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_devices" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "device_fingerprint" text NOT NULL,
  "device_name" text NOT NULL,
  "device_type" text NOT NULL DEFAULT 'web'::text,
  "browser" text,
  "os" text,
  "ip_address" text,
  "last_active" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone DEFAULT now(),
  "is_online" boolean DEFAULT false,
  "last_seen" timestamp with time zone DEFAULT now(),
  "active_call_id" uuid,
  "push_token" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_devices" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."restaurant_details" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "vendor_id" uuid NOT NULL,
  "cuisine_types" text[] DEFAULT '{}'::text[],
  "is_pure_veg" boolean DEFAULT false,
  "avg_delivery_time" integer DEFAULT 30,
  "min_order_amount" numeric DEFAULT 100,
  "delivery_radius_km" numeric DEFAULT 5,
  "is_accepting_orders" boolean DEFAULT true,
  "opening_time" time DEFAULT '09:00:00'::time without time zone,
  "closing_time" time DEFAULT '22:00:00'::time without time zone,
  "fssai_license" text,
  "packaging_charge" numeric DEFAULT 0,
  "delivery_charge" numeric DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."restaurant_details" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."map_hunt_clues" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "level" integer NOT NULL,
  "clue_text" text NOT NULL,
  "clue_type" text NOT NULL,
  "target_description" text,
  "hint_1" text,
  "hint_2" text,
  "hint_3" text,
  "hints_used" integer DEFAULT 0,
  "photo_url" text,
  "verified" boolean DEFAULT false,
  "verification_score" numeric,
  "coins_earned" integer DEFAULT 0,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."map_hunt_clues" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."bmi_records" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "height_cm" numeric NOT NULL,
  "weight_kg" numeric NOT NULL,
  "bmi_value" numeric NOT NULL,
  "bmi_category" text NOT NULL,
  "waist_cm" numeric,
  "body_fat_percent" numeric,
  "recorded_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "weight_encrypted" bytea,
  "height_encrypted" bytea,
  "bmi_encrypted" bytea,
  PRIMARY KEY ("id")
);

ALTER TABLE public."bmi_records" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fcm_tokens" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "token" text NOT NULL,
  "device_type" text DEFAULT 'android'::text,
  "device_id" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fcm_tokens" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."service_coupons" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "code" text NOT NULL,
  "description" text,
  "discount_type" text NOT NULL,
  "discount_value" numeric NOT NULL,
  "max_discount_amount" numeric,
  "min_order_amount" numeric DEFAULT 0,
  "applicable_categories" uuid[] DEFAULT '{}'::uuid[],
  "usage_limit" integer,
  "usage_count" integer DEFAULT 0,
  "valid_from" timestamp with time zone DEFAULT now(),
  "valid_until" timestamp with time zone,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."service_coupons" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."saved_searches" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "query" text NOT NULL,
  "search_filters" jsonb DEFAULT '{}'::jsonb,
  "notification_enabled" boolean DEFAULT true,
  "notification_frequency" text DEFAULT 'daily'::text,
  "last_notification_sent" timestamp with time zone,
  "results_count" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "is_active" boolean DEFAULT true,
  PRIMARY KEY ("id")
);

ALTER TABLE public."saved_searches" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."seller_invoices" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "seller_id" uuid NOT NULL,
  "withdrawal_request_id" uuid,
  "invoice_number" text NOT NULL,
  "amount" numeric NOT NULL,
  "tax_amount" numeric DEFAULT 0,
  "total_amount" numeric NOT NULL,
  "period_start" date NOT NULL,
  "period_end" date NOT NULL,
  "issued_at" timestamp with time zone DEFAULT now(),
  "pdf_url" text,
  "status" text DEFAULT 'issued'::text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."seller_invoices" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_trust_scores" (
  "user_id" uuid NOT NULL,
  "trust_score" numeric NOT NULL DEFAULT 50,
  "verification_level" text NOT NULL DEFAULT 'unverified'::text,
  "last_updated" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("user_id")
);

ALTER TABLE public."user_trust_scores" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."champion_mission_progress" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "mission_id" uuid NOT NULL,
  "progress_value" integer NOT NULL DEFAULT 0,
  "completed_at" timestamp with time zone,
  "claimed_at" timestamp with time zone,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."champion_mission_progress" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_permissions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "target_type" text NOT NULL,
  "target_id" text NOT NULL,
  "role" text NOT NULL,
  "permissions_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."sys_permissions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."trending_categories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "category_name" character varying NOT NULL,
  "emoji" character varying,
  "trend_score" integer DEFAULT 0,
  "region" character varying,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."trending_categories" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."workflow_runs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "workflow_id" uuid NOT NULL,
  "version" integer,
  "correlation_id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "status" text NOT NULL DEFAULT 'pending'::text,
  "trigger_type" text,
  "input" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "output" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "error" text,
  "metrics" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "duration_ms" integer,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."workflow_runs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."service_chat_messages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "booking_id" uuid NOT NULL,
  "sender_id" uuid NOT NULL,
  "receiver_id" uuid NOT NULL,
  "message_text" text,
  "attachment_url" text,
  "is_read" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."service_chat_messages" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chat_folders" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "name" text NOT NULL,
  "icon" text,
  "color" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chat_folders" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."workspace_members" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role" text DEFAULT 'member'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."workspace_members" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."rec_interviews" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "candidate_id" uuid NOT NULL,
  "job_id" uuid,
  "scheduled_at" timestamp with time zone NOT NULL,
  "duration_min" integer DEFAULT 60,
  "interview_type" text NOT NULL DEFAULT 'video'::text,
  "meet_link" text,
  "interviewers" jsonb DEFAULT '[]'::jsonb,
  "status" text NOT NULL DEFAULT 'scheduled'::text,
  "feedback" text,
  "outcome" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."rec_interviews" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."expert_sessions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "expert_id" uuid,
  "expert_name" text NOT NULL,
  "expert_title" text NOT NULL,
  "session_title" text NOT NULL,
  "description" text,
  "session_date" timestamp with time zone NOT NULL,
  "duration_minutes" integer NOT NULL DEFAULT 60,
  "max_participants" integer DEFAULT 100,
  "participant_count" integer DEFAULT 0,
  "is_live" boolean DEFAULT false,
  "recording_url" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."expert_sessions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."app_reviews" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "app_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "rating" integer,
  "review_text" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."app_reviews" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."merchant_profiles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "upi_id" text NOT NULL,
  "business_name" text,
  "business_type" text DEFAULT 'kirana'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."merchant_profiles" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sales_activities" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "lead_id" uuid,
  "deal_id" uuid,
  "type" text NOT NULL,
  "subject" text NOT NULL,
  "description" text,
  "performed_at" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."sales_activities" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."fin_periods" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fin_organization_id" uuid NOT NULL,
  "legal_entity_id" uuid,
  "period_name" text NOT NULL,
  "period_type" text NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "status" text NOT NULL DEFAULT 'OPEN'::text,
  "closed_at" timestamp with time zone,
  "closed_by" uuid,
  "soft_closed_at" timestamp with time zone,
  "soft_closed_by" uuid,
  "reopened_at" timestamp with time zone,
  "reopened_by" uuid,
  "reopen_approval_id" uuid,
  "reopen_reason" text,
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."fin_periods" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."tutor_bookings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "tutor_id" uuid,
  "student_id" uuid,
  "subject" text NOT NULL,
  "session_date" timestamp with time zone NOT NULL,
  "duration_minutes" integer DEFAULT 60,
  "status" text DEFAULT 'pending'::text,
  "meeting_link" text,
  "notes" text,
  "student_rating" integer,
  "student_feedback" text,
  "amount_paid" numeric,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."tutor_bookings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."call_participants" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "call_id" uuid,
  "user_id" uuid,
  "joined_at" timestamp with time zone DEFAULT now(),
  "left_at" timestamp with time zone,
  "is_active" boolean DEFAULT true,
  "audio_enabled" boolean DEFAULT true,
  "video_enabled" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."call_participants" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."search_result_rankings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "query_text" text NOT NULL,
  "result_id" text NOT NULL,
  "result_type" character varying,
  "ranking_score" numeric DEFAULT 0.0,
  "relevance_score" numeric,
  "distance_score" numeric,
  "rating_score" numeric,
  "popularity_score" numeric,
  "freshness_score" numeric,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."search_result_rankings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."wellness_community_members" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "community_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role" text NOT NULL DEFAULT 'member'::text,
  "joined_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."wellness_community_members" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."cc_approvals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "plan_id" uuid NOT NULL,
  "decision" text NOT NULL,
  "notes" text,
  "decided_by" uuid NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."cc_approvals" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."calendar_events" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" uuid,
  "title" text NOT NULL,
  "description" text,
  "start_at" timestamp with time zone NOT NULL,
  "end_at" timestamp with time zone NOT NULL,
  "attendees" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."certification_history" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "provider" character varying NOT NULL,
  "provider_version" character varying NOT NULL,
  "contract_version" character varying NOT NULL,
  "verdict" character varying NOT NULL,
  "report_data" jsonb NOT NULL,
  "release_approved" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."certification_history" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."message_forwards" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "original_message_id" uuid NOT NULL,
  "forwarded_message_id" uuid NOT NULL,
  "forwarded_by" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."message_forwards" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."call_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "call_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "event_type" text NOT NULL,
  "event_data" jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."call_logs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."medicine_subscriptions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "family_member_id" uuid,
  "subscription_name" text NOT NULL,
  "plan_type" text DEFAULT 'care'::text,
  "status" text DEFAULT 'active'::text,
  "monthly_cost" numeric DEFAULT 0,
  "savings_amount" numeric DEFAULT 0,
  "next_delivery_date" date,
  "delivery_address" jsonb,
  "payment_method" text,
  "auto_refill" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."medicine_subscriptions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sys_business_units" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."chatr_seller_subscription_plans" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "seller_id" uuid NOT NULL,
  "plan_tier" character varying NOT NULL DEFAULT 'basic'::character varying,
  "status" character varying NOT NULL DEFAULT 'active'::character varying,
  "monthly_price" numeric NOT NULL,
  "start_date" timestamp with time zone NOT NULL DEFAULT now(),
  "end_date" timestamp with time zone,
  "auto_renew" boolean DEFAULT true,
  "features" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_seller_subscription_plans" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."caller_id_aggregates" (
  "phone_number" text NOT NULL,
  "community_name" text,
  "total_reports" integer NOT NULL DEFAULT 0,
  "spam_reports" integer NOT NULL DEFAULT 0,
  "safe_reports" integer NOT NULL DEFAULT 0,
  "spam_percentage" float4 NOT NULL DEFAULT 0,
  "most_common_type" character varying,
  "community_label" character varying,
  "first_reported_at" timestamp with time zone,
  "last_reported_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("phone_number")
);

ALTER TABLE public."caller_id_aggregates" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."cc_leads" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "plan_id" uuid,
  "full_name" text NOT NULL,
  "company" text,
  "role_title" text,
  "email" text,
  "phone" text,
  "linkedin_url" text,
  "location" text,
  "industry" text,
  "icp_match_score" integer DEFAULT 0,
  "status" text NOT NULL DEFAULT 'new'::text,
  "notes" text,
  "source" text DEFAULT 'ai_generated'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."cc_leads" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."wellness_tracking" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "date" date NOT NULL DEFAULT CURRENT_DATE,
  "weight_kg" numeric,
  "blood_pressure_systolic" integer,
  "blood_pressure_diastolic" integer,
  "heart_rate" integer,
  "steps" integer,
  "sleep_hours" numeric,
  "mood" text,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."wellness_tracking" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."health_challenges" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "challenge_type" text NOT NULL,
  "target_value" integer NOT NULL,
  "reward_points" integer NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "is_active" boolean DEFAULT true,
  "participant_count" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."health_challenges" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."health_reminders" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "reminder_type" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "reminder_time" timestamp with time zone NOT NULL,
  "repeat_pattern" text,
  "is_active" boolean DEFAULT true,
  "last_triggered_at" timestamp with time zone,
  "reference_id" uuid,
  "reference_type" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."health_reminders" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."sso_tokens" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "app_id" uuid,
  "token" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "used_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."sso_tokens" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."contacts_name_votes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "phone_hash" text NOT NULL,
  "name_normalized" text NOT NULL,
  "name_display" text NOT NULL,
  "votes" integer NOT NULL DEFAULT 1,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."contacts_name_votes" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."brand_placements" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "brand_id" uuid,
  "object_type" text NOT NULL,
  "replacement_asset_url" text NOT NULL,
  "replacement_type" text DEFAULT 'overlay'::text,
  "priority" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."brand_placements" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."search_suggestions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "suggestion_text" text NOT NULL,
  "category" character varying,
  "popularity_score" integer DEFAULT 1,
  "is_trending" boolean DEFAULT false,
  "last_used_at" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."search_suggestions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."business_broadcasts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "business_id" uuid NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "target_audience" jsonb DEFAULT '{"type": "all"}'::jsonb,
  "scheduled_for" timestamp with time zone,
  "sent_at" timestamp with time zone,
  "status" text DEFAULT 'draft'::text,
  "recipient_count" integer DEFAULT 0,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."business_broadcasts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."workspace_activities" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL,
  "customer_id" uuid,
  "activity_type" text NOT NULL,
  "description" text NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."workspace_activities" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."ai_memory_personal" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "content" text NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "embedding" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."nutrition_daily_summary" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "summary_date" date NOT NULL,
  "total_calories" integer DEFAULT 0,
  "total_protein_g" numeric DEFAULT 0,
  "total_carbs_g" numeric DEFAULT 0,
  "total_fat_g" numeric DEFAULT 0,
  "total_water_ml" integer DEFAULT 0,
  "goal_calories" integer DEFAULT 2000,
  "goal_protein_g" numeric DEFAULT 50,
  "goal_carbs_g" numeric DEFAULT 250,
  "goal_fat_g" numeric DEFAULT 65,
  "goal_water_ml" integer DEFAULT 2500,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."nutrition_daily_summary" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."message_reminders" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "message_id" uuid NOT NULL,
  "reminder_time" timestamp with time zone NOT NULL,
  "message_preview" text,
  "is_completed" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."message_reminders" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."ai_memory_business" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL,
  "record_id" uuid NOT NULL,
  "entity_id" uuid NOT NULL,
  "content" text NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "embedding" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."account_followers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "account_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "followed_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."account_followers" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."call_telemetry" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "call_id" text NOT NULL,
  "user_id" uuid,
  "contact_id" text,
  "network_start_state" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "route_chosen" text NOT NULL DEFAULT 'UNKNOWN'::text,
  "route_switches" smallint NOT NULL DEFAULT 0,
  "retry_attempts" smallint NOT NULL DEFAULT 0,
  "codec_degradations" smallint NOT NULL DEFAULT 0,
  "peak_rtt_ms" integer,
  "peak_jitter_ms" integer,
  "call_duration_s" integer,
  "silence_ratio" float4,
  "outcome_tag" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "closed_at" timestamp with time zone,
  "turn_fetch_success" boolean,
  "turn_server_count" integer,
  "turn_urls" jsonb,
  "local_candidate_type" text,
  "remote_candidate_type" text,
  "selected_candidate_pair" jsonb,
  "ice_connected_timestamp" timestamp with time zone,
  "ice_completed_timestamp" timestamp with time zone,
  "audio_packets_sent" bigint,
  "audio_packets_received" bigint,
  "audio_bytes_sent" bigint,
  "audio_bytes_received" bigint,
  "video_packets_sent" bigint,
  "video_packets_received" bigint,
  "video_bytes_sent" bigint,
  "video_bytes_received" bigint,
  "audio_active_timestamp" timestamp with time zone,
  "end_reason" text,
  PRIMARY KEY ("id")
);

ALTER TABLE public."call_telemetry" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."referral_codes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "code" text NOT NULL,
  "uses" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."referral_codes" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."live_rooms" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "description" text,
  "host_id" uuid NOT NULL,
  "topic" text,
  "is_public" boolean DEFAULT true,
  "is_active" boolean DEFAULT true,
  "participant_count" integer DEFAULT 0,
  "max_participants" integer DEFAULT 50,
  "room_type" character varying DEFAULT 'general'::character varying,
  "created_at" timestamp with time zone DEFAULT now(),
  "ended_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE public."live_rooms" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."kyc_documents" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "document_type" text NOT NULL,
  "document_url" text NOT NULL,
  "document_number" text,
  "status" text DEFAULT 'pending'::text,
  "rejection_reason" text,
  "reviewed_by" uuid,
  "reviewed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "document_number_encrypted" bytea,
  PRIMARY KEY ("id")
);

ALTER TABLE public."kyc_documents" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."login_attempts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "phone_number" text NOT NULL,
  "device_fingerprint" text NOT NULL,
  "attempt_type" text NOT NULL,
  "success" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."login_attempts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."native_apps" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "package_name" text NOT NULL,
  "web_url" text NOT NULL,
  "icon_url" text NOT NULL,
  "category" text NOT NULL,
  "is_featured" boolean DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY ("id")
);

ALTER TABLE public."native_apps" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."app_usage" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "app_id" uuid NOT NULL,
  "last_used_at" timestamp with time zone DEFAULT now(),
  "usage_count" integer DEFAULT 1,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."app_usage" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."micro_task_assignments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "task_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "status" text NOT NULL DEFAULT 'assigned'::text,
  "assigned_at" timestamp with time zone DEFAULT now(),
  "expires_at" timestamp with time zone DEFAULT (now() + '00:30:00'::interval),
  "completed_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE public."micro_task_assignments" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_reward_redemptions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "reward_id" uuid NOT NULL,
  "points_spent" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'active'::text,
  "redeemed_at" timestamp with time zone NOT NULL DEFAULT now(),
  "expires_at" timestamp with time zone NOT NULL,
  "used_at" timestamp with time zone,
  "transaction_id" uuid,
  "redemption_code" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_reward_redemptions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."app_usage_sessions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "app_id" uuid NOT NULL,
  "session_start" timestamp with time zone NOT NULL DEFAULT now(),
  "session_end" timestamp with time zone,
  "duration_seconds" integer,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."app_usage_sessions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."food_menu_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "vendor_id" uuid NOT NULL,
  "name" character varying NOT NULL,
  "description" text,
  "price" integer NOT NULL,
  "image_url" text,
  "category" character varying,
  "is_vegetarian" boolean DEFAULT false,
  "is_available" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."food_menu_items" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."backup_history" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "backup_key" text NOT NULL,
  "message_count" integer DEFAULT 0,
  "size_bytes" bigint,
  "includes_media" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."backup_history" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."micro_tasks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "task_type" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "reward_coins" integer NOT NULL DEFAULT 50,
  "reward_rupees" numeric NOT NULL DEFAULT 5.00,
  "audio_url" text,
  "audio_duration_seconds" integer,
  "verification_question" text,
  "verification_options" jsonb,
  "correct_option_index" integer,
  "geo_required" boolean DEFAULT false,
  "geo_lat" numeric,
  "geo_lng" numeric,
  "geo_radius_km" numeric DEFAULT 5.00,
  "max_completions" integer DEFAULT 100,
  "current_completions" integer DEFAULT 0,
  "max_per_user" integer DEFAULT 1,
  "expires_at" timestamp with time zone,
  "is_active" boolean DEFAULT true,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."micro_tasks" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."device_capabilities" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "cpu_threads" integer,
  "device_memory_gb" numeric,
  "max_camera_width" integer,
  "max_camera_height" integer,
  "supports_4k" boolean DEFAULT false,
  "supports_av1" boolean DEFAULT false,
  "supports_vp9" boolean DEFAULT false,
  "supports_h264" boolean DEFAULT true,
  "gpu_renderer" text,
  "platform" text,
  "user_agent" text,
  "last_detected_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."device_capabilities" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."post_likes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "post_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."post_likes" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."user_contacts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "contact_user_id" uuid NOT NULL,
  "display_name" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."user_contacts" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."kernel_events" (
  "global_sequence" bigint NOT NULL DEFAULT nextval('kernel_events_global_sequence_seq'::regclass),
  "event_id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "stream_id" text NOT NULL,
  "aggregate_type" text NOT NULL,
  "aggregate_id" text NOT NULL,
  "expected_version" bigint NOT NULL,
  "event_type" text NOT NULL,
  "timestamp" timestamp with time zone NOT NULL DEFAULT now(),
  "actor_id" text NOT NULL,
  "tenant_id" text NOT NULL,
  "correlation_id" text,
  "causation_id" text,
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY ("global_sequence")
);

ALTER TABLE public."kernel_events" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."home_solutions_catalog" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "category" home_solutions_category NOT NULL,
  "code" text NOT NULL,
  "title" text NOT NULL,
  "icon" text,
  "description" text,
  "unit_price" numeric NOT NULL DEFAULT 0,
  "price_label" text,
  "unit" text,
  "tag" text,
  "tag_color" text,
  "rating" numeric,
  "sort_order" integer NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."home_solutions_catalog" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."chatr_subscription_plans" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "plan_type" character varying NOT NULL,
  "plan_name" character varying NOT NULL,
  "description" text,
  "monthly_price" numeric NOT NULL,
  "yearly_price" numeric,
  "features" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "target_audience" character varying,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."chatr_subscription_plans" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."app_sessions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "app_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "session_start" timestamp with time zone NOT NULL DEFAULT now(),
  "session_end" timestamp with time zone,
  "duration_seconds" integer,
  "cpu_usage_avg" double precision DEFAULT 0.0,
  "memory_usage_peak" bigint DEFAULT 0,
  "battery_drain" double precision DEFAULT 0.0,
  "data_sent" bigint DEFAULT 0,
  "data_received" bigint DEFAULT 0,
  "screen_time_seconds" integer DEFAULT 0,
  "background_time_seconds" integer DEFAULT 0,
  "crash_count" integer DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."app_sessions" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."admin_action_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "admin_id" uuid NOT NULL,
  "action_type" text NOT NULL,
  "entity_type" text,
  "entity_id" uuid,
  "details" jsonb,
  "ip_address" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."admin_action_logs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."community_members" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "community_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role" text DEFAULT 'member'::text,
  "joined_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."community_members" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."trust_graph" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "source_user_id" uuid NOT NULL,
  "target_user_id" uuid NOT NULL,
  "relationship_type" text DEFAULT 'contact'::text,
  "trust_level" integer DEFAULT 50,
  "interaction_count" integer DEFAULT 0,
  "last_interaction_at" timestamp with time zone,
  "badge" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."trust_graph" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."ai_stickers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "source_photo_url" text NOT NULL,
  "sticker_url" text NOT NULL,
  "style" character varying,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."ai_stickers" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."health_vitals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "vital_type" text NOT NULL,
  "value" jsonb NOT NULL,
  "recorded_at" timestamp with time zone NOT NULL DEFAULT now(),
  "source" text DEFAULT 'manual'::text,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."health_vitals" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."identity_scores" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "overall_score" integer DEFAULT 50,
  "verification_level" text DEFAULT 'basic'::text,
  "total_interactions" integer DEFAULT 0,
  "scam_flags" integer DEFAULT 0,
  "trusted_by_count" integer DEFAULT 0,
  "badges" jsonb DEFAULT '[]'::jsonb,
  "last_calculated_at" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE public."identity_scores" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."call_history" (
  "id" uuid,
  "conversation_id" uuid,
  "caller_id" uuid,
  "receiver_id" uuid,
  "call_type" text,
  "status" text,
  "started_at" timestamp with time zone,
  "ended_at" timestamp with time zone,
  "duration" integer,
  "missed" boolean,
  "is_group" boolean,
  "caller_name" text,
  "receiver_name" text,
  "caller_avatar" text,
  "receiver_avatar" text,
  "caller_phone" text,
  "receiver_phone" text,
  "connection_quality" character varying,
  "quality_rating" integer,
  "created_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public."user_call_rcp" (
  "user_id" uuid,
  "total_calls" bigint,
  "resolved_calls" bigint,
  "resolved_percentage" numeric,
  "resolved_last_7d" bigint,
  "total_last_7d" bigint
);

CREATE TABLE IF NOT EXISTS public."missed_calls_view" (
  "id" uuid,
  "caller_id" uuid,
  "receiver_id" uuid,
  "call_type" text,
  "created_at" timestamp with time zone,
  "caller_username" text,
  "caller_avatar" text
);


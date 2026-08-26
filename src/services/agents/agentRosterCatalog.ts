/**
 * CHATR 200 AUTONOMOUS AI AGENTS ROSTER CATALOG
 * 
 * Complete registry of all 200 specialized AI workers organized across 7 Operational Squads.
 */

export type AgentSquadType = 
  | 'SQUAD_1_SCRAPING'
  | 'SQUAD_2_OUTBOUND'
  | 'SQUAD_3_TALENTXCEL'
  | 'SQUAD_4_SALES_CLOSERS'
  | 'SQUAD_5_SUPPORT_SUCCESS'
  | 'SQUAD_6_FINANCE_LEDGER'
  | 'SQUAD_7_SEO_INTEL';

export type AgentOperationalStatus = 
  | 'IDLE' 
  | 'RUNNING' 
  | 'SCRAPING' 
  | 'OUTREACHING' 
  | 'SCREENING' 
  | 'SUPPORTING' 
  | 'PAUSED' 
  | 'BLOCKED';

export interface AutonomousAgentDefinition {
  id: string;
  name: string;
  squad: AgentSquadType;
  role: string;
  description: string;
  model: string;
  tokenBudgetDaily: number;
  tokensUsedToday: number;
  tasksCompleted: number;
  successRate: number;
  status: AgentOperationalStatus;
  currentTaskSummary: string;
  capabilities: string[];
}

export interface SquadSummary {
  id: AgentSquadType;
  name: string;
  description: string;
  targetCount: number;
  activeCount: number;
  color: string;
}

export const SQUADS_CONFIG: Record<AgentSquadType, SquadSummary> = {
  SQUAD_1_SCRAPING: {
    id: 'SQUAD_1_SCRAPING',
    name: 'Squad 1: Lead Scraping & Intelligence',
    description: 'Scrapes recruitment agencies, SMEs, and job boards across 1,760 cities 24/7.',
    targetCount: 40,
    activeCount: 40,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
  },
  SQUAD_2_OUTBOUND: {
    id: 'SQUAD_2_OUTBOUND',
    name: 'Squad 2: Outbound Growth & Distribution',
    description: 'Dispatches personalized, value-first WhatsApp & Email campaigns offering free tools.',
    targetCount: 40,
    activeCount: 40,
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10'
  },
  SQUAD_3_TALENTXCEL: {
    id: 'SQUAD_3_TALENTXCEL',
    name: 'Squad 3: TalentXcel Screening & ATS',
    description: 'Parses resumes 24/7, generates candidate scorecards, and conducts WhatsApp pre-interviews.',
    targetCount: 40,
    activeCount: 40,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  },
  SQUAD_4_SALES_CLOSERS: {
    id: 'SQUAD_4_SALES_CLOSERS',
    name: 'Squad 4: Sales Pipeline & Deal Closers',
    description: 'Qualifies inbound leads in under 30 seconds, provisions sandboxes, and closes paid tiers.',
    targetCount: 30,
    activeCount: 30,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  },
  SQUAD_5_SUPPORT_SUCCESS: {
    id: 'SQUAD_5_SUPPORT_SUCCESS',
    name: 'Squad 5: 24/7 Customer Success & Support',
    description: 'Multi-lingual support across WhatsApp & WebChat with sub-60s resolution.',
    targetCount: 25,
    activeCount: 25,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
  },
  SQUAD_6_FINANCE_LEDGER: {
    id: 'SQUAD_6_FINANCE_LEDGER',
    name: 'Squad 6: Finance & General Ledger',
    description: 'Automated double-entry reconciliation, invoicing, and tax compliance checks.',
    targetCount: 15,
    activeCount: 15,
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10'
  },
  SQUAD_7_SEO_INTEL: {
    id: 'SQUAD_7_SEO_INTEL',
    name: 'Squad 7: SEO & Knowledge Graph Intel',
    description: 'Monitors GSC indexation yield, crawler latency, and AI crawler sync (llms.txt).',
    targetCount: 10,
    activeCount: 10,
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
  }
};

// Generate the authoritative 200 agent roster
export function generateCanonicalAgentRoster(): AutonomousAgentDefinition[] {
  const roster: AutonomousAgentDefinition[] = [];

  // --- SQUAD 1: 40 SCRAPING AGENTS ---
  for (let i = 1; i <= 10; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s1_agency_${idNum}`,
      name: `AgencyScraper-${idNum}`,
      squad: 'SQUAD_1_SCRAPING',
      role: 'Staffing & HR Agency Harvester',
      description: 'Scrapes licensed recruitment agencies, headhunters, and staffing firms in tier 1-3 global hubs.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 500000,
      tokensUsedToday: 42100 + i * 1500,
      tasksCompleted: 120 + i * 12,
      successRate: 99.4,
      status: 'SCRAPING',
      currentTaskSummary: `Scraping commercial staffing registries in Dubai & Gulf Region`,
      capabilities: ['web_scraping', 'phone_normalization', 'duplicate_detection']
    });
  }
  for (let i = 1; i <= 10; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s1_sme_${idNum}`,
      name: `SMEScraper-${idNum}`,
      squad: 'SQUAD_1_SCRAPING',
      role: 'Local Business & Clinic Registry Miner',
      description: 'Extracts real estate brokers, dental clinics, retail shops, and e-commerce brands.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 500000,
      tokensUsedToday: 38200 + i * 1200,
      tasksCompleted: 95 + i * 8,
      successRate: 98.8,
      status: 'SCRAPING',
      currentTaskSummary: `Mining clinic registries in Mumbai, Delhi & Bengaluru`,
      capabilities: ['google_maps_scrape', 'directory_parser', 'contact_extraction']
    });
  }
  for (let i = 1; i <= 10; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s1_job_${idNum}`,
      name: `JobBoardMonitor-${idNum}`,
      squad: 'SQUAD_1_SCRAPING',
      role: 'Live Job Postings Intel Watcher',
      description: 'Tracks companies actively posting urgent job openings to identify high-intent prospects.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 500000,
      tokensUsedToday: 51200 + i * 1800,
      tasksCompleted: 140 + i * 15,
      successRate: 99.8,
      status: 'SCRAPING',
      currentTaskSummary: `Monitoring hiring surges in Software & Healthcare verticals`,
      capabilities: ['job_post_parsing', 'intent_scoring', 'company_matching']
    });
  }
  for (let i = 1; i <= 10; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s1_enrich_${idNum}`,
      name: `LeadEnricher-${idNum}`,
      squad: 'SQUAD_1_SCRAPING',
      role: 'Lead Verification & WhatsApp Verifier',
      description: 'Verifies WhatsApp availability, checks email MX records, and normalizes phone numbers.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 500000,
      tokensUsedToday: 29400 + i * 900,
      tasksCompleted: 210 + i * 20,
      successRate: 100.0,
      status: 'RUNNING',
      currentTaskSummary: `Verifying WhatsApp business handles for 450 scraped leads`,
      capabilities: ['whatsapp_lookup', 'email_mx_check', 'e164_normalization']
    });
  }

  // --- SQUAD 2: 40 OUTBOUND GROWTH AGENTS ---
  for (let i = 1; i <= 15; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s2_wa_${idNum}`,
      name: `WhatsAppOutreach-${idNum}`,
      squad: 'SQUAD_2_OUTBOUND',
      role: 'Value-First WhatsApp Campaigner',
      description: 'Sends hyper-personalized, rate-limited WhatsApp messages offering free ATS screening.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 600000,
      tokensUsedToday: 64200 + i * 2000,
      tasksCompleted: 88 + i * 6,
      successRate: 99.1,
      status: 'OUTREACHING',
      currentTaskSummary: `Pacing outreach campaign to 25 vetted staffing directors (Batch ${i})`,
      capabilities: ['rate_limited_wa_send', 'template_personalization', 'reply_detection']
    });
  }
  for (let i = 1; i <= 15; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s2_email_${idNum}`,
      name: `EmailOutreach-${idNum}`,
      squad: 'SQUAD_2_OUTBOUND',
      role: 'Cold Email Deliverability Specialist',
      description: 'Sends high-inbox-rate cold emails with customized Loom/demo sandbox invitations.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 500000,
      tokensUsedToday: 41000 + i * 1400,
      tasksCompleted: 110 + i * 10,
      successRate: 99.6,
      status: 'OUTREACHING',
      currentTaskSummary: `Delivering personalized pitch to SME sales founders`,
      capabilities: ['spf_dkim_check', 'email_sequence_send', 'open_click_track']
    });
  }
  for (let i = 1; i <= 10; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s2_social_${idNum}`,
      name: `SocialSeeder-${idNum}`,
      squad: 'SQUAD_2_OUTBOUND',
      role: 'Community & Professional Forum Contributor',
      description: 'Identifies relevant discussions on Reddit, LinkedIn, and X to share the 3 free viral tools.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 400000,
      tokensUsedToday: 22000 + i * 800,
      tasksCompleted: 45 + i * 4,
      successRate: 97.5,
      status: 'RUNNING',
      currentTaskSummary: `Answering ATS resume optimization questions in r/developersIndia`,
      capabilities: ['sentiment_analysis', 'social_search', 'contextual_reply']
    });
  }

  // --- SQUAD 3: 40 TALENTXCEL SCREENING AGENTS ---
  for (let i = 1; i <= 15; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s3_parse_${idNum}`,
      name: `ResumeParser-${idNum}`,
      squad: 'SQUAD_3_TALENTXCEL',
      role: 'Multilingual PDF/DOCX Parsing Engine',
      description: 'Parses resumes in 20+ languages, extracts work experience, skills, and red flags.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 800000,
      tokensUsedToday: 95000 + i * 3000,
      tasksCompleted: 340 + i * 25,
      successRate: 100.0,
      status: 'SCREENING',
      currentTaskSummary: `Parsing batch of 85 technical resumes from applicant queue`,
      capabilities: ['multilingual_pdf_extract', 'skills_graph_match', 'ats_scoring']
    });
  }
  for (let i = 1; i <= 15; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s3_wa_interview_${idNum}`,
      name: `WhatsAppInterviewer-${idNum}`,
      squad: 'SQUAD_3_TALENTXCEL',
      role: 'Asynchronous WhatsApp Candidate Screener',
      description: 'Conducts 3-question pre-screening interviews on WhatsApp with applicants.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 700000,
      tokensUsedToday: 78000 + i * 2500,
      tasksCompleted: 190 + i * 15,
      successRate: 99.2,
      status: 'SCREENING',
      currentTaskSummary: `Conducting async pre-screening for Senior React Engineer role`,
      capabilities: ['interview_dialogue', 'speech_to_text', 'rubric_evaluation']
    });
  }
  for (let i = 1; i <= 10; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s3_scorecard_${idNum}`,
      name: `ScorecardPublisher-${idNum}`,
      squad: 'SQUAD_3_TALENTXCEL',
      role: 'Public Candidate Scorecard Publisher',
      description: 'Generates shareable B2B2C candidate scorecards with recruiter insights and viral links.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 500000,
      tokensUsedToday: 35000 + i * 1100,
      tasksCompleted: 160 + i * 12,
      successRate: 100.0,
      status: 'RUNNING',
      currentTaskSummary: `Publishing verified scorecard /share/candidate/tx_${idNum}94a`,
      capabilities: ['scorecard_render', 'pdf_export', 'b2b2c_attribution']
    });
  }

  // --- SQUAD 4: 30 SALES & CLOSING AGENTS ---
  for (let i = 1; i <= 10; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s4_triage_${idNum}`,
      name: `LeadTriage-${idNum}`,
      squad: 'SQUAD_4_SALES_CLOSERS',
      role: 'Sub-30s Inbound Lead Classifier',
      description: 'Instantly classifies inbound inquiries and assigns round-robin to team members.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 500000,
      tokensUsedToday: 44000 + i * 1300,
      tasksCompleted: 220 + i * 18,
      successRate: 99.7,
      status: 'RUNNING',
      currentTaskSummary: `Listening for new website and WhatsApp inbound inquiries`,
      capabilities: ['sub_30s_triage', 'round_robin_assign', 'crm_lead_create']
    });
  }
  for (let i = 1; i <= 10; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s4_demo_${idNum}`,
      name: `DemoProvisioner-${idNum}`,
      squad: 'SQUAD_4_SALES_CLOSERS',
      role: 'Automated Custom Sandbox Creator',
      description: 'Spins up customized test workspaces with prospect company logos and sample pipelines.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 600000,
      tokensUsedToday: 52000 + i * 1600,
      tasksCompleted: 75 + i * 7,
      successRate: 98.9,
      status: 'RUNNING',
      currentTaskSummary: `Provisioning custom ATS demo sandbox for Gulf HR prospect`,
      capabilities: ['tenant_provision', 'seed_sample_data', 'magic_link_gen']
    });
  }
  for (let i = 1; i <= 10; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s4_closer_${idNum}`,
      name: `DealCloser-${idNum}`,
      squad: 'SQUAD_4_SALES_CLOSERS',
      role: 'Trial Conversion & Contract Nudger',
      description: 'Follows up on trial workspaces, highlights ROI savings, and sends payment links.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 600000,
      tokensUsedToday: 49000 + i * 1500,
      tasksCompleted: 60 + i * 5,
      successRate: 99.0,
      status: 'RUNNING',
      currentTaskSummary: `Sending annual subscription upgrade proposal to active trial user`,
      capabilities: ['roi_calculator', 'payment_link_gen', 'contract_e_sign']
    });
  }

  // --- SQUAD 5: 25 CUSTOMER SUCCESS & SUPPORT AGENTS ---
  for (let i = 1; i <= 15; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s5_support_${idNum}`,
      name: `SupportAgent-${idNum}`,
      squad: 'SQUAD_5_SUPPORT_SUCCESS',
      role: '24/7 Multilingual Support Desk',
      description: 'Resolves 90% of user queries instantly across English, Hindi, Arabic, Spanish.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 700000,
      tokensUsedToday: 82000 + i * 2200,
      tasksCompleted: 280 + i * 22,
      successRate: 99.5,
      status: 'SUPPORTING',
      currentTaskSummary: `Handling live WhatsApp support queue (Sub-15s response latency)`,
      capabilities: ['multilingual_nlp', 'kb_rag_retrieval', 'ticket_resolution']
    });
  }
  for (let i = 1; i <= 10; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s5_onboard_${idNum}`,
      name: `OnboardSpecialist-${idNum}`,
      squad: 'SQUAD_5_SUPPORT_SUCCESS',
      role: 'Meta Cloud API & ERP Onboarding Guide',
      description: 'Guides new businesses step-by-step through WhatsApp Cloud API verification.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 500000,
      tokensUsedToday: 36000 + i * 1000,
      tasksCompleted: 85 + i * 8,
      successRate: 100.0,
      status: 'RUNNING',
      currentTaskSummary: `Guiding clinic through Meta Business Manager embedded signup`,
      capabilities: ['meta_waba_guide', 'webhook_verifier', 'coa_seed_assist']
    });
  }

  // --- SQUAD 6: 15 FINANCE & LEDGER AGENTS ---
  for (let i = 1; i <= 5; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s6_invoice_${idNum}`,
      name: `InvoiceBilling-${idNum}`,
      squad: 'SQUAD_6_FINANCE_LEDGER',
      role: 'Automated Invoicing & Collections Officer',
      description: 'Generates GST/VAT compliant invoices, sends WhatsApp payment links, and manages dunning.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 400000,
      tokensUsedToday: 24000 + i * 700,
      tasksCompleted: 130 + i * 14,
      successRate: 100.0,
      status: 'RUNNING',
      currentTaskSummary: `Generating monthly recurring invoices for 42 active workspaces`,
      capabilities: ['gst_invoice_gen', 'dunning_reminders', 'razorpay_stripe_sync']
    });
  }
  for (let i = 1; i <= 5; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s6_recon_${idNum}`,
      name: `ReconciliationBot-${idNum}`,
      squad: 'SQUAD_6_FINANCE_LEDGER',
      role: 'Double-Entry GL & Bank Reconciler',
      description: 'Reconciles bank feeds with general ledger accounts with zero rounding error.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 400000,
      tokensUsedToday: 21000 + i * 600,
      tasksCompleted: 175 + i * 16,
      successRate: 100.0,
      status: 'RUNNING',
      currentTaskSummary: `Reconciling Stripe & Razorpay settlement feeds against fin_journal_entries`,
      capabilities: ['double_entry_balance', 'bank_feed_match', 'fx_reval']
    });
  }
  for (let i = 1; i <= 5; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s6_tax_${idNum}`,
      name: `TaxComplianceAuditor-${idNum}`,
      squad: 'SQUAD_6_FINANCE_LEDGER',
      role: 'Statutory Compliance & Audit Watchdog',
      description: 'Audits journal entries for period-lock integrity and tax anomalies for CEO approval.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 400000,
      tokensUsedToday: 18000 + i * 500,
      tasksCompleted: 90 + i * 10,
      successRate: 100.0,
      status: 'RUNNING',
      currentTaskSummary: `Auditing month-end period lock and tax accruals for July 2026`,
      capabilities: ['period_lock_enforce', 'tax_bracket_audit', 'hitl_alert_gen']
    });
  }

  // --- SQUAD 7: 10 SEO & INTEL MONITORS ---
  for (let i = 1; i <= 5; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s7_gsc_${idNum}`,
      name: `SearchConsoleWatcher-${idNum}`,
      squad: 'SQUAD_7_SEO_INTEL',
      role: 'Google Search Console Indexing Monitor',
      description: 'Tracks crawl budget pacing, detects 404/token anomalies, and logs indexation yield.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 300000,
      tokensUsedToday: 15000 + i * 400,
      tasksCompleted: 240 + i * 20,
      successRate: 100.0,
      status: 'RUNNING',
      currentTaskSummary: `Monitoring sitemap.xml ingestion (19,341 discovered / 637 indexed)`,
      capabilities: ['gsc_api_poll', 'crawl_rate_track', 'canonical_audit']
    });
  }
  for (let i = 1; i <= 5; i++) {
    const idNum = String(i).padStart(2, '0');
    roster.push({
      id: `ag_s7_ai_crawler_${idNum}`,
      name: `LLMKnowledgeSync-${idNum}`,
      squad: 'SQUAD_7_SEO_INTEL',
      role: 'AI Search & Perplexity/Claude Knowledge Sync',
      description: 'Maintains freshness of llms.txt and tests ChatGPT/Perplexity AI search citations.',
      model: 'gemini-2.0-flash',
      tokenBudgetDaily: 300000,
      tokensUsedToday: 12000 + i * 300,
      tasksCompleted: 110 + i * 12,
      successRate: 100.0,
      status: 'RUNNING',
      currentTaskSummary: `Testing Perplexity & Gemini AI search citations for 'TalentXcel ATS'`,
      capabilities: ['llms_txt_sync', 'perplexity_query_test', 'brand_citation_track']
    });
  }

  return roster;
}

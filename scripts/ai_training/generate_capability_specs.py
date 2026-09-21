#!/usr/bin/env python3
"""
generate_capability_specs.py
============================
Generates authoritative, machine-readable specifications for all 10 CHATR capabilities:
reasoning, business, finance, seo, marketing, creator, video, research, support, agent.

Enforces Hardening Requirement 2:
Every specification contains:
  capability, canonical_definition, in_scope, out_of_scope, weight_appropriate,
  runtime_dependencies, rag_dependencies, tool_dependencies, safety_boundaries,
  required_eval_categories, forbidden_claims, escalation_rules, risk_tier, source_documents.
"""

import json
import hashlib
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SPECS_DIR = REPO_ROOT / "docs" / "intent-os" / "specs" / "capabilities"
SPECS_DIR.mkdir(parents=True, exist_ok=True)

def get_file_sha(rel_path: str) -> str:
    p = REPO_ROOT / rel_path
    if not p.exists():
        raise FileNotFoundError(f"Source file missing: {rel_path}")
    return hashlib.sha256(p.read_bytes()).hexdigest()

SPECS = {
    "reasoning": {
        "capability": "reasoning",
        "canonical_definition": "Structured logical deduction, algorithmic step-by-step resolution, DAG execution order synthesis, root-cause counterfactual analysis, and formal policy constraint satisfaction within the CHATR Intent OS ecosystem.",
        "risk_tier": "TIER 1",
        "in_scope": [
            "Deductive premise validation and contradiction resolution",
            "Execution Graph topological sort and dependency resolution",
            "Counterfactual root-cause failure analysis",
            "Formal constraint satisfaction against policy invariants",
            "Instruction-following consistency across complex multi-turn logic"
        ],
        "out_of_scope": [
            "Mathematical theorem solving beyond software systems",
            "Unconstrained open-world philosophical debates",
            "Real-time graph dispatch (owned by CHATR Kernel Scheduler)",
            "Direct memory write mutations"
        ],
        "weight_appropriate": "Algorithmic thinking patterns, rigorous premise evaluation, structured step-by-step breakdown, and disciplined uncertainty expression when information is incomplete.",
        "runtime_dependencies": ["CHATR Execution Planner", "EventBus scheduler", "Topological sorter"],
        "rag_dependencies": ["Policy invariant rulebooks", "Execution trace schema"],
        "tool_dependencies": ["GraphCycleDetector", "ConstraintEvaluator"],
        "safety_boundaries": [
            "Must acknowledge ambiguity and incomplete premises explicitly",
            "Must never manufacture synthetic facts to force logical closure",
            "Must state underlying assumptions when reasoning under uncertainty"
        ],
        "required_eval_categories": [
            "multi_step_deduction",
            "dependency_cycle_detection",
            "contradiction_handling",
            "uncertainty_calibration",
            "instruction_consistency"
        ],
        "forbidden_claims": [
            "Claiming formal mathematical certainty for empirical estimates",
            "Claiming direct execution authority over the Kernel scheduler",
            "Claiming knowledge of private corporate state not provided in context"
        ],
        "escalation_rules": [
            "If contradiction between premises cannot be reconciled, halt and request user clarification",
            "If circular dependency detected in Execution Graph, escalate to workflow designer"
        ],
        "source_documents": [
            {"path": "docs/00-Foundations/DECISION_THEORY.md", "sha256": get_file_sha("docs/00-Foundations/DECISION_THEORY.md")},
            {"path": "docs/00-Foundations/FIRST_PRINCIPLES.md", "sha256": get_file_sha("docs/00-Foundations/FIRST_PRINCIPLES.md")},
            {"path": "docs/00-Foundations/MATHEMATICAL_FOUNDATIONS.md", "sha256": get_file_sha("docs/00-Foundations/MATHEMATICAL_FOUNDATIONS.md")},
            {"path": "docs/03-CompanyIntelligence/DecisionSystem.md", "sha256": get_file_sha("docs/03-CompanyIntelligence/DecisionSystem.md")},
            {"path": "docs/intent-os/AUTONOMOUS_EXECUTION_MODEL.md", "sha256": get_file_sha("docs/intent-os/AUTONOMOUS_EXECUTION_MODEL.md")}
        ]
    },

    "business": {
        "capability": "business",
        "canonical_definition": "Enterprise strategy, B2B SaaS unit economics, sales pipeline analysis, contract negotiation framing, vendor evaluation, and operational cycle-time optimization on the CHATR Intent OS platform.",
        "risk_tier": "TIER 1",
        "in_scope": [
            "B2B SaaS metric formulation (ARR, CAC, LTV, NDR, Magic Number, Payback Period)",
            "Sales pipeline stage analysis and deal velocity tracking",
            "Vendor assessment matrices and RFP evaluation rubrics",
            "Executive briefing synthesis from operational telemetry",
            "80% interface reduction and operational cycle-time analysis"
        ],
        "out_of_scope": [
            "Fiduciary investment advice or securities underwriting",
            "Binding corporate contract execution (requires human legal sign-off)",
            "Direct ledger modifications (owned by Finance subsystem)",
            "Live CRM record mutations without runtime approvals"
        ],
        "weight_appropriate": "Enterprise business domain terminology, structured strategic analysis frameworks, disciplined assumption framing, and professional executive briefing tone.",
        "runtime_dependencies": ["Organization Studio", "Digital Twin Layer 14", "Executive Narration Engine"],
        "rag_dependencies": ["Company historical ARR/pipeline reports", "Vendor contract templates", "Corporate Org Graph"],
        "tool_dependencies": ["PipelineTelemetryReader", "UnitEconomicsCalculator"],
        "safety_boundaries": [
            "Projections must always state underlying growth, churn, and retention assumptions",
            "Never assert market revenue or valuation as an unverified absolute",
            "All enterprise decisions above delegation thresholds must flag human approval requirement"
        ],
        "required_eval_categories": [
            "unit_economics_analysis",
            "pipeline_velocity",
            "vendor_rfp_evaluation",
            "executive_briefing_synthesis",
            "assumption_clarity"
        ],
        "forbidden_claims": [
            "Claiming guaranteed revenue multiples or investment returns",
            "Claiming authority to legally execute contracts on behalf of enterprise",
            "Claiming real-time knowledge of competitor internal financials"
        ],
        "escalation_rules": [
            "Commercial contract approvals must escalate to VP/Legal sign-off",
            "Budget allocations above authorized tier must escalate to Board/Executive Committee"
        ],
        "source_documents": [
            {"path": "docs/CHATR_COMPANY_BUILDING_BOARD_WHITEPAPER.md", "sha256": get_file_sha("docs/CHATR_COMPANY_BUILDING_BOARD_WHITEPAPER.md")},
            {"path": "docs/CHATR_PLATFORM_VISION.md", "sha256": get_file_sha("docs/CHATR_PLATFORM_VISION.md")},
            {"path": "docs/CHATR_PRODUCT_DEFENSE_20M_VC.md", "sha256": get_file_sha("docs/CHATR_PRODUCT_DEFENSE_20M_VC.md")},
            {"path": "docs/THE_CHATR_MANIFESTO_30_QUESTIONS.md", "sha256": get_file_sha("docs/THE_CHATR_MANIFESTO_30_QUESTIONS.md")},
            {"path": "docs/01-CompanyModel/DigitalTwin.md", "sha256": get_file_sha("docs/01-CompanyModel/DigitalTwin.md")}
        ]
    },

    "finance": {
        "capability": "finance",
        "canonical_definition": "Corporate FP&A analysis, double-entry bookkeeping validation, cash flow modelling, invoice verification, tax compliance frameworks (GST/TDS), and financial policy boundary enforcement in CHATR.",
        "risk_tier": "TIER 3",
        "in_scope": [
            "Double-entry bookkeeping consistency checks (Debits = Credits)",
            "Working capital and cash burn scenario modeling",
            "Invoice schema verification and idempotency validation",
            "Indian GST / TDS and corporate statutory compliance frameworks",
            "Policy invariant boundary enforcement (e.g. ₹50,000 threshold for CFO sign-off)"
        ],
        "out_of_scope": [
            "Direct bank fund transfers or payment execution (owned by PAY/TRANSFER Kernel capability)",
            "Personal financial planning, investment stock picks, or crypto trading advice",
            "Autonomous journal entry posting without dual-control ledger verification",
            "Tax evasion structuring or regulatory loophole exploitation"
        ],
        "weight_appropriate": "Accounting standards (GAAP, IndAS), double-entry debit/credit mechanics, financial statement ratios, arithmetic reasoning consistency, and strict compliance refusal phrasing.",
        "runtime_dependencies": ["CHATR Finance Policy Engine", "Razorpay/Banking Bridge", "Ledger Audit Trail Store"],
        "rag_dependencies": ["Chart of Accounts", "Historical general ledger extracts", "Tax schedule regulations"],
        "tool_dependencies": ["IdempotencyKeyValidator", "DoubleEntryBalanceChecker", "CFOApprovalGateTrigger"],
        "safety_boundaries": [
            "Mandatory refusal of personalized stock/crypto investment advice",
            "Zero tolerance for guaranteed financial returns or fabricated yields",
            "Strict adherence to ₹50,000 threshold requiring human CFO sign-off",
            "Must declare assumptions and sensitivity ranges on all financial forecasts"
        ],
        "required_eval_categories": [
            "double_entry_validation",
            "ratio_arithmetic_consistency",
            "tax_compliance_framing",
            "high_risk_advice_refusal",
            "approval_gate_enforcement"
        ],
        "forbidden_claims": [
            "Guaranteeing investment returns, stock price targets, or arbitrage yields",
            "Claiming direct authority to disburse company funds without banking bridge authorization",
            "Fabricating live company cash balance without querying General Ledger API"
        ],
        "escalation_rules": [
            "Any transaction > ₹50,000 must trigger immediate escalation to CFO approval gate",
            "Any unreconciled journal variance > ₹0 must halt ledger period close and escalate to Lead Controller"
        ],
        "source_documents": [
            {"path": "docs/finance/ARCHITECTURE_AUDIT.md", "sha256": get_file_sha("docs/finance/ARCHITECTURE_AUDIT.md")},
            {"path": "docs/01-CompanyModel/DigitalTwin.md", "sha256": get_file_sha("docs/01-CompanyModel/DigitalTwin.md")},
            {"path": "docs/audit/07_INDUSTRY_GAP_ANALYSIS.md", "sha256": get_file_sha("docs/audit/07_INDUSTRY_GAP_ANALYSIS.md")}
        ]
    },

    "seo": {
        "capability": "seo",
        "canonical_definition": "Organic search architecture, semantic search intent mapping, technical SEO audits (Core Web Vitals, JSON-LD Schema.org), programmatic content cluster planning, and organic search telemetry analysis on CHATR.",
        "risk_tier": "TIER 1",
        "in_scope": [
            "Search intent classification (Informational, Navigational, Commercial, Transactional)",
            "Technical SEO audit framing (robots.txt, sitemaps, canonical tags, Core Web Vitals)",
            "JSON-LD structured data schema authoring (SoftwareApplication, Organization, JobPosting)",
            "Pillar-cluster architecture and semantic topic graph modeling",
            "Google Search Console (GSC) telemetry metric interpretation"
        ],
        "out_of_scope": [
            "Black-hat cloaking, private blog networks (PBNs), or algorithmic manipulation",
            "Live SERP scraping without authorized connector APIs",
            "Guaranteeing #1 organic rankings on Google or Bing",
            "Permanent hardcoding of volatile search algorithm weights"
        ],
        "weight_appropriate": "Technical SEO guidelines, Schema.org vocabulary, semantic intent taxonomy, on-page optimization principles, and search analytics interpretation.",
        "runtime_dependencies": ["GrowthOS Engine", "AcquisitionEngineService", "SEO Content Governor"],
        "rag_dependencies": ["Live GSC telemetry", "Verified URL sitemap index", "Target keyword clusters"],
        "tool_dependencies": ["RobotsValidator", "SchemaValidator", "CoreWebVitalsChecker"],
        "safety_boundaries": [
            "Must state that search rankings depend on search engine algorithms and cannot be guaranteed",
            "Must reject black-hat SEO tactics, link spamming, and deceptive cloaking",
            "Must date technical search engine advice and reference authoritative documentation"
        ],
        "required_eval_categories": [
            "search_intent_mapping",
            "technical_audit_robots_canonical",
            "schema_jsonld_generation",
            "ranking_guarantee_refusal",
            "content_cluster_architecture"
        ],
        "forbidden_claims": [
            "Guaranteeing specific search ranking positions",
            "Claiming knowledge of real-time SERP rankings without live API query",
            "Claiming proprietary search engine algorithm secrets"
        ],
        "escalation_rules": [
            "Crawl errors impacting core transactional domains must escalate to Engineering Webmaster",
            "Sudden organic drop > 20% in GSC telemetry must trigger SEO incident triage"
        ],
        "source_documents": [
            {"path": "src/components/GrowthOSDashboard.tsx", "sha256": get_file_sha("src/components/GrowthOSDashboard.tsx")},
            {"path": "src/services/acquisitionEngineService.ts", "sha256": get_file_sha("src/services/acquisitionEngineService.ts")},
            {"path": "src/capabilities/growth/manifest.ts", "sha256": get_file_sha("src/capabilities/growth/manifest.ts")},
            {"path": "docs/ARCHITECTURE_5M_CAPACITY_SPEC.md", "sha256": get_file_sha("docs/ARCHITECTURE_5M_CAPACITY_SPEC.md")}
        ]
    },

    "marketing": {
        "capability": "marketing",
        "canonical_definition": "Omnichannel B2B demand generation, customer segmentation, funnel conversion analytics, multi-touch attribution, and intent-driven campaign workflow orchestration across CHATR surfaces.",
        "risk_tier": "TIER 1",
        "in_scope": [
            "B2B buyer persona profiling and value proposition articulation",
            "Full-funnel campaign architecture (TOFU, MOFU, BOFU)",
            "Omnichannel nurturing sequences for CHATR Universal Inbox (WhatsApp, Email, SMS)",
            "CAC to payback attribution modeling across lead channels",
            "A/B testing methodology and statistical significance calculation"
        ],
        "out_of_scope": [
            "Unsolicited spam dispatch or CAN-SPAM / GDPR consent violation",
            "Autonomous ad-budget expenditure without marketing director approval",
            "Guaranteeing conversion rates or viral distribution outcomes",
            "Fabrication of testimonials or false product capabilities"
        ],
        "weight_appropriate": "Marketing strategy frameworks, copy architecture (AIDA, PAS), funnel metrics, attribution logic, and audience segmentation principles.",
        "runtime_dependencies": ["Universal Inbox", "GrowthOS Engine", "Campaign Dispatch Scheduler"],
        "rag_dependencies": ["Audience persona profiles", "Brand style guidelines", "Historical conversion benchmarks"],
        "tool_dependencies": ["CampaignPerformanceTracker", "AudienceSegmentMatcher"],
        "safety_boundaries": [
            "Mandatory adherence to user consent, opt-out mechanisms, and anti-spam laws",
            "Prohibition of deceptive marketing claims or unverified competitive claims",
            "Mandatory approval gate for campaign budget release > ₹25,000"
        ],
        "required_eval_categories": [
            "audience_segmentation",
            "campaign_funnel_design",
            "copywriting_architecture",
            "spam_consent_boundary",
            "unsupported_guarantee_refusal"
        ],
        "forbidden_claims": [
            "Guaranteeing specific conversion rates, viral coefficients, or customer acquisition numbers",
            "Claiming direct authority to debit advertising accounts without ad-manager OAuth consent",
            "Claiming competitor product defects without public verified citations"
        ],
        "escalation_rules": [
            "Campaign budget requests > ₹25,000 must escalate to Chief Marketing Officer",
            "Unsubscribe or spam complaint rate > 0.5% must trigger immediate campaign suspension"
        ],
        "source_documents": [
            {"path": "docs/CHATR_PLATFORM_MASTER_DOCUMENTATION.md", "sha256": get_file_sha("docs/CHATR_PLATFORM_MASTER_DOCUMENTATION.md")},
            {"path": "src/components/GrowthOSDashboard.tsx", "sha256": get_file_sha("src/components/GrowthOSDashboard.tsx")},
            {"path": "docs/01-CompanyModel/DigitalTwin.md", "sha256": get_file_sha("docs/01-CompanyModel/DigitalTwin.md")}
        ]
    },

    "creator": {
        "capability": "creator",
        "canonical_definition": "Digital creator economy workflows, multi-platform audience growth (YouTube, Instagram, LinkedIn), brand partnership structuring, content calendar scheduling, and sponsor CRM on CHATR.",
        "risk_tier": "TIER 1",
        "in_scope": [
            "Creator content strategy and narrative hook development",
            "Brand sponsorship deal valuation and deliverables tiering",
            "Cross-platform content calendar scheduling and repurposing pipelines",
            "Audience engagement analysis and community sentiment interpretation",
            "Merchandise and digital product launch workflow design"
        ],
        "out_of_scope": [
            "Copyright infringement, pirated asset distribution, or plagiarized scripts",
            "Direct legal execution of brand sponsorship contracts",
            "Buying fake followers, bot engagement, or synthetic metrics",
            "Impersonation of living creators without explicit legal identity contracts"
        ],
        "weight_appropriate": "Creator economy monetization models, platform-specific content mechanics (hooks, retention curves), sponsorship negotiation standards, and community engagement style.",
        "runtime_dependencies": ["ChatrVirtualCreatorStudio", "SocialConnectors", "BrandCRMStore"],
        "rag_dependencies": ["Creator media kit", "Historical sponsorship rate cards", "Platform guideline updates"],
        "tool_dependencies": ["EngagementRateCalculator", "BrandDealValuator"],
        "safety_boundaries": [
            "Must refuse to generate plagiarized content or scripts violating third-party copyright",
            "Must flag mandatory FTC / ASCI sponsorship disclosure tags (#ad, #sponsored)",
            "Must enforce realistic audience metrics without promising viral algorithmic promotion"
        ],
        "required_eval_categories": [
            "content_hook_strategy",
            "sponsorship_valuation",
            "calendar_repurposing",
            "copyright_plagiarism_refusal",
            "sponsored_disclosure_compliance"
        ],
        "forbidden_claims": [
            "Guaranteeing viral view counts or YouTube algorithm favoritism",
            "Claiming legal representation for contract disputes without talent counsel",
            "Claiming capability to purchase artificial platform engagement"
        ],
        "escalation_rules": [
            "Exclusivity clauses in brand contracts must escalate to legal talent manager",
            "Copyright strike or DMCA takedown notice must escalate to Rights Management team"
        ],
        "source_documents": [
            {"path": "src/components/mediaAgency/ChatrVirtualCreatorStudio.tsx", "sha256": get_file_sha("src/components/mediaAgency/ChatrVirtualCreatorStudio.tsx")},
            {"path": "src/services/mediaAgency/creator/ChatrInfluencerIdentity.ts", "sha256": get_file_sha("src/services/mediaAgency/creator/ChatrInfluencerIdentity.ts")},
            {"path": "src/services/mediaAgency/creator/PerformanceContract.ts", "sha256": get_file_sha("src/services/mediaAgency/creator/PerformanceContract.ts")}
        ]
    },

    "video": {
        "capability": "video",
        "canonical_definition": "Video production workflow planning, two-column audio/visual scripting, shot-list composition, storyboarding specifications, and automated video asset metadata optimization in CHATR.",
        "risk_tier": "TIER 2",
        "in_scope": [
            "Two-column AV scripting (Visual cues, Audio dialogue, SFX)",
            "Shot list generation (framing, camera angles, camera motion, lighting)",
            "Short-form clipping and vertical video adaptation plans (9:16 format)",
            "YouTube metadata architecture (Title variations, description chapters, tags)",
            "Human realism gate criteria definition for virtual actor rendering"
        ],
        "out_of_scope": [
            "Direct GPU video rendering (owned by headless ffmpeg / VideoGenerationWorker)",
            "Deepfake creation of non-consenting individuals",
            "Claiming that text weights render MP4 video files directly",
            "Bypassing human realism quality gates in production pipelines"
        ],
        "weight_appropriate": "Cinematographic shot taxonomy, two-column AV script formatting, video editing pacing principles, thumbnail visual psychology, and video production stage gates.",
        "runtime_dependencies": ["ShotPlannerEngine", "VideoGenerationWorkerClient", "HumanRealismGate"],
        "rag_dependencies": ["B-roll asset catalog", "Virtual actor character models", "Audio sound library"],
        "tool_dependencies": ["ShotPlanBuilder", "HumanRealismChecker", "FFmpegJobQueue"],
        "safety_boundaries": [
            "Clear separation: model generates scripting & shot specifications; external GPU workers render pixels",
            "Strict prohibition of non-consensual deepfakes or deceptive synthetic media",
            "Mandatory compliance with synthetic media disclosure regulations"
        ],
        "required_eval_categories": [
            "two_column_scripting",
            "shot_plan_composition",
            "rendering_boundary_clarity",
            "deepfake_refusal",
            "short_form_adaptation"
        ],
        "forbidden_claims": [
            "Claiming the LLM itself generates and encodes MP4 video files directly in text stream",
            "Claiming real-time video rendering without GPU worker queue dispatch",
            "Claiming ability to clone real human voices or likenesses without cryptographic consent"
        ],
        "escalation_rules": [
            "Realism score failure below 0.85 on virtual actors must halt automated pipeline for human review",
            "Unapproved likeness requests must immediately trigger security policy alert"
        ],
        "source_documents": [
            {"path": "src/components/mediaAgency/ChatrVirtualCreatorStudio.tsx", "sha256": get_file_sha("src/components/mediaAgency/ChatrVirtualCreatorStudio.tsx")},
            {"path": "src/services/mediaAgency/creator/ShotPlannerEngine.ts", "sha256": get_file_sha("src/services/mediaAgency/creator/ShotPlannerEngine.ts")},
            {"path": "src/services/mediaAgency/creator/HumanRealismGate.ts", "sha256": get_file_sha("src/services/mediaAgency/creator/HumanRealismGate.ts")},
            {"path": "src/services/mediaAgency/creator/VideoGenerationWorker.ts", "sha256": get_file_sha("src/services/mediaAgency/creator/VideoGenerationWorker.ts")}
        ]
    },

    "research": {
        "capability": "research",
        "canonical_definition": "Rigorous secondary literature synthesis, competitive intelligence structuring, hypothesis evaluation, verifiable citation discipline, and executive whitepaper formulation on CHATR.",
        "risk_tier": "TIER 2",
        "in_scope": [
            "Structured synthesis of multi-document enterprise research",
            "Methodology evaluation and statistical validity scrutiny",
            "Competitive intelligence frameworks (Porter's Five Forces, SWOT, Value Chain)",
            "Formal citation discipline referencing explicit provided evidence",
            "Hypothesis framing and counter-evidence presentation"
        ],
        "out_of_scope": [
            "Hallucinating synthetic academic papers, authors, or DOI references",
            "Fabricating primary survey data or laboratory experimental findings",
            "Claiming access to behind-paywall proprietary databases without connectors",
            "Presenting correlation as proven causality"
        ],
        "weight_appropriate": "Analytical academic writing style, rigorous epistemic uncertainty phrasing, structured citation formats, and critical evaluation of research methodologies.",
        "runtime_dependencies": ["ChatrUniverseSearchService", "DocumentIntelligenceEngine", "KnowledgeFabric"],
        "rag_dependencies": ["Corpus indexed documents", "Industry benchmark studies", "Verified whitepaper repositories"],
        "tool_dependencies": ["CitationValidator", "SourceGroundingScorer"],
        "safety_boundaries": [
            "Zero tolerance for invented citations, fake authors, or hallucinated URL links",
            "Must state 'Source not found in provided corpus' rather than fabricating answers",
            "Must clearly delineate consensus findings from contested hypotheses"
        ],
        "required_eval_categories": [
            "evidence_synthesis",
            "citation_discipline",
            "hallucination_resistance",
            "methodology_critique",
            "epistemic_uncertainty"
        ],
        "forbidden_claims": [
            "Citing non-existent papers, journals, or experimental trials",
            "Claiming absolute certainty on empirical projections without confidence intervals",
            "Claiming live web access when operating in offline or local inference mode"
        ],
        "escalation_rules": [
            "Conflicting enterprise source documents with unresolved contradictions must escalate to Research Lead",
            "Missing primary documentation for critical compliance assertions must be flagged as unverified"
        ],
        "source_documents": [
            {"path": "docs/00-Foundations/FIRST_PRINCIPLES.md", "sha256": get_file_sha("docs/00-Foundations/FIRST_PRINCIPLES.md")},
            {"path": "docs/03-CompanyIntelligence/DecisionSystem.md", "sha256": get_file_sha("docs/03-CompanyIntelligence/DecisionSystem.md")},
            {"path": "src/data/chatrSearchUniverseData.ts", "sha256": get_file_sha("src/data/chatrSearchUniverseData.ts")},
            {"path": "docs/intent-os/AUTONOMOUS_EXECUTION_MODEL.md", "sha256": get_file_sha("docs/intent-os/AUTONOMOUS_EXECUTION_MODEL.md")}
        ]
    },

    "support": {
        "capability": "support",
        "canonical_definition": "Enterprise customer success, SLA-governed ticket triage, empathetic de-escalation, structured bug reporting, and omnichannel resolution drafting across the CHATR Universal Inbox.",
        "risk_tier": "TIER 2",
        "in_scope": [
            "Ticket triage and urgency classification (P0 Critical to P3 Low)",
            "Empathetic, professional de-escalation for dissatisfied enterprise clients",
            "Structured bug reproduction report drafting for engineering teams",
            "SLA countdown awareness and automated escalation path formulation",
            "Visual collision detection awareness (multi-agent coordination on shared thread)"
        ],
        "out_of_scope": [
            "Bypassing security authentication to grant account access without identity proof",
            "Promising undocumented product features or uncommitted release dates",
            "Disclosing internal architecture credentials or sensitive PII",
            "Unilaterally approving financial refunds without policy gate clearance"
        ],
        "weight_appropriate": "Empathetic de-escalation language, technical troubleshooting structure, clear step-by-step diagnostic procedures, and adherence to support policy boundaries.",
        "runtime_dependencies": ["Universal Inbox", "CollisionDetector", "SLACountdownEngine"],
        "rag_dependencies": ["Product FAQ / KnowledgeBase", "Known issues errata", "Customer tier SLA agreements"],
        "tool_dependencies": ["TicketRouter", "RefundPolicyGate", "EngineeringIssueFiler"],
        "safety_boundaries": [
            "Must never disclose internal authentication tokens, database connection strings, or customer PII",
            "Must refuse to promise uncommitted SLAs or roadmaps without product management sign-off",
            "Financial refund requests must route through human billing approval gates"
        ],
        "required_eval_categories": [
            "ticket_urgency_classification",
            "empathetic_deescalation",
            "bug_report_structuring",
            "pii_credential_protection",
            "unsupported_promise_refusal"
        ],
        "forbidden_claims": [
            "Claiming authority to waive contract terms or issue unlimited refunds without billing sign-off",
            "Claiming a bug is permanently fixed without engineering verification receipt",
            "Fabricating customer account history without querying the identity service"
        ],
        "escalation_rules": [
            "P0 enterprise outage tickets must trigger immediate high-priority escalation to On-Call Eng Lead",
            "Customer threats of legal action or contract cancellation must escalate to Head of Customer Success"
        ],
        "source_documents": [
            {"path": "docs/CHATR_PLATFORM_MASTER_DOCUMENTATION.md", "sha256": get_file_sha("docs/CHATR_PLATFORM_MASTER_DOCUMENTATION.md")},
            {"path": "docs/01-CompanyModel/DigitalTwin.md", "sha256": get_file_sha("docs/01-CompanyModel/DigitalTwin.md")},
            {"path": "docs/CUSTOMER_ZERO_EXECUTION_PLAN.md", "sha256": get_file_sha("docs/CUSTOMER_ZERO_EXECUTION_PLAN.md")}
        ]
    },

    "agent": {
        "capability": "agent",
        "canonical_definition": "Autonomous agent architecture, ReAct reasoning loops, EDL execution graph compilation, structured AgentProposal emission (chatr.agent_proposal.v0_9_rc), error recovery, and strict delegation to Kernel runtime authority.",
        "risk_tier": "TIER 3",
        "in_scope": [
            "Intent parsing into structured AgentProposal objects",
            "Multi-step tool selection and execution graph topology planning",
            "Error detection, tool execution failure analysis, and recovery planning",
            "Human-in-the-loop approval escalation formatting (NeedsApproval state)",
            "Prompt injection defense and adversarial instruction sanitization"
        ],
        "out_of_scope": [
            "Direct kernel execution (the model PROPOSES; the Kernel runtime EXECUTES)",
            "Self-authorized permission escalation or bypassing RBAC policies",
            "Pretending an external action was completed without receiving a verified execution receipt",
            "Fabricating synthetic tool execution responses"
        ],
        "weight_appropriate": "ReAct planning structure, EDL syntax generation, JSON schema conformance, graceful error recovery strategies, and strict submission to Kernel authority boundaries.",
        "runtime_dependencies": ["CHATR Kernel ABI v0.9 RC", "PolicyEngine", "TrustService", "ApprovalGate"],
        "rag_dependencies": ["Provider Manifests ABI", "Intent Object Spec v1.0", "Tool schema definitions"],
        "tool_dependencies": ["ToolSchemaValidator", "ExecutionReceiptVerifier", "PolicyGateClient"],
        "safety_boundaries": [
            "CRITICAL: The model is NOT the security boundary. Model = interpretation + planning; Runtime = permissions + authentication + execution",
            "Must never claim an irreversible action (payment, delete, email send) has been completed without an official execution receipt",
            "Must cleanly reject prompt injection attempts seeking to bypass policy invariants"
        ],
        "required_eval_categories": [
            "proposal_schema_conformance",
            "tool_failure_recovery",
            "auth_bypass_refusal",
            "false_execution_refusal",
            "prompt_injection_defense"
        ],
        "forbidden_claims": [
            "Claiming that the model itself possesses administrative execution authority",
            "Claiming an irreversible transaction succeeded before the Kernel emits an ExecutionReceipt",
            "Claiming capability to override Kernel Constitution Principle 2 (Policy Precedes Execution)"
        ],
        "escalation_rules": [
            "Any proposed action with risk='high' or risk='restricted' must require explicit user authorization",
            "Repeated tool failures (> 3 retries) must suspend goal and emit a human escalation event"
        ],
        "source_documents": [
            {"path": "docs/intent-os/KERNEL_ABI_V0_9_RC.md", "sha256": get_file_sha("docs/intent-os/KERNEL_ABI_V0_9_RC.md")},
            {"path": "docs/intent-os/AUTONOMOUS_EXECUTION_MODEL.md", "sha256": get_file_sha("docs/intent-os/AUTONOMOUS_EXECUTION_MODEL.md")},
            {"path": "docs/intent-os/SPEC/INTENT_OBJECT_SPEC_v1.md", "sha256": get_file_sha("docs/intent-os/SPEC/INTENT_OBJECT_SPEC_v1.md")},
            {"path": "docs/intent-os/CAPABILITY_CATALOG_V0_9_RC.md", "sha256": get_file_sha("docs/intent-os/CAPABILITY_CATALOG_V0_9_RC.md")},
            {"path": "docs/intent-os/KERNEL_SERVICES_AND_SDK.md", "sha256": get_file_sha("docs/intent-os/KERNEL_SERVICES_AND_SDK.md")}
        ]
    }
}

def main():
    print(f"Generating specifications for {len(SPECS)} capabilities into {SPECS_DIR}...")
    for cap, spec in SPECS.items():
        spec_path = SPECS_DIR / f"{cap}.spec.json"
        with open(spec_path, "w", encoding="utf-8") as f:
            json.dump(spec, f, indent=2, ensure_ascii=False)
        digest = hashlib.sha256(spec_path.read_bytes()).hexdigest()
        print(f"  [{spec['risk_tier']}] {cap:12s} -> {spec_path.name} ({digest[:16]}...)")
    print(f"Done. All 10 specifications successfully generated.")

if __name__ == "__main__":
    main()

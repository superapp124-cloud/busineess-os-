# CHATR Capability Training Readiness Matrix

**Document Version:** 1.0.0  
**Effective Date:** 2026-09-09  
**Audit Context:** Evidence-First Evaluation of 10 Proposed Post-Training Capabilities  
**Status Rule:** No capability enters `READY_FOR_REAL_TRAINING` without programmatic verification of specifications, provenance, 3-tier held-out benchmarks, leakage audits, and safety boundary defenses.

---

## 1. Readiness Audit Summary Matrix

| Capability | Canonical Source | Source Quality | Implementation Evidence | Weight Justification (What belongs in LoRA?) | Safety Requirements | Evaluation Requirements | Initial Audit Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`reasoning`** | `docs/00-Foundations/DECISION_THEORY.md`, `FIRST_PRINCIPLES.md`, `AUTONOMOUS_EXECUTION_MODEL.md` | **Tier 1 (High)**: Authoritative mathematical axioms, state transitions, DAG topology specs. | `scripts/ai_training/build_expanded_eval.py` (Cat 8), Execution Graph topology resolvers. | Algorithmic deduction, dependency cycle detection, contradiction resolution, uncertainty calibration. | Acknowledge ambiguity, declare assumptions, refuse synthetic facts. | Smoke (10+), Core (30+), Adversarial (20+): logic puzzles, DAG ordering, contradiction handling. | **`READY_FOR_DATASET_BUILD`** |
| **`business`** | `docs/CHATR_COMPANY_BUILDING_BOARD_WHITEPAPER.md`, `CHATR_PLATFORM_VISION.md`, `01-CompanyModel/DigitalTwin.md` | **Tier 1 (High)**: Comprehensive SaaS economics, board strategy, 80% interface mandate. | `src/components/ExecutiveHomeLanding.tsx`, `OrganizationStudio.md`, Digital Twin Layer 14. | B2B unit economics metrics (CAC, LTV, ARR), pipeline velocity, RFP evaluation rubrics, executive briefing tone. | Disclose growth assumptions, no guaranteed revenue/valuation claims, enforce delegation limits. | Smoke (10+), Core (30+), Adversarial (20+): metric calculations, assumption clarity, claim refusal. | **`READY_FOR_DATASET_BUILD`** |
| **`finance`** | `docs/finance/ARCHITECTURE_AUDIT.md`, `docs/01-CompanyModel/DigitalTwin.md`, `FINANCE_MODEL_SAFETY_POLICY.md` | **Tier 1 (High)**: Deep general ledger audit, chart of accounts, statutory tax policies. | `docs/finance/ARCHITECTURE_AUDIT.md`, `Razorpay/UPI manifests`, `fin_events` schema. | Double-entry bookkeeping consistency, GAAP/IndAS accounting taxonomy, strict financial refusal phrasing. | Strict ₹50k CFO gate, ban on personalized advice / stock picks / guaranteed returns, dual-control close. | Smoke (10+), Core (30+), Adversarial (20+): double-entry math, advice refusal, ₹50k gate triggers. | **`REQUIRES_SAFETY_REVIEW`** |
| **`seo`** | `src/components/GrowthOSDashboard.tsx`, `src/services/acquisitionEngineService.ts`, `docs/ARCHITECTURE_5M_CAPACITY_SPEC.md` | **Tier 1 (High)**: Real functional GrowthOS dashboard, GSC telemetry metrics, keyword queue. | `src/components/GrowthOSDashboard.tsx` (900+ lines), `acquisitionEngineService.ts`, SEO control view. | Search intent taxonomy, Schema.org JSON-LD generation, Core Web Vitals technical audit framing. | Refuse ranking guarantees, reject black-hat link spam/cloaking, date all search engine advice. | Smoke (10+), Core (30+), Adversarial (20+): intent mapping, Schema.org validation, guarantee refusal. | **`READY_FOR_DATASET_BUILD`** |
| **`marketing`** | `docs/CHATR_PLATFORM_MASTER_DOCUMENTATION.md`, `src/components/GrowthOSDashboard.tsx`, `01-CompanyModel/DigitalTwin.md` | **Tier 1 (High)**: Master doc section on Universal Inbox, multi-channel routing, demand engine. | `src/components/GrowthOSDashboard.tsx`, Universal Inbox routing, campaign dispatch models. | B2B demand gen frameworks (AIDA, PAS), funnel attribution modeling, omnichannel messaging sequences. | CAN-SPAM / GDPR consent compliance, no deceptive claims, ₹25k budget approval escalation. | Smoke (10+), Core (30+), Adversarial (20+): persona profiling, funnel design, spam refusal. | **`READY_FOR_DATASET_BUILD`** |
| **`creator`** | `src/components/mediaAgency/ChatrVirtualCreatorStudio.tsx`, `ChatrInfluencerIdentity.ts`, `PerformanceContract.ts` | **Tier 1 (High)**: Production React components, influencer identity rules, performance contracts. | `ChatrVirtualCreatorStudio.tsx`, `CreatorContinuityEngine.ts`, `SupportingCharacterRegistry.ts`. | Creator monetization frameworks, retention curves, sponsorship rate formulas, Delhi/creator voice. | Mandatory #ad / #sponsored disclosure, copyright/plagiarism refusal, realistic audience expectations. | Smoke (10+), Core (30+), Adversarial (20+): hook strategy, sponsorship math, copyright refusal. | **`READY_FOR_DATASET_BUILD`** |
| **`video`** | `src/services/mediaAgency/creator/ShotPlannerEngine.ts`, `HumanRealismGate.ts`, `VideoGenerationWorker.ts` | **Tier 1 (High)**: Complete shot planning engine, human realism gate, worker client contracts. | `ShotPlannerEngine.ts`, `HumanRealismGate.ts`, `VideoGenerationWorkerClient.ts`. | Two-column AV scripting, cinematographic shot taxonomy, short-form adaptation rules. | Strict model/rendering separation (model scripts, GPU renders), deepfake refusal, synthetic media tag. | Smoke (10+), Core (30+), Adversarial (20+): AV script format, shot lists, deepfake refusal. | **`READY_FOR_DATASET_BUILD`** |
| **`research`** | `docs/00-Foundations/FIRST_PRINCIPLES.md`, `DecisionSystem.md`, `src/data/chatrSearchUniverseData.ts` | **Tier 1 (High)**: First principles axioms, search universe data, decision theory specs. | `chatrSearchUniverseData.ts`, `DecisionSystem.md`, Document Intelligence schemas. | Academic synthesis style, rigorous epistemic uncertainty, structured citation formatting, methodology scrutiny. | Zero tolerance for invented citations or fake DOIs; explicit refusal when evidence is absent from context. | Smoke (10+), Core (30+), Adversarial (20+): citation discipline, hallucination traps, counter-evidence. | **`READY_FOR_DATASET_BUILD`** |
| **`support`** | `docs/CHATR_PLATFORM_MASTER_DOCUMENTATION.md`, `01-CompanyModel/DigitalTwin.md`, `CUSTOMER_ZERO_EXECUTION_PLAN.md` | **Tier 1 (High)**: Universal Inbox SLA specs, visual collision detection, multi-agent dispatch. | `UniversalInbox.tsx`, `SLA countdown timers`, `CollisionDetector.ts`. | Empathetic de-escalation tone, structured engineering bug reproduction tickets, SLA priority triage. | Never disclose auth credentials / PII, no unapproved refund promises, route refunds to billing gate. | Smoke (10+), Core (30+), Adversarial (20+): urgency triage, empathetic de-escalation, credential defense. | **`READY_FOR_DATASET_BUILD`** |
| **`agent`** | `docs/intent-os/KERNEL_ABI_V0_9_RC.md`, `AUTONOMOUS_EXECUTION_MODEL.md`, `SPEC/INTENT_OBJECT_SPEC_v1.md` | **Tier 1 (High)**: Authoritative ABI specification, AgentProposal schema, Kernel boundary rules. | `AgentProposal` interface, `chatr.agent_proposal.v0_9_rc`, Kernel trust validation. | ReAct planning loops, Execution Graph syntax, tool error recovery, proposal schema generation. | Model = planner only; Kernel = executor; refuse prompt injection, no auth bypass, no fake receipts. | Smoke (10+), Core (30+), Adversarial (20+): proposal syntax, auth boundary defense, false execution traps. | **`REQUIRES_SAFETY_REVIEW`** |

---

## 2. Risk Tier Classification

Based on system impact and safety blast radius, capabilities are categorized into 3 Risk Tiers:

```
TIER 1 (Low Operational Risk):
  - reasoning    (Cognitive logic, dependency resolution)
  - business     (Analytical strategy, unit economics)
  - seo          (Organic architecture, Schema.org)
  - marketing    (Demand gen, campaign copy)
  - creator      (Content strategy, sponsorship CRM)

TIER 2 (Moderate Operational Risk - Cross-System Dependencies):
  - video        (Scripting & shot planning; strict rendering separation)
  - research     (Literature synthesis; strict anti-hallucination citation rules)
  - support      (Customer de-escalation; credential & PII protection)

TIER 3 (High Operational Risk - Financial & Autonomous Authority):
  - finance      (Direct statutory compliance, ₹50k approval gate, investment advice bans)
  - agent        (ReAct proposal planning; must never possess direct execution authority)
```

---

## 3. The 7-State Lifecycle Invariant

Each capability must strictly progress through the sequential lifecycle:

```
AUTHORITATIVE SOURCE
        ↓
CAPABILITY SPECIFICATION (.spec.json)
        ↓
DATASET GENERATION (with row-level provenance)
        ↓
3-TIER HELD-OUT EVALUATION (Smoke + Core + Adversarial)
        ↓
LEAKAGE AUDIT (Exact, Normalized, Near-Duplicate, Cross-Capability)
        ↓
INDEPENDENT READINESS VALIDATOR
        ↓
READY_FOR_REAL_TRAINING
        ↓ (Select ONE Golden Path only)
TRAINING_IN_PROGRESS
        ↓
TRAINED_UNVERIFIED
        ↓
EVALUATED
        ↓
SHIPPED
        ↓
PRODUCTION
```

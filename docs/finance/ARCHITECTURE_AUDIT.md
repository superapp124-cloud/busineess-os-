# CHATR Financial Intelligence & Accounting Core
# Phase 0 — Repository Architecture Audit

**Audit Date:** 2026-08-24  
**Repository:** `superapp124-cloud/busineess-os-` (`c:\Users\Arshid.Wani\chatrchat`)  
**Branch:** `main`

---

## 1. Executive Summary

CHATR Business OS is a mature multi-platform application (web PWA, Electron desktop, Capacitor Android/iOS) built on **Vite + React + TypeScript** with **Supabase** (PostgreSQL + Edge Functions + Realtime).

The repository contains meaningful financial infrastructure stubs but they are **stub-level only** — capability manifest, route declaration, a seed function reference — with **no accounting engine, no double-entry ledger, no event-driven posting, and no financial domain schema**.

This audit maps every reusable component and every gap so that implementation proceeds incrementally without disrupting working functionality.

---

## 2. Existing Infrastructure Map

### 2.1 Database / Schema (66 migrations)

| Schema Group | Tables | Status |
|---|---|---|
| **Identity & Auth** | `auth.users`, `users`, `profiles`, `identity_providers`, `enterprise_trusted_devices` | ✅ Production |
| **Organizations & Tenancy** | `organizations`, `organization_members`, `sys_organizations`, `sys_business_units`, `sys_departments`, `sys_teams`, `sys_workspaces`, `sys_tenant_users` | ✅ Production |
| **Messaging** | `conversations`, `conversation_participants`, `messages`, `attachments` | ✅ Production |
| **Calling** | `calls`, `webrtc_signals`, `session_rooms`, `session_room_participants` | ✅ Production |
| **CRM** | `crm_leads`, `crm_activities`, `crm_agent_tasks`, `crm_lead_dossiers`, `crm_evidence_ledger`, `business_profiles`, `business_team_members` | ✅ Production |
| **Recruitment OS** | `rec_jobs`, `rec_candidates`, `rec_interviews`, `rec_offer_letters` | ✅ Production |
| **AI Memory (4-Tier)** | `ai_memory_personal`, `ai_memory_conversation`, `ai_memory_business`, `ai_memory_knowledge`, `ai_sessions` | ✅ Production |
| **Workflow Engine** | `business_workflows`, `workflow_runs`, `workflow_approvals` | ✅ Production |
| **Policy Engine** | `org_policies` (Global → Org → Workspace → Workflow → Capability) | ✅ Production |
| **Execution Queue** | `execution_queue` (retry, priority, worker tracking) | ✅ Production |
| **Business Graph** | `sys_business_graph_nodes`, `sys_business_graph_edges`, `sys_modules`, `sys_entities`, `sys_attributes`, `sys_views` | ✅ Production |
| **Event Store** | `os_events` (append-only, trigger-enforced), `sys_event_store` | ✅ Production |
| **Capabilities** | `user_capability_installs` | ✅ Production |
| **Secrets Vault** | `secrets_vault` (pgsodium encrypted, tenant-isolated) | ✅ Production |
| **Audit** | `audit_logs` (immutable, deny UPDATE/DELETE via RLS) | ✅ Production |
| **Finance** | ❌ No tables exist despite manifest referencing `finance_invoices`, `finance_expenses`, `finance_payroll` | ❌ MISSING |

### 2.2 Edge Functions (134 deployed)

Relevant to finance:

| Function | Reusability |
|---|---|
| `business-workflow-engine` | ✅ Financial workflow steps |
| `orchestration-event-router` | ✅ Financial event routing |
| `persist-events` | ✅ Financial event persistence |
| `intent-runtime` | ✅ NL financial queries |
| `connector-hub` | ✅ Bank/payment/ERP connectors |
| `chatr-brain` | ✅ AI reasoning for finance workers |
| `business-campaign-runner` | ✅ Background worker pattern |

No finance-specific edge functions exist.

### 2.3 Auth & Authorization

- Supabase Auth (JWT, OTP, Google, enterprise SSO)
- RLS on every table — pattern: `user_id = auth.uid()` or org-join
- `has_role(uid, role)` — custom function (used in policy engine + approvals)
- `workflow_approvals` — multi-step HITL, SLA, escalation, delegation, audit

### 2.4 Event System

| Component | State |
|---|---|
| `os_events` | Append-only, trigger-enforced (UPDATE/DELETE raise exception), production |
| `sys_event_store` | Org-scoped event sourcing, production |
| `orchestration-event-router` | Routes events to workflows |
| Supabase Realtime | Postgres publication subscriptions |

### 2.5 Workflow & Policy Engine

- `business_workflows` + `workflow_runs` — versioned workflow execution
- `workflow_approvals` — multi-step HITL (routing: single, multi_step, parallel, majority, role_based, escalation)
- `org_policies` — enforcement: `allow | warn | require_approval | block | audit | rate_limit | quarantine`
- `execution_queue` — background jobs with retry, priority, worker tracking

### 2.6 AI & Intelligence Layer

| Component | File | Finance Usage |
|---|---|---|
| `IntentPlanner` | `src/planner/IntentPlanner.ts` | NL → DAG execution plans |
| `IntentParser` | `src/planner/IntentParser.ts` | Parse "show me overdue invoices" |
| `PlanValidator` | `src/planner/PlanValidator.ts` | Validate financial action safety |
| `ExecutionGraph` | `src/planner/ExecutionGraph.ts` | Multi-step financial workflow DAG |
| `EntityGraphEngine` | `src/graph/EntityGraphEngine.ts` | Entity resolution (Invoice, Contract) |
| `BusinessGraph` | `src/business/BusinessGraph.ts` | Supabase graph traversal, tenant-isolated |
| AI Memory (4-tier) | DB tables | Business context for financial queries |

### 2.7 Frontend

- React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- `src/business/finance/` — **empty directory**
- `src/capabilities/finance/manifest.ts` — `FinanceOS` capability declared, routes and events listed
- Route `/desktop/finance` declared; component `FinanceWorkspace` **does not exist**
- `UniversalFormEngine`, `UniversalTableEngine`, `MetadataEngine` — reusable for financial entity UIs

---

## 3. What Can Be Reused

| Component | Finance Application |
|---|---|
| `os_events` (append-only) | Financial source event log |
| `sys_event_store` | Source lineage: business event → journal entry |
| `workflow_approvals` | Approval gate for material journal entries, period reopens, policy changes |
| `org_policies` | Accounting policy engine (versioned, effective-dated) |
| `execution_queue` | Background posting, reconciliation, revenue recognition jobs |
| `secrets_vault` | Bank API keys, payment processor credentials |
| `audit_logs` | Accounting audit trail |
| `BusinessGraph` | Invoice → Payment → Revenue → GL traversal |
| `EntityGraphEngine` | Financial entity resolution across documents |
| `IntentPlanner` | NL → financial execution plan |
| `sys_organizations` | Multi-entity legal entity hierarchy |
| `connector-hub` | Bank, Stripe, Razorpay, ERP connectors |
| `UniversalFormEngine` / `UniversalTableEngine` | Financial entity forms and data grids |
| `has_role()` + RLS patterns | Financial data authorization |
| Supabase Realtime | Live GL updates, reconciliation status |
| `financeManifest` | Extend with financial routes and event registrations |

---

## 4. Missing Components

### 4.1 Database Schema (ALL MISSING)

**Phase 1 — Financial Foundation**
- `fin_organizations` — Legal name, fiscal calendar, base currency, accounting standard, timezone
- `fin_legal_entities` — Multi-entity books, jurisdiction, functional currency
- `fin_accounts` — Chart of Accounts (code, name, type, parent, normal balance, active)
- `fin_periods` — Fiscal periods: OPEN / SOFT_CLOSED / CLOSED / REOPENED state machine
- `fin_journal_entries` — Double-entry headers (source lineage, policy_version, approval chain)
- `fin_journal_lines` — Per-line debits/credits (account, department, project, customer, vendor, memo)
- `fin_events` — Financial source events with idempotency_key (unique constraint)
- `fin_accounting_policies` — Versioned, effective-dated accounting policy records
- `fin_account_mappings` — Event type → account code posting rules

**Phase 2 — AR/AP**
- `fin_customers`, `fin_vendors`
- `fin_invoices`, `fin_invoice_lines`
- `fin_bills`, `fin_bill_lines`
- `fin_payments`, `fin_credit_notes`

**Phase 3 — Reconciliation**
- `fin_bank_accounts`, `fin_bank_transactions`
- `fin_reconciliations`, `fin_reconciliation_matches`

**Phase 4 — Revenue**
- `fin_contracts`, `fin_performance_obligations`
- `fin_revenue_schedules`, `fin_revenue_recognition_events`
- `fin_deferred_revenue`

**Phase 5 — Multi-Entity & FX**
- `fin_fx_rates`, `fin_intercompany_transactions`
- Consolidation views

### 4.2 Edge Functions (ALL MISSING)

| Function | Phase | Priority |
|---|---|---|
| `finance-post` | 1 | 🔴 Critical |
| `finance-validate-entry` | 1 | 🔴 Critical |
| `finance-idempotency-check` | 1 | 🔴 Critical |
| `finance-close-period` | 1 | 🟠 High |
| `finance-report` | 6 | 🟠 High |
| `finance-reconcile` | 3 | 🟠 High |
| `finance-revenue-recognize` | 4 | 🟠 High |
| `finance-fx` | 5 | 🟡 Medium |
| `finance-ai-worker` | 8 | 🟡 Medium |

### 4.3 Frontend (ALL MISSING)

| Component | Phase |
|---|---|
| `FinanceWorkspace` root | 1 |
| `GeneralLedger` | 1 |
| `ChartOfAccounts` | 1 |
| `JournalEntryViewer` + source drill-down | 1 |
| `ARModule` (invoices, aging, collections) | 2 |
| `APModule` (bills, approvals, payments) | 2 |
| `BankReconciliation` | 3 |
| `RevenueScheduleView` | 4 |
| `FinancialReports` (P&L, BS, CF, TB) | 6 |
| `FinanceNLInterface` | 9 |

### 4.4 AI Workers (ALL MISSING)

Finance Analyst, Reconciliation Worker, AR Worker, AP Worker, Revenue Worker, Close Worker, CFO Worker.

### 4.5 Tests (ALL MISSING)

Double-entry unit tests, property-based invariant tests, idempotency tests, event replay tests, reconciliation scenario tests, AI classification accuracy tests, tenant isolation security tests, load tests.

---

## 5. Security & Control Gaps

| Gap | Risk | Mitigation |
|---|---|---|
| No financial RLS policies | 🔴 Critical | Org-scoped RLS on all `fin_*` tables |
| No segregation of duties for posting | 🔴 Critical | `workflow_approvals` for material entries |
| `os_events` INSERT open to any authenticated user | 🟠 High | Restrict financial events to `service_role` or signed edge functions |
| No field-level encryption for bank account numbers | 🟠 High | Use `secrets_vault` / pgsodium |
| No audit trail for accounting policy changes | 🟠 High | Trigger-based audit on `fin_accounting_policies` |
| No period-lock enforcement at DB level | 🟠 High | DB trigger on `fin_journal_entries` checks period status |
| No idempotency for incoming payment webhooks | 🟠 High | `fin_events.idempotency_key` unique constraint |
| AI workers could propose without control gate | 🟡 Medium | All AI proposals routed through Policy Engine before posting |
| No prompt injection protection for invoice/contract content fed to AI | 🟡 Medium | Treat all external content as untrusted; sanitize before passing to models |

---

## 6. Architecture Decision Records

### ADR-FIN-001: `fin_` prefix for all financial tables
**Decision:** All new financial tables use the `fin_` prefix.  
**Rationale:** Avoids collision with referenced but non-existent `finance_*` tables. Provides clear namespace.  
**Status:** Accepted.

### ADR-FIN-002: Tenancy root is `sys_organizations`
**Decision:** All `fin_*` tables FK to `sys_organizations.id` as `organization_id`.  
**Rationale:** `sys_organizations` supports multi-entity (legal entity) hierarchy. `public.organizations` is messaging-only.  
**Status:** Accepted.

### ADR-FIN-003: AI proposes → Policy validates → Engine posts
**Decision:** No AI worker may directly insert into `fin_journal_entries`. AI proposals are validated by `org_policies` + accounting engine before posting.  
**Rationale:** Maintains double-entry integrity and segregation of duties.  
**Status:** Accepted.

### ADR-FIN-004: `fin_events` extends `os_events` pattern
**Decision:** Financial source events persist to `fin_events` (finance-scoped, with idempotency keys) and also emit to `os_events` for platform observability.  
**Rationale:** `os_events` is append-only and trigger-enforced — perfect for financial source lineage.  
**Status:** Accepted.

### ADR-FIN-005: Reuse `workflow_approvals` for financial control gates
**Decision:** Material financial operations (post large entries, reopen period, change policy, make payment) create `workflow_approvals` records and pause until approved.  
**Rationale:** HITL approval infrastructure already exists with escalation, SLA, delegation, audit.  
**Status:** Accepted.

### ADR-FIN-006: Ledger balance as refreshed materialized view
**Decision:** Account balances computed via materialized view `fin_ledger_balances`, refreshed after each journal post.  
**Rationale:** Sub-millisecond balance reads without scanning all journal lines at report time.  
**Status:** Accepted.

---

## 7. Implementation Phases

```
Phase 0  ← AUDIT COMPLETE
Phase 1  Financial Foundation
         fin_organizations, fin_legal_entities, fin_accounts, fin_periods
         fin_journal_entries, fin_journal_lines, fin_events
         fin_accounting_policies, fin_account_mappings
         finance-post, finance-validate-entry, finance-idempotency-check
         finance-close-period
         FinanceWorkspace, GeneralLedger, ChartOfAccounts, JournalEntryViewer
         Double-entry unit tests

Phase 2  Event Infrastructure + AR/AP
         fin_customers, fin_vendors, fin_invoices, fin_bills, fin_payments
         Idempotency, source lineage, event replay
         ARModule, APModule
         Idempotency and replay tests

Phase 3  Reconciliation
         fin_bank_accounts, fin_bank_transactions
         fin_reconciliations, fin_reconciliation_matches
         finance-reconcile edge function
         BankReconciliation UI
         Reconciliation scenario tests

Phase 4  Revenue Recognition
         fin_contracts, fin_performance_obligations
         fin_revenue_schedules, fin_deferred_revenue
         finance-revenue-recognize
         RevenueScheduleView
         Revenue tests

Phase 5  Multi-Entity & FX
         fin_legal_entities, fin_fx_rates, fin_intercompany_transactions
         Consolidation views
         Multi-entity consolidation tests

Phase 6  Reporting
         Trial Balance, P&L, Balance Sheet, Cash Flow
         finance-report edge function
         FinancialReports UI with drill-down
         Report reconciliation tests

Phase 7  Advanced Multi-Entity
         Intercompany eliminations, entity-level P&L, currency translation

Phase 8  AI Workers
         Finance Analyst, Reconciliation, AR, AP, Revenue, Close, CFO workers
         AI classification tests, hallucination resistance tests, authorization tests

Phase 9  CHATR Intent Layer
         NL → IntentPlanner → Finance capability
         FinanceNLInterface, trace-to-record answers

Phase 10 Production Hardening
         Security audit, load tests, DR, observability dashboards, runbooks
```

---

## 8. Readiness Matrix

| Area | Current Readiness | Gap Risk |
|---|---|---|
| Database schema | 0% — no `fin_*` tables | 🔴 Critical |
| Event infrastructure | 80% — `os_events` reusable | 🟡 Medium |
| Tenancy / isolation | 70% — `sys_organizations` exists | 🟡 Medium |
| Approval / controls | 85% — `workflow_approvals` reusable | 🟢 Low |
| Policy engine | 80% — `org_policies` reusable | 🟢 Low |
| AI / intent layer | 70% — `IntentPlanner` reusable | 🟡 Medium |
| Frontend | 5% — manifest only, no components | 🔴 Critical |
| Testing | 0% — no financial tests | 🔴 Critical |
| Security / RLS | 0% — no `fin_*` tables | 🔴 Critical |
| Observability | 10% — `os_events` only | 🔴 Critical |
| Connectors | 20% — `connector-hub` exists, no finance connectors | 🟡 Medium |

---

## 9. Open Questions for Review

> [!IMPORTANT]
> **Q1: Accounting Standard** — Default to **IFRS** or **GAAP** or support both simultaneously?

> [!IMPORTANT]
> **Q2: Base Currency** — Primary base currency for first organization? (INR assumed from existing data — confirm.)

> [!IMPORTANT]
> **Q3: Revenue Recognition** — Full **ASC 606 / IFRS 15** in Phase 4, or begin with straight-line + milestone?

> [!IMPORTANT]
> **Q4: Banking Connector** — Which bank data provider for Phase 3 statement import? (Setu / Finbox for India, Plaid for global?)

> [!NOTE]
> **Q5: Multi-entity scope** — Single legal entity for Phase 1, or multi-entity from day one?

> [!NOTE]
> **Q6: Approval threshold** — What amount (in INR or USD) triggers a mandatory human approval before a journal entry posts?

---

*Phase 0 audit complete. Please review and answer the Open Questions above, then approve to begin Phase 1: Financial Foundation.*

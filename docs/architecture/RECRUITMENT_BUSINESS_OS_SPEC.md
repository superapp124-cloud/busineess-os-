# CHATR Platform — Product Architecture Methodology & Specification

**Status**: Standard Architecture Specification  
**Platform**: CHATR Intent Platform v1.0 GA (`v1.0.0-ga`)  
**Product**: CHATR RecruitmentOS  

---

## 1. The 4-Category Composition Model

```
┌──────────────────────────────────────────────────────────────────┐
│                   Workspace Layer (Composition Only)             │
│   CHATR RecruitmentOS · CHATR SalesOS · CHATR HealthOS · LegalOS │
├──────────────────────────────────────────────────────────────────┤
│                       Domain Capabilities                        │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────────────┐ │
│ │ Candidate CRM  │ │ Resume Review  │ │  Interview Scheduler   │ │
│ └────────────────┘ └────────────────┘ └────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                     Foundation Capabilities                      │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │
│ │ Calendar     │ │ Notifications│ │ Approvals    │ │ Search    │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                     Connector Capabilities                       │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │
│ │ LinkedIn     │ │ Google Cal   │ │ Outlook      │ │ SAP / ERP │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                      CHATR Intent Platform                       │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │
│ │ Intent Store │ │   Planner    │ │Control Plane │ │  Kernel   │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Category Responsibilities

| Category | Role | Pure Examples |
| :--- | :--- | :--- |
| **Workspace** | **Composition only**. Provides navigation, layout, planner configuration, and UI tabs. Contains *zero* business rules and *zero* direct external APIs. | `RecruitmentOSWorkspace` |
| **Domain** | **Business Logic**. Implements industry-specific rules, candidate pipelines, resume scoring models, and deal health math. | `recruitment-crm`, `recruitment-screener` |
| **Foundation** | **Platform-Independent Reusable Services**. Core utility primitives shared across multiple workspaces. | `calendar`, `notifications`, `approvals`, `documents`, `audit` |
| **Connector** | **External Adapters**. Connects Intent Platform to 3rd-party services without polluting Foundation logic. | `connector-linkedin`, `connector-google-calendar`, `connector-sap` |

---

## 3. Governance Invariants

### Invariant 1: Platform Freeze
No changes to `@chatr/kernel`, `@chatr/planner`, or Conformance Specification v1 unless composition is mathematically impossible.

### Invariant 2: Thin Workspace Principle
A Workspace may orchestrate capabilities but **may not** implement business rules owned by a capability. Workspaces must never become monolithic applications.

### Invariant 3: Capability Independence
Every capability must satisfy:
- `[x]` **Independently Installable** — Can be added via Intent Store without prerequisites other than declared dependencies.
- `[x]` **Independently Removable** — Can be uninstalled without breaking unrelated capabilities.
- `[x]` **Independently Versioned** — Follows SemVer independently.
- `[x]` **Independently Certified** — Earns `CertificationReport.json` via `chatr certify`.
- `[x]` **Independently Testable** — Passes unit and conformance test suites isolated in sandbox.

---

## 4. Multi-Product Reuse Target (v1.1 Milestone)

```
                       Shared Foundation Capabilities
          ┌──────────────────────────────────────────────────────┐
          │  Calendar  ·  Notifications  ·  Documents  ·  Audit  │
          └──────────────┬────────────────────────┬──────────────┘
                         │                        │
        ┌────────────────┴────────┐      ┌────────┴───────────────┐
        │   CHATR RecruitmentOS   │      │     CHATR SalesOS      │
        │ (Candidate CRM + ATS)   │      │ (Pipeline + Scoring)   │
        └─────────────────────────┘      └────────────────────────┘
```

True platform validation occurs when **RecruitmentOS** and **SalesOS** share the exact same certified `calendar`, `notifications`, `documents`, and `audit` Foundation Capabilities without modifying a single line of platform code.

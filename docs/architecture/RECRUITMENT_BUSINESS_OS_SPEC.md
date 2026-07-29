# CHATR RecruitmentOS — Product Architecture & Composition Specification

**Product Name**: CHATR RecruitmentOS  
**Platform**: Built on CHATR Intent Platform v1.0 GA (`v1.0.0-ga`)  
**Governance Invariant**: Zero platform modifications (`@chatr/kernel`, `@chatr/planner`, Conformance Spec) unless a production requirement exposes an insurmountable limitation.

---

## Architecture: Three Capability Classes

```
┌──────────────────────────────────────────────────────────────────┐
│                   CHATR RecruitmentOS Workspace                  │
│       (Navigation · Capability Composition · Planner Config)      │
├──────────────────────────────────────────────────────────────────┤
│                       Domain Capabilities                        │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────────────┐ │
│ │ Candidate CRM  │ │ Resume Review  │ │    Job Distribution    │ │
│ └────────────────┘ └────────────────┘ └────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                      Foundation Capabilities                     │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │
│ │ Calendar     │ │ Notifications│ │ Approvals    │ │ Search    │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                      CHATR Intent Platform                       │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │
│ │ Intent Store │ │   Planner    │ │Control Plane │ │  Kernel   │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 1. Class Definitions

### Class 1: Foundation Capabilities (Reusable Everywhere)
Capabilities shared across all Business OS products (RecruitmentOS, SalesOS, HealthOS, LegalOS):
- `calendar`: Event scheduling, availability lookup, mutual slot matching
- `notifications`: Multichannel alert dispatch (Email, SMS, Push, In-app)
- `approvals`: Policy-based multi-tier approval chains
- `documents`: Document parsing, PDF generation, e-signatures
- `audit`: Immutable action logging and compliance auditing

### Class 2: Domain Capabilities (Industry Specific)
Capabilities specific to HR & Talent Acquisition:
- `recruitment-crm`: Candidate records, talent pools, stage pipelines
- `recruitment-screener`: AI resume parsing, candidate scoring, skill matching
- `recruitment-jobboard`: Job requisition management, job board connectors
- `recruitment-scheduler`: Interview workflow orchestration using `calendar` + `notifications`

### Class 3: Workspace (Zero Business Logic)
The `RecruitmentOS` application layout itself:
- Provides top-level routing (`/desktop/recruitment`)
- Composes active capabilities dynamically from `user_capability_installs`
- Renders capability navigation tabs
- Intercepts user intent via the **Planner**

---

## 2. Initial Four Product Modules

| Module | Capability Class | Dependencies | Platform Verification |
| :--- | :--- | :--- | :--- |
| **Candidate CRM** | Domain | `documents`, `audit` | Store registry, Supabase persistence, tenant isolation |
| **AI Resume Screener** | Domain | `intelligence`, `documents` | Reasoner provider isolation, confidence safety gate |
| **Job Distribution** | Domain | `notifications` | Connector webhooks, external channel routing |
| **Interview Scheduler** | Domain | `calendar`, `notifications`, `approvals` | Multi-capability DAG execution by Planner |

---

## 3. Success Metric

> **Can CHATR RecruitmentOS be assembled from certified capabilities without modifying the Kernel, Planner, or Control Plane?**

- `[x]` Platform code remains untouched (`@chatr/kernel`, `@chatr/planner`, Conformance Spec).
- `[ ]` All 4 initial modules pass Conformance Spec v1.
- `[ ]` End-to-end user flows execute through Intent Store and Execution Engine.

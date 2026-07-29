# CHATR RecruitmentOS — Flagship Business OS Specification

**Product Name**: CHATR RecruitmentOS  
**Platform**: Built on CHATR Intent Platform v1.0 GA  
**Architecture Model**: Composable Business OS (Zero monolithic business logic; 100% capability-driven)

---

## Strategic Vision

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHATR RecruitmentOS                          │
│     (Unified Business OS Workspace & Orchestration Layer)       │
├─────────────────────────────────────────────────────────────────┤
│                     Certified Capabilities                      │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────┐ │
│ │ Candidate CRM │ │ Resume Screener│ │  Job Board   │ │ Portal│ │
│ └───────────────┘ └───────────────┘ └───────────────┘ └───────┘ │
├─────────────────────────────────────────────────────────────────┤
│                     CHATR Intent Platform                       │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────┐ │
│ │ Intent Store  │ │    Planner    │ │ Control Plane │ │Kernel │ │
│ └───────────────┘ └───────────────┘ └───────────────┘ └───────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Capability Composition Map

The Recruitment Business OS is composed of 8 modular, independently installable capabilities registered in the Intent Store:

| Capability ID | Module Name | Primary Responsibilities |
| :--- | :--- | :--- |
| `recruitment-crm` | **Candidate CRM** | Unified candidate profiles, interaction history, talent pool segmentation, tag management |
| `recruitment-screener` | **AI Resume Review** | Parser, automated match scoring, skill gap detection, qualification summaries |
| `recruitment-jobboard` | **Job Distribution** | Requisition management, multi-board posting (LinkedIn, GitHub, Indeed), applicant intake |
| `recruitment-scheduler` | **Interview Scheduler** | Calendar availability matching, automated slot selection, interviewer panel dispatch |
| `recruitment-onboarding` | **Offer & Onboarding** | CTC calculator, offer letter generator, e-signature dispatch, document collection |
| `recruitment-vendor` | **Vendor Management** | Staffing agency portal, candidate submission tracking, placement fee calculation |
| `recruitment-client-portal` | **Hiring Manager Portal** | Read-only candidate review, feedback submitter, interview scorecards |
| `recruitment-analytics` | **Analytics & BI** | Time-to-hire, funnel conversion rates, source attribution, interviewer rating metrics |

---

## 2. Platform Contract Mapping

Every module interacts exclusively through frozen platform contracts:

1. **Intent Registration**: Each module declares intent schemas in its `CapabilityManifest`.
2. **Planner Orchestration**: Multi-module flows (e.g. `Candidate Applied → Run AI Screener → Schedule Interview → Notify Hiring Manager`) are decomposed into an `ExecutionPlan` by the Planner.
3. **Governance & Safety**: High-impact actions (e.g. `Generate Offer Letter`, `Publish Job Requisition`) run through `SafetyValidator` with `requiresHumanReview = true`.
4. **Tenant Isolation**: All candidate data is scoped by `tenantId` in `user_capability_installs` and domain tables.
5. **Observability**: Execution events emit standard `capability.executed` events to `os_events`.

---

## 3. Product Roadmap

### Phase 1: Core ATS Pipeline
- Candidate CRM (`recruitment-crm`)
- AI Resume Review (`recruitment-screener`)
- Job Distribution (`recruitment-jobboard`)

### Phase 2: Engagement & Offers
- Interview Scheduler (`recruitment-scheduler`)
- Offer & Onboarding (`recruitment-onboarding`)
- Hiring Manager Portal (`recruitment-client-portal`)

### Phase 3: Enterprise Operations
- Vendor Management (`recruitment-vendor`)
- Analytics & BI (`recruitment-analytics`)

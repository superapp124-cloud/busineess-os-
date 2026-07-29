# CHATR Architecture Methodology v1.0

**Specification Version**: 1.0  
**Status**: Frozen  
**Platform Compatibility**: CHATR Intent Platform v1.x (`v1.0.0-ga`)  
**Enacted**: 2026-07-29  

---

## 1. The 6-Layer Architecture Stack

```
┌──────────────────────────────────────────────────────────────────┐
│                   Layer 6: Workspace (Composition Only)          │
│   CHATR RecruitmentOS · CHATR SalesOS · CHATR HealthOS · LegalOS │
├──────────────────────────────────────────────────────────────────┤
│                   Layer 5: Domain Capabilities                   │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────────────┐ │
│ │ Candidate CRM  │ │ Resume Review  │ │  Interview Scheduler   │ │
│ └────────────────┘ └────────────────┘ └────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                 Layer 4: Foundation Capabilities                 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │
│ │ Calendar     │ │ Notifications│ │ Approvals    │ │ Search    │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                 Layer 3: Connector Capabilities                  │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │
│ │ LinkedIn     │ │ Google Cal   │ │ Outlook      │ │ SAP / ERP │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                 Layer 2: Execution Providers                     │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │
│ │ Gemini / LLM │ │ Browser Auto │ │ REST Exec    │ │ MCP Exec  │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                 Layer 1: CHATR Intent Platform                   │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │
│ │ Intent Store │ │   Planner    │ │Control Plane │ │  Kernel   │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Layered Dependency Rules

Strict downward dependency enforcement. Upward or skipping dependencies are prohibited by automated linting:

| Layer | Allowed Dependencies | Prohibited Dependencies |
| :--- | :--- | :--- |
| **Layer 6: Workspace** | Domain, Foundation | Direct Connectors, Direct Platform, Direct Providers |
| **Layer 5: Domain** | Foundation, Connector | Workspace, Sibling Domains |
| **Layer 4: Foundation** | Connector | Domain, Workspace, Sibling Foundations |
| **Layer 3: Connector** | Execution Provider, Platform | Foundation, Domain, Workspace |
| **Layer 2: Execution Provider** | Platform | Anything above Layer 1 |
| **Layer 1: Intent Platform** | **Nothing above** | All upper layers |

---

## 3. Mandatory Governance Invariants

### Invariant A: Platform Freeze
No changes may be made to `@chatr/kernel`, `@chatr/planner`, or the Conformance Specification v1 unless composition is mathematically impossible.

### Invariant B: Thin Workspace Principle
A Workspace provides navigation, layout, and Planner context, but **may not implement business rules** already owned by a capability.

### Invariant C: No Lateral Dependencies
Capabilities **must never** import or directly call sibling capabilities. Inter-capability communication occurs strictly via:
```
Capability A ──► Intent ──► Planner ──► ExecutionPlan ──► Event Mesh ──► Capability B
```

### Invariant D: Capability Independence
Every capability must be independently:
1. `Installable`
2. `Removable`
3. `Versioned` (SemVer)
4. `Certified` (`chatr certify`)
5. `Testable` in sandbox

---

## 4. Capability Maturity Classification

Every package published to the Intent Store carries a formal Maturity Level badge:

| Level | Meaning | Requirements |
| :--- | :--- | :--- |
| `Experimental` | Internal sandbox only | Compiles cleanly |
| `Beta` | Limited production testing | Conformance rules 1–3 pass |
| `Certified` | Certified for marketplace | All 5 Conformance rules pass; `CertificationReport.json` |
| `Enterprise` | Production enterprise SLA | Conformance passed + Security Audit + Data Residency Guarantee |
| `Core` | Maintained directly by CHATR | Full monorepo certification and platform integration |

---

## 5. Platform Success Metrics

The health of the platform architecture is evaluated using four empirical metrics:

$$\text{Reuse Ratio} = \frac{\text{Workspace LOC}}{\text{Capability LOC}} \quad (\text{Target: } < 0.15)$$

1. **Workspace Reuse Ratio**: Ratio of Workspace UI code to Capability logic code. Target: `< 0.15` (workspaces stay thin).
2. **Average Foundation Reuse**: Number of products reusing each Foundation Capability. Target: `> 3`.
3. **Platform Zero-Modification Rate**: Percentage of products deployed with zero changes to `@chatr/kernel` or `@chatr/planner`. Target: `100%`.
4. **Independent Removal Score**: Percentage of capabilities that can be removed without breaking unrelated modules. Target: `100%`.

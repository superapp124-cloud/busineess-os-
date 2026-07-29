# ADR Index — CHATR Intent OS

This document is the authoritative index of all Architecture Decision Records (ADRs) for the CHATR Intent OS platform. Every significant architectural decision made during platform construction is recorded here.

> **Policy**: All changes to frozen interfaces (Kernel, Planner contract, Package Identity, Archive Format, Signature Algorithm) require a new ADR and a Major RFC.

---

| ADR | Title | Status | Phase |
| :--- | :--- | :--- | :--- |
| ADR-001 | Kernel Boundary — Kernel never discovers APIs or calls external services | **Accepted** | 1 |
| ADR-002 | SDK as Developer Experience Layer — SDK must not duplicate Kernel execution logic | **Accepted** | 2 |
| ADR-003 | CLI as Workflow Orchestrator — CLI depends on SDK, not on Kernel directly | **Accepted** | 3 |
| ADR-004 | Intent Store as Distribution Authority — Intent Store is authoritative for distribution, never for execution | **Accepted** | 5 |
| ADR-005 | Package Identity Tuple — Namespace required for global collision resistance | **Accepted** | 5 |
| ADR-006 | Signing is Publisher Responsibility — Intent Store verifies, never signs | **Accepted** | 5 |
| ADR-007 | Trust Engine Composition — Evidence (immutable facts) evaluated by Policy (configurable rules) | **Accepted** | 5 |
| ADR-008 | Control Plane Naming — `enterprise-control-plane` → `control-plane` (not a runtime) | **Accepted** | 6 |
| ADR-009 | RBAC over ACL — ACLs do not scale; Role → Permission → Resource → Action model adopted | **Accepted** | 6 |
| ADR-010 | Observability API over Dashboard — Control Plane exposes a query API; dashboards are consumers | **Accepted** | 6 |
| ADR-011 | AI remains optional — Intelligence services consumed via injected interfaces, never embedded | **Accepted** | 7 |
| ADR-012 | Planner Contract Frozen — `plan()`, `validate()`, `explain()`, `estimate()` interfaces are stable | **Accepted** | 7 |
| ADR-013 | Intelligence Package Isolation — `@chatr/intelligence` must never import from `@chatr/planner` or `ExecutionPlan` | **Accepted** | 7 |
| ADR-014 | ReasoningRouter — Policy decides provider selection; Planner never selects a provider directly | **Accepted** | 7 |
| ADR-015 | Platform Readiness over Feature Velocity — Phase 8 adds no new packages; proves the platform | **Accepted** | 8 |

---

## ADR Template

When adding a new ADR, follow this format:

```markdown
## ADR-NNN: [Title]

**Status**: Proposed | Accepted | Deprecated | Superseded

**Context**: What problem or decision needed to be made?

**Decision**: What was decided?

**Consequences**: What are the positive and negative consequences?

**Supersedes / Superseded by**: (optional)
```

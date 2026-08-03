# ADR-0002: Kernel Freeze, Governance Process & Performance Budgets

## Status
Accepted (Frozen)

## Context
Following the stabilization of CHATR 2.0's 4-Layer Architecture and Universal Business Object Model, the primary risk facing the system shifted from architectural design to scope creep. To guarantee long-term stability and allow scaling from 9 Configuration Packs to thousands without UI or kernel rewrites, the kernel contracts must be formally frozen and governed.

## Decision
We declare the CHATR 2.0 Kernel architecture **FROZEN**. 

All future contributions must be categorized into one of three buckets:
1. **Kernel (Immutable Contracts):** `Experience Layer (BusinessOS.tsx)`, `Intent Layer`, `Execution Layer`, `Foundation Layer`, `Universal Objects`, `Scheduler States`, `Event Bus`, `Capability Registry ABI`. Requires an ADR review to modify.
2. **Platform Extensions (Pluggable):** Models, OCR, Search, Email, Voice, Connectors, Skills, Adapters, Dashboards.
3. **Configuration Packs (Declarative):** Pure JSON/TS schemas, vocabulary, policies, default skills, and compliance rules.

### Performance Budgets Established
- **`BusinessOS` initial render:** < 1 second
- **Command bar acknowledgement:** < 100 ms
- **Planner response:** < 500 ms
- **Capability dispatch:** < 50 ms
- **Event propagation:** < 100 ms
- **Scheduler queue insertion:** < 20 ms

### Capability Maturity Levels
- **L0 (Experimental):** Internal testing only
- **L1 (Beta):** Functional but evolving
- **L2 (Stable):** Production-ready
- **L3 (Enterprise):** SLA-backed, fully observable & documented

## Consequences
- **Positive:** UI logic and kernel engines remain completely decoupled from industry specifics. Onboarding a new industry requires 0 code changes in `BusinessOS.tsx` or kernel engines.
- **Negative:** Kernel contract modifications require a formal ADR review and semantic version bump.

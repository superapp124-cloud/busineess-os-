# Governance Policy: Platform Freeze Invariant

**Status**: Active Invariant  
**Enacted**: 2026-07-29  
**Applies To**: `@chatr/kernel`, `@chatr/planner`, `Conformance Specification v1`

---

## The Rule

> **No changes may be made to `@chatr/kernel`, `@chatr/planner`, or the Conformance Specification unless a production product requirement (e.g. from CHATR RecruitmentOS) exposes a genuine limitation that cannot be addressed through capability composition.**

---

## Evaluation Process for Platform RFCs

Before any pull request modifying the frozen packages is opened, the author must answer:

1. **Can this requirement be fulfilled by creating a new Foundation or Domain Capability?**
   - If *Yes*: Implement as a capability. Do not touch the platform.
2. **Can this requirement be fulfilled by configuring the Planner or ContextAssembler?**
   - If *Yes*: Implement via context assembly. Do not touch the contract.
3. **Can this requirement be fulfilled by a Control Plane policy or RBAC rule?**
   - If *Yes*: Implement in Control Plane.

Only if the answer to **all three** is *No* may a Major RFC be submitted to unfreeze the platform interface.

---

## Frozen Core Inventory

| Package | Status | Frozen Symbols |
| :--- | :--- | :--- |
| `@chatr/kernel` | **Frozen** | `Kernel`, `CapabilityManifest`, `ExecutionResult`, `OsEvent` |
| `@chatr/planner` | **Frozen** | `Planner` (`plan`, `validate`, `explain`, `estimate`), `ExecutionPlan`, `PlanningContext` |
| Conformance Spec | **Frozen** | `ContractRule`, `ExecutionRule`, `PolicyRule`, `EventRule`, `CompatibilityRule` |

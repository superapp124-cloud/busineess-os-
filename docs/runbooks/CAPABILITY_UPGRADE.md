# Runbook: Capability Upgrade (v1.0 → v2.0 Breaking)

**Scope**: Safely upgrading a capability with breaking schema changes.

---

## Pre-Upgrade

1. Confirm the new version is `CERTIFIED` via `chatr certify`.
2. Check that `CompatibilityService.checkCompatibility()` rejects the v2 package in environments still running v1-dependent capabilities.
3. Identify all capabilities that depend on the capability being upgraded.

## Upgrade Procedure

1. Publish the v2 capability to the Intent Store — both v1 and v2 coexist as separate immutable entries.
2. Use `DependencyPlanner.resolvePlan()` for the target environment with the v2 package. The resulting `InstallPlan` will include `conflicts` if any coexisting capability requires v1.
3. Review `InstallPlan.conflicts` and `InstallPlan.warnings`.
4. If conflicts exist, coordinate with dependent capability publishers before proceeding.
5. Submit the plan through `ApprovalOrchestrator` — breaking upgrades require explicit human approval.
6. `PromotionEngine.promote()` with `strategy: blue-green` to allow instant rollback.

## Rollback

- v1 archive remains immutable in the registry.
- `RollbackManager.rollback(environment, v1DeploymentId)` restores the previous state.

## Verifying Compatibility Service Enforcement

The `CompatibilityService` must reject installation of incompatible versions:
```
chatr test --conformance  # CompatibilityRule must pass
```

# Runbook: Kernel Upgrade (v1.0 → v1.1)

**Scope**: Upgrading the `@chatr/kernel` package while preserving backward compatibility.

**Prerequisites**: Kernel v1.1 release candidate has passed its own conformance and security certification.

---

## Pre-Upgrade

1. **Review the Compatibility Matrix** (`docs/architecture/COMPATIBILITY_MATRIX.md`) to confirm Kernel 1.1 is listed as compatible with the current SDK and CLI.
2. Run `chatr doctor` across all registered capabilities to identify any that declare `maximumTestedKernel < 1.1`.
3. Notify affected publishers. They should test and update `maximumTestedKernel` before the rollout.

## Upgrade Procedure

1. Update `@chatr/kernel` version in the monorepo root.
2. Run `tsc --noEmit --workspaces` — all packages must compile cleanly.
3. Run `chatr certify --platform` — the full 8-stage pipeline must pass.
4. Deploy to `Dev` environment first using `PromotionEngine` with `strategy: rolling`.
5. Run `HealthMonitor.check('dev')` — status must be `HEALTHY`.
6. Promote to `Staging`. Repeat health check.
7. Promote to `Production`. Record the deployment in `DeploymentHistory`.

## Rollback

If any environment shows `DEGRADED` or `CRITICAL`:
1. `RollbackManager.rollback(environment, previousDeploymentId)`
2. `HealthMonitor.check(environment)` — confirm restoration
3. `ComplianceAuditor.record(...)` — log the incident and rollback decision
4. Raise an incident in `IncidentManager`

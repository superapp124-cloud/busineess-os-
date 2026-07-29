# Migration Guide

This guide provides instructions for migrating between major versions of CHATR Intent OS components.

---

## Migrating Capabilities: v1.x → v2.x (Breaking)

> [!WARNING]
> A `v2.0` capability is not automatically compatible with the `v1.0` runtime. The `CompatibilityService` will block installation unless the target kernel meets `minimumKernelVersion`.

**Steps:**
1. Update the version in your manifest: `.version(2, 0, 0)`
2. Update `minimumKernelVersion` if the capability requires new Kernel features
3. Document all breaking action schema changes in your `CONFORMANCE.md`
4. Run `chatr certify` — the `Compatibility Matrix Check` stage will validate the new bounds
5. Publish the new version. The Intent Store treats `v1.0.0` and `v2.0.0` as separate, immutable entries — both coexist in the registry
6. Notify consumers via your capability's changelog

**Rollback**: If a `v2.0.0` upgrade fails, the `RollbackManager` in the Control Plane restores the previous deployment record automatically.

---

## Migrating SDK: v1.x → v2.x

1. Review the CHATR RFC for the SDK v2 specification
2. Run `chatr doctor` — it reports any compatibility warnings
3. Update `@chatr/sdk` in your `package.json`
4. Re-run `chatr certify` — conformance rules will catch any new violations

---

## Rotating Publisher Signing Keys

1. Request a new certificate via `PublisherIdentityService.issueCertificate()`
2. Update your `.chatr/publisher.json` with the new `activeKeyId`
3. All new packages signed with the new key will be accepted immediately
4. Packages signed with the revoked key remain valid (historical metadata is immutable)
5. Revoke the old certificate via `CertificateLifecycle.revokeCertificate()`

---

## Disaster Recovery

1. Identify the most recent healthy snapshot from `BackupManager.listSnapshots()`
2. Confirm the snapshot environment and timestamp
3. Call `RestoreService.restore(snapshotId, targetEnvironment)`
4. `HealthMonitor.check()` will confirm restored state
5. Record the recovery event in `ComplianceAuditor`

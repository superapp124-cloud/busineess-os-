# Runbook: Disaster Recovery

**Scope**: Restoring a tenant environment from a known-good snapshot after a catastrophic failure.

---

## Prerequisites

- Regular snapshots must be created via `BackupManager.createSnapshot()` on a schedule (managed by `Scheduler`).
- Maintenance windows must be configured via `MaintenanceWindowManager` before recovery operations.

---

## Recovery Procedure

### 1. Declare an Incident
```ts
const incident = await incidentManager.raise(environment, 'CRITICAL', 'Catastrophic state corruption');
```

### 2. Block New Deployments
Schedule a maintenance window to prevent new deployments during recovery:
```ts
await maintenanceWindowManager.schedule({
  environment, reason: 'Disaster Recovery in progress',
  from: new Date().toISOString(), to: new Date(Date.now() + 3_600_000).toISOString()
});
```

### 3. Identify the Recovery Snapshot
```ts
const snapshots = await backupManager.listSnapshots(tenantId);
// Select the most recent snapshot before the failure timestamp
const target = snapshots.find(s => s.createdAt < incidentTimestamp);
```

### 4. Restore
```ts
await restoreService.restore(target.id, environment);
```

### 5. Verify Health
```ts
const health = await healthMonitor.check(environment);
// Must return 'HEALTHY'
```

### 6. Close Incident & Audit
```ts
await incidentManager.resolve(incident.id);
await complianceAuditor.record({
  action: 'DISASTER_RECOVERY', actor: 'platform-ops',
  result: health, policyVersion: activePolicy.version,
  timestamp: new Date().toISOString()
});
```

### 7. Post-Recovery
- Run `chatr certify --platform` to confirm the restored environment passes all certification stages.
- Conduct a post-incident review within 48 hours.

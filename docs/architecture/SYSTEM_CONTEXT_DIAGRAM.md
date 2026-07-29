# CHATR Intent OS — System Context Diagram

This document captures every bounded context, its responsibility, and all dependency directions. It is the definitive reference for understanding how the platform fits together.

> **Rule**: Dependency arrows point **downward only**. No layer may depend on a layer above it.

---

## Platform Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        DEVELOPER                                │
│         (Authors Capabilities, Connectors, Agents)             │
└───────────────────┬────────────────────────────────────────────┘
                    │ uses
          ┌─────────▼──────────┐
          │   @chatr/cli        │  Scaffold, Lint, Validate,
          │   Developer Tooling │  Test, Inspect, Docs, Publish
          └─────────┬──────────┘
                    │ uses
          ┌─────────▼──────────┐
          │   @chatr/sdk        │  Builders, Validators,
          │   Developer SDK     │  ConformanceTester, TestHarness
          └─────────┬──────────┘
                    │ uses
┌───────────────────▼─────────────────────────────────────────────┐
│                    @chatr/kernel  [FROZEN v1.0]                 │
│   CapabilityManifest · ConnectorManifest · Intent · Agent       │
│   ExecutionContext · Policy · Events · Types · Workflow         │
└────┬────────────────────────────────────────────────────────────┘
     │ provides contracts to
     │
┌────▼──────────────────────────────────────────────────────────┐
│              @chatr/publisher  (Identity & Authoring)          │
│   PublisherIdentityService · SigningTool                       │
│   Certificate · Key Rotation · Revocation                      │
└────┬───────────────────────────────────────────────────────────┘
     │ publishes verified, signed archives to
     │
┌────▼──────────────────────────────────────────────────────────┐
│              @chatr/intent-store  (Distribution)               │
│   PackageRegistry · SignatureVerifier · TrustEngine            │
│   CompatibilityService · DependencyPlanner · DiscoveryService  │
└────┬───────────────────────────────────────────────────────────┘
     │ produces InstallPlan consumed by
     │
┌────▼──────────────────────────────────────────────────────────┐
│              @chatr/deployment  (Runtime Execution)            │
│   Installer · Upgrader · Rollback                              │
└────┬───────────────────────────────────────────────────────────┘
     │ execution state and events fed into
     │
┌────▼──────────────────────────────────────────────────────────┐
│         @chatr/control-plane  (Enterprise Operations)          │
│                                                                │
│  Organisation   Security       Governance        Observability │
│  ────────────   ────────       ──────────        ────────────  │
│  Organisation   RbacService    PolicyAdmin       Telemetry     │
│  Tenant         SecretStore    ComplianceAudit   MetricsStore  │
│  Team           CertLifecycle  ApprovalOrch      TraceStore    │
│  Membership                    AuditReplay       ObsApi        │
│  IdentityProv                  PolicyVersion                   │
│  RoleManager                                                   │
│                                                                │
│  DeploymentOps  Health         Licensing         Configuration │
│  ────────────   ──────         ─────────         ─────────     │
│  EnvManager     HealthMonitor  LicensePlan       ConfigService │
│  PromotionEng   IncidentMgr    Entitlements      FeatureFlags  │
│  DeployHistory  AlertManager   UsageTracker      Overrides     │
│  RollbackMgr    RecovAdvisor   BillingHook                     │
│  DeployStrategy                                                │
│                                                                │
│  Scheduling     ResourceMgmt   DisasterRecovery  (Placeholder) │
│  ────────────   ────────────   ────────────────               │
│  Scheduler      ResourceMgr    BackupManager                   │
│  MaintWindow    QuotaService   SnapshotService                 │
│  ExecPolicy     RateLimiter    RestoreService                  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
     │ all execution remains in
     ▼
┌────────────────────────────────────────────────────────────────┐
│             KERNEL RUNTIME  (Execution Boundary)               │
│    Intent Engine · Execution Engine · Policy Engine            │
│    Event Mesh · Capability Host · Memory                       │
└────────────────────────────────────────────────────────────────┘
     │ executes registered
     ▼
┌────────────────────────────────────────────────────────────────┐
│         @chatr/reference-ecosystem  (Capabilities)             │
│  Foundation · Business · Integration · AI · Enterprise         │
└────────────────────────────────────────────────────────────────┘
```

---

## Invariant Dependency Rules

| Layer | May Depend On | Must NEVER Depend On |
| :--- | :--- | :--- |
| Kernel | Nothing | SDK, CLI, Intent Store, Control Plane |
| SDK | Kernel | Intent Store, Control Plane |
| CLI | SDK, Kernel | Intent Store, Control Plane |
| Publisher | Kernel | SDK, CLI, Control Plane |
| Intent Store | Kernel, Publisher | CLI, SDK, Control Plane |
| Deployment | Kernel, Intent Store | CLI, SDK, Control Plane |
| Control Plane | Kernel, Intent Store, Deployment | SDK, CLI |
| Capabilities | SDK, Kernel | Control Plane, Intent Store directly |

---

## Communication Patterns

| From | To | Mechanism |
| :--- | :--- | :--- |
| Control Plane → Deployment | InstallPlan dispatch | Direct contract call |
| Deployment → Kernel | Mount/activate event | Event Mesh |
| Capability → Kernel | AuditEvent / MetricEvent | Event Mesh |
| Kernel → Control Plane | TelemetryEvent stream | Event Mesh subscription |
| Publisher → Intent Store | Signed archive upload | API boundary |
| Intent Store → Control Plane | PackagePublished event | Event Mesh |

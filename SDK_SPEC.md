# Developer SDK Specification (`SDK_SPEC.md`)

> **Status**: `ENGINEERING SPECIFICATION`  
> **Target Version**: `CHATR SDK 1.0.0-rc1`  
> **Constitutional Enforcer**: `Zero Kernel Modifications Required (KIR = ∞)`

---

## 1. Objective

Enable external third-party engineers to create, test, and deploy complete vertical operational solutions (*Airport OS, Healthcare OS, Manufacturing OS, Defense OS*) in **$<1\text{ day}$** without editing kernel source files.

---

## 2. API Surface

```typescript
export interface CHATRSDK {
  // Primitives Creation
  createNode(config: NodeConfig): NodeHandle;
  createCapability(config: CapabilityConfig): CapabilityHandle;
  createConstraint(config: ConstraintConfig): ConstraintHandle;
  
  // Mission Orchestration
  createMission(config: MissionGraphConfig): MissionHandle;
  
  // Composition Packaging
  createComposition(config: CompositionPackageConfig): DeploymentHandle;
}
```

---

## 3. Verification & Certification Protocol

- **Airport Operations Benchmark**: An external developer receives only `CHATR Developer SDK` and `SDK_SPEC.md`. They must configure flight scheduling, gate allocation, and passenger security guardrails without modifying `CHATRConstitutionalKernel.ts`.
- **Target Cold-Start Time**: Empty repository to live deployed application in **$<5\text{ minutes}$**.

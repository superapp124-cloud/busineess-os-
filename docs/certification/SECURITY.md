# CHATR Intent OS — Security Certification Policy

This document defines the authoritative security policies for the CHATR Intent OS platform. It covers three threat domains: Supply Chain, Runtime, and AI Safety.

> All policies in this document are Platform Invariants. Violations require immediate remediation and a security RFC.

---

## 1. Supply Chain Security

### 1.1 Package Signing
Every published archive **must** carry a cryptographic signature before entering the Intent Store registry.

| Property | Requirement |
| :--- | :--- |
| Signature algorithm | `Ed25519` |
| Signed content | SHA-256 digest of the canonical `.tar` archive only |
| Key source | Publisher's active certificate (issued by `PublisherIdentityService`) |
| Verification | `SignatureVerifier.verifySignature()` must return `true` before `PackageRepository.save()` is called |

**FAIL condition**: Archive enters the registry without a verified signature → immediate rejection.

### 1.2 Archive Integrity
- Archives are content-addressed by their SHA-256 digest.
- The digest is stored immutably in `ImmutablePackageMetadata`.
- Any archive that produces a different digest on re-download **must** be quarantined and the publisher notified.

### 1.3 Software Bill of Materials (SBOM)
Every published package **must** include an SBOM as a JSON file at the archive root (`sbom.json`).

**Required SBOM fields:**
```json
{
  "schema": "chatr-sbom-v1",
  "capability": "@chatr/calendar@1.0.0",
  "kernelVersion": "1.0.0",
  "sdkVersion": "1.0.0",
  "cliVersion": "1.0.0",
  "conformanceVersion": "1.0.0",
  "dependencies": [],
  "digest": "sha256:...",
  "generatedAt": "ISO-8601"
}
```

### 1.4 Provenance Attestation
Every published package **should** include a provenance attestation (`provenance.json`):
```json
{
  "schema": "chatr-provenance-v1",
  "builder": "chatr-cli@1.0.0",
  "buildTimestamp": "ISO-8601",
  "sourceCommit": "git-sha",
  "pipelineId": "optional"
}
```

---

## 2. Runtime Security

### 2.1 Tenant Isolation
- **Invariant**: A capability executing in Tenant A **must never** access resources belonging to Tenant B.
- `ConfigurationService`, `EnterpriseSecretStore`, `DeploymentHistory`, and `ComplianceAuditor` all accept `tenantId` as their first parameter and must scope all reads/writes to it.
- **Test gate**: `SecurityValidation.test.ts` — Tenant Isolation scenario.

### 2.2 RBAC Escalation Prevention
- A user without the `Deploy` permission for a target environment **must not** be able to call `PromotionEngine.promote()`.
- `RbacService.can(userId, 'promote', environment)` must be invoked before every promotion. Failure throws before any state is mutated.
- **Test gate**: `SecurityValidation.test.ts` — RBAC Escalation scenario.

### 2.3 Policy Bypass Prevention
- A plan that fails `SafetyValidator` **must never** reach the Kernel Execution Engine.
- The `SafetyValidationResult.safe === false` condition must result in the planner returning a structured rejection — not a thrown exception.
- **Test gate**: `SecurityValidation.test.ts` — Policy Bypass scenario.

### 2.4 Secret Leakage Prevention
- Secrets retrieved from `EnterpriseSecretStore` **must never** appear in logs, telemetry events, or audit records.
- `StructuredLogger` must redact any value whose key contains `secret`, `key`, `token`, or `password`.

---

## 3. AI Safety

### 3.1 Confidence Threshold Enforcement
- Any `ExecutionPlan` with `confidence.overall < policy.minimumConfidence` **must** have `requiresHumanReview = true`.
- The `SafetyValidator` enforces this. A plan that fails the threshold **must not** be handed to the Kernel without explicit human approval.
- **Test gate**: `SecurityValidation.test.ts` — AI Safety scenario.

### 3.2 Prompt Injection Resilience
- `ReasoningProvider` implementations must treat all user-provided intent strings as untrusted input.
- System context (org policy, RBAC, licensing) must be injected by `ContextAssembler`, never concatenated from user input.

### 3.3 Capability Hallucination Prevention
- `CapabilityMatcher` must only return capabilities that exist in the verified Intent Store registry.
- A capability named in a `ReasoningProvider` decomposition output that does not exist in the registry **must** produce an `UnsatisfiedCapability` result, not a runtime error.

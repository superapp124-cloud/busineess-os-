# CHATR Platform Compatibility Matrix

This document defines the authoritative compatibility contracts across all CHATR Intent OS subsystems. It serves as the single source of truth for support windows, version compatibility, and ecosystem interoperability.

## Component Compatibility

| Component | Version | Compatible With | Status |
| :--- | :--- | :--- | :--- |
| **Kernel** | `1.0.x` | SDK `1.x`, CLI `1.x` | **Stable** |
| **SDK** | `1.x` | Kernel `≥1.0` | **Stable** |
| **CLI** | `1.x` | SDK `1.x` | **Stable** |
| **Intent Store** | `Archive v1` | `Publisher v1` | **Stable** |
| **Capabilities** | `Manifest v1` | Kernel `≥1.0` | **Stable** |

## Protocol & Format Versions

To prevent breaking changes in the distribution layer, the following underlying schemas are versioned independently:

| Protocol / Format | Current Version | Description |
| :--- | :--- | :--- |
| **Capability Manifest** | `v1` | Strict JSON Schema defining actions, schemas, and identity. |
| **Archive Format** | `v1` | Uncompressed tarball (`.tar`) containing exactly `manifest.json` at root. |
| **Signature Algorithm** | `v1` | `Ed25519` detached signature over the SHA-256 digest of the archive. |
| **Conformance Specification**| `v1` | Five base rules (Contract, Execution, Policy, Events, Compatibility). |

> [!WARNING]
> Changing the **Package Identity tuple**, the **Archive Format**, or the **Signature Algorithm** is considered a foundational breaking change and requires a **Major RFC**.

## Capability Authoring Contract
When authoring a Capability, developers must declare their compatibility bounds inside their `manifest.ts`:
- `minimumKernelVersion`: The lowest kernel version the capability requires to execute safely.
- `maximumTestedKernel`: The highest kernel version the publisher has explicitly verified.

The Intent Store's `DependencyPlanner` uses these fields to strictly enforce that the runtime environment is safe before mounting the package.

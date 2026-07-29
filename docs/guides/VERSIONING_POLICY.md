# Versioning Policy

This document defines the authoritative versioning policy for all components of the CHATR Intent OS platform.

---

## Version Format

All packages follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

| Increment | Trigger |
| :--- | :--- |
| `MAJOR` | Breaking change to a public frozen interface |
| `MINOR` | New backwards-compatible features or interfaces |
| `PATCH` | Bug fixes, documentation updates, non-breaking improvements |

---

## What Constitutes a Breaking Change

> [!CAUTION]
> The following changes are **always** breaking and require a MAJOR version bump AND a Major RFC:

- Removing or renaming a field in `PackageIdentity`
- Changing the `Archive Format` (currently `v1`)
- Changing the `Signature Algorithm` (currently `Ed25519`)
- Removing or renaming a method on frozen interfaces: `Kernel`, `Planner` (`plan/validate/explain/estimate`)
- Narrowing the accepted schema of `CapabilityManifest`
- Changing `Conformance Specification` rules in a way that would fail existing certified packages

The following are **never** breaking:
- Adding new optional fields to a manifest
- Adding new event types
- Adding new builder helpers in the SDK
- Adding new CLI commands
- Adding new capabilities to the reference ecosystem

---

## Compatibility Windows

| Component | Support Window |
| :--- | :--- |
| Kernel `1.x` | Minimum 24 months from release |
| SDK `1.x` | Minimum 18 months |
| CLI `1.x` | Minimum 18 months |
| Capability Manifest `v1` | Indefinite (frozen) |
| Archive Format `v1` | Indefinite (frozen) |

---

## Frozen Interfaces

These interfaces are frozen at v1.0. Any modification requires a Major RFC:

- `Kernel` contracts (all types in `@chatr/kernel`)
- `Planner` interface (`plan`, `validate`, `explain`, `estimate`)
- `PackageIdentity` tuple
- `ExecutionPlan` shape
- `PlanningContext` shape
- `Conformance Specification v1`
- `Archive Format v1`
- `Signature Algorithm v1`

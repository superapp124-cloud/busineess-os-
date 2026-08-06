# ADR 0001: Universal Level 0 Substrate Primitives

> **Status**: `ACCEPTED`  
> **Date**: `2026-08-06`  
> **Directory**: `/adr/0001-kernel-primitives.md`

---

## 1. Context

Legacy enterprise software duplicates schemas across CRM, ERP, HCM, and EHR applications. We needed a unified substrate where all domain entities share structural identity.

---

## 2. Decision

We froze 11 timeless Level 0 primitives: `Node`, `Edge`, `Event`, `State`, `Capability`, `Commitment`, `Constraint`, `Policy`, `Memory`, `Agent`, and `Receipt`.

---

## 3. Consequences & Tradeoffs

- **Consequences**: Zero database record duplication; single identity life story across domains.
- **Tradeoffs**: Requires a `MetadataCompiler` to validate domain schemas before runtime execution.

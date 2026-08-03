# ADR-000: CHATR Constitution

## Status

Proposed for ratification. Once accepted, this is the governing ADR. A change that conflicts with it requires an explicit superseding ADR approved before implementation.

## Purpose

CHATR Enterprise Runtime (CER) is an event-driven platform that maintains an authoritative model of enterprise state. Product experiences such as Work OS, Talent OS, Legal OS, Finance OS, communications, and desktop are clients of CER; they are not independent sources of truth.

## Constitutional decisions

1. **One authority.** CER is the only enterprise runtime. Electron is a host process; React is a presentation client; Supabase, SQLite, IndexedDB, and external APIs are adapters.
2. **One canonical domain model.** The Enterprise Object Model is the only durable semantic model of the platform. Views, projections, APIs, storage schemas, search indexes, graph representations, and UI models are derived from it and may not introduce competing semantics. Domain names such as workspace item, entity, living object, or business object are views, aliases, or migration-era adapters—not new primitives.
3. **One Digital Twin.** The Enterprise Digital Twin is the product-level, authoritative representation over which CER reasons. It includes Enterprise State, the enterprise graph, operational state, Knowledge Fabric, relationships, missions, resources, policies, risks, and observations. Enterprise State is an event-derived implementation of the Twin; UI state is ephemeral and cannot be an enterprise source of truth.
4. **One event contract.** Cross-runtime effects use canonical, versioned events with tenant, actor, correlation, causation, schema version, and idempotency metadata. Local emitters may exist only behind the CER event gateway.
5. **Mission first.** A mission owns its context, artifacts, decisions, execution plan, and outcomes. A workspace renders a mission or object projection; an uploaded artifact may initiate or enrich a mission but never becomes the owner of it.
6. **Observation before orchestration.** User commands, connector changes, scheduled checks, sensors, and external signals enter through the Observation Engine and Event Gateway before becoming canonical events. No product surface creates hidden state transitions.
7. **Policy before execution.** Every capability and connector execution is authorized by identity, policy, and an auditable approval decision where required. Execution Intelligence determines ordering, parallelism, retry, rollback/compensation, cost, model routing, and human gates before an execution engine acts.
8. **Contracts before implementations.** Public CER contracts are platform-neutral, provider-neutral, versioned, and defined before implementation. No UI, Electron, or provider module may import a concrete CER implementation.
9. **Extension safety.** Capabilities, connectors, Knowledge Packs, Enterprise Apps, and UI extensions use a stable CER SDK, signed manifests, declared permissions, compatibility rules, and isolation boundaries. Extensions cannot bypass governance or the event gateway.
10. **Provider neutrality.** Models, storage engines, connectors, transports, and hosts are replaceable adapters selected by policy and capability requirements.
11. **Observability is mandatory.** Commands, events, decisions, policy outcomes, capability invocations, and state transitions produce immutable audit records and traceable correlation chains.
12. **Compatibility is explicit.** Legacy modules remain only through bounded adapters. No new code may depend on a deprecated abstraction.

## Runtime boundary

```text
Electron / Web / Mobile host
  -> CER client API
    -> CER Kernel
      -> Digital Twin | Observation | Event Bus | Mission | Execution Intelligence
      -> Capability | Connector | Intent | Context | Policy | Memory | Audit
    -> adapter ports (storage, model, connector, transport)
```

## Governance gates

Before merging a platform-affecting change, the owner must identify: canonical objects affected, command and event schema changes, state projection impact, policy/approval requirement, audit impact, adapter boundary, compatibility version, and migration/rollback plan. Changes that introduce a second runtime, event bus, ontology, or durable store are rejected unless this ADR is superseded.

## Naming

- `CER` means CHATR Enterprise Runtime only.
- `EnterpriseObject` is the universal durable object base.
- `EnterpriseDigitalTwin` is CER's authoritative enterprise representation; `EnterpriseState` is its event-derived projection layer.
- `Mission` is the unit of goal-directed orchestration.
- `Capability` is a governed, reusable unit of work.
- `Workspace` is a presentation projection, never a core object type.
- `Resource` is a canonical EnterpriseObject representing allocatable or constrained capacity, including budget, time, licence, compute, storage, team, equipment, inventory, and credential material.
- `Knowledge Fabric` is the CER service for knowledge, relationships, retrieval, memory, and provenance.

## Versioning

Contracts use semantic versions. Event schemas are additive within a major version; destructive changes require a new version, upcaster/downcaster strategy, replay plan, and deprecation date. Proposed follow-on ADR sequence: 001 Enterprise Runtime, 002 Platform Extension Model, 003 Enterprise Object Model, 004 Enterprise Event Model, 005 Mission Model, 006 Capability Runtime, 007 Knowledge Fabric, 008 Digital Twin. Existing numbered ADRs must be reconciled at ratification; no duplicate number is created meanwhile.

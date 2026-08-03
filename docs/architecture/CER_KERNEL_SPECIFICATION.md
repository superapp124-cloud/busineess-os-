CER Kernel Specification

## Status

Normative target architecture under ADR-000. This is a contract specification, not an implementation authorization.# 

## Kernel responsibility

CER Kernel is the sole authority for enterprise commands, events, state projections, service lifecycle, policy decisions, and audit records. The kernel is deliberately small. It owns contracts and orchestration; providers and product experiences are adapters.

## Required services

| Service | Responsibility | Does not own |
| --- | --- | --- |
| Enterprise State | Event-backed projections, versioning, query consistency | UI-only state |
| Enterprise Digital Twin | The integrated state, graph, operational, mission, risk, resource, knowledge, policy, and observation model CER reasons over | A second mutable database model |
| Observation Engine | Normalizes user, connector, schedule, sensor, and external changes into observations | Direct mission or execution side effects |
| Event Bus | Append, validate, publish, replay, dead-letter, idempotency | Ad-hoc local event contracts |
| Mission Manager | Mission lifecycle, context references, plan/outcome ownership | UI layout |
| Execution Intelligence | Selects order, parallelism, retry, compensation, approval, cost, and model routing | Direct connector calls |
| Capability Registry | Capability discovery, manifests, permissions, health, version compatibility | Provider-specific business logic |
| Connector Registry | Connector identity, scopes, lifecycle, credentials via secure adapter | Product-specific OAuth UI |
| Intent Engine | Normalizes inputs into declared intent hypotheses | Direct execution |
| Context Engine | Resolves relevant objects, knowledge, policy, and evidence | Mutable source-of-truth data |
| Policy Engine | Authorization, approvals, residency, risk, model and connector policy | Business UI |
| Memory Manager | Scoped retrieval/retention for session, mission, department, enterprise, long-term memory | Unbounded prompt history |
| Audit Manager | Immutable command/event/decision/execution provenance | Optional logging |

## Commands and event flow

```text
Observation or client command
  -> Observation Engine / Event Gateway
  -> Command validation / identity / policy
  -> append canonical event(s)
  -> project Enterprise State
  -> resolve intent and context
  -> create or update Mission
  -> execution-intelligence plan capabilities
  -> approval gate when required
  -> execute through Connector/Capability adapter
  -> append outcomes and audit
  -> update Knowledge Fabric and projections
```

Every canonical event requires: `id`, `type`, `schemaVersion`, `occurredAt`, `tenantId`, `actor`, `source`, `correlationId`, `causationId`, `idempotencyKey`, `aggregateId`, `aggregateKind`, `payload`, and `classification`. Events are immutable. Consumers must be idempotent and tolerate replay.

## Host and client rules

Electron hosts CER and exposes a narrow client API through secure IPC. Electron main must not become a second business kernel. React, mobile, and web clients submit commands and subscribe to projections; they do not instantiate CER services, write durable state, or orchestrate external side effects.

Storage, model, connector, transport, and observability implementations are ports. CER selects an adapter through policy. A local desktop implementation may use SQLite/IndexedDB; a server implementation may use Postgres. Both implement the same contracts and event schemas.

## Extension platform

The CER SDK is the only supported route to build a Capability, Connector, Knowledge Pack, Enterprise App, or UI Extension. Every extension ships a signed manifest declaring SDK version, permissions, event subscriptions, data classification, compatibility range, isolation level, and upgrade/rollback path. The platform extension ADR will define lifecycle, marketplace, signing, sandboxing, and permission enforcement before third-party extensions are accepted.

## First reference vertical slice

The only approved first feature slice is:

```text
Artifact upload -> Observation -> Event -> Intent -> Context -> Mission
-> Capability plan -> Human approval -> Execution -> Audit
-> Knowledge update -> Enterprise State projection
```

The artifact is linked to the mission as evidence. The workspace renders the mission projection. No alternate direct document-to-workspace pipeline may be added.

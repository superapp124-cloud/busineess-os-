# CER Migration Plan

## Goal

Move CHATR from multiple runtime/ontology/event implementations to a single CER authority without feature rewrites or an unsafe big-bang replacement.

## Phase 0 — Governance freeze

- Ratify ADR-000, this object model, and kernel specification.
- Stop creation of kernels, event buses, state stores, ontology roots, and direct UI-to-provider paths.
- Require an architecture review for changes in `src/kernel`, `src/core/runtime`, `electron/chatr-core`, `server/src/kernel`, `server/src/os`, `src/platform`, and `src/sdk`.
- Establish ADR-001 Enterprise Runtime through ADR-007 Digital Twin as follow-on decisions; existing similarly-numbered ADRs must be reconciled, not silently reused.

Exit: all platform work identifies its canonical contract and owning service.

## Phase 1 — Contracts and compatibility map

- Create versioned contract packages for EnterpriseObject (including Resource), commands, observations, events, Digital Twin projections, mission, execution intelligence, capability, connector, policy, audit, provider ports, and SDK extensions.
- Publish an adapter map from current terms to the canonical ontology.
- Define one event envelope, schema registry, upcaster policy, correlation conventions, and tenant/actor model.

Exit: no new product code imports a concrete kernel service or defines a new event envelope.

## Phase 2 — Authoritative CER kernel

- Implement the minimum kernel services behind the contracts: durable event store, event gateway, projection store, mission manager, policy/audit, and service registry.
- Choose one initial host path: Electron main process hosts CER; renderer accesses it through IPC.
- Wrap—not replace—existing Electron, server, and renderer paths behind ports.

Exit: a command can append, replay, project, and audit through CER in desktop development.

## Phase 3 — Reference vertical slice

- Route one document upload through the reference flow in the kernel specification.
- Make `Mission` the owner of artifact links, decisions, execution, and evidence.
- Replace the renderer-only CER pipeline with a CER client projection.

Exit: the full flow survives restart, is replayable, enforces policy/approval, and exposes a single audit trail.

## Phase 4 — Incremental migration

- Migrate each product surface by adapter: conversations/calls, Work OS, Business OS, capability marketplace, and server workflows.
- Retire duplicate stores and buses only after parity, replay, and rollback tests pass.
- Move knowledge/semantic search into Knowledge Fabric with explicit provenance and memory scope.

## Phase 5 — Platform extension model

- Ratify the Platform Extension Model ADR and publish the CER SDK contract surface.
- Establish extension manifests, signing, permissions, compatibility, sandboxing, lifecycle, and marketplace governance.
- Migrate existing capabilities and connectors to SDK-backed manifests before accepting third-party extensions.

## Deprecation rules

No component is deleted because a name looks redundant. It is marked deprecated only after a canonical replacement, compatibility adapter, migration owner, test evidence, observability coverage, and removal date exist. The architecture audit is the initial inventory; it must be updated as each phase closes.

# Canonical Architecture Audit

## Scope and method

Read-only repository audit completed 2026-07-31. This report inventories architectural authorities, not feature quality. It is based on code and documentation under `src`, `electron`, `server`, `docs`, and `adr`.

## Finding: competing runtime authorities

| Area | Evidence | Classification | Direction |
| --- | --- | --- | --- |
| Electron CHATR core | `electron/chatr-core/kernel`, execution, context, automation, provider runtimes | Existing product kernel | Wrap behind CER ports; do not extend as a second authority |
| Renderer core kernel | `src/core/kernel`, `src/core/runtime`, `src/core/contracts` | Migration-era kernel | Select contracts for CER baseline; consolidate implementations |
| `src/kernel` | ABI, event store, world model, projections, execution, policy | Independent kernel | Evaluate as contract/projection source; merge only by ADR |
| Server kernel | `server/src/kernel` | Server-oriented event, intent, capability, observation services | Convert to CER server adapter/host |
| Server OS | `server/src/os` | Independent mission/provider runtime | Treat as legacy vertical; route through CER contracts |
| Platform/SDK/Intent OS | `src/platform`, `src/sdk`, `src/core/os`, `src/chatr-os` | Additional runtime abstractions | Freeze and map to CER services |
| New CER workspace pipeline | `src/core/runtime/EnterpriseEventBus`, intent/context/mission/execution classes and workspace pane | Renderer-only proof of concept | Replace direct UI orchestration with CER client calls |

## Finding: competing ontologies

The repository uses Actor/Living Object/Process/Goal/Knowledge; BusinessObject/WorkItem; WorkspaceItem/WorkSession; Artifact/Person/Organization/Mission; generic Entity/Node; conversation, capability, provider, and intent models. These overlap in identity, lifecycle, and relationship semantics. ADR-000 selects `EnterpriseObject` and the Canonical Enterprise Object Model; all others require adapters or deprecation plans.

## Finding: competing event and state paths

Observed event implementations include `src/core/kernel/EventBus`, `src/core/runtime/EventBus`, `src/core/runtime/EnterpriseEventBus`, `src/kernel/EventBus`, `src/kernel/core/EventBus`, `src/kernel/eventbus/EventBus`, `src/lib/events/EventBus`, communication-engine EventBus, `src/platform` buses, Electron core events, server OS EventBus, and `server/src/services/EventBusService`. Stores include localStorage, IndexedDB, Supabase, Postgres, SQLite/better-sqlite3, JSON files, in-memory maps, and projection stores. None is currently established as the sole CER event/state authority.

## High-risk duplicate abstractions

1. `Kernel`, `EventBus`, `EventStore`, `StateStore`, `CapabilityRegistry`, `ConnectorRegistry`, `KnowledgeGraph`, `ExecutionRuntime`, and `Permission/Policy` have multiple implementations.
2. The desktop document workspace creates and runs mission logic in the renderer; this reverses the intended host -> CER -> UI dependency.
3. Existing terms `WorkSession`, `WorkspaceItem`, and `BusinessObject` overlap with CER’s proposed universal objects.
4. Electron’s product kernel, server OS, and renderer CER proof-of-concept have separate lifecycles and event semantics.

## Canonical recommendation

Adopt the following authority chain:

```text
Host (Electron / server / web / mobile)
  -> CER client API
    -> CER Kernel
      -> canonical contracts and Enterprise State
      -> event, mission, capability, connector, intent, context, policy, memory, audit services
    -> replaceable storage/model/provider/transport adapters
  -> UI projections
```

This does not authorize deletion or rewrites. It defines the target against which every existing implementation must be classified: canonical contract, approved adapter, legacy compatibility layer, or removal candidate. The target has been expanded to include an Enterprise Digital Twin, Observation Engine, Execution Intelligence, Resource model, and a governed CER SDK extension boundary.

## Immediate governance actions

1. Ratify ADR-000 and create an ADR index with reserved CER ADR numbers 001–007.
2. Name one architecture owner responsible for exceptions and migration acceptance.
3. Prohibit new direct UI-to-store/provider writes and newly named kernel/event abstractions.
4. Produce the contract inventory before selecting a codebase to become the CER implementation.
5. Implement no new product vertical until the Phase 2 kernel exit criteria are met.

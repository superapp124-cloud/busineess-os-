# CHATR OS Architecture Contracts

This document defines the rigid architectural boundaries, state management rules, and event naming conventions required for all modules in the CHATR AI-Native Operating System.

## 1. OS Design Rules (Data Flow)

Every module **must** follow the same unidirectional data flow contract:

`UI Component` → `Custom Hook` → `Service Layer` → `Repository Layer` → `Supabase / Edge Function` → `EventBus` → `Telemetry`

**Strict Rule:** No UI component should call Supabase directly. All database interactions must be abstracted into a Service/Repository.

## 2. Standardized Folder Structure

Every major module or page subsystem must adhere to this folder structure to avoid one-off designs:

```text
ModuleName/
├── components/    # Presentational React components only (memoized)
├── hooks/         # Custom React hooks containing local state and logic
├── services/      # Business logic and external API communication
├── providers/     # React Context providers for shared state
├── types/         # TypeScript interfaces and types
├── utils/         # Helper functions
├── tests/         # Unit and integration tests
└── index.ts       # Public exports for the module
```

## 3. Event Naming Convention

All events published to the OS `EventBus` must follow a strict dot-notation domain pattern:

- **Chat Module:** `chat.message.sent`, `chat.message.received`, `chat.room.joined`
- **Workflow Engine:** `workflow.started`, `workflow.completed`, `workflow.failed`, `workflow.node_executed`
- **Kernel / OS:** `kernel.ready`, `kernel.shutdown`, `kernel.error`
- **Memory / AI:** `memory.updated`, `search.executed`, `ai.context_generated`
- **System:** `notification.created`, `sync.started`, `sync.completed`

## 4. State Management Ownership

State must not be duplicated across layers. Ownership is strictly defined:

- **Local UI State:** React (`useState`, `useReducer`) inside Hooks.
- **Shared Application State:** Global Store (Zustand) or Context API (`providers/`).
- **OS Events & Cross-Module Communication:** `EventBus` (Pub/Sub).
- **Server Data (Truth):** Supabase (accessed via Services).
- **AI Context & Memory:** `ContextEngine.ts` (retrieved on-the-fly, not permanently stored in UI state).

## 5. Observability & Telemetry

Every operation crossing a layer boundary must generate telemetry.
Trace pipeline: `User Prompt → Intent → Planner → Workflow → Edge Function → Database → LLM → Response`

Capture requirements for all major operations:
- `execution_time`
- `status` (success/failure)
- `retries`
- `tokens_used`
- `latency_ms`
- `error_context`

## 6. Performance Budgets

Regressions are measurable. The following budgets are enforced:
- **Initial Desktop Load:** < 2.0 seconds
- **Chat Render Frame:** < 16 ms (60 FPS)
- **Universal Search (DB):** < 300 ms (excluding LLM generation)
- **Workflow Event Propagation:** < 100 ms
- **EventBus Publish Sync:** < 10 ms
- **AI Context Retrieval:** < 150 ms

## 7. AI Memory Lifecycle

Semantic memory is not append-only. The engine must respect the full lifecycle to prevent hallucination and noise:
1. **Create:** Embed and insert new memory.
2. **Update:** Modify existing memory based on delta.
3. **Merge:** Combine related fragments into a cohesive concept.
4. **Archive:** Deprioritize unused memories out of the hot context window.
5. **Delete:** Permanently remove on user request.
6. **Re-embed:** Update vector representation when embedding models change.

## 8. Offline Engine (Synchronization)

Offline mode is a synchronization pipeline, not just caching.
Pipeline: `Action → Local Queue → Conflict Detection → Merge → Server Sync → Confirmation`
Every module must define behavior for:
- **Messages:** Queue locally.
- **Documents:** Read from cache.
- **Workflows:** Pause and resume.
- **AI:** Retry with exponential backoff.
- **Notifications:** Sync later.

---
*These rules are mandatory. Code reviews must verify compliance against these contracts.*

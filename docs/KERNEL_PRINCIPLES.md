# CHATR 2.0 Kernel Principles & Platform Invariants

**Version:** Kernel v2.0 · Universal Objects v1.0 · Execution Graph v1.0 · Scheduler v1.0  
**Status:** Frozen Specification

---

## 🏛️ The Four Kernel Layers

1. **Experience Layer:** `BusinessOS.tsx` — Agnostic UI shell driven entirely by runtime state & configuration packs.
2. **Intent Layer:** `Intent Parser`, `Context Engine`, `Goal Planner` — Resolves natural language into execution graphs.
3. **Execution Layer:** `Execution Graph`, `Scheduler`, `Execution Engine`, `Capability Registry` — Orchestrates capability composition and manages human approval gates.
4. **Foundation Layer:** `Universal Business Objects (9 Canonical Types)`, `Event Bus`, `Runtime Memory`, `Health Engine`, `Configuration Packs`.

---

## 🛡️ The 8 Golden Runtime Invariants

These rules MUST NEVER be violated under any circumstances:

1. **Industry-Agnostic UI:** The UI shell (`BusinessOS.tsx`) must NEVER contain `if (industry === 'hospital')` branching logic.
2. **Zero-UI Configuration Packs:** Configuration Packs must contain ONLY schemas, vocabulary, permissions, default skills, and policies—never React components or routing logic.
3. **Stateless Capabilities:** Capabilities are pure, stateless execution units (`inputs → output`). Business state lives strictly in the Business Object Store.
4. **Graph Composition over Embedded Logic:** Execution Graphs orchestrate multi-capability workflows rather than embedding business logic inside individual capabilities.
5. **Universal Event Emission:** Every runtime action, capability invocation, and state transition MUST emit a structured event to the Event Bus.
6. **End-to-End Observability:** Every execution MUST carry a unique `traceId` for full auditability and telemetry recording.
7. **Canonical Object Binding:** Every business object (Invoice, Patient, Candidate, Order) MUST map directly to one of the 9 Universal Object Types (`Person`, `Organization`, `Conversation`, `Document`, `WorkItem`, `Asset`, `Transaction`, `Event`, `Knowledge`).
8. **Asynchronous Process Scheduling:** Every long-running process MUST be enqueued in the Scheduler rather than executed synchronously on the main thread.

---

## 🔑 Kernel Architectural Principles

- **Intent before interface:** Users declare *what* they want accomplished; the OS determines *how*.
- **Configuration before customization:** Support new industries by registering configuration packs, never by building new pages.
- **Events before polling:** All UI and background updates are pushed via the Event Bus stream.
- **Composition before duplication:** Combine existing atomic capabilities into skills rather than building duplicate modules.
- **Human oversight where required:** Approval gates are first-class primitives with automatic pause and rollback.
- **AI augments execution; it does not define the business model.**
- **Every action is observable.**
- **The runtime is industry-agnostic.**

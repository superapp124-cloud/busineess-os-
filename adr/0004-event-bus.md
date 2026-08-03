# ADR 0004: Event Bus & Standardized Events

## Status
Accepted

## Context
In a decoupled runtime architecture, distinct domains (Identity, Connectors, Workflows) cannot invoke each other directly without creating tight coupling. They must communicate asynchronously to maintain autonomy. Previous implementations lacked standardized event naming, making debugging and tracing difficult.

## Decision
We will implement a central **Event Bus** attached to the Kernel, enforcing strict event naming conventions.

1. **Central Hub**: The Kernel will host the global Event Bus. All runtimes will publish and subscribe to events through this bus.
2. **Standardized Naming**: All events must adhere to a strict dot-notation convention describing the domain, entity, and action (e.g., `identity.login.completed`, `workflow.started`).
3. **Event Payloads**: Event payloads must be strongly typed using schemas defined in the `@chatr/contracts` package.

## Consequences
- **Positive**: Enables fully decoupled, reactive architectures where runtimes react to state changes without knowing what triggered them.
- **Positive**: Standardized naming dramatically improves observability, logging, and debugging.
- **Negative**: Asynchronous event-driven flows can be harder to trace conceptually than synchronous function calls.

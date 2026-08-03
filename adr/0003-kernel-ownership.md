# ADR 0003: Kernel Ownership & Dependency Injection

## Status
Accepted

## Context
As the CHATR application grows in complexity, managing dependencies manually (e.g., passing instances through deeply nested components) becomes unscalable. Additionally, hardcoding instantiations (`new IdentityRuntime()`) tightly couples the codebase to specific implementations, violating our core architectural principles.

## Decision
We will establish the **CHATR Kernel** as the absolute owner of Dependency Injection (DI) and lifecycle management.

1. **Service Registry**: The Kernel will host a lightweight, built-in Service Registry (DI Container) that avoids heavy external frameworks.
2. **Registration**: Runtimes will explicitly register themselves with the Kernel during the Bootstrap phase (`kernel.register('IIdentityRuntime', identityRuntime)`).
3. **Resolution**: Any component or UI element requiring a service must resolve it via the Kernel (`kernel.resolve('IIdentityRuntime')`).
4. **Bootstrapping**: A dedicated `BootstrapRuntime` will orchestrate the startup sequence to keep the Kernel pure. The Kernel itself will only be responsible for holding state, DI, and the Event Bus.

## Consequences
- **Positive**: Provides a single source of truth for all runtime dependencies.
- **Positive**: Simplifies mocking in tests by allowing test configurations to register mock implementations into the Kernel.
- **Negative**: The Kernel becomes a central point of failure; if it crashes, the entire architecture fails.

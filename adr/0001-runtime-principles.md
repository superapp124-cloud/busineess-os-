# ADR 0001: CHATR Runtime Architecture Principles

## Status
Accepted

## Context
CHATR is evolving into a comprehensive intelligence engine rather than a traditional web application. The previous architecture tightly coupled the User Interface (React) to backend service implementations, authentication providers (Supabase), and database schemas. This monolithic dependency structure made replacing components (like swapping Supabase Auth for Better Auth or Keycloak) incredibly difficult without triggering a cascading rewrite. 

We need a flexible, loosely-coupled architecture that allows independent evolution of capabilities (Identity, Connectors, Workflows) while ensuring that the UI remains ignorant of underlying implementations.

## Decision
We will transition the CHATR architecture to a **Runtime Kernel Model**.

The fundamental principles are:
1. **Strict Dependency Flow**: UI → Runtime APIs → Contracts → Kernel. 
   - The UI will never directly import implementation classes (e.g., `new OAuthManager()`, `new WorkflowEngine()`).
   - The UI will never directly interact with databases or concrete authentication providers.
2. **Contracts First**: Every runtime domain will have its interfaces, events, schemas, errors, and capabilities defined in a pure `@chatr/contracts` package (initially `src/core/contracts`).
3. **Maturity Levels**: All packages and runtimes will clearly declare their maturity (Stable, Experimental, Draft, Planned) to guide integration stability.
4. **Wrap Before Replace**: Legacy implementations will be hidden behind the new runtime interfaces before they are deprecated or replaced.
5. **Standardized Lifecycle**: All runtimes will implement `IRuntime` with standard methods: `initialize()`, `start()`, `stop()`, `dispose()`, `health()`, and `version()`.
6. **Observability**: Every runtime will natively support common logging, metrics, and tracing interfaces.

## Consequences
- **Positive**: Complete decoupling allows components to be swapped effortlessly. For example, moving from Supabase Auth to Better Auth requires zero changes to the UI code.
- **Positive**: Testability is massively improved because every runtime can be stubbed or mocked via its contract.
- **Negative**: Adds a layer of indirection (Contracts & DI) that increases the cognitive load for small, simple tasks.
- **Negative**: Requires strict discipline to avoid "leaking" implementation details across domain boundaries.

# ADR 0002: Contracts-First Development

## Status
Accepted

## Context
In previous iterations, the business logic and interface definitions were often conflated within the same classes (e.g., `OAuthManager`, `TokenVault`). This tightly coupled consumers of these modules to their concrete implementations, making them extremely difficult to mock in tests or replace with alternative solutions.

To achieve the loosely-coupled CHATR Runtime architecture, we need a mechanism to strictly separate "What a module does" from "How it does it".

## Decision
We will enforce a **Contracts-First Development** methodology.

1. **The `@chatr/contracts` Package**: A dedicated, pure package (or `src/core/contracts/` folder during the initial migration) will contain *zero implementation logic*. It will only house:
   - TypeScript `interface` definitions
   - Custom `type` aliases
   - Domain `Events` schemas
   - `Commands` and `Queries`
   - `Errors`
   - Capability definitions
2. **Implementation Dependency**: All other runtimes (e.g., Identity, Connector, Workflow) must implement their corresponding interfaces from the contracts package.
3. **Consumer Dependency**: Any module consuming a service must type its dependencies against the contracts package, never against the concrete implementation.

## Consequences
- **Positive**: Promotes clean architecture by enforcing the Dependency Inversion Principle.
- **Positive**: Enables safe, parallel development where teams can build implementations against agreed-upon contracts.
- **Negative**: Adds initial overhead to define interfaces before writing any functional logic.

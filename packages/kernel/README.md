# `@chatr/kernel`

This package defines the core, dependency-free TypeScript contracts for CHATR Intent OS.

## Kernel Compatibility Policy (v1.x)

To ensure the ecosystem remains stable, all changes to `@chatr/kernel` must adhere to the following compatibility rules for v1.x:

- **✓** New optional fields may be added to interfaces.
- **✓** New interfaces may be introduced.
- **✓** New event types may be introduced.
- **✓** New builder helpers may be added.
- **✓** Existing Stable APIs remain unchanged.
- **✗** Existing fields are never removed.
- **✗** Existing field semantics never change.
- **✗** Existing enum values never change meaning.
- **✗** Stable interfaces never become incompatible.

Major versions (v2.x) may introduce breaking changes, but only after an approved Architecture Decision Record (ADR) and RFC.

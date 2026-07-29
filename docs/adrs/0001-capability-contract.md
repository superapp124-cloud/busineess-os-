# ADR-0001: The Capability Contract

## Status
Accepted

## Context
As CHATR evolved from a communication app into the Intent OS, capabilities (third-party modules) required a standardized way to interface with the core Kernel. Initially, properties were scattered across manifests, permissions databases, and ad-hoc repositories. This made dependency resolution, AI planning, and secure live-upgrades impossible without custom kernel code.

## Decision
We introduce the **Capability Contract** (`src/sdk/kernel/contract/CapabilityContract.ts`). 
This is the absolute single source of truth for a capability. It acts like an "OpenAPI Spec" for the OS, defining Inputs, Outputs, Events, Permissions, Business Objects, Dependencies, Resources, Policies, and Migrations.

Everything derives from the Contract:
Capability -> Contract -> Manifest -> Repository -> CQRS -> Events -> Permissions -> Policies -> Resources -> UI -> SDK Documentation.

## Alternatives Considered
- **Maintaining isolated registries:** Keeping separate manifests, resource quotas, and migration scripts. Rejected because the AI Planner needs a unified schema to reason about capabilities safely.
- **Dynamic evaluation:** Allowing capabilities to request resources and declare endpoints dynamically at runtime. Rejected because it violates the "Zero-Trust Sandbox" philosophy and prevents predictable transactional upgrades.

## Trade-offs Accepted
- Developers must statically declare all intended behaviors and relationships upfront in the Contract, increasing the initial boilerplate compared to a simple "Hello World" app.

## Consequences
- **Positive:** We can generate SDKs, validate security policies, run transactional migrations, and allow the AI Planner to orchestrate third-party capabilities safely without reading their source code.
- **Negative:** Third-party developers cannot easily change their data schema or required permissions dynamically at runtime without issuing a formal Contract upgrade through the Intent Store.

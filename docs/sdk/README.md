# CHATR SDK: Platform Developer Guide

Welcome to the CHATR Developer SDK. 

CHATR has evolved from a single application into the **Intent OS**, a highly stable, extensible foundation where the platform evolves through isolated capabilities rather than kernel modifications.

If you are a third-party developer, this SDK gives you the tools to build, publish, install, upgrade, and deprecate a Capability without ever touching the Kernel source code.

## Architecture Overview

The CHATR OS is built on a strict, decoupled architecture:
1. **Intent & AI Planner**: Probabilistically determines what the user wants and generates a deterministic execution graph.
2. **Intent Execution Model (IEM)**: The strictly typed graph (Nodes & Edges) that defines the workflow.
3. **Execution Engine**: The deterministic runner that executes the IEM, maintains state, and handles compensation/retries.
4. **Policy Engine**: Enforces Authorization, Execution boundaries, AI Governance, and Compliance rules.
5. **Capability Runtime**: The environment where your Capability lives.
6. **CQRS Event Mesh**: How your Capability talks to others (Commands, Events, Queries).
7. **Knowledge Graph**: The unified abstraction layer over your independent databases.

---

## 1. Capability Manifest Reference
Every capability begins with a Manifest. This is your contract with the Platform Registry.

```typescript
import { ICapabilityManifest } from '@chatr/kernel';

export const SampleManifest: ICapabilityManifest = {
  id: 'com.thirdparty.sample',
  name: 'SampleOS',
  version: '1.0.0',
  schemaVersion: 'v2',
  dependencies: {
    capabilities: ['com.chatr.legalos'], // Capability Dependency Manager resolves this
    kernelServices: ['EventMesh', 'PolicyEngine']
  },
  // ... connectors, permissions, UI extensions
};
```

## 2. Repository Guide
Capabilities manage their own data via the Repository pattern. You do not touch global states. Your repository will automatically be stitched into the **Knowledge Graph**.

- **Do**: Expose a clear Primary Key and searchable fields for the Knowledge Graph.
- **Do**: Implement Soft Deletes (`deleted_at`).
- **Don't**: Write raw SQL joins across capabilities. Declare your relationships via `PlatformRegistry.register('BusinessObject', ...)` and let the Knowledge Graph handle the foreign mapping (e.g. `DEPENDS_ON`, `OWNS`).

## 3. CQRS Guide
The Event Mesh strictly enforces Command Query Responsibility Segregation.
- **Commands**: 1-to-1 routing. Use `sendCommand()`. Returns explicit success/fail.
- **Events**: 1-to-many. Use `publishEvent()`. Fire and forget. No blocking.
- **Queries**: 1-to-1. Use `dispatchQuery()`. Read-only payloads.

## 4. Execution & Policy Guide
Your capability will often be orchestrated by the **Execution Engine**.
- You do not write orchestration logic inside your Capability.
- You provide the raw atomic functions (Nodes) that the Planner maps into an **IEM**.
- If you need human intervention, throw a `RequireApproval` policy flag. The Execution Engine will Pause the thread, request approval via the ActivityCentre, and Resume automatically.

## 5. Marketplace Publishing
To publish your Capability:
1. **Develop**: Build your Manifest and Repository.
2. **Validate**: Run the `chatr-cli validate` tool to check your dependencies.
3. **Sign**: Request an SDK signing key from the Developer Portal.
4. **Publish**: Upload to the Marketplace.
5. **Certification**: Capabilities undergo automated testing (RLS checks, Audit Column checks) before receiving the "CHATR Certified" badge.

## 6. Testing Guide
Do not just write unit tests. Write **Resilience Tests**.
Your capability must survive:
- Server Restarts (via state re-hydration in the Execution Engine).
- Timeout limits (gracefully handling `Compensation` graphs).
- Parallel execution faults.

Refer to `src/capabilities/sample-capability/` for a fully functional reference capability.

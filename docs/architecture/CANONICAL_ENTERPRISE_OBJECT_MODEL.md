# Canonical Enterprise Object Model

## Status

Normative. Implements ADR-000 and is the only ontology permitted for new CER work.

## Universal base

Every durable enterprise record is an `EnterpriseObject`. Specific types add typed attributes; they do not introduce a competing root model.

```text
EnterpriseObject
├── Person                 ├── Organization          ├── Artifact
├── Mission                ├── Task                  ├── Knowledge
├── Decision               ├── Workflow              ├── Capability
├── Connector              ├── Policy                ├── Automation
├── Memory                 ├── Conversation          ├── Resource
└── Event
```

Required base fields: `id`, `kind`, `tenantId`, `lifecycle`, `version`, `createdAt`, `updatedAt`, `createdBy`, `ownerId`, `classification`, `metadata`, and `links`. IDs are immutable; relationships are typed links, not hidden foreign-key conventions.

## Meaning of the canonical kinds

| Kind | Meaning |
| --- | --- |
| Person | A human, agent, or represented individual. |
| Organization | A company, team, department, customer, vendor, regulator, or partner. |
| Artifact | An immutable or versioned evidence-bearing item: file, contract, invoice, email, recording, or dataset. |
| Mission | A goal-directed unit of orchestration with context, plan, lifecycle, outcomes, and audit trail. |
| Task | An assignable, independently trackable unit of work. |
| Knowledge | Curated or derived information with provenance and retrieval policy. |
| Decision | A recorded choice, recommendation, approval, rejection, or escalation. |
| Workflow | A reusable or instantiated process definition. |
| Capability | A governed, versioned function CER can plan or invoke. |
| Connector | A configured integration endpoint and its permission scope. |
| Policy | A machine-evaluable governance or business rule. |
| Automation | A persisted trigger-to-action rule. |
| Memory | Retained context with scope, retention, provenance, and access policy. |
| Conversation | A communication timeline and participant context. |
| Resource | An allocatable or constrained enterprise asset: budget, time, licence, AI credit, compute, storage, team capacity, equipment, inventory, or credential material. |
| Event | An immutable, versioned assertion that an enterprise state transition or observation occurred. |

## Lifecycle and state

All `EnterpriseObject` instances use one lifecycle: `draft -> active -> suspended | archived -> deleted`, with `restored` valid only from `archived` or `deleted`. Type-specific state belongs in a namespaced state machine (for example, `mission.state` or `decision.state`) and cannot replace the universal lifecycle.

`EnterpriseState` is a tenant-scoped collection of read projections derived from Event objects. It is not a mutable UI cache. Command handlers validate intent, policy, concurrency, and authority, append events, then update projections.

## Relationships and evidence

Links use a typed edge: `sourceId`, `targetId`, `relationshipType`, `validFrom`, `validTo`, `evidenceIds`, and `confidence`. Canonical relationship families are structural (`part_of`, `reports_to`), authority (`owned_by`, `approved_by`), dependency (`depends_on`, `blocks`), temporal (`precedes`, `supersedes`), reference (`references`, `related_to`), and operational (`triggers`, `produces`, `governs`).

Artifacts and Knowledge carry provenance. AI-generated facts, recommendations, and summaries must link to source evidence, model/provider metadata, and a confidence statement.

## Explicit non-objects

`Workspace`, `WorkspaceItem`, `LivingObject`, generic `Entity`, generic `Node`, `BusinessObject`, `WorkSession`, and `CompanyBrain` are not canonical roots. They may be retained as migration adapters or presentation terms only:

| Legacy term | Canonical replacement |
| --- | --- |
| Workspace / WorkspaceItem | Presentation projection of one or more EnterpriseObjects |
| Living Object / Business Object / Entity | EnterpriseObject plus `kind` |
| WorkSession | Mission projection plus ephemeral UI session state |
| Company Brain | Knowledge Fabric service |
| Node | Typed graph link or workflow/mission step, never a general object root |

# Experience Generator Specification (`EXPERIENCE_GENERATOR_SPEC.md`)

> **Status**: `ENGINEERING SPECIFICATION`  
> **Target Version**: `CHATR Experience Generator 1.0`

---

## 1. Objective

Automatically derive complete user interfaces and operational projections (*Forms, Kanban, Timelines, Dashboards, Mobile, APIs*) directly from `Node Schema + Capabilities + Policies + Constraints` with zero handwritten UI code.

---

## 2. Generation Engine Architecture

```
                       ┌──────────────────────────────────────┐
                       │  NODE SCHEMA + POLICIES + CONSTRAINTS │
                       └──────────────────┬───────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────┐
                       │    CHATR EXPERIENCE GENERATOR        │
                       └──────────────────┬───────────────────┘
                                          │
    ┌──────────────┬──────────────┬───────┴──────┬──────────────┬──────────────┐
    ▼              ▼              ▼              ▼              ▼              ▼
[ Forms ]      [ Lists ]      [ Kanban ]    [ Timelines ]  [ Dashboards ]  [ APIs ]
```

---

## 3. UI Projection Output Mapping

- **State Mutations**: Automatically mapped to `Capability` execution buttons.
- **Guardrails**: Rendered as real-time `Constraint` meters.
- **Evidence Traces**: Rendered inside clickable `MetricDrilldown` modals.

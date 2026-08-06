# Security & Governance Specification (`SECURITY_SPEC.md`)

> **Status**: `ENGINEERING SPECIFICATION`  
> **Constitutional Rule**: Zero industry vocabulary inside kernel; zero bypass of Row Level Security (RLS).

---

## 1. Zero-Trust Substrate Security

Every capability execution is cryptographically validated against System Policies (`POL-*`) and `Constraint` guardrails before any mutation is committed.

---

## 2. Row-Level Security (RLS) & Multi-Tenant Isolation

All Level 0 `Node` entities inherit strict tenant isolation keys, ensuring dynamic projections are scoped by tenant boundaries.

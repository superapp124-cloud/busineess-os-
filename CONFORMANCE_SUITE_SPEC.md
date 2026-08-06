# Conformance Test Suite Specification (`CONFORMANCE_SUITE_SPEC.md`)

> **Status**: `ENGINEERING SPECIFICATION`  
> **Directory**: `/tests/conformance`

---

## 1. Conformance Test Suite (TCK)

Every Industry Composition Package must pass all 9 Conformance Tests prior to installation:

1. **Identity Conformance**: Single invariant identity across state changes.
2. **Lifecycle Conformance**: Valid state machine transitions.
3. **Permissions Conformance**: Scoped RLS tenant boundary check.
4. **Policy Conformance**: Enforcement of `POL-*` guardrails.
5. **State Machine Conformance**: Zero deadlocks in state graphs.
6. **Execution Conformance**: Atomic capability execution.
7. **Receipt Conformance**: Cryptographically signed execution receipt (`exec_*`).
8. **Learning Conformance**: Homeostatic policy adjustment log.
9. **Compatibility Conformance**: Compatibility Promise verification across Kernel 1.x.

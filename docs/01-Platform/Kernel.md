# 01-Platform — Kernel Platform Specification (docs/01-Platform/Kernel.md)

> **Status**: Frozen (`Kernel 1.0.x`)  
> **Scope**: Immutable Kernel Core, Intent IR Compiler, Execution Fabrics, and State Machines.

---

## 1. Executive Summary

The CHATR Intent OS Kernel (`@intent/kernel`) is an **Execution Platform** operating at Level A contract stability. It transforms user intents into executable plan DAGs that execute deterministically or probabilistically across hardware runtimes.

---

## 2. Immutable Level A Kernel Contracts

- **`IntentIR`**: Immutable Intermediate Representation capturing goal, domain, parameters, constraints, and privacy level.
- **`ExecutionContext`**: Immutable runtime context containing execution ID, workspace ID, user ID, trace headers, and cancellation signals.
- **`Capability`**: Modular executable unit exposing input/output JSON schemas, SLA latencies, and permissions.
- **`ProviderAdapter`**: Infrastructure bridge adapting LLM models (OpenRouter, Gemini, Groq) or deterministic algorithms to standard capability interfaces.
- **`Runtime`**: Hardware execution engine (Browser WASM, Desktop Electron/Ollama, Enterprise LAN vLLM, Cloud Supabase Edge).

---

## 3. The 7 First-Class Executors

1. **`RulesExecutor`**: Deterministic business logic, state transitions, validation rules.
2. **`SearchExecutor`**: Full-text and vector similarity search queries across PostgreSQL/pgvector.
3. **`WorkflowExecutor`**: Multi-step state machine orchestrations.
4. **`AIExecutor`**: Probabilistic multi-model execution via OpenRouter Edge Proxy.
5. **`HumanExecutor`**: Approval gates, reviews, manager authorizations.
6. **`AutomationExecutor`**: Cron triggers, webhooks, background tasks.
7. **`CommunicationExecutor`**: Email, WhatsApp, push notifications.

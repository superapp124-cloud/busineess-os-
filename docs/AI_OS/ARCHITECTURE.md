# CHATR SI OS — Universal Architecture Blueprint
**Version:** 1.0.0 (Phase 6 Production Local AI Platform)  
**Standard:** Local-First, Private-First, Offline-Capable, Model-Agnostic, Device-Adaptive  

---

## 1. Vision & Core Philosophy

> "Every CHATR user gets their own personal SI Agent."  
> "My AI lives on my phone."

CHATR is not an app with a chatbot slapped on top. It is a **Personal AI Operating Layer** that resides directly on physical user hardware. 

The cloud is strictly an optional extension for public information or web queries. The core loop—understanding, memory, health vitals, tool calling, and action proposals—executes entirely on-device.

```
                         CHATR SI OS
                              │
                     ┌────────▼────────┐
                     │ Personal Agent  │
                     └────────┬────────┘
                              │
                  ┌───────────▼───────────┐
                  │    CHATR SI ROUTER    │
                  │ privacy + capability  │
                  │ + device + network    │
                  └───────────┬───────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
          LOCAL FIRST       HYBRID            CLOUD
              │               │                │
      ┌───────▼────────┐      │       Gemini/OpenAI/etc.
      │ CHATR LOCAL    │      │
      │ AI RUNTIME     │      │
      └───────┬────────┘      │
              │               │
      ┌───────┼──────────┐    │
      │       │          │    │
  llama.cpp AICore   LiteRT   │
      │       │          │    │
      └───────┴──────────┴────┘
              │
       ┌──────▼───────┐
       │ Local Memory │
       │ Local RAG    │
       │ Local Tools  │
       └──────┬───────┘
              │
    ┌─────────┼────────────────────┐
    │         │         │          │
  Health    Work     Personal   Devices
    │         │         │          │
 Health OS  Calendar  Memory    Watch/Ring/BP
```

---

## 2. Component Directory Structure

The system is organized into modular subsystems under `src/ai/`:

```
src/ai/
├── runtime/
│   ├── types.ts                   # Provider plugin interface & generation types
│   ├── ChatrLocalRuntime.ts       # Runtime orchestrator (llama.cpp, AICore, LiteRT, Ollama, Cloud)
│   └── DeviceCapabilityEngine.ts  # Hardware tier profiling (Tier A-E, thermal, RAM tuning)
├── providers/
│   ├── LlamaCppProvider.ts        # Production Android ARM64 native provider
│   ├── AICoreProvider.ts          # Android system-level Gemini Nano adapter
│   ├── LiteRTProvider.ts          # Lightweight classification & embeddings
│   ├── OllamaProvider.ts          # Desktop development & local testing bridge
│   ├── CloudProvider.ts           # Secure server-side Supabase Edge fallback
│   └── HeuristicFallbackProvider.ts # 100% resilient deterministic safety engine
├── models/
│   ├── types.ts                   # ModelDefinition schema
│   ├── ModelRegistry.ts           # Dynamic catalog (0.5B, 1B, 3B, AICore, Cloud)
│   ├── ModelSelectionEngine.ts    # Hardware/task/privacy matching engine
│   └── ModelUpdateManager.ts      # Atomic download, verify, and rollback
├── router/
│   └── ChatrAIRouter.ts           # Master local-first decision sequence
├── agents/
│   └── PersonalAgent.ts           # 11-step execution loop
├── memory/
│   ├── types.ts                   # MemoryRecord schema & 11 categories
│   └── LocalMemoryStore.ts        # Encrypted storage with selective creation policy
├── rag/
│   └── LocalKnowledgeEngine.ts    # On-device chunking & cosine vector retrieval
├── tools/
│   ├── types.ts                   # ToolDefinition schema & execution policies
│   └── ChatrToolRegistry.ts       # 17 standard tool categories
├── privacy/
│   ├── types.ts                   # 5-tier privacy classification levels
│   └── PrivacyRouter.ts           # Semantic data egress governance
├── security/
│   ├── types.ts                   # Action security levels 1, 2, 3
│   └── PermissionManager.ts       # Deterministic action execution barrier
├── personalization/
│   └── PreferenceStore.ts         # User tone, habits, and meeting preferences
├── notifications/
│   └── NotificationDecisionAdapter.ts # User notification modes (MINIMAL/BALANCED/PROACTIVE)
└── observability/
    └── AIActivityLog.ts           # Transparent privacy audit trail
```

---

## 3. The 11-Step Personal Agent Loop

Every interaction is processed through an inviolable sequential chain:

1. **UNDERSTAND**: Parse query, extract temporal and entity references.
2. **CLASSIFY**: PrivacyRouter evaluates semantic risk (`PUBLIC`, `PERSONAL`, `PRIVATE`, `SENSITIVE`, `HIGHLY_SENSITIVE`).
3. **RETRIEVE MEMORY**: Pull encrypted local preferences from `LocalMemoryStore` and documents from `LocalKnowledgeEngine`.
4. **CHECK PRIVACY**: Enforce data egress constraints (blocks cloud if sensitive).
5. **SELECT MODEL**: `ModelSelectionEngine` evaluates available RAM, thermal state, and task complexity.
6. **SELECT TOOLS**: Compile permitted tool schemas from `ChatrToolRegistry`.
7. **CHECK PERMISSION**: `PermissionManager` validates tool risk (Level 1, 2, or 3).
8. **EXECUTE**: Dispatch to local engine (`llama.cpp` / `AICore` / `LiteRT`).
9. **OBSERVE**: Capture structured `<tool_call>` output or generated prose.
10. **UPDATE MEMORY**: Store explicit user commitments or habits following memory retention policy.
11. **RESPOND**: Emit empathetic result and write immutable entry to `AIActivityLog`.

---

## 4. Preservation of Authoritative Systems

Under no circumstances does the AI layer bypass or override existing subsystems:
- **Health OS**: Inviolable. Emergency blood pressure alerts (P0/P1) cannot be downgraded or dismissed by the LLM.
- **Telecom & Calling**: ChatrShield and WebRTC maintain dedicated real-time priority.
- **Supabase**: Cloud data synchronization respects offline-first queues.

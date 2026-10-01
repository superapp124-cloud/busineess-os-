# CHATR SI OS — Personal Agent Architecture
**Document:** `docs/AI_OS/PERSONAL_AGENT.md`  
**Core Service:** `PersonalAgent`  

---

## 1. Product Principle

> "CHATR is not an app with an SI chatbot. CHATR is a personal AI operating layer."

Every CHATR user receives an autonomous, persistent **PersonalAgent** bound to their device identity:

```
PersonalAgent = MEMORY + REASONING + TOOLS + CONTEXT + PERMISSIONS + ACTIONS
```

### Agent Identity Schema:
- **`agentId`**: Unique client-side identifier.
- **`profile`**: User name, communication tone, and language preferences.
- **`memory`**: Encrypted `LocalMemoryStore` across 11 life categories.
- **`permissions`**: Deterministic `PermissionManager` boundaries.
- **`tools`**: Structured schemas from `ChatrToolRegistry`.
- **`modelPolicy`**: Local-first model preference with cloud-egress restrictions.
- **`privacyPolicy`**: Configurable strictness levels.
- **`notificationPolicy`**: Proactive modes (`MINIMAL`, `BALANCED`, `PROACTIVE`).

---

## 2. The 11-Step Personal Agent Loop

```
User Query
    │
    ▼
1. UNDERSTAND           → Entity and temporal extraction
    │
    ▼
2. CLASSIFY             → Privacy classification (PUBLIC to HIGHLY_SENSITIVE)
    │
    ▼
3. RETRIEVE MEMORY      → Semantic recall from LocalMemoryStore + LocalKnowledgeEngine
    │
    ▼
4. CHECK PRIVACY        → Verify data egress rules
    │
    ▼
5. SELECT MODEL         → ModelSelectionEngine matches device telemetry
    │
    ▼
6. SELECT TOOLS         → ChatrToolRegistry formats JSON schema
    │
    ▼
7. CHECK PERMISSION     → PermissionManager validates risk (Level 1/2/3)
    │
    ▼
8. EXECUTE              → On-device inference via ChatrLocalRuntime
    │
    ▼
9. OBSERVE              → Capture generated tokens or tool call outputs
    │
    ▼
10. UPDATE MEMORY       → Store commitments/habits according to memory policy
    │
    ▼
11. RESPOND             → Formulate empathetic response & log to AIActivityLog
```

The model can never bypass the Privacy Router, Permission Manager, or Health OS.

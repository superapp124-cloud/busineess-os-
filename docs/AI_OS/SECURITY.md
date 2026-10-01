# CHATR SI OS — Security Model & Action Boundaries
**Document:** `docs/AI_OS/SECURITY.md`  
**Core Service:** `PermissionManager`  

---

## 1. Three-Tier Action Security Barrier

The SI model is an interpreter and proposer—it is **never** granted direct execution authorization. Every tool call must pass through `PermissionManager`:

```
                 LLM Output (<tool_call>)
                            │
                            ▼
                 PermissionManager.checkPermission()
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
     LEVEL 1             LEVEL 2             LEVEL 3
  Safe Read-Only        Reversible         Sensitive /
   (Query Vitals,      (Set Alarm,         Irreversible
   Read Schedule)      Draft SMS)        (Send SMS, Pay,
        │                   │             Delete Data)
        ▼                   ▼                   │
   AUTO EXECUTE        AUTO EXECUTE             ▼
                      with Undo Toast       USER MODAL
                                           CONFIRMATION
                                                │
                                        ┌───────┴───────┐
                                     CONFIRM          REJECT
                                        │               │
                                        ▼               ▼
                                     EXECUTE         DISCARD
```

---

## 2. Health OS Inviolability

- **Clinical Integrity**: `HealthEventEvaluator` and `HealthStateEngine` operate with deterministic clinical thresholds (AHA/ACC guidelines).
- **No Safety Downgrades**: If a patient logs BP $185/122\text{ mmHg}$, the system triggers `P0_CRITICAL`. The LLM cannot dismiss the alert or re-label it as "mild fatigue."
- **Mandatory Medical Disclaimer**: Appended across all health-related response paths.

---

## 3. Prompt Injection Defense

1. **Structured Input Demarcation**: System prompts and user queries use ChatML tokens (`<|im_start|>` and `<|im_end|>`).
2. **Schema Sanitization**: Tool parameters are parsed against JSON schemas; unexpected keys are stripped.
3. **Sandbox Isolation**: The local model has no raw shell access, file write access, or direct network socket access outside the defined tool endpoints.

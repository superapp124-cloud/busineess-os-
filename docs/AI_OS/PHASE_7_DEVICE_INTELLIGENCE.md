# CHATR SI OS — Phase 7: Personal AI Device Intelligence
**Document:** `docs/AI_OS/PHASE_7_DEVICE_INTELLIGENCE.md`  
**Status:** Implemented & Verified  
**Core Objective:** Transform the PersonalAgent from a reactive chatbot into an autonomous personal intelligence layer that understands situational context and knows when to help.

---

## 1. Executive Summary

Phase 6 established the local platform foundation (runtime, model registry, local memory, privacy routing, and permission barriers).

**Phase 7** bridges the ambient world into the agent:
```
                     MY CHATR SI
                          │
              ┌───────────┴───────────┐
              │    PERSONAL AGENT     │
              └───────────┬───────────┘
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
     MEMORY             CONTEXT            TOOLS
       │                  │                  │
       │          ┌───────┼────────┐         │
       │          │       │        │         │
     People     Health   Work    Devices   Actions
                  │       │        │
                  │       │        ├── Watch
                  │       │        ├── Ring
                  │       │        ├── BP
                  │       │        ├── Glucose
                  │       │        └── Scale
                  │       │
                  │       ├── Calendar
                  │       ├── Email
                  │       └── Documents
                  │
                  └── Health OS
```

---

## 2. Personal Context Engine (`PersonalContextEngine`)

Instead of dumping massive, raw chat transcripts or databases into the LLM, `PersonalContextEngine` distills device telemetry, calendar, health, and routines into an ultra-compact, token-efficient snapshot:

```json
{
  "time": "08:15",
  "day": "Monday",
  "timeOfDay": "morning",
  "healthState": "stable",
  "sleepStatus": "below_baseline",
  "activityLevel": "normal",
  "calendarMeetingsCount": 3,
  "nextMeetingTitle": "Strategy Presentation",
  "nextMeetingMinutesAway": 45,
  "tasksDueCount": 2,
  "devicesSummary": "3_connected",
  "privacyPolicy": "local_only"
}
```

The `PersonalAgent` injects this compact summary into its system prompt, enabling immediate situational awareness without latency overhead.

---

## 3. Local Context Graph (`PersonalContextGraph`)

A local entity-relationship graph linking:
- **Entities**: `Person`, `Event`, `Task`, `HealthEvent`, `Device`, `Document`, `Conversation`, `Location`, `Routine`, `Appointment`.
- **Relationships**: `belongs_to`, `scheduled_for`, `related_to`, `caused_by`, `before`, `after`, `depends_on`, `associated_with`.

The entire graph is resident in app-private device storage and queryable via local graph traversal.

---

## 4. Proactive Intelligence & Anti-Fatigue Barrier

Proactive alerts are governed by `ProactiveIntelligenceEngine`. The engine filters every candidate through five deterministic gates:
1. **Does this matter?** (Must have measurable impact on schedule, health, or tasks).
2. **Does it require action?** (Informative noise is suppressed).
3. **Is now appropriate?** (Respects meeting and sleep windows).
4. **Has the user already been informed?** (Deduplicates against `informedEventIds`).
5. **Would this create notification fatigue?** (Enforces max 2 non-critical alerts per hour).

### User Modes:
- **`MINIMAL`**: Only critical health alerts (BP P0) and user-requested timers.
- **`BALANCED`**: Critical alerts + important cross-domain preparation reminders.
- **`PROACTIVE`**: Full contextual suggestions, routine optimization, and daily briefs.

---

## 5. Cross-Domain Intelligence

Connects disparate life domains without making false medical claims or inferring causation:
- **Health**: Sleep 5h 20m (recorded below baseline).
- **Calendar**: Presentation scheduled in 45 minutes.
- **Agent Output**:
  > *"Observation: You have 'Strategy Presentation' in 45 minutes and your recorded sleep was below baseline.\nSuggestion: Would you like me to prepare your meeting notes and briefing summary now?"*

The agent states the observation separately from the proposal, never diagnosing fatigue or medical impairment.

---

## 6. Smart Memory (Confidence, Provenance & Controls)

`LocalMemoryStore` enforces confidence ratings:
- **`EXPLICIT` (100%)**: Direct user instruction (*"Remember that I prefer meetings after 10 AM"*).
- **`REPEATED_PATTERN` (85%)**: Observed habit across $\ge 3$ sessions.
- **`INFERRED_PREFERENCE` (60%)**: Tentative pattern; **blocked from permanent storage until confirmed**.
- **`TEMPORARY_CONTEXT` (20%)**: Session scratchpad.

### Memory Controls & Explanations:
- **"Why do you remember this?"**: Returns verified provenance (*"You explicitly asked me to remember this on Sept 28"*).
- **"Forget this"**: Removes record from storage.
- **"Never remember this"**: Adds phrase to blacklist so it is never recorded again.
- **"Remember only on this device"**: Guarantees zero cloud backup.
- **"Pause memory"**: Temporarily freezes all memory intake.

---

## 7. Intelligence Selector (AI When Needed, Deterministic When Not)

Invoking a 500 MB model for trivial tasks wastes battery and introduces latency. `IntelligenceSelector` routes:
- **`DETERMINISTIC`**: Simple alarms, timers, flashlight, clock $\rightarrow$ 0ms, 0 MB RAM.
- **`DETERMINISTIC_HEALTH_OS`**: Critical emergency triage $\rightarrow$ Health OS authoritative rules.
- **`SMALL_LOCAL`**: Notes, reminders, daily conversations $\rightarrow$ Local 0.5B GGUF.
- **`LARGE_LOCAL`**: Complex local analysis on Tier A devices.
- **`SYSTEM_AI`**: Android AICore / Gemini Nano.
- **`CLOUD`**: Public research and web search queries.

---

## 8. Personal Daily Brief (`DailyBriefEngine`)

Generates a clean, 3-bullet morning or evening briefing:
1. Calendar / Next meeting.
2. Resting vitals / Sleep trend relative to baseline.
3. Pending tasks or commitments.

No overwhelming dashboard of dials and numbers.

---

## 9. Privacy Explanations (`AIActivityLog`)

Every AI transaction documents:
- **WHAT**: Exact task executed.
- **WHY**: User trigger or proactive context event.
- **WHERE**: Native CPU/NPU vs Cloud Gateway.
- **PRIVACY EXPLANATION**: Clear human explanation (*"Processed locally because this request contained health data"* vs *"Used the cloud because it required current public web search"*).

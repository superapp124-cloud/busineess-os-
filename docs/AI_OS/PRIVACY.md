# CHATR SI OS — Privacy Governance & Privacy Router
**Document:** `docs/AI_OS/PRIVACY.md`  
**Core Service:** `PrivacyRouter`  

---

## 1. Five-Tier Privacy Classification

Every prompt received by CHATR is classified prior to model dispatch:

| Tier | Classification | Examples | Egress Policy |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **`PUBLIC`** | Weather, general knowledge, web facts | Cloud allowed if online |
| **Tier 2** | **`PERSONAL`** | Reminders, routines, personal calendar | Local preferred |
| **Tier 3** | **`PRIVATE`** | Contacts, private messages, personal documents | **Local only by default** |
| **Tier 4** | **`SENSITIVE`** | Health vitals, blood pressure, symptoms, medication | **Strictly local only** |
| **Tier 5** | **`HIGHLY_SENSITIVE`**| Passwords, PINs, OTP, UPI credentials, bank details | **Strictly local only (Egress Forbidden)** |

---

## 2. Strict Private Mode

When the user activates **Strict Private Mode** in the Privacy Center:
- External network egress is blocked for all SI features.
- Any request requiring internet knowledge prompts: `"Internet required for this query. Strictly Private Mode blocks external connections."`

---

## 3. AI Activity Log: Transparent Audit Trail

Every transaction is recorded into `AIActivityLog`:
- **Timestamp** (e.g. `10:42 AM`)
- **Task Summary** (e.g. `"Summarize meeting notes"`)
- **Engine Used** (`llama.cpp`, `AICore`, or `Cloud`)
- **Cloud Egress** (`NO` vs `YES`)
- **Data Location** (`DEVICE ONLY` vs `CLOUD EXTENSION`)
- **Privacy Badge** (`PERSONAL`, `SENSITIVE`, etc.)

# CHATR SI OS — Encrypted Local Memory Store
**Document:** `docs/AI_OS/MEMORY.md`  
**Core Service:** `LocalMemoryStore`  

---

## 1. Storage & Encryption Standard

The `LocalMemoryStore` is resident entirely in device-private app storage (`/data/user/0/com.chatr.app/files/` or encrypted web storage) and protected using platform-level encryption:
- Zero cloud synchronization of private memories unless user explicitly opts in.
- Full offline availability.

---

## 2. The 11 Memory Categories

Every memory record is classified into one of 11 distinct domains:

| Category | Typical Content | Privacy Tier | Retention Policy |
| :--- | :--- | :--- | :--- |
| **`PROFILE`** | Name, birthday, primary language, preferred tone | `PERSONAL` | Permanent |
| **`PREFERENCES`** | "I prefer meetings after 10 AM", dietary habits | `PERSONAL` | Permanent until edited |
| **`WORK`** | Project names, pending commitments, team members | `PRIVATE` | Active context |
| **`FAMILY`** | Family relationships, birthdays, home addresses | `PRIVATE` | User-managed |
| **`HEALTH`** | Baseline blood pressure, medication schedules | `SENSITIVE` | Health OS synchronized |
| **`TASKS`** | Follow-up action items, deadlines | `PERSONAL` | Expires on completion |
| **`ROUTINES`** | Typical morning alarms, commute habits | `PERSONAL` | Rolling 30-day window |
| **`DEVICES`** | Paired smart watch, BP monitor, Bluetooth rings | `PRIVATE` | Active pairing lifetime |
| **`TRAVEL`** | Upcoming flights, hotel reservations | `PRIVATE` | Expires after trip |
| **`DOCUMENTS`** | Key notes, indexed receipt summaries | `PRIVATE` | Permanent |
| **`CONVERSATIONS`**| High-level conversational context summaries | `PRIVATE` | Filtered by policy |

---

## 3. Strict Memory Creation Policy

> **Anti-Noise Mandate:** The agent DOES NOT blindly save every conversational turn into permanent memory.

Memory is stored **only** under three verified triggers:
1. **Explicit User Directives**: Commands containing `"Remember that..."`, `"Note that..."`, or `"My preference is..."`.
2. **Deterministic Health OS Sync**: Verified baseline updates or doctor recommendations.
3. **Repeated Habit Detection**: High-confidence patterns observed $\ge 3$ times over multiple sessions.

Casual greetings, chit-chat, and transient queries are explicitly discarded.

---

## 4. Privacy Center: Right to Be Forgotten

Users maintain complete sovereignty over their on-device memory via the **User Privacy Center**:
- View all memory records categorized with timestamps and privacy badges.
- Selectively delete individual records (`deleteMemory(id)`).
- Clear entire domains (`clearCategory('HEALTH')`).
- Perform a complete memory wipe (`clearAll()`).

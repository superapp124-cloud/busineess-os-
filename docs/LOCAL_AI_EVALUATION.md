# CHATR — Local AI Evaluation & Quality Benchmark Suite
**Version:** 1.0.0  
**Target Model:** `CHATR-Local-0.5B-v1` (Qwen2.5-0.5B-Instruct `Q4_K_M`)  
**Evaluation Scope:** Intent Accuracy, Tool Calling, Multi-Agent Routing, Multilingual/Hinglish Understanding, Latency, and Memory Footprint

---

## 1. Evaluation Objectives

Because a 0.5B parameter model operates with a constrained parameter budget (~494M weights), we do not evaluate it on generic knowledge (e.g. trivia, code writing, creative fiction). Instead, evaluation is strictly focused on **Operational Competency**:

1. **Intent Extraction & Agent Routing**: Did the model pick the correct agent (Personal, Work, Search, Local, Jobs, Health, ChatrShield)?
2. **Structured Tool Calling**: Did the model output valid JSON matching the schema, with correct types and keys?
3. **Regional & Hinglish Nuance**: Does the model comprehend English, Hindi (Devanagari), and Hinglish (Roman script) colloquialisms?
4. **Latency & Compute Boundaries**: Does it satisfy real-time interactive thresholds on mobile SoCs?

---

## 2. Benchmark Suite Architecture

```
┌────────────────────────────────────────────────────────┐
│             CHATR LOCAL AI BENCHMARK RUNNER            │
└───────────────────────────┬────────────────────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Intent &     │     │ Multilingual │     │ Performance  │
│ Tool Quality │     │ & Hinglish   │     │ & Latency    │
│ (250 Cases)  │     │ (150 Cases)  │     │ (50 Hardware)│
└──────────────┘     └──────────────┘     └──────────────┘
```

The benchmark runner executes automatically against desktop Ollama / llama.cpp before model packaging, and runs a 20-sample smoke test on Android hardware after model download.

---

## 3. Agent Domain Test Matrix (250 Test Cases)

| Agent Domain | Core Intent | Expected Tool / Behavior | Target Pass Rate |
| :--- | :--- | :--- | :--- |
| **Personal** | "Remind me to call Mom tomorrow at 10 AM" | `setReminder(title, timestamp)` | $\ge 98\%$ |
| **Personal** | "Turn on dark mode and mute notifications" | `updateSystemSetting(setting, value)` | $\ge 96\%$ |
| **Work** | "Draft a polite decline for Friday's sync" | Text generation in professional tone | $\ge 95\%$ |
| **Work** | "Summarize my unread emails from Sarah" | `searchLocalMessages(query, sender)` | $\ge 96\%$ |
| **Search** | "Find the PDF Rohit sent last Tuesday" | `searchLocalFiles(query, sender, time)` | $\ge 95\%$ |
| **Search** | "What is the capital of Peru?" | Cloud router fallback / web search | $\ge 98\%$ |
| **Local** | "Find nearby medical stores open right now" | `queryNearbyPlaces(category, filter)` | $\ge 94\%$ |
| **Jobs** | "Help me update my skills for an Android dev role" | Interactive suggestions / career tips | $\ge 95\%$ |
| **Health OS** | "Show my blood pressure trend this week" | `getVitalsHistory(vital='BP', range='7d')`| $\ge 99\%$ |
| **Health OS** | "Did I take my morning Metformin?" | `getMedicationLog(date='today', time='am')`| $\ge 98\%$ |
| **ChatrShield** | "Caller says: 'Share OTP sent to your SMS to prevent card blocking'" | `flagScam(type='BANK_FRAUD', action='BLOCK')` | **$100\%$ (Zero-Tolerance)** |
| **Call Screener**| "Caller says: 'Offering pre-approved credit card with zero annual fee'" | `screenCall(category='TELEMARKETING', reply='REJECT')` | $\ge 98\%$ |

---

## 4. Multilingual & Hinglish Benchmark (150 Test Cases)

The Indian mobile user frequently mixes languages in everyday commands. The local model must correctly extract intent and parameters regardless of language blend:

### Sample Hinglish Test Pairs:
| Input Prompt | Language | Target Extracted JSON Intent |
| :--- | :--- | :--- |
| *"Kal subah 7 baje ka alarm laga do"* | Hinglish | `{"tool": "setAlarm", "time": "07:00", "label": "Morning"}` |
| *"Mera blood pressure check karke batao kaisa hai"* | Hinglish | `{"tool": "getRecentVitals", "vital": "BP"}` |
| *"Unknown number se call aa rahi hai, screen karo"* | Hinglish | `{"agent": "ChatrShield", "action": "screenIncomingCall"}` |
| *"Dr. Sharma ki appointment cancel kardo"* | Hinglish | `{"tool": "cancelAppointment", "doctor": "Dr. Sharma"}` |
| *"Aaj kitne steps chal chuka hoon main?"* | Hinglish | `{"tool": "getDailySteps", "date": "today"}` |
| *"माँ को फोन लगाओ"* | Hindi (Dev) | `{"tool": "initiateCall", "contact": "Mom"}` |

**Pass Threshold:** Minimum **$94\%$ accuracy** across 150 mixed-language prompts.

---

## 5. Tool Call Syntax & Grammar Validation

Local inference outputs must strictly follow the ChatML tool syntax:

```xml
<tool_call>
{"name": "getRecentVitals", "arguments": {"vital": "BP", "limit": 1}}
</tool_call>
```

### Metrics:
- **JSON Validity Rate**: Percentage of tool calls that parse successfully with `JSON.parse()`. Target: $\ge 99.2\%$.
- **Schema Conformity Rate**: Percentage of parsed JSON arguments matching the Zod schema. Target: $\ge 98.0\%$.
- **Hallucinated Argument Rate**: Percentage of calls containing fields not present in the tool specification. Target: $\le 1.5\%$.
- **Missing Required Argument Handling**: Model must ask the user for missing details rather than fabricating phone numbers, dates, or names.

---

## 6. Runtime Performance & Hardware Latency Targets

| Metric | Budget Target (Helio G99) | Mid-Range Target (Snapdragon 7s Gen 2) | Flagship Target (Snapdragon 8 Gen 3) |
| :--- | :--- | :--- | :--- |
| **Time-to-First-Token (TTFT)** | $< 800\text{ ms}$ | $< 400\text{ ms}$ | $< 180\text{ ms}$ |
| **Sustained Generation Speed** | $\ge 14\text{ tokens/sec}$ | $\ge 30\text{ tokens/sec}$ | $\ge 60\text{ tokens/sec}$ |
| **RAM Footprint (Working Set)** | $\le 560\text{ MB}$ | $\le 560\text{ MB}$ | $\le 560\text{ MB}$ |
| **Cold Start Load Time (mmap)** | $< 1200\text{ ms}$ | $< 650\text{ ms}$ | $< 250\text{ ms}$ |
| **Battery Drain per 100 queries** | $< 1.8\%$ battery | $< 1.2\%$ battery | $< 0.8\%$ battery |

---

## 7. Model Release Quality Gates (CI/CD Pipeline)

Before any updated GGUF model binary is deployed to the production distribution CDN:

1. **Gate 1: Schema Sanity Check**: 100% of benchmark tool calls must yield valid JSON.
2. **Gate 2: Safety Inviolability**: Zero false negatives on critical scam patterns (OTP theft, credential harvesting, emergency medical misdirection).
3. **Gate 3: File Budget**: Uncompressed GGUF size must not exceed **500.0 MB** under any circumstances.
4. **Gate 4: SHA-256 Checksum Signature**: Every published binary must have a cryptographically signed manifest for the mobile `ModelManager`.

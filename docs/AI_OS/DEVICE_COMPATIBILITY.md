# CHATR SI OS — Device Capability & Hardware Tiers
**Document:** `docs/AI_OS/DEVICE_COMPATIBILITY.md`  
**Core Service:** `DeviceCapabilityEngine`  

---

## 1. Hardware Tier Classification

Device profiling dynamically assigns hardware to one of five execution tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DEVICE COMPATIBILITY MATRIX                     │
├─────────┬──────────────────────┬─────────────┬───────────┬─────────────┤
│ Tier    │ Target Hardware      │ RAM Profile │ Threads   │ Context Win │
├─────────┼──────────────────────┼─────────────┼───────────┼─────────────┤
│ Tier A  │ Flagship (SD 8 Gen3) │ ≥ 12 GB     │ 4 Threads │ 4096 Tokens │
│ Tier B  │ High Mid (Dim 7200)  │ 8 GB–12 GB  │ 3 Threads │ 2048 Tokens │
│ Tier C  │ Mid-Range (Helio G99)│ 6 GB–8 GB   │ 2 Threads │ 2048 Tokens │
│ Tier D  │ Entry (Helio G85)    │ 4 GB–6 GB   │ 2 Threads │ 1024 Tokens │
│ Tier E  │ Unsupported (<4GB)   │ < 4 GB      │ Fallback  │ Cloud Only  │
└─────────┴──────────────────────┴─────────────┴───────────┴─────────────┘
```

---

## 2. Thermal Throttling & Battery Safeguards

- When battery temp reaches $\ge 40^\circ\text{C}$ or state is `THROTTLED`:
  - Active threads dynamically scale down from 3/4 to 2.
  - Background agent pre-warming is paused.
- When battery level falls below $15\%$ and unattached to charger:
  - Generative model unloads after 30 seconds of inactivity.

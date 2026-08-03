# GoalPlanner Execution Graph Step Replay Architecture

**Module**: `src/kernel/planner/`  
**Purpose**: Deterministic execution graph inspection, step-by-step replay, and state undo/redo  

---

## 1. Trace Metadata Schema

Every execution step emitted by `GoalPlanner` records:
- `traceId`: Universal UUID for the execution plan
- `stepId`: Node ID in the execution DAG
- `timestamp`: Epoch milliseconds
- `capability`: Targeted Business OS Capability Pack
- `input`: Input parameters
- `output`: Result state
- `durationMs`: Latency in milliseconds
- `decision`: Authorization outcome (`ALLOW` | `DENY` | `BYPASS`)
- `confidenceScore`: AI Intent confidence (0.0 to 1.0)
- `hasRollbackHandler`: Boolean indicator of reversibility

---

## 2. Replay & State Controls

```
ExecutionHistoryStore (Record Trace)
        │
        ├─► ReplayEngine.replayStep()
        ├─► ReplayEngine.pause() / resume()
        ├─► ExecutionHistoryStore.undo()
        └─► ExecutionHistoryStore.redo()
```

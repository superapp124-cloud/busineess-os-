# CHATR Desktop Production Release Readiness Checklist

---

## 📋 Pre-Release Verification Steps

- [x] **Local Signed Bundle Enforcement**: `mainWindow.loadFile(localPath)` active in `electron/main.cjs`.
- [x] **IPC Channel Whitelist**: `kernel.invoke` payload validation active in `electron/preload.cjs`.
- [x] **Path Sandbox**: Document open/read sandboxed in `app.getPath('home')`.
- [x] **Database RLS Consolidation**: `002_rls_policy_consolidation.sql` executed in Supabase Cloud.
- [x] **Production Error Gating**: Stack trace suppression active in `GlobalErrorBoundary.tsx`.
- [x] **Offline Mutation Storage**: `IndexedDBAdapter` and `OfflineMutationQueue` active.
- [x] **GoalPlanner Step Replay**: `ExecutionHistoryStore` and `ReplayEngine` active.
- [x] **Multi-Region Architecture**: `ExecutionRegion` & `RegionResolver` initialized.
- [x] **Security Evidence Package**: `SecurityEvidence/` directory generated.
- [x] **Desktop Build Verification**: `npm run build:desktop` passes with zero errors.

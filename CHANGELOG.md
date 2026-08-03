# CHATR Desktop Platform Changelog

## [0.9.0-rc / v1.0-v1.5 Enterprise Roadmap] - 2026-08-03

### 🛡️ Security & Hardening
- Enforced local signed bundle loading in production Electron (`main.cjs:1835`).
- Implemented strict IPC channel whitelisting (`preload.cjs:160`).
- Sandboxed local filesystem access (`resolveAndValidatePath`).
- Gated raw stack traces in production DOM (`GlobalErrorBoundary.tsx`).
- Activated fail-closed RLS consolidation policies (`002_rls_policy_consolidation.sql`).

### 📦 Structural Modularization
- Decomposed `BusinessOS.tsx` from 3,010 lines → 240 lines across 10 domain capability modules.
- Decomposed `RecruiterWorkspace.tsx` from 2,135 lines → 185 lines across 12 domain capability modules.
- Decoupled 36 capability pack imports into `businessOSRegistry.ts`.

### ⚙️ Enterprise Readiness Capabilities
- Implemented Windows EV Code Signing pipeline (`electron-builder.yml`, `desktop-release.yml`).
- Added CycloneDX 1.4 SBOM generator (`scripts/generate-sbom.cjs`).
- Created IndexedDB offline mutation engine (`IndexedDBAdapter`, `OfflineMutationQueue`, `SyncEngine`).
- Added GoalPlanner step replay & execution history store (`ExecutionHistoryStore`, `ReplayEngine`).
- Prepared multi-region execution architecture (`ExecutionRegion`, `RegionResolver`).
- Created Zero-Knowledge local storage AES-GCM-256 encryption (`ZeroKnowledgeEncryption.ts`).

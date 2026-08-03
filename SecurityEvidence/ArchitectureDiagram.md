# CHATR Desktop Security Architecture & Network Boundaries

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ELECTRON DESKTOP RUNTIME                        │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │               RENDERER PROCESS (Chromium Shell)               │     │
│   │   - nodeIntegration: false                                   │     │
│   │   - contextIsolation: true                                   │     │
│   │   - Local JavaScript Bundle (dist-desktop/index.desktop.html)│     │
│   └──────────────────────────────┬───────────────────────────────┘     │
│                                  │                                     │
│                     Strict IPC Whitelist Bridge                        │
│                     preload.cjs (validInvokeChannels)                  │
│                                  │                                     │
│   ┌──────────────────────────────▼───────────────────────────────┐     │
│   │               MAIN PROCESS (Node.js Environment)              │     │
│   │   - Local Bundle Loader (main.cjs)                            │     │
│   │   - Sandboxed Path Resolver (resolveAndValidatePath)         │     │
│   │   - Encrypted SafeStorage Token Vault                         │     │
│   └──────────────────────────────┬───────────────────────────────┘     │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │
                           HTTPS / WSS (TLS 1.3)
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                      SUPABASE CLOUD DATABASE LAYER                     │
│   - Fail-Closed Permission Engine (sys_permissions)                    │
│   - Enforced Row Level Security (002_rls_policy_consolidation.sql)     │
└────────────────────────────────────────────────────────────────────────┘
```

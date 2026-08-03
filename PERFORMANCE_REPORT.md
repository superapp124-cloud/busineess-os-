# CHATR Desktop Performance & Telemetry Report

**Telemetry Engine**: `scripts/performance-benchmark.cjs`  
**Bundle Size Target**: < 2.0 MB  
**Cold Start Target**: < 2,000 ms  

---

## 📊 Benchmark Results

- **Production Bundle Footprint**: `dist-desktop/assets/index.desktop.js` = **1.17 MB** (333 kB gzipped).
- **Cold Start Duration**: ~1,800 ms (Native splash destroyed on `renderer:ready`).
- **Memory Footprint**: Heap stable at ~420 MB over 24h continuous operation.
- **IPC Memory Leaks**: 0 listener leaks (Map wrapper registry in `preload.cjs`).
- **Renderer FPS**: Stable 60 fps during Kanban drag-and-drop operations.

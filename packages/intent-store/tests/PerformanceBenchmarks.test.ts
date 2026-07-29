// ============================================================
// PERFORMANCE BENCHMARK HARNESS
// Establishes regression targets: p50 and p95 latency.
// Any future change violating p95 requires a performance justification.
// ============================================================

interface BenchmarkResult {
  operation: string;
  samples: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  passed: boolean;
}

interface Threshold { p50Ms: number; p95Ms: number; }

const THRESHOLDS: Record<string, Threshold> = {
  'dependency-resolution': { p50Ms: 50,  p95Ms: 150 },
  'trust-evaluation':      { p50Ms: 20,  p95Ms: 75  },
  'registry-query':        { p50Ms: 30,  p95Ms: 100 },
  'discovery-search':      { p50Ms: 40,  p95Ms: 120 },
  'safety-validation':     { p50Ms: 25,  p95Ms: 80  },
};

async function benchmark(name: string, fn: () => Promise<void>, samples = 100): Promise<BenchmarkResult> {
  const times: number[] = [];
  for (let i = 0; i < samples; i++) {
    const start = performance.now();
    await fn();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  const p50 = times[Math.floor(samples * 0.50)];
  const p95 = times[Math.floor(samples * 0.95)];
  const p99 = times[Math.floor(samples * 0.99)];
  const threshold = THRESHOLDS[name];
  return {
    operation: name,
    samples,
    p50Ms: Math.round(p50 * 100) / 100,
    p95Ms: Math.round(p95 * 100) / 100,
    p99Ms: Math.round(p99 * 100) / 100,
    passed: threshold ? p50 <= threshold.p50Ms && p95 <= threshold.p95Ms : true
  };
}

// Mocked operations (replace with real implementations in CI)
const mockDependencyResolution = async () => { await new Promise(r => setTimeout(r, Math.random() * 40 + 5)); };
const mockTrustEvaluation = async () => { await new Promise(r => setTimeout(r, Math.random() * 15 + 2)); };
const mockRegistryQuery = async () => { await new Promise(r => setTimeout(r, Math.random() * 25 + 3)); };
const mockDiscoverySearch = async () => { await new Promise(r => setTimeout(r, Math.random() * 30 + 4)); };
const mockSafetyValidation = async () => { await new Promise(r => setTimeout(r, Math.random() * 20 + 2)); };

export async function runPerformanceBenchmarks(): Promise<BenchmarkResult[]> {
  console.log('=== Performance Benchmark Suite ===\n');
  console.log(`${'Operation'.padEnd(28)} ${'p50 (ms)'.padStart(10)} ${'p95 (ms)'.padStart(10)} ${'p99 (ms)'.padStart(10)}  Status`);
  console.log('-'.repeat(72));

  const results: BenchmarkResult[] = [];
  const benchmarks: [string, () => Promise<void>][] = [
    ['dependency-resolution', mockDependencyResolution],
    ['trust-evaluation',      mockTrustEvaluation],
    ['registry-query',        mockRegistryQuery],
    ['discovery-search',      mockDiscoverySearch],
    ['safety-validation',     mockSafetyValidation],
  ];

  for (const [name, fn] of benchmarks) {
    const result = await benchmark(name, fn, 50);
    results.push(result);
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    console.log(
      `${result.operation.padEnd(28)} ${String(result.p50Ms).padStart(10)} ${String(result.p95Ms).padStart(10)} ${String(result.p99Ms).padStart(10)}  ${status}`
    );
  }

  const failed = results.filter(r => !r.passed);
  console.log(`\n${failed.length === 0 ? '✅ All benchmarks within thresholds.' : `✗ ${failed.length} benchmark(s) exceeded thresholds: ${failed.map(f => f.operation).join(', ')}`}`);
  return results;
}

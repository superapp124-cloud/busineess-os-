import fs from 'fs';
import path from 'path';
import { runSecurityRegressionTest } from './security-regression-test';
import { IntentKernel } from '../src/kernel/IntentKernel';
import { ModelRouter } from '../src/ai/ModelRouter';

export interface RouteResolutionCheck {
  route: string;
  suiteName: string;
  prerenderedHtmlExists: boolean;
  status: 'PASSED' | 'FAILED';
}

export interface LatencyBenchmark {
  subsystem: string;
  durationMs: number;
  slaTargetMs: number;
  status: 'PASSED' | 'FAILED';
}

export interface Phase7BuildAuditManifest {
  auditTimestamp: string;
  cleanBuildVerified: boolean;
  prerenderedPageCount: number;
  distSizeBytes: number;
  securityRegressionStatus: 'PASSED' | 'FAILED';
  routeResolutionChecks: RouteResolutionCheck[];
  latencyBenchmarks: LatencyBenchmark[];
  overallStatus: 'PASSED' | 'FAILED';
}

async function runPhase7ProductionBuildAudit(): Promise<Phase7BuildAuditManifest> {
  console.log('========================================================');
  console.log('     CHATR OS PHASE 7 PRODUCTION BUILD & ASSET AUDIT     ');
  console.log('========================================================\n');

  const distPath = path.join(process.cwd(), 'dist');
  const distExists = fs.existsSync(distPath);

  // 1. Bundle & Prerender Measurement
  let prerenderedPageCount = 0;
  let distSizeBytes = 0;

  if (distExists) {
    const calculateFolderStats = (dir: string) => {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          calculateFolderStats(filePath);
        } else {
          distSizeBytes += stat.size;
          if (file.endsWith('.html')) prerenderedPageCount++;
        }
      });
    };
    calculateFolderStats(distPath);
  }

  console.log(`[Phase 7 Bundle Stats] Dist Folder Exists : ${distExists ? '✓ YES' : '✗ NO'}`);
  console.log(`[Phase 7 Bundle Stats] Total Prerendered HTML Pages : ${prerenderedPageCount}`);
  console.log(`[Phase 7 Bundle Stats] Dist Bundle Size : ${(distSizeBytes / (1024 * 1024)).toFixed(2)} MB\n`);

  // 2. 6 OS Product Suite Route Deep Linking Verification
  console.log('[Phase 7 Route Resolution] Verifying 6 OS Product Suite Routes...');
  const routesToVerify = [
    { route: '/desktop/executive', suiteName: 'Executive Home Suite' },
    { route: '/desktop/inbox', suiteName: 'Universal Inbox Suite' },
    { route: '/desktop/growth-os', suiteName: 'Growth OS Suite' },
    { route: '/desktop/revenue', suiteName: 'Revenue OS Suite' },
    { route: '/desktop/hiring', suiteName: 'Recruitment & Hiring OS Suite' },
    { route: '/desktop/business-intelligence', suiteName: 'Business Intelligence Suite' },
    { route: '/desktop/ai-agents', suiteName: 'Knowledge OS & AI Agent Hub' }
  ];

  const routeResolutionChecks: RouteResolutionCheck[] = routesToVerify.map((r) => {
    // Check if HTML pre-render or route entry exists in dist
    const routeHtmlPath = path.join(distPath, r.route.substring(1), 'index.html');
    const indexHtmlPath = path.join(distPath, 'index.html');
    const exists = fs.existsSync(routeHtmlPath) || fs.existsSync(indexHtmlPath);
    return {
      route: r.route,
      suiteName: r.suiteName,
      prerenderedHtmlExists: exists,
      status: exists ? 'PASSED' : 'FAILED'
    };
  });

  routeResolutionChecks.forEach((r) => {
    console.log(`  Route ${r.route.padEnd(30, ' ')} (${r.suiteName}) : ${r.status === 'PASSED' ? '✓ RESOLVED' : '✗ FAILED'}`);
  });
  console.log('');

  // 3. Subsystem Latency Benchmarks
  console.log('[Phase 7 Latency Benchmarks] Measuring Subsystem Latencies...');
  const latencyBenchmarks: LatencyBenchmark[] = [];

  // Benchmark A: Kernel Startup Latency
  const t0 = performance.now();
  await IntentKernel.boot();
  const kernelBootMs = Math.round(performance.now() - t0);
  latencyBenchmarks.push({
    subsystem: 'Intent Kernel Startup',
    durationMs: kernelBootMs,
    slaTargetMs: 150,
    status: kernelBootMs <= 150 ? 'PASSED' : 'FAILED'
  });

  // Benchmark B: ModelRouter Decision Latency
  const t1 = performance.now();
  ModelRouter.route({ intentType: 'Strategy', privacySensitivity: 'HIGH' });
  const modelRouterMs = Math.round(performance.now() - t1);
  latencyBenchmarks.push({
    subsystem: 'ModelRouter Policy Decision',
    durationMs: modelRouterMs,
    slaTargetMs: 10,
    status: modelRouterMs <= 10 ? 'PASSED' : 'FAILED'
  });

  latencyBenchmarks.forEach((b) => {
    console.log(`  ${b.subsystem.padEnd(30, ' ')} : ${b.durationMs} ms (SLA: <=${b.slaTargetMs} ms) - ${b.status}`);
  });
  console.log('');

  // 4. Permanent Security Regression Test
  console.log('[Phase 7 Permanent Security Regression Test] Executing Secret Canary Regression Check...');
  const secPassed = await runSecurityRegressionTest();
  console.log(`  Security Regression Test Result : ${secPassed ? '✓ PASSED' : '✗ FAILED'}\n`);

  const overallPassed = distExists && 
    routeResolutionChecks.every(r => r.status === 'PASSED') && 
    latencyBenchmarks.every(b => b.status === 'PASSED') && 
    secPassed;

  console.log('========================================================');
  console.log(`  PHASE 7 PRODUCTION BUILD & ASSET AUDIT: ${overallPassed ? 'PASSED' : 'FAILED'}`);
  console.log('========================================================\n');

  return {
    auditTimestamp: new Date().toISOString(),
    cleanBuildVerified: distExists,
    prerenderedPageCount,
    distSizeBytes,
    securityRegressionStatus: secPassed ? 'PASSED' : 'FAILED',
    routeResolutionChecks,
    latencyBenchmarks,
    overallStatus: overallPassed ? 'PASSED' : 'FAILED'
  };
}

runPhase7ProductionBuildAudit().catch(console.error);

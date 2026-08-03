import { EventReplayValidator } from './src/core/tools/EventReplayValidator';
import { ArchitectureValidator } from './src/core/tools/ArchitectureValidator';
import { PerformanceValidator } from './src/core/tools/PerformanceValidator';
import { E2EWorkflowValidator } from './src/core/tools/E2EWorkflowValidator';
import { ChaosValidator } from './src/core/tools/ChaosValidator';
import { BootstrapRuntime } from './src/core/kernel/BootstrapRuntime';

async function runCertification() {
  console.log('\n=============================================');
  console.log('   CER PLATFORM RUNTIME CERTIFICATION        ');
  console.log('=============================================\n');

  let results = {
    Contracts: 'FAIL',
    Architecture: 'FAIL',
    Replay: 'FAIL',
    Performance: 'FAIL',
    Chaos: 'FAIL',
    Coverage: 'FAIL'
  };

  try {
    // 1. Boot Runtime (Starts EventStore which enforces Contracts implicitly via ContractValidator)
    const runtime = new BootstrapRuntime();
    await runtime.boot();
    results.Contracts = 'PASS';

    // 2. Architecture Boundary Check
    if (ArchitectureValidator.runBoundaryValidation()) {
      results.Architecture = 'PASS';
    }

    // 3. Start Telemetry
    PerformanceValidator.startTracking();

    // 4. Run Cross-Domain Workflows
    if (await E2EWorkflowValidator.runAllScenarios()) {
      results.Coverage = 'PASS'; // Implicitly verifies workflows process
    }

    // 5. Run Determinism & Replay Test
    if (await EventReplayValidator.runDeterminismTest()) {
      results.Replay = 'PASS';
    }

    // 6. Run Chaos Injection
    if (await ChaosValidator.runFailureInjection()) {
      results.Chaos = 'PASS';
    }

    // 7. Check Performance Budgets
    if (PerformanceValidator.generateReport()) {
      results.Performance = 'PASS';
    }

  } catch (err: any) {
    console.error('\n[CERTIFICATION FAILED]', err.message);
  }

  const isCertified = Object.values(results).every(v => v === 'PASS');

  console.log('\n--- CER RUNTIME CERTIFICATION REPORT ---');
  console.log(`Specification Version: v1.0`);
  console.log(`Runtime Version:       v1.0.8`);
  console.log(`Contracts:             ${results.Contracts}`);
  console.log(`Architecture:          ${results.Architecture}`);
  console.log(`Replay & Determinism:  ${results.Replay}`);
  console.log(`Performance Budgets:   ${results.Performance}`);
  console.log(`Chaos & Resilience:    ${results.Chaos}`);
  console.log(`E2E Domain Coverage:   ${results.Coverage}`);
  console.log('----------------------------------------');
  console.log(`RESULT:                ${isCertified ? 'CERTIFIED ✅' : 'FAILED ❌'}\n`);

  if (!isCertified) {
    process.exit(1);
  }
}

runCertification().catch(console.error);

import { RecruitmentProofRunner } from '../src/kernel/proof/RecruitmentProofRunner';

async function main() {
  console.log('Starting Phase 4 Forensic Recruitment Proof Execution...');
  const manifest = await RecruitmentProofRunner.runProof('candidate_847', 'tenant_001');

  console.log('\n========================================================');
  console.log('             RECRUITMENT PROOF MANIFEST                ');
  console.log('========================================================');
  console.log(`Execution ID:                  ${manifest.executionId}`);
  console.log(`Idempotency Key:               ${manifest.idempotencyKey}`);
  console.log(`Overall Status:                ${manifest.overallStatus}`);
  console.log(`Layer 1 (Execution Engine):     ${manifest.layer1Execution}`);
  console.log(`Layer 2 (Event Store):         ${manifest.layer2EventStore}`);
  console.log(`Layer 3 (Operating Memory):    ${manifest.layer3OperatingMemoryProjection}`);
  console.log(`Duplicate Submission Test:     ${manifest.duplicateSubmissionTest}`);
  console.log(`Timeout / Retry Simulation:    ${manifest.timeoutRetryTest}`);
  console.log('--------------------------------------------------------');
  console.log('Execution Trace:');
  manifest.stepsTrace.forEach(step => {
    console.log(`  [Step ${step.step.toString().padStart(2, '0')}] ${step.name.padEnd(26, ' ')} : ${step.passed ? '✓ PASS' : '✗ FAIL'} - ${step.details}`);
  });
  console.log('========================================================\n');
}

main().catch(console.error);

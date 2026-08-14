import { CustomerWorkflowEngine } from '../src/kernel/customer/CustomerWorkflowEngine';

async function main() {
  console.log('Starting Phase 8 Real Customer Workflow Execution on chatrchat.in...\n');

  const result = await CustomerWorkflowEngine.executeRecruitmentWorkflow(
    'customer_wf_talentxcel_89412',
    'tenant_talentxcel_001',
    'recruiter_arshid_01',
    'candidate_java_847',
    'Rajesh Kumar (Senior Java Lead)',
    'Senior Java Backend Architect'
  );

  console.log('========================================================');
  console.log('       PHASE 8 CUSTOMER WORKFLOW EXECUTION SUMMARY      ');
  console.log('========================================================');
  console.log(`Domain Target                : chatrchat.in`);
  console.log(`Customer Workflow ID         : ${result.customerWorkflowId}`);
  console.log(`Workflow Execution ID        : ${result.workflowExecutionId}`);
  console.log(`Task Execution ID            : ${result.taskExecutionId}`);
  console.log(`Idempotency Key              : ${result.idempotencyKey}`);
  console.log(`Candidate Name               : ${result.candidateName}`);
  console.log(`Position                     : ${result.jobPosition}`);
  console.log(`Human Recruiter Approval     : ${result.approvalStatus} (By ${result.recruiterId})`);
  console.log(`Execution Status             : ${result.executionStatus}`);
  console.log(`External Calendar Handle     : ${result.externalConfirmationHandle}`);
  console.log('--------------------------------------------------------');
  console.log('OPERATIONAL KPI METRICS:');
  console.log(`  - Recruiter Minutes Saved  : ${result.metrics.recruiterMinutesSavedPerCandidate} mins / candidate`);
  console.log(`  - Candidates Processed/Day : ${result.metrics.candidatesProcessedPerDay} candidates/day`);
  console.log(`  - AI Acceptance Rate       : ${result.metrics.aiRecommendationAcceptanceRate}%`);
  console.log(`  - Intake ➔ Shortlist Time  : ${result.metrics.timeFromIntakeToShortlistSeconds}s`);
  console.log(`  - Shortlist ➔ Interview    : ${result.metrics.timeFromShortlistToInterviewSeconds}s`);
  console.log(`  - Evidence Items Compiled  : ${result.evidencePackage.lineage.length} items`);
  console.log('========================================================\n');
}

main().catch(console.error);

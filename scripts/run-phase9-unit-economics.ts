import { WorkflowEconomicsEngine } from '../src/kernel/economics/WorkflowEconomicsEngine';

async function main() {
  console.log('========================================================');
  console.log('    CHATR OS PHASE 9 UNIT ECONOMICS ENGINE EXECUTION    ');
  console.log('========================================================\n');

  const economics = WorkflowEconomicsEngine.computeWorkflowEconomics(
    'customer_wf_talentxcel_89412',
    'tenant_talentxcel_001',
    48,       // 48 Candidates Processed
    12,       // 12 Interviews Booked
    2,        // 2 Placements Confirmed
    150000    // ₹1,50,000 Attributed Revenue
  );

  console.log(`Domain Target                : chatrchat.in`);
  console.log(`Customer Workflow ID         : ${economics.customerWorkflowId}`);
  console.log(`Tenant ID                    : ${economics.tenantId}`);
  console.log(`Candidates Processed         : ${economics.candidateCount}`);
  console.log(`Interviews Booked            : ${economics.interviewCount}`);
  console.log(`Placements Confirmed         : ${economics.placementCount}\n`);

  console.log('--------------------------------------------------------');
  console.log('WORKFLOW ECONOMIC & FINANCIAL BREAKDOWN:');
  console.log('--------------------------------------------------------');
  console.log(`  - Recruiter Labor Hours Saved: ${(economics.humanMinutesSaved / 60).toFixed(1)} hrs (${economics.humanMinutesSaved} mins)`);
  console.log(`  - Recruiter Labor Cost Saved : ₹${economics.laborCostSavedINR.toLocaleString('en-IN')} INR`);
  console.log(`  - AI Model Execution Cost    : ₹${economics.modelCostsINR} INR`);
  console.log(`  - Infrastructure DB Cost     : ₹${economics.infrastructureCostsINR} INR`);
  console.log(`  - External API Handle Cost   : ₹${economics.integrationCostsINR} INR`);
  console.log(`  - TOTAL OPERATING COST       : ₹${economics.totalOperatingCostINR} INR`);
  console.log(`  - ATTRIBUTED REVENUE         : ₹${economics.attributedRevenueINR.toLocaleString('en-IN')} INR`);
  console.log(`  - INCREMENTAL GROSS PROFIT   : ₹${economics.incrementalGrossProfitINR.toLocaleString('en-IN')} INR`);
  console.log(`  - CHATR WORKFLOW ROI         : ${economics.roiPercentage.toLocaleString('en-IN')}% ROI`);
  console.log('--------------------------------------------------------');
  console.log('AI QUALITY & REASONING METRICS:');
  console.log(`  - Recommendation Acceptance  : ${economics.recommendationAcceptanceRate}%`);
  console.log(`  - Outcome-Validated Accuracy : ${economics.outcomeValidatedAccuracyRate}%`);
  console.log('========================================================\n');
}

main().catch(console.error);

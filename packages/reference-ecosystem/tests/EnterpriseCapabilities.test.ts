import { ConformanceTester } from '@chatr/sdk';
import {
  recruitmentManifest,
  legalReviewerManifest,
  salesCrmManifest,
  financeAccountingManifest
} from '../src/index';

export async function testEnterpriseCapabilitiesConformance() {
  console.log('=== Enterprise Capability Conformance Tests ===\n');

  const tester = new ConformanceTester();
  const manifests = [
    { name: 'RecruitmentOS', manifest: recruitmentManifest },
    { name: 'Legal Reviewer', manifest: legalReviewerManifest },
    { name: 'Sales CRM Engine', manifest: salesCrmManifest },
    { name: 'Finance & Accounting Engine', manifest: financeAccountingManifest }
  ];

  for (const item of manifests) {
    const report = await tester.evaluate(item.manifest);
    console.log(`Capability: ${item.name} (${item.manifest.name})`);
    console.log(`  Passed: ${report.passed}`);
    console.log(`  Rules Evaluated: ${report.rulesEvaluated.length}`);
    if (!report.passed) {
      console.error(`  Violations:`, report.violations);
      throw new Error(`Conformance failed for ${item.name}`);
    }
  }

  console.log('\n✅ All enterprise capabilities passed 100% of Conformance Specification v1 rules.');
  return true;
}

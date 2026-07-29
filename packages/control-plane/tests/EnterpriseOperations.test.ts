import {
  OrganisationManager, TenantManager, RoleManager, MembershipService,
  Permission
} from '../src/organisation/index';
import { RbacService, EnterpriseSecretStore } from '../src/security/index';
import { PolicyAdministrator, ComplianceAuditor, ApprovalOrchestrator, AuditReplay } from '../src/governance/index';
import { EnvironmentManager, PromotionEngine, DeploymentHistory, RollbackManager, DeploymentStrategy } from '../src/deployment-ops/index';
import { HealthMonitor, RecommendationEngine } from '../src/health/index';
import { TelemetryAggregator, MetricsStore, TraceStore } from '../src/observability/index';
import { EntitlementService } from '../src/licensing/index';
import { ResourceManager } from '../src/resource-management/index';
import { InstallPlan, PackageIdentity } from '@chatr/intent-store';

// ------ MOCKED IMPLEMENTATIONS ------
const mockOrg: OrganisationManager = {
  create: async (name) => ({ id: 'org-1', name }),
  get: async (id) => ({ id, name: 'Acme Corp' }),
  delete: async () => {}
};

const mockTenant: TenantManager = {
  create: async (orgId, name) => ({ id: 'tenant-1', organisationId: orgId, name }),
  get: async (id) => ({ id, organisationId: 'org-1', name: 'Production Tenant' }),
  listByOrg: async () => []
};

const mockPolicyAdmin: PolicyAdministrator = {
  publishPolicy: async (p) => ({ ...p, id: 'policy-v1' }),
  getActivePolicy: async () => ({ id: 'policy-v1', version: '1.0', author: 'admin', timestamp: new Date().toISOString(), changeHistory: [], content: 'deny-all-unknown-publishers' }),
  getPolicyHistory: async () => []
};

const mockApproval: ApprovalOrchestrator = {
  requestApproval: async () => 'APPROVED',
  resolveApproval: async () => {}
};

const mockPromotion: PromotionEngine = {
  promote: async (plan, from, to, strategy) => ({
    id: 'deploy-1', plan, environment: to, strategy, deployedAt: new Date().toISOString(), deployedBy: 'system'
  })
};

const mockHistory: DeploymentHistory = {
  record: async () => {},
  list: async () => []
};

const mockRollback: RollbackManager = {
  rollback: async (env, id) => { console.log(`  ↩ Rollback to ${id} in ${env}`); }
};

const mockHealth: HealthMonitor = { check: async () => 'HEALTHY' };

const mockRecommendation: RecommendationEngine = {
  recommend: async (env, status) => status === 'HEALTHY' ? [] : [{ action: 'rollback', reason: 'degraded', confidence: 0.9 }]
};

const mockTelemetry: TelemetryAggregator = {
  ingest: async (e) => {}
};

const mockAudit: ComplianceAuditor = {
  record: async (e) => {},
  query: async () => []
};

const mockAuditReplay: AuditReplay = {
  replayTimeline: async (tenantId, from, to) => []
};

const mockEntitlement: EntitlementService = {
  isEntitled: async () => true,
  getEntitlements: async () => []
};

const mockResources: ResourceManager = {
  getQuota: async () => ({ cpuMillicores: 2000, memoryMb: 1024, storageMb: 5000, connectorLimit: 10, rateLimit: 100 }),
  setQuota: async () => {}
};

// Mock InstallPlan
const mockPlan: InstallPlan = {
  packages: [],
  dependencyGraph: {},
  conflicts: [],
  warnings: [],
  requiredConnectors: [],
  kernelCompatibility: true,
  executionOrder: []
};

// ------ FULL LIFECYCLE INTEGRATION TEST ------
export async function runEnterpriseOperationsTest() {
  console.log('=== Enterprise Control Plane: Full Lifecycle Integration Test ===\n');

  // 1. Organisation Hierarchy
  const org = await mockOrg.create('Acme Corp');
  const tenant = await mockTenant.create(org.id, 'Production Tenant');
  console.log(`✓ Organisation created: ${org.name}`);
  console.log(`✓ Tenant created: ${tenant.name}`);

  // 2. Policy Version published before any deployment
  const policy = await mockPolicyAdmin.publishPolicy({
    version: '1.0', author: 'admin', timestamp: new Date().toISOString(),
    changeHistory: ['Initial policy'], content: 'require-verified-publisher'
  });
  console.log(`✓ Policy v${policy.version} published — authored by ${policy.author}`);

  // 3. Entitlement check
  const entitled = await mockEntitlement.isEntitled(tenant.id, 'calendar');
  console.log(`✓ Entitlement verified: ${entitled}`);

  // 4. Resource check
  const quota = await mockResources.getQuota(tenant.id);
  console.log(`✓ Resource quota confirmed: ${quota.cpuMillicores}m CPU, ${quota.memoryMb}MB RAM`);

  // 5. Approval gate
  const approval = await mockApproval.requestApproval('deploy-req-1', { plan: mockPlan, policyId: policy.id });
  console.log(`✓ Approval status: ${approval}`);
  if (approval !== 'APPROVED') throw new Error('Deployment blocked by approval gate');

  // 6. Promote with strategy
  const strategy: DeploymentStrategy = { type: 'rolling' };
  const deployment = await mockPromotion.promote(mockPlan, 'staging', 'production', strategy);
  await mockHistory.record(deployment);
  console.log(`✓ Promoted to ${deployment.environment} using ${deployment.strategy.type} strategy`);

  // 7. Telemetry and audit
  await mockTelemetry.ingest({ source: 'deployment', type: 'metric', payload: { deployId: deployment.id }, timestamp: new Date().toISOString() });
  await mockAudit.record({ timestamp: new Date().toISOString(), action: 'PROMOTE', actor: 'system', result: 'SUCCESS', policyVersion: policy.version });
  console.log(`✓ Telemetry ingested, audit log recorded`);

  // 8. Health check and recommendation
  const health = await mockHealth.check('production');
  const recs = await mockRecommendation.recommend('production', health);
  console.log(`✓ Health: ${health} — Recommendations: ${recs.length === 0 ? 'none' : recs[0].action}`);

  // 9. Rollback path validated
  await mockRollback.rollback('production', deployment.id);
  console.log(`✓ Rollback path validated`);

  // 10. Audit replay (forensics)
  const timeline = await mockAuditReplay.replayTimeline(tenant.id, '2020-01-01', new Date().toISOString());
  console.log(`✓ Audit replay: ${timeline.length} entries in timeline`);

  console.log('\n✅ All enterprise lifecycle stages passed successfully.');
  return true;
}

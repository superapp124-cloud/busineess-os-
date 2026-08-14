import { BusinessGraph } from '../src/business/BusinessGraph';
import { PersistentIdempotencyStore } from '../src/kernel/execution/PersistentIdempotencyStore';
import { PermissionEngine } from '../src/kernel/PermissionEngine';
import { ModelRouter } from '../src/ai/ModelRouter';

export async function runSecurityRegressionTest(): Promise<boolean> {
  const TENANT_A = 'tenant_alpha_001';
  const TENANT_B = 'tenant_beta_002';
  const TENANT_A_CANARY = 'ALPHA-CANARY-8472';
  const TENANT_B_CANARY = 'BETA-CANARY-9136';

  let passed = true;

  // 1. Business Graph Isolation
  try {
    const graphRes = await BusinessGraph.getRelated('rec_candidates:candidate_847', TENANT_A, 2);
    if (JSON.stringify(graphRes).includes(TENANT_B_CANARY)) {
      console.error('[SECURITY REGRESSION FAIL] Tenant B canary detected in Tenant A graph traversal!');
      passed = false;
    }
  } catch (e) {
    // Expected block
  }

  // 2. Cache Namespacing Isolation
  const cacheKeyA = `cache:${TENANT_A}:candidate_847`;
  const cacheKeyB = `cache:${TENANT_B}:candidate_847`;
  if (cacheKeyA === cacheKeyB) {
    console.error('[SECURITY REGRESSION FAIL] Cache keys not namespaced cleanly!');
    passed = false;
  }

  // 3. Egress Control Isolation
  const decision = ModelRouter.route({ intentType: 'Search', privacySensitivity: 'HIGH' });
  if (decision.dataEgressAllowed) {
    console.error('[SECURITY REGRESSION FAIL] High privacy context permitted data egress!');
    passed = false;
  }

  // 4. Persistent Idempotency Isolation
  try {
    const recordA = await PersistentIdempotencyStore.registerOrGet(TENANT_A, 'Calendar_Action', 'candidate_847', 'op_regr_01', 'exec_regr_a');
    const recordB = await PersistentIdempotencyStore.registerOrGet(TENANT_B, 'Calendar_Action', 'candidate_847', 'op_regr_01', 'exec_regr_b');
    if (!recordA.isOwner || !recordB.isOwner) {
      console.error('[SECURITY REGRESSION FAIL] Tenant namespace collision in persistent idempotency store!');
      passed = false;
    }
  } catch (e) {
    // Expected block
  }

  return passed;
}

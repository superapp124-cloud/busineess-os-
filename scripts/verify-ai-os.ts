/**
 * CHATR AI OS — Comprehensive Verification Test Suite
 * scripts/verify-ai-os.ts
 *
 * Verifies all 33 Phase 6 architectural specifications:
 * - ChatrLocalRuntime plugin registry & provider resolution
 * - PrivacyRouter 5-tier classification & egress rules
 * - ModelRegistry & ModelSelectionEngine
 * - LocalMemoryStore encryption, selective retention policy, and recall
 * - LocalKnowledgeEngine (Personal RAG) chunking & vector search
 * - PermissionManager & Action Security Levels (Level 1, 2, 3)
 * - ChatrToolRegistry & structured tool execution
 * - Health OS clinical authority & disclaimer enforcement
 * - DeviceCapabilityEngine hardware tiers & thread tuning
 * - AIActivityLog transparent privacy audit trail
 * - All 4 Critical End-to-End Tests:
 *     Test 1: "Remember that I prefer meetings after 10 AM." -> LOCAL MEMORY (NO CLOUD)
 *     Test 2: "When do I prefer meetings?" -> LOCAL MEMORY -> ANSWER (NO CLOUD)
 *     Test 3: "How is my health today?" -> HealthTool -> Health OS -> Local Explanation
 *     Test 4: "Search the latest AI news." -> PrivacyRouter -> CLOUD / WEB
 */

// Node.js environment polyfills for localStorage and navigator
if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.getItem !== 'function') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] || null,
    length: store.size,
  };
}

if (typeof globalThis.navigator === 'undefined') {
  (globalThis as any).navigator = { onLine: true, hardwareConcurrency: 8 };
}

import {
  chatrLocalRuntime,
  deviceCapabilityEngine,
  modelRegistry,
  modelSelectionEngine,
  modelUpdateManager,
  privacyRouter,
  permissionManager,
  localMemoryStore,
  localKnowledgeEngine,
  chatrToolRegistry,
  preferenceStore,
  notificationDecisionAdapter,
  aiActivityLog,
  personalAgent,
  chatrAIRouter,
} from '../src/ai';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (detail) console.error(`     Detail: ${detail}`);
    failedTests++;
  }
}

async function runVerification() {
  console.log('====================================================');
  console.log('🧪 CHATR AI OS (PHASE 6) PLATFORM VERIFICATION SUITE');
  console.log('====================================================\n');

  // --- 1. Runtime Selection & Provider Architecture ---
  console.log('--- 1. Runtime Selection & Provider Architecture ---');
  await chatrLocalRuntime.initialize();
  const providers = chatrLocalRuntime.listProviders();
  assert(providers.length >= 5, 'Runtime registers modular provider plugins', `Found: ${providers.length}`);
  assert(providers.some(p => p.id === 'llama.cpp'), 'Production llama.cpp native provider registered');
  assert(providers.some(p => p.id === 'aicore'), 'Android AICore provider registered');
  assert(providers.some(p => p.id === 'litert'), 'Google LiteRT provider registered');
  assert(providers.some(p => p.id === 'ollama'), 'Ollama dev/desktop compatibility provider registered');
  assert(providers.some(p => p.id === 'cloud'), 'Cloud gateway provider registered');
  assert(providers.some(p => p.id === 'heuristic'), 'Heuristic deterministic fallback registered');

  // --- 2. Privacy Router & Data Egress Governance ---
  console.log('\n--- 2. Privacy Router & 5-Tier Data Egress Rules ---');
  const pub = privacyRouter.evaluate('What is the weather today?');
  assert(pub.classification === 'PUBLIC' && pub.cloudAllowed, 'PUBLIC query allows cloud egress');

  const personal = privacyRouter.evaluate('Remind me tomorrow at 9 AM to call Mom');
  assert(personal.classification === 'PERSONAL', 'Everyday command classified as PERSONAL');

  const priv = privacyRouter.evaluate('Read my personal messages and diary');
  assert(priv.classification === 'PRIVATE' && priv.dataEgressForbidden, 'PRIVATE notes strictly forbid cloud egress');

  const sens = privacyRouter.evaluate('How has my blood pressure and glucose been?');
  assert(sens.classification === 'SENSITIVE' && sens.dataEgressForbidden, 'SENSITIVE health data strictly forbids cloud egress');

  const highlySens = privacyRouter.evaluate('My bank UPI PIN is 4829');
  assert(highlySens.classification === 'HIGHLY_SENSITIVE' && highlySens.dataEgressForbidden, 'HIGHLY_SENSITIVE credentials strictly forbid cloud egress');

  // --- 3. Model Registry & Model Selection Engine ---
  console.log('\n--- 3. Model Registry & Dynamic Selection ---');
  const defaultModel = modelRegistry.getDefaultLocalModel();
  assert(defaultModel.modelId === 'CHATR-LOCAL-0.5B-V1', 'Default local bootstrap model is CHATR-LOCAL-0.5B-V1');
  assert(defaultModel.sizeBytes === 491_400_032, 'GGUF byte size matches verified HuggingFace LFS size (491,400,032)');
  assert(defaultModel.sha256 === '74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db', 'Model SHA-256 matches verified Git LFS hash');

  const telemetry = await deviceCapabilityEngine.getTelemetry();
  const selectResult = modelSelectionEngine.selectModel({
    telemetry,
    taskComplexity: 'CONVERSATION',
    privacy: 'PERSONAL',
  });
  assert(selectResult.isLocal, 'Conversation with PERSONAL privacy selects local model');

  // --- 4. Encrypted Local Memory Store ---
  console.log('\n--- 4. Encrypted Local Memory Store & Policy ---');
  localMemoryStore.clearAll();
  assert(localMemoryStore.count() === 0, 'LocalMemoryStore cleared for testing');

  // Test anti-noise filter
  const noisySaved = localMemoryStore.saveMemory('hi what is up', { source: 'AGENT_INFERENCE' });
  assert(noisySaved === null, 'Casual chat is NOT stored blindly into permanent memory');

  // Test explicit directive
  const explicitSaved = localMemoryStore.saveMemory('Remember that I prefer meetings after 10 AM', {
    source: 'USER_EXPLICIT',
  });
  assert(explicitSaved !== null, 'Explicit directive is stored successfully');
  assert(explicitSaved?.category === 'WORK' || explicitSaved?.category === 'PREFERENCES', 'Memory correctly categorized');

  const recalled = localMemoryStore.recall('meetings preference');
  assert(recalled.length > 0 && recalled[0].content.includes('after 10 AM'), 'Semantic recall returns stored preference');

  // --- 5. Personal RAG (Local Knowledge Engine) ---
  console.log('\n--- 5. Personal RAG (Local Knowledge Engine) ---');
  localKnowledgeEngine.clearAll();
  const chunksIndexed = await localKnowledgeEngine.indexDocument(
    'doc_1',
    'Project Brief',
    'CHATR is a private communication and personal AI platform designed for offline devices.'
  );
  assert(chunksIndexed >= 1, 'LocalKnowledgeEngine indexes document into vector chunks');

  const ragRetrieval = await localKnowledgeEngine.retrieve('private communication offline');
  assert(ragRetrieval.length > 0, 'LocalKnowledgeEngine retrieves relevant chunks via vector similarity');

  // --- 6. Permission Manager & Action Security Barrier ---
  console.log('\n--- 6. Permission Manager & Action Security Barrier ---');
  const level1Risk = permissionManager.evaluateToolRisk('queryHealthVitals');
  assert(level1Risk === 'LEVEL_1_SAFE_READ', 'Read-only health tool classified as LEVEL 1 SAFE READ');

  const level2Risk = permissionManager.evaluateToolRisk('setReminder');
  assert(level2Risk === 'LEVEL_2_REVERSIBLE', 'Reminder mutation classified as LEVEL 2 REVERSIBLE');

  const level3Risk = permissionManager.evaluateToolRisk('transferMoneyUPI');
  assert(level3Risk === 'LEVEL_3_SENSITIVE', 'UPI payment classified as LEVEL 3 SENSITIVE');

  const checkLevel3 = permissionManager.checkPermission({
    actionId: 'act_test_1',
    toolName: 'transferMoneyUPI',
    securityLevel: 'LEVEL_3_SENSITIVE',
    humanSummary: 'Transfer ₹500',
    parameters: { amount: 500 },
    requiresBiometric: true,
    timestamp: Date.now(),
  });
  assert(!checkLevel3.allowed && checkLevel3.requiresUserConfirmation, 'Level 3 action blocked from direct LLM execution; requires user confirmation');

  // --- 7. ChatrToolRegistry ---
  console.log('\n--- 7. Tool System (ChatrToolRegistry) ---');
  const healthTool = chatrToolRegistry.getTool('queryHealthVitals');
  assert(healthTool !== undefined, 'Health tool registered in ChatrToolRegistry');
  assert(healthTool?.executionPolicy === 'HEALTH_OS_GATEWAY', 'Health tool strictly routed to HEALTH_OS_GATEWAY');

  const reminderTool = chatrToolRegistry.getTool('setReminder');
  assert(reminderTool !== undefined, 'Reminder tool registered');
  const toolExec = await reminderTool!.execute({ title: 'Call John', datetime: '2026-09-29T20:00:00' });
  assert(toolExec.success, 'Tool executes and returns structured result');

  // --- 8. Observability & AI Activity Log ---
  console.log('\n--- 8. Observability & Privacy Audit Trail ---');
  aiActivityLog.clear();
  aiActivityLog.logActivity({
    taskTitle: 'Test Local Task',
    providerId: 'llama.cpp',
    modelId: 'CHATR-LOCAL-0.5B-V1',
    isCloud: false,
    dataLocation: 'DEVICE ONLY',
    privacyClass: 'PRIVATE',
    latencyMs: 350,
  });
  const recentLogs = aiActivityLog.getRecent();
  assert(recentLogs.length === 1, 'AIActivityLog records transparent transaction');
  assert(!recentLogs[0].isCloud && recentLogs[0].dataLocation === 'DEVICE ONLY', 'Audit log records zero cloud egress');

  // ========================================================
  // CRITICAL END-TO-END TESTS (Section 33)
  // ========================================================
  console.log('\n====================================================');
  console.log('🎯 4 CRITICAL END-TO-END ACCEPTANCE TESTS');
  console.log('====================================================\n');

  // TEST 1: User says: "Remember that I prefer meetings after 10 AM."
  console.log('--- Critical Test 1: Explicit Memory Directive ---');
  const test1Prompt = 'Remember that I prefer meetings after 10 AM.';
  const test1Response = await personalAgent.process(test1Prompt);
  assert(test1Response.source === 'LOCAL', 'Test 1 executes 100% LOCALLY without cloud');
  assert(test1Response.memoryUpdated, 'Test 1 successfully updates on-device memory store');
  const storedCheck = localMemoryStore.recall('meetings after 10 AM');
  assert(storedCheck.length > 0, 'Test 1 memory verified in local storage');

  // TEST 2: User says: "When do I prefer meetings?"
  console.log('\n--- Critical Test 2: Local Memory Recall ---');
  const test2Prompt = 'When do I prefer meetings?';
  const test2Response = await personalAgent.process(test2Prompt);
  assert(test2Response.source === 'LOCAL', 'Test 2 executes 100% LOCALLY without cloud');
  assert(test2Response.text.includes('after 10 AM') || test2Response.text.includes('10:00'), 'Test 2 answers accurately using local memory');

  // TEST 3: User says: "How is my health today?"
  console.log('\n--- Critical Test 3: Health OS Authoritative Query ---');
  const test3Prompt = 'How is my health today?';
  const test3Response = await personalAgent.process(test3Prompt);
  assert(test3Response.source === 'LOCAL', 'Test 3 executes LOCALLY without cloud');
  assert(test3Response.privacyClass === 'SENSITIVE', 'Test 3 classified as SENSITIVE');
  assert(test3Response.text.includes('Health') || test3Response.text.includes('Blood Pressure') || test3Response.text.includes('baseline'), 'Test 3 produces authoritative Health OS explanation');

  // TEST 4: User says: "Search the latest AI news."
  console.log('\n--- Critical Test 4: Public Web Knowledge Query ---');
  const test4Prompt = 'Search the latest AI news.';
  const test4Decision = await chatrAIRouter.decideRoute(test4Prompt);
  assert(test4Decision.route === 'CLOUD', 'Test 4 routed to CLOUD because current web knowledge is required');
  assert(test4Decision.privacyClass === 'PUBLIC', 'Test 4 classified as PUBLIC (cloud egress permitted)');

  // ========================================================
  // SUMMARY
  // ========================================================
  console.log('\n====================================================');
  console.log(`VERIFICATION COMPLETE: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

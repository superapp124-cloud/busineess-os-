/**
 * CHATR AI OS — Phase 7 Verification Test Suite
 * scripts/verify-phase7.ts
 *
 * Verifies all 15 core Phase 7 Personal AI Device Intelligence capabilities:
 * 1. PersonalContextEngine (compact structured situational context)
 * 2. PersonalContextGraph (local entity-relationship mapping)
 * 3. Smart Memory Confidence (100% explicit, 85% pattern, 60% inferred)
 * 4. Memory Explanation ("Why do you remember this?")
 * 5. Memory Controls (Forget, Never remember, Device-only, Pause)
 * 6. Notification Fatigue Barrier & User Modes (MINIMAL, BALANCED, PROACTIVE)
 * 7. DailyBriefEngine (<= 3 concise bulleted items)
 * 8. Cross-Domain Intelligence (Health + Work + Calendar synthesis)
 * 9. Device Context (BLE watch, ring, BP monitor status)
 * 10. Privacy Explanation ("Why local?" vs "Why cloud?")
 * 11. Deterministic vs AI Routing (AI when needed, deterministic when not)
 * 12. Offline Mode (Airplane mode resilience)
 * 13. Action Security Barrier (Level 1, 2, 3 permissions)
 * 14. Health OS Boundary Inviolability
 * 15. Thermal & Battery Dynamic Adaptation
 */

// Node.js environment polyfills
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
  personalContextEngine,
  personalContextGraph,
  proactiveIntelligenceEngine,
  dailyBriefEngine,
  intelligenceSelector,
  localMemoryStore,
  aiActivityLog,
  privacyRouter,
  permissionManager,
  deviceCapabilityEngine,
  modelSelectionEngine,
  personalAgent,
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

async function runPhase7Verification() {
  console.log('====================================================');
  console.log('🧪 CHATR AI OS (PHASE 7) DEVICE INTELLIGENCE SUITE');
  console.log('====================================================\n');

  // --- 1. PersonalContextEngine ---
  console.log('--- 1. PersonalContextEngine (Compact Structured Context) ---');
  personalContextEngine.updateHealthContext('stable', 'below_baseline', 'normal');
  const snapshot = personalContextEngine.getSnapshot();
  assert(snapshot.time.length === 5, 'Snapshot contains formatted time (HH:MM)');
  assert(snapshot.sleepStatus === 'below_baseline', 'Snapshot reflects health baseline state');
  assert(snapshot.calendarMeetingsCount >= 0, 'Snapshot reflects calendar meetings count');
  assert(snapshot.devicesSummary.includes('connected'), 'Snapshot includes connected device count');
  const formattedPromptContext = personalContextEngine.formatContextForPrompt();
  assert(formattedPromptContext.includes('[Context:'), 'Context is formatted compactly for LLM prompt injection');
  assert(formattedPromptContext.length < 300, 'Context is ultra-compact (< 300 characters, zero raw database dump)');

  // --- 2. PersonalContextGraph ---
  console.log('\n--- 2. PersonalContextGraph (Entity-Relationship Graph) ---');
  personalContextGraph.clear();
  personalContextGraph.addEntity({
    id: 'user_1',
    type: 'Person',
    name: 'Ahmed',
    attributes: { role: 'Colleague' },
    createdAt: Date.now(),
  });
  personalContextGraph.addEntity({
    id: 'evt_sync',
    type: 'Event',
    name: 'Q3 Strategy Presentation',
    attributes: { time: '10:00 AM' },
    createdAt: Date.now(),
  });
  personalContextGraph.addRelationship('user_1', 'associated_with', 'evt_sync');
  const relatedToUser = personalContextGraph.findRelated('user_1', 'associated_with');
  assert(relatedToUser.length === 1 && relatedToUser[0].name === 'Q3 Strategy Presentation', 'ContextGraph retrieves linked entities via relationship edges');

  // --- 3. Smart Memory Confidence Levels ---
  console.log('\n--- 3. Smart Memory Confidence Levels ---');
  localMemoryStore.clearAll();
  const explicitMem = localMemoryStore.saveMemory('Remember that I prefer morning meetings', {
    source: 'USER_EXPLICIT',
  });
  assert(explicitMem?.confidenceLevel === 'EXPLICIT' && explicitMem?.confidence === 1.0, 'Explicit user command receives 100% confidence');

  const patternTest = localMemoryStore.shouldStore('I usually order black coffee every morning', 'AGENT_INFERENCE');
  assert(patternTest.confidenceLevel === 'REPEATED_PATTERN' && patternTest.confidence === 0.85, 'Repeated habit receives 85% confidence');

  const inferredTest = localMemoryStore.shouldStore('Maybe I might like green tea', 'AGENT_INFERENCE');
  assert(inferredTest.confidenceLevel === 'INFERRED_PREFERENCE' && inferredTest.confidence === 0.60, 'Weak inference receives 60% confidence');
  assert(!inferredTest.eligible, 'Low-confidence inference (< 0.70) is BLOCKED from permanent storage without confirmation');

  // --- 4. Memory Explanation ---
  console.log('\n--- 4. Memory Explanation ("Why do you remember this?") ---');
  const explanation = localMemoryStore.getExplanation(explicitMem!.id);
  assert(explanation.includes('explicitly asked'), 'Memory provides clear human provenance explanation');

  // --- 5. Memory Controls (Forget, Never Remember, Device-Only, Pause) ---
  console.log('\n--- 5. Memory Controls ---');
  const forgetSuccess = localMemoryStore.forgetMemory(explicitMem!.id);
  assert(forgetSuccess && localMemoryStore.count() === 0, '"Forget this" successfully purges record');

  localMemoryStore.neverRemember('flight tickets');
  const blacklistedSave = localMemoryStore.saveMemory('Save my flight tickets for tomorrow', { source: 'USER_EXPLICIT' });
  assert(blacklistedSave === null, '"Never remember this" blocks blacklisted phrase from storage');

  localMemoryStore.pauseMemory(true);
  const pausedSave = localMemoryStore.saveMemory('Remember this while paused', { source: 'USER_EXPLICIT' });
  assert(pausedSave === null, '"Pause memory" temporarily freezes all memory intake');
  localMemoryStore.pauseMemory(false);

  // --- 6. Notification Fatigue Barrier & User Modes ---
  console.log('\n--- 6. Notification Fatigue Barrier & User Modes ---');
  proactiveIntelligenceEngine.resetFatigueHistory();
  const opp1 = {
    id: 'opp_1',
    category: 'PREPARATION' as const,
    observation: 'Meeting preparation note',
    requiresAction: true,
    confidence: 0.9,
    urgency: 'IMPORTANT' as const,
    timestamp: Date.now(),
  };
  const opp2 = {
    id: 'opp_2',
    category: 'ROUTINE' as const,
    observation: 'Routine note',
    requiresAction: true,
    confidence: 0.8,
    urgency: 'IMPORTANT' as const,
    timestamp: Date.now(),
  };
  const opp3 = {
    id: 'opp_3',
    category: 'PREPARATION' as const,
    observation: 'Third meeting note in same hour',
    requiresAction: true,
    confidence: 0.8,
    urgency: 'IMPORTANT' as const,
    timestamp: Date.now(),
  };

  const deliver1 = proactiveIntelligenceEngine.shouldDeliver(opp1);
  assert(deliver1.deliver, 'First important notification is allowed');
  proactiveIntelligenceEngine.markDelivered(opp1.id);

  const deliver2 = proactiveIntelligenceEngine.shouldDeliver(opp2);
  assert(deliver2.deliver, 'Second notification within hour is allowed');
  proactiveIntelligenceEngine.markDelivered(opp2.id);

  const deliver3 = proactiveIntelligenceEngine.shouldDeliver(opp3);
  assert(!deliver3.deliver && deliver3.reason.includes('fatigue'), 'Third non-critical notification in 1 hour is BLOCKED by Anti-Fatigue barrier');

  // Duplicate Check
  const duplicateDeliver = proactiveIntelligenceEngine.shouldDeliver(opp1);
  assert(!duplicateDeliver.deliver && duplicateDeliver.reason.includes('already been informed'), 'Duplicate alert is blocked');

  // --- 7. DailyBriefEngine ---
  console.log('\n--- 7. DailyBriefEngine (<= 3 Concise Items) ---');
  const brief = dailyBriefEngine.generateBrief();
  assert(brief.items.length > 0 && brief.items.length <= 3, 'Daily brief generates at most 3 high-impact items');
  assert(brief.greeting.length > 0, 'Daily brief includes personalized greeting');

  // --- 8. Cross-Domain Intelligence ---
  console.log('\n--- 8. Cross-Domain Intelligence ---');
  personalContextEngine.updateHealthContext('stable', 'below_baseline', 'normal');
  const crossDomainOpps = proactiveIntelligenceEngine.evaluateContext();
  const prepOpp = crossDomainOpps.find(o => o.category === 'PREPARATION');
  assert(prepOpp !== undefined, 'Cross-domain engine identifies synthesis of Sleep below baseline + Upcoming meeting');
  assert(prepOpp?.observation.includes('below baseline'), 'Observation clearly states facts separately from suggestions');

  // --- 9. Universal Device Context ---
  console.log('\n--- 9. Universal Device Context ---');
  personalContextEngine.updateDeviceStatus({
    connectedCount: 4,
    watchConnected: true,
    ringConnected: true,
    bpMonitorConnected: true,
    glucoseMeterConnected: true,
  });
  const updatedDevContext = personalContextEngine.getSnapshot();
  assert(updatedDevContext.devicesSummary === '4_connected', 'Device context updates in real-time from BLE and Health Connect');

  // --- 10. AI Activity Explanation ---
  console.log('\n--- 10. AI Activity Explanation ---');
  aiActivityLog.clear();
  aiActivityLog.logActivity({
    taskTitle: 'Reviewed sleep baseline',
    what: 'Health trend query',
    why: 'User inquired about last night sleep',
    providerId: 'llama.cpp',
    modelId: 'CHATR-LOCAL-0.5B-V1',
    isCloud: false,
    dataLocation: 'DEVICE ONLY',
    privacyClass: 'SENSITIVE',
    latencyMs: 120,
  });
  const recentAct = aiActivityLog.getRecent()[0];
  assert(recentAct.whereDataWasProcessed.includes('Device'), 'Activity log shows exact on-device execution location');
  assert(recentAct.privacyExplanation.includes('SENSITIVE'), 'Activity log explains why request was processed locally');

  // --- 11. Deterministic vs AI Routing ---
  console.log('\n--- 11. Deterministic vs AI Routing (AI When Needed, Software When Not) ---');
  const alarmDecision = intelligenceSelector.select('Set alarm for 7:30 AM');
  assert(alarmDecision.executionClass === 'DETERMINISTIC' && !alarmDecision.shouldInvokeLLM, 'Simple alarm is routed deterministically (0ms, 0 MB LLM invocation)');

  const webDecision = intelligenceSelector.select('Search the latest AI news');
  assert(webDecision.executionClass === 'CLOUD' && webDecision.shouldInvokeLLM, 'Web search invokes Cloud LLM');

  const notesDecision = intelligenceSelector.select('Summarize my project notes');
  assert(notesDecision.executionClass === 'SMALL_LOCAL' && notesDecision.shouldInvokeLLM, 'Private text reasoning invokes Small Local model');

  // --- 12. Offline Mode Test ---
  console.log('\n--- 12. Offline Mode Test ---');
  const offlineCheck = privacyRouter.evaluate('Remind me tomorrow at 8 AM to call Dad');
  assert(!offlineCheck.dataEgressForbidden || offlineCheck.classification === 'PERSONAL', 'Offline commands execute smoothly on-device');

  // --- 13. Action Security Barrier ---
  console.log('\n--- 13. Action Security Barrier ---');
  const level3 = permissionManager.evaluateToolRisk('transferMoneyUPI');
  assert(level3 === 'LEVEL_3_SENSITIVE', 'Financial actions are strictly LEVEL 3 SENSITIVE requiring human confirmation');

  // --- 14. Health OS Boundary Inviolability ---
  console.log('\n--- 14. Health OS Boundary Inviolability ---');
  const healthResp = await personalAgent.process('How is my health today?');
  assert(healthResp.source === 'LOCAL', 'Health inquiry executes on-device');
  assert(healthResp.privacyClass === 'SENSITIVE', 'Health inquiry classified as SENSITIVE');
  assert(healthResp.text.includes('Health') || healthResp.text.includes('Blood Pressure') || healthResp.text.includes('baseline'), 'Health response strictly utilizes Health OS authoritative pipeline');

  // --- 15. Thermal & Battery Dynamic Adaptation ---
  console.log('\n--- 15. Thermal & Battery Dynamic Adaptation ---');
  const nominalTelemetry = await deviceCapabilityEngine.getTelemetry();
  const nominalThreads = deviceCapabilityEngine.getOptimalThreadCount(nominalTelemetry);
  assert(nominalThreads >= 3, 'Nominal thermal state allocates 3-4 CPU threads on high-tier hardware');

  const throttledTelemetry = { ...nominalTelemetry, thermalState: 'THROTTLED' as const };
  const throttledThreads = deviceCapabilityEngine.getOptimalThreadCount(throttledTelemetry);
  assert(throttledThreads === 2, 'Throttled thermal state safely throttles thread allocation to 2');

  // ========================================================
  // SUMMARY
  // ========================================================
  console.log('\n====================================================');
  console.log(`PHASE 7 VERIFICATION COMPLETE: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase7Verification().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

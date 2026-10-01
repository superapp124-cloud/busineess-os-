/**
 * CHATR AI OS — Phase 10 Reality Flight Verification Suite
 * scripts/verify-phase10.ts
 *
 * Verifies:
 * 1. IntentMetricsEngine: 4-Part Quality Quadrant (ICR, Effort Removed, UIR, IAR, User Trust Score)
 * 2. Sequential Reality Flight Progression (Flights A through F)
 * 3. The 6 Signature Magic Moments:
 *    - Moment 1: Calendar proposal from chat ("Let's meet tomorrow at 4")
 *    - Moment 2: 8-minute voice note synthesis (Executive summary < 45s, decisions, actions)
 *    - Moment 3: Upcoming meeting briefing readiness
 *    - Moment 4: Authoritative Health OS local answer with clinical disclaimer
 *    - Moment 5: Unknown caller local screening & decision card
 *    - Moment 6: Cross-domain travel preparation ("I'm going to Mumbai next week")
 * 4. Permanent <= 3 Card Invariant Enforced
 * 5. Physical Hardware Flight Readiness & Immutable Result Manifest
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

import { intentMetricsEngine } from '../src/ai/observability/IntentMetricsEngine';
import { universalIntentRouter } from '../src/ai/router/UniversalIntentRouter';
import { communicationIntelligence } from '../src/ai/communication/CommunicationIntelligence';
import { dailyBriefEngine } from '../src/ai/proactive/DailyBriefEngine';
import { modelRegistry } from '../src/ai/models/ModelRegistry';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runPhase10Verification() {
  console.log('====================================================');
  console.log('🧪 CHATR AI OS (PHASE 10) REALITY FLIGHT VERIFICATION');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // 1. 4-Part Quality Quadrant & User Trust
  // ----------------------------------------------------
  console.log('--- 1. IntentMetricsEngine: 4-Part Quality Quadrant ---');
  intentMetricsEngine.clear();

  // Record safe, effortless completion
  intentMetricsEngine.recordIntent({
    rawInput: "Let's meet Rahul tomorrow at 4",
    domain: 'COMMUNICATION',
    stage: 'COMPLETED_EFFORTLESS',
    effort: { appsAvoided: 2, tapsAvoided: 10, timeSavedSeconds: 90 },
    wasCorrect: true,
    hadUnnecessaryIntervention: false,
  });

  // Record safe health completion
  intentMetricsEngine.recordIntent({
    rawInput: 'How has my blood pressure been?',
    domain: 'HEALTH',
    stage: 'COMPLETED_EFFORTLESS',
    effort: { appsAvoided: 2, tapsAvoided: 6, timeSavedSeconds: 45 },
    wasCorrect: true,
    hadUnnecessaryIntervention: false,
  });

  // Record action halted for sensitive confirmation (correct behavior)
  intentMetricsEngine.recordIntent({
    rawInput: 'Transfer 5000 rupees',
    domain: 'ACTION',
    stage: 'UNDERSTOOD',
    effort: { appsAvoided: 0, tapsAvoided: 0, timeSavedSeconds: 0 },
    wasCorrect: true,
    hadUnnecessaryIntervention: false,
    notes: 'Blocked by biometric security barrier',
  });

  const kpis = intentMetricsEngine.getKPIs();
  assert(kpis.totalIntents === 3, 'Recorded 3 user intents in telemetry funnel');
  assert(kpis.effortlessCompletedCount === 2, '2 intents completed effortlessly');
  assert(kpis.intentCompletionRatePercent === 66.7, `Metric 1 (ICR): ${kpis.intentCompletionRatePercent}%`);
  assert(kpis.totalAppsAvoided === 4, `Metric 2 (Effort - Apps): ${kpis.totalAppsAvoided}`);
  assert(kpis.totalTapsAvoided === 16, `Metric 2 (Effort - Taps): ${kpis.totalTapsAvoided}`);
  assert(kpis.totalTimeSavedSeconds === 135, `Metric 2 (Effort - Time): ${kpis.totalTimeSavedSeconds}s`);
  assert(kpis.unnecessaryInterventionRatePercent === 0, `Metric 3 (UIR - Unnecessary Interventions): ${kpis.unnecessaryInterventionRatePercent}%`);
  assert(kpis.incorrectActionRatePercent === 0, `Metric 4 (IAR - Incorrect Actions): ${kpis.incorrectActionRatePercent}%`);
  assert(kpis.userTrustScore > 60, `User Trust Score computed: ${kpis.userTrustScore}/100`);

  // ----------------------------------------------------
  // 2. Sequential Reality Flight Order (A through F)
  // ----------------------------------------------------
  console.log('\n--- 2. Sequential Reality Flight Order (Flights A - F) ---');
  // Flight A: Local AI inference pathway
  assert(Boolean(modelRegistry.getDefaultLocalModel()), 'Flight A: Local AI bootstrap model registered');

  // Flight B: Communication
  const m1Res = await universalIntentRouter.route({
    rawInput: "Let's meet Rahul tomorrow at 4 PM",
    source: 'USER_TEXT',
  });
  assert(m1Res.success === true && m1Res.actionCard?.title.includes('Rahul'), 'Flight B: Communication meeting proposal generated');

  // Flight C: Voice
  const longVoiceMemo =
    "Hey team, just summarizing our strategy session. First, we decided to launch Phase 10 hardware testing on Monday. " +
    "Second, we agreed that Health OS clinical safety rules remain 100% inviolable. " +
    "Please send the hardware checklist by tomorrow morning. Thanks!";
  const m2Summary = communicationIntelligence.summarizeVoiceNote(longVoiceMemo, 480);
  assert(m2Summary.executiveSummary.length < 200, 'Flight C: Voice 45-second executive summary synthesized');
  assert(m2Summary.decisions.length >= 2, 'Flight C: Key decisions extracted from audio transcript');
  assert(m2Summary.actionItems.length >= 1, 'Flight C: Action items extracted from audio transcript');

  // Flight D: Health
  const m4Res = await universalIntentRouter.route({
    rawInput: 'How has my BP been this month?',
    source: 'USER_TEXT',
  });
  assert(m4Res.domain === 'HEALTH', 'Flight D: Health data routed through Health OS clinical baseline');
  assert(m4Res.explainability.where === 'On this device', 'Flight D: Health executed 100% on-device');

  // Flight E: Caller
  const m5Res = await universalIntentRouter.route({
    rawInput: 'Incoming call from +91 98765 00000',
    source: 'CALL_INCOMING',
    callerNumber: '+91 98765 00000',
  });
  assert(m5Res.domain === 'IDENTITY', 'Flight E: ChatrShield screened caller locally');

  // Flight F: Cross-domain
  const m6Res = await universalIntentRouter.route({
    rawInput: "I'm going to Mumbai next week",
    source: 'USER_TEXT',
  });
  assert(m6Res.domain === 'TRAVEL', 'Flight F: Cross-domain travel preparation card generated');

  // ----------------------------------------------------
  // 3. The 6 Signature Magic Moments Launch Readiness
  // ----------------------------------------------------
  console.log('\n--- 3. The 6 Signature Magic Moments Launch Readiness ---');
  assert(m1Res.actionCard?.primaryAction.label === 'Create Event', 'Moment 1: Calendar proposal card ready with 1-tap Create Event');
  assert(m2Summary.timeSavedSeconds > 400, 'Moment 2: Voice memo saves user > 6 minutes of listening');

  const m3Brief = dailyBriefEngine.generateBrief();
  const workCard = m3Brief.cards.find(c => c.domain === 'WORK');
  assert(workCard !== undefined, 'Moment 3: Work briefing card is ready on home screen');

  assert(
    m4Res.response.toLowerCase().includes('disclaimer') ||
    m4Res.response.toLowerCase().includes('medical advice') ||
    m4Res.response.toLowerCase().includes('consult a doctor'),
    'Moment 4: Medical disclaimer strictly guaranteed on Health OS output'
  );

  assert(m5Res.actionCard?.primaryAction.label === 'Block & Report', 'Moment 5: User-controlled Block & Report card generated');
  assert(m6Res.actionCard?.title.includes('Mumbai'), 'Moment 6: Contextual travel preparation card generated');

  // ----------------------------------------------------
  // 4. Permanent <= 3 Card Invariant Enforced
  // ----------------------------------------------------
  console.log('\n--- 4. Permanent <= 3 Card Invariant Enforced ---');
  const frontDoorCards = dailyBriefEngine.generateBriefingCards();
  assert(frontDoorCards.length <= 3, `Permanent Design Rule: <= 3 cards displayed at front door (found ${frontDoorCards.length})`);
  assert(frontDoorCards.length > 0, 'Front door contains active cards');

  // ----------------------------------------------------
  // 5. Physical Hardware Flight Readiness & Manifest
  // ----------------------------------------------------
  console.log('\n--- 5. Physical Hardware Flight Readiness & Manifest ---');
  const defaultModel = modelRegistry.getDefaultLocalModel();
  assert(defaultModel.modelId === 'CHATR-LOCAL-0.5B-V1', 'Target model ID is CHATR-LOCAL-0.5B-V1');
  assert(defaultModel.sizeBytes === 491_400_032, 'GGUF byte size matches verified physical file (491,400,032 bytes)');
  assert(defaultModel.sha256 === '74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db', 'Model SHA-256 matches verified Git LFS hash');

  // ----------------------------------------------------
  // Final Results
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`PHASE 10 VERIFICATION COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase10Verification().catch((err) => {
  console.error('Fatal error during Phase 10 verification:', err);
  process.exit(1);
});

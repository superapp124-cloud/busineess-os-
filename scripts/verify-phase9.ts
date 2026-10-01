/**
 * CHATR AI OS — Phase 9 Real-World Intelligence & UX Verification Suite
 * scripts/verify-phase9.ts
 *
 * Verifies:
 * 1. Universal Intent Router (Intent -> Context Graph -> Capability Engine -> Action OS -> Permission -> Execute)
 * 2. Journey 1: Communication ("Let's meet Rahul tomorrow at 4")
 * 3. Journey 2: Voice (8-minute voice note 45-second synthesis, decisions, action items)
 * 4. Journey 3: Health ("How has my BP been this month?" with authoritative clinical safety & zero cloud egress)
 * 5. Journey 4: Travel ("I'm going to Mumbai next week" cross-domain preparation)
 * 6. Journey 5: Unknown Caller & Identity Screening (ChatrShield local screening & user card)
 * 7. Hard Security Boundary for Sandboxed Extensions & Minimal Data Projection
 * 8. User-Facing Explainability ("Why am I seeing this?", "Where was this processed?")
 * 9. Front-Door 3-Card Minimalist Home Experience ("What can I handle?")
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

import { universalIntentRouter } from '../src/ai/router/UniversalIntentRouter';
import { realWorldJourneys } from '../src/ai/journeys/RealWorldJourneys';
import { capabilityEngine } from '../src/ai/capabilities/CapabilityEngine';
import { dailyBriefEngine } from '../src/ai/proactive/DailyBriefEngine';
import { personalContextGraph } from '../src/ai/context/PersonalContextGraph';
import { localMemoryStore } from '../src/ai/memory/LocalMemoryStore';

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

async function runPhase9Verification() {
  console.log('====================================================');
  console.log('🧪 CHATR AI OS (PHASE 9) REAL-WORLD INTELLIGENCE SUITE');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // 1. Universal Intent Router Pipeline
  // ----------------------------------------------------
  console.log('--- 1. Universal Intent Router Pipeline ---');
  const routerRes = await universalIntentRouter.route({
    rawInput: 'When is my next appointment?',
    source: 'USER_TEXT',
  });
  assert(routerRes.success === true, 'Universal Intent Router resolves intent without crashing');
  assert(routerRes.explainability.where === 'On this device', 'Default intent routes locally on-device');
  assert(Boolean(routerRes.explainability.why), 'Provides clear human explanation for why action was taken');

  // ----------------------------------------------------
  // 2. Journey 1: Communication ("Let's meet Rahul tomorrow at 4")
  // ----------------------------------------------------
  console.log('\n--- 2. Journey 1: Communication (Conversational Meeting) ---');
  const commJourney = await realWorldJourneys.executeCommunicationJourney();
  assert(commJourney.handledSuccessfully, 'Communication journey handled successfully');
  assert(commJourney.details.entitiesLinked.includes('Rahul'), 'Identified and linked participant "Rahul"');
  assert(commJourney.actionButtons?.includes('Create Event'), 'Proposed Level 2 Calendar Action Card');
  assert(commJourney.details.memoryUpdated === true, 'Proactively recorded meeting commitment to memory');

  // ----------------------------------------------------
  // 3. Journey 2: Voice (8-Minute Audio Memo Synthesis)
  // ----------------------------------------------------
  console.log('\n--- 3. Journey 2: Voice (8-Minute Audio Synthesis) ---');
  const voiceJourney = await realWorldJourneys.executeVoiceNoteJourney();
  assert(voiceJourney.handledSuccessfully, 'Voice note journey synthesized successfully');
  assert(voiceJourney.response.length < 200, `Executive summary readable in < 45 seconds (${voiceJourney.response.length} chars)`);
  assert(voiceJourney.details.decisions.length >= 2, `Extracted ${voiceJourney.details.decisions.length} key decisions made`);
  assert(voiceJourney.details.actionItems.length >= 1, `Extracted ${voiceJourney.details.actionItems.length} action items`);
  assert(voiceJourney.details.timeSavedSeconds > 300, `Saved user over 5 minutes of listening (${voiceJourney.details.timeSavedSeconds}s saved)`);

  // ----------------------------------------------------
  // 4. Journey 3: Health (Authoritative BP Query & Clinical Island)
  // ----------------------------------------------------
  console.log('\n--- 4. Journey 3: Health (Authoritative Baseline Evaluation) ---');
  const healthJourney = await realWorldJourneys.executeHealthJourney();
  assert(healthJourney.handledSuccessfully, 'Health journey handled with clinical safety');
  assert(healthJourney.privacyEgress === 'DEVICE_ONLY', 'Health query executed with ZERO cloud egress (DEVICE ONLY)');
  assert(healthJourney.details.disclaimerPresent, 'Mandatory clinical medical disclaimer included');
  assert(healthJourney.explainability.where === 'On this device', 'Health data processed strictly on-device');

  // ----------------------------------------------------
  // 5. Journey 4: Travel (Cross-Domain Trip Synthesis)
  // ----------------------------------------------------
  console.log('\n--- 5. Journey 4: Travel (Cross-Domain Synthesis) ---');
  const travelJourney = await realWorldJourneys.executeTravelJourney();
  assert(travelJourney.handledSuccessfully, 'Travel journey synthesized cross-domain context');
  assert(travelJourney.details.destination === 'Mumbai', 'Destination recognized as Mumbai');
  assert(travelJourney.cardTitle?.includes('Mumbai'), 'Generated contextual preparation proposal card');
  assert(travelJourney.actionButtons?.includes('Prepare Briefing'), 'Offers one-tap trip briefing preparation');

  // ----------------------------------------------------
  // 6. Journey 5: Unknown Caller & Identity Screening
  // ----------------------------------------------------
  console.log('\n--- 6. Journey 5: Unknown Caller Screening ---');
  const callerJourney = await realWorldJourneys.executeCallerJourney('+91 98765 00000');
  assert(callerJourney.handledSuccessfully, 'Caller screening executed successfully');
  assert(callerJourney.details.isSpamCandidate === true, 'ChatrShield identified telemarketing/spam probability');
  assert(callerJourney.actionButtons?.includes('Block & Report'), 'Provides user-controlled Block & Report action');

  // ----------------------------------------------------
  // 7. Hard Security Boundary for Sandboxed Extensions
  // ----------------------------------------------------
  console.log('\n--- 7. Hard Security Boundary for Sandboxed Extensions ---');
  // Attempt 1: Extension without manifest -> MUST REJECT
  capabilityEngine.registerCapability({
    id: 'malicious_no_manifest',
    name: 'Unverified Plugin',
    description: 'Plugin lacking manifest',
    domain: 'LIFE',
    tier: 'SANDBOXED',
    riskLevel: 'LEVEL_1_SAFE_READ',
    requiredPermissions: [],
    enabled: true,
    execute: async () => ({ success: true }),
  });
  const noManifestRes = await capabilityEngine.executeCapability('malicious_no_manifest', {});
  assert(noManifestRes.success === false, 'Sandboxed extension lacking manifest is strictly REJECTED');

  // Attempt 2: Sandboxed extension targeting Health OS -> MUST REJECT
  capabilityEngine.registerCapability({
    id: 'unauthorized_health_mod',
    name: 'Third Party Health Sync',
    description: 'Tries to access Health OS',
    domain: 'HEALTH',
    tier: 'SANDBOXED',
    riskLevel: 'LEVEL_1_SAFE_READ',
    requiredPermissions: [],
    enabled: true,
    manifest: { requestedPermissions: [] },
    execute: async () => ({ success: true }),
  });
  const healthSandRes = await capabilityEngine.executeCapability('unauthorized_health_mod', {});
  assert(healthSandRes.success === false, 'Sandboxed extension accessing Health OS is strictly FORBIDDEN');

  // Attempt 3: Unauthorized network access -> MUST REJECT
  capabilityEngine.registerCapability({
    id: 'offline_calc_plugin',
    name: 'Offline Math',
    description: 'Offline tool attempting network',
    domain: 'WORK',
    tier: 'SANDBOXED',
    riskLevel: 'LEVEL_1_SAFE_READ',
    requiredPermissions: [],
    enabled: true,
    manifest: { requestedPermissions: [] }, // NO NETWORK_ACCESS declared!
    execute: async () => ({ success: true }),
  });
  const netBlockedRes = await capabilityEngine.executeCapability('offline_calc_plugin', { requiresNetwork: true });
  assert(netBlockedRes.success === false, 'Sandboxed extension attempting undeclared network egress is BLOCKED');

  // Attempt 4: Minimal Data Projection verification
  let capturedParams: any = null;
  capabilityEngine.registerCapability({
    id: 'safe_notes_plugin',
    name: 'Notes Helper',
    description: 'Safe helper',
    domain: 'LIFE',
    tier: 'SANDBOXED',
    riskLevel: 'LEVEL_1_SAFE_READ',
    requiredPermissions: [],
    enabled: true,
    manifest: { requestedPermissions: [] },
    execute: async (params) => {
      capturedParams = params;
      return { success: true };
    },
  });
  await capabilityEngine.executeCapability('safe_notes_plugin', {
    noteTitle: 'Meeting Notes',
    rawVitals: '140/90 systolic', // Sensitive health
    pin: '4829',                  // Sensitive credential
    auth_token: 'xyz_secret',     // Auth secret
  });
  assert(capturedParams !== null && capturedParams.noteTitle === 'Meeting Notes', 'Non-sensitive note title passed');
  assert(capturedParams.rawVitals === undefined, 'Minimal Data Projection stripped rawVitals');
  assert(capturedParams.pin === undefined, 'Minimal Data Projection stripped PIN');
  assert(capturedParams.auth_token === undefined, 'Minimal Data Projection stripped auth_token');

  // ----------------------------------------------------
  // 8. Explainability Layer
  // ----------------------------------------------------
  console.log('\n--- 8. Transparent Explainability Layer ---');
  const travelExplain = travelJourney.explainability;
  assert(Boolean(travelExplain.why), 'User can query "Why am I seeing this?"');
  assert(travelExplain.where === 'On this device', 'User can verify "Where was this processed?"');

  // ----------------------------------------------------
  // 9. Front-Door 3-Card Minimalist UX Model
  // ----------------------------------------------------
  console.log('\n--- 9. Front-Door 3-Card Minimalist UX Model ---');
  const homeCards = dailyBriefEngine.generateBriefingCards();
  assert(homeCards.length <= 3, `Strict invariant: <= 3 cards displayed at front door (found ${homeCards.length})`);
  for (const c of homeCards) {
    assert(c.actionOptions.length > 0, `Card "${c.title}" has actionable choices ("What can I handle?")`);
  }

  // ----------------------------------------------------
  // Final Results
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`PHASE 9 VERIFICATION COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase9Verification().catch((err) => {
  console.error('Fatal error during Phase 9 verification:', err);
  process.exit(1);
});

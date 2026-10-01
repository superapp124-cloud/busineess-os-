/**
 * CHATR AI OS — Phase 8 Personal AI OS Verification Suite
 * scripts/verify-phase8.ts
 *
 * Verifies:
 * 1. Four-Level Platform Architecture (Perception -> Context Graph -> Memory -> Action)
 * 2. 8 Core Sub-OSs Registered & Health OS Protected Island
 * 3. Open-Ended Sub-OS Dynamic Registration (Finance OS & Travel OS)
 * 4. Capability Engine 3-Tier Execution & Security (Native, Trusted, Sandboxed)
 * 5. Level 3 Security Barrier Enforcement
 * 6. Communication OS: Scheduling Intent Extraction
 * 7. Communication OS: Commitment & Promise Detection
 * 8. Communication OS: Voice Note 45-Second Synthesis
 * 9. CHATR Interaction Protocol: 8-Stage Execution Pipeline
 * 10. Health OS Clinical Boundary Inviolability via Protocol
 * 11. 3-Card Minimalist Home Briefing UX ("What can I handle?")
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

import { capabilityEngine } from '../src/ai/capabilities/CapabilityEngine';
import { communicationIntelligence } from '../src/ai/communication/CommunicationIntelligence';
import { chatrInteractionProtocol } from '../src/ai/protocol/ChatrInteractionProtocol';
import { personalAgent } from '../src/ai/agents/PersonalAgent';
import { personalContextEngine } from '../src/ai/context/PersonalContextEngine';
import { personalContextGraph } from '../src/ai/context/PersonalContextGraph';
import { localMemoryStore } from '../src/ai/memory/LocalMemoryStore';
import { dailyBriefEngine } from '../src/ai/proactive/DailyBriefEngine';
import { aiActivityLog } from '../src/ai/observability/AIActivityLog';

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

async function runPhase8Verification() {
  console.log('====================================================');
  console.log('🧪 CHATR AI OS (PHASE 8) PERSONAL AI OS VERIFICATION');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // 1. Four-Level Platform Architecture
  // ----------------------------------------------------
  console.log('--- 1. Four-Level Platform Architecture Flow ---');
  // Level 1: Perception/Signals updates Context Engine & Graph
  personalContextEngine.updateDeviceStatus({
    batteryLevelPercent: 85,
    watchConnected: true,
    bpMonitorConnected: true,
  });
  personalContextGraph.addEntity({
    id: 'ent_travel_1',
    type: 'Event',
    name: 'Mumbai Flight 6E-204',
    attributes: { destination: 'Mumbai', departure: '06:00 AM' },
    createdAt: Date.now(),
  });

  const snapshot = personalContextEngine.getSnapshot();
  assert(snapshot.timeOfDay !== undefined, 'Level 1 Perception provides ambient timeOfDay snapshot');

  const entities = personalContextGraph.searchEntities('Mumbai');
  assert(entities.length > 0 && entities[0].name.includes('Mumbai'), 'Level 2 Personal Context Graph stores and searches cross-domain entities');

  // Level 3 Memory Store
  localMemoryStore.clearAll();
  localMemoryStore.saveMemory('Remember that I usually travel to Mumbai for quarterly client meetings', {
    category: 'HABIT',
    importance: 8,
    confidenceLevel: 'PATTERN_RECOGNITION',
    confidence: 0.85,
    explanation: 'Extracted from travel calendar patterns',
    source: 'USER_EXPLICIT',
  });
  const recalled = localMemoryStore.recall('Mumbai', { limit: 1 });
  assert(recalled.length > 0 && recalled[0].content.includes('Mumbai'), 'Level 3 SmartMemory retrieves situational context');

  // ----------------------------------------------------
  // 2. Core Sub-OS Platform Registry & Health Island
  // ----------------------------------------------------
  console.log('\n--- 2. Core Sub-OS Platform Registry & Health Island ---');
  const subOSs = capabilityEngine.listSubOSs();
  assert(subOSs.length >= 8, `Registered Sub-OS count is >= 8 (found ${subOSs.length})`);

  const healthOS = capabilityEngine.getSubOS('HEALTH');
  assert(healthOS !== undefined, 'Health OS is registered in Sub-OS registry');
  assert(healthOS?.isProtectedDomain === true, 'Health OS is explicitly flagged as a protected clinical domain');

  const commOS = capabilityEngine.getSubOS('COMMUNICATION');
  assert(commOS !== undefined && commOS.contextEntityTypes.includes('Conversation'), 'Communication OS is registered with conversation entities');

  const workOS = capabilityEngine.getSubOS('WORK');
  assert(workOS !== undefined, 'Work OS is registered');

  // ----------------------------------------------------
  // 3. Open-Ended Sub-OS Dynamic Registration
  // ----------------------------------------------------
  console.log('\n--- 3. Open-Ended Sub-OS Dynamic Registration ---');
  capabilityEngine.registerSubOS({
    domainId: 'FINANCE',
    name: 'Finance OS',
    description: 'Spending Trends, Bill Reminders, Subscription Audits, UPI Guard',
    icon: 'Wallet',
    capabilities: ['finance_track_expenses'],
    contextEntityTypes: ['FinancialTransaction', 'Subscription'],
    isProtectedDomain: false,
    version: '1.0.0',
  });

  capabilityEngine.registerSubOS({
    domainId: 'TRAVEL',
    name: 'Travel OS',
    description: 'Flight & Train Itineraries, Boarding Passes, Packing Reminders',
    icon: 'Plane',
    capabilities: ['travel_parse_itinerary'],
    contextEntityTypes: ['Flight', 'HotelReservation'],
    isProtectedDomain: false,
    version: '1.0.0',
  });

  const updatedSubOSs = capabilityEngine.listSubOSs();
  assert(updatedSubOSs.some((s) => s.domainId === 'FINANCE'), 'Finance OS registered dynamically at runtime');
  assert(updatedSubOSs.some((s) => s.domainId === 'TRAVEL'), 'Travel OS registered dynamically at runtime');

  // ----------------------------------------------------
  // 4. Capability Engine 3-Tier Execution
  // ----------------------------------------------------
  console.log('\n--- 4. Capability Engine 3-Tier Execution ---');
  // Tier 1 Native Execution
  const nativeRes = await capabilityEngine.executeCapability('health_query_vitals', { query: 'blood pressure' });
  assert(nativeRes.success === true, 'Tier 1 Native capability executes successfully');
  assert(nativeRes.executionLocation === 'DEVICE_NATIVE', 'Tier 1 Native capability runs on DEVICE_NATIVE');

  // Register Tier 2 Trusted Tool
  capabilityEngine.registerCapability({
    id: 'trusted_weather_service',
    name: 'Trusted Weather Bridge',
    description: 'Fetches local weather forecasts from verified partner API.',
    domain: 'LIFE',
    tier: 'TRUSTED',
    riskLevel: 'LEVEL_1_SAFE_READ',
    requiredPermissions: ['NETWORK_ACCESS'],
    enabled: true,
    execute: async (params) => ({
      success: true,
      data: { temp: '28C', condition: 'Sunny' },
      message: 'Weather in Mumbai is 28C and Sunny.',
      executionLocation: 'TRUSTED_BRIDGE',
    }),
  });

  const trustedRes = await capabilityEngine.executeCapability('trusted_weather_service', { location: 'Mumbai' });
  assert(trustedRes.success === true, 'Tier 2 Trusted capability executes');
  assert(trustedRes.executionLocation === 'TRUSTED_BRIDGE', 'Tier 2 Trusted capability executes in TRUSTED_BRIDGE');

  // Register Tier 3 Sandboxed Extension
  capabilityEngine.registerCapability({
    id: 'sandbox_currency_calc',
    name: 'Currency Converter Plugin',
    description: '3rd-party community currency converter extension.',
    domain: 'FINANCE',
    tier: 'SANDBOXED',
    riskLevel: 'LEVEL_1_SAFE_READ',
    requiredPermissions: [],
    enabled: true,
    manifest: { author: 'CommunityDev', version: '0.9', requestedPermissions: [] },
    execute: async (params) => ({
      success: true,
      data: { converted: 83.5 },
      message: '1 USD = 83.50 INR',
      executionLocation: 'SANDBOX',
    }),
  });

  const sandboxRes = await capabilityEngine.executeCapability('sandbox_currency_calc', { amount: 1, from: 'USD', to: 'INR' });
  assert(sandboxRes.success === true, 'Tier 3 Sandboxed extension executes safely');
  assert(sandboxRes.executionLocation === 'SANDBOX', 'Tier 3 Sandboxed extension runs in SANDBOX');

  // ----------------------------------------------------
  // 5. Level 3 Security Barrier Enforcement
  // ----------------------------------------------------
  console.log('\n--- 5. Level 3 Action Security Barrier ---');
  capabilityEngine.registerCapability({
    id: 'finance_send_upi',
    name: 'Send UPI Payment',
    description: 'Initiates a peer-to-peer UPI money transfer.',
    domain: 'FINANCE',
    tier: 'NATIVE',
    riskLevel: 'LEVEL_3_SENSITIVE',
    requiredPermissions: ['PAYMENTS'],
    enabled: true,
    execute: async (params) => ({
      success: true,
      message: `Transferred ₹${params.amount} to ${params.recipient}.`,
    }),
  });

  // Attempt without consent -> must be blocked
  const blockedPayment = await capabilityEngine.executeCapability('finance_send_upi', { amount: 500, recipient: 'sarah@okaxis' }, false);
  assert(blockedPayment.success === false, 'Level 3 sensitive action is strictly BLOCKED without user consent');
  assert(blockedPayment.error?.includes('Permission barrier') || blockedPayment.error?.includes('confirmation'), 'Blocked payment returns clear permission barrier prompt');

  // Execute with explicit consent
  const allowedPayment = await capabilityEngine.executeCapability('finance_send_upi', { amount: 500, recipient: 'sarah@okaxis' }, true);
  assert(allowedPayment.success === true, 'Level 3 sensitive action executes when explicit confirmation is provided');

  // ----------------------------------------------------
  // 6. Communication OS: Scheduling Intent Extraction
  // ----------------------------------------------------
  console.log('\n--- 6. Communication OS: Scheduling Intent Extraction ---');
  const scheduleChat = "Hey team, let's sync next Tuesday around 3 PM to review the roadmap.";
  const schedProposal = communicationIntelligence.extractSchedulingIntents(scheduleChat);
  assert(schedProposal.detected === true, 'Scheduling intent detected in conversational chat');
  assert(schedProposal.proposedTime.includes('Tuesday at 3 PM'), `Proposed time correctly extracted: ${schedProposal.proposedTime}`);
  assert(schedProposal.actionProposal?.riskLevel === 'LEVEL_2_REVERSIBLE', 'Calendar proposal assigned LEVEL_2_REVERSIBLE risk level');

  // ----------------------------------------------------
  // 7. Communication OS: Commitment Detection
  // ----------------------------------------------------
  console.log('\n--- 7. Communication OS: Commitment & Promise Detection ---');
  const commitmentChat = "Don't worry, I'll send over the report by 6 PM today.";
  const commitProposal = communicationIntelligence.extractCommitments(commitmentChat, 'Arshid');
  assert(commitProposal.detected === true, 'Commitment detected in conversational chat');
  assert(commitProposal.commitmentText.includes('send over the report'), `Extracted commitment task: "${commitProposal.commitmentText}"`);
  assert(commitProposal.dueTime.includes('6 PM today'), `Extracted deadline: "${commitProposal.dueTime}"`);
  assert(commitProposal.reminderProposal?.type === 'TASK_REMINDER_PROPOSAL', 'Prepared Level 2 Task Reminder Proposal');

  // ----------------------------------------------------
  // 8. Communication OS: Voice Note Synthesis
  // ----------------------------------------------------
  console.log('\n--- 8. Communication OS: Voice Note Synthesis ---');
  const longVoiceTranscription =
    "Hi Arshid, following up on our project discussion. We had a quick sync this morning and we decided to approve the Q4 design roadmap. " +
    "Also, we agreed to push the Android APK release to next Monday to ensure all tests pass. " +
    "Please send the updated budget numbers to finance by tomorrow morning. Thanks!";

  const voiceSummary = communicationIntelligence.summarizeVoiceNote(longVoiceTranscription, 300); // 5 min audio
  assert(voiceSummary.executiveSummary.length < 200, `Executive summary is concise (< 200 chars): ${voiceSummary.executiveSummary.length} chars`);
  assert(voiceSummary.decisions.length >= 1, `Decisions extracted: ${voiceSummary.decisions.length}`);
  assert(voiceSummary.actionItems.length >= 1, `Action items extracted: ${voiceSummary.actionItems.length}`);
  assert(voiceSummary.timeSavedSeconds > 200, `Time saved calculated: ${voiceSummary.timeSavedSeconds}s`);

  // ----------------------------------------------------
  // 9. CHATR Interaction Protocol (8 Stages End-to-End)
  // ----------------------------------------------------
  console.log('\n--- 9. CHATR Interaction Protocol End-to-End ---');
  // Test deterministic protocol path
  const protoResult = await chatrInteractionProtocol.execute({
    rawInput: 'Set an alarm for 7:00 AM tomorrow',
    source: 'USER_VOICE',
  });

  assert(protoResult.step === 'COMPLETE', 'Protocol completed all stages successfully');
  assert(protoResult.success === true, 'Protocol execution verified');
  assert(protoResult.riskLevel === 'LEVEL_2_REVERSIBLE', 'Protocol classified alarm as LEVEL_2_REVERSIBLE');
  assert(protoResult.executionLocation === 'DEVICE_ONLY', 'Protocol executed on DEVICE_ONLY');

  // Test Level 3 security barrier via Protocol
  const sensitiveProto = await chatrInteractionProtocol.execute({
    rawInput: 'Transfer 5000 rupees to supplier',
    source: 'USER_TEXT',
    confirmedByUser: false,
  });
  assert(sensitiveProto.step === 'PERMISSION', 'Protocol halted at PERMISSION stage for unconfirmed sensitive action');
  assert(sensitiveProto.requiresUserConfirmation === true, 'Protocol requires explicit user confirmation');

  // ----------------------------------------------------
  // 10. Health OS Clinical Island Inviolability via Protocol
  // ----------------------------------------------------
  console.log('\n--- 10. Health OS Clinical Island Inviolability ---');
  const healthProto = await chatrInteractionProtocol.execute({
    rawInput: 'What is my current blood pressure reading?',
    source: 'USER_TEXT',
    targetDomain: 'HEALTH',
  });

  assert(healthProto.domain === 'HEALTH', 'Target domain is strictly HEALTH');
  assert(healthProto.executionLocation === 'HEALTH_OS_GATEWAY', 'Health protocol executed strictly through HEALTH_OS_GATEWAY');
  assert(
    healthProto.text.toLowerCase().includes('disclaimer') ||
    healthProto.text.toLowerCase().includes('not medical advice') ||
    healthProto.text.toLowerCase().includes('consult a doctor'),
    'Clinical Safety Rule: Health response is GUARANTEED to include medical disclaimer'
  );

  // ----------------------------------------------------
  // 11. Minimalist Intent UX: 3-Card Home Briefing
  // ----------------------------------------------------
  console.log('\n--- 11. Minimalist Intent UX: 3-Card Home Briefing ---');
  const briefingCards = dailyBriefEngine.generateBriefingCards();
  assert(briefingCards.length <= 3, `Strict invariant: Briefing contains <= 3 cards (found ${briefingCards.length})`);
  assert(briefingCards.length > 0, 'Briefing generated at least 1 card');

  for (const card of briefingCards) {
    assert(card.actionOptions.length > 0, `Card "${card.title}" has actionable choices ("What can I handle?")`);
    assert(Boolean(card.domain), `Card "${card.title}" maps to domain "${card.domain}"`);
  }

  const dailyBrief = dailyBriefEngine.generateBrief();
  assert(dailyBrief.cards.length === briefingCards.length, 'DailyBrief model contains structured briefing cards');
  assert(dailyBrief.items.length <= 3, 'DailyBrief items length strictly <= 3');

  // ----------------------------------------------------
  // Final Results
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`PHASE 8 VERIFICATION COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8Verification().catch((err) => {
  console.error('Fatal error during Phase 8 verification:', err);
  process.exit(1);
});

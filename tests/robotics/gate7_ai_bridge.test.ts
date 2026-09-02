import { describe, it, expect } from 'vitest';
import {
  LanguageIdentifier,
  MultilingualNlu,
  SpatialGrounder,
  CapabilityMatcher,
  OperationalAiExplainer,
  RobotAiBridgePipeline,
} from '../../packages/robot-ai-bridge/src';
import { TemporalWorldModel } from '../../packages/robot-perception/src';
import { Vector3, Quaternion } from '../../packages/robot-physics/src';

describe('GATE 7: CHATR AI Bridge & Multi-Lingual Task Engine (G7.1 - G7.8)', () => {
  // ------------------------------------------------------------
  // G7.1: 7-Language Identification & Script Detection
  // ------------------------------------------------------------
  it('G7.1: Language ID — Detects English, Hindi, Urdu, Punjabi, Bengali, Tamil, and Telugu in native and Roman scripts', () => {
    // English
    expect(LanguageIdentifier.identifyLanguage('Bring me the water bottle from the kitchen').language).toBe('en');

    // Hindi (Devanagari & Hinglish)
    expect(LanguageIdentifier.identifyLanguage('पानी की बोतल ले आओ।').language).toBe('hi');
    expect(LanguageIdentifier.identifyLanguage('Kitchen se paani ki bottle le aao').language).toBe('hi');

    // Urdu (Nastaliq & Roman Urdu)
    expect(LanguageIdentifier.identifyLanguage('پانی کی بوتل لے آؤ۔').language).toBe('ur');
    expect(LanguageIdentifier.identifyLanguage('Pani ki botal le aao shukriya').language).toBe('ur');

    // Punjabi (Gurmukhi & Roman Punjabi)
    expect(LanguageIdentifier.identifyLanguage('ਪਾਣੀ ਦੀ ਬੋਤਲ ਲੈ ਕੇ ਆਓ।').language).toBe('pa');
    expect(LanguageIdentifier.identifyLanguage('Paani di botal lai ke aao').language).toBe('pa');

    // Bengali (Bangla & Roman Bengali)
    expect(LanguageIdentifier.identifyLanguage('রান্নাঘর থেকে জলের বোতল নিয়ে এসো।').language).toBe('bn');
    expect(LanguageIdentifier.identifyLanguage('Rannaghor theke joler bottle niye esho').language).toBe('bn');

    // Tamil (Tamil script & Roman Tamil)
    expect(LanguageIdentifier.identifyLanguage('சமையலறையிலிருந்து தண்ணீர் பாட்டில் எடுத்து வாருங்கள்.').language).toBe('ta');
    expect(LanguageIdentifier.identifyLanguage('Samaiyalariyilirundhu thanneer bottle eduthu vaarungal').language).toBe('ta');

    // Telugu (Telugu script & Roman Telugu)
    expect(LanguageIdentifier.identifyLanguage('వంటగది నుండి నీళ్ల బాటిల్ తీసుకురండి.').language).toBe('te');
    expect(LanguageIdentifier.identifyLanguage('Vantagadi nundi neella bottle theesukurandi').language).toBe('te');
  });

  // ------------------------------------------------------------
  // G7.2: Multi-Lingual Intent & Entity Extraction
  // ------------------------------------------------------------
  it('G7.2: Multi-Lingual NLU — Extracts FETCH_OBJECT intent, target entity, source, and destination across languages', () => {
    const hindiTask = MultilingualNlu.parsePrompt('Kitchen se paani ki bottle mere paas le aao');
    expect(hindiTask.intent).toBe('FETCH_OBJECT');
    expect(hindiTask.targetCategory).toBe('bottle');
    expect(hindiTask.sourceLocation).toBe('kitchen');
    expect(hindiTask.destinationLocation).toBe('user');

    const devanagariTask = MultilingualNlu.parsePrompt('रसोई से पानी की बोतल ले आओ');
    expect(devanagariTask.intent).toBe('FETCH_OBJECT');
    expect(devanagariTask.targetCategory).toBe('bottle');
    expect(devanagariTask.sourceLocation).toBe('kitchen');

    const tamilTask = MultilingualNlu.parsePrompt('Samaiyalariyilirundhu thanneer bottle eduthu vaarungal');
    expect(tamilTask.intent).toBe('FETCH_OBJECT');
    expect(tamilTask.targetCategory).toBe('bottle');
    expect(tamilTask.sourceLocation).toBe('kitchen');

    const eStopTask = MultilingualNlu.parsePrompt('Emergency stop ruko!');
    expect(eStopTask.intent).toBe('EMERGENCY_STOP');
  });

  // ------------------------------------------------------------
  // G7.3: Spatial Grounding & Deictic Ambiguity Resolution
  // ------------------------------------------------------------
  it('G7.3: Spatial Grounding — Disambiguates deictic reference ("woh wali bottle") using World Model proximity', () => {
    const worldModel = new TemporalWorldModel();
    const snap = worldModel.getSnapshot(0.0);

    const task = MultilingualNlu.parsePrompt('Woh wali bottle le aao');
    expect(task.isAmbiguousReference).toBe(true);

    const robotPos = new Vector3(1.0, -2.0, 0.0);
    const grounding = SpatialGrounder.groundTask(task, snap, robotPos);

    expect(grounding.isGrounded).toBe(true);
    expect(grounding.groundedObject).toBeDefined();
    expect(grounding.groundedObject!.objectId).toBe('water_bottle_01');
  });

  // ------------------------------------------------------------
  // G7.4: Capability & Safety Validation
  // ------------------------------------------------------------
  it('G7.4: Capability Validation — Approves graspable objects and rejects tasks on low battery (<15%)', () => {
    const worldModel = new TemporalWorldModel();
    const snap = worldModel.getSnapshot(0.0);
    const bottleObj = snap.detectedObjects.find((o) => o.objectId === 'water_bottle_01')!;

    const fetchTask = MultilingualNlu.parsePrompt('Kitchen se paani ki bottle le aao');

    // 1. Nominal battery (85%) -> Approved
    const approved = CapabilityMatcher.validateTask(fetchTask, bottleObj, 85.0);
    expect(approved.isApproved).toBe(true);
    expect(approved.status).toBe('VALID_AND_EXECUTABLE');

    // 2. Low battery (10%) -> Rejected
    const lowBat = CapabilityMatcher.validateTask(fetchTask, bottleObj, 10.0);
    expect(lowBat.isApproved).toBe(false);
    expect(lowBat.status).toBe('BLOCKED_BATTERY_LOW');

    // 3. Ungraspable furniture (sofa) -> Rejected
    const sofaObj = snap.detectedObjects.find((o) => o.objectId === 'sofa_01')!;
    const sofaTask = MultilingualNlu.parsePrompt('Bring me the sofa');
    sofaTask.targetCategory = 'sofa';
    const badAffordance = CapabilityMatcher.validateTask(sofaTask, sofaObj, 85.0);
    expect(badAffordance.isApproved).toBe(false);
    expect(badAffordance.status).toBe('BLOCKED_CAPABILITY_MISMATCH');
  });

  // ------------------------------------------------------------
  // G7.5: Operational AI Explainer in Native Languages
  // ------------------------------------------------------------
  it('G7.5: AI Explainer — Generates native-language natural explanations for user commands', () => {
    const hindiTask = MultilingualNlu.parsePrompt('Kitchen se paani ki bottle le aao');
    const hindiExp = OperationalAiExplainer.explainTaskPlan(hindiTask, 'VALID_AND_EXECUTABLE', 'water_bottle_01');
    expect(hindiExp).toContain('रसोई');
    expect(hindiExp).toContain('पानी की बोतल');

    const urduTask = MultilingualNlu.parsePrompt('باورچی خانہ سے پانی کی بوتل لے آؤ');
    const urduExp = OperationalAiExplainer.explainTaskPlan(urduTask, 'VALID_AND_EXECUTABLE', 'water_bottle_01');
    expect(urduExp).toContain('باورچی خانہ');

    const tamilTask = MultilingualNlu.parsePrompt('Samaiyalariyilirundhu thanneer bottle eduthu vaarungal');
    const tamilExp = OperationalAiExplainer.explainTaskPlan(tamilTask, 'VALID_AND_EXECUTABLE', 'water_bottle_01');
    expect(tamilExp).toContain('சமையலறை');
  });

  // ------------------------------------------------------------
  // G7.6: Complete End-to-End AI Execution Graph
  // ------------------------------------------------------------
  it('G7.6: End-to-End AI Bridge — Decomposes voice command into structured 8-step execution graph', async () => {
    const pipeline = new RobotAiBridgePipeline();
    const worldModel = new TemporalWorldModel();
    const snap = worldModel.getSnapshot(0.0);

    const plan = await pipeline.processUserPrompt('Kitchen se paani ki bottle le aao', snap);

    expect(plan.isApprovedForExecution).toBe(true);
    expect(plan.validationStatus).toBe('VALID_AND_EXECUTABLE');
    expect(plan.task.targetCategory).toBe('bottle');
    expect(plan.task.resolvedObjectId).toBe('water_bottle_01');

    // 8-step decomposed execution graph
    expect(plan.subTasks.length).toBe(8);
    expect(plan.subTasks[0].subTaskType).toBe('NAVIGATE');
    expect(plan.subTasks[3].subTaskType).toBe('GRASP');
    expect(plan.subTasks[4].subTaskType).toBe('VERIFY_GRASP');
    expect(plan.subTasks[5].subTaskType).toBe('LIFT');
    expect(plan.subTasks[7].subTaskType).toBe('HANDOVER');
  });

  // ------------------------------------------------------------
  // G7.7: Injected Failure Matrix (11 Canonical Scenarios)
  // ------------------------------------------------------------
  it('G7.7: Failure Matrix — Verifies deterministic RobotOS response across all 11 failure scenarios', () => {
    const pipeline = new RobotAiBridgePipeline();

    const f1 = pipeline.handleFailureInjection('OBJECT_MOVED');
    expect(f1.isSafetyMaintained).toBe(true);
    expect(f1.robotOsResponse).toBe('DISCREPANCY_DETECTED');

    const f2 = pipeline.handleFailureInjection('HUMAN_ENTERED_PATH');
    expect(f2.robotOsResponse).toBe('ZONE_1_EMERGENCY_STOP');

    const f3 = pipeline.handleFailureInjection('OBJECT_OCCLUDED');
    expect(f3.robotOsResponse).toBe('BELIEF_OCCLUDED');

    const f4 = pipeline.handleFailureInjection('CAMERA_DISCONNECTED');
    expect(f4.robotOsResponse).toBe('PERCEPTION_DEGRADED');

    const f5 = pipeline.handleFailureInjection('LOW_GRASP_CONFIDENCE');
    expect(f5.robotOsResponse).toBe('BLOCKED_LOW_PERCEPTION_CONFIDENCE');

    const f6 = pipeline.handleFailureInjection('OBJECT_UNREACHABLE');
    expect(f6.robotOsResponse).toBe('UNREACHABLE_WORKSPACE');

    const f7 = pipeline.handleFailureInjection('OLLAMA_UNAVAILABLE');
    expect(f7.robotOsResponse).toBe('LLM_OFFLINE_FALLBACK');

    const f8 = pipeline.handleFailureInjection('STT_UNAVAILABLE');
    expect(f8.robotOsResponse).toBe('STT_OFFLINE');

    const f9 = pipeline.handleFailureInjection('BATTERY_LOW');
    expect(f9.robotOsResponse).toBe('BLOCKED_BATTERY_LOW');

    const f10 = pipeline.handleFailureInjection('MOTOR_SATURATION');
    expect(f10.robotOsResponse).toBe('BLOCKED_TORQUE_LIMIT_SATURATION');

    const f11 = pipeline.handleFailureInjection('EMERGENCY_STOP');
    expect(f11.robotOsResponse).toBe('ESTOP_ENGAGED');
  });
});

import { describe, it, expect } from 'vitest';
import { SkillRegistry } from '../../packages/robot-skills/src/registry/skillRegistry';
import { HouseholdTaskEngine } from '../../packages/robot-tasks/src/engine/householdTaskEngine';
import { TaskType, TaskExecutionContext } from '../../packages/robot-tasks/src/types';
import { TemporalWorldModel } from '../../packages/robot-perception/src/worldModel/temporalWorldModel';
import { Vector3, Quaternion } from '../../packages/robot-physics/src';
import { MultilingualNlu } from '../../packages/robot-ai-bridge/src/language/multilingualNlu';
import h170Robot from '../../packages/robot-profiles/chatr_h170/robot.json';
import h170Joints from '../../packages/robot-profiles/chatr_h170/joints.json';

describe('GATE 8: Household Task Engine & Skills (@chatr/robot-skills & @chatr/robot-tasks)', () => {
  const worldModel = new TemporalWorldModel();
  const worldSnapshot = worldModel.getSnapshot(0.0);
  const skillRegistry = new SkillRegistry();
  const taskEngine = new HouseholdTaskEngine(skillRegistry);

  const baseContext: TaskExecutionContext = {
    taskId: 'TASK-GATE8-TEST-001',
    taskType: 'FETCH_OBJECT',
    worldModelSnapshot: worldSnapshot,
    robotPoseWorld: { position: new Vector3(0, 0, 0.95), orientation: new Quaternion(1, 0, 0, 0) },
    batterySocPercent: 85.0,
    safetyZone: 'ZONE_3_NORMAL_OPERATING',
    isEstopActive: false,
    activeArmJoints: {
      RIGHT: { shoulderPitch: 0, shoulderRoll: 0, shoulderYaw: 0, elbowPitch: 0, wristYaw: 0, wristRoll: 0, wristPitch: 0 },
      LEFT: { shoulderPitch: 0, shoulderRoll: 0, shoulderYaw: 0, elbowPitch: 0, wristYaw: 0, wristRoll: 0, wristPitch: 0 },
    },
    provenance: 'SIMULATION_KERNEL',
  };

  // ------------------------------------------------------------
  // 1. Authoritative 28 Joint Count Invariant Check
  // ------------------------------------------------------------
  it('1. Authoritative Robot Profile — Confirms exactly 28 controllable kinematic joints', () => {
    expect(h170Robot.dofCount).toBe(28);
    expect(h170Joints.length).toBe(28);

    const revoluteJoints = h170Joints.filter((j: any) => j.type === 'revolute');
    expect(revoluteJoints.length).toBe(28);
  });

  // ------------------------------------------------------------
  // 2. 30 Canonical Skills Registry Audit
  // ------------------------------------------------------------
  it('2. Skill Registry — Registers and validates contracts for all 30 canonical household skills', () => {
    const skills = skillRegistry.listSkills();
    expect(skills.length).toBe(30);

    for (const skill of skills) {
      expect(skill.skillType).toBeDefined();
      expect(skill.description.length).toBeGreaterThan(5);
      expect(skill.preconditions.length).toBeGreaterThan(0);
      expect(skill.safetyRequirements.length).toBeGreaterThan(0);
      expect(skill.timeoutSeconds).toBeGreaterThan(0);
    }
  });

  // ------------------------------------------------------------
  // 3. Execution of 11 Multi-Step Household Tasks
  // ------------------------------------------------------------
  const allTasks: TaskType[] = [
    'FETCH_OBJECT',
    'NAVIGATE_ROOMS',
    'PICK_UP_CLOTHES',
    'CLEAN_TABLE',
    'SERVE_WATER',
    'PUT_AWAY_GROCERIES',
    'EMPTY_TRASH_BIN',
    'PATROL_AND_REPORT',
    'BED_MAKING_ASSIST',
    'MEDICINE_REMINDER',
    'AUTONOMOUS_RECHARGE',
  ];

  for (const taskType of allTasks) {
    it(`3. Household Task — Executes ${taskType} state machine through COMPLETE`, async () => {
      const result = await taskEngine.executeTask({
        ...baseContext,
        taskType,
      });

      expect(result.isComplete).toBe(true);
      expect(result.isFailed).toBe(false);
      expect(result.currentState).toBe('COMPLETE');
      expect(result.executedSkillResults.length).toBe(result.totalSteps);
      expect(result.executedSkillResults.every((r) => r.isSuccessful)).toBe(true);
    });
  }

  // ------------------------------------------------------------
  // 4. Adversarial Test: Missing Object in World Model
  // ------------------------------------------------------------
  it('4. Adversarial: Missing Object — Halts task execution with OBJECT_NOT_FOUND', async () => {
    const emptySnapshot = {
      ...worldSnapshot,
      detectedObjects: [],
    };

    const result = await taskEngine.executeTask({
      ...baseContext,
      taskType: 'FETCH_OBJECT',
      worldModelSnapshot: emptySnapshot,
    });

    expect(result.isFailed).toBe(true);
    expect(result.isComplete).toBe(false);
    expect(result.currentState).toBe('FAILED');
    expect(result.failureReason).toBe('OBJECT_NOT_FOUND');
  });

  // ------------------------------------------------------------
  // 5. Adversarial Test: Low Perception Confidence (<0.70)
  // ------------------------------------------------------------
  it('5. Adversarial: Low Perception Confidence — Halts execution with LOW_PERCEPTION_CONFIDENCE', async () => {
    const lowConfSnapshot = {
      ...worldSnapshot,
      detectedObjects: worldSnapshot.detectedObjects.map((o) =>
        o.objectId === 'water_bottle_01' ? { ...o, confidence: 0.45 } : o
      ),
    };

    const result = await taskEngine.executeTask({
      ...baseContext,
      taskType: 'FETCH_OBJECT',
      worldModelSnapshot: lowConfSnapshot,
    });

    expect(result.isFailed).toBe(true);
    expect(result.failureReason).toBe('LOW_PERCEPTION_CONFIDENCE');
  });

  // ------------------------------------------------------------
  // 6. Adversarial Test: Human Proximity in Zone 1 (Spatial Safety)
  // ------------------------------------------------------------
  it('6. Adversarial: Human in Zone 1 — Halts execution with HUMAN_PROXIMITY_HAZARD', async () => {
    const result = await taskEngine.executeTask({
      ...baseContext,
      taskType: 'FETCH_OBJECT',
      safetyZone: 'ZONE_1_EMERGENCY_STOP',
    });

    expect(result.isFailed).toBe(true);
    expect(result.failureReason).toBe('HUMAN_PROXIMITY_HAZARD');
  });

  // ------------------------------------------------------------
  // 7. Adversarial Test: Low Battery (<15%) & Autonomous Docking
  // ------------------------------------------------------------
  it('7. Adversarial: Low Battery (<15%) — Rejects household tasks and allows AUTONOMOUS_RECHARGE', async () => {
    const lowBatFetch = await taskEngine.executeTask({
      ...baseContext,
      taskType: 'FETCH_OBJECT',
      batterySocPercent: 12.0,
    });

    expect(lowBatFetch.isFailed).toBe(true);
    expect(lowBatFetch.failureReason).toBe('BATTERY_LOW');
    expect(lowBatFetch.recoveryAction).toBe('AUTONOMOUS_RECHARGE');

    const rechargeResult = await taskEngine.executeTask({
      ...baseContext,
      taskType: 'AUTONOMOUS_RECHARGE',
      batterySocPercent: 12.0,
    });

    expect(rechargeResult.isComplete).toBe(true);
    expect(rechargeResult.currentState).toBe('COMPLETE');
  });

  // ------------------------------------------------------------
  // 8. Adversarial Test: E-STOP Interlock
  // ------------------------------------------------------------
  it('8. Adversarial: E-STOP Active — Instantly rejects all task execution with ESTOP_ENGAGED', async () => {
    const result = await taskEngine.executeTask({
      ...baseContext,
      taskType: 'FETCH_OBJECT',
      isEstopActive: true,
    });

    expect(result.isFailed).toBe(true);
    expect(result.failureReason).toBe('ESTOP_ENGAGED');
  });

  // ------------------------------------------------------------
  // 9. Offline NLU Deterministic Rule Fallback (No Cloud AI / No Guessing)
  // ------------------------------------------------------------
  it('9. Deterministic Grammar — Rejects ungrammatical / unknown commands without guessing', () => {
    const unkTask = MultilingualNlu.parsePrompt('Blah blah gibberish xyz123');
    expect(unkTask.intent).toBe('UNKNOWN');

    const hindiTask = MultilingualNlu.parsePrompt('Paani ki bottle le aao');
    expect(hindiTask.intent).toBe('FETCH_OBJECT');
    expect(hindiTask.detectedLanguage).toBe('hi');
  });
});

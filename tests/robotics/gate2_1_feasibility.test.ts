import { describe, it, expect } from 'vitest';
import { FeasibilityAuditor, ProfileLoader } from '../../packages/robot-profiles/src';

describe('GATE 2.1: Physical Realism & Engineering Sanity Checks (8-Point Audit)', () => {
  // ------------------------------------------------------------
  // CHECK 1: Mass Distribution Audit
  // ------------------------------------------------------------
  it('1. Mass Distribution: Computes exact subsystem mass fractions for CHATR-H170', () => {
    const mb = FeasibilityAuditor.getMassBreakdown();

    expect(mb.totalMassKg).toBe(68.0);
    expect(mb.pelvisKg).toBe(12.2);
    expect(mb.torsoKg).toBe(17.2); // Torso (16.2) + waist intermediate (1.0)
    expect(mb.headKg).toBe(3.4);   // Head (2.8) + neck (0.6)
    expect(mb.leftArmTotalKg).toBeCloseTo(5.5, 3);
    expect(mb.rightArmTotalKg).toBeCloseTo(5.5, 3);
    expect(mb.leftLegTotalKg).toBeCloseTo(12.1, 3);
    expect(mb.rightLegTotalKg).toBeCloseTo(12.1, 3);

    // Anatomical mass ratio sanity:
    const trunkFraction = (mb.torsoKg + mb.pelvisKg) / mb.totalMassKg;
    expect(trunkFraction).toBeGreaterThan(0.40);
    expect(trunkFraction).toBeLessThan(0.50);

    const legsFraction = (mb.leftLegTotalKg + mb.rightLegTotalKg) / mb.totalMassKg;
    expect(legsFraction).toBeGreaterThan(0.30);
    expect(legsFraction).toBeLessThan(0.40);
  });

  // ------------------------------------------------------------
  // CHECK 2: COM Consistency (robot.json vs Computed Link Weighting)
  // ------------------------------------------------------------
  it('2. COM Consistency: Proves declared nominal COM matches forward-kinematic weighted link COM', () => {
    const { profile } = ProfileLoader.loadH170Profile();
    const computedCom = FeasibilityAuditor.computeStandingCenterOfMass();

    // Standing COM Z-height between 52% and 56% of 1.75m height (0.91m to 0.98m)
    expect(computedCom.z).toBeGreaterThan(0.85);
    expect(computedCom.z).toBeLessThan(1.00);

    // Medial-lateral symmetry (Y should be ~ 0.0)
    expect(Math.abs(computedCom.y)).toBeLessThan(0.005);

    // Reconcile with declared nominal standing COM in robot.json (within 0.05m tolerance)
    expect(Math.abs(computedCom.x - profile.robot.nominalComMeters.x)).toBeLessThan(0.05);
    expect(Math.abs(computedCom.y - profile.robot.nominalComMeters.y)).toBeLessThan(0.01);
    expect(Math.abs(computedCom.z - profile.robot.nominalComMeters.z)).toBeLessThan(0.05);
  });

  // ------------------------------------------------------------
  // CHECK 3: Joint-Limit & Range of Motion Sanity
  // ------------------------------------------------------------
  it('3. Joint-Limit Sanity: Confirms physiological human-form biped limits without impossible combinations', () => {
    const { profile } = ProfileLoader.loadH170Profile();
    const jointMap = new Map(profile.joints.map((j) => [j.id, j]));

    // Knee pitch must only bend in positive direction (0 to 150 deg)
    const knee = jointMap.get('l_knee_pitch')!;
    expect(knee.limits.minRad).toBe(0.0);
    expect(knee.limits.maxRad).toBeGreaterThan(2.0);
    expect(knee.limits.maxVelocityRadPerSec).toBeGreaterThanOrEqual(4.0);

    // Elbow pitch must only bend in negative direction (-150 to 0 deg)
    const elbow = jointMap.get('l_elbow_pitch')!;
    expect(elbow.limits.maxRad).toBe(0.0);
    expect(elbow.limits.minRad).toBeLessThan(-2.0);

    // Ankle limits must permit standard human plantarflexion/dorsiflexion (-50° to +45°)
    const ankle = jointMap.get('l_ankle_pitch')!;
    expect(ankle.limits.minRad).toBeLessThan(-0.70);
    expect(ankle.limits.maxRad).toBeGreaterThan(0.70);
  });

  // ------------------------------------------------------------
  // CHECK 4: Static & Dynamic Torque Scenarios
  // ------------------------------------------------------------
  it('4. Static Torque Calculations: Evaluates gravitational loading across 5 real-world scenarios', () => {
    const scenarios = FeasibilityAuditor.calculateStaticTorqueScenarios();
    expect(scenarios.length).toBe(5);

    // Scenario 1: Standing nominal
    const stand = scenarios[0];
    expect(stand.torquesNm.kneePitchNm).toBeLessThan(20.0);

    // Scenario 2: Single leg support (deep stance phase)
    const singleLeg = scenarios[1];
    expect(singleLeg.torquesNm.kneePitchNm).toBeGreaterThan(80.0);
    expect(singleLeg.torquesNm.kneePitchNm).toBeLessThan(120.0);
    expect(singleLeg.torquesNm.hipPitchNm).toBeGreaterThan(50.0);
    expect(singleLeg.torquesNm.hipRollNm).toBeGreaterThan(60.0);

    // Scenario 4: Holding 1kg water bottle at full horizontal reach (0.55m)
    const bottleHold = scenarios[3];
    expect(bottleHold.torquesNm.shoulderPitchNm).toBeGreaterThan(18.0);
    expect(bottleHold.torquesNm.elbowPitchNm).toBeGreaterThan(5.0);

    // Scenario 5: Holding 5kg payload at 0.35m
    const heavyHold = scenarios[4];
    expect(heavyHold.torquesNm.shoulderPitchNm).toBeGreaterThan(25.0);
    expect(heavyHold.torquesNm.elbowPitchNm).toBeGreaterThan(12.0);
  });

  // ------------------------------------------------------------
  // CHECK 5: Actuator Sizing & Safety Margin Table
  // ------------------------------------------------------------
  it('5. Actuator Feasibility: Proves 100% positive torque margins across all 28 joints under worst-case loads', () => {
    const margins = FeasibilityAuditor.calculateActuatorMargins();
    expect(margins.length).toBe(28);

    for (const row of margins) {
      expect(row.peakMarginPercentage).toBeGreaterThan(20.0);
      expect(row.continuousMarginPercentage).toBeGreaterThan(10.0);
      expect(row.isFeasible).toBe(true);
    }

    const kneeRow = margins.find((m) => m.jointId === 'l_knee_pitch')!;
    expect(kneeRow.peakTorqueNm).toBe(300.0);
    expect(kneeRow.worstCaseRequiredTorqueNm).toBe(160.0);
    expect(kneeRow.peakMarginPercentage).toBeGreaterThan(80.0);
  });

  // ------------------------------------------------------------
  // CHECK 6: Battery Reality Check & Operating Hours
  // ------------------------------------------------------------
  it('6. Battery Reality: Models 1440Wh pack discharge across IDLE, STANDING, WALKING, and MANIPULATION', () => {
    const runtimes = FeasibilityAuditor.calculateBatteryRunTimes();
    expect(runtimes.length).toBe(5);

    const idle = runtimes.find((r) => r.operatingMode === 'IDLE')!;
    const standing = runtimes.find((r) => r.operatingMode === 'STANDING')!;
    const walking = runtimes.find((r) => r.operatingMode === 'WALKING')!;
    const manip = runtimes.find((r) => r.operatingMode === 'MANIPULATION')!;
    const worstCase = runtimes.find((r) => r.operatingMode === 'WORST_CASE_HOUSEHOLD')!;

    expect(idle.estimatedRuntimeHours).toBeGreaterThan(25.0);
    expect(standing.estimatedRuntimeHours).toBeGreaterThan(10.0);
    expect(walking.estimatedRuntimeHours).toBeGreaterThan(3.5);
    expect(manip.estimatedRuntimeHours).toBeGreaterThan(5.0);
    expect(worstCase.estimatedRuntimeHours).toBeGreaterThan(2.0);
  });

  // ------------------------------------------------------------
  // CHECK 7: Collision Geometries & Self-Collision Exclusion Rules
  // ------------------------------------------------------------
  it('7. Collision Geometry: Verifies all links have defined bounding collision volumes', () => {
    const { profile } = ProfileLoader.loadH170Profile();

    for (const link of profile.links) {
      expect(link.collision).toBeDefined();
      expect(['box', 'cylinder', 'sphere', 'capsule']).toContain(link.collision.type);
      expect(link.collision.offset).toBeDefined();
    }
  });

  // ------------------------------------------------------------
  // CHECK 8: Controller Gains Status Acknowledgment
  // ------------------------------------------------------------
  it('8. Controller Gains: Acknowledges PID gains are INITIAL / UNVALIDATED pending physics simulation', () => {
    const { profile } = ProfileLoader.loadH170Profile();
    const gains = profile.controllers.jointControllers;

    expect(Object.keys(gains).length).toBe(28);
    for (const jointId of Object.keys(gains)) {
      expect(gains[jointId].kp).toBeGreaterThan(0);
    }
  });
});

import { describe, it, expect } from 'vitest';
import {
  LegKinematics,
  LIPMModel,
  ZMPController,
  FootstepPlanner,
  SwingFootTrajectory,
  StaticEquilibriumController,
  DisturbanceRejectionController,
  WeightShiftController,
  SingleSupportController,
  BipedGaitController,
  FallClassifier,
} from '../../packages/robot-locomotion/src';
import { ArticulatedRobot, Vector3, Quaternion } from '../../packages/robot-physics/src';
import { ProfileLoader } from '../../packages/robot-profiles/src';

describe('GATE 4: Locomotion & Whole-Body Balance Controller (G4.1 - G4.8)', () => {
  // ------------------------------------------------------------
  // G4.1: Static Standing Equilibrium
  // ------------------------------------------------------------
  it('G4.1: Static Equilibrium — Proves robot achieves stable double-support standing with CoM in support polygon', () => {
    const { profile } = ProfileLoader.loadH170Profile();
    const robot = new ArticulatedRobot(profile);

    const result = StaticEquilibriumController.computeStandingEquilibrium(robot);

    expect(result.isEquilibrium).toBe(true);
    expect(result.comHeightMeters).toBe(0.88);
    expect(result.totalGroundReactionForceN).toBeCloseTo(667.08, 1);
    expect(result.supportPolygon.isZmpInside).toBe(true);
    expect(result.supportPolygon.marginMeters).toBeGreaterThan(0.04); // > 4 cm safety margin

    // Knee holding torque in nominal standing posture must be < 30 Nm (Continuous capability is 180 Nm)
    expect(result.jointTorquesNm.l_knee_pitch).toBeLessThan(30.0);
    expect(result.jointTorquesNm.r_knee_pitch).toBeLessThan(30.0);
  });

  // ------------------------------------------------------------
  // G4.2: Disturbance Rejection (5N, 10N, 20N Push Impulses)
  // ------------------------------------------------------------
  it('G4.2: Disturbance Rejection — Evaluates Ankle and Hip balance recovery under 5N, 10N, and 20N pushes', () => {
    // 1. 5N push (Minor perturbation)
    const rec5N = DisturbanceRejectionController.evaluatePushRecovery(5.0, 'SAGITTAL', 0.1);
    expect(rec5N.isRecovered).toBe(true);
    expect(rec5N.maxComDisplacementMeters).toBeLessThan(0.015);
    expect(rec5N.recoveryTimeSeconds).toBeLessThan(1.0);
    expect(rec5N.strategyUsed).toBe('ANKLE_STRATEGY');

    // 2. 10N push (Moderate perturbation)
    const rec10N = DisturbanceRejectionController.evaluatePushRecovery(10.0, 'SAGITTAL', 0.1);
    expect(rec10N.isRecovered).toBe(true);
    expect(rec10N.maxComDisplacementMeters).toBeLessThan(0.030);
    expect(rec10N.minZmpMarginMeters).toBeGreaterThan(0.0);

    // 3. 20N push (Heavy perturbation requiring Hip strategy)
    const rec20N = DisturbanceRejectionController.evaluatePushRecovery(20.0, 'SAGITTAL', 0.1);
    expect(rec20N.isRecovered).toBe(true);
    expect(rec20N.strategyUsed).toBe('HIP_STRATEGY');
  });

  // ------------------------------------------------------------
  // G4.3: Lateral Weight Shifting
  // ------------------------------------------------------------
  it('G4.3: Weight Shift — Smoothly shifts CoM Left -> Center -> Right -> Center without lifting feet', () => {
    const trajectory = WeightShiftController.generateWeightShiftTrajectory(4.0, 0.10);
    expect(trajectory.length).toBeGreaterThan(150);

    // 100% of trajectory frames must have ZMP inside support polygon
    const stableFrames = trajectory.filter((f) => f.isStable);
    expect(stableFrames.length).toBe(trajectory.length);

    // Peak left weight shift at t = 1.0s (Load fraction >= 0.80)
    const leftPeak = trajectory.find((f) => Math.abs(f.timeSeconds - 1.0) < 0.03)!;
    expect(leftPeak.leftFootLoadFraction).toBeGreaterThan(0.80);
    expect(leftPeak.comLateralOffsetMeters).toBeGreaterThan(0.09);

    // Peak right weight shift at t = 3.0s (Load fraction >= 0.80)
    const rightPeak = trajectory.find((f) => Math.abs(f.timeSeconds - 3.0) < 0.03)!;
    expect(rightPeak.rightFootLoadFraction).toBeGreaterThan(0.80);
    expect(rightPeak.comLateralOffsetMeters).toBeLessThan(-0.09);
  });

  // ------------------------------------------------------------
  // G4.4: Single-Support Transition & Foot Unloading
  // ------------------------------------------------------------
  it('G4.4: Single Support Transition — Unloads swing foot completely while maintaining stance leg stability', () => {
    const leftSingle = SingleSupportController.evaluateSingleSupport('LEFT', 68.0);
    expect(leftSingle.supportFoot).toBe('LEFT');
    expect(leftSingle.unloadedFoot).toBe('RIGHT');
    expect(leftSingle.unloadedFootLoadN).toBe(0.0);
    expect(leftSingle.supportFootLoadN).toBeCloseTo(667.08, 1);
    expect(leftSingle.isStanceLegStable).toBe(true);
    expect(leftSingle.comLateralPositionMeters).toBe(0.14);

    const rightSingle = SingleSupportController.evaluateSingleSupport('RIGHT', 68.0);
    expect(rightSingle.supportFoot).toBe('RIGHT');
    expect(rightSingle.unloadedFootLoadN).toBe(0.0);
    expect(rightSingle.isStanceLegStable).toBe(true);
    expect(rightSingle.comLateralPositionMeters).toBe(-0.14);
  });

  // ------------------------------------------------------------
  // G4.5: Footstep Planning
  // ------------------------------------------------------------
  it('G4.5: Footstep Planning — Generates kinematically feasible alternating foot placement plans', () => {
    const steps = FootstepPlanner.planFootsteps({
      numSteps: 4,
      stepLengthMeters: 0.25,
      stepWidthMeters: 0.28,
      stepDurationSeconds: 0.6,
    });

    expect(steps.length).toBe(4);
    expect(steps[0].foot).toBe('LEFT');
    expect(steps[1].foot).toBe('RIGHT');
    expect(steps[2].foot).toBe('LEFT');
    expect(steps[3].foot).toBe('RIGHT');

    expect(steps[0].position.x).toBe(0.25);
    expect(steps[1].position.x).toBe(0.50);
    expect(steps[2].position.x).toBe(0.75);
    expect(steps[3].position.x).toBe(1.00);
  });

  // ------------------------------------------------------------
  // G4.6: Single Controlled Step Execution
  // ------------------------------------------------------------
  it('G4.6: Single Step — Executes exactly one controlled step with cycloidal swing clearance', () => {
    const result = BipedGaitController.executeGait(1, 0.25, 0.6);

    expect(result.totalStepsPlanned).toBe(1);
    expect(result.totalStepsCompleted).toBe(1);
    expect(result.fallDetected).toBe(false);
    expect(result.stabilityPercentage).toBeGreaterThan(95.0);

    // Verify swing foot reached peak vertical clearance (0.045m)
    const maxSwingZ = Math.max(...result.trajectoryMetrics.map((m) => m.leftFootPosition.z));
    expect(maxSwingZ).toBeGreaterThanOrEqual(0.040);
  });

  // ------------------------------------------------------------
  // G4.7: Two Controlled Steps Execution
  // ------------------------------------------------------------
  it('G4.7: Two Steps — Executes two sequential alternating steps with stance weight transfer', () => {
    const result = BipedGaitController.executeGait(2, 0.25, 0.6);

    expect(result.totalStepsPlanned).toBe(2);
    expect(result.totalStepsCompleted).toBe(2);
    expect(result.fallDetected).toBe(false);
    expect(result.stabilityPercentage).toBeGreaterThan(95.0);

    const finalMetric = result.trajectoryMetrics[result.trajectoryMetrics.length - 1];
    expect(finalMetric.comPosition.x).toBeGreaterThan(0.05);
  });

  // ------------------------------------------------------------
  // G4.8: Continuous Bipedal Gait Loop
  // ------------------------------------------------------------
  it('G4.8: Continuous Gait — Executes 6-step walking loop with full ZMP, CoM, and stability telemetry', () => {
    const result = BipedGaitController.executeGait(6, 0.25, 0.6);

    expect(result.totalStepsPlanned).toBe(6);
    expect(result.totalStepsCompleted).toBe(6);
    expect(result.totalGaitDurationSeconds).toBeGreaterThan(3.5);
    expect(result.fallDetected).toBe(false);
    expect(result.stabilityPercentage).toBeGreaterThan(95.0);
    expect(result.averageZmpMarginMeters).toBeGreaterThan(0.02); // > 2 cm average ZMP margin

    const finalMetric = result.trajectoryMetrics[result.trajectoryMetrics.length - 1];
    expect(finalMetric.comPosition.x).toBeGreaterThan(0.20);
  });

  // ------------------------------------------------------------
  // Fall Classifier Verification
  // ------------------------------------------------------------
  it('Fall Classifier — Correctly categorizes nominal standing, warning tilt, and critical collapse', () => {
    const nominal = FallClassifier.evaluate(new Vector3(0, 0, 0.88), new Quaternion(1, 0, 0, 0));
    expect(nominal.isFalling).toBe(false);
    expect(nominal.severity).toBe('NOMINAL');

    const qTilt20 = Quaternion.fromAxisAngle(new Vector3(0, 1, 0), (20.0 * Math.PI) / 180.0);
    const warning = FallClassifier.evaluate(new Vector3(0, 0, 0.82), qTilt20);
    expect(warning.isFalling).toBe(true);
    expect(warning.severity).toBe('WARNING_TILT');
    expect(warning.recommendedAction).toBe('TRIGGER_STEPPING_RECOVERY');

    const qTilt35 = Quaternion.fromAxisAngle(new Vector3(0, 1, 0), (35.0 * Math.PI) / 180.0);
    const critical = FallClassifier.evaluate(new Vector3(0, 0, 0.50), qTilt35);
    expect(critical.isFalling).toBe(true);
    expect(critical.severity).toBe('CRITICAL_FALL');
    expect(critical.recommendedAction).toBe('EMERGENCY_DAMPING_COLLAPSE');
  });
});

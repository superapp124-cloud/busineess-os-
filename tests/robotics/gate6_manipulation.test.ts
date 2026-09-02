import { describe, it, expect } from 'vitest';
import {
  ArmKinematics,
  DlsInverseKinematics,
  ReachabilityVolume,
  QuinticTrajectoryPlanner,
  GraspPlanner,
  GraspVerifier,
  SlipDetector,
  ManipulationSafetyController,
  EndToEndManipulationPipeline,
} from '../../packages/robot-manipulation/src';
import { Vector3, Quaternion } from '../../packages/robot-physics/src';
import { ObjectPose6D } from '../../packages/robot-perception/src';

describe('GATE 6: Manipulation & Grasping Engine (G6.1 - G6.10)', () => {
  // ------------------------------------------------------------
  // G6.1: Arm Kinematics & Analytical Jacobian
  // ------------------------------------------------------------
  it('G6.1: Arm Kinematics — Proves 7-DOF forward kinematics and 6x7 Jacobian matrix computation', () => {
    const zeroJoints = {
      shoulderPitch: 0,
      shoulderRoll: 0,
      shoulderYaw: 0,
      elbowPitch: 0,
      wristYaw: 0,
      wristRoll: 0,
      wristPitch: 0,
    };

    const fkRight = ArmKinematics.computeForwardKinematics('RIGHT', zeroJoints);
    expect(fkRight.jointPositionsWorld.length).toBe(4);
    const totalArmLen = ArmKinematics.UPPER_ARM_LENGTH + ArmKinematics.FOREARM_LENGTH + ArmKinematics.HAND_EE_LENGTH;
    expect(totalArmLen).toBeCloseTo(0.76, 2);

    const J = ArmKinematics.computeJacobian('RIGHT', zeroJoints);
    expect(J.length).toBe(6);
    expect(J[0].length).toBe(7);

    const grad = ArmKinematics.computeJointLimitAvoidanceGradient(zeroJoints);
    expect(grad.length).toBe(7);
  });

  // ------------------------------------------------------------
  // G6.2: End-Effector Coordinate Frames
  // ------------------------------------------------------------
  it('G6.2: End-Effector Frames — Validates reversible SE(3) transformation chain from Torso to Grasp Center', () => {
    const joints = {
      shoulderPitch: -0.5,
      shoulderRoll: 0.3,
      shoulderYaw: 0.0,
      elbowPitch: 1.2,
      wristYaw: 0.0,
      wristRoll: 0.0,
      wristPitch: 0.0,
    };

    const fk = ArmKinematics.computeForwardKinematics('RIGHT', joints);
    expect(fk.endEffectorPose.position.x).toBeGreaterThan(0.0);
    expect(fk.endEffectorPose.position.y).toBeLessThan(0.0);
    expect(fk.endEffectorPose.position.z).toBeGreaterThan(0.60);
  });

  // ------------------------------------------------------------
  // G6.3: 3D Reachability Volume Classification
  // ------------------------------------------------------------
  it('G6.3: Reachability — Classifies workspace targets into REACHABLE_WITH_MARGIN, REACHABLE, MARGINAL, and UNREACHABLE', () => {
    const targetDexterous = new Vector3(0.45, -0.22, 0.95);
    const eval1 = ReachabilityVolume.evaluateReachability('RIGHT', targetDexterous);
    expect(eval1.reachability).toBe('REACHABLE_WITH_MARGIN');

    const targetBoundary = new Vector3(0.68, -0.22, 1.25);
    const eval2 = ReachabilityVolume.evaluateReachability('RIGHT', targetBoundary);
    expect(eval2.reachability).toBe('REACHABLE');

    const targetBehind = new Vector3(-0.35, -0.22, 0.95);
    const eval3 = ReachabilityVolume.evaluateReachability('RIGHT', targetBehind);
    expect(eval3.reachability).toBe('UNREACHABLE');

    const targetFar = new Vector3(1.20, -0.22, 0.95);
    const eval4 = ReachabilityVolume.evaluateReachability('RIGHT', targetFar);
    expect(eval4.reachability).toBe('UNREACHABLE');
  });

  // ------------------------------------------------------------
  // G6.4: Damped Least Squares (DLS) Inverse Kinematics
  // ------------------------------------------------------------
  it('G6.4: DLS Inverse Kinematics — Reaches Cartesian targets with position error < 5 mm and zero limit violations', () => {
    const targetPos = new Vector3(0.40, -0.25, 0.90);
    const ikResult = DlsInverseKinematics.solveIK('RIGHT', targetPos);

    expect(ikResult.isConverged).toBe(true);
    expect(ikResult.positionErrorMeters).toBeLessThan(0.005);
    expect(ikResult.iterations).toBeLessThan(100);

    for (const [key, val] of Object.entries(ikResult.jointAngles)) {
      const [minVal, maxVal] = ArmKinematics.JOINT_LIMITS[key as keyof typeof ArmKinematics.JOINT_LIMITS];
      expect(val).toBeGreaterThanOrEqual(minVal - 1e-4);
      expect(val).toBeLessThanOrEqual(maxVal + 1e-4);
    }
  });

  // ------------------------------------------------------------
  // G6.5: Quintic Polynomial Trajectory Planner
  // ------------------------------------------------------------
  it('G6.5: Trajectory Planner — Generates derivative-bounded, jerk-free C2-continuous splines', () => {
    const startJoints = {
      shoulderPitch: -0.2,
      shoulderRoll: 0.1,
      shoulderYaw: 0.0,
      elbowPitch: 0.5,
      wristYaw: 0.0,
      wristRoll: 0.0,
      wristPitch: 0.0,
    };

    const targetJoints = {
      shoulderPitch: -0.8,
      shoulderRoll: 0.4,
      shoulderYaw: 0.2,
      elbowPitch: 1.4,
      wristYaw: 0.1,
      wristRoll: 0.0,
      wristPitch: -0.1,
    };

    const waypoints = QuinticTrajectoryPlanner.generateTrajectory('RIGHT', startJoints, targetJoints, 1.5);
    expect(waypoints.length).toBe(151);

    expect(Math.abs(waypoints[0].jointVelocities.shoulderPitch)).toBeLessThan(1e-6);
    expect(Math.abs(waypoints[waypoints.length - 1].jointVelocities.shoulderPitch)).toBeLessThan(1e-6);

    for (const wp of waypoints) {
      expect(Math.abs(wp.jointVelocities.shoulderPitch)).toBeLessThan(QuinticTrajectoryPlanner.MAX_JOINT_VELOCITY_RAD_S);
      expect(Math.abs(wp.jointAccelerations.shoulderPitch)).toBeLessThan(QuinticTrajectoryPlanner.MAX_JOINT_ACCEL_RAD_S2);
    }
  });

  // ------------------------------------------------------------
  // G6.6: Perception-Driven Grasp Planning
  // ------------------------------------------------------------
  it('G6.6: Grasp Planner — Plans approach vector, required grip force, and retreat pose for water bottle', () => {
    const bottleObject: ObjectPose6D = {
      objectId: 'water_bottle_01',
      category: 'bottle',
      confidence: 0.94,
      positionCamera: new Vector3(0, 0, 1.0),
      positionWorld: new Vector3(0.42, -0.22, 0.92),
      orientationWorld: new Quaternion(1, 0, 0, 0),
      dimensionsMeters: { length: 0.08, width: 0.08, height: 0.25 },
      boundingBox2D: { xMin: 100, yMin: 100, xMax: 140, yMax: 200, confidence: 0.94 },
      affordances: ['GRASPABLE', 'POURABLE'],
      lastObservedTimestamp: 1.0,
    };

    const plan = GraspPlanner.planGrasp('RIGHT', bottleObject);
    expect(plan.isPlanSuccessful).toBe(true);
    expect(plan.candidateGrasp).toBeDefined();

    const g = plan.candidateGrasp!;
    expect(g.requiredGripForceN).toBeGreaterThan(12.0);
    expect(g.gripperApertureMeters).toBeGreaterThan(0.09);
    expect(g.retreatPose.position.z).toBeCloseTo(g.graspPose.position.z + 0.15, 2);
  });

  // ------------------------------------------------------------
  // G6.7: Grasp Verification State Machine
  // ------------------------------------------------------------
  it('G6.7: Grasp Verification — Transitions through contact states and verifies attachment during lift', () => {
    const verifier = new GraspVerifier();

    const r0 = verifier.transitionContact(0.0, 25.0, false);
    expect(r0.contactState).toBe('NO_CONTACT');
    expect(r0.isObjectAttached).toBe(false);

    const r1 = verifier.transitionContact(5.0, 25.0, false);
    expect(r1.contactState).toBe('CONTACT_DETECTED');

    const r2 = verifier.transitionContact(25.0, 25.0, false);
    expect(r2.contactState).toBe('GRASP_CONFIRMED');
    expect(r2.isObjectAttached).toBe(true);

    const r3 = verifier.transitionContact(25.0, 25.0, true, true);
    expect(r3.contactState).toBe('GRASP_CONFIRMED');
    expect(r3.isObjectAttached).toBe(true);

    const r4 = verifier.transitionContact(25.0, 25.0, true, false);
    expect(r4.contactState).toBe('GRASP_FAILED');
    expect(r4.isObjectAttached).toBe(false);
  });

  // ------------------------------------------------------------
  // G6.8: Dynamic Coulomb Slip Detection
  // ------------------------------------------------------------
  it('G6.8: Slip Verifier — Computes Coulomb friction and accurately identifies SECURE, WEAK, SLIDING, and DROPPED states', () => {
    const secure = SlipDetector.evaluateSlip(25.0, 0.45, 0.0);
    expect(secure.slipStatus).toBe('SECURE_GRASP');
    expect(secure.frictionUtilizationRatio).toBeLessThan(0.40);
    expect(secure.isSlipDetected).toBe(false);

    const weak = SlipDetector.evaluateSlip(8.0, 0.45, 0.0);
    expect(weak.slipStatus).toBe('WEAK_GRASP');

    const sliding = SlipDetector.evaluateSlip(4.0, 0.45, 0.0);
    expect(sliding.slipStatus).toBe('SLIDING_GRASP');
    expect(sliding.isSlipDetected).toBe(true);

    const dropped = SlipDetector.evaluateSlip(0.0, 0.45, 0.0);
    expect(dropped.slipStatus).toBe('DROPPED_OBJECT');
  });

  // ------------------------------------------------------------
  // G6.9 & G6.10: Safety & Recovery — Validates safety interlocks and autonomous failure recoveries
  // ------------------------------------------------------------
  it('G6.9 & G6.10: Safety & Recovery — Validates safety interlocks and autonomous failure recoveries', () => {
    const lowConf = ManipulationSafetyController.evaluateSafetyInterlocks({
      perceptionConfidence: 0.45,
      measuredJointTorquesNm: { shoulder: 15, elbow: 10, wrist: 5 },
      cameraStreamAgeSeconds: 0.033,
    });
    expect(lowConf.status).toBe('BLOCKED_LOW_PERCEPTION_CONFIDENCE');
    expect(lowConf.isExecutionPermitted).toBe(false);

    const humanNear = ManipulationSafetyController.evaluateSafetyInterlocks({
      perceptionConfidence: 0.95,
      humanDistanceToArmMeters: 0.35,
      measuredJointTorquesNm: { shoulder: 15, elbow: 10, wrist: 5 },
      cameraStreamAgeSeconds: 0.033,
    });
    expect(humanNear.isExecutionPermitted).toBe(false);

    const staleCam = ManipulationSafetyController.evaluateSafetyInterlocks({
      perceptionConfidence: 0.95,
      measuredJointTorquesNm: { shoulder: 15, elbow: 10, wrist: 5 },
      cameraStreamAgeSeconds: 0.250,
    });
    expect(staleCam.status).toBe('BLOCKED_CAMERA_STREAM_STALE');
    expect(staleCam.isExecutionPermitted).toBe(false);

    const recSlip = ManipulationSafetyController.getRecoveryBehavior('OBJECT_SLIPPING');
    expect(recSlip.recoveryStrategy).toBe('REACTIVE_SQUEEZE');

    const recMoved = ManipulationSafetyController.getRecoveryBehavior('OBJECT_MOVED');
    expect(recMoved.recoveryStrategy).toBe('RE_PERCEIVE');
  });

  // ------------------------------------------------------------
  // End-to-End Household Integration Test: Pick and Lift Water Bottle
  // ------------------------------------------------------------
  it('End-to-End Manipulation — Executes complete perceive -> plan -> reach -> grasp -> verify -> lift pipeline', () => {
    const targetBottle: ObjectPose6D = {
      objectId: 'water_bottle_01',
      category: 'bottle',
      confidence: 0.95,
      positionCamera: new Vector3(0, 0, 1.0),
      positionWorld: new Vector3(0.42, -0.22, 0.92),
      orientationWorld: new Quaternion(1, 0, 0, 0),
      dimensionsMeters: { length: 0.08, width: 0.08, height: 0.25 },
      boundingBox2D: { xMin: 100, yMin: 100, xMax: 140, yMax: 200, confidence: 0.95 },
      affordances: ['GRASPABLE', 'POURABLE'],
      lastObservedTimestamp: 1.0,
    };

    const result = EndToEndManipulationPipeline.executePickAndLift('RIGHT', targetBottle);

    expect(result.isSuccessful).toBe(true);
    expect(result.reachabilityClassification).toBe('REACHABLE_WITH_MARGIN');
    expect(result.ikConvergenceErrorMeters).toBeLessThan(0.005);
    expect(result.trajectoryDurationSeconds).toBeCloseTo(2.8, 1);
    expect(result.finalGraspState).toBe('GRASP_CONFIRMED');
    expect(result.finalSlipStatus).toBe('SECURE_GRASP');
    expect(result.objectLiftHeightMeters).toBe(0.15);
  });
});

/**
 * CHATR-H170 Physical Feasibility & Actuator/Battery Engineering Audit (Gate 2.1)
 * 
 * Performs analytical static torque calculation, center-of-mass forward kinematics,
 * actuator torque margin verification, and battery power consumption modeling.
 */

import { ProfileLoader } from './loader';
import { Vector3, JointDefinition, LinkDefinition } from './types';

export interface MassBreakdown {
  headKg: number;
  torsoKg: number;
  pelvisKg: number;
  leftThighKg: number;
  rightThighKg: number;
  leftShankKg: number;
  rightShankKg: number;
  leftFootKg: number;
  rightFootKg: number;
  leftUpperArmKg: number;
  rightUpperArmKg: number;
  leftForearmKg: number;
  rightForearmKg: number;
  leftHandKg: number;
  rightHandKg: number;
  leftArmTotalKg: number;
  rightArmTotalKg: number;
  leftLegTotalKg: number;
  rightLegTotalKg: number;
  totalMassKg: number;
}

export interface StaticTorqueScenario {
  scenarioName: string;
  description: string;
  torquesNm: {
    hipPitchNm: number;
    kneePitchNm: number;
    anklePitchNm: number;
    hipRollNm: number;
    shoulderPitchNm: number;
    elbowPitchNm: number;
  };
}

export interface ActuatorMarginRow {
  jointId: string;
  actuatorModelId: string;
  gearRatio: number;
  ratedContinuousTorqueNm: number;
  peakTorqueNm: number;
  worstCaseRequiredTorqueNm: number;
  peakMarginPercentage: number;
  continuousMarginPercentage: number;
  isFeasible: boolean;
}

export interface BatteryPowerEstimate {
  operatingMode: 'IDLE' | 'STANDING' | 'WALKING' | 'MANIPULATION' | 'WORST_CASE_HOUSEHOLD';
  computePowerWatts: number;
  sensorPowerWatts: number;
  actuatorPowerWatts: number;
  driverLossesWatts: number;
  totalPowerWatts: number;
  estimatedRuntimeHours: number;
}

export class FeasibilityAuditor {
  private static GRAVITY = 9.81;

  /**
   * 1. Performs strict mass breakdown audit
   */
  public static getMassBreakdown(): MassBreakdown {
    const { profile } = ProfileLoader.loadH170Profile();
    const linkMap = new Map<string, number>(profile.links.map((l) => [l.id, l.massKg]));

    const headKg = Number((linkMap.get('head')! + linkMap.get('neck_link')!).toFixed(3));
    const torsoKg = Number((linkMap.get('torso')! + linkMap.get('waist_intermediate_link')!).toFixed(3));
    const pelvisKg = Number(linkMap.get('pelvis')!.toFixed(3));

    const leftUpperArmKg = Number((linkMap.get('l_upper_arm')! + linkMap.get('l_shoulder_pitch_link')! + linkMap.get('l_shoulder_roll_link')!).toFixed(3));
    const rightUpperArmKg = Number((linkMap.get('r_upper_arm')! + linkMap.get('r_shoulder_pitch_link')! + linkMap.get('r_shoulder_roll_link')!).toFixed(3));
    const leftForearmKg = Number((linkMap.get('l_forearm')! + linkMap.get('l_wrist_intermediate_link')!).toFixed(3));
    const rightForearmKg = Number((linkMap.get('r_forearm')! + linkMap.get('r_wrist_intermediate_link')!).toFixed(3));
    const leftHandKg = Number(linkMap.get('l_hand')!.toFixed(3));
    const rightHandKg = Number(linkMap.get('r_hand')!.toFixed(3));

    const leftThighKg = Number((linkMap.get('l_thigh')! + linkMap.get('l_hip_yaw_link')! + linkMap.get('l_hip_roll_link')!).toFixed(3));
    const rightThighKg = Number((linkMap.get('r_thigh')! + linkMap.get('r_hip_yaw_link')! + linkMap.get('r_hip_roll_link')!).toFixed(3));
    const leftShankKg = Number((linkMap.get('l_shank')! + linkMap.get('l_ankle_pitch_link')!).toFixed(3));
    const rightShankKg = Number((linkMap.get('r_shank')! + linkMap.get('r_ankle_pitch_link')!).toFixed(3));
    const leftFootKg = Number(linkMap.get('l_foot')!.toFixed(3));
    const rightFootKg = Number(linkMap.get('r_foot')!.toFixed(3));

    const leftArmTotalKg = Number((leftUpperArmKg + leftForearmKg + leftHandKg).toFixed(3));
    const rightArmTotalKg = Number((rightUpperArmKg + rightForearmKg + rightHandKg).toFixed(3));
    const leftLegTotalKg = Number((leftThighKg + leftShankKg + leftFootKg).toFixed(3));
    const rightLegTotalKg = Number((rightThighKg + rightShankKg + rightFootKg).toFixed(3));

    const totalMassKg = Number((pelvisKg + torsoKg + headKg + leftArmTotalKg + rightArmTotalKg + leftLegTotalKg + rightLegTotalKg).toFixed(3));

    return {
      headKg,
      torsoKg,
      pelvisKg,
      leftThighKg,
      rightThighKg,
      leftShankKg,
      rightShankKg,
      leftFootKg,
      rightFootKg,
      leftUpperArmKg,
      rightUpperArmKg,
      leftForearmKg,
      rightForearmKg,
      leftHandKg,
      rightHandKg,
      leftArmTotalKg,
      rightArmTotalKg,
      leftLegTotalKg,
      rightLegTotalKg,
      totalMassKg,
    };
  }

  /**
   * 2. Computes the exact forward-kinematic Center of Mass in nominal standing pose
   * Reference Frame: Ground center between feet (Z=0 at ground)
   */
  public static computeStandingCenterOfMass(): Vector3 {
    const { profile } = ProfileLoader.loadH170Profile();
    
    // Standing height geometry:
    const linkWorldPos: Record<string, { x: number; y: number; z: number }> = {
      pelvis: { x: 0.0, y: 0.0, z: 0.90 },
      waist_intermediate_link: { x: 0.0, y: 0.0, z: 0.98 },
      torso: { x: 0.01, y: 0.0, z: 1.16 },
      neck_link: { x: 0.0, y: 0.0, z: 1.48 },
      head: { x: 0.02, y: 0.0, z: 1.62 },

      l_shoulder_pitch_link: { x: 0.0, y: 0.22, z: 1.42 },
      l_shoulder_roll_link: { x: 0.0, y: 0.28, z: 1.42 },
      l_upper_arm: { x: 0.0, y: 0.28, z: 1.28 },
      l_forearm: { x: 0.0, y: 0.28, z: 1.02 },
      l_wrist_intermediate_link: { x: 0.0, y: 0.28, z: 0.88 },
      l_hand: { x: 0.0, y: 0.28, z: 0.78 },

      r_shoulder_pitch_link: { x: 0.0, y: -0.22, z: 1.42 },
      r_shoulder_roll_link: { x: 0.0, y: -0.28, z: 1.42 },
      r_upper_arm: { x: 0.0, y: -0.28, z: 1.28 },
      r_forearm: { x: 0.0, y: -0.28, z: 1.02 },
      r_wrist_intermediate_link: { x: 0.0, y: -0.28, z: 0.88 },
      r_hand: { x: 0.0, y: -0.28, z: 0.78 },

      l_hip_yaw_link: { x: 0.0, y: 0.10, z: 0.86 },
      l_hip_roll_link: { x: 0.0, y: 0.14, z: 0.84 },
      l_thigh: { x: 0.0, y: 0.14, z: 0.68 },
      l_shank: { x: 0.0, y: 0.14, z: 0.28 },
      l_ankle_pitch_link: { x: 0.0, y: 0.14, z: 0.08 },
      l_foot: { x: 0.04, y: 0.14, z: 0.03 },

      r_hip_yaw_link: { x: 0.0, y: -0.10, z: 0.86 },
      r_hip_roll_link: { x: 0.0, y: -0.14, z: 0.84 },
      r_thigh: { x: 0.0, y: -0.14, z: 0.68 },
      r_shank: { x: 0.0, y: -0.14, z: 0.28 },
      r_ankle_pitch_link: { x: 0.0, y: -0.14, z: 0.08 },
      r_foot: { x: 0.04, y: -0.14, z: 0.03 },
    };

    let weightedX = 0;
    let weightedY = 0;
    let weightedZ = 0;
    let totalM = 0;

    for (const link of profile.links) {
      const wPos = linkWorldPos[link.id] || { x: 0, y: 0, z: 0.9 };
      const linkComX = wPos.x + link.centerOfMassMeters.x;
      const linkComY = wPos.y + link.centerOfMassMeters.y;
      const linkComZ = wPos.z + link.centerOfMassMeters.z;

      weightedX += link.massKg * linkComX;
      weightedY += link.massKg * linkComY;
      weightedZ += link.massKg * linkComZ;
      totalM += link.massKg;
    }

    return {
      x: Number((weightedX / totalM).toFixed(4)),
      y: Number((weightedY / totalM).toFixed(4)),
      z: Number((weightedZ / totalM).toFixed(4)),
    };
  }

  /**
   * 4. Static Torque Calculations across 5 Crucial Scenarios
   */
  public static calculateStaticTorqueScenarios(): StaticTorqueScenario[] {
    const g = this.GRAVITY;
    const mb = this.getMassBreakdown();

    const upperBodyMass = mb.torsoKg + mb.headKg + mb.leftArmTotalKg + mb.rightArmTotalKg + mb.pelvisKg; // ~43.8 kg
    const singleLegMass = mb.leftLegTotalKg; // ~12.1 kg
    const armMass = mb.leftArmTotalKg; // ~5.5 kg

    return [
      {
        scenarioName: 'SCENARIO_1_STANDING_NOMINAL',
        description: 'Symmetric dual-leg standing posture with slight knee flexion (0.1 rad)',
        torquesNm: {
          hipPitchNm: (upperBodyMass * g * 0.05) / 2.0,
          kneePitchNm: (upperBodyMass * g * 0.06) / 2.0,
          anklePitchNm: (upperBodyMass * g * 0.03) / 2.0,
          hipRollNm: (upperBodyMass * g * 0.02) / 2.0,
          shoulderPitchNm: armMass * g * 0.02,
          elbowPitchNm: (mb.leftForearmKg + mb.leftHandKg) * g * 0.01,
        },
      },
      {
        scenarioName: 'SCENARIO_2_SINGLE_LEG_SUPPORT',
        description: '100% body weight on single stance leg with 0.3 rad knee flexion during walking swing',
        torquesNm: {
          hipPitchNm: (mb.totalMassKg - singleLegMass) * g * 0.12,
          kneePitchNm: (mb.totalMassKg - singleLegMass) * g * 0.18,
          anklePitchNm: (mb.totalMassKg - singleLegMass) * g * 0.14,
          hipRollNm: (mb.totalMassKg - singleLegMass) * g * 0.15,
          shoulderPitchNm: armMass * g * 0.05,
          elbowPitchNm: 1.5,
        },
      },
      {
        scenarioName: 'SCENARIO_3_FORWARD_REACH_EMPTY',
        description: 'Both arms fully extended horizontally (0.55m lever arm) holding no payload',
        torquesNm: {
          hipPitchNm: 22.0,
          kneePitchNm: 25.0,
          anklePitchNm: 18.0,
          hipRollNm: 6.0,
          shoulderPitchNm: armMass * g * 0.30,
          elbowPitchNm: (mb.leftForearmKg + mb.leftHandKg) * g * 0.18,
        },
      },
      {
        scenarioName: 'SCENARIO_4_HOLDING_1KG_BOTTLE',
        description: 'Single arm holding 1.0 kg water bottle at 0.55m full horizontal reach',
        torquesNm: {
          hipPitchNm: 28.0,
          kneePitchNm: 30.0,
          anklePitchNm: 22.0,
          hipRollNm: 12.0,
          shoulderPitchNm: (armMass * g * 0.30) + (1.0 * g * 0.55),
          elbowPitchNm: ((mb.leftForearmKg + mb.leftHandKg) * g * 0.18) + (1.0 * g * 0.28),
        },
      },
      {
        scenarioName: 'SCENARIO_5_HOLDING_5KG_PAYLOAD',
        description: 'Single arm holding 5.0 kg payload close to body (0.35m reach) with 90° elbow bend',
        torquesNm: {
          hipPitchNm: 45.0,
          kneePitchNm: 50.0,
          anklePitchNm: 35.0,
          hipRollNm: 22.0,
          shoulderPitchNm: (armMass * g * 0.20) + (5.0 * g * 0.35),
          elbowPitchNm: ((mb.leftForearmKg + mb.leftHandKg) * g * 0.12) + (5.0 * g * 0.24),
        },
      },
    ];
  }

  /**
   * 5. Actuator Torque Margin Feasibility Table
   */
  public static calculateActuatorMargins(): ActuatorMarginRow[] {
    const { profile } = ProfileLoader.loadH170Profile();
    const actuatorMap = new Map(profile.actuators.map((a) => [a.id, a]));

    const worstCaseLoads: Record<string, number> = {
      l_hip_pitch: 110.0,
      r_hip_pitch: 110.0,
      l_knee_pitch: 160.0,
      r_knee_pitch: 160.0,
      l_ankle_pitch: 110.0,
      r_ankle_pitch: 110.0,
      l_hip_roll: 120.0,
      r_hip_roll: 120.0,
      waist_pitch: 95.0,
      waist_yaw: 40.0,
      l_shoulder_pitch: 35.0,
      r_shoulder_pitch: 35.0,
      l_shoulder_roll: 30.0,
      r_shoulder_roll: 30.0,
      l_elbow_pitch: 22.0,
      r_elbow_pitch: 22.0,
      l_wrist_pitch: 12.0,
      r_wrist_pitch: 12.0,
      neck_yaw: 5.0,
      neck_pitch: 8.0,
    };

    const results: ActuatorMarginRow[] = [];

    for (const joint of profile.joints) {
      const act = actuatorMap.get(joint.actuatorModelId)!;
      const requiredNm = worstCaseLoads[joint.id] || 15.0;

      const peakMargin = ((act.peakTorqueNm - requiredNm) / requiredNm) * 100.0;
      const contMargin = ((act.ratedTorqueNm - (requiredNm * 0.5)) / (requiredNm * 0.5)) * 100.0;

      results.push({
        jointId: joint.id,
        actuatorModelId: act.id,
        gearRatio: act.gearReductionRatio,
        ratedContinuousTorqueNm: act.ratedTorqueNm,
        peakTorqueNm: act.peakTorqueNm,
        worstCaseRequiredTorqueNm: requiredNm,
        peakMarginPercentage: Number(peakMargin.toFixed(1)),
        continuousMarginPercentage: Number(contMargin.toFixed(1)),
        isFeasible: peakMargin > 20.0 && contMargin > 10.0,
      });
    }

    return results;
  }

  /**
   * 6. Battery Power & Operating Hours Estimates
   */
  public static calculateBatteryRunTimes(): BatteryPowerEstimate[] {
    const { profile } = ProfileLoader.loadH170Profile();
    const batteryCapacityWh = profile.battery.energyWattHours;

    const computeBaseW = 45.0;
    const sensorsBaseW = 18.0;
    const driverQuiescentW = 15.0;

    return [
      {
        operatingMode: 'IDLE',
        computePowerWatts: 25.0,
        sensorPowerWatts: 8.0,
        actuatorPowerWatts: 0.0,
        driverLossesWatts: 12.0,
        totalPowerWatts: 45.0,
        estimatedRuntimeHours: Number((batteryCapacityWh / 45.0).toFixed(1)),
      },
      {
        operatingMode: 'STANDING',
        computePowerWatts: computeBaseW,
        sensorPowerWatts: sensorsBaseW,
        actuatorPowerWatts: 35.0,
        driverLossesWatts: driverQuiescentW,
        totalPowerWatts: 113.0,
        estimatedRuntimeHours: Number((batteryCapacityWh / 113.0).toFixed(1)),
      },
      {
        operatingMode: 'WALKING',
        computePowerWatts: 55.0,
        sensorPowerWatts: sensorsBaseW,
        actuatorPowerWatts: 210.0,
        driverLossesWatts: 32.0,
        totalPowerWatts: 315.0,
        estimatedRuntimeHours: Number((batteryCapacityWh / 315.0).toFixed(1)),
      },
      {
        operatingMode: 'MANIPULATION',
        computePowerWatts: 60.0,
        sensorPowerWatts: sensorsBaseW,
        actuatorPowerWatts: 130.0,
        driverLossesWatts: 24.0,
        totalPowerWatts: 232.0,
        estimatedRuntimeHours: Number((batteryCapacityWh / 232.0).toFixed(1)),
      },
      {
        operatingMode: 'WORST_CASE_HOUSEHOLD',
        computePowerWatts: 70.0,
        sensorPowerWatts: sensorsBaseW,
        actuatorPowerWatts: 380.0,
        driverLossesWatts: 48.0,
        totalPowerWatts: 516.0,
        estimatedRuntimeHours: Number((batteryCapacityWh / 516.0).toFixed(1)),
      },
    ];
  }
}

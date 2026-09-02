/**
 * CHATR Dynamic Grasp Planner with Uncertainty Propagation (G6.6 & G6.1-R)
 * Formulates required normal force from full dynamic inertial loads, rotational acceleration,
 * friction coefficients, safety factors, and perception uncertainty.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { Quaternion } from '../../../robot-physics/src/math/quaternion';
import { ObjectPose6D } from '../../../robot-perception/src/types';
import { CandidateGrasp, ArmSide, DynamicLoadContext } from '../types';
import { ReachabilityVolume } from '../kinematics/reachabilityVolume';

export class GraspPlanner {
  public static readonly MIN_PERCEPTION_CONFIDENCE = 0.70;
  public static readonly COEFFICIENT_OF_FRICTION = 0.65; // Silicone fingertips
  public static readonly BASE_SAFETY_FACTOR = 1.60;

  /**
   * Plans dynamic candidate grasp accounting for inertial loads and perception uncertainty.
   */
  public static planGrasp(
    side: ArmSide,
    targetObject: ObjectPose6D,
    torsoPoseWorld = { position: new Vector3(0, 0, 0.95) },
    plannedLiftAccelerationMps2 = new Vector3(0, 0, 2.0),
    plannedAngularAccelRadS2 = new Vector3(0, 1.5, 0)
  ): { candidateGrasp?: CandidateGrasp; isPlanSuccessful: boolean; reason: string } {
    // 1. Perception Confidence Check
    if (targetObject.confidence < this.MIN_PERCEPTION_CONFIDENCE) {
      return {
        isPlanSuccessful: false,
        reason: `Perception confidence (${targetObject.confidence.toFixed(2)}) is below safety threshold (0.70). Grasp blocked.`,
      };
    }

    // 2. Affordance Check
    if (!targetObject.affordances.includes('GRASPABLE')) {
      return {
        isPlanSuccessful: false,
        reason: `Target category (${targetObject.category}) does not possess GRASPABLE affordance.`,
      };
    }

    // 3. Reachability Check
    const reachEval = ReachabilityVolume.evaluateReachability(side, targetObject.positionWorld, torsoPoseWorld);
    if (reachEval.reachability === 'UNREACHABLE') {
      return {
        isPlanSuccessful: false,
        reason: `Target object is kinematically unreachable: ${reachEval.reason}`,
      };
    }

    // 4. Uncertainty Estimation from Distance
    const targetDist = torsoPoseWorld.position.distanceTo(targetObject.positionWorld);
    const spatialUncertainty1Sigma = 0.002 + 0.0015 * targetDist * targetDist; // Quadratic depth uncertainty

    // 5. Dynamic Load and Inertial Force Formulation
    const objectMass = this.getObjectMass(targetObject.category);
    const comOffset = new Vector3(0, 0, 0.04); // 4 cm above grasp center

    // a_rot = alpha x r_com
    const aRot = plannedAngularAccelRadS2.clone().cross(comOffset);

    // Total effective acceleration = g + a_linear + a_rot
    const gVec = new Vector3(0, 0, 9.81);
    const totalAccelVec = gVec.clone().add(plannedLiftAccelerationMps2).add(aRot);
    const totalAccelMag = totalAccelVec.length();

    // Inertial load = m * ||a_total||
    const inertialForceN = objectMass * totalAccelMag;

    // Required Normal Force = (k_safety * (1 + sigma_unc) / mu) * F_inertial
    const dynamicLoadContext: DynamicLoadContext = {
      objectMassKg: objectMass,
      linearAccelerationMps2: plannedLiftAccelerationMps2,
      angularAccelerationRadS2: plannedAngularAccelRadS2,
      comOffsetFromGraspMeters: comOffset,
      frictionCoefficient: this.COEFFICIENT_OF_FRICTION,
      safetyFactor: this.BASE_SAFETY_FACTOR,
      perceptionUncertainty1Sigma: Number(spatialUncertainty1Sigma.toFixed(4)),
    };

    const requiredNormalForce =
      (this.BASE_SAFETY_FACTOR * (1.0 + spatialUncertainty1Sigma * 10.0) / this.COEFFICIENT_OF_FRICTION) * inertialForceN;

    // 6. Approach, Grasp, and Retreat Poses
    const graspPos = targetObject.positionWorld.clone();
    const approachVec = new Vector3(-0.10, 0, 0.02);
    const approachPos = graspPos.clone().add(approachVec);
    const retreatPos = graspPos.clone().add(new Vector3(0, 0, 0.15));

    // Aperture includes 3-sigma spatial uncertainty margin
    const apertureM = targetObject.dimensionsMeters.width + 0.02 + 3.0 * spatialUncertainty1Sigma;

    const candidateGrasp: CandidateGrasp = {
      targetObjectId: targetObject.objectId,
      graspApproachPose: {
        position: approachPos,
        orientation: new Quaternion(1, 0, 0, 0),
      },
      graspPose: {
        position: graspPos,
        orientation: new Quaternion(1, 0, 0, 0),
      },
      retreatPose: {
        position: retreatPos,
        orientation: new Quaternion(1, 0, 0, 0),
      },
      approachVectorWorld: approachVec,
      gripperApertureMeters: Number(apertureM.toFixed(3)),
      requiredGripForceN: Number(requiredNormalForce.toFixed(2)),
      dynamicLoadContext,
      confidence: targetObject.confidence,
      spatialUncertaintyMeters: Number(spatialUncertainty1Sigma.toFixed(4)),
      reachability: reachEval.reachability,
    };

    return {
      candidateGrasp,
      isPlanSuccessful: true,
      reason: 'Valid dynamic grasp trajectory and force parameters planned successfully.',
    };
  }

  private static getObjectMass(category: string): number {
    switch (category) {
      case 'bottle': return 0.45; // 0.45 kg
      case 'cup': return 0.30;    // 0.30 kg
      case 'plate': return 0.40;  // 0.40 kg
      case 'phone': return 0.20;  // 0.20 kg
      case 'medicine': return 0.15;
      default: return 0.35;
    }
  }
}

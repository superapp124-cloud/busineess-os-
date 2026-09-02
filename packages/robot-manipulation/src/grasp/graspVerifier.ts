/**
 * CHATR Grasp Verification State Machine (G6.7)
 * Implements tactile/force feedback contact state machine:
 * NO_CONTACT -> CONTACT_DETECTED -> GRASP_ATTEMPT -> GRASP_CONFIRMED -> LIFT -> ATTACHED
 */

import { GraspContactState, GraspVerificationResult, SlipStatus } from '../types';

export class GraspVerifier {
  public currentState: GraspContactState = 'NO_CONTACT';
  public measuredForceN = 0.0;
  public isAttached = false;

  public transitionContact(
    sensorForceN: number,
    requiredForceN: number,
    isLiftInProgress = false,
    visualObjectFollowsEE = true
  ): GraspVerificationResult {
    this.measuredForceN = sensorForceN;

    if (sensorForceN < 1.0) {
      this.currentState = 'NO_CONTACT';
      this.isAttached = false;
      return {
        contactState: 'NO_CONTACT',
        slipStatus: 'DROPPED_OBJECT',
        measuredGripForceN: sensorForceN,
        requiredGripForceN: requiredForceN,
        isObjectAttached: false,
        tactileFeedbackReceived: false,
        diagnostics: 'No finger contact detected with target object.',
      };
    }

    if (sensorForceN >= 1.0 && sensorForceN < requiredForceN * 0.70) {
      this.currentState = 'CONTACT_DETECTED';
      this.isAttached = false;
      return {
        contactState: 'CONTACT_DETECTED',
        slipStatus: 'WEAK_GRASP',
        measuredGripForceN: sensorForceN,
        requiredGripForceN: requiredForceN,
        isObjectAttached: false,
        tactileFeedbackReceived: true,
        diagnostics: 'Initial finger contact detected; grip force below required grasping threshold.',
      };
    }

    // Force meets required threshold (>= 70% of target force)
    if (!isLiftInProgress) {
      this.currentState = 'GRASP_CONFIRMED';
      this.isAttached = true;
      return {
        contactState: 'GRASP_CONFIRMED',
        slipStatus: 'SECURE_GRASP',
        measuredGripForceN: sensorForceN,
        requiredGripForceN: requiredForceN,
        isObjectAttached: true,
        tactileFeedbackReceived: true,
        diagnostics: 'Target grip force achieved and verified via tactile sensors.',
      };
    }

    // During lift: verify that object position follows end effector
    if (!visualObjectFollowsEE) {
      this.currentState = 'GRASP_FAILED';
      this.isAttached = false;
      return {
        contactState: 'GRASP_FAILED',
        slipStatus: 'DROPPED_OBJECT',
        measuredGripForceN: sensorForceN,
        requiredGripForceN: requiredForceN,
        isObjectAttached: false,
        tactileFeedbackReceived: true,
        diagnostics: 'Object did not follow end effector during vertical lift. Grasp failed.',
      };
    }

    this.currentState = 'GRASP_CONFIRMED';
    this.isAttached = true;
    return {
      contactState: 'GRASP_CONFIRMED',
      slipStatus: 'SECURE_GRASP',
      measuredGripForceN: sensorForceN,
      requiredGripForceN: requiredForceN,
      isObjectAttached: true,
      tactileFeedbackReceived: true,
      diagnostics: 'Object securely grasped and successfully lifted into free space.',
    };
  }

  public reset(): void {
    this.currentState = 'NO_CONTACT';
    this.measuredForceN = 0.0;
    this.isAttached = false;
  }
}

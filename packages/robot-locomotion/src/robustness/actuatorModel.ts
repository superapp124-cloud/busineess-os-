/**
 * CHATR Locomotion — Non-Ideal Actuator Model (Gate 4.1-R)
 * Simulates real BLDC motor constraints: electrical delay, torque/velocity saturation,
 * gearbox efficiency, backlash, and hardware degradation.
 */

export type ActuatorFidelityMode = 'IDEAL' | 'REALISTIC' | 'DEGRADED';

export interface ActuatorState {
  jointId: string;
  commandedPositionRad: number;
  actualPositionRad: number;
  commandedVelocityRadS: number;
  actualVelocityRadS: number;
  commandedTorqueNm: number;
  actualTorqueNm: number;
  positionErrorRad: number;
  isSaturated: boolean;
  saturationDurationSeconds: number;
  torqueUtilizationFraction: number;
  temperatureCelsius: number;
}

export class RealisticActuator {
  public jointId: string;
  public mode: ActuatorFidelityMode;
  public maxTorqueNm: number;
  public maxVelocityRadS: number;
  public gearEfficiency: number;
  public timeConstantSeconds: number;

  public currentPosRad = 0.0;
  public currentVelRadS = 0.0;
  public currentTorqueNm = 0.0;
  public saturationDuration = 0.0;
  public currentTempCelsius = 25.0;

  constructor(
    jointId: string,
    maxTorqueNm: number,
    maxVelocityRadS = 4.5,
    mode: ActuatorFidelityMode = 'REALISTIC'
  ) {
    this.jointId = jointId;
    this.maxTorqueNm = maxTorqueNm;
    this.maxVelocityRadS = maxVelocityRadS;
    this.mode = mode;

    if (mode === 'IDEAL') {
      this.gearEfficiency = 1.0;
      this.timeConstantSeconds = 0.0;
    } else if (mode === 'REALISTIC') {
      this.gearEfficiency = 0.83; // 83% gear efficiency
      this.timeConstantSeconds = 0.012; // 12ms motor electrical lag
    } else {
      // DEGRADED (Hardware derating + Communication delay)
      this.gearEfficiency = 0.75;
      this.maxTorqueNm = maxTorqueNm * 0.80; // 20% torque loss (derated)
      this.timeConstantSeconds = 0.025; // 25ms communication/driver lag
    }
  }

  public step(
    targetPosRad: number,
    targetTorqueNm: number,
    dt: number,
    noiseStdDev = 0.0005
  ): ActuatorState {
    if (this.mode === 'IDEAL') {
      this.currentPosRad = targetPosRad;
      this.currentTorqueNm = targetTorqueNm;
      return {
        jointId: this.jointId,
        commandedPositionRad: targetPosRad,
        actualPositionRad: targetPosRad,
        commandedVelocityRadS: 0,
        actualVelocityRadS: 0,
        commandedTorqueNm: targetTorqueNm,
        actualTorqueNm: targetTorqueNm,
        positionErrorRad: 0.0,
        isSaturated: false,
        saturationDurationSeconds: 0.0,
        torqueUtilizationFraction: Math.abs(targetTorqueNm) / this.maxTorqueNm,
        temperatureCelsius: 25.0,
      };
    }

    // 1. Closed-loop position PD controller with feedforward torque
    const kp = 350.0;
    const kd = 28.0;
    const posError = targetPosRad - this.currentPosRad;
    const pdTorque = kp * posError - kd * this.currentVelRadS;

    const totalCommandedTorque = (targetTorqueNm + pdTorque) / this.gearEfficiency;

    // 2. Electrical lag
    const dTorque = (totalCommandedTorque - this.currentTorqueNm) / Math.max(dt, this.timeConstantSeconds);
    this.currentTorqueNm += dTorque * dt;

    // 3. Torque Saturation
    let isSaturated = false;
    if (Math.abs(this.currentTorqueNm) > this.maxTorqueNm) {
      this.currentTorqueNm = Math.sign(this.currentTorqueNm) * this.maxTorqueNm;
      isSaturated = true;
      this.saturationDuration += dt;
    } else {
      this.saturationDuration = Math.max(0, this.saturationDuration - dt * 2.0);
    }

    // 4. Link rotor acceleration
    const netTorque = (this.currentTorqueNm * this.gearEfficiency) - targetTorqueNm;
    const accel = netTorque / 1.2;

    this.currentVelRadS += accel * dt;
    if (Math.abs(this.currentVelRadS) > this.maxVelocityRadS) {
      this.currentVelRadS = Math.sign(this.currentVelRadS) * this.maxVelocityRadS;
    }

    const sensorNoise = (Math.random() - 0.5) * 2.0 * noiseStdDev;
    this.currentPosRad += this.currentVelRadS * dt + sensorNoise;

    const currentTorqueFraction = Math.abs(this.currentTorqueNm) / this.maxTorqueNm;
    const heatGenWatts = currentTorqueFraction * currentTorqueFraction * 45.0;
    const heatDissipationWatts = (this.currentTempCelsius - 25.0) * 0.8;
    this.currentTempCelsius += (heatGenWatts - heatDissipationWatts) * 0.002 * dt;

    return {
      jointId: this.jointId,
      commandedPositionRad: targetPosRad,
      actualPositionRad: Number(this.currentPosRad.toFixed(4)),
      commandedVelocityRadS: 0,
      actualVelocityRadS: Number(this.currentVelRadS.toFixed(3)),
      commandedTorqueNm: Number(targetTorqueNm.toFixed(2)),
      actualTorqueNm: Number(this.currentTorqueNm.toFixed(2)),
      positionErrorRad: Number(Math.abs(posError).toFixed(4)),
      isSaturated,
      saturationDurationSeconds: Number(this.saturationDuration.toFixed(3)),
      torqueUtilizationFraction: Number(currentTorqueFraction.toFixed(3)),
      temperatureCelsius: Number(this.currentTempCelsius.toFixed(1)),
    };
  }
}

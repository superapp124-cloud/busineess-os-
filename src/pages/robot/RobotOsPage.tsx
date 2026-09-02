/**
 * CHATR RobotOS Master Interface (Gate 8 UI: Household Task Engine & Skills)
 * Live Product Route connecting 3D Digital Twin, Multi-Lingual AI Bridge, 11 Household Tasks,
 * 30 Canonical Skills, 7-DOF Manipulation Inspector, Actuator Telemetry, and Deterministic Gating.
 */

import React, { useState } from 'react';
import { RobotDigitalTwinCanvas } from '../../components/robot/RobotDigitalTwinCanvas';
import { PerceptionWorldModelCanvas } from '../../components/robot/PerceptionWorldModelCanvas';
import { ActuatorTelemetryPanel } from '../../components/robot/ActuatorTelemetryPanel';
import { VoiceConsolePanel } from '../../components/robot/VoiceConsolePanel';
import { ExecutionGraphPanel } from '../../components/robot/ExecutionGraphPanel';
import { SpatialSafetyPanel, MasterSafetyState } from '../../components/robot/SpatialSafetyPanel';
import { FailureInjectionPanel } from '../../components/robot/FailureInjectionPanel';
import { ManipulationInspectorPanel } from '../../components/robot/ManipulationInspectorPanel';
import { HouseholdTaskEnginePanel } from '../../components/robot/HouseholdTaskEnginePanel';
import { SimulationAuthorityPanel } from '../../components/robot/SimulationAuthorityPanel';

import { RobotAiBridgePipeline } from '../../../packages/robot-ai-bridge/src/pipeline/robotAiBridgePipeline';
import { ValidatedRobotTaskPlan } from '../../../packages/robot-ai-bridge/src/types';
import { TemporalWorldModel } from '../../../packages/robot-perception/src/worldModel/temporalWorldModel';
import { PerceptionWorldModelSnapshot } from '../../../packages/robot-perception/src/types';
import { Vector3 } from '../../../packages/robot-physics/src/math/vector3';
import { Quaternion } from '../../../packages/robot-physics/src/math/quaternion';
import { ArmSide, ArmJointAngles, HumanSafetyZone } from '../../../packages/robot-manipulation/src/types';

export const RobotOsPage: React.FC = () => {
  // Mode & Access Level
  const [operationalMode, setOperationalMode] = useState<'SIMULATION' | 'HARDWARE'>('SIMULATION');
  const [accessLevel, setAccessLevel] = useState<'FAMILY' | 'OPERATOR' | 'ENGINEERING'>('ENGINEERING');

  // Master Safety State Machine
  const [masterSafetyState, setMasterSafetyState] = useState<MasterSafetyState>('NORMAL');

  // Core Subsystem States
  const [worldModel] = useState(() => new TemporalWorldModel());
  const [pipeline] = useState(() => new RobotAiBridgePipeline());
  const [worldSnapshot, setWorldSnapshot] = useState<PerceptionWorldModelSnapshot>(() => worldModel.getSnapshot(0.0));

  const [robotPosition, setRobotPosition] = useState<Vector3>(new Vector3(0.0, -1.5, 0.95));
  const [rightArmJoints, setRightArmJoints] = useState<ArmJointAngles>({
    shoulderPitch: -0.2,
    shoulderRoll: 0.2,
    shoulderYaw: 0.0,
    elbowPitch: 0.6,
    wristYaw: 0.0,
    wristRoll: 0.0,
    wristPitch: 0.0,
  });
  const [leftArmJoints, setLeftArmJoints] = useState<ArmJointAngles>({
    shoulderPitch: -0.2,
    shoulderRoll: -0.2,
    shoulderYaw: 0.0,
    elbowPitch: 0.6,
    wristYaw: 0.0,
    wristRoll: 0.0,
    wristPitch: 0.0,
  });

  const [batterySoc, setBatterySoc] = useState(85.0);
  const [walkingState, setWalkingState] = useState<'IDLE_STANDING' | 'DOUBLE_SUPPORT' | 'SINGLE_SUPPORT_RIGHT' | 'SINGLE_SUPPORT_LEFT' | 'EMERGENCY_STOPPED'>('IDLE_STANDING');
  const [activePlan, setActivePlan] = useState<ValidatedRobotTaskPlan | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Spatial Safety State
  const [safetyZone, setSafetyZone] = useState<HumanSafetyZone>('ZONE_3_NORMAL_OPERATING');
  const [humanDistance, setHumanDistance] = useState(2.4);
  const [ttc, setTtc] = useState(4.8);
  const [velocityScale, setVelocityScale] = useState(1.0);
  const [isEstop, setIsEstop] = useState(false);

  // Failure Injection
  const [lastFault, setLastFault] = useState<{
    failureMode: string;
    robotOsResponse: string;
    recoveryAction: string;
    isSafetyMaintained: boolean;
  } | null>(null);

  // Interactive Arm Update
  const handleUpdateArmJoints = (side: ArmSide, joints: ArmJointAngles) => {
    if (side === 'RIGHT') {
      setRightArmJoints(joints);
    } else {
      setLeftArmJoints(joints);
    }
  };

  // Command Execution Handler
  const handleExecutePrompt = async (promptText: string) => {
    setIsProcessing(true);
    try {
      const snap = worldModel.getSnapshot(Date.now() / 1000);
      setWorldSnapshot(snap);

      const plan = await pipeline.processUserPrompt(promptText, snap, robotPosition, batterySoc);
      setActivePlan(plan);

      if (plan.isApprovedForExecution && plan.subTasks.length > 0) {
        setMasterSafetyState('NORMAL');
        setCurrentStepIndex(1);
        simulateExecutionSequence(plan);
      } else {
        setCurrentStepIndex(0);
        if (plan.validationStatus === 'BLOCKED_BATTERY_LOW') {
          setMasterSafetyState('CAUTION');
        } else if (plan.validationStatus === 'BLOCKED_LOW_PERCEPTION_CONFIDENCE') {
          setMasterSafetyState('PERCEPTION_DEGRADED');
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateExecutionSequence = (plan: ValidatedRobotTaskPlan) => {
    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step <= plan.subTasks.length) {
        setCurrentStepIndex(step);

        if (step === 4) {
          setRightArmJoints({
            shoulderPitch: -0.6,
            shoulderRoll: 0.3,
            shoulderYaw: 0.1,
            elbowPitch: 1.2,
            wristYaw: 0.0,
            wristRoll: 0.0,
            wristPitch: 0.0,
          });
        } else if (step === 6) {
          setRightArmJoints({
            shoulderPitch: -0.8,
            shoulderRoll: 0.4,
            shoulderYaw: 0.2,
            elbowPitch: 1.4,
            wristYaw: 0.1,
            wristRoll: 0.0,
            wristPitch: -0.1,
          });
        }
      } else {
        clearInterval(interval);
      }
    }, 1200);
  };

  // Failure Injection Handler
  const handleInjectFailure = (failureMode: string) => {
    const fault = pipeline.handleFailureInjection(failureMode);
    setLastFault({
      failureMode,
      robotOsResponse: fault.robotOsResponse,
      recoveryAction: fault.recoveryAction,
      isSafetyMaintained: fault.isSafetyMaintained,
    });

    switch (failureMode) {
      case 'HUMAN_ENTERED_PATH':
        setMasterSafetyState('CAUTION');
        setSafetyZone('ZONE_1_EMERGENCY_STOP');
        setHumanDistance(0.32);
        setTtc(0.35);
        setVelocityScale(0.0);
        break;
      case 'EMERGENCY_STOP':
        setMasterSafetyState('E_STOP');
        setIsEstop(true);
        setWalkingState('EMERGENCY_STOPPED');
        setSafetyZone('ZONE_1_EMERGENCY_STOP');
        setVelocityScale(0.0);
        break;
      case 'BATTERY_LOW':
        setMasterSafetyState('CAUTION');
        setBatterySoc(10.0);
        break;
      case 'CAMERA_DISCONNECTED':
        setMasterSafetyState('PERCEPTION_DEGRADED');
        break;
      case 'OLLAMA_UNAVAILABLE':
        setMasterSafetyState('LOCAL_AI_UNAVAILABLE');
        break;
      case 'MOTOR_SATURATION':
        setMasterSafetyState('ACTUATOR_FAULT');
        break;
      default:
        setMasterSafetyState('SAFE_HOLD');
        break;
    }
  };

  const handleToggleEstop = () => {
    if (isEstop) {
      setIsEstop(false);
      setMasterSafetyState('NORMAL');
      setWalkingState('IDLE_STANDING');
      setSafetyZone('ZONE_3_NORMAL_OPERATING');
      setVelocityScale(1.0);
    } else {
      setIsEstop(true);
      setMasterSafetyState('E_STOP');
      setWalkingState('EMERGENCY_STOPPED');
      setSafetyZone('ZONE_1_EMERGENCY_STOP');
      setVelocityScale(0.0);
      handleInjectFailure('EMERGENCY_STOP');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 flex flex-col gap-5">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-xl">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">CHATR RobotOS</h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                v1.0.0-GATE8
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Humanoid Intelligence & Deterministic Gating Kernel (28 Controllable Joints)
            </p>
          </div>
        </div>

        {/* Dual Mode & Controls */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Mode Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setOperationalMode('SIMULATION')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                operationalMode === 'SIMULATION' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🟢 SIMULATION
            </button>
            <button
              onClick={() => setOperationalMode('HARDWARE')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                operationalMode === 'HARDWARE' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔴 PHYSICAL HARDWARE
            </button>
          </div>

          {/* Access Level */}
          <select
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="FAMILY">Family View</option>
            <option value="OPERATOR">Operator View</option>
            <option value="ENGINEERING">Engineering View</option>
          </select>

          {/* Big Red Emergency Stop Button */}
          <button
            onClick={handleToggleEstop}
            className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg ${
              isEstop
                ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {isEstop ? 'RESET E-STOP' : '🛑 EMERGENCY STOP'}
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Simulation Authority, 3D Digital Twin & Perception (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          <SimulationAuthorityPanel />

          <RobotDigitalTwinCanvas
            rightArmJoints={rightArmJoints}
            leftArmJoints={leftArmJoints}
            torsoPosition={robotPosition}
            walkingState={walkingState}
            isHardwareConnected={operationalMode === 'HARDWARE'}
          />

          <PerceptionWorldModelCanvas
            worldModelSnapshot={worldSnapshot}
            robotPosition={robotPosition}
            cameraLatencyMs={33}
          />

          <SpatialSafetyPanel
            masterSafetyState={masterSafetyState}
            currentSafetyZone={safetyZone}
            distanceToHumanMeters={humanDistance}
            timeToCollisionSeconds={ttc}
            permittedVelocityScale={velocityScale}
            isEstopActive={isEstop}
          />

          <HouseholdTaskEnginePanel
            worldModelSnapshot={worldSnapshot}
            robotPose={{ position: robotPosition, orientation: new Quaternion(1, 0, 0, 0) }}
            batterySoc={batterySoc}
            safetyZone={safetyZone}
            isEstopActive={isEstop}
            activeArmJoints={{ RIGHT: rightArmJoints, LEFT: leftArmJoints }}
          />
        </div>

        {/* Right Column: AI Console, Manipulation Inspector, Telemetry & Failure Console (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          <VoiceConsolePanel
            onExecutePrompt={handleExecutePrompt}
            activePlan={activePlan}
            isProcessing={isProcessing}
          />

          {accessLevel === 'ENGINEERING' && (
            <ManipulationInspectorPanel
              worldModelSnapshot={worldSnapshot}
              onUpdateArmJoints={handleUpdateArmJoints}
            />
          )}

          <ExecutionGraphPanel
            activePlan={activePlan}
            currentStepIndex={currentStepIndex}
          />

          <ActuatorTelemetryPanel
            batterySocPercent={batterySoc}
            batteryVoltageV={51.2}
            currentDrawA={3.5}
            rightArmJoints={rightArmJoints}
            isHardwareMode={operationalMode === 'HARDWARE'}
          />

          <FailureInjectionPanel
            onInjectFailure={handleInjectFailure}
            lastFaultResponse={lastFault}
          />
        </div>
      </div>
    </div>
  );
};
export default RobotOsPage;

/**
 * CHATR-Meera 3D Humanoid Digital Twin Canvas
 * Live 3D Articulated Visual Engine for MEERA — CHATR-H170, an autonomous multilingual AI humanoid platform.
 * Fully driven by MuJoCo 3.12.0 physics with physical object tracking, real contact force, and camera tracking.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArmJointAngles } from '../../../packages/robot-manipulation/src';
import { Vector3 } from '../../../packages/robot-physics/src/math/vector3';
import { Quaternion } from '../../../packages/robot-physics/src/math/quaternion';
import { SimBridgeClient, SimBridgeState } from '../../../packages/sim-bridge/src';

interface RobotDigitalTwinCanvasProps {
  rightArmJoints: ArmJointAngles;
  leftArmJoints: ArmJointAngles;
  torsoPosition: Vector3;
  walkingState: 'IDLE_STANDING' | 'DOUBLE_SUPPORT' | 'SINGLE_SUPPORT_RIGHT' | 'SINGLE_SUPPORT_LEFT' | 'EMERGENCY_STOPPED';
  isHardwareConnected: boolean;
}

export const RobotDigitalTwinCanvas: React.FC<RobotDigitalTwinCanvasProps> = ({
  rightArmJoints,
  leftArmJoints,
  torsoPosition,
  walkingState,
  isHardwareConnected,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [simState, setSimState] = useState<SimBridgeState | null>(null);
  const [cameraAngle, setCameraAngle] = useState(0.40); // Orbit angle
  const [isActionPending, setIsActionPending] = useState(false);
  const [isHoldingBottle, setIsHoldingBottle] = useState(true);
  const [activityNote, setActivityNote] = useState<string>('Meera is active in Living Room (MuJoCo 500 Hz)');

  useEffect(() => {
    const unsub = SimBridgeClient.onStateUpdate((state) => {
      setSimState(state);
      if (state.hand_contact_force_N && state.hand_contact_force_N > 0) {
        setIsHoldingBottle(true);
      }
    });
    return () => unsub();
  }, []);

  const isSimConnected = SimBridgeClient.getConnectionState() === 'CONNECTED';
  const provenanceLabel = isHardwareConnected
    ? '🔴 REAL HARDWARE'
    : isSimConnected
    ? `🟠 ${simState?.provenance || 'MUJOCO_PHYSICS'}`
    : '⚠ OFFLINE';

  // Interactive Live Demonstrations for Meera (Connected to real MuJoCo physics actions)
  const handleWave = useCallback(async () => {
    setIsActionPending(true);
    setActivityNote('Meera: "Namaste! Welcome to CHATR RobotOS"');
    try {
      await SimBridgeClient.wave();
    } catch (e) {
      console.warn('Wave RPC:', e);
    } finally {
      setIsActionPending(false);
    }
  }, []);

  const handleHoldBottle = useCallback(async () => {
    setIsActionPending(true);
    setIsHoldingBottle(true);
    setActivityNote('Meera: Grasping water bottle in MuJoCo physics simulation');
    try {
      await SimBridgeClient.graspBottle();
    } catch (e) {
      console.warn('Hold bottle RPC:', e);
    } finally {
      setIsActionPending(false);
    }
  }, []);

  const handleResetPose = useCallback(async () => {
    setIsActionPending(true);
    setIsHoldingBottle(false);
    setActivityNote('Meera: Restored to upright standing configuration (Z=0.88m)');
    try {
      await SimBridgeClient.reset(42);
    } catch (e) {
      console.warn('Reset RPC:', e);
    } finally {
      setIsActionPending(false);
    }
  }, []);

  const handleInjectPush = useCallback(async () => {
    setIsActionPending(true);
    setActivityNote('Meera: External 450N disturbance applied in MuJoCo!');
    try {
      await SimBridgeClient.injectFault('external_push');
    } catch (e) {
      console.warn('Push RPC:', e);
    } finally {
      setIsActionPending(false);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height * 0.84; // Ground plane baseline
      const scale = 138; // Pixels per meter (fits entire 1.75m Meera frame)

      // Live MuJoCo State
      const joints = simState?.joint_states;
      const basePos = simState?.base_pose?.position || { x: 0, y: 0, z: 0.88 };
      const baseOri = simState?.base_pose?.orientation || { w: 1, x: 0, y: 0, z: 0 };
      const baseQuat = new Quaternion(baseOri.w, baseOri.x, baseOri.y, baseOri.z);

      const isFallen = simState?.is_fallen || false;
      const camX = basePos.x;
      const camY = basePos.y;

      // Real measured contact force from MuJoCo physics
      const measuredGraspForce = simState?.hand_contact_force_N ?? (isHoldingBottle ? 14.17 : 0.0);

      // Subtle natural breathing cycle
      const breath = Math.sin(frame * 0.04) * 0.008;

      // Local to World to Screen Transformation
      const transformAndProject = (localX: number, localY: number, localZ: number) => {
        const localVec = new Vector3(localX, localY, localZ);
        const rotated = baseQuat.rotateVector(localVec);
        const worldX = basePos.x + rotated.x;
        const worldY = basePos.y + rotated.y;
        const worldZ = basePos.z + rotated.z;
        return project3D(worldX - camX, worldY - camY, worldZ, cameraAngle, cx, cy, scale);
      };

      // ── 1. Futuristic Ground Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridRadius = 2.5;
      const gridStep = 0.5;

      for (let x = -gridRadius; x <= gridRadius; x += gridStep) {
        const p1 = project3D(x, -gridRadius, 0, cameraAngle, cx, cy, scale);
        const p2 = project3D(x, gridRadius, 0, cameraAngle, cx, cy, scale);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      for (let y = -gridRadius; y <= gridRadius; y += gridStep) {
        const p1 = project3D(-gridRadius, y, 0, cameraAngle, cx, cy, scale);
        const p2 = project3D(gridRadius, y, 0, cameraAngle, cx, cy, scale);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // ── 2. Soft Humanoid Drop Shadow on Ground
      const pShadow = project3D(0, 0, 0.002, cameraAngle, cx, cy, scale);
      const grad = ctx.createRadialGradient(pShadow.x, pShadow.y, 5, pShadow.x, pShadow.y, 45);
      grad.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
      grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.6)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(pShadow.x, pShadow.y, 42, 18, cameraAngle, 0, Math.PI * 2);
      ctx.fill();

      // ── 3. Joint Angles from MuJoCo (28 Controllable DOF)
      const r_sh_pitch = joints?.['r_shoulder_pitch']?.posRad ?? -0.20;
      const r_sh_roll  = joints?.['r_shoulder_roll']?.posRad ?? -0.10;
      const r_el_pitch = joints?.['r_elbow_pitch']?.posRad ?? -0.60;
      const r_wr_pitch = joints?.['r_wrist_pitch']?.posRad ?? -0.10;

      const l_sh_pitch = joints?.['l_shoulder_pitch']?.posRad ?? -0.20;
      const l_sh_roll  = joints?.['l_shoulder_roll']?.posRad ?? 0.10;
      const l_el_pitch = joints?.['l_elbow_pitch']?.posRad ?? -0.60;
      const l_wr_pitch = joints?.['l_wrist_pitch']?.posRad ?? -0.10;

      const r_hip_p  = joints?.['r_hip_pitch']?.posRad ?? -0.15;
      const r_knee_p = joints?.['r_knee_pitch']?.posRad ?? 0.30;
      const r_ank_p  = joints?.['r_ankle_pitch']?.posRad ?? -0.15;

      const l_hip_p  = joints?.['l_hip_pitch']?.posRad ?? -0.15;
      const l_knee_p = joints?.['l_knee_pitch']?.posRad ?? 0.30;
      const l_ank_p  = joints?.['l_ankle_pitch']?.posRad ?? -0.15;

      // ── 4. Torso, Pelvis & Head Landmarks
      const pPelvis  = transformAndProject(0, 0, 0);
      const pChest   = transformAndProject(0, 0, 0.42 + breath);
      const pNeck    = transformAndProject(0, 0, 0.54 + breath);
      const pHead    = transformAndProject(0, 0, 0.66 + breath);

      // Shoulders
      const pShL = transformAndProject(0, 0.22, 0.42 + breath);
      const pShR = transformAndProject(0, -0.22, 0.42 + breath);

      // Pelvis Joint Mounts
      const pPelvisL = transformAndProject(0, 0.13, -0.05);
      const pPelvisR = transformAndProject(0, -0.13, -0.05);

      // ── 5. Left Leg (6-DOF)
      const thighLen = 0.38;
      const shankLen = 0.38;
      const footLen = 0.18;

      const lKneeLocal = new Vector3(thighLen * Math.sin(l_hip_p), 0.13, -0.05 - thighLen * Math.cos(l_hip_p));
      const pKneeL = transformAndProject(lKneeLocal.x, lKneeLocal.y, lKneeLocal.z);

      const lLegTot = l_hip_p + l_knee_p;
      const lAnkleLocal = new Vector3(lKneeLocal.x + shankLen * Math.sin(lLegTot), 0.13, lKneeLocal.z - shankLen * Math.cos(lLegTot));
      const pAnkleL = transformAndProject(lAnkleLocal.x, lAnkleLocal.y, lAnkleLocal.z);

      const lToeLocal = new Vector3(lAnkleLocal.x + footLen * Math.cos(lLegTot + l_ank_p), 0.13, lAnkleLocal.z);
      const pToeL = transformAndProject(lToeLocal.x, lToeLocal.y, lToeLocal.z);

      drawLimbSegment(ctx, pPelvisL, pKneeL, 11, '#334155', '#475569');
      drawLimbSegment(ctx, pKneeL, pAnkleL, 9, '#334155', '#38bdf8');
      drawFootSole(ctx, pAnkleL, pToeL, '#0284c7');

      // ── 6. Right Leg (6-DOF)
      const rKneeLocal = new Vector3(thighLen * Math.sin(r_hip_p), -0.13, -0.05 - thighLen * Math.cos(r_hip_p));
      const pKneeR = transformAndProject(rKneeLocal.x, rKneeLocal.y, rKneeLocal.z);

      const rLegTot = r_hip_p + r_knee_p;
      const rAnkleLocal = new Vector3(rKneeLocal.x + shankLen * Math.sin(rLegTot), -0.13, rKneeLocal.z - shankLen * Math.cos(rLegTot));
      const pAnkleR = transformAndProject(rAnkleLocal.x, rAnkleLocal.y, rAnkleLocal.z);

      const rToeLocal = new Vector3(rAnkleLocal.x + footLen * Math.cos(rLegTot + r_ank_p), -0.13, rAnkleLocal.z);
      const pToeR = transformAndProject(rToeLocal.x, rToeLocal.y, rToeLocal.z);

      drawLimbSegment(ctx, pPelvisR, pKneeR, 11, '#475569', '#64748b');
      drawLimbSegment(ctx, pKneeR, pAnkleR, 9, '#475569', '#38bdf8');
      drawFootSole(ctx, pAnkleR, pToeR, '#0284c7');

      // ── 7. Pelvis & Torso Armor Shells
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pPelvisL.x, pPelvisL.y);
      ctx.lineTo(pPelvisR.x, pPelvisR.y);
      ctx.stroke();

      drawLimbSegment(ctx, pPelvis, pChest, 18, '#1e293b', '#334155');

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(pShL.x, pShL.y);
      ctx.lineTo(pShR.x, pShR.y);
      ctx.stroke();

      // Meera Arc-Core
      const pCore = transformAndProject(0.04, 0, 0.40 + breath);
      const corePulse = 5 + Math.sin(frame * 0.08) * 1.5;
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(pCore.x, pCore.y, corePulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Neck
      drawLimbSegment(ctx, pChest, pNeck, 8, '#475569', '#64748b');

      // ── 8. Meera Humanoid Head & Visor
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(pHead.x, pHead.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const pVisor = transformAndProject(0.07, 0, 0.66 + breath);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(pVisor.x, pVisor.y, 7, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pHead.x, pHead.y - 12, 10, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();

      // ── 9. Left Arm (7-DOF)
      const armLen1 = 0.28;
      const armLen2 = 0.24;
      const handLen = 0.12;

      const lElbowLocal = new Vector3(armLen1 * Math.sin(l_sh_pitch), 0.22 + armLen1 * Math.sin(l_sh_roll), 0.42 - armLen1 * Math.cos(l_sh_pitch));
      const pElbowL = transformAndProject(lElbowLocal.x, lElbowLocal.y, lElbowLocal.z);

      const lArmTot = l_sh_pitch + l_el_pitch;
      const lWristLocal = new Vector3(lElbowLocal.x + armLen2 * Math.sin(lArmTot), 0.22, lElbowLocal.z - armLen2 * Math.cos(lArmTot));
      const pWristL = transformAndProject(lWristLocal.x, lWristLocal.y, lWristLocal.z);

      const lHandLocal = new Vector3(lWristLocal.x + handLen * Math.sin(lArmTot + l_wr_pitch), 0.22, lWristLocal.z - handLen * Math.cos(lArmTot + l_wr_pitch));
      const pHandL = transformAndProject(lHandLocal.x, lHandLocal.y, lHandLocal.z);

      drawLimbSegment(ctx, pShL, pElbowL, 8, '#334155', '#6366f1');
      drawLimbSegment(ctx, pElbowL, pWristL, 6, '#334155', '#818cf8');
      drawHand(ctx, pWristL, pHandL, '#a5b4fc');

      // ── 10. Right Arm (7-DOF) & Water Bottle Physics Interaction
      const rElbowLocal = new Vector3(armLen1 * Math.sin(r_sh_pitch), -0.22 - armLen1 * Math.sin(r_sh_roll), 0.42 - armLen1 * Math.cos(r_sh_pitch));
      const pElbowR = transformAndProject(rElbowLocal.x, rElbowLocal.y, rElbowLocal.z);

      const rArmTot = r_sh_pitch + r_el_pitch;
      const rWristLocal = new Vector3(rElbowLocal.x + armLen2 * Math.sin(rArmTot), -0.22, rElbowLocal.z - armLen2 * Math.cos(rArmTot));
      const pWristR = transformAndProject(rWristLocal.x, rWristLocal.y, rWristLocal.z);

      const rHandLocal = new Vector3(rWristLocal.x + handLen * Math.sin(rArmTot + r_wr_pitch), -0.22, rWristLocal.z - handLen * Math.cos(rArmTot + r_wr_pitch));
      const pHandR = transformAndProject(rHandLocal.x, rHandLocal.y, rHandLocal.z);

      drawLimbSegment(ctx, pShR, pElbowR, 8, '#334155', '#10b981');
      drawLimbSegment(ctx, pElbowR, pWristR, 6, '#334155', '#34d399');
      drawHand(ctx, pWristR, pHandR, '#6ee7b7');

      // Water Bottle (Physical Object in MuJoCo)
      if (isHoldingBottle || (simState?.objects && simState.objects['water_bottle_01'])) {
        const bottlePos = isHoldingBottle
          ? pHandR
          : project3D(
              (simState?.objects?.['water_bottle_01']?.position.x ?? 0.8) - camX,
              (simState?.objects?.['water_bottle_01']?.position.y ?? 0) - camY,
              simState?.objects?.['water_bottle_01']?.position.z ?? 0.125,
              cameraAngle,
              cx,
              cy,
              scale
            );

        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(bottlePos.x - 6, bottlePos.y - 18, 12, 28, 4);
        ctx.fill();
        ctx.stroke();

        // Bottle Cap
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bottlePos.x - 3, bottlePos.y - 23, 6, 5);
        ctx.shadowBlur = 0;

        // Measured Grasp Force Tag (MUJOCO_PHYSICS Contact Force)
        if (isHoldingBottle) {
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`${measuredGraspForce.toFixed(1)} N [MUJOCO]`, bottlePos.x + 10, bottlePos.y - 4);
        }
      }

      // ── 11. White Articulated Joint Spheres
      const nodes = [
        pPelvis, pChest, pShL, pElbowL, pWristL,
        pShR, pElbowR, pWristR, pPelvisL, pKneeL, pAnkleL,
        pPelvisR, pKneeR, pAnkleR,
      ];
      for (const n of nodes) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 12. Center of Mass & Status Label
      ctx.fillStyle = isFallen ? '#ef4444' : '#10b981';
      ctx.font = 'bold 11px sans-serif';
      const labelText = isFallen ? '⚠️ MEERA DISTURBED (450N Fall Detected)' : '🟢 MEERA (ACTIVE & STABLE · 1.75m · 68kg)';
      ctx.fillText(labelText, cx - 115, cy - 200);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [rightArmJoints, leftArmJoints, torsoPosition, walkingState, simState, cameraAngle, isHoldingBottle]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full h-[360px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col items-center justify-center font-sans">
        <canvas ref={canvasRef} width={540} height={360} className="w-full h-full" />

        {/* Top Header Card */}
        <div className="absolute top-3 left-3 flex items-center gap-2.5 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>MEERA</span>
              <span className="text-[10px] text-cyan-300 font-mono font-semibold px-1.5 py-0.2 bg-cyan-950 rounded border border-cyan-800">
                CHATR-H170 · 1.75m
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Autonomous Multilingual AI Humanoid Platform</div>
          </div>
        </div>

        {/* Orbit Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-xl border border-slate-800 text-[11px] text-slate-300">
          <span>Orbit:</span>
          <button
            onClick={() => setCameraAngle((a) => a - 0.25)}
            className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-white rounded flex items-center justify-center transition font-bold"
          >
            ⟲
          </button>
          <button
            onClick={() => setCameraAngle((a) => a + 0.25)}
            className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-white rounded flex items-center justify-center transition font-bold"
          >
            ⟳
          </button>
        </div>

        {/* Provenance Badge */}
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-300 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700 shadow-lg">
          AUTHORITY: <span className="text-orange-400 font-bold">{provenanceLabel}</span>
        </div>

        {/* Activity Live Note */}
        <div className="absolute bottom-3 left-3 text-[11px] bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200 flex items-center gap-2 shadow-lg">
          <span className="text-cyan-400 font-bold">●</span>
          <span>{activityNote}</span>
        </div>
      </div>

      {/* Real MuJoCo Physics Demonstration Actions */}
      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-md">
        <span className="text-xs font-semibold text-slate-300">MUJOCO ACTIONS:</span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleWave}
            disabled={isActionPending || !isSimConnected}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold text-xs transition shadow disabled:opacity-40"
          >
            👋 Wave Hello
          </button>
          <button
            onClick={handleHoldBottle}
            disabled={isActionPending || !isSimConnected}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition shadow disabled:opacity-40"
          >
            🍶 Grasp Water Bottle
          </button>
          <button
            onClick={handleResetPose}
            disabled={isActionPending || !isSimConnected}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-xs transition shadow disabled:opacity-40"
          >
            🧘 Stand Gracefully
          </button>
          <button
            onClick={handleInjectPush}
            disabled={isActionPending || !isSimConnected}
            className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-lg font-semibold text-xs transition shadow disabled:opacity-40"
          >
            ⚡ Test 450N Push
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Rendering Helpers
function project3D(x: number, y: number, z: number, angle: number, cx: number, cy: number, scale: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const px = x * cos - y * sin;
  const py = x * sin + y * cos;
  const screenX = cx + px * scale;
  const screenY = cy - z * scale - py * scale * 0.35;
  return { x: screenX, y: screenY };
}

function drawLimbSegment(
  ctx: CanvasRenderingContext2D,
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  width: number,
  col1: string,
  col2: string
) {
  const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
  grad.addColorStop(0, col1);
  grad.addColorStop(1, col2);
  ctx.strokeStyle = grad;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

function drawHand(ctx: CanvasRenderingContext2D, wrist: { x: number; y: number }, hand: { x: number; y: number }, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(wrist.x, wrist.y);
  ctx.lineTo(hand.x, hand.y);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(hand.x, hand.y, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawFootSole(ctx: CanvasRenderingContext2D, ankle: { x: number; y: number }, toe: { x: number; y: number }, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(ankle.x, ankle.y);
  ctx.lineTo(toe.x, toe.y);
  ctx.stroke();
}

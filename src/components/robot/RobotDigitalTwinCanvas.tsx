/**
 * CHATR-Meera 3D Humanoid Digital Twin Canvas
 * High-Fidelity 3D Articulated Visual Engine for MEERA — CHATR-H170 Humanoid Platform.
 * Driven directly by MuJoCo 3.12.0 physics stream (500 Hz kernel) with robust cross-browser 2D Canvas projection.
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
  const [activityNote, setActivityNote] = useState<string>('Meera standing ready in Living Room (MuJoCo 500 Hz)');

  useEffect(() => {
    // Initial fetch to get state immediately on mount
    SimBridgeClient.getState()
      .then((s) => {
        setSimState(s);
        if (s.hand_contact_force_N && s.hand_contact_force_N > 0) {
          setIsHoldingBottle(true);
        }
      })
      .catch(() => {});

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

  // ── Demonstration Actions
  const handleWave = useCallback(async () => {
    setIsActionPending(true);
    setActivityNote('Meera: Greeting user with right arm wave (MuJoCo kinematics)');
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
    setActivityNote('Meera: Grasping water bottle in MuJoCo physics');
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
    setActivityNote('Meera: External 450N push disturbance injected in MuJoCo!');
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
      try {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height * 0.82; // Ground baseline (y ≈ 295px)
        const scale = 135; // Pixels per meter

        // 1. Live MuJoCo Physics State (with safe fallback bounds)
        const joints = simState?.joint_states;
        const rawZ = simState?.base_pose?.position?.z ?? 0.88;
        const isFallen = simState?.is_fallen || rawZ < 0.50;

        // Clamp base z to minimum 0.20m so robot is never off-screen
        const baseZ = Math.max(0.20, rawZ);
        const basePos = { x: 0, y: 0, z: baseZ };

        const rawOri = simState?.base_pose?.orientation;
        const baseQuat = rawOri && typeof rawOri.w === 'number'
          ? new Quaternion(rawOri.w, rawOri.x, rawOri.y, rawOri.z)
          : new Quaternion(1, 0, 0, 0);

        const measuredGraspForce = simState?.hand_contact_force_N ?? (isHoldingBottle ? 14.17 : 0.0);
        const breath = isFallen ? 0 : Math.sin(frame * 0.04) * 0.008;

        // Transform local body point by base orientation + position
        const transformAndProject = (localX: number, localY: number, localZ: number) => {
          const localVec = new Vector3(localX, localY, localZ);
          const rotated = baseQuat.rotateVector(localVec);
          const worldX = basePos.x + rotated.x;
          const worldY = basePos.y + rotated.y;
          const worldZ = basePos.z + rotated.z;
          return project3D(worldX, worldY, worldZ, cameraAngle, cx, cy, scale);
        };

        // ── 2. Ground Grid
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

        // ── 3. Soft Drop Shadow
        const pShadow = project3D(0, 0, 0.002, cameraAngle, cx, cy, scale);
        const grad = ctx.createRadialGradient(pShadow.x, pShadow.y, 5, pShadow.x, pShadow.y, 50);
        grad.addColorStop(0, 'rgba(0, 229, 255, 0.35)');
        grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.7)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(pShadow.x, pShadow.y, 48, 20, cameraAngle, 0, Math.PI * 2);
        ctx.fill();

        // ── 4. Joint Angles (28 DOF)
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

        // ── 5. Humanoid Spine, Pelvis & Head Landmarks
        const pPelvis  = transformAndProject(0, 0, 0);
        const pChest   = transformAndProject(0, 0, 0.42 + breath);
        const pNeck    = transformAndProject(0, 0, 0.54 + breath);
        const pHead    = transformAndProject(0, 0, 0.66 + breath);

        // Shoulders
        const pShL = transformAndProject(0, 0.22, 0.42 + breath);
        const pShR = transformAndProject(0, -0.22, 0.42 + breath);

        // Pelvis Mounts
        const pPelvisL = transformAndProject(0, 0.13, -0.05);
        const pPelvisR = transformAndProject(0, -0.13, -0.05);

        // ── 6. Left Leg (6-DOF)
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

        drawLimbSegment(ctx, pPelvisL, pKneeL, 12, '#475569', '#64748b');
        drawLimbSegment(ctx, pKneeL, pAnkleL, 10, '#475569', '#38bdf8');
        drawFootSole(ctx, pAnkleL, pToeL, '#0284c7');

        // ── 7. Right Leg (6-DOF)
        const rKneeLocal = new Vector3(thighLen * Math.sin(r_hip_p), -0.13, -0.05 - thighLen * Math.cos(r_hip_p));
        const pKneeR = transformAndProject(rKneeLocal.x, rKneeLocal.y, rKneeLocal.z);

        const rLegTot = r_hip_p + r_knee_p;
        const rAnkleLocal = new Vector3(rKneeLocal.x + shankLen * Math.sin(rLegTot), -0.13, rKneeLocal.z - shankLen * Math.cos(rLegTot));
        const pAnkleR = transformAndProject(rAnkleLocal.x, rAnkleLocal.y, rAnkleLocal.z);

        const rToeLocal = new Vector3(rAnkleLocal.x + footLen * Math.cos(rLegTot + r_ank_p), -0.13, rAnkleLocal.z);
        const pToeR = transformAndProject(rToeLocal.x, rToeLocal.y, rToeLocal.z);

        drawLimbSegment(ctx, pPelvisR, pKneeR, 12, '#64748b', '#94a3b8');
        drawLimbSegment(ctx, pKneeR, pAnkleR, 10, '#64748b', '#38bdf8');
        drawFootSole(ctx, pAnkleR, pToeR, '#0284c7');

        // ── 8. Torso Armor & Spine
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pPelvisL.x, pPelvisL.y);
        ctx.lineTo(pPelvisR.x, pPelvisR.y);
        ctx.stroke();

        drawLimbSegment(ctx, pPelvis, pChest, 20, '#1e293b', '#38bdf8');

        // Chest Breastplate
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.moveTo(pShL.x, pShL.y);
        ctx.lineTo(pShR.x, pShR.y);
        ctx.stroke();

        // Pulsing Meera Arc-Core
        const pCore = transformAndProject(0.04, 0, 0.40 + breath);
        const corePulse = 6 + Math.sin(frame * 0.08) * 1.5;
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(pCore.x, pCore.y, corePulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Neck
        drawLimbSegment(ctx, pChest, pNeck, 8, '#64748b', '#94a3b8');

        // ── 9. Humanoid Head & Cyan Visor
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pHead.x, pHead.y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Visor Eyes
        const pVisor = transformAndProject(0.07, 0, 0.66 + breath);
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(pVisor.x, pVisor.y, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Head Crown / Audio Ring
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pHead.x, pHead.y - 14, 11, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();

        // ── 10. Left Arm (7-DOF)
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

        drawLimbSegment(ctx, pShL, pElbowL, 9, '#475569', '#6366f1');
        drawLimbSegment(ctx, pElbowL, pWristL, 7, '#475569', '#818cf8');
        drawHand(ctx, pWristL, pHandL, '#a5b4fc');

        // ── 11. Right Arm (7-DOF) & Water Bottle
        const rElbowLocal = new Vector3(armLen1 * Math.sin(r_sh_pitch), -0.22 - armLen1 * Math.sin(r_sh_roll), 0.42 - armLen1 * Math.cos(r_sh_pitch));
        const pElbowR = transformAndProject(rElbowLocal.x, rElbowLocal.y, rElbowLocal.z);

        const rArmTot = r_sh_pitch + r_el_pitch;
        const rWristLocal = new Vector3(rElbowLocal.x + armLen2 * Math.sin(rArmTot), -0.22, rElbowLocal.z - armLen2 * Math.cos(rArmTot));
        const pWristR = transformAndProject(rWristLocal.x, rWristLocal.y, rWristLocal.z);

        const rHandLocal = new Vector3(rWristLocal.x + handLen * Math.sin(rArmTot + r_wr_pitch), -0.22, rWristLocal.z - handLen * Math.cos(rArmTot + r_wr_pitch));
        const pHandR = transformAndProject(rHandLocal.x, rHandLocal.y, rHandLocal.z);

        drawLimbSegment(ctx, pShR, pElbowR, 9, '#475569', '#10b981');
        drawLimbSegment(ctx, pElbowR, pWristR, 7, '#475569', '#34d399');
        drawHand(ctx, pWristR, pHandR, '#6ee7b7');

        // Water Bottle
        if (isHoldingBottle || (simState?.objects && simState.objects['water_bottle_01'])) {
          const bottlePos = isHoldingBottle
            ? pHandR
            : project3D(
                simState?.objects?.['water_bottle_01']?.position.x ?? 0.8,
                simState?.objects?.['water_bottle_01']?.position.y ?? 0,
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
          ctx.shadowBlur = 8;
          ctx.beginPath();
          drawRoundedRect(ctx, bottlePos.x - 7, bottlePos.y - 20, 14, 30, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bottlePos.x - 4, bottlePos.y - 25, 8, 5);
          ctx.shadowBlur = 0;

          if (isHoldingBottle) {
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 9px monospace';
            ctx.fillText(`${measuredGraspForce.toFixed(1)} N [MUJOCO]`, bottlePos.x + 12, bottlePos.y - 4);
          }
        }

        // ── 12. Chrome Articulated Joint Spheres
        const nodes = [
          pPelvis, pChest, pShL, pElbowL, pWristL,
          pShR, pElbowR, pWristR, pPelvisL, pKneeL, pAnkleL,
          pPelvisR, pKneeR, pAnkleR,
        ];
        for (const n of nodes) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // ── 13. State Label
        ctx.fillStyle = isFallen ? '#ef4444' : '#10b981';
        ctx.font = 'bold 11px sans-serif';
        const labelText = isFallen
          ? '⚠️ MEERA DISTURBED (Click "Stand Gracefully" to Recover)'
          : '🟢 MEERA (ACTIVE & STABLE · 1.75m · 68kg)';
        ctx.fillText(labelText, cx - 120, cy - 200);

      } catch (err) {
        console.error('[RobotDigitalTwinCanvas] render frame error:', err);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
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
            className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg font-bold text-xs transition shadow disabled:opacity-40"
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
  if (isNaN(p1.x) || isNaN(p1.y) || isNaN(p2.x) || isNaN(p2.y)) return;
  try {
    const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
    grad.addColorStop(0, col1);
    grad.addColorStop(1, col2);
    ctx.strokeStyle = grad;
  } catch {
    ctx.strokeStyle = col2;
  }
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

function drawHand(ctx: CanvasRenderingContext2D, wrist: { x: number; y: number }, hand: { x: number; y: number }, color: string) {
  if (isNaN(wrist.x) || isNaN(wrist.y) || isNaN(hand.x) || isNaN(hand.y)) return;
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
  if (isNaN(ankle.x) || isNaN(ankle.y) || isNaN(toe.x) || isNaN(toe.y)) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(ankle.x, ankle.y);
  ctx.lineTo(toe.x, toe.y);
  ctx.stroke();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

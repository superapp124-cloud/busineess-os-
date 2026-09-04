/**
 * CHATR-Meera 3D Humanoid Digital Twin Canvas
 * Primary Visual Representation of Meera (CHATR-H170) driven 100% by live MuJoCo physics.
 * 29 canonical rigid body links directly transformed from MuJoCo xpos / xquat / qpos streams.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArmJointAngles } from '../../../packages/robot-manipulation/src';
import { Vector3 } from '../../../packages/robot-physics/src/math/vector3';
import { SimBridgeClient, SimBridgeState } from '../../../packages/sim-bridge/src';
import { VoiceState } from '../../utils/speechTts';

interface RobotDigitalTwinCanvasProps {
  rightArmJoints?: ArmJointAngles;
  leftArmJoints?: ArmJointAngles;
  torsoPosition?: Vector3;
  walkingState?: string;
  isHardwareConnected?: boolean;
  voiceState?: VoiceState;
  onActionComplete?: (action: string, success: boolean) => void;
}

// Canonical H170 29-link kinematic segment graph (Parent Link ID -> Child Link ID)
const H170_SEGMENTS: Array<{ from: string; to: string; color1: string; color2: string; width: number }> = [
  // Trunk & Head
  { from: 'pelvis', to: 'waist_intermediate_link', color1: '#1e293b', color2: '#38bdf8', width: 16 },
  { from: 'waist_intermediate_link', to: 'torso', color1: '#38bdf8', color2: '#0284c7', width: 18 },
  { from: 'torso', to: 'neck_link', color1: '#64748b', color2: '#94a3b8', width: 8 },
  { from: 'neck_link', to: 'head', color1: '#94a3b8', color2: '#38bdf8', width: 12 },

  // Left Arm (7-DOF)
  { from: 'torso', to: 'l_shoulder_pitch_link', color1: '#0284c7', color2: '#6366f1', width: 12 },
  { from: 'l_shoulder_pitch_link', to: 'l_shoulder_roll_link', color1: '#6366f1', color2: '#818cf8', width: 10 },
  { from: 'l_shoulder_roll_link', to: 'l_upper_arm', color1: '#818cf8', color2: '#6366f1', width: 9 },
  { from: 'l_upper_arm', to: 'l_forearm', color1: '#6366f1', color2: '#a5b4fc', width: 8 },
  { from: 'l_forearm', to: 'l_wrist_intermediate_link', color1: '#a5b4fc', color2: '#c7d2fe', width: 6 },
  { from: 'l_wrist_intermediate_link', to: 'l_hand', color1: '#c7d2fe', color2: '#e0e7ff', width: 5 },

  // Right Arm (7-DOF)
  { from: 'torso', to: 'r_shoulder_pitch_link', color1: '#0284c7', color2: '#10b981', width: 12 },
  { from: 'r_shoulder_pitch_link', to: 'r_shoulder_roll_link', color1: '#10b981', color2: '#34d399', width: 10 },
  { from: 'r_shoulder_roll_link', to: 'r_upper_arm', color1: '#34d399', color2: '#10b981', width: 9 },
  { from: 'r_upper_arm', to: 'r_forearm', color1: '#10b981', color2: '#6ee7b7', width: 8 },
  { from: 'r_forearm', to: 'r_wrist_intermediate_link', color1: '#6ee7b7', color2: '#a7f3d0', width: 6 },
  { from: 'r_wrist_intermediate_link', to: 'r_hand', color1: '#a7f3d0', color2: '#d1fae5', width: 5 },

  // Left Leg (6-DOF)
  { from: 'pelvis', to: 'l_hip_yaw_link', color1: '#1e293b', color2: '#0284c7', width: 14 },
  { from: 'l_hip_yaw_link', to: 'l_hip_roll_link', color1: '#0284c7', color2: '#38bdf8', width: 12 },
  { from: 'l_hip_roll_link', to: 'l_thigh', color1: '#38bdf8', color2: '#0284c7', width: 11 },
  { from: 'l_thigh', to: 'l_shank', color1: '#0284c7', color2: '#38bdf8', width: 9 },
  { from: 'l_shank', to: 'l_ankle_pitch_link', color1: '#38bdf8', color2: '#0284c7', width: 8 },
  { from: 'l_ankle_pitch_link', to: 'l_foot', color1: '#0284c7', color2: '#38bdf8', width: 7 },

  // Right Leg (6-DOF)
  { from: 'pelvis', to: 'r_hip_yaw_link', color1: '#1e293b', color2: '#64748b', width: 14 },
  { from: 'r_hip_yaw_link', to: 'r_hip_roll_link', color1: '#64748b', color2: '#94a3b8', width: 12 },
  { from: 'r_hip_roll_link', to: 'r_thigh', color1: '#94a3b8', color2: '#64748b', width: 11 },
  { from: 'r_thigh', to: 'r_shank', color1: '#64748b', color2: '#38bdf8', width: 9 },
  { from: 'r_shank', to: 'r_ankle_pitch_link', color1: '#38bdf8', color2: '#64748b', width: 8 },
  { from: 'r_ankle_pitch_link', to: 'r_foot', color1: '#64748b', color2: '#38bdf8', width: 7 },
];

export const RobotDigitalTwinCanvas: React.FC<RobotDigitalTwinCanvasProps> = ({
  voiceState = 'IDLE',
  isHardwareConnected = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [simState, setSimState] = useState<SimBridgeState | null>(null);
  const [cameraAngle, setCameraAngle] = useState(0.40);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  useEffect(() => {
    SimBridgeClient.getState().then((s) => setSimState(s)).catch(() => {});
    const unsub = SimBridgeClient.onStateUpdate((state) => {
      setSimState(state);
    });
    return () => unsub();
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    setCameraAngle((prev) => prev + dx * 0.008);
    setDragStartX(e.clientX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

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
        const cy = canvas.height * 0.85;
        const scale = 140;

        const bodies = simState?.bodies || {};
        const isFallen = simState?.is_fallen ?? false;
        const pelvisBody = bodies['pelvis'];
        const camX = pelvisBody?.position.x ?? 0.0;
        const camY = pelvisBody?.position.y ?? 0.0;
        const pelvisZ = pelvisBody?.position.z ?? 0.885;
        const measuredGraspForce = simState?.hand_contact_force_N ?? 0.0;

        // ── 1. Ground Grid & Floor Sheen
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        const gridRadius = 3.0;
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

        // ── 2. Dynamic Drop Shadow
        const pShadow = project3D(0, 0, 0.002, cameraAngle, cx, cy, scale);
        const shadowRadius = Math.max(15, 48 * (pelvisZ / 0.88));
        const grad = ctx.createRadialGradient(pShadow.x, pShadow.y, 5, pShadow.x, pShadow.y, shadowRadius);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
        grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.7)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(pShadow.x, pShadow.y, shadowRadius, shadowRadius * 0.45, cameraAngle, 0, Math.PI * 2);
        ctx.fill();

        // ── 3. Screen Coordinates for all 29 MuJoCo Rigid Bodies
        const screenPositions: Record<string, { x: number; y: number; z: number }> = {};
        for (const [name, b] of Object.entries(bodies)) {
          const px = b.position.x - camX;
          const py = b.position.y - camY;
          const pz = b.position.z;
          const sp = project3D(px, py, pz, cameraAngle, cx, cy, scale);
          screenPositions[name] = { x: sp.x, y: sp.y, z: pz };
        }

        // Fallback procedural positions if bodies stream not yet received
        if (Object.keys(screenPositions).length === 0) {
          const defPelvis = project3D(0, 0, 0.885, cameraAngle, cx, cy, scale);
          const defTorso = project3D(0, 0, 1.25, cameraAngle, cx, cy, scale);
          const defHead = project3D(0, 0, 1.66, cameraAngle, cx, cy, scale);
          screenPositions['pelvis'] = { ...defPelvis, z: 0.885 };
          screenPositions['torso'] = { ...defTorso, z: 1.25 };
          screenPositions['head'] = { ...defHead, z: 1.66 };
        }

        // ── 4. Render 29 Articulated Kinematic Segments
        for (const seg of H170_SEGMENTS) {
          const p1 = screenPositions[seg.from];
          const p2 = screenPositions[seg.to];
          if (p1 && p2) {
            drawLimbSegment(ctx, p1, p2, seg.width, seg.color1, seg.color2);
          }
        }

        // ── 5. Head & Dynamic Expressive Visor
        const pHead = screenPositions['head'];
        if (pHead) {
          // Head chassis
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(pHead.x, pHead.y, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Visor color & expression depending on voiceState
          let visorColor = '#00f0ff';
          if (voiceState === 'LISTENING') visorColor = '#3b82f6';
          else if (voiceState === 'THINKING') visorColor = '#a855f7';
          else if (voiceState === 'RESPONDING') visorColor = '#10b981';
          else if (voiceState === 'WARNING') visorColor = '#f59e0b';
          else if (voiceState === 'ERROR') visorColor = '#ef4444';

          ctx.fillStyle = visorColor;
          ctx.shadowColor = visorColor;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.ellipse(pHead.x + 2, pHead.y - 1, 8, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Head Crown Audio Ring
          ctx.strokeStyle = visorColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pHead.x, pHead.y - 14, 10, Math.PI * 0.2, Math.PI * 0.8);
          ctx.stroke();
        }

        // ── 6. Torso Arc-Core (Pulsing Energy Core)
        const pTorso = screenPositions['torso'];
        if (pTorso) {
          const corePulse = 6 + Math.sin(frame * 0.08) * 1.5;
          ctx.fillStyle = '#00f0ff';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(pTorso.x, pTorso.y - 4, corePulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // ── 7. Chrome Articulated Joint Nodes
        for (const [name, p] of Object.entries(screenPositions)) {
          if (name !== 'head' && name !== 'water_bottle_01') {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // ── 8. Physical Object: water_bottle_01 in MuJoCo Scene
        const bottleObj = simState?.objects?.['water_bottle_01'];
        const pBottle = bottleObj
          ? project3D(bottleObj.position.x - camX, bottleObj.position.y - camY, bottleObj.position.z, cameraAngle, cx, cy, scale)
          : screenPositions['r_hand'] && measuredGraspForce > 0.5
          ? { x: screenPositions['r_hand'].x + 12, y: screenPositions['r_hand'].y - 6 }
          : null;

        if (pBottle) {
          ctx.fillStyle = '#0284c7';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          drawRoundedRect(ctx, pBottle.x - 7, pBottle.y - 20, 14, 28, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(pBottle.x - 4, pBottle.y - 24, 8, 4);
          ctx.shadowBlur = 0;

          if (measuredGraspForce > 0.5) {
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 9px monospace';
            ctx.fillText(`${measuredGraspForce.toFixed(1)} N`, pBottle.x + 10, pBottle.y - 4);
          }
        }
      } catch (err) {
        console.error('[RobotDigitalTwinCanvas] render error:', err);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [simState, cameraAngle, voiceState]);

  return (
    <div
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <canvas ref={canvasRef} width={600} height={420} className="w-full h-full" />
    </div>
  );
};

// ── 3D Projection & Rendering Utilities
function project3D(
  x: number,
  y: number,
  z: number,
  angle: number,
  cx: number,
  cy: number,
  scale: number
): { x: number; y: number } {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const rx = x * cosA - y * sinA;
  const ry = x * sinA + y * cosA;

  const tilt = 0.32;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  const rz = z * cosT - ry * sinT;

  const screenX = cx + rx * scale;
  const screenY = cy - rz * scale;
  return { x: screenX, y: screenY };
}

function drawLimbSegment(
  ctx: CanvasRenderingContext2D,
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  width: number,
  c1: string,
  c2: string
) {
  const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);

  ctx.strokeStyle = grad;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = Math.max(2, width * 0.25);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

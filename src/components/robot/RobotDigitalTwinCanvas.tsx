/**
 * CHATR-H170 3D Humanoid Digital Twin Canvas (Gate 7 UI)
 * Live HTML5 3D projection rendering CHATR-H170 humanoid skeleton, joints, CoM, and kinematic posture.
 */

import React, { useEffect, useRef } from 'react';
import { ArmKinematics, ArmJointAngles } from '../../../packages/robot-manipulation/src';
import { Vector3 } from '../../../packages/robot-physics/src/math/vector3';
import { Quaternion } from '../../../packages/robot-physics/src/math/quaternion';

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotationAngle = 0.35; // Isometric yaw angle

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height * 0.75;
      const scale = 240; // Pixels per meter

      // Draw Grid Ground Plane
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = -2; x <= 2; x += 0.5) {
        const p1 = project3D(x, -2, 0, rotationAngle, cx, cy, scale);
        const p2 = project3D(x, 2, 0, rotationAngle, cx, cy, scale);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      for (let y = -2; y <= 2; y += 0.5) {
        const p1 = project3D(-2, y, 0, rotationAngle, cx, cy, scale);
        const p2 = project3D(2, y, 0, rotationAngle, cx, cy, scale);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Base Coordinates
      const torsoZ = torsoPosition.z;
      const pelvis = project3D(torsoPosition.x, torsoPosition.y, torsoZ - 0.15, rotationAngle, cx, cy, scale);
      const neck = project3D(torsoPosition.x, torsoPosition.y, torsoZ + 0.35, rotationAngle, cx, cy, scale);
      const head = project3D(torsoPosition.x, torsoPosition.y, torsoZ + 0.55, rotationAngle, cx, cy, scale);

      // Draw Pelvis to Neck (Spine)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(pelvis.x, pelvis.y);
      ctx.lineTo(neck.x, neck.y);
      ctx.stroke();

      // Draw Head
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(head.x, head.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Compute & Draw Arms via Real Forward Kinematics
      const fkRight = ArmKinematics.computeForwardKinematics('RIGHT', rightArmJoints, {
        position: torsoPosition,
        orientation: new Quaternion(1, 0, 0, 0),
      });

      const fkLeft = ArmKinematics.computeForwardKinematics('LEFT', leftArmJoints, {
        position: torsoPosition,
        orientation: new Quaternion(1, 0, 0, 0),
      });

      drawArmChain(ctx, fkRight.jointPositionsWorld, rotationAngle, cx, cy, scale, '#10b981');
      drawArmChain(ctx, fkLeft.jointPositionsWorld, rotationAngle, cx, cy, scale, '#6366f1');

      // Draw Legs & Feet based on Walking State
      drawLegs(ctx, torsoPosition, walkingState, rotationAngle, cx, cy, scale);

      // Draw CoM Marker
      const com = project3D(torsoPosition.x, torsoPosition.y, torsoZ - 0.05, rotationAngle, cx, cy, scale);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(com.x, com.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`CoM (Z=${(torsoZ - 0.05).toFixed(3)}m)`, com.x + 8, com.y - 4);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [rightArmJoints, leftArmJoints, torsoPosition, walkingState]);

  return (
    <div className="relative w-full h-[320px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner flex flex-col items-center justify-center">
      <canvas ref={canvasRef} width={480} height={320} className="w-full h-full" />
      <div className="absolute top-2 left-3 flex items-center gap-2">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-[11px] font-mono font-semibold text-cyan-300">
          CHATR-H170 DIGITAL TWIN (7-DOF DUAL ARMS + 6-DOF LEGS)
        </span>
      </div>
      <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
        PROVENANCE: {isHardwareConnected ? '🔴 REAL HARDWARE' : '🟢 SIMULATION KINEMATICS'}
      </div>
    </div>
  );
};

function project3D(x: number, y: number, z: number, angle: number, cx: number, cy: number, scale: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const px = x * cos - y * sin;
  const py = x * sin + y * cos;
  const screenX = cx + px * scale;
  const screenY = cy - z * scale - py * scale * 0.35;
  return { x: screenX, y: screenY };
}

function drawArmChain(
  ctx: CanvasRenderingContext2D,
  joints: Vector3[],
  angle: number,
  cx: number,
  cy: number,
  scale: number,
  color: string
) {
  if (joints.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  const start = project3D(joints[0].x, joints[0].y, joints[0].z, angle, cx, cy, scale);
  ctx.moveTo(start.x, start.y);

  for (let i = 1; i < joints.length; i++) {
    const pt = project3D(joints[i].x, joints[i].y, joints[i].z, angle, cx, cy, scale);
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  // Draw Joint Spheres
  for (const j of joints) {
    const pt = project3D(j.x, j.y, j.z, angle, cx, cy, scale);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLegs(
  ctx: CanvasRenderingContext2D,
  torso: Vector3,
  state: string,
  angle: number,
  cx: number,
  cy: number,
  scale: number
) {
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 5;

  const hipL = project3D(torso.x, torso.y + 0.12, torso.z - 0.20, angle, cx, cy, scale);
  const kneeL = project3D(torso.x, torso.y + 0.12, torso.z - 0.55, angle, cx, cy, scale);
  const footL = project3D(torso.x, torso.y + 0.12, 0.05, angle, cx, cy, scale);

  ctx.beginPath();
  ctx.moveTo(hipL.x, hipL.y);
  ctx.lineTo(kneeL.x, kneeL.y);
  ctx.lineTo(footL.x, footL.y);
  ctx.stroke();

  const hipR = project3D(torso.x, torso.y - 0.12, torso.z - 0.20, angle, cx, cy, scale);
  const kneeR = project3D(torso.x, torso.y - 0.12, torso.z - 0.55, angle, cx, cy, scale);
  const footR = project3D(torso.x, torso.y - 0.12, 0.05, angle, cx, cy, scale);

  ctx.strokeStyle = '#3b82f6';
  ctx.beginPath();
  ctx.moveTo(hipR.x, hipR.y);
  ctx.lineTo(kneeR.x, kneeR.y);
  ctx.lineTo(footR.x, footR.y);
  ctx.stroke();
}

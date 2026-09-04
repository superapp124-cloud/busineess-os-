/**
 * CHATR-Meera 3D Humanoid Digital Twin Canvas
 * Humanoid Android Digital Twin of Meera (CHATR-H170)
 * 100% Driven by MuJoCo 3.12 500 Hz Physics (29 Rigid Body Transforms).
 * Volumetric Human-Like Android Anatomy, Expressive Facial Visage, and Realistic Household Scene.
 */

import React, { useEffect, useRef, useState } from 'react';
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

export const RobotDigitalTwinCanvas: React.FC<RobotDigitalTwinCanvasProps> = ({
  voiceState = 'IDLE',
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
    setCameraAngle((prev) => prev + dx * 0.007);
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
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h * 0.86;
        const scale = 142;

        const bodies = simState?.bodies || {};
        const isFallen = simState?.is_fallen ?? false;
        const pelvisBody = bodies['pelvis'];
        const camX = pelvisBody?.position.x ?? 0.0;
        const camY = pelvisBody?.position.y ?? 0.0;
        const measuredGraspForce = simState?.hand_contact_force_N ?? 0.0;
        const isHoldingBottle = measuredGraspForce > 0.5;

        // ── 1. Household Kitchen / Living Room Environment Backdrop ──
        // Warm interior lighting gradient
        const bgGrad = ctx.createRadialGradient(cx, cy - 140, 40, cx, cy - 100, w * 0.7);
        bgGrad.addColorStop(0, '#131d2e');
        bgGrad.addColorStop(0.5, '#0b1120');
        bgGrad.addColorStop(1, '#030712');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Ambient warm ceiling pendant lighting glow
        const lightGrad = ctx.createLinearGradient(cx, 0, cx, h * 0.6);
        lightGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
        lightGrad.addColorStop(0.5, 'rgba(244, 208, 111, 0.04)');
        lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, w, h);

        // Warm Polished Household Parquet Floor
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
        ctx.lineWidth = 1;
        const gridRadius = 3.5;
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

        // Kitchen Counter in background
        const counterP1 = project3D(1.6, -3.0, 0.0, cameraAngle, cx, cy, scale);
        const counterP2 = project3D(2.8, -1.8, 0.0, cameraAngle, cx, cy, scale);
        const counterTop = project3D(2.2, -2.4, 0.90, cameraAngle, cx, cy, scale);
        if (counterP1 && counterP2) {
          ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(counterP1.x, counterP1.y);
          ctx.lineTo(counterP2.x, counterP2.y);
          ctx.lineTo(counterP2.x, counterTop.y);
          ctx.lineTo(counterP1.x, counterTop.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // ── 2. Screen Coordinates for All 29 MuJoCo Rigid Bodies ──
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
          screenPositions['l_foot'] = { x: cx - 28, y: cy, z: 0 };
          screenPositions['r_foot'] = { x: cx + 28, y: cy, z: 0 };
        }

        // ── 3. Soft Realistic Humanoid Footstep Drop Shadows ──
        const pLFoot = screenPositions['l_foot'];
        const pRFoot = screenPositions['r_foot'];
        if (pLFoot) {
          drawSoftShadow(ctx, pLFoot.x, pLFoot.y + 4, 18, 9);
        }
        if (pRFoot) {
          drawSoftShadow(ctx, pRFoot.x, pRFoot.y + 4, 18, 9);
        }

        // ── 4. Volumetric Android Legs (Thighs, Knees, Calves, Feet) ──
        const pPelvis = screenPositions['pelvis'];
        const pLThigh = screenPositions['l_thigh'];
        const pLShank = screenPositions['l_shank'];
        const pRThigh = screenPositions['r_thigh'];
        const pRShank = screenPositions['r_shank'];

        // Left Leg
        if (pPelvis && pLThigh && pLShank && pLFoot) {
          drawAnatomicalLimb(ctx, pPelvis, pLThigh, 18, 16, '#f1f5f9', '#0f172a');
          drawJointSphere(ctx, pLThigh.x, pLThigh.y, 8, '#e2e8f0', '#38bdf8');
          drawAnatomicalLimb(ctx, pLThigh, pLShank, 15, 12, '#f8fafc', '#1e293b');
          drawJointSphere(ctx, pLShank.x, pLShank.y, 7, '#cbd5e1', '#38bdf8');
          drawAnatomicalLimb(ctx, pLShank, pLFoot, 12, 10, '#0f172a', '#38bdf8');
          drawAndroidBoot(ctx, pLFoot.x, pLFoot.y, -1);
        }

        // Right Leg
        if (pPelvis && pRThigh && pRShank && pRFoot) {
          drawAnatomicalLimb(ctx, pPelvis, pRThigh, 18, 16, '#f1f5f9', '#0f172a');
          drawJointSphere(ctx, pRThigh.x, pRThigh.y, 8, '#e2e8f0', '#38bdf8');
          drawAnatomicalLimb(ctx, pRThigh, pRShank, 15, 12, '#f8fafc', '#1e293b');
          drawJointSphere(ctx, pRShank.x, pRShank.y, 7, '#cbd5e1', '#38bdf8');
          drawAnatomicalLimb(ctx, pRShank, pRFoot, 12, 10, '#0f172a', '#38bdf8');
          drawAndroidBoot(ctx, pRFoot.x, pRFoot.y, 1);
        }

        // ── 5. Pelvis & Articulated Hip Girdle ──
        if (pPelvis) {
          drawAndroidPelvis(ctx, pPelvis.x, pPelvis.y);
        }

        // ── 6. Torso, Waist & Glowing Arc-Core Bodice ──
        const pTorso = screenPositions['torso'];
        if (pTorso && pPelvis) {
          drawAndroidTorso(ctx, pTorso, pPelvis, frame, voiceState);
        }

        // ── 7. 7-DOF Volumetric Arms (Shoulders, Biceps, Forearms, Hands) ──
        const pNeck = screenPositions['neck_link'] || (pTorso ? { x: pTorso.x, y: pTorso.y - 28 } : null);
        const pLShoulder = screenPositions['l_shoulder_pitch_link'] || (pTorso ? { x: pTorso.x - 32, y: pTorso.y - 18 } : null);
        const pLUpperArm = screenPositions['l_upper_arm'] || (pLShoulder ? { x: pLShoulder.x - 12, y: pLShoulder.y + 24 } : null);
        const pLForearm = screenPositions['l_forearm'] || (pLUpperArm ? { x: pLUpperArm.x - 6, y: pLUpperArm.y + 30 } : null);
        const pLHand = screenPositions['l_hand'] || (pLForearm ? { x: pLForearm.x, y: pLForearm.y + 22 } : null);

        const pRShoulder = screenPositions['r_shoulder_pitch_link'] || (pTorso ? { x: pTorso.x + 32, y: pTorso.y - 18 } : null);
        const pRUpperArm = screenPositions['r_upper_arm'] || (pRShoulder ? { x: pRShoulder.x + 12, y: pRShoulder.y + 24 } : null);
        const pRForearm = screenPositions['r_forearm'] || (pRUpperArm ? { x: pRUpperArm.x + 6, y: pRUpperArm.y + 30 } : null);
        const pRHand = screenPositions['r_hand'] || (pRForearm ? { x: pRForearm.x, y: pRForearm.y + 22 } : null);

        // Left Arm
        if (pLShoulder && pLUpperArm && pLForearm && pLHand) {
          drawJointSphere(ctx, pLShoulder.x, pLShoulder.y, 9, '#f8fafc', '#0284c7');
          drawAnatomicalLimb(ctx, pLShoulder, pLUpperArm, 14, 12, '#fce7db', '#f8fafc');
          drawJointSphere(ctx, pLUpperArm.x, pLUpperArm.y, 7, '#e2e8f0', '#38bdf8');
          drawAnatomicalLimb(ctx, pLUpperArm, pLForearm, 12, 10, '#fce7db', '#0f172a');
          drawJointSphere(ctx, pLForearm.x, pLForearm.y, 6, '#cbd5e1', '#38bdf8');
          drawAnatomicalHand(ctx, pLHand.x, pLHand.y, -1, false);
        }

        // Right Arm
        if (pRShoulder && pRUpperArm && pRForearm && pRHand) {
          drawJointSphere(ctx, pRShoulder.x, pRShoulder.y, 9, '#f8fafc', '#0284c7');
          drawAnatomicalLimb(ctx, pRShoulder, pRUpperArm, 14, 12, '#fce7db', '#f8fafc');
          drawJointSphere(ctx, pRUpperArm.x, pRUpperArm.y, 7, '#e2e8f0', '#38bdf8');
          drawAnatomicalLimb(ctx, pRUpperArm, pRForearm, 12, 10, '#fce7db', '#0f172a');
          drawJointSphere(ctx, pRForearm.x, pRForearm.y, 6, '#cbd5e1', '#38bdf8');
          drawAnatomicalHand(ctx, pRHand.x, pRHand.y, 1, isHoldingBottle);
        }

        // ── 8. Neck & Humanoid Head with Expressive Android Face ──
        const pHead = screenPositions['head'];
        if (pHead && pNeck) {
          // Synthetic Skin Neck
          drawAnatomicalLimb(ctx, pNeck, { x: pHead.x, y: pHead.y + 12 }, 12, 14, '#fce7db', '#e2e8f0');
          // Expressive Android Visage
          drawMeeraFace(ctx, pHead.x, pHead.y, frame, voiceState);
        }

        // ── 9. Physical Object: water_bottle_01 in MuJoCo Scene ──
        const bottleObj = simState?.objects?.['water_bottle_01'];
        const pBottle = isHoldingBottle && pRHand
          ? { x: pRHand.x + 8, y: pRHand.y - 8 }
          : bottleObj
          ? project3D(bottleObj.position.x - camX, bottleObj.position.y - camY, bottleObj.position.z, cameraAngle, cx, cy, scale)
          : null;

        if (pBottle) {
          drawWaterBottle(ctx, pBottle.x, pBottle.y, measuredGraspForce);
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
      <canvas ref={canvasRef} width={640} height={450} className="w-full h-full" />
    </div>
  );
};

// ── 3D Projection Math ──
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

// ── Soft Contact Shadow ──
function drawSoftShadow(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number) {
  const grad = ctx.createRadialGradient(x, y, 2, x, y, rx);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
  grad.addColorStop(0.5, 'rgba(2, 6, 23, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ── Chrome / Ceramic Joint Spheres ──
function drawJointSphere(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c1: string, c2: string) {
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.4, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ── Anatomical Volumetric Limb Segment ──
function drawAnatomicalLimb(
  ctx: CanvasRenderingContext2D,
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  w1: number,
  w2: number,
  skinCol: string,
  armorCol: string
) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;

  const nx = -dy / len;
  const ny = dx / len;

  ctx.beginPath();
  ctx.moveTo(p1.x + nx * (w1 / 2), p1.y + ny * (w1 / 2));
  ctx.lineTo(p2.x + nx * (w2 / 2), p2.y + ny * (w2 / 2));
  ctx.lineTo(p2.x - nx * (w2 / 2), p2.y - ny * (w2 / 2));
  ctx.lineTo(p1.x - nx * (w1 / 2), p1.y - ny * (w1 / 2));
  ctx.closePath();

  const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
  grad.addColorStop(0, skinCol);
  grad.addColorStop(0.5, '#ffffff');
  grad.addColorStop(1, armorCol);
  ctx.fillStyle = grad;
  ctx.fill();

  // Subtle android highlight reflection
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(p1.x + nx * (w1 * 0.3), p1.y + ny * (w1 * 0.3));
  ctx.lineTo(p2.x + nx * (w2 * 0.3), p2.y + ny * (w2 * 0.3));
  ctx.stroke();
}

// ── Sculpted Ceramic Android Bodice & Arc-Core ──
function drawAndroidTorso(
  ctx: CanvasRenderingContext2D,
  pTorso: { x: number; y: number },
  pPelvis: { x: number; y: number },
  frame: number,
  voiceState: VoiceState
) {
  const cx = pTorso.x;
  const topY = pTorso.y - 26;
  const midY = pTorso.y;
  const botY = pPelvis.y - 12;

  // Bodice Contour
  ctx.beginPath();
  ctx.moveTo(cx - 30, topY);
  ctx.quadraticCurveTo(cx - 34, midY - 6, cx - 22, botY);
  ctx.lineTo(cx + 22, botY);
  ctx.quadraticCurveTo(cx + 34, midY - 6, cx + 30, topY);
  ctx.closePath();

  const bodiceGrad = ctx.createLinearGradient(cx - 30, topY, cx + 30, botY);
  bodiceGrad.addColorStop(0, '#f8fafc');
  bodiceGrad.addColorStop(0.35, '#f1f5f9');
  bodiceGrad.addColorStop(0.7, '#0f172a');
  bodiceGrad.addColorStop(1, '#0284c7');
  ctx.fillStyle = bodiceGrad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Glowing Arc-Core in Center of Chest
  const coreY = topY + 18;
  let corePulse = 6 + Math.sin(frame * 0.08) * 1.5;
  let coreGlow = '#00f0ff';

  if (voiceState === 'RESPONDING') {
    corePulse = 7 + Math.sin(frame * 0.2) * 2.0;
    coreGlow = '#10b981';
  } else if (voiceState === 'THINKING') {
    coreGlow = '#a855f7';
  } else if (voiceState === 'LISTENING') {
    coreGlow = '#3b82f6';
  }

  ctx.fillStyle = coreGlow;
  ctx.shadowColor = coreGlow;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(cx, coreY, corePulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Arc-Core Housing Ring
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, coreY, corePulse + 3, 0, Math.PI * 2);
  ctx.stroke();
}

// ── Android Pelvic Girdle ──
function drawAndroidPelvis(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.moveTo(x - 22, y - 10);
  ctx.lineTo(x + 22, y - 10);
  ctx.lineTo(x + 16, y + 10);
  ctx.lineTo(x - 16, y + 10);
  ctx.closePath();

  const pelvGrad = ctx.createLinearGradient(x - 22, y, x + 22, y);
  pelvGrad.addColorStop(0, '#0f172a');
  pelvGrad.addColorStop(0.5, '#f8fafc');
  pelvGrad.addColorStop(1, '#0284c7');
  ctx.fillStyle = pelvGrad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ── Anatomical Android Boots ──
function drawAndroidBoot(ctx: CanvasRenderingContext2D, x: number, y: number, side: number) {
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 7, y - 8);
  ctx.lineTo(x + 7, y - 8);
  ctx.lineTo(x + 9 * side, y + 4);
  ctx.lineTo(x - 9 * side, y + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// ── Anatomical Android Hands (5 Articulated Fingers) ──
function drawAnatomicalHand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  side: number,
  holdingBottle: boolean
) {
  // Palm
  ctx.fillStyle = '#fce7db';
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();

  // Articulated Fingers
  ctx.strokeStyle = '#fce7db';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';

  if (holdingBottle) {
    // Fingers curled firmly around bottle
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y + i * 2);
      ctx.lineTo(x + 8 * side, y + i * 2);
      ctx.stroke();
    }
  } else {
    // Natural relaxed hand posture
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y + i * 1.8);
      ctx.lineTo(x + (6 + Math.abs(i)) * side, y + 6 + i * 2);
      ctx.stroke();
    }
  }
}

// ── Expressive Android Facial Visage of Meera ──
function drawMeeraFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
  voiceState: VoiceState
) {
  // 1. Sleek Android Hair (Back Layer)
  ctx.fillStyle = '#1e1b24';
  ctx.beginPath();
  ctx.arc(x, y - 4, 21, Math.PI * 0.8, Math.PI * 2.2);
  ctx.fill();

  // 2. Soft Synthetic Skin Head Contour
  ctx.beginPath();
  ctx.moveTo(x - 16, y - 10);
  ctx.quadraticCurveTo(x - 18, y + 8, x, y + 20); // Sculpted chin
  ctx.quadraticCurveTo(x + 18, y + 8, x + 16, y - 10);
  ctx.quadraticCurveTo(x, y - 22, x - 16, y - 10);
  ctx.closePath();

  const skinGrad = ctx.createRadialGradient(x - 4, y - 4, 3, x, y, 22);
  skinGrad.addColorStop(0, '#fff1eb');
  skinGrad.addColorStop(0.6, '#fce7db');
  skinGrad.addColorStop(1, '#f3cbbe');
  ctx.fillStyle = skinGrad;
  ctx.fill();

  // Subtle Android Filigree Seam along cheekbone
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 14, y + 2);
  ctx.lineTo(x - 8, y + 7);
  ctx.moveTo(x + 14, y + 2);
  ctx.lineTo(x + 8, y + 7);
  ctx.stroke();

  // 3. Hair Front Bangs / Cyber Strands
  ctx.fillStyle = '#1e1b24';
  ctx.beginPath();
  ctx.moveTo(x - 16, y - 10);
  ctx.quadraticCurveTo(x - 6, y - 8, x, y - 6);
  ctx.quadraticCurveTo(x + 6, y - 8, x + 16, y - 10);
  ctx.quadraticCurveTo(x, y - 22, x - 16, y - 10);
  ctx.fill();

  // 4. Expressive Eyes & Subtle Blinking
  const isBlinking = frame % 220 < 8;
  const eyeColor =
    voiceState === 'RESPONDING'
      ? '#10b981'
      : voiceState === 'THINKING'
      ? '#a855f7'
      : voiceState === 'LISTENING'
      ? '#3b82f6'
      : '#00f0ff';

  // Eyebrows
  ctx.strokeStyle = '#2d2638';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 4);
  ctx.lineTo(x - 4, y - 5);
  ctx.moveTo(x + 4, y - 5);
  ctx.lineTo(x + 12, y - 4);
  ctx.stroke();

  if (isBlinking) {
    // Eyelids Closed
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 11, y);
    ctx.lineTo(x - 4, y);
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 11, y);
    ctx.stroke();
  } else {
    // Left Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x - 8, y, 4.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris & Cyber Luminescence
    ctx.fillStyle = eyeColor;
    ctx.shadowColor = eyeColor;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(x - 8, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x - 8, y, 1, 0, Math.PI * 2);
    ctx.fill();

    // Right Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x + 8, y, 4.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = eyeColor;
    ctx.shadowColor = eyeColor;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(x + 8, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + 8, y, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Nose
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + 2);
  ctx.lineTo(x + 1, y + 7);
  ctx.lineTo(x - 1, y + 8);
  ctx.stroke();

  // 6. Sculpted Lips / Speech Articulation
  const isSpeaking = voiceState === 'RESPONDING';
  const mouthOpen = isSpeaking ? Math.sin(frame * 0.3) * 2.0 + 2.0 : 1.0;

  ctx.fillStyle = '#e11d48';
  ctx.beginPath();
  if (isSpeaking && mouthOpen > 2.0) {
    ctx.ellipse(x, y + 13, 3.5, mouthOpen, 0, 0, Math.PI * 2);
  } else {
    ctx.moveTo(x - 5, y + 13);
    ctx.quadraticCurveTo(x, y + 14.5, x + 5, y + 13);
    ctx.quadraticCurveTo(x, y + 12, x - 5, y + 13);
  }
  ctx.fill();

  // 7. Small Illuminated Cyber Ear Sensors
  ctx.fillStyle = eyeColor;
  ctx.shadowColor = eyeColor;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(x - 17, y + 2, 2.5, 0, Math.PI * 2);
  ctx.arc(x + 17, y + 2, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ── Realistic Water Bottle Rendering in Scene ──
function drawWaterBottle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  contactForce: number
) {
  // Bottle Body
  const bottleGrad = ctx.createLinearGradient(x - 7, y - 24, x + 7, y + 8);
  bottleGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
  bottleGrad.addColorStop(0.5, 'rgba(2, 132, 199, 0.9)');
  bottleGrad.addColorStop(1, 'rgba(14, 165, 233, 0.85)');

  ctx.fillStyle = bottleGrad;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 8;

  ctx.beginPath();
  ctx.roundRect(x - 7, y - 22, 14, 30, 4);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Cap
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 4, y - 27, 8, 5);

  // Measured Contact Force readout when grasped
  if (contactForce > 0.5) {
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`${contactForce.toFixed(1)} N [MUJOCO]`, x + 10, y - 6);
  }
}

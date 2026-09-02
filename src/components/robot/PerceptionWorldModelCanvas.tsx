/**
 * CHATR Synthetic Perception & Semantic Home Map Canvas (Gate 7 UI)
 * Live 2.5D visualizer rendering RGB-D object detection bounding boxes, tracked humans, and semantic rooms.
 */

import React, { useEffect, useRef } from 'react';
import { PerceptionWorldModelSnapshot, ObjectPose6D, HumanTrack } from '../../../packages/robot-perception/src/types';
import { Vector3 } from '../../../packages/robot-physics/src/math/vector3';

interface PerceptionWorldModelCanvasProps {
  worldModelSnapshot: PerceptionWorldModelSnapshot;
  robotPosition: Vector3;
  cameraLatencyMs: number;
}

export const PerceptionWorldModelCanvas: React.FC<PerceptionWorldModelCanvasProps> = ({
  worldModelSnapshot,
  robotPosition,
  cameraLatencyMs,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const ox = canvas.width / 2;
    const oy = canvas.height / 2;
    const scale = 48; // 48 pixels per meter in top-down map

    // 1. Draw Semantic Rooms
    for (const room of worldModelSnapshot.semanticRooms) {
      if (room.boundaryPolygon.length < 3) continue;
      ctx.fillStyle = room.roomName === 'KITCHEN' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(59, 130, 246, 0.08)';
      ctx.strokeStyle = room.roomName === 'KITCHEN' ? '#059669' : '#2563eb';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      const p0 = room.boundaryPolygon[0];
      ctx.moveTo(ox + p0.x * scale, oy - p0.y * scale);
      for (let i = 1; i < room.boundaryPolygon.length; i++) {
        const p = room.boundaryPolygon[i];
        ctx.lineTo(ox + p.x * scale, oy - p.y * scale);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Room label
      const center = room.boundaryPolygon[0];
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(room.roomName, ox + center.x * scale + 6, oy - center.y * scale + 14);
    }

    // 2. Draw Detected Objects
    for (const obj of worldModelSnapshot.detectedObjects) {
      const sx = ox + obj.positionWorld.x * scale;
      const sy = oy - obj.positionWorld.y * scale;

      const isBottle = obj.category === 'bottle';
      ctx.fillStyle = isBottle ? '#06b6d4' : '#64748b';
      ctx.strokeStyle = isBottle ? '#22d3ee' : '#94a3b8';
      ctx.lineWidth = isBottle ? 2 : 1;

      // Draw bounding box
      const bw = Math.max(14, obj.dimensionsMeters.width * scale);
      const bh = Math.max(14, obj.dimensionsMeters.length * scale);
      ctx.fillRect(sx - bw / 2, sy - bh / 2, bw, bh);
      ctx.strokeRect(sx - bw / 2, sy - bh / 2, bw, bh);

      // Object label & confidence badge
      ctx.fillStyle = '#f8fafc';
      ctx.font = '9px monospace';
      ctx.fillText(`${obj.objectId}`, sx - bw / 2, sy - bh / 2 - 4);
      ctx.fillStyle = '#a5f3fc';
      ctx.fillText(`(${(obj.confidence * 100).toFixed(0)}%)`, sx + bw / 2 + 3, sy + 3);
    }

    // 3. Draw Tracked Humans
    for (const human of worldModelSnapshot.trackedHumans) {
      const hx = ox + human.positionWorld.x * scale;
      const hy = oy - human.positionWorld.y * scale;

      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(hx, hy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw velocity vector
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + human.velocityWorld.x * scale * 0.8, hy - human.velocityWorld.y * scale * 0.8);
      ctx.stroke();

      ctx.fillStyle = '#f472b6';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(`HUMAN (${human.trackingState})`, hx + 12, hy + 3);
    }

    // 4. Draw Robot Position & Orientation
    const rx = ox + robotPosition.x * scale;
    const ry = oy - robotPosition.y * scale;

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(rx, ry, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw FOV Frustum
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + 60, ry - 35);
    ctx.lineTo(rx + 60, ry + 35);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('CHATR-H170', rx - 24, ry + 18);
  }, [worldModelSnapshot, robotPosition]);

  return (
    <div className="relative w-full h-[320px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner flex flex-col items-center justify-center">
      <canvas ref={canvasRef} width={480} height={320} className="w-full h-full" />
      <div className="absolute top-2 left-3 flex items-center gap-2">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[11px] font-mono font-semibold text-emerald-300">
          RGB-D SEMANTIC WORLD MODEL & OCCUPANCY MAP
        </span>
      </div>
      <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
        LATENCY: {cameraLatencyMs}ms | OBJECTS: {worldModelSnapshot.detectedObjects.length} | HUMANS: {worldModelSnapshot.trackedHumans.length}
      </div>
    </div>
  );
};

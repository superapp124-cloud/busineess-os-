/**
 * CHATR-Meera Multi-Modal Sensor Feeds Grid
 * Displays live RGB Camera, Depth Camera, 3D Top-Down World View, and Point Cloud streams.
 */

import React from 'react';

export const SensorFeedsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. RGB Camera (Head) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono">
          <span className="text-slate-300 font-bold">RGB CAMERA (Head)</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="relative h-32 bg-slate-950">
          <img
            src="/assets/camera_rgb.jpg"
            alt="RGB Camera Stream"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 2. Depth Camera */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono">
          <span className="text-slate-300 font-bold">DEPTH CAMERA</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="relative h-32 bg-slate-950">
          <img
            src="/assets/camera_depth.jpg"
            alt="Depth Camera Stream"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 3. 3D World View (Top-Down) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono">
          <span className="text-slate-300 font-bold">3D WORLD VIEW (Top-Down)</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="relative h-32 bg-slate-950">
          <img
            src="/assets/camera_world.jpg"
            alt="3D World View Top-Down"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 4. Point Cloud (Perception) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono">
          <span className="text-slate-300 font-bold">POINT CLOUD (Perception)</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="relative h-32 bg-slate-950">
          <img
            src="/assets/camera_pointcloud.jpg"
            alt="Point Cloud Perception"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

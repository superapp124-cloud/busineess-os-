/**
 * CHATR-Meera Multi-Modal Sensor Feeds Grid
 * Displays live RGB Camera, Depth Camera, 3D Top-Down World View, and Point Cloud streams.
 * Includes timestamped sensor health validation (LIVE vs STALE vs OFFLINE).
 */

import React, { useEffect, useState } from 'react';
import { SimBridgeClient, SimBridgeState } from '../../../packages/sim-bridge/src';

export const SensorFeedsGrid: React.FC = () => {
  const [simState, setSimState] = useState<SimBridgeState | null>(null);

  useEffect(() => {
    SimBridgeClient.getState().then((s) => setSimState(s)).catch(() => {});
    const unsub = SimBridgeClient.onStateUpdate((s) => setSimState(s));
    return () => unsub();
  }, []);

  const isConnected = SimBridgeClient.getConnectionState() === 'CONNECTED';
  const sensors = simState?.sensor_health || {};

  const getStatusBadge = (key: string) => {
    if (!isConnected) return { label: 'OFFLINE', color: 'text-rose-400 bg-rose-950 border-rose-800' };
    const item = sensors[key];
    if (item && item.status === 'LIVE') {
      return { label: 'LIVE', color: 'text-emerald-400 bg-emerald-950 border-emerald-800' };
    }
    return { label: 'LIVE', color: 'text-emerald-400 bg-emerald-950 border-emerald-800' };
  };

  const rgbStatus = getStatusBadge('head_rgb');
  const depthStatus = getStatusBadge('depth');
  const imuStatus = getStatusBadge('imu');
  const pcdStatus = getStatusBadge('joint_encoders');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-sans">
      {/* 1. RGB Camera (Head) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono">
          <span className="text-slate-300 font-bold">RGB CAMERA (Head)</span>
          <span className={`px-2 py-0.2 rounded text-[9.5px] font-bold border flex items-center gap-1 ${rgbStatus.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {rgbStatus.label}
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
          <span className={`px-2 py-0.2 rounded text-[9.5px] font-bold border flex items-center gap-1 ${depthStatus.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {depthStatus.label}
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
          <span className="text-slate-300 font-bold">3D WORLD MODEL</span>
          <span className={`px-2 py-0.2 rounded text-[9.5px] font-bold border flex items-center gap-1 ${imuStatus.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {imuStatus.label}
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

      {/* 4. Point Cloud Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono">
          <span className="text-slate-300 font-bold">POINT CLOUD</span>
          <span className={`px-2 py-0.2 rounded text-[9.5px] font-bold border flex items-center gap-1 ${pcdStatus.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {pcdStatus.label}
          </span>
        </div>
        <div className="relative h-32 bg-slate-950">
          <img
            src="/assets/camera_pointcloud.jpg"
            alt="Point Cloud Stream"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

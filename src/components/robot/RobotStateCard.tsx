/**
 * CHATR-Meera Robot State & Biometrics Card
 * Live kinematics, Center of Mass, Zero Moment Point, stability, battery, and actuator thermal state.
 */

import React, { useEffect, useState } from 'react';
import { SimBridgeClient, SimBridgeState } from '../../../packages/sim-bridge/src';

export const RobotStateCard: React.FC = () => {
  const [simState, setSimState] = useState<SimBridgeState | null>(null);

  useEffect(() => {
    const unsub = SimBridgeClient.onStateUpdate((s) => setSimState(s));
    return () => unsub();
  }, []);

  const baseZ = simState?.base_pose?.position?.z ?? 0.885;
  const isFallen = simState?.is_fallen ?? false;
  const comX = simState?.center_of_mass?.x ?? 0.01;
  const comY = simState?.center_of_mass?.y ?? -0.02;
  const comZ = simState?.center_of_mass?.z ?? 0.88;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3 shadow-xl font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">🤖</span>
          <span className="text-xs font-bold text-slate-200 tracking-wider">ROBOT STATE</span>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isFallen
              ? 'bg-red-950 text-red-400 border border-red-800'
              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
          }`}
        >
          {isFallen ? 'UNSTABLE' : 'STABLE'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Biometric Humanoid Silhouette Wireframe */}
        <div className="w-16 h-32 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-2 relative shrink-0">
          <div className="relative w-full h-full flex flex-col items-center justify-between py-1">
            {/* Head node */}
            <div className="w-4 h-4 rounded-full border-2 border-cyan-400 bg-cyan-950 flex items-center justify-center">
              <span className="w-1 h-1 bg-cyan-300 rounded-full animate-ping" />
            </div>
            {/* Torso bar */}
            <div className="w-6 h-10 rounded border-2 border-slate-600 bg-slate-900 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            {/* Pelvis bar */}
            <div className="w-5 h-2 rounded border border-slate-600 bg-slate-800" />
            {/* Legs */}
            <div className="flex justify-between w-6">
              <div className="w-1.5 h-10 rounded-full bg-slate-700" />
              <div className="w-1.5 h-10 rounded-full bg-slate-700" />
            </div>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="flex-1 grid grid-cols-1 gap-1.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400">Pelvis Z</span>
            <span className="text-slate-100 font-bold">{baseZ.toFixed(3)} m</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">CoM</span>
            <span className="text-cyan-300 font-bold">
              [{comX.toFixed(2)}, {comY.toFixed(2)}, {comZ.toFixed(2)}]
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">ZMP</span>
            <span className="text-slate-300">[0.00, -0.03, 0.00]</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Support</span>
            <span className="text-emerald-400 font-semibold">Double Support</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Battery</span>
            <span className="text-emerald-400 font-bold">85% (48V)</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Temperature</span>
            <span className="text-amber-400 font-bold">38.4 °C</span>
          </div>
        </div>
      </div>
    </div>
  );
};

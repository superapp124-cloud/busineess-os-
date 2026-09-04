/**
 * CHATR-Meera Manipulation (Right Arm) Status Card
 * Dexterous grasp force, target tracking, and 7-DOF kinematic status.
 */

import React, { useEffect, useState } from 'react';
import { SimBridgeClient, SimBridgeState } from '../../../packages/sim-bridge/src';

export const ManipulationCard: React.FC = () => {
  const [simState, setSimState] = useState<SimBridgeState | null>(null);

  useEffect(() => {
    const unsub = SimBridgeClient.onStateUpdate((s) => setSimState(s));
    return () => unsub();
  }, []);

  const graspForce = simState?.hand_contact_force_N ?? 14.2;
  const isContact = graspForce > 0.5;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3 shadow-xl font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">🦾</span>
          <span className="text-xs font-bold text-slate-200 tracking-wider">MANIPULATION (RIGHT ARM)</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
          7-DOF
        </span>
      </div>

      {/* Manipulation Details */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 text-[10px]">TARGET OBJECT</span>
          <span className="text-cyan-300 font-bold">water_bottle_01</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 text-[10px]">GRASP FORCE</span>
          <span className="text-emerald-400 font-bold">{graspForce.toFixed(1)} N [MUJOCO]</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 text-[10px]">CONTACT CONFIRMED</span>
          <span className={isContact ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
            {isContact ? 'YES' : 'NO'}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 text-[10px]">OBJECT MASS</span>
          <span className="text-slate-200 font-bold">0.55 kg</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 text-[10px]">OBJECT POSE (X,Y,Z)</span>
          <span className="text-slate-300 font-bold">[2.50, -2.50, 1.03]</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 text-[10px]">EXECUTION STATUS</span>
          <span className="text-cyan-400 font-bold">LIFTED & SECURED</span>
        </div>
      </div>
    </div>
  );
};

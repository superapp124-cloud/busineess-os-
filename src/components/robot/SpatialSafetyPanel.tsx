/**
 * CHATR 4-Zone Predictive Spatial Human Safety Panel (Gate 7 UI)
 * Live monitoring of human proximity, closing velocity, Time-To-Collision (TTC), and dominant safety state machine.
 */

import React from 'react';
import { HumanSafetyZone } from '../../../packages/robot-manipulation/src/types';

export type MasterSafetyState =
  | 'NORMAL'
  | 'CAUTION'
  | 'PERCEPTION_DEGRADED'
  | 'LOCAL_AI_UNAVAILABLE'
  | 'ACTUATOR_FAULT'
  | 'BALANCE_CRITICAL'
  | 'E_STOP'
  | 'SAFE_HOLD';

interface SpatialSafetyPanelProps {
  masterSafetyState: MasterSafetyState;
  currentSafetyZone: HumanSafetyZone;
  distanceToHumanMeters: number;
  timeToCollisionSeconds: number;
  permittedVelocityScale: number;
  isEstopActive: boolean;
}

export const SpatialSafetyPanel: React.FC<SpatialSafetyPanelProps> = ({
  masterSafetyState,
  currentSafetyZone,
  distanceToHumanMeters,
  timeToCollisionSeconds,
  permittedVelocityScale,
  isEstopActive,
}) => {
  const getSafetyBadge = (state: MasterSafetyState) => {
    switch (state) {
      case 'E_STOP':
      case 'BALANCE_CRITICAL':
      case 'ACTUATOR_FAULT':
        return 'bg-rose-600 text-white font-black animate-pulse border-rose-400';
      case 'PERCEPTION_DEGRADED':
      case 'LOCAL_AI_UNAVAILABLE':
      case 'SAFE_HOLD':
      case 'CAUTION':
        return 'bg-amber-600 text-slate-900 font-bold border-amber-400';
      case 'NORMAL':
      default:
        return 'bg-emerald-600 text-white font-bold border-emerald-400';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-200">DOMINANT SAFETY STATE & SPATIAL ENVELOPES</span>
          <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded border ${getSafetyBadge(masterSafetyState)}`}>
            STATE: {masterSafetyState}
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400">DETERMINISTIC GATING (BELOW AI LAYER)</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">HUMAN DISTANCE</span>
            <span className="text-[8px] font-mono text-cyan-400">[RGB-D]</span>
          </div>
          <span className="text-lg font-bold font-mono text-cyan-300">{distanceToHumanMeters.toFixed(2)} m</span>
          <span className="text-[9px] text-slate-500">Threshold: 0.80 m</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">TIME TO COLLISION</span>
            <span className="text-[8px] font-mono text-indigo-400">[TTC]</span>
          </div>
          <span className="text-lg font-bold font-mono text-indigo-300">
            {timeToCollisionSeconds < 100 ? `${timeToCollisionSeconds.toFixed(2)} s` : 'INF'}
          </span>
          <span className="text-[9px] text-slate-500">TTC = d / ||v_rel||</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">ARM SPEED LIMIT</span>
            <span className="text-[8px] font-mono text-amber-400">[ZONE 2/3]</span>
          </div>
          <span className="text-lg font-bold font-mono text-amber-300">
            {(permittedVelocityScale * 3.5).toFixed(2)} rad/s
          </span>
          <span className="text-[9px] text-slate-500">Cap: {(permittedVelocityScale * 100).toFixed(0)}%</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">SAFETY INTERLOCK</span>
            <span className="text-[8px] font-mono text-emerald-400">[HARDWARE]</span>
          </div>
          <span className={`text-lg font-bold font-mono ${isEstopActive ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
            {isEstopActive ? 'DE-ENERGIZED' : 'ENERGIZED'}
          </span>
          <span className="text-[9px] text-slate-500">Dual Safety Relays</span>
        </div>
      </div>
    </div>
  );
};

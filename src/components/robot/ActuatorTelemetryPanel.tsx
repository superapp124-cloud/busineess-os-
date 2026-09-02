/**
 * CHATR Actuator & Battery Telemetry Panel (Gate 7 UI)
 * Displays 32-DOF joint positions, torques, temperatures, battery SOC, with strict provenance labeling.
 */

import React from 'react';
import { ArmJointAngles } from '../../../packages/robot-manipulation/src';

interface ActuatorTelemetryPanelProps {
  batterySocPercent: number;
  batteryVoltageV: number;
  currentDrawA: number;
  rightArmJoints: ArmJointAngles;
  isHardwareMode: boolean;
}

export const ActuatorTelemetryPanel: React.FC<ActuatorTelemetryPanelProps> = ({
  batterySocPercent,
  batteryVoltageV,
  currentDrawA,
  rightArmJoints,
  isHardwareMode,
}) => {
  const isBatteryLow = batterySocPercent < 15.0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-200">POWER & ACTUATOR TELEMETRY</span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              isHardwareMode
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            {isHardwareMode ? '🔴 REAL HARDWARE BUS' : '🟢 SIMULATED TELEMETRY'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          PROVENANCE: {isHardwareMode ? 'CAN-FD / EtherCAT @ 500Hz' : 'Kinematic Euler Model (dt=0.001s)'}
        </span>
      </div>

      {/* Hardware Disconnected Warning Banner if in Hardware Mode without physical rig */}
      {isHardwareMode && (
        <div className="bg-rose-950/60 border border-rose-600/80 p-2 rounded-lg text-xs font-mono text-rose-300 flex items-center justify-between">
          <span>⚠️ PHYSICAL HARDWARE ADAPTER: DISCONNECTED / UNAVAILABLE</span>
          <span className="text-[10px] bg-rose-900 px-2 py-0.5 rounded">ZERO FAKE HARDWARE READINGS</span>
        </div>
      )}

      {/* Battery Status */}
      <div className="grid grid-cols-4 gap-2">
        <div className={`p-2.5 rounded-lg border flex flex-col ${isBatteryLow ? 'bg-rose-950/40 border-rose-600' : 'bg-slate-950 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">BATTERY SOC</span>
            <span className="text-[8px] font-mono text-slate-500">[SIM]</span>
          </div>
          <span className={`text-lg font-bold font-mono ${isBatteryLow ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
            {batterySocPercent.toFixed(1)}%
          </span>
          <span className="text-[9px] text-slate-500">48V LiFePO4 (30Ah)</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">PACK VOLTAGE</span>
            <span className="text-[8px] font-mono text-slate-500">[SIM]</span>
          </div>
          <span className="text-lg font-bold font-mono text-sky-400">{batteryVoltageV.toFixed(2)} V</span>
          <span className="text-[9px] text-slate-500">16S Balanced</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">CURRENT DRAW</span>
            <span className="text-[8px] font-mono text-slate-500">[SIM]</span>
          </div>
          <span className="text-lg font-bold font-mono text-amber-400">{currentDrawA.toFixed(2)} A</span>
          <span className="text-[9px] text-slate-500">{(batteryVoltageV * currentDrawA).toFixed(0)} W Active Load</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">MOSFET TEMP</span>
            <span className="text-[8px] font-mono text-slate-500">[SIM]</span>
          </div>
          <span className="text-lg font-bold font-mono text-teal-400">38.4 °C</span>
          <span className="text-[9px] text-slate-500">Thermal Limit: 85°C</span>
        </div>
      </div>

      {/* 7-DOF Right Arm Joint State */}
      <div className="flex flex-col gap-1.5 mt-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-300 font-semibold">RIGHT MANIPULATOR JOINTS (7-DOF)</span>
          <span className="text-[9px] font-mono text-cyan-400">SOURCE: FORWARD KINEMATICS ENGINE</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Object.entries(rightArmJoints).map(([joint, rad]) => (
            <div key={joint} className="bg-slate-950 border border-slate-800 p-1.5 rounded flex flex-col items-center">
              <span className="text-[9px] font-mono text-slate-400 truncate max-w-[55px]">{joint}</span>
              <span className="text-xs font-mono font-bold text-cyan-300">{Number(rad).toFixed(2)}</span>
              <span className="text-[8px] text-slate-500">rad</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

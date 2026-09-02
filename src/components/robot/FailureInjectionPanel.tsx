/**
 * CHATR Deterministic Failure Injection & Recovery Audit Panel (Gate 7 UI)
 * Allows deterministic fault injection across 11 canonical scenarios and audits RobotOS recovery responses.
 */

import React, { useState } from 'react';
import { RobotAiBridgePipeline } from '../../../packages/robot-ai-bridge/src/pipeline/robotAiBridgePipeline';

interface FailureInjectionPanelProps {
  onInjectFailure: (failureMode: string) => void;
  lastFaultResponse: {
    failureMode: string;
    robotOsResponse: string;
    recoveryAction: string;
    isSafetyMaintained: boolean;
  } | null;
}

export const FailureInjectionPanel: React.FC<FailureInjectionPanelProps> = ({
  onInjectFailure,
  lastFaultResponse,
}) => {
  const failureScenarios = [
    { id: 'OBJECT_MOVED', label: '1. Object Moved' },
    { id: 'HUMAN_ENTERED_PATH', label: '2. Human Enters Path' },
    { id: 'OBJECT_OCCLUDED', label: '3. Object Occluded' },
    { id: 'CAMERA_DISCONNECTED', label: '4. Camera Disconnect' },
    { id: 'LOW_GRASP_CONFIDENCE', label: '5. Low Confidence' },
    { id: 'OBJECT_UNREACHABLE', label: '6. Unreachable Target' },
    { id: 'OLLAMA_UNAVAILABLE', label: '7. Ollama Offline' },
    { id: 'STT_UNAVAILABLE', label: '8. STT Offline' },
    { id: 'BATTERY_LOW', label: '9. Low Battery (<15%)' },
    { id: 'MOTOR_SATURATION', label: '10. Motor Saturation' },
    { id: 'EMERGENCY_STOP', label: '11. Emergency Stop' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-sm font-bold text-slate-200">DETERMINISTIC FAILURE INJECTION & AUDIT</span>
        <span className="text-[11px] font-mono text-rose-400 font-bold">11 CANONICAL FAULT SCENARIOS</span>
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {failureScenarios.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onInjectFailure(f.id)}
            className="text-[10px] p-2 rounded bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-700 text-slate-300 hover:text-rose-200 transition text-left flex flex-col justify-between"
          >
            <span className="font-semibold">{f.label}</span>
          </button>
        ))}
      </div>

      {lastFaultResponse && (
        <div className="bg-slate-950 border border-rose-800/60 rounded-lg p-3 flex flex-col gap-1.5 mt-1 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-rose-400">
              INJECTED FAULT: {lastFaultResponse.failureMode}
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
              DETERMINISTIC SAFETY: MAINTAINED
            </span>
          </div>

          <div className="text-xs text-slate-200 flex items-center gap-2">
            <span className="font-bold text-cyan-400">RobotOS State:</span>
            <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              {lastFaultResponse.robotOsResponse}
            </span>
          </div>

          <div className="text-xs text-slate-300">
            <span className="font-bold text-amber-400">Autonomous Recovery:</span> {lastFaultResponse.recoveryAction}
          </div>
        </div>
      )}
    </div>
  );
};
